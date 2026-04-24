const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new citizen
        const newUser = new User({ name, email, password, role: 'citizen' });
        await newUser.save();

        res.status(201).json({ message: 'Citizen registered successfully', user: { name: newUser.name, email: newUser.email, role: newUser.role } });
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // --- HARDCODED ADMIN LOGIC ---
        // If the credentials match the default admin, bypass the database entirely
        if (email === 'admin@ecocity.com' && password === 'admin123') {
            return res.status(200).json({
                message: 'Admin login successful',
                user: { name: 'Chief Administrator', email: 'admin@ecocity.com', role: 'admin' },
                token: 'dummy-jwt-token-admin'
            });
        }

        // --- CITIZEN DB LOGIC ---
        // Check MongoDB for registered citizens
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ 
            message: 'Login successful', 
            user: { name: user.name, email: user.email, role: user.role },
            token: 'dummy-jwt-token-citizen' 
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during login' });
    }
};