const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const adminController = require('../controllers/adminController');
const uploadController = require('../controllers/uploadController');
const { authMiddleware } = require('../middleware/auth');

// Service routes
router.get('/services', apiController.getServices);
router.get('/services/:id', apiController.getServiceById);

// Contact routes
router.post('/contact', apiController.submitContact);
router.get('/contact-submissions', apiController.getContactSubmissions);

// Admin authentication routes
router.post('/admin/login', adminController.login);
router.get('/admin/verify', authMiddleware, adminController.verifyToken);

// Gallery routes (public)
router.get('/gallery', adminController.getGallery);

// Gallery management routes (protected)
router.post('/admin/gallery', authMiddleware, adminController.addGalleryItem);
router.put('/admin/gallery/:id', authMiddleware, adminController.updateGalleryItem);
router.delete('/admin/gallery/:id', authMiddleware, adminController.deleteGalleryItem);

// Image upload routes (protected)
router.post('/admin/upload', authMiddleware, uploadController.upload.single('image'), uploadController.uploadImage);
router.delete('/admin/upload/:filename', authMiddleware, uploadController.deleteImage);

module.exports = router;
