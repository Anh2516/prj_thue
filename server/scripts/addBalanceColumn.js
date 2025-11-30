const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function addBalanceColumn() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'game_accounts_db',
    });

    console.log('Connected to MySQL database');

    // Check if column exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'users' 
       AND COLUMN_NAME = 'balance'`,
      [process.env.DB_NAME || 'game_accounts_db']
    );

    if (columns.length > 0) {
      console.log('Column "balance" already exists in users table');
      return;
    }

    // Add column if it doesn't exist
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN balance DECIMAL(10, 2) DEFAULT 0.00 
      COMMENT 'User wallet balance'
    `);

    console.log('Successfully added "balance" column to users table');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column "balance" already exists in users table');
    } else {
      console.error('Error adding balance column:', error);
      throw error;
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the migration
addBalanceColumn()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

