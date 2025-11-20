const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'teecole.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

const initializeDatabase = () => {
  // Create services table
  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      features TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating services table:', err.message);
    } else {
      console.log('Services table ready');
      seedServices();
    }
  });

  // Create contact_submissions table
  db.run(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating contact_submissions table:', err.message);
    } else {
      console.log('Contact submissions table ready');
    }
  });

  // Create admin users table
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating admin_users table:', err.message);
    } else {
      console.log('Admin users table ready');
      seedAdmin();
    }
  });

  // Create gallery table
  db.run(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      category TEXT,
      project_date TEXT,
      is_featured BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating gallery table:', err.message);
    } else {
      console.log('Gallery table ready');
    }
  });

  // Create gallery_images table for multiple images per property
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
      console.log('Gallery images table ready');
    }
  });
};

const seedServices = () => {
  // Check if services already exist
  db.get('SELECT COUNT(*) as count FROM services', (err, row) => {
    if (err) {
      console.error('Error checking services:', err.message);
      return;
    }

    if (row.count === 0) {
      const services = [
        {
          title: 'Property Redesign And Refurbishment',
          description: 'If you are looking for help with your property for build finishing, renovation, refurbishment or remodelling then Teecole Ltd is the expert you can trust. Our fully-accredited, in-house team is filled with construction experts and project managers, all of whom know how to clearly outline expectations and deliver on them. We can provide a design and build service, making the build process a smoother and stress-free experience for you.',
          icon: 'HomeRepairService',
          color: '#6750A4',
          features: JSON.stringify(['Design & Build Service', 'Residential & Commercial', 'Project Management', 'Quality Finish']),
          image_url: '/assets/refurbishment.jpg'
        },
        {
          title: 'Property Sales And Management',
          description: 'As a fully independent company, we are able to provide you with the largest volume of UK investment properties with the best returns. Our trained team of surveyors and data analysts ensure we offer the best locations for property investment with the highest returns. We offer full and mortgage purchase options for both resident and foreign investors. We also offer management packages for properties to cover rental collection and facility maintenance.',
          icon: 'Sell',
          color: '#7D5260',
          features: JSON.stringify(['Investment Properties', 'Best Market Rates', 'Mortgage Options', 'Management Packages']),
          image_url: '/assets/property-sales.jpg'
        },
        {
          title: 'Cleaning Services',
          description: 'Teecole Ltd has become an integral office cleaning and maintenance provider to many companies across London. Our approach is detailed and professional, and we always put our customers\' needs first. We can help you keep your office space clean, and make your space work for you. No matter whether you have an industrial, institutional, medical, educational, manufacturing building, serviced apartment or hotel, we will clean it perfectly well.',
          icon: 'CleaningServices',
          color: '#625B71',
          features: JSON.stringify(['Commercial Cleaning', 'Industrial Spaces', 'Medical Facilities', '100% Satisfaction']),
          image_url: '/assets/cleaning.jpg'
        },
        {
          title: 'AirBnB Hosting & Management',
          description: 'Maximize your property investment with our comprehensive AirBnB hosting and management service. We handle everything from listing optimization, professional photography, guest communication, to cleaning and maintenance. Our expert team ensures your property achieves maximum occupancy rates and exceptional guest reviews, making your hosting experience completely hands-free.',
          icon: 'HomeWork',
          color: '#FF5A5F',
          features: JSON.stringify(['Full Property Management', 'Guest Communication', 'Professional Photography', '24/7 Support']),
          image_url: '/assets/airbnb-hosting.jpg'
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO services (title, description, icon, color, features, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      services.forEach(service => {
        stmt.run(
          service.title,
          service.description,
          service.icon,
          service.color,
          service.features,
          service.image_url
        );
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('Error seeding services:', err.message);
        } else {
          console.log('Services seeded successfully');
        }
      });
    }
  });
};

const seedAdmin = () => {
  // Check if admin already exists
  db.get('SELECT COUNT(*) as count FROM admin_users', (err, row) => {
    if (err) {
      console.error('Error checking admin users:', err.message);
      return;
    }

    if (row.count === 0) {
      const bcrypt = require('bcrypt');
      const saltRounds = 10;
      
      // Default admin credentials
      const defaultUsername = 'Teecole';
      const defaultPassword = 'Teecole5253';
      
      bcrypt.hash(defaultPassword, saltRounds, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err.message);
          return;
        }

        db.run(`
          INSERT INTO admin_users (username, password, email, role)
          VALUES (?, ?, ?, ?)
        `, [defaultUsername, hash, 'admin@teecoleltd.com', 'admin'], (err) => {
          if (err) {
            console.error('Error creating default admin:', err.message);
          } else {
            console.log(`Default admin created (username: ${defaultUsername})`);
            console.log('⚠️  IMPORTANT: Change the admin password after first login!');
          }
        });
      });
    } else {
      console.log('Admin user already exists');
    }
  });
};

module.exports = db;
