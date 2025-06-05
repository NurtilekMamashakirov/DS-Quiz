import React, { useContext, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/App.css';

// UI Components
import Header from './UI/Header';
import Footer from './UI/Footer';
import ProtectedRoute from './UI/ProtectedRoute';

// Auth Pages
import Login from './Auth/Login';
import Register from './Auth/Register';

// Ленивая загрузка компонентов для лучшей производительности
const GamePage = lazy(() => import('./Game/GamePage'));
const LeaderboardPage = lazy(() => import('./Leaderboard/LeaderboardPage'));
const AdminPage = lazy(() => import('./Admin/AdminPage'));

// Компонент загрузки
const LoadingScreen = () => (
  <div className="loading-screen">Загрузка компонента...</div>
);

const App = () => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();
    
    // Отслеживаем изменения маршрута для отладки
    useEffect(() => {
        console.log('Текущий маршрут:', location.pathname);
        console.log('Состояние пользователя:', { 
            isAuthenticated: !!user,
            role: user?.role || 'не указана',
            loading 
        });
    }, [location, user, loading]);

    if (loading) {
        return <div className="loading-screen">Загрузка приложения...</div>;
    }

    return (
        <div className="app">
            <Header />

            <main>
                <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                        {/* Публичные маршруты */}
                        <Route
                            path="/login"
                            element={user ? <Navigate to="/game" /> : <Login />}
                        />
                        <Route
                            path="/register"
                            element={user ? <Navigate to="/game" /> : <Register />}
                        />

                        {/* Защищенные маршруты */}
                        <Route
                            path="/game"
                            element={
                                <ProtectedRoute>
                                    <GamePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/leaderboard"
                            element={
                                <ProtectedRoute>
                                    <LeaderboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Перенаправления */}
                        <Route
                            path="/"
                            element={user ? <Navigate to="/game" /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="*"
                            element={
                                <div className="container">
                                    <div className="card error-page">
                                        <h2>Страница не найдена</h2>
                                        <p>Запрошенная страница не существует.</p>
                                        <button 
                                            className="btn"
                                            onClick={() => window.location.href = '/'}
                                        >
                                            Вернуться на главную
                                        </button>
                                    </div>
                                </div>
                            }
                        />
                    </Routes>
                </Suspense>
            </main>

            <Footer />
        </div>
    );
};

export default App;