# Product Catalog Application

This is a React-based application for managing a product catalog. It allows users to view, edit, and import products from a CSV file. The application uses `react-table` for displaying and editing product data, and `axios` for making API requests.

## Features

- View a paginated and sortable product catalog.
- Edit product details directly in the table.
- Import products from a CSV file.
- Loading bar to indicate data fetching status.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later) or yarn (v1.22 or later)

## Getting Started

Follow these instructions to set up and run the project locally.

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Application
1. **Start the development server:**
   ```bash
   npm start
   # or
   yarn start
   ```
2. **Open the application in your browser:**
```bash
   http://localhost:3000
   ```

API Endpoints
GET /api/products: Fetches the list of products.
POST /api/update: Updates a product's details.

TBC