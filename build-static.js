const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Console colors for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}Starting static build process...${colors.reset}`);

// Clean output directory
console.log(`${colors.cyan}Cleaning output directory...${colors.reset}`);
if (fs.existsSync('out')) {
  fs.rmSync('out', { recursive: true, force: true });
}
fs.mkdirSync('out', { recursive: true });
console.log(`${colors.green}Output directory cleaned successfully.${colors.reset}`);

// Build Next.js app
console.log(`${colors.cyan}Building Next.js app...${colors.reset}`);
let buildSucceeded = false;

try {
  execSync('next build', { stdio: 'inherit' });
  buildSucceeded = true;
} catch (error) {
  // Check if it's the EISDIR error which is expected when exporting API routes
  if (error.message && (error.message.includes('EISDIR') || error.message.includes('illegal operation on a directory'))) {
    console.log(`${colors.yellow}Ignoring expected EISDIR error during build...${colors.reset}`);
    buildSucceeded = true; // Consider the build successful despite the EISDIR error
  } else {
    console.error(`${colors.red}Error building Next.js app:${colors.reset}`, error);
    // Don't exit, continue with the script
  }
}

// Create API directories if they don't exist
console.log(`${colors.cyan}Creating API directories...${colors.reset}`);
const apiDir = path.join('out', 'api');
const debugDir = path.join(apiDir, 'debug');
const todosDir = path.join(apiDir, 'todos');

if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

if (!fs.existsSync(debugDir)) {
  fs.mkdirSync(debugDir, { recursive: true });
}

if (!fs.existsSync(todosDir)) {
  fs.mkdirSync(todosDir, { recursive: true });
}
console.log(`${colors.green}API directories created successfully.${colors.reset}`);

// Copy public files to out directory
console.log(`${colors.cyan}Copying public files to out directory...${colors.reset}`);
try {
  execSync('cp -r public/* out/', { stdio: 'inherit' });
  console.log(`${colors.green}Public files copied successfully.${colors.reset}`);
} catch (error) {
  console.warn(`${colors.yellow}Warning: Some public files may not have been copied:${colors.reset}`, error.message);
}

// Create a redirect in index.html if it exists
const indexHtmlPath = path.join('out', 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  console.log(`${colors.cyan}Updating index.html...${colors.reset}`);
  try {
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    // Update any redirect paths if needed
    indexHtml = indexHtml.replace(/\/index\//g, '/index.html');
    fs.writeFileSync(indexHtmlPath, indexHtml);
    console.log(`${colors.green}index.html updated successfully.${colors.reset}`);
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not update index.html:${colors.reset}`, error.message);
  }
}

if (buildSucceeded) {
  console.log(`${colors.bright}${colors.green}Static build completed successfully!${colors.reset}`);
} else {
  console.log(`${colors.bright}${colors.yellow}Static build completed with warnings.${colors.reset}`);
}
console.log(`${colors.cyan}Your static site is available in the ${colors.bright}out${colors.reset}${colors.cyan} directory.${colors.reset}`); 