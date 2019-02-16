var express = require('express');

var app = express();

var bodyParser = require('body-parser');

// var mysql = require('mysql');
const Stampery = require('stampery');

const request=require('request');
var cors = require('cors');

app.use(cors({origin: '*'}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));


var stampery = new Stampery('87cd2fdd-02a7-4eef-c647-1b73d280f62a');


app.post('/postrecord',function(req,res){

var name = req.body.name;
var id =  req.body.id;
console.log("Name",name);
console.log("id",id);
 // var rollnumber =  req.body.rollnumber;
// var enrollmentnumber = req.body.enrollmentnumber;
// var batchname = req.body.batchname;
// var cgpa = req.body.cgpa;
// var date_of_graduation = req.body.graduation;

// console.log("Student Name",studentname);
// console.log("Father Name",fathername);

var payload = {
'name':name,
'id':id
}

var finalpayload = JSON.stringify(payload);

 const hash = stampery.hash(finalpayload);
  stampery.stamp(hash).then((stamp) => {
  console.log("Stamp id",stamp.time);
  var stampinfo = {
    'stampid':stamp.id,
    'timestamp':stamp.time
}  


  res.send(stampinfo);
}).catch((err) => {
  res.send("Error in creating stamp");
});

console.log(finalpayload);



});



app.post('/verifystamp',function(req,res){

var stampid = req.body.stampid ;

stampery.getById(stampid).then((stamp) => {
   console.log("Stamp",stamp.length);
   if (stamp.length == 0) {
   res.send('false');

}
   var stamparse = stamp.filter(function(el) {
   var receipts = el.receipts;

  
 //  console.log("stampparse",stamparse);
   var validity = stampery.prove(receipts);
  // return console.log('Valid: ', stampery.prove(receipts));
   res.send(validity);
}).catch((err) => {
  return console.error(err);
});

});

})


var port=process.env.PORT || 8080;
app.listen(port);



