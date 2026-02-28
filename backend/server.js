const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
// const doubtRoutes = require('./routes/doubtRoutes');

dotenv.config();

const app = express();

// ==========================================
// 1. MIDDLEWARE (Must come BEFORE routes)
// ==========================================
app.use(cors({
    origin: 'https://momentum-ed.vercel.app', // Your exact Vercel frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json()); // Parses incoming JSON requests

// ==========================================
// 2. DATABASE CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('✅ MongoDB Connected Successfully');
}).catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
});

// ==========================================
// 3. ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
// app.use('/api/doubts', doubtRoutes);

// ==========================================
// 4. GLOBAL ERROR HANDLER (Must come LAST)
// ==========================================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));