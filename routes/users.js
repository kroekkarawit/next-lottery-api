const express = require("express");
const router = express.Router();
const { PrismaClient, Status } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.get("/get/:username", async (req, res) => {
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
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/gets", async (req, res) => {
  try {
    const user = await prisma.user.findMany({});

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/gen-user", async (req, res, next) => {
  try {
    const createdUser = await prisma.user.create({
      data: {
        name: "John Doe",
        username: "johndoe123",
        password: "password123",
        mobile: "123456789",
        credit: 100.5,
        remark: "Remark",
        status: "ACTIVE",
        currency: "USD",
        account_level: "Agent",
      },
    });
    console.log("Created user:", createdUser);
    res.json(createdUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/login", async (req, res, next) => {
  const { username, password, ip_address } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  console.log("Login:", req.body);

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

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
        referral: parseInt(user.id),
      },
      select: {
        id: true,
        username: true,
        name: true,
        credit: true,
        currency: true,
      },
    });

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
      ip_address: ip_address,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});
router.get("/main-data", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
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
        return res.status(404).json({ message: "User not found" });
      }

      const accountDetails = {};
      const positionTaking = {};
      const userPackage = {};

      res.json({
        account_details: accountDetails,
        position_taking: positionTaking,
        user_package: userPackage,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.post("/change-password", async (req, res, next) => {
  const { newPassword, oldPassword } = req.body;
  if (!newPassword || !oldPassword) {
    return res
      .status(400)
      .json({ message: "Old password and new password are required" });
  }
  const accessToken = req.headers.authorization.split(" ")[1];
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
        return res.status(404).json({ message: "User not found" });
      }
      const passwordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
      const newPasswordEncrypted = await bcrypt.hash(newPassword, 10);
      const updatedPassword = await prisma.user.update({
        where: {
          username: username,
        },
        data: {
          password: newPasswordEncrypted,
        },
      });
      res.json({
        id: user.id,
        message: "User password changed",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.get("/get-credit", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
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
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        credit: user.credit,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.post("/add-user", async (req, res, next) => {
  const { account_detail, prize_package, settings } = req.body;

  if (!account_detail || !prize_package || !settings) {
    return res.status(400).json({
      message: "account_detail, prize_package, settings are required",
    });
  }
  const accessToken = req.headers.authorization.split(" ")[1];
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
        return res.status(404).json({ message: "User not found" });
      }
      const hashedPassword = await bcrypt.hash(account_detail.password, 10);
      const currencyObject = account_detail.currency;
      // Convert to array of strings
      const resultArray = Object.keys(currencyObject)
        .filter((key) => currencyObject[key])
        .map((key) => key.toUpperCase());
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
          status: "ACTIVE",
          account_level: "User",
          currency: currencyString,
          is_open_downline: account_detail.open_downline,
          referral: parseInt(user.id),
          sub_user_setting: "",
          position_taking: JSON.stringify(account_detail.position_taking),
          position_taking_9Lotto: JSON.stringify(
            account_detail.position_taking_9Lotto
          ),
          position_taking_GD: JSON.stringify(account_detail.position_taking_GD),
          auto_transfer: "",
          manual_transfer: "",
          ip_address: "",
        },
      });

      res.json({
        newUser,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.post("/transfer", async (req, res, next) => {
  const { to_user_id, amount, remark } = req.body;

  if (!to_user_id || !amount) {
    return res
      .status(400)
      .json({ message: "to_user_id, amount, remark are required" });
  }
  const accessToken = req.headers.authorization.split(" ")[1];
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
        return res.status(404).json({ message: "User not found" });
      }

      const ToUser = await prisma.user.findFirst({
        where: {
          id: parseInt(to_user_id),
          referral: parseInt(user.id),
        },
      });
      if (!ToUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const createTransfer = await prisma.transfer.create({
        data: {
          user_id: parseInt(user.id),
          to_user_id: parseInt(user.id),
          remark: remark || "",
          previous_balance: ToUser,
          amount: 0,
          balance: 0,
        },
      });

      res.json({
        createTransfer,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Todo: refactor this route
router.get("/package-list", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
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
        return res.status(404).json({ message: "User not found" });
      }

      let package = {
        "2D": {
          name: "2",
          bet_type: "2D",
          data: [
            {
              "2A": {
                Price: 1,
                Commission: 0,
                Prizes: {
                  "Prize 1": 63,
                  "Prize 2": null,
                  "Prize 3": null,
                },
              },
              "2F": {
                Price: 1,
                Commission: 0,
                Prizes: {
                  "Prize 1": 21,
                  "Prize 2": 21,
                  "Prize 3": 21,
                },
              },
            },
          ],
        },
        "5D6D": {
          name: "6D",
          bet_type: "5D/6D",
          data: [
            {
              "5D": {
                Price: 1,
                Commission: 29,
                Prizes: {
                  "Prize 1": 16500,
                  "Prize 2": 5500,
                  "Prize 3": 3300,
                  "Prize 4": 550,
                  "Prize 5": 22,
                },
              },
              "6D": {
                Price: 1,
                Commission: 29,
                Prizes: {
                  "Prize 1": 110000,
                  "Prize 2": 3300,
                  "Prize 3": 330,
                  "Prize 4": 33,
                  "Prize 5": 4.4,
                  "Prize 6": 5.5,
                },
              },
            },
          ],
        },
        "4D3D": {
          name: "184",
          bet_type: "4D/3D",
          data: [
            {
              Big: {
                Price: 1,
                Commission: 27,
                Prizes: {
                  "Prize 1": 2730,
                  "Prize 2": 1050,
                  "Prize 3": 525,
                  "Prize 4": 210,
                  "Prize 5": 63,
                },
              },
              Small: {
                Price: 1,
                Commission: 27,
                Prizes: {
                  "Prize 1": 3780,
                  "Prize 2": 2100,
                  "Prize 3": 1050,
                  "Prize 4": "4D: 661.50",
                  "Prize 5": "4E: 661.50",
                },
              },
              "4A": {
                Price: 1,
                Commission: 27,
                Prizes: {
                  "Prize 1": 6615,
                  "Prize 2": "4B: 6615.00",
                  "Prize 3": "4C: 6615.00",
                  "Prize 4": "4D: 661.50",
                  "Prize 5": "4F: 2205.00",
                },
              },
              A: {
                Price: 1,
                Commission: 27,
                Prizes: {
                  "Prize 1": 693,
                  "Prize 2": "3B: 693.00",
                  "Prize 3": "3C: 693.00",
                  "Prize 4": "3D: 69.30",
                  "Prize 5": "3E: 69.30",
                },
              },
              ABC: {
                Price: 1,
                Commission: 27,
                Prizes: {
                  "Prize 1": 231,
                  "Prize 2": 231,
                  "Prize 3": 231,
                },
              },
            },
            {
              BIG: {
                "IBox 24": {
                  "Prize 1": 113.75,
                  "Prize 2": 43.75,
                  "Prize 3": 21.88,
                  Starters: 8.75,
                  Consolation: 2.63,
                },
                "IBox 12": {
                  "Prize 1": 227.5,
                  "Prize 2": 87.5,
                  "Prize 3": 43.75,
                  Starters: 17.5,
                  Consolation: 5.25,
                },
                "IBox 6": {
                  "Prize 1": 455,
                  "Prize 2": 175,
                  "Prize 3": 87.5,
                  Starters: 35,
                  Consolation: 10.5,
                },
                "IBox 4": {
                  "Prize 1": 682.5,
                  "Prize 2": 262.5,
                  "Prize 3": 131.25,
                  Starters: 52.5,
                  Consolation: 15.75,
                },
              },
              SMALL: {
                "IBox 24": {
                  "Prize 1": 157.5,
                  "Prize 2": 87.5,
                  "Prize 3": 43.75,
                },
                "IBox 12": {
                  "Prize 1": 315,
                  "Prize 2": 175,
                  "Prize 3": 87.5,
                },
                "IBox 6": {
                  "Prize 1": 630,
                  "Prize 2": 350,
                  "Prize 3": 175,
                },
                "IBox 4": {
                  "Prize 1": 945,
                  "Prize 2": 525,
                  "Prize 3": 262.5,
                },
              },
              "4A": {
                "IBox 24": 275.63,
                "IBox 12": 551.25,
                "IBox 6": 1102.5,
                "IBox 4": 1653.75,
              },
              "4B": {
                "IBox 24": 275.63,
                "IBox 12": 551.25,
                "IBox 6": 1102.5,
                "IBox 4": 1653.75,
              },
              "4C": {
                "IBox 24": 275.63,
                "IBox 12": 551.25,
                "IBox 6": 1102.5,
                "IBox 4": 1653.75,
              },
              "4D": {
                "IBox 24": 27.56,
                "IBox 12": 55.13,
                "IBox 6": 110.25,
                "IBox 4": 165.38,
              },
              "4E": {
                "IBox 24": 27.56,
                "IBox 12": 55.13,
                "IBox 6": 110.25,
                "IBox 4": 165.38,
              },
              "4F": {
                "IBox 24": 91.88,
                "IBox 12": 183.75,
                "IBox 6": 367.5,
                "IBox 4": 551.25,
              },
            },
          ],
        },
        main: {
          2: {
            "2A": {
              Price: 1,
              Commission: "0.00%",
              Prizes: {
                "Prize 1": 63,
                "Prize 2": "2B: 63.00",
                "Prize 3": "2C: 63.00",
                "Prize 4": "2D: 6.30",
                "Prize 5": "2E: 6.30",
              },
            },
            "2F": {
              Price: 1,
              Commission: "0.00%",
              Prizes: {
                "Prize 1": 21,
                "Prize 2": 21,
                "Prize 3": 21,
                "Prize 4": null,
                "Prize 5": null,
              },
            },
          },
          56: {
            "5D": {
              Price: 1,
              Commission: "29.00%",
              Prizes: {
                "Prize 1": 16500,
                "Prize 2": 5500,
                "Prize 3": 3300,
                "Prize 4": 550,
                "Prize 5": 22,
                "Prize 6": 5.5,
              },
            },
            "6D": {
              Price: 1,
              Commission: "29.00%",
              Prizes: {
                "Prize 1": 110000,
                "Prize 2": 3300,
                "Prize 3": 330,
                "Prize 4": 33,
                "Prize 5": 4.4,
              },
            },
          },
          184: {
            Big: {
              Price: 1,
              Commission: "27.00%",
              Prizes: {
                "Prize 1": 2730,
                "Prize 2": 1050,
                "Prize 3": 525,
                "Prize 4": 210,
                "Prize 5": 63,
              },
            },
            Small: {
              Price: 1,
              Commission: "27.00%",
              Prizes: {
                "Prize 1": 3780,
                "Prize 2": 2100,
                "Prize 3": 1050,
                "Prize 4": "4D: 661.50",
                "Prize 5": "4E: 661.50",
              },
            },
            "4A": {
              Price: 1,
              Commission: "27.00%",
              Prizes: {
                "Prize 1": 6615,
                "Prize 2": "4B: 6615.00",
                "Prize 3": "4C: 6615.00",
                "Prize 4": "4D: 661.50",
                "Prize 5": "4F: 2205.00",
              },
            },
            A: {
              Price: 1,
              Commission: "27.00%",
              Prizes: {
                "Prize 1": 693,
                "Prize 2": "3B: 693.00",
                "Prize 3": "3C: 693.00",
                "Prize 4": "3D: 69.30",
                "Prize 5": "3E: 69.30",
              },
            },
            ABC: {
              Price: 1,
              Commission: "27.00%",
              Prizes: {
                "Prize 1": 231,
                "Prize 2": 231,
                "Prize 3": 231,
              },
            },
          },
        },
      };
      console.log("package", package);

      res.json(package);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Todo: refactor this route
router.get("/fight-eat-credit", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
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
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        M: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        P: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        T: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "5D": "0",
          "6D": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        S: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        B: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        K: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        W: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        H: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        E: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "6D": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        K: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "6D": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.post("/fight-eat-credit", async (req, res, next) => {
  const { data } = req.body;

  const accessToken = req.headers.authorization.split(" ")[1];
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
        return res.status(404).json({ message: "User not found" });
      }

      const existingRecord = await prisma.fight_eat_credit.findUnique({
        where: {
          user_id: parseInt(user.id),
        },
      });

      if (existingRecord) {
        const updatedFightEat = await prisma.fight_eat_credit.update({
          where: {
            id: existingRecord.id,
          },
          data: {
            magnum: JSON.stringify(data.M),
            pmp: JSON.stringify(data.P),
            toto: JSON.stringify(data.T),
            singapore: JSON.stringify(data.S),
            sabah: JSON.stringify(data.B),
            sandakan: JSON.stringify(data.K),
            sarawak: JSON.stringify(data.W),
            gd: JSON.stringify(data.H),
            nine_lotto: JSON.stringify(data.E),
          },
        });
        res.json({ status: "success", data: updatedFightEat });
      } else {
        // Handle the case where the record doesn't exist
        console.error("Record not found for user_id:", user.id);
        res
          .status(500)
          .json({ error: "Internal server error", details: error.message });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Todo: refactor this route
router.get("/hot-special-number", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
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
        return res.status(404).json({ message: "User not found" });
      }

      const getHotSpecialNumber = await prisma.hot_special_number.findMany({
        where: {
          user_id: parseInt(user.id),
          status: "ACTIVE",
        },
      });
      res.json({ data: getHotSpecialNumber });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.post("/hot-special-number", async (req, res, next) => {
  const { action, data } = req.body;

  const accessToken = req.headers.authorization.split(" ")[1];
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
        return res.status(404).json({ message: "User not found" });
      }

      if (action === "insert") {
        if (data?.bet_position) {
          console.log(data?.bet_position);
        }
        const drawType = data.draw_type; //["M","P"]
        const betType = data.bet_type; //["B","4A"]

        const promises = [];

        for (let i = 0; i < drawType.length; i++) {
          for (let j = 0; j < betType.length; j++) {
            promises.push(
              prisma.hot_special_number.create({
                data: {
                  user_id: parseInt(user.id),
                  number: data.number,
                  draw_type: drawType[i],
                  bet_type: betType[j],
                  amount: parseFloat(data.amount >= 0 ? data.amount : 0),
                },
              })
            );
          }
        }

        await Promise.all(promises);
      } else if (action === "search") {
        const searchHotSpecialNumber = await prisma.hot_special_number.findMany(
          {
            where: {
              number: data.number,
              user_id: parseInt(user.id),
              status: "ACTIVE",
            },
          }
        );
        res.json({ status: "success", data: searchHotSpecialNumber });
      } else if (action === "edit") {
        const updatedHotSpecialNumber = await prisma.hot_special_number.update({
          where: {
            id: parseInt(data.id),
            user_id: parseInt(user.id),
            status: "ACTIVE",
          },
          data: {
            amount: parseFloat(data.amount >= 0 ? data.amount : 0),
          },
        });
      } else {
        const updatedHotSpecialNumber = await prisma.hot_special_number.update({
          where: {
            id: parseInt(data.id),
            id: parseInt(data.id),
            user_id: parseInt(user.id),
            status: "ACTIVE",
          },
          data: {
            status: "INACTIVE",
          },
        });
      }

      res.json({ status: "success" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.status(500).json({ error: "Authentication failed" });
  }
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});

module.exports = router;
