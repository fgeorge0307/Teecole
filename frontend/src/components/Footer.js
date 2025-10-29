import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import logo from '../assets/new  logo 4.png';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Quick Links',
      links: [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/about' },
        { label: 'Services', href: '#services' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Our Services',
      links: [
        { label: 'Property Redesign', href: '#services' },
        { label: 'Refurbishment', href: '#services' },
        { label: 'Property Sales', href: '#services' },
        { label: 'Cleaning Services', href: '#services' },
      ],
    },
  ];

  const socialMedia = [
    { icon: <FacebookIcon />, href: '#', label: 'Facebook' },
    { icon: <TwitterIcon />, href: '#', label: 'Twitter' },
    { icon: <LinkedInIcon />, href: '#', label: 'LinkedIn' },
    { icon: <InstagramIcon />, href: '#', label: 'Instagram' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #1C1B1F 0%, #2D2B33 100%)',
        color: 'white',
        pt: 8,
        pb: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(103, 80, 164, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          top: -200,
          right: -200,
        }}
      />

      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  gap: 2,
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="Teecole Ltd Logo"
                  sx={{
                    height: 48,
                    width: 'auto',
                    objectFit: 'contain',
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Teecole Limited
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 3,
                  lineHeight: 1.7,
                }}
              >
                A full-service real estate company providing bespoke solutions for all your
                property needs. Excellence, quality, and client satisfaction since 2022.
              </Typography>

              {/* Contact Info */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                <LocationOnIcon sx={{ mr: 1, color: theme.palette.primary.light, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Office 9, Dalton House, 60 Windsor Avenue<br />
                  London, SW19 2RR, United Kingdom
                </Typography>
              </Box>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ mr: 1, color: theme.palette.primary.light, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  +44 1293 859148
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ mr: 1, color: theme.palette.primary.light, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  info@teecoleltd.com
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <Grid item xs={12} sm={6} md={2.5} key={index}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: 'white',
                }}
              >
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {section.links.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    underline="none"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        color: theme.palette.primary.light,
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}

          {/* Newsletter Section */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: 'white',
              }}
            >
              Connect With Us
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 3,
                lineHeight: 1.7,
              }}
            >
              Follow us on social media for updates, tips, and the latest property insights.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialMedia.map((social, index) => (
                <IconButton
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    transition: 'all 0.3s',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6750A4 0%, #8E7CC3 100%)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            © {currentYear} Teecole Limited. All rights reserved.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link
              href="#"
              underline="none"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.875rem',
                '&:hover': { color: theme.palette.primary.light },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              underline="none"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.875rem',
                '&:hover': { color: theme.palette.primary.light },
              }}
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              underline="none"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.875rem',
                '&:hover': { color: theme.palette.primary.light },
              }}
            >
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
