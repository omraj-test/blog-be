const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('../models/UserModel');

const salt = bcrypt.genSaltSync(10);

const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).end('Username or password is missing');
            return;
        }
        if (username.length < 3) {
            res.status(400).end('Username must be at least 3 characters');
            return;
        }
        if (username.length > 20) {
            res.status(400).end('Username must be less than 20 characters');
            return;
        }
        if (password.length < 8) {
            res.status(400).end('Password must be at least 8 characters');
            return;
        }

        const user = await User.create({ username, 
            password : bcrypt.hashSync(password, salt)
        });
        res.status(201).end('User created');
    } catch (error) {
        res.status(500).json(error);
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).end('Username or password is missing');
        return;
    }
    if (username.length < 3) {
        res.status(400).end('Username must be at least 3 characters');
        return;
    }
    if (username.length > 20) {
        res.status(400).end('Username must be less than 20 characters');
        return;
    }
    if (password.length < 8) {
        res.status(400).end('Password must be at least 8 characters');
        return;
    }

    const user = await User.findOne({ username });

    if (!user) {
        res.status(400).end('User not found');
        return;
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (!isPasswordCorrect) {
        res.status(400).end('Password is incorrect');
        return;
    }

    const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'none' }).status(200).json({
        username
    });
}

const profile = async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        res.status(401).end('Not authorized');
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id });
        const { _id, username } = user;
        res.status(200).json({ _id, username });
    } catch (error) {
        res.status(401).end('Not authorized');
    }
}

const logout = async (req, res) => {
    res.clearCookie('token').status(200).end('Logged out');
}

module.exports = { register, login, profile, logout };