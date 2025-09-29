import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onClose,
  onConfirm,
}) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="confirm-dialog-title">
      {title && <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>}
      {description && (
        <DialogContent>
          <DialogContentText>{description}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose} variant="text">
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} autoFocus>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
