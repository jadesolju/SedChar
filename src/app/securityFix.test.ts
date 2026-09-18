import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security Fix - Inline Script Vulnerability', () => {
  it('layout.tsx should not contain dangerouslySetInnerHTML for script execution', () => {
    const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

    expect(layoutContent).not.toContain('dangerouslySetInnerHTML');
    expect(layoutContent).toContain('<script src="/scripts/theme-init.js" />');
  });

  it('theme-init.js script should exist in public/scripts/ directory', () => {
    const scriptPath = path.join(process.cwd(), 'public/scripts/theme-init.js');
    expect(fs.existsSync(scriptPath)).toBe(true);

    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
    expect(scriptContent).toContain('localStorage.getItem(\'sedchar-theme\')');
    expect(scriptContent).toContain('navigator.serviceWorker');
  });
});
