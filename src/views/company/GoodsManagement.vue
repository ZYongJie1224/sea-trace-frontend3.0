<template>
  <div class="goods-management">
    <div class="page-header">
      <h2>货物管理</h2>
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索货物ID或名称"
          clearable
          @clear="handleSearch"
          style="width: 250px;"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <el-table 
      :data="goods" 
      border 
      style="width: 100%" 
      v-loading="loading"
    >
      <el-table-column prop="good_id" label="货物ID" width="180" />
      <el-table-column prop="good_name" label="货物名称" width="180" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusTag(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button 
            size="small" 
            type="primary" 
            @click="viewTraceInfo(scope.row)"
          >
            溯源信息
          </el-button>
          <el-button 
            size="small" 
            type="success" 
            @click="downloadQRCode(scope.row)"
            :disabled="!scope.row.good_id"
          >
            下载码
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 溯源信息对话框 -->
    <el-dialog
      v-model="traceDialogVisible"
      title="溯源信息"
      width="700px"
    >
      <el-descriptions title="货物基本信息" :column="2" border>
        <el-descriptions-item label="货物ID">{{ selectedGood.good_id }}</el-descriptions-item>
        <el-descriptions-item label="货物名称">{{ selectedGood.good_name }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(selectedGood.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(selectedGood.status)">
            {{ getStatusText(selectedGood.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ selectedGood.description }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-steps :active="getTraceStep(selectedGood.status)" finish-status="success" direction="vertical">
        <!-- 生产阶段 -->
        <el-step title="生产阶段">
          <template #description>
            <div class="step-description">
              <p><strong>生产时间:</strong> {{ formatDate(selectedGood.created_at) }}</p>
              <p><strong>生产商:</strong> {{ selectedGood.company_name }}</p>
              <p><strong>产品名称:</strong> {{ selectedGood.good_name }}</p>
            </div>
          </template>
        </el-step>
        
        <!-- 运输阶段 -->
        <el-step title="运输阶段">
          <template #description>
            <div class="step-description" v-if="selectedGood.status >= 1">
              <p><strong>运输时间:</strong> {{ formatDate(selectedGood.ship_time) }}</p>
              <p v-html="selectedGood.transport_info"></p>
            </div>
            <div v-else class="pending-step">待运输</div>
          </template>
        </el-step>
        
        <!-- 验货阶段 -->
        <el-step title="验货阶段">
          <template #description>
            <div class="step-description" v-if="selectedGood.status >= 2">
              <p><strong>验货时间:</strong> {{ formatDate(selectedGood.inspect_time) }}</p>
              <p v-html="selectedGood.inspection_info"></p>
            </div>
            <div v-else class="pending-step">待验货</div>
          </template>
        </el-step>
        
        <!-- 交付阶段 -->
        <el-step title="交付阶段">
          <template #description>
            <div class="step-description" v-if="selectedGood.status >= 3">
              <p><strong>交付时间:</strong> {{ formatDate(selectedGood.delivery_time) }}</p>
              <p v-html="selectedGood.delivery_info"></p>
            </div>
            <div v-else class="pending-step">待交付</div>
          </template>
        </el-step>
      </el-steps>
    </el-dialog>

    <!-- 二维码对话框 -->
    <el-dialog
      v-model="qrDialogVisible"
      title="货物溯源二维码"
      width="400px"
    >
      <div class="qr-code-container">
        <img :src="qrCodeUrl" alt="溯源二维码" class="qr-code-image" />
        <p class="qr-code-text">{{ selectedGood.good_id }}</p>
        <p class="qr-code-info">扫描二维码查看货物完整溯源信息</p>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="qrDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadQRCodeImage">
            <el-icon><Download /></el-icon> 下载二维码
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Download } from '@element-plus/icons-vue';
import companyApi from '@/api/company';
import traceApi from '@/api/trace';
import QRCode from 'qrcode';

const goods = ref([
  {
    good_id: 'PROD20250513001',
    good_name: '福建深海带鱼',
    description: '产自福建沿海，新鲜深海带鱼',
    status: 3,
    created_at: '2025-05-13T09:45:12Z',
    ship_time: '2025-05-13T12:15:45Z',
    inspect_time: '2025-05-13T14:25:17Z',
    delivery_time: '2025-05-13T16:30:22Z',
    company_name: '福建海产品有限公司',
    transport_info: '福州至厦门, 冷藏运输, 温度-5℃',
    inspection_info: '厦门港口验收通过, 质量良好',
    delivery_info: '厦门海鲜市场收货'
  },
  {
    good_id: 'PROD20250512003',
    good_name: '福建黄花鱼',
    description: '福建近海捕捞，鲜活黄花鱼',
    status: 2,
    created_at: '2025-05-12T08:30:00Z',
    ship_time: '2025-05-12T11:20:15Z',
    inspect_time: '2025-05-12T14:45:30Z',
    company_name: '福建海产品有限公司',
    transport_info: '福州至厦门, 冷藏运输, 温度-5℃',
    inspection_info: '厦门港口验收通过, 质量良好'
  },
  {
    good_id: 'PROD20250510002',
    good_name: '福建大黄鱼',
    description: '福建东海捕捞，鲜活大黄鱼',
    status: 1,
    created_at: '2025-05-10T10:15:00Z',
    ship_time: '2025-05-10T13:45:20Z',
    company_name: '福建海产品有限公司',
    transport_info: '福州至厦门, 冷藏运输, 温度-5℃'
  },
  {
    good_id: 'PROD20250508001',
    good_name: '福建梭子蟹',
    description: '福建近海捕捞，鲜活梭子蟹',
    status: 0,
    created_at: '2025-05-08T09:20:00Z',
    company_name: '福建海产品有限公司'
  }
]);

const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(4);
const traceDialogVisible = ref(false);
const qrDialogVisible = ref(false);
const selectedGood = ref({});
const qrCodeUrl = ref('');

// 获取货物列表
const getGoods = async () => {
  loading.value = true;
  try {
    // 实际项目中应调用API获取数据
    // const data = await companyApi.getGoodsList({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   query: searchQuery.value
    // });
    // goods.value = data.goods || [];
    // total.value = data.total || 0;
    
    // 模拟异步加载
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error('获取货物列表失败:', error);
    ElMessage.error('获取货物列表失败');
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 获取状态标签类型
const getStatusTag = (status) => {
  const statusMap = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'primary'
  };
  return statusMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '已注册',
    1: '已运输',
    2: '已验货',
    3: '已交付'
  };
  return statusMap[status] || '未知';
};

// 获取溯源步骤
const getTraceStep = (status) => {
  return status + 1;
};

// 查看溯源信息
const viewTraceInfo = (row) => {
  selectedGood.value = row;
  traceDialogVisible.value = true;
};

// 下载二维码
const downloadQRCode = async (row) => {
  selectedGood.value = row;
  
  try {
    // 生成二维码数据URL
    const traceUrl = `${window.location.origin}/trace?id=${row.good_id}`;
    qrCodeUrl.value = await QRCode.toDataURL(traceUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#2c3e50',
        light: '#ffffff'
      }
    });
    
    qrDialogVisible.value = true;
  } catch (error) {
    console.error('生成二维码失败:', error);
    ElMessage.error('生成二维码失败');
  }
};

// 下载二维码图片
const downloadQRCodeImage = () => {
  // 创建一个链接并点击来下载图片
  const link = document.createElement('a');
  link.download = `${selectedGood.value.good_id}_qrcode.png`;
  link.href = qrCodeUrl.value;
  link.click();
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  getGoods();
};

// 处理页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  getGoods();
};

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  getGoods();
};

onMounted(() => {
  getGoods();
});
</script>

<style scoped lang="scss">
.goods-management {
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    color: #2c3e50;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  
  .qr-code-image {
    width: 300px;
    height: 300px;
    margin-bottom: 15px;
  }
  
  .qr-code-text {
    font-size: 16px;
    font-weight: bold;
    margin: 5px 0;
  }
  
  .qr-code-info {
    font-size: 14px;
    color: #909399;
    margin: 5px 0;
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>