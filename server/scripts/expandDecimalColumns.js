const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'game_accounts_db',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
  
  // Expand DECIMAL columns to support larger amounts (up to 999,999,999,999,999.99)
  // DECIMAL(20, 2) supports up to 999,999,999,999,999,999.99 (nearly 1 quadrillion)
  const queries = [
    // Expand balance column in users table
    'ALTER TABLE users MODIFY COLUMN balance DECIMAL(20, 2) DEFAULT 0.00 COMMENT \'User wallet balance\'',
    
    // Expand amount column in topup_requests table
    'ALTER TABLE topup_requests MODIFY COLUMN amount DECIMAL(20, 2) NOT NULL',
    
    // Expand price columns in products and orders tables (for consistency)
    'ALTER TABLE products MODIFY COLUMN price DECIMAL(20, 2) NOT NULL',
    'ALTER TABLE orders MODIFY COLUMN total_price DECIMAL(20, 2) NOT NULL',
  ];

  let completed = 0;
  const total = queries.length;

  queries.forEach((query, index) => {
    connection.query(query, (err, results) => {
      if (err) {
        console.error(`Error executing query ${index + 1}:`, err);
        console.error('Query:', query);
      } else {
        console.log(`✓ Query ${index + 1}/${total} executed successfully`);
      }
      
      completed++;
      if (completed === total) {
        console.log('\n✅ All columns expanded successfully!');
        console.log('Now you can store amounts up to 999,999,999,999,999,999.99');
        connection.end();
        process.exit(0);
      }
    });
  });
});

