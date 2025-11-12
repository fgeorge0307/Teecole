#!/usr/bin/env node
/**
 * Reset Admin User Script
 * This script resets the admin user password
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Use the same path as db.js
const dbPath = path.join(__dirname, 'src/database/teecole.db');

console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

const resetAdmin = async () => {
  const username = 'Teecole';
  const password = 'Teecole5253';
  const email = 'admin@teecoleltd.com';
  const saltRounds = 10;

  try {
    // Hash the password
    const hash = await bcrypt.hash(password, saltRounds);
    
    // First, delete any existing admin users to start fresh
    db.run('DELETE FROM admin_users', (err) => {
      if (err) {
        console.error('❌ Error clearing admin users:', err.message);
        db.close();
        process.exit(1);
      }

      // Create new admin
      db.run(
        'INSERT INTO admin_users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [username, hash, email, 'admin'],
        function(err) {
          if (err) {
            console.error('❌ Error creating admin:', err.message);
            db.close();
            process.exit(1);
          }
          console.log('✅ Admin user created successfully');
          console.log('');
          console.log('Login credentials:');
          console.log('  Username:', username);
          console.log('  Password:', password);
          console.log('');
          console.log('⚠️  IMPORTANT: Keep these credentials secure!');
          db.close();
        }
      );
    });
  } catch (error) {
    console.error('❌ Error hashing password:', error.message);
    db.close();
    process.exit(1);
  }
};

// Run the reset
console.log('🔄 Resetting admin user...');
console.log('');
resetAdmin();
