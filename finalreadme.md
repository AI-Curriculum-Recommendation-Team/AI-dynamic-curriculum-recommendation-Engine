<div align="center">

<h1>🎓 AI-Driven Dynamic Curriculum Recommendation Engine</h1>

<p>
  <img src="https://img.shields.io/badge/Domain-Generative%20AI%20%26%20Multi--Agent%20Systems-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Type-Academic%20Mini%20Project-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Active%20Development-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Team-3%20Members-green?style=for-the-badge" />
</p>

<p>
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python" />
  <img src="https://img.shields.io/badge/Gemini%20API-Integrated-4285F4?style=flat-square&logo=google" />
  <img src="https://img.shields.io/badge/LangGraph-Multi--Agent-FF6B35?style=flat-square" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker" />
</p>

<br/>

> **A full-stack, AI-powered intelligent learning platform that uses multi-agent orchestration, RAG, and Generative AI to deliver personalized, skill-gap-driven, career-oriented curricula for individual students.**

</div>

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Project Vision and Development Stages](#4-project-vision-and-development-stages)
5. [Core Feature Set](#5-core-feature-set)
6. [Complete User Workflow](#6-complete-user-workflow)
7. [High-Level System Architecture](#7-high-level-system-architecture)
8. [Multi-Agent AI Architecture](#8-multi-agent-ai-architecture)
9. [Technology Stack](#9-technology-stack)
10. [Database Design](#10-database-design)
11. [API Structure](#11-api-structure)
12. [Project Directory Structure](#12-project-directory-structure)
13. [Development Stages and Team Responsibilities](#13-development-stages-and-team-responsibilities)
14. [AI Prompt Engineering](#14-ai-prompt-engineering)
15. [Testing Strategy](#15-testing-strategy)
16. [Personalization Test Cases](#16-personalization-test-cases)
17. [Security Guidelines](#17-security-guidelines)
18. [Project Deliverables](#18-project-deliverables)
19. [Getting Started](#19-getting-started)
20. [Team](#20-team)
21. [Conclusion](#21-conclusion)

---

## 1. Project Overview

The **AI-Driven Dynamic Curriculum Recommendation Engine** is an intelligent web-based learning platform that generates **personalized learning paths** for students based on their:

- Current skill levels and self-assessment
- Career goals and target roles
- Assessment performance and knowledge gaps
- Learning progress and adaptive feedback

Traditional platforms provide the **same course sequence** to every learner. This project solves that by using **Generative AI and a Multi-Agent System** to analyze each student's unique profile, detect skill gaps, dynamically generate a tailored curriculum, provide AI tutoring, and offer career coaching — all powered by intelligent agents working together.

The system is built **stage by stage** by a 3-member team, with each stage adding a new layer of intelligence until the final multi-agent AI ecosystem is complete.

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
| 🤖 **AI Tutoring** | Can I get instant, personalized answers to my questions? |
| 💼 **Career Readiness** | Am I ready for placement? What do recruiters expect? |
| 🧠 **Collaborative AI** | Can multiple AI agents work together to guide my full learning journey? |

> Most conventional learning systems follow **predefined course structures** and do not dynamically generate a curriculum, offer AI tutoring, or provide placement readiness guidance for each individual learner.

There is a need for an intelligent system that can analyze student-specific information and deliver a **personalized, adaptive, career-oriented, AI-tutored learning ecosystem**.

---

## 3. Proposed Solution

The system collects student data, analyzes it using a multi-agent AI pipeline, and produces a fully personalized, continuously evolving curriculum.

```mermaid
flowchart LR
    subgraph INPUT["Student Input"]
        A1[Student Profile]
        A2[Career Goal]
        A3[Existing Skills and Levels]
        A4[Assessment Scores]
        A5[Learning Preferences]
        A6[Resume and Documents]
    end

    subgraph ENGINE["Multi-Agent AI Processing"]
        B1[Skill Assessment Agent]
        B2[Curriculum Agent]
        B3[AI Tutor Agent]
        B4[Career Coach Agent]
        B5[Orchestrator Agent]
    end

    subgraph OUTPUT["Personalized Output"]
        C1[Skill Gap Analysis]
        C2[Weekly Curriculum]
        C3[Adaptive Quizzes]
        C4[AI Chat Tutor]
        C5[Career Roadmap]
        C6[Progress Tracker]
        C7[Interview Prep]
        C8[Placement Score]
    end

    INPUT --> ENGINE
    ENGINE --> OUTPUT
```

---

## 4. Project Vision and Development Stages

The project is built **incrementally by the team through 5 stages**, each stage adding a new layer of AI capability. All stages together form the complete platform.

```mermaid
flowchart TD
    S1["Stage 1 — Core Foundation
    Authentication · Student Profile
    Career Goal · Skill Assessment
    Skill Gap Analysis · AI Curriculum
    Learning Roadmap · Progress Tracking"]

    S2["Stage 2 — Adaptive Learning
    AI-Generated Quizzes · Difficulty Adjustment
    Dynamic Curriculum Updates
    Weekly AI Reports · Notifications"]

    S3["Stage 3 — AI Tutor and RAG
    Chat Tutor · PDF Upload and Analysis
    Vector Database · Semantic Search
    Flashcards · Q and A System"]

    S4["Stage 4 — AI Career Coach
    Resume Analysis · Interview Preparation
    Mock Interviews · Coding Challenges
    Company-Specific Learning Paths"]

    S5["Stage 5 — Multi-Agent Platform
    Orchestrator Agent · Voice Assistant
    Learning Analytics · Placement Score
    Faculty Dashboard · Full Ecosystem"]

    S1 --> S2 --> S3 --> S4 --> S5
```

### Stage Summary Table

| Stage | Core Capability | Key Additions |
|-------|----------------|---------------|
| **Stage 1** | Personalized Curriculum Engine | Auth, Profile, Career Goal, Assessment, Skill Gap, AI Curriculum, Roadmap, Progress |
| **Stage 2** | Adaptive and Self-Improving Curriculum | AI Quizzes, Difficulty Adjustment, Dynamic Updates, Weekly Reports |
| **Stage 3** | AI Tutor with Knowledge Retrieval | Chat Tutor, RAG, PDF Upload, Flashcards, Vector DB |
| **Stage 4** | AI Career and Placement Coach | Resume Analysis, Interview Prep, Mock Interviews, Coding Challenges |
| **Stage 5** | Multi-Agent AI Ecosystem | Orchestrator, Voice Assistant, Analytics, Placement Score, Faculty Dashboard |

---

## 5. Core Feature Set

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

Supported career paths:

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
    A[Student Existing Skills] --> D{Skill Gap Analyzer}
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
| Week 6 | Large Language Models |

### 5.7 Adaptive Learning System

```mermaid
flowchart TD
    A[Student Studies Topic] --> B[Takes AI-Generated Quiz]
    B --> C{Score Check}
    C -->|High above 80 percent| D[Advance to Next Topic]
    C -->|Low below 60 percent| E[AI Identifies Weakness]
    E --> F[Add Extra Practice Resources]
    F --> G[Curriculum Updated Dynamically]
    G --> B
    D --> H[Weekly AI Progress Report]
    H --> I[Smart Notifications]
```

### 5.8 AI Tutor and RAG System

```mermaid
flowchart LR
    Q[Student Question] --> TUTOR[AI Chat Tutor]
    TUTOR --> RETRIEVER[Retriever Module]
    RETRIEVER --> VECTOR_DB["Vector Database ChromaDB or FAISS"]
    VECTOR_DB --> DOCS[Relevant Knowledge Chunks]
    DOCS --> LLM[LLM Processing]
    LLM --> ANS[Accurate Grounded Answer]
```

Features: Chat tutor · PDF document upload · Notes summarization · Q and A · Flashcards · Semantic search

### 5.9 AI Career Coach

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

Features: Resume analysis · Missing skill identification · Interview preparation · Mock interviews · Coding challenges · Company-specific paths

### 5.10 Progress Tracking

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
    REG["Registration - Create account with name email password"]
    LOGIN["Login - JWT Authentication"]
    PROFILE["Student Profile - Education Skills Skill Levels Preferences"]
    CAREER["Career Goal Selection - AI Engineer Data Scientist Full Stack Cloud Engineer"]
    ASSESS["Skill Assessment - Take AI-generated multi-topic quiz"]
    RESULTS["Assessment Results - Per-topic scores strengths and weaknesses"]
    GAP["Skill Gap Analysis - Compare skills vs career requirements"]
    AI["Multi-Agent AI Engine - Orchestrator coordinates specialized agents"]
    CURRICULUM["Personalized Curriculum - Weekly topics sequences learning priorities"]
    ROADMAP["Learning Roadmap - Visual step-by-step learning path"]
    TUTOR["AI Chat Tutor - RAG-powered answers PDF upload flashcards"]
    RESOURCES["Learning Resources - Curated videos docs exercises projects"]
    CAREER_COACH["AI Career Coach - Resume analysis Interview prep mock interviews"]
    PROGRESS["Progress Tracking - Mark topics Not Started to In Progress to Completed"]
    PLACEMENT["Placement Readiness Score - Analytics Dashboard Voice Assistant"]
    DONE([Skill Achieved and Career Ready])

    REG --> LOGIN --> PROFILE --> CAREER --> ASSESS --> RESULTS --> GAP --> AI --> CURRICULUM --> ROADMAP --> RESOURCES --> TUTOR --> CAREER_COACH --> PROGRESS --> PLACEMENT --> DONE
    PROGRESS -->|Skills Updated Re-assess| ASSESS
```

---

## 7. High-Level System Architecture

```mermaid
flowchart TD
    subgraph CLIENT["Client Layer"]
        STUDENT[Student Browser]
        REACT["React plus TypeScript - Tailwind CSS React Router"]
    end

    subgraph API["API Layer"]
        FASTAPI["FastAPI Backend Python"]
        AUTH["Auth Service - JWT Password Hashing"]
        PROFILE_SVC["Profile Service"]
        ASSESS_SVC["Assessment Service"]
        RECOMMEND_SVC["Recommendation Service"]
        PROGRESS_SVC["Progress Service"]
        TUTOR_SVC["AI Tutor Service"]
        CAREER_SVC["Career Coach Service"]
    end

    subgraph AI_LAYER["Multi-Agent AI Layer"]
        ORCHESTRATOR["Orchestrator Agent LangGraph"]
        SKILL_AGENT["Skill Assessment Agent"]
        CURRICULUM_AGENT["Curriculum Agent"]
        TUTOR_AGENT["AI Tutor Agent"]
        CAREER_AGENT["Career Coach Agent"]
        RESOURCE_AGENT["Resource Agent"]
        PROGRESS_AGENT["Progress Monitor Agent"]
        LLM["Gemini API or OpenAI API"]
        RAG["RAG Engine LangChain"]
        VECTOR_DB["Vector DB ChromaDB or FAISS"]
    end

    subgraph DATA["Data Layer"]
        PG[("PostgreSQL Database")]
    end

    STUDENT --> REACT --> FASTAPI
    FASTAPI --> AUTH & PROFILE_SVC & ASSESS_SVC & RECOMMEND_SVC & PROGRESS_SVC & TUTOR_SVC & CAREER_SVC
    AUTH & PROFILE_SVC & ASSESS_SVC & PROGRESS_SVC --> PG
    RECOMMEND_SVC & TUTOR_SVC & CAREER_SVC --> ORCHESTRATOR
    ORCHESTRATOR --> SKILL_AGENT & CURRICULUM_AGENT & TUTOR_AGENT & CAREER_AGENT & RESOURCE_AGENT & PROGRESS_AGENT
    SKILL_AGENT & CURRICULUM_AGENT & TUTOR_AGENT & CAREER_AGENT & RESOURCE_AGENT & PROGRESS_AGENT --> LLM
    TUTOR_AGENT --> RAG --> VECTOR_DB
    ORCHESTRATOR --> REACT
```

---

## 8. Multi-Agent AI Architecture

```mermaid
flowchart TD
    ORCHESTRATOR["Orchestrator Agent - LangGraph Workflow Engine - Coordinates all agents"]
    ORCHESTRATOR --> SA & CA & RA & PMA & TA & CCA & IA & VA

    SA["Skill Assessment Agent - Evaluates student abilities - Generates adaptive quizzes"]
    CA["Curriculum Agent - Generates personalized learning paths - Dynamic curriculum updates"]
    RA["Resource Agent - Recommends curated materials - Maps resources to topics"]
    PMA["Progress Monitor Agent - Tracks topic completion - Weekly progress reports"]
    TA["AI Tutor Agent - Answers student questions - RAG-powered responses"]
    CCA["Career Coach Agent - Resume analysis - Career path guidance"]
    IA["Interview Agent - Mock interview simulations - Coding challenge assessment"]
    VA["Voice Assistant Agent - Voice-based learning - Spoken curriculum delivery"]

    SA & CA & RA & PMA & TA & CCA & IA & VA --> STUDENT[Student Dashboard]
```

### Agent Responsibilities

| Agent | Responsibility | Technology |
|-------|---------------|------------|
| **Orchestrator** | Coordinates all agents, manages workflow state | LangGraph |
| **Skill Assessment** | Evaluates student skills, generates quizzes | Gemini API |
| **Curriculum** | Generates and dynamically updates learning paths | Gemini API + Prompt Engineering |
| **Resource** | Recommends videos, docs, exercises per topic | Gemini API + Curated DB |
| **Progress Monitor** | Tracks completion, sends weekly reports | LangChain + PostgreSQL |
| **AI Tutor** | Answers questions using student's own materials | RAG + LangChain + ChromaDB |
| **Career Coach** | Analyses resume, identifies gaps, guides career | Gemini API + PDF Processing |
| **Interview** | Conducts mock interviews, scores coding challenges | LLM + Code Execution |
| **Voice Assistant** | Delivers curriculum via voice interaction | Speech APIs + LLM |

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
| **passlib** | Latest | Password hashing with bcrypt |

### 9.3 Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| **PostgreSQL** | 15+ | Primary relational database |
| **ChromaDB or FAISS** | Latest | Vector database for RAG semantic search |

### 9.4 AI and Multi-Agent

| Technology | Purpose |
|-----------|---------|
| **Gemini API** | Primary LLM for all AI features |
| **OpenAI API** | Alternative LLM provider |
| **LangChain** | LLM application framework and RAG pipeline |
| **LangGraph** | Multi-agent workflow orchestration |
| **RAG** | Knowledge-grounded AI tutor responses |
| **Prompt Engineering** | Structured AI output design |

### 9.5 DevOps and Deployment

| Technology | Purpose |
|-----------|---------|
| **Git** | Version control |
| **GitHub** | Collaboration, code review, project management |
| **Docker** | Containerization |
| **Docker Compose** | Multi-service local development |
| **GitHub Actions** | CI/CD pipeline |
| **Vercel** | Frontend deployment |
| **Render or Railway** | Backend deployment |

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
        string difficulty
    }
    PROGRESS {
        int id PK
        int student_id FK
        int curriculum_week_id FK
        string status
        datetime updated_at
    }
    DOCUMENTS {
        int id PK
        int student_id FK
        string filename
        string file_path
        string doc_type
        datetime uploaded_at
    }
    VECTOR_CHUNKS {
        int id PK
        int document_id FK
        string chunk_text
        string embedding_id
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
    STUDENTS ||--o{ DOCUMENTS : "uploads"
    DOCUMENTS ||--o{ VECTOR_CHUNKS : "split into"
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
| `documents` | Student-uploaded PDFs and learning materials |
| `vector_chunks` | Chunked document text for RAG retrieval |

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
| `POST` | `/api/v1/students/skills` | Add or update student skills |

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
| `GET` | `/api/v1/assessments/adaptive/{week_id}` | Get adaptive quiz for a topic |

### Curriculum and Roadmap Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/curriculum/generate` | Trigger AI curriculum generation |
| `GET` | `/api/v1/curriculum/my` | Get student current curriculum |
| `GET` | `/api/v1/curriculum/roadmap` | Get visual roadmap data |
| `GET` | `/api/v1/curriculum/resources` | Get recommended resources |
| `PUT` | `/api/v1/curriculum/update` | Trigger dynamic curriculum update |

### AI Tutor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/tutor/chat` | Send message to AI tutor |
| `POST` | `/api/v1/tutor/upload` | Upload PDF or document for RAG |
| `GET` | `/api/v1/tutor/flashcards` | Get AI-generated flashcards |
| `GET` | `/api/v1/tutor/history` | Get chat history |

### Career Coach Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/career/resume` | Upload and analyse resume |
| `GET` | `/api/v1/career/gaps` | Get career skill gaps |
| `POST` | `/api/v1/career/interview/start` | Start mock interview session |
| `POST` | `/api/v1/career/interview/submit` | Submit interview answer |
| `GET` | `/api/v1/career/placement-score` | Get placement readiness score |

### Progress Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/progress` | Get all topic statuses |
| `PUT` | `/api/v1/progress/{week_id}` | Update topic status |
| `GET` | `/api/v1/progress/summary` | Get overall progress summary |
| `GET` | `/api/v1/progress/analytics` | Get full learning analytics |

---

## 12. Project Directory Structure

```
ai-curriculum-engine/
|
+-- frontend/
|   +-- public/
|   +-- src/
|   |   +-- components/
|   |   |   +-- Auth/
|   |   |   +-- Profile/
|   |   |   +-- Assessment/
|   |   |   +-- Roadmap/
|   |   |   +-- Tutor/
|   |   |   +-- Career/
|   |   |   +-- Progress/
|   |   +-- pages/
|   |   |   +-- RegisterPage.tsx
|   |   |   +-- LoginPage.tsx
|   |   |   +-- ProfilePage.tsx
|   |   |   +-- CareerGoalPage.tsx
|   |   |   +-- AssessmentPage.tsx
|   |   |   +-- ResultsPage.tsx
|   |   |   +-- CurriculumPage.tsx
|   |   |   +-- RoadmapPage.tsx
|   |   |   +-- TutorPage.tsx
|   |   |   +-- CareerCoachPage.tsx
|   |   |   +-- AnalyticsPage.tsx
|   |   |   +-- ProgressPage.tsx
|   |   +-- hooks/
|   |   +-- services/
|   |   +-- store/
|   |   +-- types/
|   |   +-- utils/
|   |   +-- App.tsx
|   |   +-- main.tsx
|   +-- package.json
|   +-- tsconfig.json
|   +-- tailwind.config.js
|
+-- backend/
|   +-- app/
|   |   +-- api/v1/
|   |   |   +-- auth.py
|   |   |   +-- students.py
|   |   |   +-- careers.py
|   |   |   +-- assessments.py
|   |   |   +-- curriculum.py
|   |   |   +-- tutor.py
|   |   |   +-- career_coach.py
|   |   |   +-- progress.py
|   |   +-- core/
|   |   |   +-- config.py
|   |   |   +-- security.py
|   |   |   +-- database.py
|   |   +-- models/
|   |   |   +-- user.py
|   |   |   +-- student.py
|   |   |   +-- skill.py
|   |   |   +-- assessment.py
|   |   |   +-- curriculum.py
|   |   |   +-- document.py
|   |   |   +-- progress.py
|   |   +-- schemas/
|   |   +-- services/
|   |   |   +-- auth_service.py
|   |   |   +-- profile_service.py
|   |   |   +-- assessment_service.py
|   |   |   +-- curriculum_service.py
|   |   |   +-- tutor_service.py
|   |   |   +-- career_service.py
|   |   |   +-- progress_service.py
|   |   +-- ai/
|   |   |   +-- orchestrator/
|   |   |   |   +-- graph.py
|   |   |   |   +-- state.py
|   |   |   +-- agents/
|   |   |   |   +-- skill_assessment_agent.py
|   |   |   |   +-- curriculum_agent.py
|   |   |   |   +-- resource_agent.py
|   |   |   |   +-- tutor_agent.py
|   |   |   |   +-- career_coach_agent.py
|   |   |   |   +-- interview_agent.py
|   |   |   |   +-- progress_monitor_agent.py
|   |   |   +-- rag/
|   |   |   |   +-- document_loader.py
|   |   |   |   +-- chunker.py
|   |   |   |   +-- embedder.py
|   |   |   |   +-- retriever.py
|   |   |   +-- skill_gap_analyzer.py
|   |   |   +-- prompt_builder.py
|   |   |   +-- llm_client.py
|   |   +-- main.py
|   +-- alembic/
|   +-- requirements.txt
|   +-- .env.example
|
+-- docs/
+-- tests/
+-- docker-compose.yml
+-- Dockerfile.backend
+-- Dockerfile.frontend
+-- .github/workflows/ci.yml
+-- .gitignore
+-- .env.example
+-- README.md
```

---

## 13. Development Stages and Team Responsibilities

```mermaid
flowchart LR
    S1["Stage 1
    Core Foundation
    Auth Profile
    Assessment Roadmap"] --> S2
    S2["Stage 2
    Adaptive Learning
    AI Quizzes
    Dynamic Updates"] --> S3
    S3["Stage 3
    AI Tutor and RAG
    Chat PDF Upload
    Vector DB"] --> S4
    S4["Stage 4
    Career Coach
    Resume Analysis
    Interview Prep"] --> S5
    S5["Stage 5
    Multi-Agent Platform
    Orchestrator Analytics
    Voice Placement Score"]
```

### Stage Breakdown and Team Allocation

| Stage | Focus | Member 1 Backend | Member 2 Frontend | Member 3 AI Engineer |
|-------|-------|------------------|-------------------|----------------------|
| **Stage 1** | Core Foundation | FastAPI setup, DB models, Auth APIs, Profile and Assessment endpoints | React setup, Auth pages, Profile UI, Assessment UI, Roadmap display | Skill gap analyzer, Gemini API integration, Curriculum generator, Prompt engineering |
| **Stage 2** | Adaptive Learning | Adaptive quiz endpoints, Dynamic curriculum update API, Notification service | Quiz UI, Dynamic roadmap updates, Progress dashboard, Weekly report UI | Adaptive AI logic, Difficulty adjustment algorithm, AI weekly report generator |
| **Stage 3** | AI Tutor and RAG | Document upload API, Vector DB setup with ChromaDB, Tutor chat API, Flashcard API | Chat tutor UI, File upload UI, Flashcard viewer, History display | RAG pipeline with LangChain and ChromaDB, Document chunker and embedder, Retriever module |
| **Stage 4** | AI Career Coach | Resume parsing API, Career gap API, Interview session API, Coding challenge API | Resume upload UI, Career gap view, Mock interview UI, Coding challenge UI | Resume analyser agent, Career coach agent, Interview agent, LLM-based scoring |
| **Stage 5** | Multi-Agent Platform | LangGraph orchestration setup, Analytics API, Placement score API, Faculty dashboard API | Analytics dashboard UI, Voice assistant UI, Placement score display, Faculty dashboard | Orchestrator agent with LangGraph, Voice assistant integration, Multi-agent state management, Full agent coordination |

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
1. Identify the student strong skills (score >= 70%)
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
    }
  ],
  "total_weeks": 6
}
```

### 14.3 AI Tutor RAG Prompt Template

```
You are a personalized AI tutor. Use the retrieved knowledge chunks below
to answer the student question accurately and simply.

== RETRIEVED CONTEXT ==
{retrieved_chunks}

== STUDENT QUESTION ==
{student_question}

== INSTRUCTIONS ==
Answer the question using only the context provided.
If the answer is not in the context, say you do not have enough information on this.
Keep the answer clear and beginner-friendly.
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
    A --> G[Tutor Tests]
    A --> H[Career Coach Tests]
    B --> I[Register Login JWT Validation]
    C --> J[Create Read Update Profile]
    D --> K[Submit Assessment Calculate Scores]
    E --> L[AI Trigger Curriculum Validation]
    F --> M[Status Update Progress Summary]
    G --> N[Chat RAG Retrieval Flashcards]
    H --> O[Resume Parse Interview Session]
```

#### Backend Test Checklist

- [ ] User registration with valid and duplicate email
- [ ] User login with valid and invalid credentials
- [ ] JWT token validation and expiry
- [ ] Profile create and update
- [ ] Career goal assignment
- [ ] Assessment submission and scoring
- [ ] Adaptive quiz difficulty adjustment
- [ ] Skill gap calculation correctness
- [ ] AI curriculum generation with mock LLM
- [ ] Dynamic curriculum update trigger
- [ ] Document upload and chunking
- [ ] RAG retrieval accuracy
- [ ] AI tutor chat responses
- [ ] Resume parsing and skill extraction
- [ ] Career gap identification
- [ ] Mock interview session flow
- [ ] Multi-agent orchestrator workflow
- [ ] Progress status updates
- [ ] Analytics and placement score
- [ ] Protected route enforcement

### 15.2 Frontend Testing

| Area | Tests |
|------|-------|
| Form Validation | Registration, login, profile, assessment forms |
| Navigation | Route protection, redirects, page loads |
| Assessment UI | Question rendering, answer selection, submission |
| Dashboard | Curriculum display, roadmap rendering |
| Tutor Chat | Message send, response display, file upload |
| Career Coach | Resume upload, interview flow |
| Analytics | Progress charts, placement score display |
| API Error Handling | Network errors, 401 403 500 responses |

### 15.3 AI and LLM Evaluation

| Evaluation Criteria | Description |
|--------------------|-------------|
| Skill Gap Accuracy | Does the AI correctly identify missing skills? |
| Curriculum Relevance | Are generated topics appropriate for the career goal? |
| Personalization | Do different student profiles yield different curricula? |
| Adaptive Accuracy | Does difficulty adjust correctly after quiz scores? |
| RAG Grounding | Does the tutor answer only from retrieved context? |
| Resume Analysis | Are skill gaps from resume accurately identified? |
| Structured Output | Is the JSON output valid and consistently formatted? |
| Agent Coordination | Do agents hand off tasks correctly to each other? |

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
    H --> I[Chat with AI Tutor]
    I --> J[Upload PDF]
    J --> K[Career Coach Review]
    K --> L[Mock Interview]
    L --> M[Mark Progress]
    M --> N[View Analytics]
    N --> O[Full Flow Verified]
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

    SA["Student A - Python 90 SQL 75 ML 30 DL 20"]
    SB["Student B - Python 40 SQL 30 ML 20 DL 10"]
    SC["Student C - Python 90 SQL 90 ML 85 DL 80"]

    SA --> OA["Focus: ML then DL then NLP then LLMs - Skip Python basics"]
    SB --> OB["Focus: Python then SQL then Statistics then ML - Start from foundations"]
    SC --> OC["Focus: Advanced ML then LLMs then RAG then MLOps - Skip to advanced topics"]
```

---

## 17. Security Guidelines

### 17.1 Authentication and Authorization

- ✅ **Never store plain-text passwords** — use bcrypt hashing
- ✅ **JWT tokens** for stateless authentication
- ✅ **Protected API routes** require valid Bearer token
- ✅ **Role-based access** for student, admin, and faculty roles

### 17.2 Data Security

- ✅ **Environment Variables** — store all secrets in `.env` (never hard-code)
- ✅ **Never commit `.env`** files to Git (add to `.gitignore`)
- ✅ **Input validation** — use Pydantic schemas on all API inputs
- ✅ **SQL injection prevention** — use SQLAlchemy ORM (no raw SQL)
- ✅ **File upload validation** — restrict file types and sizes for document uploads
- ✅ **HTTPS** — enforce in production

### 17.3 .env.example Template

```env
DATABASE_URL=postgresql://user:password@localhost:5432/curriculum_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
CHROMA_DB_PATH=./chroma_store
APP_ENV=development
DEBUG=true
```

---

## 18. Project Deliverables

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
    D9["9 - Adaptive Quiz After Topic"] --> D10
    D10["10 - AI Chat Tutor with RAG"] --> D11
    D11["11 - PDF Upload and Q and A"] --> D12
    D12["12 - Resume Analysis and Career Coach"] --> D13
    D13["13 - Mock Interview Session"] --> D14
    D14["14 - Progress Tracking and Analytics"] --> D15
    D15["15 - Placement Readiness Score"]
    D15 --> KEY["Key Demo: Student A and Student B with same career goal receive DIFFERENT personalized curricula via Multi-Agent AI Orchestration"]
```

### Deliverables Checklist

| No | Deliverable | Stage |
|----|-------------|-------|
| 1 | Working React and TypeScript frontend | Stage 1 |
| 2 | FastAPI backend with all endpoints | Stage 1 |
| 3 | PostgreSQL database with full schema | Stage 1 |
| 4 | User authentication with register, login, and JWT | Stage 1 |
| 5 | Student profile module | Stage 1 |
| 6 | Career goal selection module | Stage 1 |
| 7 | Skill assessment module | Stage 1 |
| 8 | Skill gap analysis engine | Stage 1 |
| 9 | LLM integration with Gemini API | Stage 1 |
| 10 | Personalized curriculum generator | Stage 1 |
| 11 | Visual learning roadmap | Stage 1 |
| 12 | Resource recommendation | Stage 1 |
| 13 | Progress tracking | Stage 1 |
| 14 | Adaptive AI quizzes | Stage 2 |
| 15 | Dynamic curriculum update | Stage 2 |
| 16 | Weekly AI progress report | Stage 2 |
| 17 | AI chat tutor with RAG | Stage 3 |
| 18 | PDF upload and document Q and A | Stage 3 |
| 19 | Flashcard generator | Stage 3 |
| 20 | Vector database with ChromaDB | Stage 3 |
| 21 | Resume analysis module | Stage 4 |
| 22 | Mock interview simulator | Stage 4 |
| 23 | Coding challenge module | Stage 4 |
| 24 | Multi-agent orchestrator with LangGraph | Stage 5 |
| 25 | Learning analytics dashboard | Stage 5 |
| 26 | Placement readiness score | Stage 5 |
| 27 | API documentation via FastAPI auto-docs | All Stages |
| 28 | GitHub repository with full history | All Stages |
| 29 | Project README and documentation | All Stages |
| 30 | Final presentation slides | All Stages |
| 31 | Live project demonstration | All Stages |

---

## 19. Getting Started

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
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

> API docs available at: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> Frontend available at: `http://localhost:5173`

### 4. Docker Setup (Recommended)

```bash
docker-compose up --build
```

### 5. Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `OPENAI_API_KEY` | OpenAI API key (optional fallback) |
| `CHROMA_DB_PATH` | Path for ChromaDB vector store |

---

## 20. Team

> 🎓 Semester Mini Project — 3-Member Team

| Member | Role | Stage Responsibilities |
|--------|------|----------------------|
| **Member 1** | Backend Developer | FastAPI · PostgreSQL · Auth · REST APIs · LangGraph Orchestration Setup |
| **Member 2** | Frontend Developer | React · TypeScript · UI/UX · Routing · Analytics Dashboard |
| **Member 3** | AI Engineer | LLM Integration · Skill Gap · Curriculum Generator · RAG Pipeline · Multi-Agent Design |

---

## 21. Conclusion

The **AI-Driven Dynamic Curriculum Recommendation Engine** is a complete, end-to-end intelligent learning ecosystem that moves beyond static learning paths. Using **Generative AI, RAG, and a Multi-Agent Architecture**, the platform understands individual learners and delivers personalized, adaptive, and career-ready education.

```mermaid
flowchart LR
    S[Student] --> A[Assessment]
    A --> G[Skill Gap]
    G --> AI[Multi-Agent AI]
    AI --> C[Personalized Curriculum]
    C --> T[AI Tutor]
    T --> CAREER[Career Coach]
    CAREER --> P[Progress and Analytics]
    P --> PLACEMENT[Placement Ready]
    P -->|Skill Updated Re-assess| A
```

The project is built in **5 stages** by a 3-member team — from a core personalized curriculum engine all the way to a full multi-agent AI learning ecosystem with voice assistant, analytics, placement readiness score, and agent orchestration.

> **The goal:** An intelligent learning ecosystem where the curriculum continuously evolves with the learner, guided by a team of specialized AI agents working in concert.

---

<div align="center">

**Built with dedication as a Semester Mini Project**

*Star this repo if you find it helpful!*

</div>
