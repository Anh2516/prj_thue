const mysql = require('mysql2/promise');
require('dotenv').config();

async function addFeaturedImageColumn() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'game_accounts_db'
    });

    console.log('Connected to database');

    // Check if column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'featured_image'
    `, [process.env.DB_NAME || 'game_accounts_db']);

    if (columns.length > 0) {
      console.log('Column featured_image already exists');
      return;
    }

    // Add featured_image column
    await connection.query(`
      ALTER TABLE products 
      ADD COLUMN featured_image VARCHAR(500) DEFAULT NULL 
      COMMENT 'URL of featured/thumbnail image for product card'
      AFTER account_info
    `);

    console.log('✅ Successfully added featured_image column to products table');
  } catch (error) {
    console.error('❌ Error adding featured_image column:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addFeaturedImageColumn()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

