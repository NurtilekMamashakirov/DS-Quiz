import React, { useState } from 'react';
import { createQuestion } from '../../api/api';

const QuestionForm = ({ onQuestionAdded }) => {
    const [text, setText] = useState('');
    const [difficulty, setDifficulty] = useState(300);
    const [answers, setAnswers] = useState([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
    ]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnswerChange = (index, field, value) => {
        const newAnswers = [...answers];

        if (field === 'isCorrect') {
            // Если отмечаем ответ как правильный, сбрасываем все остальные
            newAnswers.forEach((answer, i) => {
                if (i !== index) {
                    newAnswers[i].isCorrect = false;
                }
            });
        }

        newAnswers[index][field] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Проверяем, есть ли хотя бы один правильный ответ
        const hasCorrectAnswer = answers.some(answer => answer.isCorrect);
        if (!hasCorrectAnswer) {
            setError('Должен быть отмечен хотя бы один правильный ответ');
            return;
        }

        // Проверяем, что все варианты ответов заполнены
        const allAnswersFilled = answers.every(answer => answer.text.trim() !== '');
        if (!allAnswersFilled) {
            setError('Все варианты ответов должны быть заполнены');
            return;
        }

        setLoading(true);

        try {
            await createQuestion({ text, difficulty, answers });
            setText('');
            setDifficulty(300);
            setAnswers([
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]);
            onQuestionAdded();
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка при создании вопроса');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card question-form">
            <h2>Добавить новый вопрос</h2>
            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="questionText">Текст вопроса</label>
                    <input
                        type="text"
                        id="questionText"
                        className="form-control"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="difficulty">Сложность</label>
                    <select
                        id="difficulty"
                        className="form-control"
                        value={difficulty}
                        onChange={(e) => setDifficulty(Number(e.target.value))}
                        required
                    >
                        <option value={300}>300 - Легкий</option>
                        <option value={400}>400 - Средний</option>
                        <option value={500}>500 - Сложный</option>
                    </select>
                </div>

                <div className="form-group answers-container">
                    <label>Варианты ответов</label>
                    {answers.map((answer, index) => (
                        <div key={index} className="answer-item">
                            <input
                                type="text"
                                className="form-control"
                                placeholder={`Вариант ответа ${index + 1}`}
                                value={answer.text}
                                onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                                required
                            />
                            <label>
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={answer.isCorrect}
                                    onChange={() => handleAnswerChange(index, 'isCorrect', true)}
                                />
                                Правильный
                            </label>
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    className="btn"
                    disabled={loading}
                >
                    {loading ? 'Создание...' : 'Создать вопрос'}
                </button>
            </form>
        </div>
    );
};

export default QuestionForm;