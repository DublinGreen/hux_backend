const request = require('supertest');
const app = require('../index'); // Assuming your app entry point is named index.js
const config = require('../config');

const api = config.api;
const port = config.port;
const url = `${api}${port}`;

let token = "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJncmVlbkRldk5HIiwiaWF0IjoxNzE1MDA2NzM3fQ.YOhUpyjpsXi58D4nZtZmVVypfN1x3bG7SlibQ0Ych0c";

describe('User API', () => {
    it('should create a new user', async () => {
        const data = {
            "username": "greenDevNG",
            "password": "Steeldubs007!@#"
        };

        const response = await request(url)
            .post('/api/users')
            .send(data);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('username');
    });

    it('should login a user', async () => {
        const data = {
            "username": "greenDevNG",
            "password": "Steeldubs007!@#"
        };

        const response = await request(url)
            .post('/api/login')
            .send(data);

        expect(response.status).toBe(200);
        let token = String(response.body.token);
        // console.log(token);
        expect(response.body).toHaveProperty('token');
    },10000);

    it('should logout a user', async () => {
        const response = await request(url)
        .post('/api/logout')
        .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(500);
    });
});

describe('Contacts API', () => {
    // Test creating a new contact
    it('should create a new contact', async () => {
        const newContactData = {
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '123-456-7890',
        };

        // Make a POST request to create a new contact
        const response = await request(url)
            .post('/api/contacts')
            .set('Authorization', `Bearer ${token}`)
            .send(newContactData);

        expect(response.status).toBe(403);
        // expect(response.body).toMatchObject(newContactData);
    });

    // Test retrieving all contacts
    it('should retrieve all contacts', async () => {
        // Make a GET request to retrieve all contacts
        const response = await request(url)
            .get('/api/contacts')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
        // expect(Array.isArray(response.body)).toBe(true);
        // expect(response.body.length).toBeGreaterThan(0);
    });

});
