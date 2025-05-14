<template>
  <div class="trace-container">
    <div class="trace-header">
      <h2>产品溯源查询</h2>
      <p>输入产品ID，查询完整溯源信息</p>
    </div>
    
    <div class="trace-input">
      <el-input
        v-model="goodId"
        placeholder="请输入产品ID"
        class="good-id-input"
        clearable
      >
        <template #append>
          <el-button type="primary" @click="searchTrace" :loading="loading">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </template>
      </el-input>
    </div>
    
    <div v-if="traceData" class="trace-result">
      <el-card class="trace-card">
        <template #header>
          <div class="card-header">
            <h3>{{ traceData.goodName }}</h3>
            <span class="good-id">ID: {{ traceData.goodId }}</span>
          </div>
        </template>
        
        <el-steps :active="activeStep" finish-status="success" direction="vertical">
          <!-- 生产阶段 -->
          <el-step title="生产阶段">
            <template #description>
              <div class="step-description">
                <p><strong>生产时间:</strong> {{ traceData.registerTime }}</p>
                <p><strong>生产商:</strong> {{ getCompanyName(traceData.ownerCompanyId) }}</p>
                <p><strong>产品名称:</strong> {{ traceData.goodName }}</p>
              </div>
            </template>
          </el-step>
          
          <!-- 运输阶段 -->
          <el-step title="运输阶段">
            <template #description>
              <div class="step-description" v-if="traceData.shipExists">
                <p><strong>运输时间:</strong> {{ traceData.shipTime }}</p>
                <p v-html="traceData.transportInfo"></p>
              </div>
              <div v-else class="pending-step">待运输</div>
            </template>
          </el-step>
          
          <!-- 验货阶段 -->
          <el-step title="验货阶段">
            <template #description>
              <div class="step-description" v-if="traceData.inspectExists">
                <p><strong>验货时间:</strong> {{ traceData.inspectTime }}</p>
                <p v-html="traceData.inspectionInfo"></p>
              </div>
              <div v-else class="pending-step">待验货</div>
            </template>
          </el-step>
          
          <!-- 交付阶段 -->
          <el-step title="交付阶段">
            <template #description>
              <div class="step-description" v-if="traceData.deliveryExists">
                <p><strong>交付时间:</strong> {{ traceData.deliveryTime }}</p>
                <p v-html="traceData.deliveryInfo"></p>
              </div>
              <div v-else class="pending-step">待交付</div>
            </template>
          </el-step>
        </el-steps>
        
        <div class="blockchain-info">
          <el-tag type="success">区块链验证通过</el-tag>
          <el-popover
            placement="top"
            :width="300"
            trigger="hover"
          >
            <template #reference>
              <el-button link type="primary">区块链溯源详情</el-button>
            </template>
            <template #default>
              <div class="blockchain-detail">
                <p><strong>区块号:</strong> #{{ blockInfo.blockNumber }}</p>
                <p><strong>区块哈希:</strong> {{ blockInfo.blockHash }}</p>
                <p><strong>交易哈希:</strong> {{ blockInfo.transactionHash }}</p>
                <p><strong>时间戳:</strong> {{ blockInfo.timestamp }}</p>
              </div>
            </template>
          </el-popover>
        </div>
      </el-card>
    </div>
    
    <!-- 无数据时显示的内容 -->
    <el-empty v-if="searched && !traceData" description="未找到产品信息，请检查产品ID是否正确"></el-empty>
    
    <!-- 区块链查询指引 -->
    <div class="trace-guide" v-if="!traceData">
      <h3>如何查询产品溯源信息?</h3>
      <ol>
        <li>输入产品包装上的溯源ID (例如: PROD20250513001)</li>
        <li>点击查询按钮获取完整溯源信息</li>
        <li>可查看产品从生产、运输、验货到销售的全流程信息</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import traceApi from '@/api/trace';

const goodId = ref('');
const traceData = ref(null);
const loading = ref(false);
const searched = ref(false);

// 模拟区块链信息
const blockInfo = ref({
  blockNumber: '1235813',
  blockHash: '0x7f1e4b5e6d7c8b9a0f1e2d3c4b5a6e7d8c9f0a1b2c3d4e5f',
  transactionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
  timestamp: '2025-05-13 16:25:42'
});

// 根据溯源记录计算当前步骤
const activeStep = computed(() => {
  if (!traceData.value) return 0;
  
  if (traceData.value.deliveryExists) return 4;
  if (traceData.value.inspectExists) return 3;
  if (traceData.value.shipExists) return 2;
  return 1;
});

// 从公司ID获取公司名称（实际项目中应从后端获取）
const getCompanyName = (companyId) => {
  const companyMap = {
    '1': '福建海产品有限公司',
    '2': '厦门海运物流有限公司',
    '3': '厦门港口检验有限公司',
    '4': '厦门海鲜市场有限公司'
  };
  
  return companyMap[companyId] || `公司ID: ${companyId}`;
};

// 查询溯源信息
const searchTrace = async () => {
  if (!goodId.value) {
    ElMessage.warning('请输入产品ID');
    return;
  }
  
  loading.value = true;
  searched.value = true;
  
  try {
    const data = await traceApi.getGoodTrace(goodId.value);
    traceData.value = data;
    
    if (!data) {
      ElMessage.error('未找到该产品的溯源信息');
    }
  } catch (error) {
    console.error('查询溯源信息失败:', error);
    ElMessage.error('查询失败，请稍后重试');
    traceData.value = null;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.trace-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.trace-header {
  text-align: center;
  margin-bottom: 30px;
  
  h2 {
    font-size: 28px;
    color: #2c3e50;
    margin-bottom: 10px;
  }
  
  p {
    color: #7f8c8d;
    font-size: 16px;
  }
}

.trace-input {
  margin-bottom: 30px;
  
  .good-id-input {
    width: 100%;
  }
}

.trace-result {
  margin-bottom: 30px;
}

.trace-card {
  margin-bottom: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      color: #2c3e50;
    }
    
    .good-id {
      color: #7f8c8d;
      font-size: 14px;
    }
  }
}

.step-description {
  padding: 10px 0;
  
  p {
    margin: 5px 0;
  }
  
  strong {
    font-weight: 600;
    color: #2c3e50;
  }
}

.pending-step {
  color: #909399;
  font-style: italic;
  padding: 10px 0;
}

.blockchain-info {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.blockchain-detail {
  p {
    margin: 5px 0;
    font-size: 13px;
    word-break: break-all;
  }
}

.trace-guide {
  margin-top: 40px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  
  h3 {
    color: #2c3e50;
    margin-top: 0;
  }
  
  ol {
    color: #5c6b77;
    padding-left: 20px;
    
    li {
      margin-bottom: 10px;
      line-height: 1.5;
    }
  }
}
</style>