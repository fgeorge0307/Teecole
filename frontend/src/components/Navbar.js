import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/new  logo 4.png';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Gallery', path: '/gallery', icon: <PhotoLibraryIcon /> },
    { text: 'About', path: '/about', icon: <InfoIcon /> },
    { text: 'Contact', path: '/contact', icon: <ContactMailIcon /> },
  ];

  const handleNavigation = (path) => {
    if (path === '/') {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      navigate(path);
    }
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={scrolled ? 3 : 0}
        sx={{
          background: scrolled
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: scrolled ? '1px solid rgba(103, 80, 164, 0.1)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: 2,
                }}
                onClick={() => handleNavigation('/')}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="Teecole Ltd Logo"
                  sx={{
                    height: { xs: 40, md: 48 },
                    width: 'auto',
                    objectFit: 'contain',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #6750A4 0%, #8E7CC3 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  Teecole Limited
                </Typography>
              </Box>
            </motion.div>

            {isMobile ? (
              <IconButton
                edge="end"
                onClick={() => setDrawerOpen(true)}
                sx={{
                  color: theme.palette.primary.main,
                }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Button
                      onClick={() => handleNavigation(item.path)}
                      startIcon={item.icon}
                      sx={{
                        color: theme.palette.text.primary,
                        px: 3,
                        fontWeight: 600,
                        '&:hover': {
                          background: 'rgba(103, 80, 164, 0.1)',
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Button
                    variant="contained"
                    onClick={() => {
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    sx={{
                      ml: 2,
                      px: 3,
                      background: 'linear-gradient(135deg, #6750A4 0%, #8E7CC3 100%)',
                    }}
                  >
                    Get Started
                  </Button>
                </motion.div>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ float: 'right', color: theme.palette.primary.main }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ mt: 4 }}>
          {menuItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ListItem
                button
                onClick={() => handleNavigation(item.path)}
                sx={{
                  py: 2,
                  px: 3,
                  '&:hover': {
                    background: 'rgba(103, 80, 164, 0.1)',
                  },
                }}
              >
                <Box sx={{ mr: 2, color: theme.palette.primary.main }}>
                  {item.icon}
                </Box>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: '1.1rem',
                  }}
                />
              </ListItem>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Box sx={{ px: 3, mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setDrawerOpen(false);
                  setTimeout(() => {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }, 300);
                }}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #6750A4 0%, #8E7CC3 100%)',
                }}
              >
                Get Started
              </Button>
            </Box>
          </motion.div>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
