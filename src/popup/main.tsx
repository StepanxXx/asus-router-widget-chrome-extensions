import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../css/stylePopup.css';
import '../../css/style.css';
import { Popup } from './Popup';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Popup root element was not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
