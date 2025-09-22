# 🚗 Car Rental System

A comprehensive full-stack car rental platform built with React.js frontend and Node.js backend, featuring real-time ride tracking, payment integration, and admin management.

## 🌟 Features

### 👥 User Features
- **User Registration & Authentication** - Secure signup/login with JWT tokens
- **Real-time Ride Booking** - Interactive map-based pickup/drop location selection
- **Multiple Vehicle Types** - Economy, SUV, Luxury vehicles with dynamic pricing
- **Live Ride Tracking** - Real-time GPS tracking of ongoing rides
- **Payment Integration** - Multiple payment gateways (Razorpay, Stripe, PayPal, Cash)
- **Ride History** - Complete booking history with invoices
- **Rating & Reviews** - Rate drivers and provide feedback
- **Profile Management** - Update personal information and preferences

### 🚙 Driver Features
- **Driver Registration** - Complete profile setup with document verification
- **Document Upload** - License, vehicle registration, insurance verification
- **Real-time Location Updates** - GPS-based location tracking
- **Ride Management** - Accept/decline ride requests
- **Earnings Dashboard** - Daily, weekly, monthly earnings tracking
- **Rating System** - View passenger ratings and feedback
- **Status Management** - Available/busy/offline status control

### 👨‍💼 Admin Features
- **Comprehensive Dashboard** - System overview with key metrics
- **User Management** - View, manage, and suspend users
- **Driver Management** - Verify drivers, manage status, handle suspensions
- **Ride Monitoring** - Real-time tracking of all active rides
- **Analytics & Reports** - Detailed analytics with revenue tracking
- **Payment Management** - Transaction monitoring and dispute resolution
- **Support System** - Handle customer complaints and support tickets
- **Live Monitoring** - Real-time system health and driver locations

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - Modern UI library with hooks
- **React Router DOM** - Client-side routing
- **Framer Motion** - Smooth animations and transitions
- **Leaflet & React-Leaflet** - Interactive maps and geolocation
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js & Express.js** - Server-side runtime and framework
- **MongoDB & Mongoose** - NoSQL database with ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **Bcrypt.js** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email service integration

### Security & Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting
- **Express Mongo Sanitize** - NoSQL injection prevention
- **XSS Clean** - Cross-site scripting protection
- **HPP** - HTTP Parameter Pollution protection

### Payment Gateways
- **Razorpay** - Primary payment gateway (India)
- **Stripe** - International payment processing
- **PayPal** - Global payment solution

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/car-rental-system.git
cd car-rental-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (root, backend, frontend)
npm run install-deps
```

### 3. Environment Configuration

#### Backend Environment Setup
Create `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Configure the following environment variables in `backend/.env`:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/car-rental-system

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Admin Configuration
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@carrental.com
ADMIN_PASSWORD=SecureAdminPass123!
ADMIN_SECRET_KEY=CARRENTAL_ADMIN_SECRET_2024

# Security Configuration
ENCRYPTION_KEY=your_32_byte_encryption_key_here
SESSION_SECRET=your_session_secret_here
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Payment Gateway Configuration
# Razorpay (Primary - Required)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Stripe (Optional)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret

# PayPal (Optional)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Test Data (Development Only)
CREATE_TEST_DATA=false
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=testpass123
TEST_DRIVER_EMAIL=testdriver@example.com
TEST_DRIVER_PASSWORD=driverpass123

# Promo Codes (JSON format)
PROMO_CODES={"WELCOME10":10,"SAVE15":15,"NEWUSER20":20}
```

#### Frontend Environment Setup
Create `.env` file in the `frontend` directory:

```bash
cd frontend
cp .env.example .env
```

Configure frontend environment variables:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will automatically create required collections

#### Option B: MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get the connection string
4. Update `MONGODB_URI` in backend `.env`

### 5. Payment Gateway Setup

#### Razorpay Setup (Primary)
1. Create account at [Razorpay](https://razorpay.com/)
2. Get API keys from dashboard
3. Add keys to backend `.env`

#### Stripe Setup (Optional)
1. Create account at [Stripe](https://stripe.com/)
2. Get publishable and secret keys
3. Add keys to environment files

#### PayPal Setup (Optional)
1. Create developer account at [PayPal Developer](https://developer.paypal.com/)
2. Create application and get client credentials
3. Add credentials to backend `.env`

## 🏃‍♂️ Running the Application

### Development Mode
```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
# Backend only
npm run server

# Frontend only
npm run client
```

### Production Build
```bash
# Build frontend for production
npm run build

# Start production server
cd backend && npm start
```

## 🗂️ Project Structure

```
car-rental-system/
├── backend/                    # Node.js backend
│   ├── controllers/           # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   ├── uploads/             # File uploads
│   ├── logs/                # Application logs
│   └── server.js            # Main server file
├── frontend/                  # React.js frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── styles/          # CSS styles
│   │   └── utils/           # Utility functions
│   └── package.json
├── functions/                 # Firebase functions (optional)
├── dataconnect/              # Firebase Data Connect (optional)
└── package.json              # Root package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/drivers/register` - Driver registration
- `POST /api/drivers/login` - Driver login
- `POST /api/admin/login` - Admin login

### Rides
- `GET /api/rides/user` - Get user rides
- `POST /api/rides/book` - Book a new ride
- `PUT /api/rides/:id/status` - Update ride status
- `GET /api/rides/:id/track` - Track ride in real-time

### Payments
- `POST /api/payments/create` - Create payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Payment history

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/drivers` - Manage drivers
- `GET /api/admin/rides` - Monitor rides

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt password encryption
- **Rate Limiting** - API request rate limiting
- **Input Sanitization** - NoSQL injection prevention
- **XSS Protection** - Cross-site scripting prevention
- **CORS Configuration** - Controlled cross-origin requests
- **Security Headers** - Helmet.js security headers
- **File Upload Security** - Secure file handling with Multer

## 📊 Real-time Features

- **Live Ride Tracking** - Socket.io based real-time tracking
- **Driver Location Updates** - Real-time driver location broadcasting
- **Ride Status Updates** - Instant ride status notifications
- **Admin Live Monitoring** - Real-time system monitoring
- **Chat System** - Real-time messaging between users and support

## 🧪 Testing

### Manual Testing
1. Register as user, driver, and admin
2. Test complete ride booking flow
3. Verify payment integration
4. Test real-time tracking
5. Check admin dashboard functionality

### API Testing
Use tools like Postman or Thunder Client to test API endpoints:

```bash
# Example: Test user registration
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds

### Manual Deployment
1. Build frontend: `npm run build`
2. Deploy backend to your preferred hosting service
3. Configure production environment variables
4. Set up MongoDB Atlas for production database

## 🔧 Configuration

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `PORT` | Server port | No | 5000 |
| `RAZORPAY_KEY_ID` | Razorpay API key | Yes | - |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | Yes | - |
| `ADMIN_EMAIL` | Default admin email | Yes | - |
| `ADMIN_PASSWORD` | Default admin password | Yes | - |

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB service is running
   - Verify connection string in `.env`
   - Ensure network access for MongoDB Atlas

2. **Payment Gateway Issues**
   - Verify API keys are correct
   - Check test/live mode settings
   - Ensure webhook URLs are configured

3. **Socket.io Connection Issues**
   - Check CORS configuration
   - Verify frontend socket URL
   - Check firewall settings

4. **File Upload Issues**
   - Ensure `uploads` directory exists
   - Check file size limits
   - Verify Multer configuration

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

## 📝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:

- Create an issue on GitHub
- Email: kushagra.singh0602@gmail.com

## 🙏 Acknowledgments

- React.js team for the amazing frontend framework
- Node.js community for the robust backend ecosystem
- MongoDB for the flexible database solution
- All payment gateway providers for seamless integration
- Open source community for various packages and tools

---

**Made with ❤️ for the Rider/User Community**
