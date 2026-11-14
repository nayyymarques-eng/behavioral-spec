// Gate 2, on the built screen: run on every pull request that touches a screen or the spec.
// For each example row in spec/screens/<screen>.md, it builds the screen with those facts, opens it in headless
// Chromium and checks what shows against the state the row names. Each failure names the check, the example and where.
// Usage: npm run behaviour
import { createRequire } from 'node:module';
import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { list, readSpec, root } from './spec.mjs';
import { renderExamples, out } from './render.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const ds = 'node_modules/ai-ready-design-system';

const day = d => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const daysTo = (from, to) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/** Fills the {words} of a screen from an example row. */
function fill(text, row) {
  const left = daysTo(row.Today, row.Due);
  const words = {
    due: day(row.Due), received: day(row.Received),
    asked: row['Proof asked on'] !== '-' ? day(row['Proof asked on']) : '', answered: row['Answered on'] !== '-' ? day(row['Answered on']) : '',
    in: left === 0 ? 'today' : left === 1 ? 'tomorrow' : `in ${left} days`,
  };
  return text.replace(/\{([a-z]+)\}/g, (m, w) => words[w] ?? m);
}

function readPage() {
  const text = el => el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
  const root = document.querySelector('[data-state]');
  const dialog = document.querySelector('.dialog-backdrop:not([hidden]) .dialog');
  const badge = document.querySelector('.page-header .badge');
  const banner = document.querySelector('.banner');
  const scope = dialog ?? document.querySelector('.page-header__actions');
  const buttons = scope ? [...scope.querySelectorAll('button.btn')].map(b => ({ label: text(b), variant: [...b.classList].find(c => c.startsWith('btn--'))?.slice(5), disabled: b.disabled })) : [];
  return {
    state: root?.dataset.state ?? null,
    template: document.querySelector('[data-template]')?.dataset.template ?? null,
    badge: badge ? { tone: [...badge.classList].find(c => c.startsWith('badge--'))?.slice(7) ?? 'none', text: text(badge) } : null,
    banner: banner ? { tone: [...banner.classList].find(c => c.startsWith('banner--'))?.slice(8) ?? 'info', text: text(banner) } : null,
    dialog: dialog ? text(dialog.querySelector('.dialog__title')) : null,
    buttons, body: text(document.body),
  };
}

export async function checkBehaviour() {
  const spec = readSpec();
  const fails = [];
  let checked = 0;
  rmSync(out, { recursive: true, force: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const screen of spec.screens) {
    const where = `${screen.file}, screens/${screen.name}.tsx`;
    const fail = (id, ex, what) => fails.push(`${id} ${ex} (${what})  ← ${where}`);
    const pages = await renderExamples(screen, join(out, 'pages'), `../../${ds}`);
    if (!pages) { fails.push(`BEH-01 (no screens/${screen.name}.tsx for the spec)  ← ${screen.file}`); continue; }

    // BEH-08: the code knows only the states the spec has.
    const code = readFileSync(join(root, 'src', `${screen.name}.ts`), 'utf8');
    const inCode = new Set(code.match(/ST-\d{2}/g) ?? []);
    const inSpec = new Set(screen.states.map(s => s.id));
    for (const id of inCode) if (!inSpec.has(id)) fail('BEH-08', 'code', `the code has ${id}, which the spec does not`);

    for (const { row, file, logic } of pages) {
      checked++;
      const ex = row.Example;
      const want = screen.states.find(s => s.id === row.State);
      // BEH-07: the rules, before anything is drawn: due date, state and actions from the code alone.
      if (logic.due !== row.Due) fail('BEH-07', ex, `due date ${logic.due}, the spec says ${row.Due}`);
      if (logic.state !== row.State) fail('BEH-07', ex, `state ${logic.state}, the spec says ${row.State}`);
      const wantLabels = list(row.Actions);
      if (logic.actions.join(', ') !== wantLabels.join(', ')) fail('BEH-07', ex, `actions "${logic.actions.join(', ')}", the spec says "${wantLabels.join(', ')}"`);

      await page.goto(pathToFileURL(file).href);
      const got = await page.evaluate(readPage);
      // BEH-01: the screen shows the state the spec names.
      if (got.state !== row.State) { fail('BEH-01', ex, `the screen is in ${got.state}, the spec says ${row.State}`); continue; }
      // BEH-02: the template.
      if (got.template !== screen.template) fail('BEH-02', ex, `template ${got.template}, the spec says ${screen.template}`);
      // BEH-03: the status.
      if (want.status) {
        const text = fill(want.status.text, row);
        if (!got.badge || got.badge.tone !== want.status.tone || got.badge.text !== text) fail('BEH-03', ex, `status ${got.badge ? `${got.badge.tone} "${got.badge.text}"` : 'none'}, the spec says ${want.status.tone} "${text}"`);
      } else if (got.badge) fail('BEH-03', ex, `status "${got.badge.text}", the spec says none`);
      // BEH-04: the banner.
      if (want.banner) {
        const text = fill(want.banner.text, row);
        if (!got.banner || got.banner.tone !== want.banner.tone || got.banner.text !== text) fail('BEH-04', ex, `banner ${got.banner ? `${got.banner.tone} "${got.banner.text}"` : 'none'}, the spec says ${want.banner.tone} "${text}"`);
      } else if (got.banner) fail('BEH-04', ex, `banner "${got.banner.text}", the spec says none`);
      // BEH-05: the dialog and the buttons, in order, each with its variant, disabled where the spec says.
      if ((want.dialog ?? null) !== got.dialog) fail('BEH-05', ex, `dialog "${got.dialog}", the spec says "${want.dialog}"`);
      const labels = got.buttons.map(b => b.label);
      if (labels.join(', ') !== wantLabels.join(', ')) fail('BEH-05', ex, `buttons "${labels.join(', ')}", the spec says "${wantLabels.join(', ')}"`);
      for (const b of got.buttons) {
        const a = want.actions.find(x => x.label === b.label);
        if (a && (a.variant !== b.variant || a.disabled !== b.disabled)) fail('BEH-05', ex, `"${b.label}" is ${b.variant}${b.disabled ? ', disabled' : ''}, the spec says ${a.variant}${a.disabled ? ', disabled' : ''}`);
      }
      // BEH-06: the words that must show, and the ones that never may.
      for (const s of want.says) if (!got.body.includes(fill(s, row))) fail('BEH-06', ex, `"${fill(s, row)}" is missing`);
      for (const n of screen.never) if (got.body.toLowerCase().includes(n.toLowerCase())) fail('BEH-06', ex, `shows "${n}"`);
    }
  }
  await browser.close();
  return { fails, checked };
}

const { fails, checked } = await checkBehaviour();
console.log(`Behaviour: ${checked} examples checked.`);
if (fails.length) { console.log(fails.join('\n')); console.log(`FAIL: ${fails.length}`); process.exit(1); }
console.log('PASS: BEH-01 to BEH-08');
