require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

const app=express();
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret:"Jack Bauer is my hero",   //sessin initialization
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize()); //passport initialization.
app.use(passport.session()); // use passport to deal with session.

mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true , useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);
const userSchema=new mongoose.Schema({
  email:String,
  password:String
});

userSchema.plugin(passportLocalMongoose); // set userSchema to use passport-local-mongoose as plugin.

const User=mongoose.model("User",userSchema);

passport.use(User.createStrategy());      //used passport-local-mongoose to create log in strategy
passport.serializeUser(User.serializeUser());//set password to serialize and desrialize user
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
  res.render("home");
});
app.get("/login",function(req,res){
  res.render("login");
});
app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{res.redirect("/login");}
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

app.get("/register",function(req,res){
res.render("register");
});
app.post("/register",function(req,res){
  User.register({username:req.body.username}, req.body.password, function(err,user){
    if(err){
      console.log("error");
      res.render("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});
app.post("/login",function(req,res){
  const user=new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user,function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});




app.listen("3000",function(){
  console.log("server started on 3000");
});
