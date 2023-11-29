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
    const addPetCollection = client.db('petDB').collection('pet')
    const categoryCollection = client.db('petDB').collection('categories')
    const campingCollection = client.db('petDB').collection('campings')




    // jot related api 
    app.post('/jwt', async (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '24d'
      })
      res.send({ token })
    })

    //  middlewares
    const verifyToken = (req, res, next) => {
      // console.log('inside verify token', req.headers.authorization)
      if (!req.headers.authorization)
        return res.status(401).send({ message: 'unauthorized access' })
      const token = req.headers.authorization.split(' ')[1]
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded
        next()
      });

    }




    // use verify admin after verify token 

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email
      const query = { email: email }
      const user = await userCollection.findOne(query)
      const isAdmin = user?.role === 'admin'
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      next()
    }








    // user related api 

    app.get('/users', verifyToken,verifyAdmin, async (req, res) => {

      const result = await userCollection.find().toArray()
      res.send(result)
    })

    // check admin 

    app.get('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email }
      const user = await userCollection.findOne(query)
      let admin = false
      if (user) {
        admin = user?.role === 'admin'
      }
      res.send({ admin })
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
    app.patch('/users/admin/:id',verifyToken,verifyAdmin, async (req, res) => {
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


    app.delete('/users/:id',verifyToken,verifyAdmin, async (req, res) => {
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
    app.post('/campings', async (req, res) => {
      const item = req.body
      const result = await campingCollection.insertOne(item);
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

    //  add pet api  

    app.get('/pet/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await addPetCollection.findOne(query)
      res.send(result)
    })

    app.post('/pet', async (req, res) => {
      const item = req.body
      const result = await addPetCollection.insertOne(item);
      res.send(result)
  })
     

  app.get('/pet', async (req, res) => {
    const result = await addPetCollection.find().toArray()
    res.send(result)
  })

  app.get('/pet', async (req, res) => {
    const email = req.query.email
    const query = { email: email }
    const result = await addPetCollection.find(query).toArray()
    res.send(result)
  })

  
  app.delete('/pet/:id', async (req, res) => {
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const result = await addPetCollection.deleteOne(query)
    res.send(result)
  })

  app.patch('/pet/:id', async (req, res) => {
    const item = req.body
    const id = req.params.id
    const filter = { _id: new ObjectId(id) }
    const updatePet = {
        $set: {
          name: item.name,
          category: item.category,
          age: item.age,
          short: item.short,
          long: item.long,
          image: item.image,

        }
    }
    const result = await addPetCollection.updateOne(filter, updatePet)
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