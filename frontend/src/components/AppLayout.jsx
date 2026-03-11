import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Avatar,
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
  Tooltip,
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
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { logout } from '../features/auth/authSlice';
import { showInfoToast } from '../utils/toast';

const drawerWidth = 250;
const drawerCollapsedWidth = 76;

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
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

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
      <Toolbar sx={{ justifyContent: desktopCollapsed ? 'center' : 'space-between' }}>
        {!desktopCollapsed && (
          <Typography variant="h6" fontWeight={800} color="#2f3d4a">
            RTI CMS
          </Typography>
        )}
        {!isMobile && (
          <IconButton size="small" onClick={() => setDesktopCollapsed((prev) => !prev)}>
            {desktopCollapsed ? <KeyboardDoubleArrowRightIcon /> : <KeyboardDoubleArrowLeftIcon />}
          </IconButton>
        )}
      </Toolbar>
      {!desktopCollapsed && (
        <Typography variant="caption" sx={{ px: 2, py: 1, color: '#66788a', fontWeight: 600 }}>
          Navigation
        </Typography>
      )}
      <List>
        {items.map((item) => (
          <Tooltip key={item.path} title={desktopCollapsed ? item.label : ''} placement="right">
            <ListItemButton
              selected={activePath === item.path}
              onClick={() => onNavigate(item.path)}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                minHeight: 42,
                justifyContent: desktopCollapsed ? 'center' : 'initial',
                px: desktopCollapsed ? 1.5 : 2,
                '&.Mui-selected': {
                  bgcolor: '#e7f3ff',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' }
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: desktopCollapsed ? 0 : 36,
                  justifyContent: 'center'
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!desktopCollapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#eef1f6' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              ...(desktopCollapsed && !isMobile ? { width: drawerCollapsedWidth } : {}),
              boxSizing: 'border-box',
              background: '#f8fafc',
              borderRight: '1px solid #d8dee8'
            }
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: desktopCollapsed ? drawerCollapsedWidth : drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: desktopCollapsed ? drawerCollapsedWidth : drawerWidth,
              boxSizing: 'border-box',
              background: '#f8fafc',
              borderRight: '1px solid #d8dee8'
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
            bgcolor: '#eef1f6'
          }}
        >
          <Toolbar sx={{ gap: 1.5, justifyContent: 'space-between', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
              {isMobile && (
                <IconButton onClick={() => setMobileOpen(true)} edge="start">
                  <MenuIcon />
                </IconButton>
              )}
              {isMobile && (
                <Typography variant="subtitle1" fontWeight={700} sx={{ mr: 0.5 }}>
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
                  border: '1px solid #d5dce6',
                  backgroundColor: '#fff',
                  borderRadius: 2,
                  width: '100%',
                  maxWidth: { xs: '100%', sm: 480 }
                }}
              />
              <IconButton onClick={() => navigate(`/rtis?search=${encodeURIComponent(search)}`)}>
                <SearchIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#dbeafe',
                  color: '#1d4ed8',
                  fontSize: 14,
                  fontWeight: 700
                }}
              >
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                {user?.name || user?.email}
              </Typography>
              <Button
                size="small"
                startIcon={<LogoutIcon />}
                onClick={() => {
                  dispatch(logout());
                  showInfoToast('Logged out successfully');
                  navigate('/login');
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
