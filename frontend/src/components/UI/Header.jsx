import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <header className="header">
            <div className="container">
                <Link to="/" className="logo">Data Science Quiz</Link>
                <nav>
                    <ul>
                        {user ? (
                            <>
                                <li>
                                    <Link to="/game">Играть</Link>
                                </li>
                                <li>
                                    <Link to="/leaderboard">Лидеры</Link>
                                </li>
                                {user.role === 'admin' && (
                                    <li>
                                        <Link to="/admin">Админ-панель</Link>
                                    </li>
                                )}
                                <li>
                                    <button onClick={logout} className="btn btn-secondary">Выйти</button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/login">Войти</Link>
                                </li>
                                <li>
                                    <Link to="/register">Регистрация</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;