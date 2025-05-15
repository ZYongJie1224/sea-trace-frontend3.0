import api from './index';

const traceApi = {
  // ============= 原有API接口 =============
  
  // 获取货物溯源信息（原有路径参数方式）
  getGoodTrace(data) {
    return api.get(`/api/public/trace`, { params: data });
  },
  
  // 注册货物 - 原有API
  registerGoodLegacy(data) {
    return api.post('/api/operator/reggood', data);
  },
  
  // 运输货物 - 原有API
  shipGoodLegacy(data) {
    return api.post('/api/operator/shipgood', data);
  },
  
  // 验货 - 原有API
  inspectGoodLegacy(data) {
    return api.post('/api/operator/inspectgood', data);
  },
  
  // 交付货物 - 原有API
  deliverGoodLegacy(data) {
    return api.post('/api/operator/delivergood', data);
  },
  
  // 获取区块链信息
  getChainInfo() {
    return api.get('/api/chain/sysinfo');
  },
  
  // 获取链节点信息
  getNodeInfo() {
    return api.get('/api/chain/nodes');
  },
  
  // ============= 新增API接口 =============
  
  /**
   * 注册新货物（新API）
   * @param {Object} data 货物数据
   * @param {string} data.good_name - 货物名称（必填）
   * @param {string} data.batch_number - 批次号
   * @param {string} data.description - 货物描述
   * @param {string} data.location - 生产地点（必填）
   * @param {string} data.batch_info - 批次信息
   * @param {string} data.quality_level - 质量等级
   * @param {string|Date} data.expiry_date - 保质期（必填）
   * @returns {Promise<Object>}
   */
  registerGood(data) {
    return api.post('/api/operator/goods/register', data);
  },
  
  /**
   * 运输货物（新API）
   * @param {Object} data 运输信息
   * @param {string} data.good_id - 货物ID（必填）
   * @param {string} data.start_location - 起始地点（必填）
   * @param {string} data.end_location - 目的地点（必填）
   * @param {string} data.transport_info - 运输信息（必填）
   * @param {string|Date} data.end_time - 预计到达时间（必填）
   * @param {string} data.tracking_number - 运单号
   * @returns {Promise<Object>}
   */
  shipGood(data) {
    return api.post('/api/operator/goods/ship', data);
  },
  
  /**
   * 验货（新API）
   * @param {Object} data 验货信息
   * @param {string} data.good_id - 货物ID（必填）
   * @param {string} data.inspection_info - 验货信息（必填）
   * @param {number} data.quality_score - 质量评分（必填，0-100）
   * @param {boolean} data.pass_status - 是否通过验证
   * @param {string} data.location - 验货地点（必填）
   * @param {string} data.notes - 备注信息
   * @returns {Promise<Object>}
   */
  inspectGood(data) {
    return api.post('/api/operator/goods/inspect', data);
  },
  
  /**
   * 交付货物（新API）
   * @param {Object} data 交付信息
   * @param {string} data.good_id - 货物ID（必填）
   * @param {string} data.delivery_info - 交付信息（必填）
   * @param {string} data.recipient_name - 接收人名称（必填）
   * @param {string} data.recipient_contact - 接收人联系方式（必填）
   * @param {string} data.location - 交付地点（必填）
   * @param {string} data.notes - 备注信息
   * @returns {Promise<Object>}
   */
  deliverGood(data) {
    return api.post('/api/operator/goods/deliver', data);
  },
  
  /**
   * 获取货物溯源信息（新API - 使用查询参数）
   * @param {string} goodId 货物ID
   * @returns {Promise<Object>}
   */
  getGoodsTrace(goodId) {
    return api.get('/api/operator/goods/trace', {
      params: { good_id: goodId }
    });
  },
  
  /**
   * 获取货物列表
   * @param {Object} params 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.page_size=10] - 每页条数
   * @param {string} [params.search] - 搜索关键词
   * @param {number} [params.status] - 货物状态过滤
   * @returns {Promise<Object>}
   */
  getGoodsList(params = {}) {
    return api.get('/api/operator/goods/list', { params });
  },
  
  /**
   * 公共溯源查询（无需登录）
   * @param {string} goodId 货物ID
   * @returns {Promise<Object>}
   */
  publicTrace(goodId) {
    return api.get('/api/public/trace', {
      params: { good_id: goodId }
    });
  }
};

export default traceApi;