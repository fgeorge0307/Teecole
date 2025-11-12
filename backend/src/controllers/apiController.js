const db = require('../database/db');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields'
    });
  }

  // Insert into database
  const sql = `INSERT INTO contact_submissions (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(sql, [name, email, phone || null, subject, message], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit contact form'
      });
    }

    // Prepare email content
    const mailOptions = {
      from: `"Teecole Website" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6750A4; border-bottom: 2px solid #6750A4; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p style="margin: 10px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
            <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e8f4f8; border-radius: 8px;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              This email was sent from the Teecole Ltd website contact form.
              <br>Submission ID: ${this.lastID}
              <br>Date: ${new Date().toLocaleString('en-GB')}
            </p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
Subject: ${subject}

Message:
${message}

---
Submission ID: ${this.lastID}
Date: ${new Date().toLocaleString('en-GB')}
      `
    };

    // Send email notification
    transporter.sendMail(mailOptions, (emailErr, info) => {
      if (emailErr) {
        console.error('Email send error:', emailErr);
        // Still return success since the form was saved to database
        return res.status(201).json({
          success: true,
          message: 'Contact form submitted successfully (email notification failed)',
          id: this.lastID
        });
      }

      console.log('Email sent:', info.messageId);
      res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully',
        id: this.lastID
      });
    });
  });
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
