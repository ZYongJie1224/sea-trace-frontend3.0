<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

onMounted(async () => {
  // 尝试获取用户信息（如果有token）
  if (authStore.token) {
    try {
      await authStore.getUserInfo();
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }
});
</script>

<style>
/* 全局样式 */
</style>