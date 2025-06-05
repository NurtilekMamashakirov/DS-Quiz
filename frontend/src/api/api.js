import axios from 'axios';

// Используем относительный URL вместо абсолютного, чтобы запросы шли через nginx
const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Автоматически добавляем токен к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Отключаем withCredentials, так как мы используем Bearer токен
    config.withCredentials = false;
        return config;
    },
    (error) => Promise.reject(error)
);

// Добавляем перехватчик ответов для отладки
api.interceptors.response.use(
    response => {
        console.log(`Успешный ответ от ${response.config.url}:`, response.data);
        return response;
    },
    error => {
        console.error(`Ошибка запроса к ${error.config?.url || 'API'}:`, error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Auth API
export const register = (email, password, role = 'user') =>
    api.post('/register', { email, password, role });

export const login = (email, password) =>
    api.post('/login', { email, password });

// Questions API
export const getQuestions = () =>
    api.get('/quiz/questions');

export const createQuestion = (questionData) =>
    api.post('/quiz/questions', questionData);

export const getRandomQuestions = () =>
    api.get('/quiz/random');

export const submitAnswers = (answers) =>
    api.post('/quiz/submit', answers);

// Leaderboard API
export const getLeaderboard = () =>
    api.get('/quiz/leaderboard');

export default api;