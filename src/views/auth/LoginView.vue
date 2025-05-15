<template>
  <div class="login-container">
    <div class="blockchain-background">
      <div class="nodes"></div>
      <div class="connections"></div>
    </div>
    
    <div class="login-content">
      <div class="system-intro">
        <h1 class="system-title">供应链溯源系统</h1>
        <p class="system-slogan">基于区块链技术 · 数据安全可信 · 全程透明追溯</p>
      </div>
      
      <div class="login-card">
        <div class="login-header">
          <h2>用户登录</h2>
          <p class="welcome-text">使用您的账号访问区块链溯源平台</p>
        </div>
        
        <el-form 
          ref="loginFormRef" 
          :model="loginForm" 
          :rules="loginRules" 
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入用户名" 
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password" 
              placeholder="请输入密码" 
              :prefix-icon="Lock"
              type="password"
              size="large"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <div class="remember-forgot">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <a href="javascript:void(0)" class="forgot-link" @click="handleForgotPassword">忘记密码?</a>
          </div>
          
          <el-form-item>
            <el-button 
              type="primary" 
              :loading="loading" 
              class="login-button" 
              size="large"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="features-row">
          <div class="feature-item">
            <el-icon><Key /></el-icon>
            <span>数据防篡改</span>
          </div>
          <div class="feature-item">
            <el-icon><Share /></el-icon>
            <span>分布式账本</span>
          </div>
          <div class="feature-item">
            <el-icon><Service /></el-icon>
            <span>智能合约</span>
          </div>
        </div>
        
        <div class="public-access">
          <router-link to="/trace" class="trace-link">
            <el-icon><Search /></el-icon>
            <span>公众溯源查询入口</span>
          </router-link>
        </div>
      </div>
    </div>
    
    <div class="login-footer">
      <div class="company-info">© 2025 供应链溯源系统</div>
      <div class="date-info">2025-05-15 13:59:08</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  User, 
  Lock, 
  Search, 
  Key,
  Share,
  Service
} from '@element-plus/icons-vue';

const authStore = useAuthStore();
const loading = ref(false);
const loginFormRef = ref(null);
const rememberMe = ref(false);

const loginForm = reactive({
  username: 'ZYongJie1224',
  password: ''
});

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const handleForgotPassword = () => {
  ElMessageBox.alert(
    '请联系系统管理员重置密码',
    '忘记密码',
    {
      confirmButtonText: '确定',
      type: 'info',
      center: true
    }
  );
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    loading.value = true;
    try {
      await authStore.login(loginForm.username, loginForm.password);
      ElMessage.success('登录成功');
    } catch (error) {
      console.error('登录失败:', error);
      ElMessage.error(error.message || '登录失败，请检查用户名和密码');
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  overflow: hidden;
}

.blockchain-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
  
  .nodes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.15) 2px, transparent 2px);
    background-size: 50px 50px;
    animation: floatNodes 120s infinite linear;
  }
  
  .connections {
    position: absolute;
    top: -50%;
    left: -50%;
    right: -50%;
    bottom: -50%;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 50px 50px;
    transform: perspective(500px) rotateX(60deg);
    animation: flowConnections 80s infinite linear;
  }
}

@keyframes floatNodes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 100px 100px;
  }
}

@keyframes flowConnections {
  0% {
    transform: perspective(500px) rotateX(60deg) translateY(0);
  }
  100% {
    transform: perspective(500px) rotateX(60deg) translateY(50px);
  }
}

.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: 30px 20px;
}

.system-intro {
  text-align: center;
  margin-bottom: 40px;
  color: white;
  max-width: 800px;
  
  .system-title {
    font-size: 2.8rem;
    font-weight: 600;
    margin-bottom: 16px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: 2px;
    
    @media (max-width: 768px) {
      font-size: 2.2rem;
    }
  }
  
  .system-slogan {
    font-size: 1.2rem;
    letter-spacing: 0.5px;
    margin: 0;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}

.login-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 35px;
  width: 100%;
  max-width: 460px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #4361ee, #3a86ff);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
  
  h2 {
    font-size: 24px;
    color: #333;
    margin: 0 0 10px;
    font-weight: 500;
    letter-spacing: 1px;
  }
  
  .welcome-text {
    color: #666;
    font-size: 15px;
    margin: 0;
  }
}

.login-form {
  margin-bottom: 20px;
  
  :deep(.el-input__wrapper) {
    padding: 0 15px;
    height: 48px;
    box-shadow: 0 0 0 1px #dcdfe6 inset;
    transition: all 0.3s;
    border-radius: 6px;
    
    &:hover, &:focus-within {
      box-shadow: 0 0 0 1px #4361ee inset;
    }
  }
  
  :deep(.el-input__prefix) {
    margin-right: 10px;
    color: #909399;
  }
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  .forgot-link {
    color: #4361ee;
    text-decoration: none;
    font-size: 14px;
    
    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  }
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  background-color: #4361ee;
  border-color: #4361ee;
  border-radius: 6px;
  letter-spacing: 2px;
  font-weight: 500;
  
  &:hover {
    background-color: #3a56d4;
    border-color: #3a56d4;
  }
}

.features-row {
  display: flex;
  justify-content: space-around;
  margin: 28px 0;
  padding: 20px 0;
  border-top: 1px solid #edf2f7;
  border-bottom: 1px solid #edf2f7;
  
  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      font-size: 24px;
      color: #4361ee;
      background: #f0f4ff;
      border-radius: 50%;
      padding: 8px;
      height: 42px;
      width: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    span {
      font-size: 14px;
      color: #555;
    }
  }
}

.public-access {
  text-align: center;
  margin-top: 24px;
  
  .trace-link {
    color: #4361ee;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    padding: 10px 20px;
    background-color: #f8f9fc;
    border-radius: 6px;
    transition: all 0.3s;
    font-size: 15px;
    
    &:hover {
      background-color: #eef2ff;
    }
    
    .el-icon {
      margin-right: 8px;
    }
  }
}

.login-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  z-index: 1;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 5px;
  }
}
</style>