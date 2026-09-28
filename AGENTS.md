# Working on Mimi

Read `README.md` and the relevant source before changing behavior. The README contains stale setup details; verify them against manifests and configuration. When working from OtherWorld, its shared profiles in `agents/roles/` can supplement these instructions. This checkout remains usable independently.

## Stack and checks

- `frontend/`: Next.js 16, React 19, TypeScript, Tailwind 4. From that directory: `npm run lint`, `npm run build`; development uses `npm run dev`, production uses `npm start`.
- `backend/`: Express 5 with JavaScript ES modules, MongoDB/Mongoose, Cloudinary, JWT; Bull/Redis dependencies are present. From that directory: `npm run dev` or `npm start` starts the service.
- Backend `npm test` is a failing placeholder; no actual automated test suite was found in the initial inventory. Do not report that placeholder as validation.
- These commands were identified from source on 2026-09-28, not executed. Choose checks relevant to the change and report actual results and unavailable checks.

## Configuration and side effects

Environment template: `backend/.env.sample`. Local environment filenames observed: `frontend/.env`, `backend/.env`; do not expose their contents. Backend configuration loads `./.env`, despite the README describing `.env.local`. Actual API routing uses `/api/v1`.

Backend startup connects to MongoDB, triggers feed-cache work, and schedules recurring refreshes. Treat startup, seeding, uploads, AI calls, and email as potentially effectful; inspect the relevant path and use an explicitly intended development environment. Do not seed or modify external data merely to check setup.

Keep changes scoped, preserve existing user work, and document verified behavior separately from README claims.
