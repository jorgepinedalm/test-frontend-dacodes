import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import ProfileApp from './components/ProfileApp';

// This function is called by the shell application
export const mount = (element: HTMLElement, props: any = {}) => {
  const root = ReactDOM.createRoot(element);
  root.render(
    <Router>
      <ProfileApp {...props} />
    </Router>
  );
  
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
      username: 'johndoe'
    });
  }
}

export default ProfileApp;
