<template>
  <el-container class="app-container">
    <el-aside width="240px" class="sidebar">
      <div class="logo-container">
        <div class="logo-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <h2>供应链溯源系统</h2>
      </div>
      
      <div class="user-panel">
        <el-avatar :size="48" :src="authStore.user?.avatar || defaultAvatar" />
        <div class="user-info">
          <p class="user-name">{{ userDisplayName }}</p>
          <p class="user-role">{{ userRoleText }}</p>
        </div>
      </div>
      
      <div class="menu-container">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          background-color="transparent"
          text-color="#e0e0e0"
          active-text-color="#4361ee"
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
          <el-menu-item index="/trace" class="trace-menu-item">
            <el-icon><Search /></el-icon>
            <span>溯源查询</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-aside>
    
    <el-container class="main-container">
      <el-header height="64px" class="main-header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleSidebar">
            <Fold v-if="!sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
          <div class="page-breadcrumb">
            {{ currentPathName }}
          </div>
        </div>
        
        <div class="header-right">
          <div class="datetime">
            {{ currentDateTime }}
          </div>
          
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-dropdown">
              <el-avatar :size="32" :src="authStore.user?.avatar || defaultAvatar" />
              <span class="username">{{ authStore.user?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><UserFilled /></el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  账户设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="content-area">
        <router-view v-loading="loading" :key="$route.path" />
      </el-main>
      
      <el-footer height="50px" class="main-footer">
        <div class="footer-content">
          <p>供应链溯源系统 &copy; 2025 版权所有</p>
          <p class="powered-by">区块链溯源技术支持</p>
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import { 
  Odometer, User, Goods, Plus, 
  Van, Check, Box, Search, Connection,
  OfficeBuilding, Fold, Expand, ArrowDown,
  UserFilled, Setting, SwitchButton
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const sidebarCollapsed = ref(false);
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
const currentDateTime = ref('2025-05-15 14:02:03');

const activeMenu = computed(() => route.path);

const userDisplayName = computed(() => {
  return authStore.user?.real_name || authStore.user?.username || '用户';
});

const userRoleText = computed(() => {
  if (authStore.isSuperAdmin) return '超级管理员';
  if (authStore.isCompanyAdmin) return '公司管理员';
  if (authStore.isOperator) {
    const companyTypes = ['生产商', '物流商', '检测商', '零售商'];
    return `操作员 - ${companyTypes[authStore.companyType] || ''}`;
  }
  return '用户';
});

const currentPathName = computed(() => {
  // This would be better with a proper mapping of routes to names
  const path = route.path;
  if (path.includes('dashboard')) return '系统仪表盘';
  if (path.includes('company')) return '公司管理';
  if (path.includes('user')) return '用户管理';
  if (path.includes('operator')) return '操作员管理';
  if (path.includes('goods')) return '货物管理';
  if (path.includes('register-good')) return '注册货物';
  if (path.includes('ship-good')) return '运输登记';
  if (path.includes('inspect-good')) return '验货登记';
  if (path.includes('deliver-good')) return '收货登记';
  if (path.includes('trace')) return '溯源查询';
  if (path.includes('profile')) return '个人信息';
  return '供应链溯源系统';
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

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const handleCommand = (command) => {
  // if (command === 'profile') {
  //   router.push('/profile');
  // } else if (command === 'settings') {
  //   router.push('/settings');
  // } else 
  if (command === 'logout') {
    // authStore.logout();
    router.push('/login');
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  position: relative;
}

// Sidebar styles
.sidebar {
  width: 240px !important;
  background-color: #1e293b;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;
  
  &.collapsed {
    width: 80px !important;
  }
}

.logo-container {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #152031;
  height: 64px;
  
  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: #4361ee;
    border-radius: 8px;
    margin-right: 12px;
    
    .el-icon {
      font-size: 24px;
      color: white;
    }
  }
  
  h2 {
    color: #ffffff;
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    white-space: nowrap;
  }
}

.user-panel {
  padding: 20px;
  display: flex;
  align-items: center;
  background-color: #18222f;
  
  .user-info {
    margin-left: 12px;
    overflow: hidden;
  }
  
  .user-name {
    font-size: 15px;
    color: #ffffff;
    margin: 0 0 4px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .user-role {
    font-size: 12px;
    color: #a0aec0;
    margin: 0;
    white-space: nowrap;
  }
}

.menu-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 3px;
  }
}

.sidebar-menu {
  border-right: none;
  
  :deep(.el-menu-item) {
    height: 50px;
    line-height: 50px;
    margin: 5px 10px;
    border-radius: 6px;
    
    &.is-active {
      background-color: #2d3c50;
      color: #4361ee;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 4px;
        height: 100%;
        background-color: #4361ee;
        border-radius: 0 2px 2px 0;
      }
    }
    
    &:hover {
      background-color: #2d3c50;
    }
    
    .el-icon {
      margin-right: 10px;
      font-size: 18px;
    }
  }
  
  :deep(.trace-menu-item) {
    position: relative;
    margin-top: 20px;
    
    &::before {
      content: '';
      position: absolute;
      left: 10px;
      right: 10px;
      top: -12px;
      height: 1px;
      background-color: rgba(255,255,255,0.1);
    }
  }
}

// Main container styles
.main-container {
  height: 100%;
  overflow: hidden;
}

.main-header {
  background-color: #ffffff;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  
  .header-left {
    display: flex;
    align-items: center;
    
    .collapse-icon {
      font-size: 20px;
      cursor: pointer;
      color: #64748b;
      margin-right: 20px;
      
      &:hover {
        color: #4361ee;
      }
    }
    
    .page-breadcrumb {
      font-size: 16px;
      font-weight: 500;
      color: #1e293b;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .datetime {
      font-size: 14px;
      color: #64748b;
    }
    
    .user-dropdown {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 5px 8px;
      border-radius: 6px;
      transition: all 0.3s;
      
      &:hover {
        background-color: #f8fafc;
      }
      
      .username {
        margin: 0 8px;
        font-size: 14px;
        color: #334155;
      }
      
      .el-icon {
        font-size: 12px;
        color: #64748b;
      }
    }
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  
  .el-icon {
    margin-right: 8px;
  }
}

.content-area {
  background-color: #f1f5f9;
  padding: 20px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
}

.main-footer {
  background-color: #ffffff;
  border-top: 1px solid #edf2f7;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .footer-content {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    p {
      margin: 0;
      font-size: 14px;
      color: #64748b;
    }
    
    .powered-by {
      color: #94a3b8;
      font-size: 12px;
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    z-index: 10;
    height: 100%;
    transform: translateX(0);
    transition: transform 0.3s;
    
    &.collapsed {
      transform: translateX(-100%);
    }
  }
  
  .main-container {
    margin-left: 0;
  }
}
</style>