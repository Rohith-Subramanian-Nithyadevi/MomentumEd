import axios from 'axios';

const api = axios.create({
    // Make sure to include /api at the end of your Render URL
    baseURL: 'https://momentumed.onrender.com/api', 
});

api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('momentum_user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export default api;