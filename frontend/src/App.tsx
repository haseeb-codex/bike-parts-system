import { BrowserRouter } from 'react-router-dom';

import { LanguageProvider } from '@/i18n/LanguageProvider';
import { ThemeProvider } from '@/components/Theme/ThemeProvider';
import AppRoutes from '@/routes/AppRoutes';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
