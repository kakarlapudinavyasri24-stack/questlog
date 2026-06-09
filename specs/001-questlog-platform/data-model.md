# Data Model: QuestLog Platform

## Core Entities

### User
Represents a platform user.
- `id`: UUID (Primary Key)
- `username`: String
- `email`: String (Unique)
- `password_hash`: String
- `experience_points`: Integer (Default: 0)
- `current_stage`: String (Enum: e.g., 'Call to Adventure', 'Crossing the Threshold')
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Quest
Represents a task to be completed.
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> User.id)
- `title`: String
- `description`: Text
- `status`: String (Enum: 'Active', 'Completed', 'Abandoned')
- `created_at`: Timestamp
- `completed_at`: Timestamp (Nullable)

### DailySummary
Represents AI-generated narrative and reflection for a specific day.
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> User.id)
- `date`: Date
- `story_content`: Text
- `reflection_content`: Text
- `created_at`: Timestamp

### Achievement
Represents a milestone unlocked by the user.
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> User.id)
- `title`: String
- `description`: Text
- `stage_reached`: String (Enum: aligns with Hero's Journey stages)
- `unlocked_at`: Timestamp

### MoodLog
Represents the user's recorded emotional state.
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> User.id)
- `date`: Date
- `mood_score`: Integer (e.g., 1-5 scale)
- `notes`: Text (Optional)
- `created_at`: Timestamp

### Insight
System-generated feedback (e.g., burnout warnings).
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> User.id)
- `type`: String (Enum: 'BurnoutWarning', 'ProductivityTrend', 'FutureSelf')
- `content`: Text
- `is_read`: Boolean (Default: false)
- `created_at`: Timestamp

## Relationships
- A `User` has many `Quests` (1:N)
- A `User` has many `DailySummaries` (1:N)
- A `User` has many `Achievements` (1:N)
- A `User` has many `MoodLogs` (1:N)
- A `User` has many `Insights` (1:N)
