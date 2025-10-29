import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  Button,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GalleryPreview = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [featuredProjects, setFeaturedProjects] = useState([]);

  useEffect(() => {
    fetchFeaturedProjects();
  }, []);

  const fetchFeaturedProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/gallery?featured=true');
      setFeaturedProjects(response.data.slice(0, 6)); // Show only 6 featured projects
    } catch (error) {
      console.error('Error fetching featured projects:', error);
    }
  };

  if (featuredProjects.length === 0) {
    return null; // Don't show section if no featured projects
  }

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F3F0FF 100%)',
      }}
    >
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
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
              FEATURED PROJECTS
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
              Our Recent Work
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Take a look at some of our completed projects and transformations
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          {featuredProjects.map((project, index) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: '0 16px 32px rgba(103, 80, 164, 0.2)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="280"
                    image={project.image_url}
                    alt={project.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {project.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {project.description?.substring(0, 100)}
                      {project.description?.length > 100 ? '...' : ''}
                    </Typography>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/gallery')}
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #6750A4 0%, #8E7CC3 100%)',
              }}
            >
              View Full Gallery
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default GalleryPreview;
