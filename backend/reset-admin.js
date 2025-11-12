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
  const username = 'admin';
  const password = 'admin123';
  const email = 'admin@teecoleltd.com';
  const saltRounds = 10;

  try {
    // Hash the password
    const hash = await bcrypt.hash(password, saltRounds);
    
    // Check if admin exists
    db.get('SELECT id FROM admin_users WHERE username = ?', [username], (err, row) => {
      if (err) {
        console.error('❌ Error checking admin:', err.message);
        db.close();
        process.exit(1);
      }

      if (row) {
        // Update existing admin
        db.run(
          'UPDATE admin_users SET password = ?, email = ? WHERE username = ?',
          [hash, email, username],
          function(err) {
            if (err) {
              console.error('❌ Error updating admin:', err.message);
              db.close();
              process.exit(1);
            }
            console.log('✅ Admin user updated successfully');
            console.log('');
            console.log('Login credentials:');
            console.log('  Username:', username);
            console.log('  Password:', password);
            console.log('');
            console.log('⚠️  IMPORTANT: Change this password after logging in!');
            db.close();
          }
        );
      } else {
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
            console.log('⚠️  IMPORTANT: Change this password after logging in!');
            db.close();
          }
        );
      }
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
