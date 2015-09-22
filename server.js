
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/'));

// variables
var sockets = {};



// intial connection

io.on('connection', function(socket){


	

	// chat
  	socket.on('chat message', function(msg){
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

