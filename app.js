
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
  this.canChat = true;
  this.oddmsg = false;
  this.emptyLobbyMsg = true;
}

GAME.prototype.drawLine = function(prevx, prevy, currentx, currenty){
  this.ctx.beginPath();
  this.ctx.moveTo(prevx, prevy);
  this.ctx.lineTo(currentx, currenty);
  this.ctx.stroke();
}

// case 0 default
// case 1 system
// case 2 user joined
GAME.prototype.writeMSG = function(msg, val){
  var newline = document.createElement('li');
  
switch(val){
  case 1:
    newline.className = "systemli";
    break;
  case 2:
    newline.className = "userli";
    break;
  default:
    if(this.oddmsg){
      newline.className = "oddli";
      this.oddmsg = false;
    }else{
      newline.className = "evenli";
      this.oddmsg = true;
    }
}

  newline.innerHTML = msg;
  var chatList = document.getElementById('chatList');
  chatList.appendChild(newline);
  chatList.scrollTop = chatList.scrollHeight;
}

GAME.prototype.changeDrawName = function(name){
  document.getElementById('drawname').innerHTML = name + " IS DRAWING";
}

function PLAYER(){
  this.prevx = 0;
  this.prevy = 0;
  this.x = 0;
  this.y = 0;
  this.drawing = false;
  this.lastEmit = (new Date).getTime();
  this.id = Math.round((new Date).getTime()*Math.random());
  this.canDraw = false;
}

// game variables


socket.on('drawOther',function(data){
  if(data.drawing && data.id in game.clients && data.canDraw){
    game.drawLine(game.clients[data.id].x, game.clients[data.id].y, data.x, data.y);
  }

  game.clients[data.id] = data;
  //game.clients[data.id].updated = (new Date).getTime();
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

  if(player.drawing && player.canDraw){
    game.drawLine(player.prevx, player.prevy, player.x, player.y);
    player.prevx = e.clientX;
    player.prevy = e.clientY;
  }
});

// chat
// sends message to server
var input = document.getElementById('chatInput');
input.onkeypress = function(e){
  if (!e) e = window.event;
  var keyCode = e.keyCode || e.which;
  if(keyCode == '13' && player.canChat){
    socket.emit('chat message', [player.id,input.value]);
    input.value = '';
    return false;
  };
}

socket.on('inactiveDrawer', function(){
  console.log('inactive user');
  player.canDraw = false;
  player.canChat = false;
  game.writeMSG('Drawer is inactive, switching to next person.',1);
});

// recieves message from server
socket.on('chat message', function(msg){
  game.writeMSG(msg,0);
});

socket.on('assignDraw', function(data){
  game.changeDrawName(data);
  game.emptyLobbyMsg = true;

  if(data == player.id){
    player.canDraw = true;
    player.canChat = false;
  }else{
    player.canDraw = false;
    player.canChat = true;
  }
});

socket.on('someoneJoined',function(data){
  game.writeMSG(data + ' has joined the lobby.',2);
});

socket.on('emptylobby',function(){
  if(game.emptyLobbyMsg){
    game.writeMSG('There is currently no one else in the lobby.',1);
    game.emptyLobbyMsg = false;
  }
});

socket.on('roundTime', function(time){
  document.getElementById('timeLeft').innerHTML = time;
});

socket.on('word', function(data){
  console.log(data);
});

socket.on('resetCanvas', function(){
  game.ctx.clearRect(0, 0, game.c.width, game.c.height);
})


function init(){
  socket.emit('checkin',player);
}

