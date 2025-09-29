import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Typography,
} from '@mui/material';

export default function RewardCard({ reward, onRedeem, disabled, owned }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        avatar={
          <Box sx={{ fontSize: 32 }} aria-hidden>
            {reward.emoji}
          </Box>
        }
        title={reward.name}
        titleTypographyProps={{ variant: 'h6' }}
        subheader={reward.categoryLabel}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {reward.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 3, pb: 3, pt: 0, alignItems: 'center', justifyContent: 'space-between' }}>
        <Chip label={`${reward.price} coins`} color="secondary" />
        <Button onClick={() => onRedeem?.(reward)} disabled={disabled}>
          {owned ? 'Owned' : 'Redeem'}
        </Button>
      </CardActions>
    </Card>
  );
}
