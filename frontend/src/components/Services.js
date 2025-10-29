import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import SellIcon from '@mui/icons-material/Sell';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axios from 'axios';
import logo from '../assets/new  logo 4.png';

const Services = () => {
  const theme = useTheme();
  const [services, setServices] = useState([]);

  useEffect(() => {
    // Fetch services from backend
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/services');
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback to static data
        setServices(staticServices);
      }
    };
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const staticServices = [
    {
      id: 1,
      title: 'Property Redesign And Refurbishment',
      description: 'If you are looking for help with your property for build finishing, renovation, refurbishment or remodelling then Teecole Ltd is the expert you can trust. Our fully-accredited, in-house team is filled with construction experts and project managers, all of whom know how to clearly outline expectations and deliver on them.',
      icon: <HomeRepairServiceIcon sx={{ fontSize: 50 }} />,
      features: ['Design & Build Service', 'Residential & Commercial', 'Project Management', 'Quality Finish'],
      color: '#6750A4',
      image: '/assets/refurbishment.jpg',
    },
    {
      id: 2,
      title: 'Property Sales And Management',
      description: 'As a fully independent company, we are able to provide you with the largest volume of UK investment properties with the best returns. Our trained team of surveyors and data analysts ensure we offer the best locations for property investment with the highest returns.',
      icon: <SellIcon sx={{ fontSize: 50 }} />,
      features: ['Investment Properties', 'Best Market Rates', 'Mortgage Options', 'Management Packages'],
      color: '#7D5260',
      image: '/assets/property-sales.jpg',
    },
    {
      id: 3,
      title: 'Cleaning Services',
      description: 'Teecole Ltd has become an integral office cleaning and maintenance provider to many companies across London. Our approach is detailed and professional, and we always put our customers\' needs first. We can help you keep your office space clean, and make your space work for you.',
      icon: <CleaningServicesIcon sx={{ fontSize: 50 }} />,
      features: ['Commercial Cleaning', 'Industrial Spaces', 'Medical Facilities', '100% Satisfaction'],
      color: '#625B71',
      image: '/assets/cleaning.jpg',
    },
  ];

  const displayServices = services.length > 0 ? services : staticServices;

  return (
    <Box
      id="services"
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F3F0FF 100%)',
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
              WHAT WE OFFER
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
              Our Services
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Comprehensive property solutions tailored to your needs
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {displayServices.map((service, index) => (
            <Grid item xs={12} md={4} key={service.id || index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 24px rgba(103, 80, 164, 0.1)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: '0 20px 40px rgba(103, 80, 164, 0.2)',
                    },
                  }}
                >
                  {/* Icon Section */}
                  <Box
                    sx={{
                      p: 4,
                      background: `linear-gradient(135deg, ${service.color || '#6750A4'} 0%, ${service.color || '#8E7CC3'} 100%)`,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: 150,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        filter: 'blur(40px)',
                      }}
                    />
                    <Box sx={{ color: 'white', position: 'relative', zIndex: 1 }}>
                      {service.icon}
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 3,
                        lineHeight: 1.7,
                      }}
                    >
                      {service.description.substring(0, 150)}...
                    </Typography>

                    {/* Features */}
                    <Box sx={{ mb: 3 }}>
                      {service.features?.map((feature, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: service.color || theme.palette.primary.main,
                              mr: 1.5,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontSize: '0.9rem',
                            }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Button
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => {
                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      sx={{
                        color: service.color || theme.palette.primary.main,
                        fontWeight: 600,
                        '&:hover': {
                          background: `${service.color || theme.palette.primary.main}15`,
                        },
                      }}
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Box
            sx={{
              mt: 8,
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, #6750A4 0%, #8E7CC3 100%)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Faded Logo Background */}
            <Box
              component="img"
              src={logo}
              alt=""
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '80%', md: '50%' },
                maxWidth: 600,
                height: 'auto',
                opacity: 0.08,
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                filter: 'blur(60px)',
                top: -100,
                right: -100,
                zIndex: 0,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 2,
                position: 'relative',
                zIndex: 2,
              }}
            >
              Ready to Transform Your Property?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 4,
                position: 'relative',
                zIndex: 2,
              }}
            >
              Get in touch with our expert team today
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.1rem',
                background: 'white',
                color: theme.palette.primary.main,
                fontWeight: 600,
                position: 'relative',
                zIndex: 2,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.95)',
                },
              }}
            >
              Contact Us Now
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Services;
