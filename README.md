# PrivacyLens – AI-Powered Privacy Policy Analyzer

PrivacyLens is a full-stack AI-powered privacy analysis platform that helps users understand complex privacy policies and identify potential privacy risks.

The system analyzes privacy policies from **URLs, uploaded documents, or raw text** and combines **rule-based detection, machine learning classification, and LLM-based reasoning** to generate privacy insights, risk assessments, dark-pattern detection, and simplified AI reports.

---

## Features

### Privacy Policy Analysis
- Website URLs
- Uploaded PDF/DOCX documents
- Raw text input

### Hybrid AI & NLP Analysis
- **Rule-Based Detection** – Negation-aware keyword and pattern matching
- **Model A** – Privacy-practice classification using OPP-115
- **Model B** – Severity classification using ToS;DR-derived data
- **Groq Llama 3.1 8B Instant** – AI reasoning, summaries, recommendations, and chatbot responses
- **Risk Engine** – Combines multiple signals to determine overall privacy risk

### Privacy Insight Categories
- Data Collection
- Data Sharing
- Cookies & Tracking
- Data Retention
- Advertising
- Location Access
- User Rights
- Security

### Dark Pattern Detection
Detects potential privacy-related concerns such as:
- Forced Consent
- Vague Data Sharing
- Missing Opt-Out Mechanisms
- Data Hoarding
- Extensive Tracking
- User Profiling
- Disclosure Gaps

### Risk Scoring
Generates an overall privacy risk assessment based on data sharing, tracking, advertising, location access, retention, user rights, security, and dark patterns.

### AI-Generated Reports
- Key findings
- Privacy concerns
- Risk explanations
- Recommendations
- Actionable insights

### Policy Comparison
Compare two privacy policies to identify:
- Risk differences
- Privacy-practice differences
- Relative safety of policies

### Analysis History
Authenticated users can store, view, and retrieve previous analyses.

### Multilingual Support
- English
- Hindi
- Marathi

### Browser Extension
The browser extension allows users to analyze privacy policies directly while browsing and automatically scan supported privacy-policy pages.

### Admin Dashboard
Provides administrative functionality for monitoring and managing the platform.

---

## Machine Learning Models

PrivacyLens uses two trained NLP models.

### Model A – Privacy Practice Classification

**Dataset:** OPP-115

**Approach:**
- TF-IDF Vectorization
- One-vs-Rest Logistic Regression
- Multi-label classification

Model A identifies which privacy practices are present in a policy segment.

### Model B – Severity Classification

**Dataset:** ToS;DR-derived data

**Approach:**
- TF-IDF Vectorization
- Logistic Regression
- Single-label classification

Model B predicts severity levels used by the system for independent severity checking.

### NLP Preprocessing
- Negation-aware preprocessing
- Custom stop-word handling
- Unigram and bigram features
- TF-IDF feature extraction

Negation handling is important because phrases such as:

> "We sell your data"

and

> "We do not sell your data"

must not be treated as equivalent.

---

## System Architecture

```text
User Input
(URL / PDF / DOCX / Raw Text)
            │
            ▼
     FastAPI Backend
            │
            ▼
 Policy Fetching & Cleaning
            │
            ▼
     NLP Preprocessing
            │
       ┌────┴────┐
       ▼         ▼
 Rule-Based     ML Models
 Detection      ├── Model A
       │        └── Model B
       └────┬────┘
            ▼
      Dark Pattern
        Detection
            │
            ▼
       Risk Engine
            │
            ▼
       Groq LLM
            │
            ▼
 AI Report / Recommendations
            │
            ▼
       MongoDB Atlas
            │
            ▼
      React Dashboard
```

---

## Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Axios
- Firebase Authentication

### Backend
- Python
- FastAPI
- MongoDB Atlas
- Firebase Admin SDK
- Groq API

### Machine Learning / NLP
- Python
- Scikit-learn
- TF-IDF
- Logistic Regression
- OPP-115
- ToS;DR

### Browser Extension
- JavaScript
- Chrome/Chromium Extension APIs

### Deployment
- Vercel – Frontend
- Render – Backend
- MongoDB Atlas – Database

---

## Authentication

PrivacyLens uses Firebase Authentication for secure user authentication.

Supported authentication includes:
- Email & Password
- Google Sign-In
- Firebase token verification

The backend verifies authenticated requests before accessing protected user-specific functionality.

---

## Project Structure

```text
privacy-risk-analyzer/
│
├── backend/
│   ├── ml/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── utils/
│   ├── app.py
│   ├── config.py
│   ├── database.py
│   ├── requirements.txt
│   └── start.bat
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .gitignore
├── ADMIN_MANUAL.md
└── PROJECT_BIBLE.md
```

> `.env` contains local configuration and secrets and should never be committed to GitHub.

---

## Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/D-moc/privacy-risk-analyzer.git
cd privacy-risk-analyzer
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8811
```

Backend runs at:

```text
http://127.0.0.1:8811
```

### 3. Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at the local Vite URL shown in the terminal.

---

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=
DATABASE_NAME=privacylens
JWT_SECRET=
GROQ_API_KEY=
FIREBASE_CREDENTIALS=
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

For the frontend, create a `.env` file containing the required Vite/Firebase configuration:

```env
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

VITE_API_URL=http://127.0.0.1:8811
```

**Never commit real API keys, passwords, database credentials, or Firebase service-account credentials.**

---

## Testing & Evaluation

PrivacyLens includes backend testing and machine-learning evaluation.

The ML models are evaluated using held-out test data with:
- Precision
- Recall
- F1-score
- Macro F1-score

For OPP-115, data is split by **policy** rather than individual segments to reduce data leakage between related policy segments.

---

## Future Scope

- Larger and more diverse privacy datasets
- Improved ML model accuracy
- Transformer-based privacy classification
- OCR support for scanned documents
- Browser-wide privacy alerts
- Privacy policy change tracking
- Organization-level privacy ratings
- Advanced privacy compliance analysis
- Further UI/UX improvements
- Improved browser extension capabilities

---

## Contributors

### Dinesh Bishokarma
**Backend Development • Deployment • Database Integration • Authentication**

### Aamir Arsiwala
**AI/ML Engineering • NLP Integration • Risk Analysis**

### Dhaarmi Gala
**Testing • Quality Assurance • Validation**

---

## License

This project is developed for **educational and research purposes**.
