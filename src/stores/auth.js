import { defineStore } from 'pinia';
import authApi from '../api/auth';
import router from '../router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || '',
    loading: false
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    userRole: (state) => state.user?.role || '',
    isSuperAdmin: (state) => state.user?.role === 'super_admin',
    isCompanyAdmin: (state) => state.user?.role === 'company_admin',
    isOperator: (state) => state.user?.role === 'operator',
    companyType: (state) => {
      if (!state.user) return null;
      return state.user.company_type;
    }
  },
  
  actions: {
    async login(username, password) {
      this.loading = true;
      try {
        // 登录获取token
        const result = await authApi.login(username, password);
        
        // 保存token (后端只返回token)
        this.token = result.token;
        localStorage.setItem('token', result.token);
        
        // 获取完整的用户信息
        await this.getUserInfo();
        
        // 根据角色重定向
        this.redirectBasedOnRole();
        
        return this.user;
      } finally {
        this.loading = false;
      }
    },
    
    redirectBasedOnRole() {
      if (!this.user) return;
      
      if (this.user.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else if (this.user.role === 'company_admin') {
        router.push('/company/dashboard');
      } else if (this.user.role === 'operator') {
        router.push('/operator/dashboard');
      }
    },
    
    async logout() {
      try {
        await authApi.logout();
      } finally {
        this.resetState();
        router.push('/login');
      }
    },
    
    async getUserInfo() {
      if (!this.token) return null;
      
      try {
        const data = await authApi.getUserInfo();
        this.user = data;
        return data;
      } catch (error) {
        console.error('获取用户信息失败:', error);
        this.resetState();
        return null;
      }
    },
    
    resetState() {
      this.user = null;
      this.token = '';
      localStorage.removeItem('token');
    }
  }
});