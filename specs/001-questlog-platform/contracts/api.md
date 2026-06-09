# API Contracts: QuestLog Platform

## Base URL
`/api/v1`

## Endpoints

### Auth
- `POST /auth/register`
  - Body: `{ username, email, password }`
  - Returns: `{ token, user: { id, username, current_stage } }`
- `POST /auth/login`
  - Body: `{ email, password }`
  - Returns: `{ token, user: { id, username, current_stage } }`

### Quests
- `GET /quests`
  - Returns: `Array<{ id, title, description, status, created_at }>`
- `POST /quests`
  - Body: `{ title, description }`
  - Returns: `{ id, title, description, status }`
- `PUT /quests/:id/complete`
  - Returns: `{ id, status: 'Completed', completed_at }`
  - Side effect: Potentially triggers stage progression or insights.

### Mood Logs
- `POST /moods`
  - Body: `{ mood_score, notes }`
  - Returns: `{ id, date, mood_score }`
- `GET /moods`
  - Returns: `Array<{ id, date, mood_score, notes }>`

### Summaries & Insights
- `GET /summaries/today`
  - Returns: `{ id, date, story_content, reflection_content }`
  - Note: Will generate one on-the-fly if not already generated for the day and criteria are met.
- `GET /insights`
  - Returns: `Array<{ id, type, content, is_read, created_at }>`
- `PUT /insights/:id/read`
  - Returns: `{ id, is_read: true }`

### User Profile
- `GET /users/me/timeline`
  - Returns: `{ current_stage, experience_points, achievements: Array<{ title, unlocked_at }> }`
