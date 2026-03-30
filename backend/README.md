# Backend — Developer Onboarding Cloud

FastAPI backend with PostgreSQL, JWT authentication, and RESTful APIs.

## Tech Stack
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Auth**: JWT (python-jose + passlib/bcrypt)
- **Caching**: Redis (optional)

## Quick Setup

### 1. Create & activate virtual environment
```bash
cd backend
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Linux/Mac
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Create PostgreSQL database
```sql
-- In psql or pgAdmin:
CREATE DATABASE dev_onboarding;
```

### 4. Configure environment
```bash
# Copy the example and edit with your DB credentials
copy .env.example .env
```

### 5. Run database migrations
```bash
# Auto-create tables
alembic revision --autogenerate -m "initial tables"
alembic upgrade head
```

Or let FastAPI auto-create on first run (dev only).

### 6. Seed sample data
```bash
python -m app.utils.seed
```

### 7. Start the server
```bash
uvicorn app.main:app --reload --port 8000
```

## API Docs
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Repositories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/repositories` | List all repos |
| POST | `/api/repositories` | Add a repo |
| GET | `/api/repositories/{id}` | Get repo details |
| PUT | `/api/repositories/{id}` | Update repo |
| DELETE | `/api/repositories/{id}` | Delete repo |

### Learning
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/modules` | List modules |
| POST | `/api/modules` | Create module |
| GET | `/api/learning-paths` | List learning paths |
| POST | `/api/learning-paths` | Create learning path |
| GET | `/api/progress` | Get user progress |
| PUT | `/api/progress/{module_id}` | Update progress |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard statistics |

### Mentors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mentors` | List mentors |
| GET | `/api/mentors/developers` | Developer progress (mentor/admin only) |

## Sample Login Credentials (after seeding)
| Email | Password | Role |
|-------|----------|------|
| arjun@example.com | password123 | Developer |
| priya@example.com | password123 | Developer |
| rohit@example.com | password123 | Mentor |
| neha@example.com | password123 | Mentor |
| admin@example.com | admin123 | Admin |
