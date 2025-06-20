import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';

const FinanceContext = createContext();

const initialState = {
  transactions: [
    
    {
      id: '1',
      type: 'income',
      amount: 55000,
      category: 'Salary',
      date: '2025-06-01',
      note: 'Monthly salary',
    },
    {
      id: '2',
      type: 'expense',
      amount: 2500,
      category: 'Food',
      date: '2025-06-03',
      note: 'Grocery shopping',
    },
    {
      id: '3',
      type: 'expense',
      amount: 6000,
      category: 'Housing',
      date: '2025-06-05',
      note: 'Rent payment',
    },
    {
      id: '4',
      type: 'income',
      amount: 12000,
      category: 'Freelance',
      date: '2025-06-10',
      note: 'Website redesign project',
    },
    {
      id: '5',
      type: 'expense',
      amount: 3000,
      category: 'Transportation',
      date: '2025-06-15',
      note: 'Car fuel',
    },

    
    {
      id: '6',
      type: 'income',
      amount: 55000,
      category: 'Salary',
      date: '2025-05-01',
      note: 'Monthly salary',
    },
    {
      id: '7',
      type: 'expense',
      amount: 2000,
      category: 'Food',
      date: '2025-05-04',
      note: 'Dinner at a restaurant',
    },
    {
      id: '8',
      type: 'expense',
      amount: 5000,
      category: 'Housing',
      date: '2025-05-06',
      note: 'Rent payment',
    },
    {
      id: '9',
      type: 'income',
      amount: 15000,
      category: 'Freelance',
      date: '2025-05-12',
      note: 'Mobile app development',
    },
    {
      id: '10',
      type: 'expense',
      amount: 4000,
      category: 'Entertainment',
      date: '2025-05-18',
      note: 'Concert tickets',
    },

    
    {
      id: '11',
      type: 'income',
      amount: 55000,
      category: 'Salary',
      date: '2025-04-01',
      note: 'Monthly salary',
    },
    {
      id: '12',
      type: 'expense',
      amount: 3000,
      category: 'Food',
      date: '2025-04-05',
      note: 'Grocery shopping',
    },
    {
      id: '13',
      type: 'expense',
      amount: 7000,
      category: 'Housing',
      date: '2025-04-07',
      note: 'Rent payment',
    },
    {
      id: '14',
      type: 'income',
      amount: 10000,
      category: 'Freelance',
      date: '2025-04-15',
      note: 'Logo design project',
    },
    {
      id: '15',
      type: 'expense',
      amount: 2500,
      category: 'Transportation',
      date: '2025-04-20',
      note: 'Bus and train tickets',
    },

    
    {
      id: '16',
      type: 'income',
      amount: 55000,
      category: 'Salary',
      date: '2025-03-01',
      note: 'Monthly salary',
    },
    {
      id: '17',
      type: 'expense',
      amount: 3500,
      category: 'Food',
      date: '2025-03-03',
      note: 'Grocery shopping',
    },
    {
      id: '18',
      type: 'expense',
      amount: 8000,
      category: 'Housing',
      date: '2025-03-05',
      note: 'Rent payment',
    },
    {
      id: '19',
      type: 'income',
      amount: 20000,
      category: 'Freelance',
      date: '2025-03-10',
      note: 'E-commerce website project',
    },
    {
      id: '20',
      type: 'expense',
      amount: 5000,
      category: 'Entertainment',
      date: '2025-03-15',
      note: 'Vacation expenses',
    },
  ],
  budgets: {
    Food: 10000,
    Housing: 20000,
    Transportation: 5000,
    Entertainment: 3000,
  },
  user: {
    name: 'Manoj Yadav',
    email: 'manoj@gmail.com',
    currency: '₹',
  },
};

const financeReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'SET_BUDGET':
      return {
        ...state,
        budgets: {
          ...state.budgets,
          [action.payload.category]: action.payload.amount,
        },
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// Function to initialize state from localStorage or use initialState
const getInitialState = () => {
  const savedState = localStorage.getItem('financeState');
  if (savedState) {
    try {
      return JSON.parse(savedState);
    } catch (e) {
      
      return initialState;
    }
  }
  
  localStorage.setItem('financeState', JSON.stringify(initialState));
  return initialState;
};

export const FinanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState, getInitialState);

  useEffect(() => {
    localStorage.setItem('financeState', JSON.stringify(state));
  }, [state]);

  const addTransaction = (transaction) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    toast.success('Transaction added successfully!');
  };

  const deleteTransaction = (id) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    toast.success('Transaction deleted successfully!');
  };

  const updateTransaction = (transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
    toast.success('Transaction updated successfully!');
  };

  const setBudget = (category, amount) => {
    dispatch({ type: 'SET_BUDGET', payload: { category, amount } });
    toast.success(`Budget set for ${category}!`);
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    toast.success('Profile updated successfully!');
  };

  return (
    <FinanceContext.Provider
      value={{
        state,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        setBudget,
        updateUser,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}; 