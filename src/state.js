const state = {
  feeds: [],
  posts: [],
  formState: {
    loading: false,
    error: null,
  },
  uiState: {
    displayedPost: null,
    viewedPostIds: new Set(),
  },
};

export default state;
