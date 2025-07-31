# 🚀 TaskFlow - Modern Proje Yönetim Sistemi

[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://taskflow-management.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> **Rol tabanlı yetkilendirme sistemi ile modern proje ve görev yönetimi platformu**

## 🌐 Canlı Demo

**🔗 Live URL:** [https://taskflow-management.vercel.app](https://taskflow-management.vercel.app)

**📂 GitHub Repository:** [https://github.com/nmervecifci/taskflow](https://github.com/nmervecifci/taskflow)

### 🔐 Test Hesapları
| Rol | Email | Şifre | Yetkiler |
|-----|-------|--------|----------|
| **Admin** | admin@taskflow.com | admin123 | Tüm sistem yönetimi |
| **Manager** | manager@taskflow.com | manager123 | Proje ve takım yönetimi |
| **Developer** | developer@taskflow.com | dev123 | Görev yönetimi |

---

## 🛠️ Teknoloji Stack

### **Frontend**
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS 3.3
- **State Management:** Redux Toolkit
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Authentication:** JWT Token

### **Backend**
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Authentication:** JWT + bcryptjs
- **Security:** CORS, Rate Limiting
- **Environment:** dotenv

### **DevOps & Deployment**
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Vercel Serverless
- **Database:** MongoDB Atlas (Cloud)
- **Version Control:** Git & GitHub
- **CI/CD:** Vercel Auto-Deploy

---

## 📁 Proje Dizin Yapısı

```
TaskFlow/
│
├── 📁 app/                     # Next.js 14 App Router
│   ├── 📁 dashboard/           # Dashboard sayfaları
│   │   └── 📄 page.js          # Ana dashboard
│   │
│   ├── 📁 projects/            # Proje yönetimi
│   │   ├── 📄 page.js          # Proje listesi
│   │   └── 📁 [id]/            # Dynamic routing
│   │       └── 📄 page.js      # Proje detay sayfası
│   │
│   ├── 📁 login/               # Authentication
│   │   └── 📄 page.js          # Login sayfası
│   │
    ├── 📁tasks/          
│   │   └── 📄 page.js
      
│   ├── 📁 store/               # Redux Store
│   │   ├── 📄 index.js         # Store configuration
│   │   └── 📁 slices/          # Redux Toolkit slices
│   │       ├── 📄 authSlice.js # Authentication state
│   │       └── 📄 projectSlice.js # Project state
│   │
│   ├── 📄 layout.js            # Root layout
│   ├── 📄 page.js              # Landing page
│   └── 📄 globals.css          # Global styles
│
├── 📁 components/              # Reusable UI Components
│   ├── 📄 DashboardLayout.js   # Layout wrapper
│   ├── 📄 ProjectBoard.js      # Kanban board
│   ├── 📄 TaskCard.js          # Görev kartları
│   ├── 📄 ReduxProvider.js     # Redux provider
│   └── 📄 AuthWrapper.js       # Auth guard
│
├── 📁 services/                # API Services
│   └── 📄 api.js               # Axios HTTP client
│
├── 📁 public/                  # Static assets
│   ├── 📄 favicon.ico          # Favicon
│   └── 📁 images/              # Image assets
│
├── 📁 backend/                 # Node.js Backend API
│   ├── 📁 config/              # Configuration
│   │   └── 📄 database.js      # MongoDB connection
│   │
│   ├── 📁 controllers/         # Business logic
│   │   ├── 📄 authController.js
│   │   ├── 📄 projectController.js
│   │   └── 📄 taskController.js
        └── 📄 userController.js
│   │
│   ├── 📁 middleware/          # Express middleware
│   │   ├── 📄 auth.js          # JWT verification
│   │   ├── 📄 authorization.js
│   │
│   ├── 📁 models/              # Mongoose models
│   │   ├── 📄 User.js          # User schema
│   │   ├── 📄 Project.js       # Project schema
│   │   └── 📄 Task.js          # Task schema
│   │
│   ├── 📁 routes/              # API endpoints
│   │   ├── 📄 auth.js          # Auth routes
│   │   ├── 📄 projects.js      # Project CRUD
│   │   └── 📄 tasks.js         # Task operations
│   │
│   ├── 📄 .env                 # Environment variables
│   ├── 📄 .gitignore           # Backend git ignore
│   ├── 📄 package.json         # Backend dependencies
│   └── 📄 server.js            # Express server
│
├── 📄 .gitignore               # Root git ignore
├── 📄 package.json             # Frontend dependencies  
├── 📄 next.config.js           # Next.js configuration
├── 📄 tailwind.config.js       # Tailwind CSS config
├── 📄 postcss.config.js        # PostCSS config
├── 📄 vercel.json              # Vercel deployment
└── 📄 README.md                # Project documentation
```

---

## ⚡ Temel Özellikler

### 🔐 **Güvenlik & Authentication**
- JWT token tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme (RBAC)
- Password hashing (bcryptjs)
- Rate limiting koruması
- CORS güvenlik politikaları

### 👥 **Rol Yönetimi**
- **Admin:** Sistem geneli yönetim yetkisi
- **Manager:** Proje ve takım yönetimi
- **Developer:** Görev odaklı çalışma alanı

### 📊 **Proje Yönetimi**
- Proje oluşturma ve düzenleme
- Takım üyesi atama
- Deadline ve öncelik yönetimi
- İlerleme takibi ve raporlama

### ✅ **Görev Yönetimi**
- **Drag & Drop** görev taşıma
- Kanban board görünümü
- Öncelik seviyesi (Yüksek/Orta/Düşük)
- Durum takibi (Bekleyen/Devam Eden/Tamamlanan)
- Görev atama ve yorum sistemi

### 📱 **Modern UI/UX**
- Responsive design (mobil uyumlu)
- Real-time güncellemeler
- Smooth animasyonlar
- Dark/Light mode desteği (gelecek özellik)

---

## 🚀 Ekstra Özellikler

### 📝 **Logging Sistemi**
```javascript
// Winston tabanlı gelişmiş logging
- Request/Response logging
- Error tracking
- Performance monitoring
- User activity logs
```

### 🔄 **Real-time Features** (Planlanan)
```javascript
// Socket.io entegrasyonu
- Live görev güncellemeleri
- Real-time bildirimler
- Collaborative editing
- Online kullanıcı durumu
```

### 🧪 **Test Coverage** (Planlanan)
```javascript
// Jest & Testing Library
- Unit tests
- Integration tests
- E2E tests (Playwright)
- API endpoint tests
```

### 📊 **Analytics & Monitoring**
```javascript
// Performance ve kullanım metrikleri
- User engagement tracking
- Performance monitoring
- Error boundary handling
- API response time tracking
```

### 🔔 **Notification System** (Planlanan)
```javascript
// Email & Push notifications
- Task deadline reminders
- Project updates
- Team collaboration alerts
- System notifications
```

---


## 🚦 Kurulum ve Çalıştırma

### **Gereksinimler**
- Node.js 18+ 
- MongoDB Atlas hesabı
- Git

### **Local Development**

1. **Repository'yi klonlayın:**
```bash
git clone https://github.com/nmervecifci/taskflow.git
cd taskflow
```

2. **Backend kurulumu:**
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını kendi değerlerinizle doldurun
npm run dev
```

3. **Frontend kurulumu (Ana dizinde):**
```bash
cd ..  # Ana TaskFlow dizinine dönün
npm install
cp .env.local.example .env.local
# .env.local dosyasını kendi değerlerinizle doldurun
npm run dev
```

4. **Uygulamayı açın:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

### **Production Deployment**

**Vercel ile otomatik deployment:**
```bash
git push origin main  # Otomatik deploy
```

---

## 📊 Performance Metrikleri

| Metrik | Değer | Hedef |
|--------|-------|-------|
| **First Contentful Paint** | < 1.2s | < 1.5s |
| **Largest Contentful Paint** | < 2.1s | < 2.5s |
| **Time to Interactive** | < 3.2s | < 3.5s |
| **Cumulative Layout Shift** | < 0.1 | < 0.1 |
| **API Response Time** | < 200ms | < 300ms |
| **Bundle Size** | < 250KB | < 300KB |

---

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👨‍💻 Geliştirici

**Merve Nur Cifci**
- 📧 Email: [mervenurcfc42@gmail.com]
- 🐙 GitHub: [github.com/nmervecifci](https://github.com/nmervecifci)
- 🔗 Repository: [taskflow](https://github.com/nmervecifci/taskflow)

---



<div align="center">

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Made with ❤️ by [Merve Cifci](https://github.com/nmervecifci)

</div>
