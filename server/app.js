var express = require('express');
var fs = require('fs');
var app = express();
var events = require('events');
var piEmitter = new events.EventEmitter();
var sys = require('sys');
var exec = require('child_process').exec;

app.use('/public', express.static('public'));
app.use(express.bodyParser());

// Server Sent Events Stream
app.get('/events', function(req, res){
  var messenger = require('./messenger')(req, res);
  messenger.setup();

  // when node event triggers, pass it on to the browser
  piEmitter.on('send', function(e){
    messenger.send(e.event, e.data);
  });

});

addRoute('/nextstache', 'nextstache');
addRoute('/previousstache', 'previousstache');
addRoute('/wakeup', 'wakeup');
addRoute('/takepic', 'takepic');

// accepts { picture: [base64 encoded image string] }
app.post('/picture', function(req, res){
  var img = new Buffer(req.body.picture, 'base64');
  var imgFile = __dirname + '/pictures/stache-' + new Date().getTime() + '.jgp';
  fs.writeFileSync(imgFile, img);
  // print to default system printer
  exec('lpr ' + imgFile , function(error, stdout, stderr){
    res.send();
  });
});

app.listen(3000);

// Add a route that triggers a node event which will kick off a server sent event
function addRoute(path, event){
  app.get(path, function(req, res){
    piEmitter.emit('send', {event: event});
    res.send();
  });  
}