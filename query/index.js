const express = require("express");
const axios = require("axios");

const bodyParser = require("body-parser");

const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.json(posts);
});

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;

    posts[postId].comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    const { id, content, postId, status } = data;

    const comment = posts[postId].comments.find((comment) => comment.id === id);
    if (comment) {
      comment.status = status;
      comment.content = content;
    }
  }
};

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({ status: "OK" });
});

app.listen(4003, async () => {
  console.log("Query: Server is running on port 4003");

  const res = await axios.get("http://eventbus-srv:4005/events");
  for (let event of res.data) {
    handleEvent(event.type, event.data);
  }
});
