const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { PDFDocument, rgb, degrees, StandardFonts } = require("pdf-lib");
const sharp = require("sharp");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

// Helper: Escape XML/SVG special characters
function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

// Helper: Check if user is Admin
async function verifyIsAdmin(contextAuth) {
  if (!contextAuth || !contextAuth.uid) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  // Check 1: Custom claims
  if (contextAuth.token && contextAuth.token.admin === true) {
    return true;
  }

  // Check 2: Environment variable ADMIN_UID
  const envAdminUid = process.env.ADMIN_UID;
  if (envAdminUid && contextAuth.uid === envAdminUid) {
    return true;
  }

  // Check 3: Firestore config/admin doc
  try {
    const adminDoc = await db.collection("config").doc("admin").get();
    if (adminDoc.exists) {
      const data = adminDoc.data();
      if (data.adminUid === contextAuth.uid || (Array.isArray(data.adminUids) && data.adminUids.includes(contextAuth.uid))) {
        return true;
      }
    }
  } catch (err) {
    logger.warn("Could not check config/admin doc:", err);
  }

  throw new HttpsError("permission-denied", "Access restricted to vault admin.");
}

/**
 * Cloud Function: downloadNote
 * Callable function that verifies user profile (Name & Phone), loads original PDF/image
 * from private /originals/ Storage bucket, stamps dynamic watermarks, logs download,
 * and returns the watermarked file for client download.
 */
exports.downloadNote = onCall(
  {
    cors: true,
    maxInstances: 10,
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    // 1. Verify User is Authenticated
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError(
        "unauthenticated",
        "You must be registered to download notes."
      );
    }

    const uid = request.auth.uid;
    const { noteId } = request.data || {};

    if (!noteId) {
      throw new HttpsError("invalid-argument", "Note ID is required.");
    }

    // 2. Fetch User Profile (Name & Mobile Number)
    const userDocRef = db.collection("users").doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      throw new HttpsError(
        "failed-precondition",
        "Please register your name and phone number before downloading notes."
      );
    }

    const userData = userDoc.data();
    const userName = (userData.name || "Anonymous Student").trim();
    const userPhone = (userData.phone || "").trim();

    if (!userPhone || !/^[6-9]\d{9}$/.test(userPhone)) {
      throw new HttpsError(
        "failed-precondition",
        "Valid 10-digit mobile number is required in your profile."
      );
    }

    // 3. Fetch Note Metadata
    const noteDocRef = db.collection("notes").doc(noteId);
    const noteDoc = await noteDocRef.get();

    if (!noteDoc.exists) {
      throw new HttpsError("not-found", "The requested note was not found in the vault.");
    }

    const noteData = noteDoc.data();
    const noteTitle = noteData.title || "Study_Notes";
    const fileType = (noteData.fileType || "pdf").toLowerCase();
    const storagePath = noteData.storagePath || `originals/${noteData.storageFileName || `${noteId}.${fileType}`}`;

    // 4. Download Original File from Private Firebase Storage
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);

    const [exists] = await file.exists();
    if (!exists) {
      logger.error(`Original file missing at path: ${storagePath}`);
      throw new HttpsError("not-found", "Original note file is currently unavailable in the vault.");
    }

    const [fileBuffer] = await file.download();

    // Timestamp for watermark
    const downloadDate = new Date();
    const formattedTimestamp = downloadDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    let watermarkedBuffer;
    let mimeType = "application/pdf";
    let outputExt = "pdf";

    // 5. Apply Watermark with Name and Contact Details
    if (fileType === "pdf" || storagePath.endsWith(".pdf")) {
      // PDF WATERMARKING VIA PDF-LIB
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pages = pdfDoc.getPages();
      const watermarkText = `${userName}  |  +91 ${userPhone}`;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // (a) Bottom of EVERY page: "Made by Amit Garje"
        const bottomText = "Made by Amit Garje";
        const bottomFontSize = 9.5;
        const bottomWidth = helvetica.widthOfTextAtSize(bottomText, bottomFontSize);

        page.drawText(bottomText, {
          x: (width - bottomWidth) / 2,
          y: 22,
          size: bottomFontSize,
          font: helvetica,
          color: rgb(0.4, 0.4, 0.4),
          opacity: 0.85,
        });

        // (c) Small footer line with the download timestamp
        const traceFooter = `Vault Trace #${noteId.slice(0, 6)} • Downloaded by ${userName} (+91 ${userPhone}) on ${formattedTimestamp} IST • Page ${i + 1} of ${pages.length}`;
        const traceFontSize = 7.5;
        page.drawText(traceFooter, {
          x: 24,
          y: 9,
          size: traceFontSize,
          font: helvetica,
          color: rgb(0.55, 0.55, 0.55),
          opacity: 0.7,
        });

        // (b) Middle of EVERY page, diagonal, repeated 3 times
        const diagonalFontSize = Math.max(18, Math.min(width, height) * 0.042);
        const diagonalTextWidth = helveticaBold.widthOfTextAtSize(watermarkText, diagonalFontSize);

        const positions = [
          { x: width * 0.15, y: height * 0.3 },
          { x: (width - diagonalTextWidth) / 2, y: height * 0.5 },
          { x: width * 0.25, y: height * 0.7 },
        ];

        for (const pos of positions) {
          page.drawText(watermarkText, {
            x: pos.x,
            y: pos.y,
            size: diagonalFontSize,
            font: helveticaBold,
            color: rgb(0.15, 0.15, 0.15),
            opacity: 0.14,
            rotate: degrees(32),
          });
        }
      }

      watermarkedBuffer = Buffer.from(await pdfDoc.save());
      mimeType = "application/pdf";
      outputExt = "pdf";
    } else {
      // IMAGE WATERMARKING (JPG / PNG) VIA SHARP
      const image = sharp(fileBuffer);
      const metadata = await image.metadata();
      const imgWidth = metadata.width || 1200;
      const imgHeight = metadata.height || 1600;

      const safeName = escapeXml(userName);
      const safePhone = escapeXml(userPhone);
      const watermarkText = `${safeName} | +91 ${safePhone}`;

      const svgOverlay = `
        <svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
          <style>
            .diagonal {
              font-family: sans-serif;
              font-size: ${Math.round(imgWidth * 0.045)}px;
              font-weight: 800;
              fill: rgba(30, 30, 30, 0.15);
              text-anchor: middle;
            }
            .bottom-maker {
              font-family: sans-serif;
              font-size: ${Math.max(14, Math.round(imgWidth * 0.018))}px;
              font-weight: 600;
              fill: rgba(80, 80, 80, 0.85);
              text-anchor: middle;
            }
            .footer-trace {
              font-family: sans-serif;
              font-size: ${Math.max(11, Math.round(imgWidth * 0.013))}px;
              fill: rgba(100, 100, 100, 0.75);
              text-anchor: start;
            }
          </style>

          <g transform="rotate(-30, ${imgWidth * 0.5}, ${imgHeight * 0.3})">
            <text x="${imgWidth * 0.5}" y="${imgHeight * 0.3}" class="diagonal">${watermarkText}</text>
          </g>
          <g transform="rotate(-30, ${imgWidth * 0.5}, ${imgHeight * 0.5})">
            <text x="${imgWidth * 0.5}" y="${imgHeight * 0.5}" class="diagonal">${watermarkText}</text>
          </g>
          <g transform="rotate(-30, ${imgWidth * 0.5}, ${imgHeight * 0.7})">
            <text x="${imgWidth * 0.5}" y="${imgHeight * 0.7}" class="diagonal">${watermarkText}</text>
          </g>

          <text x="${imgWidth * 0.5}" y="${imgHeight - 35}" class="bottom-maker">Made by Amit Garje</text>
          <text x="30" y="${imgHeight - 12}" class="footer-trace">
            Vault Trace • Downloaded by ${safeName} (+91 ${safePhone}) on ${formattedTimestamp} IST
          </text>
        </svg>
      `;

      watermarkedBuffer = await image
        .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
        .jpeg({ quality: 92 })
        .toBuffer();

      mimeType = "image/jpeg";
      outputExt = "jpg";
    }

    // 6. Log Download Record in Firestore
    const clientIp =
      request.rawRequest?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
      request.rawRequest?.ip ||
      "Unknown";

    const downloadRecord = {
      uid,
      name: userName,
      phone: userPhone,
      noteId,
      noteTitle,
      subject: noteData.subject || "General",
      chapter: noteData.chapter || "",
      fileType: outputExt,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      formattedTimestamp,
      ip: clientIp,
      userAgent: request.rawRequest?.headers?.["user-agent"] || "Unknown",
    };

    await db.collection("downloads").add(downloadRecord);

    // Increment download count
    await noteDocRef.update({
      downloadCount: admin.firestore.FieldValue.increment(1),
    });

    // 7. Return Base64 Watermarked Document
    const sanitizedTitle = (noteTitle || "Note").replace(/[^a-zA-Z0-9_-]/g, "_");
    const downloadFileName = `${sanitizedTitle}.${outputExt}`;

    return {
      success: true,
      fileName: downloadFileName,
      mimeType,
      base64: watermarkedBuffer.toString("base64"),
    };
  }
);

/**
 * Cloud Function: searchLeaks (Admin Only)
 */
exports.searchLeaks = onCall(
  {
    cors: true,
  },
  async (request) => {
    await verifyIsAdmin(request.auth);

    const { query } = request.data || {};
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      throw new HttpsError(
        "invalid-argument",
        "Search query must be at least 2 characters long."
      );
    }

    const cleanQuery = query.trim().toLowerCase();

    const snapshot = await db
      .collection("downloads")
      .orderBy("timestamp", "desc")
      .limit(300)
      .get();

    const matches = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const name = (data.name || "").toLowerCase();
      const phone = (data.phone || "").toLowerCase();
      const noteTitle = (data.noteTitle || "").toLowerCase();
      const ip = (data.ip || "").toLowerCase();

      if (
        name.includes(cleanQuery) ||
        phone.includes(cleanQuery) ||
        noteTitle.includes(cleanQuery) ||
        ip.includes(cleanQuery)
      ) {
        matches.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null,
        });
      }
    });

    return { matches, count: matches.length };
  }
);

/**
 * Cloud Function: seedInitialConfig
 * Automatically seeds the 22 Oct to 17 Nov Exam preparation calendar in Firestore.
 */
exports.seedInitialConfig = onCall(
  {
    cors: true,
  },
  async (request) => {
    // 1. Check today's plan
    const todayDoc = await db.collection("studyPlan").doc("today").get();
    if (!todayDoc.exists) {
      await db.collection("studyPlan").doc("today").set({
        title: "Amit is preparing today: BDA – Chapter 1",
        subject: "BDA",
        subjectFull: "Big Data Analytics",
        chapter: "Chapter 1: HDFS Architecture & MapReduce lifecycle",
        notes: "Focusing on distributed storage architecture, block replication, and MapReduce execution pipeline.",
        date: "2026-10-22",
        status: "In progress",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // 2. Check calendar schedule
    const calDoc = await db.collection("studyPlan").doc("calendar").get();
    if (!calDoc.exists) {
      const initialSchedule = [
        { date: "2026-10-22", day: "Thursday", subject: "BDA", topic: "Chapter 1: Big Data Fundamentals & HDFS", status: "In progress" },
        { date: "2026-10-23", day: "Friday", subject: "BDA", topic: "Chapter 2: Hadoop MapReduce & YARN", status: "Planned" },
        { date: "2026-10-24", day: "Saturday", subject: "ML", topic: "Chapter 1: Linear & Logistic Regression", status: "Planned" },
        { date: "2026-10-25", day: "Sunday", subject: "ML", topic: "Chapter 2: Decision Trees, RF & SVMs", status: "Planned" },
        { date: "2026-10-26", day: "Monday", subject: "BDA", topic: "Chapter 3: Apache Spark & RDD Transformations", status: "Planned" },
        { date: "2026-10-27", day: "Tuesday", subject: "BDA", topic: "Chapter 4: NoSQL Databases (MongoDB & Cassandra)", status: "Planned" },
        { date: "2026-10-28", day: "Wednesday", subject: "BC", topic: "Chapter 1: Blockchain & Distributed Ledgers", status: "Planned" },
        { date: "2026-10-29", day: "Thursday", subject: "BC", topic: "Chapter 2: Consensus (PoW, PoS, PBFT)", status: "Planned" },
        { date: "2026-10-30", day: "Friday", subject: "BC", topic: "Chapter 3: Smart Contracts & Ethereum Basics", status: "Planned" },
        { date: "2026-10-31", day: "Saturday", subject: "BC", topic: "Chapter 4: Hyperledger Fabric Architecture", status: "Planned" },
        { date: "2026-11-01", day: "Sunday", subject: "BC", topic: "Chapter 5: Crypto Tokens & Security Audits", status: "Planned" },
        { date: "2026-11-02", day: "Monday", subject: "BC", topic: "Blockchain Solved University Papers", status: "Planned" },
        { date: "2026-11-03", day: "Tuesday", subject: "NLP", topic: "Chapter 1: Tokenization, Stemming & Lemmatization", status: "Planned" },
        { date: "2026-11-04", day: "Wednesday", subject: "NLP", topic: "Chapter 2: N-gram Models, POS Tagging & HMM", status: "Planned" },
        { date: "2026-11-05", day: "Thursday", subject: "NLP", topic: "Chapter 3: Word Embeddings (Word2Vec, GloVe)", status: "Planned" },
        { date: "2026-11-06", day: "Friday", subject: "NLP", topic: "Chapter 4: Sequence Modeling, RNNs & LSTMs", status: "Planned" },
        { date: "2026-11-07", day: "Saturday", subject: "NLP", topic: "Chapter 5: Transformers, Self-Attention & BERT", status: "Planned" },
        { date: "2026-11-08", day: "Sunday", subject: "NLP", topic: "NLP Solved Problems & Chatbot Case Studies", status: "Planned" },
        { date: "2026-11-09", day: "Monday", subject: "MIS", topic: "Chapter 1: Enterprise Role of Information Systems", status: "Planned" },
        { date: "2026-11-10", day: "Tuesday", subject: "MIS", topic: "Chapter 2: ERP, SCM & CRM Modules", status: "Planned" },
        { date: "2026-11-11", day: "Wednesday", subject: "MIS", topic: "Chapter 3: DSS, Data Warehouses & Business Intelligence", status: "Planned" },
        { date: "2026-11-12", day: "Thursday", subject: "MIS", topic: "Chapter 4: IT Governance & Information Security", status: "Planned" },
        { date: "2026-11-13", day: "Friday", subject: "ML", topic: "Chapter 3: Unsupervised Learning & K-Means Clustering", status: "Planned" },
        { date: "2026-11-14", day: "Saturday", subject: "ML", topic: "Chapter 4: Neural Networks & Deep Learning Intro", status: "Planned" },
        { date: "2026-11-15", day: "Sunday", subject: "ML", topic: "Model Evaluation, ROC-AUC & Hyperparameters", status: "Planned" },
        { date: "2026-11-16", day: "Monday", subject: "ML", topic: "Final Comprehensive Revision of All Formulas", status: "Planned" },
        { date: "2026-11-17", day: "Tuesday", subject: "EXAM", topic: "🎯 SEMESTER FINAL EXAM - 17 NOV DEADLINE", status: "Planned" },
      ];

      await db.collection("studyPlan").doc("calendar").set({
        schedule: initialSchedule,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return { success: true, message: "Study calendar initialized." };
  }
);
