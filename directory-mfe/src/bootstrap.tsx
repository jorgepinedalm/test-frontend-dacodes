import React from 'react';
import ReactDOM from 'react-dom/client';
import DirectoryApp from './DirectoryApp';

// This function is called by the shell application
export const mount = (element: HTMLElement, props: any = {}) => {
  const root = ReactDOM.createRoot(element);
  root.render(<DirectoryApp {...props} />);
  
  return () => {
    root.unmount();
  };
};

// For standalone development
if (process.env.NODE_ENV === 'development') {
  const devRoot = document.getElementById('root');
  
  if (devRoot) {
    mount(devRoot);
  }
}

export default DirectoryApp;
