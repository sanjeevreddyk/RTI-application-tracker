import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid2, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAnalytics } from '../features/analytics/analyticsSlice';

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>RTI Analytics</Typography>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, background: 'linear-gradient(145deg, #ffffff 0%, #f4fbff 100%)' }}>
            <Typography color="text.secondary">Average Response Time (days)</Typography>
            <Typography variant={isMobile ? 'h5' : 'h4'} color="primary.main" fontWeight={800}>{data?.averageResponseTime || 0}</Typography>
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, background: 'linear-gradient(145deg, #ffffff 0%, #fffaef 100%)' }}>
            <Typography color="text.secondary">Appeal Success Rate</Typography>
            <Typography variant={isMobile ? 'h5' : 'h4'} color="secondary.main" fontWeight={800}>{data?.appealSuccessRate || 0}%</Typography>
          </Paper>
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: 340, background: 'linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%)' }}>
            <Typography variant="subtitle1" fontWeight={700}>Departments With Delays</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={data?.departmentsDelay || []} margin={{ left: isMobile ? -22 : 0, right: isMobile ? 8 : 0, bottom: isMobile ? 28 : 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" hide={false} tick={{ fontSize: isMobile ? 10 : 12 }} angle={isMobile ? -25 : 0} textAnchor={isMobile ? 'end' : 'middle'} interval={0} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="delayedCases" fill="#c53030" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: 340, background: 'linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%)' }}>
            <Typography variant="subtitle1" fontWeight={700}>RTIs Filed Per Year</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={data?.rtisFiledPerYear || []} margin={{ left: isMobile ? -18 : 0, right: isMobile ? 8 : 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: isMobile ? 11 : 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0f5cc0" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid2>
      </Grid2>
    </Stack>
  );
}
