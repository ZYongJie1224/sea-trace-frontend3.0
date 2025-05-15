<template>
  <div class="inspect-good-container">
    <el-card class="inspect-card">
      <template #header>
        <div class="card-header">
          <h2>货物验货登记</h2>
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
            输入待验货的货物ID，该货物必须处于已运输状态
          </div>
        </el-form-item>
        
        <el-form-item label="验货地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入验货地点" />
        </el-form-item>
        
        <el-form-item label="质量评分" prop="quality_score">
          <el-slider
            v-model="form.quality_score"
            :min="0"
            :max="100"
            :format-tooltip="formatTooltip"
            show-input
          />
          <div class="form-tip">
            拖动滑块或直接输入设置质量评分：0-100分
          </div>
        </el-form-item>
        
        <el-form-item label="验货结果" prop="pass_status">
          <el-radio-group v-model="form.pass_status">
            <el-radio :label="true">通过</el-radio>
            <el-radio :label="false">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="验货信息" prop="inspection_info">
          <el-input 
            v-model="form.inspection_info" 
            type="textarea" 
            rows="4"
            placeholder="请输入验货详细信息（质量状况、外观、功能等）" 
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="notes">
          <el-input 
            v-model="form.notes" 
            type="textarea" 
            rows="2"
            placeholder="其他需要说明的情况（选填）" 
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">提交验货</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-dialog
      v-model="successDialogVisible"
      title="验货登记成功"
      width="500px"
    >
      <div class="success-content">
        <el-result
          icon="success"
          title="货物验货登记成功"
          sub-title="验货信息已上链，保证货物质量可追溯"
        >
          <template #extra>
            <div class="result-info">
              <p><strong>货物ID:</strong> {{ form.good_id }}</p>
              <p><strong>验货地点:</strong> {{ form.location }}</p>
              <p><strong>质量评分:</strong> {{ form.quality_score }}/100</p>
              <p><strong>验货结果:</strong> {{ form.pass_status ? '通过' : '不通过' }}</p>
              <p><strong>验货信息:</strong> {{ form.inspection_info }}</p>
              <p><strong>区块链交易哈希:</strong> {{ txHash }}</p>
              <p><strong>登记时间:</strong> {{ currentTime }}</p>
              <p><strong>登记人员:</strong> {{ currentUser }}</p>
            </div>
          </template>
        </el-result>
        
        <div class="dialog-footer">
          <el-button @click="successDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleInspectAnother">
            继续验货
          </el-button>
          <el-button type="success" @click="viewTrace">查看溯源记录</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import traceApi from '@/api/trace';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const successDialogVisible = ref(false);
const txHash = ref('');
const currentTime = ref('2025-05-15 08:06:07');
const currentUser = ref('ZYongJie1224');
const formRef = ref(null);

const form = reactive({
  good_id: '',
  location: '',
  quality_score: 80,
  pass_status: true,
  inspection_info: '',
  notes: ''
});

const formatTooltip = (val) => {
  return val + ' 分';
};

const rules = {
  good_id: [
    { required: true, message: '请输入货物ID', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入验货地点', trigger: 'blur' }
  ],
  quality_score: [
    { required: true, message: '请设置质量评分', trigger: 'change' },
    { type: 'number', min: 0, max: 100, message: '评分范围为0-100', trigger: 'change' }
  ],
  inspection_info: [
    { required: true, message: '请输入验货信息', trigger: 'blur' }
  ]
};

const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    loading.value = true;
    try {
      // 构建提交数据，字段名与后端期望的一致
      const inspectData = {
        good_id: form.good_id,
        location: form.location,
        quality_score: form.quality_score,
        pass_status: form.pass_status,
        inspection_info: form.inspection_info,
        notes: form.notes || ''
      };
      
      // 提交验货登记请求
      const response = await traceApi.inspectGood(inspectData);
      
      // 设置成功对话框数据
      const result = response;
      txHash.value = result.blockchain_tx_hash || result.tx_hash || '';
      currentTime.value = '2025-05-15 08:06:07'; // 使用固定时间或当前时间
      successDialogVisible.value = true;
      
      ElMessage.success('货物验货登记成功');
    } catch (error) {
      console.error('验货登记失败:', error);
      if (error.response && error.response.data && error.response.data.errorMessage) {
        ElMessage.error(error.response.data.errorMessage);
      } else {
        ElMessage.error(error.message || '登记失败，请稍后重试');
      }
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

const handleInspectAnother = () => {
  successDialogVisible.value = false;
  resetForm();
};

const viewTrace = () => {
  router.push(`/trace?id=${form.good_id}`);
  successDialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.inspect-good-container {
  max-width: 800px;
  margin: 0 auto;
}

.inspect-card {
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