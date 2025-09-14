import axios from 'axios';
import axiosRetry from 'axios-retry';
import Cookie from "universal-cookie";
import { getCookieItem } from '../Utils/cookies-helpers';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

axiosRetry(axiosInstance, {
  retries: 3, 
  retryDelay: (retryCount) => {
    return Math.pow(2, retryCount) * 1000; 
  },
  shouldResetTimeout: true, 
});

axiosInstance.interceptors.request.use(config => {
  const cookie = new Cookie();
  const token = getCookieItem("token");
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default axiosInstance;