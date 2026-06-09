# Research & Technical Decisions: QuestLog Platform

## 1. Primary Tech Stack (Web & API)

**Decision**: React (TypeScript) with Vanilla CSS for the frontend; Node.js (Express) for the backend.
**Rationale**: React provides a component-based architecture ideal for building dynamic dashboards and interactive elements like timelines and quest lists. Vanilla CSS ensures a rich, custom aesthetic without relying on external UI frameworks, giving us full control over styling. Node.js with Express offers a lightweight, fast, and familiar ecosystem for building RESTful APIs to serve the frontend.
**Alternatives considered**: Angular for frontend (steeper learning curve for prototype), Python (FastAPI) for backend (Node.js allows a unified TypeScript ecosystem across the stack).

## 2. Storage Solution

**Decision**: PostgreSQL.
**Rationale**: A relational database is well-suited for the interconnected data model of QuestLog (Users, Quests, Daily Summaries, Mood Logs, Achievements). PostgreSQL provides robust data integrity, advanced querying, and JSONB support for unstructured AI outputs.
**Alternatives considered**: MongoDB (Document store could work, but relational data for progression and achievements is easier to enforce in SQL). SQLite (too limited for future scaling).

## 3. AI Integration

**Decision**: Internal mock service or generic REST API client interface.
**Rationale**: To maintain a standalone application, we will define an abstraction layer for AI text generation (stories, reflections, insights). For the prototype, we will implement a mock generator or integrate with a lightweight LLM client.
**Alternatives considered**: Hardcoding an OpenAI/Gemini SDK directly (creates tight coupling).

## 4. Testing Framework

**Decision**: Jest & Supertest.
**Rationale**: Industry standard for testing Node.js backends and React frontends. Supertest makes integration testing Express APIs straightforward.
**Alternatives considered**: Mocha (older, less out-of-the-box support for TypeScript). Vitest (also a good option, but Jest is universally understood).

## 5. Architectural Pattern

**Decision**: Monorepo with separated frontend and backend directories.
**Rationale**: Facilitates shared types and easy local development setup while maintaining clear boundaries between client and server concerns.
**Alternatives considered**: Completely separate repositories (adds overhead to prototype development). Single express server serving React statically (less flexible for future decoupling).
