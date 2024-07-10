
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env' });
} else {
  dotenv.config({ path: '.env.production.local' });
}

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(','),
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'x-api-key', 'x-api-host'],
  methods: 'GET,POST,PUT,DELETE,PATCH',
  credentials: true,
  preflightContinue: false,
};

module.exports = corsOptions;
