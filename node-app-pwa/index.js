var express= require("express");
var app= express();
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var methodOverride = require('method-override')

const PORT =4000;

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride('_method'));

mongoose.connect("mongodb://localhost/mynewdb", (err) =>{
    if(err){
        console.log("Oops, Something is wrong")
    }else{
        console.log("We are connected")
    }
})

var usersSchema = mongoose.Schema ({
    firstname: String,
    lastname: String,
    username: String,
    idtype: String,
    idnumber: Number,
    password: String,
    photo: String,
    active: String
})

var Users= mongoose.model("Users", usersSchema)


Users.find({}, (err, users) =>{
    console.log(users)
})

//renderiza todos los usuarios
app.get("/users", (req, res) => {
  
  Users.find({}, (err, users) =>{

    if(err){
        console.log(err)
    }
    if(users){
        res.render("users", {usersVar: users})
    }else{
        res.send("There are not users")
    }
  });
})

//renderiza la vista de new
app.get("/new", (req,res) =>{
    res.render("new")
})

//agrega a un usuario nuevo
app.post("/adduser", (req, res) => {
    var newUser= new Users();

    var params= req.body;

    var userId= parseInt(req.body.idnumber);

    if( userId && params.username && params.firstname && params.lastname && params.idtype && params.password1 && params.photo && params.active){
        Users.findOne({idnumber: userId}, (err, userTemp) => {

            if(userTemp){
                console.log("User already exists")
                return res.send("User already exists");
            }else{
    
                if(params.username.length<8){
                    console.log("Username doesn't have min 8 characters")
                    return res.send("Username doesn't have min 8 characters");
                }
                else{
                    newUser.firstname = params.firstname;
                    newUser.lastname = params.lastname;
                    newUser.username = params.username;
                    newUser.idtype = params.idtype;
                    newUser.idnumber = userId;
                    newUser.password = params.password1;
                    newUser.photo = params.photo;
                    newUser.active = params.active;
    
                    newUser.save((err, userSaved) =>{
    
                        if(userSaved){
                            console.log("User succesfully added")
                            res.redirect("/users")
                        }else{
                            console.log("User has not been added")
                            return res.send("User has not been added");
                        }
                    })
                }
            }
        });
    }else{
        return res.send("You have to fill all fields")
    }
    
})

//elimina el usuario con el id que llega por parametro
app.delete("/users/:idnumber", (req, res) =>{

    var userId= parseInt(req.params.idnumber);

    Users.deleteOne( {idnumber: userId}, (err, user) =>{

        if(user){
            console.log("deleted")
            res.redirect("/users")
        }
        else{
            console.log("It's not been deleted")
            return res.send("It's not been deleted")
        }
    });
})

//para hacer cuando de click sobre look
app.get('/view/:idnumber', (req, res) =>{
    
    var userId= parseInt(req.params.idnumber);
    console.log(userId)
    Users.findOne({ idnumber: userId}, (err, user) => {
        
            if(user){
                console.log(user)
                res.render("view", {userTemp: user})
            }else{
                console.log("User does not exists")
                return res.send("User does not exists")
            }
         
    });
})

//para hacer cuando de click sobre edit dentro del form
app.put("/edituser", (req, res) =>{

    var userId= parseInt(req.body.idnumber);

    var user = req.body;

    if( userId && user.username && user.firstname && user.lastname && user.idtype && user.password1 && user.photo && user.active){
        if(user.username.length<8){
            console.log("Username doesn't have min 8 characters")
            return res.send("Username doesn't have min 8 characters");
        }else{
            Users.findOneAndUpdate({idnumber: userId}, user, (err, userUpd) =>{

                if(userUpd){
                    console.log(userUpd)
                    res.redirect("/users")
                }
                else{
                    console.log("The user does not exists")
                    return res.send("The user does not exists")
                }
            });
        }
    }else{
        return res.send("You have to fill all fields")
    }
    
})

//para renderizar la pagina de edit con la info del usuario que se quiere editar
app.get("/edit/:idnumber", (req,res) =>{
    var userId= parseInt(req.params.idnumber);
    console.log(userId)
    Users.findOne({ idnumber: userId}, (err, user) => {
        
            if(user){
                console.log(user)
                res.render("edit", {userTemp: user})
            }else{
                console.log("User does not exists")
                return res.send("User does not exists")
            }
         
    });
})

//siempre que se ponga una ruta que no exista, se mandara a la vista de todos los usuarios
app.get("*", (req, res) => res.redirect("/users"));

app.listen(PORT, "localhost", () => console.log("Listening on port:" +PORT));