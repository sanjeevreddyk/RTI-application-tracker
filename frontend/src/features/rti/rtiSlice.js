import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

export const fetchRtis = createAsyncThunk('rti/fetchRtis', async (params = {}) => {
  const { data } = await apiClient.get('/rti', { params });
  return data;
});

export const fetchRtiById = createAsyncThunk('rti/fetchRtiById', async (id) => {
  const { data } = await apiClient.get(`/rti/${id}`);
  return data;
});

export const createRti = createAsyncThunk(
  'rti/createRti',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/rti', payload);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const updateRti = createAsyncThunk('rti/updateRti', async ({ id, payload }) => {
  const { data } = await apiClient.put(`/rti/${id}`, payload);
  return data;
});

export const deleteRti = createAsyncThunk('rti/deleteRti', async (id) => {
  await apiClient.delete(`/rti/${id}`);
  return id;
});

export const fetchStages = createAsyncThunk('rti/fetchStages', async (rtiId) => {
  const { data } = await apiClient.get(`/stage/${rtiId}`);
  return data;
});

export const addStage = createAsyncThunk('rti/addStage', async (payload) => {
  const { data } = await apiClient.post('/stage', payload);
  return data;
});

export const fetchDocuments = createAsyncThunk('rti/fetchDocuments', async (rtiId) => {
  const { data } = await apiClient.get(`/document/${rtiId}`);
  return data;
});

export const uploadDocuments = createAsyncThunk('rti/uploadDocuments', async (payload) => {
  const formData = new FormData();
  formData.append('rtiId', payload.rtiId);
  formData.append('stageName', payload.stageName || 'General');

  if (payload.stageId) {
    formData.append('stageId', payload.stageId);
  }

  payload.files.forEach((file) => formData.append('files', file));

  const { data } = await apiClient.post('/document/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return data;
});

export const removeDocument = createAsyncThunk('rti/removeDocument', async (documentId) => {
  await apiClient.delete(`/document/${documentId}`);
  return documentId;
});

export const fetchNotes = createAsyncThunk('rti/fetchNotes', async (rtiId) => {
  const { data } = await apiClient.get(`/notes/${rtiId}`);
  return data;
});

export const addNote = createAsyncThunk('rti/addNote', async (payload) => {
  const { data } = await apiClient.post('/notes', payload);
  return data;
});

const initialState = {
  list: [],
  selected: null,
  stages: [],
  documents: [],
  notes: [],
  loading: false,
  error: null
};

const rtiSlice = createSlice({
  name: 'rti',
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = null;
      state.stages = [];
      state.documents = [];
      state.notes = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRtis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRtis.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchRtis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchRtiById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(fetchStages.fulfilled, (state, action) => {
        state.stages = action.payload;
      })
      .addCase(addStage.fulfilled, (state, action) => {
        state.stages.push(action.payload);
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.documents = action.payload;
      })
      .addCase(uploadDocuments.fulfilled, (state, action) => {
        state.documents = [...action.payload, ...state.documents];
      })
      .addCase(removeDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((doc) => doc._id !== action.payload);
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.notes = action.payload;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        state.notes = [action.payload, ...state.notes];
      })
      .addCase(createRti.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      .addCase(updateRti.fulfilled, (state, action) => {
        state.list = state.list.map((item) => (item._id === action.payload._id ? action.payload : item));
        if (state.selected?._id === action.payload._id) {
          state.selected = { ...state.selected, ...action.payload };
        }
      })
      .addCase(deleteRti.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item._id !== action.payload);
      });
  }
});

export const { clearSelected } = rtiSlice.actions;
export default rtiSlice.reducer;
