const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Define the storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
  
  // Create the upload middleware
  const upload = multer({ storage: storage });
  

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

        app.get('/users', async (req, res) => {
            const { email } = req.query;
            const user = await allUsers.findOne({ email });
          
            if (user) {
              // User with this email already exists
              res.json({ alreadyExists: true });
            } else {
              // User does not exist, allow them to proceed to the creator form
              res.json({ alreadyExists: false });
            }
          });
          

        app.get('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const user = await allUsers.findOne(query);
            res.send(user);
        });

        app.get('/uploads/:filename', (req, res) => {
            const filename = req.params.filename;
            const imagePath = path.join(__dirname, 'uploads', filename);
            
            // Check if the file exists
            if (fs.existsSync(imagePath)) {
              // Send the file back to the client
              res.sendFile(imagePath);
            } else {
              // If the file doesn't exist, send an error response
              res.status(404).send('Image not found');
            }
          });

        // app.post('/user', async (req, res) => {
        //     const newUser = req.body;
        //     const result = await allUsers.insertOne(newUser);
        //     res.send(result);
        // })

        app.post('/user', async (req, res) => {
            const newUser = req.body;
          
            // Check if an object with the same email already exists
            const existingUser = await allUsers.findOne({ email: newUser.email });
            if (existingUser) {
              res.send({ insertedId: existingUser._id });
            } else {
              // Object with the same email doesn't exist, create a new object
              const result = await allUsers.insertOne(newUser);
              res.send(result);
            }
          });
       
           
          
        
        app.put('/user/:userId', upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), (req, res) => {
            const userId = req.params.userId;
            const data = JSON.parse(req.body.data); // Parse the JSON string
            
            const name = data.name;
            const socialMedia = data.socialMedia;
            const profileImage = req.files['profileImage'] ? req.files['profileImage'][0] : null;
            const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;
          
            // Create the update object
            const update = {
              $set: {
                name: name,
                socialMedia: socialMedia,
              },
            };
          
            // Check if a new profile image was uploaded
            if (profileImage) {
              update.$set.profileImage = profileImage.filename;
            }
          
            // Check if a new cover image was uploaded
            if (coverImage) {
              update.$set.coverImage = coverImage.filename;
            }
          
            // Update the user in the database
            allUsers
              .updateOne({ _id: new ObjectId(userId) }, update)
              .then(() => {
                res.sendStatus(200);
              })
              .catch((error) => {
                console.error('Error updating user:', error);
                res.sendStatus(500);
              });
          });
          
          
          
          
              
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

 // app.post('/user', upload.single('profileImage'), async (req, res) => {
        //     const newUser = req.body;
        //     const profileImage = req.file; // Access the uploaded file
          
        //     // Check if an object with the same email already exists
        //     const existingUser = await allUsers.findOne({ email: newUser.email });
        //     if (existingUser) {
        //       res.send({ insertedId: existingUser._id });
        //     } else {
        //       // Object with the same email doesn't exist, create a new object
        //       const result = await allUsers.insertOne(newUser);
        //       res.send(result);
        //     }
        //   });          


        // app.delete('/user/:id', async (req, res) =>{
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)};
        //     const erase = await allUsers.deleteOne(query);
        //     res.send(erase);
        // })

        // app.put('/user/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const updateUser = req.body;
        //     const filter = {_id: new ObjectId(id)};
        //     const options = { upsert: true };
        //     const updatedDoc = {
        //         $set : updateUser
        //     }
        //     const result = await allUsers.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        // })   

        //   app.put('/user/:userId', upload.single('profileImage'), (req, res) => {
        //     const userId = req.params.userId;
        //     const name = req.body.name;
        //     const socialMedia = req.body.socialMedia;
        //     const profileImage = req.file;
          
        //     // Create the update object
        //     const update = {
        //       $set: {
        //         name: name,
        //         socialMedia: socialMedia,
        //       },
        //     };
          
        //     // Check if a new profile image was uploaded
        //     if (profileImage) {
        //       update.$set.profileImage = profileImage.filename;
        //     }
          
        //     // Update the user in the database
        //     allUsers.updateOne({ _id: new ObjectId(userId) }, update)
        //       .then(() => {
        //         res.sendStatus(200);
        //       })
        //       .catch((error) => {
        //         console.error('Error updating user:', error);
        //         res.sendStatus(500);
        //       });
        // });

        // app.put('/user/:userId', upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), (req, res) => {
        //     const userId = req.params.userId;
        //     const name = req.body.data.name;
        //     const socialMedia = req.body.data.socialMedia;
        //     const profileImage = req.files['profileImage'] ? req.files['profileImage'][0] : null;
        //     const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;
          
        //     // Create the update object
        //     const update = {
        //       $set: {
        //         name: name,
        //         socialMedia: socialMedia,
        //       },
        //     };
          
        //     // Check if a new profile image was uploaded
        //     if (profileImage) {
        //       update.$set.profileImage = profileImage.filename;
        //     }
          
        //     // Check if a new cover image was uploaded
        //     if (coverImage) {
        //       update.$set.coverImage = coverImage.filename;
        //     }
          
        //     // Update the user in the database
        //     allUsers
        //       .updateOne({ _id: new ObjectId(userId) }, update)
        //       .then(() => {
        //         res.sendStatus(200);
        //       })
        //       .catch((error) => {
        //         console.error('Error updating user:', error);
        //         res.sendStatus(500);
        //       });
        //   });       