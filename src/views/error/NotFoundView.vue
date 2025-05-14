<template>
  <div class="not-found-container">
    <el-result
      icon="error"
      title="404"
      sub-title="抱歉，您访问的页面不存在"
    >
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const goHome = () => {
  if (authStore.isLoggedIn) {
    // 根据角色跳转到对应的首页
    if (authStore.isSuperAdmin) {
      router.push('/admin/dashboard');
    } else if (authStore.isCompanyAdmin) {
      router.push('/company/dashboard');
    } else if (authStore.isOperator) {
      router.push('/operator/dashboard');
    }
  } else {
    router.push('/login');
  }
};
</script>

<style scoped>
.not-found-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>