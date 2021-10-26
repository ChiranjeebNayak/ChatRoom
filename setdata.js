const firebase = require('./config')

module.exports = {
    saveData: function(req,callback){
        let username=req.username;
        firebase.database().ref("test/"+username).set({
            name:req.username,
            email:req.email,
        });
        callback(null,{"statuscode":200,"message":"inserted Sucessfully"});
    }
}