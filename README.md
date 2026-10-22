# 🛡️ Amit's Notes Vault — Secure Study Notes & Leak Protection System

A complete, modern, mobile-first web application designed for **Amit Garje** to share college study notes (PDFs & Images) with classmates safely. Every downloaded document is automatically stamped with the downloader's **Full Name**, **10-Digit Mobile Number**, **Download Timestamp**, and **"Made by Amit Garje"** to prevent and trace unauthorized distribution.

---

## 🚀 Key Features

### 1. 📖 Home Page & Study Plan
- **"Today's Study Plan" Card:** Prominently displays *"Amit is preparing today: BDA – Chapter 1"*, synchronized live from Firestore (`studyPlan/today`). Editable directly from the Admin Panel.
- **Weekly Roadmap Table:** Day-wise study roadmap (Monday to Sunday) tracking subjects, chapters, and statuses (`Planned`, `In progress`, `Done`), synchronized live from Firestore (`studyPlan/weekly`).
- **Feature Highlights & Stats:** Showcases the anti-leak protection and high-yield notes.

### 2. 📚 Notes Library
- Filter by Subject pills (BDA, CNS, AI, Cloud, Full Stack, Data Science, etc.).
- Filter by file format (All Types, PDFs Only, Images Only).
- Real-time search across title, chapter, syllabus topics, and subject.
- Sorting by Newest First, Most Downloaded, Page Count, and Alphabetical.

### 3. 👤 User Registration (Watermark Identity)
- Requires student's **Full Name** and **10-Digit Indian Mobile Number** (`/^[6-9]\d{9}$/`).
- Clear anti-leak consent notice: *"Your name and phone number will be printed diagonally on downloaded notes to prevent unauthorized sharing."*
- Authenticates anonymously via Firebase Anonymous Auth and saves the profile in Firestore (`users/{uid}`).

### 4. ⚡ Direct Watermarked Download (No Access Code Needed!)
- As requested, the access code ("amu") requirement has been removed!
- Once the student enters their Name and Contact details, they can directly click **"Generate & Download Watermarked Note"**.
- The file is watermarked with:
  1. **Middle of EVERY page:** Diagonal, semi-transparent (`opacity: ~0.15`), repeated 3 times:  
     `<Student Name>  |  +91 <Mobile Number>`
  2. **Bottom of EVERY page:** Centered text:  
     `Made by Amit Garje`
  3. **Footer line:** Exact download timestamp and unique trace ID:  
     `Vault Trace #123456 • Downloaded by Rahul Sharma (+91 9876543210) on 22 Oct 2026, 04:30 PM IST`
- Automatically logs every download in Firestore (`downloads` collection) with student name, phone, note title, timestamp, and IP address.
- Also supports **Images (JPG / PNG)** with dynamic watermarking using the `sharp` library.

### 5. 👑 Amit's Admin Control Center
Accessible with passcode `amit123` (or your Firebase Admin UID):
1. **Upload Note / Image:** Upload notes (PDFs or JPG/PNG) with Title, Subject, Chapter, and Page Count. Files are saved securely to private Storage `/originals/` and **immediately become visible to all students on the website**.
2. **Manage Published Notes:** View all notes, search, check download counts, and delete notes.
3. **Study Plan Editor:** Live editor for Today's Preparation target and the 7-day Weekly Roadmap.
4. **Download Audit Logs:** Complete table of every student who downloaded notes with a one-click **"Export to CSV"** button.
5. **Leak Finder Tool:** If an unauthorized note or photo is leaked in a WhatsApp or Telegram group, paste the visible text (e.g. phone number or name) to instantly pinpoint who downloaded that copy!

### 6. 📱 100% Responsive Design
- **Phones (iPhone, Android):** Touch-friendly drawer navigation, stacked single-column cards, mobile plan cards.
- **Tablets (iPad, Galaxy Tab):** 2-column grid layout, touch-optimized spacing.
- **Laptops & Desktops:** 3-column grid, glassmorphic floating bars, interactive hover states.
- **Dark / Light Mode:** Instant theme switcher with memory.

---

## 📂 Project Architecture

```
d:\amit notes app\
├── dist/                          # Production bundle ready for Firebase Hosting
├── functions/                     # Firebase Cloud Functions (Node.js)
│   ├── index.js                   # downloadNote, searchLeaks, verifyIsAdmin
│   ├── package.json               # firebase-admin, firebase-functions, pdf-lib, sharp
│   └── .env.example
├── public/
├── src/
│   ├── components/
│   │   ├── Admin/                 # AdminPanel, UploadNoteForm, ManageNotes, EditStudyPlan, DownloadLogsTable, LeakFinder
│   │   ├── Home/                  # HeroBanner, TodayStudyPlan, WeeklyPlanTable
│   │   ├── Modals/                # RegistrationModal, DownloadModal
│   │   ├── Notes/                 # NotesLibrary, NoteCard
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   └── Toast.jsx
│   ├── config/
│   │   ├── constants.js           # Default subjects, initial study plans & mock notes
│   │   └── firebase.js            # Modular Firebase v10/v13 client initializer
│   ├── context/
│   │   ├── AuthContext.jsx        # Anonymous Auth, user profile & admin state
│   │   └── ThemeContext.jsx       # Dark / Light theme toggle
│   ├── utils/
│   │   └── watermarkClient.js     # pdf-lib watermarking and download dispatcher
│   ├── App.jsx
│   ├── index.css                  # Modern glassmorphism & responsive design system
│   └── main.jsx
├── firebase.json                  # Firebase Hosting, Functions, Firestore, Storage configuration
├── firestore.rules                # Strict access control rules
├── storage.rules                  # Denies direct client read on /originals/
├── .env.example
└── README.md
```

---

## 🔒 Security & Privacy Architecture

- **Firebase Storage (`storage.rules`):**
  - All original note files are placed in `/originals/`. Direct client reads are **DENIED**. No student can ever download the raw, un-watermarked original file.
  - Only Cloud Functions (or Admin) can read from `/originals/`.
- **Firestore Security (`firestore.rules`):**
  - `users/{uid}`: Students can only read and create their own profile.
  - `studyPlan`: Read-only for all visitors; writable only by Admin.
  - `downloads`: Readable only by Admin; written exclusively by backend Cloud Functions.
  - `notes`: Readable by all visitors; writable/deletable only by Admin.

---

## 🛠️ Step-by-Step Firebase Setup & Deployment

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it (e.g. `amits-notes-vault`).
3. Under **Authentication** -> **Sign-in method**:
   - Enable **Anonymous** auth.
   - (Optional) Enable **Email/Password** for Admin sign-in.
4. Under **Firestore Database**:
   - Click **Create database** in Production mode.
5. Under **Storage**:
   - Click **Get started** and create a default Cloud Storage bucket.
   - Inside your bucket, create a folder named `originals`.

### Step 2: Configure Environment Variables
1. In Firebase Console, go to **Project Settings** -> **General** -> **Your apps** -> Click the **Web** icon (`</>`).
2. Copy your Firebase configuration keys into `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_UID=your_firebase_admin_uid_here
```

### Step 3: Set Your Admin UID
To give your account full administrative authority:
1. In Firestore, create a collection named `config` and a document named `admin`:
   ```json
   {
     "adminUid": "YOUR_FIREBASE_AUTH_UID"
   }
   ```
2. Or set `ADMIN_UID=YOUR_FIREBASE_AUTH_UID` in `functions/.env`.
3. In the web app, you can also log in immediately using the Admin passcode: `amit123`.

### Step 4: Build and Deploy to Firebase
Run the following commands in the root directory `d:\amit notes app`:

```powershell
# 1. Build the frontend for production
npm run build

# 2. Log in to Firebase CLI
firebase login

# 3. Select your Firebase project
firebase use --add

# 4. Deploy everything (Hosting, Functions, Firestore rules, and Storage rules)
firebase deploy
```

If you wish to deploy components individually:
```powershell
# Deploy only the frontend website
firebase deploy --only hosting

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Firestore Security Rules & Indexes
firebase deploy --only firestore

# Deploy Storage Rules
firebase deploy --only storage
```

---

## 💻 Running Locally

To run the application locally in development mode:

```powershell
npm run dev
```

Open **`http://localhost:5173/`** in your browser. The app runs immediately with built-in instant watermarking and sample notes, even before you connect your live Firebase credentials!
