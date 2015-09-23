
var socket = io();

var game = new GAME();
var player = new PLAYER();

window.onload = init();


function GAME(){
  //canvas stuff
  this.width = window.innerWidth;
  this.height = window.innerHeight;
  var c = document.getElementById('cvs');
  this.c = c;
  var ctx = c.getContext('2d');
  this.ctx = ctx;
  this.c.width = this.width;
  this.c.height = this.height;
  this.clients = {};
}

GAME.prototype.drawLine = function(prevx, prevy, currentx, currenty){
  this.ctx.beginPath();
  this.ctx.moveTo(prevx, prevy);
  this.ctx.lineTo(currentx, currenty);
  this.ctx.stroke();
}

function PLAYER(){
  this.prevx = 0;
  this.prevy = 0;
  this.x = 0;
  this.y = 0;
  this.drawing = false;
  this.lastEmit = (new Date).getTime();
  this.id = Math.round((new Date).getTime()*Math.random());
}

// game variables


socket.on('drawOther',function(data){
  if(data.drawing && game.clients[data.id]){
    game.drawLine(game.clients[data.id].x, game.clients[data.id].y, data.x, data.y);
  }

  game.clients[data.id] = data;
  game.clients[data.id].updated = (new Date).getTime();
});


game.c.addEventListener('mousedown', function(e) {
  player.drawing = true;
  player.prevx = e.clientX;
  player.prevy = e.clientY;
  //console.log('('+player.prevx+','+player.prevy+')');
});

game.c.addEventListener('mouseup', function(e){
  player.drawing = false;
});

game.c.addEventListener('mouseleave', function(e){
  player.drawing = false;
});

game.c.addEventListener('mousemove', function(e){
  
  // update positions
  player.x = e.clientX;
  player.y = e.clientY;

  if((new Date).getTime() - player.lastEmit > 30){
    
    socket.emit('draw',player);
    player.lastEmit = (new Date).getTime();
  }

  if(player.drawing){
    game.drawLine(player.prevx, player.prevy, player.x, player.y);
    player.prevx = e.clientX;
    player.prevy = e.clientY;
  }
});

// chat
// chat
// sends message to server
var input = document.getElementById('chatInput');
input.onkeypress = function(e){
  if (!e) e = window.event;
  var keyCode = e.keyCode || e.which;
  if(keyCode == '13'){
    socket.emit('chat message', input.value);
    input.value = '';
    return false;
  };
}
// recieves message from server
socket.on('chat message', function(msg){
  var newline = document.createElement('li');

  newline.innerHTML = msg;
  var chatList = document.getElementById('chatList');
  if(chatList.childNodes.length>10){
    chatList.removeChild(chatList.childNodes[0]);
  }
  chatList.appendChild(newline);
});

function init(){
  socket.emit('checkin',player);
}

