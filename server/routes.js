const express = require('express');
const app = express();
const router = express.Router();
const mongoose = require('mongoose');
app.use(express.urlencoded({extended : true}));
const User = require('./models/users');
const Post = require('./models/posts');
const Upload = require('./models/uploads');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const dotenv = require('dotenv').config();
const lifespan =  3 *24 * 60 * 60;

//function to create cookies

const tokenmaker = function(id){
return jwt.sign({id} , process.env.JWT_STRING , {expiresIn : lifespan});

}


//function to check logged in status

const checkLoginStatus = function(req , res , next){
   
    
    const token = req.cookies.hookie;

    if(token){
        jwt.verify(token , process.env.JWT_STRING , function(err , decoded){      
            
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        console.log('Token expired. Redirecting to login.');
                        return res.redirect('/login');
                    }
                    else{
                        console.log('ERROR ENCOUNTERD WHEN VERIFYING TOKEN');
                        console.log(err);
                         return res.redirect('/login');
                         
                    }
               
                
            }
            else if(decoded){
                console.log(decoded);
                User.findById(decoded.id)
                .then(function(result){
                    res.locals.user = result;
                    next();
                })
                .catch(function(err){
                    console.log('error locating user from result.id')
                    console.log(err);
                    return res.redirect('/login');


                })
                

            }
            
        })
    
    }
    else{
        console.log('NO TOKEN AVAILABLE');
        return  res.redirect('/login');
    }
}

// CHECKING THE USER

const check = function(req , res , next){
    
   

    const token = req.cookies.hookie;

    if(token){
        jwt.verify(token , process.env.JWT_STRING , function(err , decoded){
            if(err){
                res.locals.user  = null;
                next();
            }
            else{
                const user = User.findById(decoded.id);
                user.then(function(result){
                res.locals.user = result;
                next();
                })
                .catch(function(err){
                    console.log('COULD OT FIND USER');
                    console.log(err);
                    res.locals.user = null;
                    next();
                })
               
            }

        })
    }
    else{
        res.locals.user = null;
        next();
    }
}




 router.get('*' , check);

router.get('/' , checkLoginStatus ,  function(req , res){
    Upload.find()
    .then(function(result){
        res.render('homepage.ejs' , {title : "homepage" , result });
    })
    .catch(function(err){
      console.log(err);
      res.send('err');
    })
   
})


router.get('/about' ,  function(req , res){
    res.render('about' , {title : "about page"});
})


router.get('/add'  , checkLoginStatus ,  function(req , res){
    res.render('add-blog' , {title : "add post"});
})


router.get('/login' , function(req , res){
    res.render('login' , {title : "login"});
})


router.get('/logoutpage' , checkLoginStatus ,   function(req , res){
    res.render('logout' , {title : "logout"});
})

router.get('/logout'  , checkLoginStatus ,   function(req , res){
    res.cookie('hookie' , "" , {maxAge:1});
    res.redirect('/login');
})



router.get('/register' , function(req , res){
    res.render('create-account' , {title : "create account"});
})

  // CREATING A NEW USER / ACCOUNT

router.post('/create' , function(req , res){
const {username , email , password} = req.body;
User.findOne({email:email})
.then(function(result){
   if(result){
    console.log('the entered email is already in use , try another one');
    res.redirect('/register');

   }
   else{
    bcrypt.hash(password , 10 , function(err , hashed){
        if(err){
            console.log('ERROR ENCOUNTERED DURING HASHING');
            console.log(err);
            res.redirect('/register');
        }
        else{
          console.log('hashing complete');
          const newUser = new User({username , email , password : hashed });
          newUser.save()
          .then(function(result){
         const token = tokenmaker(newUser._id);
         console.log(token);
         res.cookie('hookie' , token , {httpOnly:true , maxAge:lifespan*1000});
         console.log('new user saved to database')
         res.redirect('/');
          })
        .catch(function(err){
            console.log('COULD NOT SAVE USER');
            console.log(err);
            res.redirect('/register');
        })
        }
       

    

    })
   }
})
.catch(function(err){
console.log('ERROR ENCOUNTERED WHEN DROWSING SAVED USERS');
console.log(err);
res.redirect('/register');
})


})

// logging in

router.post('/login' , function(req , res){
    const {email , password} = req.body;
    User.findOne({email : email})
    .then(function(result){
        if(result){
            bcrypt.compare(password , result.password , function(err , isMatch){
                if(err){
                    console.log('ERROR ENCOUNTERED WHEN COMPARING PASSWRODS');
                    console.log(err);
                    res.redirect('/login');
                }
                else if(isMatch){
                    const token = tokenmaker(result._id);
                    console.log(token);
                    res.cookie('hookie' , token , {httpOnly:true , maxAge : lifespan*1000});
                    console.log('SUCCESSFULLY LOGGED IN');
                    res.redirect('/');
                }
                else{
                    console.log('INVALID CREDENTIAL(S)');
                    res.redirect('/login');
                }
            })
        }
    })
    .catch(function(err){
        console.log('ERROR ENCOUNTERED WHEN BROWSING EMAILS');
        console.log(err);
        res.redirect('/login');
    })
})


//posting an article

router.post('/upload' , function(req , res){
    const {title , body} = req.body;
    const newUpload = new Upload({
        title , body
    })
    newUpload.save()
    .then(function(result){
        console.log('UPLOAD SAVED TO DATABASE');
        res.redirect('/');
        // res.locals.user.posts.push(title);
    })
    .catch(function(err){
        console.log('ERROR ENCOUNTERED WHEN SAVING THE UPLOAD');
        console.log(err);
        res.redirect('/add');
    })       
})

//all posts

router.get('/allposts' , function(req ,res){
    Post.find()
    .then(function(result){
      res.redirect('/' , {title:'homepage' , result})
    })
    .catch(function(err){
        console.log('ERROR OCCURED WHEN LOOKINF FOR POSTS');
        console.log(err);
        res.redirect('/');
    })
})

// your posts

router.get('/yourposts' , function(req ,res){
    
    // .catch(function(err){
    //     console.log('ERROR OCCURED WHEN LOOKINF FOR YOUR POSTS');
    //     console.log(err);
    //     res.redirect('/');
    // })
})


  //FOR UNDEFINED ROUTES
router.use(function(req , res){
    res.render('error' , {title : "error" });
})

module.exports = router;