const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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

async function run() {
  try {
    const usedBikesItemCollection = client
      .db("usedBikesMart")
      .collection("itemsKey");

    const usedBikesMartCollection = client
      .db("usedBikesMart")
      .collection("usedBikeData");

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
  } finally {
  }
}
run().catch(console.log());

app.get("/", async (req, res) => {
  res.send("Used bikes mart server is running");
});

app.listen(port, () => console.log(`Used bikes mart running on ${port}`));
