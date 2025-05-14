import api from './index';

/**
 * 公司管理员相关API
 * 用于公司管理员对自己公司进行管理的接口
 */
const companyAdminApi = {
   // 获取公司列表
  /**
   * 获取公司列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量 
   * @param {string} params.search - 搜索关键词
   * @param {number} params.type - 公司类型
   * @returns {Promise} - 返回公司列表数据
   */
  getCompanyList(params) {
    return api.get('/api/su/company/list', { params });
  },
  /**
   * 获取公司信息
   * @returns {Promise} - 返回公司详细信息
   */
  getCompanyInfo() {
    return api.get('/api/admin/company/info');
  },
  
  /**
   * 更新公司信息
   * @param {Object} data - 更新的公司数据
   * @param {string} data.company_name - 公司名称
   * @param {string} data.contact - 联系人
   * @param {string} data.phone - 联系电话
   * @returns {Promise} - 返回更新结果
   */
  updateCompanyInfo(data) {
    return api.put('/api/admin/company/info', data);
  },
  
  /**
   * 获取操作员列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量 
   * @param {string} params.search - 搜索关键词
   * @returns {Promise} - 返回操作员列表数据
   */
  getOperatorList(params) {
    return api.get('/api/admin/company/operators', { params });
  },
  
  /**
   * 获取公司操作员列表 - 新方法名称，与后端保持一致
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @param {string} params.search - 搜索关键词
   * @returns {Promise} - 返回操作员列表
   */
  getOperators(params) {
    return api.get('/api/admin/company/operators', { params });
  },
  
  /**
   * 创建操作员
   * @param {Object} data - 操作员数据
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   * @param {string} data.real_name - 真实姓名
   * @param {string} data.email - 邮箱
   * @param {string} data.phone - 手机号
   * @returns {Promise} - 返回创建结果
   */
  createOperator(data) {
    return api.post('/api/admin/company/operator/create', data);
  },
    // 创建公司管理员
  createCompanyAdmin(data) {
    return api.post('/api/su/company/admin/create', data);
  },
  /**
   * 删除操作员
   * @param {number|string} id - 操作员ID
   * @returns {Promise} - 返回删除结果
   */
  deleteOperator(id) {
    return api.delete(`/api/admin/company/operator/delete/${id}`);
  },

  /**
   * 更新操作员状态
   * @param {number|string} id - 操作员ID
   * @param {number} status - 状态值(0:禁用, 1:启用)
   * @returns {Promise} - 返回操作结果
   */
  updateOperatorStatus(id, status) {
    return api.put(`/api/admin/company/operator/status/${id}`, { status });
  },
  
  /**
   * 更新操作员信息
   * @param {number|string} id - 操作员ID
   * @param {Object} data - 更新的操作员数据
   * @returns {Promise} - 返回更新结果
   */
  updateOperatorInfo(id, data) {
    return api.put(`/api/admin/company/operator/info/${id}`, data);
  },
  
  /**
   * 获取公司货物列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @param {string} params.search - 搜索关键词
   * @returns {Promise} - 返回货物列表
   */
  getGoodsList(params) {
    return api.get('/api/admin/company/goods', { params });
  },
  
  /**
   * 获取公司总览数据
   * @returns {Promise} - 返回公司总览数据
   */
  getDashboardData() {
    return api.get('/api/admin/company/dashboard');
  },
  
  /**
   * 重置操作员密码
   * @param {number|string} id - 操作员ID
   * @returns {Promise} - 返回重置结果，包含新密码
   */
  resetOperatorPassword(id) {
    return api.put(`/api/admin/company/operator/reset-password/${id}`);
  },
  
  /**
   * 获取公司交易记录
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @param {string} params.type - 交易类型筛选
   * @returns {Promise} - 返回交易记录列表
   */
  getTransactions(params) {
    return api.get('/api/admin/company/transactions', { params });
  }
};

export default companyAdminApi;