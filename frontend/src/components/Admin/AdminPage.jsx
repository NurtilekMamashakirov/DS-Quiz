import React, { useState, useEffect, useContext } from 'react';
import { getQuestions } from '../../api/api';
import QuestionForm from './QuestionForm';
import QuestionList from './QuestionList';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Отладка данных пользователя
    useEffect(() => {
        console.log('AdminPage: Данные пользователя:', {
            user: user ? JSON.stringify(user) : 'не авторизован', 
            role: user?.role || 'не указана'
        });
    }, [user]);

    // Дополнительная проверка прав администратора
    useEffect(() => {
        // Убедимся, что компонент смонтирован
        const userRole = (user?.role || user?.Role || '').toLowerCase();
        console.log('AdminPage: Проверка роли пользователя:', userRole);
        
        if (userRole !== 'admin') {
            console.log('AdminPage: Пользователь не админ, перенаправляем');
            navigate('/game');
            return;
        }
        
        // Если пользователь админ, загружаем вопросы
        fetchQuestions();
    }, [user, navigate]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            console.log('AdminPage: Запрашиваем список вопросов');
            const response = await getQuestions();
            console.log('AdminPage: Получены вопросы:', response.data);
            setQuestions(response.data);
            setError('');
        } catch (err) {
            console.error('AdminPage: Ошибка при загрузке вопросов:', err);
            
            // Проверяем, является ли ошибка связанной с авторизацией
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('У вас нет прав для доступа к этой странице');
                setTimeout(() => navigate('/game'), 3000);
            } else {
                setError('Ошибка при загрузке вопросов: ' + (err.message || 'Неизвестная ошибка'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionAdded = () => {
        fetchQuestions();
        setShowForm(false);
    };

    // Если пользователь не админ, не показываем содержимое
    const userRole = (user?.role || user?.Role || '').toLowerCase();
    if (userRole !== 'admin') {
        return (
            <div className="container">
                <h1>Доступ запрещен</h1>
                <div className="error card">
                    У вас нет прав для доступа к этой странице.
                    <br />
                    <button 
                        className="btn" 
                        onClick={() => navigate('/game')}
                        style={{ marginTop: '10px' }}
                    >
                        Вернуться к игре
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>Панель администратора</h1>

            {error && <div className="error card">{error}</div>}

            <div className="admin-actions" style={{ marginBottom: '20px' }}>
                <button
                    className="btn"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Скрыть форму' : 'Добавить новый вопрос'}
                </button>
            </div>

            {showForm && (
                <QuestionForm onQuestionAdded={handleQuestionAdded} />
            )}

            {loading ? (
                <div className="loading-indicator">Загрузка вопросов...</div>
            ) : questions && questions.length > 0 ? (
                <QuestionList questions={questions} />
            ) : (
                <div className="card">
                    <p>Вопросы не найдены. Добавьте первый вопрос!</p>
                </div>
            )}
        </div>
    );
};

export default AdminPage;