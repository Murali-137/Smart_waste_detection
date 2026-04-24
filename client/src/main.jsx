import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 1. Import your Context and Redux Store
// (Make sure these paths match where your files actually are!)
import { AuthProvider } from '../src/Context/AuthContext'; 
import { Provider } from 'react-redux';
import { store } from '../src/redux/store'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. Wrap App with Redux and Auth Providers */}
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </StrictMode>,
)