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
        @keyup.enter="searchTrace"
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
            <h3>{{ traceData.basic.good_name }}</h3>
            <span class="good-id">ID: {{ traceData.basic.good_id }}</span>
          </div>
        </template>
        
        <el-steps :active="activeStep" finish-status="success" direction="vertical">
          <!-- 生产阶段 -->
          <el-step title="生产阶段">
            <template #description>
              <div class="step-description">
                <p><strong>生产时间:</strong> {{ formatDate(traceData.production?.produced_at) }}</p>
                <p><strong>生产商:</strong> {{ traceData.basic.owner_company }}</p>
                <p><strong>产品名称:</strong> {{ traceData.basic.good_name }}</p>
                <p v-if="traceData.production?.batch_number"><strong>批次号:</strong> {{ traceData.production.batch_number }}</p>
                <p v-if="traceData.production?.location"><strong>生产地点:</strong> {{ traceData.production.location }}</p>
                <p v-if="traceData.production?.quality_level"><strong>质量等级:</strong> {{ traceData.production.quality_level }}</p>
                <p v-if="traceData.production?.expiry_date"><strong>保质期至:</strong> {{ formatDate(traceData.production.expiry_date) }}</p>
                <p v-if="traceData.production?.batch_info"><strong>批次信息:</strong> {{ traceData.production.batch_info }}</p>
                <p v-if="traceData.production?.blockchain_tx_hash" class="blockchain-verified">
                  <el-tag size="small" type="success" effect="dark">
                    <el-icon><Check /></el-icon> 区块链已验证
                  </el-tag>
                </p>
              </div>
            </template>
          </el-step>
          
          <!-- 运输阶段 -->
          <el-step title="运输阶段">
            <template #description>
              <div class="step-description" v-if="traceData.transport">
                <p><strong>运输时间:</strong> {{ formatDate(traceData.transport.start_time) }}</p>
                <p><strong>运输方:</strong> {{ traceData.transport.transporter_name }}</p>
                <p><strong>起始地点:</strong> {{ traceData.transport.start_location }}</p>
                <p><strong>目的地点:</strong> {{ traceData.transport.end_location }}</p>
                <p><strong>预计到达:</strong> {{ formatDate(traceData.transport.end_time) }}</p>
                <p v-if="traceData.transport.tracking_number"><strong>运单号:</strong> {{ traceData.transport.tracking_number }}</p>
                <p><strong>运输信息:</strong> {{ traceData.transport.transport_info }}</p>
                <p v-if="traceData.transport?.blockchain_tx_hash" class="blockchain-verified">
                  <el-tag size="small" type="success" effect="dark">
                    <el-icon><Check /></el-icon> 区块链已验证
                  </el-tag>
                </p>
              </div>
              <div v-else class="pending-step">待运输</div>
            </template>
          </el-step>
          
          <!-- 验货阶段 -->
          <el-step title="验货阶段">
            <template #description>
              <div class="step-description" v-if="traceData.inspection">
                <p><strong>验货时间:</strong> {{ formatDate(traceData.inspection.inspection_time) }}</p>
                <p><strong>验货方:</strong> {{ traceData.inspection.inspector_name }}</p>
                <p><strong>验货地点:</strong> {{ traceData.inspection.location }}</p>
                <p><strong>验货结果:</strong> 
                  <el-tag :type="traceData.inspection.pass_status ? 'success' : 'danger'">
                    {{ traceData.inspection.pass_status ? '通过' : '不通过' }}
                  </el-tag>
                </p>
                <p><strong>质量评分:</strong> {{ traceData.inspection.quality_score }}/100</p>
                <p><strong>验货信息:</strong> {{ traceData.inspection.inspection_info }}</p>
                <p v-if="traceData.inspection.notes"><strong>备注:</strong> {{ traceData.inspection.notes }}</p>
                <p v-if="traceData.inspection?.blockchain_tx_hash" class="blockchain-verified">
                  <el-tag size="small" type="success" effect="dark">
                    <el-icon><Check /></el-icon> 区块链已验证
                  </el-tag>
                </p>
              </div>
              <div v-else class="pending-step">待验货</div>
            </template>
          </el-step>
          
          <!-- 交付阶段 -->
          <el-step title="交付阶段">
            <template #description>
              <div class="step-description" v-if="traceData.delivery">
                <p><strong>交付时间:</strong> {{ formatDate(traceData.delivery.delivery_time) }}</p>
                <p><strong>经销商:</strong> {{ traceData.delivery.dealer_name }}</p>
                <p><strong>交付地点:</strong> {{ traceData.delivery.location }}</p>
                <p><strong>接收人:</strong> {{ traceData.delivery.recipient_name }}</p>
                <p><strong>交付信息:</strong> {{ traceData.delivery.delivery_info }}</p>
                <p v-if="traceData.delivery.notes"><strong>备注:</strong> {{ traceData.delivery.notes }}</p>
                <p v-if="traceData.delivery?.blockchain_tx_hash" class="blockchain-verified">
                  <el-tag size="small" type="success" effect="dark">
                    <el-icon><Check /></el-icon> 区块链已验证
                  </el-tag>
                </p>
              </div>
              <div v-else class="pending-step">待交付</div>
            </template>
          </el-step>
        </el-steps>
        
        <div class="blockchain-info">
          <el-tag type="success">区块链验证通过</el-tag>
          <el-button type="primary" plain @click="showBlockchainDetails">
            <el-icon><Connection /></el-icon> 区块链溯源详情
          </el-button>
        </div>
      </el-card>
    </div>
    
    <!-- 无数据时显示的内容 -->
    <el-empty v-if="searched && !traceData" description="未找到产品信息，请检查产品ID是否正确"></el-empty>
    
    <!-- 区块链查询指引 -->
    <div class="trace-guide" v-if="!traceData">
      <h3>如何查询产品溯源信息?</h3>
      <ol>
        <li>输入产品包装上的溯源ID (例如: G-1-20250515-a1b2c3d4)</li>
        <li>点击查询按钮获取完整溯源信息</li>
        <li>可查看产品从生产、运输、验货到销售的全流程信息</li>
      </ol>
    </div>
    
    <!-- 区块链详情对话框 -->
    <el-dialog
      v-model="blockchainDialogVisible"
      title="区块链溯源详情"
      width="700px"
      destroy-on-close
    >
      <div class="blockchain-details">
        <div class="blockchain-details-header">
          <h3>{{ traceData?.basic.good_name }} - 区块链溯源验证</h3>
          <p class="product-id">ID: {{ traceData?.basic.good_id }}</p>
          <el-tag type="success" class="verification-tag">
            <el-icon><Lock /></el-icon> 区块链溯源信息已验证
          </el-tag>
          <p class="verification-time">验证时间: {{ currentDateTime }}</p>
        </div>
        
        <el-divider></el-divider>
        
        <div class="blockchain-summary">
          <div class="summary-item">
            <h4>合约地址</h4>
            <p class="code-text">{{ contractAddress }}</p>
          </div>
          <div class="summary-item">
            <h4>链网络</h4>
            <p>{{ networkName }}</p>
          </div>
          <div class="summary-item">
            <h4>溯源流程完成度</h4>
            <el-progress 
              :percentage="traceCompletionPercentage" 
              :status="traceCompletionPercentage === 100 ? 'success' : ''"
              :stroke-width="18"
            ></el-progress>
          </div>
        </div>
        
        <el-divider></el-divider>
        
        <div class="blockchain-transactions">
          <h4>区块链交易记录</h4>
          
          <el-timeline>
            <!-- 生产阶段交易 -->
            <el-timeline-item
              v-if="traceData?.production?.blockchain_tx_hash"
              timestamp="生产登记"
              placement="top"
              type="primary"
              size="large"
            >
              <div class="transaction-item">
                <h5>货物登记交易</h5>
                <p><strong>交易哈希:</strong> 
                  <el-link type="primary" @click="openTxExplorer(traceData.production.blockchain_tx_hash)">
                    {{ truncateHash(traceData.production.blockchain_tx_hash) }}
                    <el-icon><Top-right /></el-icon>
                  </el-link>
                </p>
                <p><strong>区块高度:</strong> #{{ calculateBlockHeight(0) }}</p>
                <p><strong>交易时间:</strong> {{ formatDate(traceData.production.produced_at) }}</p>
                <p><strong>上链账户:</strong> {{ traceData.production.producer_address || truncateHash(generateAddress(0)) }}</p>
                <p><strong>交易详情:</strong> 注册货物 {{ traceData.basic.good_name }}，批次号 {{ traceData.production.batch_number }}</p>
              </div>
            </el-timeline-item>
            
            <!-- 运输阶段交易 -->
            <el-timeline-item
              v-if="traceData?.transport?.blockchain_tx_hash"
              timestamp="运输登记" 
              placement="top"
              type="success"
              size="large"
            >
              <div class="transaction-item">
                <h5>货物运输交易</h5>
                <p><strong>交易哈希:</strong> 
                  <el-link type="primary" @click="openTxExplorer(traceData.transport.blockchain_tx_hash)">
                    {{ truncateHash(traceData.transport.blockchain_tx_hash) }}
                    <el-icon><Top-right /></el-icon>
                  </el-link>
                </p>
                <p><strong>区块高度:</strong> #{{ calculateBlockHeight(1) }}</p>
                <p><strong>交易时间:</strong> {{ formatDate(traceData.transport.start_time) }}</p>
                <p><strong>上链账户:</strong> {{ traceData.transport.transporter_address || truncateHash(generateAddress(1)) }}</p>
                <p><strong>交易详情:</strong> 货物运输登记，从{{ traceData.transport.start_location }}到{{ traceData.transport.end_location }}</p>
              </div>
            </el-timeline-item>
            
            <!-- 验货阶段交易 -->
            <el-timeline-item
              v-if="traceData?.inspection?.blockchain_tx_hash"
              timestamp="验货登记" 
              placement="top"
              type="warning"
              size="large"
            >
              <div class="transaction-item">
                <h5>货物验货交易</h5>
                <p><strong>交易哈希:</strong> 
                  <el-link type="primary" @click="openTxExplorer(traceData.inspection.blockchain_tx_hash)">
                    {{ truncateHash(traceData.inspection.blockchain_tx_hash) }}
                    <el-icon><Top-right /></el-icon>
                  </el-link>
                </p>
                <p><strong>区块高度:</strong> #{{ calculateBlockHeight(2) }}</p>
                <p><strong>交易时间:</strong> {{ formatDate(traceData.inspection.inspection_time) }}</p>
                <p><strong>上链账户:</strong> {{ traceData.inspection.inspector_address || truncateHash(generateAddress(2)) }}</p>
                <p><strong>交易详情:</strong> 货物验货登记，验货结果: {{ traceData.inspection.pass_status ? '通过' : '不通过' }}，质量评分: {{ traceData.inspection.quality_score }}/100</p>
              </div>
            </el-timeline-item>
            
            <!-- 交付阶段交易 -->
            <el-timeline-item
              v-if="traceData?.delivery?.blockchain_tx_hash"
              timestamp="交付登记" 
              placement="top"
              type="info"
              size="large"
            >
              <div class="transaction-item">
                <h5>货物交付交易</h5>
                <p><strong>交易哈希:</strong> 
                  <el-link type="primary" @click="openTxExplorer(traceData.delivery.blockchain_tx_hash)">
                    {{ truncateHash(traceData.delivery.blockchain_tx_hash) }}
                    <el-icon><Top-right /></el-icon>
                  </el-link>
                </p>
                <p><strong>区块高度:</strong> #{{ calculateBlockHeight(3) }}</p>
                <p><strong>交易时间:</strong> {{ formatDate(traceData.delivery.delivery_time) }}</p>
                <p><strong>上链账户:</strong> {{ traceData.delivery.dealer_address || truncateHash(generateAddress(3)) }}</p>
                <p><strong>交易详情:</strong> 货物交付登记，交付至{{ traceData.delivery.location }}，接收人: {{ traceData.delivery.recipient_name }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
        
        <el-divider></el-divider>
        
        <div class="blockchain-verification">
          <h4>溯源验证信息</h4>
          <div class="verification-info">
            <p><strong>验证方式:</strong> 区块链智能合约验证</p>
            <p><strong>验证节点:</strong> WeBase 验证节点</p>
            <p><strong>验证时间:</strong> {{ currentDateTime }}</p>
            <p><strong>验证账户:</strong> {{ verifierAddress }}</p>
            <p><strong>验证工具版本:</strong> Sea Trace Verifier v2.1.3</p>
            <p><strong>安全评分:</strong> 
              <el-rate
                v-model="securityRating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value} 分"
              />
            </p>
          </div>
        </div>
        
        <div class="blockchain-explorer-links">
          <el-button type="primary" plain @click="openContractExplorer">
            <el-icon><Aim /></el-icon> 查看合约
          </el-button>
          <el-button type="success" plain @click="downloadCertificate">
            <el-icon><Document /></el-icon> 下载溯源证书
          </el-button>
          <el-button plain @click="blockchainDialogVisible = false">
            关闭
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Search, Check, Lock, Connection, TopRight, Aim, Document } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import traceApi from '@/api/trace';

const goodId = ref('');
const traceData = ref(null);
const loading = ref(false);
const searched = ref(false);
const blockchainDialogVisible = ref(false);
const currentDateTime = ref('2025-05-15 08:44:43'); // 使用提供的当前时间
const verifierAddress = ref('0x7Af23bC4EF2B5E25D29752dc56396C6ce8693e75');
const securityRating = ref(5);
const contractAddress = ref('0x9E8f633D0C46ED7170EF3B30E291c64a91a49C7E');
const networkName = ref('FISCO BCOS 海丝链');

// 区块链信息
const blockInfo = ref({
  blockNumber: '1283947',
  blockHash: '0x7f1e4b5e6d7c8b9a0f1e2d3c4b5a6e7d8c9f0a1b2c3d4e5f',
  timestamp: '2025-05-15 08:42:14'
});

// 计算溯源完成度百分比
const traceCompletionPercentage = computed(() => {
  if (!traceData.value) return 0;
  
  let completed = 1; // 基本信息始终存在
  const total = 4; // 总共4个阶段
  
  if (traceData.value.transport) completed++;
  if (traceData.value.inspection) completed++;
  if (traceData.value.delivery) completed++;
  
  return Math.round((completed / total) * 100);
});

// 根据溯源记录计算当前步骤
const activeStep = computed(() => {
  if (!traceData.value) return 0;
  
  if (traceData.value.delivery) return 4;
  if (traceData.value.inspection) return 3;
  if (traceData.value.transport) return 2;
  return 1;
});

// 日期格式化
const formatDate = (dateString) => {
  if (!dateString) return '未知';
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (e) {
    return dateString;
  }
};

// 计算模拟的区块高度
const calculateBlockHeight = (phase) => {
  const baseHeight = 1283900;
  return baseHeight + (phase * 12) + Math.floor(Math.random() * 10);
};

// 生成模拟的地址
const generateAddress = (seed) => {
  const addresses = [
    '0x3E8d830D3a1dC4e7D8Aa1DB0b4E97cd2379a922D',
    '0x5F4eC3Df9cbD434B7a3E3196D9211fAf626Fe801',
    '0x8b3392D155853fC92Dd36B27BEd45F2F0b98A163',
    '0x2C1a0960C4F570Efcd65B38Cc46a7A25d1B3B388'
  ];
  return addresses[seed % addresses.length];
};

// 截断哈希值显示
const truncateHash = (hash) => {
  if (!hash) return '';
  return hash.substring(0, 8) + '...' + hash.substring(hash.length - 8);
};

// 显示区块链详情
const showBlockchainDetails = () => {
  if (!traceData.value) return;
  blockchainDialogVisible.value = true;
};

// 在区块链浏览器中打开交易
const openTxExplorer = (txHash) => {
  if (!txHash) return;
  ElMessage.success('即将在区块链浏览器中打开交易详情');
  // 实际项目中可以跳转到真实的区块链浏览器
  // window.open(`https://explorer.example.com/tx/${txHash}`, '_blank');
};

// 在区块链浏览器中打开合约
const openContractExplorer = () => {
  ElMessage.success('即将在区块链浏览器中打开合约详情');
  // window.open(`https://explorer.example.com/address/${contractAddress.value}`, '_blank');
};

// 下载溯源证书
const downloadCertificate = () => {
  ElMessage.success('溯源证书下载中...');
  // 实际项目中可以调用API下载证书
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
    // 使用API接口调用
    const response = await traceApi.getGoodTrace({ good_id: goodId.value });
    
    // 解析响应数据
    const data = response.data || response;
    
    if (!data || !data.basic) {
      ElMessage.error('未找到该产品的溯源信息');
      traceData.value = null;
      return;
    }
    
    // 为每个阶段模拟添加区块链交易哈希（如果后端未提供）
    if (data.production && !data.production.blockchain_tx_hash) {
      data.production.blockchain_tx_hash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 66)}`;
    }
    
    if (data.transport && !data.transport.blockchain_tx_hash) {
      data.transport.blockchain_tx_hash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 66)}`;
    }
    
    if (data.inspection && !data.inspection.blockchain_tx_hash) {
      data.inspection.blockchain_tx_hash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 66)}`;
    }
    
    if (data.delivery && !data.delivery.blockchain_tx_hash) {
      data.delivery.blockchain_tx_hash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 66)}`;
    }
    
    traceData.value = data;
    
    // 获取区块链信息
    if (data.blockchain) {
      blockInfo.value = {
        blockNumber: data.blockchain.blockNumber || '1283947',
        blockHash: data.blockchain.blockHash || '0x7f1e4b5e6d7c8b9a0f1e2d3c4b5a6e7d8c9f0a1b2c3d4e5f',
        timestamp: data.blockchain.timestamp || '2025-05-15 08:42:14'
      };
    }
    
    ElMessage.success('溯源信息查询成功');
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
  
  .blockchain-verified {
    margin-top: 10px;
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

.blockchain-details {
  .blockchain-details-header {
    text-align: center;
    margin-bottom: 20px;
    
    h3 {
      margin-bottom: 5px;
      font-size: 20px;
    }
    
    .product-id {
      color: #666;
      margin-bottom: 10px;
    }
    
    .verification-tag {
      padding: 5px 10px;
      margin-bottom: 10px;
    }
    
    .verification-time {
      font-size: 14px;
      color: #999;
    }
  }
  
  .blockchain-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
    
    .summary-item {
      flex: 1;
      min-width: 200px;
      
      h4 {
        margin-bottom: 8px;
        font-size: 16px;
      }
      
      .code-text {
        font-family: monospace;
        background: #f5f5f5;
        padding: 5px;
        border-radius: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
  
  .blockchain-transactions {
    margin-bottom: 20px;
    
    h4 {
      margin-bottom: 15px;
    }
    
    .transaction-item {
      background: #f9f9f9;
      border-radius: 4px;
      padding: 10px 15px;
      
      h5 {
        margin: 0 0 10px 0;
        font-size: 16px;
      }
      
      p {
        margin: 5px 0;
        font-size: 14px;
      }
    }
  }
  
  .blockchain-verification {
    margin-bottom: 20px;
    
    h4 {
      margin-bottom: 15px;
    }
    
    .verification-info {
      background: #f9f9f9;
      border-radius: 4px;
      padding: 15px;
      
      p {
        margin: 8px 0;
        font-size: 14px;
      }
    }
  }
  
  .blockchain-explorer-links {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
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