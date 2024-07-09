const express = require("express");
const router = express.Router();
const { PrismaClient, Status } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const mockResult = {
  m: {
    "MAGNUM (M)": {
      "1ST": "5203",
      "2ND": "4035",
      "3RD": "4787",
      STARTERS: [
        "2109",
        "9757",
        "8761",
        "8801",
        "7472",
        "7899",
        "1560",
        "1415",
        "6408",
        "1659",
      ],
      CONSOLATIONS: [
        "6058",
        "0117",
        "0348",
        "3351",
        "9642",
        "7114",
        "3564",
        "0350",
        "6374",
        "4649",
      ],
    },
  },
  p: {
    "PMP (P)": {
      "1ST": "1393",
      "2ND": "4112",
      "3RD": "7050",
      STARTERS: [
        "5620",
        "6533",
        "7016",
        "8774",
        "7778",
        "4560",
        "9854",
        "0206",
        "3900",
        "7617",
      ],
      CONSOLATIONS: [
        "1385",
        "4569",
        "1839",
        "5096",
        "8254",
        "5586",
        "6848",
        "5366",
        "9300",
        "9290",
      ],
    },
  },
  t: {
    "TOTO (T)": {
      "1ST": "1737",
      "2ND": "5238",
      "3RD": "2297",
      STARTERS: [
        "8207",
        "3493",
        "9114",
        "5799",
        "3787",
        "0965",
        "9183",
        "3228",
        "9858",
        "4014",
      ],
      CONSOLATIONS: [
        "5195",
        "3900",
        "6925",
        "2145",
        "6848",
        "9994",
        "0191",
        "4955",
        "2108",
        "9620",
      ],
    },
    "TOTO 5D (T)": {
      "1ST": "77579",
      "4TH": "7579",
      "2ND": "00328",
      "5TH": "579",
      "3RD": "61165",
      "6TH": "79",
    },
    "TOTO 6D (T)": {
      "1ST": "609314",
      "2ND": ["60931", "09314"],
      "3RD": ["6093", "9314"],
      "4TH": ["609", "314"],
      "5TH": ["60", "14"],
    },
  },
  s: {
    "SINGAPORE (S)": {
      "1ST": "1080",
      "2ND": "6727",
      "3RD": "3927",
      STARTERS: [
        "0029",
        "0386",
        "1417",
        "2530",
        "3334",
        "4486",
        "5164",
        "5724",
        "7933",
        "9597",
      ],
      CONSOLATIONS: [
        "1208",
        "1358",
        "3970",
        "4664",
        "6224",
        "6226",
        "7823",
        "7823",
        "8672",
        "9255",
      ],
    },
  },
  b: {
    "SABAH (B)": {
      "1ST": "6392",
      "2ND": "7748",
      "3RD": "8892",
      STARTERS: [
        "9576",
        "6201",
        "5701",
        "4702",
        "2930",
        "6375",
        "5307",
        "6211",
        "3725",
        "0456",
      ],
      CONSOLATIONS: [
        "4041",
        "7104",
        "9454",
        "8652",
        "0602",
        "8529",
        "2457",
        "0705",
        "6213",
        "3953",
      ],
    },
  },
  k: {
    "SANDAKAN (K)": {
      "1ST": "0381",
      "2ND": "4178",
      "3RD": "0744",
      STARTERS: [
        "0152",
        "0553",
        "0375",
        "0087",
        "2528",
        "8009",
        "9183",
        "0627",
        "7731",
        "0984",
      ],
      CONSOLATIONS: [
        "0330",
        "9261",
        "2359",
        "6334",
        "0301",
        "8133",
        "6759",
        "5230",
        "4785",
        "0325",
      ],
    },
  },
  w: {
    "SARAWAK (W)": {
      "1ST": "4845",
      "2ND": "1709",
      "3RD": "5934",
      STARTERS: [
        "3354",
        "8553",
        "9775",
        "1462",
        "1866",
        "1900",
        "7457",
        "3732",
        "6133",
        "5253",
      ],
      CONSOLATIONS: [
        "7990",
        "3453",
        "9697",
        "1846",
        "5992",
        "4477",
        "0484",
        "9968",
        "1356",
        "2806",
      ],
    },
  },
  h: {
    "GD LOTTO (H)": {
      "1ST": "F: 2923",
      "2ND": "M: 6762",
      "3RD": "H: 0774",
      STARTERS: [
        "A: 2360",
        "B: 7815",
        "C: 5748",
        "D: 8293",
        "E: 9221",
        "G: 6072",
        "I: 7712",
        "J: 0423",
        "K: 7913",
        "L: 5940",
      ],
      CONSOLATIONS: [
        "N: 1462",
        "O: 1342",
        "P: 6408",
        "Q: 1928",
        "R: 8492",
        "S: 8019",
        "T: 8555",
        "U: 2257",
        "V: 0467",
        "W: 0237",
      ],
    },
    "DRAGON JACKPOT 6+1D": {
      "1ST": "5575242",
      "2ND": "X575242",
    },
    "GD LOTTO 6D (H)": {
      "1ST": "557524",
      "2ND": ["55752", "57524"],
      "3RD": ["5575", "7524"],
      "4TH": ["557", "524"],
      "5TH": ["55", "24"],
    },
  },
  e: {
    "9LOTTO (E)": {
      "1ST": "G: 6477",
      "2ND": "H: 6493",
      "3RD": "J: 2509",
      STARTERS: [
        "A: 3289",
        "B: 7827",
        "C: 9126",
        "D: 7765",
        "E: 6560",
        "F: 2313",
        "I: 3934",
        "K: 1689",
        "L: 4321",
        "M: 8970",
      ],
      CONSOLATIONS: [
        "N: 3366",
        "O: 5393",
        "P: 9493",
        "Q: 9557",
        "R: 9087",
        "S: 9463",
        "T: 0555",
        "U: 0964",
        "V: 7940",
        "W: 0320",
      ],
    },
    "9LOTTO 6+1D": {
      "1ST": "2008164",
    },
    "9LOTTO 6D (E)": {
      "1ST": "662739",
      "2ND": ["66273", "62739"],
      "3RD": ["6627", "2739"],
      "4TH": ["662", "739"],
      "5TH": ["66", "39"],
    },
  },
};
//Todo: test bo add result first

router.get("/draw-result", async (req, res) => {
  const date = req.params.date;

  try {
    res.json({ results: mockResult });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/draw-winning-number", async (req, res) => {
  const {
    user_id,
    currency,
    draw_date: result_date,
    bet_date: created_at,
    page_number,
  } = req.body;
  try {
    res.json({
      data: [
        {
          account: {
            user: "kp3773",
            name: "xiaopang",
          },
          bet: {
            id: "32779144970",
            date_time: "Jan 01, 00 12:00:00 AM",
          },
          draw: {
            type: "H",
            date: "Jan 30, 24",
          },
          page: null,
          number: "212",
          prize: "#2 (GD) 246.75",
          bet_detail: "1.00 (C)",
          amount: "1.00 (C)",
          strike: "246.75 (C)",
          remark: "",
        },
      ],
      total: {
        bet_detail: "1.00 (C)",
        amount: 1.0,
        strike: 1.0,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/fight-winning-number", async (req, res) => {
  const {
    user_id,
    currency,
    draw_date: result_date,
    bet_date: created_at,
    page_number,
  } = req.body;
  try {
    res.json({});
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/detailed-win-loss", async (req, res) => {
  const { account, page_number, bet_type, draw_date, bet_date, currency } =
    req.body;
  try {
    res.json({
      data: [
        {
          username: "KP3773",
          name: "xiaopang",
          member_turnover: "1",
          player_total: {
            turn_over: "1.00",
            commission: "0.27",
            strike: "0.00",
            total: "-0.73",
          },
          user_id: {
            turn_over: "",
            commission: "",
            strike: "0.00",
            total: "",
          },
          company: {
            turn_over: "1.00",
            commission: "-0.27",
            strike: "0.00",
            total: "0.73",
          },
        },
      ],
      total: {
        member_turnover: "1",
        player_total: {
          turn_over: "1.00",
          commission: "0.27",
          strike: "0.00",

          total: "-0.73",
        },
        user_id: {
          turn_over: "",
          commission: "",
          strike: "0.00",

          total: "",
        },
        company: {
          turn_over: "1.00",
          commission: "-0.27",
          strike: "0.00",

          total: "0.73",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/win-loss", async (req, res) => {
  const { account, page_number, bet_type, draw_date, bet_date, currency } =
    req.body;
  try {
    res.json({
      data: [
        {
          username: "KP3773",
          name: "xiaopang",
          member_turnover: "1",
          player_total: {
            turn_over: "1.00",
            commission: "0.27",
            strike: "0.00",
            total: "-0.73",
          },
          user_id: {
            turn_over: "",
            commission: "",
            strike: "0.00",
            total: "",
          },
          company: {
            turn_over: "1.00",
            commission: "-0.27",
            strike: "0.00",
            total: "0.73",
          },
        },
      ],
      total: {
        member_turnover: "1",
        player_total: {
          turn_over: "1.00",
          commission: "0.27",
          strike: "0.00",

          total: "-0.73",
        },
        user_id: {
          turn_over: "",
          commission: "",
          strike: "0.00",

          total: "",
        },
        company: {
          turn_over: "1.00",
          commission: "-0.27",
          strike: "0.00",

          total: "0.73",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/group-sales", async (req, res) => {
  const { currency, draw_date: result_date } = req.body;
  try {
    res.json({
      data: [
        {
          account: {
            username: "kb1602",
            name: "Fuzhen",
          },
          bet: {
            B: "0.20",
            S: "0",
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
            total: "0.20",
          },
        },
        {
          account: {
            username: "kp3773",
            name: "xiaopang",
          },
          bet: {
            B: "0.20",
            S: "0.20",
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
            "2B": "0.20",
            "2C": "0",
            "2D": "0",
            "2E": "0",
            total: "0.60",
          },
        },
      ],
      grand_total: {
        B: "0.4",
        S: "0.2",
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
        "2B": "0.2",
        "2C": "0",
        "2D": "0",
        "2E": "0",
        total: "0.8",
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/bet-draw-record", async (req, res) => {
  const {
    draw_type,
    bet_type,
    bet_number,
    page_number,
    account,
    currency,
    remark,
    draw_date,
    bet_date,
  } = req.body;
  try {
    res.json({
      data: [
        {
          account: {
            username: "kp3773",
            name: "xiaopang",
          },
          bet_detail: {
            id: "35265121453",
            date_time: "May 29, 24 02:58:42 AM",
          },
          draw: {
            type: "E",
            date: "May 31, 24",
          },
          page: "1",
          number: "9320",
          bet: {
            B: "1",
            S: "0",
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
            total: "1",
          },
        },
      ],
      total: {
        B: "1",
        S: "0",
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
        total: "1",
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/bet-draw-statistics", async (req, res) => {
  const { draw_type, bet_type, account, currency, draw_date, price } = req.body;
  try {
    res.json({
      data: [
        {
          draw_type: "B",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "S",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.1,
            "9_Lotto": 0.1,
            TOTAL: 0.2,
            PERCENTAGE: "40.00%",
          },
        },
        {
          draw_type: "4A",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "A",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.3,
            TOTAL: 0.3,
            PERCENTAGE: "60.00%",
          },
        },
        {
          draw_type: "ABC",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "5D",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "6D",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "4B",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "4C",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "4D",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "4E",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "4F",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "3B",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "3C",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "3D",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "3E",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "2A",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "2B",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "2C",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "2D",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "2E",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "2F",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
      ],
      total: {
        MAGNUM: 0.0,
        PMP: 0.0,
        TOTO: 0.0,
        SINGAPORE: 0.0,
        SABAH: 0.0,
        SANDAKAN: 0.0,
        SARAWAK: 0.0,
        GD: 0.1,
        "9_Lotto": 0.4,
        TOTAL: 0.5,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/fight-number-statistics", async (req, res) => {
  const { draw_type, bet_type, account, currency, draw_date, price } = req.body;
  try {
    res.json({
      data: [
        {
          draw_type: "B",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "S",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0,
            "9_Lotto": 0,
            TOTAL: 0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "4A",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "A",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "ABC",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "5D",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "6D",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "4B",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "4C",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "4D",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "4E",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "4F",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "3B",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "3C",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "3D",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "3E",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "2A",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "2B",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "2C",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "2D",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "2E",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
        {
          draw_type: "2F",
          values: {
            MAGNUM: 0.0,
            PMP: 0.0,
            TOTO: 0.0,
            SINGAPORE: 0.0,
            SABAH: 0.0,
            SANDAKAN: 0.0,
            SARAWAK: 0.0,
            GD: 0.0,
            "9_Lotto": 0.0,
            TOTAL: 0.0,
            PERCENTAGE: "0.00%",
          },
        },
      ],
      total: {
        MAGNUM: 0.0,
        PMP: 0.0,
        TOTO: 0.0,
        SINGAPORE: 0.0,
        SABAH: 0.0,
        SANDAKAN: 0.0,
        SARAWAK: 0.0,
        GD: 0.0,
        "9_Lotto": 0.0,
        TOTAL: 0.0,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/win-loss-preview", async (req, res) => {
  const { draw_type, bet_type, account, currency, draw_date, price } = req.body;
  try {
    res.json({
      data: [
        {
          username: "KP3773",
          name: "xiaopang",
          member_turnover: "1",
          player_total: {
            turn_over: "1.00",
            commission: "0.27",
            total: "-0.73",
          },
          user_id: {
            turn_over: "",
            commission: "",
            total: "",
          },
          company: {
            turn_over: "1.00",
            commission: "-0.27",
            total: "0.73",
          },
        },
      ],
      total: {
        member_turnover: "1",
        player_total: {
          turn_over: "1.00",
          commission: "0.27",
          total: "-0.73",
        },
        user_id: {
          turn_over: "",
          commission: "",
          total: "",
        },
        company: {
          turn_over: "1.00",
          commission: "-0.27",
          total: "0.73",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/sms-report", async (req, res) => {
  const { user_id, draw_date } = req.body;
  try {
    if (user_id) {
      res.json({
        data: [
          {
            account: {
              username: "kp3773",
              name: "xiaopang",
            },
            date_time: "Jan 30, 24 06:45:30 PM",
            sms_number: "60149090369",
            sms: `240130 1845 (2)
          kp3773
          30/01
          *HE
          9338=1B 1S 1A1 1C 1A (Box)
          GT=120
          DRAGON JP 6+1D
          30Jan
          3706515 3712678 3754700
          3769064 3788459
          
          Points:0013 3601 7872 9741
          
          NINE 6+1D
          30Jan
          6011252 1315598 2493521
          4510208 9163398 2819932
          1899205 6643545 4065204
          2861212 8491282 3018368`,
            sms_cost: "0.35",
          },
          {
            account: {
              username: "kp3773",
              name: "xiaopang",
            },
            date_time: "Jan 30, 24 06:33:23 PM",
            sms_number: "60149090369",
            sms: `240130 1845 (2)
          kp3773
          30/01
          *HE
          9338=1B 1S 1A1 1C 1A (Box)
          GT=120
          DRAGON JP 6+1D
          30Jan
          3706515 3712678 3754700
          3769064 3788459
          
          Points:0013 3601 7872 9741
          
          NINE 6+1D
          30Jan
          6011252 1315598 2493521
          4510208 9163398 2819932
          1899205 6643545 4065204
          2861212 8491282 3018368`,
            sms_cost: "0.35",
          },
        ],
        total: {
          cost: "0.35",
        },
      });
    } else {
      res.json({
        data: [
          {
            username: "kp3773",
            sms_cost: "0.35",
          },
        ],
        total: {
          cost: "0.35",
        },
      });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/profit-sharing", async (req, res) => {
  const { user_id, draw_date } = req.body;
  try {
    res.json({
      data: [
        {
          account: "kp3773",
          dates: [
            {
              date: "Apr 27, 24",
              value: 7.04,
              percentage: "100.0000%",
              amount: 0.0,
            },
            {
              date: "Apr 29, 24",
              value: 0.35,
              percentage: "100.0000%",
              amount: 0.0,
            },
            {
              date: "May 05, 24",
              value: 10.04,
              percentage: "100.0000%",
              amount: 0.0,
            },
            {
              date: "May 09, 24",
              value: 0.0,
              percentage: "0.0000%",
              amount: 0.0,
            },
            {
              date: "May 14, 24",
              value: 7.0,
              percentage: "100.0000%",
              amount: 0.0,
            },
            {
              date: "May 15, 24",
              value: 121.9,
              percentage: "100.0000%",
              amount: 0.0,
            },
            {
              date: "May 18, 24",
              value: 31.8,
              percentage: "100.0000%",
              amount: 0.0,
            },
            {
              date: "May 19, 24",
              value: 11.55,
              percentage: "100.0000%",
              amount: 0.0,
            },
            {
              date: "May 28, 24",
              value: 3.49,
              percentage: "100.0000%",
              amount: 0.0,
            },
          ],
          total: 0.0,
        },
        {
          account: "kb1602",
          dates: [
            {
              date: "Apr 27, 24",
              value: 0.0,
              percentage: "0.0000%",
              amount: 0.0,
            },
            {
              date: "Apr 29, 24",
              value: 0.0,
              percentage: "0.0000%",
              amount: 0.0,
            },
            {
              date: "May 05, 24",
              value: 0.0,
              percentage: "0.0000%",
              amount: 0.0,
            },
            {
              date: "May 09, 24",
              value: 28.0,
              percentage: "100.0000%",
              amount: 0.0,
            },
            {
              date: "May 14, 24",
              value: 0.0,
              percentage: "0.0000%",
              amount: 0.0,
            },
            {
              date: "May 15, 24",
              value: 0.0,
              percentage: "0.0000%",
              amount: 0.0,
            },
            {
              date: "May 18, 24",
              value: 0.0,
              percentage: "0.0000%",
              amount: 0.0,
            },
            {
              date: "May 19, 24",
              value: 0.0,
              percentage: "0.0000%",
              amount: 0.0,
            },
            {
              date: "May 28, 24",
              value: 0.0,
              percentage: "0.0000%",
              amount: 0.0,
            },
          ],
          total: 0.0,
        },
      ],

      grand_total: {
        dates: [
          { date: "Apr 27, 24", value: 7.04, percentage: "100%", amount: 0.0 },
          { date: "Apr 29, 24", value: 0.35, percentage: "100%", amount: 0.0 },
          { date: "May 05, 24", value: 10.04, percentage: "100%", amount: 0.0 },
          { date: "May 09, 24", value: 28.0, percentage: "100%", amount: 0.0 },
          { date: "May 14, 24", value: 7.0, percentage: "100%", amount: 0.0 },
          { date: "May 15, 24", value: 121.9, percentage: "100%", amount: 0.0 },
          { date: "May 18, 24", value: 31.8, percentage: "100%", amount: 0.0 },
          { date: "May 19, 24", value: 11.55, percentage: "100%", amount: 0.0 },
          { date: "May 28, 24", value: 3.49, percentage: "100%", amount: 0.0 },
        ],
        total: 0.0,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/bet-summary", async (req, res) => {
  const { round_id } = req.body;
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.decode(accessToken);

    if (decodedToken) {
      const username = decodedToken.username;

      const admin = await prisma.admin.findFirst({
        where: {
          username: username,
        },
      });
      if (!admin) {
        return res.status(404).json({ message: "admin not found" });
      }
    }
    const round = await prisma.round.findFirst({
      where: {
        id: parseInt(round_id),
        status: "ACTIVE",
      },
    });

    if (!round) {
      return res.status(404).json({ message: "round not found" });
    }

    const getAllBet = await prisma.bet.findMany({
      where: {
        lottery_type: round.code,
        //round_id: round_id
      },
    });

    const summarizeAmounts = (data) => {
      const result = {};

      data.forEach((item) => {
        const key = `${item.number}-${item.bet_type}`;
        const amount = parseFloat(item.amount);

        if (result[key]) {
          result[key].total += amount;
        } else {
          result[key] = {
            number: item.number,
            bet_type: item.bet_type,
            total: amount,
          };
        }
      });

      return Object.values(result);
    };

    const summarizedAmounts = summarizeAmounts(getAllBet);

    const betTypes = [
      "B", "S", "4A", "ABC", "A", "5D", "6D", "2A", "2F",
      "three_top", "three_tod", "three_front", "three_under",
      "two_top", "two_under", "one_top", "one_under"
    ];
    
    const filteredData = Object.fromEntries(
      betTypes
        .map((betType) => [
          betType,
          summarizedAmounts.filter((i) => i.bet_type === betType)
        ])
        .filter(([_, value]) => value.length > 0)
    );
    
    const total = Object.fromEntries(
      Object.entries(filteredData).map(([betType, items]) => {
        const sum = items.reduce((acc, item) => {
          const amount = Number(item.total);
          return acc + (isNaN(amount) ? 0 : amount);
        }, 0);
        console.log(`Debug - ${betType}: items=${items.length}, sum=${sum}`);
        return [betType, sum];
      })
    );
    


    res.json({
      round: round,
      data: filteredData,
      total: total
    });
  } catch (error) {
    console.error("Error fetching user:", error);
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
