import '@testing-library/jest-dom';

if (!globalThis.fetch) {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => '',
    })
  ) as unknown as typeof fetch;
}
