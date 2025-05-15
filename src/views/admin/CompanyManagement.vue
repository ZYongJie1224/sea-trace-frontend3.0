<template>
  <div class="company-management">
    <div class="page-header">
      <h2>公司管理</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon> 添加公司
      </el-button>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="filter-container">
      <el-input
        v-model="searchQuery"
        placeholder="搜索公司名称"
        class="search-input"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
      
      <el-radio-group v-model="selectedType" @change="handleTypeChange" class="type-filter">
        <el-radio-button :value="-1">全部</el-radio-button>
        <el-radio-button :value="0">生产商</el-radio-button>
        <el-radio-button :value="1">运输商</el-radio-button>
        <el-radio-button :value="2">验货商</el-radio-button>
        <el-radio-button :value="3">经销商</el-radio-button>
      </el-radio-group>
    </div>

    <el-table 
      :data="companies" 
      border 
      style="width: 100%" 
      v-loading="loading"
      empty-text="暂无数据"
      fit
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="company_name" label="公司名称" width="180" />
      <el-table-column label="公司类型" width="120">
        <template #default="scope">
          <el-tag :type="getCompanyTypeTag(scope.row.company_type)">
            {{ getCompanyTypeName(scope.row.company_type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="contact" label="联系人" width="120" />
      <el-table-column prop="phone" label="电话" width="150" />
      <el-table-column label="区块链地址" min-width="220">
        <template #default="scope">
          <el-tooltip :content="scope.row.address" placement="top" :disabled="!scope.row.blockchain_address">
            <span class="blockchain-address">{{ formatAddress(scope.row.address) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button 
            size="small" 
            type="primary" 
            @click="handleAddAdmin(scope.row)"
          >
            管理员
          </el-button>
          <el-button 
            size="small" 
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
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

    <!-- 添加/编辑公司对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑公司' : '添加公司'"
      width="500px"
    >
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="公司名称" prop="company_name">
          <el-input v-model="form.company_name" />
        </el-form-item>
        <el-form-item label="公司类型" prop="company_type">
          <el-select v-model="form.company_type" placeholder="请选择公司类型" style="width: 100%">
            <el-option label="生产商" :value="0" />
            <el-option label="运输商" :value="1" />
            <el-option label="验货商" :value="2" />
            <el-option label="经销商" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="form.contact" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加管理员对话框 -->
    <el-dialog
      v-model="adminDialogVisible"
      title="添加公司管理员"
      width="500px"
    >
      <el-form 
        ref="adminFormRef"
        :model="adminForm"
        :rules="adminRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="adminForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="adminForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="real_name">
          <el-input v-model="adminForm.real_name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="adminForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="adminForm.phone" />
        </el-form-item>
        <el-form-item label="所属公司">
          <el-input v-model="selectedCompany.company_name" disabled />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="adminDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdminForm" :loading="submitAdminLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import companyApi from '@/api/company';
import userApi from '@/api/user';
import admin from '../../api/admin';

const companies = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const adminDialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const submitAdminLoading = ref(false);
const formRef = ref(null);
const adminFormRef = ref(null);
const selectedCompany = ref({});

// 分页和筛选相关
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const selectedType = ref(-1);

// 公司表单
const form = reactive({
  id: null,
  company_name: '',
  company_type: '',
  contact: '',
  phone: ''
});

// 管理员表单
const adminForm = reactive({
  username: '',
  password: '',
  real_name: '',
  email: '',
  phone: '',
  company_id: null
});

// 表单验证规则
const rules = {
  company_name: [
    { required: true, message: '请输入公司名称', trigger: 'blur' }
  ],
  company_type: [
    { required: true, message: '请选择公司类型', trigger: 'change' }
  ],
  contact: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
};

// 管理员表单验证规则
const adminRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  real_name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
};

// 获取公司类型标签样式
const getCompanyTypeTag = (type) => {
  const typeMap = {
    0: 'success',
    1: 'warning',
    2: 'info',
    3: 'danger'
  };
  return typeMap[type] || '';
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

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 格式化区块链地址
const formatAddress = (address) => {
  if (!address) return '未注册';
  return address;
};

// 获取公司列表
const getCompanies = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value,
      type: selectedType.value >= 0 ? selectedType.value : undefined
    };
    
    const data = await companyApi.getCompanyList(params);
    companies.value = data.companies || [];
    total.value = data.total || 0;
  } catch (error) {
    console.error('获取公司列表失败:', error);
    ElMessage.error('获取公司列表失败');
  } finally {
    loading.value = false;
  }
};

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 处理编辑
const handleEdit = (row) => {
  isEdit.value = true;
  form.id = row.id;
  form.company_name = row.company_name;
  form.company_type = row.company_type;
  form.contact = row.contact;
  form.phone = row.phone;
  dialogVisible.value = true;
};

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除公司 "${row.company_name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await admin.deleteCompany(row.id);
        ElMessage.success('删除成功');
        getCompanies();
      } catch (error) {
        console.error('删除公司失败:', error);
        ElMessage.error(error.message || '删除失败');
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 处理添加管理员
const handleAddAdmin = (row) => {
  selectedCompany.value = row;
  adminForm.company_id = row.id;
  resetAdminForm();
  adminDialogVisible.value = true;
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  getCompanies();
};

// 处理公司类型筛选变更
const handleTypeChange = () => {
  currentPage.value = 1; // 重置到第一页
  getCompanies();
};

// 处理页码变更
const handleCurrentChange = (val) => {
  currentPage.value = val;
  getCompanies();
};

// 处理每页数量变更
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
  getCompanies();
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      if (isEdit.value) {
        // 更新公司
        await companyApi.updateCompany(form.id, form);
        ElMessage.success('更新成功');
      } else {
        // 创建公司
        await companyApi.createCompany(form);
        ElMessage.success('创建成功');
      }
      dialogVisible.value = false;
      getCompanies();
    } catch (error) {
      console.error(isEdit.value ? '更新公司失败:' : '创建公司失败:', error);
      ElMessage.error(error.message || (isEdit.value ? '更新失败' : '创建失败'));
    } finally {
      submitLoading.value = false;
    }
  });
};

// 提交管理员表单
const submitAdminForm = async () => {
  if (!adminFormRef.value) return;

  await adminFormRef.value.validate(async (valid) => {
    if (!valid) return;

    submitAdminLoading.value = true;
    try {
      // 通过 companyApi 创建公司管理员
      await companyApi.createCompanyAdmin(adminForm);
      ElMessage.success('管理员创建成功');
      adminDialogVisible.value = false;
    } catch (error) {
      console.error('创建管理员失败:', error);
      ElMessage.error(error.message || '创建失败');
    } finally {
      submitAdminLoading.value = false;
    }
  });
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  form.id = null;
  form.company_name = '';
  form.company_type = '';
  form.contact = '';
  form.phone = '';
};

// 重置管理员表单
const resetAdminForm = () => {
  if (adminFormRef.value) {
    adminFormRef.value.resetFields();
  }
  adminForm.username = '';
  adminForm.password = '';
  adminForm.real_name = '';
  adminForm.email = '';
  adminForm.phone = '';
};

onMounted(() => {
  getCompanies();
  console.log("页面加载时间:", "2025-05-14 13:12:01");
});
</script>

<style scoped lang="scss">
.company-management {
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

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;

  .search-input {
    width: 300px;
  }

  .type-filter {
    margin-right: 0;
  }
}

.blockchain-address {
  font-family: monospace;
  color: #606266;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    align-items: flex-start;
    
    .search-input {
      width: 100%;
    }
    
    .type-filter {
      width: 100%;
      display: flex;
      overflow-x: auto;
    }
  }
}
</style>