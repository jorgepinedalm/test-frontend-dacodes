// Runtime MFE Configuration
export interface MFEConfig {
  auth: string;
  directory: string;
  memoryGame: string;
  profile: string;
}

export class MFEConfigManager {
  private static instance: MFEConfigManager;
  private config: MFEConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): MFEConfigManager {
    if (!MFEConfigManager.instance) {
      MFEConfigManager.instance = new MFEConfigManager();
    }
    return MFEConfigManager.instance;
  }

  private loadConfig(): MFEConfig {
    // Try to load from environment variables first
    const envConfig = this.getEnvConfig();
    if (envConfig) {
      return envConfig;
    }

    // Fallback to hardcoded development config
    return this.getDefaultConfig();
  }

  private getEnvConfig(): MFEConfig | null {
    const authUrl = process.env.REACT_APP_AUTH_MFE_URL;
    const directoryUrl = process.env.REACT_APP_DIRECTORY_MFE_URL;
    const memoryGameUrl = process.env.REACT_APP_MEMORY_GAME_MFE_URL;
    const profileUrl = process.env.REACT_APP_PROFILE_MFE_URL;

    if (authUrl && directoryUrl && memoryGameUrl && profileUrl) {
      return {
        auth: authUrl,
        directory: directoryUrl,
        memoryGame: memoryGameUrl,
        profile: profileUrl
      };
    }

    return null;
  }

  private getDefaultConfig(): MFEConfig {
    return {
      auth: 'http://localhost:3001/remoteEntry.js',
      directory: 'http://localhost:3002/remoteEntry.js',
      memoryGame: 'http://localhost:3003/remoteEntry.js',
      profile: 'http://localhost:3004/remoteEntry.js'
    };
  }

  public getConfig(): MFEConfig {
    return this.config;
  }

  public async loadRemoteConfig(configUrl?: string): Promise<void> {
    if (!configUrl) return;

    try {
      const response = await fetch(configUrl);
      const remoteConfig = await response.json();
      this.config = { ...this.config, ...remoteConfig };
    } catch (error) {
      console.warn('Failed to load remote config, using default:', error);
    }
  }
}

export const mfeConfig = MFEConfigManager.getInstance();
