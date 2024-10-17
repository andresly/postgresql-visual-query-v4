import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Accept-Version': 1,
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  },
});

// Add a response interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('siiiiin');
    console.log('error2', error);

    // Handle 400 error
    console.error('Bad Request:', error.response.data);
    // You can dispatch an action here to update the state with the error message
    //
    return Promise.reject(error);
  },
);

export default axiosClient;
