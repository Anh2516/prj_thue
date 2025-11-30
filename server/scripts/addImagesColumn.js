const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function addImagesColumn() {
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
       AND TABLE_NAME = 'products' 
       AND COLUMN_NAME = 'images'`,
      [process.env.DB_NAME || 'game_accounts_db']
    );

    if (columns.length > 0) {
      console.log('Column "images" already exists in products table');
      return;
    }

    // Add column if it doesn't exist
    await connection.query(`
      ALTER TABLE products 
      ADD COLUMN images TEXT DEFAULT NULL 
      COMMENT 'JSON array of image URLs'
    `);

    console.log('Successfully added "images" column to products table');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column "images" already exists in products table');
    } else {
      console.error('Error adding images column:', error);
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
addImagesColumn()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

