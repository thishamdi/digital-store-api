# Digital Store API Documentation

A high-performance e-commerce API for digital products with advanced features including JWT authentication, RBAC, OTP verification, pagination, and real-time inventory management.

## 🌟 Key Features
- **JWT Authentication** with refresh tokens
- **Admin Role-Based Access Control**
- **OTP Verification** for email & password reset
- **Hierarchical Categories** with filters
- **Digital Product Management** (accounts, subscriptions, gift cards)
- **Transaction-safe Order Processing**
- **Advanced Pagination** & Filtering
- **Rate Limiting** for OTP endpoints
- **Cookie-based Session Management**
- **Comprehensive Error Handling**

---

## 🔑 Authentication

All authenticated endpoints require JWT in cookies or Authorization header.

### Endpoints:

#### 1. Register Admin
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "admin123",
  "email": "admin@store.com",
  "password": "SecurePass123!"
}
```

#### 2. Login Admin
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@store.com",
  "password": "SecurePass123!"
}
```

#### 3. Refresh Access Token
```http
POST /api/v1/auth/refresh-token
Cookie: refreshToken=<valid_refresh_token>
```

#### 4. Password Reset Flow
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{ "email": "user@example.com" }

POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}
```

---

## 📦 Product Management

### Endpoints:

#### 1. Create Product (Admin)
```http
POST /api/v1/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Netflix Premium Account",
  "description": "1-month subscription",
  "category": "64d3a8b7f7e5c1a2b3c4d5e6",
  "pricing": {
    "basePrice": 14.99,
    "currency": "USD"
  },
  "digitalContent": {
    "type": "subscription",
    "platform": "Netflix"
  },
  "stock": 100
}
```

#### 2. Get Products with Filters
```http
GET /api/v1/products?page=2&limit=10&sort=-price&category=streaming&minPrice=10&maxPrice=20
```

#### 3. Get Single Product
```http
GET /api/v1/products/netflix-premium-account
```

#### 4. Update Product (Admin)
```http
PATCH /api/v1/products/64d3a8b7f7e5c1a2b3c4d5e6
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "stock": 150 }
```

---

## 🗂 Category System

### Endpoints:

#### 1. Create Category (Admin)
```http
POST /api/v1/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Streaming Services",
  "parent": null,
  "filters": [
    {
      "name": "platform",
      "type": "string",
      "values": ["Windows", "MacOS"]
    }
  ]
}
```

#### 2. Get Categories Hierarchy
```http
GET /api/v1/categories
```

Response:
```json
[
  {
    "_id": "64d3a8b7f7e5c1a2b3c4d5e6",
    "name": "Streaming Services",
    "children": [
      {
        "name": "Video Streaming",
        "slug": "video-streaming"
      }
    ]
  }
]
```

---

## 🛒 Order Processing

### Endpoints:

#### 1. Create Order
```http
POST /api/v1/orders
Content-Type: application/json

{
  "items": [
    {
      "productId": "64d3a8b7f7e5c1a2b3c4d5e6",
      "variantId": "64d3a8b7f7e5c1a2b3c4d5e7",
      "quantity": 2,
      "customerData": {
        "email": "buyer@example.com"
      }
    }
  ]
}
```

#### 2. Get Order Status
```http
GET /api/v1/orders/ABC123XY
```

Response:
```json
{
  "orderCode": "ABC123XY",
  "status": "processing",
  "items": [
    {
      "product": {
        "title": "Netflix Premium Account",
        "pricing": { "basePrice": 14.99 }
      },
      "quantity": 2
    }
  ],
  "totalAmount": 29.98
}
```

---

## ⚙️ Advanced Features

### Pagination
All list endpoints support:
- `page` (default: 1)
- `limit` (default: 20)
- `sort` (use - for descending: `-createdAt`)

### Filtering
Product endpoints support:
- `category` (ID)
- `minPrice`/`maxPrice`
- `status` (draft/active/archived)
- `platform` (digitalContent.platform)
- `tag` (product tags)

### Error Handling
Standard error format:
```json
{
  "statusCode": 404,
  "message": "Product not found",
  "success": false
}
```

Common status codes:
- 401 Unauthorized
- 403 Forbidden (admin only)
- 429 Too Many Requests (OTP endpoints)
- 500 Internal Server Error

---

## 🚀 Getting Started

1. Set environment variables:
```env
# Core Configuration
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.n6k38.mongodb.net/digital_store_db

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Email Configuration
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password

# Security Settings
CORS_ORIGIN=http://localhost:3000
OTP_EXPIRY_MINUTES=15
OTP_RATE_LIMIT_WINDOW=15
OTP_RATE_LIMIT_MAX=3
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

---

## 🔒 Security Best Practices

- Always use HTTPS in production
- Store secrets in environment variables
- Regularly rotate JWT secrets
- Validate all user input
- Use rate limiting for public endpoints
- Keep dependencies updated
