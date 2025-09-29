import { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
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

const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${DRAWER_WIDTH}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
  ...theme.mixins.toolbar,
}));

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

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawer = (
    <Box role="presentation" sx={{ width: DRAWER_WIDTH }}>
      <DrawerHeader>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Chore Champions
        </Typography>
        <IconButton onClick={handleDrawerToggle} aria-label="close navigation">
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {NAVIGATION.map((item) => (
          <ListItemButton
            key={item.to}
            component={RouterLink}
            to={item.to}
            selected={location.pathname === item.to}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  const activeKid = selectedKid?.id ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'secondary.main' }}>
          {selectedKid.name?.[0] ?? 'K'}
        </Avatar>
      </ListItemAvatar>
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
          <TopBarActions onOpenSettings={() => {}} />
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
      <Main open={isDesktop}>
        <DrawerHeader />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Main>
    </Box>
  );
}
