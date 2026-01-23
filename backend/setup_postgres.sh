#!/bin/bash

# PostgreSQL Setup Script for Impact Investing Research Tool
# This script helps set up PostgreSQL database for production use

echo "=========================================="
echo "PostgreSQL Database Setup"
echo "=========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL first:"
    echo "  - Windows: https://www.postgresql.org/download/windows/"
    echo "  - Mac: brew install postgresql"
    echo "  - Linux: sudo apt install postgresql"
    exit 1
fi

echo "✓ PostgreSQL is installed"
echo ""

# Get database configuration
read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "Enter PostgreSQL password: " -s DB_PASSWORD
echo ""

read -p "Enter database host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter database port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Enter database name (default: impact_investing): " DB_NAME
DB_NAME=${DB_NAME:-impact_investing}

echo ""
echo "Creating database and user..."

# Create database using psql
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres <<EOF
-- Create database if it doesn't exist
SELECT 'CREATE DATABASE $DB_NAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Create user if it doesn't exist
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '${DB_NAME}_user') THEN
        CREATE USER ${DB_NAME}_user WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO ${DB_NAME}_user;
EOF

if [ $? -eq 0 ]; then
    echo "✓ Database and user created successfully"
else
    echo "❌ Error creating database. Please check your PostgreSQL credentials."
    exit 1
fi

# Connect to the new database and grant schema privileges
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
-- Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO ${DB_NAME}_user;
EOF

echo ""
echo "=========================================="
echo "Database Setup Complete!"
echo "=========================================="
echo ""
echo "Add this to your .env file:"
echo ""
echo "DATABASE_URL=postgresql+psycopg2://${DB_NAME}_user:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo ""
echo "Or use individual components:"
echo "DB_USER=${DB_NAME}_user"
echo "DB_PASSWORD=${DB_PASSWORD}"
echo "DB_HOST=${DB_HOST}"
echo "DB_PORT=${DB_PORT}"
echo "DB_NAME=${DB_NAME}"
echo ""
echo "Next steps:"
echo "1. Create a .env file in the backend directory with the above configuration"
echo "2. Run: python init_db.py"
echo "3. Start the application: python -m uvicorn main:app --reload"
echo ""

