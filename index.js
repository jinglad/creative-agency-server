const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();

const app = express();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vpsgc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('ordersPic'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send('Creative Agency')
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db(process.env.DB_NAME).collection("services");
    const ordersCollection = client.db(process.env.DB_NAME).collection("ordersCollection");
    const reviewsCollection = client.db(process.env.DB_NAME).collection("reviews");
    const adminsCollection = client.db(process.env.DB_NAME).collection("admins");

    // app.post('/addService', (req, res) => {
    //     const service = req.body;
    //     // console.log(service);
    //     serviceCollection.insertMany(service)
    //         .then(result => {
    //             console.log(result.insertedCount);
    //             res.send(result.insertedCount);
    //         })
    // })

    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/postOrder', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const description = req.body.description;
        const price = req.body.price;
        const service = req.body.service;
        const serviceIcon = req.body.serviceIcon;
        const newImg = file.data;
        const encImg = newImg.toString('base64');


        file.mv(`${__dirname}/ordersPic/${file.name}`, err => {
            if (err) {
                console.log(err);
                return res.send(500).send({ msg: 'Failed to upload Image' });
            }
        })

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        ordersCollection.insertOne({ name, email, description, price, service, image, serviceIcon })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const description = req.body.description;
        const title = req.body.title;
        const newImg = file.data;
        const encImg = newImg.toString('base64');


        file.mv(`${__dirname}/ordersPic/${file.name}`, err => {
            if (err) {
                console.log(err);
                return res.send(500).send({ msg: 'Failed to upload Image' });
            }
        })

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        serviceCollection.insertOne({ description, title, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/addAdmin', (req, res) => {
        let admin = req.body;
        adminsCollection.insertOne(admin)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/customerOrders', (req, res) => {
        ordersCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get("/fullOrderList", (req, res) => {
        ordersCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addFeedback', (req, res) => {
        let feedback = req.body;
        reviewsCollection.insertOne(feedback)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/feedbacks', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminsCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })
});




const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})