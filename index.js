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
      console.log("Book not found! ID:", bookId);
      return res.status(404).send("Book post not found");
    }

    req.book = result.rows[0];
    console.log("Book found:", req.book)
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

    const bookCount = await db.query("SELECT COUNT (title) FROM books");
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
  let cover = null;

  try {
    // Fetch ISBN from Openlibrary 
    const response = await fetch(`https://openlibrary.org/search.json?title=${title}`);
   
    const data = await response.json(); // convert response into a JSON format 
    console.log("Number of books found:", data.docs.length);

  
    
    

    if (data.docs.length > 0) {
      let firstBook = data.docs[0]; 
      console.log("Firstbook:", firstBook);

      if(firstBook.key) {
         cover = firstBook.cover_edition_key;
      }  
    }

    console.log("Open library ID:", cover);

    
    console.log("Inserting into DB:", { title, author, review, cover});

   
    await db.query("INSERT INTO books (title, author, review, star, cover) VALUES ($1, $2, $3, $4, $5)", 
      [title, author, review, rating,  cover]
    ); 

   
    
    res.redirect("/");
  } catch(err) {
    console.log(err);
  }
});

// Edit post
app.get("/edit/:id", findBookById, (req, res) => {
  console.log("Received ID:", req.params.id);
  res.render("edit.ejs", {book: req.book});
});

// Update post 
app.post("/update/:id", findBookById, async (req, res) => {
  console.log("Received ID in POST request:", req.params.id); // Debugging

  if (!req.params.id) {
    return res.status(400).send("Missing book ID in request");
  }

  const postId = req.book.id;
  console.log("Found Book:", req.book);

  const title = req.body.title; 
  const author = req.body.author;
  const review = req.body.review;

  try {
    await db.query("UPDATE books SET title = $1, author = $2, review = $3 WHERE id = $4",
      [title, author, review, postId]);
      res.redirect("/");
  } catch(err) {
    console.log(err);
  }
}); 



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
