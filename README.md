## SalesX

A modern sales and analytics dashboard for businesses.

### Features

- Real-time data visualization
- Sales analytics
- Customer insights
- Inventory management
- Employee performance tracking

### Database Integration

The application includes integration with a SQL Server database for KFC Insight replica data. The following endpoints are available:

- `/api/db/test` - Test database connection
- `/api/db/tables` - List all available tables in the database
- `/api/db/columns/:tableName` - Get column information for a specific table
- `/api/db/sample-data/:tableName` - Get sample data from a specific table (top 10 rows)
- `/api/db/simple-sales` - Get basic sales data without table joins
- `/api/db/store-sales` - Get detailed store sales data with store information
- `/api/db/item-sales` - Get item-level sales data
- `/api/db/transaction-items` - Get transaction item details
- `/api/db/void-transactions` - Get void transaction data

### Technologies Used

- **Frontend**: React.js, Material-UI, Recharts
- **Backend**: Node.js, Express
- **Database**: SQL Server
- **Authentication**: JWT

### Getting Started

#### Prerequisites

- Node.js 14+ installed
- npm or yarn

#### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd salesx
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

This will start both the frontend and backend development servers.

### Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express API
- `/docs` - Documentation and guides 