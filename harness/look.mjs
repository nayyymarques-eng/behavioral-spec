// The design system's own check, on every state: renders each example and runs ai-ready-design-system's harness
// (21 checks: components, tokens, type, spacing, colour, contrast, titles, layout at 375px) on the result.
// Usage: npm run look
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { readSpec, root } from './spec.mjs';
import { renderExamples } from './render.mjs';

const ds = join(root, 'node_modules/ai-ready-design-system');
const dir = join(ds, '.states');
const json = join(ds, '.states.json');
rmSync(dir, { recursive: true, force: true });
for (const screen of readSpec().screens) await renderExamples(screen, dir, '..');
execFileSync(process.execPath, [join(ds, 'harness/score.mjs'), dir, '--json', json], { cwd: ds, stdio: 'ignore' });
const report = JSON.parse(readFileSync(json, 'utf8'));
const fails = report.flatMap(r => Object.entries(r.res).filter(([, v]) => !v.pass).map(([k, v]) => `${k} ${r.screen.replace('.html', '')} (${v.detail})  ← ai-ready-design-system`));
const passed = report.reduce((a, r) => a + r.passed, 0), applied = report.reduce((a, r) => a + r.applied, 0);
console.log(`Design system: ${report.length} states, ${passed} of ${applied} checks passed.`);
if (fails.length) { console.log(fails.join('\n')); console.log(`FAIL: ${fails.length}`); process.exit(1); }
console.log('PASS');
