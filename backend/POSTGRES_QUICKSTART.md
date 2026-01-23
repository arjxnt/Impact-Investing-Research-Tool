# PostgreSQL Quick Start Guide

## Prerequisites

- PostgreSQL installed and running
- Python 3.9+ installed
- psql command available in PATH (or use full path)

## Quick Setup (3 Steps)

### Step 1: Run Setup Script

**Windows (PowerShell):**
```powershell
cd backend
.\setup_postgres.ps1
```

**Mac/Linux:**
```bash
cd backend
bash setup_postgres.sh
```

The script will:
- Check if PostgreSQL is installed
- Prompt for database credentials
- Create the database and user
- Grant necessary permissions

### Step 2: Create .env File

Create a `.env` file in the `backend` directory with the connection string provided by the setup script:

```env
DATABASE_URL=postgresql+psycopg2://impact_investing_user:your_password@localhost:5432/impact_investing
```

Or use individual components:

```env
DB_USER=impact_investing_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=impact_investing
```

### Step 3: Initialize Database

```bash
cd backend
python init_db.py
```

You should see: `✓ Database tables created successfully!`

## Verify Setup

Test the connection:

```bash
python -c "from database import engine; conn = engine.connect(); print('✓ Database connection successful!'); conn.close()"
```

## Start the Application

```bash
python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## Manual Setup (Alternative)

If you prefer to set up manually:

1. Connect to PostgreSQL:
   ```bash
   psql -U postgres
   ```

2. Create database and user:
   ```sql
   CREATE DATABASE impact_investing;
   CREATE USER impact_investing_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE impact_investing TO impact_investing_user;
   \c impact_investing
   GRANT ALL ON SCHEMA public TO impact_investing_user;
   \q
   ```

3. Create `.env` file with connection string
4. Run `python init_db.py`

## Troubleshooting

### "psql: command not found"
- Add PostgreSQL bin directory to your PATH
- Or use full path: `C:\Program Files\PostgreSQL\15\bin\psql.exe`

### "password authentication failed"
- Check username and password
- Verify PostgreSQL is running: `sudo systemctl status postgresql` (Linux)

### "database does not exist"
- Run the setup script again or create manually

### "permission denied"
- Make sure you granted privileges to the user
- Check schema permissions (PostgreSQL 15+)

## Next Steps

- See [database_setup.md](database_setup.md) for detailed documentation
- See [README.md](../README.md) for application usage

