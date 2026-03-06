# Pond Agent Template (Toadgang)

This repository is a reference implementation of a lightweight “pond agent” that answers lore questions via GitHub Issues.

## Why GitHub Issues?

- Dead-simple UI (everyone can open an issue)
- Built-in audit log (every question/answer is recorded)
- Easy moderation (close, lock, delete spam)
- Free automation via GitHub Actions

## How it works

1) A traveler opens an Issue (or comments on an existing Issue)
2) GitHub Actions triggers `Cave Scribe Awakening`
3) The action runs `node .github/scripts/awaken-scribe.js`
4) The script:
   - loads `lore/toadgod-lore.json`
   - selects relevant scrolls (`getRelevantScrolls()`)
   - builds a system prompt including a small lore context excerpt
   - calls an LLM provider (fallback order)
   - posts a reply comment in the same issue
   - updates `data/stats.json`

## Provider fallback

The script intentionally supports multiple providers because free/starter tiers can rate-limit.

Fallback order (only providers with keys configured are attempted):
1) Groq
2) Mistral
3) OpenRouter
4) Gemini

If a provider fails, it will try the next.

## Adding your own agent

Fork this repo and change:
- `.github/agents/*.agent.md` (persona)
- `.github/scripts/awaken-scribe.js` (system prompt + retrieval)
- `lore/toadgod-lore.json` (your lore index)

Keep the workflow triggers:
- `issues: opened`
- `issue_comment: created`

## Scaling to thousands of markdown scrolls

Recommended approach:
- keep a small searchable index (JSON/SQLite)
- retrieve top N relevant scrolls
- include only excerpts in the prompt

Avoid: dumping entire lore corpuses into a single prompt.
