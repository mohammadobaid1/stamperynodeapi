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


var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : '172.30.63.26',
  user            : 'blockshift',
  password        : 'Blockshift4',
  database        : 'freelanceproject'
});




var stampery = new Stampery('87cd2fdd-02a7-4eef-c647-1b73d280f62a');



app.get('/',function(req,res){

res.send("Hello world");

})

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





app.post('/saverecord',function(req,res){

var name = req.body.name;
var nric =  req.body.nric;
var coursename = req.body.coursename;
// var cgpa = req.body.cgpa;
var startdate = req.body.startdate;
var enddate = req.body.enddate;

console.log("Name",name);
//console.log("id",id);
 // var rollnumber =  req.body.rollnumber;
// var enrollmentnumber = req.body.enrollmentnumber;
// var batchname = req.body.batchname;
// var cgpa = req.body.cgpa;
// var date_of_graduation = req.body.graduation;

// console.log("Student Name",studentname);
// console.log("Father Name",fathername);

var payload = {
'name':name,
'nric':nric,
'coursename':coursename,
'startdate':startdate,
'enddate':enddate
}

var finalpayload = JSON.stringify(payload);

 const hash = stampery.hash(finalpayload);
  stampery.stamp(hash).then((stamp) => {
  console.log("Stamp id",stamp.time);
  var stampinfo = {
    'stampid':stamp.id,
    'timestamp':stamp.time
}

var sqlquery =  "Insert into record_table(STUDENT_NAME,coursename,nric,startdate,enddate,stamperyid,timestamp) values ('"+name+"','"+coursename+"','"+nric+"','"+startdate+"','"+enddate+"','"+stamp.id+"','"+stamp.time+"')"; 
pool.getConnection(function(err, connection) {
  if (err) throw err; // not connected!
  connection.query(sqlquery, function (error, results) {
    connection.release();
    if (error) throw error;
    res.send(stampinfo);

  });
});


}).catch((err) => {
  res.send(err);
});

console.log(finalpayload);



});


app.post('/getrecordbystamperyid',function(req,res){


var stamperyid = req.body.stamperyid;



stampery.getById(stamperyid).then((stamp) => {
   console.log("Stamp",stamp.length);
   if (stamp.length == 0) {
   res.send('false');

}
   var stamparse = stamp.filter(function(el) {
   var receipts = el.receipts;

   var validity = stampery.prove(receipts);
   pool.getConnection(function(err, connection) {
  if (err) throw err; // not connected!
  connection.query("select * from record_table where stamperyid='"+stamperyid+"'", function (error, results) {
    connection.release();
    if (error) throw error;
    var jsonresults = results;
    var studentname = jsonresults[0].STUDENT_NAME;
    var fathername = jsonresults[0].FATHER_NAME;
    var cgpa = jsonresults[0].cgpa;
    var nric = jsonresults[0].nric;
    var stamperyid = jsonresults[0].stamperyid;
    var timestamp = jsonresults[0].timestamp; 
    var finaljsonpayload={
    "studentname":studentname,
    "fathername":fathername,
    "cgpa":cgpa,
    "nric":nric,
    "stamperyid":stamperyid,
    "timestamp":timestamp,
    "validity":validity

}
    res.send(finaljsonpayload);
      
  });
});
 

}).catch((err) => {
  return console.error(err);
});

});


});




var port=process.env.PORT || 8080;
app.listen(port);



