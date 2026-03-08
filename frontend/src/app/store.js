import { configureStore } from '@reduxjs/toolkit';
import rtiReducer from '../features/rti/rtiSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rti: rtiReducer,
    dashboard: dashboardReducer,
    analytics: analyticsReducer
  }
});