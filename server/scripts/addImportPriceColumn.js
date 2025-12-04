const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function addImportPriceColumn() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'game_accounts_db',
    });

    console.log('Connected to MySQL database');

    // Kiểm tra cột import_price đã tồn tại chưa
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? 
         AND TABLE_NAME = 'products'
         AND COLUMN_NAME = 'import_price'`,
      [process.env.DB_NAME || 'game_accounts_db']
    );

    if (columns.length > 0) {
      console.log('Column "import_price" already exists in products table');
      return;
    }

    // Thêm cột import_price sau account_level
    await connection.query(`
      ALTER TABLE products
      ADD COLUMN import_price DECIMAL(20, 2) DEFAULT 0.00
      COMMENT 'Giá nhập (giá vốn) của sản phẩm'
      AFTER account_level
    `);

    console.log('Successfully added "import_price" column to products table');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column "import_price" already exists in products table');
    } else {
      console.error('Error adding import_price column:', error);
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
addImportPriceColumn()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });


