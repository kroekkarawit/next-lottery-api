const express = require('express');
const router = express.Router();
const { PrismaClient, Status } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
                credit: 100.50,
                remark: 'Remark',
                status: 'ACTIVE',
                currency: 'USD',
                account_level: "Agent"
            },
        });
        console.log('Created user:', createdUser);
        res.json(createdUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

router.post('/login', async (req, res, next) => {
    const { username, password, ip_address } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    console.log('Login:', req.body)

    try {
        const user = await prisma.user.findFirst({
            where: {
                username: username,
            },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const accessToken = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '7d' });

        res.json({
            id: user.id,
            name: user.name,
            username: user.username,
            mobile: user.mobile,
            credit: user.credit,
            credit_limit: user.credit_limit,
            currency: user.currency,
            is_open_downline: user.is_open_downline,
            account_level: user.account_level,
            status: user.status,
            image: "avatar",
            role: user.role,
            access_token: accessToken,
            ip_address: ip_address
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


router.post('/change-password', async (req, res, next) => {
    const { newPassword, oldPassword } = req.body;
    if (!newPassword || !oldPassword) {
        return res.status(400).json({ message: 'Old password and new password are required' });
    }
    const accessToken = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.decode(accessToken);

    if (decodedToken) {
        const username = decodedToken.username;
        try {
            const user = await prisma.user.findFirst({
                where: {
                    username: username,
                },
            });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const passwordMatch = await bcrypt.compare(oldPassword, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            const newPasswordEncrypted = await bcrypt.hash(newPassword, 10);
            const updatedPassword = await prisma.user.update({
                where: {
                    username: username,
                },
                data: {
                    password: newPasswordEncrypted,
                },
            })
            res.json({
                id: user.id,
                message: 'User password changed'
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    } else {
        res.status(500).json({ error: 'Authentication failed' });
    }
});


process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});

module.exports = router;
