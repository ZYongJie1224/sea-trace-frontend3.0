<template>
  <div class="operator-management">
    <div class="page-header">
      <h2>操作员管理</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon> 添加操作员
      </el-button>
    </div>

    <!-- 搜索区域 -->
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="搜索用户名/姓名/邮箱/电话"
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
    </div>

    <el-table 
      :data="operators" 
      border 
      style="width: 100%" 
      v-loading="loading"
      empty-text="暂无数据"
    >
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="real_name" label="真实姓名" width="120" />
      <el-table-column prop="email" label="邮箱" min-width="160" />
      <el-table-column prop="phone" label="电话" width="120" />
      <el-table-column label="状态" width="80" align="center">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template #default="scope">
          <el-button 
            size="small" 
            type="primary" 
            @click="handleEdit(scope.row)"
            style="margin-right: 5px"
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

    <!-- 添加/编辑操作员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑操作员' : '添加操作员'"
      width="500px"
    >
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        
        <el-form-item label="真实姓名" prop="real_name">
          <el-input v-model="form.real_name" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import companyApi from '@/api/company';

const operators = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const formRef = ref(null);
const isEdit = ref(false);

// 分页和搜索相关
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');

const form = reactive({
  id: null,
  username: '',
  password: '',
  real_name: '',
  email: '',
  phone: ''
});

const rules = {
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
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 获取操作员列表
const getOperators = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value
    };
    
    const response = await companyApi.getOperatorList(params);
    console.log('获取到的操作员列表:', response);
    
    // 处理响应数据
    if (response && response.operators) {
      operators.value = response.operators;
      total.value = response.total || operators.value.length;
    } else if (response && response.data) {
      // 兼容不同的API响应格式
      operators.value = response.data.operators || [];
      total.value = response.data.total || operators.value.length;
    } else {
      operators.value = [];
      total.value = 0;
      console.warn('API返回的操作员列表格式不符合预期');
    }
  } catch (error) {
    console.error('获取操作员列表失败:', error);
    ElMessage.error('获取操作员列表失败: ' + (error.message || '未知错误'));
    operators.value = []; // 清空列表，避免显示过时数据
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  console.log("执行搜索:", searchQuery.value);
  currentPage.value = 1; // 重置到第一页
  getOperators();
};

// 处理页码变更
const handleCurrentChange = (val) => {
  currentPage.value = val;
  getOperators();
};

// 处理每页数量变更
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
  getOperators();
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
  resetForm();
  
  // 填充表单数据
  form.id = row.id;
  form.username = row.username;
  form.real_name = row.real_name || '';
  form.email = row.email || '';
  form.phone = row.phone || '';
  
  dialogVisible.value = true;
};

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除操作员 "${row.real_name || row.username}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await companyApi.deleteOperator(row.id);
        ElMessage.success('删除成功');
        getOperators(); // 重新加载列表
      } catch (error) {
        console.error('删除操作员失败:', error);
        ElMessage.error('删除失败: ' + (error.message || '未知错误'));
      }
    })
    .catch(() => {
      // 用户取消删除操作，无需处理
    });
};

// 处理状态变更
const handleStatusChange = async (row) => {
  try {
    await companyApi.updateOperatorStatus(row.id, row.status);
    
    ElMessage.success('状态更新成功');
    console.log(`操作员 ${row.username} (ID: ${row.id}) 状态已更改为 ${row.status === 1 ? '启用' : '禁用'}`);
    console.log('操作时间:', '2025-05-14 15:18:01');
    console.log('操作人:', 'ZYongJie1224');
  } catch (error) {
    console.error('更新操作员状态失败:', error);
    ElMessage.error('更新状态失败: ' + (error.message || '未知错误'));
    // 回滚状态
    row.status = row.status === 1 ? 0 : 1;
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      if (isEdit.value) {
        // 更新操作员信息
        const updateData = {
          real_name: form.real_name,
          email: form.email,
          phone: form.phone
        };
        
        await companyApi.updateOperator(form.id, updateData);
        ElMessage.success('更新操作员成功');
      } else {
        // 创建新操作员
        await companyApi.createOperator({
          username: form.username,
          password: form.password,
          real_name: form.real_name,
          email: form.email,
          phone: form.phone,
          role: 'operator' // 固定为操作员角色
        });
        ElMessage.success('创建操作员成功');
      }
      
      dialogVisible.value = false;
      getOperators(); // 重新加载列表
    } catch (error) {
      console.error(isEdit.value ? '更新操作员失败:' : '创建操作员失败:', error);
      ElMessage.error((isEdit.value ? '更新' : '创建') + '失败: ' + (error.message || '未知错误'));
    } finally {
      submitLoading.value = false;
    }
  });
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  form.id = null;
  form.username = '';
  form.password = '';
  form.real_name = '';
  form.email = '';
  form.phone = '';
};

onMounted(() => {
  getOperators();
  console.log('操作员管理页面加载完成 - 当前时间:', '2025-05-14 15:18:01');
  console.log('当前用户:', 'ZYongJie1224');
});
</script>

<style scoped lang="scss">
.operator-management {
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

.search-container {
  margin-bottom: 20px;
  
  .search-input {
    width: 300px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 操作按钮样式调整 */
:deep(.el-table .el-button) {
  padding: 5px 12px;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .search-container {
    .search-input {
      width: 100%;
    }
  }
}
</style>