const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware 

app.use(cors())
app.use(express.json())


// mongoDB 

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vsymadz.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();





    // ------------------
    // DB all collection

    const userCollection = client.db('petDB').collection('users')
    const listingCollection = client.db('petDB').collection('listings')
    const petCollection = client.db('petDB').collection('pets')
    const categoryCollection = client.db('petDB').collection('categories')
    const campingCollection = client.db('petDB').collection('campings')



    // user related api 

    app.get('/users', async (req, res) => {

      const result = await userCollection.find().toArray()
      res.send(result)
    })



    app.post('/users', async (req, res) => {
      const user = req.body
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exist', insertedId: null })
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

      // Admin Api  
      app.patch('/users/admin/:id', async (req, res) => {
        const id = req.params.id
        const filter = { _id: new ObjectId(id) }
        const updatedInfo = {
            $set: {
                role: 'admin'
            }
        }
        const result = await userCollection.updateOne(filter, updatedInfo)
        res.send(result)
    })


    app.delete('/users/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await userCollection.deleteOne(query)
        res.send(result)
    })


    // all data api -----

    // listing data collection
    app.get('/listings', async (req, res) => {
      const result = await listingCollection.find().toArray()
      res.send(result)
    })
    // category data collection
    app.get('/categories', async (req, res) => {
      const result = await categoryCollection.find().toArray()
      res.send(result)
    })
    // camping data collection
    app.get('/campings', async (req, res) => {
      const result = await campingCollection.find().toArray()
      res.send(result)
    })
    app.get('/campings/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await campingCollection.findOne(query)
      res.send(result)
    })

    // pets data collection

    app.get('/pets', async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const result = await petCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/pets', async (req, res) => {
      const petItem = req.body
      const result = await petCollection.insertOne(petItem);
      res.send(result)
    })

    app.delete('/pets/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await petCollection.deleteOne(query)
      res.send(result)
    })






    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('pet is coming')
})
app.listen(port, () => {
  console.log(`Pet is coming soon port${port}`)
})