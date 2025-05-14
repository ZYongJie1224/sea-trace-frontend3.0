<template>
  <div class="operator-dashboard">
    <h2 class="page-title">工作台</h2>

    <!-- 状态卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon today-icon"><Calendar /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayCount }}</div>
              <div class="stat-label">今日操作数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon total-icon"><Goods /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCount }}</div>
              <div class="stat-label">总操作数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon company-icon"><Office /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ getCompanyTypeName(companyInfo.company_type) }}</div>
              <div class="stat-label">公司类型</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作卡片 -->
    <el-card class="quick-actions-card">
      <template #header>
        <div class="card-header">
          <h3>快捷操作</h3>
        </div>
      </template>

      <el-row :gutter="20">
        <!-- 生产商操作 -->
        <el-col :xs="24" :sm="12" :md="6" v-if="companyInfo.company_type === 0">
          <el-card shadow="hover" class="action-card" @click="navigateTo('/operator/register-good')">
            <el-icon class="action-icon producer-icon"><Plus /></el-icon>
            <div class="action-text">注册货物</div>
          </el-card>
        </el-col>
        
        <!-- 运输商操作 -->
        <el-col :xs="24" :sm="12" :md="6" v-if="companyInfo.company_type === 1">
          <el-card shadow="hover" class="action-card" @click="navigateTo('/operator/ship-good')">
            <el-icon class="action-icon shipper-icon"><Van /></el-icon>
            <div class="action-text">运输登记</div>
          </el-card>
        </el-col>
        
        <!-- 验货商操作 -->
        <el-col :xs="24" :sm="12" :md="6" v-if="companyInfo.company_type === 2">
          <el-card shadow="hover" class="action-card" @click="navigateTo('/operator/inspect-good')">
            <el-icon class="action-icon inspector-icon"><Check /></el-icon>
            <div class="action-text">验货登记</div>
          </el-card>
        </el-col>
        
        <!-- 经销商操作 -->
        <el-col :xs="24" :sm="12" :md="6" v-if="companyInfo.company_type === 3">
          <el-card shadow="hover" class="action-card" @click="navigateTo('/operator/deliver-good')">
            <el-icon class="action-icon dealer-icon"><Box /></el-icon>
            <div class="action-text">收货登记</div>
          </el-card>
        </el-col>
        
        <!-- 溯源查询（所有角色） -->
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="action-card" @click="navigateTo('/trace')">
            <el-icon class="action-icon trace-icon"><Search /></el-icon>
            <div class="action-text">溯源查询</div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 最近操作记录 -->
    <el-card class="activity-card">
      <template #header>
        <div class="card-header">
          <h3>最近操作记录</h3>
        </div>
      </template>
      
      <el-table :data="activities" stripe style="width: 100%">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag
              :type="getActivityTagType(scope.row.type)"
              effect="plain"
            >
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="good_id" label="货物ID" width="180" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="tx_hash" label="交易哈希" width="220">
          <template #default="scope">
            <el-tooltip 
              :content="scope.row.tx_hash" 
              placement="top" 
              :show-after="500"
            >
              <span class="tx-hash">{{ shortHash(scope.row.tx_hash) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { 
  Odometer, OfficeBuilding, User, Goods, Plus, 
  Van, Check, Box, Search, CaretBottom 
} from '@element-plus/icons-vue';
const router = useRouter();
const authStore = useAuthStore();

const stats = reactive({
  todayCount: 5,
  totalCount: 42
});

const companyInfo = reactive({
  id: 1,
  company_name: '福建海产品有限公司',
  company_type: 0, // 根据登录用户获取
  contact: '张经理',
  phone: '13800138000',
  address: '福建省福州市马尾区长安路18号'
});

// 模拟最近活动数据
const activities = ref([
  {
    time: '2025-05-13 16:30:22',
    type: '收货',
    good_id: 'PROD20250513001',
    description: '厦门海鲜市场收货',
    tx_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    time: '2025-05-13 14:25:17',
    type: '验货',
    good_id: 'PROD20250513001',
    description: '厦门港口验收通过',
    tx_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    time: '2025-05-13 12:15:45',
    type: '运输',
    good_id: 'PROD20250513001',
    description: '福州到厦门运输启动',
    tx_hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    time: '2025-05-13 09:45:12',
    type: '注册',
    good_id: 'PROD20250513001',
    description: '福建带鱼注册',
    tx_hash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc'
  }
]);

// 获取公司类型名称
const getCompanyTypeName = (type) => {
  const typeMap = {
    0: '生产商',
    1: '运输商',
    2: '验货商',
    3: '经销商'
  };
  return typeMap[type] || '未知';
};

// 获取活动标签类型
const getActivityTagType = (type) => {
  const typeMap = {
    '注册': 'success',
    '运输': 'warning',
    '验货': 'info',
    '收货': 'primary'
  };
  return typeMap[type] || 'info';
};

// 缩短交易哈希显示
const shortHash = (hash) => {
  if (!hash) return '';
  return hash.substring(0, 10) + '...' + hash.substring(hash.length - 8);
};

// 导航到指定路径
const navigateTo = (path) => {
  router.push(path);
};

// 获取操作员工作台信息
const getDashboardInfo = async () => {
  try {
    // 实际项目中应调用API获取数据
    // const data = await operatorApi.getDashboardInfo();
    
    // 获取统计数据
    // stats.todayCount = data.today_count;
    // stats.totalCount = data.total_count;
    
    // 从登录用户信息中获取公司类型
    if (authStore.user) {
      companyInfo.company_type = authStore.user.company_type || 0;
    }
  } catch (error) {
    console.error('获取工作台信息失败:', error);
  }
};

onMounted(() => {
  getDashboardInfo();
});
</script>

<style scoped lang="scss">
.operator-dashboard {
  padding: 20px 0;
}

.page-title {
  margin-bottom: 20px;
  color: #2c3e50;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
  
  .stat-content {
    display: flex;
    align-items: center;
    height: 100%;
  }
  
  .stat-icon {
    font-size: 54px;
    margin-right: 20px;
    
    &.today-icon {
      color: #409EFF;
    }
    
    &.total-icon {
      color: #67C23A;
    }
    
    &.company-icon {
      color: #E6A23C;
    }
  }
  
  .stat-info {
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #2c3e50;
      line-height: 1.2;
    }
    
    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }
}

.quick-actions-card {
  margin-bottom: 20px;
  
  .card-header {
    h3 {
      margin: 0;
      color: #2c3e50;
    }
  }
  
  .action-card {
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-bottom: 20px;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    }
    
    .action-icon {
      font-size: 40px;
      margin-bottom: 10px;
      
      &.producer-icon {
        color: #67C23A;
      }
      
      &.shipper-icon {
        color: #E6A23C;
      }
      
      &.inspector-icon {
        color: #409EFF;
      }
      
      &.dealer-icon {
        color: #F56C6C;
      }
      
      &.trace-icon {
        color: #909399;
      }
    }
    
    .action-text {
      font-size: 16px;
      color: #2c3e50;
    }
  }
}

.activity-card {
  margin-bottom: 20px;
  
  .card-header {
    h3 {
      margin: 0;
      color: #2c3e50;
    }
  }
  
  .tx-hash {
    font-family: monospace;
    color: #606266;
  }
}
</style>