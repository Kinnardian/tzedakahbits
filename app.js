/*Tzedakahbits*/

/*
 * Module dependencies
 */

var lessMiddleware = require('less-middleware');
var express = require('express');
var bitcoin = require('bitcoin');
var app = express();
var pg = require('pg');



app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.locals.basedir = '/Users/Kinnard/Desktop/Projects/tzedakahbits2/';


app.configure( function(){
	
  app.use(express.logger('dev'))
  app.use(lessMiddleware({ 
    src: __dirname + '/src/less',
    dest: __dirname + '/public/style',
    prefix: '/style',
    compress: true
  }))
  app.use(express.static(__dirname + '/public'))
  app.use(express.bodyParser())
});


var btcclient = new bitcoin.Client({
  host: 'localhost',
  port: 8333,
  user: 'michael',
  pass: 'shortassword',

});

//Connect to Database
var connectionString = 'pg://@localhost/tzedakahbits';

//Get Causes and load them into variable for use by the app
var currentCauses;
getCauses = function () {
  
  client = pg.connect(connectionString, function(err, client, done){
  
    if(err) console.log(err);
    
    client.query('SELECT * FROM causes', function(err, result){
      //console.log(result.rows);
      console.log('poo');
      currentCauses = result.rows;
      //console.log(currentCauses);
      
      
    });
  
  });
return currentCauses;
};
getCauses();


var lastbalance;

var causeContainer = new Object();

getBalance = function (callback){
  btcclient.getBalance('*', 0, function(err, balance) {
    if (err) return console.log(err);
    if (lastbalance != balance || typeof lastbalance == 'undefined'){
      console.log('Last Balance:' + lastbalance);
      lastbalance = balance;
      updateCauses();
    }
    //console.log('Balance:', balance);
    

    if (typeof callback=='function') callback();

  });
};

setInterval(getBalance, 2000);

updateCauses = function (){
    getCauses();
    pg.connect(connectionString, function(err, client, done){
      if(err) console.log(err);
      
      client.query('SELECT address FROM causes', function(err, result){
      
        if (err) console.log(err);
        //console.log(result.rows);
        
        for (var i = 0; i < result.rows.length; i++) { 
          
          var address;
          address = result.rows[i].address;
          console.log(address);
          
          
          ( function (addr){ btcclient.getReceivedByAddress(addr, 0, function(err,balance){
                 
            
            var b = []; 
            b = [balance, addr];

            client.query('UPDATE causes set balance = ($1) where address = $2', b, function(err, result){
              


              if (err) console.log(err);
              console.log(addr);
              console.log(b);
              var r = i;
              console.log('i is: ' + r);
            });
        
          });})(address);
      
        };

      });
    });
};

app.get('/caligula',updateCauses);

getacausebyId = function (cause_id, callback) {
    
    var r = [];
    r.push(cause_id);
    var rows;
    
    return pg.connect(connectionString, function(err, client, done){
  
      if(err) console.log(err);
    
      rows = client.query('SELECT * FROM causes WHERE cause_id = $1', r, function(err, result){
      if(err) console.log(err);
      
      console.log('poopoo');
      //console.log(result.rows);
      causeContainer.cause=result.rows;
      console.log(causeContainer.cause);
      if (typeof callback=='function') callback();
      
      
      });
  
    });
};


console.log(typeof btcclient.getBalance);
console.log(typeof btcclient.getBalance('*'));

causeContainer.get = getacausebyId;





app.get('/', function (req, res) {
  res.render('index.jade', { title : 'Home', rows: currentCauses })
  

});

app.get('/newcause', function (req,res){
  res.render('newcause.jade', {title : 'Add a Cause', layout:false})

  console.log(currentCauses);
});

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
        var s = []
        s.push(address, result.rows[0].cause_id); //why does this work?
        client.query('UPDATE causes SET address = ($1) WHERE cause_id = $2', s, function(err)
          {if (err) console.log(err);}
        );
        res.render('causepage.jade', {rows: result.rows[0], address: address});
        return address;
        
      });      
      
    
    });    
  });
  
});



app.get('/causes', function (req,res){

res.render('pageofcauses.jade', {title : 'Causes', rows: currentCauses});

});


app.post('/donatetocause', function (req,res){

  console.log(req.body.cause_id);
  causeContainer.get(req.body.cause_id, function(){
    
    res.render('causepage.jade', {title : 'Cause', rows: causeContainer.cause[0]})
    
    console.log(causeContainer.cause);
    
    btcclient.getBalance(causeContainer.cause[0].address, 0, function(err, balance) {
      if (err) return console.log(err);
      console.log('Balance:', balance);
    });

    
  });

});

app.get('/mycontributions', function (req,res){
  res.render('mycontributions.jade', {title : 'My Contributions'});
});

app.get('/donate', function (req,res){
  res.render('donate.jade', {title : 'Donate'});
});


app.get('/bitcoin', function (req,res){
  res.render('bitcoin.jade', {title : 'What is bitcoin?'});
});

app.get('/about', function (req,res){
  res.render('about.jade', {title : 'About Us'});
});

app.get('/bettercausepage', function (req,res){
  res.render('bettercausepage.jade', {title : 'Better Causes'});
});




app.listen(4901);
