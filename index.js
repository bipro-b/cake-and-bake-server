const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const res = require('express/lib/response');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express()

const port = process.env.PORT || 5000

// middleware

app.use(cors());

// get fata from client

app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v2bif.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('database connected');

        const database = client.db('cakeDb');

        //connections

        const productsCollection = database.collection('products');

        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('user');
        const reviewCollection = database.collection('review');
        // Get products

        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        // post product

        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('hit the post', product);
            const result = await productsCollection.insertOne(product);

            res.json(result);
        })



        // post user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.json(result);
        })

        // get Admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role == 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        //admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        //get order
        app.get('/orders', async (req, res) => {
            let query = {};
            const email = req.query.email;
            if (email) {
                query = { email: email }
            }
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

        //post order
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })

        // Get reviews
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        })
        // post review
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);

        })
        // delete product 

        app.delete('/products/:id', async (req, res) => {
            const id = req.res.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            console.log('delete', result);
            res.json(result);
        })

        // delete order API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log('delete', result)
            res.json(result);
        })

        // update
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })



    }







    finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.listen(port, () => {
    console.log(`Example app listening at
        http://localhost:${port}`)
})
