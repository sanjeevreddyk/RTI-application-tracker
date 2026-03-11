import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { subscribeToast } from '../utils/toast';

export default function ToastHost() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    return subscribeToast((payload) => {
      setQueue((prev) => [...prev, { ...payload, id: Date.now() + Math.random() }]);
    });
  }, []);

  useEffect(() => {
    if (current || !queue.length) {
      return;
    }

    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);
  }, [queue, current]);

  function handleClose(_, reason) {
    if (reason === 'clickaway') {
      return;
    }
    setCurrent(null);
  }

  return (
    <Snackbar
      open={Boolean(current)}
      autoHideDuration={3200}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={current?.severity || 'info'} variant="filled" sx={{ width: '100%' }}>
        {current?.message || ''}
      </Alert>
    </Snackbar>
  );
}
