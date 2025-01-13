const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // Make sure to export app from app.js

let mongoServer;

beforeAll(async () => {
    // Create an in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    // Clear database before each test
    await mongoose.connection.db.dropDatabase();
});

describe('Product API Tests', () => {
    let productId;
    const testProduct = {
        name: 'Test Product',
        inventory: 100
    };

    describe('POST /api/products', () => {
        it('should create a new product', async () => {
            const res = await request(app)
                .post('/api/products')
                .send(testProduct);

            expect(res.status).toBe(201);
            expect(res.body.name).toBe(testProduct.name);
            expect(res.body.inventory).toBe(testProduct.inventory);
            expect(res.body._id).toBeDefined();

            productId = res.body._id;
        });

        it('should fail if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/products')
                .send({ name: 'Test Product' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should fail if name is too short', async () => {
            const res = await request(app)
                .post('/api/products')
                .send({ name: 'Te', inventory: 100 });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('at least 3 characters');
        });
    });

    describe('GET /api/products', () => {
        beforeEach(async () => {
            // Create a test product before each test
            const res = await request(app)
                .post('/api/products')
                .send(testProduct);
            productId = res.body._id;
        });

        it('should get all products', async () => {
            const res = await request(app).get('/api/products');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBe(1);
            expect(res.body[0].name).toBe(testProduct.name);
        });

        it('should get a product by ID', async () => {
            const res = await request(app).get(`/api/products/${productId}`);

            expect(res.status).toBe(200);
            expect(res.body.name).toBe(testProduct.name);
            expect(res.body._id).toBe(productId);
        });

        it('should return 404 for non-existent product', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/products/${fakeId}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/products/:id', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/products')
                .send(testProduct);
            productId = res.body._id;
        });

        it('should update a product', async () => {
            const updatedData = {
                name: 'Updated Product',
                inventory: 150
            };

            const res = await request(app)
                .put(`/api/products/${productId}`)
                .send(updatedData);

            expect(res.status).toBe(200);
            expect(res.body.name).toBe(updatedData.name);
            expect(res.body.inventory).toBe(updatedData.inventory);
        });

        it('should fail to update with invalid data', async () => {
            const res = await request(app)
                .put(`/api/products/${productId}`)
                .send({ inventory: -1 });

            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/products/:id', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/products')
                .send(testProduct);
            productId = res.body._id;
        });

        it('should delete a product', async () => {
            const res = await request(app)
                .delete(`/api/products/${productId}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Product deleted successfully');

            // Verify product is deleted
            const getRes = await request(app).get(`/api/products/${productId}`);
            expect(getRes.status).toBe(404);
        });

        it('should return 404 when deleting non-existent product', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).delete(`/api/products/${fakeId}`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/products/sales', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/products')
                .send(testProduct);
            productId = res.body._id;
        });

        it('should reduce inventory on sale', async () => {
            const saleQuantity = 30;
            const res = await request(app)
                .post('/api/products/sales')
                .send({
                    productId: productId,
                    quantity: saleQuantity
                });

            expect(res.status).toBe(200);
            expect(res.body.inventory).toBe(testProduct.inventory - saleQuantity);
        });

        it('should fail when product not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post('/api/products/sales')
                .send({
                    productId: fakeId,
                    quantity: 30
                });

            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/products/inventory', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/products')
                .send(testProduct);
            productId = res.body._id;
        });

        it('should increase inventory', async () => {
            const addQuantity = 50;
            const res = await request(app)
                .post('/api/products/inventory')
                .send({
                    productId: productId,
                    quantity: addQuantity
                });

            expect(res.status).toBe(200);
            expect(res.body.inventory).toBe(testProduct.inventory + addQuantity);
        });

        it('should fail when product not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post('/api/products/inventory')
                .send({
                    productId: fakeId,
                    quantity: 50
                });

            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/products/reduce-inventory', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/products')
                .send(testProduct);
            productId = res.body._id;
        });

        it('should reduce inventory', async () => {
            const reduceQuantity = 30;
            const res = await request(app)
                .post('/api/products/reduce-inventory')
                .send({
                    productId: productId,
                    quantity: reduceQuantity
                });

            expect(res.status).toBe(200);
            expect(res.body.inventory).toBe(testProduct.inventory - reduceQuantity);
        });

        it('should fail when insufficient inventory', async () => {
            const res = await request(app)
                .post('/api/products/reduce-inventory')
                .send({
                    productId: productId,
                    quantity: testProduct.inventory + 1
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Insufficient inventory');
        });

        it('should fail when product not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post('/api/products/reduce-inventory')
                .send({
                    productId: fakeId,
                    quantity: 30
                });

            expect(res.status).toBe(404);
        });
    });
});