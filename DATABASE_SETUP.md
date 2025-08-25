# 🗄️ Database Setup Guide for MusicFlow

## 🚀 Quick Setup (Follow These Steps)

### Step 1: Install PostgreSQL
1. **Download PostgreSQL**: Go to https://www.postgresql.org/download/windows/
2. **Install**: Run the installer with default settings
3. **Remember the password** you set during installation!

### Step 2: Update Your Configuration
1. Open `config.js` in your project
2. Change `your_password` to the password you set during PostgreSQL installation
3. Save the file

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Setup Database
```bash
npm run db:setup
```

### Step 5: Start Your App
```bash
npm run dev
```

## ✅ What This Fixes

- **Before**: Data disappears when you restart the server
- **After**: All your data stays forever! 🎉

## 🔧 If Something Goes Wrong

### Error: "Connection failed"
- Make sure PostgreSQL is running
- Check your password in `config.js`
- Ensure PostgreSQL is installed correctly

### Error: "Permission denied"
- Make sure you're using the password you set during installation
- Try restarting your computer after PostgreSQL installation

## 📊 What Happens Now

1. **User accounts** are saved permanently
2. **Playlists** stay even after server restart
3. **Favorites** are never lost
4. **Professional database** instead of temporary storage

## 🎯 Test It Works

1. Create a user account
2. Create a playlist
3. Add some songs
4. Restart your server (`Ctrl+C` then `npm run dev`)
5. **Your data should still be there!** ✅

## 💡 Need Help?

If you get stuck:
1. Check the error messages in the terminal
2. Make sure PostgreSQL is running
3. Verify your password in `config.js`
4. Try the setup script again: `npm run db:setup`

---

**🎉 Congratulations! You now have a professional, production-ready database!** 