import React from 'react';
import { Box, Container, Typography, Button, Grid, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import VerifiedIcon from '@mui/icons-material/Verified';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Hero = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <HomeWorkIcon sx={{ fontSize: 40 }} />,
      title: 'Expert Services',
      description: 'Professional property solutions',
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
      title: 'Trusted Quality',
      description: 'Fully accredited team',
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
      title: '24/7 Support',
      description: 'Always here for you',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        pt: { xs: 10, md: 12 },
        pb: { xs: 8, md: 10 },
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #F3F0FF 0%, #E8DEF8 50%, #D0BCFF 100%)',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: { xs: 200, md: 400 },
          height: { xs: 200, md: 400 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(103, 80, 164, 0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-30px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: { xs: 150, md: 300 },
          height: { xs: 150, md: 300 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(142, 124, 195, 0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />

      <Container maxWidth="xl">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
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
                WELCOME TO TEECOLE LIMITED
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6750A4 0%, #4F378B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Transform Your Property Dreams Into Reality
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  color: theme.palette.text.secondary,
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Expert property redesign, refurbishment, sales, management, and cleaning services. 
                Your trusted partner for complete property solutions.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => {
                      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(135deg, #6750A4 0%, #8E7CC3 100%)',
                      boxShadow: '0 8px 24px rgba(103, 80, 164, 0.3)',
                    }}
                  >
                    Explore Services
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => {
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      borderWidth: 2,
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderWidth: 2,
                        background: 'rgba(103, 80, 164, 0.05)',
                      },
                    }}
                  >
                    Contact Us
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 300, md: 500 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Glassmorphic card */}
                <Box
                  sx={{
                    width: '90%',
                    height: '90%',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 24px 48px rgba(103, 80, 164, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(103, 80, 164, 0.1) 0%, rgba(142, 124, 195, 0.1) 100%)',
                    }}
                  />
                  <Typography
                    variant="h2"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      textAlign: 'center',
                      px: 4,
                      zIndex: 1,
                    }}
                  >
                    Building Excellence Since 2022
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* Feature cards */}
        <Grid container spacing={3} sx={{ mt: { xs: 6, md: 10 } }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Box
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    textAlign: 'center',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 32px rgba(103, 80, 164, 0.2)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: theme.palette.primary.main,
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;
