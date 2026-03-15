# User Preference: End-to-End Impact Workflow

**Date**: 2026-03-15
**Preference Type**: Workflow Orchestration

## Requirement
Whenever implementing new features, fixes, or improvements, the agent must:

1.  **Analyze Impact**: Identify all affected resources across the entire stack.
    *   Frontend (UI, state, logic)
    *   Backend (Controllers, Services, Repositories)
    *   Infrastructure (Docker, Nginx, Routes)
    *   Data (Database schema, migrations, seed data)
2.  **Update Chain**: Systematically update every link in the functional chain to ensure completeness and consistency.

## Implementation Guide
- **Planning Mode**: Every `implementation_plan.md` must now include an "Impact Analysis" section explicitly listing affected layers (Frontend, Backend, Database, Infra).
- **Execution Mode**: Follow the order of dependencies (e.g., Database -> Backend -> Frontend) to ensure build stability.
- **Verification Mode**: Verify the entire chain, not just the isolated fix.
