import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chip, Paper, Stack, Typography } from '@mui/material';
import { fetchDashboard } from '../features/dashboard/dashboardSlice';
import { deadlineChip, formatDate } from '../utils/date';

export default function CalendarPage() {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>Deadline Calendar</Typography>
      {(data?.upcomingDeadlines || []).map((item) => {
        const chip = deadlineChip(item.status);
        return (
          <Paper
            key={`${item.rtiId}-${item.deadlineType}`}
            sx={{ p: 2, background: 'linear-gradient(145deg, #ffffff 0%, #f7fbff 100%)' }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <div>
                <Typography fontWeight={600}>{item.rtiNumber}</Typography>
                <Typography variant="body2" color="text.secondary">{item.department} | {item.deadlineType}</Typography>
                <Typography variant="body2">Due: {formatDate(item.deadlineDate)}</Typography>
              </div>
              <Chip label={chip.label} color={chip.color} />
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
