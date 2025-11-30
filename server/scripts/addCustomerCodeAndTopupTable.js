const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

async function generateCustomerCode() {
  // Generate random 8-character alphanumeric code
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

async function addCustomerCodeAndTopupTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'game_accounts_db',
    });

    console.log('Connected to MySQL database');

    // Check if customer_code column exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'users' 
       AND COLUMN_NAME = 'customer_code'`,
      [process.env.DB_NAME || 'game_accounts_db']
    );

    if (columns.length === 0) {
      // Add customer_code column
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN customer_code VARCHAR(20) UNIQUE 
        COMMENT 'Unique customer code for top-up'
      `);
      console.log('Successfully added "customer_code" column to users table');
      
      // Generate customer codes for existing users
      const [users] = await connection.query('SELECT id FROM users WHERE customer_code IS NULL');
      
      for (const user of users) {
        let code;
        let exists = true;
        
        // Generate unique code
        while (exists) {
          code = await generateCustomerCode();
          const [existing] = await connection.query(
            'SELECT id FROM users WHERE customer_code = ?',
            [code]
          );
          exists = existing.length > 0;
        }
        
        await connection.query('UPDATE users SET customer_code = ? WHERE id = ?', [code, user.id]);
        console.log(`Generated customer code ${code} for user ${user.id}`);
      }
    } else {
      console.log('Column "customer_code" already exists in users table');
    }

    // Check if topup_requests table exists
    const [tables] = await connection.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'topup_requests'`,
      [process.env.DB_NAME || 'game_accounts_db']
    );

    if (tables.length === 0) {
      // Create topup_requests table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS topup_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          customer_code VARCHAR(20) NOT NULL,
          status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          approved_at TIMESTAMP NULL,
          approved_by INT NULL,
          notes TEXT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      console.log('Successfully created "topup_requests" table');
    } else {
      console.log('Table "topup_requests" already exists');
    }

  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_ENTRY') {
      console.log('Column or table already exists');
    } else {
      console.error('Error:', error);
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
addCustomerCodeAndTopupTable()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

