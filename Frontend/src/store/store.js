import { configureStore, combineReducers } from '@reduxjs/toolkit'

import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import eventSlice from './Event/event';
import userSlice from './Event/user';


const rootReducer = combineReducers({
  event: eventSlice.reducer,
  user: userSlice.reducer,

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