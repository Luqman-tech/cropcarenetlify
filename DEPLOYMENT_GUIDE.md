# 🚀 CropCare AI Deployment Guide

## Overview

This guide covers the complete deployment process for CropCare AI, including CI/CD pipeline setup, environment configuration, and production deployment.

## 📋 Prerequisites

- Node.js 18+ and npm
- Git repository access
- GitHub account (for CI/CD)
- Hosting service account (Netlify, Vercel, etc.)

## 🏗️ Architecture

### Deployment Environments

1. **Development** (`localhost:8090`)
   - Local development server
   - Debug mode enabled
   - No analytics or update checks

2. **Staging** (`staging.cropcare-ai.com`)
   - Pre-production testing
   - Full feature set enabled
   - Automated deployment from `develop` branch

3. **Production** (`cropcare-ai.com`)
   - Live production environment
   - Optimized for performance
   - Automated deployment from `main` branch

## 🔧 Setup Instructions

### 1. Environment Configuration

The app automatically detects the environment based on the hostname:

```javascript
// deploy.config.js
const environments = {
  development: {
    name: 'Development',
    baseUrl: 'http://localhost:8090',
    features: {
      debug: true,
      analytics: false,
      updateChecks: false,
      offlineMode: true
    }
  },
  staging: {
    name: 'Staging',
    baseUrl: 'https://staging.cropcare-ai.com',
    features: {
      debug: true,
      analytics: true,
      updateChecks: true,
      offlineMode: true
    }
  },
  production: {
    name: 'Production',
    baseUrl: 'https://cropcare-ai.com',
    features: {
      debug: false,
      analytics: true,
      updateChecks: true,
      offlineMode: true
    }
  }
};
```

### 2. CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) handles:

- **Testing**: Runs tests, type checking, and linting
- **Building**: Creates optimized production build
- **Deployment**: Deploys to staging/production based on branch
- **Notifications**: Reports deployment status

#### Workflow Triggers

- **Push to `develop`**: Deploys to staging
- **Push to `main`**: Deploys to production
- **Pull Request**: Runs tests only

### 3. Automated Deployment Script

The deployment script (`scripts/deploy.sh`) provides:

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Deploy to development
npm run deploy:dev

# Force deployment (skip tests)
npm run deploy:production -- --force
```

## 🚀 Deployment Methods

### Method 1: GitHub Actions (Recommended)

1. **Push to Repository**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Monitor Deployment**
   - Check GitHub Actions tab
   - View deployment logs
   - Verify deployment status

### Method 2: Manual Deployment

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Deploy to Hosting Service**
   ```bash
   # Netlify
   netlify deploy --prod --dir=dist

   # Vercel
   vercel --prod

   # Firebase
   firebase deploy
   ```

### Method 3: Local Development

```bash
npm run dev
```

## 📊 Monitoring & Updates

### Update Management

The app includes an automatic update system:

- **Version Checking**: Daily automatic checks
- **Update Notifications**: Browser and in-app notifications
- **One-Click Updates**: Automatic service worker updates
- **Rollback Support**: Previous version fallback

### System Health Monitoring

Access deployment status at `/deployment-status`:

- Environment information
- Service availability
- Update status
- System information

### Performance Monitoring

- **Bundle Analysis**: `npm run build:analyze`
- **Type Checking**: `npm run type-check`
- **Linting**: `npm run lint`
- **Formatting**: `npm run format`

## 🔒 Security & Best Practices

### Environment Variables

Set these environment variables for production:

```bash
VITE_APP_VERSION=1.0.0
VITE_BUILD_NUMBER=1
VITE_BUILD_DATE=2024-01-01T00:00:00Z
VITE_COMMIT_HASH=abc123
```

### Security Headers

Configure your hosting service with these headers:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### HTTPS Requirements

- **Production**: HTTPS required
- **Staging**: HTTPS recommended
- **Development**: HTTP allowed

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Service Worker Issues**
   ```bash
   # Clear service worker cache
   # In browser dev tools: Application > Storage > Clear storage
   ```

3. **Update Notifications Not Working**
   ```bash
   # Check notification permissions
   # Request permission manually
   ```

### Debug Mode

Enable debug mode in development:

```javascript
// Check debug status
console.log('Debug mode:', deploymentConfig.isFeatureEnabled('debug'));
```

### Logs and Monitoring

- **Browser Console**: Development logs
- **Network Tab**: API and resource loading
- **Application Tab**: Service worker and storage
- **Performance Tab**: Load times and metrics

## 📈 Performance Optimization

### Build Optimization

1. **Code Splitting**: Automatic with Vite
2. **Tree Shaking**: Unused code removal
3. **Minification**: Production builds
4. **Gzip Compression**: Hosting service

### Caching Strategy

- **Static Assets**: Long-term caching
- **Model Files**: Version-based caching
- **API Responses**: Short-term caching
- **Service Worker**: Offline caching

### Bundle Analysis

```bash
npm run build:analyze
```

This shows:
- Bundle size breakdown
- Dependency analysis
- Optimization opportunities

## 🔄 Rollback Procedures

### Emergency Rollback

1. **Revert Code**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Manual Rollback**
   - Deploy previous version
   - Update DNS if needed
   - Notify stakeholders

### Version Management

- **Semantic Versioning**: `major.minor.patch`
- **Build Numbers**: Incremental builds
- **Release Notes**: Changelog tracking

## 📞 Support & Resources

### Documentation

- [API Documentation](./docs/api.md)
- [Component Library](./docs/components.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)

### Monitoring Tools

- **GitHub Actions**: CI/CD monitoring
- **Browser DevTools**: Client-side debugging
- **Hosting Analytics**: Performance monitoring

### Contact

- **GitHub Issues**: Bug reports and feature requests
- **Email Support**: support@cropcare-ai.com
- **Documentation**: [Project Wiki](https://github.com/crop-vision/crop-vision-guide/wiki)

## 🎯 Success Metrics

### Deployment Success

- ✅ Build passes all tests
- ✅ Type checking successful
- ✅ Linting passes
- ✅ Performance benchmarks met
- ✅ Security scan clean

### Runtime Success

- ✅ App loads within 3 seconds
- ✅ AI model inference <2 seconds
- ✅ Offline functionality works
- ✅ Update system operational
- ✅ Error rate <1%

---

## 🎉 Deployment Complete!

Your CropCare AI application is now ready for production deployment with:

- ✅ **Automated CI/CD Pipeline**
- ✅ **Environment Configuration**
- ✅ **Update Management System**
- ✅ **Monitoring & Health Checks**
- ✅ **Security Best Practices**
- ✅ **Performance Optimization**
- ✅ **Rollback Procedures**

The deployment system ensures reliable, secure, and performant delivery of your AI-powered crop disease detection application to farmers worldwide. 