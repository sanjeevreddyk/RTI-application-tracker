import { Backdrop, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';

export default function GlobalLoader() {
  const authLoading = useSelector((state) => state.auth.loading);
  const dashboardLoading = useSelector((state) => state.dashboard.loading);
  const analyticsLoading = useSelector((state) => state.analytics.loading);
  const rtiLoading = useSelector((state) => state.rti.loading);

  const open = authLoading || dashboardLoading || analyticsLoading || rtiLoading;

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1600,
        backgroundColor: 'rgb(15 23 42 / 35%)'
      }}
      open={open}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}