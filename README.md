
# Gift Genius AI

An AI-powered gift suggestion application that leverages OpenAI to provide personalized gift recommendations based on user prompts. This project simulates a full-stack application with a PostgreSQL database backend.

## Features

- OpenAI integration for dynamic product category inference
- Gift suggestions based on natural language prompts
- Product data fetching from DummyJSON API
- Simulated PostgreSQL database for gifts and cart storage
- Search and pagination for gift suggestions
- Shopping cart functionality
- Responsive and modern UI

## Setup and Run Instructions

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Access the application at `http://localhost:8080`

You will need to provide your OpenAI API key to use the AI features.

## Database Schema

The application simulates a PostgreSQL database with the following schema:

### Gifts Table
```sql
CREATE TABLE IF NOT EXISTS gifts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2),
  rating DECIMAL(3, 2),
  stock INTEGER,
  brand VARCHAR(100),
  category VARCHAR(100),
  thumbnail TEXT,
  images TEXT[]
);
```

### Cart Table
```sql
CREATE TABLE IF NOT EXISTS cart (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  gift_id INTEGER NOT NULL REFERENCES gifts(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Optimizations

- Deduplication of products before storing in the database
- Parallel fetching of products from multiple categories
- Efficient search implementation with multiple field matching
- Client-side pagination to minimize data transfer
- Caching of API responses
- Responsive UI with optimized loading states

## API Endpoints

- `GET /gifts` - Fetch paginated gift suggestions with search capability
- `POST /cart/bulk-add` - Bulk add multiple gifts to the cart
- `GET /cart` - Fetch all items in the cart with full gift details

## Technologies Used

- React with TypeScript
- OpenAI API integration
- Tailwind CSS for styling
- Simulated PostgreSQL database (localStorage for demo purposes)
- Modern UI components with shadcn/ui

## Note

This is a frontend-only application that simulates a backend using localStorage. In a production environment, you would use a real PostgreSQL database and implement proper server-side API endpoints.
