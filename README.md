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

---

### 🔵 Version 2 — Adaptive Learning

> **Goal:** Make the curriculum dynamic and self-improving based on student performance. The system stops being a one-time generator and becomes a continuous learning companion that evolves with the student.

#### 18.1 Version 2 Feature Overview

| Feature | Description |
|---------|-------------|
| 🧪 **AI Quiz Generation** | After each topic, the AI generates a custom 5–10 question quiz to evaluate understanding |
| 🎚️ **Difficulty Adjustment** | Quiz difficulty adapts based on previous performance (easy → medium → hard) |
| 🔄 **Dynamic Curriculum Updates** | If a student scores below 60%, the curriculum is automatically updated with remedial resources |
| 📊 **Weekly AI Progress Reports** | Every week, the AI generates a personalized progress analysis report |
| 🔔 **Smart Notifications** | Automated reminders for upcoming study sessions and pending topics |
| 📈 **Performance Dashboard** | Visual charts showing skill improvement trends over time |
| 🏆 **Achievement Badges** | Milestone-based rewards to keep students motivated |

#### 18.2 Version 2 User Workflow

```mermaid
flowchart TD
    START([Student]) --> STUDY

    STUDY["Study Topic\nComplete weekly curriculum topic"]
    QUIZ["AI-Generated Quiz\nCustom questions per topic"]
    SCORE{Score Check}
    ADVANCE["Advance to Next Topic\nCurriculum progresses"]
    WEAK["AI Identifies Weakness\nDetects knowledge gaps"]
    REMEDIAL["Remedial Resources Added\nExtra practice & explanations"]
    UPDATE["Curriculum Updated\nNew weekly plan generated"]
    REPORT["Weekly AI Report\nProgress analysis & insights"]
    NOTIFY["Smart Notifications\nReminders & nudges"]
    DASHBOARD["Performance Dashboard\nSkill growth charts"]

    START --> STUDY --> QUIZ --> SCORE
    SCORE -->|"≥ 80% — Strong"| ADVANCE
    SCORE -->|"60–79% — Average"| REPORT
    SCORE -->|"< 60% — Weak"| WEAK
    WEAK --> REMEDIAL --> UPDATE --> QUIZ
    ADVANCE --> REPORT
    REPORT --> NOTIFY --> DASHBOARD
    DASHBOARD -->|"Next Topic"| STUDY
```

#### 18.3 Version 2 Architecture Additions

```mermaid
flowchart TD
    subgraph V2_NEW["🆕 New in V2"]
        QUIZ_SVC["Quiz Generation Service\nAI-generated per-topic quizzes"]
        ADAPT_SVC["Adaptation Engine\nDifficulty & content adjustment"]
        REPORT_SVC["Report Service\nWeekly AI progress reports"]
        NOTIF_SVC["Notification Service\nEmail · In-app alerts"]
        ANALYTICS["Analytics Engine\nPerformance trend tracking"]
    end

    subgraph V1_BASE["✅ V1 Base"]
        FASTAPI["FastAPI Backend"]
        AI_ENGINE["AI Engine (Gemini)"]
        PG[("PostgreSQL")]
    end

    FASTAPI --> QUIZ_SVC & ADAPT_SVC & REPORT_SVC & NOTIF_SVC & ANALYTICS
    QUIZ_SVC --> AI_ENGINE
    ADAPT_SVC --> AI_ENGINE
    REPORT_SVC --> AI_ENGINE
    QUIZ_SVC & ADAPT_SVC & REPORT_SVC & ANALYTICS --> PG
```

#### 18.4 Version 2 New Database Entities

| Entity | Description |
|--------|-------------|
| `topic_quizzes` | AI-generated quiz metadata per curriculum week |
| `quiz_questions` | Individual questions per quiz (difficulty-tagged) |
| `quiz_attempts` | Student quiz attempt history and scores |
| `weekly_reports` | Stored AI-generated weekly progress reports |
| `notifications` | Notification queue for email and in-app alerts |
| `achievements` | Student milestone badges and rewards |

```mermaid
erDiagram
    CURRICULUM_WEEKS ||--o{ TOPIC_QUIZZES : "has"
    TOPIC_QUIZZES ||--o{ QUIZ_QUESTIONS : "contains"
    STUDENTS ||--o{ QUIZ_ATTEMPTS : "takes"
    QUIZ_ATTEMPTS }o--|| TOPIC_QUIZZES : "for"
    STUDENTS ||--o{ WEEKLY_REPORTS : "receives"
    STUDENTS ||--o{ NOTIFICATIONS : "gets"
    STUDENTS ||--o{ ACHIEVEMENTS : "earns"

    TOPIC_QUIZZES {
        int id PK
        int week_id FK
        string difficulty
        int question_count
        datetime generated_at
    }

    QUIZ_QUESTIONS {
        int id PK
        int quiz_id FK
        string question_text
        json options
        string correct_answer
        string difficulty
        int skill_id FK
    }

    QUIZ_ATTEMPTS {
        int id PK
        int student_id FK
        int quiz_id FK
        float score
        json answers
        datetime taken_at
    }

    WEEKLY_REPORTS {
        int id PK
        int student_id FK
        int week_number
        text report_text
        json skill_progress
        datetime generated_at
    }

    NOTIFICATIONS {
        int id PK
        int student_id FK
        string type
        string message
        bool is_read
        datetime created_at
    }

    ACHIEVEMENTS {
        int id PK
        int student_id FK
        string badge_name
        string description
        datetime earned_at
    }
```

#### 18.5 Version 2 New API Endpoints

**Quiz Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v2/quiz/generate/{week_id}` | AI generates a quiz for a curriculum week |
| `GET` | `/api/v2/quiz/{quiz_id}` | Get quiz questions |
| `POST` | `/api/v2/quiz/{quiz_id}/submit` | Submit quiz answers |
| `GET` | `/api/v2/quiz/history` | Get student's quiz attempt history |

**Adaptive Curriculum Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v2/curriculum/adapt` | Trigger curriculum adaptation based on quiz score |
| `GET` | `/api/v2/curriculum/updated` | Get latest adapted curriculum |

**Reports & Notifications**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v2/reports/weekly` | Get AI-generated weekly progress report |
| `GET` | `/api/v2/notifications` | Get all notifications for student |
| `PUT` | `/api/v2/notifications/{id}/read` | Mark notification as read |
| `GET` | `/api/v2/achievements` | Get student's earned badges |

#### 18.6 Version 2 AI Capabilities

| Capability | Description |
|-----------|-------------|
| **Quiz Question Generation** | LLM generates MCQ questions from topic content, calibrated by difficulty |
| **Weakness Identification** | AI analyzes wrong answers to detect specific concept gaps |
| **Curriculum Re-planning** | AI re-orders and augments the weekly plan based on performance |
| **Progress Report Writing** | AI writes personalized weekly narrative progress reports |

**Adaptive Quiz Prompt Example:**
```
Generate 5 multiple-choice questions on the topic "{topic}" at {difficulty} difficulty level.
The student has scored {previous_score}% in their previous attempt.
Focus on areas where the student showed weakness: {weak_concepts}.
Return JSON format with question, options (A-D), correct_answer, and explanation.
```

#### 18.7 Version 2 Technology Stack Additions

| Technology | Purpose |
|-----------|---------|
| **Celery** | Background task queue for report generation and notifications |
| **Redis** | Task broker for Celery + caching quiz data |
| **APScheduler** | Scheduled weekly report generation |
| **SendGrid / SMTP** | Email notification delivery |
| **Recharts / Chart.js** | Performance trend visualization on frontend |

---

### 🟣 Version 3 — AI Tutor + RAG

> **Goal:** Transform the platform into an interactive learning assistant where students can ask questions, upload their study materials, and get grounded, accurate AI-powered answers — not hallucinations.

#### 18.8 Version 3 Feature Overview

| Feature | Description |
|---------|-------------|
| 💬 **AI Chat Tutor** | Conversational AI assistant embedded in each curriculum topic |
| 📄 **PDF / Document Upload** | Students upload textbooks or notes; AI indexes and learns from them |
| 🔍 **RAG Question Answering** | AI answers questions grounded in uploaded documents (no hallucination) |
| 📝 **Notes Summarization** | AI summarizes uploaded PDFs into concise study notes |
| 🃏 **Flashcard Generation** | AI auto-generates flashcards from uploaded material or curriculum topics |
| 🗂️ **Knowledge Base** | Per-student vector database of indexed documents |
| 📚 **Multi-Source Retrieval** | AI retrieves from uploaded docs + curated knowledge base simultaneously |

#### 18.9 Version 3 User Workflow

```mermaid
flowchart TD
    START([Student]) --> TOPIC

    TOPIC["Studying a Curriculum Topic"]
    UPLOAD["Upload Study Material\nPDF · DOCX · Text"]
    INDEX["Document Indexing\nChunk → Embed → Store in Vector DB"]
    ASK["Ask AI Tutor a Question\nChat interface"]
    RETRIEVE["Retrieval Module\nSemantic search across documents"]
    VECTOR["Vector Database\nChromaDB / FAISS"]
    CONTEXT["Relevant Chunks Retrieved\nTop-K most similar passages"]
    LLM["LLM Processing\nGemini + Retrieved Context"]
    ANSWER["Grounded AI Answer\nWith source citations"]
    FLASH["Auto-generate Flashcards\nFrom topic or uploaded docs"]
    SUMMARY["AI Summarization\nCompressed study notes"]

    START --> TOPIC
    TOPIC --> ASK
    TOPIC --> UPLOAD --> INDEX --> VECTOR
    ASK --> RETRIEVE --> VECTOR --> CONTEXT --> LLM --> ANSWER
    ANSWER -->|"Continue learning"| TOPIC
    TOPIC --> FLASH
    UPLOAD --> SUMMARY
```

#### 18.10 Version 3 Architecture Additions

```mermaid
flowchart TD
    subgraph V3_NEW["🆕 New in V3"]
        TUTOR_SVC["AI Tutor Service\nChat session management"]
        RAG_ENGINE["RAG Engine\nRetrieval-Augmented Generation"]
        EMBED_SVC["Embedding Service\nText → Vector conversion"]
        VECTOR_DB["Vector Database\nChromaDB / FAISS"]
        DOC_PROC["Document Processor\nPDF → text chunks"]
        FLASH_SVC["Flashcard Service\nAI flashcard generation"]
        SUMM_SVC["Summarization Service\nNotes → compact summaries"]
    end

    subgraph V2_BASE["✅ V1+V2 Base"]
        FASTAPI["FastAPI Backend"]
        AI_ENGINE["AI Engine (Gemini)"]
        PG[("PostgreSQL")]
        REDIS[("Redis")]
    end

    FASTAPI --> TUTOR_SVC & DOC_PROC & FLASH_SVC & SUMM_SVC
    DOC_PROC --> EMBED_SVC --> VECTOR_DB
    TUTOR_SVC --> RAG_ENGINE
    RAG_ENGINE --> EMBED_SVC & VECTOR_DB
    RAG_ENGINE --> AI_ENGINE
    TUTOR_SVC & FLASH_SVC & SUMM_SVC --> PG
```

#### 18.11 Version 3 New Database Entities

| Entity | Description |
|--------|-------------|
| `documents` | Uploaded PDF/text files metadata |
| `document_chunks` | Text segments extracted from documents |
| `chat_sessions` | AI tutor conversation sessions per student |
| `chat_messages` | Individual messages in a chat session |
| `flashcards` | AI-generated or student-created flashcard sets |
| `flashcard_items` | Individual flashcard question-answer pairs |
| `student_notes` | AI-summarized notes stored per topic |

```mermaid
erDiagram
    STUDENTS ||--o{ DOCUMENTS : "uploads"
    DOCUMENTS ||--o{ DOCUMENT_CHUNKS : "split into"
    STUDENTS ||--o{ CHAT_SESSIONS : "has"
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : "contains"
    STUDENTS ||--o{ FLASHCARDS : "owns"
    FLASHCARDS ||--o{ FLASHCARD_ITEMS : "has"
    STUDENTS ||--o{ STUDENT_NOTES : "stores"

    DOCUMENTS {
        int id PK
        int student_id FK
        string filename
        string file_path
        string mime_type
        datetime uploaded_at
        bool is_indexed
    }

    DOCUMENT_CHUNKS {
        int id PK
        int document_id FK
        text content
        string vector_id
        int chunk_index
    }

    CHAT_SESSIONS {
        int id PK
        int student_id FK
        int curriculum_week_id FK
        string title
        datetime started_at
    }

    CHAT_MESSAGES {
        int id PK
        int session_id FK
        string role
        text content
        json source_chunks
        datetime created_at
    }

    FLASHCARDS {
        int id PK
        int student_id FK
        string title
        string source_type
        int source_id FK
        datetime created_at
    }

    FLASHCARD_ITEMS {
        int id PK
        int flashcard_id FK
        text front_text
        text back_text
        string difficulty
    }

    STUDENT_NOTES {
        int id PK
        int student_id FK
        int curriculum_week_id FK
        text summary_text
        datetime generated_at
    }
```

#### 18.12 Version 3 New API Endpoints

**Document Management**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v3/documents/upload` | Upload a PDF or text document |
| `GET` | `/api/v3/documents` | List all uploaded documents |
| `DELETE` | `/api/v3/documents/{id}` | Delete a document and its index |
| `POST` | `/api/v3/documents/{id}/index` | Trigger document indexing into vector DB |

**AI Tutor / Chat**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v3/tutor/sessions` | Start a new AI tutor chat session |
| `POST` | `/api/v3/tutor/sessions/{id}/message` | Send a message and get AI response |
| `GET` | `/api/v3/tutor/sessions/{id}/history` | Get full chat history |
| `GET` | `/api/v3/tutor/sessions` | List all chat sessions |

**Flashcards & Notes**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v3/flashcards/generate/{week_id}` | AI generates flashcards for a topic |
| `GET` | `/api/v3/flashcards` | Get student's flashcard sets |
| `POST` | `/api/v3/notes/summarize/{document_id}` | Summarize an uploaded document |
| `GET` | `/api/v3/notes` | Get all saved AI-generated notes |

#### 18.13 Version 3 AI Capabilities

| Capability | Description |
|-----------|-------------|
| **Text Embedding** | Convert document chunks and questions into semantic vectors |
| **Semantic Retrieval** | Find top-K most relevant document passages for a question |
| **RAG Answer Generation** | Generate answers grounded in retrieved context, with citations |
| **Summarization** | Condense long documents into structured study notes |
| **Flashcard Generation** | Extract key concepts and create Q&A pairs from content |
| **Hallucination Prevention** | Answers are always grounded in retrieved facts, never fabricated |

**RAG Prompt Pattern:**
```
You are an AI study tutor for the topic "{topic}".

Use ONLY the following retrieved context to answer the student's question.
If the answer is not in the context, say "I don't have enough information on this."

Context:
{retrieved_chunks}

Student Question: {question}

Provide a clear, concise answer with the relevant source section.
```

#### 18.14 Version 3 Technology Stack Additions

| Technology | Purpose |
|-----------|---------|
| **LangChain** | LLM application framework for RAG pipeline |
| **ChromaDB** | Local vector database for document embeddings |
| **FAISS** | Alternative high-performance vector index |
| **sentence-transformers** | Text embedding model for semantic search |
| **PyMuPDF / pdfplumber** | PDF text extraction and parsing |
| **FastAPI WebSocket** | Real-time streaming chat responses |

---

### 🟠 Version 4 — AI Career Coach

> **Goal:** Take personalized learning beyond curriculum into career readiness — resume analysis, interview simulation, coding practice, and company-specific preparation so students are truly job-ready.

#### 18.15 Version 4 Feature Overview

| Feature | Description |
|---------|-------------|
| 📄 **Resume Upload & Analysis** | AI parses resume to extract skills, experience, and education |
| 🎯 **Skill Gap from Resume** | Compares resume skills against job role requirements |
| 🗺️ **Career-Specific Curriculum** | Learning path generated based on resume gaps + target role |
| 🏢 **Company-Specific Paths** | Tailored preparation for FAANG, startups, or specific domains |
| 🎤 **AI Interview Preparation** | HR, technical, and behavioral interview question generation |
| 🤖 **Mock Interview Simulator** | Conversational AI that conducts and evaluates mock interviews |
| 💻 **Coding Challenges** | LeetCode-style AI-generated coding problems with hints |
| 📊 **Career Readiness Score** | Numerical score indicating job-readiness level |
| 🏆 **Job Role Matching** | Matches student profile to suitable job roles and companies |

#### 18.16 Version 4 User Workflow

```mermaid
flowchart TD
    START([Student]) --> RESUME

    RESUME["Upload Resume\nPDF format"]
    PARSE["AI Resume Parser\nExtract skills · experience · education"]
    COMPARE["Skill Gap Analysis\nResume vs. Target Job Requirements"]
    CAREER_CURR["Career-Specific Curriculum\nGenerated from gap analysis"]
    COMPANY["Select Target Company\nFAANG · Startup · Domain"]
    COMPANY_PATH["Company-Specific Path\nCustomized prep plan"]
    INTERVIEW_PREP["Interview Preparation\nHR · Technical · Behavioral"]
    MOCK["Mock Interview Session\nAI conducts full interview"]
    EVALUATE["Interview Evaluation\nAI scores & gives feedback"]
    CODE["Coding Challenges\nAI-generated problems"]
    CODE_REVIEW["Code Review\nAI evaluates solution"]
    SCORE["Career Readiness Score\nJob-readiness meter"]

    START --> RESUME --> PARSE --> COMPARE --> CAREER_CURR
    CAREER_CURR --> COMPANY --> COMPANY_PATH
    COMPANY_PATH --> INTERVIEW_PREP --> MOCK --> EVALUATE
    COMPANY_PATH --> CODE --> CODE_REVIEW
    EVALUATE & CODE_REVIEW --> SCORE
    SCORE -->|"Improve weak areas"| CAREER_CURR
```

#### 18.17 Version 4 Architecture Additions

```mermaid
flowchart TD
    subgraph V4_NEW["🆕 New in V4"]
        RESUME_SVC["Resume Parser Service\nAI skill extraction"]
        CAREER_COACH["Career Coach Engine\nJob role analysis"]
        INTERVIEW_SVC["Interview Service\nQ&A generation + evaluation"]
        MOCK_SVC["Mock Interview Service\nConversational simulator"]
        CODING_SVC["Coding Challenge Service\nProblem generation + review"]
        READINESS_SVC["Readiness Score Engine\nCareer readiness calculator"]
        COMPANY_DB["Company Profiles DB\nRole requirements & interview styles"]
    end

    subgraph BASE["✅ V1–V3 Base"]
        FASTAPI["FastAPI Backend"]
        AI_ENGINE["AI Engine (Gemini)"]
        RAG_ENGINE["RAG Engine"]
        PG[("PostgreSQL")]
    end

    FASTAPI --> RESUME_SVC & CAREER_COACH & INTERVIEW_SVC & MOCK_SVC & CODING_SVC & READINESS_SVC
    RESUME_SVC & CAREER_COACH & INTERVIEW_SVC & CODING_SVC --> AI_ENGINE
    MOCK_SVC --> RAG_ENGINE
    COMPANY_DB --> CAREER_COACH
    RESUME_SVC & CAREER_COACH & INTERVIEW_SVC & CODING_SVC & READINESS_SVC --> PG
```

#### 18.18 Version 4 New Database Entities

| Entity | Description |
|--------|-------------|
| `resumes` | Uploaded resume files and parsed data |
| `resume_skills` | Skills extracted from resume by AI |
| `company_profiles` | Company data (roles, required skills, interview style) |
| `interview_sessions` | Mock interview session metadata |
| `interview_questions` | Generated interview Q&A pairs |
| `interview_responses` | Student's recorded answers and AI scores |
| `coding_challenges` | Generated coding problems with test cases |
| `coding_submissions` | Student code submissions and review results |
| `career_readiness` | Career readiness score and breakdown |

```mermaid
erDiagram
    STUDENTS ||--o{ RESUMES : "uploads"
    RESUMES ||--o{ RESUME_SKILLS : "extracts"
    STUDENTS ||--o{ INTERVIEW_SESSIONS : "takes"
    INTERVIEW_SESSIONS ||--o{ INTERVIEW_QUESTIONS : "has"
    INTERVIEW_SESSIONS ||--o{ INTERVIEW_RESPONSES : "captures"
    STUDENTS ||--o{ CODING_CHALLENGES : "attempts"
    CODING_CHALLENGES ||--o{ CODING_SUBMISSIONS : "receives"
    STUDENTS ||--|| CAREER_READINESS : "has"
    COMPANY_PROFILES ||--o{ INTERVIEW_SESSIONS : "targets"

    RESUMES {
        int id PK
        int student_id FK
        string file_path
        json parsed_data
        datetime uploaded_at
    }

    COMPANY_PROFILES {
        int id PK
        string company_name
        string role
        json required_skills
        string interview_style
        string difficulty_level
    }

    INTERVIEW_SESSIONS {
        int id PK
        int student_id FK
        int company_id FK
        string interview_type
        float overall_score
        datetime started_at
        datetime completed_at
    }

    INTERVIEW_QUESTIONS {
        int id PK
        int session_id FK
        string question_type
        text question_text
        text ideal_answer
        string difficulty
    }

    INTERVIEW_RESPONSES {
        int id PK
        int session_id FK
        int question_id FK
        text student_answer
        float ai_score
        text ai_feedback
    }

    CODING_CHALLENGES {
        int id PK
        int student_id FK
        string title
        text problem_statement
        json test_cases
        string difficulty
        string topic
        datetime generated_at
    }

    CODING_SUBMISSIONS {
        int id PK
        int challenge_id FK
        int student_id FK
        text code
        string language
        bool passed
        text ai_review
        datetime submitted_at
    }

    CAREER_READINESS {
        int id PK
        int student_id FK
        float overall_score
        json skill_scores
        float interview_score
        float coding_score
        datetime last_updated
    }
```

#### 18.19 Version 4 New API Endpoints

**Resume & Career Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v4/resume/upload` | Upload and parse resume |
| `GET` | `/api/v4/resume/skills` | Get AI-extracted skills from resume |
| `GET` | `/api/v4/career/companies` | List company profiles |
| `POST` | `/api/v4/career/match` | Get best-matched roles for student profile |
| `GET` | `/api/v4/career/readiness` | Get career readiness score |

**Interview Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v4/interview/sessions` | Start a mock interview session |
| `GET` | `/api/v4/interview/sessions/{id}/question` | Get next interview question |
| `POST` | `/api/v4/interview/sessions/{id}/answer` | Submit answer and get AI evaluation |
| `GET` | `/api/v4/interview/sessions/{id}/report` | Get interview performance report |

**Coding Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v4/coding/generate` | Generate a coding challenge |
| `GET` | `/api/v4/coding/challenges` | Get student's challenge list |
| `POST` | `/api/v4/coding/{id}/submit` | Submit code solution |
| `GET` | `/api/v4/coding/{id}/review` | Get AI code review |
| `GET` | `/api/v4/coding/{id}/hints` | Get progressive AI hints |

#### 18.20 Version 4 AI Capabilities

| Capability | Description |
|-----------|-------------|
| **Resume Parsing** | AI extracts structured skill data from unstructured resume text |
| **Role Gap Analysis** | AI compares resume skills against job role requirements |
| **Interview Q Generation** | AI generates HR, technical, and behavioral questions per company |
| **Answer Evaluation** | AI scores student's interview answer against ideal response |
| **Mock Interviewer** | AI role-plays as interviewer, adapts follow-up questions contextually |
| **Code Review** | AI analyzes code for correctness, efficiency, and best practices |
| **Hint System** | AI provides Socratic progressive hints without revealing the solution |
| **Readiness Scoring** | AI aggregates performance across all domains into a readiness score |

**Interview Evaluation Prompt:**
```
You are an expert interviewer evaluating a candidate's response.

Question: {question}
Question Type: {type} (HR / Technical / Behavioral)
Target Company: {company}

Candidate's Answer: {student_answer}

Ideal Answer Criteria: {ideal_answer}

Score the response from 0–100 and provide:
1. Score
2. What was done well
3. What could be improved
4. A model answer for reference
Return as JSON.
```

#### 18.21 Version 4 Technology Stack Additions

| Technology | Purpose |
|-----------|---------|
| **Judge0 API** | Sandboxed code execution and testing |
| **python-docx / pdfminer** | Resume parsing from PDF/DOCX |
| **spaCy / NER** | Named entity recognition for skill extraction |
| **WebSockets** | Real-time conversational mock interview |
| **Monaco Editor** | VS Code-like in-browser code editor |

---

### 🔴 Version 5 — Multi-Agent AI Platform

> **Goal:** Evolve the entire platform into a fully autonomous multi-agent AI ecosystem where specialized agents collaborate, a voice assistant enables hands-free learning, and a faculty dashboard enables institutional oversight and placement tracking.

#### 18.22 Version 5 Feature Overview

| Feature | Description |
|---------|-------------|
| 🤖 **Multi-Agent Orchestration** | Central orchestrator coordinates 7 specialized AI agents |
| 🎙️ **Voice Learning Assistant** | Hands-free AI tutor accessible via speech input/output |
| 📊 **Learning Analytics Dashboard** | Institution-wide and individual performance analytics |
| 🏅 **Placement Readiness Score** | Composite score combining curriculum, interviews, and coding |
| 👩‍🏫 **Faculty Dashboard** | Educators can monitor cohort progress and set learning targets |
| 🔗 **Agent Communication** | Agents share context and hand off tasks intelligently via LangGraph |
| 📱 **Mobile-Ready PWA** | Progressive Web App for learning on any device |
| 🌐 **LMS Integration** | Connects with institutional LMS (Moodle, Canvas) via APIs |

#### 18.23 Version 5 Agent Roles

| Agent | Responsibility |
|-------|---------------|
| 🧠 **Orchestrator Agent** | Receives student goals, delegates to the right specialist agents |
| 🎯 **Skill Assessment Agent** | Evaluates student abilities and gaps dynamically |
| 📚 **Curriculum Agent** | Generates and continuously updates personalized learning paths |
| 🔍 **Resource Agent** | Searches and recommends the best learning materials in real time |
| 📈 **Progress Monitor Agent** | Tracks completion, detects stagnation, and triggers interventions |
| 💬 **AI Tutor Agent** | Answers domain questions using RAG and document knowledge |
| 💼 **Career Coach Agent** | Manages resume analysis, company targeting, and career guidance |
| 🎤 **Interview Agent** | Conducts mock interviews and evaluates performance end-to-end |

#### 18.24 Version 5 Multi-Agent Workflow

```mermaid
flowchart TD
    STUDENT([Student]) --> ORCHESTRATOR

    ORCHESTRATOR["🧠 Orchestrator Agent\n(LangGraph Coordinator)"]

    subgraph AGENTS["Specialist Agents"]
        SA["🎯 Skill Assessment Agent"]
        CA["📚 Curriculum Agent"]
        RA["🔍 Resource Agent"]
        PMA["📈 Progress Monitor Agent"]
        TA["💬 AI Tutor Agent (RAG)"]
        CCA["💼 Career Coach Agent"]
        IA["🎤 Interview Agent"]
    end

    subgraph DATA["Shared Data Layer"]
        PG[("PostgreSQL\nStructured Data")]
        VECTOR[("Vector DB\nChromaDB")]
        REDIS[("Redis\nAgent State Cache")]
    end

    ORCHESTRATOR --> SA & CA & RA & PMA & TA & CCA & IA
    SA <-->|"Skill data"| CA
    CA <-->|"Topics"| RA
    PMA <-->|"Progress"| CA
    TA <-->|"Tutor handoff"| CCA
    CCA <-->|"Career context"| IA

    AGENTS --> DATA

    PMA --> VOICE["🎙️ Voice Assistant"]
    ORCHESTRATOR --> FACULTY["👩‍🏫 Faculty Dashboard"]
    ORCHESTRATOR --> ANALYTICS["📊 Analytics Engine"]
    ANALYTICS --> PLACEMENT["🏅 Placement Readiness Score"]
```

#### 18.25 Version 5 Architecture Additions

```mermaid
flowchart TD
    subgraph V5_NEW["🆕 New in V5"]
        LANGGRAPH["LangGraph\nAgent orchestration framework"]
        VOICE_SVC["Voice Service\nSTT · TTS pipeline"]
        ANALYTICS_SVC["Analytics Engine\nCohort & individual insights"]
        FACULTY_SVC["Faculty Service\nDashboard & goal setting"]
        LMS_SVC["LMS Integration\nMoodle / Canvas connector"]
        PLACEMENT_SVC["Placement Score Engine\nComposite readiness calculator"]
        AGENT_STATE["Agent State Manager\nCross-agent context sharing (Redis)"]
    end

    subgraph BASE["✅ V1–V4 Base"]
        FASTAPI["FastAPI Backend"]
        ALL_AGENTS["All V1–V4 Services"]
        PG[("PostgreSQL")]
        VECTOR[("Vector DB")]
    end

    LANGGRAPH --> ALL_AGENTS
    LANGGRAPH --> AGENT_STATE
    VOICE_SVC --> ALL_AGENTS
    FACULTY_SVC & ANALYTICS_SVC & PLACEMENT_SVC --> PG
    LANGGRAPH --> FASTAPI
    LMS_SVC --> FASTAPI
```

#### 18.26 Version 5 New Database Entities

| Entity | Description |
|--------|-------------|
| `agent_sessions` | Multi-agent conversation state and handoff logs |
| `agent_logs` | Per-agent action and decision audit trail |
| `faculty_profiles` | Faculty/educator accounts with institution association |
| `cohorts` | Groups of students managed by a faculty member |
| `cohort_members` | Student ↔ cohort mapping |
| `analytics_snapshots` | Periodic snapshots of platform-wide learning metrics |
| `placement_scores` | Composite placement readiness breakdown per student |
| `lms_integrations` | LMS connection configurations per institution |

```mermaid
erDiagram
    FACULTY_PROFILES ||--o{ COHORTS : "manages"
    COHORTS ||--o{ COHORT_MEMBERS : "has"
    STUDENTS ||--o{ COHORT_MEMBERS : "belongs to"
    STUDENTS ||--|| PLACEMENT_SCORES : "has"
    STUDENTS ||--o{ AGENT_SESSIONS : "interacts via"
    AGENT_SESSIONS ||--o{ AGENT_LOGS : "records"

    FACULTY_PROFILES {
        int id PK
        string full_name
        string email UK
        string institution
        string department
        datetime created_at
    }

    COHORTS {
        int id PK
        int faculty_id FK
        string name
        string target_career
        datetime start_date
        datetime end_date
    }

    COHORT_MEMBERS {
        int id PK
        int cohort_id FK
        int student_id FK
        datetime joined_at
    }

    AGENT_SESSIONS {
        int id PK
        int student_id FK
        string session_id
        json agent_chain
        json shared_context
        datetime started_at
        datetime ended_at
    }

    AGENT_LOGS {
        int id PK
        int session_id FK
        string agent_name
        string action
        json input_data
        json output_data
        datetime timestamp
    }

    PLACEMENT_SCORES {
        int id PK
        int student_id FK
        float curriculum_score
        float quiz_score
        float interview_score
        float coding_score
        float overall_score
        string readiness_level
        datetime calculated_at
    }

    ANALYTICS_SNAPSHOTS {
        int id PK
        string scope
        int entity_id FK
        json metrics
        datetime snapshot_at
    }
```

#### 18.27 Version 5 New API Endpoints

**Multi-Agent Orchestration**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v5/agent/start` | Start a multi-agent session for a student goal |
| `POST` | `/api/v5/agent/message` | Send a message to the orchestrator |
| `GET` | `/api/v5/agent/sessions/{id}` | Get agent session state |
| `GET` | `/api/v5/agent/sessions/{id}/logs` | Get full agent decision logs |

**Voice Assistant**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v5/voice/transcribe` | Speech-to-text: convert audio to student query |
| `POST` | `/api/v5/voice/respond` | Text-to-speech: convert AI answer to audio |
| `POST` | `/api/v5/voice/session` | Start a hands-free voice tutor session |

**Faculty Dashboard**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v5/faculty/cohorts` | Create a student cohort |
| `GET` | `/api/v5/faculty/cohorts/{id}/progress` | Get cohort-wide progress |
| `GET` | `/api/v5/faculty/analytics` | Get institution-level analytics |
| `GET` | `/api/v5/faculty/placements` | Get cohort placement readiness summary |

**Placement & Analytics**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v5/placement/score` | Get student's composite placement readiness score |
| `GET` | `/api/v5/analytics/me` | Get individual learning analytics |
| `GET` | `/api/v5/analytics/cohort/{id}` | Get cohort-level learning analytics |

#### 18.28 Version 5 AI Capabilities

| Capability | Description |
|-----------|-------------|
| **Orchestrated Multi-Agent** | LangGraph routes student requests to the optimal specialist agent |
| **Cross-Agent Context** | Agents share session state so context is never lost between handoffs |
| **Voice Interface (STT/TTS)** | Students speak questions; AI responds verbally using TTS |
| **Autonomous Planning** | Orchestrator plans multi-step learning workflows without student input |
| **Cohort Trend Analysis** | AI identifies struggling students and suggests faculty interventions |
| **Placement Prediction** | AI predicts job-readiness based on all platform signals |
| **Proactive Nudging** | Agents autonomously send motivational nudges when stagnation is detected |

**Multi-Agent Orchestrator Prompt Pattern:**
```
You are the Orchestrator Agent for an AI learning platform.

Student Goal: {goal}
Student Context:
  - Skills: {skills}
  - Current Curriculum Week: {week}
  - Recent Performance: {performance}
  - Career Target: {career}

Available Agents: [SkillAssessment, Curriculum, Resource, ProgressMonitor, AITutor, CareerCoach, Interview]

Analyze the student's current state and determine which agent(s) should act next.
Return a JSON plan with: selected_agent, task_description, input_data, expected_output.
```

#### 18.29 Version 5 Technology Stack Additions

| Technology | Purpose |
|-----------|---------|
| **LangGraph** | Multi-agent workflow orchestration with stateful graphs |
| **LangChain Agents** | Tool-calling agents for each specialist domain |
| **OpenAI Whisper / Google STT** | Speech-to-text for voice assistant |
| **Google TTS / ElevenLabs** | Text-to-speech for voice responses |
| **Grafana + Prometheus** | Real-time platform analytics and monitoring |
| **Metabase** | Faculty-facing analytics dashboards |
| **moodle-rest-client** | LMS integration with Moodle |
| **PWA (Vite PWA Plugin)** | Progressive Web App for mobile learning |

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

| Tool | Version | Purpose |
|------|---------|---------|
| **Python** | >= 3.11 | Backend runtime |
| **Node.js** | >= 18.x | Frontend runtime |
| **Git** | Latest | Version control |
| **Docker** *(optional)* | Latest | Containerized setup |

> **Database**: Uses **SQLite** by default (no external DB required). PostgreSQL can be configured via `DATABASE_URL`.

---

### Option A — Local Development (Recommended)

#### 1. Clone the Repository

```bash
git clone https://github.com/AI-Curriculum-Recommendation-Team/AI-dynamic-curriculum-recommendation-Engine.git
cd AI-dynamic-curriculum-recommendation-Engine
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate           # Windows
# source venv/bin/activate      # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env          # Windows
# cp .env.example .env          # macOS / Linux

# ✏️  Open .env and set your API keys:
#    GEMINI_API_KEY=your-key-here
#    SECRET_KEY=any-long-random-string

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

> ✅ **API docs** available at: [`http://localhost:8000/docs`](http://localhost:8000/docs)
> ✅ **SQLite DB** (`curriculum.db`) is auto-created on first run — no migration needed.

#### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

> ✅ **Frontend** available at: [`http://localhost:5173`](http://localhost:5173)

---

### Option B — Docker Setup

```bash
# From project root
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

### Environment Variables Reference

Copy `.env.example` to `.env` (in both root and `backend/` if needed) and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | `sqlite:///./curriculum.db` (default, no setup needed) |
| `SECRET_KEY` | ✅ | Any long random string for JWT signing |
| `ALGORITHM` | ✅ | `HS256` (default) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ✅ | `1440` (24 hours) |
| `GEMINI_API_KEY` | ✅ | Get free key at [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `GOOGLE_CLIENT_ID` | ⚠️ Optional | For Google OAuth login |
| `GOOGLE_CLIENT_SECRET` | ⚠️ Optional | For Google OAuth login |
| `OPENAI_API_KEY` | ⚠️ Optional | Fallback AI provider |

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
