# Minjal Salon - Complete Management System

A production-ready, full-stack salon management software built with React, Node.js, Express, and PostgreSQL.

## 🚀 Features

### User-Facing Website
- ✅ **Home Page** - Hero section, services preview, testimonials, gallery
- ✅ **Services Page** - Category-based service listing with prices
- ✅ **Catalogue Page** - Detailed service cards with images
- ✅ **Gallery Page** - Masonry grid layout for showcasing work
- ✅ **About Page** - Brand story, philosophy, and values
- ✅ **Contact Page** - Enquiry form, contact info, Google Maps

### Admin Panel
- ✅ **Authentication** - JWT-based secure login
- ✅ **Dashboard** - Overview and quick stats
- ✅ **Enquiries Management** - View and manage customer enquiries
- 🔜 **Services Management** - CRUD operations for services (architecture ready)
- 🔜 **Catalogue Management** - Manage catalogue items with images
- 🔜 **Gallery Management** - Upload and manage gallery images
- 🔜 **Offers Management** - Control promotional offers
- 🔜 **Content Management** - Edit About page content

### Future Features (Architecture Ready)
- 📅 **Booking System** - Time slot management and booking calendar
- 💳 **Payment Integration** - Razorpay for advance/full payments

---

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
cd d:\saloon-website\saloon-website
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `backend` directory (already created):
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=salon_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=minjal_salon_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRE=7d

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

FRONTEND_URL=http://localhost:5173
```

#### Setup Database

**Option 1: Using the setup script (Windows)**
```bash
# Run the automated setup script
.\setup-database.bat
```

**Option 2: Manual setup**
```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE salon_db;"

# 2. Run schema migration
psql -U postgres -d salon_db -f migrations/001_initial_schema.sql

# 3. Insert seed data
psql -U postgres -d salon_db -f migrations/002_seed_data.sql

# 4. Create admin user
node scripts/create-admin.js
```

#### Start Backend Server
```bash
npm run dev
```

Backend will run on: **http://localhost:5000**

---

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../  # Go back to root
npm install
```

#### Configure Environment Variables
Create a `.env` file in the root directory (already created):
```env
VITE_API_URL=http://localhost:5000/api
```

#### Start Frontend Development Server
```bash
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 🔑 Default Admin Credentials

- **Email:** `admin@minjalsalon.com`
- **Password:** `Admin@123`

⚠️ **Important:** Change these credentials after first login!

---

## 📁 Project Structure

```
saloon-website/
├── backend/                    # Node.js + Express backend
│   ├── config/                # Database configuration
│   ├── controllers/           # API controllers
│   ├── middleware/            # Auth, upload, error handling
│   ├── migrations/            # Database schema & seed data
│   ├── routes/                # API routes
│   ├── scripts/               # Utility scripts
│   ├── uploads/               # Uploaded images
│   ├── .env                   # Environment variables
│   ├── server.js              # Main server file
│   └── package.json
│
├── src/                       # React frontend
│   ├── components/
│   │   ├── common/           # Navbar, Footer, etc.
│   │   └── admin/            # Admin components
│   ├── context/              # React context (Auth)
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Services.jsx
│   │   ├── Catalogue.jsx
│   │   ├── Gallery.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   └── admin/            # Admin pages
│   ├── services/             # API service layer
│   ├── styles/               # Global styles
│   └── App.jsx
│
├── .env                       # Frontend environment variables
└── package.json
```

---

## 🌐 API Endpoints

### Public Endpoints
- `GET /api/services` - Get all services
- `GET /api/catalogue` - Get catalogue items
- `GET /api/gallery` - Get gallery images
- `GET /api/offers/active` - Get active offer
- `GET /api/content/about` - Get about page content
- `POST /api/enquiries` - Submit contact form

### Admin Endpoints (Protected)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin
- `GET /api/enquiries` - Get all enquiries
- `PUT /api/enquiries/:id/resolve` - Mark enquiry as resolved
- `DELETE /api/enquiries/:id` - Delete enquiry

*Full API documentation available in `backend/README.md`*

---

## 🎨 Design Features

- ✨ **Premium UI/UX** - Luxury salon aesthetic
- 🎭 **Glassmorphism** - Modern design elements
- 🌊 **Smooth Animations** - Micro-interactions throughout
- 📱 **Fully Responsive** - Mobile-first design
- ⚡ **Fast Performance** - Optimized images and lazy loading

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run dev
# Test endpoints using Thunder Client, Postman, or browser
```

### Frontend Testing
```bash
npm run dev
# Open http://localhost:5173 in browser
```

### Test User Flow
1. Browse public pages (Home, Services, Catalogue, Gallery, About, Contact)
2. Submit enquiry via Contact form
3. Login to admin panel at `/admin/login`
4. View enquiries in admin dashboard
5. Mark enquiries as resolved

---

## 🚀 Deployment

Detailed paid-budget deployment guide:
- See `DEPLOYMENT_BUDGET_PLAN.md` for domain + DNS + DB + backend + frontend + security + QA checklist.
- Hostinger fast-start scripts/templates: `deploy/hostinger/README.md`

### Backend Deployment
1. Set `NODE_ENV=production` in `.env`
2. Update `JWT_SECRET` with a strong secret
3. Configure production database credentials
4. Run preflight check: `npm run preflight:prod` (inside `backend`)
5. Run `npm start`

### Frontend Deployment
1. Update `VITE_API_URL` to production API URL
2. Build: `npm run build`
3. Deploy `dist` folder to hosting service (Vercel, Netlify, etc.)

---

## 📝 To-Do (Phase 2 & 3)

### Admin Panel - Remaining Features
- [ ] Services Management UI
- [ ] Catalogue Management UI
- [ ] Gallery Management UI
- [ ] Offers Management UI
- [ ] Content Management UI

### Booking System (Phase 2)
- [ ] Time slot creation
- [ ] Booking calendar
- [ ] Customer booking flow
- [ ] WhatsApp/Email notifications

### Payment Integration (Phase 3)
- [ ] Razorpay setup
- [ ] Payment gateway UI
- [ ] Payment confirmation
- [ ] Receipt generation

---

## 🤝 Support

For issues or questions, contact the development team.

---

## 📄 License

Proprietary - Minjal Salon © 2026

---

## 🎯 Quick Start Commands

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev

# Access:
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000/api
# Admin Panel: http://localhost:5173/admin/login
```

---

**Built with ❤️ for Minjal Salon**
