"""
Seed courses and lectures with YouTube video IDs.
Run: python -m app.utils.seed_courses
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models.course import Course, Lecture
from app.models.learning import LearningPath

# Import to ensure tables are created
from app.api.endpoints.documentation import DocArticle
from app.api.endpoints.devops import Pipeline


def seed_courses():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(Course).first():
            print("Courses already exist. Skipping.")
            return

        # Get learning paths
        paths = {p.dev_role: p for p in db.query(LearningPath).all()}

        # ============================================================
        # BACKEND DEVELOPER PATH
        # ============================================================
        backend_path_id = paths.get("backend", None)
        bp_id = backend_path_id.id if backend_path_id else None

        c1 = Course(title="FastAPI Fundamentals", description="Build RESTful APIs with Python's fastest framework. Learn endpoints, request handling, validation, and auto-documentation.", learning_path_id=bp_id, order=1)
        c2 = Course(title="Database & SQLAlchemy", description="Master PostgreSQL with SQLAlchemy ORM. Design schemas, write queries, handle migrations.", learning_path_id=bp_id, order=2)
        c3 = Course(title="Authentication & Security", description="Implement JWT auth, password hashing, OAuth2, and role-based access control.", learning_path_id=bp_id, order=3)

        db.add_all([c1, c2, c3])
        db.flush()

        # FastAPI Fundamentals lectures
        db.add_all([
            Lecture(title="What is FastAPI & Why Use It", description="Introduction to FastAPI, comparison with Flask/Django, and when to use it.", youtube_id="SORiTsvnU28", duration_minutes=15, order=1, course_id=c1.id, content="# What is FastAPI?\n\nFastAPI is a modern, fast web framework for building APIs with Python 3.7+.\n\n## Key Features\n- Automatic API docs (Swagger UI)\n- Type hints for validation\n- Async support built-in\n- Fastest Python framework"),
            Lecture(title="Setting Up Your First API", description="Install FastAPI, create your first endpoint, and run with Uvicorn.", youtube_id="tLKKmouUams", duration_minutes=20, order=2, course_id=c1.id, content="# Setting Up FastAPI\n\n```bash\npip install fastapi uvicorn\n```\n\nCreate `main.py`:\n```python\nfrom fastapi import FastAPI\napp = FastAPI()\n\n@app.get('/')\ndef root():\n    return {'message': 'Hello World'}\n```"),
            Lecture(title="HTTP Methods & CRUD Operations", description="Implement GET, POST, PUT, DELETE endpoints with proper status codes.", youtube_id="GN6ICac3OXY", duration_minutes=25, order=3, course_id=c1.id, content="# CRUD with FastAPI\n\n- **GET** - Read data\n- **POST** - Create data\n- **PUT** - Update data\n- **DELETE** - Remove data\n\nEach maps to a Python function decorated with the corresponding HTTP method."),
            Lecture(title="Pydantic Models & Validation", description="Data validation with Pydantic, request/response schemas, and error handling.", youtube_id="Ecc1v_QoKhI", duration_minutes=20, order=4, course_id=c1.id, content="# Pydantic Models\n\nPydantic provides data validation using Python type annotations.\n\n```python\nfrom pydantic import BaseModel\n\nclass User(BaseModel):\n    name: str\n    email: str\n    age: int\n```"),
        ])

        # Database & SQLAlchemy lectures
        db.add_all([
            Lecture(title="PostgreSQL Basics", description="Database fundamentals, SQL queries, and setting up PostgreSQL.", youtube_id="qw--VYLpxG4", duration_minutes=30, order=1, course_id=c2.id, content="# PostgreSQL Basics\n\nPostgreSQL is a powerful, open-source relational database.\n\n## Key Concepts\n- Tables, Rows, Columns\n- Primary Keys & Foreign Keys\n- SQL Queries (SELECT, INSERT, UPDATE, DELETE)"),
            Lecture(title="SQLAlchemy ORM Setup", description="Connect FastAPI to PostgreSQL using SQLAlchemy, define models and sessions.", youtube_id="AKQ3XEDI9Mw", duration_minutes=25, order=2, course_id=c2.id, content="# SQLAlchemy ORM\n\nSQLAlchemy lets you interact with databases using Python classes.\n\n```python\nfrom sqlalchemy import Column, Integer, String\nfrom database import Base\n\nclass User(Base):\n    __tablename__ = 'users'\n    id = Column(Integer, primary_key=True)\n    name = Column(String)\n```"),
            Lecture(title="Alembic Migrations", description="Database schema versioning and migration management with Alembic.", youtube_id="SdcH6IEi6nE", duration_minutes=20, order=3, course_id=c2.id, content="# Database Migrations with Alembic\n\nAlembic tracks schema changes so you can version your database.\n\n```bash\nalembic init alembic\nalembic revision --autogenerate -m 'initial'\nalembic upgrade head\n```"),
        ])

        # Auth & Security lectures
        db.add_all([
            Lecture(title="JWT Authentication", description="Implement JSON Web Token authentication in FastAPI.", youtube_id="5GxQ1rLTwaU", duration_minutes=25, order=1, course_id=c3.id, content="# JWT Authentication\n\nJSON Web Tokens provide a stateless way to authenticate API users.\n\n## Flow\n1. User logs in with credentials\n2. Server returns a JWT token\n3. Client sends token in Authorization header\n4. Server validates token on each request"),
            Lecture(title="Password Hashing with Bcrypt", description="Secure password storage using bcrypt and passlib.", youtube_id="4dabhi6mGgM", duration_minutes=15, order=2, course_id=c3.id, content="# Password Hashing\n\nNever store passwords in plain text!\n\n```python\nfrom passlib.context import CryptContext\npwd_context = CryptContext(schemes=['bcrypt'])\nhashed = pwd_context.hash('my_password')\n```"),
            Lecture(title="Role-Based Access Control", description="Implement RBAC with user roles and permission guards.", youtube_id="6hTRw_HK3Ts", duration_minutes=20, order=3, course_id=c3.id, content="# Role-Based Access Control\n\nRestrict endpoints based on user roles (admin, mentor, developer).\n\n```python\n@app.get('/admin-only')\ndef admin_route(user = Depends(get_current_user)):\n    if user.role != 'admin':\n        raise HTTPException(403)\n```"),
        ])

        # ============================================================
        # FRONTEND DEVELOPER PATH
        # ============================================================
        frontend_path_id = paths.get("frontend", None)
        fp_id = frontend_path_id.id if frontend_path_id else None

        c4 = Course(title="React Fundamentals", description="Learn React from scratch — components, JSX, props, state, and the virtual DOM.", learning_path_id=fp_id, order=1)
        c5 = Course(title="State Management & Hooks", description="Master useState, useEffect, useContext, and build custom hooks.", learning_path_id=fp_id, order=2)

        db.add_all([c4, c5])
        db.flush()

        db.add_all([
            Lecture(title="React Introduction & JSX", description="What is React, virtual DOM, and writing JSX.", youtube_id="SqcY0GlETPk", duration_minutes=20, order=1, course_id=c4.id, content="# React Introduction\n\nReact is a JavaScript library for building user interfaces.\n\n## JSX\nJSX lets you write HTML-like code in JavaScript:\n```jsx\nconst element = <h1>Hello World</h1>;\n```"),
            Lecture(title="Components & Props", description="Functional components, passing data with props, component composition.", youtube_id="Tn6-PIqc4UM", duration_minutes=25, order=2, course_id=c4.id, content="# Components & Props\n\n```jsx\nfunction Welcome({ name }) {\n  return <h1>Hello, {name}</h1>;\n}\n\n<Welcome name='Arjun' />\n```\n\nProps are read-only. Components are reusable UI pieces."),
            Lecture(title="Event Handling & Lists", description="Handle clicks, form submissions, and render dynamic lists with map().", youtube_id="hQAHSlTtcmY", duration_minutes=20, order=3, course_id=c4.id, content="# Events & Lists\n\n```jsx\n{items.map(item => (\n  <li key={item.id} onClick={() => handleClick(item)}>\n    {item.name}\n  </li>\n))}\n```"),
            Lecture(title="React Router & Navigation", description="Client-side routing with React Router, nested routes, and navigation.", youtube_id="Ul3y1LXxzdU", duration_minutes=20, order=4, course_id=c4.id, content="# React Router\n\n```jsx\nimport { BrowserRouter, Routes, Route } from 'react-router-dom';\n\n<Routes>\n  <Route path='/' element={<Home />} />\n  <Route path='/about' element={<About />} />\n</Routes>\n```"),
        ])

        db.add_all([
            Lecture(title="useState & useEffect", description="Core React hooks for managing state and side effects.", youtube_id="O6P86uwfdR0", duration_minutes=25, order=1, course_id=c5.id, content="# useState & useEffect\n\n```jsx\nconst [count, setCount] = useState(0);\n\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n```"),
            Lecture(title="useContext & Global State", description="Share state across components without prop drilling.", youtube_id="5LrDIWkK_Bc", duration_minutes=20, order=2, course_id=c5.id, content="# useContext\n\nContext provides a way to pass data through the component tree without manually passing props.\n\n```jsx\nconst ThemeContext = createContext('light');\n```"),
            Lecture(title="Custom Hooks", description="Build reusable logic with custom hooks.", youtube_id="6ThXsUwLWvc", duration_minutes=20, order=3, course_id=c5.id, content="# Custom Hooks\n\n```jsx\nfunction useLocalStorage(key, initialValue) {\n  const [value, setValue] = useState(\n    () => JSON.parse(localStorage.getItem(key)) || initialValue\n  );\n  // ...\n  return [value, setValue];\n}\n```"),
        ])

        # ============================================================
        # DEVOPS ENGINEER PATH
        # ============================================================
        devops_path_id = paths.get("devops", None)
        dp_id = devops_path_id.id if devops_path_id else None

        c6 = Course(title="Docker & Containers", description="Containerize applications with Docker — images, containers, volumes, and Docker Compose.", learning_path_id=dp_id, order=1)
        c7 = Course(title="Kubernetes & CI/CD", description="Container orchestration with Kubernetes and automated deployment pipelines.", learning_path_id=dp_id, order=2)

        db.add_all([c6, c7])
        db.flush()

        db.add_all([
            Lecture(title="Docker Fundamentals", description="What is Docker, containers vs VMs, and installing Docker.", youtube_id="pTFZFxd4hOI", duration_minutes=25, order=1, course_id=c6.id, content="# Docker Fundamentals\n\nDocker packages applications into lightweight containers.\n\n## Key Concepts\n- **Image**: Blueprint for a container\n- **Container**: Running instance of an image\n- **Dockerfile**: Instructions to build an image"),
            Lecture(title="Dockerfile & Building Images", description="Write Dockerfiles, build custom images, and manage layers.", youtube_id="pg19Z8LL06w", duration_minutes=20, order=2, course_id=c6.id, content="# Dockerfile\n\n```dockerfile\nFROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\"]\n```"),
            Lecture(title="Docker Compose", description="Multi-container apps with Docker Compose — web, database, redis.", youtube_id="HG6yIjZapSA", duration_minutes=25, order=3, course_id=c6.id, content="# Docker Compose\n\n```yaml\nservices:\n  web:\n    build: .\n    ports:\n      - '8000:8000'\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_DB: dev_onboarding\n```"),
        ])

        db.add_all([
            Lecture(title="Kubernetes Basics", description="Pods, deployments, services, and kubectl commands.", youtube_id="X48VuDVv0do", duration_minutes=30, order=1, course_id=c7.id, content="# Kubernetes Basics\n\n## Core Objects\n- **Pod**: Smallest deployable unit\n- **Deployment**: Manages replica sets\n- **Service**: Network endpoint for pods\n- **Ingress**: External access to services"),
            Lecture(title="CI/CD with GitHub Actions", description="Automated testing and deployment pipelines.", youtube_id="R8_veQiYBjI", duration_minutes=25, order=2, course_id=c7.id, content="# GitHub Actions CI/CD\n\n```yaml\nname: CI\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: pip install -r requirements.txt\n      - run: pytest\n```"),
            Lecture(title="Monitoring with Prometheus & Grafana", description="Application monitoring, metrics collection, and dashboards.", youtube_id="9TJx7QTrTyo", duration_minutes=20, order=3, course_id=c7.id, content="# Monitoring Stack\n\n- **Prometheus**: Collects metrics from your app\n- **Grafana**: Visualizes metrics in dashboards\n- **CloudWatch**: AWS-native monitoring\n\nCombine all three for full observability."),
        ])

        db.commit()
        print(f"Created 7 courses with {db.query(Lecture).count()} lectures total")
        print("Seed courses completed!")

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_courses()
