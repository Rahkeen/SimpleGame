
var socket = io();

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

socket.on('chat message', function(msg){
	var newline = document.createElement('li');

	newline.innerHTML = msg;
	var chatList = document.getElementById('chatList');
	if(chatList.childNodes.length>10){
		chatList.removeChild(chatList.childNodes[0]);
	}
	chatList.appendChild(newline);
});
