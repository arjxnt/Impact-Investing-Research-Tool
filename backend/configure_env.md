# Environment Variables Configuration Guide

## Quick Setup

### Development (SQLite - Default)

The `.env` file is already configured to use SQLite for development. No changes needed!

Just start the application:
```bash
python -m uvicorn main:app --reload
```

### Production (PostgreSQL)

1. **Edit `backend/.env`** and update the database configuration:

   ```env
   # Comment out or remove the SQLite line:
   # DATABASE_URL=sqlite:///./impact_investing.db
   
   # Uncomment and configure PostgreSQL:
   DATABASE_URL=postgresql+psycopg2://username:password@localhost:5432/impact_investing
   ```

2. **Or use individual components:**
   ```env
   DB_USER=impact_investing_user
   DB_PASSWORD=your_secure_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=impact_investing
   ```

3. **Initialize the database:**
   ```bash
   python init_db.py
   ```

## Environment Variables Reference

### Database Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DATABASE_URL` | Full database connection string | `sqlite:///./impact_investing.db` | `postgresql+psycopg2://user:pass@host:5432/db` |
| `DB_USER` | Database username (if not using DATABASE_URL) | `postgres` | `impact_investing_user` |
| `DB_PASSWORD` | Database password | - | `secure_password123` |
| `DB_HOST` | Database host | `localhost` | `db.example.com` |
| `DB_PORT` | Database port | `5432` | `5432` |
| `DB_NAME` | Database name | `impact_investing` | `impact_investing` |

### Application Settings

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SQL_ECHO` | Enable SQL query logging | `false` | `true` / `false` |
| `API_HOST` | API server host | `0.0.0.0` | `0.0.0.0` |
| `API_PORT` | API server port | `8000` | `8000` |

### Security (Future Use)

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SECRET_KEY` | Secret key for JWT tokens | - | Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000` | `https://app.example.com` |

### Logging

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `LOG_LEVEL` | Logging level | `INFO` | `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL` |

### Environment

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `ENVIRONMENT` | Environment name | `development` | `development`, `staging`, `production` |
| `DEBUG` | Enable debug mode | `true` | `true` / `false` |

## Connection String Formats

### SQLite
```
sqlite:///./impact_investing.db
```

### PostgreSQL (Basic)
```
postgresql+psycopg2://username:password@host:port/database
```

### PostgreSQL (With SSL)
```
postgresql+psycopg2://username:password@host:port/database?sslmode=require
```

### PostgreSQL (Remote/Cloud)
```
postgresql+psycopg2://user:pass@db.example.com:5432/impact_investing?sslmode=require
```

## Examples

### Local Development (SQLite)
```env
DATABASE_URL=sqlite:///./impact_investing.db
SQL_ECHO=true
DEBUG=true
```

### Local Development (PostgreSQL)
```env
DATABASE_URL=postgresql+psycopg2://postgres:mypassword@localhost:5432/impact_investing
SQL_ECHO=true
DEBUG=true
```

### Production
```env
DATABASE_URL=postgresql+psycopg2://prod_user:secure_pass@db.prod.com:5432/impact_investing?sslmode=require
SQL_ECHO=false
DEBUG=false
ENVIRONMENT=production
LOG_LEVEL=WARNING
```

## Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use strong passwords** for production databases
3. **Enable SSL** for production database connections
4. **Use environment-specific files**:
   - `.env` - Development
   - `.env.production` - Production (load with `load_dotenv('.env.production')`)
5. **Rotate secrets regularly** in production
6. **Use secrets management** services (AWS Secrets Manager, Azure Key Vault, etc.) for production

## Troubleshooting

### Database connection fails
- Check that PostgreSQL is running: `sudo systemctl status postgresql` (Linux)
- Verify credentials in `.env`
- Test connection: `psql -h localhost -U username -d database_name`

### SQL queries not showing
- Set `SQL_ECHO=true` in `.env`
- Restart the application

### Environment variables not loading
- Make sure `.env` is in the `backend` directory
- Check that `python-dotenv` is installed: `pip install python-dotenv`
- Verify `load_dotenv()` is called in `main.py` (it is!)

## Next Steps

1. Configure your `.env` file with appropriate values
2. For PostgreSQL: Run `python init_db.py` to create tables
3. Start the application: `python -m uvicorn main:app --reload`

