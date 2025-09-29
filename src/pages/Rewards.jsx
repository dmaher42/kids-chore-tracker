import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RewardCard from '../components/RewardCard';
import FiltersRow from '../ui/FiltersRow';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import { useAppData } from '../context/AppDataContext';
import { SHOP_ITEMS, REWARD_CATEGORIES } from '../data/shopItems';

function flattenRewards() {
  return Object.entries(SHOP_ITEMS).flatMap(([category, items]) =>
    items.map((item) => ({
      ...item,
      category,
      categoryLabel: REWARD_CATEGORIES.find((c) => c.value === category)?.label ?? category,
    }))
  );
}

export default function Rewards() {
  const { kids, selectedKidId, selectKid, kidInventories, buyItem } = useAppData();
  const [filters, setFilters] = useState({ search: '', category: 'all' });
  const [pendingReward, setPendingReward] = useState(null);
  const rewards = useMemo(() => flattenRewards(), []);
  const currentKid = useMemo(
    () => kids.find((kid) => kid.id === selectedKidId) || null,
    [kids, selectedKidId]
  );

  useEffect(() => {
    if (!selectedKidId && kids.length) {
      selectKid(kids[0].id);
    }
  }, [kids, selectedKidId, selectKid]);

  const filteredRewards = useMemo(() => {
    return rewards.filter((reward) => {
      if (filters.category !== 'all' && reward.category !== filters.category) return false;
      if (
        filters.search &&
        !reward.name.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [rewards, filters]);

  const handleRedeem = (reward) => {
    setPendingReward(reward);
  };

  const handleConfirmRedeem = async () => {
    if (!pendingReward || !currentKid) {
      setPendingReward(null);
      return;
    }
    await buyItem(currentKid.id, pendingReward, pendingReward.category);
    setPendingReward(null);
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="h4" gutterBottom>
                Rewards
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redeem coins for fun upgrades and keep motivation high.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <TextField
                select
                label="Kid"
                value={selectedKidId ? String(selectedKidId) : ''}
                onChange={(event) => selectKid(Number(event.target.value))}
                sx={{ minWidth: 180 }}
              >
                {kids.map((kid) => (
                  <MenuItem key={kid.id} value={String(kid.id)}>
                    {kid.name} — {kid.coins} coins
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>
        </Box>
        <FiltersRow>
          <TextField
            label="Search rewards"
            placeholder="Search by name"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
          <TextField
            select
            label="Category"
            value={filters.category}
            onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
            sx={{ minWidth: 180 }}
          >
            {REWARD_CATEGORIES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </FiltersRow>
        {filteredRewards.length === 0 ? (
          <EmptyState
            icon={<EmojiEventsIcon sx={{ fontSize: 48 }} />}
            title="No rewards found"
            description="Try adjusting your filters or create new rewards."
          />
        ) : (
          <Grid container spacing={3}>
            {filteredRewards.map((reward) => {
              const inventory = currentKid ? kidInventories[currentKid.id] || {} : {};
              const owned = Boolean((inventory[reward.category] || []).includes(reward.id));
              const canAfford = currentKid ? currentKid.coins >= reward.price : false;
              return (
                <Grid key={reward.id} item xs={12} sm={6} md={4}>
                  <RewardCard
                    reward={reward}
                    owned={owned}
                    disabled={!currentKid || owned || !canAfford}
                    onRedeem={handleRedeem}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
      </Stack>
      <ConfirmDialog
        open={Boolean(pendingReward)}
        title="Redeem reward"
        description={
          pendingReward && currentKid
            ? `${currentKid.name} will spend ${pendingReward.price} coins to unlock ${pendingReward.name}. Continue?`
            : 'Select a kid to redeem rewards.'
        }
        confirmLabel="Redeem"
        onClose={() => setPendingReward(null)}
        onConfirm={handleConfirmRedeem}
      />
      {!kids.length && (
        <EmptyState
          icon={<LoyaltyIcon sx={{ fontSize: 48 }} />}
          title="Add kids to get started"
          description="Create a kid profile before redeeming rewards."
        />
      )}
    </Box>
  );
}
