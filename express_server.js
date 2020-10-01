const express = require("express");
const cookiesParser = require("cookie-parser");

const app = express();

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookiesParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
                         username: req.cookies["username"] };/// ADD USERNAME
                         
  res.render("urls_index", templateVars);
  
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);
  const shortURL = Math.random().toString(36).slice(7);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
}); 

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
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
  //console.log(urlDatabase[req.params.shortURL]);
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
  const username = req.body.name;
  res.cookie("username",username);
  //console.log(req.cookies);
  res.redirect('/urls');
})

//------------LOGOUT------------------

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('urls');
})


//----------REGISTER---------------

app.get('/register', (req,res) => {
  const templateVars = {username: req.cookies["username"] };
  console.log("make sure");
  res.render('urls_register', templateVars);
  //console.log("make sure");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});