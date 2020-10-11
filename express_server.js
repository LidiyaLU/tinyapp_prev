const express = require("express");
const cookiesParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookiesParser());

const urlDatabase = {
  "b2xVn2": {longURL : "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"}
};

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: '$2b$10$gsQ76ujQrxxzoqo.vMJwzei47iBHVkmOolCgJQpOAq0JY/oOeM1bq'
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: '$2b$10$jC2reBsO2/sVGvPGO9Y2v.e9vst.alw71JO2WuEUx4Z1Sgc59X8q2'
  }
};
// old password: userRandomID - purple-monkey-dinosaur
//               user2RandomID - dishwasher-funk

app.get("/", (req,res) => {
  const currentUser = users[req.cookies["user_id"]] ? users[req.cookies["user_id"]] : null;
  if (currentUser) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const currentUser = users[req.cookies["user_id"]] ? users[req.cookies["user_id"]] : null;
  
  let templateVars = {
    user: currentUser, urls: urlDatabase};

  if (currentUser) {

    let newUrlDatabase = {};
    for (let url in urlDatabase) {
      if (currentUser.id === urlDatabase[url]['userID']) {
        
        newUrlDatabase[url] = urlDatabase[url];
      }
    }
    templateVars = {user: currentUser, urls:newUrlDatabase };
    res.render("urls_index", templateVars);
  } else if (!currentUser) {
    res.redirect('/login');
  }
  
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]] ? users[req.cookies["user_id"]] : null;
  const templateVars = {user:user};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  
  const user = users[req.cookies["user_id"]] ? users[req.cookies["user_id"]] : null;
  if (user) {
    const shortURL = Math.random().toString(36).substr(2, 6);
    urlDatabase[shortURL] = {longURL : req.body['longURL'], userID: req.cookies["user_id"]};
    res.redirect("/urls/" + shortURL);
  } else {
    res.redirect('/login');
  }
});

//-------------DELETE----------
app.post("/urls/:shortURL/delete", (req,res) => {
  
  const user = users[req.cookies["user_id"]] ? users[req.cookies["user_id"]] : null;
  if (user) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }

});

app.get("/urls/:shortURL", (req, res) => {
  
  const user = users[req.cookies["user_id"]] ? users[req.cookies["user_id"]] : null;
  if (user) {
    
    if (req.cookies["user_id"] === urlDatabase[req.params.shortURL]['userID']) {
        
      res.render("urls_show", { user: user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL']});
      
    } else {
      res.sendStatus(404);
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});


//-------------UPDATE-----------

app.post("/urls/:shortURL/update", (req,res) => {
  const user = users[req.cookies["user_id"]] ? users[req.cookies["user_id"]] : null;
  if (user) {
    const newLongURL = req.body.longURL;
    urlDatabase[req.params.shortURL]['longURL'] = newLongURL;
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }

});

//------------LOGIN--------------------

app.post("/login", (req,res) => {
  
  for (let user in users) {
    const currentUser = users[user];
    if (currentUser.email === req.body['email'] && bcrypt.compareSync(req.body['password'], currentUser['password'])) {
      res.cookie("user_id", currentUser['id']);
      return res.redirect('/urls');
    }
  }
  return res.status(403).send("Please provide email");
});

app.get('/login', (req,res) => {
  
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render('urls_login', templateVars);
});

//------------LOGOUT------------------

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//----------REGISTER---------------

app.get('/register', (req,res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render('urls_register', templateVars);
});


app.post('/register', (req,res) => {
  const id = Math.random().toString(36).substr(2,6);
  const email = req.body['email'];
  const password = req.body['password'];
  
  if (!email) {
    res.status(404).send('<html><h4>Please enter the email</h4></html>');
  }
  if (!password) {
    return res.status(404).send('<html><h4>Please enter the password</h4></html>');
  }

  for (let user in users) {
    if (req.body['email'] === users[user]['email']) {
      res.status(404).send('<html><h4>User already exists</h4></html>');
    }
  }

  users[id] = {id: id,
    email: email,
    password: bcrypt.hashSync(password, saltRounds)};

  res.cookie("user_id", id);
  res.redirect('/urls');

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});