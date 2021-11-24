document.body.innerHTML += "<canvas id='gameCanvas' style='position:absolute;top:0;left:0;' width='100%' height='100%'></canvas>";
document.body.innerHTML += "<canvas id='gameCanvas2' style='position:absolute;top:0;left:0;' width='100%' height='100%'></canvas>";

const c1 = document.getElementById("gameCanvas");
const c2 = document.getElementById("gameCanvas2");
    
var canvas = c1;
var context = canvas.getContext("2d");

var player;

var things = [];
var thingstoadd = [];
var thingstoremove = [];

var keys = [];
var keyslastupdate = [];
    
var updatespersecond = 60;
    
var mode = 1; //1 is normal, 2 is inverted

const upKeys = [87, 38];
const downKeys = [83, 40];
const leftKeys = [65, 37];
const rightKeys = [68, 39];

const shopKey = 9;
    
const startKey = 32;

const modeswapKey = 78;

const exhaustupgradeKey = 69;

const pointupgradeKey = 80;

var timer = 0;
var summontime = 50;
    
var playing = false;

var doreset = true;
    
var points = 0;
    
//var hiscore = 0;
    
var virtwidth = 1920;
    
var widthfactor = 1;

var paused = false;

var upPressed = false;
var downPressed = false;
var leftPressed = false;
var rightPressed = false;

var shop;

document.addEventListener('keydown', function(event) {
	if(!keys.includes(17)){ //Allow ctrl key
		event.preventDefault();
	}
    if(!keys.includes(event.keyCode)){
        keys.push(event.keyCode);
    }
});
document.addEventListener('keyup', function(event) {
    if(keys.includes(event.keyCode)){
        keys.splice(keys.indexOf(event.keyCode), 1);
    }
});

function summonAsteroid(){
    points += (1/widthfactor) * player.pointmulti;
    
    //if(points > hiscore){hiscore = points;}
    if(summontime > 8){
        summontime = summontime * (1 - (1 / widthfactor) / 100);
    }
    
    var side = Math.floor(Math.random() * 4) + 1;
    
    var setxs;
    var setys;
    
    var setx;
    var sety;
    if(Math.random() > 0.1){
        if(side == 1){
            setx = -30; //keep at asteroid size
            sety = Math.random() * canvas.height;
            setxs = Math.random() * 3 + 2;
            setys = Math.random() * 2 - 1;
        }
        if(side == 2){
            setx = Math.random() * canvas.width;
            sety = -30;
            setxs = Math.random() * 2 - 1;
            setys = Math.random() * 3 + 2;
        }
        if(side == 3){
            setx = canvas.width;
            sety = Math.random() * canvas.height;
            setxs = Math.random() * -3 - 2;
            setys = Math.random() * 2 - 1;
        }
        if(side == 4){
            setx = Math.random() * canvas.width;
            sety = canvas.height;
            setxs = Math.random() * 2 - 1;
            setys = Math.random() * -3 - 2;
        }

        toAdd = new Asteroid(setx, sety, setxs, setys);
    }
    else{
        if(side == 1){
            setx = -20; //keep at coin size
            sety = Math.random() * canvas.height;
            setxs = Math.random() * 3 + 2;
            setys = Math.random() * 2 - 1;
        }
        if(side == 2){
            setx = Math.random() * canvas.width;
            sety = -20;
            setxs = Math.random() * 2 - 1;
            setys = Math.random() * 3 + 2;
        }
        if(side == 3){
            setx = canvas.width;
            sety = Math.random() * canvas.height;
            setxs = Math.random() * -3 - 2;
            setys = Math.random() * 2 - 1;
        }
        if(side == 4){
            setx = Math.random() * canvas.width;
            sety = canvas.height;
            setxs = Math.random() * 2 - 1;
            setys = Math.random() * -3 - 2;
        }

        toAdd = new Coin(setx, sety, setxs, setys);
    }
    thingstoadd.push(toAdd);
}

function loop(){
    setTimeout(loop, 1000/updatespersecond); //Put here to avoid lag, but can be risky on very slow computers
	widthfactor = canvas.width / virtwidth;
	upPressed = false;
	downPressed = false;
	leftPressed = false;
	rightPressed = false;
	for(i=0;i<keys.length;i++){
		if(upKeys.includes(keys[i])){upPressed = true;}
		if(downKeys.includes(keys[i])){downPressed = true;}
		if(leftKeys.includes(keys[i])){leftPressed = true;}
		if(rightKeys.includes(keys[i])){rightPressed = true;}
	}
    if(canvas == c1){
        canvas = c2;
        c2.style.visibility = "hidden";
        c1.style.visibility = "visible";
    }
    else if(canvas == c2){
        canvas = c1;
        c1.style.visibility = "hidden";
        c2.style.visibility = "visible";
    }
	if(keypressed(modeswapKey)){
		if(mode == 1){
			mode = 2;
		}
		else{
			mode = 1;
		}
	}
    context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height)
    if(playing){
		if(!paused){
			timer++;
			if(timer * widthfactor >= summontime){
				summonAsteroid();
				timer = 0;
			}
		}
        context.fillStyle = "white";
        context.font = (48 * widthfactor).toString()+"px Courier New";
        context.fillText(Math.floor(points * 100).toString(), 50 * widthfactor, 50 * widthfactor);
        //context.fillText(Math.floor(hiscore * 100).toString(), canvas.width - (50 + 32 * (Math.floor(hiscore * 100).toString()).length) * widthfactor, 50 * widthfactor);
    }
    if(doreset){
        homereset();
    }
    for(i=0;i<things.length;i++){
        var currentThing = things[i];
        currentThing.Update();
    }
	if(shop != null){
		shop.Update();
	}
    for(i=0;i<thingstoremove.length;i++){
        things.splice(things.indexOf(thingstoremove[i]), 1);
    }
    thingstoremove = [];
    for(i=0;i<thingstoadd.length;i++){
        things.push(thingstoadd[i]);
    }
    thingstoadd = [];
	keyslastupdate = keys.slice();
}

function keypressed(key){
	return (keys.includes(key) && !keyslastupdate.includes(key));
}

function reset(){
    playing = true;
    player = new Player(canvas.width / 2, canvas.height / 2);
    things = [];
    things.push(player);
    timer = 0;
    summontime = 50;
    points = 0;
	shop = new ShopManager();
}
    
function homereset(){
    playing = false;
    things = [];
    thingstoadd = [];
    thingstoremove = [];
	shop = null;
    doreset = false;
    things.push(new HomeManager());
}

class Thing{
    constructor(setx, sety, setw, seth){
        this.xpos = setx;
        this.ypos = sety;
        this.width = setw;
        this.height = seth;
        this.color = "black";
    }
    Update(){
        context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width, this.height);
    }
}

class PhyThing extends Thing{
    constructor(setx, sety, setw, seth){
        super(setx, sety, setw, seth);
        this.xSpeed = 0;
        this.ySpeed = 0;
    }
    Update(){
		if(!paused){
			this.xpos += this.xSpeed;
			this.ypos += this.ySpeed;
		}
        context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width, this.height);
    }
}

class Exhaust extends PhyThing{
    constructor(setx, sety, xd, yd, xof, yof, weight){
        super(setx - 2.5, sety - 2.5, 5, 5);
        this.xSpeed = xd * ((Math.random() + 1) * 10) + Math.random() * 5 - 2.5 + xof;
        this.ySpeed = yd * ((Math.random() + 1) * 10) + Math.random() * 5 - 2.5 + yof;
        this.color = "white";
		this.weight = weight;
    }
    Update(){
		if(!paused){
			if(this.xSpeed > 0 && this.xpos > canvas.width){
				thingstoremove.push(this);
				return;
			}
			else if(this.xSpeed < 0 && this.xpos + this.width < 0){
				thingstoremove.push(this);
				return;
			}
			if(this.ySpeed > 0 && this.ypos > canvas.height){
				thingstoremove.push(this);
				return;
			}
			else if(this.yspeed < 0 && this.ypos + this.height < 0){
				thingstoremove.push(this);
				return;
			}
			this.xpos += this.xSpeed;
			this.ypos += this.ySpeed;
			var hitsomething = false;
			for(var i=0; i<things.length;i++){
				var currentThing = things[i];
				if(currentThing instanceof Asteroid){
					var hitAsteroid = false;
					if(this.xpos < currentThing.xpos + currentThing.width && this.ypos < currentThing.ypos + currentThing.height && currentThing.xpos < this.xpos + this.width && currentThing.ypos < this.ypos + this.height){
						hitAsteroid = true;
					}
					if(hitAsteroid){
						hitsomething = true;
						currentThing.xSpeed += this.xSpeed * this.weight;
						currentThing.ySpeed += this.ySpeed * this.weight;
					}
				}
			}
			if(hitsomething){
				thingstoremove.push(this);
			}
		}
        context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width, this.height);
    }
}
    
class Asteroid extends PhyThing{
    constructor(setx, sety, sethor, setver){
        super(setx, sety, 30, 30);
        this.xSpeed = sethor;
        this.ySpeed = setver;
        this.color = "grey";
    }
    Update(){
		if(!paused){
			if(this.xSpeed > 0 && this.xpos > canvas.width){
				thingstoremove.push(this);
				return;
			}
			else if(this.xSpeed < 0 && this.xpos + this.width < 0){
				thingstoremove.push(this);
				return;
			}
			if(this.ySpeed > 0 && this.ypos > canvas.height){
				thingstoremove.push(this);
				return;
			}
			else if(this.yspeed < 0 && this.ypos + this.height < 0){
				thingstoremove.push(this);
				return;
			}
			this.xpos += this.xSpeed;
			this.ypos += this.ySpeed;
			var hitPlayer = false;
			if(this.xpos < player.xpos + player.width && this.ypos < player.ypos + player.height && player.xpos < this.xpos + this.width && player.ypos < this.ypos + this.height){
				hitPlayer = true;
			}
			if(hitPlayer){
				doreset = true;
			}
		}
        context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width, this.height);
    }
}

class Coin extends PhyThing{
    constructor(setx, sety, sethor, setver){
        super(setx, sety, 20, 20);
        this.xSpeed = sethor;
        this.ySpeed = setver;
        this.color = "yellow";
    }
    Update(){
		if(!paused){
			if(this.xSpeed > 0 && this.xpos > canvas.width){
				thingstoremove.push(this);
				return;
			}
			else if(this.xSpeed < 0 && this.xpos + this.width < 0){
				thingstoremove.push(this);
				return;
			}
			if(this.ySpeed > 0 && this.ypos > canvas.height){
				thingstoremove.push(this);
				return;
			}
			else if(this.yspeed < 0 && this.ypos + this.height < 0){
				thingstoremove.push(this);
				return;
			}
			this.xpos += this.xSpeed;
			this.ypos += this.ySpeed;
			var hitPlayer = false;
			if(this.xpos < player.xpos + player.width && this.ypos < player.ypos + player.height && player.xpos < this.xpos + this.width && player.ypos < this.ypos + this.height){
				hitPlayer = true;
			}
			if(hitPlayer){
				points += 10 * player.pointmulti;
				thingstoremove.push(this);
			}
		}
        context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width, this.height);
    }
}
    
class HomeManager extends Thing{
    constructor(){
        super(0, 0, 0, 0);
        this.screen = "home";
    }
    SwapScreen(){
        if(this.screen == "home"){this.screen = "tips";}
        else if(this.screen == "tips"){this.screen = "home";}
    }
    Update(){
        if(keypressed(84)){
			this.SwapScreen();
		}
        context.fillStyle = "green";
        context.font = (96 * widthfactor).toString()+"px Courier New";
        if(this.screen == "home"){
            context.fillText("bad", canvas.width / 2, 100 * widthfactor);
            context.fillText("asteroid", canvas.width / 2, 200 * widthfactor);
            context.fillText("game", canvas.width / 2, 300 * widthfactor);
            context.fillText("thing", canvas.width / 2, 400 * widthfactor);
            context.fillText("(press space)", canvas.width / 2 - 200 * widthfactor, 500 * widthfactor);
            context.font = (32 * widthfactor).toString()+"px Courier New";
            context.fillText("Mode: ", 50 * widthfactor, 50 * widthfactor);
            if(mode == 1){
                context.fillText("Normal", 150 * widthfactor, 50 * widthfactor);
            }
            else if(mode == 2){
                context.fillText("Inverted (stupid baka mode)", 150 * widthfactor, 50 * widthfactor);
            }
            context.fillText("n to change mode", 50 * widthfactor, 90 * widthfactor);
            context.fillText("(t for tips)", 50 * widthfactor, 200 * widthfactor);
            if(keys.includes(startKey)){
               reset();
            }
        }
        else if(this.screen == "tips"){
            context.font = (32 * widthfactor).toString()+"px Courier New";
            context.fillText("Tip: if the screen seems to small or big to you, use the built in zoom in your browser", 50 * widthfactor, 50 * widthfactor);
            context.fillText("ctrl + or ctrl -", 50 * widthfactor, 90 * widthfactor);
			context.fillText("Tip: Press TAB to open the shop, where you can spend your points", 50 * widthfactor, 130 * widthfactor);
			context.fillText("Tip: Coins are yellow squares, slightly smaller than asteroids. They give you points!", 50 * widthfactor, 170 * widthfactor);
        }
    }
}

class ShopManager extends Thing{
    constructor(){
        super(0, 0, 0, 0);
		this.visible = false;
    }
    Update(){
		if(keypressed(shopKey)){
			this.visible = !this.visible;
		}
		paused = this.visible;
		if(this.visible){
			context.fillStyle = "green";
			context.font = (96 * widthfactor).toString()+"px Courier New";
			context.fillText("shop", canvas.width / 2, 100 * widthfactor);
			
			context.font = (48 * widthfactor).toString()+"px Courier New";
			context.fillText("Exhaust weight: "+Math.floor(player.exhaustweight * 10000).toString(), 100 * widthfactor, 400 * widthfactor);
			context.fillText("(E to upgrade - Cost: 10000)", 100 * widthfactor, 448 * widthfactor);
			
			context.fillText("Point Multiplier: "+Math.floor(player.pointmulti * 100).toString()+"%", 100 * widthfactor, 600 * widthfactor);
			context.fillText("(P to upgrade - Cost: 10000)", 100 * widthfactor, 648 * widthfactor);
			
			
			if(keypressed(exhaustupgradeKey) && points > 100){
				player.exhaustweight += 0.002;
				points -= 100;
			}
			
			if(keypressed(pointupgradeKey) && points > 100){
				player.pointmulti += 0.1;
				points -= 100;
			}
		}
	}
}
    
class Player extends PhyThing{
    constructor(setx, sety){
        super(setx, sety, 15, 15);
        this.color = "red";
		this.exhaustweight = 0.01;
		this.pointmulti = 1;
    }
    Update(){
		if(!paused){
			this.xpos += this.xSpeed;
			this.ypos += this.ySpeed;

			var xdelta = 0;
			var ydelta = 0;
			if(mode == 1){
				if(leftPressed){
					xdelta -= 0.1;
				}
				if(rightPressed){
					xdelta += 0.1;
				}
				if(upPressed){
					ydelta -= 0.1;
				}
				if(downPressed){
					ydelta += 0.1;
				}
			}
			else if(mode == 2){
				if(leftPressed){
					xdelta += 0.1;
				}
				if(rightPressed){
					xdelta -= 0.1;
				}
				if(upPressed){
					ydelta += 0.1;
				}
				if(downPressed){
					ydelta -= 0.1;
				}
			}
			this.xSpeed += xdelta;
			this.ySpeed += ydelta;
			
			if(xdelta > 0){
				if(ydelta > 0){
					thingstoadd.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, -0.707, -0.707, this.xSpeed, this.ySpeed, this.exhaustweight));
				}
				else if(ydelta < 0){
					thingstoadd.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, -0.707, 0.707, this.xSpeed, this.ySpeed, this.exhaustweight));
				}
				else{
					thingstoadd.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, -1, 0, this.xSpeed, this.ySpeed, this.exhaustweight));
				}
			}
			else if(xdelta < 0){
				if(ydelta > 0){
					thingstoadd.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, 0.707, -0.707, this.xSpeed, this.ySpeed, this.exhaustweight));
				}
				else if(ydelta < 0){
					thingstoadd.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, 0.707, 0.707, this.xSpeed, this.ySpeed, this.exhaustweight));
				}
				else{
					thingstoadd.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, 1, 0, this.xSpeed, this.ySpeed, this.exhaustweight));
				}
			}
			else{
				if(ydelta > 0){
					thingstoadd.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, 0, -1, this.xSpeed, this.ySpeed, this.exhaustweight));
				}
				else if(ydelta < 0){
					thingstoadd.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, 0, 1, this.xSpeed, this.ySpeed, this.exhaustweight));
				}
			}
			
			if(this.xpos < 0){
				this.xpos = 0;
				this.xSpeed = 0;
			}
			if(this.xpos + this.width > canvas.width){
				this.xpos = canvas.width - this.width;
				this.xSpeed = 0;
			}
			if(this.ypos < 0){
				this.ypos = 0;
				this.ySpeed = 0;
			}
			if(this.ypos + this.height > canvas.height){
				this.ypos = canvas.height - this.height;
				this.ySpeed = 0;
			}
		}
        context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width, this.height);
    }
}

loop();
