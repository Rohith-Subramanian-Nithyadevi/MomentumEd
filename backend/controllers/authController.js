const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // SECURITY: Block public admin registration
        if (role === 'admin') {
            return res.status(403).json({ message: 'Admin accounts cannot be registered publicly.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const isVerified = (role === 'student') ? true : false;
        const user = await User.create({ name, email, password, role, isVerified });
        
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // HARDCODED ADMIN CHECK
        if (email === 'admin@gmail.com' && password === 'momentumed@admin') {
            // Find or dynamically create the admin account
            let adminUser = await User.findOne({ email: 'admin@gmail.com' });
            if (!adminUser) {
                adminUser = await User.create({ 
                    name: 'System Admin', email: 'admin@gmail.com', password: 'momentumed@admin', role: 'admin', isVerified: true 
                });
            }
            return res.json({
                _id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role, token: generateToken(adminUser._id)
            });
        }

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (!user.isVerified) {
                return res.status(403).json({ message: 'Your account is pending Admin verification.' });
            }
            res.json({
                _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};