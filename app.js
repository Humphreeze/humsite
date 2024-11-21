const express = require('express');
const app = express();
const connect = require('./server/databaseConfigure');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const layouts = require('express-ejs-layouts');
app.use(express.urlencoded({extended : true}));
const jwt = require('jsonwebtoken');
const ejs = require('ejs');
app.use(cookieParser());
app.use(layouts);
app.set('view engine' , 'ejs');
app.set('layout' , './layouts/main-layout');
app.use(express.static('./public'));





connect()
.then(function(){
    app.listen('3000' , 'localhost' , function(){
        console.log('listening on port 3000');
    })
    app.use('/' , require('./server/routes'));
})
.catch(function(err){
    console.log('ERROR');
    console.log(err);
})


