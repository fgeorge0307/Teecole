import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Tabs,
  Tab,
  Dialog,
  IconButton,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const Gallery = () => {
  const theme = useTheme();
  const [gallery, setGallery] = useState([]);
  const [filteredGallery, setFilteredGallery] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredGallery(gallery);
    } else {
      setFilteredGallery(gallery.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, gallery]);

  const fetchGallery = async () => {
    try {
      const response = await axios.get('/api/gallery');
      setGallery(response.data);
      setFilteredGallery(response.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const categories = [
    { value: 'all', label: 'All Projects' },
    { value: 'refurbishment', label: 'Refurbishment' },
    { value: 'property-sales', label: 'Property Sales' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'airbnb', label: 'AirBnB Hosting' },
    { value: 'general', label: 'General' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: { xs: 12, md: 14 },
        pb: 8,
        background: 'linear-gradient(180deg, #F3F0FF 0%, #FFFFFF 50%, #E8DEF8 100%)',
      }}
    >
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="overline"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                letterSpacing: '0.1em',
                mb: 2,
                display: 'block',
              }}
            >
              OUR WORK
            </Typography>
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6750A4 0%, #4F378B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Project Gallery
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Explore our portfolio of completed projects and see the quality of our work
            </Typography>
          </Box>
        </motion.div>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={selectedCategory}
            onChange={(e, newValue) => setSelectedCategory(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
              },
            }}
          >
            {categories.map((category) => (
              <Tab
                key={category.value}
                label={category.label}
                value={category.value}
              />
            ))}
          </Tabs>
        </Box>

        <AnimatePresence mode="wait">
          <Grid container spacing={3}>
            {filteredGallery.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(103, 80, 164, 0.2)',
                      },
                    }}
                    onClick={() => setSelectedImage(item)}
                  >
                    <CardMedia
                      component="img"
                      height="250"
                      image={item.image_url}
                      alt={item.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {item.title}
                        </Typography>
                        {item.is_featured && (
                          <Chip label="Featured" size="small" color="primary" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {item.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip label={item.category} size="small" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.project_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </AnimatePresence>

        {filteredGallery.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No projects found in this category
            </Typography>
          </Box>
        )}
      </Container>

      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            overflow: 'hidden',
            m: 2,
            maxHeight: 'calc(100vh - 64px)',
          },
        }}
      >
        {selectedImage && (
          <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 64px)' }}>
            <IconButton
              onClick={() => setSelectedImage(null)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': { background: 'rgba(0, 0, 0, 0.7)' },
                zIndex: 1,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              sx={{
                width: '100%',
                flex: '1',
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                overflow: 'hidden',
                p: 2,
              }}
            >
              <Box
                component="img"
                src={selectedImage.image_url}
                alt={selectedImage.title}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Box>
            <Box sx={{ p: 3, flexShrink: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {selectedImage.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {selectedImage.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={selectedImage.category} color="primary" />
                <Chip
                  label={new Date(selectedImage.project_date).toLocaleDateString()}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default Gallery;
