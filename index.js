const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j3bt46w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

async function run(){
    try{
        await client.connect();
        
        const allUsers = client.db('user-list').collection('users');

        app.get('/user', async(req,res) => {
            const query = {};
            const cursor = allUsers.find(query);
            const users = await cursor.toArray();
            res.send(users);
        
        });

        app.get('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const user = await allUsers.findOne(query);
            res.send(user);
        });

        app.post('/user', async (req, res) => {
            const newUser = req.body;
            const result = await allUsers.insertOne(newUser);
            res.send(result);
        })

        // app.delete('/user/:id', async (req, res) =>{
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)};
        //     const erase = await allUsers.deleteOne(query);
        //     res.send(erase);
        // })

        app.put('/user/:id', async (req, res) => {
            const id = req.params.id;
            const updateUser = req.body;
            const filter = {_id: new ObjectId(id)};
            const options = { upsert: true };
            const updatedDoc = {
                $set : updateUser
            }
            const result = await allUsers.updateOne(filter, updatedDoc, options);
            res.send(result);
        })       
    }
    finally{

    }
}

run().catch(console.dir);

app.get('/', (req,res) => {
    res.send('Running!!!');
})

app.listen(port, () => {
    console.log('Listening Loud to port', port );
})