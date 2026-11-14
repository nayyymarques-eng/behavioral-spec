// Reads the spec folder into one object the checks and the handoff use. Nothing here judges the spec.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const specDir = join(root, 'spec');

/** Every markdown table in a text, as arrays of rows keyed by the header. */
export function tables(text) {
  const out = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    if (!lines[i].trim().startsWith('|') || !/^\|[\s|:-]+\|$/.test(lines[i + 1].trim())) continue;
    const head = cells(lines[i]);
    const rows = [];
    let j = i + 2;
    for (; j < lines.length && lines[j].trim().startsWith('|'); j++) {
      const c = cells(lines[j]);
      rows.push(Object.fromEntries(head.map((h, k) => [h, c[k] ?? ''])));
    }
    out.push(rows);
    i = j - 1;
  }
  return out;
}

function cells(line) {
  const t = line.trim();
  return t.slice(1, t.endsWith('|') ? -1 : undefined).split('|').map(c => c.trim());
}

/** "A, B, C" into a list; "-", "none" and blanks into an empty list. */
export const list = s => (s ?? '').split(',').map(x => x.trim()).filter(x => x && x !== '-' && x.toLowerCase() !== 'none');

/** Splits on commas that sit outside quotes and brackets. */
function splitTop(s) {
  const out = [];
  let depth = 0, quoted = false, cur = '';
  for (const ch of s) {
    if (ch === '"') quoted = !quoted;
    if (!quoted && ch === '(') depth++;
    if (!quoted && ch === ')') depth--;
    if (ch === ',' && !depth && !quoted) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const quoted = s => [...(s ?? '').matchAll(/"([^"]*)"/g)].map(m => m[1]);

/** "badge critical \"Overdue since {due}\"" → { tone: 'critical', text: 'Overdue since {due}' }; "none" → null */
function part(s) {
  if (!s || s.trim().toLowerCase() === 'none') return null;
  const words = s.trim().split(/\s+/);
  const isBadge = words[0] === 'badge';
  const tone = isBadge ? words[1] : words[0];
  return { tone, text: quoted(s)[0] ?? '' };
}

/** "Extend (primary, disabled), Cancel (tertiary)" → [{ label, variant, disabled, condition }] */
function actions(s) {
  if (!s || s.trim().toLowerCase() === 'none') return [];
  return splitTop(s).map(a => {
    const open = a.indexOf('(');
    const close = a.indexOf(')', open);
    const label = (open >= 0 ? a.slice(0, open) : a).trim();
    const inside = open >= 0 ? a.slice(open + 1, close).split(',').map(x => x.trim()) : [];
    return { label, variant: inside[0] ?? '', disabled: inside.includes('disabled'), condition: close >= 0 ? a.slice(close + 1).trim() : '' };
  });
}

function bullets(block) {
  const out = {};
  for (const line of block.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('- ')) continue;
    const at = t.indexOf(': ');
    if (at > 2) out[t.slice(2, at)] = t.slice(at + 2);
  }
  return out;
}

function screen(file) {
  const text = readFileSync(join(specDir, 'screens', file), 'utf8');
  const name = file.replace(/\.md$/, '');
  const top = bullets(text.split('\n## ')[0]);
  const statesText = text.split('\n## States')[1]?.split('\n## ')[0] ?? '';
  const states = statesText.split('\n### ').slice(1).map(block => {
    const [heading] = block.split('\n');
    const id = heading.split(' ')[0];
    const b = bullets(block);
    return {
      id, name: heading.slice(id.length).trim(), when: b.When ?? '',
      status: part(b.Status), banner: part(b.Banner), dialog: b.Dialog ? quoted(b.Dialog)[0] : null,
      actions: actions(b.Actions), says: quoted(b.Says), rules: list(b.Rules), goals: list(b.Goals),
    };
  });
  const examplesText = text.split('\n## Examples')[1] ?? '';
  const examples = tables(examplesText)[0] ?? [];
  return {
    name, file: `spec/screens/${file}`, title: text.split('\n')[0].replace(/^# Screen: /, ''),
    template: top.Template ?? '', roles: list(top.Roles), goals: list(top.Goals), never: list(top['Never shows']),
    states, examples,
  };
}

function flow(file) {
  const text = readFileSync(join(specDir, 'flows', file), 'utf8');
  const top = bullets(text.split('\n## ')[0]);
  const steps = (tables(text.split('\n## Steps')[1] ?? '')[0] ?? []).map(r => ({
    id: r.Step, who: r.Who, what: r['What happens'], screen: r.Screen === '-' ? '' : r.Screen,
    states: list(r.States), next: r.Next, to: [...r.Next.matchAll(/F-\d{2}/g)].map(m => m[0]), ends: /\bend\b/.test(r.Next),
  }));
  return {
    name: file.replace(/\.md$/, ''), file: `spec/flows/${file}`, title: text.split('\n')[0].replace(/^# Flow: /, ''),
    trigger: top.Trigger ?? '', ends: top.Ends ?? '', roles: list(top.Roles), goals: list(top.Goals), steps,
  };
}

const table = file => tables(readFileSync(join(specDir, file), 'utf8'))[0] ?? [];

/** The whole spec. */
export function readSpec() {
  const sources = readdirSync(join(specDir, 'sources')).filter(f => f.endsWith('.md') && f !== 'README.md')
    .flatMap(f => (tables(readFileSync(join(specDir, 'sources', f), 'utf8'))[0] ?? []).map(r => ({ ...r, file: `spec/sources/${f}` })));
  return {
    goals: table('goals.md'), roles: table('roles.md'), rules: table('rules.md'), decisions: table('decisions.md'),
    questions: table('questions.md'), glossary: table('glossary.md'), sources,
    flows: readdirSync(join(specDir, 'flows')).filter(f => f.endsWith('.md')).sort().map(flow),
    screens: readdirSync(join(specDir, 'screens')).filter(f => f.endsWith('.md')).sort().map(screen),
  };
}
