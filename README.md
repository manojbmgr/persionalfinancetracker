# Personal Finance Tracker

A full-stack Next.js application for tracking personal finances with MySQL database integration, user authentication, and comprehensive financial management features.

## Features

- 🔐 **User Authentication**: Secure login and registration system
- 💰 **Transaction Management**: Add, edit, and delete income and expense transactions
- 📊 **Dashboard**: Visual charts and statistics for financial overview
- 💵 **Budget Tracking**: Set and monitor budgets by category
- 📈 **Analytics**: Monthly spending trends and category-wise expense breakdown
- 👤 **User Profile**: Manage profile information and currency preferences
- 📱 **Responsive Design**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: Next.js 14, React 19, Material-UI
- **Backend**: Next.js API Routes
- **Database**: MySQL with mysql2
- **Authentication**: JWT (JSON Web Tokens)
- **Charts**: Recharts
- **Styling**: Material-UI (MUI)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MySQL (v8.0 or higher)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/manojbmgr/persionalfinancetracker
   cd persionalfinancetracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   - Create a MySQL database
   - Run the SQL schema file:
     ```bash
     mysql -u root -p < database/schema.sql
     ```

4. **Configure environment variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
   ```
   - Update `.env` with your database credentials:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=personal_finance_tracker
     JWT_SECRET=your-secret-key-change-in-production
     ```

## Running the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

3. **For production build:**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
persionalfinancetracker/
├── components/          # React components
│   ├── Dashboard.js
│   ├── Transactions.js
│   ├── Budgets.js
│   ├── Profile.js
│   ├── Login.js
│   ├── Register.js
│   ├── Header.js
│   ├── Footer.js
│   └── Layout.js
├── contexts/           # React contexts
│   ├── AuthContext.js
│   └── FinanceContext.js
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   │   ├── auth/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   └── user/
│   ├── index.js       # Dashboard page
│   ├── transactions.js
│   ├── budgets.js
│   ├── profile.js
│   ├── login.js
│   └── register.js
├── lib/               # Utility libraries
│   ├── db.js         # Database connection
│   └── auth.js       # Authentication utilities
├── utils/             # Helper functions
│   └── api.js        # API client
├── styles/            # Global styles
│   └── globals.css
├── database/          # Database schema
│   └── schema.sql
└── public/            # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - Get all transactions (with optional filters)
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/[id]` - Get a specific transaction
- `PUT /api/transactions/[id]` - Update a transaction
- `DELETE /api/transactions/[id]` - Delete a transaction

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create or update a budget
- `GET /api/budgets/[category]` - Get budget for a category
- `DELETE /api/budgets/[category]` - Delete a budget

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## Features in Detail

### Dashboard
- View total income, expenses, savings, and remaining budget
- Monthly spending trends with bar charts
- Category-wise expense breakdown with pie charts
- Today's expenses list
- Date range filtering

### Transactions
- Add, edit, and delete transactions
- Filter by date range, type, and category
- Support for income and expense types
- Multiple categories (Salary, Food, Housing, etc.)

### Budgets
- Set budgets for different categories
- Visual progress indicators
- Budget exceeded warnings
- Monthly budget tracking

### Profile
- Update name, email, and currency preference
- View lifetime statistics
- Support for multiple currencies (₹, $, €, £, ¥)

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- SQL injection prevention with parameterized queries
- Input validation on both client and server

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material-UI for the component library
- Next.js for the framework
- Recharts for the charting capabilities
