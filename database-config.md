# 🔧 Database Configuration Helper

## 📝 Update Your config.js File

After installing PostgreSQL, you need to update your `config.js` file with your actual password.

### Current config.js (needs updating):
```javascript
DB_PASSWORD: process.env.DB_PASSWORD || "your_password"
```

### Change it to your actual PostgreSQL password:
```javascript
DB_PASSWORD: process.env.DB_PASSWORD || "my_actual_password_123"
```

## 🔑 Where to Find Your Password

1. **During PostgreSQL Installation**: You set a password when installing PostgreSQL
2. **Default User**: Usually `postgres`
3. **Default Port**: Usually `5432`

## 📋 Complete Configuration Example

```javascript
export const config = {
  // Jamendo API Configuration
  JAMENDO_CLIENT_ID: "6853ac8d",
  
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:YOUR_PASSWORD@localhost:5432/musicflow",
  
  // Database connection settings
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || "musicflow",
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "YOUR_ACTUAL_PASSWORD",
  
  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || "your-secret-key-change-this-in-production"
};
```

## ⚠️ Important Notes

- **Never commit your real password** to version control
- **Use a strong password** for production
- **Keep your password safe** - you'll need it to connect to the database 