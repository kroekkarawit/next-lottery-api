const express = require("express");
const router = express.Router();
const { PrismaClient, Status } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { update, isEmpty } = require("lodash");

router.get('/get-round', async (req, res, next) => {
    try {
        const today = new Date();
        const rounds = await prisma.round.findMany({
            where: {
                start_time: {
                    gt: today, // Filter for rounds starting after today
                },
                status: "ACTIVE", // Filter for active rounds
            },
        });

        res.json({
            status: 'success',
            data: rounds
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

router.get('/get-lottery', async (req, res, next) => {
    try {
        const lotteries = await prisma.lottery.findMany({
            where: {
                status: "ACTIVE",
            },
        });
        res.json({
            status: 'success',
            data: lotteries
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});
