# CLAUDE.md

This file provides guidance to AI assistants working with the CLItoris repository.

## Project Overview

CLItoris is a new project repository currently in its initial setup phase. This document will be updated as the codebase evolves.

## Repository Status

This repository is in early bootstrapping. No source code, build system, or tests have been added yet.

## Tech Stack

| Area | Technology |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| State management | Zustand |
| Flow diagrams | `@xyflow/react` v12 |
| Backend | Node.js + Express + tsx (TypeScript direct execution) |
| DB | SQLite (`better-sqlite3`) + versioned migrations |
| Logging | pino |
| Testing | Vitest (frontend + server), Playwright (E2E) |
| Package manager | pnpm |

## Development Workflow

### Branch Conventions

- Feature branches should follow the pattern: `claude/<description>-<id>`
- All development happens on feature branches; avoid pushing directly to `main`

### Commit Guidelines

- Write clear, descriptive commit messages
- Use conventional commit style when applicable (e.g., `feat:`, `fix:`, `docs:`, `chore:`)

## Updating This File

As the project grows, update this file to include:

- Build and test commands
- Project structure and architecture
- Code style and conventions
- Key dependencies and their purposes
- CI/CD pipeline details
- Environment setup instructions
