// API utility functions for Next.js
const API_BASE_URL = '/api';

// Helper function to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to set auth token
const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Helper function to remove auth token
const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
    }
  },

  getCurrentUser: async () => {
    return await apiRequest('/auth/me');
  },
};

// Transactions API
export const transactionsAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.category) queryParams.append('category', filters.category);

    const queryString = queryParams.toString();
    return await apiRequest(`/transactions${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return await apiRequest(`/transactions/${id}`);
  },

  create: async (transaction) => {
    return await apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },

  update: async (id, transaction) => {
    return await apiRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Budgets API
export const budgetsAPI = {
  getAll: async () => {
    return await apiRequest('/budgets');
  },

  getByCategory: async (category) => {
    return await apiRequest(`/budgets/${category}`);
  },

  createOrUpdate: async (category, amount) => {
    return await apiRequest('/budgets', {
      method: 'POST',
      body: JSON.stringify({ category, amount }),
    });
  },

  delete: async (category) => {
    return await apiRequest(`/budgets/${encodeURIComponent(category)}`, {
      method: 'DELETE',
    });
  },

  renameCategory: async (oldCategory, newCategory) => {
    return await apiRequest(`/budgets/${encodeURIComponent(oldCategory)}`, {
      method: 'PUT',
      body: JSON.stringify({ newCategory }),
    });
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    return await apiRequest('/user/profile');
  },

  updateProfile: async (userData) => {
    return await apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    return await apiRequest('/categories');
  },

  create: async (name) => {
    return await apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  update: async (id, name) => {
    return await apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  deleteByName: async (name) => {
    return await apiRequest(`/categories/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  },
};

export { getToken, setToken, removeToken };

