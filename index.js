import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "blog",
  password: "iseult",
  port: 5432,
});
db.connect();

const app = express();
const port = 3000;

// Middleware 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.render("index.ejs");
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
