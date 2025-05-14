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
        <el-form-item label="货物ID" prop="good_id">
          <el-input v-model="form.good_id" placeholder="请输入货物ID">
            <template #prepend>PROD</template>
          </el-input>
          <div class="form-tip">
            建议使用日期+序号作为ID，例如: 20250513001
          </div>
        </el-form-item>
        
        <el-form-item label="货物名称" prop="good_name">
          <el-input v-model="form.good_name" placeholder="请输入货物名称" />
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
              <p><strong>货物ID:</strong> PROD{{ form.good_id }}</p>
              <p><strong>货物名称:</strong> {{ form.good_name }}</p>
              <p><strong>交易哈希:</strong> {{ txHash }}</p>
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
const txHash = ref('');
const currentTime = ref('');
const formRef = ref(null);

const form = reactive({
  good_id: '',
  good_name: '',
  description: ''
});

const rules = {
  good_id: [
    { required: true, message: '请输入货物ID', trigger: 'blur' },
    { pattern: /^\d+$/, message: '货物ID只能包含数字', trigger: 'blur' }
  ],
  good_name: [
    { required: true, message: '请输入货物名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入货物描述', trigger: 'blur' }
  ]
};

const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    loading.value = true;
    try {
      // 拼接完整的货物ID
      const fullGoodId = 'PROD' + form.good_id;
      
      // 提交注册请求
      const result = await traceApi.registerGood({
        good_id: fullGoodId,
        good_name: form.good_name,
        description: form.description
      });
      
      // 设置成功对话框数据
      txHash.value = result.tx_hash;
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