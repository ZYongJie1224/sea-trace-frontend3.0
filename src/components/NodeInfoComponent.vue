<template>
  <el-card class="node-info-card">
    <template #header>
      <div class="card-header">
        <h3>区块链节点信息</h3>
        <el-button type="primary" size="small" @click="refreshNodeInfo" :loading="loading">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>
    </template>
    
    <el-table :data="nodes" stripe style="width: 100%">
      <el-table-column prop="node_name" label="节点名称" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="p2p_port" label="P2P端口" width="100" />
      <el-table-column prop="address" label="节点地址" />
      <el-table-column prop="update_time" label="更新时间" width="180" />
    </el-table>
  </el-card>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import traceApi from '@/api/trace';

const loading = ref(false);
const nodes = ref([]);

// 刷新节点信息
const refreshNodeInfo = async () => {
  loading.value = true;
  try {
    const response = await traceApi.getNodeInfo();
    nodes.value = response.nodes || [];
    ElMessage.success('节点信息已更新');
  } catch (error) {
    console.error('获取节点信息失败:', error);
    ElMessage.error('获取节点信息失败');
    
    // 使用默认数据
    nodes.value = [
      {
        node_id: "2a103b7d4bc02c73538c1e37b13efba06df3ffe1b675a2b93107477dba133c746d390818df9b9184d794922f909f88e8e9765fd5204ff498ec5afd2b8045ad23",
        node_name: "节点1",
        status: "正常",
        active: true,
        p2p_port: 30300,
        address: "2a103b7d4bc02c735...",
        update_time: "2025-05-14 02:40:11"
      }
    ];
  } finally {
    loading.value = false;
  }
};

// 初始加载
refreshNodeInfo();
</script>

<style scoped lang="scss">
.node-info-card {
  margin-bottom: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      color: #2c3e50;
    }
  }
}
</style>