<template>
  <el-container class="app-container">
    <el-aside width="220px">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="Logo" class="logo">
        <h2>溯源系统</h2>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <!-- 超级管理员菜单 -->
        <template v-if="authStore.isSuperAdmin">
          <el-menu-item index="/admin/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>系统概览</span>
          </el-menu-item>
          <el-menu-item index="/admin/company">
            <el-icon><OfficeBuilding /></el-icon>
            <span>公司管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/user">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </template>
        
        <!-- 公司管理员菜单 -->
        <template v-else-if="authStore.isCompanyAdmin">
          <el-menu-item index="/company/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>公司概览</span>
          </el-menu-item>
          <el-menu-item index="/company/operator">
            <el-icon><User /></el-icon>
            <span>操作员管理</span>
          </el-menu-item>
          <el-menu-item index="/company/goods">
            <el-icon><Goods /></el-icon>
            <span>货物管理</span>
          </el-menu-item>
        </template>
        
        <!-- 操作员菜单 -->
        <template v-else-if="authStore.isOperator">
          <el-menu-item index="/operator/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          
          <!-- 根据公司类型显示不同菜单 -->
          <template v-if="authStore.companyType === 0">
            <el-menu-item index="/operator/register-good">
              <el-icon><Plus /></el-icon>
              <span>注册货物</span>
            </el-menu-item>
          </template>
          
          <template v-else-if="authStore.companyType === 1">
            <el-menu-item index="/operator/ship-good">
              <el-icon><Van /></el-icon>
              <span>运输登记</span>
            </el-menu-item>
          </template>
          
          <template v-else-if="authStore.companyType === 2">
            <el-menu-item index="/operator/inspect-good">
              <el-icon><Check /></el-icon>
              <span>验货登记</span>
            </el-menu-item>
          </template>
          
          <template v-else-if="authStore.companyType === 3">
            <el-menu-item index="/operator/deliver-good">
              <el-icon><Box /></el-icon>
              <span>收货登记</span>
            </el-menu-item>
          </template>
        </template>
        
        <!-- 公共菜单 -->
        <el-menu-item index="/trace">
          <el-icon><Search /></el-icon>
          <span>溯源查询</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-right">
          <span class="welcome-text">欢迎，{{ authStore.user?.real_name || authStore.user?.username }}</span>
          <el-dropdown @command="handleCommand">
            <span class="user-profile">
              <el-avatar :size="32" :src="authStore.user?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <span class="username">{{ authStore.user?.username }}</span>
              <el-icon><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main>
        <router-view />
      </el-main>
      
      <el-footer>
        <div class="footer-content">
          <p>海产品溯源系统 &copy; 2025 ZYongJie1224 版权所有</p>
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onMounted,ref } from 'vue';

import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { 
  Odometer,  User, Goods, Plus, 
  Van, Check, Box, Search, CaretBottom ,OfficeBuilding
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

const activeMenu = computed(() => route.path);
const userDisplayName = computed(() => {
  return authStore.user?.real_name || authStore.user?.username || '用户';
});

onMounted(async () => {
  if (!authStore.user) {
    loading.value = true;
    try {
      await authStore.getUserInfo();
      if (!authStore.user) {
        ElMessage.error('获取用户信息失败，请重新登录');
        router.push('/login');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      ElMessage.error('获取用户信息失败，请重新登录');
      router.push('/login');
    } finally {
      loading.value = false;
    }
  }
});

const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile');
  } else if (command === 'logout') {
    authStore.logout();
  }
};
</script>

<style scoped lang="scss">
.app-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #bfcbd9;
}

.logo-container {
  display: flex;
  align-items: center;
  padding: 16px;
  
  .logo {
    width: 40px;
    margin-right: 10px;
  }
  
  h2 {
    color: #fff;
    margin: 0;
    font-size: 18px;
  }
}

.el-header {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
  
  .welcome-text {
    margin-right: 15px;
    color: #606266;
  }
  
  .user-profile {
    display: flex;
    align-items: center;
    cursor: pointer;
    
    .username {
      margin: 0 5px;
    }
  }
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.el-footer {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
}
</style>