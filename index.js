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

// Middleware to find blog ID 
function findBlogId(req, res, next) {
  const blogId = req.params.id; 
  req.foundPost = blogPost.find( post => post.id == blogId);

  if(!req.foundPost) {
    return res.status(404).send("Post not found");
  }

  next();
}

let books = [];

// Home page 
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books"); 
    books = result.rows; 
    console.log(books);
    res.render("index.ejs", {books});
  } catch(err) {
console.log("Error:", (err));
  }
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
