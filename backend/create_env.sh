#!/bin/bash

# Bash script to create .env file from template

echo "Creating .env file from template..."

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TEMPLATE_PATH="$SCRIPT_DIR/env.template"
ENV_PATH="$SCRIPT_DIR/.env"

if [ -f "$ENV_PATH" ]; then
    read -p ".env file already exists. Overwrite? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled. .env file not modified."
        exit 0
    fi
fi

if [ -f "$TEMPLATE_PATH" ]; then
    cp "$TEMPLATE_PATH" "$ENV_PATH"
    echo "✓ .env file created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file and configure your database settings"
    echo "2. For PostgreSQL: Update DATABASE_URL with your credentials"
    echo "3. For SQLite: Leave DATABASE_URL as is (default)"
    echo ""
    echo "File location: $ENV_PATH"
else
    echo "❌ Template file not found: $TEMPLATE_PATH"
    exit 1
fi

