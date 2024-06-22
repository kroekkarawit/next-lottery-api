const express = require("express");
const router = express.Router();
const { PrismaClient, Status } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.get("/insert", async (req, res, next) => {
  try {
    const lotteries = await prisma.lottery.createMany({
      data: [
        {
          type: "malaysia",
          code: "M",
          detail: {
            name: "Magnum",
            flag: "https://coba8.com/images/mag2.gif",
            color: "#ffff00",
          },
          open_before: 7,
          open_time: new Date("1970-01-01T00:30:00Z"),
          close_weekday: JSON.stringify([2, 5, 6]),
          close_extra: JSON.stringify([]),
          off_holiday: JSON.stringify([]),
          close_after: 0,
          close_time: new Date("1970-01-01T19:00:00Z"),
          result_after: 0,
          result_time: new Date("1970-01-01T20:00:00Z"),
          status: "ACTIVE",
        },
        {
          type: "malaysia",
          code: "P",
          detail: {
            name: "PMP",
            flag: "https://coba8.com/images/pmp2.gif",
            color: "#0000ff",
          },
          open_before: 7,
          open_time: new Date("1970-01-01T00:30:00Z"),
          close_weekday: JSON.stringify([2, 5, 6]),
          close_extra: JSON.stringify([]),
          off_holiday: JSON.stringify([]),
          close_after: 0,
          close_time: new Date("1970-01-01T19:00:00Z"),
          result_after: 0,
          result_time: new Date("1970-01-01T20:00:00Z"),
          status: "ACTIVE",
        },
        {
          type: "malaysia",
          code: "T",
          detail: {
            name: "TOTO",
            flag: "https://coba8.com/images/tot2.gif",
            color: "#cc0000",
          },
          open_before: 7,
          open_time: new Date("1970-01-01T00:30:00Z"),
          close_weekday: JSON.stringify([2, 5, 6]),
          close_extra: JSON.stringify([]),
          off_holiday: JSON.stringify([]),
          close_after: 0,
          close_time: new Date("1970-01-01T19:00:00Z"),
          result_after: 0,
          result_time: new Date("1970-01-01T20:00:00Z"),
          status: "ACTIVE",
        },
        {
          type: "singapore",
          code: "S",
          detail: {
            name: "SINGAPORE",
            flag: "https://coba8.com/images/sin2.gif",
            color: "#4C8ED1",
          },
          open_before: 7,
          open_time: new Date("1970-01-01T00:30:00Z"),
          close_weekday: JSON.stringify([2, 5, 6]),
          close_extra: JSON.stringify([]),
          off_holiday: JSON.stringify([]),
          close_after: 0,
          close_time: new Date("1970-01-01T19:00:00Z"),
          result_after: 0,
          result_time: new Date("1970-01-01T20:00:00Z"),
          status: "ACTIVE",
        },
        {
          type: "malaysia",
          code: "B",
          detail: {
            name: "SABAH",
            flag: "https://coba8.com/images/sab2.gif",
            color: "#E51D20",
          },
          open_before: 7,
          open_time: new Date("1970-01-01T00:30:00Z"),
          close_weekday: JSON.stringify([2, 5, 6]),
          close_extra: JSON.stringify([]),
          off_holiday: JSON.stringify([]),
          close_after: 0,
          close_time: new Date("1970-01-01T19:00:00Z"),
          result_after: 0,
          result_time: new Date("1970-01-01T20:00:00Z"),
          status: "ACTIVE",
        },
        {
          type: "malaysia",
          code: "K",
          detail: {
            name: "SANDAKAN",
            flag: "https://coba8.com/images/san2.gif",
            color: "#E51D20",
          },
          open_before: 7,
          open_time: new Date("1970-01-01T00:30:00Z"),
          close_weekday: JSON.stringify([2, 5, 6]),
          close_extra: JSON.stringify([]),
          off_holiday: JSON.stringify([]),
          close_after: 0,
          close_time: new Date("1970-01-01T19:00:00Z"),
          result_after: 0,
          result_time: new Date("1970-01-01T20:00:00Z"),
          status: "ACTIVE",
        },
        {
          type: "malaysia",
          code: "W",
          detail: {
            name: "SARAWAK",
            flag: "https://coba8.com/images/sar2.gif",
            color: "#00540E",
          },
          open_before: 7,
          open_time: new Date("1970-01-01T00:30:00Z"),
          close_weekday: JSON.stringify([2, 5, 6]),
          close_extra: JSON.stringify([]),
          off_holiday: JSON.stringify([]),
          close_after: 0,
          close_time: new Date("1970-01-01T19:00:00Z"),
          result_after: 0,
          result_time: new Date("1970-01-01T20:00:00Z"),
          status: "ACTIVE",
        },
        {
          type: "malaysia",
          code: "H",
          detail: {
            name: "GD LOTTO",
            flag: "https://coba8.com/images/gd.jpg",
            color: "#ffd700",
          },
          open_before: 7,
          open_time: new Date("1970-01-01T00:30:00Z"),
          close_weekday: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
          close_extra: JSON.stringify([]),
          off_holiday: JSON.stringify([]),
          close_after: 0,
          close_time: new Date("1970-01-01T19:00:00Z"),
          result_after: 0,
          result_time: new Date("1970-01-01T20:00:00Z"),
          status: "ACTIVE",
        },
        {
          type: "malaysia",
          code: "E",
          detail: {
            name: "9 LOTTO",
            flag: "https://coba8.com/images/9lotto.png",
            color: "#ffa500",
          },
          open_before: 7,
          open_time: new Date("1970-01-01T00:30:00Z"),
          close_weekday: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
          close_extra: JSON.stringify([]),
          off_holiday: JSON.stringify([]),
          close_after: 0,
          close_time: new Date("1970-01-01T19:00:00Z"),
          result_after: 0,
          result_time: new Date("1970-01-01T20:00:00Z"),
          status: "ACTIVE",
        },
      ],
    });
    res.json({
      status: "success",
      lotteries,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/insert-thai", async (req, res, next) => {
  try {
    const lotteries = await prisma.lottery.createMany({
      data: [
        {
          type: "thai",
          code: "TH",
          detail: JSON.stringify({
            name: "Thai Lottery",
            flag: "",
            color: "#ffff00",
          }),
          open_before: 12,
          open_time: new Date("1970-01-01T00:30:00Z"),
          close_weekday: JSON.stringify([]),
          close_extra: JSON.stringify(["01-07-2024", "16-07-2024"]),
          off_holiday: JSON.stringify([]),
          close_after: 0,
          close_time: new Date("1970-01-01T14:00:00Z"),
          result_after: 0,
          result_time: new Date("1970-01-01T17:00:00Z"),
          status: "ACTIVE",
        },
      ],
    });
    res.json({
      status: "success",
      lotteries,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/get-round", async (req, res, next) => {
  try {
    const today = new Date();
    const rounds = await prisma.round.findMany({
      where: {
        // start_time: {
        //     gt: today, // Filter for rounds starting after today
        // },
        code: {
          not: "TH",
        },
        status: "ACTIVE", // Filter for active rounds
      },
    });

    res.json({
      status: "success",
      rounds,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/get-round-thai", async (req, res, next) => {
  try {
    const today = new Date();
    const rounds = await prisma.round.findFirst({
      where: {
        code: "TH",
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.json({
      status: "success",
      rounds,
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
