import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PetsIcon from '@mui/icons-material/Pets';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useAppData } from '../context/AppDataContext';
import dayjs from 'dayjs';

export default function Dashboard() {
  const { kids, chores, dailyProgress, petStates } = useAppData();

  const totalCoins = kids.reduce((sum, kid) => sum + (kid.coins || 0), 0);
  const totalCompleted = kids.reduce(
    (sum, kid) => sum + (dailyProgress[kid.id]?.length || 0),
    0
  );
  const totalChores = kids.reduce((sum, kid) => {
    const kidChores = chores.filter((chore) => !chore.kidId || chore.kidId === kid.id);
    return sum + kidChores.length;
  }, 0);
  const completionPercent = totalChores
    ? Math.round((totalCompleted / totalChores) * 100)
    : 0;

  const pendingChores = kids.flatMap((kid) => {
    const completed = new Set(dailyProgress[kid.id] || []);
    return chores
      .filter((chore) => (!chore.kidId || chore.kidId === kid.id) && !completed.has(chore.id))
      .map((chore) => ({
        kid,
        chore,
        dueDate: chore.dueDate ? dayjs(chore.dueDate) : null,
      }));
  });

  pendingChores.sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return a.dueDate.valueOf() - b.dueDate.valueOf();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return a.chore.name.localeCompare(b.chore.name);
  });

  const topPending = pendingChores.slice(0, 5);

  const petAverages = kids.reduce(
    (acc, kid) => {
      const state = petStates[kid.id];
      if (state) {
        acc.food += state.food;
        acc.happy += state.happy;
        acc.count += 1;
      }
      return acc;
    },
    { food: 0, happy: 0, count: 0 }
  );

  const avgFood = petAverages.count ? Math.round(petAverages.food / petAverages.count) : 0;
  const avgHappy = petAverages.count ? Math.round(petAverages.happy / petAverages.count) : 0;

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Family Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep an eye on chores, rewards, and your pets at a glance.
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <ChecklistIcon />
                  </Avatar>
                }
                title="Daily progress"
                subheader="Total chores completed across all kids"
              />
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h3">{completionPercent}%</Typography>
                  <LinearProgress value={completionPercent} variant="determinate" sx={{ height: 10, borderRadius: 999 }} />
                  <Typography variant="body2" color="text.secondary">
                    {totalCompleted} of {totalChores || 0} chores completed today
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <EmojiEventsIcon />
                  </Avatar>
                }
                title="Coins bank"
                subheader="Total coins earned"
              />
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h3">{totalCoins} 🪙</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {kids.length} kids saving for rewards
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="Today's chore list" subheader="Next up for the family" />
              <CardContent>
                {topPending.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    All chores are complete for today. Awesome work!
                  </Typography>
                ) : (
                  <List dense>
                    {topPending.map(({ kid, chore, dueDate }) => (
                      <ListItem key={`${kid.id}-${chore.id}`}>
                        <ListItemAvatar>
                          <Avatar>{kid.name?.[0]}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={chore.name}
                          secondary={`${kid.name} • ${dueDate ? dueDate.format('MMM D') : 'Today'} • ${
                            chore.value ?? 0
                          } pts`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="Pet status" subheader="Average happiness & hunger" />
              <CardMedia
                sx={{ height: 140, backgroundColor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}
              >
                <PetsIcon fontSize="inherit" color="primary" />
              </CardMedia>
              <CardContent>
                <Stack spacing={2}>
                  <Stack>
                    <Typography variant="subtitle2">Food</Typography>
                    <LinearProgress value={avgFood} variant="determinate" sx={{ mt: 1 }} />
                  </Stack>
                  <Stack>
                    <Typography variant="subtitle2">Happiness</Typography>
                    <LinearProgress value={avgHappy} variant="determinate" sx={{ mt: 1 }} color="secondary" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Based on {petAverages.count || 0} pets currently active.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    <StarBorderIcon />
                  </Avatar>
                }
                title="Top streaks"
                subheader="Celebrate consistency"
              />
              <CardContent>
                {kids.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Add kids to start tracking streaks.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {[...kids]
                      .sort((a, b) => (b.streak || 0) - (a.streak || 0))
                      .slice(0, 5)
                      .map((kid) => (
                        <Stack key={kid.id} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1">{kid.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {(kid.streak || 0)} day streak
                          </Typography>
                        </Stack>
                      ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
