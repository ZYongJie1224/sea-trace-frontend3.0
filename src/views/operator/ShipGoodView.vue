<template>
  <div class="ship-good-container">
    <el-card class="ship-card">
      <template #header>
        <div class="card-header">
          <h2>货物运输登记</h2>
        </div>
      </template>
      
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="货物ID" prop="good_id">
          <el-input v-model="form.good_id" placeholder="请输入货物ID" />
          <div class="form-tip">
            输入已注册货物的完整ID，例如：G-1-20250515-a1b2c3d4
          </div>
        </el-form-item>
        
        <el-form-item label="起始地点" prop="start_location">
          <el-input v-model="form.start_location" placeholder="请输入运输起始地点" />
        </el-form-item>
        
        <el-form-item label="目的地点" prop="end_location">
          <el-input v-model="form.end_location" placeholder="请输入运输目的地点" />
        </el-form-item>
        
        <el-form-item label="运输方式" prop="transport_mode">
          <el-select v-model="form.transport_mode" placeholder="请选择运输方式">
            <el-option label="海运" value="海运" />
            <el-option label="陆运" value="陆运" />
            <el-option label="空运" value="空运" />
            <el-option label="铁路运输" value="铁路运输" />
            <el-option label="多式联运" value="多式联运" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="预计到达时间" prop="end_time">
          <el-date-picker
            v-model="form.end_time"
            type="datetime"
            placeholder="选择预计到达时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDT00:00:00Z"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        
        <el-form-item label="运单号" prop="tracking_number">
          <el-input v-model="form.tracking_number" placeholder="请输入运单号（选填）" />
        </el-form-item>
        
        <el-form-item label="运输信息" prop="transport_info">
          <el-input 
            v-model="form.transport_info" 
            type="textarea" 
            rows="4"
            placeholder="请输入运输详细信息（运输路线、中转站点、注意事项等）" 
          />
        </el-form-item>
        
        <el-form-item label="其他备注" prop="notes">
          <el-input 
            v-model="form.notes" 
            type="textarea" 
            rows="2"
            placeholder="其他需要说明的信息（选填）" 
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">提交运输登记</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-dialog
      v-model="successDialogVisible"
      title="运输登记成功"
      width="500px"
    >
      <div class="success-content">
        <el-result
          icon="success"
          title="货物运输登记成功"
          sub-title="运输信息已上链，可实时追踪物流状态"
        >
          <template #extra>
            <div class="result-info">
              <p><strong>货物ID:</strong> {{ form.good_id }}</p>
              <p><strong>运输方式:</strong> {{ form.transport_mode }}</p>
              <p><strong>起始地点:</strong> {{ form.start_location }}</p>
              <p><strong>目的地点:</strong> {{ form.end_location }}</p>
              <p><strong>预计到达:</strong> {{ formatDate(form.end_time) }}</p>
              <p v-if="form.tracking_number"><strong>运单号:</strong> {{ form.tracking_number }}</p>
              <p><strong>区块链交易哈希:</strong> {{ txHash }}</p>
              <p><strong>登记时间:</strong> {{ currentTime }}</p>
              <p><strong>登记人员:</strong> {{ currentUser }}</p>
            </div>
          </template>
        </el-result>
        
        <div class="dialog-footer">
          <el-button @click="successDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleShipAnother">
            继续登记
          </el-button>
          <el-button type="success" @click="viewTrace">查看溯源记录</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import traceApi from '@/api/trace';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const successDialogVisible = ref(false);
const txHash = ref('');
const currentTime = ref('2025-05-15 07:41:03');
const currentUser = ref('ZYongJie1224');
const formRef = ref(null);

const form = reactive({
  good_id: '',
  start_location: '',
  end_location: '',
  transport_mode: '',
  transport_info: '',
  end_time: '',
  tracking_number: '',
  notes: ''
});

onMounted(() => {
  // 如果需要，可以在这里获取当前用户和时间信息
  // 不过示例中已经提供了固定值
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  // 处理ISO格式日期
  if (dateString.includes('T')) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  return dateString;
};

const disabledDate = (time) => {
  return time.getTime() < Date.now();
};

const rules = {
  good_id: [
    { required: true, message: '请输入货物ID', trigger: 'blur' }
  ],
  start_location: [
    { required: true, message: '请输入起始地点', trigger: 'blur' }
  ],
  end_location: [
    { required: true, message: '请输入目的地点', trigger: 'blur' }
  ],
  transport_mode: [
    { required: true, message: '请选择运输方式', trigger: 'change' }
  ],
  end_time: [
    { required: true, message: '请选择预计到达时间', trigger: 'change' }
  ],
  transport_info: [
    { required: true, message: '请输入运输信息', trigger: 'blur' }
  ]
};

const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    loading.value = true;
    try {
      // 构建提交数据 - 确保字段名与后端API期望的一致
      const shipData = {
        good_id: form.good_id,
        start_location: form.start_location,
        end_location: form.end_location,
        transport_info: form.transport_mode ? `${form.transport_mode}: ${form.transport_info}` : form.transport_info,
        end_time: form.end_time,
        tracking_number: form.tracking_number || '',
        notes: form.notes || ''
      };
      
      // 使用新API调用
      const response = await traceApi.shipGood(shipData);
      
      // 设置成功对话框数据
      const result = response;
      txHash.value = result.blockchain_tx_hash || result.tx_hash || '';
      currentTime.value = new Date().toLocaleString();
      successDialogVisible.value = true;
      
      ElMessage.success('货物运输登记成功');
    } catch (error) {
      console.error('运输登记失败:', error);
      ElMessage.error(error.response?.data?.errorMessage || error.message || '登记失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  });
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

const handleShipAnother = () => {
  successDialogVisible.value = false;
  resetForm();
};

const viewTrace = () => {
  router.push(`/trace?id=${form.good_id}`);
  successDialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.ship-good-container {
  max-width: 800px;
  margin: 0 auto;
}

.ship-card {
  margin-bottom: 20px;
  
  .card-header {
    h2 {
      margin: 0;
      color: #2c3e50;
    }
  }
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 5px;
}

.success-content {
  text-align: center;
  
  .result-info {
    text-align: left;
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    
    p {
      margin: 8px 0;
      word-break: break-all;
    }
  }
}

.dialog-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>