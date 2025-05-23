# Pidwin Assessment

The Pidwin Fullstack Assessment.

## Project setup

Enter each folder:

- backend
- frontend

and run the following command

```bash
npm install
```

---

## Backend

Create a **.env file** and populate the fields.

Now in the backend folder. Run the start
command

```bash
npm run start
```

The backend is now up and running.

---

## Frontend

The frontend is your standard create-react-app, the default ReadME is provided under frontend/readme.md for reference.

## Environment Setup

### Required Environment Variables

The application requires specific environment variables to function properly. These are stored in a `.env` file in the `backend` directory.

1. Copy the `.env.example` file to create your own `.env` file:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit your `.env` file with the appropriate values:

   - **PORT**: The port on which the backend server will run (e.g., 8000)
   - **MONGODB_URL**: MongoDB connection string (e.g., mongodb://127.0.0.1:27017/luckySevenDB)
   - **JWT_SECRET**: Secret key for JWT token generation (must be unique and secure)
   - **JWT_EXPIRES_IN**: JWT token expiration time (e.g., 24h)
