#!/bin/bash

# This script automates the process of adding, committing, and pushing code to GitHub.

# Exit immediately if a command exits with a non-zero status.
set -e

# 1. Check for changes
echo "Checking for changes..."
if git diff-index --quiet HEAD --; then
    echo "No changes to commit. Working directory is clean."
    exit 0
fi

# 2. Add all current changes to the staging area.
echo "Staging files..."
git add .

# 3. Prompt the user for a commit message.
read -p "Enter your commit message: " commit_message

# 4. If the user doesn't provide a message, use a default one.
if [ -z "$commit_message" ]; then
  commit_message="chore: auto-commit changes"
  echo "No commit message entered. Using default: '$commit_message'"
fi

# 5. Commit the changes.
echo "Committing changes..."
git commit -m "$commit_message"

# 6. Push the changes to the 'main' branch of the 'origin' remote repository.
echo "Pushing to GitHub..."
git push origin main

echo "✅ Code successfully pushed to the main branch on GitHub."
