import { createSlice } from "@reduxjs/toolkit";

const artSlice = createSlice({
  name: "artworks",
  initialState: {
    artFilter: {
      searchTerm: "", // Used to search by title or artist name
      selectedTag: "", // Used to filter by a specific tag/category
      selectedSort: [], // Used for sorting options (e.g., price, date)
    },

    filteredArtworks: [],
    artTags: [],
    uniqueTags: [],
  },

  reducers: {
    setArtFilter: (state, action) => {
      state.artFilter = { ...state.artFilter, ...action.payload };
    },

    setFilteredArtworks: (state, action) => {
      state.filteredArtworks = action.payload;
    },

    setArtTags: (state, action) => {
      state.artTags = action.payload;
    },

    setUniqueTags: (state, action) => {
      state.uniqueTags = action.payload;
    },
  },
});

export const {
  setArtFilter,
  setFilteredArtworks,
  setArtTags,
  setUniqueTags,
} = artSlice.actions;

export default artSlice.reducer;
