import 'dotenv/config'
import mongoose from 'mongoose'
import { createApp } from './app.js'
import cors from 'cors';
import { startPdfCleanupCron } from './utils/pdfCleanupCron.js';

const PORT     = process.env.PORT     || 3002
const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('❌ MONGO_URI missing from .env')
  process.exit(1)
}

async function bootstrap() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ MongoDB Connected')
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message)
    process.exit(1)
  }

  const app = createApp()

  app.listen(PORT, () => {
    console.log(`🌱 ESGIQ API running on port ${PORT}`)
    console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`)
    startPdfCleanupCron();
  })
}

bootstrap()