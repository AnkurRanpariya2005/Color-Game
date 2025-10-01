import { configureStore, combineReducers } from '@reduxjs/toolkit'

import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/li+b/storage'
import { authReducer } from './Auth/auth.reducer';


const rootReducer = combineReducers({
  auth: authReducer,

})

const persistConfig = {
  key: 'root',
  storage,
  version: 1
};

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(
    {serializableCheck: false}
  )
  }
)

export const persistor = persistStore(store);