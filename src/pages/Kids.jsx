import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import KidDialog from '../components/KidDialog';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import { useAppData } from '../context/AppDataContext';
import { useNavigate } from 'react-router-dom';

export default function Kids() {
  const {
    kids,
    dailyProgress,
    chores,
    saveKid,
    deleteKid,
    selectKid,
  } = useAppData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKid, setEditingKid] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const handleAddKid = () => {
    setEditingKid(null);
    setDialogOpen(true);
  };

  const handleEditKid = (kid) => {
    setEditingKid(kid);
    setDialogOpen(true);
  };

  const handleSaveKid = async (payload) => {
    await saveKid(payload);
    setDialogOpen(false);
    setEditingKid(null);
  };

  const handleAssignChores = (kid) => {
    selectKid(kid.id);
    navigate('/chores', { state: { kidId: kid.id } });
  };

  const totalChoresByKid = useMemo(() => {
    return kids.reduce((acc, kid) => {
      const kidChores = chores.filter((chore) => !chore.kidId || chore.kidId === kid.id);
      acc[kid.id] = kidChores.length;
      return acc;
    }, {});
  }, [kids, chores]);

  return (
    <Box>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Kids
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage kid profiles, track streaks, and keep everyone motivated.
            </Typography>
          </Box>
          <Button startIcon={<AddIcon />} onClick={handleAddKid}>
            Add kid
          </Button>
        </Stack>
        {kids.length === 0 ? (
          <EmptyState
            title="No kids yet"
            description="Add your first kid profile to start tracking chores."
            actionLabel="Add kid"
            onAction={handleAddKid}
          />
        ) : (
          <Grid container spacing={3}>
            {kids.map((kid) => {
              const completed = (dailyProgress[kid.id] || []).length;
              const totalChores = totalChoresByKid[kid.id] || 0;
              const completion = totalChores ? Math.round((completed / totalChores) * 100) : 0;
              return (
                <Grid key={kid.id} item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardHeader
                      avatar={<Avatar sx={{ width: 56, height: 56 }}>{kid.name?.[0]}</Avatar>}
                      title={kid.name}
                      subheader={`Age ${kid.age ?? '—'}`}
                      action={
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit">
                            <IconButton aria-label="edit kid" onClick={() => handleEditKid(kid)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton aria-label="delete kid" color="error" onClick={() => setDeleteTarget(kid)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      }
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2">Coins</Typography>
                          <Chip label={`${kid.coins} 🪙`} color="secondary" size="small" />
                        </Stack>
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2">Today's progress</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {completed}/{totalChores} chores
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={completion}
                            sx={{ mt: 1, height: 8, borderRadius: 999 }}
                          />
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            icon={<EmojiEventsIcon fontSize="small" />}
                            label={`Streak ${kid.streak ?? 0} days`}
                            size="small"
                          />
                          <Chip
                            icon={<AssignmentTurnedInIcon fontSize="small" />}
                            label={`Pet level ${kid.petLevel ?? 1}`}
                            size="small"
                          />
                        </Stack>
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
                      <Button variant="text" onClick={() => handleEditKid(kid)}>
                        View profile
                      </Button>
                      <Button onClick={() => handleAssignChores(kid)}>Assign chores</Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Stack>
      <KidDialog
        open={dialogOpen}
        kid={editingKid}
        onClose={() => {
          setDialogOpen(false);
          setEditingKid(null);
        }}
        onSave={handleSaveKid}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete kid profile"
        description="This will remove the kid and their progress."
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteKid(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </Box>
  );
}
