#!/usr/bin/env node

/**
 * Setup script for Remote Dev Team Hub
 * This script helps users set up the development environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Remote Dev Team Hub...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required');
  console.error(`   Current version: ${nodeVersion}`);
  console.error('   Please upgrade Node.js and try again');
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Function to run commands
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📦 Running: ${command}`);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    return true;
  } catch (error) {
    console.error(`❌ Failed to run: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Function to create environment file from example
function createEnvFile(dir, filename = '.env') {
  const examplePath = path.join(dir, `${filename}.example`);
  const envPath = path.join(dir, filename);
  
  if (fs.existsSync(examplePath) && !fs.existsSync(envPath)) {
    try {
      fs.copyFileSync(examplePath, envPath);
      console.log(`✅ Created ${path.join(dir, filename)}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to create ${envPath}`);
      return false;
    }
  } else if (fs.existsSync(envPath)) {
    console.log(`⚠️  ${path.join(dir, filename)} already exists, skipping...`);
    return true;
  } else {
    console.error(`❌ ${examplePath} not found`);
    return false;
  }
}

// Main setup function
async function setup() {
  console.log('\n📋 Setup checklist:');
  
  // 1. Install backend dependencies
  console.log('\n1️⃣ Installing backend dependencies...');
  const backendPath = path.join(process.cwd(), 'backend');
  
  if (!fs.existsSync(backendPath)) {
    console.error('❌ Backend directory not found');
    process.exit(1);
  }
  
  if (!runCommand('npm install', backendPath)) {
    console.error('❌ Failed to install backend dependencies');
    process.exit(1);
  }
  
  // 2. Create backend .env file
  console.log('\n2️⃣ Setting up backend environment...');
  if (!createEnvFile(backendPath)) {
    console.error('❌ Failed to create backend .env file');
    process.exit(1);
  }
  
  // 3. Install frontend dependencies
  console.log('\n3️⃣ Installing frontend dependencies...');
  const frontendPath = path.join(process.cwd(), 'frontend');
  
  if (!fs.existsSync(frontendPath)) {
    console.error('❌ Frontend directory not found');
    process.exit(1);
  }
  
  if (!runCommand('npm install', frontendPath)) {
    console.error('❌ Failed to install frontend dependencies');
    process.exit(1);
  }
  
  // 4. Create frontend .env file
  console.log('\n4️⃣ Setting up frontend environment...');
  if (!createEnvFile(frontendPath)) {
    console.error('❌ Failed to create frontend .env file');
    process.exit(1);
  }
  
  // 5. Display next steps
  console.log('\n🎉 Setup completed successfully!\n');
  
  console.log('📝 Next steps:');
  console.log('');
  console.log('1. Configure your environment variables:');
  console.log('   📁 backend/.env  - Database and Firebase configuration');
  console.log('   📁 frontend/.env - Firebase web app configuration');
  console.log('');
  console.log('2. Set up your database:');
  console.log('   - Create a PostgreSQL database');
  console.log('   - Update DATABASE_URL in backend/.env');
  console.log('');
  console.log('3. Set up Firebase:');
  console.log('   - Create a Firebase project');
  console.log('   - Enable Authentication with Google provider');
  console.log('   - Download service account key for backend');
  console.log('   - Get web app config for frontend');
  console.log('');
  console.log('4. Start the development servers:');
  console.log('   Backend:  cd backend && npm run dev');
  console.log('   Frontend: cd frontend && npm run dev');
  console.log('');
  console.log('📚 For detailed setup instructions, see README.md');
  console.log('');
  console.log('🆘 Need help? Create an issue on GitHub');
}

// Check if we're in the right directory
if (!fs.existsSync('package.json') && !fs.existsSync('README.md')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Run setup
setup().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
});
