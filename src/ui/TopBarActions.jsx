import { useState } from 'react';
import {
  Avatar,
  Badge,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';

export default function TopBarActions({ user, onLogout, onOpenSettings }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'K';

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Tooltip title="Notifications">
        <IconButton color="inherit" aria-label="notifications">
          <Badge color="secondary" badgeContent={user?.alerts ?? 0} max={9}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Tooltip title="Profile menu">
        <IconButton
          color="inherit"
          onClick={handleMenuOpen}
          aria-label="profile menu"
          size="small"
        >
          <Avatar sx={{ width: 36, height: 36 }}>{user?.avatar ?? initials}</Avatar>
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} keepMounted>
        <Stack spacing={0.25} sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2">{user?.name ?? 'Parent'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email ?? 'family@home.com'}
          </Typography>
        </Stack>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onOpenSettings?.();
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onLogout?.();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign out" />
        </MenuItem>
      </Menu>
    </Stack>
  );
}
