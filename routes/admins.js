const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', async (req, res, next) => {
    const users = {
        username: 'John Doe',
        full_name: 'johndoe',
        password: 'password123'
    };
    res.json(users);
});

router.get('/get/:username', async (req, res) => {
    const username = req.params.username;

    try {
        const user = await prisma.admin.findFirst({
            where: {
                username: username,
            },
        });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});




router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    // Check if email and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Find user by email
        const user = await prisma.admin.findFirst({
            where: {
                username: username,
            },
        });
        // If user is not found, return error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const accessToken = jwt.sign({ username: user.username }, '8W8JKqrLYZYkITPCKZszQMxv9n83Ygyv', { expiresIn: '7d' });

        res.json({
            id: user.id,
            name: "dashtailzz",
            username: 'asdasdasdzzz',
            image: "avatar3zzz",
            accessToken: accessToken,
            email: "dashtailzzz@codeshaper.net",

        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

router.get('/gen-user', async (req, res, next) => {
    try {
        const createdUser = await prisma.admin.create({
            data: {
                name: 'John Doe',
                username: 'johndoe123',
                password: 'password123',
                status: 'ACTIVE',
                role: "MASTER"
            },
        });
        console.log('Created user:', createdUser);
        res.json(createdUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
