<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-logo">
        <img src="@/assets/logo.png" alt="Logo">
        <h2>海产品溯源系统</h2>
      </div>
      
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="用户名" 
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            placeholder="密码" 
            prefix-icon="Lock"
            type="password"
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            class="login-button" 
            size="large"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="public-access">
        <router-link to="/trace" class="trace-link">
          <el-icon><Search /></el-icon>
          <span>公众溯源查询</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import { User, Lock, Search } from '@element-plus/icons-vue';

const authStore = useAuthStore();
const loading = ref(false);
const loginFormRef = ref(null);

const loginForm = reactive({
  username: '',
  password: ''
});

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
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
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1f4e79, #2e7d32);
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.login-logo {
  text-align: center;
  margin-bottom: 30px;
  
  img {
    width: 80px;
    margin-bottom: 15px;
  }
  
  h2 {
    font-size: 24px;
    color: #333;
    margin: 0;
  }
}

.login-form {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
}

.public-access {
  text-align: center;
  margin-top: 20px;
  
  .trace-link {
    color: #409EFF;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    
    .el-icon {
      margin-right: 5px;
    }
  }
}
</style>