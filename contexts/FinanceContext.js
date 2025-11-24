import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import { transactionsAPI, budgetsAPI, userAPI, categoriesAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

const initialState = {
  transactions: [],
  budgets: {},
  categories: [],
  user: null,
  loading: true,
};

const financeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
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
    case 'SET_BUDGETS':
      return {
        ...state,
        budgets: action.payload,
      };
    case 'SET_BUDGET':
      return {
        ...state,
        budgets: {
          ...state.budgets,
          [action.payload.category]: action.payload.amount,
        },
      };
    case 'RENAME_CATEGORY':
      const { oldCategory, newCategory } = action.payload;
      const newBudgets = { ...state.budgets };
      if (newBudgets[oldCategory] !== undefined) {
        newBudgets[newCategory] = newBudgets[oldCategory];
        delete newBudgets[oldCategory];
      }
      return {
        ...state,
        budgets: newBudgets,
        transactions: state.transactions.map((t) =>
          t.category === oldCategory ? { ...t, category: newCategory } : t
        ),
        categories: state.categories.map((cat) =>
          cat.name === oldCategory ? { ...cat, name: newCategory } : cat
        ),
      };
    case 'DELETE_BUDGET':
      const budgetsAfterDelete = { ...state.budgets };
      delete budgetsAfterDelete[action.payload];
      return {
        ...state,
        budgets: budgetsAfterDelete,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
      };
    default:
      return state;
  }
};

export const FinanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const { isAuthenticated, user: authUser } = useAuth();

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && authUser) {
      loadData();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, authUser]);

  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Load user profile
      const userResponse = await userAPI.getProfile();
      dispatch({ type: 'SET_USER', payload: userResponse.user });

      // Load transactions
      const transactionsResponse = await transactionsAPI.getAll();
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactionsResponse.transactions });

      // Load budgets
      const budgetsResponse = await budgetsAPI.getAll();
      dispatch({ type: 'SET_BUDGETS', payload: budgetsResponse.budgets });

      // Load categories
      const categoriesResponse = await categoriesAPI.getAll();
      dispatch({ type: 'SET_CATEGORIES', payload: categoriesResponse.categories });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addTransaction = async (transaction) => {
    try {
      const response = await transactionsAPI.create(transaction);
      dispatch({ type: 'ADD_TRANSACTION', payload: response.transaction });
      toast.success('Transaction added successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to add transaction');
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await transactionsAPI.delete(id);
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      toast.success('Transaction deleted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete transaction');
      throw error;
    }
  };

  const updateTransaction = async (transaction) => {
    try {
      const response = await transactionsAPI.update(transaction.id, transaction);
      dispatch({ type: 'UPDATE_TRANSACTION', payload: response.transaction });
      toast.success('Transaction updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update transaction');
      throw error;
    }
  };

  const setBudget = async (category, amount) => {
    try {
      await budgetsAPI.createOrUpdate(category, amount);
      dispatch({ type: 'SET_BUDGET', payload: { category, amount } });
      toast.success(`Budget set for ${category}!`);
    } catch (error) {
      toast.error(error.message || 'Failed to set budget');
      throw error;
    }
  };

  const renameCategory = async (oldCategory, newCategory) => {
    try {
      const response = await budgetsAPI.renameCategory(oldCategory, newCategory);
      dispatch({ type: 'RENAME_CATEGORY', payload: { oldCategory, newCategory } });
      // Reload data to get the updated category in budgets
      await loadData();
      toast.success(`Category renamed from ${oldCategory} to ${newCategory}!`);
    } catch (error) {
      toast.error(error.message || 'Failed to rename category');
      throw error;
    }
  };

  const deleteBudget = async (category) => {
    try {
      await budgetsAPI.delete(category);
      dispatch({ type: 'DELETE_BUDGET', payload: category });
      // Reload data to ensure UI is in sync with database
      await loadData();
      toast.success(`Budget for ${category} deleted!`);
    } catch (error) {
      toast.error(error.message || 'Failed to delete budget');
      throw error;
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await userAPI.updateProfile(userData);
      dispatch({ type: 'SET_USER', payload: response.user });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        state,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        setBudget,
        renameCategory,
        deleteBudget,
        updateUser,
        loadData,
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

