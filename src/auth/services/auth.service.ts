import { StrapiAuthProvider, StrapiError, StrapiUser } from 'strapi-sdk-js';
import strapi, { updateStrapiToken } from '../../api/client';
import transformUserData from '../../utils/userUtil';
import { AuthResponse, UserProfile } from '../types/user';


class AuthService {
  private token: string | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Token initialization is now handled by the client
    // The token will be set when the client initializes
    this.token = strapi.token || null;
    console.log('api url:', strapi.axios.defaults.baseURL);
  }

  async setToken(token: string | null) {
    this.token = token;
    await updateStrapiToken(token);
  }



  async login(email: string, password: string): Promise<AuthResponse> {
    try {
        
      const response = await strapi.login({ identifier: email, password });
      const user = transformUserData(response.user);
      await this.setToken(response.jwt);
      return { jwt: response.jwt, user };
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = (error as StrapiError)?.response?.data?.error?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await strapi.register({
        username: name,
        email,
        password,
      });
      
      if (!response.jwt) {
        throw new Error('No authentication token received from server');
      }
      
      const user = transformUserData(response.user);
      await this.setToken(response.jwt);
      return { jwt: response.jwt, user };
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = (error as StrapiError)?.response?.data?.error?.message || 
                         (error as Error)?.message || 
                         'Registration failed';
      throw new Error(errorMessage);
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const user = await strapi.fetchUser({
        populate: '*',
      });
      const transformedUser = user ? transformUserData(user) : null;
      // console.log('transformedUser:',transformedUser);
      return transformedUser;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  }

  async logout() {
    try {
      await this.setToken(null);
      this.token = null;
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout');
    }
  }
    async authenticateProvider(provider: string, accessToken: string): Promise<AuthResponse> {
    try {
            const response = await strapi.authenticateProvider(provider as StrapiAuthProvider, accessToken);
      const user = transformUserData(response.user);
      await this.setToken(response.jwt);
      return { jwt: response.jwt, user };
    } catch (error) {
      console.error('Authentication provider error:', error);

      throw error;
    }
  }
  async updateProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // console.log('update with userData:',userData);
      const user = await strapi.request<StrapiUser>('PUT', '/users/me', { data: {data:userData} });
      return transformUserData(user);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export default new AuthService();
export { transformUserData };

