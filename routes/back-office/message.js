const express = require("express");
const router = express.Router();
const { PrismaClient, Status } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { update, isEmpty } = require("lodash");

router.post("/new", async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.decode(accessToken);

    if (!decodedToken) {
      return res.status(404).json({ message: "Authentication failed" });
    }

    const username = decodedToken.username;
    const admin = await prisma.admin.findFirst({
      where: {
        username: username,
      },
    });
    if (!admin) {
      return res.status(404).json({ message: "admin not found" });
    }

    const { message } = req.body;

    const newMessage = await prisma.message.create({
      data: {
        message: message,
      },
    });

    res.json({
      status: "success",
      data: newMessage,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/get", async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.decode(accessToken);

    if (!decodedToken) {
      return res.status(404).json({ message: "Authentication failed" });
    }

    const username = decodedToken.username;
    const admin = await prisma.admin.findFirst({
      where: {
        username: username,
      },
    });
    if (!admin) {
      return res.status(404).json({ message: "admin not found" });
    }

    const messages = await prisma.message.findMany({
      where: {},
    });

    res.json({
      status: "success",
      data: messages,
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
