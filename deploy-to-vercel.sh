#!/usr/bin/env bash
set -euo pipefail

if ! command -v npx >/dev/null 2>&1; then
  echo "Error: npx is required. Install Node.js first."
  exit 1
fi

cd "$(dirname "$0")"

echo "Deploying IAN AX 연구소 homepage to Vercel..."
echo "If this is your first Vercel deployment, the CLI will ask you to log in and choose project settings."
echo

npx vercel --prod
