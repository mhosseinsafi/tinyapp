
const express = require("express");
const cookieParser = require('cookie-parser');
const { generateRandomString,urlsForUser } = require("./helpers");
const bcrypt = require("bcryptjs");



// constant
const app = express();
const PORT = 8080; 

//middleware
app.use(express.urlencoded({ extended: true }));  //  To make data readable, use another piece of middleware which will translate, or parse the body.
app.use(cookieParser())   // creat and populate req.body

//configuration

app.set("view engine", "ejs")       //This tells the Express app to use EJS as its templating engine.

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//user database

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "h@h.com",      
    password:  bcrypt.hashSync('hhh', 10),
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
const userId = req.cookies.user_id;
if (!userId) {
  res.redirect("/login");
} else {
  const userUrls = urlsForUser(userId,urlDatabase); // Retrieve URLs for the logged-in user
  const templateVars = { urls: userUrls, user: users[userId] };
  res.render("urls_index", templateVars);
}
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

 // const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],  user: users[req.cookies.user_id], };
 // res.render("urls_show", templateVars);
 const id = req.params.id;
 const urlEntry = urlDatabase[id];
 if (urlEntry) {
   const templateVars = {
     id: id,
     longURL: urlEntry.longURL,
     user: users[req.cookies.user_id],
   };
   res.render("urls_show", templateVars);
 } else {
   res.status(404).send("URL not found");
 }
});

  app.post("/urls", (req, res) => {
     if (req.cookies.user_id) {
    const longURL = req.body.longURL;
    const id = generateRandomString();
    urlDatabase[id] = { longURL: longURL, userID: req.cookies.user_id, };
    res.redirect(`/urls/${id}`);             //redirect the user to a new page
  } else {
    res.status(401).send("<html><body>You must be logged in.</body></html>");
  }   
  });

  app.get("/u/:id", (req, res) => {
    const id = req.params.id;
    const urlEntry = urlDatabase[id];
    if (urlEntry) {
      res.redirect(urlEntry.longURL);
    } else {
      res.status(404).send("<html><body>URL not found.</body></html>");
    }
  });

  app.post("/urls/:id/delete", (req, res) => {
  
    const id = req.params.id;
    const urlEntry = urlDatabase[id];
  
    if (!urlEntry) {
      // URL does not exist
      return res.status(404).send("URL not found");
    }
  
    if (!req.cookies.user_id) {
      // User is not logged in
      return res.status(401).send("<html><body>You must be logged in.</body></html>");
    }
  
    if (urlEntry.userID !== req.cookies.user_id) {
      // User does not own the URL
      return res.status(403).send("<html><body>You do not have permission to delete this URL.</body></html>");
    }
  
    delete urlDatabase[id];
    res.redirect("/urls");
  });

 // Edit
  app.post("/urls/:id/edit", (req, res) => {
    // const shortURL = req.params.id;
    // const EditURL = req.body.EditURL
    // urlDatabase[shortURL] = EditURL;
    // res.redirect("/urls");
    const id = req.params.id;
  const urlEntry = urlDatabase[id];

  if (!req.cookies.user_id) {
    // User is not logged in
    res.status(401).send("<html><body>You must be logged in.</body></html>");
  } else if (!urlEntry) {
    // URL entry not found
    res.status(404).send("URL not found");
  } else if (urlEntry.userID !== req.cookies.user_id) {
    // User is not the owner of the URL
    res.status(403).send("<html><body>You do not have permission to edit this URL.</body></html>");
  } else {
    // User is logged in and is the owner of the URL
    const newURL = req.body.EditURL;
    if (newURL) {
      urlEntry.longURL = newURL;
      res.redirect("/urls");
    } else {
      res.status(400).send("Invalid URL");
    }
  }
});

  app.post("/urls/:id", (req, res) => {
    // const id = req.params.id;
    // const newURL = req.body.newURL;
    // if (newURL) {
    //   urlDatabase[id] = newURL;
    //   res.redirect("/urls");
    // } else {
    //   res.status(400).send("Invalid URL");
    // }
    const id = req.params.id;
    const newURL = req.body.newURL;
  
    if (!urlDatabase[id]) {
      // URL does not exist
      return res.status(404).send("URL not found");
    }
  
    if (!req.cookies.user_id) {
      // User is not logged in
      return res.status(401).send("<html><body>You must be logged in.</body></html>");
    }
  
    if (urlDatabase[id].userID !== req.cookies.user_id) {
      // User does not own the URL
      return res.status(403).send("<html><body>You do not have permission to edit this URL.</body></html>");
    }
  
    if (newURL) {
      urlDatabase[id] = newURL;
      res.redirect("/urls");
    } else {
      res.status(400).send("Invalid URL");
    }
  });

  app.post('/logout', (req, res) => {
    res.clearCookie('user_id');
    //req.cookies = null;
    res.redirect('/login');
  });
// Display of the register form
  app.get('/register', (req, res) => { 
    if (req.cookies.user_id) {
      res.redirect('/urls');        // If the user is logged in,redirect urls
    } else {
      res.render('register');
    }
  });
//submission of the register form
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

   // Generate a random user ID
   const userId = generateRandomString();

   const hashedPassword = bcrypt.hashSync(password, 10);

   // Create a new user object
   const newUser = {
     id: userId,
     email,
     password: hashedPassword,
   };
 
   // Add the new user to the users object
   users[userId] = newUser;

   // user_id cookie containing the user's newly generated ID
   res.cookie('user_id', userId);
   res.redirect('/urls');
  });

// Display of the login form
   app.get('/login', (req, res) => {
    if (req.cookies.user_id) {                
      res.redirect('/urls');            
    } else {
      res.render('login');
    }
  });

  //Submisiion of the login form
  app.post('/login', (req, res) => {
    const email = req.body.email;          // grab the info from the body
    const password = req.body.password; 

    if (!email || !password) {
      return res.status(403).send('Please provide an Email address and a password');
    }

    // we did not get the email or password
    let foundUser = null;

    for (const userId in users) {
      const user = users[userId];
      if(user.email === email) {
        // we found our user
        foundUser = user;
      }
    }

    //did we not find the user
    if(!foundUser) {
      return res.status(403).send('No user with that email address found');
    }

    const passwordIsCorrect = bcrypt.compareSync(password, foundUser.password);

  if (!passwordIsCorrect) {
    return res.status(403).send("Email or Password is incorrect")
    }
   // user_id cookie containing the user's newly generated ID
   res.cookie('user_id', foundUser.id);
 
   res.redirect('/urls');
  });  

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





