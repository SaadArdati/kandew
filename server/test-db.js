import pool from './src/db.js'

async function test() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users')
    console.log('Users count:', rows[0].count)
  } catch (err) {
    console.error('DB ERROR:', err)
  }
}

test()
