import api from './index';

export default {
  // 登录
  login(username, password) {
    return api.post('/api/auth/login', { username, password });
  },
  
  // 登出
  logout() {
    return api.post('/api/users/logout');
  },
  
  // 获取当前用户信息
  getUserInfo() {
    return api.get('/api/auth/myinfo');
  }
};