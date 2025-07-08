import React from 'react';
import ReactDOM from 'react-dom/client';
import MemoryGameApp from './components/MemoryGameApp';

// This function is called by the shell application
export const mount = (element: HTMLElement, props: any = {}) => {
  const root = ReactDOM.createRoot(element);
  root.render(<MemoryGameApp {...props} />);
  
  return () => {
    root.unmount();
  };
};

// For standalone development
if (process.env.NODE_ENV === 'development') {
  const devRoot = document.getElementById('root');
  
  if (devRoot) {
    mount(devRoot, {
      userId: 1,
      username: 'Developer'
    });
  }
}

export default MemoryGameApp;
