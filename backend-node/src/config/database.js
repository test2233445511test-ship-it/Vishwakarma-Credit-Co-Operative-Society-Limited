import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message)
})

export async function connectDB() {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    client.release()
    console.log(`[DB] Connected at ${result.rows[0].now}`)
    return pool
  } catch (err) {
    console.error('[DB] Connection failed:', err.message)
    throw err
  }
}

export async function query(text, params) {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] Query (${duration}ms):`, text.substring(0, 80))
    }
    return result
  } catch (err) {
    console.error('[DB] Query error:', err.message)
    throw err
  }
}

export async function getClient() {
  return pool.connect()
}

export default pool
