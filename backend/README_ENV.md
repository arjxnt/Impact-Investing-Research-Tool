# Environment Variables - Quick Reference

## Quick Setup

### Option 1: Interactive Configuration (Recommended)

**Windows:**
```cmd
configure_env.bat
```

**Mac/Linux:**
```bash
bash configure_env.sh
```

Or directly:
```bash
python configure_env.py
```

### Option 2: Manual Setup

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your settings

## Essential Variables

### For Development (SQLite)
```env
# No configuration needed - uses SQLite by default
# Or explicitly:
DATABASE_URL=sqlite:///./impact_investing.db
```

### For Production (PostgreSQL)
```env
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/impact_investing
```

## All Available Variables

See [ENV_CONFIGURATION.md](ENV_CONFIGURATION.md) for complete documentation.

## Verify Configuration

After configuring, test the connection:

```bash
python -c "from database import engine; conn = engine.connect(); print('✓ Connected!'); conn.close()"
```

## Next Steps

1. Configure environment: `python configure_env.py`
2. Initialize database: `python init_db.py`
3. Start server: `python -m uvicorn main:app --reload`

