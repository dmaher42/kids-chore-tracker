import * as React from 'react';
import dayjs from 'dayjs';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddTaskIcon from '@mui/icons-material/AddTask';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import RedeemIcon from '@mui/icons-material/Redeem';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PetsIcon from '@mui/icons-material/Pets';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAppData } from '../context/AppDataContext';
import {
  getKidById,
  getChoresByKid,
  getRewardsByKid,
  getPetsByKid,
} from '../data/selectors';

function a11yProps(index) {
  return {
    id: `kid-tab-${index}`,
    'aria-controls': `kid-tabpanel-${index}`,
  };
}

function TabPanel({ value, index, children }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`kid-tabpanel-${index}`}
      aria-labelledby={`kid-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function KidDetailPage() {
  const { kidId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { kids, chores, dailyProgress, kidPets } = useAppData();

  const kid = React.useMemo(() => getKidById(kidId, kids), [kidId, kids]);
  const kidChores = React.useMemo(() => getChoresByKid(kidId, chores), [kidId, chores]);
  const kidRewards = React.useMemo(() => getRewardsByKid(kidId), [kidId]);
  const ownedPets = React.useMemo(
    () => getPetsByKid(kidId, kidPets),
    [kidId, kidPets],
  );

  const completedChores = React.useMemo(() => {
    if (!kid) return new Set();
    return new Set(dailyProgress?.[kid.id] || []);
  }, [dailyProgress, kid]);

  React.useEffect(() => {
    document.title = kid ? `${kid.name} • Kids` : 'Kid not found';
  }, [kid]);

  const hashToIndex = React.useCallback((hash) => {
    if (hash === '#rewards') return 1;
    if (hash === '#pets') return 2;
    return 0;
  }, []);

  const indexToHash = React.useCallback((index) => {
    if (index === 1) return '#rewards';
    if (index === 2) return '#pets';
    return '#chores';
  }, []);

  const [tab, setTab] = React.useState(() => hashToIndex(location.hash));

  React.useEffect(() => {
    setTab(hashToIndex(location.hash));
  }, [hashToIndex, location.hash]);

  const handleTabChange = (_event, newValue) => {
    setTab(newValue);
    navigate({ pathname: location.pathname, hash: indexToHash(newValue) }, { replace: true });
  };

  const handleEditKid = () => {
    if (!kid) return;
    navigate('/kids', { state: { editKidId: kid.id } });
  };

  if (!kid) {
    return (
      <Stack spacing={2} sx={{ py: 6, alignItems: 'center' }}>
        <Typography variant="h5">Kid not found</Typography>
        <Typography color="text.secondary" align="center" sx={{ maxWidth: 320 }}>
          We couldn't find that kid's profile. Try returning to the Kids page and selecting a different kid.
        </Typography>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/kids')}>
          Back to Kids
        </Button>
      </Stack>
    );
  }

  const rows = kidChores.map((chore) => ({
    id: chore.id ?? `${chore.name}-${chore.dueDate ?? ''}`,
    name: chore.name,
    due: chore.dueDate ? dayjs(chore.dueDate).format('MMM D') : '—',
    points: chore.points ?? chore.value ?? 0,
    status: completedChores.has(chore.id) ? 'done' : 'pending',
  }));

  const columns = [
    { field: 'name', headerName: 'Chore', flex: 1, minWidth: 160 },
    { field: 'due', headerName: 'Due', width: 120 },
    { field: 'points', headerName: 'Points', width: 120, type: 'number' },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: ({ value }) => {
        const status = typeof value === 'string' ? value.toLowerCase() : 'pending';
        let color = 'default';
        if (status === 'done' || status === 'completed') color = 'success';
        if (status === 'overdue') color = 'error';
        return <Chip size="small" label={status.charAt(0).toUpperCase() + status.slice(1)} color={color} />;
      },
      sortable: false,
    },
  ];

  return (
    <Stack spacing={3} sx={{ py: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
          <Avatar src={kid.photoUrl || ''} alt={kid.name} sx={{ width: 72, height: 72 }}>
            {kid.name?.[0] ?? 'K'}
          </Avatar>
          <Box>
            <Typography variant="h4">{kid.name}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip label={`Coins: ${kid.coins ?? kid.points ?? 0}`} color="secondary" />
              <Chip label={`Streak: ${kid.streak ?? 0}`} />
              <Chip label={`Pet Level: ${kid.petLevel ?? kid.level ?? 1}`} />
            </Stack>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              component={RouterLink}
              to="/kids"
            >
              All kids
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={handleEditKid}>
              Edit kid
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <Divider />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          aria-label="Kid detail tabs"
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab label="Chores" {...a11yProps(0)} />
          <Tab label="Rewards" {...a11yProps(1)} />
          <Tab label="Pets" {...a11yProps(2)} />
        </Tabs>
      </Box>

      <TabPanel value={tab} index={0}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddTaskIcon fontSize="small" /> Chores
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button variant="contained" startIcon={<AddTaskIcon />}>Add chore</Button>
                  <Button variant="outlined" startIcon={<PlaylistAddIcon />}>Assign existing</Button>
                </Stack>
              </Stack>
              <Box sx={{ width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  autoHeight
                  initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                  pageSizeOptions={[5, 10, 25]}
                  disableRowSelectionOnClick
                  sx={{ border: 'none' }}
                  localeText={{ noRowsLabel: 'No chores assigned yet.' }}
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Activity
              </Typography>
              <Typography color="text.secondary">
                Track streaks, recent completions, and upcoming goals. Activity insights are coming soon.
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsIcon fontSize="small" /> Rewards
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button variant="contained" startIcon={<RedeemIcon />}>Redeem reward</Button>
                <Button variant="outlined" startIcon={<StorefrontIcon />}>View store</Button>
              </Stack>
            </Stack>
            {kidRewards.length === 0 ? (
              <Typography color="text.secondary">No rewards redeemed yet.</Typography>
            ) : (
              <List dense>
                {kidRewards.map((reward) => (
                  <ListItem key={reward.id ?? `${reward.title}-${reward.date}`}> 
                    <ListItemText
                      primary={reward.title ?? reward.name ?? 'Reward'}
                      secondary={
                        `${reward.cost ?? reward.points ?? 0} pts${
                          reward.date ? ` • ${dayjs(reward.date).format('MMM D, YYYY')}` : ''
                        }`
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PetsIcon fontSize="small" /> Pets
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button variant="contained">Add pet</Button>
                <Button variant="outlined">Manage pets</Button>
              </Stack>
            </Stack>
            {ownedPets.length === 0 ? (
              <Typography color="text.secondary">No pets linked to this kid yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {ownedPets.map((pet) => (
                  <Card key={pet.id ?? pet.name ?? pet.type} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">{pet.name ?? pet.type ?? 'Pet'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pet.type ? `Type: ${pet.type}` : 'Type: Unknown'}
                        {pet.level ? ` • Level ${pet.level}` : ''}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </Stack>
  );
}
