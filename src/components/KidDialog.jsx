import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

const DEFAULT_FORM = {
  id: null,
  name: '',
  age: '',
  coins: 0,
};

export default function KidDialog({ open, kid, onClose, onSave }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (kid) {
      setForm({
        id: kid.id ?? null,
        name: kid.name ?? '',
        age: kid.age ?? '',
        coins: kid.coins ?? 0,
      });
    } else {
      setForm({ ...DEFAULT_FORM });
    }
    setErrors({});
  }, [kid, open]);

  const handleSubmit = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (form.age < 0) newErrors.age = 'Age must be 0 or greater';
    if (form.coins < 0) newErrors.coins = 'Coins must be 0 or greater';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSave?.({
      id: form.id,
      name: form.name.trim(),
      age: Number(form.age) || 0,
      coins: Number(form.coins) || 0,
    });
  };

  const title = form.id ? 'Edit kid' : 'Add kid';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
            error={Boolean(errors.name)}
            helperText={errors.name}
            autoFocus
          />
          <TextField
            label="Age"
            type="number"
            value={form.age}
            onChange={(event) => setForm((prev) => ({ ...prev, age: Number(event.target.value) || 0 }))}
            inputProps={{ min: 0 }}
            error={Boolean(errors.age)}
            helperText={errors.age}
          />
          <TextField
            label="Coins"
            type="number"
            value={form.coins}
            onChange={(event) => setForm((prev) => ({ ...prev, coins: Number(event.target.value) || 0 }))}
            inputProps={{ min: 0 }}
            error={Boolean(errors.coins)}
            helperText={errors.coins}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
