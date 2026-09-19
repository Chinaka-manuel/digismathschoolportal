import 'dotenv/config'

const bool = (value, fallback = false) => (value === undefined ? fallback : value === 'true')

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // Comma-separated list of extra origins allowed through CORS in production.
  corsOrigins: (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean),
  accessSecret: process.env.JWT_ACCESS_SECRET || 'development-access-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret',
  cookieSecure: process.env.NODE_ENV === 'production',
  logToFile: bool(process.env.LOG_TO_FILE, false),

  payments: {
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
    paystackSecret: process.env.PAYSTACK_SECRET_KEY || '',
    stripeSecret: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
    paypalSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    paypalWebhookId: process.env.PAYPAL_WEBHOOK_ID || '',
  },

  email: {
    provider: process.env.EMAIL_PROVIDER || 'resend',
    apiKey: process.env.EMAIL_API_KEY || '',
    from: process.env.EMAIL_FROM || 'no-reply@northbridge.edu',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  ai: {
    apiKey: process.env.AI_API_KEY || '',
    provider: process.env.AI_PROVIDER || 'none',
  },

  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
}

// Kept for the modules that still read the flat name.
env.paymentWebhookSecret = env.payments.webhookSecret
