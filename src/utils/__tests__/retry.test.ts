import { retryWithBackoff } from '../retry';

describe('retryWithBackoff', () => {
  it('should succeed on first attempt', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(mockFn, 3);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');

    const result = await retryWithBackoff(mockFn, 3);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should throw after max retries', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('fail'));

    await expect(retryWithBackoff(mockFn, 3)).rejects.toThrow('fail');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff', async () => {
    jest.useFakeTimers();
    const mockFn = jest.fn().mockRejectedValue(new Error('fail'));

    const promise = retryWithBackoff(mockFn, 3);

    // First attempt
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Wait for first retry (1000ms)
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(mockFn).toHaveBeenCalledTimes(2);

    // Wait for second retry (2000ms)
    jest.advanceTimersByTime(2000);
    await Promise.resolve();
    expect(mockFn).toHaveBeenCalledTimes(3);

    jest.useRealTimers();
  });
});

