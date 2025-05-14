import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AppLayout from '../components/layout/AppLayout.vue';

// 公共页面
import LoginView from '../views/auth/LoginView.vue';
import TraceView from '../views/public/TraceView.vue';

// 简单的404页面
const NotFound = { 
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
      <h1>404</h1>
      <p>页面未找到</p>
      <button @click="$router.push('/')">返回首页</button>
    </div>
  `
};

// 懒加载的视图
// 管理员视图
const AdminDashboard = () => import('../views/admin/DashboardView.vue');
const CompanyManagement = () => import('../views/admin/CompanyManagement.vue');
const UserManagement = () => import('../views/admin/UserManagement.vue');

// 公司管理员视图
const CompanyDashboard = () => import('../views/company/DashboardView.vue');
const OperatorManagement = () => import('../views/company/OperatorManagement.vue');
const GoodsManagement = () => import('../views/company/GoodsManagement.vue');

// 操作员视图
const OperatorDashboard = () => import('../views/operator/DashboardView.vue');
const RegisterGood = () => import('../views/operator/RegisterGoodView.vue');
const ShipGood = () => import('../views/operator/ShipGoodView.vue');
const InspectGood = () => import('../views/operator/InspectGoodView.vue');
const DeliverGood = () => import('../views/operator/DeliverGoodView.vue');

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/trace',
    name: 'trace',
    component: TraceView,
    meta: { requiresAuth: false, title: '溯源查询' }
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      // 超级管理员路由
      {
        path: 'admin/dashboard',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, role: 'super_admin', title: '系统概览' }
      },
      {
        path: 'admin/company',
        name: 'company-management',
        component: CompanyManagement,
        meta: { requiresAuth: true, role: 'super_admin', title: '公司管理' }
      },
      {
        path: 'admin/user',
        name: 'user-management',
        component: UserManagement,
        meta: { requiresAuth: true, role: 'super_admin', title: '用户管理' }
      },
      
      // 公司管理员路由
      {
        path: 'company/dashboard',
        name: 'company-dashboard',
        component: CompanyDashboard,
        meta: { requiresAuth: true, role: 'company_admin', title: '公司概览' }
      },
      {
        path: 'company/operator',
        name: 'operator-management',
        component: OperatorManagement,
        meta: { requiresAuth: true, role: 'company_admin', title: '操作员管理' }
      },
      {
        path: 'company/goods',
        name: 'goods-management',
        component: GoodsManagement,
        meta: { requiresAuth: true, role: 'company_admin', title: '货物管理' }
      },
      
      // 操作员路由
      {
        path: 'operator/dashboard',
        name: 'operator-dashboard',
        component: OperatorDashboard,
        meta: { requiresAuth: true, role: 'operator', title: '工作台' }
      },
      {
        path: 'operator/register-good',
        name: 'register-good',
        component: RegisterGood,
        meta: { requiresAuth: true, role: 'operator', companyType: 0, title: '注册货物' }
      },
      {
        path: 'operator/ship-good',
        name: 'ship-good',
        component: ShipGood,
        meta: { requiresAuth: true, role: 'operator', companyType: 1, title: '运输登记' }
      },
      {
        path: 'operator/inspect-good',
        name: 'inspect-good',
        component: InspectGood,
        meta: { requiresAuth: true, role: 'operator', companyType: 2, title: '验货登记' }
      },
      {
        path: 'operator/deliver-good',
        name: 'deliver-good',
        component: DeliverGood,
        meta: { requiresAuth: true, role: 'operator', companyType: 3, title: '收货登记' }
      }
    ]
  },
  
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: { requiresAuth: false, title: '页面未找到' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 海产品溯源系统` : '海产品溯源系统';
  
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  // 不需要认证的页面直接放行
  if (!requiresAuth) {
    next();
    return;
  }
  
  // 检查是否已登录
  if (!authStore.isLoggedIn) {
    next({ name: 'login' });
    return;
  }
  
  // 如果没有用户信息，尝试获取
  if (!authStore.user) {
    try {
      await authStore.getUserInfo();
    } catch (error) {
      // 获取用户信息失败，跳转到登录页
      next({ name: 'login' });
      return;
    }
  }
  
  // 检查角色权限
  const requiredRole = to.meta.role;
  if (requiredRole && authStore.userRole !== requiredRole && authStore.userRole !== 'super_admin') {
    next({ name: 'not-found' });
    return;
  }
  
  // 检查公司类型权限
  const requiredCompanyType = to.meta.companyType;
  if (requiredCompanyType !== undefined && authStore.companyType !== requiredCompanyType && authStore.userRole !== 'super_admin') {
    next({ name: 'not-found' });
    return;
  }
  
  next();
});

export default router;