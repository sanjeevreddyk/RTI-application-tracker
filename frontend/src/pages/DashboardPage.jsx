import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardActionArea, CardContent, Grid2, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts';
import { fetchDashboard } from '../features/dashboard/dashboardSlice';
import { formatDate } from '../utils/date';

const COLORS = ['#0f5cc0', '#2f855a', '#b7791f', '#c53030'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const cards = data?.cards || {
    totalRtis: 0,
    pendingPioResponses: 0,
    firstAppealsFiled: 0,
    secondAppealsFiled: 0,
    closedRtis: 0,
    overdueRtis: 0
  };

  const cardItems = [
    { label: 'Total RTIs', value: cards.totalRtis, params: {} },
    { label: 'Pending PIO Responses', value: cards.pendingPioResponses, params: { status: 'RTI Filed' } },
    { label: 'First Appeals Filed', value: cards.firstAppealsFiled, params: { status: 'First Appeal Filed' } },
    { label: 'Second Appeals Filed', value: cards.secondAppealsFiled, params: { status: 'Second Appeal Filed' } },
    { label: 'Closed RTIs', value: cards.closedRtis, params: { status: 'Case Closed' } },
    { label: 'Overdue RTIs', value: cards.overdueRtis, params: { overdue: 'true' } }
  ];

  function openFilteredRtis(params) {
    const query = new URLSearchParams(params).toString();
    navigate(query ? `/rtis?${query}` : '/rtis');
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        Dashboard
      </Typography>

      <Grid2 container spacing={2}>
        {cardItems.map((item, index) => (
          <Grid2 key={item.label} size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                background:
                  index === 2
                    ? 'linear-gradient(135deg, #20a2f5 0%, #1f8df0 55%, #1677d6 100%)'
                    : 'linear-gradient(145deg, #ffffff 0%, #f8fbff 100%)'
              }}
            >
              <CardActionArea onClick={() => openFilteredRtis(item.params)}>
                <CardContent>
                  <Typography color={index === 2 ? 'rgba(255,255,255,0.9)' : 'text.secondary'}>
                    {item.label}
                  </Typography>
                  <Typography variant="h4" color={index === 2 ? '#fff' : 'primary.main'} fontWeight={800}>
                    {item.value}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, 20 + item.value * 5)}
                    sx={{
                      mt: 1.2,
                      height: 6,
                      borderRadius: 999,
                      bgcolor: index === 2 ? 'rgba(255,255,255,0.25)' : '#e7eef7',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: index === 2 ? '#fff' : '#1f8df0'
                      }
                    }}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: 340, background: 'linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%)' }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>RTIs Filed Per Year</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={data?.charts?.filedPerYear || []}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0f5cc0" name="Cases" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: 340, background: 'linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%)' }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Success vs Pending</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={data?.charts?.successVsPending || []} dataKey="value" nameKey="name" outerRadius={100}>
                  {(data?.charts?.successVsPending || []).map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid2>
      </Grid2>

      <Paper sx={{ p: 2, background: 'linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%)' }}>
        <Typography variant="subtitle1" fontWeight={700} mb={1}>
          Upcoming Deadlines
        </Typography>
        {(data?.upcomingDeadlines || []).map((item) => (
          <Typography key={`${item.rtiId}-${item.deadlineType}`} variant="body2" sx={{ py: 0.5 }}>
            {item.rtiNumber} | {item.department} | {item.deadlineType}: {formatDate(item.deadlineDate)}
          </Typography>
        ))}
      </Paper>
    </Stack>
  );
}
