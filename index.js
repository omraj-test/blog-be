require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const healthRoute = require('./routes/HealthRoute');
const authRoutes = require('./routes/AuthRoutes');
const postRoutes = require('./routes/PostRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        credentials: true,
        origin: '*'
    }
));


/**
 * Database connection
 */
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection;
db.once('connected', () => console.log('Connected to database'));
db.on('error', (error) => console.error(error));



/**
 * Routes
 */
app.use('/health', healthRoute);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/post', postRoutes)



/**
 * App listen
 */
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
