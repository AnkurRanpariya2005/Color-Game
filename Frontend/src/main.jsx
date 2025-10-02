import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from './store/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Provider store={store}>
     <PersistGate persistor={persistor}>
    <App />
    </PersistGate>
    </Provider>
  </StrictMode>,
)
