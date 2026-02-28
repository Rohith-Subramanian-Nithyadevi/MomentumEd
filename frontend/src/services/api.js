import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Change to Render URL in production
});

// Automatically attach token to every request if it exists
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('momentum_user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export default api;