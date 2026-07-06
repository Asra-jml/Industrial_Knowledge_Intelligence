# frontend/web — Next.js 16 app

Hosts the **landing page** (PRD §14 — hero, problem stats, P-101 story, five module cards,
how-it-works, metrics, tech stack, team) plus the copilot chat and F3/F4/F5 dashboards,
all talking to the FastAPI backend (`backend/api`). **Desktop-first** (mobile deferred by
team decision 2026-07-06). Create with:

```
npx create-next-app@latest web --ts --tailwind --app
```

Content reference for the landing page: `f:\ET_hackathon\landing_page.html` (old standalone draft).

Until the app is scaffolded, the F1 graph viewer lives next door:
- `frontend/graph_viewer.html` — standalone knowledge-graph viewer (demo tool)
