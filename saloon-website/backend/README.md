# Salon Management Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit `.env` and update with your PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=salon_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### 3. Setup Database
```bash
# Create database
psql -U postgres -c "CREATE DATABASE salon_db;"

# Run migrations
psql -U postgres -d salon_db -f migrations/001_initial_schema.sql
psql -U postgres -d salon_db -f migrations/002_seed_data.sql
```

### 4. Create Admin User
After running migrations, you need to hash the admin password. Run this script:

```bash
node scripts/create-admin.js
```

Or manually update the admin password hash in the database.

### 5. Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - Admin login
- GET `/api/auth/me` - Get current admin
- POST `/api/auth/logout` - Logout

### Services
- GET `/api/services` - Get all services
- GET `/api/services/:id` - Get single service
- POST `/api/services` - Create service (Admin)
- PUT `/api/services/:id` - Update service (Admin)
- DELETE `/api/services/:id` - Delete service (Admin)
- GET `/api/services/categories/all` - Get categories
- POST `/api/services/categories` - Create category (Admin)

### Catalogue
- GET `/api/catalogue` - Get all catalogue items
- POST `/api/catalogue` - Create item (Admin)
- PUT `/api/catalogue/:id` - Update item (Admin)
- DELETE `/api/catalogue/:id` - Delete item (Admin)

### Gallery
- GET `/api/gallery` - Get all images
- POST `/api/gallery` - Upload image (Admin)
- DELETE `/api/gallery/:id` - Delete image (Admin)

### Offers
- GET `/api/offers/active` - Get active offer
- GET `/api/offers` - Get all offers (Admin)
- POST `/api/offers` - Create offer (Admin)
- PUT `/api/offers/:id` - Update offer (Admin)

### Content
- GET `/api/content/about` - Get about page content
- PUT `/api/content/about` - Update about content (Admin)

### Enquiries
- POST `/api/enquiries` - Submit enquiry
- GET `/api/enquiries` - Get all enquiries (Admin)
- PUT `/api/enquiries/:id/resolve` - Mark as resolved (Admin)

## Default Admin Credentials
- Email: `admin@minjalsalon.com`
- Password: `Admin@123`

**Important:** Change these credentials after first login!
