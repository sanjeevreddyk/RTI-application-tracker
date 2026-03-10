import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TableSortLabel,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { deleteRti, fetchRtis } from '../features/rti/rtiSlice';
import { downloadCsv, downloadPdf } from '../api/downloads';
import { deadlineChip, formatDate } from '../utils/date';

const statusOptions = ['', 'RTI Filed', 'PIO Response Received', 'First Appeal Filed', 'First Appeal Order Received', 'Second Appeal Filed', 'Second Appeal Hearing', 'Second Appeal Order', 'Case Closed'];

export default function RTIListPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const location = useLocation();
  const { list, loading } = useSelector((state) => state.rti);
  const initialParams = useMemo(() => new URLSearchParams(location.search), []);

  const [search, setSearch] = useState(() => initialParams.get('search') || '');
  const [year, setYear] = useState(() => initialParams.get('year') || '');
  const [status, setStatus] = useState(() => initialParams.get('status') || '');
  const [department, setDepartment] = useState(() => initialParams.get('department') || '');
  const [overdue, setOverdue] = useState(() => initialParams.get('overdue') || '');
  const [sortBy, setSortBy] = useState('applicationDate');
  const [sortDir, setSortDir] = useState('desc');

  const query = useMemo(
    () => ({ search, year, status, department, overdue }),
    [search, year, status, department, overdue]
  );
  const displayList = useMemo(() => {
    if (overdue !== 'true') {
      return list;
    }

    return list.filter(
      (item) => item.status === 'RTI Filed' && item.deadlines?.pioDeadlineStatus === 'overdue'
    );
  }, [list, overdue]);
  const sortedDisplayList = useMemo(() => {
    const rows = [...displayList];
    rows.sort((a, b) => {
      const getValue = (item) => {
        if (sortBy === 'applicationDate') {
          return new Date(item.applicationDate || 0).getTime();
        }

        if (sortBy === 'pioDeadline') {
          return new Date(item.deadlines?.pioDeadline || 0).getTime();
        }

        return String(item[sortBy] || '').toLowerCase();
      };

      const av = getValue(a);
      const bv = getValue(b);

      if (av < bv) {
        return sortDir === 'asc' ? -1 : 1;
      }
      if (av > bv) {
        return sortDir === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return rows;
  }, [displayList, sortBy, sortDir]);

  function handleSort(column) {
    if (sortBy === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(column);
    setSortDir('asc');
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('search') || '');
    setYear(params.get('year') || '');
    setStatus(params.get('status') || '');
    setDepartment(params.get('department') || '');
    setOverdue(params.get('overdue') || '');
  }, [location.search]);

  useEffect(() => {
    dispatch(fetchRtis(query));
  }, [dispatch, query]);

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1}
      >
        <Typography variant="h5" fontWeight={700}>RTI Applications</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="outlined" onClick={downloadCsv}>Export CSV</Button>
          <Button variant="outlined" onClick={downloadPdf}>Export PDF</Button>
          <Button variant="contained" component={Link} to="/rtis/add">Add RTI</Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField fullWidth label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <TextField fullWidth label="Year" value={year} onChange={(e) => setYear(e.target.value)} />
          <TextField fullWidth select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 220 }}>
            {statusOptions.map((option) => (
              <MenuItem key={option || 'all'} value={option}>{option || 'All'}</MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
        </Stack>
        {overdue === 'true' && (
          <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
            Overdue filter active (pending RTIs with crossed PIO deadline).
          </Typography>
        )}
      </Paper>

      {isMobile ? (
        <Stack spacing={1.25}>
          {!loading && sortedDisplayList.map((item) => {
            const chipData = deadlineChip(item.deadlines?.pioDeadlineStatus);
            return (
              <Paper key={item._id} sx={{ p: 1.5 }}>
                <Stack spacing={0.75}>
                  <Typography variant="subtitle2" fontWeight={700}>{item.rtiNumber}</Typography>
                  <Typography variant="body2">{item.subject}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.department}</Typography>
                  <Typography variant="caption">Filed: {formatDate(item.applicationDate)}</Typography>
                  <Typography variant="caption">Status: {item.status}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="caption">PIO: {formatDate(item.deadlines?.pioDeadline)}</Typography>
                    <Chip size="small" color={chipData.color} label={chipData.label} />
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button size="small" component={Link} to={`/rtis/${item._id}`}>View</Button>
                    <Button size="small" component={Link} to={`/rtis/${item._id}/edit`}>Edit</Button>
                    <Button size="small" color="error" onClick={() => dispatch(deleteRti(item._id)).then(() => dispatch(fetchRtis(query)))}>
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ) : (
        <Paper>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
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
                  <TableCell sortDirection={sortBy === 'subject' ? sortDir : false}>
                    <TableSortLabel
                      active={sortBy === 'subject'}
                      direction={sortBy === 'subject' ? sortDir : 'asc'}
                      onClick={() => handleSort('subject')}
                    >
                      Subject
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
                      Date
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
                  <TableCell sortDirection={sortBy === 'pioDeadline' ? sortDir : false}>
                    <TableSortLabel
                      active={sortBy === 'pioDeadline'}
                      direction={sortBy === 'pioDeadline' ? sortDir : 'asc'}
                      onClick={() => handleSort('pioDeadline')}
                    >
                      PIO Deadline
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && sortedDisplayList.map((item) => {
                  const chipData = deadlineChip(item.deadlines?.pioDeadlineStatus);
                  return (
                    <TableRow key={item._id} hover>
                      <TableCell>{item.rtiNumber}</TableCell>
                      <TableCell>{item.subject}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell>{formatDate(item.applicationDate)}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <span>{formatDate(item.deadlines?.pioDeadline)}</span>
                          <Chip size="small" color={chipData.color} label={chipData.label} />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" component={Link} to={`/rtis/${item._id}`}>View</Button>
                          <Button size="small" component={Link} to={`/rtis/${item._id}/edit`}>Edit</Button>
                          <Button size="small" color="error" onClick={() => dispatch(deleteRti(item._id)).then(() => dispatch(fetchRtis(query)))}>
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Stack>
  );
}
