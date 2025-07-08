import { LoginCredentials, LoginResponse, User } from '../types/auth';

const API_BASE_URL = 'https://dummyjson.com';

class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Authenticate user with DummyJSON API
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data: LoginResponse = await response.json();
      
      // Store token in localStorage for persistence
      this.setToken(data.token);
      this.setRefreshToken(data.refreshToken);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid username or password');
    }
  }

  /**
   * Get current user info using stored token
   */
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token might be expired
        this.clearTokens();
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const data = await response.json();
      this.setToken(data.token);
      
      return data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Logout user and clear tokens
   */
  logout(): void {
    this.clearTokens();
  }

  /**
   * Token management methods
   */
  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private setRefreshToken(refreshToken: string | undefined): void {
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private clearTokens(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Validate token format (basic validation)
   */
  isValidToken(token: string): boolean {
    try {
      // Basic JWT format validation
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  }
}

export default AuthService;
