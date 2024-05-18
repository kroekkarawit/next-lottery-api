const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const verifyToken = require('../utils/jwt');
const convertBets = require('../utils/tools');

router.post('/', async (req, res, next) => {
    const { bet, currency, ip_address } = req.body;
    if (!bet) {
        return res.status(400).json({ message: 'bet detail are required' });
    }

    const decodedToken = verifyToken(req);
    const userId = decodedToken.id.toString();

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        }
    });

    try {
        const newReceipt = await prisma.receipt.create({
            data: {
                user_id: userId,
                remark: "",
                currency: currency,
                bet_method: "MULTIPLY",
                total_amount: 0,
                ip_address: ip_address || null,
                status: "PENDING"
            }
        });

        let totalAmount = 0;
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
                            totalAmount += parseFloat(bet_amount);
                            betPrepared.push({
                                user_id: userId,
                                receipt_id: newReceipt.id.toString(),
                                number: bet.number,
                                amount: parseFloat(bet_amount).toFixed(2),
                                bet_type: bet_type,
                                lottery_type: lottery_type,
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
        });

        const updateReceipt = await prisma.receipt.update({
            where: {
                id: newReceipt.id,
            },
            data: {
                total_amount: totalAmount,
            },
        });

        const updateUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                credit: user.credit - totalAmount,
            },
        });

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
        //TODO: fixing this query cause result time is different
        /*
                if (result_date && result_date.start && result_date.end) {
                    where.result_date = {
                        gte: new Date(result_date.start),
                        lte: new Date(result_date.end),
                    };
                }
        
                */
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

        const preReceipts = receipts.map((i) => {
            return {
                ...i, bet_info: `Page: 1
        Currency: MYR
        Date/Time: May 18, 24 03:46:24 AM
        Bet By: kp3773 (xiaopang)
        
        Draw Type: M-P-T-S-B-K-W-8-9
        Bet Method: Multiply
        Bet Type: B-S-4A-C-A
        Bet Date: Day - D
        Box / IBox: * / **
        Draw Date / Day: # / ##`,

                slip: `240515 1251 (4)
        kp3773
        15/05-18/05
        *MSBH
        9090=0.10B 1S 0.10A1 0.10C 0.10A
        GT=11.20 (SGD)
        GT=39.20 (MYR)
        
        Points:0013 3601 3830 1733`}
        })
        res.json(preReceipts);


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
