// =========================================================
// AMIT'S NOTES VAULT - CONSTANTS & CALENDAR ROADMAP
// Target Exam Deadline: 17 November 2026
// =========================================================

export const SUBJECT_DETAILS = {
  BDA: {
    code: "BDA",
    name: "Big Data Analytics",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.15)",
    border: "rgba(99, 102, 241, 0.35)",
  },
  ML: {
    code: "ML",
    name: "Machine Learning",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.35)",
  },
  BC: {
    code: "BC",
    name: "Blockchain",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.15)",
    border: "rgba(245, 158, 11, 0.35)",
  },
  NLP: {
    code: "NLP",
    name: "Natural Language Processing",
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.15)",
    border: "rgba(139, 92, 246, 0.35)",
  },
  MIS: {
    code: "MIS",
    name: "Management Information System",
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.15)",
    border: "rgba(6, 182, 212, 0.35)",
  },
  EXAM: {
    code: "EXAM",
    name: "Final Semester Examination",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.18)",
    border: "rgba(239, 68, 68, 0.4)",
  },
};

export const DEFAULT_SUBJECTS = ["All", "BDA", "ML", "BC", "NLP", "MIS"];

export const EXAM_DEADLINE_DATE = "2026-11-17";

export const INITIAL_TODAY_PLAN = {
  title: "Amit is preparing today: BDA – Chapter 1",
  subject: "BDA",
  subjectFull: "Big Data Analytics",
  chapter: "Chapter 1: HDFS Architecture & MapReduce lifecycle",
  notes: "Focusing on distributed storage architecture, block replication, NameNode federation, and MapReduce execution pipeline.",
  date: "2026-10-22",
  status: "In progress",
  updatedAt: new Date().toISOString(),
};

// Full 22 Oct to 17 Nov Calendar Schedule
export const INITIAL_CALENDAR_SCHEDULE = [
  // October 2026
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

  // November 2026
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

export const INITIAL_MOCK_NOTES = [
  {
    id: "bda-ch1",
    title: "BDA Notes – Chapter 1 & 2: Big Data & HDFS Architecture",
    subject: "BDA",
    chapter: "Chapter 1 & 2",
    uploadDate: "2026-10-20",
    pageCount: 28,
    fileType: "pdf",
    downloadCount: 54,
    fileSize: "2.8 MB",
    description: "Covers 5 V's of Big Data, HDFS NameNode federation, Secondary NameNode checkpointing, and MapReduce execution pipelines.",
  },
  {
    id: "ml-ch1",
    title: "Machine Learning – Core Algorithms & Mathematical Formulations",
    subject: "ML",
    chapter: "Chapter 1 - 3",
    uploadDate: "2026-10-18",
    pageCount: 34,
    fileType: "pdf",
    downloadCount: 46,
    fileSize: "3.2 MB",
    description: "Detailed derivations for Linear Regression, Logistic Cost function, Decision Tree Gini Index, Random Forest, and SVM kernels.",
  },
  {
    id: "bc-ch1",
    title: "Blockchain – Distributed Ledgers, Smart Contracts & Consensus",
    subject: "BC",
    chapter: "Chapter 1 - 4",
    uploadDate: "2026-10-16",
    pageCount: 26,
    fileType: "pdf",
    downloadCount: 39,
    fileSize: "2.4 MB",
    description: "Complete diagrams of Merkle Trees, SHA-256 blocks, Proof of Work vs Proof of Stake, and Solidity contract structures.",
  },
  {
    id: "nlp-ch1",
    title: "NLP – Text Processing, Embeddings & Transformer Architecture",
    subject: "NLP",
    chapter: "Chapter 1 - 5",
    uploadDate: "2026-10-14",
    pageCount: 30,
    fileType: "pdf",
    downloadCount: 33,
    fileSize: "2.9 MB",
    description: "Step-by-step breakdown of Tokenization, Word2Vec Skip-gram vs CBOW, RNN gradients, and Multi-Head Self-Attention in Transformers.",
  },
  {
    id: "mis-ch1",
    title: "MIS – Enterprise Systems, ERP & Strategic Decision Making",
    subject: "MIS",
    chapter: "Chapter 1 - 4",
    uploadDate: "2026-10-12",
    pageCount: 22,
    fileType: "image",
    downloadCount: 27,
    fileSize: "1.7 MB",
    description: "High-resolution charts for ERP integration, SCM value chains, CRM lifecycle, and Data Warehouse Star & Snowflake schemas.",
  },
];
