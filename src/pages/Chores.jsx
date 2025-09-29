import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UndoIcon from '@mui/icons-material/Undo';
import CheckIcon from '@mui/icons-material/Check';
import dayjs from 'dayjs';
import ChoreDialog from '../components/ChoreDialog';
import ConfirmDialog from '../ui/ConfirmDialog';
import FiltersRow from '../ui/FiltersRow';
import EmptyState from '../ui/EmptyState';
import { useAppData } from '../context/AppDataContext';
import { useLocation } from 'react-router-dom';

const statusColor = (status) => {
  if (status === 'done') return 'success';
  if (status === 'overdue') return 'error';
  if (status === 'upcoming') return 'warning';
  return 'default';
};

export default function Chores() {
  const {
    kids,
    chores,
    dailyProgress,
    toggleChore,
    saveChore,
    deleteChore,
  } = useAppData();
  const [filters, setFilters] = useState({ search: '', kid: 'all', status: 'all' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.kidId) {
      setFilters((prev) => ({ ...prev, kid: String(location.state.kidId) }));
    }
  }, [location.state]);

  const rows = useMemo(() => {
    if (!kids.length) return [];
    const assignments = [];
    const selectedKid = filters.kid;

    kids.forEach((kid) => {
      if (selectedKid !== 'all' && String(kid.id) !== String(selectedKid)) return;
      chores.forEach((chore) => {
        if (chore.kidId && String(chore.kidId) !== String(kid.id)) return;
        const completedChores = dailyProgress[kid.id] || [];
        const completed = completedChores.includes(chore.id);
        const dueDate = chore.dueDate ? dayjs(chore.dueDate) : null;
        let status = completed ? 'done' : 'pending';
        if (!completed && dueDate) {
          status = dayjs().isAfter(dueDate, 'day') ? 'overdue' : 'upcoming';
        }
        assignments.push({
          id: `${kid.id}-${chore.id}`,
          kidId: kid.id,
          choreId: chore.id,
          kidName: kid.name,
          name: chore.name,
          due: dueDate ? dueDate.format('MMM D, YYYY') : 'Today',
          dueDate,
          points: chore.value ?? chore.points ?? 0,
          status,
          completed,
        });
      });
    });
    return assignments;
  }, [kids, chores, dailyProgress, filters.kid]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filters.search && !row.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.status !== 'all' && row.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [rows, filters]);

  const handleOpenDialog = (chore = null) => {
    setEditingChore(chore);
    setDialogOpen(true);
  };

  const handleSave = async (data) => {
    await saveChore(data);
    setDialogOpen(false);
    setEditingChore(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteChore(deleteTarget.id);
    setDeleteTarget(null);
  };

  const columns = [
    { field: 'name', headerName: 'Chore', flex: 1, minWidth: 160 },
    { field: 'kidName', headerName: 'Kid', width: 150 },
    { field: 'due', headerName: 'Due', width: 160 },
    { field: 'points', headerName: 'Points', width: 110, type: 'number' },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => (
        <Chip size="small" label={params.value} color={statusColor(params.value)} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const { row } = params;
        const chore = chores.find((item) => item.id === row.choreId);
        if (!chore) {
          return null;
        }
        const markButton = row.completed ? (
          <Button
            size="small"
            color="secondary"
            startIcon={<UndoIcon />}
            onClick={() => toggleChore(row.kidId, row.choreId)}
          >
            Undo
          </Button>
        ) : (
          <Button
            size="small"
            color="primary"
            startIcon={<CheckIcon />}
            onClick={() => toggleChore(row.kidId, row.choreId)}
          >
            Mark done
          </Button>
        );
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            {markButton}
            <IconButton
              size="small"
              color="primary"
              aria-label="edit chore"
              onClick={() => handleOpenDialog(chore)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              aria-label="delete chore"
              onClick={() => setDeleteTarget(chore)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="h4" gutterBottom>
                Chores
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track daily tasks, mark completions, and add new chores for your crew.
              </Typography>
            </Box>
            <Button startIcon={<AddIcon />} onClick={() => handleOpenDialog(null)}>
              Add chore
            </Button>
          </Stack>
        </Box>
        <FiltersRow>
          <TextField
            label="Search"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            placeholder="Search chores"
          />
          <TextField
            select
            label="Kid"
            value={filters.kid}
            onChange={(event) => setFilters((prev) => ({ ...prev, kid: event.target.value }))}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All kids</MenuItem>
            {kids.map((kid) => (
              <MenuItem key={kid.id} value={kid.id}>
                {kid.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="upcoming">Upcoming</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </TextField>
        </FiltersRow>
        {filteredRows.length === 0 ? (
          <EmptyState
            title="No chores yet"
            description="Add a new chore to get started or adjust your filters."
            actionLabel="Add chore"
            onAction={() => handleOpenDialog(null)}
          />
        ) : (
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              autoHeight
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
            />
          </Box>
        )}
      </Stack>
      <ChoreDialog
        open={dialogOpen}
        chore={editingChore}
        kids={kids}
        onClose={() => {
          setDialogOpen(false);
          setEditingChore(null);
        }}
        onSave={handleSave}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete chore"
        description="Are you sure you want to delete this chore? Kids will lose progress for it."
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
