# Environment Variables Configuration Guide

This guide explains all available environment variables for the Impact Investing Research Tool.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Use the interactive configuration script:**
   ```bash
   python configure_env.py
   ```

3. **Or manually edit `.env` file** with your values

## Environment Variables Reference

### Database Configuration

#### Option 1: Full Connection String (Recommended)
```env
DATABASE_URL=postgresql+psycopg2://username:password@host:port/database_name
```

**Example:**
```env
DATABASE_URL=postgresql+psycopg2://impact_user:secure_password@localhost:5432/impact_investing
```

#### Option 2: Individual Components
```env
DB_USER=postgres              # Database username
DB_PASSWORD=your_password    # Database password
DB_HOST=localhost            # Database host
DB_PORT=5432                 # Database port
DB_NAME=impact_investing     # Database name
```

#### Option 3: SQLite (Development)
```env
DATABASE_URL=sqlite:///./impact_investing.db
```

**Note:** If `DATABASE_URL` is not set, SQLite will be used by default.

### Application Configuration

```env
# Server host (0.0.0.0 for all interfaces, 127.0.0.1 for localhost only)
API_HOST=0.0.0.0

# Server port
API_PORT=8000

# Auto-reload on code changes (development only)
API_RELOAD=true

# Environment type
ENVIRONMENT=development        # Options: development, staging, production

# Debug mode
DEBUG=true                     # true/false
```

### Database Advanced Settings

```env
# Enable SQL query logging (useful for debugging)
SQL_ECHO=false                 # true/false

# PostgreSQL Connection Pool Settings (PostgreSQL only)
# DB_POOL_SIZE=10              # Connection pool size
# DB_MAX_OVERFLOW=20            # Maximum overflow connections
# DB_POOL_TIMEOUT=30            # Connection timeout in seconds
```

### Logging Configuration

```env
# Log level
LOG_LEVEL=INFO                 # Options: DEBUG, INFO, WARNING, ERROR, CRITICAL

# Log file path (optional, leave empty for console only)
# LOG_FILE=logs/app.log
```

### Security Settings (Future Use)

```env
# Secret key for JWT tokens and encryption
# SECRET_KEY=your-secret-key-here-change-in-production

# CORS allowed origins (comma-separated)
# CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Configuration Methods

### Method 1: Interactive Script (Easiest)

Run the interactive configuration script:

```bash
python configure_env.py
```

This will guide you through all settings step by step.

### Method 2: Manual Configuration

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your preferred text editor

3. Uncomment and set the variables you need

### Method 3: Environment Variables (System Level)

You can also set environment variables at the system level:

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql+psycopg2://user:pass@localhost:5432/db"
```

**Windows (Command Prompt):**
```cmd
set DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/db
```

**Mac/Linux:**
```bash
export DATABASE_URL="postgresql+psycopg2://user:pass@localhost:5432/db"
```

**Note:** System-level environment variables take precedence over `.env` file.

## Environment-Specific Configurations

### Development

```env
DATABASE_URL=sqlite:///./impact_investing.db
ENVIRONMENT=development
DEBUG=true
API_RELOAD=true
SQL_ECHO=false
LOG_LEVEL=DEBUG
```

### Staging

```env
DATABASE_URL=postgresql+psycopg2://user:pass@staging-db:5432/impact_investing
ENVIRONMENT=staging
DEBUG=false
API_RELOAD=false
SQL_ECHO=false
LOG_LEVEL=INFO
```

### Production

```env
DATABASE_URL=postgresql+psycopg2://user:pass@prod-db:5432/impact_investing
ENVIRONMENT=production
DEBUG=false
API_RELOAD=false
SQL_ECHO=false
LOG_LEVEL=WARNING
```

## Priority Order

Environment variables are loaded in this order (highest to lowest priority):

1. **System environment variables** (set in OS)
2. **`.env` file** (in backend directory)
3. **Default values** (hardcoded in application)

## Security Best Practices

1. **Never commit `.env` file** to version control
   - It's already in `.gitignore`
   - Use `.env.example` as a template

2. **Use strong passwords** for database connections

3. **Restrict database access** in production:
   - Use dedicated database users with minimal privileges
   - Enable SSL connections: `?sslmode=require` in connection string

4. **Rotate secrets regularly** in production

5. **Use different credentials** for development, staging, and production

## Troubleshooting

### Environment variables not loading

1. **Check file location:** `.env` must be in the `backend` directory
2. **Check file name:** Must be exactly `.env` (not `.env.txt` or `env`)
3. **Restart application:** Changes to `.env` require restart
4. **Check syntax:** No spaces around `=` sign: `KEY=value` not `KEY = value`

### Database connection issues

1. **Verify connection string format:**
   ```
   postgresql+psycopg2://user:password@host:port/database
   ```

2. **Test connection:**
   ```bash
   python -c "from database import engine; conn = engine.connect(); print('Connected!'); conn.close()"
   ```

3. **Check PostgreSQL is running:**
   ```bash
   # Linux
   sudo systemctl status postgresql
   
   # Mac
   brew services list
   ```

### SQL logging not working

- Ensure `SQL_ECHO=true` (not `True` or `1`)
- Check logs are going to console or file as expected

## Examples

### Minimal Development Setup

```env
# Uses SQLite by default, no configuration needed
# Just create .env file (can be empty)
```

### PostgreSQL Development

```env
DATABASE_URL=postgresql+psycopg2://postgres:mypassword@localhost:5432/impact_investing
ENVIRONMENT=development
DEBUG=true
```

### Full Production Setup

```env
DATABASE_URL=postgresql+psycopg2://prod_user:secure_password@db.example.com:5432/impact_investing?sslmode=require
ENVIRONMENT=production
DEBUG=false
API_HOST=0.0.0.0
API_PORT=8000
SQL_ECHO=false
LOG_LEVEL=WARNING
```

## Additional Resources

- [Database Setup Guide](database_setup.md)
- [PostgreSQL Quick Start](POSTGRES_QUICKSTART.md)
- [Production Deployment](../README.md#production-deployment)

