import { registerAs } from '@nestjs/config';

const appConfig = registerAs('app', () => ({
  env: (process.env?.APP_ENV ?? process.env?.NODE_ENV) || 'local',
  host: process.env?.host || 'localhost',
  port: process.env?.port || '3000',
  appUrl: process.env?.APP_URL,
  clientAppUrl: process.env?.CLIENT_APP_URL,
  mongodbConnectionString: process.env?.MONGODB_CONNECTION_STRING || '',
  media: {
    endpoint: process.env?.MEDIA_ENDPOINT,
    secretAccessKey: process.env?.MEDIA_SECRET_ACCESS_KEY,
    accessKeyId: process.env?.MEDIA_ACCESS_KEY_ID,
    bucket: process.env?.MEDIA_BUCKET,
  },
  mail: {
    username: process.env?.MAIL_USERNAME,
    password: process.env?.MAIL_PASSWORD,
    defaultFrom: process.env?.MAIL_DEFAULT_FROM,
    host: process.env?.MAIL_HOST,
    port: process.env?.MAIL_PORT,
    defaultBCC: process?.env?.MAIL_DEFAULT_BCC,
    defaultReportingTo: process?.env?.MAIL_REPORTING_TO,
  },
  zerobounceApiKeys: (process.env?.ZEROBOUNCE_API_KEYS || '').split(' '),
  keycloak: {
    baseUrl: process.env?.KEYCLOAK_BASE_URL,
    realm: process.env?.KEYCLOAK_REALM,
    clientId: process.env?.KEYCLOAK_CLIENT_ID,
    clientSecret: process.env?.KEYCLOAK_CLIENT_SECRET,
  },
}));

export { appConfig };
