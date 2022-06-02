const express = require("express");
const { randomBytes } = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();

const posts = {};

app.use(bodyParser.json());

// cors configuration
app.use(cors());

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts/create", async (req, res) => {
  try {
    const id = randomBytes(4).toString("hex");
    const { title } = req.body;

    posts[id] = {
      id,
      title,
    };

    await axios.post("http://eventbus-srv:4005/events", {
      type: "PostCreated",
      data: posts[id],
    });

    return res.status(201).send(posts[id]);
  } catch (err) {
    console.log(err.message);
    res.status(400).send({
      error: "An error has occured",
    });
  }
});

app.post("/events", (req, res) => {
  console.log("Event Received", req.body.type);

  res.send({ status: "OK" });
});

app.listen(4000, () => {
  console.log("Post: Server is running on port 4000");
});
