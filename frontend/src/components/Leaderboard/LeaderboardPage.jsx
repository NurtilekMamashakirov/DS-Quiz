import React, { useState, useEffect, useContext } from 'react';
import { getLeaderboard } from '../../api/api';
import { AuthContext } from '../../context/AuthContext';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const response = await getLeaderboard();
                setLeaderboard(response.data);
                setError('');
            } catch (err) {
                setError('Ошибка при загрузке таблицы лидеров');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="container">
            <h1>Таблица лидеров</h1>

            {error && <div className="error card">{error}</div>}

            {loading ? (
                <div>Загрузка таблицы лидеров...</div>
            ) : (
                <div className="card">
                    {leaderboard.length === 0 ? (
                        <p>Пока нет данных о лидерах.</p>
                    ) : (
                        <table className="leaderboard-table">
                            <thead>
                            <tr>
                                <th>Место</th>
                                <th>Пользователь</th>
                                <th>Очки</th>
                            </tr>
                            </thead>
                            <tbody>
                            {leaderboard.map((player, index) => (
                                <tr
                                    key={index}
                                    className={player.email === user.email ? 'current-user' : ''}
                                    style={player.email === user.email ? { backgroundColor: '#e6f7ff' } : {}}
                                >
                                    <td>{index + 1}</td>
                                    <td>{player.email}</td>
                                    <td>{player.score}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeaderboardPage;