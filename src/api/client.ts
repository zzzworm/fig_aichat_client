import { TOKEN_KEY } from '@/src/constants';
import Constants from "expo-constants";
import * as SecureStore from 'expo-secure-store';
import qs from 'qs';
import StrapiSDK from "strapi-sdk-js";


// Extend the Strapi type to include token
interface Strapi extends StrapiSDK {
  token?: string | null;
}

// Export a function to update the token
const updateStrapiToken = async (token: string | null) => {
  if (token) {
    strapi.setToken(token);
    strapi.axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    strapi.setToken('');
    delete strapi.axios.defaults.headers.common["Authorization"];
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }
};

let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

const StrapiClient = StrapiSDK as unknown as { new (config: any): Strapi };

console.log('env api url:', process.env.EXPO_PUBLIC_API_URL);
// Initialize Strapi without token first
const strapi = new StrapiClient({
  url: process.env.EXPO_PUBLIC_API_URL,
  axiosOptions: {
    timeout: 30000, // 设置超时时间为30秒
    paramsSerializer: function(params) {
// 自定义编码器：保持*不被编码，其他字符使用默认编码
function customEncoder(str) {
  // 先使用默认编码
  let encoded = encodeURIComponent(str);
  // 再将编码后的*还原
  return encoded.replace(/%2A/g, '*');
}

      return qs.stringify(params, {encoder: customEncoder });
    },
  },
});

// Add a response interceptor to handle 401 errors
strapi.axios.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // Check if the error is a 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      // Avoid logging out on a failed login attempt, which is expected to return 401
      if (!error.config.url.includes('/api/auth')) {
        console.log('Caught 401 error on a protected route, logging out.');
        // Use getState() to call an action outside of a React component
        updateStrapiToken(null);
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
      }
    }
    // Re-throw the error so it can be handled by the calling code
    return Promise.reject(error);
  }
);

// Function to initialize token from SecureStore
const initializeToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      strapi.setToken(token);
      strapi.axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to initialize token:', error);
  }
};

// Initialize token when the app starts
initializeToken().catch(console.error);



export { strapi as default, updateStrapiToken };

