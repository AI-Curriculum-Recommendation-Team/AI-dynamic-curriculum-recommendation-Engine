"""
Seed initial data: career goals and assessment questions.
Run on application startup.
"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.student import CareerGoal, Assessment, AssessmentQuestion, Skill


CAREER_GOALS_DATA = [
    {
        "title": "AI Engineer",
        "description": "Build and deploy AI/ML systems, LLMs, and intelligent applications",
        "icon": "🤖",
        "required_skills": [
            {"skill": "Python", "level": 70},
            {"skill": "Machine Learning", "level": 70},
            {"skill": "Deep Learning", "level": 60},
            {"skill": "Natural Language Processing", "level": 60},
            {"skill": "Large Language Models", "level": 50},
            {"skill": "MLOps", "level": 40},
        ],
    },
    {
        "title": "Data Scientist",
        "description": "Analyze complex data and build predictive models for business insights",
        "icon": "📊",
        "required_skills": [
            {"skill": "Python", "level": 75},
            {"skill": "Statistics", "level": 75},
            {"skill": "Machine Learning", "level": 70},
            {"skill": "SQL", "level": 65},
            {"skill": "Data Visualization", "level": 60},
        ],
    },
    {
        "title": "Data Analyst",
        "description": "Extract insights from data using SQL, Excel, and visualization tools",
        "icon": "📈",
        "required_skills": [
            {"skill": "SQL", "level": 80},
            {"skill": "Excel", "level": 70},
            {"skill": "Python", "level": 60},
            {"skill": "Data Visualization", "level": 70},
            {"skill": "Tableau", "level": 65},
        ],
    },
    {
        "title": "Full Stack Developer",
        "description": "Build end-to-end web applications with modern frontend and backend tech",
        "icon": "💻",
        "required_skills": [
            {"skill": "JavaScript", "level": 80},
            {"skill": "React", "level": 70},
            {"skill": "Node.js", "level": 65},
            {"skill": "SQL", "level": 60},
            {"skill": "REST APIs", "level": 65},
        ],
    },
    {
        "title": "Cloud Engineer",
        "description": "Design and manage cloud infrastructure on AWS, GCP, or Azure",
        "icon": "☁️",
        "required_skills": [
            {"skill": "AWS", "level": 65},
            {"skill": "Linux", "level": 70},
            {"skill": "Docker", "level": 65},
            {"skill": "Kubernetes", "level": 55},
            {"skill": "DevOps", "level": 60},
        ],
    },
]


ASSESSMENT_QUESTIONS = {
    "AI Engineer": [
        {
            "skill": "Python",
            "question": "Which Python library is primarily used for numerical computations in ML?",
            "options": ["A. Pandas", "B. NumPy", "C. Matplotlib", "D. Requests"],
            "correct": "B. NumPy",
            "difficulty": "easy",
            "explanation": "NumPy provides efficient array operations and mathematical functions essential for ML.",
        },
        {
            "skill": "Python",
            "question": "What does the 'yield' keyword do in Python?",
            "options": ["A. Returns a value and exits", "B. Creates a generator function", "C. Imports a module", "D. Defines a class"],
            "correct": "B. Creates a generator function",
            "difficulty": "medium",
            "explanation": "yield creates a generator, enabling lazy evaluation of sequences.",
        },
        {
            "skill": "Machine Learning",
            "question": "What is overfitting in machine learning?",
            "options": [
                "A. Model performs well on training data but poorly on new data",
                "B. Model performs poorly on all data",
                "C. Model is too simple to capture patterns",
                "D. Model has too few parameters",
            ],
            "correct": "A. Model performs well on training data but poorly on new data",
            "difficulty": "easy",
            "explanation": "Overfitting happens when a model memorizes training data instead of learning general patterns.",
        },
        {
            "skill": "Machine Learning",
            "question": "Which algorithm is used for dimensionality reduction?",
            "options": ["A. Random Forest", "B. PCA (Principal Component Analysis)", "C. KNN", "D. SVM"],
            "correct": "B. PCA (Principal Component Analysis)",
            "difficulty": "medium",
            "explanation": "PCA reduces dimensionality by finding principal components that explain variance.",
        },
        {
            "skill": "Deep Learning",
            "question": "What activation function is commonly used in hidden layers of deep networks?",
            "options": ["A. Sigmoid", "B. Linear", "C. ReLU", "D. Step function"],
            "correct": "C. ReLU",
            "difficulty": "easy",
            "explanation": "ReLU (Rectified Linear Unit) avoids vanishing gradients and is computationally efficient.",
        },
        {
            "skill": "Deep Learning",
            "question": "What does 'backpropagation' compute in neural networks?",
            "options": [
                "A. Forward pass predictions",
                "B. Gradients for weight updates",
                "C. Data preprocessing",
                "D. Model evaluation metrics",
            ],
            "correct": "B. Gradients for weight updates",
            "difficulty": "medium",
            "explanation": "Backpropagation uses the chain rule to compute gradients, enabling gradient descent.",
        },
        {
            "skill": "Natural Language Processing",
            "question": "What does 'tokenization' mean in NLP?",
            "options": [
                "A. Converting text to numbers",
                "B. Splitting text into words or subwords",
                "C. Translating between languages",
                "D. Removing stopwords",
            ],
            "correct": "B. Splitting text into words or subwords",
            "difficulty": "easy",
            "explanation": "Tokenization breaks text into tokens (words, subwords, characters) for NLP processing.",
        },
        {
            "skill": "Natural Language Processing",
            "question": "What is the 'attention mechanism' in transformers?",
            "options": [
                "A. A way to focus on relevant parts of input when generating output",
                "B. A memory optimization technique",
                "C. A type of activation function",
                "D. A data augmentation method",
            ],
            "correct": "A. A way to focus on relevant parts of input when generating output",
            "difficulty": "hard",
            "explanation": "Attention allows models to weigh the importance of different tokens when processing sequences.",
        },
        {
            "skill": "Large Language Models",
            "question": "What does 'RAG' stand for in AI?",
            "options": [
                "A. Retrieval-Augmented Generation",
                "B. Random Attention Gradient",
                "C. Recursive Auto-Generation",
                "D. Reinforced Agent Guidance",
            ],
            "correct": "A. Retrieval-Augmented Generation",
            "difficulty": "medium",
            "explanation": "RAG enhances LLM responses by retrieving relevant documents from a knowledge base.",
        },
        {
            "skill": "MLOps",
            "question": "What is the purpose of model versioning in MLOps?",
            "options": [
                "A. To track and manage different versions of ML models",
                "B. To train models faster",
                "C. To reduce model size",
                "D. To improve prediction accuracy",
            ],
            "correct": "A. To track and manage different versions of ML models",
            "difficulty": "medium",
            "explanation": "Model versioning enables reproducibility, rollback, and A/B testing in production.",
        },
    ],
    "Data Scientist": [
        {"skill": "Python", "question": "Which Pandas method removes missing values?", "options": ["A. dropna()", "B. fillna()", "C. remove()", "D. clean()"], "correct": "A. dropna()", "difficulty": "easy", "explanation": "dropna() removes rows/columns with NaN values."},
        {"skill": "Statistics", "question": "What does p-value < 0.05 indicate in hypothesis testing?", "options": ["A. Reject the null hypothesis", "B. Accept the null hypothesis", "C. More data needed", "D. No conclusion possible"], "correct": "A. Reject the null hypothesis", "difficulty": "medium", "explanation": "p-value < 0.05 means the result is statistically significant at 95% confidence."},
        {"skill": "Machine Learning", "question": "What is cross-validation used for?", "options": ["A. Tuning hyperparameters and estimating model performance", "B. Data augmentation", "C. Feature extraction", "D. Model deployment"], "correct": "A. Tuning hyperparameters and estimating model performance", "difficulty": "medium", "explanation": "Cross-validation evaluates model performance on different subsets of training data."},
        {"skill": "SQL", "question": "Which SQL clause filters groups after GROUP BY?", "options": ["A. WHERE", "B. HAVING", "C. FILTER", "D. CONDITION"], "correct": "B. HAVING", "difficulty": "easy", "explanation": "HAVING filters aggregated results, WHERE filters individual rows before grouping."},
        {"skill": "Data Visualization", "question": "Which chart type is best for showing distribution of continuous data?", "options": ["A. Bar chart", "B. Histogram", "C. Pie chart", "D. Line chart"], "correct": "B. Histogram", "difficulty": "easy", "explanation": "Histograms show frequency distribution of continuous numerical data."},
    ],
    "Data Analyst": [
        {"skill": "SQL", "question": "What does a JOIN operation do in SQL?", "options": ["A. Combines rows from two or more tables", "B. Deletes duplicate rows", "C. Creates a new table", "D. Sorts the result set"], "correct": "A. Combines rows from two or more tables", "difficulty": "easy", "explanation": "JOIN merges data from multiple tables based on related columns."},
        {"skill": "SQL", "question": "Which SQL function counts non-NULL values?", "options": ["A. SUM()", "B. COUNT()", "C. TOTAL()", "D. ADD()"], "correct": "B. COUNT()", "difficulty": "easy", "explanation": "COUNT() counts the number of non-NULL values in a column."},
        {"skill": "Excel", "question": "What does VLOOKUP do in Excel?", "options": ["A. Searches for a value in the first column and returns a value in the same row from another column", "B. Adds values vertically", "C. Creates a pivot table", "D. Sorts a column"], "correct": "A. Searches for a value in the first column and returns a value in the same row from another column", "difficulty": "medium", "explanation": "VLOOKUP (Vertical Lookup) finds a value and retrieves related data from a table."},
        {"skill": "Data Visualization", "question": "Which visualization best shows trends over time?", "options": ["A. Pie chart", "B. Bar chart", "C. Line chart", "D. Scatter plot"], "correct": "C. Line chart", "difficulty": "easy", "explanation": "Line charts are ideal for displaying data trends and changes over time."},
        {"skill": "Python", "question": "Which Python library is best for data manipulation and analysis?", "options": ["A. NumPy", "B. Pandas", "C. Matplotlib", "D. Scikit-learn"], "correct": "B. Pandas", "difficulty": "easy", "explanation": "Pandas provides DataFrames and powerful data manipulation tools."},
    ],
    "Full Stack Developer": [
        {"skill": "JavaScript", "question": "What is a Promise in JavaScript?", "options": ["A. An object representing the eventual completion of an async operation", "B. A synchronous function", "C. A CSS property", "D. A database query"], "correct": "A. An object representing the eventual completion of an async operation", "difficulty": "medium", "explanation": "Promises handle asynchronous operations, replacing callbacks with cleaner syntax."},
        {"skill": "React", "question": "What hook manages component state in React functional components?", "options": ["A. useEffect", "B. useState", "C. useContext", "D. useRef"], "correct": "B. useState", "difficulty": "easy", "explanation": "useState allows functional components to have local state management."},
        {"skill": "React", "question": "What is the Virtual DOM in React?", "options": ["A. A lightweight copy of the real DOM used for efficient updates", "B. A database", "C. A CSS framework", "D. A server-side template"], "correct": "A. A lightweight copy of the real DOM used for efficient updates", "difficulty": "medium", "explanation": "React's Virtual DOM minimizes expensive real DOM manipulations for better performance."},
        {"skill": "Node.js", "question": "What is Express.js?", "options": ["A. A minimal web framework for Node.js", "B. A database ORM", "C. A frontend framework", "D. A testing library"], "correct": "A. A minimal web framework for Node.js", "difficulty": "easy", "explanation": "Express.js simplifies building web servers and REST APIs with Node.js."},
        {"skill": "SQL", "question": "What does ORM stand for in backend development?", "options": ["A. Object-Relational Mapping", "B. Open Resource Module", "C. Online Runtime Manager", "D. Object Reference Model"], "correct": "A. Object-Relational Mapping", "difficulty": "medium", "explanation": "ORM maps database tables to programming objects, abstracting SQL queries."},
    ],
    "Cloud Engineer": [
        {"skill": "AWS", "question": "What is AWS S3 primarily used for?", "options": ["A. Object/file storage", "B. Running virtual machines", "C. Database management", "D. DNS routing"], "correct": "A. Object/file storage", "difficulty": "easy", "explanation": "S3 (Simple Storage Service) stores and retrieves any amount of data as objects."},
        {"skill": "Linux", "question": "Which command shows running processes in Linux?", "options": ["A. ls -la", "B. ps aux", "C. cat /proc", "D. top only"], "correct": "B. ps aux", "difficulty": "easy", "explanation": "ps aux displays all running processes with user, CPU, and memory details."},
        {"skill": "Docker", "question": "What does a Dockerfile define?", "options": ["A. Instructions to build a Docker image", "B. Network configuration", "C. Database schema", "D. Kubernetes cluster"], "correct": "A. Instructions to build a Docker image", "difficulty": "easy", "explanation": "A Dockerfile contains step-by-step commands to assemble a container image."},
        {"skill": "Kubernetes", "question": "What is a Kubernetes Pod?", "options": ["A. The smallest deployable unit that can contain one or more containers", "B. A cluster node", "C. A load balancer", "D. A storage volume"], "correct": "A. The smallest deployable unit that can contain one or more containers", "difficulty": "medium", "explanation": "Pods are the atomic deployment units in Kubernetes, typically running one container."},
        {"skill": "DevOps", "question": "What is CI/CD?", "options": ["A. Continuous Integration and Continuous Delivery/Deployment", "B. Code Integration and Code Deployment", "C. Container Infrastructure and Container Delivery", "D. Centralized Integration and Central Deployment"], "correct": "A. Continuous Integration and Continuous Delivery/Deployment", "difficulty": "easy", "explanation": "CI/CD automates building, testing, and deploying code changes to production."},
    ],
}


def seed_initial_data():
    """Seed career goals and assessments if they don't already exist."""
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        if db.query(CareerGoal).count() > 0:
            return

        print("[SEED] Seeding initial data...")

        for career_data in CAREER_GOALS_DATA:
            career = CareerGoal(
                title=career_data["title"],
                description=career_data["description"],
                icon=career_data["icon"],
                required_skills=career_data["required_skills"],
            )
            db.add(career)
            db.flush()

            # Create assessment for this career
            assessment = Assessment(
                career_goal_id=career.id,
                title=f"{career_data['title']} Skill Assessment",
            )
            db.add(assessment)
            db.flush()

            # Add questions
            questions = ASSESSMENT_QUESTIONS.get(career_data["title"], [])
            for q_data in questions:
                # Get or create skill
                skill = db.query(Skill).filter(Skill.name == q_data["skill"]).first()
                if not skill:
                    skill = Skill(
                        name=q_data["skill"],
                        category=career_data["title"],
                        description=f"Core skill for {career_data['title']}",
                    )
                    db.add(skill)
                    db.flush()

                question = AssessmentQuestion(
                    assessment_id=assessment.id,
                    skill_id=skill.id,
                    question_text=q_data["question"],
                    options=q_data["options"],
                    correct_answer=q_data["correct"],
                    difficulty=q_data["difficulty"],
                    explanation=q_data.get("explanation", ""),
                )
                db.add(question)

        db.commit()
        print("[SEED] Initial seed data created successfully!")
    except Exception as e:
        db.rollback()
        print(f"[SEED] Seeding failed: {e}")
    finally:
        db.close()
