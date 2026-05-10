const { execFileSync } = require('child_process');
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const roots = ['apps/api/src', 'scripts'];
const files = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.js')) files.push(full);
  }
}

roots.forEach(walk);
files.forEach((file) => execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' }));
console.log(`Syntax check passed for ${files.length} JavaScript files.`);
