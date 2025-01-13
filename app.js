/**
 * ****Introduction*****
 * NB:::: (Auto-Complete or AI Tools on Editor are not ALLOWED)
 *
 *
 * This is an incomplete project that manages product inventory.
 * It has the following functionalities:
 * 1. Creating products
 * 2. Edit existing product details
 * 3. Removing products
 * 4. Track and update inventory levels
 *
 * Your task is to fill up the missing codes and solve any logical errors within the codebase to enable it run properly.
 * Answer all Questions and later explain your code.
 *
 */

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
    /**
     * Question 1
     *
     * Create connection to Mongodb Database.
     */
};

connectDB();

// Product Model
const ProductSchema = new mongoose.Schema({
    /**
     * Question 2
     *
     * Complete the model with the following fields with validations.
     * name: Type (String)
     * inventory: Type (Integer)
     */
});


const Product = mongoose.model('Product', ProductSchema);

// Create a new product
app.post('/api/products', async (req, res) => {
    /**
     * Question 3
     *
     * Create an Query to create new product and return a success status code with error handling.
     */
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        /**
         *  Question 4
         *  Query all products and return a response (Product)
         */
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


// Update a product
app.put('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    const body = req.body;
    try {
        /**
         * Question 5
         *
         * Write a query to find one product, update it with data from body and also return the updated product.
         */
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
    try {
        /**
         * Question 5
         *
         * Write query to delete the product using its :id
         */
        res.json({message: 'Product deleted successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Handle product sales
app.post('/api/products/sales', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({error: 'Product not found'});
        }
        /**
         * Question 6
         *
         * Write a query to reduce the inventory of the product when a sale is made and save it.
         */
        res.json(product);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Reduce inventory
app.post('/api/products/restock', async (req, res) => {

    /**
     * Question 7
     * This API Controller is supposed to help the sales person restock the quantity of the product
     * But there is a logical error with the controller
     *
     * Find and fix logical error that is occurring.
     */

    try {
        const {productId, quantity} = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({error: 'Product not found'});
        }
        if (product.inventory > quantity) {
            return res.status(400).json({error: 'Insufficient inventory'});
        }
        product.inventory -= -quantity;
        await product;
        res.json(product);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV !== 'production' ? err.message : {},
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});