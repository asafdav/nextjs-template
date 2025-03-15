const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

console.log(`${colors.bright}${colors.blue}Starting static build process...${colors.reset}`);

// Step 1: Clean the output directory
console.log(`\n${colors.yellow}Cleaning output directory...${colors.reset}`);
try {
  if (fs.existsSync('out')) {
    fs.rmSync('out', { recursive: true, force: true });
  }
  fs.mkdirSync('out', { recursive: true });
  console.log(`${colors.green}Output directory cleaned successfully.${colors.reset}`);
} catch (error) {
  console.error('Error cleaning output directory:', error);
  process.exit(1);
}

// Step 2: Build the Next.js app
console.log(`\n${colors.yellow}Building Next.js app...${colors.reset}`);
try {
  execSync('next build', { stdio: 'inherit' });
  console.log(`${colors.green}Next.js build completed successfully.${colors.reset}`);
} catch (error) {
  console.error('Error building Next.js app:', error);
  process.exit(1);
}

// Step 3: Copy public files to the output directory
console.log(`\n${colors.yellow}Copying public files to output directory...${colors.reset}`);
try {
  execSync('cp -r public/* out/ || true', { stdio: 'inherit' });
  console.log(`${colors.green}Public files copied successfully.${colors.reset}`);
} catch (error) {
  console.error('Error copying public files:', error);
  process.exit(1);
}

// Step 4: Create a redirect from index.html to the app
console.log(`\n${colors.yellow}Creating index.html redirect...${colors.reset}`);
try {
  const indexHtml = fs.readFileSync('out/index.html', 'utf8');
  // Update the redirect path if needed
  const updatedIndexHtml = indexHtml.replace(
    'window.location.href = \'/index/\';',
    'window.location.href = \'/index.html\';'
  );
  fs.writeFileSync('out/index.html', updatedIndexHtml);
  console.log(`${colors.green}Index.html redirect updated successfully.${colors.reset}`);
} catch (error) {
  console.error('Error creating index.html redirect:', error);
  // Continue anyway, not critical
}

console.log(`\n${colors.bright}${colors.magenta}Static build process completed successfully!${colors.reset}`);
console.log(`${colors.bright}The static site is available in the 'out' directory.${colors.reset}`); 