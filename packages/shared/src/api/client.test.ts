import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, createApiClient } from './client';

const okJson = (data: unknown) =>
  new Response(JSON.stringify(data), { status: 200 });

afterEach(() => vi.restoreAllMocks());

describe('createApiClient', () => {
  it('returns typed data on success and passes query params', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okJson([{ id: 'SO-1' }]));
    const api = createApiClient({ baseUrl: 'http://x', userId: 'c-001' });
    const orders = await api.getOrders('c-001');
    expect(orders[0]?.id).toBe('SO-1');
    const [url, init] = spy.mock.calls[0]!;
    expect(String(url)).toBe('http://x/orders?customerId=c-001');
    expect((init?.headers as Record<string, string>)['X-User-Id']).toBe('c-001');
  });

  it('maps non-2xx to ApiError(http) with status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 500 }));
    const api = createApiClient({ baseUrl: 'http://x' });
    await expect(api.getOrders('c-001')).rejects.toMatchObject({ kind: 'http', status: 500 });
  });

  it('maps fetch rejection to ApiError(network)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Network request failed'));
    const api = createApiClient({ baseUrl: 'http://x' });
    await expect(api.getOrders('c-001')).rejects.toMatchObject({ kind: 'network' });
  });

  it('maps caller abort to ApiError(abort)', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(Object.assign(new Error('Aborted'), { name: 'AbortError' })),
        );
      }),
    );
    const api = createApiClient({ baseUrl: 'http://x' });
    const controller = new AbortController();
    const promise = api.getOrders('c-001', { signal: controller.signal });
    controller.abort();
    await expect(promise).rejects.toMatchObject({ kind: 'abort' });
  });

  it('exposes user-facing copy on errors', () => {
    expect(new ApiError('network', 'x').userMessage).toMatch(/connection/i);
  });
});
