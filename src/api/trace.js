import api from './index';

export default {
  // 获取货物溯源信息
  getGoodTrace(goodId) {
    return api.get(`/api/chain/trace/${goodId}`);
  },
  
  // 注册货物 (生产商)
  registerGood(data) {
    return api.post('/api/operator/reggood', data);
  },
  
  // 运输货物 (运输商)
  shipGood(data) {
    return api.post('/api/operator/shipgood', data);
  },
  
  // 验货 (验货商)
  inspectGood(data) {
    return api.post('/api/operator/inspectgood', data);
  },
  
  // 交付货物 (经销商)
  deliverGood(data) {
    return api.post('/api/operator/delivergood', data);
  },
  
  // 获取区块链信息
  getChainInfo() {
    return api.get('/api/chain/sysinfo');
  },
  // 获取链节点信息
  getNodeInfo() {
return api.get('/api/chain/nodes');
}
};