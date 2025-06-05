import React from 'react';

const QuestionList = ({ questions }) => {
    // Сортируем вопросы по сложности
    const sortedQuestions = [...questions].sort((a, b) => a.difficulty - b.difficulty);

    return (
        <div>
            <h2>Список вопросов ({questions.length})</h2>

            {sortedQuestions.length === 0 ? (
                <div className="card">
                    <p>Вопросы отсутствуют. Создайте первый вопрос!</p>
                </div>
            ) : (
                sortedQuestions.map((question) => (
                    <div key={question.ID} className="card">
                        <h3>
              <span className="badge" style={{
                  backgroundColor:
                      question.difficulty === 300 ? '#28a745' :
                          question.difficulty === 400 ? '#ffc107' :
                              '#dc3545',
                  color: question.difficulty === 400 ? '#212529' : '#fff',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  marginRight: '10px'
              }}>
                {question.difficulty}
              </span>
                            {question.text}
                        </h3>
                        <div>
                            <strong>Варианты ответов:</strong>
                            <ul>
                                {question.answers.map((answer) => (
                                    <li key={answer.ID} style={{
                                        color: answer.isCorrect ? '#28a745' : 'inherit',
                                        fontWeight: answer.isCorrect ? 'bold' : 'normal'
                                    }}>
                                        {answer.text} {answer.isCorrect && '✓'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default QuestionList;