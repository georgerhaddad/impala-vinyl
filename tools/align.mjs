// Runs tools/align-lyrics.py with the Python in tools/.venv (Scripts/ on Windows, bin/ elsewhere): npm run align -- [stems]
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const venv = fileURLToPath(new URL('.venv', import.meta.url));
const py = process.platform === 'win32' ? join(venv, 'Scripts', 'python.exe') : join(venv, 'bin', 'python');
if (!existsSync(py)) { console.error(`no Python at ${py}: see the setup at the top of tools/align-lyrics.py`); process.exit(1); }
const r = spawnSync(py, [fileURLToPath(new URL('align-lyrics.py', import.meta.url)), ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(r.status ?? 1);
