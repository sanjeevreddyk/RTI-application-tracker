import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Toolbar,
  Typography
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import InsightsIcon from '@mui/icons-material/Insights';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { logout } from '../features/auth/authSlice';

const drawerWidth = 250;

const items = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'RTI Applications', path: '/rtis', icon: <ListAltIcon /> },
  { label: 'Add RTI', path: '/rtis/add', icon: <AddCircleIcon /> },
  { label: 'Analytics', path: '/analytics', icon: <InsightsIcon /> },
  { label: 'Calendar', path: '/calendar', icon: <CalendarMonthIcon /> }
];

export default function AppLayout({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const activePath = useMemo(() => {
    const found = items.find((item) => location.pathname.startsWith(item.path));
    return found?.path;
  }, [location.pathname]);

  function submitSearch(event) {
    if (event.key === 'Enter') {
      navigate(`/rtis?search=${encodeURIComponent(search)}`);
    }
  }

  function onNavigate(path) {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  }

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="h6" fontWeight={800} color="primary.main">
          RTI CMS
        </Typography>
      </Toolbar>
      <List>
        {items.map((item) => (
          <ListItemButton
            key={item.path}
            selected={activePath === item.path}
            onClick={() => onNavigate(item.path)}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: '#d7ecea',
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' }
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f7f9fc' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #f6fbfb 0%, #ffffff 65%)'
            }
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #f6fbfb 0%, #ffffff 65%)'
            }
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1 }}>
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: '1px solid #d7e1ea',
            bgcolor: 'rgb(255 255 255 / 75%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Toolbar sx={{ gap: 1.5, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} edge="start">
                <MenuIcon />
              </IconButton>
            )}
            {isMobile && (
              <Typography variant="subtitle1" fontWeight={700} sx={{ mr: 1 }}>
                RTI CMS
              </Typography>
            )}
            <InputBase
              placeholder="Search RTI number, subject, department"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={submitSearch}
              sx={{
                px: 1,
                py: 0.5,
                border: '1px solid #d6dceb',
                borderRadius: 1,
                width: '100%',
                maxWidth: { xs: '100%', sm: 480 },
                order: { xs: 3, sm: 1 }
              }}
            />
            <IconButton
              sx={{ order: { xs: 2, sm: 2 } }}
              onClick={() => navigate(`/rtis?search=${encodeURIComponent(search)}`)}
            >
              <SearchIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
              {user?.name || user?.email}
            </Typography>
            <Button
              size="small"
              startIcon={<LogoutIcon />}
              onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
