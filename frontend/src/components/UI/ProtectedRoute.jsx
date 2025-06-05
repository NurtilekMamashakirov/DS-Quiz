import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useContext(AuthContext);
    const [isAuthorized, setIsAuthorized] = useState(false);
    
    // Отладочный вывод и проверка прав
    useEffect(() => {
        // Если всё ещё загружается, ничего не делаем
        if (loading) return;
        
        // Проверяем авторизацию
        if (!user) {
            console.log('Пользователь не авторизован, требуется перенаправление на /login');
            setIsAuthorized(false);
            return;
        }
        
        // Проверяем права администратора для админ-маршрутов
        if (adminOnly) {
            // Учитываем разные варианты написания роли
            const userRole = (user.role || user.Role || '').toLowerCase();
            const isAdmin = userRole === 'admin';
            
            console.log('Проверка админ-маршрута:', {
                userRole,
                isAdmin,
                user: JSON.stringify(user)
            });
            
            setIsAuthorized(isAdmin);
        } else {
            // Для обычных защищенных маршрутов достаточно авторизации
            setIsAuthorized(true);
        }
    }, [user, adminOnly, loading]);

    // Показываем загрузку
    if (loading) {
        return <div className="loading-screen">Проверка прав доступа...</div>;
    }

    // Перенаправляем, если не авторизован
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Перенаправляем, если нет прав администратора
    if (adminOnly) {
        const userRole = (user.role || user.Role || '').toLowerCase();
        if (userRole !== 'admin') {
            console.log('Пользователь не админ:', userRole);
            return <Navigate to="/game" />;
        }
    }

    // Возвращаем дочерние компоненты, если всё в порядке
    return children;
};

export default ProtectedRoute;