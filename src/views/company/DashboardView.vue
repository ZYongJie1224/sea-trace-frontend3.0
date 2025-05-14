<template>
  <div class="company-dashboard">
    <h2 class="page-title">公司概览</h2>

    <!-- 统计数据卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon operator-icon"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.operatorCount }}</div>
              <div class="stat-label">操作员数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8">
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
      
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon tx-icon"><List /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activityCount }}</div>
              <div class="stat-label">活动记录数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 公司信息卡片 -->
    <el-card class="company-info-card">
      <template #header>
        <div class="card-header">
          <h3>公司信息</h3>
          <el-button type="primary" size="small" @click="showEditCompanyDialog">
            <el-icon><Edit /></el-icon> 编辑信息
          </el-button>
        </div>
      </template>

      <el-descriptions border :column="2">
        <el-descriptions-item label="公司名称">{{ companyInfo.company_name }}</el-descriptions-item>
        <el-descriptions-item label="公司类型">{{ getCompanyTypeName(companyInfo.company_type) }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ companyInfo.contact }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ companyInfo.phone }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ companyInfo.address }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 操作员列表 -->
    <el-card class="operators-card">
      <template #header>
        <div class="card-header">
          <h3>操作员列表</h3>
          <el-button type="primary" size="small" @click="navigateToOperatorManagement">
            <el-icon><Plus /></el-icon> 管理操作员
          </el-button>
        </div>
      </template>
      
      <el-table :data="operators" stripe style="width: 100%">
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="real_name" label="真实姓名" width="150" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="电话" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 最近活动列表 -->
    <el-card class="activity-card">
      <template #header>
        <div class="card-header">
          <h3>最近活动</h3>
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

    <!-- 编辑公司信息对话框 -->
    <el-dialog
      v-model="editCompanyDialog"
      title="编辑公司信息"
      width="500px"
    >
      <el-form 
        ref="companyFormRef"
        :model="editCompanyForm"
        :rules="companyRules"
        label-width="100px"
      >
        <el-form-item label="公司名称">
          <el-input v-model="editCompanyForm.company_name" disabled />
        </el-form-item>
        
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="editCompanyForm.contact" />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="editCompanyForm.phone" />
        </el-form-item>
        
        <el-form-item label="地址" prop="address">
          <el-input v-model="editCompanyForm.address" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editCompanyDialog = false">取消</el-button>
          <el-button type="primary" @click="submitCompanyEdit" :loading="submitLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { User, Goods, List, Edit, Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import companyApi from '@/api/company';

const router = useRouter();
const operators = ref([]);
const activities = ref([]);
const editCompanyDialog = ref(false);
const submitLoading = ref(false);
const companyFormRef = ref(null);

const stats = reactive({
  operatorCount: 0,
  goodCount: 0,
  activityCount: 0
});

const companyInfo = reactive({
  id: 0,
  company_name: '',
  company_type: 0,
  contact: '',
  phone: '',
  address: ''
});

const editCompanyForm = reactive({
  company_name: '',
  contact: '',
  phone: '',
  address: ''
});

const companyRules = {
  contact: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ]
};

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

// 获取公司信息
const getCompanyInfo = async () => {
  try {
    const data = await companyApi.getCompanyInfo();
    console.log('公司信息数据:', data);
    
    // 更新公司信息
    if (data.company) {
      companyInfo.id = data.company.id || 0;
      companyInfo.company_name = data.company.company_name || '';
      companyInfo.company_type = data.company.company_type || 0;
      companyInfo.contact = data.company.contact || '';
      companyInfo.phone = data.company.phone || '';
      companyInfo.address = data.company.address || '';
    }
    
    // 获取操作员列表
    if (data.operators && Array.isArray(data.operators)) {
      operators.value = data.operators;
    } else {
      operators.value = [];
    }
    
    // 更新操作员数量
    stats.operatorCount = data.operator_count || (operators.value ? operators.value.length : 0);
    
    // 更新其他统计数据
    stats.goodCount = data.good_count || 0;
    stats.activityCount = data.activity_count || 0;
    
    // 处理活动数据
    if (data.recent_activities && data.recent_activities.length) {
      activities.value = data.recent_activities;
    } else {
      // 示例活动数据
      activities.value = [
        {
          time: '2025-05-14 07:05:31',
          type: '注册',
          good_id: 'GOOD00125',
          description: '生产商注册了一批新货物',
          operator: 'ZYongJie1224'
        },
        {
          time: '2025-05-14 01:38:15',
          type: '运输',
          good_id: 'GOOD00124',
          description: '货物已从生产工厂装运',
          operator: '操作员1'
        },
        {
          time: '2025-05-14 00:12:52',
          type: '验货',
          good_id: 'GOOD00123',
          description: '验货商已完成货物质量检验',
          operator: '操作员2'
        }
      ];
    }
    
  } catch (error) {
    console.error('获取公司信息失败:', error);
    ElMessage.error('获取公司信息失败');
  }
};

// 显示编辑公司信息对话框
const showEditCompanyDialog = () => {
  editCompanyForm.company_name = companyInfo.company_name;
  editCompanyForm.contact = companyInfo.contact;
  editCompanyForm.phone = companyInfo.phone;
  editCompanyForm.address = companyInfo.address;
  editCompanyDialog.value = true;
};

// 提交编辑公司信息
const submitCompanyEdit = async () => {
  if (!companyFormRef.value) return;
  
  await companyFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    submitLoading.value = true;
    try {
      await companyApi.updateCompanyInfo({
        contact: editCompanyForm.contact,
        phone: editCompanyForm.phone,
        address: editCompanyForm.address
      });
      
      // 更新本地数据
      companyInfo.contact = editCompanyForm.contact;
      companyInfo.phone = editCompanyForm.phone;
      companyInfo.address = editCompanyForm.address;
      
      editCompanyDialog.value = false;
      ElMessage.success('公司信息更新成功');
      
      console.log('公司信息已更新 - 当前时间:', '2025-05-14 07:05:31');
      console.log('当前用户:', 'ZYongJie1224');
    } catch (error) {
      console.error('更新公司信息失败:', error);
      ElMessage.error(error.message || '更新失败');
    } finally {
      submitLoading.value = false;
    }
  });
};

// 跳转到操作员管理页面
const navigateToOperatorManagement = () => {
  router.push('/company/operators');
};

onMounted(() => {
  getCompanyInfo();
  console.log('公司仪表盘页面加载完成 - 当前时间:', '2025-05-14 07:05:31');
  console.log('当前用户:', 'ZYongJie1224');
});
</script>

<style scoped lang="scss">
.company-dashboard {
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
    
    &.operator-icon {
      color: #409EFF;
    }
    
    &.good-icon {
      color: #67C23A;
    }
    
    &.tx-icon {
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

.company-info-card, .operators-card, .activity-card {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>