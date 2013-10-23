/*Tzedakahbits*/

/*
 * Module dependencies
 */

var lessMiddleware = require('less-middleware');
var express = require('express');
var bitcoin = require('bitcoin')
var app = express();
var pg = require('pg');



app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.set('view options', { layout: false });
app.locals.basedir = '/Users/Kinnard/Desktop/Projects/tzedakahbits/';


app.configure( function(){
	
  app.use(express.logger('dev'))
  app.use(lessMiddleware({ 
    src: __dirname + '/src/less',
    dest: __dirname + '/public/style',
    prefix: "/style",
    compress: true
  }))
  app.use(express.static(__dirname + '/public'))
  app.use(express.bodyParser())
})


var btcclient = new bitcoin.Client({
  host: 'localhost',
  port: 8332,
  user: 'kinnard',
  pass: 'randomassword',

});

//Connect to Database
var connectionString = 'pg://@localhost/tzedakahbits';



app.get('/', function (req, res) {
  res.render('index.jade', { title : 'Home' })

})

app.get('/newcause', function (req,res){
  res.render('newcause.jade', {title : 'Add a Cause', layout:false})
})

app.post('/newcause', function (req,res){
  
  console.log(req.body);
  
  var r = [];
  
  r.push(req.body.causeName, req.body.goal, req.body.organization, req.body.sponsor, req.body.submitterEmail);
  console.log(r);

  
  client = pg.connect(connectionString, function(err, client, done){
    if(err) console.log(err);
    client.query('INSERT INTO causes (cause_name, goal, organization, sponsor, submitter) VALUES ($1,$2,$3,$4,$5) RETURNING *', r, function(err, result){
      
      console.log('This is r ' + r)
      
      if (err) return console.log(err);
      
      console.log('These are the Rows' + toString(result.rows[0]));
      btcclient.getNewAddress(function(err,address){
        if (err) return console.log(err);
        console.log('New Address' + address);
        //client.query('INSERT INTO causes VALUES $1')
        res.render('causepage.jade', {rows: result.rows[0], address: address});
        return address;
        
      });

      console.log('smeh! why is nothing logged' + result.rows[0].cause_id);      
      
    
    });    
  });
  
});


app.get('/causes', function (req,res){
  res.render('causepage.jade', {title : 'Causes', layout:false});
});

app.post('/donatecause', function (req,res){

  console.log(req.body);
  btcclient.getNewAddress( 2, function(err, address){
    console.log(address);
  });

  btcclient.getBalance('*', 6, function(err, balance) {
    if (err) return console.log(err);
    console.log('Balance:', balance);
  });

})

app.get('/donate', function (req,res){
  res.render('donate.jade', {title : 'Donate'});
});


app.get('/bitcoin', function (req,res){
  res.render('bitcoin.jade', {title : 'What is bitcoin?'});
});

app.get('/about', function (req,res){
  res.render('about.jade', {title : 'About Us'});
});




app.listen(4900);
