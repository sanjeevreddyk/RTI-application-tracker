import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

const tokenKey = 'rti_auth_token';
const userKey = 'rti_auth_user';

function getInitialAuth() {
  const token = localStorage.getItem(tokenKey);
  const userRaw = localStorage.getItem(userKey);
  const user = userRaw ? JSON.parse(userRaw) : null;
  return { token, user };
}

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || error.message);
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/auth/me');
    return data;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || error.message);
  }
});

const initialAuth = getInitialAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialAuth.token,
    user: initialAuth.user,
    loading: false,
    error: null
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem(tokenKey, action.payload.token);
        localStorage.setItem(userKey, JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem(tokenKey, action.payload.token);
        localStorage.setItem(userKey, JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem(userKey, JSON.stringify(action.payload.user));
      })
      .addCase(fetchMe.rejected, (state) => {
        state.token = null;
        state.user = null;
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;