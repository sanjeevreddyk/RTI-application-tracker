import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardActionArea,
  CardContent,
  Grid2,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
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
import { formatRtiNumber } from '../utils/rtiNumber';

const COLORS = ['#0f5cc0', '#2f855a', '#b7791f', '#c53030'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data } = useSelector((state) => state.dashboard);
  const [sortBy, setSortBy] = useState('applicationDate');
  const [sortDir, setSortDir] = useState('asc');

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

  const sortedUpcomingDeadlines = useMemo(() => {
    const rows = [...(data?.upcomingDeadlines || [])];
    rows.sort((a, b) => {
      if (sortBy === 'applicationDate' || sortBy === 'deadlineDate') {
        const av = new Date(a[sortBy] || 0).getTime();
        const bv = new Date(b[sortBy] || 0).getTime();
        return sortDir === 'asc' ? av - bv : bv - av;
      }

      const av = String(a[sortBy] || '').toLowerCase();
      const bv = String(b[sortBy] || '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [data?.upcomingDeadlines, sortBy, sortDir]);

  function handleSort(column) {
    if (sortBy === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(column);
    setSortDir('asc');
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
                  <Typography variant={isMobile ? 'h5' : 'h4'} color={index === 2 ? '#fff' : 'primary.main'} fontWeight={800}>
                    {item.value}
                  </Typography>
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
              <BarChart data={data?.charts?.filedPerYear || []} margin={{ left: isMobile ? -18 : 0, right: isMobile ? 8 : 0 }}>
                <XAxis dataKey="year" tick={{ fontSize: isMobile ? 11 : 12 }} />
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
                <Pie data={data?.charts?.successVsPending || []} dataKey="value" nameKey="name" outerRadius={isMobile ? 74 : 100}>
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
        <Stack spacing={1} sx={{ display: { xs: 'flex', md: 'none' } }}>
          {sortedUpcomingDeadlines.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No upcoming deadlines found.
            </Typography>
          ) : (
            sortedUpcomingDeadlines.map((item) => (
              <Paper key={`${item.rtiId}-${item.deadlineType}`} variant="outlined" sx={{ p: 1.25 }}>
                <Typography variant="body2" fontWeight={700}>
                  {formatRtiNumber(item.rtiNumber, item.applicationDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Department: {item.department || '-'}
                </Typography>
                <Typography variant="body2">Filed: {formatDate(item.applicationDate)}</Typography>
                <Typography variant="body2">Deadline: {formatDate(item.deadlineDate)}</Typography>
                <Typography variant="body2">Status: {item.status || '-'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Rule: {item.reminderRule || '-'}
                </Typography>
              </Paper>
            ))
          )}
        </Stack>

        <TableContainer sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={sortBy === 'rtiNumber' ? sortDir : false}>
                  <TableSortLabel
                    active={sortBy === 'rtiNumber'}
                    direction={sortBy === 'rtiNumber' ? sortDir : 'asc'}
                    onClick={() => handleSort('rtiNumber')}
                  >
                    RTI Number
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === 'department' ? sortDir : false}>
                  <TableSortLabel
                    active={sortBy === 'department'}
                    direction={sortBy === 'department' ? sortDir : 'asc'}
                    onClick={() => handleSort('department')}
                  >
                    Department
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === 'applicationDate' ? sortDir : false}>
                  <TableSortLabel
                    active={sortBy === 'applicationDate'}
                    direction={sortBy === 'applicationDate' ? sortDir : 'asc'}
                    onClick={() => handleSort('applicationDate')}
                  >
                    Filed Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === 'deadlineDate' ? sortDir : false}>
                  <TableSortLabel
                    active={sortBy === 'deadlineDate'}
                    direction={sortBy === 'deadlineDate' ? sortDir : 'asc'}
                    onClick={() => handleSort('deadlineDate')}
                  >
                    Deadline Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === 'status' ? sortDir : false}>
                  <TableSortLabel
                    active={sortBy === 'status'}
                    direction={sortBy === 'status' ? sortDir : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>Reminder Rule</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUpcomingDeadlines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary">
                      No upcoming deadlines found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedUpcomingDeadlines.map((item) => (
                  <TableRow key={`${item.rtiId}-${item.deadlineType}`}>
                    <TableCell>{formatRtiNumber(item.rtiNumber, item.applicationDate)}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>{formatDate(item.applicationDate)}</TableCell>
                    <TableCell>{formatDate(item.deadlineDate)}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{item.reminderRule || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
