<template>
  <div class="register-good-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>注册新货物</h2>
        </div>
      </template>
      
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="货物名称" prop="good_name">
          <el-input v-model="form.good_name" placeholder="请输入货物名称" />
        </el-form-item>
        
        <el-form-item label="批次号" prop="batch_number">
          <el-input v-model="form.batch_number" placeholder="请输入批次号" />
        </el-form-item>
        
        <el-form-item label="生产地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入生产地点" />
        </el-form-item>
        
        <el-form-item label="保质期" prop="expiry_date">
          <el-date-picker
            v-model="form.expiry_date"
            type="date"
            placeholder="选择保质期日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        
        <el-form-item label="质量等级" prop="quality_level">
          <el-select v-model="form.quality_level" placeholder="请选择质量等级">
            <el-option label="优" value="A" />
            <el-option label="良" value="B" />
            <el-option label="合格" value="C" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="批次信息" prop="batch_info">
          <el-input 
            v-model="form.batch_info" 
            type="textarea" 
            rows="3"
            placeholder="请输入批次相关信息（生产批次、工艺等）" 
          />
        </el-form-item>
        
        <el-form-item label="货物描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            rows="4"
            placeholder="请输入货物详细描述（产地、规格、特征等）" 
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">提交注册</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-dialog
      v-model="successDialogVisible"
      title="注册成功"
      width="500px"
    >
      <div class="success-content">
        <el-result
          icon="success"
          title="货物注册成功"
          sub-title="货物信息已上链，具备完整溯源能力"
        >
          <template #extra>
            <div class="result-info">
              <p><strong>货物ID:</strong> {{ registeredGoodID }}</p>
              <p><strong>货物名称:</strong> {{ form.good_name }}</p>
              <p><strong>批次号:</strong> {{ form.batch_number }}</p>
              <p><strong>保质期:</strong> {{ form.expiry_date }}</p>
              <p><strong>区块链交易哈希:</strong> {{ txHash }}</p>
              <p><strong>注册时间:</strong> {{ currentTime }}</p>
            </div>
          </template>
        </el-result>
        
        <div class="dialog-footer">
          <el-button @click="successDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleRegisterAnother">
            继续注册
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import traceApi from '@/api/trace';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const loading = ref(false);
const successDialogVisible = ref(false);
const registeredGoodID = ref('');
const txHash = ref('');
const currentTime = ref('');
const formRef = ref(null);

const form = reactive({
  good_name: '',
  batch_number: '',
  description: '',
  location: '',
  batch_info: '',
  quality_level: '',
  expiry_date: ''
});

const disabledDate = (time) => {
  return time.getTime() < Date.now();
};

const rules = {
  good_name: [
    { required: true, message: '请输入货物名称', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入生产地点', trigger: 'blur' }
  ],
  expiry_date: [
    { required: true, message: '请选择保质期日期', trigger: 'change' }
  ],
  description: [
    { required: false, message: '请输入货物描述', trigger: 'blur' }
  ]
};

const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    loading.value = true;
    try {
      // 提交注册请求
      const response = await traceApi.registerGood({
        good_name: form.good_name,
        batch_number: form.batch_number,
        description: form.description,
        location: form.location,
        batch_info: form.batch_info,
        quality_level: form.quality_level,
        expiry_date: form.expiry_date
      });
      
      // 设置成功对话框数据
      const result = response;
      console.log(response);
      registeredGoodID.value = result.good_id;
      txHash.value = result.blockchain_tx_hash;
      currentTime.value = new Date().toLocaleString();
      successDialogVisible.value = true;
      
      ElMessage.success('货物注册成功');
    } catch (error) {
      console.error('注册货物失败:', error);
      ElMessage.error(error.message || '注册失败，请稍后重试');
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

const handleRegisterAnother = () => {
  successDialogVisible.value = false;
  resetForm();
};
</script>

<style scoped lang="scss">
.register-good-container {
  max-width: 800px;
  margin: 0 auto;
}

.register-card {
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