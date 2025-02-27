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
async function findBookById(req, res, next) {
  const bookId = req.params.id; 

  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", 
      [bookId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Book post not found");
    }

    req.book = result.rows[0];
    next();

  } catch(err) {
    console.log("Error fetching book id:", err);
    res.status(500).send("Server error");
  }
}

let books = [];

// Home page 
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books"); 
    books = result.rows; 
    res.render("index.ejs", {books});
  } catch(err) {
    console.log("Error:", (err));
  }
});

// Render new post page
app.get("/add", (req, res) => {
  res.render("new.ejs");
})

// Create new post 
app.post("/new", async (req,res) => {

  const title = req.body.title; 
  const author = req.body.author; 
  const review = req.body.review;
  const rating = req.body.ratings;


  try {
    await db.query("INSERT INTO books (title, author, review, star) VALUES ($1, $2, $3, $4)", 
      [title, author, review, rating]);
    
    res.redirect("/");
  } catch(err) {
    console.log(err);
  }
});

// Edit post
app.get("/edit/:id", findBookById, (req, res) => {
  res.render("edit.ejs", {book: req.book});
});

// Update post 
app.post("/update/:id", findBookById, (req, res) => {
    
    const update = ("");
})

// Delete post 
app.get("/delete/:id", findBookById, async (req, res) => {
  const postId = req.book.id;
  console.log("Delete:", postId);
  try {
    await db.query("DELETE FROM books WHERE id = $1", [postId]);
    res.redirect("/");
  } catch(err) {
    console.log(err);
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
