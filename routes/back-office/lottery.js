const express = require("express");
const router = express.Router();
const { PrismaClient, Status } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { update, isEmpty } = require("lodash");

const isValidJSON = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

router.get("/get-round", async (req, res, next) => {
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
      status: "success",
      data: rounds,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/get-lottery", async (req, res, next) => {
  try {
    const lotteries = await prisma.lottery.findMany({
      where: {
        status: "ACTIVE",
      },
    });

    const response = lotteries.map((i) => {
      return {
        ...i,
        detail: isValidJSON(i.detail) ? JSON.parse(i.detail) : i.detail,
        close_weekday: isValidJSON(i.close_weekday)
          ? JSON.parse(i.close_weekday)
          : i.close_weekday,
        close_extra: isValidJSON(i.close_extra)
          ? JSON.parse(i.close_extra)
          : i.close_extra,
        off_holiday: isValidJSON(i.off_holiday)
          ? JSON.parse(i.off_holiday)
          : i.off_holiday,
      };
    });

    res.json({
      status: "success",
      data: response,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});

module.exports = router;
