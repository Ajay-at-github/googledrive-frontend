# Google Drive Frontend

A React-based frontend application for Google Drive.

## Project Structure

```
src/
├── api/              # API endpoints
├── components/       # React components
│   ├── common/       # Reusable UI components
│   ├── drive/        # Drive-specific components
│   └── layout/       # Layout components
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── context/          # React context providers
├── utils/            # Utility functions
├── App.jsx           # Root component
└── main.jsx          # Entry point
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_URL=your_api_url_here
VITE_APP_NAME=Google Drive Frontend
```
