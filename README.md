# URL Shortener

A full-stack URL shortener application built with React, TypeScript, Express, and MongoDB.

## Features

- Create short URLs from long URLs
- Redirect to original URLs from short codes
- View URL statistics (clicks, last accessed)
- Responsive design for all devices
- Modern tech stack with type safety

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Build Tools**: Vite, TypeScript, ESLint, Prettier

## Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- MongoDB (local or Atlas)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the environment variables in `.env` as needed

4. **Start the development server**
   ```bash
   # Start both frontend and backend in development mode
   npm run dev
   ```

5. **Build for production**
   ```bash
   # Build both frontend and backend
   npm run build
   
   # Start production server
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```
# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/url-shortener

# Client
VITE_API_URL=http://localhost:5000/api

# Set to 'production' in production
NODE_ENV=development
```

## Project Structure

```
url-shortener/
├── client/               # Frontend React application
├── server/               # Backend Express application
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── index.ts          # Server entry point
├── .env.example         # Example environment variables
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

## Available Scripts

- `npm run dev` - Start development server (both frontend and backend)
- `npm run client` - Start frontend development server
- `npm run server` - Start backend development server
- `npm run build` - Build both frontend and backend for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Check TypeScript types

## API Endpoints

- `POST /api/shorturl` - Create a new short URL
- `GET /api/shorturl` - Get all URLs
- `GET /:shortCode` - Redirect to original URL
- `GET /api/shorturl/:shortCode/stats` - Get URL statistics

## License

MIT
```
