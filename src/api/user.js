import api from './index';

/**
 * 用户管理相关API
 */
const userApi = {
  /**
   * 获取用户列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @param {string} params.search - 搜索关键词
   * @param {string} params.role - 角色筛选
   * @returns {Promise} - 返回用户列表数据
   */
  getUserList(params) {
    return api.get('/api/admin/user/list', { params });
  },
  
  /**
   * 获取用户详情
   * @param {number|string} id - 用户ID
   * @returns {Promise} - 返回用户详情
   */
  getUserById(id) {
    return api.get(`/api/users/${id}`);
  },
  
  /**
   * 创建用户
   * @param {Object} data - 用户数据
   * @returns {Promise} - 返回创建结果
   */
  createUser(data) {
    return api.post('/api/admin/user/create', data);
  },
  
  /**
   * 更新用户信息
   * @param {number|string} id - 用户ID
   * @param {Object} data - 更新的用户数据
   * @returns {Promise} - 返回更新结果
   */
  updateUserInfo(id, data) {
    return api.put(`/api/admin/user/update/:id/${id}`, data);
  },
  
  /**
   * 删除用户
   * @param {number|string} id - 用户ID
   * @returns {Promise} - 返回删除结果
   */
  deleteUser(id) {
    return api.delete(`/api/admin/user/delete/${id}`);
  },
  
  /**
   * 修改用户状态
   * @param {number|string} id - 用户ID
   * @param {number} status - 状态值(0:禁用, 1:启用)
   * @returns {Promise} - 返回操作结果
   */
  updateUserStatus(id, status) {
    return api.put(`/api/users/${id}/status`, { status });
  },
  
  /**
   * 修改密码
   * @param {Object} data - 密码数据
   * @param {string} data.old_password - 旧密码
   * @param {string} data.new_password - 新密码
   * @returns {Promise} - 返回操作结果
   */
  changePassword(data) {
    return api.put('/api/users/password', data);
  },
  
  /**
   * 获取当前用户信息
   * @returns {Promise} - 返回当前用户信息
   */
  getCurrentUser() {
    return api.get('/api/auth/myinfo');
  },
  
  /**
   * 重置用户密码
   * @param {number|string} id - 用户ID
   * @returns {Promise} - 返回操作结果
   */
  resetPassword(id) {
    return api.put(`/api/users/${id}/reset-password`);
  }
};

export default userApi;