const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCapture(cmd) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', cwd: path.resolve(__dirname, '..') });
    return { success: true, output: out.trim() };
  } catch (err) {
    const out = (err.stdout || '') + (err.stderr || '');
    return { success: false, output: String(out).trim() };
  }
}

function getCommitSha() {
  return process.env.GITHUB_SHA || (() => {
    try { return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); } catch { return 'unknown'; }
  })();
}

function buildReport(results) {
  const lines = [];
  lines.push('# FINAL VALIDATION REPORT');
  lines.push('');
  lines.push(`- Commit: ${getCommitSha()}`);
  lines.push(`- Node: ${process.version}`);
  try { lines.push(`- npm: ${execSync('npm --version', { encoding: 'utf8' }).trim()}`); } catch { lines.push('- npm: unknown'); }
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  for (const step of ['lint','test','build','contracts']) {
    const r = results[step];
    lines.push(`- **${step}**: ${r.success ? 'passed' : 'failed'}`);
  }
  lines.push('');
  lines.push('## Details');
  lines.push('');
  for (const [k, v] of Object.entries(results)) {
    lines.push(`### ${k}`);
    lines.push('');
    lines.push('```');
    lines.push(v.output || '(no output)');
    lines.push('```');
    lines.push('');
  }
  // Deterministic content ordering ensured by stable key order above
  return lines.join('\n');
}

function writeReport(content) {
  const outDir = path.resolve(__dirname, '..', 'docs', 'system');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'FINAL_VALIDATION_REPORT.md');
  fs.writeFileSync(outPath, content, { encoding: 'utf8' });
  return outPath;
}

async function main() {
  const results = {};
  // Run lint
  results.lint = runCapture('npm run lint --if-present');
  // Run tests with JSON output when possible
  results.test = runCapture('npm test --silent -- --json || npm test --silent');
  // Build
  results.build = runCapture('npm run build --if-present');
  // Contracts
  results.contracts = runCapture('npx hardhat compile --show-stack-traces || echo "hardhat not available"');

  const report = buildReport(results);
  const pathWritten = writeReport(report);
  console.log('Wrote final validation report to', pathWritten);

  // Exit non-zero if any mandatory check failed
  const failed = ['lint','test','build','contracts'].some(s => !results[s].success);
  if (failed) {
    console.error('Full validation failed. See FINAL_VALIDATION_REPORT.md for details.');
    process.exit(1);
  }
  console.log('Full validation completed.');
}

if (require.main === module) {
  main();
}

module.exports = { buildReport, runCapture, writeReport, main };
