# NextJS Template

A modern NextJS application template with TypeScript, ESLint, Prettier, and Jest.

## Features

- **Next.js**: React framework for server-rendered applications
- **TypeScript**: Type-safe JavaScript
- **ESLint**: Code quality tool
- **Prettier**: Code formatting tool
- **Jest & React Testing Library**: Testing framework
- **Tailwind CSS**: Utility-first CSS framework
- **GitHub Actions**: Continuous Integration and Deployment

## Project Structure

```
nextjs-template/
├── public/             # Static assets
├── src/
│   ├── app/            # App router pages
│   ├── components/     # Reusable UI components
│   ├── styles/         # CSS and styling files
│   └── tests/          # Test files
├── .eslintrc.js        # ESLint configuration
├── .prettierrc         # Prettier configuration
├── jest.config.mjs     # Jest configuration
└── tsconfig.json       # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/nextjs-template.git
cd nextjs-template
```

2. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate test coverage:

```bash
npm run test:coverage
```

### Linting and Formatting

Lint code:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

### Building for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
