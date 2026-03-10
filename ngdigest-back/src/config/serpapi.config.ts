import { registerAs } from '@nestjs/config';

export default registerAs('serpapi', () => ({
  apiKey: process.env['SERPAPI_KEY'] ?? '',
}));
