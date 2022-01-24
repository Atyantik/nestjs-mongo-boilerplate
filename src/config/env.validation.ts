import * as Joi from 'joi';

const configValidator = Joi.object({
  APP_ENV: Joi.string()
    .valid('production', 'staging', 'test', 'development', 'local')
    .optional()
    .default('development'),
  APP_URL: Joi.string().uri().required(),
  CLIENT_APP_URL: Joi.string().uri().required(),
  PORT: Joi.number().optional().default(3000),
  MONGODB_CONNECTION_STRING: Joi.string().required(),

  // Media config
  MEDIA_ENDPOINT: Joi.string().required(),
  MEDIA_SECRET_ACCESS_KEY: Joi.string().required(),
  MEDIA_ACCESS_KEY_ID: Joi.string().required(),
  MEDIA_BUCKET: Joi.string().required(),

  // Mail config
  MAIL_USERNAME: Joi.string().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_DEFAULT_FROM: Joi.string().required(),
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.string().required(),
  MAIL_DEFAULT_BCC: Joi.string().required(),
  MAIL_REPORTING_TO: Joi.string().required(),

  // Zerobounce keys
  ZEROBOUNCE_API_KEYS: Joi.string().required(),

  // Keycloak realm settings
  KEYCLOAK_REALM: Joi.string().required(),
  KEYCLOAK_BASE_URL: Joi.string().uri().required(),
  KEYCLOAK_CLIENT_ID: Joi.string().required(),
  KEYCLOAK_CLIENT_SECRET: Joi.string().required(),
});

export { configValidator };
