# Polling Web Application - Backend

This document provides an overview of the backend part of the polling web application, including setup instructions and API endpoint descriptions.

## Project Structure

```
backend/
├── main.go          # Entry point of the application
├── handlers/        # Contains HTTP request handlers
│   └── poll.go      # Poll-related request handlers
├── models/          # Contains data models
│   └── poll.go      # Poll data model
└── routes/          # Contains route definitions
    └── routes.go    # API routes for the application
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd polling-app/backend
   ```

2. **Install dependencies:**
   Ensure you have Go installed. You can download it from [golang.org](https://golang.org/dl/).

3. **Run the application:**
   ```
   go run main.go
   ```

   The server will start on `localhost:8080` by default.

## API Endpoints

### Polls

- **Create Poll**
  - **Endpoint:** `POST /api/polls`
  - **Description:** Creates a new poll.
  - **Request Body:** JSON object containing the poll question and options.

- **Get Poll**
  - **Endpoint:** `GET /api/polls/{id}`
  - **Description:** Retrieves a specific poll by ID.

- **Vote on Poll**
  - **Endpoint:** `POST /api/polls/{id}/vote`
  - **Description:** Casts a vote for a specific option in the poll.
  - **Request Body:** JSON object containing the selected option.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.