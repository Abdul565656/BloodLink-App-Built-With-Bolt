# BloodLink - GitHub Deployment Guide

## 🚀 How to Deploy to GitHub

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New Repository"
3. Name it `bloodlink-app` (or your preferred name)
4. Make it public
5. Don't initialize with README (we'll add our own)

### Step 2: Download Project Files
1. In Bolt, click the download button to get all project files
2. Extract the ZIP file to your local machine

### Step 3: Initialize Git and Push
```bash
# Navigate to your project folder
cd bloodlink-app

# Initialize git
git init

# Add all files
git add .

# Make initial commit
git commit -m "🩸 Initial commit: BloodLink - AI-powered blood donation platform

Features:
- Global blood donor registration
- AI-powered donor matching
- Voice AI integration with KhoonBuddy chatbot
- Real-time blood request system
- Admin dashboard with analytics
- Multi-channel notifications
- Responsive design with Tailwind CSS
- Supabase backend integration"

# Add your GitHub repository as origin
git remote add origin https://github.com/yourusername/bloodlink-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Set up Environment Variables
Create a `.env` file in your project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NOTIFICATION_MODE=demo
```

### Step 5: Deploy to Netlify (Optional)
1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

## 📁 Project Structure
```
bloodlink-app/
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx
│   │   ├── DonorRegistrationForm.tsx
│   │   ├── BloodRequestForm.tsx
│   │   ├── KhoonBuddyChat.tsx (with Voice AI)
│   │   ├── AdminDashboard.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── donorMatcher.ts
│   │   ├── khoonBuddyAgent.ts
│   │   ├── notificationAgent.ts
│   │   └── ...
│   └── ...
├── supabase/
│   └── migrations/
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🎯 Key Features to Highlight
- **Voice AI Integration**: KhoonBuddy chatbot with speech synthesis
- **Global Reach**: 195+ countries supported
- **Real-time Matching**: AI-powered donor-patient matching
- **Multi-channel Notifications**: SMS, Email, WhatsApp
- **Admin Dashboard**: Complete analytics and management
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Voice features for better accessibility

## 🏆 Hackathon Submission
This project qualifies for:
- Voice AI Challenge (KhoonBuddy with speech synthesis)
- Healthcare Innovation
- Social Impact
- Full-stack Development