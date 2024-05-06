const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const config = require('./config');

const app = express();
const api = config.api;
const port = config.port;

// Swagger definition
const swaggerDefinition = {
openapi: '3.0.0',
info: {
    title: 'Hux API',
    version: '1.0.0',
    description: 'Documentation for Hux API',
},
servers: [{
    url: `${api}${port}`,
    description: 'Local server',
}],
};
  
// Options for the swagger jsdoc
const options = {
swaggerDefinition,
// Path to the API docs
apis: ['./routes/*.js'],  // Replace with the path to your route files
};
  
// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Serve swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// Middleware to parse JSON request bodies
app.use(express.json());

// MySQL database connection configuration
const db = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

// Connect to MySQL database
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Secret key for JWT
const secretKey = config.secretKey;

// Middleware for JWT authentication
const authenticateJWT = (req, res, next) => {
    let cleanToken = req.headers.authorization;
    const token = cleanToken.slice(7);

    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = decoded;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Middleware to validate contact data
const validateContact = [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required')
];

// Endpoint to create a new user
app.post('/api/users', (req, res) => {
    const { username, password } = req.body;
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.query(sql, [username, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error creating user:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ id: result.insertId, username });
        });
    });
});

// Endpoint for user login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error finding user:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const user = results[0];
        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            const token = jwt.sign({ id: user.id, username: user.username }, secretKey);
            res.json({ token });
        });
    });
});

// Endpoint for user logout
app.post('/api/logout', (req, res) => {
    // Perform logout logic here
    let cleanToken = req.headers.authorization;
    const token = cleanToken.slice(7);
    console.log(token);

    if (token) {
        token = null;
        // jwt.destroy(token); This doesn't work as expected
        res.send('Logout successful!');
    } else {
        res.sendStatus(401);
    }
});


// Endpoint to create a new contact
/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Returns a list of contacts
 *     description: Returns a list of all contacts.
 *     responses:
 *       200:
 *         description: A list of contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 */
app.post('/api/contacts', authenticateJWT, validateContact, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phoneNumber } = req.body;
    const userId = req.user.id;
    const sql = 'INSERT INTO contacts (user_id, first_name, last_name, phone_number) VALUES (?, ?, ?, ?)';
    db.query(sql, [userId, firstName, lastName, phoneNumber], (err, result) => {
        if (err) {
            console.error('Error creating contact:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        const newContact = { id: result.insertId, userId, firstName, lastName, phoneNumber };
        res.status(201).json(newContact);
    });
});

// Endpoint to retrieve a list of all contacts
app.get('/api/contacts', authenticateJWT, (req, res) => {
    const userId = req.user.id;
    const sql = 'SELECT * FROM contacts WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching contacts:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});

// Endpoint to retrieve a single contact
app.get('/api/contacts/:id', authenticateJWT, (req, res) => {
    const id = parseInt(req.params.id);
    const userId = req.user.id;
    const sql = 'SELECT * FROM contacts WHERE id = ? AND user_id = ?';
    db.query(sql, [id, userId], (err, results) => {
        if (err) {
            console.error('Error fetching contact:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json(results[0]);
    });
});

// Endpoint to update a contact
app.put('/api/contacts/:id', authenticateJWT, validateContact, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const userId = req.user.id;
    const { firstName, lastName, phoneNumber } = req.body;
    const sql = 'UPDATE contacts SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ? AND user_id = ?';
    db.query(sql, [firstName, lastName, phoneNumber, id, userId], (err, result) => {
        if (err) {
            console.error('Error updating contact:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        const updatedContact = { id, userId, firstName, lastName, phoneNumber };
        res.json(updatedContact);
    });
});

// Endpoint to delete a contact
app.delete('/api/contacts/:id', authenticateJWT, (req, res) => {
    const id = parseInt(req.params.id);
    const userId = req.user.id;
    const sql = 'DELETE FROM contacts WHERE id = ? AND user_id = ?';
    db.query(sql, [id, userId], (err, result) => {
        if (err) {
            console.error('Error deleting contact:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.send('Contact deleted successfully');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
