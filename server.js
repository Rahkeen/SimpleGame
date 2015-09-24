
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

function GAME(){
  this.clients = [];
  this.leaderboard = {};
  this.sockets = {};
  this.roundTime = 30;
  this.emergencyRoundTime = 30;
  this.currentRoundTime = 30;
  this.firstGuess = 0;
  this.assignPoints = 10;
  this.inactiveTimeCheck = 10;
  this.isHere = false;
}
var game = new GAME();



// get word
game.currentWord = dictionary_words[0];


setInterval(function(){
  //console.log(game.clients.length);
  // check if there are people
  // if there are no people skip
  if(game.clients.length > 1){
    console.log('current round time: ' + game.currentRoundTime);
    //console.log('leaderboard: ' + game.leaderboard);
    // send out the word
    // give next person that draw oppertunity
    io.emit('assignDraw', game.clients[0].id);
    game.sockets[game.clients[0].id].emit('word',dictionary_words[0]);
    
    // wait for timer, and check against inputs from chat
    // subtract 1 second from round time
    game.currentRoundTime -= 1;

    // if drawer hasn't drawn anything for the first game.inactiveTimeCheck, go to next user
    if(game.currentRoundTime < game.roundTime - game.inactiveTimeCheck && game.isHere == false){
      io.emit('inactiveDrawer');
      game.clients.splice(0,1);
      reset();
    }
    if(game.currentRoundTime < 0){
      reset();
    }

  }else{
    console.log('nobody in here');
  }

},1000);


function reset(){
  game.currentRoundTime = game.roundTime;
  game.firstGuess = 0;
  game.isHere = false;
  // refresh to remove inactive players

  // shift everyone up a spot
  game.clients.push(game.clients.shift());

  dictionary_words.shift();
  game.currentWord = dictionary_words[0];

  io.emit('resetCanvas');
  // reset things that need to be reset
}

// intial connection

io.on('connection', function(socket){

  socket.on('checkin',function(data){
    game.clients.push(data);

    game.sockets[data.id] = socket;
    //delete game.clients[data.id];
    //console.log(socket);
  });


  //io.emit('test', dictionary[2]);
  // chat
    socket.on('chat message', function(data){

      // if msg == dictionary word is first instance, set timer into emergency mode
      if(data[1] == game.currentWord && game.currentRoundTime > 0){
        console.log('guess correct');
        game.firstGuess += 1;
        if(game.firstGuess == 1){
          game.currentRoundTime = game.emergencyRoundTime;
          console.log('emergency time activated')
        }

        // assign points to person
        if(data[0] in game.leaderboard){
          game.leaderboard[data[0]] += game.assignPoints;
        }else{
          game.leaderboard[data[0]] = game.assignPoints;
        }
      }

      io.emit('chat message', data[1]);
      //console.log('message: ' + msg);
    });

    socket.on('draw',function(player){
      if(player.id == game.clients[0].id){
        game.isHere = true;
      }
      socket.broadcast.emit('drawOther', player);
    });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


