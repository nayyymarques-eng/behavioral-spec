// Renders a screen once per example row of its spec, as static HTML, for the behaviour check and the design system check.
import { build } from 'esbuild';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { root } from './spec.mjs';

export const out = join(root, '.behaviour');

/** Builds a screen's module, renders one HTML page per example, and returns the pages. */
export async function renderExamples(screen, dir, cssBase) {
  const entry = join(root, 'screens', `${screen.name}.tsx`);
  if (!existsSync(entry)) return null;
  const outfile = join(out, `${screen.name}.mjs`);
  await build({ entryPoints: [entry], outfile, bundle: true, platform: 'node', format: 'esm', jsx: 'automatic', logLevel: 'silent', external: ['react', 'react-dom'] });
  const mod = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { createElement } = await import('react');
  mkdirSync(dir, { recursive: true });
  return screen.examples.map(row => {
    const props = mod.fromExample(row);
    const body = renderToStaticMarkup(createElement(mod.Screen, props));
    const file = join(dir, `${screen.name}-${row.Example}.html`);
    writeFileSync(file, `<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${screen.title}, ${row.Example}</title>\n<link rel="stylesheet" href="${cssBase}/tokens.css">\n<link rel="stylesheet" href="${cssBase}/components.css">\n</head>\n<body>\n${body}\n</body>\n</html>\n`);
    return { row, file, logic: mod.behaviour(props) };
  });
}

