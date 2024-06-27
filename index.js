import express from "express";
import { config } from "dotenv";
import GPT from "./server.js";
config();
const app = express();
const port = process.env.PORT || 9090;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("this is a home route");
});

app.post("/prompt", async (req, res) => {
  try {
    let result = await GPT(req.body.prompt);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
