const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const verifyToken = require('../utils/jwt');


router.post('/', async (req, res, next) => {
    const { bet } = req.body;
    if (!bet) {
        return res.status(400).json({ message: 'bet detail are required' });
    }

    const decodedToken = verifyToken(req);


    try {
        const newReceipt = await prisma.receipt.create({
            data: {
                user_id: decodedToken.id.toString(),
                remark: "",
                bet_method: "MULTIPLY",
                total_amount: null,
                status: "PENDING"
            }
        });


        const betData = {
            user_id: "user123",
            receipt_id: "abc-123",
            number: "1234",
            amount: 10.00,
            bet_type: "SINGLE",
            lottery_type: "POWERBALL",
            status: "PENDING",
            draw_date: new Date("2024-05-20"),
        };

        const createBets = await prisma.user.createMany({
            data: [
                { name: 'Bob', email: 'bob@prisma.io' },
                { name: 'Bobo', email: 'bob@prisma.io' }, // Duplicate unique key!
                { name: 'Yewande', email: 'yewande@prisma.io' },
                { name: 'Angelique', email: 'angelique@prisma.io' },
            ],
            skipDuplicates: false
        })

        res.json({
            decodedToken, bet
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});



process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});

module.exports = router;
