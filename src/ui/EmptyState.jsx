import { Box, Button, Typography } from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';

export default function EmptyState({
  icon = <SentimentSatisfiedAltIcon fontSize="large" />,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
      {title && (
        <Typography variant="h6" component="h3">
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
          {description}
        </Typography>
      )}
      {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
    </Box>
  );
}
