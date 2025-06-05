import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/api';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(email, password);
            console.log('Данные пользователя:', response.data.user);
            
            // Убедимся, что роль пользователя обрабатывается правильно
            const userData = {
                ...response.data.user,
                // Преобразуем роль к нижнему регистру для единообразия
                role: (response.data.user.role || response.data.user.Role || '').toLowerCase()
            };
            
            console.log('Обработанные данные пользователя:', userData);
            
            authLogin(userData, response.data.token);
            
            // Перенаправляем на админ-панель, если это админ
            if (userData.role === 'admin') {
                console.log('Перенаправляем в админ-панель');
                navigate('/admin');
            } else {
                navigate('/game');
            }
        } catch (err) {
            console.error('Ошибка при входе:', err);
            setError(err.response?.data?.error || 'Ошибка при входе');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="auth-form card">
                <h2>Вход в систему</h2>
                {error && <div className="error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn"
                        disabled={loading}
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;