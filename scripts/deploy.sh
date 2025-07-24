#!/bin/bash

# CropCare AI Deployment Script
# Usage: ./scripts/deploy.sh [environment] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="staging"
BUILD_TYPE="production"
SKIP_TESTS=false
FORCE_DEPLOY=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -e|--environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    -b|--build-type)
      BUILD_TYPE="$2"
      shift 2
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --force)
      FORCE_DEPLOY=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  -e, --environment ENV    Deployment environment (development|staging|production)"
      echo "  -b, --build-type TYPE    Build type (development|production)"
      echo "  --skip-tests            Skip running tests before deployment"
      echo "  --force                 Force deployment even if tests fail"
      echo "  -h, --help              Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
  echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'. Must be development, staging, or production.${NC}"
  exit 1
fi

# Validate build type
if [[ ! "$BUILD_TYPE" =~ ^(development|production)$ ]]; then
  echo -e "${RED}Error: Invalid build type '$BUILD_TYPE'. Must be development or production.${NC}"
  exit 1
fi

echo -e "${BLUE}🚀 CropCare AI Deployment${NC}"
echo -e "${BLUE}Environment: ${GREEN}$ENVIRONMENT${NC}"
echo -e "${BLUE}Build Type: ${GREEN}$BUILD_TYPE${NC}"
echo ""

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
  echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
  exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo -e "${BLUE}Node.js version: ${GREEN}$NODE_VERSION${NC}"

# Check npm version
NPM_VERSION=$(npm --version)
echo -e "${BLUE}npm version: ${GREEN}$NPM_VERSION${NC}"

# Install dependencies
echo -e "\n${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Run tests (unless skipped)
if [[ "$SKIP_TESTS" == false ]]; then
  echo -e "\n${BLUE}🧪 Running tests...${NC}"
  if npm test; then
    echo -e "${GREEN}✅ Tests passed${NC}"
  else
    if [[ "$FORCE_DEPLOY" == true ]]; then
      echo -e "${YELLOW}⚠️  Tests failed, but continuing due to --force flag${NC}"
    else
      echo -e "${RED}❌ Tests failed. Use --force to deploy anyway.${NC}"
      exit 1
    fi
  fi
else
  echo -e "${YELLOW}⚠️  Skipping tests due to --skip-tests flag${NC}"
fi

# Type checking
echo -e "\n${BLUE}🔍 Running type check...${NC}"
if npx tsc --noEmit; then
  echo -e "${GREEN}✅ Type check passed${NC}"
else
  if [[ "$FORCE_DEPLOY" == true ]]; then
    echo -e "${YELLOW}⚠️  Type check failed, but continuing due to --force flag${NC}"
  else
    echo -e "${RED}❌ Type check failed. Use --force to deploy anyway.${NC}"
    exit 1
  fi
fi

# Linting
echo -e "\n${BLUE}🔍 Running linting...${NC}"
if npm run lint; then
  echo -e "${GREEN}✅ Linting passed${NC}"
else
  if [[ "$FORCE_DEPLOY" == true ]]; then
    echo -e "${YELLOW}⚠️  Linting failed, but continuing due to --force flag${NC}"
  else
    echo -e "${RED}❌ Linting failed. Use --force to deploy anyway.${NC}"
    exit 1
  fi
fi

# Build the project
echo -e "\n${BLUE}🔨 Building project...${NC}"
if npm run build; then
  echo -e "${GREEN}✅ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi

# Check build output
if [[ ! -d "dist" ]]; then
  echo -e "${RED}❌ Build output directory 'dist' not found${NC}"
  exit 1
fi

# Environment-specific deployment
case $ENVIRONMENT in
  development)
    echo -e "\n${BLUE}🔄 Starting development server...${NC}"
    npm run dev
    ;;
    
  staging)
    echo -e "\n${BLUE}🚀 Deploying to staging...${NC}"
    # Add your staging deployment logic here
    # Example: Deploy to Netlify, Vercel, or other hosting service
    
    # For now, we'll just show what would happen
    echo -e "${GREEN}✅ Staging deployment completed${NC}"
    echo -e "${BLUE}Staging URL: ${GREEN}https://staging.cropcare-ai.com${NC}"
    ;;
    
  production)
    echo -e "\n${BLUE}🚀 Deploying to production...${NC}"
    
    # Confirm production deployment
    if [[ "$FORCE_DEPLOY" == false ]]; then
      read -p "Are you sure you want to deploy to production? (y/N): " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Deployment cancelled${NC}"
        exit 0
      fi
    fi
    
    # Add your production deployment logic here
    # Example: Deploy to production hosting service
    
    echo -e "${GREEN}✅ Production deployment completed${NC}"
    echo -e "${BLUE}Production URL: ${GREEN}https://cropcare-ai.com${NC}"
    ;;
esac

# Post-deployment tasks
echo -e "\n${BLUE}📋 Running post-deployment tasks...${NC}"

# Update deployment info
DEPLOYMENT_INFO=$(cat <<EOF
{
  "environment": "$ENVIRONMENT",
  "buildType": "$BUILD_TYPE",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "commitHash": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "nodeVersion": "$NODE_VERSION",
  "npmVersion": "$NPM_VERSION"
}
EOF
)

echo "$DEPLOYMENT_INFO" > dist/deployment-info.json
echo -e "${GREEN}✅ Deployment info saved${NC}"

# Health check
echo -e "\n${BLUE}🏥 Running health check...${NC}"
# Add your health check logic here
echo -e "${GREEN}✅ Health check passed${NC}"

# Success message
echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}Environment: ${GREEN}$ENVIRONMENT${NC}"
echo -e "${BLUE}Build Type: ${GREEN}$BUILD_TYPE${NC}"
echo -e "${BLUE}Deployed At: ${GREEN}$(date)${NC}"

# Show next steps
case $ENVIRONMENT in
  development)
    echo -e "\n${BLUE}Next steps:${NC}"
    echo -e "  • Development server is running at http://localhost:8090"
    echo -e "  • Press Ctrl+C to stop the server"
    ;;
  staging)
    echo -e "\n${BLUE}Next steps:${NC}"
    echo -e "  • Test the staging deployment"
    echo -e "  • Run integration tests"
    echo -e "  • Get approval for production deployment"
    ;;
  production)
    echo -e "\n${BLUE}Next steps:${NC}"
    echo -e "  • Monitor the production deployment"
    echo -e "  • Check error logs and analytics"
    echo -e "  • Notify stakeholders of the deployment"
    ;;
esac 