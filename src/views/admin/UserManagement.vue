<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon> 添加用户
      </el-button>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="filter-container">
      <el-input
        v-model="searchQuery"
        placeholder="搜索用户名/姓名"
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
      
      <el-radio-group v-model="selectedRole" @change="handleRoleChange" class="role-filter">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button value="super_admin">超级管理员</el-radio-button>
        <el-radio-button value="company_admin">公司管理员</el-radio-button>
        <el-radio-button value="operator">操作员</el-radio-button>
      </el-radio-group>
    </div>

    <el-table 
      :data="users" 
      border 
      style="width: 100%" 
      v-loading="loading"
      empty-text="暂无数据"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="real_name" label="真实姓名" width="150" />
      <el-table-column label="角色" width="120">
        <template #default="scope">
          <el-tag :type="getRoleTag(scope.row.role)">
            {{ getRoleName(scope.row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="company_name" label="所属公司" min-width="180" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="phone" label="电话" width="150" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
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
            @click="handleEdit(scope.row)"
            :disabled="!canManageUser(scope.row)"
          >
            编辑
          </el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 1 ? 'warning' : 'success'"
            @click="handleToggleStatus(scope.row)"
            :disabled="!canManageUser(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="handleDelete(scope.row)"
            :disabled="scope.row.role === 'super_admin'"
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

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
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
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="super_admin" v-if="currentUserRole === 'super_admin'" />
            <el-option label="公司管理员" value="company_admin" />
            <el-option label="操作员" value="operator" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="所属公司" prop="company_id" v-if="form.role !== 'super_admin'">
          <el-select v-model="form.company_id" placeholder="请选择公司" style="width: 100%">
            <el-option 
              v-for="company in companies" 
              :key="company.id" 
              :label="company.company_name" 
              :value="company.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
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
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import userApi from '@/api/user';
import adminApi from '@/api/admin';

// 替换Vuex依赖，改用本地状态
const currentUserRole = ref('super_admin'); // 假设当前用户为超级管理员，实际应从API或localStorage获取

const users = ref([]);
const companies = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref(null);

// 分页和筛选相关
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const selectedRole = ref('');

// 用户表单
const form = reactive({
  id: null,
  username: '',
  password: '',
  real_name: '',
  role: '',
  company_id: null,
  email: '',
  phone: '',
  status: 1
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  real_name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  company_id: [
    { required: true, message: '请选择公司', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
};

// 监听角色变化，如果是超级管理员则清空公司ID
watch(() => form.role, (newRole) => {
  if (newRole === 'super_admin') {
    form.company_id = null;
  }
});

// 获取角色标签样式
const getRoleTag = (role) => {
  const roleMap = {
    'super_admin': 'danger',
    'company_admin': 'warning',
    'operator': 'success'
  };
  return roleMap[role] || 'info';
};

// 获取角色名称
const getRoleName = (role) => {
  const roleMap = {
    'super_admin': '超级管理员',
    'company_admin': '公司管理员',
    'operator': '操作员'
  };
  return roleMap[role] || '未知';
};

// 检查当前用户是否可以管理目标用户
const canManageUser = (user) => {
  // 如果当前用户是超级管理员，可以管理任何用户
  if (currentUserRole.value === 'super_admin') {
    return true;
  }
  
  // 非超级管理员不能管理超级管理员
  if (user.role === 'super_admin') {
    return false;
  }
  
  // 其他情况可以管理
  return true;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 获取用户列表
const getUsers = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value,
      role: selectedRole.value
    };
    
    // 实际根据项目API调整
    const data = await userApi.getUserList(params);
    users.value = data.users || [];
    total.value = data.total || 0;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取公司列表
const getCompanies = async () => {
  try {
    // 修改这里使用正确的API函数
    const data = await adminApi.getCompanyList({ page_size: 100 });
    companies.value = data.companies || [];
  } catch (error) {
    console.error('获取公司列表失败:', error);
  }
};

// 获取当前用户信息
const getCurrentUserInfo = async () => {
  try {
    const data = await userApi.getCurrentUser();
    if (data && data.role) {
      currentUserRole.value = data.role;
    }
  } catch (error) {
    console.error('获取当前用户信息失败:', error);
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
  resetForm();
  
  form.id = row.id;
  form.username = row.username;
  form.real_name = row.real_name;
  form.role = row.role;
  form.company_id = row.company_id;
  form.email = row.email;
  form.phone = row.phone;
  form.status = row.status;
  
  dialogVisible.value = true;
};

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.username}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await userApi.deleteUser(row.id);
        ElMessage.success('删除成功');
        getUsers();
      } catch (error) {
        console.error('删除用户失败:', error);
        ElMessage.error(error.message || '删除失败');
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 处理启用/禁用
const handleToggleStatus = (row) => {
  const action = row.status === 1 ? '禁用' : '启用';
  ElMessageBox.confirm(
    `确定要${action}用户 "${row.username}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: row.status === 1 ? 'warning' : 'info'
    }
  )
    .then(async () => {
      try {
        const newStatus = row.status === 1 ? 0 : 1;
        await userApi.updateUserStatus(row.id, newStatus);
        row.status = newStatus; // 更新本地状态
        ElMessage.success(`${action}成功`);
      } catch (error) {
        console.error(`${action}用户失败:`, error);
        ElMessage.error(error.message || `${action}失败`);
      }
    })
    .catch(() => {
      // 取消操作
    });
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  getUsers();
};

// 处理角色筛选变更
const handleRoleChange = () => {
  currentPage.value = 1; // 重置到第一页
  getUsers();
};

// 处理页码变更
const handleCurrentChange = (val) => {
  currentPage.value = val;
  getUsers();
};

// 处理每页数量变更
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
  getUsers();
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    // 超级管理员不需要公司ID
    if (form.role === 'super_admin') {
      form.company_id = null;
    }

    submitLoading.value = true;
    try {
      if (isEdit.value) {
        // 更新用户，移除空密码字段
        const updateData = { ...form };
        if (!updateData.password) {
          delete updateData.password;
        }
        await userApi.updateUserInfo(form.id, updateData);
        ElMessage.success('更新成功');
      } else {
        // 创建用户
        await userApi.createUser(form);
        ElMessage.success('创建成功');
      }
      dialogVisible.value = false;
      getUsers();
    } catch (error) {
      console.error(isEdit.value ? '更新用户失败:' : '创建用户失败:', error);
      ElMessage.error(error.message || (isEdit.value ? '更新失败' : '创建失败'));
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
  form.role = '';
  form.company_id = null;
  form.email = '';
  form.phone = '';
  form.status = 1;
};

onMounted(() => {
  getCurrentUserInfo();
  getUsers();
  getCompanies();
  console.log("页面加载时间:", "2025-05-14 13:19:04");
});
</script>

<style scoped lang="scss">
.user-management {
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

  .role-filter {
    margin-right: 0;
  }
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
    
    .role-filter {
      width: 100%;
      display: flex;
      overflow-x: auto;
    }
  }
}
</style>