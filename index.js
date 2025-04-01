import express from "express";
import bodyParser from "body-parser";
import pkg from "pg";
import 'dotenv/config';


const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false }, // Required for Railway
});

export default pool;

const app = express();
const port = 3000;

// Middleware 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


let books = [];

// Home page 
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM books ORDER BY datecolumn DESC");  
    books = result.rows; 

    const bookCount = await pool.query("SELECT COUNT (title) FROM books");
    const totalBook = bookCount.rows[0].count;
    console.log("Number of books:", totalBook);


    res.render("index.ejs", {books, totalBook});
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
  const date = new Date();
  let cover = null;

  console.log("Recieved rating:", rating);

  try {
    // Fetch ISBN from Openlibrary 
    const response = await fetch(`https://openlibrary.org/search.json?title=${title}&fields=*`);
   
    const data = await response.json(); 
  
    if (data.docs.length > 0) {
      let firstBook = data.docs[0]; 
      console.log("Firstbook:", firstBook);

      if(firstBook.key) {
         cover = firstBook.isbn[0];
      }  
    }
    console.log("Open library ID:", cover);
    console.log("Inserting into DB:", { title, author, review, rating, cover});


    await pool.query("INSERT INTO books (title, author, review, star, datecolumn, cover) VALUES ($1, $2, $3, $4, $5, $6)", 
      [title, author, review, rating, date, cover]
    );  
    res.redirect("/");
  } catch(err) {
    console.log(err);
  }
});

// Edit post
app.get("/edit/:id", async (req, res) => {
  const postId = req.params.id 
  const result = await pool.query("SELECT * FROM books WHERE id = $1 ", [postId]);
  
  books = result.rows[0];
  console.log("Received ID:", req.params.id);
  res.render("edit.ejs", {book: books});
});

// Update post 
app.post("/update/:id", async (req, res) => {
  console.log("Received ID in POST request:", req.params.id); // Debugging

  if (!req.params.id) {
    return res.status(400).send("Missing book ID in request");
  }

  const postId = req.params.id;
  console.log("Found Book:", req.params.id);

  const title = req.body.title; 
  const author = req.body.author;
  const review = req.body.review;
  const rating = req.body.ratings;

  try {
    await pool.query("UPDATE books SET title = $1, author = $2, review = $3, star = $4 WHERE id = $5",
      [title, author, review, rating, postId]);
      res.redirect("/");
  } catch(err) {
    console.log(err);
  }
}); 



// Delete post 
app.get("/delete/:id", async (req, res) => {
  const postId = req.params.id;
  console.log("Delete:", postId);
  try {
    await pool.query("DELETE FROM books WHERE id = $1", [postId]);
    res.redirect("/");
  } catch(err) {
    console.log(err);
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
