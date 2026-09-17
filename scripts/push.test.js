import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getToken } from './push.js';

describe('push script token retrieval', () => {
  const originalEnv = process.env;
  const originalArgv = process.argv;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GITHUB_TOKEN;
    delete process.env.GH_TOKEN;
    process.argv = ['node', 'scripts/push.js', 'SECRET_ARG_TOKEN'];
  });

  afterEach(() => {
    process.env = originalEnv;
    process.argv = originalArgv;
  });

  it('should retrieve token from GITHUB_TOKEN environment variable', async () => {
    process.env.GITHUB_TOKEN = 'test_github_token';
    const askQuestionMock = vi.fn();

    const token = await getToken(askQuestionMock);

    expect(token).toBe('test_github_token');
    expect(askQuestionMock).not.toHaveBeenCalled();
  });

  it('should retrieve token from GH_TOKEN environment variable if GITHUB_TOKEN is missing', async () => {
    process.env.GH_TOKEN = 'test_gh_token';
    const askQuestionMock = vi.fn();

    const token = await getToken(askQuestionMock);

    expect(token).toBe('test_gh_token');
    expect(askQuestionMock).not.toHaveBeenCalled();
  });

  it('should ignore process.argv[2] and prompt user if environment variables are not set', async () => {
    const askQuestionMock = vi.fn().mockResolvedValue('prompted_token');

    const token = await getToken(askQuestionMock);

    expect(token).toBe('prompted_token');
    expect(askQuestionMock).toHaveBeenCalled();
    expect(token).not.toBe('SECRET_ARG_TOKEN');
  });
});
