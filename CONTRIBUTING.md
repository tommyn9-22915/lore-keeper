# Contributing to lore-keeper

This repo is meant to be a simple, reproducible “pond agent” template for Toadgang.

## Core concept

- Users open a **GitHub Issue** (or comment on an issue).
- A GitHub Action runs `.github/scripts/awaken-scribe.js`.
- The script retrieves relevant lore context and replies back to the issue.

## Local development

Requirements:
- Node.js **20+**

Install:
```bash
npm ci
```

Run (manual mode):
```bash
MANUAL_MESSAGE="What is Taboshi?" \
GITHUB_REPOSITORY="MirrorAgent1/lore-keeper" \
GITHUB_TOKEN="<token>" \
node .github/scripts/awaken-scribe.js
```

> Note: `GITHUB_TOKEN` is required only if you want it to post a comment / write stats.

## GitHub Actions secrets

Add one or more provider keys (the script will try them in order and fall back automatically):

- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `MISTRAL_API_KEY`
- `OPENROUTER_API_KEY`

Optional Telegram bridge:
- `TELEGRAM_TOKEN`
- `TELEGRAM_CHAT_ID`

## Lore data

- Tweet-lore index lives in: `lore/toadgod-lore.json`
- Basic stats live in: `data/stats.json`

If you add more lore sources later (markdown scrolls, etc.), prefer:
- keep a small index file for fast retrieval
- load only a few relevant excerpts per question (avoid loading the whole corpus into the prompt)
