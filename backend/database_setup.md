# Database Setup Guide

## PostgreSQL Production Setup

### 1. Install PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Use the installer and remember the password you set for the `postgres` user

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

Connect to PostgreSQL:

```bash
# Windows (if added to PATH)
psql -U postgres

# Mac/Linux
sudo -u postgres psql
```

Create the database and user:

```sql
-- Create database
CREATE DATABASE impact_investing;

-- Create a dedicated user (optional but recommended)
CREATE USER impact_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE impact_investing TO impact_user;

-- Connect to the database
\c impact_investing

-- Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO impact_user;

-- Exit
\q
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql+psycopg2://impact_user:your_secure_password@localhost:5432/impact_investing
```

Or use individual components:

```env
DB_USER=impact_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=impact_investing
```

### 4. Install Dependencies

Make sure PostgreSQL dependencies are installed:

```bash
cd backend
pip install -r requirements.txt
```

### 5. Initialize Database

Run the initialization script to create all tables:

```bash
python init_db.py
```

### 6. Verify Setup

Test the connection:

```python
python -c "from database import engine; engine.connect(); print('✓ Database connection successful!')"
```

## Development (SQLite)

For development, you can continue using SQLite. Simply don't set the `DATABASE_URL` environment variable, or set it to:

```env
DATABASE_URL=sqlite:///./impact_investing.db
```

## Database Migrations

### Manual Migration (Current Approach)

The application uses SQLAlchemy's `create_all()` which automatically creates tables based on models. For production, you may want to use Alembic for migrations:

```bash
pip install alembic
alembic init alembic
# Configure alembic.ini and env.py
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Using init_db.py

The provided `init_db.py` script can:
- Create all tables: `python init_db.py`
- Drop all tables (with confirmation): `python init_db.py drop`

## Connection Pooling

For production deployments, consider:

1. **Connection Pooling**: The current setup uses `NullPool` which is suitable for serverless. For traditional deployments, you may want to use a connection pool:

```python
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)
```

2. **Connection String Options**: You can add SSL and other options:

```env
DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/db?sslmode=require
```

## Troubleshooting

### Connection Refused
- Check PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or check Services (Windows)
- Verify host and port are correct
- Check firewall settings

### Authentication Failed
- Verify username and password
- Check `pg_hba.conf` for authentication method
- Ensure user has proper permissions

### Database Does Not Exist
- Create the database: `CREATE DATABASE impact_investing;`
- Verify database name in connection string

### Permission Denied
- Grant proper privileges to the database user
- Check schema permissions (PostgreSQL 15+)

### psycopg2 Installation Issues
- On Windows, you may need Visual C++ Build Tools
- Try: `pip install psycopg2-binary` (pre-compiled version)
- On Linux: `sudo apt-get install libpq-dev python3-dev`

## Production Best Practices

1. **Use Environment Variables**: Never hardcode credentials
2. **SSL Connections**: Use SSL for production databases
3. **Connection Pooling**: Configure appropriate pool sizes
4. **Backups**: Set up regular database backups
5. **Monitoring**: Monitor connection pool usage and query performance
6. **Migrations**: Use Alembic for schema versioning in production

## Example Production Configuration

```env
# Production .env
DATABASE_URL=postgresql+psycopg2://prod_user:secure_password@db.example.com:5432/impact_investing?sslmode=require
SQL_ECHO=false
```

