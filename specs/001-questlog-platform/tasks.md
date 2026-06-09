# Tasks: QuestLog Platform

**Feature**: [QuestLog Platform](../spec.md)
**Status**: Ready
**MVP Scope**: User Story 1 (Quest Management)

## Implementation Strategy

- **Phase 1: Setup**: Project structure, configuration, and database initialization.
- **Phase 2: Foundational**: Authentication and shared utilities.
- **Phase 3: US1 - Quest Management**: Core CRUD and completion logic.
- **Phase 4: US2 - AI Story & Reflection**: Narrative generation engine.
- **Phase 5: US3 - Hero's Journey**: Progression and achievement system.
- **Phase 6: US4 - Mood & Burnout**: Sentiment tracking and analytics.
- **Phase 7: US5 - Future-Self**: Milestone-triggered inspiration messages.
- **Final Phase: Polish**: UI refinements and end-to-end integration.

## Phase 1: Setup

- [ ] T001 Initialize backend project with Express and TypeScript in `backend/`
- [ ] T002 Initialize frontend project with React and TypeScript in `frontend/`
- [ ] T003 [P] Setup PostgreSQL database schema using migrations in `backend/src/config/db.ts`
- [ ] T004 [P] Configure environment variables and basic server boilerplate in `backend/src/index.ts`
- [ ] T005 Setup Vanilla CSS structure and global variables in `frontend/src/styles/global.css`

## Phase 2: Foundational

- [ ] T006 [P] Implement User model in `backend/src/models/User.ts`
- [ ] T007 [P] Implement Authentication service (JWT) in `backend/src/services/AuthService.ts`
- [ ] T008 [P] Create Authentication controller and routes in `backend/src/controllers/AuthController.ts`
- [ ] T009 Implement basic Layout component and navigation in `frontend/src/components/Layout.tsx`
- [ ] T010 Setup API client service (Axios/Fetch) with interceptors in `frontend/src/services/api.ts`

## Phase 3: US1 - Quest Management (Priority: P1)

**Goal**: Enable users to create, view, and complete quests.
**Independent Test**: Create a quest via UI, mark it complete, and verify status change in database.

- [ ] T011 [US1] Implement Quest model in `backend/src/models/Quest.ts`
- [ ] T012 [P] [US1] Create Quest service with CRUD operations in `backend/src/services/QuestService.ts`
- [ ] T013 [P] [US1] Implement Quest controller and routes in `backend/src/controllers/QuestController.ts`
- [ ] T014 [US1] Design and implement QuestList and QuestItem components in `frontend/src/components/QuestList.tsx`
- [ ] T015 [US1] Create Quest Dashboard page in `frontend/src/pages/Dashboard.tsx`
- [ ] T016 [US1] Implement "Complete Quest" button logic and state update in `frontend/src/components/QuestItem.tsx`

## Phase 4: US2 - Daily AI Story Generation & Reflection (Priority: P1)

**Goal**: Generate a daily narrative based on completed tasks.
**Independent Test**: Simulate 3 completed tasks and verify a story is generated at the end of the day.

- [ ] T017 [US2] Implement DailySummary model in `backend/src/models/DailySummary.ts`
- [ ] T018 [P] [US2] Create AI Abstraction layer (Mock Service) in `backend/src/services/AIService.ts`
- [ ] T019 [US2] Implement Narrative generation logic in `backend/src/services/NarrativeService.ts`
- [ ] T020 [US2] Create Summary controller and retrieval route in `backend/src/controllers/SummaryController.ts`
- [ ] T021 [US2] Design Daily Story viewer component in `frontend/src/components/DailyStory.tsx`
- [ ] T022 [US2] Implement Reflections display and interaction in `frontend/src/components/Reflection.tsx`

## Phase 5: US3 - Hero's Journey Progression (Priority: P2)

**Goal**: Visualize growth through stages and achievements.
**Independent Test**: Complete X quests and verify user's "current_stage" advances in profile.

- [ ] T023 [US3] Implement Achievement model in `backend/src/models/Achievement.ts`
- [ ] T024 [P] [US3] Create Progression service to calculate stage changes in `backend/src/services/ProgressionService.ts`
- [ ] T025 [US3] Update User profile endpoint to include timeline data in `backend/src/controllers/UserController.ts`
- [ ] T026 [US3] Design Achievement Timeline component in `frontend/src/components/Timeline.tsx`
- [ ] T027 [US3] Create User Profile page with progression visualization in `frontend/src/pages/Profile.tsx`

## Phase 6: US4 - Mood Insights & Burnout Detection (Priority: P2)

**Goal**: Track user mood and provide health warnings.
**Independent Test**: Log low mood for 3 days and verify a burnout warning appears in insights.

- [ ] T028 [US4] Implement MoodLog and Insight models in `backend/src/models/MoodLog.ts`
- [ ] T029 [P] [US4] Create Mood tracking service and analytics in `backend/src/services/MoodService.ts`
- [ ] T030 [US4] Implement Burnout Detection algorithm in `backend/src/services/AnalyticsService.ts`
- [ ] T031 [US4] Create Mood logging component in `frontend/src/components/MoodLogger.tsx`
- [ ] T032 [US4] Design Insights dashboard for mood trends and warnings in `frontend/src/components/Insights.tsx`

## Phase 7: US5 - Future-Self Messages (Priority: P3)

**Goal**: Receive messages from a simulated future self.
**Independent Test**: Reach a milestone and verify a "Future-Self" message is delivered to the inbox.

- [ ] T033 [US5] Implement Future-Self message generation logic in `backend/src/services/AIService.ts`
- [ ] T034 [P] [US5] Create Insight type for Future-Self messages in `backend/src/models/Insight.ts`
- [ ] T035 [US5] Design Future-Self message display in `frontend/src/components/FutureSelf.tsx`

## Final Phase: Polish

- [ ] T036 [P] Add CSS transitions and "quest-like" animations to the UI in `frontend/src/styles/animations.css`
- [ ] T037 Perform end-to-end integration testing of the Hero's Journey flow
- [ ] T038 Finalize documentation and deployment scripts

## Dependencies

- Phase 2 depends on Phase 1
- Phase 3 depends on Phase 2
- Phase 4, 5, 6 depend on Phase 3 completion
- Phase 7 depends on Phase 5 (achievements)
- Final Phase depends on all previous phases

## Parallel Opportunities

- T003, T004, T005 (Initial setup)
- T006, T007, T008 (Auth backend)
- T012, T013 (Quest backend)
- T018 (AI service) can be built while UI components are developed
- T024, T029 (Analytics logic) can run in parallel with UI development
