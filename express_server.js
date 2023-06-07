
const express = require("express");
const cookieParser = require('cookie-parser');

// constant
const app = express();
const PORT = 8080; 

//middleware
app.use(express.urlencoded({ extended: true }));  //  To make data readable, use another piece of middleware which will translate, or parse the body.
app.use(cookieParser())   // creat and populate req.body

//configuration

app.set("view engine", "ejs")       //This tells the Express app to use EJS as its templating engine.

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//user database

const users = {
  aaa: {
    id: "aaa",
    email: "h@h.com",      
    password: "hhh",
  },
  bbb: {
    id: "bbb",
    email: "n@n.com",
    password: "nnn",
  },
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
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id]};
  res.render("urls_index", templateVars);
});

// Create
app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    res.render("urls_new", { user: users[req.cookies.user_id] });  //If the user is not logged in, redirect /login
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],  user: users[req.cookies.user_id], };

  res.render("urls_show", templateVars);
});

  app.post("/urls", (req, res) => {
     if (req.cookies.user_id) {
    const longURL = req.body.longURL;
    const id = generateRandomString();
    urlDatabase[id] = longURL;
    res.redirect(`/urls/${id}`);             //redirect the user to a new page
  } else {
    res.status(401).send("<html><body>You must be logged in.</body></html>");
  }   
  });

  app.get("/u/:id", (req, res) => {
    const id = req.params.id;
    const longURL = urlDatabase[id];
    if (longURL) {
      res.redirect(longURL);
    } else {
      res.status(404).send("<html><body>URL not found.</body></html>");
    }
    console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
  });

  app.post("/urls/:id/delete", (req, res) => {
    const id = req.params.id;
    if (urlDatabase[id]) {
      delete urlDatabase[id];
      res.redirect("/urls");
    } else {
      res.status(404).send("URL not found");
    }
  });
 // Edit
  app.post("/urls/:id/edit", (req, res) => {
    const shortURL = req.params.id;
    const EditURL = req.body.EditURL
    urlDatabase[shortURL] = EditURL;
    res.redirect("/urls");
  
  });

  app.post("/urls/:id", (req, res) => {
    const id = req.params.id;
    const newURL = req.body.newURL;
    if (newURL) {
      urlDatabase[id] = newURL;
      res.redirect("/urls");
    } else {
      res.status(400).send("Invalid URL");
    }
  });

  app.post('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.redirect('/login');
  });

  app.get('/register', (req, res) => { 
    if (req.cookies.user_id) {
      res.redirect('/urls');        // If the user is logged in,redirect urls
    } else {
      res.render('register');
    }
  });

  app.post('/register', (req, res) => {
    const email = req.body.email;          // grab the info from the body
    const password = req.body.password; 

    if (!email || !password) {
      return res.status(400).send('Dude where is your email Or Password?!');
    }

    // we did not get the email or password
    let foundUser = null;

    for (const userId in users) {
      const user = users[userId];
      if(user.email === email) {
        // we found our user
        foundUser = user;
        break;
      }
    }
    //did we not find the user
    if(foundUser) {
      return res.status(400).send('The email address already exists');
    }

  if (!email || !password) {
    return res.status(400).send('Please provide an Email address and a password');
  }
  // look up the user from our database
   // Generate a random user ID
   const userId = generateRandomString();

   // Create a new user object
   const newUser = {
     id: userId,
     email,
     password,
   };
 
   // Add the new user to the users object
   users[userId] = newUser;

   // user_id cookie containing the user's newly generated ID
   res.cookie('user_id', userId);
   res.redirect('/urls');
  });


   app.get('/login', (req, res) => {
    if (req.cookies.user_id) {                
      res.redirect('/urls');             //If the user is logged in,redirect urls
    } else {
      res.render('login');
    }
  });

  app.post('/login', (req, res) => {
    const email = req.body.email;          // grab the info from the body
    const password = req.body.password; 



    // we did not get the email or password
    let foundUser = null;

    for (const userId in users) {
      const user = users[userId];
      if(user.email === email) {
        // we found our user
        foundUser = user;
      }
    }

    if (!email || !password) {
      return res.status(403).send('Please provide an Email address and a password');
    }

    //did we not find the user
    if(!foundUser) {
      return res.status(403).send('No user with that email address found');
    }

  

  if (!foundUser || foundUser.password !== password) {
    return res.status(403).send("Email or Password is incorrect")
    }

   // Generate a random user ID
   const userId = generateRandomString();

   // Create a new user object
   const newUser = {
     id: userId,
     email,
     password,
   };
 
   // Add the new user to the users object
   users[userId] = newUser;

   // user_id cookie containing the user's newly generated ID
   res.cookie('user_id', userId);
 
   res.redirect('/urls');
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
