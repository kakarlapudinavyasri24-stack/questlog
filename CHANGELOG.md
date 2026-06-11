# Changelog

All notable changes to QuestLog are documented in this file.

This project uses [Git-Cliff](https://git-cliff.org/) for automated changelog
generation from Git history.
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Repository compliance tooling for linting, formatting, type checking, tests,
  coverage, secret scanning, pre-commit hooks, Docker, and GitLab CI.
- User manual and security policy.
- Backend smoke and helper tests with Vitest.

### Changed

- Backend exports the Express app for tests while preserving normal startup.
- Backend can serve built frontend assets when `frontend/dist` exists.
- Gamified task management system with RPG mechanics
- HP system (depletes on abandoned quests)
- XP + Level progression (7 levels from Wanderer to Mythic)
- Streak multiplier system (3-day → 1.5x, 7-day → 2x XP)
- Badge system with 11 achievements
- AI-generated daily Chronicle using Claude API
- Dynamic narrative based on game state
- React + Vite frontend
- Express backend with JSON file storage

### Changed

### Deprecated

### Removed

### Fixed

### Security
