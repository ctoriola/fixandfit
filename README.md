# Fix and Fit - Prosthetics & Orthotics Web Application

**Making You Fit Again**

A comprehensive full-stack web application for Fix and Fit, a prosthetics and orthotics company. This platform serves as a digital hub for clients to access services, book appointments, browse products, and receive personalized care.

## 🚀 Features

### User-Facing Portal
- **Online Appointment Booking**: Secure system for viewing available time slots and booking consultations
- **Virtual Consultation Tool**: Remote consultations with certified professionals
- **Interactive Product Catalog**: Searchable catalog with detailed product information
- **Educational Hub**: Articles, videos, and comprehensive FAQ section
- **User Authentication**: Secure registration and login system

### Admin Dashboard
- **Appointment Management**: View, manage, and confirm appointment requests
- **Content Management**: Add, edit, and remove products and educational content
- **User Management**: Manage patient and staff accounts

### Key Services
- **Prosthetics**: Upper/Lower limb, cosmetic, and sports prosthetics
- **Orthotics**: Spinal, limb braces, and foot orthotics
- **Podorthotics**: Diabetic footwear and custom insoles
- **24/7 Support**: Emergency care and technical support

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Socket.io** for real-time features
- **Multer** for file uploads

### Frontend
- **Next.js** (React framework)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **React Query** for data fetching
- **Axios** for API calls

## 📁 Project Structure

```
windsurf-project/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── appointmentController.js
│   │   └── productController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   └── Product.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── appointmentRoutes.js
│   │   └── productRoutes.js
│   ├── utils/
│   │   ├── AppError.js
│   │   └── catchAsync.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── styles/
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd windsurf-project
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fixandfit
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Development Servers**
   
   Backend:
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PATCH /api/auth/updatePassword` - Update password

### Appointments
- `GET /api/appointments/my-appointments` - Get user appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/available-slots` - Get available time slots
- `PATCH /api/appointments/:id` - Update appointment
- `PATCH /api/appointments/:id/cancel` - Cancel appointment

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/:slug` - Get single product
- `POST /api/products` - Create product (admin only)
- `PATCH /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

## 🎨 Design System

### Colors
- **Primary**: Blue tones (#0ea5e9 to #0c4a6e)
- **Secondary**: Gray tones (#f8fafc to #0f172a)
- **Accent**: Orange tones (#fef7ee to #7a2e12)

### Typography
- **Headings**: Poppins font family
- **Body**: Inter font family

### Components
- Consistent button styles (primary, secondary, outline)
- Form inputs with validation states
- Cards with soft shadows
- Responsive grid layouts

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Protected routes and role-based access
- CORS configuration
- Environment variable protection

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🌟 Key Features Implementation

### Appointment Booking System
- Real-time availability checking
- Conflict prevention
- Email notifications (planned)
- Virtual consultation support

### Product Catalog
- Advanced search and filtering
- Category-based organization
- Featured products showcase
- Detailed product pages

### User Management
- Role-based access (user, staff, admin)
- Profile management
- Appointment history
- Secure authentication

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or similar cloud database
2. Configure environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Set up SSL certificates

### Frontend Deployment
1. Build the Next.js application
2. Deploy to Vercel, Netlify, or similar platforms
3. Configure environment variables
4. Set up custom domain (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and inquiries:
- Email: info@fixandfit.com
- Phone: +234 123 456 7890
- Address: 123 Medical Center Drive, Lagos, Nigeria

## 📄 License

This project is licensed under the ISC License.

---

**Fix and Fit** - Empowering patients with personalized, high-quality prosthetics, orthotics, and podorthotics solutions through highly trained and certified professionals.

*Making you fit again.*
