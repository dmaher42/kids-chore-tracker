import { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PetsIcon from '@mui/icons-material/Pets';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import TopBarActions from './TopBarActions';
import { useAppData } from '../context/AppDataContext';

const DRAWER_WIDTH = 260;

const NAVIGATION = [
  { label: 'Dashboard', icon: <DashboardIcon />, to: '/' },
  { label: 'Chores', icon: <AssignmentTurnedInIcon />, to: '/chores' },
  { label: 'Rewards', icon: <EmojiEventsIcon />, to: '/rewards' },
  { label: 'Kids', icon: <FamilyRestroomIcon />, to: '/kids' },
  { label: 'Pet', icon: <PetsIcon />, to: '/pet' },
  { label: 'Settings', icon: <SettingsIcon />, to: '/settings' },
];

export default function AppShell() {
  const theme = useTheme();
  const { selectedKid } = useAppData();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawer = (
    <Box role="presentation" sx={{ width: DRAWER_WIDTH }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Chore Champions
        </Typography>
        {!isDesktop && (
          <IconButton onClick={handleDrawerToggle} aria-label="close navigation">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {NAVIGATION.map((item) => (
          <ListItemButton
            key={item.to}
            component={RouterLink}
            to={item.to}
            selected={location.pathname === item.to}
            onClick={() => {
              if (!isDesktop) {
                setMobileOpen(false);
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  const activeKid = selectedKid?.id ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 2 }}>
      <Avatar sx={{ bgcolor: 'secondary.main' }}>
        {selectedKid.name?.[0] ?? 'K'}
      </Avatar>
      <Box>
        <Typography variant="subtitle2">{selectedKid.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {selectedKid.coins ?? 0} coins
        </Typography>
      </Box>
    </Box>
  ) : null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="primary"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton
              color="inherit"
              aria-label="open navigation"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap>
              Kids Chore Tracker
            </Typography>
          </Box>
          {activeKid}
          <TopBarActions onOpenSettings={() => navigate('/settings')} />
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
