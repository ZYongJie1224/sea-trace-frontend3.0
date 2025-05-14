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
          <el-input v-model="form.good_id" placeholder="请输入货物ID">
            <template #prepend>PROD</template>
          </el-input>
          <div class="form-tip">
            输入待运输货物的ID编号
          </div>
        </el-form-item>
        
        <el-form-item label="运输信息" prop="transport_info">
          <el-input 
            v-model="form.transport_info" 
            type="textarea" 
            rows="4"
            placeholder="请输入运输详细信息（路线、方式、温度等）" 
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">提交登记</el-button>
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
          sub-title="货物运输信息已上链，可供后续环节查询"
        >
          <template #extra>
            <div class="result-info">
              <p><strong>货物ID:</strong> PROD{{ form.good_id }}</p>
              <p><strong>交易哈希:</strong> {{ txHash }}</p>
              <p><strong>登记时间:</strong> {{ currentTime }}</p>
            </div>
          </template>
        </el-result>
        
        <div class="dialog-footer">
          <el-button @click="successDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleShipAnother">
            继续登记
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

const loading = ref(false);
const successDialogVisible = ref(false);
const txHash = ref('');
const currentTime = ref('');
const formRef = ref(null);

const form = reactive({
  good_id: '',
  transport_info: ''
});

const rules = {
  good_id: [
    { required: true, message: '请输入货物ID', trigger: 'blur' },
    { pattern: /^\d+$/, message: '货物ID只能包含数字', trigger: 'blur' }
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
      // 拼接完整的货物ID
      const fullGoodId = 'PROD' + form.good_id;
      
      // 提交运输登记请求
      const result = await traceApi.shipGood({
        good_id: fullGoodId,
        transport_info: form.transport_info
      });
      
      // 设置成功对话框数据
      txHash.value = result.tx_hash;
      currentTime.value = new Date().toLocaleString();
      successDialogVisible.value = true;
      
      ElMessage.success('货物运输登记成功');
    } catch (error) {
      console.error('运输登记失败:', error);
      ElMessage.error(error.message || '登记失败，请稍后重试');
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