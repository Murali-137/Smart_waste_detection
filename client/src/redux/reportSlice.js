import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async Thunk to fetch reports from Express
export const fetchReports = createAsyncThunk('reports/fetchReports', async () => {
    const response = await axios.get('http://localhost:5000/api/reports');
    return response.data;
});

const reportSlice = createSlice({
    name: 'reports',
    initialState: {
        data: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    },
    reducers: {
        // Optimistic UI updates
        addReportLocal: (state, action) => {
            state.data.unshift(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchReports.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.data = action.payload;
        });
    }
});

export const { addReportLocal } = reportSlice.actions;
export default reportSlice.reducer;