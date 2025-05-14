<template>
  <div class="dashboard-container">
    <h2 class="page-title">系统概览</h2>
    
    <!-- 系统统计数据卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon company-icon"><OfficeBuilding /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.companyCount }}</div>
              <div class="stat-label">公司数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon user-icon"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.userCount }}</div>
              <div class="stat-label">用户数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon good-icon"><Goods /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.goodCount }}</div>
              <div class="stat-label">货物数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon tx-icon"><Connection /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.blockNumber }}</div>
              <div class="stat-label">当前区块高度</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 区块链信息卡片 -->
    <el-card class="chain-info-card">
      <template #header>
        <div class="card-header">
          <h3>区块链信息</h3>
          <el-button type="primary" size="small" @click="refreshChainInfo" :loading="loading">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
      </template>
      
      <el-descriptions border>
        <el-descriptions-item label="链ID">{{ chainInfo.chainId || 'N/A' }}</el-descriptions-item>
        <el-descriptions-item label="当前区块高度">{{ chainInfo.blockNumber || 'N/A' }}</el-descriptions-item>
        <el-descriptions-item label="节点数量">{{ chainInfo.nodeCount || 'N/A' }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ chainInfo.version || 'N/A' }}</el-descriptions-item>
        <el-descriptions-item label="区块链构建时间">{{ chainInfo.buildTime || 'N/A' }}</el-descriptions-item>
        <el-descriptions-item label="交易总数">{{ chainInfo.txSum || 'N/A' }}</el-descriptions-item>
        <el-descriptions-item label="成功交易数">{{ chainInfo.successTxSum || 'N/A' }}</el-descriptions-item>
        <el-descriptions-item label="失败交易数">{{ chainInfo.failedTxSum || 'N/A' }}</el-descriptions-item>
        <el-descriptions-item label="交易成功率">{{ chainInfo.txSuccessRate || 'N/A' }}</el-descriptions-item>
        <el-descriptions-item label="查询时间" :span="2">{{ chainInfo.queryTime || 'N/A' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <!-- 节点信息卡片 -->
    <node-info-component />
    
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>公司类型分布</h3>
            </div>
          </template>
          
          <div class="chart-container" ref="companyChartRef"></div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>最近一周新增货物数量</h3>
            </div>
          </template>
          
          <div class="chart-container" ref="goodChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 最新活动列表 -->
    <el-card class="activity-card">
      <template #header>
        <div class="card-header">
          <h3>最新活动</h3>
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
        <el-table-column prop="good_id" label="货物ID" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="operator" label="操作人" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { OfficeBuilding, User, Goods, Connection, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts/core';
import { PieChart, BarChart } from 'echarts/charts';
import { LegendComponent, TooltipComponent, GridComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import adminApi from '@/api/admin';
import traceApi from '@/api/trace';
import NodeInfoComponent from '@/components/NodeInfoComponent.vue';

// 注册 ECharts 组件
echarts.use([PieChart, BarChart, LegendComponent, TooltipComponent, GridComponent, TitleComponent, CanvasRenderer]);

const loading = ref(false);
const companyChartRef = ref(null);
const goodChartRef = ref(null);
let companyChart = null;
let goodChart = null;

const stats = reactive({
  companyCount: 0,
  userCount: 0,
  goodCount: 0,
  blockNumber: 0
});

const chainInfo = reactive({
  chainId: '',
  blockNumber: 0,
  nodeCount: 0,
  version: '',
  buildTime: '',
  txSum: 0,
  successTxSum: 0,
  failedTxSum: 0,
  txSuccessRate: '',
  queryTime: ''
});

// 最新活动数据
const activities = ref([]);

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

// 初始化公司类型分布图表
const initCompanyChart = (companyTypeDistribution) => {
  if (!companyChartRef.value) return;
  
  if (companyChart) {
    companyChart.dispose();
  }
  
  companyChart = echarts.init(companyChartRef.value);
  
  // 默认数据
  const defaultData = [
    { value: 0, name: '生产商' },
    { value: 0, name: '运输商' },
    { value: 0, name: '验货商' },
    { value: 0, name: '经销商' }
  ];
  
  // 如果有后端数据，则使用后端数据
  let chartData = defaultData;
  if (companyTypeDistribution) {
    chartData = [
      { value: companyTypeDistribution.producer || 0, name: '生产商' },
      { value: companyTypeDistribution.shipper || 0, name: '运输商' },
      { value: companyTypeDistribution.inspector || 0, name: '验货商' },
      { value: companyTypeDistribution.dealer || 0, name: '经销商' }
    ];
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['生产商', '运输商', '验货商', '经销商']
    },
    series: [
      {
        name: '公司类型',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  };
  
  companyChart.setOption(option);
};

// 初始化货物数量图表
const initGoodChart = (goodsWeeklyData) => {
  if (!goodChartRef.value) return;
  
  if (goodChart) {
    goodChart.dispose();
  }
  
  goodChart = echarts.init(goodChartRef.value);
  
  // 生成过去一周的日期和数据
  let days = [];
  let values = [];
  
  // 如果有后端数据，则使用后端数据
  if (goodsWeeklyData && goodsWeeklyData.length) {
    goodsWeeklyData.forEach(item => {
      days.push(item.date);
      values.push(item.count);
    });
  } else {
    // 使用默认数据
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }));
      values.push(Math.floor(Math.random() * 10));
    }
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: days,
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '新增货物',
        type: 'bar',
        barWidth: '60%',
        data: values
      }
    ]
  };
  
  goodChart.setOption(option);
};

// 刷新区块链信息
const refreshChainInfo = async () => {
  loading.value = true;
  try {
    const response = await traceApi.getChainInfo();
    
    // 提取 chain_info 对象
    const data = response.chain_info || {};
    
    // 更新区块链信息 - 适配新的API响应格式
    chainInfo.chainId = data.chainId || '';
    chainInfo.blockNumber = data.blockNumber || 0;
    chainInfo.nodeCount = data.nodeCount || 0;
    chainInfo.version = data.version || '';
    chainInfo.buildTime = data.buildTime || '';
    chainInfo.txSum = data.txSum || 0;
    chainInfo.successTxSum = data.successTxSum || 0;
    chainInfo.failedTxSum = data.failedTxSum || 0;
    chainInfo.txSuccessRate = data.txSuccessRate || '0%';
    chainInfo.queryTime = data.queryTime || '2025-05-14 02:40:11';
    
    // 更新统计数据中的区块高度
    stats.blockNumber = data.blockNumber || 0;
    
    ElMessage.success('区块链信息已更新');
  } catch (error) {
    console.error('获取区块链信息失败:', error);
    ElMessage.error('获取区块链信息失败');
  } finally {
    loading.value = false;
  }
};

// 获取dashboard统计数据
const getDashboardStats = async () => {
  try {
    const data = await adminApi.getDashboardStats();
    
    // 更新统计卡片数据
    stats.companyCount = data.companyCount || 0;
    stats.userCount = data.userCount || 0;
    stats.goodCount = data.goodCount || 0;
    stats.blockNumber = data.blockNumber || 0;
    
    // 更新活动列表
    if (data.recentActivities && data.recentActivities.length) {
      activities.value = data.recentActivities;
    } else {
      // 如果没有活动数据，提供一些默认活动
      activities.value = [
        {
          time: '2025-05-14 02:40:11',
          type: '注册',
          good_id: 'GOOD00123',
          description: '生产商注册了一批新货物',
          operator: 'ZYongJie1224'
        },
        {
          time: '2025-05-14 01:35:26',
          type: '运输',
          good_id: 'GOOD00122',
          description: '货物已从生产工厂装运',
          operator: '李四'
        },
        {
          time: '2025-05-14 00:15:42',
          type: '验货',
          good_id: 'GOOD00121',
          description: '验货商已完成货物质量检验',
          operator: '王五'
        },
        {
          time: '2025-05-13 22:30:18',
          type: '收货',
          good_id: 'GOOD00120',
          description: '经销商已确认收货',
          operator: '赵六'
        }
      ];
    }
    
    // 初始化图表
    initCompanyChart(data.companyTypeDistribution);
    initGoodChart(data.goodsWeeklyData);
    
  } catch (error) {
    console.error('获取统计数据失败:', error);
    ElMessage.error('获取统计数据失败');
    
    // 使用默认数据初始化图表
    initCompanyChart();
    initGoodChart();
    
    // 如果没有活动数据，提供一些默认活动
    activities.value = [
      {
        time: '2025-05-14 02:40:11',
        type: '注册',
        good_id: 'GOOD00123',
        description: '生产商注册了一批新货物',
        operator: 'ZYongJie1224'
      },
      {
        time: '2025-05-14 01:35:26',
        type: '运输',
        good_id: 'GOOD00122',
        description: '货物已从生产工厂装运',
        operator: '李四'
      },
      {
        time: '2025-05-14 00:15:42',
        type: '验货',
        good_id: 'GOOD00121',
        description: '验货商已完成货物质量检验',
        operator: '王五'
      },
      {
        time: '2025-05-13 22:30:18',
        type: '收货',
        good_id: 'GOOD00120',
        description: '经销商已确认收货',
        operator: '赵六'
      }
    ];
  }
};

onMounted(async () => {
  // 获取数据
  await getDashboardStats();
  await refreshChainInfo();
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    companyChart?.resize();
    goodChart?.resize();
  });
});
</script>

<style scoped lang="scss">
.dashboard-container {
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
    
    &.company-icon {
      color: #409EFF;
    }
    
    &.user-icon {
      color: #67C23A;
    }
    
    &.good-icon {
      color: #E6A23C;
    }
    
    &.tx-icon {
      color: #F56C6C;
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

.chain-info-card {
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

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
  
  .chart-container {
    height: 300px;
  }
  
  .card-header {
    h3 {
      margin: 0;
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
}
</style>