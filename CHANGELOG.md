# Changelog

All notable changes to QuestLog are documented in this file.

This project uses [Git-Cliff](https://git-cliff.org/) for automated changelog
generation from Git history.

## [Unreleased]

### Added

- Repository compliance tooling for linting, formatting, type checking, tests,
  coverage, secret scanning, pre-commit hooks, Docker, and GitLab CI.
- User manual and security policy.
- Backend smoke and helper tests with Vitest.

### Changed

- Backend exports the Express app for tests while preserving normal startup.
- Backend can serve built frontend assets when `frontend/dist` exists.
