// MFE Configuration Manager
const getMFEConfig = () => {
  const environment = process.env.NODE_ENV || 'development';
  
  // Default URLs for development
  const defaultConfig = {
    auth: 'auth@http://localhost:3001/remoteEntry.js',
    directory: 'directory@http://localhost:3002/remoteEntry.js',
    memoryGame: 'memoryGame@http://localhost:3003/remoteEntry.js',
    profile: 'profile@http://localhost:3004/remoteEntry.js'
  };

  // Environment-specific configurations
  const environmentConfigs = {
    development: {
      auth: `auth@${process.env.REACT_APP_AUTH_MFE_URL || 'http://localhost:3001/remoteEntry.js'}`,
      directory: `directory@${process.env.REACT_APP_DIRECTORY_MFE_URL || 'http://localhost:3002/remoteEntry.js'}`,
      memoryGame: `memoryGame@${process.env.REACT_APP_MEMORY_GAME_MFE_URL || 'http://localhost:3003/remoteEntry.js'}`,
      profile: `profile@${process.env.REACT_APP_PROFILE_MFE_URL || 'http://localhost:3004/remoteEntry.js'}`
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
