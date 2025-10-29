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
  const [selectedFile, setSelectedFile] = useState(null);
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
      const response = await axios.get('http://localhost:5001/api/gallery');
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
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditItem(null);
    setSelectedFile(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSnackbar({ open: true, message: 'Please select an image file', severity: 'error' });
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: 'File size must be less than 5MB', severity: 'error' });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return null;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', selectedFile);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        'http://localhost:5001/api/admin/upload',
        uploadFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setUploading(false);
      return response.data.url;
    } catch (error) {
      setUploading(false);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to upload image',
        severity: 'error',
      });
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      let imageUrl = formData.image_url;

      // If upload method and file selected, upload it first
      if (uploadMethod === 'upload' && selectedFile) {
        const uploadedUrl = await handleUploadFile();
        if (!uploadedUrl) return; // Upload failed
        imageUrl = `http://localhost:5001${uploadedUrl}`;
      }

      // Validate image URL
      if (!imageUrl) {
        setSnackbar({ open: true, message: 'Please provide an image', severity: 'error' });
        return;
      }

      const submitData = { ...formData, image_url: imageUrl };
      const token = localStorage.getItem('adminToken');
      
      if (editItem) {
        await axios.put(
          `http://localhost:5001/api/admin/gallery/${editItem.id}`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: 'Gallery item updated successfully', severity: 'success' });
      } else {
        await axios.post(
          'http://localhost:5001/api/admin/gallery',
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: 'Gallery item added successfully', severity: 'success' });
      }
      
      fetchGallery();
      handleCloseDialog();
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
      await axios.delete(
        `http://localhost:5001/api/admin/gallery/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
                  {selectedFile ? selectedFile.name : 'Choose Image'}
                </Button>
              </label>
              {selectedFile && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      objectFit: 'contain'
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
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
            disabled={uploading || !formData.title || (uploadMethod === 'url' && !formData.image_url) || (uploadMethod === 'upload' && !selectedFile)}
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
