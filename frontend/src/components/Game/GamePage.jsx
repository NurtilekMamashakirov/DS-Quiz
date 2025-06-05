import React, { useState, useContext, useEffect } from 'react';
import { getRandomQuestions, submitAnswers } from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import QuestionCard from './QuestionCard';

const GamePage = () => {
    const [questions, setQuestions] = useState([]);
    const [revealedQuestions, setRevealedQuestions] = useState({});
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [gameStarted, setGameStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState(null);
    const { user, updateUserScore } = useContext(AuthContext);

    // Загружаем случайные вопросы при старте игры
    const startGame = async () => {
        setLoading(true);
        setError('');
        setRevealedQuestions({});
        setSelectedAnswers({});
        setResults(null);

        try {
            const response = await getRandomQuestions();
            console.log('Полученные вопросы:', response.data); // Отладочная информация
            setQuestions(response.data);
            setGameStarted(true);
        } catch (err) {
            setError('Ошибка при загрузке вопросов');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Открываем вопрос при клике
    const handleRevealQuestion = (questionId) => {
        setRevealedQuestions(prev => ({
            ...prev,
            [questionId]: true
        }));
    };

    // Выбираем ответ на вопрос
    const handleSelectAnswer = (questionId, answerId) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));
    };

    // Отправляем ответы
    const handleSubmitAnswers = async () => {
        if (Object.keys(selectedAnswers).length === 0) {
            setError('Выберите хотя бы один ответ');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Преобразуем выбранные ответы в нужный формат
            const answersArray = Object.entries(selectedAnswers).map(([questionId, answerId]) => ({
                question_id: parseInt(questionId),
                answer_id: parseInt(answerId)
            }));

            const response = await submitAnswers(answersArray);
            setResults(response.data);

            // Обновляем счет пользователя, если результат содержит заработанные очки
            if (response.data.earned_points) {
                updateUserScore(user.score + response.data.earned_points);
            }
        } catch (err) {
            setError('Ошибка при отправке ответов');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Начинаем новую игру
    const handleNewGame = () => {
        setGameStarted(false);
        setQuestions([]);
        setResults(null);
    };

    return (
        <div className="container">
            <h1>Игра Data Science Quiz</h1>

            {error && <div className="error card">{error}</div>}

            {!gameStarted ? (
                <div className="card">
                    <h2>Начать новую игру</h2>
                    <p>Вам будет предложено 9 вопросов по Data Science (по 3 вопроса каждого уровня сложности).</p>
                    <p>Текущий счет: {user.score}</p>
                    <button
                        className="btn"
                        onClick={startGame}
                        disabled={loading}
                    >
                        {loading ? 'Загрузка...' : 'Начать игру'}
                    </button>
                </div>
            ) : (
                <>
                    {results ? (
                        <div className="card">
                            <h2>Результаты</h2>
                            <p>Вы заработали {results.earned_points} очков!</p>
                            <p>Общий счет: {user.score}</p>
                            <button className="btn" onClick={handleNewGame}>Новая игра</button>
                        </div>
                    ) : (
                        <>
                            <div className="question-grid">
                                {questions.map((question) => (
                                    <QuestionCard
                                        key={question.ID}
                                        question={question}
                                        revealed={revealedQuestions[question.ID]}
                                        selectedAnswer={selectedAnswers[question.ID]}
                                        onReveal={() => handleRevealQuestion(question.ID)}
                                        onSelectAnswer={(answerId) => handleSelectAnswer(question.ID, answerId)}
                                    />
                                ))}
                            </div>

                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <button
                                    className="btn"
                                    onClick={handleSubmitAnswers}
                                    disabled={loading || Object.keys(selectedAnswers).length === 0}
                                >
                                    {loading ? 'Отправка...' : 'Отправить ответы'}
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default GamePage;