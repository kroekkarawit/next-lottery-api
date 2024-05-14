const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/get/:username', async (req, res) => {
    const username = req.params.username;

    try {
        const user = await prisma.user.findFirst({
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

router.get('/gets', async (req, res) => {

    try {
        const user = await prisma.user.findMany({});

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

router.get('/gen-user', async (req, res, next) => {
    try {
        const createdUser = await prisma.user.create({
            data: {
                name: 'John Doe',
                username: 'johndoe123',
                password: 'password123',
                mobile: '123456789',
                email: 'john@example.com',
                credit: 100.50,
                remark: 'Remark',
                status: 'ACTIVE',
                currency: 'USD',
            },
        });
        console.log('Created user:', createdUser);
        res.json(createdUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});

module.exports = router;
