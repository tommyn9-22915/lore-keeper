#!/usr/bin/env node
/*
Repo validation:
- lore/toadgod-lore.json must be valid JSON array
- each entry must include: id, title, date (optional), tags (optional), original/comment at least one

This is a lightweight guardrail to prevent broken deploys.
*/

const fs = require('fs');
const path = require('path');

function fail(msg) {
  console.error(`VALIDATION FAILED: ${msg}`);
  process.exit(1);
}

function main() {
  const p = path.join(process.cwd(), 'lore', 'toadgod-lore.json');
  if (!fs.existsSync(p)) fail(`Missing file: ${p}`);

  let data;
  try {
    data = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    fail(`Invalid JSON in lore/toadgod-lore.json: ${e.message}`);
  }

  if (!Array.isArray(data)) fail('lore/toadgod-lore.json must be a JSON array');
  if (data.length === 0) fail('lore/toadgod-lore.json is empty');

  for (let i = 0; i < data.length; i++) {
    const s = data[i] || {};
    const ctx = `entry[${i}]`; 

    if (!s.id || typeof s.id !== 'string') fail(`${ctx}: missing string "id"`);
    if (!s.title || typeof s.title !== 'string') fail(`${ctx}: missing string "title"`);

    const hasBody = (typeof s.comment === 'string' && s.comment.trim()) || (typeof s.original === 'string' && s.original.trim());
    if (!hasBody) fail(`${ctx} (${s.id}): requires at least one of "comment" or "original"`);

    if (s.tags != null && typeof s.tags !== 'string') {
      fail(`${ctx} (${s.id}): "tags" should be a string (comma-separated) if present`);
    }

    if (s.date != null && typeof s.date !== 'string') {
      fail(`${ctx} (${s.id}): "date" should be a string if present`);
    }
  }

  console.log(`OK: validated lore/toadgod-lore.json (${data.length} entries)`);
}

main();
