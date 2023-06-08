
const express = require("express");
const cookieSession = require('cookie-session')
const { generateRandomString,urlsForUser,getUserByEmail } = require("./helpers");
const bcrypt = require("bcryptjs");



// constant
const app = express();
const PORT = 8080; 

//middleware
app.use(express.urlencoded({ extended: true }));  //  To make data readable, use another piece of middleware which will translate, or parse the body.
app.use(cookieSession({
  name: 'session',
  keys: ['secret-key'], // array of secret keys for encryption
  maxAge: 12 * 50 * 50 * 1000 // age of the session (12 hours ...)
}));
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
const userId = req.session.user_id;
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
  if (req.session.user_id) {
    res.render("urls_new", { user: users[req.session.user_id] });  //If the user is not logged in, redirect /login
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {         

 const id = req.params.id;
 const urlEntry = urlDatabase[id];
 if (urlEntry) {
   const templateVars = {
     id: id,
     longURL: urlEntry.longURL,
     user: users[req.session.user_id],
   };
   res.render("urls_show", templateVars);
 } else {
   res.status(404).send("URL not found");
 }
});

  app.post("/urls", (req, res) => {
     if (req.session.user_id) {
    const longURL = req.body.longURL;
    const id = generateRandomString();
    urlDatabase[id] = { longURL: longURL, userID: req.session.user_id, };
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
  
    if (!req.session.user_id) {
      // User is not logged in
      return res.status(401).send("<html><body>You must be logged in.</body></html>");
    }
  
    if (urlEntry.userID !== req.session.user_id) {
      // User does not own the URL
      return res.status(403).send("<html><body>You do not have permission to delete this URL.</body></html>");
    }
  
    delete urlDatabase[id];
    res.redirect("/urls");
  });

 // Edit
  app.post("/urls/:id/edit", (req, res) => {
    const id = req.params.id;
  const urlEntry = urlDatabase[id];

  if (!req.session.user_id) {
    // User is not logged in
    res.status(401).send("<html><body>You must be logged in.</body></html>");
  } else if (!urlEntry) {
    // URL entry not found
    res.status(404).send("URL not found");
  } else if (urlEntry.userID !== req.session.user_id) {
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
   
    const id = req.params.id;
    const newURL = req.body.newURL;
  
    if (!urlDatabase[id]) {
      // URL does not exist
      return res.status(404).send("URL not found");
    }
  
    if (!req.session.user_id) {
      // User is not logged in
      return res.status(401).send("<html><body>You must be logged in.</body></html>");
    }
  
    if (urlDatabase[id].userID !== req.session.user_id) {
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
    req.session.user_id = null;
    res.redirect('/login');
  });
// Display of the register form
  app.get('/register', (req, res) => { 
    if (req.session.user_id) {
      res.redirect('/urls');        // If the user is logged in,redirect urls
    } else {
      const user = null; // user not defined

    res.render('register', { user });
    }
  });
//submission of the register form
  app.post('/register', (req, res) => {
    const email = req.body.email;          // grab the info from the body
    const password = req.body.password; 

    if (!email || !password) {
      return res.status(400).send('Dude where is your email Or Password?!');
    }

    const existingUser = getUserByEmail(email, users);
    if (existingUser) {
    return res.status(400).send('The email address already exists');
  }

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
   req.session.user_id = userId;
   res.redirect('/urls');
  });

// Display of the login form
   app.get('/login', (req, res) => {
    if (req.session.user_id) {                
      res.redirect('/urls');            
    } else {
      const user = null; // user not defined
    res.render('login', { user });
    }
  });

  //Submisiion of the login form
  app.post('/login', (req, res) => {
    const email = req.body.email;          // grab the info from the body
    const password = req.body.password; 

    if (!email || !password) {
      return res.status(403).send('Please provide an Email address and a password');
    }

    const user = getUserByEmail(email, users);
    if (!user) {
    return res.status(403).send('No user with that email address found');
  }

   const passwordIsCorrect = bcrypt.compareSync(password, user.password);

    if (!passwordIsCorrect) {
    return res.status(403).send("Email or password is incorrect");
  }
   req.session.user_id = user.id;
 
   res.redirect('/urls');
  });  

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





