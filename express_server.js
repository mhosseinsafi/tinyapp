
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));  //  To make data readable, use another piece of middleware which will translate, or parse the body.

app.set("view engine", "ejs")       //This tells the Express app to use EJS as its templating engine.

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {     // JSON string representing the entire urlDatabase object
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {        // response can contain HTML code, which would be rendered in the client browser.
  res.send("<html><body>Hello <b>World</b></body></html>\n");   
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };

  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(){
  characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    random_string = "";
    for ( var i = 0; i <= 5; i++) {
      var indx = Math.floor(62*Math.random());   // Generates random integer number between 0-61
        random_string += characters[indx];
    }
    return random_string;
}
