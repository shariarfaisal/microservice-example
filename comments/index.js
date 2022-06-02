const express = require("express");
const { randomBytes } = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const axios = require("axios");

app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  const postId = req.params.id;

  res.send(commentsByPostId[postId] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentsId = randomBytes(4).toString("hex");

  const { content } = req.body;
  const postId = req.params.id;

  const comments = commentsByPostId[postId] || [];

  comments.push({
    id: commentsId,
    content,
    status: "pending",
  });

  await axios.post("http://eventbus-srv:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentsId,
      content,
      postId,
      status: "pending",
    },
  });

  commentsByPostId[postId] = comments;

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  console.log("Event Received", req.body.type);

  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const { postId, id, status, content } = data;

    const comments = commentsByPostId[postId];
    if (comments) {
      const comment = comments.find((comment) => comment.id === id);
      if (comment) {
        comment.status = status;
      }

      await axios.post("http://eventbus-srv:4005/events", {
        type: "CommentUpdated",
        data: {
          id,
          postId,
          status,
          content,
        },
      });
    }
  }

  res.send({ status: "OK" });
});

app.listen(4001, () => {
  console.log("Comments: Server is running on port 4001");
});
