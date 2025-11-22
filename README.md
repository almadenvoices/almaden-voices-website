# Almaden Voices

A non-profit organization website dedicated to music education and community engagement.

## About

Almaden Voices is a community-focused non-profit that provides music education and hosts various musical events. This website serves as the digital presence for the organization, offering information about courses, events, and ways to support the mission.

## Features

- Responsive design for mobile and desktop
- Course catalog and session information
- Donation system integrated with PayPal
- FAQ and contact pages
- Vision and mission information
- Testimonials showcase

## Tech Stack

### Frontend
- React 19
- Material-UI (MUI)
- Framer Motion for animations
- React Router for navigation
- Swiper for carousels

### Backend
- Node.js with Express
- PayPal API integration for donations
- CORS enabled for API access

## Project Structure

```
almaden-voices/
├── client/              # React frontend application
│   ├── public/         # Static assets
│   ├── src/            # React components and pages
│   └── package.json    # Frontend dependencies
├── server.js           # Express backend server
├── package.json        # Backend dependencies
└── .env.example        # Environment variables template
```

## Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PayPal developer account (for donation features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/almaden-voices.git
   cd almaden-voices
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your PayPal credentials:
   - `PAYPAL_CLIENT_ID`: Your PayPal Client ID
   - `PAYPAL_CLIENT_SECRET`: Your PayPal Secret
   - `PAYPAL_ENV`: Set to `sandbox` for testing, `live` for production

### Running Locally

#### Development Mode (Frontend + Backend)
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

#### Frontend Only
```bash
npm run client
```

#### Backend Only
```bash
npm run server
```

### Building for Production

```bash
npm run build
```

This creates an optimized production build of the React app in `client/build/`.

To run the production build:
```bash
npm start
```

## Deployment

This application is deployed on Google Cloud Platform (GCP) and accessible at:
**https://almadenvoices.org**

### Environment Variables for Production

Ensure the following environment variables are set in your production environment:
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENV=live`
- `PORT` (optional, defaults to 4000)

## Contributing

This is a non-profit project. If you'd like to contribute, please reach out to the organization.

## License

Copyright © 2024 Almaden Voices. All rights reserved.

## Support

For questions or support, please visit our [Contact Page](https://almadenvoices.org/contact) or reach out through the website.
