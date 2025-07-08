import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface MicrofrontendWrapperProps {
  children: React.ReactNode;
  name: string;
}

const MicrofrontendWrapper: React.FC<MicrofrontendWrapperProps> = ({ children, name }) => {
  const location = useLocation();
  const [key, setKey] = useState(0);
  const previousLocation = useRef(location.pathname);

  useEffect(() => {
    // Force re-render when route changes
    if (previousLocation.current !== location.pathname) {
      setKey(prev => prev + 1);
      previousLocation.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <div key={`${name}-${location.pathname}-${key}`} className="microfrontend-wrapper">
      {children}
    </div>
  );
};

export default MicrofrontendWrapper;
