const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require('jsonwebtoken')
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dgcetkk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});


function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
      return res.status(401).send({message: 'unauthorized access'});
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
      if(err){
          return res.status(403).send({message: 'Forbidden access'});
      }
      req.decoded = decoded;
      next();
  })
}


async function run() {
  try {
    const usedBikesItemCollection = client
      .db("usedBikesMart")
      .collection("itemsKey");

    const usedBikesMartCollection = client
      .db("usedBikesMart")
      .collection("usedBikeData");

      const usersCollection = client
      .db("usedBikesMart")
      .collection("users");

      const ordersBookCollection = client
      .db("usedBikesMart")
      .collection("ordersBook");

      app.post('/jwt', (req, res) =>{
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN)
        res.send({token})
    })

    app.put('/user/:email', async (req,res)=>{
      const email = req.params.email
      const user = req.body
      const filter = {email: email}
      const options = {upsert: true}
      const updateDoc = {
        $set: user,
      }
      const result = await usersCollection.updateOne(filter, updateDoc, options)
      console.log(result);

      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: '7d',
      })
      res.send({result, token})
    })

    app.get("/itemsKey", async (req, res) => {
      const query = { };
      const bikesKey = await usedBikesItemCollection.find(query).toArray();
      res.send(bikesKey);
    });

    app.get("/usedBikeData/:id", async (req, res) => {
      const category_id = parseInt(req.params.id)
      const query = {category_id};
      console.log(query);
      const usedBikes = await usedBikesMartCollection.find(query).toArray();
      res.send(usedBikes);
    });

    app.get('/ordersBook', verifyJWT, async(req, res)=>{
      const decoded = req.decoded;
      if(decoded.email !== req.query.email){
          res.status(403).send({message: 'unauthorized access'})
      }
      let query = {};
      if(req.query.email){
          query = {
              email: req.query.email
          }
      }
      const cursor = ordersBookCollection.find(query);
      const ordersBook = await cursor.toArray();
      res.send(ordersBook);
  });

  app.post('/ordersBook', verifyJWT, async (req, res) =>{
    const orders = req.body;
    const result = await ordersBookCollection.insertOne(orders);
    res.send(result);
})

  } finally {
  }
}
run().catch(err =>console.log(err));

app.get("/", async (req, res) => {
  res.send("Used bikes mart server is running");
});

app.listen(port, () => console.log(`Used bikes mart running on ${port}`));
