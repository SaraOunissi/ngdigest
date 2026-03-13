declare const process: { env: Record<string, string | undefined> };

export const environment = {
  production: true,
  apiUrl: process.env['NG_APP_API_URL'] ?? '',
};
