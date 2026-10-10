import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const tscEntrypoint = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));
const viteConfig = fileURLToPath(new URL('../vite.config.ts', import.meta.url));

// Invoke package JavaScript through Node rather than depending on executable
// permissions of npm's generated node_modules/.bin shims (notably on CI hosts).
execFileSync(process.execPath, [tscEntrypoint, '-b'], {
  cwd: projectRoot,
  stdio: 'inherit',
});

if (!process.argv.includes('--typecheck')) {
  const { build } = await import('vite');
  await build({ configFile: viteConfig, root: projectRoot });
}
