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
    res.cookie('token', token, { httpOnly: true }).status(200).end('Logged in');
}

module.exports = { register, login };