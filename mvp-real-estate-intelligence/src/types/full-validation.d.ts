declare module '../../../scripts/full-validation.js' {
  export interface Captured {
    exitCode: number;
    stdout: string;
    stderr: string;
  }

  export function buildReport(results: Record<string, unknown>): string;
  export function runCapture(cmd: string): Captured;
  export function writeReport(path: string, content: string): void;
  export function main(): Promise<number>;

  const _default: {
    buildReport: typeof buildReport;
    runCapture: typeof runCapture;
    writeReport: typeof writeReport;
    main: typeof main;
  };

  export default _default;
}
