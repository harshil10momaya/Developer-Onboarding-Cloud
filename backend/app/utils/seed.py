"""
Seed script: populates the database with sample data for development.
Run: python -m app.utils.seed
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User, UserRole, DevRole
from app.models.repository import Repository
from app.models.learning import Module, LearningPath, UserProgress, ModuleStatus, ProgressStatus
from app.models.discussion import Discussion, DiscussionReply


def seed():
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).first():
            print("Database already has data. Skipping seed.")
            return

        # ========== USERS ==========
        users = [
            User(
                email="arjun@example.com",
                hashed_password=hash_password("password123"),
                full_name="Arjun Mehta",
                role=UserRole.DEVELOPER,
                dev_role=DevRole.BACKEND,
            ),
            User(
                email="priya@example.com",
                hashed_password=hash_password("password123"),
                full_name="Priya Sharma",
                role=UserRole.DEVELOPER,
                dev_role=DevRole.FRONTEND,
            ),
            User(
                email="rohit@example.com",
                hashed_password=hash_password("password123"),
                full_name="Rohit Verma",
                role=UserRole.MENTOR,
                dev_role=DevRole.DEVOPS,
            ),
            User(
                email="neha@example.com",
                hashed_password=hash_password("password123"),
                full_name="Neha Gupta",
                role=UserRole.MENTOR,
                dev_role=DevRole.FULLSTACK,
            ),
            User(
                email="admin@example.com",
                hashed_password=hash_password("admin123"),
                full_name="Admin User",
                role=UserRole.ADMIN,
                dev_role=None,
            ),
        ]
        db.add_all(users)
        db.flush()
        print(f"Created {len(users)} users")

        # ========== REPOSITORIES ==========
        repos = [
            Repository(
                name="E-Commerce Platform",
                url="https://github.com/example/ecommerce-platform",
                description="Full-stack e-commerce application with payment integration",
                tech_stack=["React", "Django", "PostgreSQL", "Redis"],
                language_breakdown={"Python": 40, "JavaScript": 35, "HTML/CSS": 15, "SQL": 10},
                is_analyzed=True,
                analysis_summary="Monolithic Django backend with React SPA frontend. Uses Django REST Framework for API layer.",
                architecture_overview="3-tier architecture: React frontend -> Django REST API -> PostgreSQL database with Redis caching layer.",
                added_by_id=users[0].id,
            ),
            Repository(
                name="Microservices API",
                url="https://github.com/example/microservices-api",
                description="Microservices-based API gateway with service discovery",
                tech_stack=["Spring Boot", "Kubernetes", "Docker", "Kafka"],
                language_breakdown={"Java": 55, "YAML": 20, "Shell": 15, "Dockerfile": 10},
                is_analyzed=True,
                analysis_summary="Microservices architecture with Spring Boot services, Kafka event bus, and Kubernetes orchestration.",
                architecture_overview="Event-driven microservices: API Gateway -> Individual services -> Kafka message broker -> PostgreSQL per service.",
                added_by_id=users[2].id,
            ),
            Repository(
                name="Cloud Billing System",
                url="https://github.com/example/cloud-billing",
                description="Cloud-native billing and subscription management system",
                tech_stack=["Node.js", "AWS", "Docker", "MongoDB"],
                language_breakdown={"JavaScript": 50, "TypeScript": 25, "YAML": 15, "Dockerfile": 10},
                is_analyzed=True,
                analysis_summary="Serverless billing system using AWS Lambda, API Gateway, and DynamoDB with Stripe integration.",
                architecture_overview="Serverless: API Gateway -> Lambda functions -> DynamoDB + S3, with CloudWatch monitoring.",
                added_by_id=users[0].id,
            ),
        ]
        db.add_all(repos)
        db.flush()
        print(f"Created {len(repos)} repositories")

        # ========== MODULES ==========
        modules = [
            # E-Commerce modules
            Module(title="Project Architecture", description="Understand the overall project structure and design patterns", content="# Project Architecture\n\nThis module covers the high-level architecture...", order=1, status=ModuleStatus.PUBLISHED, repository_id=repos[0].id),
            Module(title="Authentication Module", description="Learn about JWT auth, session management, and security", content="# Authentication\n\nThis module covers user authentication...", order=2, status=ModuleStatus.PUBLISHED, repository_id=repos[0].id),
            Module(title="Database Models", description="PostgreSQL schema design and ORM usage", content="# Database Models\n\nLearn about the data layer...", order=3, status=ModuleStatus.PUBLISHED, repository_id=repos[0].id),
            Module(title="API Integration", description="RESTful API design and third-party integrations", content="# API Integration\n\nBuild and consume APIs...", order=4, status=ModuleStatus.PUBLISHED, repository_id=repos[0].id),
            # Microservices modules
            Module(title="Service Discovery", description="How services find and communicate with each other", order=1, status=ModuleStatus.PUBLISHED, repository_id=repos[1].id),
            Module(title="Event-Driven Architecture", description="Kafka messaging and event sourcing patterns", order=2, status=ModuleStatus.PUBLISHED, repository_id=repos[1].id),
            Module(title="Container Orchestration", description="Kubernetes deployment and scaling", order=3, status=ModuleStatus.PUBLISHED, repository_id=repos[1].id),
            # Cloud Billing modules
            Module(title="Serverless Fundamentals", description="AWS Lambda and serverless patterns", order=1, status=ModuleStatus.PUBLISHED, repository_id=repos[2].id),
            Module(title="Payment Integration", description="Stripe API integration and webhook handling", order=2, status=ModuleStatus.PUBLISHED, repository_id=repos[2].id),
        ]
        db.add_all(modules)
        db.flush()
        print(f"Created {len(modules)} modules")

        # ========== LEARNING PATHS ==========
        paths = [
            LearningPath(
                title="Backend Developer",
                dev_role="backend",
                level="Intermediate",
                description="Master backend development with API design, databases, and authentication",
                module_ids=[modules[0].id, modules[1].id, modules[2].id, modules[3].id],
            ),
            LearningPath(
                title="Frontend Developer",
                dev_role="frontend",
                level="Beginner",
                description="Learn React, component design, and frontend best practices",
                module_ids=[modules[0].id, modules[7].id],
            ),
            LearningPath(
                title="Full Stack Engineer",
                dev_role="fullstack",
                level="Advanced",
                description="End-to-end development from frontend to deployment",
                module_ids=[m.id for m in modules],
            ),
            LearningPath(
                title="DevOps Engineer",
                dev_role="devops",
                level="Intermediate",
                description="CI/CD, containerization, and cloud infrastructure",
                module_ids=[modules[4].id, modules[5].id, modules[6].id, modules[7].id],
            ),
        ]
        db.add_all(paths)
        db.flush()
        print(f"Created {len(paths)} learning paths")

        # ========== USER PROGRESS (for Arjun) ==========
        progress_entries = [
            UserProgress(user_id=users[0].id, module_id=modules[0].id, learning_path_id=paths[0].id, status=ProgressStatus.COMPLETED, score=95, time_spent_minutes=120),
            UserProgress(user_id=users[0].id, module_id=modules[1].id, learning_path_id=paths[0].id, status=ProgressStatus.IN_PROGRESS, score=None, time_spent_minutes=45),
            UserProgress(user_id=users[0].id, module_id=modules[2].id, learning_path_id=paths[0].id, status=ProgressStatus.NOT_STARTED, score=None, time_spent_minutes=0),
            UserProgress(user_id=users[0].id, module_id=modules[3].id, learning_path_id=paths[0].id, status=ProgressStatus.NOT_STARTED, score=None, time_spent_minutes=0),
        ]
        db.add_all(progress_entries)
        db.flush()
        print(f"Created {len(progress_entries)} progress entries")

        # ========== DISCUSSIONS ==========
        discussions = [
            Discussion(title="Best practices for authentication", body="What are the recommended approaches for JWT vs session-based auth?", category="Backend", author_id=users[0].id, views=234),
            Discussion(title="React hooks optimization", body="How do you prevent unnecessary re-renders with useMemo and useCallback?", category="Frontend", author_id=users[1].id, views=156),
            Discussion(title="Database indexing strategies", body="When should we use composite indexes vs single-column indexes?", category="Database", author_id=users[2].id, views=289),
            Discussion(title="Docker deployment tips", body="Share your Docker multi-stage build optimizations.", category="DevOps", author_id=users[3].id, views=98),
        ]
        db.add_all(discussions)
        db.flush()
        print(f"Created {len(discussions)} discussions")

        db.commit()
        print("\nSeed completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
