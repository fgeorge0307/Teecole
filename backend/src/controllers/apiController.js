const db = require('../database/db');

// Get all services
exports.getServices = (req, res) => {
  db.all('SELECT * FROM services ORDER BY id ASC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching services:', err.message);
      return res.status(500).json({ error: 'Failed to fetch services' });
    }

    // Parse features JSON string back to array
    const services = rows.map(service => ({
      ...service,
      features: JSON.parse(service.features || '[]')
    }));

    res.json(services);
  });
};

// Get single service by ID
exports.getServiceById = (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM services WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching service:', err.message);
      return res.status(500).json({ error: 'Failed to fetch service' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const service = {
      ...row,
      features: JSON.parse(row.features || '[]')
    };

    res.json(service);
  });
};

// Submit contact form
exports.submitContact = (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  const stmt = db.prepare(`
    INSERT INTO contact_submissions (name, email, phone, subject, message)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(name, email, phone || '', subject, message, function(err) {
    if (err) {
      console.error('Error saving contact submission:', err.message);
      return res.status(500).json({ error: 'Failed to submit contact form' });
    }

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      id: this.lastID
    });
  });

  stmt.finalize();
};

// Get all contact submissions (admin only)
exports.getContactSubmissions = (req, res) => {
  db.all('SELECT * FROM contact_submissions ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching contact submissions:', err.message);
      return res.status(500).json({ error: 'Failed to fetch submissions' });
    }

    res.json(rows);
  });
};
