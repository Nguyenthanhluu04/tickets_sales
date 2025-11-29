import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'

// Naive UI
import naive from 'naive-ui'

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faSearch, faCalendar, faLocationDot, faTicket, faUser, faHeart, faShare,
  faMoneyBill, faClock, faUsers, faShieldAlt, faCircleCheck, faArrowRight,
  faMinus, faPlus, faWallet, faExclamationCircle, faStar, faEye, faChartLine,
  faFilter, faXmark, faBars, faHome, faList, faQrcode, faUserCircle, faSignOut,
  faGear, faChevronDown, faChevronUp, faTag, faBuilding, faEnvelope, faPhone,
  faGlobe, faMapMarkerAlt, faCheck, faTimes, faInfoCircle, faTriangleExclamation,
  faLock, faSignInAlt, faUserPlus, faArrowLeft, faExclamationTriangle, faTrash,
  faCheckCircle, faDownload, faHashtag, faBan, faEdit, faSave, faImage, faUpload,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'

// Add icons to library
library.add(
  faSearch, faCalendar, faLocationDot, faTicket, faUser, faHeart, faShare,
  faMoneyBill, faClock, faUsers, faShieldAlt, faCircleCheck, faArrowRight,
  faMinus, faPlus, faWallet, faExclamationCircle, faStar, faEye, faChartLine,
  faFilter, faXmark, faBars, faHome, faList, faQrcode, faUserCircle, faSignOut,
  faGear, faChevronDown, faChevronUp, faTag, faBuilding, faEnvelope, faPhone,
  faGlobe, faMapMarkerAlt, faCheck, faTimes, faInfoCircle, faTriangleExclamation,
  faHeartRegular, faLock, faSignInAlt, faUserPlus, faArrowLeft, faExclamationTriangle, faTrash,
  faCheckCircle, faDownload, faHashtag, faBan, faEdit, faSave, faImage, faUpload,
  faDollarSign
)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(createPinia())
app.use(router)
app.use(naive)

app.mount('#app')
