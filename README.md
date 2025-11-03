# M. Sucre - Frontend

Frontend React application for M. Sucre cake business website.

## Tech Stack

- React
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- Framer Motion
- Axios
- React Icons

## Features

- Bilingual support (English/French)
- User authentication and profile management
- Product catalog with filtering
- Shopping cart and checkout
- Order tracking
- Custom cake ordering
- Combo deals browsing
- Reviews and testimonials
- Newsletter subscription
- Responsive design
- Dark/Light theme support

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── context/         # React contexts (Auth, Cart, Language)
│   ├── hooks/          # Custom hooks
│   ├── utils/           # Utility functions
│   └── App.jsx          # Main app component
├── public/              # Static files
└── package.json
```

## Development Workflow

### Creating a New Feature

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git add .
git commit -m "Add: your feature description"
```

3. Push to GitHub:
```bash
git push origin feature/your-feature-name
```

4. After testing and review, merge to main:
```bash
git checkout main
git merge feature/your-feature-name
git push origin main
```

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5000)

## Build & Deploy

The frontend can be deployed to:
- GitHub Pages (already configured)
- Vercel
- Netlify
- Any static hosting service

For GitHub Pages:
```bash
npm run deploy
```

## License

Private - M. Sucre Business

