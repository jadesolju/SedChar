import { describe, it, expect, vi } from 'vitest';
// @ts-ignore
import { getAuthConfig, resolveCredentials } from '../scripts/push.js';

describe('scripts/push.js security credential handling', () => {
  it('should construct auth config using token as password if no explicit password provided', () => {
    const auth = getAuthConfig('my-secret-token');
    expect(auth).toEqual({
      username: 'my-secret-token',
      password: 'my-secret-token',
    });
  });

  it('should use explicit username and password when provided', () => {
    const auth = getAuthConfig('my-token', 'custom-password', 'custom-user');
    expect(auth).toEqual({
      username: 'custom-user',
      password: 'custom-password',
    });
  });

  it('should resolve credentials from GITHUB_TOKEN environment variable', async () => {
    const mockEnv = { GITHUB_TOKEN: 'ghp_envtoken123' };
    const auth = await resolveCredentials({ env: mockEnv, argv: ['node', 'push.js'] });
    expect(auth).toEqual({
      username: 'ghp_envtoken123',
      password: 'ghp_envtoken123',
    });
  });

  it('should resolve credentials from GH_TOKEN environment variable', async () => {
    const mockEnv = { GH_TOKEN: 'ghp_ghtoken456' };
    const auth = await resolveCredentials({ env: mockEnv, argv: ['node', 'push.js'] });
    expect(auth).toEqual({
      username: 'ghp_ghtoken456',
      password: 'ghp_ghtoken456',
    });
  });

  it('should respect explicit GIT_PASSWORD environment variable', async () => {
    const mockEnv = { GITHUB_TOKEN: 'ghp_envtoken123', GIT_PASSWORD: 'explicit_password' };
    const auth = await resolveCredentials({ env: mockEnv, argv: ['node', 'push.js'] });
    expect(auth).toEqual({
      username: 'ghp_envtoken123',
      password: 'explicit_password',
    });
  });

  it('should fallback to CLI argument when env vars are missing', async () => {
    const mockEnv = {};
    const mockArgv = ['node', 'push.js', 'token_from_argv'];
    const auth = await resolveCredentials({ env: mockEnv, argv: mockArgv });
    expect(auth).toEqual({
      username: 'token_from_argv',
      password: 'token_from_argv',
    });
  });

  it('should prompt user for token when env vars and CLI args are missing', async () => {
    const mockEnv = {};
    const mockArgv = ['node', 'push.js'];
    const mockPrompt = vi.fn().mockResolvedValue('token_from_prompt');

    const auth = await resolveCredentials({ env: mockEnv, argv: mockArgv, prompt: mockPrompt });
    expect(mockPrompt).toHaveBeenCalledWith('🔑 กรุณากรอก GitHub Personal Access Token (PAT): ');
    expect(auth).toEqual({
      username: 'token_from_prompt',
      password: 'token_from_prompt',
    });
  });

  it('should return null if no token is supplied and prompt returns empty', async () => {
    const mockEnv = {};
    const mockArgv = ['node', 'push.js'];
    const mockPrompt = vi.fn().mockResolvedValue('');

    const auth = await resolveCredentials({ env: mockEnv, argv: mockArgv, prompt: mockPrompt });
    expect(auth).toBeNull();
  });
});
