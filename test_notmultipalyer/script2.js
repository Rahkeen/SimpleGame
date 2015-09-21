var backendCanvas;

function GAME(){
	this.level_canvas = document.getElementById("level");
	this.player_canvas = document.getElementById("player");
	
	// level_canvas handles the map
	// player_canvas handles the player
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	this.level_canvas.width = this.width;
	this.level_canvas.height = this.height;
	this.player_canvas.width = this.width;
	this.player_canvas.height = this.height;
	this.level_canvas_ctx = this.level_canvas.getContext('2d');
	this.player_canvas_ctx = this.player_canvas.getContext('2d');
	this.level_canvas_ctx.clearRect(0,0,this.width,this.height);
	this.player_canvas_ctx.clearRect(0,0,this.width,this.height);

	

}



// PLAYER is a user object
function PLAYER(player_canvas_ctx){
	this.x = 200;
	this.y = 0;
	this.width = 10;
	this.height = 10;
	this.player_canvas_ctx = player_canvas_ctx;
	
	
	//var img = new Image();
	//this.img = img;
	//img.src = "turtle.png";
	//img.onload = function(){
	//	player_canvas_ctx.drawImage(img, 80, 0);
	//}
	player_canvas_ctx.beginPath();
	player_canvas_ctx.arc(200,0,10,0,2*Math.PI);
	player_canvas_ctx.stroke();
	
	
	this.jumping = false;
    this.left_key = false;
    this.right_key = false;
    this.space_key = false;
    this.character_speed = 0;
	// [left,down,right,up]
	this.movement = [true,true,true,true];
	
}

PLAYER.prototype.updateLevel = function(level_imageData){
	this.level = level_imageData;
}

PLAYER.prototype.moveCharacter = function(){
	this.checkCollision();
    if(this.movement[1] == true){
		this.y+=4;
	}
	
	if(this.left_key == true){
		if(this.movement[0] == true){
			this.x-=1;
		}
		if(this.movement[0] == false){
			this.y-=1;
			this.x-=1;
		}
	}
	
	if(this.right_key){
		if(this.movement[2] == true){
			this.x+=1;
		}
		if(this.movement[3] == true && this.movement[2] == false){
			this.y-=1;
		}
	}
	this.drawCharacter();
}

PLAYER.prototype.drawCharacter = function(){
	
	this.player_canvas_ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
	//this.player_canvas_ctx.drawImage(this.img,this.x,this.y);
	this.player_canvas_ctx.beginPath();
	this.player_canvas_ctx.arc(this.x,this.y,10,0,2*Math.PI);
	this.player_canvas_ctx.stroke();
}


// checks collision from below
// TODO: check collisions from the front and back
PLAYER.prototype.checkCollision = function(){
		
		
		// checks below
        // check alpha beneath
		//console.log(this.y);
		var x = this.x + this.width/2;
		var y = this.y + this.height;
		var idx = (x + y * this.level.width) * 4;
		
		 /* for(var i=idx; i<idx+10; i+=4){
		this.level.data[i + 0] = 255;
        this.level.data[i + 1] = 0;
        this.level.data[i + 2] = 0;
        this.level.data[i + 3] = 255;
		}   */
		

		if(this.level.data[idx+3] == 255){
			this.movement[1] = false;
		}else{
			this.movement[1] = true;
		}
		
		
		// checks to the left
		x = this.x - this.width;
		y = this.y + (0.5 * this.height);
		idx = (x + y * this.level.width) * 4;
		console.log(this.movement);

		if(this.level.data[idx+3] == 255){
			this.movement[0] = false;
		}else{
			this.movement[0] = true;
		}
		
		// checks to the right
		x = this.x + this.width;
		idx = (x + y * this.level.width) * 4;
		if(this.level.data[idx+3] == 255){
			this.movement[2] = false;
		}else{
			this.movement[2] = true;
		}
		
		//checks above
		x = this.x + this.width/2;
		y = this.y;
		idx = (x + y * this.level.width) * 4;
		if(this.level.data[idx+3] == 255){
			this.movement[3] = false;
		}else{
			this.movement[3] = true;
		}
		
		return true;
}

function render(game,user){
		
	user.updateLevel(game.level_canvas_ctx.getImageData(0,0,game.width,game.height));
	//check collision and drop
	user.moveCharacter();
	
}

function init(){
	
	// load gameheight
	var game = new GAME();
	
	// loads the map
	// load map
	var img = new Image();
	img.src = "level.png";
	img.onload = function(){
		game.level_canvas_ctx.drawImage(img, 30,400);
	}
	
	// adds a player
	var user = new PLAYER(game.player_canvas_ctx);
	
	// click explosion
	game.level_canvas.addEventListener("mousedown", function(e){
		var x = e.offsetX,
        y = e.offsetY;
    
		game.level_canvas_ctx.globalCompositeOperation = "destination-out";
		game.level_canvas_ctx.beginPath();
		game.level_canvas_ctx.arc(x, y, 30, 0, Math.PI * 2, true);
		game.level_canvas_ctx.fill();
	
		
		
		// 1. save updated canvas
		var canvasData = game.level_canvas_ctx.getImageData(0,0,game.width,game.height);
		
		// updates users level map
		user.updateLevel(canvasData);
		
		/* // test
		x = user.x - user.width;
		y = user.y + (0.5 * user.height);
		idx = (x + y * user.level.width) * 4;
		console.log(idx);
		for(var i=idx; i<idx+100; i+=4){
		canvasData.data[i + 0] = 255;
        canvasData.data[i + 1] = 0;
        canvasData.data[i + 2] = 0;
        canvasData.data[i + 3] = 255;
		} */
		
		// 2. clear canvas to draw clean one
		game.level_canvas_ctx.clearRect(0,0, game.width,game.height);
		// 3. draw the updated canvas
		game.level_canvas_ctx.putImageData(canvasData, 0, 0);
	
	}, false);
	
	document.onkeydown = function(e){
		var KeyID = e.keyCode;
		if (KeyID === 37) user.left_key = true;
		if (KeyID === 39) user.right_key = true;
	};
    document.onkeyup = function(e){
		var KeyID = e.keyCode;
		if (KeyID === 37) user.left_key = false;
		if (KeyID === 39) user.right_key = false;
	}
	
	
	setInterval(function(){ render(game,user); }, 30);
}
