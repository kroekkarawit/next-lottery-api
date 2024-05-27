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

        const updateUser = await prisma.user.update({
            where: {
                username: username,
            },
            data: {
                ip_address: ip_address,
            },
        });

        const getDownlineUser = await prisma.user.findMany({
            where: {
                referral: user.id.toString(),
            },
            select: {
                id: true,
                username: true,
                name: true,
                credit: true,
                currency: true
            },
        })

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
            downline_user: getDownlineUser,
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

router.get('/get-credit', async (req, res, next) => {

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

            res.json({
                id: user.id,
                credit: user.credit
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    } else {
        res.status(500).json({ error: 'Authentication failed' });
    }
});

router.post('/add-user', async (req, res, next) => {
    const { account_detail, prize_package, settings } = req.body;

    if (!account_detail || !prize_package || !settings) {
        return res.status(400).json({ message: 'account_detail, prize_package, settings are required' });
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
            const hashedPassword = await bcrypt.hash(account_detail.password, 10);
            const currencyObject = account_detail.currency
            // Convert to array of strings
            const resultArray = Object.keys(currencyObject)
                .filter(key => currencyObject[key])
                .map(key => key.toUpperCase());
            const currencyString = JSON.stringify(resultArray).replace(/"/g, "'");

            //const currencyString = []
            const newUser = await prisma.user.create({
                data: {
                    name: account_detail.full_name,
                    username: account_detail.login_id,
                    password: hashedPassword,
                    mobile: account_detail.mobile,
                    credit: 0,
                    credit_limit: account_detail.credit_limit || 0,
                    remark: account_detail.remark,
                    status: 'ACTIVE',
                    account_level: 'User',
                    currency: currencyString,
                    is_open_downline: account_detail.open_downline,
                    referral: user.id.toString(),
                    sub_user_setting: "",
                    position_taking: JSON.stringify(account_detail.position_taking),
                    position_taking_9Lotto: JSON.stringify(account_detail.position_taking_9Lotto),
                    position_taking_GD: JSON.stringify(account_detail.position_taking_GD),
                    auto_transfer: "",
                    manual_transfer: "",
                    ip_address: ''
                }
            })

            res.json({
                newUser
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
