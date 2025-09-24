# Job Portal Backend - Render Deployment Guide

## 🚀 Quick Deployment Steps

### 1. **Create a New Web Service on Render**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository or upload your code

### 2. **Configure Deployment Settings**

#### Basic Settings:
- **Name**: `job-portal-backend` (or your preferred name)
- **Environment**: `Node`
- **Region**: `Singapore` (or your preferred region)
- **Branch**: `main` (or your default branch)

#### Build & Deploy Settings:
- **Build Command**: `./render-build.sh`
- **Start Command**: `npm start`
- **Node Version**: `18.x` (or latest LTS)

### 3. **Environment Variables**

Add these environment variables in Render Dashboard:

#### **Required Variables:**
```env
NODE_ENV=production
PORT=10000
DB_HOST=dpg-d3a2c8p5pdvs73e26hbg-a.singapore-postgres.render.com
DB_PORT=5432
DB_DATABASE=job_portal_db_yrp0
DB_USER=job_portal_db_yrp0_user
DB_PASSWORD=L8kuPX4p7cr9Tzt7qcotIvXqdCuSWYP6
JWT_SECRET=job-portal-super-secret-key-2024-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=job-portal-refresh-secret-2024-production
JWT_REFRESH_EXPIRE=30d
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=pdf,doc,docx
USE_S3_STORAGE=false
```

#### **Update After Deployment:**
```env
FRONTEND_URL=https://your-frontend-app.render.com
BASE_URL=https://your-backend-app.render.com
GOOGLE_CALLBACK_URL=https://your-backend-app.render.com/api/auth/google/callback
LINKEDIN_CALLBACK_URL=https://your-backend-app.render.com/api/auth/linkedin/callback
```

### 4. **Optional Environment Variables**

#### Email Configuration:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### OAuth Configuration:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

#### AWS S3 Configuration (if using S3 for file storage):
```env
USE_S3_STORAGE=true
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=job-portal-uploads
```

## 📋 Pre-Deployment Checklist

- [x] Database deployed and verified on Render
- [x] Environment variables configured
- [x] Build script (`render-build.sh`) is executable
- [x] All required dependencies in `package.json`
- [x] Health check endpoint (`/api/health`) working
- [x] Database connection verified

## 🔧 Advanced Configuration

### Auto-Deploy Settings:
- Enable **"Auto-Deploy"** to deploy on every push to your main branch
- Set up **branch protection** if working with a team

### Health Checks:
- Health Check Path: `/api/health`
- Health Check Grace Period: `90` seconds

### Scaling:
- Start with the **Free Plan** for testing
- Upgrade to **Starter Plan** ($7/month) for production

## 🧪 Testing Your Deployment

### 1. **Health Check**
```bash
curl https://your-backend-app.render.com/api/health
```

Expected Response:
```json
{
  "status": "OK",
  "message": "Job Portal API is running",
  "timestamp": "2024-09-24T17:30:00.000Z"
}
```

### 2. **Database Connection Test**
```bash
curl https://your-backend-app.render.com/api/auth/test-db
```

### 3. **API Endpoints Test**
```bash
# Get all jobs
curl https://your-backend-app.render.com/api/jobs

# Get companies
curl https://your-backend-app.render.com/api/jobs/companies
```

## 🔍 Troubleshooting

### Common Issues:

#### 1. **Build Fails**
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

#### 2. **Database Connection Issues**
- Verify database credentials are correct
- Check if database service is running
- Ensure SSL is enabled for database connections

#### 3. **Environment Variables**
- Double-check all required variables are set
- Ensure no typos in variable names
- Verify sensitive values are correctly copied

#### 4. **Health Check Fails**
- Check if the `/api/health` endpoint exists
- Verify the server is starting on the correct port
- Check application logs for errors

### Debugging Commands:
```bash
# View application logs
# Go to Render Dashboard → Your Service → Logs

# Test database connection locally
node verify-render-database.js

# Check if all routes are loaded
curl -v https://your-backend-app.render.com/api/health
```

## 📊 Monitoring & Maintenance

### Key Metrics to Monitor:
- Response times
- Error rates
- Database connection pool
- Memory usage
- CPU usage

### Render Dashboard Features:
- **Metrics**: View performance metrics
- **Logs**: Real-time application logs
- **Events**: Deployment history
- **Settings**: Update environment variables

## 🔄 Deployment Updates

To deploy updates:
1. Push changes to your connected repository branch
2. Render will automatically trigger a new deployment
3. Monitor the build process in the dashboard
4. Verify the deployment using health checks

## 📞 Support Resources

- **Render Documentation**: [https://render.com/docs](https://render.com/docs)
- **Node.js on Render**: [https://render.com/docs/node-js](https://render.com/docs/node-js)
- **Environment Variables**: [https://render.com/docs/environment-variables](https://render.com/docs/environment-variables)

---

**🎉 Your Job Portal backend is ready for production deployment on Render!**