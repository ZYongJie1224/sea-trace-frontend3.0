import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 15000
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    const res = response.data;
    
    // 业务逻辑成功 (后端返回格式为 {code: 200, message: "success", data: {...}})
    if (res.code === 200) {
      return res.data;
    }
    
    // 业务逻辑错误
    ElMessage.error(res.message || '操作失败');
    return Promise.reject(new Error(res.message || '操作失败'));
  },
  error => {
    // 未授权，跳转登录
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录');
      localStorage.removeItem('token');
      router.push('/login');
      return Promise.reject(error);
    }
    
    // 权限不足
    if (error.response && error.response.status === 403) {
      ElMessage.error('权限不足，无法执行此操作');
      return Promise.reject(error);
    }
    
    // 其他错误
    ElMessage.error(error.message || '请求失败');
    return Promise.reject(error);
  }
);

export default api;