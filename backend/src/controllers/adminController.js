const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Admin login
exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get('SELECT * FROM admin_users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  });
};

// Verify token
exports.verifyToken = (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

// Get all gallery items
exports.getGallery = (req, res) => {
  const { category, featured } = req.query;
  let query = 'SELECT * FROM gallery WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (featured) {
    query += ' AND is_featured = ?';
    params.push(featured === 'true' ? 1 : 0);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching gallery:', err.message);
      return res.status(500).json({ error: 'Failed to fetch gallery' });
    }

    // Fetch additional images for each gallery item
    const galleryWithImages = [];
    let processed = 0;

    if (rows.length === 0) {
      return res.json([]);
    }

    rows.forEach(item => {
      db.all(
        'SELECT image_url FROM gallery_images WHERE gallery_id = ? ORDER BY display_order',
        [item.id],
        (err, images) => {
          if (err) {
            console.error('Error fetching gallery images:', err.message);
          }

          galleryWithImages.push({
            ...item,
            images: images && images.length > 0 ? images.map(img => img.image_url) : [item.image_url]
          });

          processed++;
          if (processed === rows.length) {
            res.json(galleryWithImages);
          }
        }
      );
    });
  });
};

// Add gallery item
exports.addGalleryItem = (req, res) => {
  const { title, description, image_url, images, category, project_date, is_featured } = req.body;

  if (!title || (!image_url && (!images || images.length === 0))) {
    return res.status(400).json({ error: 'Title and at least one image are required' });
  }

  const mainImage = image_url || (images && images[0]);
  const additionalImages = images || [];

  const stmt = db.prepare(`
    INSERT INTO gallery (title, description, image_url, category, project_date, is_featured)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    title,
    description || '',
    mainImage,
    category || 'general',
    project_date || new Date().toISOString().split('T')[0],
    is_featured ? 1 : 0,
    function(err) {
      if (err) {
        console.error('Error adding gallery item:', err.message);
        stmt.finalize();
        return res.status(500).json({ error: 'Failed to add gallery item' });
      }

      const galleryId = this.lastID;

      // Insert additional images
      if (additionalImages.length > 0) {
        const imageStmt = db.prepare(`
          INSERT INTO gallery_images (gallery_id, image_url, display_order)
          VALUES (?, ?, ?)
        `);

        additionalImages.forEach((imgUrl, index) => {
          imageStmt.run(galleryId, imgUrl, index);
        });

        imageStmt.finalize();
      }

      res.status(201).json({
        success: true,
        message: 'Gallery item added successfully',
        id: galleryId
      });
    }
  );

  stmt.finalize();
};

// Update gallery item
exports.updateGalleryItem = (req, res) => {
  const { id } = req.params;
  const { title, description, image_url, images, category, project_date, is_featured } = req.body;

  db.run(`
    UPDATE gallery
    SET title = ?, description = ?, image_url = ?, category = ?, project_date = ?, is_featured = ?
    WHERE id = ?
  `,
  [title, description, image_url, category, project_date, is_featured ? 1 : 0, id],
  function(err) {
    if (err) {
      console.error('Error updating gallery item:', err.message);
      return res.status(500).json({ error: 'Failed to update gallery item' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    // Update additional images if provided
    if (images) {
      db.run('DELETE FROM gallery_images WHERE gallery_id = ?', [id], (err) => {
        if (err) {
          console.error('Error deleting old images:', err.message);
        }

        if (images.length > 0) {
          const imageStmt = db.prepare(`
            INSERT INTO gallery_images (gallery_id, image_url, display_order)
            VALUES (?, ?, ?)
          `);

          images.forEach((imgUrl, index) => {
            imageStmt.run(id, imgUrl, index);
          });

          imageStmt.finalize();
        }

        res.json({ success: true, message: 'Gallery item updated successfully' });
      });
    } else {
      res.json({ success: true, message: 'Gallery item updated successfully' });
    }
  });
};

// Delete gallery item
exports.deleteGalleryItem = (req, res) => {
  const { id } = req.params;

  // Delete associated images first
  db.run('DELETE FROM gallery_images WHERE gallery_id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting gallery images:', err.message);
    }

    db.run('DELETE FROM gallery WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting gallery item:', err.message);
        return res.status(500).json({ error: 'Failed to delete gallery item' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Gallery item not found' });
      }

      res.json({ success: true, message: 'Gallery item deleted successfully' });
    });
  });
};
