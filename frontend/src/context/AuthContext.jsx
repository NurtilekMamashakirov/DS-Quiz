import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Проверяем, есть ли сохраненный пользователь
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (savedUser && token) {
            try {
                const parsedUser = JSON.parse(savedUser);
                console.log('Загруженные данные пользователя:', parsedUser);
                
                // Стандартизируем роль пользователя
                const normalizedUser = {
                    ...parsedUser,
                    role: (parsedUser.role || parsedUser.Role || '').toLowerCase()
                };
                
                setUser(normalizedUser);
            } catch (error) {
                console.error('Ошибка при загрузке данных пользователя:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }

        setLoading(false);
    }, []);

    const login = (userData, token) => {
        // Нормализуем данные пользователя
        const normalizedUser = {
            ...userData,
            role: (userData.role || userData.Role || '').toLowerCase()
        };
        
        console.log('Сохраняем данные пользователя:', normalizedUser);
        
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const updateUserScore = (newScore) => {
        if (user) {
            const updatedUser = { ...user, score: newScore };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUserScore }}>
            {children}
        </AuthContext.Provider>
    );
};