import React, { useState, useEffect } from 'react';
import './SettingsToast.css';

interface SettingsToastProps {
  show: boolean;
  message: string;
  onHide: () => void;
}

const SettingsToast: React.FC<SettingsToastProps> = ({ show, message, onHide }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className="settings-toast">
      <div className="toast-content">
        <span className="toast-icon">💾</span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};

export default SettingsToast;
