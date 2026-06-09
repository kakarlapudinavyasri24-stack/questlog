# Quickstart: QuestLog Platform

This quickstart guide demonstrates how to validate the end-to-end functionality of the QuestLog backend API using a REST client (like `curl` or Postman).

## Prerequisites
- Node.js installed
- PostgreSQL installed and running
- Environment variables configured (see implementation setup)

## Setup Commands

```bash
# 1. Install dependencies
cd backend && npm install

# 2. Setup database (assuming scripts exist)
npm run db:setup
npm run db:migrate

# 3. Start the server
npm run dev
```

## Validation Scenarios

### Scenario 1: User Registration and Quest Creation

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "hero123", "email": "hero@example.com", "password": "password123"}'
# Expected outcome: Returns a JWT token and user info

# Create a new quest
# (Replace YOUR_TOKEN with the token from the previous step)
curl -X POST http://localhost:3000/api/v1/quests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Slay the Dragon", "description": "Finish the quarterly report."}'
# Expected outcome: Returns the created quest object with status 'Active'
```

### Scenario 2: Completing a Quest

```bash
# Mark the quest as complete
curl -X PUT http://localhost:3000/api/v1/quests/<QUEST_ID>/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected outcome: Returns the updated quest with status 'Completed'
```

### Scenario 3: Fetching Daily Summary

```bash
# Retrieve the daily summary (triggers generation if applicable)
curl -X GET http://localhost:3000/api/v1/summaries/today \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected outcome: Returns an object containing `story_content` and `reflection_content`
```
