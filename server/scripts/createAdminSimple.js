const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function createAdmin() {
  try {
    // Default admin credentials (có thể thay đổi)
    const username = process.env.ADMIN_USERNAME || 'admin';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    console.log('Đang tạo tài khoản admin...');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);

    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'game_accounts_db',
    });

    // Check if user exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  Tài khoản đã tồn tại! Đang cập nhật role thành admin...');
      
      // Update existing user to admin
      await connection.execute(
        'UPDATE users SET role = ? WHERE email = ? OR username = ?',
        ['admin', email, username]
      );
      
      // Update password if needed
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await connection.execute(
        'UPDATE users SET password = ? WHERE email = ? OR username = ?',
        [hashedPassword, email, username]
      );
      
      console.log('✅ Đã cập nhật tài khoản thành admin!');
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create admin user
      const [result] = await connection.execute(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, 'admin']
      );

      console.log('✅ Đã tạo tài khoản admin thành công!');
      console.log(`   ID: ${result.insertId}`);
    }

    console.log('\n📝 Thông tin đăng nhập:');
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: admin`);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

createAdmin();

