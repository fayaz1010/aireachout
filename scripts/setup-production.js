#!/usr/bin/env node

/**
 * Production Setup Script for AI Outreach Platform
 * Run this script to prepare your app for launch
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupProduction() {
  console.log('🚀 AI Outreach Platform - Production Setup');
  console.log('==========================================\n');

  // Check current environment
  const envPath = path.join(__dirname, '..', '.env');
  const envExists = fs.existsSync(envPath);
  
  if (!envExists) {
    console.log('❌ .env file not found!');
    process.exit(1);
  }

  console.log('✅ Found .env file\n');

  // Read current .env
  const envContent = fs.readFileSync(envPath, 'utf8');
  let newEnvContent = envContent;

  console.log('📝 Let\'s configure your production environment:\n');

  // Google AI API Key
  const currentGoogleKey = envContent.match(/GOOGLE_AI_API_KEY="([^"]*)"/) || ['', 'your_google_ai_api_key_here'];
  if (currentGoogleKey[1] === 'your_google_ai_api_key_here') {
    console.log('🔑 Google AI API Key Setup:');
    console.log('   1. Go to https://makersuite.google.com/app/apikey');
    console.log('   2. Create a new API key');
    console.log('   3. Copy the key\n');
    
    const googleKey = await askQuestion('Enter your Google AI API Key: ');
    if (googleKey.trim()) {
      newEnvContent = newEnvContent.replace(
        /GOOGLE_AI_API_KEY="[^"]*"/,
        `GOOGLE_AI_API_KEY="${googleKey.trim()}"`
      );
      console.log('✅ Google AI API Key updated\n');
    }
  } else {
    console.log('✅ Google AI API Key already configured\n');
  }

  // Production Database URL
  const currentDbUrl = envContent.match(/DATABASE_URL="([^"]*)"/) || ['', ''];
  if (currentDbUrl[1].includes('localhost')) {
    console.log('🗄️  Production Database Setup:');
    console.log('   Recommended providers:');
    console.log('   - Supabase (https://supabase.com) - Free tier available');
    console.log('   - Railway (https://railway.app) - Simple deployment');
    console.log('   - AWS RDS - Enterprise grade\n');
    
    const dbUrl = await askQuestion('Enter your production DATABASE_URL (or press Enter to skip): ');
    if (dbUrl.trim()) {
      newEnvContent = newEnvContent.replace(
        /DATABASE_URL="[^"]*"/,
        `DATABASE_URL="${dbUrl.trim()}"`
      );
      console.log('✅ Database URL updated\n');
    }
  } else {
    console.log('✅ Production database already configured\n');
  }

  // Production Domain
  const currentNextAuthUrl = envContent.match(/NEXTAUTH_URL="([^"]*)"/) || ['', ''];
  if (currentNextAuthUrl[1].includes('preview.abacusai.app')) {
    console.log('🌐 Production Domain Setup:');
    const domain = await askQuestion('Enter your production domain (e.g., https://yourdomain.com): ');
    if (domain.trim()) {
      newEnvContent = newEnvContent.replace(
        /NEXTAUTH_URL="[^"]*"/,
        `NEXTAUTH_URL="${domain.trim()}"`
      );
      console.log('✅ Production domain updated\n');
    }
  } else {
    console.log('✅ Production domain already configured\n');
  }

  // Stripe Configuration
  const currentStripeSecret = envContent.match(/STRIPE_SECRET_KEY=([^\n]*)/);
  if (!currentStripeSecret || currentStripeSecret[1].includes('test')) {
    console.log('💳 Stripe Live Keys Setup:');
    console.log('   1. Go to https://dashboard.stripe.com/apikeys');
    console.log('   2. Switch to "Live" mode');
    console.log('   3. Copy your live keys\n');
    
    const stripeSecret = await askQuestion('Enter your Stripe Live Secret Key (or press Enter to skip): ');
    if (stripeSecret.trim()) {
      newEnvContent = newEnvContent.replace(
        /STRIPE_SECRET_KEY=[^\n]*/,
        `STRIPE_SECRET_KEY=${stripeSecret.trim()}`
      );
    }
    
    const stripePublishable = await askQuestion('Enter your Stripe Live Publishable Key (or press Enter to skip): ');
    if (stripePublishable.trim()) {
      newEnvContent = newEnvContent.replace(
        /STRIPE_PUBLISHABLE_KEY=[^\n]*/,
        `STRIPE_PUBLISHABLE_KEY=${stripePublishable.trim()}`
      );
    }
    
    if (stripeSecret.trim() || stripePublishable.trim()) {
      console.log('✅ Stripe keys updated\n');
    }
  } else {
    console.log('✅ Stripe already configured for production\n');
  }

  // Write updated .env file
  fs.writeFileSync(envPath, newEnvContent);

  // Create production checklist
  const checklistPath = path.join(__dirname, '..', 'PRODUCTION_CHECKLIST.md');
  const checklist = `# Production Launch Checklist

## ✅ Environment Configuration
- [ ] Google AI API Key configured
- [ ] Production database set up
- [ ] Domain configured
- [ ] Stripe live keys added
- [ ] All environment variables verified

## 🚀 Deployment
- [ ] Deploy to production (Vercel/Netlify)
- [ ] Run database migrations: \`npx prisma migrate deploy\`
- [ ] Seed initial data: \`npm run seed\`
- [ ] Test all features in production
- [ ] Set up monitoring (Sentry, LogRocket)

## 📊 Analytics & Monitoring
- [ ] Google Analytics configured
- [ ] Error tracking set up
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured

## 🎯 Launch Preparation
- [ ] Create launch landing page
- [ ] Prepare social media content
- [ ] Set up customer support system
- [ ] Create onboarding email sequence
- [ ] Test payment flows end-to-end

## 📈 Post-Launch
- [ ] Monitor key metrics daily
- [ ] Collect user feedback
- [ ] Iterate based on data
- [ ] Scale infrastructure as needed

---
Generated on: ${new Date().toISOString()}
`;

  fs.writeFileSync(checklistPath, checklist);

  console.log('🎉 Production setup complete!\n');
  console.log('📋 Next steps:');
  console.log('   1. Review PRODUCTION_CHECKLIST.md');
  console.log('   2. Test your Gemini AI integration');
  console.log('   3. Deploy to your hosting platform');
  console.log('   4. Run database migrations in production');
  console.log('\n🚀 You\'re ready to launch!');

  rl.close();
}

// Test Gemini Integration
async function testGeminiIntegration() {
  console.log('\n🧪 Testing Gemini Integration...');
  
  try {
    const { geminiModel } = require('../lib/gemini');
    const result = await geminiModel.generateContent('Test: Respond with "Gemini is working!"');
    const response = await result.response;
    const text = response.text();
    
    if (text.includes('working')) {
      console.log('✅ Gemini integration working!');
    } else {
      console.log('⚠️  Gemini responded but may need configuration');
    }
  } catch (error) {
    console.log('❌ Gemini integration failed:', error.message);
    console.log('   Make sure your GOOGLE_AI_API_KEY is valid');
  }
}

if (require.main === module) {
  setupProduction().then(() => {
    return testGeminiIntegration();
  }).catch(console.error);
}

module.exports = { setupProduction, testGeminiIntegration };
