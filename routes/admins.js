// routes/users.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', async (req, res, next) => {
    const users = {
        username: 'John Doe',
        full_name: 'johndoe',
        password: 'password123'
    };
    res.json(users);
});


router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    // Check if email and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {

        /*
        // Find user by email
        const user = await prisma.admin.findUnique({ where: { username } });

        // If user is not found, return error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);

        // If password does not match, return error
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate access token
        const accessToken = jwt.sign({ email: user.email, role: user.role }, '8W8JKqrLYZYkITPCKZszQMxv9n83Ygyv', { expiresIn: '7d' });

        res.json({ "accessToken": "2312klsdklfsdklfkm" });
*/
        res.json({
            id: 1,
            name: "dashtailzz",
            username: 'asdasdasdzzz',
            image: "avatar3zzz",
            password: "passwordzzz",
            email: "dashtailzzz@codeshaper.net",
            resetToken: null,
            resetTokenExpiry: null,
            profile: null,
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
