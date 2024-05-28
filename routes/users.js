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

router.post('/transfer', async (req, res, next) => {
    const { to_user_id, amount, remark } = req.body;

    if (!to_user_id || !amount) {
        return res.status(400).json({ message: 'to_user_id, amount, remark are required' });
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

            const ToUser = await prisma.user.findFirst({
                where: {
                    id: parseInt(to_user_id),
                    referral: user.id.toString(),
                },
            });
            if (!ToUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            const createTransfer = await prisma.transfer.create({
                data: {
                    user_id: parseInt(user.id),
                    to_user_id: parseInt(user.id),
                    remark: remark || "",
                    previous_balance: ToUser,
                    amount: 0,
                    balance: 0
                }
            })

            res.json({
                user, ToUser
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    } else {
        res.status(500).json({ error: 'Authentication failed' });
    }
});

router.post('/package-list', async (req, res, next) => {
    const { bet_type } = req.body;


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
            let package = []

            if (bet_type === '2') {
                package = {
                    "name": "2",
                    "bet_type": "2D",
                    data: [{
                        "2A": {
                            "Price": 1.00,
                            "Commission": 0.00,
                            "Prizes": {
                                "Prize 1": 63.00,
                                "Prize 2": null,
                                "Prize 3": null
                            }
                        },
                        "2F": {
                            "Price": 1.00,
                            "Commission": 0.00,
                            "Prizes": {
                                "Prize 1": 21.00,
                                "Prize 2": 21.00,
                                "Prize 3": 21.00
                            }
                        }
                    }


                    ]
                }
            } else if (bet_type === '56') {
                package = {
                    "name": "6D",
                    "bet_type": "5D/6D",
                    data: [{
                        "5D": {
                            "Price": 1.00,
                            "Commission": 29.00,
                            "Prizes": {
                                "Prize 1": 16500.00,
                                "Prize 2": 5500.00,
                                "Prize 3": 3300.00,
                                "Prize 4": 550.00,
                                "Prize 5": 22.00
                            }
                        },
                        "6D": {
                            "Price": 1.00,
                            "Commission": 29.00,
                            "Prizes": {
                                "Prize 1": 110000.00,
                                "Prize 2": 3300.00,
                                "Prize 3": 330.00,
                                "Prize 4": 33.00,
                                "Prize 5": 4.40,
                                "Prize 6": 5.50
                            }
                        }
                    }

                    ]
                }
            } else {
                package = {
                    "name": "184",
                    "bet_type": "4D/3D",
                    data: [{
                        "Big": {
                            "Price": "1.00",
                            "Commission": "27.00",
                            "Prize 1": "2,730.00",
                            "Prize 2": "1,050.00",
                            "Prize 3": "525.00",
                            "Prize 4": "210.00",
                            "Prize 5": "63.00"
                        },
                        "Small": {
                            "Price": "1.00",
                            "Commission": "27.00",
                            "Prize 1": "3,780.00",
                            "Prize 2": "2,100.00",
                            "Prize 3": "1,050.00",
                            "Prize 4": "4D: 661.50",
                            "Prize 5": "4E: 661.50"
                        },
                        "4A": {
                            "Price": "1.00",
                            "Commission": "27.00",
                            "Prize 1": "6,615.00",
                            "Prize 2": "4B: 6,615.00",
                            "Prize 3": "4C: 6,615.00",
                            "Prize 4": "4D: 661.50",
                            "Prize 5": "4F: 2,205.00"
                        },
                        "A": {
                            "Price": "1.00",
                            "Commission": "27.00",
                            "Prize 1": "693.00",
                            "Prize 2": "3B: 693.00",
                            "Prize 3": "3C: 693.00",
                            "Prize 4": "3D: 69.30",
                            "Prize 5": "3E: 69.30"
                        },
                        "ABC": {
                            "Price": "1.00",
                            "Commission": "27.00",
                            "Prize 1": "231.00",
                            "Prize 2": "231.00",
                            "Prize 3": "231.00"
                        }
                    }, {
                        "BIG": {
                            "IBox 24": {
                                "Prize 1": 113.75,
                                "Prize 2": 43.75,
                                "Prize 3": 21.88,
                                "Starters": 8.75,
                                "Consolation": 2.63
                            },
                            "IBox 12": {
                                "Prize 1": 227.50,
                                "Prize 2": 87.50,
                                "Prize 3": 43.75,
                                "Starters": 17.50,
                                "Consolation": 5.25
                            },
                            "IBox 6": {
                                "Prize 1": 455.00,
                                "Prize 2": 175.00,
                                "Prize 3": 87.50,
                                "Starters": 35.00,
                                "Consolation": 10.50
                            },
                            "IBox 4": {
                                "Prize 1": 682.50,
                                "Prize 2": 262.50,
                                "Prize 3": 131.25,
                                "Starters": 52.50,
                                "Consolation": 15.75
                            }
                        },
                        "SMALL": {
                            "IBox 24": {
                                "Prize 1": 157.50,
                                "Prize 2": 87.50,
                                "Prize 3": 43.75
                            },
                            "IBox 12": {
                                "Prize 1": 315.00,
                                "Prize 2": 175.00,
                                "Prize 3": 87.50
                            },
                            "IBox 6": {
                                "Prize 1": 630.00,
                                "Prize 2": 350.00,
                                "Prize 3": 175.00
                            },
                            "IBox 4": {
                                "Prize 1": 945.00,
                                "Prize 2": 525.00,
                                "Prize 3": 262.50
                            }
                        },
                        "4A": {
                            "IBox 24": 275.63,
                            "IBox 12": 551.25,
                            "IBox 6": 1102.50,
                            "IBox 4": 1653.75
                        },
                        "4B": {
                            "IBox 24": 275.63,
                            "IBox 12": 551.25,
                            "IBox 6": 1102.50,
                            "IBox 4": 1653.75
                        },
                        "4C": {
                            "IBox 24": 275.63,
                            "IBox 12": 551.25,
                            "IBox 6": 1102.50,
                            "IBox 4": 1653.75
                        },
                        "4D": {
                            "IBox 24": 27.56,
                            "IBox 12": 55.13,
                            "IBox 6": 110.25,
                            "IBox 4": 165.38
                        },
                        "4E": {
                            "IBox 24": 27.56,
                            "IBox 12": 55.13,
                            "IBox 6": 110.25,
                            "IBox 4": 165.38
                        },
                        "4F": {
                            "IBox 24": 91.88,
                            "IBox 12": 183.75,
                            "IBox 6": 367.50,
                            "IBox 4": 551.25
                        }
                    }

                    ]
                }
            }

            res.json({ package })
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
