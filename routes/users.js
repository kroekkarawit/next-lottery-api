// routes/users.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* GET users listing. */
router.get('/', async (req, res, next) => {
    const users = {
        username: 'John Doe',
        full_name: 'johndoe',
        password: 'password123'
    };
    res.json(users);
});

router.get('/mysql', async (req, res, next) => {
    const mysql = require('mysql');

    // Create a connection to the MySQL server
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'db_user',
        password: 'P!0h42sd5',
        database: 'lottery'
    });

    // Attempt to connect to the database
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err.stack);
            return;
        }

        console.log('Connected to MySQL as id', connection.threadId);
        res.json({
            message: `Connected to MySQL as id ${connection.threadId}`
        });

        connection.end((err) => {
            if (err) {
                console.error('Error closing MySQL connection:', err.stack);
                return;
            }
            console.log('MySQL connection closed');
        });
    });

});


router.get('/mysql-newuser', async (req, res, next) => {
    const mysql = require('mysql');

    // Create a connection to the MySQL server
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'db_user',
        password: 'P!0h42sd5',
        database: 'lottery'
    });

    // Attempt to connect to the database
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err.stack);
            return;
        }

        console.log('Connected to MySQL as id', connection.threadId);
        const userData = {
            name: 'John Doe',
            username: 'johndoe',
            password: 'password123',
            mobile: '123456789',
            email: 'john@example.com',
            credit: 100.50,
            remark: 'Remark',
            status: 'ACTIVE',
            currency: 'USD',
            is_open_downline: true
        };

        // Insert a new user into the database
        connection.query('INSERT INTO user SET ?', userData, (err, result) => {
            if (err) {
                console.error('Error inserting user:', err.stack);
                return;
            }

            console.log('Inserted user with ID:', result.insertId);
            res.json({
                message: `Connected to MySQL as id ${connection.threadId}`,
                data: result
            });

            // Close the connection
            connection.end((err) => {
                if (err) {
                    console.error('Error closing MySQL connection:', err.stack);
                    return;
                }
                console.log('MySQL connection closed');
            });
        });

    });

});


router.get('/gen-user', async (req, res, next) => {
    async function createUser(name, username, password, mobile, email, credit, remark, status, currency, is_open_downline) {
        return prisma.user.create({
            data: {
                name,
                username,
                password,
                mobile,
                email,
                credit,
                remark,
                status,
                currency,
                is_open_downline
            },
        });
    }

    createUser('John Doe', 'johndoe', 'password123', '123456789', 'john@example.com', 100.50, 'Remark', 'ACTIVE', 'USD', true)
        .then((createdUser) => {
            console.log('Created user:', createdUser);
            res.json(createdUser);

        })
        .catch((error) => {
            console.error('Error creating user:', error);
            res.json(error);
        })
        .finally(() => {
            prisma.$disconnect();
        });
});


module.exports = router;
