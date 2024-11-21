const mongoose = require('mongoose');

const uploadSchema = mongoose.Schema({
    title : {type :String , required : true},
    body : {type :String , required : true},
    comments : [{type : String} ],
    author:{type : String}
});

const Upload = mongoose.model('upload' , uploadSchema);

module.exports = Upload;