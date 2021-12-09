//HTML Stuff

document.body.innerHTML += "<canvas id='gameCanvas' style='position:absolute;top:0;left:0;' width='100%' height='100%'></canvas>";
document.body.innerHTML += "<canvas id='gameCanvas2' style='position:absolute;top:0;left:0;' width='100%' height='100%'></canvas>";

//HTML Constants
const c1 = document.getElementById("gameCanvas");
const c2 = document.getElementById("gameCanvas2");

//Engine vars
var canvas = c1;
var context = canvas.getContext("2d");

var things = [];
var thingstoadd = [];
var thingstoremove = [];

var keys = [];
var keyslastupdate = [];

var mouseX = 0;
var mouseY = 0;

var MBsDownLF = [];

var MBsDown = [];

var MBsPressed = [];

var updatespersecond = 120;
var regspeed = updatespersecond / 60; //Basically how much faster the current updates per second are than 60, so 120 would be regspeed of 2, 180 3, etc.

var virtwidth = 1920;
var widthfactor = 1;

//Game vars
var coinchance = 0.1;
var bhchance = 0.1;
var bhstrength = 0.02;
    
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
const powerupgradeKey = 221;
const powerdowngradeKey = 219;

var timer = 0;
var summontime = 50;

var playing = false;

var doreset = true;

var points = 0;

var numframes = 0;

var time;

var dead;

var paused = false;

var upKeyDown = false;
var downKeyDown = false;
var leftKeyDown = false;
var rightKeyDown = false;

//Game instance vars
var player;

//Game UI vars
var gameoverscreen;
var shop;

//Event listeners
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
document.addEventListener('mousemove', function(event){
	mouseX = event.clientX;
	mouseY = event.clientY;
});
document.addEventListener('mousedown', function(event){
	MBsDown[event.button] = true;
});
document.addEventListener('mouseup', function(event){
	MBsDown[event.button] = false;
});

//Main loop
setInterval(loop, 1000/updatespersecond);
function loop(){
	widthfactor = canvas.width / virtwidth;
	upKeyDown = false;
	downKeyDown = false;
	leftKeyDown = false;
	rightKeyDown = false;
	for(i=0;i<keys.length;i++){
		if(upKeys.includes(keys[i])){upKeyDown = true;}
		if(downKeys.includes(keys[i])){downKeyDown = true;}
		if(leftKeys.includes(keys[i])){leftKeyDown = true;}
		if(rightKeys.includes(keys[i])){rightKeyDown = true;}
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
			time++;
			timer++;
			if((timer * widthfactor) / regspeed >= summontime){
				summonAsteroid();
				timer = 0;
			}
		}
        context.fillStyle = "white";
        context.font = (48 * widthfactor).toString()+"px Courier New";
        context.fillText(Math.floor(points * 100).toString(), 50 * widthfactor, 50 * widthfactor);
        context.fillText(Math.floor(time / 60).toString(), canvas.width - (50 + 32 * (Math.floor(time / 60).toString()).length) * widthfactor, 50 * widthfactor);
    }
    if(doreset){
        homereset();
    }
    for(i=0;i<things.length;i++){
        var currentThing = things[i];
        currentThing.Update();
    }
	if(player != null){
		player.Update();
	}
	if(shop != null){
		shop.Update();
	}
    if(gameoverscreen != null){
        gameoverscreen.Update();
    }
    for(i=0;i<thingstoremove.length;i++){
		//console.log(thingstoremove[i]);
        things.splice(things.indexOf(thingstoremove[i]), 1);
    }
    thingstoremove = [];
    for(i=0;i<thingstoadd.length;i++){
        things.push(thingstoadd[i]);
    }
    thingstoadd = [];
	keyslastupdate = keys.slice();
	MBsDownLF = MBsDown.slice();
	numframes++;
}

//Misc utility functions
function keypressed(key){
	return (keys.includes(key) && !keyslastupdate.includes(key));
}
function MouseInRange(xi, yi, xf, yf){
	return (mouseX >= xi && mouseY >= yi && mouseX <= xf && mouseY <= yf);
}
function MBpressed(MB){
	return (MBsDown[MB] && !MBsDownLF[MB]);
}
function MBpressedInRange(MB, xi, yi, xf, yf){
	return (MBpressed(MB) && MouseInRange(xi, yi, xf, yf));
}
function MBdownInRange(MB, xi, yi, xf, yf){
	return (MBsDown[MB] && MouseInRange(xi, yi, xf, yf));
}

//Misc game functions
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
    if(Math.random() > coinchance){
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
    else if(Math.random() > bhchance || time < 6000){
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
	else{
        if(side == 1){
            setx = -60; //keep at bh size
            sety = Math.random() * canvas.height;
            setxs = (Math.random() * 3 + 2)/5;
            setys = (Math.random() * 2 - 1)/5;
        }
        if(side == 2){
            setx = Math.random() * canvas.width;
            sety = -60;
            setxs = (Math.random() * 2 - 1)/5;
            setys = (Math.random() * 3 + 2)/5;
        }
        if(side == 3){
            setx = canvas.width;
            sety = Math.random() * canvas.height;
            setxs = (Math.random() * -3 - 2)/5;
            setys = (Math.random() * 2 - 1)/5;
        }
        if(side == 4){
            setx = Math.random() * canvas.width;
            sety = canvas.height;
            setxs = (Math.random() * 2 - 1)/5;
            setys = (Math.random() * -3 - 2)/5;
        }

        toAdd = new BlackHole(setx, sety, setxs, setys);
	}
    thingstoadd.push(toAdd);
}

function deathscreen(){
    paused = true;
    dead = true;
    gameoverscreen = new GameOverManager();
}

function reset(){
    playing = true;
    dead = false;
    paused = false;
    player = new Player(canvas.width / 2, canvas.height / 2);
    things = [];
    timer = 0;
	time = 0;
    summontime = 50;
    points = 0;
	shop = new ShopManager();
}
    
function homereset(){
    playing = false;
    things = [];
    thingstoadd = [];
	player = null;
    thingstoremove = [];
	shop = null;
    gameoverscreen = null;
    doreset = false;
    things.push(new HomeManager());
}

//Base classes
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
			this.xpos += this.xSpeed / regspeed;
			this.ypos += this.ySpeed / regspeed;
		}
        context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width, this.height);
    }
}

//Game classes
class Player extends PhyThing{
    constructor(setx, sety){
        super(setx, sety, 15, 15);
        this.color = "red";
		this.exhaustweight = 0.01;
		this.pointmulti = 1;
		this.power = 1;
		this.shielded = false;
    }
    Update(){
		if(!paused){
			this.xpos += this.xSpeed / regspeed;
			this.ypos += this.ySpeed / regspeed;

			var xdelta = 0;
			var ydelta = 0;
			if(mode == 1){
				if(leftKeyDown){
					xdelta -= 0.1;
				}
				if(rightKeyDown){
					xdelta += 0.1;
				}
				if(upKeyDown){
					ydelta -= 0.1;
				}
				if(downKeyDown){
					ydelta += 0.1;
				}
			}
			else if(mode == 2){
				if(leftKeyDown){
					xdelta += 0.1;
				}
				if(rightKeyDown){
					xdelta -= 0.1;
				}
				if(upKeyDown){
					ydelta += 0.1;
				}
				if(downKeyDown){
					ydelta -= 0.1;
				}
			}
			this.xSpeed += xdelta * this.power / regspeed;
			this.ySpeed += ydelta * this.power / regspeed;
			if(numframes % regspeed == 0){
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
		if(this.shielded){
			context.fillStyle = "cyan";
			context.fillRect(this.xpos - 2, this.ypos - 2, this.width + 4, this.height + 4);
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
			}
			else if(this.xSpeed < 0 && this.xpos + this.width < 0){
				thingstoremove.push(this);
			}
			if(this.ySpeed > 0 && this.ypos > canvas.height){
				thingstoremove.push(this);
			}
			else if(this.ySpeed < 0 && this.ypos + this.height < 0){
				thingstoremove.push(this);
			}
			this.xpos += this.xSpeed / regspeed;
			this.ypos += this.ySpeed / regspeed;
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
			}
			else if(this.xSpeed < 0 && this.xpos + this.width < 0){
				thingstoremove.push(this);
			}
			if(this.ySpeed > 0 && this.ypos > canvas.height){
				thingstoremove.push(this);
			}
			else if(this.ySpeed < 0 && this.ypos + this.height < 0){
				thingstoremove.push(this);
			}
			this.xpos += this.xSpeed / regspeed;
			this.ypos += this.ySpeed / regspeed;
			var hitPlayer = false;
			if(this.xpos < player.xpos + player.width && this.ypos < player.ypos + player.height && player.xpos < this.xpos + this.width && player.ypos < this.ypos + this.height){
				hitPlayer = true;
			}
			if(hitPlayer){
				if(player.shielded){
					player.shielded = false;
					thingstoremove.push(this);
				}
				else{
					deathscreen();
				}
			}
		}
        context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width, this.height);
    }
}

class BlackHole extends PhyThing{
    constructor(setx, sety, sethor, setver){
        super(setx, sety, 60, 60);
        this.xSpeed = sethor;
        this.ySpeed = setver;
        this.color = "white";
    }
    Update(){
		if(!paused){
			if(this.xSpeed > 0 && this.xpos > canvas.width){
				thingstoremove.push(this);
			}
			else if(this.xSpeed < 0 && this.xpos + this.width < 0){
				thingstoremove.push(this);
			}
			if(this.ySpeed > 0 && this.ypos > canvas.height){
				thingstoremove.push(this);
			}
			else if(this.ySpeed < 0 && this.ypos + this.height < 0){
				thingstoremove.push(this);
			}
			this.xpos += this.xSpeed / regspeed;
			this.ypos += this.ySpeed / regspeed;
		}
		this.centerx = this.xpos + this.width / 2;
		this.centery = this.ypos + this.height / 2;
		for(var iter=0;iter<things.length;iter++){
			this.Accelthing(things[iter]);
		}
		this.Accelthing(player);
        context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width, this.height);
		context.fillStyle = "black";
        context.fillRect(this.xpos + 2, this.ypos + 2, this.width - 4, this.height - 4);
    }
	Accelthing(myThing){
		if(myThing instanceof Asteroid || myThing instanceof Coin || myThing instanceof Player || myThing instanceof Exhaust){
			var currentcenterx = myThing.xpos + myThing.width / 2;
			var currentcentery = myThing.ypos + myThing.height / 2;
			var xdist = this.centerx - currentcenterx;
			var ydist = this.centery - currentcentery;
			var cdist = Math.sqrt(Math.pow(xdist, 2) + Math.pow(ydist, 2));
			myThing.xSpeed += (xdist / cdist) * bhstrength / regspeed;
			myThing.ySpeed += (ydist / cdist) * bhstrength / regspeed;
		}
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
			}
			else if(this.xSpeed < 0 && this.xpos + this.width < 0){
				thingstoremove.push(this);
			}
			if(this.ySpeed > 0 && this.ypos > canvas.height){
				thingstoremove.push(this);
			}
			else if(this.ySpeed < 0 && this.ypos + this.height < 0){
				thingstoremove.push(this);
			}
			this.xpos += this.xSpeed / regspeed;
			this.ypos += this.ySpeed / regspeed;
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

//UI Classes
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
                context.fillText("Inverted", 150 * widthfactor, 50 * widthfactor);
            }
            context.fillText("n to change mode", 50 * widthfactor, 90 * widthfactor);
            context.fillText("(t for tips)", 50 * widthfactor, 200 * widthfactor);
            if(keypressed(startKey)){
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
		if(keypressed(shopKey) && !dead){
			this.visible = !this.visible;
            paused = this.visible;
		}
		if(this.visible){
			context.fillStyle = "green";
			context.font = (96 * widthfactor).toString()+"px Courier New";
			context.fillText("shop", canvas.width / 2, 100 * widthfactor);
			
			context.font = (48 * widthfactor).toString()+"px Courier New";
			context.fillText("Exhaust weight: "+Math.floor(player.exhaustweight * 10000).toString(), 100 * widthfactor, 200 * widthfactor);
			context.fillText("(E to upgrade - Cost: 10000)", 100 * widthfactor, 248 * widthfactor);
			
			context.fillText("Point Multiplier: "+Math.floor(player.pointmulti * 100).toString()+"%", 100 * widthfactor, 400 * widthfactor);
			context.fillText("(P to upgrade - Cost: 10000)", 100 * widthfactor, 448 * widthfactor);
			
			context.fillText("Thrust Power Multiplier: "+Math.floor(player.power * 100).toString()+"%", 100 * widthfactor, 600 * widthfactor);
			context.fillText("(] to upgrade - Cost: 5000)", 100 * widthfactor, 648 * widthfactor);
			context.fillText("([ to downgrade - NO REFUND!)", 100 * widthfactor, 696 * widthfactor);
			
			
			if(keypressed(exhaustupgradeKey) && points > 100){
				player.exhaustweight += 0.002;
				points -= 100;
			}
			
			if(keypressed(pointupgradeKey) && points > 100){
				player.pointmulti += 0.1;
				points -= 100;
			}
			
			if(keypressed(powerupgradeKey) && points > 50){
				player.power += 0.1;
				points -= 50;
			}
			if(keypressed(powerdowngradeKey)){
				player.power -= 0.1;
			}
		}
	}
}

class GameOverManager extends Thing{
    constructor(){
        super(0, 0, 0, 0);
		this.visible = false;
    }
    Update(){
        context.fillStyle = "green";
        context.font = (96 * widthfactor).toString()+"px Courier New";
        context.fillText("u died xd", canvas.width / 2, 100 * widthfactor);

        context.font = (48 * widthfactor).toString()+"px Courier New";
        context.fillText("Space to continue ", 100 * widthfactor, 200 * widthfactor);
        if(keys.includes(startKey)){
            doreset = true;
        }
	}
}

class Button extends Thing{
	constructor(x, y, w, h, color){
		super(x, y, w, h);
		this.color = color;
		this.clicked = false;
	}
	Update(){
		this.clicked = false;
		if(MBpressedInRange(0, this.x, this.y, this.x + this.width, this.y + this.height)){
			this.clicked = true;
		}
		context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width, this.height);
		if(MBdownInRange(0, this.xpos, this.ypos, this.xpos + this.width, this.ypos + this.height)){
			context.fillStyle = "rgba(0,0,0,0.4)";
			context.fillRect(this.xpos, this.ypos, this.width, this.height);
		}
	}
}
