#!/bin/bash

echo "==========================================="
echo "Environment Configuration Setup"
echo "==========================================="
echo ""

cd "$(dirname "$0")"
python3 configure_env.py

