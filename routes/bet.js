const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const verifyToken = require('../utils/jwt');
const convertBets = require('../utils/tools');

router.post('/', async (req, res, next) => {
    const { bet, currency } = req.body;
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
                currency: currency,
                bet_method: "MULTIPLY",
                total_amount: null,
                status: "PENDING"
            }
        });


        const betData = bet
        const convertedBets = convertBets(betData);
        let betPrepared = [];

        convertedBets.forEach(bet => {
            if (!bet.number) return;

            Object.entries(bet.bet_type).forEach(([bet_type, bet_amount]) => {
                if (!bet_amount) return;

                Object.entries(bet.lotto_type).forEach(([lottery_type, lottery_value]) => {
                    if (!lottery_value) return;

                    Object.entries(bet.date).forEach(([date, date_value]) => {
                        if (date_value) {
                            console.log(`Number: ${bet.number}, Bet Type: ${bet_type}, Bet Amount: ${bet_amount}, Lottery Type: ${lottery_type}, Date: ${date} \n`);
                            betPrepared.push({
                                user_id: userId,
                                receipt_id: newReceipt.id.toString(),
                                number: bet.number,
                                amount: parseFloat(bet_amount).toFixed(2),
                                bet_type: bet_type,
                                lottery_type: lottery_type,
                                ip_address: null,
                                status: "PENDING",
                                result_date: new Date(date)
                            })
                        }
                    });
                });
            });
        });

        const createBets = await prisma.bet.createMany({
            data: betPrepared,
            skipDuplicates: false
        })

        res.json({
            detail: `240516 2046 (1)
            kp3773
            18/05-19/05
            *MPT
            8909=0.10B 0.10S 0.10A1 0.10C 0.10A 0.10EF
            *PSBK
            (2323)=0.10B 0.10S 0.10A1 0.10C 0.10EA
            18/05
            P 2323=A1(S.O)
            K 23=EA(S.O)
            K 2323=B(S.O)
            K 2323=A1(S.O)
            K 2323=S(S.O)
            K 323=C(S.O)
            19/05
            K 23=EA(S.O)
            K 2323=B(S.O)
            K 2323=A1(S.O)
            K 2323=S(S.O)
            K 323=C(S.O)
            GT=6.50 (SGD)
            GT=22.75 (MYR)`
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


router.post('/receipt', async (req, res, next) => {
    const { user_id, currency, draw_date: result_date, bet_date: created_at } = req.body;


    const decodedToken = verifyToken(req);
    const userId = decodedToken.id.toString();

    try {
        let where = {};

        if (user_id) {
            where.user_id = user_id;
        }

        if (currency) {
            where.currency = currency;
        }

        if (draw_date && draw_date.start && draw_date.end) {
            where.draw_date = {
                gte: new Date(draw_date.start),
                lte: new Date(draw_date.end),
            };
        }

        if (created_at && created_at.start && created_at.end) {
            where.created_at = {
                gte: new Date(created_at.start),
                lte: new Date(created_at.end),
            };
        }
        console.log(where)
        const receipts = await prisma.receipt.findMany({
            where,
        });
        res.json(receipts);


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
