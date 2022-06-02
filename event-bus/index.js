const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

const events = [];

app.post("/events", async (req, res) => {
  try {
    const event = req.body;

    events.push(event);

    await axios.post("http://posts-srv:4000/events", event);
    await axios.post("http://comments-srv:4001/events", event);
    await axios.post("http://query-srv:4003/events", event);
    await axios.post("http://moderation-srv:4004/events", event);

    res.send({ status: "OK" });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      error: "An error has occured",
    });
  }
});

app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log("Event bus: Server started on port 4005");
});
