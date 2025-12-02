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
  
  // List of games to keep (only these 6 games)
  const gamesToKeep = [
    'Liên Quân Mobile',
    'PUBG Mobile',
    'Free Fire',
    'Mobile Legends',
    'Genshin Impact',
    'Valorant'
  ];
  
  // First, check what products will be deleted
  const placeholders = gamesToKeep.map(() => '?').join(',');
  const checkQuery = `SELECT COUNT(*) as count, game_name FROM products WHERE game_name NOT IN (${placeholders}) GROUP BY game_name`;
  
  connection.query(checkQuery, gamesToKeep, (err, results) => {
    if (err) {
      console.error('Error checking products:', err);
      connection.end();
      process.exit(1);
    }
    
    if (results.length === 0) {
      console.log('✅ No products to delete. All products are from the 6 allowed games.');
      connection.end();
      process.exit(0);
    }
    
    console.log('\n📋 Products that will be deleted:');
    results.forEach(row => {
      console.log(`   - ${row.game_name}: ${row.count} product(s)`);
    });
    
    // Delete products from games not in the keep list
    const deleteQuery = `DELETE FROM products WHERE game_name NOT IN (${placeholders})`;
    
    connection.query(deleteQuery, gamesToKeep, (err, result) => {
      if (err) {
        console.error('Error deleting products:', err);
        connection.end();
        process.exit(1);
      }
      
      console.log(`\n✅ Successfully deleted ${result.affectedRows} product(s) from unused games.`);
      console.log('\n✅ Only these 6 games remain:');
      gamesToKeep.forEach(game => {
        console.log(`   - ${game}`);
      });
      
      connection.end();
      process.exit(0);
    });
  });
});

