// MFE Configuration Manager
const getMFEConfig = () => {
  const environment = process.env.NODE_ENV || 'development';
  
  // Default URLs for development
  const defaultConfig = {
    auth: 'auth@https://test-frontend-dacodes-3001.onrender.com/remoteEntry.js',
    directory: 'directory@https://test-frontend-dacodes-3002.onrender.com/remoteEntry.js',
    memoryGame: 'memoryGame@https://test-frontend-dacodes-3003.onrender.com/remoteEntry.js',
    profile: 'profile@https://test-frontend-dacodes-3004.onrender.com/remoteEntry.js'
  };

  // Environment-specific configurations
  const environmentConfigs = {
    development: {
      auth: `auth@${process.env.REACT_APP_AUTH_MFE_URL || 'https://test-frontend-dacodes-3001.onrender.com/remoteEntry.js'}`,
      directory: `directory@${process.env.REACT_APP_DIRECTORY_MFE_URL || 'https://test-frontend-dacodes-3002.onrender.com/remoteEntry.js'}`,
      memoryGame: `memoryGame@${process.env.REACT_APP_MEMORY_GAME_MFE_URL || 'https://test-frontend-dacodes-3003.onrender.com/remoteEntry.js'}`,
      profile: `profile@${process.env.REACT_APP_PROFILE_MFE_URL || 'https://test-frontend-dacodes-3004.onrender.com/remoteEntry.js'}`
    },
    staging: {
      auth: `auth@${process.env.REACT_APP_AUTH_MFE_URL}`,
      directory: `directory@${process.env.REACT_APP_DIRECTORY_MFE_URL}`,
      memoryGame: `memoryGame@${process.env.REACT_APP_MEMORY_GAME_MFE_URL}`,
      profile: `profile@${process.env.REACT_APP_PROFILE_MFE_URL}`
    },
    production: {
      auth: `auth@${process.env.REACT_APP_AUTH_MFE_URL}`,
      directory: `directory@${process.env.REACT_APP_DIRECTORY_MFE_URL}`,
      memoryGame: `memoryGame@${process.env.REACT_APP_MEMORY_GAME_MFE_URL}`,
      profile: `profile@${process.env.REACT_APP_PROFILE_MFE_URL}`
    }
  };

  return environmentConfigs[environment] || defaultConfig;
};

module.exports = { getMFEConfig };
