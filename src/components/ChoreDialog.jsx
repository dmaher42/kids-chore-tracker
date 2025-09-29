import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const DEFAULT_FORM = {
  id: null,
  name: '',
  kidId: 'all',
  points: 1,
  dueDate: null,
};

export default function ChoreDialog({ open, chore, kids = [], onClose, onSave }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (chore) {
      setForm({
        id: chore.id ?? null,
        name: chore.name ?? '',
        kidId: chore.kidId ?? 'all',
        points: chore.value ?? chore.points ?? 0,
        dueDate: chore.dueDate ? dayjs(chore.dueDate) : null,
      });
    } else {
      setForm({ ...DEFAULT_FORM });
    }
    setErrors({});
  }, [chore, open]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleDateChange = (value) => {
    setForm((prev) => ({ ...prev, dueDate: value }));
  };

  const handleSave = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (form.points === '' || Number(form.points) < 0) newErrors.points = 'Points must be 0 or more';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      id: form.id,
      name: form.name.trim(),
      kidId: form.kidId === 'all' ? null : form.kidId,
      points: Number(form.points),
      dueDate: form.dueDate ? form.dueDate.toISOString() : null,
    };

    onSave?.(payload);
  };

  const title = form.id ? 'Edit Chore' : 'Add Chore';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Chore name"
            value={form.name}
            onChange={handleChange('name')}
            required
            error={Boolean(errors.name)}
            helperText={errors.name}
            autoFocus
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="kid-select">Kid</InputLabel>
            <Select
              labelId="kid-select"
              label="Kid"
              value={form.kidId}
              onChange={handleChange('kidId')}
            >
              <MenuItem value="all">All kids</MenuItem>
              {kids.map((kid) => (
                <MenuItem key={kid.id} value={kid.id}>
                  {kid.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select who this chore applies to</FormHelperText>
          </FormControl>
          <TextField
            label="Points"
            type="number"
            value={form.points}
            onChange={handleChange('points')}
            inputProps={{ min: 0 }}
            error={Boolean(errors.points)}
            helperText={errors.points}
            fullWidth
          />
          <DatePicker
            label="Due date"
            value={form.dueDate}
            onChange={handleDateChange}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text">
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
