const express = require("express");
const cookiesParser = require("cookie-parser");
const cookieSession = require("cookie-session");

const app = express();

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const e = require("express");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookiesParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { 
    user:user, urls: urlDatabase,
                         username: req.cookies["username"] };/// ADD USERNAME
                         
  res.render("urls_index", templateVars);
  
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {user:user, username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);
  const shortURL = Math.random().toString(36).substr(2, 6)
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
}); 


app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  //console.log(longURL);
  res.redirect(longURL);
});

//-------------DELETE----------
app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//-------------UPDATE-----------

app.post("/urls/:shortURL/update", (req,res) => {
  const newLongURL = req.body.longURL;

  console.log('params' + req.params.shortURL);
  console.log('body' + req.body.longURL);
  urlDatabase[req.params.shortURL] = newLongURL;
  res.redirect('/urls');
});

//------------LOGIN--------------------

app.post("/login", (req,res) => {
  const email = req.body['email'];
  const password = req.body['password'];  
  for(let user in users) {
    if (email === user['email']){
      return 
    }
  }
  res.cookie("user_id",id);
  //console.log(req.cookies);
  res.redirect('/urls');
})

app.get('/login', (req,res) => {
  //const email = req.body['email'];
  //const password = req.body['password'];
  //const user = req.body['email'];
  res.render('urls_login');
  });

//------------LOGOUT------------------

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})


//----------REGISTER---------------

app.get('/register', (req,res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  //console.log(users);
  res.render('urls_register', templateVars);
})


app.post('/register', (req,res) => {
  const id = Math.random().toString(36).substr(2,6);
  const email = req.body['email'];
  const password = req.body['password'];
  
  if (!email) {
    res.sendStatus(404)
  } 
  if (!password) {
    res.sendStatus(404);
  }

  for (let user in users) {
    if (req.body['email'] === users[user]['email']){
      res.sendStatus(404);
    } 
  }

  users[id] = {id: id,
                email: email,
                password: password};

  res.cookie("user_id", id);
  
  res.redirect('/urls');

  })

 
  

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});