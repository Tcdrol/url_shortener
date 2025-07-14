import { useState } from 'react';
import Home from './pages/Home.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

export const AppContext = createContext();

function App() {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('urlHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const addToHistory = (newUrl) => {
    const updatedHistory = [newUrl, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('urlHistory', JSON.stringify(updatedHistory));
  };

  return (
    <AppContext.Provider value={{ history, addToHistory }}>
      <ToastProvider>
        <Home />
      </ToastProvider>
    </AppContext.Provider>
  );
}

export default App;
