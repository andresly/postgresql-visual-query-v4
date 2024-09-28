import axiosClient from '../utils/axiosClient';

export const ADD_DATABASES = 'ADD_DATABASES';

export const fetchAvailableDatabases = () => async (dispatch) => {
  try {
    const response = await axiosClient.post('/database/databases');
    if (response.data.rows.length > 0) {
      const availableDatabases = response.data.rows.map((row) => row.Name);
      dispatch({ type: ADD_DATABASES, payload: availableDatabases });
    }
    return response.data;
  } catch (error) {
    console.log('error', error);
    // dispatch({ type: CONNECT_ERROR, payload: error.toString() });
    throw error;
  }
};

export default fetchAvailableDatabases;
