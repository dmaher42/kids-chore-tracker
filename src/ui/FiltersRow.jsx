import { Stack } from '@mui/material';

export default function FiltersRow({ children, spacing = 2, wrap = true }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={spacing}
      sx={{
        alignItems: { xs: 'stretch', sm: 'center' },
        flexWrap: wrap ? 'wrap' : 'nowrap',
        gap: spacing,
      }}
    >
      {children}
    </Stack>
  );
}
