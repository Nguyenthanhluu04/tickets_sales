import { createRouter, createWebHistory } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'

// Lazy load components
const Home = () => import('@/views/Home.vue')
const EventList = () => import('@/views/EventList.vue')
const EventDetail = () => import('@/views/EventDetail.vue')
const MyTickets = () => import('@/views/MyTickets.vue')
const Profile = () => import('@/views/Profile.vue')
const CheckIn = () => import('@/views/CheckIn.vue')
const Dashboard = () => import('@/views/admin/Dashboard.vue')
const CreateEvent = () => import('@/views/admin/CreateEvent.vue')
const ManageEvents = () => import('@/views/admin/ManageEvents.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'Trang chủ' },
  },
  {
    path: '/events',
    name: 'EventList',
    component: EventList,
    meta: { title: 'Sự kiện' },
  },
  {
    path: '/events/:id',
    name: 'EventDetail',
    component: EventDetail,
    meta: { title: 'Chi tiết sự kiện' },
  },
  {
    path: '/my-tickets',
    name: 'MyTickets',
    component: MyTickets,
    meta: { title: 'Vé của tôi', requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { title: 'Hồ sơ', requiresAuth: true },
  },
  {
    path: '/checkin',
    name: 'CheckIn',
    component: CheckIn,
    meta: { title: 'Check-in', requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: Dashboard,
    meta: { title: 'Quản trị', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/create-event',
    name: 'CreateEvent',
    component: CreateEvent,
    meta: { title: 'Tạo sự kiện', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/events',
    name: 'ManageEvents',
    component: ManageEvents,
    meta: { title: 'Quản lý sự kiện', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const walletStore = useWalletStore()
  const userStore = useUserStore()

  // Set page title
  document.title = `${to.meta.title} - Vé NFT` || 'Vé NFT'

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!walletStore.isConnected || !userStore.isAuthenticated) {
      // Redirect to home and show message
      window.$message?.warning('Vui lòng đăng nhập để truy cập trang này')
      next({ name: 'Home' })
      return
    }

    // Check if route requires admin role
    if (to.meta.requiresAdmin) {
      // Wait for user data if not loaded
      if (!userStore.user) {
        try {
          await userStore.fetchUser()
        } catch (error) {
          console.error('Failed to fetch user:', error)
        }
      }

      // Check if user has admin or organizer role
      if (userStore.user && !['admin', 'organizer'].includes(userStore.user.role)) {
        window.$message?.error('Bạn không có quyền truy cập trang này. Cần role Admin hoặc Organizer.')
        next({ name: 'Home' })
        return
      }
    }
  }

  next()
})

export default router
