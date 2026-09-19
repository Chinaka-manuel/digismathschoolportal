import mongoose from 'mongoose'
import app from './app.js'
import { env } from './config/env.js'

async function start() {
  if (env.nodeEnv === 'production' && (!process.env.MONGO_URI || process.env.JWT_ACCESS_SECRET?.startsWith('replace-') || process.env.JWT_REFRESH_SECRET?.startsWith('replace-'))) throw new Error('Production configuration is incomplete')
  if (env.mongoUri) await mongoose.connect(env.mongoUri)
  app.listen(env.port, () => console.log(`Northbridge API listening on port ${env.port}`))
}

start().catch((error) => { console.error('Unable to start server', error); process.exit(1) })
