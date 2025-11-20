const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'src/database/teecole.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database for migration');
  }
});

// Create gallery_images table for multiple images per gallery item
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gallery_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (gallery_id) REFERENCES gallery(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating gallery_images table:', err.message);
    } else {
      console.log('✓ Gallery images table created');
    }
  });

  // Migrate existing gallery images to new table
  db.all('SELECT id, image_url FROM gallery WHERE image_url IS NOT NULL', (err, rows) => {
    if (err) {
      console.error('Error fetching gallery items:', err.message);
      return;
    }

    if (rows.length > 0) {
      console.log(`Migrating ${rows.length} existing gallery images...`);
      
      const stmt = db.prepare('INSERT INTO gallery_images (gallery_id, image_url, display_order) VALUES (?, ?, ?)');
      
      rows.forEach(row => {
        stmt.run(row.id, row.image_url, 0, (err) => {
          if (err) {
            console.error(`Error migrating image for gallery ${row.id}:`, err.message);
          }
        });
      });

      stmt.finalize(() => {
        console.log('✓ Migration completed');
        db.close();
      });
    } else {
      console.log('No existing images to migrate');
      db.close();
    }
  });
});
