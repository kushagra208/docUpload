# FileShare - Secure File Sharing Application

A full-stack file sharing application that allows users to upload files, share them securely with other users, and track access through comprehensive audit logs.

## Features

### Core Features
✅ **User Authentication**: Secure registration and login with JWT tokens
✅ **File Upload**: Single and bulk file upload with validation
✅ **File Sharing**: Share files with specific users with role-based access
✅ **Share Links**: Generate secure, shareable links with expiry support
✅ **Access Control**: Strict authorization checks on all sharing methods
✅ **File Metadata**: Display filename, type, size, and upload date
✅ **Download**: Authenticated users can download shared files

### Bonus Features
✅ **Link Expiry**: Set expiration times for both user shares and links
✅ **Audit Logging**: Complete activity log per user with action tracking
✅ **Role-Based Access**: Viewer and Editor roles for shared files
✅ **File Management**: Delete files and revoke shares

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloud
- **Compression**: Built-in zlib for file compression support

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: MUI
- **Routing**: React Router v6
- **HTTP Client**: Axios

## Project Structure

```
docUpload/
├── backend/
│   ├── models/           # MongoDB schemas
│   │   ├── User.js
│   │   ├── File.js
│   │   ├── FileShare.js
│   │   ├── ShareLink.js
│   │   └── AuditLog.js
│   ├── controllers/      # Business logic
│   │   ├── authController.js
│   │   ├── fileController.js
│   │   ├── shareController.js
│   │   ├── crytoController.js
|   |   └── auditController.js
|   |   
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   ├── fileRoutes.js
│   │   ├── shareRoutes.js
│   │   ├── cryptoRoutes.js
│   │   └── auditRoutes.js
│   ├── middleware/      # Authentication middleware
│   ├── utils/           # Helper functions
│   ├── server.js        # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── FileList.jsx
│   │   │   ├── Alert.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/        # Route pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SharedWithMe.jsx
│   │   │   ├── SharedFile.jsx
│   │   │   └── AuditLog.jsx
│   │   ├── utils/
│   │   │   ├── api.js    # API client
│   │   │   ├── encryption.js    # Encryption Util
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── .gitignore
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas cloud instance)
- Git

### Backend Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`**
   ```
    MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fileSharing
    JWT_SECRET=your_jwt_secret_key_change_this
    PORT=5000
    NODE_ENV=development
    FRONTEND_URL=http://localhost:3000
    MAX_FILE_SIZE=52428800
    CLOUDINARY_CLOUD_NAME=cloud_name
    CLOUDINARY_API_KEY=cloudinary_api_key
    CLOUDINARY_API_SECRET=cloudinary_api_secret
   ```

5. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

## API Documentation

### Authentication Endpoints

**Register**
```
POST /api/auth/register
Body: { username, email, password, confirmPassword }
Response: { token, user: { id, username, email } }
```

**Login**
```
POST /api/auth/login
Body: { email, password }
Response: { token, user: { id, username, email } }
```

**Get Profile**
```
GET /api/auth/profile
Headers: Authorization: Bearer <token>
Response: User object
```

### Crypto Endpoints

**Upload File**
```
GET /api/crypto/public-key
Response: Public-Key
```

### File Endpoints

**Upload File**
```
POST /api/files/upload
Headers: Authorization: Bearer <token>
Body: FormData with file
```

**Bulk Upload**
```
POST /api/files/bulk-upload
Headers: Authorization: Bearer <token>
Body: FormData with multiple files
```

**Get My Files**
```
GET /api/files/my-files
Headers: Authorization: Bearer <token>
```

**Get Shared Files**
```
GET /api/files/shared-with-me
Headers: Authorization: Bearer <token>
```

**Download File**
```
GET /api/files/download/:fileId
Headers: Authorization: Bearer <token>
```

**Delete File**
```
DELETE /api/files/:fileId
Headers: Authorization: Bearer <token>
```

### Sharing Endpoints

**Share with User**
```
POST /api/share/share-with-user
Headers: Authorization: Bearer <token>
Body: { fileId, userId, role, expiryDays }
```

**Generate Share Link**
```
POST /api/share/generate-link
Headers: Authorization: Bearer <token>
Body: { fileId, expiryDays }
Response: { shareUrl, token, expiryDate }
```

**Access Via Link**
```
GET /api/share/access/:token
Headers: Authorization: Bearer <token>
```

**Revoke Share**
```
DELETE /api/share/revoke-share/:shareId
Headers: Authorization: Bearer <token>
```

**Revoke Link**
```
DELETE /api/share/revoke-link/:linkId
Headers: Authorization: Bearer <token>
```

**Get File Shares**
```
GET /api/share/file-shares/:fileId
Headers: Authorization: Bearer <token>
```

### Audit Endpoints

**Get Audit Log**
```
GET /api/audit/my-audit-log
Headers: Authorization: Bearer <token>
```

**Get File Activity**
```
GET /api/audit/file-activity/:fileId
Headers: Authorization: Bearer <token>
```

## Security Features

### Access Control
- ✅ JWT-based authentication
- ✅ Refresh token and access token validations
- ✅ Authorization checks on all endpoints
- ✅ Share token validation before file access
- ✅ Automatic expiry enforcement for shares and links
- ✅ Owner-only delete operations
- ✅ Data encrypted with RSA + AES while transmission

### File Validation
- ✅ File type whitelist (PDF, images, documents, CSV, ZIP)
- ✅ File size limits (50MB default)
- ✅ Original filename preservation
- ✅ Unique file naming to prevent collisions

### Audit & Logging
- ✅ All actions logged with timestamps
- ✅ User tracking for each action
- ✅ Share/access activity tracking
- ✅ Download history

## Testing the App

### Test Account
- **Email**: test@example.com (create via registration)
- **Password**: TestPass123

### Test Flow
1. Register new account
2. Upload test files (PDF, image, document)
3. Go to Dashboard to see uploaded files
4. Share a file with another user
5. Generate a share link and test access
6. Check Shared Files section
7. View Activity Log

## Environment Variables Reference

### Backend (.env)
```
MONGODB_URI=              # MongoDB connection string
JWT_SECRET=               # Secret key for JWT signing
PORT=                     # Server port (default: 5000)
NODE_ENV=                 # Environment (development/production)
FRONTEND_URL=             # Frontend URL for CORS
FILE_STORAGE_PATH=        # Directory for uploaded files
MAX_FILE_SIZE=            # Maximum file size in bytes
```

### Frontend (.env)
```
VITE_API_URL=             # Backend API URL
```

