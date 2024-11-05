import { useEffect, useState } from 'react';
import axios from 'axios';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { notification } from "antd";

const Authentication = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get('http://localhost:5000/v1/api/validate', { withCredentials: true });
                if (response.status === 200) {
                    navigate('/admin/management');
                }
            } catch (error) {
                notification.info({
                    message: 'Selamat datang di halaman login',
                    description: error.response.data.message,
                  });            }
        };
        checkSession();
    }, [navigate]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/v1/api/login', {
                username,
                password,
            });
            if (response.status === 200) {
                const token = response.data.token;
                document.cookie = `jwt=${token}; path=/; max-age=${60 * 15}`;

                window.location.href = '/admin/management';
            } else {
                setError('Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-blue-100 p-8 rounded-lg shadow-lg max-w-sm mx-auto m-11">
            <h2 className="text-3xl font-bold mb-6 text-blue-700">Login</h2>
            <form className="flex flex-col w-full" onSubmit={handleLogin}>
                <label className="mb-2 text-lg font-medium text-gray-700" htmlFor="username">Username</label>
                <input
                    className="mb-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <label className="mb-2 text-lg font-medium text-gray-700" htmlFor="password">Password</label>
                <div className="relative mb-4">
                    <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </span>
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200" type="submit">
                    Login
                </button>
            </form>
        </div>
    );
};

export default Authentication;
