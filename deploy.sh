#!/bin/bash

# This script automates the process of adding, committing, and pushing code to GitHub.

# Exit immediately if a command exits with a non-zero status.
set -e

# 1. Add all current changes to the staging area.
echo "Staging files..."
git add .

# 2. Prompt the user for a commit message.
read -p "Enter your commit message: " commit_message

# 3. If the user doesn't provide a message, use a default one.
if [ -z "$commit_message" ]; then
  commit_message="chore: auto-commit changes"
  echo "No commit message entered. Using default: '$commit_message'"
fi

# 4. Commit the changes.
echo "Committing changes..."
git commit -m "$commit_message"

# 5. Push the changes to the 'main' branch of the 'origin' remote repository.
echo "Pushing to GitHub..."
git push origin main

echo "✅ Code successfully pushed to the main branch on GitHub."
