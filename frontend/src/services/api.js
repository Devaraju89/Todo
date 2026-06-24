import axios from 'axios';

/**
 * API Service — Centralized HTTP client for TaskFlow backend
 * Uses axios with interceptors for consistent error handling
 */

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — unwrap data and handle errors consistently
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

/**
 * Fetch all todos with optional query parameters
 * @param {Object} params - Query parameters (status, priority, category, search, sort)
 * @returns {Promise<Array>} Array of todo objects
 */
export const getAllTodos = async (params = {}) => {
  const response = await api.get('/todos', { params });
  return response;
};

/**
 * Fetch a single todo by ID
 * @param {string} id - Todo ID
 * @returns {Promise<Object>} Todo object
 */
export const getTodoById = async (id) => {
  const response = await api.get(`/todos/${id}`);
  return response;
};

/**
 * Create a new todo
 * @param {Object} data - Todo data { title, description, priority, category, dueDate }
 * @returns {Promise<Object>} Created todo object
 */
export const createTodo = async (data) => {
  const response = await api.post('/todos', data);
  return response;
};

/**
 * Update an existing todo
 * @param {string} id - Todo ID
 * @param {Object} data - Updated todo data
 * @returns {Promise<Object>} Updated todo object
 */
export const updateTodo = async (id, data) => {
  const response = await api.put(`/todos/${id}`, data);
  return response;
};

/**
 * Delete a todo
 * @param {string} id - Todo ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteTodo = async (id) => {
  const response = await api.delete(`/todos/${id}`);
  return response;
};

/**
 * Toggle todo completion status
 * @param {string} id - Todo ID
 * @returns {Promise<Object>} Updated todo with toggled status
 */
export const toggleTodo = async (id) => {
  const response = await api.patch(`/todos/${id}/toggle`);
  return response;
};

/**
 * Get todo statistics (total, completed, pending, overdue)
 * @returns {Promise<Object>} Stats object
 */
export const getStats = async () => {
  const response = await api.get('/todos/stats');
  return response;
};

export default api;
