
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');

var dictionary = require('./dictionary.json');
var dictionary_words = Object.keys(dictionary).map(function(k){
    return k;
});
//dictionary = JSON.parse(dictionary);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/'));

// variables
var sockets = {};
function GAME(){
  this.clients = [];
  this.roundTime = 120;
  this.emergencyRoundTime = 30;
  this.currentRoundTime = 120;
}
var game = new GAME();



// get word
console.log(dictionary_words[0]);


setInterval(function(){
  //console.log(game.clients.length);
  // check if there are people
  // if there are no people skip
  if(game.clients.length > 1){

    // give next person that draw oppertunity
    io.emit('assignDraw', game.clients[0].id);
    // wait for timer, and check against inputs from chat

      // if gotit flag is true then emergencytimer starts

    // when timer runs assign the points
  }else{

  }

},1000);


// intial connection

io.on('connection', function(socket){

  socket.on('checkin',function(data){
    game.clients.push(data);

    //delete game.clients[data.id];
    console.log(data.id);
  });


  //io.emit('test', dictionary[2]);
  // chat
    socket.on('chat message', function(msg){

      // if msg == dictionary word, set a gotit flag

      io.emit('chat message', msg);
      //console.log('message: ' + msg);
    });

    socket.on('draw',function(player){
      socket.broadcast.emit('drawOther', player);
    });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


