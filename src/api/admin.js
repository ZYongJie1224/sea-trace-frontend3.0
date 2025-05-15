import api from './index';

export default {
  // 获取Dashboard统计数据
  getDashboardStats() {
    return api.get('/api/admin/stats');
  },
  
 

  
  // 更新公司信息
  updateCompany(id, data) {
    return api.put(`/api/su/company/update/${id}`, data);
  },
  
  // 删除公司
  deleteCompany(id) {
    return api.delete(`/api/su/company/delete/${id}`);
  },
  

};