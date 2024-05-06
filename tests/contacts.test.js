const request = require('supertest');
const app = require('../index'); // assuming your app entry point is named index.js

// Use dynamic import for chai
import('chai').then(chai => {
    const { expect } = chai;

    describe('Contacts API', () => {
        let token;

        before((done) => {
            // Perform login to get JWT token
            console.log("HERE");
            request(app)
                .post('/api/login')
                .send({ username: 'greenDevNG', password: 'Steeldubs077!@#' })
                .end((err, res) => {
                    if (err) return done(err);
                    token = res.body.token; // save the token for future requests
                    done();
                });
        });

        describe('POST /api/contacts', () => {
            it('should create a new contact', (done) => {
                request(app)
                    .post('/api/contacts')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        firstName: 'Bernard',
                        lastName: 'Dublin-Green',
                        phoneNumber: '123-456-7890'
                    })
                    .expect(201)
                    .end((err, res) => {
                        if (err) return done(err);
                        // Check if the response contains the newly created contact
                        expect(res.body).to.have.property('id');
                        expect(res.body).to.have.property('userId');
                        expect(res.body.firstName).to.equal('Bernard');
                        expect(res.body.lastName).to.equal('Dublin-Green');
                        expect(res.body.phoneNumber).to.equal('123-456-7890');
                        done();
                    });
            });
        });

        // Add more tests for other endpoints (GET, PUT, DELETE) similarly...
    });
}).catch(err => {
    console.error('Error importing chai:', err);
});
