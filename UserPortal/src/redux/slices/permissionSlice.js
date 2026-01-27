import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASEURL2 } from "../../components/constant/constant";

/* API CALL */
export const fetchPermissions = createAsyncThunk(
  "permissions/fetchPermissions",
  async (dept_id, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASEURL2}/department/getDepartmentPermissions`, {
        dept_id
      });

      return res.data.responseData;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const initialState = {
  view_poster: "N",
  view_camp: "N",
  loading: true
};

const permissionSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    resetPermissions(state) {
      state.view_poster = "N";
      state.view_camp = "N";
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        console.log("REDUX PERMISSIONS PAYLOAD 👉", action.payload);

        state.view_poster = action.payload.view_poster;
        state.view_camp = action.payload.view_camp;
        state.loading = false;
      })
      .addCase(fetchPermissions.rejected, (state) => {
        state.view_poster = "N";
        state.view_camp = "N";
        state.loading = false;
      });
  }
});

export const { resetPermissions } = permissionSlice.actions;
export default permissionSlice.reducer;
