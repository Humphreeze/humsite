const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
    title:{type : String , required : true },
    author:{type : String , required : true },
    comments : [{user : {type : String , required:true} , comment : {type:String , required : true}}]
});

const Post = mongoose.model('post' , postSchema);
module.exports = Post;