const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/get-user', async (req, res) => {
    try {
        const users = await prisma.user.findUnique({
            where: {
                username: "user",
            },
        })
        if (users.length > 0) {
            res.json(users);
        } else {
            res.status(404).json({ error: 'Users not found' });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
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
        res.status(500).json({ error: 'Internal server error' });
    }
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});

module.exports = router;
