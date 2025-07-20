# 📸 Cloudinary Setup Guide

## 🔧 Environment Variables

Add these to your `.env.local` file:

```env
# Existing variables
MONGODB_URI=mongodb://localhost:27017/
NEXTAUTH_SECRET=your_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000

# New Cloudinary variables
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 How to Get Cloudinary Credentials

1. **Sign up at [cloudinary.com](https://cloudinary.com)**
2. **Go to Dashboard**
3. **Copy your credentials:**
   - Cloud Name
   - API Key
   - API Secret

## 📱 Features Added

### **Profile Photo Upload:**

- ✅ Upload profile photos from Profile page
- ✅ Automatic image optimization (400x400, face detection)
- ✅ Support for JPG, PNG, GIF (max 5MB)
- ✅ Secure Cloudinary storage

### **Photo Display:**

- ✅ Profile photos shown in People discovery
- ✅ Profile photos in Chat matches list
- ✅ Fallback to placeholder if no photo

### **UI/UX:**

- ✅ Black minimal theme integration
- ✅ Loading states and success messages
- ✅ File validation and error handling
- ✅ Responsive design

## 🎯 How to Use

1. **Upload Photo:**

   - Go to Profile page
   - Click "📷 Upload Photo"
   - Select image file
   - Photo will be optimized and stored

2. **View Photos:**
   - Photos appear in People discovery
   - Photos show in Chat matches
   - Photos are automatically optimized

## 🔒 Security Features

- ✅ File type validation
- ✅ File size limits (5MB)
- ✅ Secure Cloudinary URLs
- ✅ User-specific photo storage

## 🛠️ Technical Details

- **Image Optimization:** 400x400px, face detection crop
- **Storage:** Cloudinary cloud storage
- **Database:** MongoDB stores photo URLs
- **Format:** JPG, PNG, GIF support
- **Security:** HTTPS URLs only
