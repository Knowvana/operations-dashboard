# Stop server: Ctrl + C

# Check status
git status

# Stage all changes
git add .

# Commit changes
git commit -m "Describe what you did"

# Push to GitHub
git push

# When ready to create new feature:
git checkout -b feature/new-feature-name

# Start dev server
npm run dev

# ... make changes ...

# After changes:
git add .
git commit -m "Feature: description"
git push -u origin feature/new-feature-name