import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Switch,
  FormControlLabel,
  useTheme,
  Alert,
  Snackbar,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [gallery, setGallery] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'upload'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'refurbishment',
    project_date: new Date().toISOString().split('T')[0],
    is_featured: false,
  });

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else {
      fetchGallery();
    }
  }, [user, navigate]);

  const fetchGallery = async () => {
    try {
      const response = await axios.get('/api/gallery');
      setGallery(response.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        image_url: item.image_url,
        category: item.category || 'refurbishment',
        project_date: item.project_date || new Date().toISOString().split('T')[0],
        is_featured: Boolean(item.is_featured),
      });
      setUploadMethod('url');
    } else {
      setEditItem(null);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        category: 'refurbishment',
        project_date: new Date().toISOString().split('T')[0],
        is_featured: false,
      });
      setUploadMethod('url');
    }
    setSelectedFiles([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditItem(null);
    setSelectedFiles([]);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate files
    const validFiles = [];
    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSnackbar({ open: true, message: `${file.name} is not an image file`, severity: 'error' });
        continue;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: `${file.name} exceeds 5MB limit`, severity: 'error' });
        continue;
      }
      validFiles.push(file);
    }
    
    setSelectedFiles(validFiles);
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return [];

    setUploading(true);
    const uploadedUrls = [];

    try {
      const token = localStorage.getItem('adminToken');
      
      for (const file of selectedFiles) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        const response = await axios.post(
          '/api/admin/upload',
          uploadFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        uploadedUrls.push(response.data.url);
      }
      
      setUploading(false);
      return uploadedUrls;
    } catch (error) {
      setUploading(false);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to upload images',
        severity: 'error',
      });
      return [];
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      // If editing, handle single image update
      if (editItem) {
        let imageUrl = formData.image_url;

        // If upload method and file selected, upload it first
        if (uploadMethod === 'upload' && selectedFiles.length > 0) {
          const uploadedUrls = await handleUploadFiles();
          if (uploadedUrls.length === 0) return; // Upload failed
          imageUrl = uploadedUrls[0];
        }

        // Validate image URL
        if (!imageUrl) {
          setSnackbar({ open: true, message: 'Please provide an image', severity: 'error' });
          return;
        }

        const submitData = { ...formData, image_url: imageUrl };
        
        await axios.put(
          `/api/admin/gallery/${editItem.id}`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: 'Gallery item updated successfully', severity: 'success' });
        fetchGallery();
        handleCloseDialog();
      } else {
        // Adding new items - support multiple images
        if (uploadMethod === 'upload' && selectedFiles.length > 0) {
          const uploadedUrls = await handleUploadFiles();
          if (uploadedUrls.length === 0) return; // Upload failed

          // Create a gallery item for each uploaded image
          let successCount = 0;
          for (let i = 0; i < uploadedUrls.length; i++) {
            const submitData = {
              ...formData,
              image_url: uploadedUrls[i],
              title: selectedFiles.length > 1 ? `${formData.title} ${i + 1}` : formData.title,
            };

            try {
              await axios.post(
                '/api/admin/gallery',
                submitData,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              successCount++;
            } catch (error) {
              console.error('Error uploading image:', error);
            }
          }

          setSnackbar({ 
            open: true, 
            message: `${successCount} image${successCount > 1 ? 's' : ''} uploaded successfully`, 
            severity: 'success' 
          });
        } else if (uploadMethod === 'url' && formData.image_url) {
          // Single URL upload
          const submitData = { ...formData };
          await axios.post(
            '/api/admin/gallery',
            submitData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setSnackbar({ open: true, message: 'Gallery item added successfully', severity: 'success' });
        } else {
          setSnackbar({ open: true, message: 'Please provide an image', severity: 'error' });
          return;
        }

        fetchGallery();
        handleCloseDialog();
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.error || 'Failed to save gallery item', 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const itemToDelete = gallery.find(item => item.id === id);
      
      // Delete from database
      await axios.delete(
        `/api/admin/gallery/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // If the image was uploaded (not a URL), delete the file too
      if (itemToDelete?.image_url && itemToDelete.image_url.startsWith('/uploads/')) {
        const filename = itemToDelete.image_url.split('/').pop();
        try {
          await axios.delete(
            `/api/admin/upload/${filename}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (fileError) {
          console.error('Error deleting file:', fileError);
          // Continue even if file deletion fails
        }
      }
      
      setSnackbar({ open: true, message: 'Gallery item deleted successfully', severity: 'success' });
      fetchGallery();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.error || 'Failed to delete gallery item', 
        severity: 'error' 
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const categories = [
    { value: 'refurbishment', label: 'Refurbishment' },
    { value: 'property-sales', label: 'Property Sales' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'airbnb', label: 'AirBnB Hosting' },
    { value: 'general', label: 'General' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#F3F0FF', py: 4 }}>
      <Container maxWidth="xl">
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Welcome back, {user?.username}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}
          >
            Logout
          </Button>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Gallery Management ({gallery.length} items)
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ background: 'linear-gradient(135deg, #6750A4 0%, #8E7CC3 100%)' }}
          >
            Add New Image
          </Button>
        </Box>

        <Grid container spacing={3}>
          {gallery.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image_url}
                  alt={item.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {item.title}
                    </Typography>
                    {item.is_featured && (
                      <Chip label="Featured" size="small" color="primary" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {item.description?.substring(0, 60)}...
                  </Typography>
                  <Chip label={item.category} size="small" variant="outlined" />
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(item)}
                    sx={{ color: theme.palette.primary.main }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(item.id)}
                    sx={{ color: theme.palette.error.main }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {gallery.length === 0 && (
          <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
            <AddPhotoAlternateIcon sx={{ fontSize: 80, color: theme.palette.grey[300], mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No gallery items yet
            </Typography>
            <Button
              variant="contained"
              onClick={() => handleOpenDialog()}
              sx={{ mt: 2, background: 'linear-gradient(135deg, #6750A4 0%, #8E7CC3 100%)' }}
            >
              Add Your First Image
            </Button>
          </Paper>
        )}
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />

          {/* Upload Method Toggle */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Image Source
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={uploadMethod === 'url' ? 'contained' : 'outlined'}
                onClick={() => setUploadMethod('url')}
                sx={{ flex: 1 }}
              >
                Image URL
              </Button>
              <Button
                variant={uploadMethod === 'upload' ? 'contained' : 'outlined'}
                onClick={() => setUploadMethod('upload')}
                sx={{ flex: 1 }}
              >
                Upload File
              </Button>
            </Box>
          </Box>

          {/* Conditional rendering based on upload method */}
          {uploadMethod === 'url' ? (
            <TextField
              fullWidth
              label="Image URL"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              margin="normal"
              required
              helperText="Enter the full URL of the image"
            />
          ) : (
            <Box sx={{ mt: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload-input"
                type="file"
                multiple={!editItem}
                onChange={handleFileSelect}
              />
              <label htmlFor="image-upload-input">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<AddPhotoAlternateIcon />}
                  sx={{ py: 1.5 }}
                >
                  {selectedFiles.length > 0 
                    ? `${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''} selected` 
                    : editItem ? 'Choose Image' : 'Choose Images'}
                </Button>
              </label>
              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    {selectedFiles.map((file, index) => (
                      <Grid item xs={6} sm={4} key={index}>
                        <Box sx={{ position: 'relative', textAlign: 'center' }}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100px',
                              borderRadius: '8px',
                              objectFit: 'cover'
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              background: 'rgba(255, 255, 255, 0.9)',
                              '&:hover': { background: 'rgba(255, 255, 255, 1)' },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  {!editItem && selectedFiles.length > 1 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                      Note: Multiple images will be uploaded with numbered titles
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}

          <TextField
            fullWidth
            select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Project Date"
            type="date"
            value={formData.project_date}
            onChange={(e) => setFormData({ ...formData, project_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              />
            }
            label="Featured Item"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={uploading || !formData.title || (uploadMethod === 'url' && !formData.image_url) || (uploadMethod === 'upload' && selectedFiles.length === 0)}
          >
            {uploading ? 'Uploading...' : editItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
