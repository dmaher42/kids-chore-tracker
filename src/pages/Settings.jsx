import { useState } from 'react';
import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  Switch,
  Typography,
} from '@mui/material';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(false);
  const [resetHour, setResetHour] = useState('07:00');
  const [rewardMode, setRewardMode] = useState('coins');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize how chores reset, how you notify the family, and reward preferences.
      </Typography>
      <Box sx={{ maxWidth: 640 }}>
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Notifications
        </Typography>
        <List disablePadding>
          <ListItem>
            <ListItemText
              primary="Push notifications"
              secondary="Send reminders to the parent dashboard when chores are overdue."
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={notifications}
                onChange={(event) => setNotifications(event.target.checked)}
                inputProps={{ 'aria-label': 'Enable notifications' }}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText
              primary="Daily reminder"
              secondary="Alert kids if chores are not started by the reset time."
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={reminders}
                onChange={(event) => setReminders(event.target.checked)}
                inputProps={{ 'aria-label': 'Enable daily reminders' }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>

        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
          Daily reset
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="reset-time-label">Reset time</InputLabel>
          <Select
            labelId="reset-time-label"
            value={resetHour}
            label="Reset time"
            onChange={(event) => setResetHour(event.target.value)}
          >
            {['06:00', '07:00', '08:00', '09:00'].map((time) => (
              <MenuItem key={time} value={time}>
                {time}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
          Rewards
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="reward-mode-label">Reward mode</InputLabel>
          <Select
            labelId="reward-mode-label"
            value={rewardMode}
            label="Reward mode"
            onChange={(event) => setRewardMode(event.target.value)}
          >
            <MenuItem value="coins">Coins only</MenuItem>
            <MenuItem value="coins-points">Coins + XP bonus</MenuItem>
            <MenuItem value="tickets">Tickets for raffle night</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
