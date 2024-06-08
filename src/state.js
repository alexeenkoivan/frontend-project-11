const state = {
  feeds: [],
  posts: [],
  loading: false,
  error: null,
  readPosts: new Set(),
  uiState: {
    displayedPost: null,
    viewedPostIds: new Set(),
  },
};

export default state;
