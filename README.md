<div align="center">

<h1>🎓 AI-Driven Dynamic Curriculum Recommendation Engine</h1>

<p>
  <img src="https://img.shields.io/badge/Domain-Generative%20AI%20%26%20AI%20Agents-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Type-Academic%20Mini%20Project-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Target-Version%201%20(MVP)-green?style=for-the-badge" />
</p>

<p>
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python" />
  <img src="https://img.shields.io/badge/Gemini%20API-Integrated-4285F4?style=flat-square&logo=google" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker" />
</p>

<br/>

> **An intelligent, AI-powered learning platform that generates personalized, skill-gap-driven, career-oriented curricula for individual students using Generative AI.**

</div>

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Project Vision & Version Roadmap](#4-project-vision--version-roadmap)
5. [Version 1 Scope (MVP)](#5-version-1-scope-mvp)
6. [Complete User Workflow](#6-complete-user-workflow)
7. [High-Level System Architecture](#7-high-level-system-architecture)
8. [AI Engine Workflow](#8-ai-engine-workflow)
9. [Technology Stack](#9-technology-stack)
10. [Database Design](#10-database-design)
11. [API Structure](#11-api-structure)
12. [Project Directory Structure](#12-project-directory-structure)
13. [Development Phases](#13-development-phases)
14. [AI Prompt Engineering](#14-ai-prompt-engineering)
15. [Testing Strategy](#15-testing-strategy)
16. [Personalization Test Cases](#16-personalization-test-cases)
17. [Security Guidelines](#17-security-guidelines)
18. [Future Versions (V2 – V5)](#18-future-versions-v2--v5)
19. [Future Scope](#19-future-scope)
20. [Version 1 Final Deliverables](#20-version-1-final-deliverables)
21. [Getting Started](#21-getting-started)
22. [Team](#22-team)
23. [Conclusion](#23-conclusion)

---

## 1. Project Overview

The **AI-Driven Dynamic Curriculum Recommendation Engine** is an intelligent web-based learning platform that generates **personalized learning paths** for students based on their:

- Current skill levels
- Career goals
- Assessment performance
- Learning progress

Traditional platforms provide the **same course sequence** to every learner. This project solves that by using **Generative AI** to analyze each student's unique profile, detect skill gaps, and dynamically generate a tailored curriculum.

The long-term vision is to evolve this into a **full AI-powered adaptive learning ecosystem** with AI tutoring, RAG (Retrieval-Augmented Generation), career coaching, and multi-agent AI collaboration.

---

## 2. Problem Statement

Students often struggle to answer these critical questions about their own learning journey:

| Challenge | Description |
|-----------|-------------|
| 🔍 **Self-Assessment** | What do I already know? Where am I strong or weak? |
| 🗺️ **Path Discovery** | What should I learn next and in what order? |
| 🎯 **Career Alignment** | Which skills do I need for my specific career goal? |
| 📚 **Resource Selection** | Which learning resources match my current level? |
| 🔄 **Dynamic Adaptation** | How should my path change as my skills improve? |

> Most conventional learning systems follow **predefined course structures** and do not dynamically generate a curriculum for each individual learner.

There is a need for an intelligent system that can analyze student-specific information and generate a **personalized, skill-gap-driven, career-oriented learning roadmap**.

---

## 3. Proposed Solution

The system collects student data, analyzes it using Generative AI, and produces a fully personalized curriculum.

```mermaid
flowchart LR
    subgraph INPUT["📥 Student Input"]
        A1[Student Profile]
        A2[Career Goal]
        A3[Existing Skills & Levels]
        A4[Assessment Scores]
        A5[Learning Preferences]
    end

    subgraph ENGINE["🤖 AI Processing"]
        B1[Skill Gap Analysis]
        B2[Priority Determination]
        B3[Generative AI Engine]
    end

    subgraph OUTPUT["📤 Personalized Output"]
        C1[Missing Skills]
        C2[Learning Priorities]
        C3[Recommended Topics]
        C4[Weekly Curriculum]
        C5[Learning Resources]
        C6[Progress Tracker]
    end

    INPUT --> ENGINE
    ENGINE --> OUTPUT
```

---

## 4. Project Vision & Version Roadmap

The project is developed **incrementally** through well-defined versions, each adding intelligence and capability.

```mermaid
flowchart TD
    V1["🟢 Version 1 — MVP\nBasic Personalized Curriculum\nAuthentication · Profile · Assessment\nSkill Gap · AI Curriculum · Roadmap"]
    V2["🔵 Version 2 — Adaptive Learning\nAI Quizzes · Difficulty Adjustment\nWeekly AI Reports · Dynamic Updates"]
    V3["🟣 Version 3 — AI Tutor + RAG\nChat Tutor · PDF Upload · Flashcards\nVector DB · Question Answering"]
    V4["🟠 Version 4 — AI Career Coach\nResume Analysis · Interview Prep\nCoding Challenges · Career Paths"]
    V5["🔴 Version 5 — Multi-Agent Platform\nOrchestrator · Voice Assistant\nAnalytics · Placement Readiness"]

    V1 --> V2 --> V3 --> V4 --> V5
```

### Version Summary Table

| Version | Main Features | Goal |
|---------|--------------|------|
| **V1** ✅ | Profile, Career Goal, Assessment, Skill Gap, AI Curriculum, Roadmap, Progress Tracking | Working personalized curriculum engine (MVP) |
| **V2** | Adaptive curriculum, AI quizzes, weekly reports, difficulty adjustment, notifications | Make curriculum dynamic and self-improving |
| **V3** | AI Tutor, RAG, PDF analysis, notes summarization, flashcards, vector DB | Conversational AI learning assistant |
| **V4** | Resume analysis, interview preparation, coding challenges, AI career coach | Career readiness and placement preparation |
| **V5** | Multi-agent architecture, voice assistant, learning analytics, placement readiness | Full AI learning ecosystem |

---

## 5. Version 1 Scope (MVP)

### 5.1 User Authentication

| Feature | Description |
|---------|-------------|
| Register | New student account creation |
| Login | JWT-based secure login |
| Logout | Session termination |
| Protected Routes | Authenticated-only student area |

### 5.2 Student Profile

Students provide:
- Full name and education information
- Existing skills and self-rated skill levels
- Learning preferences (e.g., video, text, projects)

### 5.3 Career Goal Selection

Initial supported career paths:

| Career Goal | Target Skill Domain |
|-------------|-------------------|
| 🤖 AI Engineer | ML, DL, NLP, LLMs, Python |
| 📊 Data Scientist | Python, Statistics, ML, Visualization |
| 📈 Data Analyst | SQL, Excel, Tableau, Python |
| 💻 Full Stack Developer | HTML, CSS, JS, React, Node.js |
| ☁️ Cloud Engineer | AWS/GCP/Azure, DevOps, Networking |

### 5.4 Skill Assessment

Students take an AI-designed assessment that evaluates their current skills:

```
Python           → 80%
SQL              → 60%
Machine Learning → 40%
Deep Learning    → 20%
```

### 5.5 Skill Gap Analysis

```mermaid
flowchart LR
    A[Student Existing Skills] --> D{Skill Gap\nAnalyzer}
    B[Assessment Results] --> D
    C[Career Goal Requirements] --> D
    D --> E[Strong Skills]
    D --> F[Weak Skills]
    D --> G[Missing Skills]
    E & F & G --> H[Learning Priorities]
```

### 5.6 AI Curriculum Generation

Example output for AI Engineer goal:

| Week | Topic |
|------|-------|
| Week 1 | Python for AI |
| Week 2 | NumPy and Pandas |
| Week 3 | Machine Learning Fundamentals |
| Week 4 | Deep Learning |
| Week 5 | Natural Language Processing |
| Week 6 | Large Language Models (LLMs) |

### 5.7 Learning Roadmap

The generated curriculum is presented as a **visual interactive roadmap**, showing topics with dependencies and estimated completion times.

### 5.8 Resource Recommendation

Curated learning resources linked to each curriculum topic:
- Video tutorials
- Documentation links
- Practice exercises
- Project ideas

### 5.9 Progress Tracking

Students can mark topic status:

| Status | Meaning |
|--------|---------|
| ⬜ Not Started | Topic not yet begun |
| 🔵 In Progress | Currently studying this topic |
| ✅ Completed | Topic mastered |

---

## 6. Complete User Workflow

```mermaid
flowchart TD
    START([Student]) --> REG

    REG["Registration\nCreate account with\nname · email · password"]
    LOGIN["Login\nJWT Authentication"]
    PROFILE["Student Profile\nEducation · Skills\nSkill Levels · Preferences"]
    CAREER["Career Goal Selection\nAI Engineer · Data Scientist\nFull Stack · Cloud Engineer"]
    ASSESS["Skill Assessment\nTake AI-generated\nmulti-topic quiz"]
    RESULTS["Assessment Results\nPer-topic scores\nstrengths & weaknesses"]
    GAP["Skill Gap Analysis\nCompare skills vs\ncareer requirements"]
    AI["Generative AI Engine\nGemini / OpenAI LLM\nanalyzes full student profile"]
    CURRICULUM["Personalized Curriculum\nWeekly topics · sequences\nlearning priorities"]
    ROADMAP["Learning Roadmap\nVisual step-by-step\nlearning path"]
    RESOURCES["Learning Resources\nCurated videos · docs\nexercises · projects"]
    PROGRESS["Progress Tracking\nMark topics:\nNot Started to In Progress to Completed"]
    DONE([Skill Achieved])

    REG --> LOGIN
    LOGIN --> PROFILE
    PROFILE --> CAREER
    CAREER --> ASSESS
    ASSESS --> RESULTS
    RESULTS --> GAP
    GAP --> AI
    AI --> CURRICULUM
    CURRICULUM --> ROADMAP
    ROADMAP --> RESOURCES
    RESOURCES --> PROGRESS
    PROGRESS --> DONE

    PROGRESS -->|Skills Updated\nRe-assess| ASSESS
```

---

## 7. High-Level System Architecture

```mermaid
flowchart TD
    subgraph CLIENT["Client Layer"]
        STUDENT[Student Browser]
        REACT["React + TypeScript\nTailwind CSS · React Router"]
    end

    subgraph API["API Layer"]
        FASTAPI["FastAPI Backend\nPython"]
        AUTH["Auth Service\nJWT · Password Hashing"]
        PROFILE_SVC["Profile Service"]
        ASSESS_SVC["Assessment Service"]
        RECOMMEND_SVC["Recommendation Service"]
        PROGRESS_SVC["Progress Service"]
    end

    subgraph AI_LAYER["AI Layer"]
        AI_ENGINE["AI Engine\nPython"]
        LLM["Gemini API /\nOpenAI API"]
        SKILL_GAP["Skill Gap\nAnalyzer"]
        CURRICULUM_GEN["Curriculum\nGenerator"]
    end

    subgraph DATA["Data Layer"]
        PG[("PostgreSQL\nDatabase")]
    end

    STUDENT --> REACT
    REACT --> FASTAPI
    FASTAPI --> AUTH & PROFILE_SVC & ASSESS_SVC & RECOMMEND_SVC & PROGRESS_SVC
    AUTH --> PG
    PROFILE_SVC --> PG
    ASSESS_SVC --> PG
    PROGRESS_SVC --> PG
    RECOMMEND_SVC --> AI_ENGINE
    AI_ENGINE --> LLM & SKILL_GAP & CURRICULUM_GEN
    CURRICULUM_GEN --> REACT
```

---

## 8. AI Engine Workflow

```mermaid
flowchart LR
    subgraph INPUTS["Student Data"]
        A[Student Profile]
        B[Career Goal]
        C[Assessment Scores]
        D[Skill Levels]
    end

    subgraph ANALYSIS["AI Analysis Layer"]
        E["LLM Processing\nGemini / OpenAI"]
    end

    subgraph CLASSIFICATION["Skill Classification"]
        F["Strong Skills"]
        G["Weak Skills"]
        H["Missing Skills"]
    end

    subgraph GENERATION["Curriculum Generation"]
        I[Learning Priorities]
        J[Learning Sequence]
        K[Weekly Curriculum]
        L[Resource Mapping]
    end

    subgraph OUTPUT["Output"]
        M[Personalized Roadmap]
        N[Recommended Resources]
    end

    A & B & C & D --> E
    E --> F & G & H
    F & G & H --> I
    I --> J --> K --> L
    K --> M
    L --> N
```

---

## 9. Technology Stack

### 9.1 Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18+ | Component-based UI framework |
| **TypeScript** | 5+ | Type-safe frontend development |
| **Tailwind CSS** | 3+ | Utility-first UI styling |
| **React Router** | 6+ | Client-side navigation |
| **Axios** | Latest | HTTP client for API calls |

### 9.2 Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.11+ | Backend language and AI integration |
| **FastAPI** | 0.100+ | High-performance REST API framework |
| **Pydantic** | 2+ | Data validation and serialization |
| **SQLAlchemy** | 2+ | ORM for database operations |
| **Alembic** | Latest | Database migrations |
| **python-jose** | Latest | JWT authentication |
| **passlib** | Latest | Password hashing (bcrypt) |

### 9.3 Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| **PostgreSQL** | 15+ | Primary relational database |

### 9.4 AI & LLM

| Technology | Purpose |
|-----------|---------|
| **Gemini API** | Primary LLM for curriculum generation |
| **OpenAI API** | Alternative LLM provider |
| **Prompt Engineering** | Structured AI output design |

### 9.5 Future AI Technologies (V2–V5)

| Technology | Planned Version | Purpose |
|-----------|----------------|---------|
| **LangChain** | V3 | LLM application framework |
| **LangGraph** | V5 | Multi-agent workflows |
| **RAG** | V3 | Knowledge-grounded AI responses |
| **ChromaDB / FAISS** | V3 | Vector database for semantic search |
| **AI Agents** | V5 | Autonomous learning workflows |

### 9.6 DevOps & Deployment

| Technology | Purpose |
|-----------|---------|
| **Git** | Version control |
| **GitHub** | Collaboration, code review, project management |
| **Docker** | Containerization |
| **Docker Compose** | Multi-service local development |
| **GitHub Actions** | CI/CD pipeline |
| **Vercel** | Frontend deployment |
| **Render / Railway** | Backend deployment |

---

## 10. Database Design

### 10.1 Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        string email UK
        string hashed_password
        datetime created_at
        bool is_active
    }

    STUDENTS {
        int id PK
        int user_id FK
        string full_name
        string education
        string learning_preference
        datetime created_at
    }

    SKILLS {
        int id PK
        string name UK
        string category
        string description
    }

    STUDENT_SKILLS {
        int id PK
        int student_id FK
        int skill_id FK
        string self_rated_level
        int proficiency_score
    }

    CAREER_GOALS {
        int id PK
        string title UK
        string description
        json required_skills
    }

    ASSESSMENTS {
        int id PK
        int career_goal_id FK
        string title
        datetime created_at
    }

    ASSESSMENT_QUESTIONS {
        int id PK
        int assessment_id FK
        int skill_id FK
        string question_text
        json options
        string correct_answer
        string difficulty
    }

    ASSESSMENT_RESULTS {
        int id PK
        int student_id FK
        int assessment_id FK
        json scores_per_skill
        float overall_score
        datetime taken_at
    }

    CURRICULUM {
        int id PK
        int student_id FK
        int career_goal_id FK
        json skill_gaps
        json strong_skills
        json learning_priorities
        datetime generated_at
        bool is_active
    }

    CURRICULUM_WEEKS {
        int id PK
        int curriculum_id FK
        int week_number
        string topic
        json resources
        string status
    }

    PROGRESS {
        int id PK
        int student_id FK
        int curriculum_week_id FK
        string status
        datetime updated_at
    }

    USERS ||--|| STUDENTS : "has profile"
    STUDENTS ||--o{ STUDENT_SKILLS : "has"
    SKILLS ||--o{ STUDENT_SKILLS : "referenced by"
    CAREER_GOALS ||--o{ STUDENTS : "selected by"
    CAREER_GOALS ||--o{ ASSESSMENTS : "has"
    ASSESSMENTS ||--o{ ASSESSMENT_QUESTIONS : "contains"
    STUDENTS ||--o{ ASSESSMENT_RESULTS : "receives"
    STUDENTS ||--o{ CURRICULUM : "receives"
    CURRICULUM ||--o{ CURRICULUM_WEEKS : "has"
    CURRICULUM_WEEKS ||--o{ PROGRESS : "tracked by"
```

### 10.2 Core Entities Summary

| Entity | Description |
|--------|-------------|
| `users` | Authentication credentials |
| `students` | Student profile and personal details |
| `skills` | Master skill catalog |
| `student_skills` | Student self-assessed skill levels |
| `career_goals` | Available career paths and required skills |
| `assessments` | Per-career-goal quiz containers |
| `assessment_questions` | Individual quiz questions per skill |
| `assessment_results` | Student quiz scores per skill |
| `curriculum` | AI-generated personalized curriculum metadata |
| `curriculum_weeks` | Weekly topics within a curriculum |
| `progress` | Per-topic completion tracking |

---

## 11. API Structure

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register a new student account |
| `POST` | `/api/v1/auth/login` | Login and receive JWT token |
| `POST` | `/api/v1/auth/logout` | Invalidate session |
| `GET` | `/api/v1/auth/me` | Get current logged-in user |

### Student Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/students/profile` | Get student profile |
| `POST` | `/api/v1/students/profile` | Create student profile |
| `PUT` | `/api/v1/students/profile` | Update student profile |
| `POST` | `/api/v1/students/skills` | Add/update student skills |

### Career Goal Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/careers` | List all available career goals |
| `POST` | `/api/v1/students/career` | Set student career goal |

### Assessment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/assessments/{career_id}` | Get assessment for career |
| `POST` | `/api/v1/assessments/submit` | Submit assessment answers |
| `GET` | `/api/v1/assessments/results/{id}` | Get assessment results |

### Curriculum & Roadmap Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/curriculum/generate` | Trigger AI curriculum generation |
| `GET` | `/api/v1/curriculum/my` | Get student current curriculum |
| `GET` | `/api/v1/curriculum/roadmap` | Get visual roadmap data |
| `GET` | `/api/v1/curriculum/resources` | Get recommended resources |

### Progress Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/progress` | Get all topic statuses |
| `PUT` | `/api/v1/progress/{week_id}` | Update topic status |
| `GET` | `/api/v1/progress/summary` | Get overall progress summary |

---

## 12. Project Directory Structure

```
ai-curriculum-engine/
│
├── frontend/                             # React + TypeScript frontend
│   ├── public/
│   ├── src/
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── Auth/
│   │   │   ├── Profile/
│   │   │   ├── Assessment/
│   │   │   ├── Roadmap/
│   │   │   └── Progress/
│   │   ├── pages/                        # Page-level components
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── CareerGoalPage.tsx
│   │   │   ├── AssessmentPage.tsx
│   │   │   ├── ResultsPage.tsx
│   │   │   ├── CurriculumPage.tsx
│   │   │   ├── RoadmapPage.tsx
│   │   │   └── ProgressPage.tsx
│   │   ├── hooks/                        # Custom React hooks
│   │   ├── services/                     # API call functions (Axios)
│   │   ├── store/                        # State management
│   │   ├── types/                        # TypeScript type definitions
│   │   ├── utils/                        # Helper utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── backend/                              # FastAPI Python backend
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── students.py
│   │   │       ├── careers.py
│   │   │       ├── assessments.py
│   │   │       ├── curriculum.py
│   │   │       └── progress.py
│   │   ├── core/
│   │   │   ├── config.py                 # App configuration
│   │   │   ├── security.py               # JWT & password hashing
│   │   │   └── database.py               # DB connection & session
│   │   ├── models/                       # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── student.py
│   │   │   ├── skill.py
│   │   │   ├── assessment.py
│   │   │   ├── curriculum.py
│   │   │   └── progress.py
│   │   ├── schemas/                      # Pydantic schemas
│   │   ├── services/                     # Business logic layer
│   │   │   ├── auth_service.py
│   │   │   ├── profile_service.py
│   │   │   ├── assessment_service.py
│   │   │   ├── curriculum_service.py
│   │   │   └── progress_service.py
│   │   ├── ai/                           # AI Engine
│   │   │   ├── skill_gap_analyzer.py
│   │   │   ├── curriculum_generator.py
│   │   │   ├── prompt_builder.py
│   │   │   └── llm_client.py
│   │   └── main.py                       # FastAPI app entrypoint
│   ├── alembic/                          # Database migrations
│   ├── requirements.txt
│   └── .env.example
│
├── docs/                                 # Project documentation
│   ├── ps.md
│   ├── database_design.md
│   ├── api_docs.md
│   └── testing.md
│
├── tests/                                # Test suite
│   ├── backend/
│   └── frontend/
│
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── .env.example
└── README.md
```

---

## 13. Development Phases

```mermaid
flowchart LR
    P1["Phase 1\nRequirements\nLiterature Survey\nSystem Design"] --> P2
    P2["Phase 2\nBackend Setup\nDatabase Models\nFrontend Scaffold"] --> P3
    P3["Phase 3\nStudent Profile\nCareer Goals\nSkill Assessment"] --> P4
    P4["Phase 4\nSkill Gap Analysis\nAI Prompt Design\nLLM Integration"] --> P5
    P5["Phase 5\nCurriculum Generator\nVisual Roadmap\nResource Links"] --> P6
    P6["Phase 6\nProgress Tracking\nTesting\nDocumentation"] --> P7
    P7["Phase 7\nV1 Completion\nFinal Demo\nSubmission"]
```

### Phase Summary Table

| Phase | Work | Key Output |
|-------|------|-----------|
| **Phase 1** | Requirements, literature survey, system design | Design documents, DB schema |
| **Phase 2** | Backend setup, DB models, frontend scaffold | Working dev environment |
| **Phase 3** | Student profile, career goals, skill assessment | Core user features working |
| **Phase 4** | Skill-gap analysis, LLM integration, prompt design | AI engine operational |
| **Phase 5** | Curriculum generation, roadmap UI, resources | Full personalized output |
| **Phase 6** | Progress tracking, testing, documentation | Complete V1 ready for demo |
| **Phase 7** | V1 completion, final demo, submission | Project submission |
| **Phase 8** *(future)* | Adaptive curriculum, advanced AI features | V2 feature set |

---

## 14. AI Prompt Engineering

### 14.1 Curriculum Generation Prompt Template

```
You are an AI curriculum advisor for an educational learning platform.

Analyze the following student and generate a personalized learning curriculum.

== STUDENT PROFILE ==
Career Goal: {career_goal}

Current Skills:
{skill_list_with_levels}

Assessment Scores:
{assessment_scores}

== INSTRUCTIONS ==
1. Identify the student's strong skills (score >= 70%)
2. Identify weak skills (score < 70%)
3. Identify missing skills required for the career goal
4. Determine learning priorities based on gaps
5. Generate a logical, week-by-week learning sequence
6. Include curated learning resources for each week

Return your response as a valid JSON object only.
```

### 14.2 Expected AI Response Schema

```json
{
  "career": "AI Engineer",
  "strong_skills": ["Python"],
  "weak_skills": ["SQL", "Machine Learning"],
  "skill_gaps": ["Deep Learning", "NLP", "LLMs", "MLOps"],
  "learning_priorities": [
    "Machine Learning Fundamentals",
    "Deep Learning Fundamentals",
    "Natural Language Processing",
    "Large Language Models"
  ],
  "roadmap": [
    {
      "week": 1,
      "topic": "Machine Learning Fundamentals",
      "subtopics": ["Supervised Learning", "Linear Regression", "Classification"],
      "resources": [
        { "type": "video", "title": "ML Crash Course", "url": "..." },
        { "type": "docs", "title": "Scikit-learn Docs", "url": "..." }
      ],
      "estimated_hours": 10
    },
    {
      "week": 2,
      "topic": "Deep Learning",
      "subtopics": ["Neural Networks", "Backpropagation", "CNNs"],
      "resources": [],
      "estimated_hours": 12
    }
  ],
  "total_weeks": 6
}
```

---

## 15. Testing Strategy

### 15.1 Backend Testing Flow

```mermaid
flowchart LR
    A[pytest] --> B[Auth Tests]
    A --> C[Profile Tests]
    A --> D[Assessment Tests]
    A --> E[Curriculum Tests]
    A --> F[Progress Tests]
    B --> G[Register · Login · JWT Validation]
    C --> H[Create · Read · Update Profile]
    D --> I[Submit Assessment · Calculate Scores]
    E --> J[AI Trigger · Curriculum Validation]
    F --> K[Status Update · Progress Summary]
```

#### Backend Test Checklist

- [ ] User registration (valid / duplicate email)
- [ ] User login (valid / invalid credentials)
- [ ] JWT token validation and expiry
- [ ] Profile create and update
- [ ] Career goal assignment
- [ ] Assessment submission and scoring
- [ ] Skill gap calculation correctness
- [ ] AI curriculum generation (mock LLM)
- [ ] Progress status updates
- [ ] Protected route enforcement

### 15.2 Frontend Testing

| Area | Tests |
|------|-------|
| Form Validation | Registration, login, profile, assessment forms |
| Navigation | Route protection, redirects, page loads |
| Assessment UI | Question rendering, answer selection, submission |
| Dashboard | Curriculum display, roadmap rendering |
| API Error Handling | Network errors, 401/403/500 responses |

### 15.3 AI / LLM Evaluation

| Evaluation Criteria | Description |
|--------------------|-------------|
| Skill Gap Accuracy | Does the AI correctly identify missing skills? |
| Curriculum Relevance | Are generated topics appropriate for the career goal? |
| Personalization | Do different student profiles yield different curricula? |
| Structured Output | Is the JSON output valid and consistently formatted? |
| Consistency | Same input produces similar output across multiple runs |

### 15.4 End-to-End Integration Test Flow

```mermaid
flowchart LR
    A[Register] --> B[Login]
    B --> C[Create Profile]
    C --> D[Select Career]
    D --> E[Take Assessment]
    E --> F[View Results]
    F --> G[AI Generates Curriculum]
    G --> H[View Roadmap]
    H --> I[Mark Progress]
    I --> J[Full Flow Verified]
```

---

## 16. Personalization Test Cases

> **Key Demonstration:** Two students with different skill profiles must receive **different** learning recommendations for the **same career goal.**

### Test Case: Career Goal = AI Engineer

| Metric | Student A | Student B | Student C |
|--------|-----------|-----------|-----------|
| Python | 90% | 40% | 90% |
| SQL | 75% | 30% | 90% |
| Machine Learning | 30% | 20% | 85% |
| Deep Learning | 20% | 10% | 80% |

### Expected AI Outputs

```mermaid
flowchart TD
    CAREER["Career Goal: AI Engineer"]
    CAREER --> SA & SB & SC

    SA["Student A\nPython: 90% · SQL: 75%\nML: 30% · DL: 20%"]
    SB["Student B\nPython: 40% · SQL: 30%\nML: 20% · DL: 10%"]
    SC["Student C\nPython: 90% · SQL: 90%\nML: 85% · DL: 80%"]

    SA --> OA["Focus: ML → DL → NLP → LLMs\nSkip Python basics"]
    SB --> OB["Focus: Python → SQL → Statistics → ML\nStart from foundations"]
    SC --> OC["Focus: Advanced ML → LLMs → RAG → MLOps\nSkip to advanced topics"]
```

---

## 17. Security Guidelines

### 17.1 Authentication & Authorization

- ✅ **Never store plain-text passwords** — use bcrypt hashing
- ✅ **JWT tokens** for stateless authentication
- ✅ **Protected API routes** require valid Bearer token
- ✅ **Role-based access** for future admin/faculty features

### 17.2 Data Security

- ✅ **Environment Variables** — store all secrets in `.env` (never hard-code)
- ✅ **Never commit `.env`** files to Git (add to `.gitignore`)
- ✅ **Input validation** — use Pydantic schemas on all API inputs
- ✅ **SQL injection prevention** — use SQLAlchemy ORM (no raw SQL)
- ✅ **HTTPS** — enforce in production

### 17.3 `.env.example` Template

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/curriculum_db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI API Keys
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# App
APP_ENV=development
DEBUG=true
```

---

## 18. Future Versions (V2 – V5)

### Version 2 — Adaptive Learning

```mermaid
flowchart TD
    A[Student Studies Topic] --> B[Takes AI-Generated Quiz]
    B --> C{Score Check}
    C -->|High - above 80 percent| D[Advance to Next Topic]
    C -->|Low - below 60 percent| E[AI Identifies Weakness]
    E --> F[Add Extra Practice Resources]
    F --> G[Curriculum Updated Dynamically]
    G --> B
    D --> H[Weekly AI Progress Report]
    H --> I[Smart Notifications]
```

**New Features:** AI-generated quizzes · Difficulty adjustment · Progress analysis · Dynamic curriculum updates · Weekly AI reports · Smart notifications

---

### Version 3 — AI Tutor + RAG

```mermaid
flowchart LR
    Q[Student Question] --> TUTOR[AI Chat Tutor]
    TUTOR --> RETRIEVER[Retriever Module]
    RETRIEVER --> VECTOR_DB["Vector Database\nChromaDB / FAISS"]
    VECTOR_DB --> DOCS[Relevant Knowledge Chunks]
    DOCS --> LLM[LLM Processing]
    LLM --> ANS[Accurate Grounded Answer]
```

**New Features:** Chat tutor · PDF/document upload · Notes summarization · Q&A · Flashcards · RAG · Vector database

---

### Version 4 — AI Career Coach

```mermaid
flowchart TD
    RESUME[Resume Upload] --> AI_ANALYSIS[AI Analysis]
    AI_ANALYSIS --> CURRENT[Current Skills Extracted]
    AI_ANALYSIS --> MISSING[Missing Skills Identified]
    MISSING --> CURRICULUM[Personalized Curriculum]
    CURRICULUM --> INTERVIEW[Interview Preparation Path]
    INTERVIEW --> MOCK[Mock Interview Simulations]
    MOCK --> CHALLENGES[Coding Challenges]
```

**New Features:** Resume analysis · Missing skill identification · Interview preparation · Mock interviews · Coding challenges · Company-specific learning paths

---

### Version 5 — Multi-Agent AI Platform

```mermaid
flowchart TD
    ORCHESTRATOR["Orchestrator Agent"] --> SA & CA & RA & PMA & TA & CCA & IA

    SA["Skill Assessment Agent\nEvaluates student abilities"]
    CA["Curriculum Agent\nGenerates learning paths"]
    RA["Resource Agent\nRecommends materials"]
    PMA["Progress Monitor Agent\nTracks completion"]
    TA["AI Tutor Agent\nAnswers questions"]
    CCA["Career Coach Agent\nCareer guidance"]
    IA["Interview Agent\nMock interviews"]

    SA & CA & RA & PMA & TA & CCA & IA --> STUDENT[Student Dashboard]
```

**New Features:** Multi-agent orchestration · Voice learning assistant · Learning analytics · Placement readiness score · Faculty dashboard

---

## 19. Future Scope

| Feature | Planned Version |
|---------|----------------|
| Dynamic curriculum adaptation | V2 |
| Personalized AI quizzes | V2 |
| AI tutoring (chat-based) | V3 |
| RAG-based question answering | V3 |
| PDF learning-material analysis | V3 |
| Resume analysis | V4 |
| Interview simulation | V4 |
| Coding assessment platform | V4 |
| Voice learning assistant | V5 |
| Multi-agent collaboration | V5 |
| Learning analytics dashboard | V5 |
| Faculty/admin dashboard | V5 |
| Placement readiness score | V5 |
| Job-oriented curriculum paths | V5 |

---

## 20. Version 1 Final Deliverables

### Demo Flow

```mermaid
flowchart TD
    D1["1 - Student Registration"] --> D2
    D2["2 - Login"] --> D3
    D3["3 - Student Profile Creation"] --> D4
    D4["4 - Career Goal Selection"] --> D5
    D5["5 - Skill Assessment"] --> D6
    D6["6 - Assessment Results"] --> D7
    D7["7 - Skill Gap Analysis"] --> D8
    D8["8 - AI Curriculum Generation"] --> D9
    D9["9 - Personalized Roadmap Display"] --> D10
    D10["10 - Progress Tracking"]
    D10 --> KEY["Key Demo:\nStudent A and Student B with same career goal\nreceive DIFFERENT personalized curricula"]
```

### Deliverables Checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Working React + TypeScript frontend | ⬜ Pending |
| 2 | FastAPI backend with all endpoints | ⬜ Pending |
| 3 | PostgreSQL database with full schema | ⬜ Pending |
| 4 | User authentication (register, login, JWT) | ⬜ Pending |
| 5 | Student profile module | ⬜ Pending |
| 6 | Career goal selection module | ⬜ Pending |
| 7 | Skill assessment module | ⬜ Pending |
| 8 | Skill gap analysis engine | ⬜ Pending |
| 9 | LLM integration (Gemini / OpenAI) | ⬜ Pending |
| 10 | Personalized curriculum generator | ⬜ Pending |
| 11 | Visual learning roadmap | ⬜ Pending |
| 12 | Resource recommendation | ⬜ Pending |
| 13 | Progress tracking | ⬜ Pending |
| 14 | API documentation (FastAPI auto-docs) | ⬜ Pending |
| 15 | Database schema documentation | ⬜ Pending |
| 16 | Testing documentation | ⬜ Pending |
| 17 | GitHub repository with full history | ⬜ Pending |
| 18 | Project README and documentation | ✅ Done |
| 19 | Final presentation slides | ⬜ Pending |
| 20 | Live project demonstration | ⬜ Pending |

---

## 21. Getting Started

### Prerequisites

```bash
Node.js >= 18.x
Python >= 3.11
PostgreSQL >= 15
Git
Docker (optional but recommended)
```

### 1. Clone the Repository

```bash
git clone https://github.com/<your-org>/ai-curriculum-engine.git
cd ai-curriculum-engine
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate           # Windows
# source venv/bin/activate      # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env
# Edit .env with your DATABASE_URL, SECRET_KEY, and AI API keys

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

> API docs available at: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

> Frontend available at: `http://localhost:5173`

### 4. Docker Setup (Recommended)

```bash
# Start all services (backend + frontend + database)
docker-compose up --build
```

### 5. Environment Variables

Copy `.env.example` to `.env` in the backend directory and fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret (use a long random string) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `OPENAI_API_KEY` | OpenAI API key (optional fallback) |

---

## 22. Team

> 🎓 Semester Mini Project — 3-Member Team

| Member | Role | Responsibilities |
|--------|------|-----------------|
| **Member 1** | Backend Developer | FastAPI · PostgreSQL · Auth · REST APIs |
| **Member 2** | Frontend Developer | React · TypeScript · UI/UX · Routing |
| **Member 3** | AI Engineer | LLM Integration · Skill Gap · Curriculum Generator |

---

## 23. Conclusion

The **AI-Driven Dynamic Curriculum Recommendation Engine** moves beyond static learning paths by using **Generative AI** to understand individual learners and create personalized, career-oriented curricula.

```mermaid
flowchart LR
    S[Student] --> A[Assessment]
    A --> G[Skill Gap]
    G --> AI[Generative AI]
    AI --> C[Personalized Curriculum]
    C --> R[Learning Roadmap]
    R --> P[Progress Tracking]
    P -->|Skill Updated| A
```

The project is developed in versions — from a basic personalized curriculum engine (V1) to a full multi-agent AI learning ecosystem (V5).

> **The long-term goal:** An intelligent learning ecosystem where the curriculum continuously evolves with the learner.

---

<div align="center">

**Built with dedication as a Semester Mini Project**

*Star this repo if you find it helpful!*

</div>
