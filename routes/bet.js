const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const verifyToken = require('../utils/jwt');
const convertBets = require('../utils/tools');

router.post('/', async (req, res, next) => {
    const { bet } = req.body;
    if (!bet) {
        return res.status(400).json({ message: 'bet detail are required' });
    }

    const decodedToken = verifyToken(req);
    const userId = decodedToken.id.toString();

    try {

        const newReceipt = await prisma.receipt.create({
            data: {
                user_id: userId,
                remark: "",
                bet_method: "MULTIPLY",
                total_amount: null,
                status: "PENDING"
            }
        });


        const betData = bet.bet

        const convertedBets = convertBets(betData);
        console.log(convertedBets);
        let betPrepared = [];

        convertedBets.forEach(bet => {
            if (!bet.number) return;

            Object.entries(bet.bet_type).forEach(([bet_type, bet_amount]) => {
                if (!bet_amount) return;

                Object.entries(bet.lotto_type).forEach(([lottery_type, lottery_value]) => {
                    if (!lottery_value) return;

                    Object.entries(bet.date).forEach(([date, date_value]) => {
                        if (date_value) {
                            //console.log(`Number: ${bet.number}, Bet Type: ${bet_type}, Bet Amount: ${bet_amount}, Lottery Type: ${lottery_type}, Date: ${date}`);
                            betPrepared.push({
                                user_id: userId,
                                receipt_id: newReceipt.id,
                                number: bet.number,
                                amount: bet_amount,
                                bet_type: bet_type,
                                lottery_type: lottery_type,
                                ip_address: null,
                                status: "PENDING",
                                result_date: "2024-05-16 14:41:17.222"
                            })
                        }
                    });
                });
            });
        });


        const createBets = await prisma.user.createMany({
            data: betPrepared,
            skipDuplicates: false
        })

        res.json({
            bet
            , user_id, createBets
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
