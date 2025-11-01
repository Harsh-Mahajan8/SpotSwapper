import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

// Sign Up
router.post(
    '/signup',
    [
        body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, email, password } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }

            // Create user (password will be hashed by pre-save hook)
            const user = await User.create({
                name,
                email,
                password,
            });

            // Generate JWT
            const token = jwt.sign(
                { userId: user._id.toString() },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                token,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                },
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Server error during signup' });
        }
    }
);

// Log In
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Check password
            const isValidPassword = await user.comparePassword(password);

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Generate JWT
            const token = jwt.sign(
                { userId: user._id.toString() },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                token,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error during login' });
        }
    }
);

export default router;

