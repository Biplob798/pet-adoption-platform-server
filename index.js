const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port =process.env.PORT || 5000

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

    // DB collection

    const listingCollection = client.db('petDB').collection('listings')
    const categoryCollection = client.db('petDB').collection('categories')
    const campingCollection = client.db('petDB').collection('campings')


    // listing data 
    app.get('/listings', async(req,res)=>{
        const result= await listingCollection.find().toArray()
        res.send(result)
    })
    // category data 
    app.get('/categories', async(req,res)=>{
        const result= await categoryCollection.find().toArray()
        res.send(result)
    })
    // camping data 
    app.get('/campings', async(req,res)=>{
        const result= await campingCollection.find().toArray()
        res.send(result)
    })
    app.get('/campings/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await campingCollection.findOne(query)
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


app.get('/',(req,res)=>{
    res.send('pet is coming')
})
app.listen(port,()=>{
    console.log(`Pet is coming soon port${port}`)
})