<template>
  <div class="deliver-good-container">
    <el-card class="deliver-card">
      <template #header>
        <div class="card-header">
          <h2>货物交付登记</h2>
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
            输入待交付货物的完整ID，该货物必须完成验货
          </div>
        </el-form-item>
        
        <el-form-item label="交付地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入交付地点" />
        </el-form-item>
        
        <el-form-item label="接收人" prop="recipient_name">
          <el-input v-model="form.recipient_name" placeholder="请输入接收人姓名" />
        </el-form-item>
        
        <el-form-item label="接收人联系方式" prop="recipient_contact">
          <el-input v-model="form.recipient_contact" placeholder="请输入接收人联系方式" />
        </el-form-item>
        
        <el-form-item label="交付信息" prop="delivery_info">
          <el-input 
            v-model="form.delivery_info" 
            type="textarea" 
            rows="4"
            placeholder="请输入交付详细信息（交付时间、交付状态、包装情况等）" 
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
          <el-button type="primary" @click="submitForm" :loading="loading">提交交付</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-dialog
      v-model="successDialogVisible"
      title="交付登记成功"
      width="500px"
    >
      <div class="success-content">
        <el-result
          icon="success"
          title="货物交付登记成功"
          sub-title="货物交付信息已上链，标志着该货物溯源流程全部完成"
        >
          <template #extra>
            <div class="result-info">
              <p><strong>货物ID:</strong> {{ form.good_id }}</p>
              <p><strong>交付地点:</strong> {{ form.location }}</p>
              <p><strong>接收人:</strong> {{ form.recipient_name }}</p>
              <p><strong>接收人联系方式:</strong> {{ form.recipient_contact }}</p>
              <p><strong>区块链交易哈希:</strong> {{ txHash }}</p>
              <p><strong>登记时间:</strong> {{ currentTime }}</p>
              <p><strong>登记人员:</strong> {{ currentUser }}</p>
            </div>
          </template>
        </el-result>
        
        <div class="dialog-footer">
          <el-button @click="successDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleDeliverAnother">
            继续登记
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
const currentTime = ref('2025-05-15 08:36:52'); // 使用提供的当前时间
const currentUser = ref('ZYongJie1224'); // 使用提供的当前用户
const formRef = ref(null);

const form = reactive({
  good_id: '',
  location: '',
  recipient_name: '',
  recipient_contact: '',
  delivery_info: '',
  notes: ''
});

const rules = {
  good_id: [
    { required: true, message: '请输入货物ID', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入交付地点', trigger: 'blur' }
  ],
  recipient_name: [
    { required: true, message: '请输入接收人姓名', trigger: 'blur' }
  ],
  recipient_contact: [
    { required: true, message: '请输入接收人联系方式', trigger: 'blur' }
  ],
  delivery_info: [
    { required: true, message: '请输入交付信息', trigger: 'blur' }
  ]
};

const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    loading.value = true;
    try {
      // 构建提交数据，字段名与后端期望的一致
      const deliverData = {
        good_id: form.good_id,
        location: form.location,
        recipient_name: form.recipient_name,
        recipient_contact: form.recipient_contact,
        delivery_info: form.delivery_info,
        notes: form.notes || ''
      };
      
      // 提交交付登记请求（根据您的API封装）
      const response = await traceApi.deliverGood(deliverData);
      
      // 设置成功对话框数据
      const result = response;
      txHash.value = result.blockchain_tx_hash || result.tx_hash || '';
      successDialogVisible.value = true;
      
      ElMessage.success('货物交付登记成功');
    } catch (error) {
      console.error('交付登记失败:', error);
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

const handleDeliverAnother = () => {
  successDialogVisible.value = false;
  resetForm();
};

const viewTrace = () => {
  router.push(`/trace?id=${form.good_id}`);
  successDialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.deliver-good-container {
  max-width: 800px;
  margin: 0 auto;
}

.deliver-card {
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