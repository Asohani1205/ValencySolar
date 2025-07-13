# Railway.app Deployment Guide

## 🚀 Deploying Valency Solar Calculator to Railway.app

This guide will help you deploy the enhanced solar calculator with PostgreSQL database to Railway.app.

## 📋 Prerequisites

1. **Railway Account**: Sign up at https://railway.app/
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **OpenAI API Key**: For AI chat functionality

## 🔧 Step-by-Step Deployment

### **Step 1: Create Railway Project**

1. **Go to Railway.app**: https://railway.app/
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Connect your GitHub account**
5. **Select your repository**: `ValencySolar`

### **Step 2: Add PostgreSQL Database**

1. **In your Railway project dashboard**
2. **Click "New Service"**
3. **Select "Database" → "PostgreSQL"**
4. **Railway will provision a PostgreSQL database**
5. **Copy the connection details**

### **Step 3: Configure Environment Variables**

In your Railway project, go to **Variables** tab and add:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Environment
NODE_ENV=production
```

**Get DATABASE_URL from:**
- Railway PostgreSQL service → **Connect** → **PostgreSQL Connection URL**

### **Step 4: Configure Build Settings**

In Railway project settings:

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm start
```

**Health Check Path:**
```
/api/location/560001
```

### **Step 5: Deploy and Setup Database**

1. **Railway will automatically deploy your app**
2. **Once deployed, run database setup:**
   ```bash
   npm run db:setup
   ```

## 🗄️ Database Schema

The application uses these PostgreSQL tables:

### **Users Table**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);
```

### **Solar Assessments Table**
```sql
CREATE TABLE solar_assessments (
  id SERIAL PRIMARY KEY,
  pincode TEXT NOT NULL,
  energy_consumption REAL NOT NULL,
  roof_space REAL NOT NULL,
  sunlight_exposure TEXT NOT NULL,
  shading TEXT NOT NULL,
  panel_quality TEXT NOT NULL,
  budget REAL NOT NULL,
  subsidy_info TEXT,
  system_size REAL,
  total_cost REAL,
  subsidy REAL,
  final_cost REAL,
  annual_generation REAL,
  annual_savings REAL,
  roi_years REAL,
  system_efficiency REAL,
  panel_efficiency REAL,
  degradation_factor REAL,
  lifetime_generation REAL,
  seasonal_breakdown JSONB,
  savings_breakdown JSONB,
  created_at TEXT NOT NULL
);
```

### **Chat Messages Table**
```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER,
  message TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  timestamp TEXT NOT NULL
);
```

### **Vendors Table**
```sql
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  rating REAL NOT NULL,
  review_count INTEGER NOT NULL,
  distance REAL NOT NULL,
  response_time TEXT NOT NULL,
  pincode TEXT NOT NULL,
  specializations TEXT[] NOT NULL,
  certifications TEXT[] NOT NULL,
  experience_years INTEGER NOT NULL,
  installations_completed INTEGER NOT NULL,
  warranty_years INTEGER NOT NULL,
  financing_options TEXT[] NOT NULL,
  price_range TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  website TEXT,
  services_offered TEXT[] NOT NULL
);
```

### **Reviews Table**
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  location TEXT NOT NULL,
  time_ago TEXT NOT NULL
);
```

## 🔍 Verification Steps

### **1. Check Database Connection**
```bash
# Test database connection
curl https://your-app.railway.app/api/location/560001
```

### **2. Test Solar Assessment**
```bash
# Create assessment
curl -X POST https://your-app.railway.app/api/assessments \
  -H "Content-Type: application/json" \
  -d '{
    "pincode": "560001",
    "energyConsumption": 600,
    "roofSpace": 500,
    "sunlightExposure": "excellent",
    "shading": "minimal",
    "panelQuality": "premium",
    "budget": 300000
  }'
```

### **3. Test Enhanced Calculations**
```bash
# Calculate solar system (replace {id} with actual assessment ID)
curl -X PUT https://your-app.railway.app/api/assessments/{id}/calculate
```

## 🛠️ Troubleshooting

### **Database Connection Issues**

**Error**: `DATABASE_URL not found`
**Solution**: 
1. Check Railway Variables tab
2. Ensure DATABASE_URL is set correctly
3. Restart the deployment

**Error**: `Database migration failed`
**Solution**:
1. Run `npm run db:setup` in Railway console
2. Check database permissions
3. Verify connection string format

### **Build Issues**

**Error**: `Build failed`
**Solution**:
1. Check Railway build logs
2. Ensure all dependencies are in package.json
3. Verify TypeScript compilation

### **Runtime Issues**

**Error**: `OpenAI API error`
**Solution**:
1. Set OPENAI_API_KEY in Railway variables
2. Verify API key is valid
3. Check API usage limits

## 📊 Monitoring

### **Railway Dashboard**
- **Deployments**: Monitor deployment status
- **Logs**: View application logs
- **Metrics**: CPU, memory usage
- **Database**: Connection status

### **Health Checks**
- **Endpoint**: `/api/location/560001`
- **Expected**: 200 OK with JSON response
- **Frequency**: Every 30 seconds

## 🔄 Continuous Deployment

Railway automatically deploys when you push to your main branch:

1. **Push changes to GitHub**
2. **Railway detects changes**
3. **Automatically rebuilds and deploys**
4. **Database migrations run automatically**

## 💰 Cost Optimization

### **Railway Pricing**
- **Free Tier**: $5 credit/month
- **PostgreSQL**: ~$5-10/month
- **Web Service**: ~$5-15/month

### **Optimization Tips**
1. **Use Railway's free tier** for development
2. **Scale down** when not in use
3. **Monitor usage** in Railway dashboard
4. **Use connection pooling** for database

## 🚀 Production Checklist

- [ ] **Database**: PostgreSQL provisioned and connected
- [ ] **Environment Variables**: All required variables set
- [ ] **Build**: Application builds successfully
- [ ] **Health Check**: `/api/location/560001` returns 200
- [ ] **Database Migration**: Tables created successfully
- [ ] **Enhanced Calculations**: Working with real database
- [ ] **OpenAI Integration**: API key configured
- [ ] **Monitoring**: Logs and metrics accessible

## 🎉 Success!

Once deployed, your enhanced solar calculator will be available at:
```
https://your-app-name.railway.app
```

**Features Available:**
- ✅ Enhanced solar calculations with comprehensive mathematical models
- ✅ PostgreSQL database for persistent data
- ✅ AI-powered chat assistant
- ✅ Real-time vendor matching
- ✅ Government subsidy calculations
- ✅ Seasonal generation analysis
- ✅ Degradation modeling
- ✅ Time-of-use tariff calculations

Your production-ready solar calculator is now live! 🌟 