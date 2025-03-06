import { configureStore } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';
import rootReducer from './reducers';

// Function to save state to session storage
const saveToSessionStorage = (state: any) => {
  try {
    sessionStorage.setItem('state', JSON.stringify(state));
  } catch (e) {
    console.error('Could not save state:', e);
  }
};

// Function to load state from session storage
const loadFromSessionStorage = () => {
  try {
    const serializedState = sessionStorage.getItem('state');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (e) {
    console.error('Could not load state:', e);
    return undefined;
  }
};

const persistedState = loadFromSessionStorage();

const store = configureStore({
  reducer: rootReducer,
  preloadedState: persistedState,
  middleware: (getDefaultMiddleware) =>
    process.env.NODE_ENV === 'development' ? getDefaultMiddleware().concat(logger) : getDefaultMiddleware(),
});

// Subscribe to store changes to persist state
store.subscribe(() => saveToSessionStorage(store.getState()));

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
