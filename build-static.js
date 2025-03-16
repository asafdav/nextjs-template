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

// Create static JSON files for API endpoints
console.log(`${colors.cyan}Creating static JSON files for API endpoints...${colors.reset}`);

// Create todos data.json
const todosData = [
  { id: '1', text: 'Learn Next.js', completed: true },
  { id: '2', text: 'Build a Todo App', completed: true },
  { id: '3', text: 'Deploy to AWS Amplify', completed: false }
];
fs.writeFileSync(path.join(todosDir, 'data.json'), JSON.stringify(todosData, null, 2));

// Check if debug data.json exists, if not create it
const debugDataPath = path.join(debugDir, 'data.json');
if (!fs.existsSync(debugDataPath)) {
  const debugData = {
    timestamp: new Date().toISOString(),
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
    staticExport: true,
    message: 'This is a static JSON file created during the build process'
  };
  fs.writeFileSync(debugDataPath, JSON.stringify(debugData, null, 2));
}

console.log(`${colors.green}Static JSON files created successfully.${colors.reset}`);

// Save the original index.html as landing.html
console.log(`${colors.cyan}Handling index.html files...${colors.reset}`);
const publicIndexPath = path.join('public', 'index.html');
const outLandingPath = path.join('out', 'landing.html');

if (fs.existsSync(publicIndexPath)) {
  // Copy the public/index.html to out/landing.html
  fs.copyFileSync(publicIndexPath, outLandingPath);
  console.log(`${colors.green}Copied public/index.html to out/landing.html${colors.reset}`);
}

// Copy public files to out directory
console.log(`${colors.cyan}Copying public files to out directory...${colors.reset}`);
try {
  // Copy all public files except index.html (we'll handle that separately)
  const publicFiles = fs.readdirSync('public');
  for (const file of publicFiles) {
    if (file !== 'index.html') {
      const sourcePath = path.join('public', file);
      const destPath = path.join('out', file);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        // If it's a directory, use recursive copy
        execSync(`cp -r "${sourcePath}" "${destPath}"`, { stdio: 'inherit' });
      } else {
        // If it's a file, simple copy
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }
  console.log(`${colors.green}Public files copied successfully.${colors.reset}`);
} catch (error) {
  console.warn(`${colors.yellow}Warning: Some public files may not have been copied:${colors.reset}`, error.message);
}

// Create a redirect from landing.html to the app
console.log(`${colors.cyan}Creating redirect from landing page to app...${colors.reset}`);
if (fs.existsSync(outLandingPath)) {
  try {
    let landingHtml = fs.readFileSync(outLandingPath, 'utf8');
    
    // Add a link to the Todo app
    landingHtml = landingHtml.replace(
      '<ul>',
      '<ul>\n      <li><a href="/" style="font-weight: bold; color: #e74c3c;">Todo App</a> - The main Todo application</li>'
    );
    
    fs.writeFileSync(outLandingPath, landingHtml);
    console.log(`${colors.green}Added Todo app link to landing page${colors.reset}`);
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not update landing.html:${colors.reset}`, error.message);
  }
}

// Create a simple redirect index.html if the Next.js one doesn't exist or is problematic
const outIndexPath = path.join('out', 'index.html');
if (!fs.existsSync(outIndexPath) || fs.statSync(outIndexPath).size < 100) {
  console.log(`${colors.yellow}Creating a new index.html with the Todo app...${colors.reset}`);
  
  // Create a simple HTML file that loads the Todo app
  const todoAppHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    #root {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #4361ee;
      margin: 0;
    }
    .landing-link {
      color: #4361ee;
      text-decoration: none;
    }
    .landing-link:hover {
      text-decoration: underline;
    }
    .todo-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }
    .todo-form {
      display: flex;
      margin-bottom: 20px;
    }
    .todo-input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    .todo-button {
      background-color: #4361ee;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 10px 15px;
      margin-left: 10px;
      cursor: pointer;
      font-size: 16px;
    }
    .todo-list {
      list-style: none;
      padding: 0;
    }
    .todo-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .todo-item:last-child {
      border-bottom: none;
    }
    .todo-checkbox {
      margin-right: 10px;
    }
    .todo-text {
      flex: 1;
    }
    .todo-text.completed {
      text-decoration: line-through;
      color: #999;
    }
    .todo-delete {
      color: #e74c3c;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
    }
    .clear-button {
      background-color: #e74c3c;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 10px 15px;
      margin-top: 20px;
      cursor: pointer;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="header">
      <h1>Todo App</h1>
      <a href="/landing.html" class="landing-link">View Landing Page</a>
    </div>
    <div class="todo-container">
      <div id="todo-app">
        <div class="todo-form">
          <input type="text" id="todo-input" class="todo-input" placeholder="Add a new task...">
          <button id="add-button" class="todo-button">Add</button>
        </div>
        <ul id="todo-list" class="todo-list"></ul>
        <button id="clear-button" class="clear-button">Clear All</button>
      </div>
    </div>
  </div>

  <script>
    // Simple Todo app implementation using localStorage
    document.addEventListener('DOMContentLoaded', function() {
      const todoInput = document.getElementById('todo-input');
      const addButton = document.getElementById('add-button');
      const todoList = document.getElementById('todo-list');
      const clearButton = document.getElementById('clear-button');
      
      // Load todos from localStorage or API
      function loadTodos() {
        // Try to load from API first
        fetch('/api/todos/data.json')
          .then(response => response.json())
          .then(todos => {
            // Save to localStorage and render
            localStorage.setItem('todos', JSON.stringify(todos));
            renderTodos(todos);
          })
          .catch(error => {
            console.error('Error loading todos from API:', error);
            // Fallback to localStorage
            const todos = JSON.parse(localStorage.getItem('todos') || '[]');
            renderTodos(todos);
          });
      }
      
      // Render todos to the list
      function renderTodos(todos) {
        todoList.innerHTML = '';
        
        todos.forEach(todo => {
          const li = document.createElement('li');
          li.className = 'todo-item';
          li.dataset.id = todo.id;
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'todo-checkbox';
          checkbox.checked = todo.completed;
          checkbox.addEventListener('change', () => toggleTodo(todo.id));
          
          const span = document.createElement('span');
          span.className = todo.completed ? 'todo-text completed' : 'todo-text';
          span.textContent = todo.text;
          
          const deleteButton = document.createElement('button');
          deleteButton.className = 'todo-delete';
          deleteButton.textContent = '×';
          deleteButton.addEventListener('click', () => deleteTodo(todo.id));
          
          li.appendChild(checkbox);
          li.appendChild(span);
          li.appendChild(deleteButton);
          todoList.appendChild(li);
        });
      }
      
      // Add a new todo
      function addTodo() {
        const text = todoInput.value.trim();
        if (!text) return;
        
        const todos = JSON.parse(localStorage.getItem('todos') || '[]');
        const newTodo = {
          id: Date.now().toString(),
          text,
          completed: false
        };
        
        todos.push(newTodo);
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos(todos);
        todoInput.value = '';
      }
      
      // Toggle todo completion status
      function toggleTodo(id) {
        const todos = JSON.parse(localStorage.getItem('todos') || '[]');
        const todoIndex = todos.findIndex(todo => todo.id === id);
        
        if (todoIndex !== -1) {
          todos[todoIndex].completed = !todos[todoIndex].completed;
          localStorage.setItem('todos', JSON.stringify(todos));
          renderTodos(todos);
        }
      }
      
      // Delete a todo
      function deleteTodo(id) {
        const todos = JSON.parse(localStorage.getItem('todos') || '[]');
        const filteredTodos = todos.filter(todo => todo.id !== id);
        
        localStorage.setItem('todos', JSON.stringify(filteredTodos));
        renderTodos(filteredTodos);
      }
      
      // Clear all todos
      function clearTodos() {
        localStorage.setItem('todos', '[]');
        renderTodos([]);
      }
      
      // Event listeners
      addButton.addEventListener('click', addTodo);
      todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTodo();
      });
      clearButton.addEventListener('click', clearTodos);
      
      // Initial load
      loadTodos();
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(outIndexPath, todoAppHtml);
  console.log(`${colors.green}Created new index.html with Todo app${colors.reset}`);
}

if (buildSucceeded) {
  console.log(`${colors.bright}${colors.green}Static build completed successfully!${colors.reset}`);
} else {
  console.log(`${colors.bright}${colors.yellow}Static build completed with warnings.${colors.reset}`);
}
console.log(`${colors.cyan}Your static site is available in the ${colors.bright}out${colors.reset}${colors.cyan} directory.${colors.reset}`); 