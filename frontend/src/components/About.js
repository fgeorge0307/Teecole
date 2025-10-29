import React from 'react';
import { Box, Container, Typography, Grid, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';

const About = () => {
  const theme = useTheme();

  const stats = [
    { number: '100+', label: 'Projects Completed', icon: <CheckCircleIcon /> },
    { number: '50+', label: 'Happy Clients', icon: <GroupsIcon /> },
    { number: '2', label: 'Years Experience', icon: <TrendingUpIcon /> },
    { number: '5★', label: 'Client Rating', icon: <StarIcon /> },
  ];

  const values = [
    {
      title: 'Professional Excellence',
      description: 'Our fully-accredited team brings years of expertise and dedication to every project.',
    },
    {
      title: 'Client-Focused Approach',
      description: 'We listen to your needs and deliver solutions that exceed expectations.',
    },
    {
      title: 'Quality Assurance',
      description: 'Every project undergoes rigorous quality checks to ensure perfect results.',
    },
    {
      title: 'Transparent Communication',
      description: 'Clear expectations and regular updates throughout your project journey.',
    },
  ];

  return (
    <Box
      id="about"
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #F3F0FF 0%, #FFFFFF 50%, #E8DEF8 100%)',
        position: 'relative',
      }}
    >
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
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
              ABOUT US
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
              Who We Are
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.8,
              }}
            >
              Teecole Ltd is a full-service real estate company established in 2022 with the
              aim of providing bespoke solutions for our clients' specific needs in the
              property market.
            </Typography>
          </Box>
        </motion.div>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 10 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(103, 80, 164, 0.2)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: theme.palette.primary.main,
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      fontSize: 40,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      mb: 1,
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Our Story Section */}
        <Grid container spacing={6} alignItems="center" sx={{ mb: 10 }}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  p: 4,
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(103, 80, 164, 0.3) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                  }}
                />
                <Typography
                  variant="h3"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Excellence in Every Project
                </Typography>
              </Box>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: theme.palette.text.primary,
                }}
              >
                Our Story
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 2,
                  lineHeight: 1.8,
                }}
              >
                Since our establishment in 2022, Teecole Limited has been dedicated to
                transforming properties and exceeding client expectations. Our journey began
                with a simple mission: to provide comprehensive, professional property services
                that combine quality, reliability, and innovation.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  lineHeight: 1.8,
                }}
              >
                Today, we're proud to serve both residential and commercial clients across
                London and beyond, offering everything from property refurbishment and sales
                to professional cleaning services. Our fully-accredited team brings expertise,
                passion, and a commitment to excellence in every project we undertake.
              </Typography>
            </motion.div>
          </Grid>
        </Grid>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              mb: 6,
              color: theme.palette.text.primary,
            }}
          >
            Our Core Values
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {values.map((value, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Box
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    height: '100%',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      boxShadow: '0 8px 16px rgba(103, 80, 164, 0.15)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: 'white', fontWeight: 700 }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1.5,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {value.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.7,
                    }}
                  >
                    {value.description}
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

export default About;
