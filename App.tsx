/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  useColorScheme,
  Text,
  Dimensions,
} from 'react-native';


import AsyncStorage from '@react-native-async-storage/async-storage';

import { Provider } from 'react-redux';
// import { createStore } from 'redux';
import { configureStore } from '@reduxjs/toolkit'
import {
  persistStore, persistReducer, FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { PersistGate } from 'redux-persist/integration/react';

import Routes from './Routes';
import reducer from './src/redux/reducer';

import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://66c0c4b8eeef805f7ac9f660c4d223ca@o199063.ingest.us.sentry.io/4506953342320640",
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
});

// TODO: timeout setting not working in debug mode
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['searchState', 'modalState', 'playerState'],
  timeout: null,
};
const persistedReducer = persistReducer(persistConfig, reducer);

// const store = createStore(persistedReducer);
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false, // Disable immutable checks
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

// config Text not changed by system font scale
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;


const window = Dimensions.get('window');


function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Routes />
      </PersistGate>
    </Provider>
  )

}

export default Sentry.wrap(App);
