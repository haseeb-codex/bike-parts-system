import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/tailwind.css';
import App from '@/App';
import reportWebVitals from '@/reportWebVitals';
import { Provider } from 'react-redux';
import { store } from '@/store';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container was not found in index.html');
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
