import axios from 'axios';

const BASE_URL = '/api/visionstone/';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Accept': 'application/json',
  }
});

// Response interceptor for smoother error handling and debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Core Vision synchronization timeout.');
    } else if (!error.response) {
      console.error('Vision Stone infrastructure unreachable. Network error.');
    } else if (error.response.status === 404) {
      console.error('Mission script not found on remote node.');
    } else if (error.response.status === 500) {
      console.error('Remote engine internal failure (500).');
    }
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };
