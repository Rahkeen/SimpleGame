
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
var users = [];

// intial connection

io.on('connection', function(socket){


	socket.on('addSquare', function(){
		// variables
		var player = {
        	id: socket.id,
        	x: Math.round(Math.random() * 360),
        	y: Math.round(Math.random() * 360),
        	width: Math.round(Math.random() * 360),
        	height: Math.round(Math.random() * 360),
        	hue: Math.round(Math.random() * 360),
    	};

    	console.log('PUSH PLAYER: ' + player);
    	users.push(player);
    	io.emit('drawSquare', player);
	});

	// chat
  	socket.on('chat message', function(msg){
    	io.emit('chat message', msg);
  		//console.log('message: ' + msg);
  	});

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

<<<<<<< HEAD
function Shape(x,y,w,h, fill){
	this.x = x || 0;
	this.y = y || 0;
	this.w = w || 1;
	this.h = h || 1;
	this.fill = fill || '#AAAAAA';
}


// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my) {
  // All we have to do is make sure the Mouse X,Y fall in the area between
  // the shape's X and (X + Width) and its Y and (Y + Height)
  return  (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my);
}

=======
>>>>>>> origin/master
