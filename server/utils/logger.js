import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const logDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'logs')
const levels = { error: 0, warn: 1, info: 2, debug: 3 }
const threshold = levels[process.env.LOG_LEVEL] ?? (process.env.NODE_ENV === 'production' ? levels.info : levels.debug)

function ensureDir() {
  try { fs.mkdirSync(logDir, { recursive: true }) } catch { /* logging must never crash the process */ }
}

function write(level, message, meta) {
  if (levels[level] > threshold) return
  const entry = { level, time: new Date().toISOString(), message, ...(meta ? { meta } : {}) }
  const line = JSON.stringify(entry)
  if (level === 'error') console.error(line)
  else console.log(line)
  if (process.env.LOG_TO_FILE === 'true') {
    ensureDir()
    const file = path.join(logDir, `${new Date().toISOString().slice(0, 10)}.log`)
    try { fs.appendFileSync(file, `${line}\n`) } catch { /* ignore */ }
  }
}

export const logger = {
  error: (message, meta) => write('error', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  info: (message, meta) => write('info', message, meta),
  debug: (message, meta) => write('debug', message, meta),
}
