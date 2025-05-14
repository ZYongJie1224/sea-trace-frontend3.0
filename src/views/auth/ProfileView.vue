<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h2>个人信息</h2>
        </div>
      </template>
      
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="right"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        
        <el-form-item label="真实姓名" prop="real_name">
          <el-input v-model="form.real_name" />
        </el-form-item>
        
        <el-form-item label="角色">
          <el-tag v-if="form.role === 'super_admin'" type="danger">超级管理员</el-tag>
          <el-tag v-else-if="form.role === 'company_admin'" type="warning">公司管理员</el-tag>
          <el-tag v-else-if="form.role === 'operator'" type="success">操作员</el-tag>
          <el-tag v-else type="info">未知角色</el-tag>
        </el-form-item>
        
        <el-form-item label="所属公司" v-if="form.company_name">
          <el-input v-model="form.company_name" disabled />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" type="email" />
        </el-form-item>
        
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        
        <el-divider content-position="center">修改密码</el-divider>
        
        <el-form-item label="原密码" prop="old_password">
          <el-input v-model="form.old_password" type="password" show-password />
        </el-form-item>
        
        <el-form-item label="新密码" prop="new_password">
          <el-input v-model="form.new_password" type="password" show-password />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirm_password">
          <el-input v-model="form.confirm_password" type="password" show-password />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="updateProfile" :loading="loading">保存修改</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import userApi from '@/api/user';

const authStore = useAuthStore();
const loading = ref(false);
const formRef = ref(null);

const form = reactive({
  username: '',
  real_name: '',
  role: '',
  company_name: '',
  email: '',
  phone: '',
  old_password: '',
  new_password: '',
  confirm_password: ''
});

// 密码验证函数
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback();
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6个字符'));
  } else {
    if (form.confirm_password !== '') {
      formRef.value.validateField('confirm_password');
    }
    callback();
  }
};

// 确认密码验证函数
const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback();
  } else if (value !== form.new_password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

const rules = {
  real_name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  new_password: [
    { validator: validatePass, trigger: 'blur' }
  ],
  confirm_password: [
    { validator: validatePass2, trigger: 'blur' }
  ]
};

onMounted(async () => {
  // 获取用户信息
  if (authStore.user) {
    form.username = authStore.user.username;
    form.real_name = authStore.user.real_name;
    form.role = authStore.user.role;
    form.company_name = authStore.user.company_name;
    form.email = authStore.user.email;
    form.phone = authStore.user.phone;
  } else {
    // 如果没有用户信息，重新获取
    try {
      const user = await authStore.getUserInfo();
      if (user) {
        form.username = user.username;
        form.real_name = user.real_name;
        form.role = user.role;
        form.company_name = user.company_name;
        form.email = user.email;
        form.phone = user.phone;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }
});

const updateProfile = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    loading.value = true;
    
    // 构造更新数据
    const updateData = {
      real_name: form.real_name,
      email: form.email,
      phone: form.phone
    };
    
    // 如果填写了密码，则更新密码
    if (form.old_password && form.new_password) {
      updateData.old_password = form.old_password;
      updateData.new_password = form.new_password;
    }
    
    // 发送更新请求
    await userApi.updateUserInfo(authStore.user.id, updateData);
    
    // 更新成功，刷新用户信息
    await authStore.getUserInfo();
    
    ElMessage.success('个人信息更新成功');
    
    // 清空密码字段
    form.old_password = '';
    form.new_password = '';
    form.confirm_password = '';
  } catch (error) {
    console.error('更新个人信息失败:', error);
    ElMessage.error(error.message || '更新失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
};
</script>

<style scoped lang="scss">
.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  margin-bottom: 20px;
  
  .card-header {
    h2 {
      margin: 0;
      color: #2c3e50;
    }
  }
}
</style>