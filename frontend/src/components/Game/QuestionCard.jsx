import React from 'react';

const QuestionCard = ({ question, revealed, selectedAnswer, onReveal, onSelectAnswer }) => {
    // Проверяем, какое поле содержит difficulty (может быть 'difficulty' или 'Difficulty')
    const difficultyValue = question.difficulty || question.Difficulty || 0;
    
    if (!revealed) {
        return (
            <div
                className="card question-card hidden"
                onClick={onReveal}
            >
                <h3>{difficultyValue} баллов</h3>
            </div>
        );
    }

    return (
        <div className="card question-card revealed">
            <h3>{question.text || question.Text}</h3>
            <div className="answer-options">
                {(question.answers || question.Answers || []).map((answer) => (
                    <div key={answer.ID} className="answer-option">
                        <label>
                            <input
                                type="radio"
                                name={`question-${question.ID}`}
                                checked={selectedAnswer === answer.ID}
                                onChange={() => onSelectAnswer(answer.ID)}
                            />
                            {answer.text || answer.Text}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;