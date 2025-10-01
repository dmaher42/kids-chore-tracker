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
  LinearProgress,
  Snackbar,
  Stack,
  Typography,
  Alert,
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import EggIcon from '@mui/icons-material/Egg';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { useAppData } from '../context/AppDataContext';
import { PET_TYPES, LEVEL_NAMES } from '../data/pets';
import EmptyState from '../ui/EmptyState';

export default function Pet() {
  const {
    kids,
    petStates,
    kidPets,
    updatePetState,
    updateKidCoins,
    upgradePetLevel,
    buyEgg,
    setActivePet,
  } = useAppData();

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const kidCards = useMemo(() => {
    return kids.map((kid) => {
      const state = petStates[kid.id] || { food: 50, happy: 50 };
      const ownedPets = kidPets[kid.id] || [];
      const activePet = ownedPets.find((pet) => pet.id === kid.activePet) || ownedPets[0] || null;
      const petMeta = activePet ? PET_TYPES[activePet.type] : null;
      const levelIndex = activePet ? Math.min(activePet.level - 1, LEVEL_NAMES.length - 1) : kid.petLevel - 1;
      const levelName = LEVEL_NAMES[Math.max(0, levelIndex)] || LEVEL_NAMES[0];

      const level = activePet ? activePet.level : kid.petLevel || 1;
      return {
        kid,
        state,
        ownedPets,
        activePet,
        petMeta,
        levelName,
        level,
      };
    });
  }, [kids, petStates, kidPets]);

  const handleFeed = async (card) => {
    if (card.kid.coins < 3) return;
    await updateKidCoins(card.kid.id, 3);
    await updatePetState(card.kid.id, {
      food: Math.min(100, (card.state.food || 0) + 20),
    });
    showSnackbar('Food +20');
  };

  const handlePlay = async (card) => {
    if (card.kid.coins < 2) return;
    await updateKidCoins(card.kid.id, 2);
    await updatePetState(card.kid.id, {
      happy: Math.min(100, (card.state.happy || 0) + 20),
    });
    showSnackbar('Happiness +20');
  };

  const handleEvolve = async (card) => {
    const cost = card.level * 10;
    if (!card.activePet || card.kid.coins < cost || card.level >= 5) return;

    const result = await upgradePetLevel(card.kid.id);

    if (result?.success) {
      const nextLevel = Math.min(result.newLevel ?? card.level + 1, 5);
      showSnackbar(`Evolved to Lv.${nextLevel}!`);
    } else {
      showSnackbar('Pet could not evolve right now. Try again soon.', 'error');
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Pet Lounge
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep virtual pets happy by feeding, playing, and evolving them.
          </Typography>
        </Box>
        {kids.length === 0 ? (
          <EmptyState
            title="Add kids to unlock pets"
            description="Create a kid profile first so they can hatch adorable companions."
            icon={<PetsIcon sx={{ fontSize: 48 }} />}
          />
        ) : (
          <Grid container spacing={3}>
            {kidCards.map((card) => (
              <Grid key={card.kid.id} item xs={12} md={6}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{card.kid.name?.[0]}</Avatar>}
                    title={`${card.kid.name}'s pet`}
                    subheader={card.petMeta ? card.petMeta.name : 'No pet yet'}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ fontSize: 48 }} aria-hidden>
                          {card.petMeta
                            ? card.petMeta.levels[
                                Math.min(card.petMeta.levels.length - 1, Math.max(0, card.level - 1))
                              ]
                            : '🥚'}
                        </Box>
                        <Stack spacing={0.5}>
                          <Typography variant="h6">
                            {card.petMeta ? card.petMeta.name : 'Buy an egg'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {card.petMeta
                              ? `${card.levelName} companion`
                              : 'Hatch a surprise pet with an egg purchase.'}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SentimentSatisfiedAltIcon fontSize="small" /> Food
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {card.state.food}%
                          </Typography>
                        </Stack>
                        <LinearProgress value={card.state.food} variant="determinate" sx={{ height: 8, borderRadius: 999 }} />
                      </Stack>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SentimentVerySatisfiedIcon fontSize="small" /> Happiness
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {card.state.happy}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          value={card.state.happy}
                          color="secondary"
                          variant="determinate"
                          sx={{ height: 8, borderRadius: 999 }}
                        />
                      </Stack>
                      {card.ownedPets.length > 0 && (
                        <Stack spacing={1}>
                          <Typography variant="subtitle2">Owned pets</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {card.ownedPets.map((pet) => {
                              const metadata = PET_TYPES[pet.type];
                              const active = card.kid.activePet === pet.id;
                              return (
                                <Chip
                                  key={pet.id}
                                  label={`${metadata?.emoji || '🐾'} Lv.${pet.level}`}
                                  color={active ? 'primary' : 'default'}
                                  onClick={() => setActivePet(card.kid.id, pet.id)}
                                  sx={{ cursor: 'pointer' }}
                                />
                              );
                            })}
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, px: 3, pb: 3 }}>
                    <Button onClick={() => handleFeed(card)} disabled={card.kid.coins < 3}>
                      Feed (-3)
                    </Button>
                    <Button onClick={() => handlePlay(card)} disabled={card.kid.coins < 2}>
                      Play (-2)
                    </Button>
                    <Button
                      onClick={() => handleEvolve(card)}
                      disabled={
                        !card.activePet || card.level >= 5 || card.kid.coins < card.level * 10
                      }
                    >
                      Evolve (-{card.level * 10})
                    </Button>
                    <Button startIcon={<EggIcon />} onClick={() => buyEgg(card.kid.id)} disabled={card.kid.coins < 15}>
                      Buy egg (-15)
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
