const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const uri = process.env.BASE_STRING;


const connect = async function(){
    mongoose.connect(uri)
.then(function(){
    console.log('connected to database');
})
.catch(function(err){
    console.log(err);
})
}


module.exports = connect ;