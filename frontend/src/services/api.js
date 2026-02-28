import axios from 'axios';

const api = axios.create({
    // Add /api to the end of this URL
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