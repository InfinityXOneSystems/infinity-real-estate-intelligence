import fs from 'fs';
import path from 'path';

jest.mock('child_process', () => ({
  execSync: (cmd: string) => {
    const c = String(cmd);
    if (c.startsWith('git rev-parse')) return 'deadbeef\n';
    if (c === 'npm --version') return '9.9.9\n';
    if (c.includes('npm run lint')) return 'eslint: OK\n';
    if (c.includes('npm test')) return JSON.stringify({ numTotalTests: 1, numPassedTests: 1 }) + '\n';
    if (c.includes('npm run build')) return 'tsc: OK\n';
    if (c.includes('hardhat')) return 'Compiled 0 files\n';
    return '';
  }
}));

describe('final validation report', () => {
  const outPath = path.resolve(__dirname, '..', '..', 'docs', 'system', 'FINAL_VALIDATION_REPORT.md');

  afterAll(() => {
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
  });

  test('writes report file with expected content (deterministic)', async () => {
    const modulePath = path.resolve(__dirname, '../../scripts/full-validation.js');
    const scriptModule = (await import(modulePath)) as unknown as { writeReport: (content: string) => string | void };

    const content = `# FINAL VALIDATION REPORT
- Commit: deadbeef
- Node: v22.21.1
- npm: 9.9.9

## Summary
- **lint**: passed
- **test**: passed
- **build**: passed
- **contracts**: passed
`;

    scriptModule.writeReport(content);

    expect(fs.existsSync(outPath)).toBe(true);
    const s = fs.readFileSync(outPath, 'utf8');
    expect(s).toContain('# FINAL VALIDATION REPORT');
    expect(s).toContain('- Commit: deadbeef');
    expect(s).toContain('- **lint**: passed');
    expect(s).toContain('## Summary');
  });
});
