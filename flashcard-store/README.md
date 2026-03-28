# Flashcard Store

## Overview
The Flashcard Store is a custom-built web application designed to provide parents and educators with offline-first gamified flashcard packs for children. The platform allows users to browse, purchase, and manage educational flashcards, with a focus on physical and printable packs.

## Technology Stack
- **Frontend**: React, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Styling**: CSS (Green and White color scheme)

## Features
- User-friendly interface for browsing and purchasing flashcard packs.
- Admin dashboard for managing products, orders, and inventory.
- Secure payment processing through third-party gateways (e.g., Stripe).
- Responsive design for optimal viewing on various devices.

## Project Structure
```
flashcard-store
├── client
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── styles
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── server
│   ├── src
│   │   ├── routes
│   │   ├── controllers
│   │   ├── models
│   │   ├── middleware
│   │   ├── config
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd flashcard-store
   ```

2. Install dependencies for the client:
   ```
   cd client
   npm install
   ```

3. Install dependencies for the server:
   ```
   cd ../server
   npm install
   ```

4. Set up the database and update the configuration in `server/src/config/database.ts`.

## Running the Application
- Start the server:
  ```
  cd server
  npm run dev
  ```

- Start the client:
  ```
  cd client
  npm start
  ```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.