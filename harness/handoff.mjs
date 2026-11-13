// Writes the engineering handoff for each screen, from the spec alone: handoff/<screen>.md.
// Nobody edits a handoff by hand. A change goes into the spec, and the handoff is written again.
// Usage: npm run handoff
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { list, readSpec, root } from './spec.mjs';

const spec = readSpec();
const byId = new Map([...spec.goals, ...spec.roles, ...spec.rules, ...spec.decisions, ...spec.questions, ...spec.sources].map(r => [r.ID, r]));
const roleName = id => byId.get(id)?.Role ?? id;
const day = d => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const facts = ['Received', 'Extended on', 'Proof asked on', 'Answered on'];

function given(row) {
  const parts = facts.filter(f => row[f] && row[f] !== '-').map(f => `${f.toLowerCase()} ${day(row[f])}`);
  const dialog = row.Dialog && row.Dialog !== '-' ? `, with the ${row.Dialog} dialog open and no reason written` : '';
  return `a request ${parts.join(', ')}, opened by the ${roleName(row.Viewer).toLowerCase()} on ${day(row.Today)}${dialog}`;
}

// The flow as a Mermaid flowchart, drawn from the steps table: GitHub shows it as a diagram.
const label = t => t.replaceAll('"', "'");
const node = id => id.replace('-', '');
function mermaid(f) {
  const out = ['```mermaid', 'flowchart TD', `  T(["${label(f.trigger)}"])`, `  T --> ${node(f.steps[0].id)}`];
  for (const x of f.steps) {
    const text = `${x.id} ${label(x.what)}${x.states.length ? `<br/>${x.states.join(', ')}` : ''}`;
    out.push(x.screen ? `  ${node(x.id)}["${text}"]` : `  ${node(x.id)}{"${text}"}`);
  }
  for (const x of f.steps) {
    for (const part of x.next.split(/;|, or /).map(p => p.trim())) {
      const to = part.match(/F-\d{2}/)?.[0];
      if (!to) continue;
      const why = part.replace(to, '').replace(':', '').trim();
      out.push(why ? `  ${node(x.id)} -- "${label(why)}" --> ${node(to)}` : `  ${node(x.id)} --> ${node(to)}`);
    }
    if (x.ends) out.push(`  ${node(x.id)} --> E(["${label(f.ends)}"])`);
  }
  out.push('```');
  return out;
}

mkdirSync(join(root, 'handoff'), { recursive: true });
for (const s of spec.screens) {
  const rules = [...new Set(s.states.flatMap(st => st.rules))].sort().map(id => byId.get(id));
  const cited = new Set(rules.flatMap(r => r.Sources.split(',').map(x => x.trim())));
  const lines = [
    `# Handoff: ${s.title}`,
    '',
    `Written by \`npm run handoff\` from \`${s.file}\` and the files it cites. Do not edit it: change the spec and run it again.`,
    '',
    '## The screen',
    '',
    `- Template: ${s.template} (ai-ready-design-system, \`contracts/${s.template}.md\`)`,
    `- Used by: ${s.roles.map(r => `${roleName(r)} (${r})`).join(', ')}`,
    `- Goals: ${s.goals.map(g => `${byId.get(g).Goal} (${g})`).join('; ')}`,
    `- Never shows: ${s.never.join(', ')}`,
    '',
    ...spec.flows.filter(f => f.steps.some(x => x.screen === s.name)).flatMap(f => [
      `## Flow: ${f.title}`,
      '',
      `From \`${f.file}\`. Starts when ${f.trigger}. Each box names the states of this screen it lands on.`,
      '',
      ...mermaid(f),
      '',
    ]),
    '## Rules',
    '',
    'Each rule is a requirement. Its sources say why, so a change upstream finds this screen.',
    '',
    '| ID | Rule | Sources |',
    '|---|---|---|',
    ...rules.map(r => `| ${r.ID} | ${r.Rule} | ${r.Sources} |`),
    '',
    '## States',
    '',
    'When two states could apply, the first one wins.',
    '',
    '| ID | State | When | Status | Actions |',
    '|---|---|---|---|---|',
    ...s.states.map(st => `| ${st.id} | ${st.name} | ${st.when} | ${st.status ? `${st.status.tone}: "${st.status.text}"` : 'none'} | ${st.actions.length ? st.actions.map(a => `${a.label} (${a.variant}${a.disabled ? ', disabled' : ''})${a.condition ? ` ${a.condition}` : ''}`).join(', ') : 'none'} |`),
    '',
    '## Acceptance tests',
    '',
    `One per example in the spec. \`npm run behaviour\` runs every one of them against the built screen.`,
    '',
    ...s.examples.flatMap(e => {
      const st = s.states.find(x => x.id === e.State);
      const acts = list(e.Actions);
      return [`- **${e.Example}.** Given ${given(e)}. Then the due date is ${day(e.Due)}, the screen is in ${e.State} ${st?.name ?? ''}, and it offers ${acts.length ? acts.join(', ') : 'no action'}.`];
    }),
    '',
    '## Decisions behind it',
    '',
    ...[...cited].filter(id => id.startsWith('D-')).sort().map(id => `- **${id}.** ${byId.get(id).Decision}`),
    '',
    '## Open questions',
    '',
    'Built as "meanwhile" says. When the answer comes, the spec changes in one place, and this handoff with it.',
    '',
    ...[...cited].filter(id => id.startsWith('Q-')).sort().map(id => `- **${id}.** ${byId.get(id).Question} Meanwhile, ${byId.get(id).Meanwhile.charAt(0).toLowerCase()}${byId.get(id).Meanwhile.slice(1)}.`),
    '',
    '## Official rules',
    '',
    ...[...cited].filter(id => byId.get(id)?.file).sort().map(id => `- **${id}** (${byId.get(id).Source}, ${byId.get(id).Mark}): ${byId.get(id).Rule}`),
    '',
  ];
  writeFileSync(join(root, 'handoff', `${s.name}.md`), lines.join('\n'));
  console.log(`handoff/${s.name}.md`);
}
