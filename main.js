//HTML Stuff

document.body.innerHTML += "<canvas id='gameCanvas' style='position:absolute;top:0;left:0;' width='100%' height='100%'></canvas>";
document.body.style.background = "black";

//HTML Constants
const c1 = document.getElementById("gameCanvas");

//Engine vars
var canvas = c1;
var context = canvas.getContext("2d");

canvas.style.width = "100%";
canvas.style.height = "100%";

canvas.width = 1920;

var things = [];
var thingstoadd = [];
var thingstoremove = [];

var keys = [];
var keyslastupdate = [];

var mouseX = 0;
var mouseY = 0;

var MBsDownLF = [];

var MBsDown = [false, false, false];

var regspeed = 1; //Basically how much faster the current updates per second are than 60, so 120 would be regspeed of 2, 180 3, etc.

var virtwidth = 1920;
var widthfactor = 1;

//Game vars
var minSummonTime = 12;

var summonTimeMulti = 200;
var coinchance = 0.1;
var seekerchance = 0.1;
var bhchance = 0.1;
var bhstrength = 0.02;
var seekstrength = 0.2;

var ygrav = 0;
var xgrav = 0;

var flashlightMode = false;
var innerFlashlightRad = 30;
var outerFlashlightRad = 200;

var shieldcooldown = 20;
var lastShield = -shieldcooldown * 60 * regspeed;
    
var summontime = 50;

var mode = 1; //1 is normal, 2 is inverted

const upKeys = [87, 38];
const downKeys = [83, 40];
const leftKeys = [65, 37];
const rightKeys = [68, 39];

const shopKey = 9;
const startKey = 32;
const modeswapKey = 78;

var timer = 0;

var playerColor = "red";
var uiColor = "green";
var uiColor2 = "orange";

var UIAsteroidSummon = false;

var BHexists = false;

var playing = false;

var doreset = true;

var points = 0; //Ingame points for upgrades

var coins = 0; //Home screen coins for cosmetics

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
var homeScreen;

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
//setInterval(loop, 1000/updatespersecond);
requestAnimationFrame(loop);

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
	if(keypressed(modeswapKey)){
		if(mode == 1){
			mode = 2;
		}
		else{
			mode = 1;
		}
	}
    context = canvas.getContext("2d");
    if(canvas.height != (1920 / window.innerWidth) * 1080){
        canvas.height = (1920 / window.innerWidth) * window.innerHeight;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    /*context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height)*/
    for(i=0;i<things.length;i++){
        var currentThing = things[i];
        currentThing.Update();
    }
    if(playing){
		if(!paused){
			time++;
			timer++;
			if((timer * widthfactor) / regspeed >= summontime){
				summonAsteroid();
				timer = 0;
			}
		}
    }
    if(doreset){
        homereset();
    }
    if(UIAsteroidSummon){
        summonUIAsteroid();
        UIAsteroidSummon = false;
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
    if(homeScreen != null){
        homeScreen.Update();
    }
    if(playing){
        context.fillStyle = "white";
        context.font = (48 * widthfactor).toString()+"px Courier New";
        context.fillText(Math.floor(points).toString(), 50 * widthfactor, 50 * widthfactor);
        context.fillText(Math.floor(time / (60 * regspeed)).toString(), canvas.width - (50 + 32 * (Math.floor(time / 60).toString()).length) * widthfactor, 50 * widthfactor);
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
    requestAnimationFrame(loop);
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
    if(summontime > minSummonTime){
        summontime = summontime * (1 - (1 / widthfactor) / summonTimeMulti);
    }
    else{
        summontime = minSummonTime;
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
        if(Math.random() < seekerchance && time > 9000 * regspeed){
            toAdd = new HeatSeeker(setx, sety, setxs, setys);
        }
        else{
            toAdd = new Asteroid(setx, sety, setxs, setys);
        }
    }
    else if(BHexists || Math.random() > bhchance || time < 6000 * regspeed){
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

function summonUIAsteroid(){
    var side = Math.floor(Math.random() * 4) + 1;
    
    var setxs;
    var setys;
    
    var setx;
    var sety;
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

    toAdd = new UIAsteroid(setx, sety, setxs, setys);
    thingstoadd.push(toAdd);
}

function deathscreen(){
    paused = true;
    dead = true;
    gameoverscreen = new GameOverManager();
	//document.body.innerHTML += "<div id='adcontainer' style='position:absolute;top:"+(canvas.height/2 - 200).toString()+"px;left:"+(canvas.width/2 - 300).toString()+"px;' width='600px' height='400px'>aa</div>";
}

function reset(){
    playing = true;
    dead = false;
    paused = false;
    player = new Player(canvas.width / 2, canvas.height / 2);
    homeScreen = null;
    things = [];
    timer = 0;
	time = 0;
    summontime = 50;
    points = 0;
	shop = new ShopManager();
	lastShield = -shieldcooldown * 60 * regspeed;
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
	coins += Math.floor(points / 100);
	points = 0;
    homeScreen = new HomeManager();
    for(var i=0;i<13;i++){
        summonUIAsteroid();
    }
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
        this.color = playerColor;
		this.exhaustweight = 0.01;
		this.pointmulti = 100;
		this.power = 1;
		this.shielded = false;
        this.health = 1000;
        this.exhausts = [];
        this.exhauststoadd = [];
        this.exhauststoremove = [];
    }
    Update(){
        for(var i=0;i<this.exhauststoremove.length;i++){
            this.exhausts.splice(this.exhausts.indexOf(this.exhauststoremove[i]), 1);
        }
        this.exhauststoremove = [];
        for(var i=0;i<this.exhausts.length;i++){
            this.exhausts[i].Update();
        }
		if(!paused){
			this.xpos += this.xSpeed / regspeed;
			this.ypos += this.ySpeed / regspeed;

            if(this.health <= 0){
                this.health = 0;
                deathscreen();
            }
            
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
            this.xSpeed += xgrav;
            this.ySpeed += ygrav;
			if(numframes % regspeed == 0){
				if(xdelta > 0){
					if(ydelta > 0){
						this.exhausts.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, -0.707, -0.707, this.xSpeed, this.ySpeed, this.exhaustweight));
					}
					else if(ydelta < 0){
						this.exhausts.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, -0.707, 0.707, this.xSpeed, this.ySpeed, this.exhaustweight));
					}
					else{
						this.exhausts.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, -1, 0, this.xSpeed, this.ySpeed, this.exhaustweight));
					}
				}
				else if(xdelta < 0){
					if(ydelta > 0){
						this.exhausts.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, 0.707, -0.707, this.xSpeed, this.ySpeed, this.exhaustweight));
					}
					else if(ydelta < 0){
						this.exhausts.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, 0.707, 0.707, this.xSpeed, this.ySpeed, this.exhaustweight));
					}
					else{
						this.exhausts.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, 1, 0, this.xSpeed, this.ySpeed, this.exhaustweight));
					}
				}
				else{
					if(ydelta > 0){
						this.exhausts.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, 0, -1, this.xSpeed, this.ySpeed, this.exhaustweight));
					}
					else if(ydelta < 0){
						this.exhausts.push(new Exhaust(this.xpos + this.width/2, this.ypos + this.height / 2, 0, 1, this.xSpeed, this.ySpeed, this.exhaustweight));
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
        if(flashlightMode){
            var xc = this.xpos + this.width / 2;
            var yc = this.ypos + this.height / 2;
            var gradient = context.createRadialGradient(xc, yc, innerFlashlightRad, xc, yc, outerFlashlightRad);
            gradient.addColorStop(0, "rgba(50,50,50,0.01)");
            gradient.addColorStop(1, "black");
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
		if(this.shielded){
			context.fillStyle = "cyan";
			context.fillRect(this.xpos - 2, this.ypos - 2, this.width + 4, this.height + 4);
		}
		context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width, this.height);
        context.fillStyle = "rgba(255,0,0,0.5)";
        context.fillRect(canvas.width / 2 - 500 * widthfactor, 20 * widthfactor, 1000 * widthfactor, 20 * widthfactor);
        context.fillStyle = "rgba(0,255,0,0.5)";
        context.fillRect(canvas.width / 2 - (this.health * widthfactor) / 2, 20 * widthfactor, this.health * widthfactor, 20 * widthfactor);
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
				player.exhauststoremove.push(this);
			}
			else if(this.xSpeed < 0 && this.xpos + this.width < 0){
				player.exhauststoremove.push(this);
			}
			if(this.ySpeed > 0 && this.ypos > canvas.height){
				player.exhauststoremove.push(this);
			}
			else if(this.ySpeed < 0 && this.ypos + this.height < 0){
				player.exhauststoremove.push(this);
			}
            this.xSpeed += xgrav;
            this.ySpeed += ygrav;
			this.xpos += this.xSpeed / regspeed;
			this.ypos += this.ySpeed / regspeed;
			var hitsomething = false;
			for(var i=0; i<things.length;i++){
				var currentThing = things[i];
				if(currentThing instanceof Asteroid || currentThing instanceof HeatSeeker){
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
				player.exhauststoremove.push(this);
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
            this.xSpeed += xgrav;
            this.ySpeed += ygrav;
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
					//deathscreen();
                    player.health -= (Math.abs(player.xSpeed - this.xSpeed)) * 80;
                    player.health -= (Math.abs(player.ySpeed - this.ySpeed)) * 80;
                    player.xSpeed += (this.xSpeed - player.xSpeed) / 2;
                    player.ySpeed += (this.ySpeed - player.ySpeed) / 2;
                    thingstoremove.push(this);
				}
			}
		}
        context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width, this.height);
    }
}

class HeatSeeker extends PhyThing{
    constructor(setx, sety, sethor, setver){
        super(setx, sety, 30, 30);
        this.xSpeed = sethor;
        this.ySpeed = setver;
        this.color = "orange";
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
            var xdif = player.xpos - this.xpos;
            var ydif = player.ypos - this.ypos;

            var mag = Math.sqrt(Math.pow(xdif, 2) + Math.pow(ydif, 2));

            xdif = xdif / mag;
            ydif = ydif / mag;

            this.xSpeed += xgrav;
            this.ySpeed += ygrav;
            this.xSpeed += xdif * seekstrength;
            this.ySpeed += ydif * seekstrength;

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
					//deathscreen();
                    player.health -= (Math.abs(player.xSpeed - this.xSpeed)) * 80;
                    player.health -= (Math.abs(player.ySpeed - this.ySpeed)) * 80;
                    player.xSpeed += (this.xSpeed - player.xSpeed) / 2;
                    player.ySpeed += (this.ySpeed - player.ySpeed) / 2;
                    thingstoremove.push(this);
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
        BHexists = true;
    }
    Update(){
		if(!paused){
			if(this.xSpeed > 0 && this.xpos > canvas.width){
				thingstoremove.push(this);
                BHexists = false;
			}
			else if(this.xSpeed < 0 && this.xpos + this.width < 0){
				thingstoremove.push(this);
                BHexists = false;
			}
			if(this.ySpeed > 0 && this.ypos > canvas.height){
				thingstoremove.push(this);
                BHexists = false;
			}
			else if(this.ySpeed < 0 && this.ypos + this.height < 0){
				thingstoremove.push(this);
                BHexists = false;
			}
            this.xSpeed += xgrav;
            this.ySpeed += ygrav;
			this.xpos += this.xSpeed / regspeed;
			this.ypos += this.ySpeed / regspeed;
			this.centerx = this.xpos + this.width / 2;
			this.centery = this.ypos + this.height / 2;
			for(var iter=0;iter<things.length;iter++){
				this.Accelthing(things[iter]);
			}
			this.Accelthing(player);
		}
    }
	Accelthing(myThing){
		if(myThing instanceof Asteroid || myThing instanceof Coin || myThing instanceof Player || myThing instanceof Exhaust || myThing instanceof HeatSeeker){
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
            this.xSpeed += xgrav;
            this.ySpeed += ygrav;
			this.xpos += this.xSpeed / regspeed;
			this.ypos += this.ySpeed / regspeed;
			var hitPlayer = false;
			if(this.xpos < player.xpos + player.width && this.ypos < player.ypos + player.height && player.xpos < this.xpos + this.width && player.ypos < this.ypos + this.height){
				hitPlayer = true;
			}
			if(hitPlayer){
				points += 1000 * (player.pointmulti / 100);
                player.health += 50;
                if(player.health > 1000){
                    player.health = 1000;
                }
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
    Update(){
        context.fillStyle = uiColor;
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
            context.fillStyle = uiColor2;
            context.fillText("First time? Press t for rules and tips!", 50 * widthfactor, 200 * widthfactor);
            context.fillStyle = uiColor;
			if(keypressed(84)){
				this.screen = "tips";
			}
			else if(keypressed(shopKey)){
				this.screen = "shop";
			}
            if(keypressed(startKey)){
               reset();
            }
        }
        else if(this.screen == "tips"){
			if(keypressed(84)){
				this.screen = "home";
			}
            context.font = (32 * widthfactor).toString()+"px Courier New";
            //context.fillText("Tip: if the screen seems to small or big to you, use the built in zoom in your browser", 50 * widthfactor, 50 * widthfactor);
            //context.fillText("ctrl + or ctrl -", 50 * widthfactor, 90 * widthfactor);
            context.fillText("Tip: You can use WASD or the arrow keys to move the player around in-game", 50 * widthfactor, 50 * widthfactor);
            context.fillText("Tip: Those grey squares are asteroids! Don't get hit, or it'll hurt!", 50 * widthfactor, 90 * widthfactor);
			context.fillText("Tip: Press TAB to open the shop, where you can spend your points", 50 * widthfactor, 130 * widthfactor);
            context.fillText("Tip: The bar at the top of the screen is your health - you lose a bit when you get hit!", 50 * widthfactor, 170 * widthfactor);
            context.fillText("Tip: Your exhaust can push asteroids a bit, if you can hit them!", 50 * widthfactor, 210 * widthfactor);
            context.fillText("Tip: Black holes are invisible! They won't kill you themselves, but their gravity is deadly", 50 * widthfactor, 250 * widthfactor);
			context.fillText("Tip: Coins are yellow squares, slightly smaller than asteroids. They give you points and health!", 50 * widthfactor, 290 * widthfactor);
			context.fillText("Tip: Your points are transferred into Red Coins when you die, which you can spend on cosmetics.", 50 * widthfactor, 330 * widthfactor);
            context.fillText("Press TAB on the home screen to access the Red Coin Shop!", 50 * widthfactor, 370 * widthfactor);
		context.fillText("Tip: Orange squares are seekers - they're like asteroids, but they follow you and are deadlier!", 50 * widthfactor, 410 * widthfactor);
        }
		else if(this.screen == "shop"){
			if(this.colorChangeButton == null){
				this.colorChangeButton = new Button(0,0,100,60,uiColor);
			}
			this.colorChangeButton.xpos = 50 * widthfactor;
			this.colorChangeButton.ypos = 170 * widthfactor;
			this.colorChangeButton.color = playerColor;
			this.colorChangeButton.Update();
			context.fillStyle = uiColor;
			context.font = (48 * widthfactor).toString()+"px Courier New";
			context.fillText("shop", canvas.width / 2, 100 * widthfactor);
			context.fillText("Change player color to random", 200 * widthfactor, 200 * widthfactor);
			context.fillText("(Cost: 200 RC)", 200 * widthfactor, 248 * widthfactor);
			
			context.fillStyle = "red";
			context.fillRect(1750 * widthfactor, 100 * widthfactor, 20 * widthfactor, 20 * widthfactor);
			context.font = (32 * widthfactor).toString()+"px Courier New";
			context.fillText(coins.toString(), 1790 * widthfactor, 120 * widthfactor);
			if(this.colorChangeButton.clicked){
				if(coins >= 200){
					var randcolor = Math.random() * 10000;
					var frequency = 0.005;
					var setr = Math.sin(frequency * randcolor + 0) * (127) + 128;
					var setg = Math.sin(frequency * randcolor + 1) * (127) + 128;
					var setb = Math.sin(frequency * randcolor + 3) * (127) + 128;
					playerColor = "rgb("+setr.toString()+", "+setg.toString()+", "+setb.toString()+")";
					coins -= 200;
				}
			}
			if(keypressed(shopKey)){
				this.screen = "home"
			}
		}
    }
}

class ShopManager extends Thing{
    constructor(){
        super(0, 0, 0, 0);
		this.visible = false;
		this.exhaustUpgradeButton = new Button(0,0,100,60,"white");
		this.pointUpgradeButton = new Button(0,0,100,60,"green");
		this.thrustUpgradeButton = new Button(0,0,100,60,"red");
        this.shieldUpgradeButton = new Button(0,0,100,60,"blue");
    }
    Update(){
		if(keypressed(shopKey) && !dead){
			this.visible = !this.visible;
            paused = this.visible;
		}
		if(this.visible){
			this.exhaustUpgradeButton.xpos = 50 * widthfactor;
			this.pointUpgradeButton.xpos = 50 * widthfactor;
			this.thrustUpgradeButton.xpos = 50 * widthfactor;
            this.shieldUpgradeButton.xpos = 50 * widthfactor;
			this.exhaustUpgradeButton.ypos = 170 * widthfactor;
			this.pointUpgradeButton.ypos = 370 * widthfactor;
			this.thrustUpgradeButton.ypos = 570 * widthfactor;
            this.shieldUpgradeButton.ypos = 770 * widthfactor;
			
			this.exhaustUpgradeButton.Update();
			this.pointUpgradeButton.Update();
			this.thrustUpgradeButton.Update();
            this.shieldUpgradeButton.Update();
			context.fillStyle = uiColor;
			context.font = (96 * widthfactor).toString()+"px Courier New";
			context.fillText("shop", canvas.width / 2, 200 * widthfactor);
			
			context.font = (48 * widthfactor).toString()+"px Courier New";
			context.fillText("Exhaust weight: "+Math.floor(player.exhaustweight * 10000).toString(), 200 * widthfactor, 200 * widthfactor);
			context.fillText("(Cost: 10000)", 200 * widthfactor, 248 * widthfactor);
			
			context.fillText("Point Multiplier: "+Math.floor(player.pointmulti).toString()+"%", 200 * widthfactor, 400 * widthfactor);
			context.fillText("(Cost: 10000)", 200 * widthfactor, 448 * widthfactor);
			
			context.fillText("Thrust Power Multiplier: "+Math.floor(player.power * 100).toString()+"%", 200 * widthfactor, 600 * widthfactor);
			context.fillText("(Cost: 5000)", 200 * widthfactor, 648 * widthfactor);
            		var cooldownLeft = lastShield + shieldcooldown * 60 * regspeed - time;
			if(cooldownLeft <= 0){cooldownLeft = 0;}
            context.fillText("Single-use shield: "+ (player.shielded ? "On" : "Off") + " (Cooldown: " + Math.ceil(cooldownLeft / (60 * regspeed)).toString() + ")", 200 * widthfactor, 800 * widthfactor);
			context.fillText("(Cost: 20000)", 200 * widthfactor, 848 * widthfactor);
			
			
			if(this.exhaustUpgradeButton.clicked && points >= 10000 && player.exhaustweight < 0.3){
				player.exhaustweight += 0.002;
				points -= 10000;
			}
			
			if(this.pointUpgradeButton.clicked && points >= 10000 && player.pointmulti < 2000){
				player.pointmulti += 20;
				points -= 10000;
			}
			
			if(this.thrustUpgradeButton.clicked && points >= 5000){
				player.power += 0.1;
				points -= 5000;
			}
            
            if(!player.shielded && this.shieldUpgradeButton.clicked && points >= 20000 && cooldownLeft == 0){
                player.shielded = true;
                points -= 20000;
		lastShield = time;
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
        context.fillStyle = uiColor;
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
	constructor(x, y, w, h, color, text, textcolor, textsize){
		super(x, y, w, h);
		this.color = color;
		this.clicked = false;
        this.text = text;
        this.textcolor = textcolor;
        this.textsize = textsize;
	}
	Update(){
		this.clicked = false;
		if(MBpressedInRange(0, this.xpos, this.ypos, this.xpos + this.width * widthfactor, this.ypos + this.height * widthfactor)){
			this.clicked = true;
		}
		context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width * widthfactor, this.height * widthfactor);
		if(MBdownInRange(0, this.xpos, this.ypos, this.xpos + this.width * widthfactor, this.ypos + this.height * widthfactor)){
			context.fillStyle = "rgba(0,0,0,0.4)";
			context.fillRect(this.xpos, this.ypos, this.width * widthfactor, this.height * widthfactor); //Note: Use width factor as button is used in UIs
		}
        if(this.text != null && this.textcolor != null && this.textsize != null){
            context.font = (this.textsize * widthfactor).toString()+"px Courier New";
            context.fillStyle = this.textcolor;
            context.textAlign = "center";
            context.fillText(this.text, this.xpos + (this.width * widthfactor) / 2, this.ypos + (this.height * widthfactor) / 2 + (this.textsize * widthfactor) / 2);
            context.textAlign = "start";
        }
	}
}

class UIAsteroid extends PhyThing{
    constructor(setx, sety, sethor, setver){
        super(setx, sety, 30, 30);
        this.xSpeed = sethor;
        this.ySpeed = setver;
        this.color = "grey";
    }
    Update(){
        var despawn = false;
        if(this.xSpeed > 0 && this.xpos > canvas.width){
            despawn = true;
        }
        else if(this.xSpeed < 0 && this.xpos + this.width < 0){
            despawn = true;
        }
        if(this.ySpeed > 0 && this.ypos > canvas.height){
            despawn = true;
        }
        else if(this.ySpeed < 0 && this.ypos + this.height < 0){
            despawn = true;
        }
        if(despawn){
            thingstoremove.push(this);
            UIAsteroidSummon = true;
        }
        this.xpos += this.xSpeed / regspeed;
        this.ypos += this.ySpeed / regspeed;
        context.fillStyle = this.color;
        context.fillRect(this.xpos, this.ypos, this.width, this.height);
    }
}
