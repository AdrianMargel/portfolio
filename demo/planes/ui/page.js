let planeSelection=[
	{
		id:"jet",
		unlockPrice:0,
		upgradePrice:500,
		levels:{
			0:{name:"Wright Flyer",description:"A little more complicated than a bicycle",spawnClass:WrightFlyer,baseLevel:1},
			1:{name:"Fighter Jet",description:"Cup holders not included",spawnClass:Jet},
			5:{name:"F-22 Raptor",description:"Just don't fly in the rain",spawnClass:Raptor,baseLevel:1},
		}
	},
	{
		id:"biplane",
		unlockPrice:0,
		upgradePrice:500,
		spawnClass:Biplane,
		levels:{
			0:{name:"Nullplane",description:"Who needed wings anyway?"},
			1:{name:"Biplane",description:"Now with double the wings!"},
			2:{name:"Triplane",description:"Now with triple the wings!"},
			3:{name:"Tetraplane",description:"Now with x4 the wings!"},
			4:{name:"Pentaplane",description:"Now with x5 the wings!"},
			5:{name:"Hexaplane",description:"Now with x6 the wings!"},
			6:{name:"Heptaplane",description:"Now with x7 the wings!"},
			7:{name:"Octaplane",description:"Now with x8 the wings!"},
			8:{name:"Enneaplane",description:"Now with x9 the wings!"},
			9:{name:"Decaplane",description:"Now with x10 the wings!"},
			10:{name:"Pile of Wings",description:"Don't you think you have enough wings yet?"},
		}
	},
	{
		id:"warplane",
		unlockPrice:2000,
		upgradePrice:500,
		levels:{
			0:{name:"Buzz Bomb",description:"You're the bomb!",spawnClass:BuzzBomb,isSpecial:true,baseLevel:1},
			1:{name:"War Plane",description:"They just don't make em' like they used to.",spawnClass:WarPlane},
			5:{name:"Corsair",description:"They just don't make em' like they used to.",spawnClass:Corsair,baseLevel:1},
		}
	},
	{
		id:"bomber",
		unlockPrice:4000,
		upgradePrice:1000,
		spawnClass:Bomber,
		levels:{
			0:{name:"Hippie Bomber",description:"The planet is your friend",baseLevel:1},
			1:{name:"Bomber",description:"Gravity is your friend"},
			5:{name:"Black Bird",description:"You don't need friends.",spawnClass:BlackBird,baseLevel:1},
		}
	},
	{
		id:"helicopter",
		unlockPrice:6000,
		upgradePrice:1500,
		spawnClass:Helicopter,
		levels:{
			0:{name:"Helicopter?",description:"Something seems... wrong..."},
			1:{name:"Helicopter",description:"Everyone loves spinny things!"},
			5:{name:"Attack Helicopter",description:"Even the military loves spinny things!",spawnClass:Chopper,baseLevel:1},
		}
	},
	{
		id:"hotairballoon",
		unlockPrice:8000,
		upgradePrice:2000,
		levels:{
			0:{name:"Flying House",description:"A short-lived adventure",spawnClass:FlyingHouse,baseLevel:1},
			1:{name:"Hot Air Balloon",description:"Whimsical tranquility",spawnClass:HotAirBalloon},
			5:{name:"Zeppelin",description:"Just don't let it pop",spawnClass:Zeppelin,baseLevel:1},
		}
	},
	{
		id:"flyingfortress",
		unlockPrice:10000,
		upgradePrice:2500,
		levels:{
			0:{name:"Air Liner",description:"King of the skies!",spawnClass:AirLiner,baseLevel:1},
			1:{name:"Flying Fortress",description:"Like a castle in the sky",spawnClass:FlyingFortress},
			5:{name:"Flying Castle",description:"Literally a castle in the sky",spawnClass:FlyingCastle,baseLevel:1},
		}
	},
	{
		id:"triebflugel",
		unlockPrice:12000,
		upgradePrice:3000,
		levels:{
			0:{name:"???",description:"It looks hungry...",spawnClass:MadBall,isSpecial:true,baseLevel:1},
			1:{name:"Triebflugel",description:"German engineering at its finest",spawnClass:Triebflugel},
			5:{name:"Rocket",description:"Explore the infinite nothingness of space!",spawnClass:Rocket,baseLevel:1},
		}
	},
	{
		id:"podracer",
		unlockPrice:14000,
		upgradePrice:3500,
		spawnClass:PodRacer,
		levels:{
			0:{name:"Pod",description:"Good luck"},
			1:{name:"Pod Racer",description:"Rated safe for kids!"},
		}
	},
	{
		id:"nyancat",
		unlockPrice:16000,
		upgradePrice:4000,
		levels:{
			0:{name:"Flappy Bird",description:"Boing! Boing! Boing!",spawnClass:FlappyBird,baseLevel:1},
			1:{name:"Nyan Cat",description:"Nyan nyan nyan nyan nyan nyan...",spawnClass:NyanCat},
		}
	},
];
let playerProgress=bind({
	coins:0,
	unlocks:[
		{//jet
			unlockedLevel:1,
			selectedLevel:1
		},
		{//biplane
			unlockedLevel:1,
			selectedLevel:1
		},
		{//warplane
			unlockedLevel:0,
			selectedLevel:1
		},
		{//bomber
			unlockedLevel:0,
			selectedLevel:1
		},
		{//helicopter
			unlockedLevel:0,
			selectedLevel:1
		},
		{//hotairballoon
			unlockedLevel:0,
			selectedLevel:1
		},
		{//flyingfortress
			unlockedLevel:0,
			selectedLevel:1
		},
		{//triebflugel
			unlockedLevel:0,
			selectedLevel:1
		},
		{//podracer
			unlockedLevel:0,
			selectedLevel:1
		},
		{//nyancat
			unlockedLevel:0,
			selectedLevel:1
		},
	],
});

class CoinDisplay extends CustomElm{
	constructor(coins){
		super();
		coins=bind(coins);
		this.define(html`
			${html`${()=>this.formatNum(coins.data)}`(coins)}<div class="coin"></div>
		`);
	}
	formatNum(x){
		let letter="";
		if(x>=1000000){
			x/=1000000;
			letter=" M";
		}else if(x>=100000){
			x/=1000;
			letter=" K";
		}
		x=Math.ceil(x*100)/100;
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+letter;
	}
	getCoins(){
		return playerProgress.coins;
	}
}
defineElm(CoinDisplay,scss`&{
	font-family: 'Nunito', sans-serif;
	font-weight:700;
	font-size: 20px;
	${theme.center}
	white-space: nowrap;
	.coin{
		display:inline-block;
		margin-left:5px;
		width:30px;
		height:30px;
		border-radius:15px;
		border: 5px solid ${hsv(.12,1,.9)};
		background-color:${hsv(.15,1,1)};
		box-sizing:border-box;
	}
}`);
class ButtonPrice extends CustomElm{
	constructor(price,event){
		super();
		price=bind(price);
		event=bind(event);
		let coins=this.getCoins();
		let cDisp=new CoinDisplay(price);
		this.define(html`
			<button
				onclick=${attr(act(()=>{
					if(coins.data>=price.data){
						coins.data-=price.data;
						event.data();
					}
				}))(event)}
				class=${attr(()=>coins.data<price.data?"locked":"")(coins,price)}
			>
				<div class="surface">
					${html`${()=>price.data==0?"Free":cDisp}`(coins,price)}
				</div>
			</button>
		`);
	}
	getCoins(){
		return playerProgress.coins;
	}
}
defineElm(ButtonPrice,scss`&{
	display:block;
	>button{
		position: relative;
		padding: 0;
		border: none;
		border-radius: 100px;
		${theme.boxShadowStep(-2)}
		.surface{
			height:30px;
			font-weight: 700;
			font-size: 20px;
			color: white;
			border: none;
			padding: 10px 30px;
			border-radius: 100px;
			position: relative;
			bottom: 10px;
			transition: bottom 0.1s;
			${theme.center};
		}
		&:active .surface{
			bottom: 4px;
		}
		&:active .selector{
			bottom: -12px;
		}
		
		&.locked{
			background-color: ${rgb(.3)} !important;
			>.surface{
				color: ${rgb(.6)};
				background-color: ${rgb(.4)} !important;
			}
		}
	}
}`);

class PlaneSelector extends CustomElm{
	constructor(show){
		super();
		show=bind(show);
		let level=bind(1);
		let idx=bind(0);
		let coins=this.getCoins();
		let unlocked=bind(true);

		let spawnPlane=()=>{
			let [plane,planeLevel,baseSpawnClass]=this.getPlaneFull(idx.data,level.data);
			let realLevel=level.data;
			if(plane.baseLevel){
				realLevel=(level.data-planeLevel)+plane.baseLevel;
			}
			gameRunner.spawnPlayer(plane.spawnClass??baseSpawnClass,realLevel,plane.isSpecial??false);
		}
		let levelDown=()=>{
			let progress=this.getProgress(idx.data);
			level.data=Math.max(level.data-1,0);
			progress.selectedLevel.data=level.data;
			spawnPlane();
		};
		let levelUp=()=>{
			let progress=this.getProgress(idx.data);
			level.data+=1;
			progress.selectedLevel.data=level.data;
			progress.unlockedLevel.data=Math.max(level.data,progress.unlockedLevel.data);
			spawnPlane();
		};
		let prevIdx=()=>{
			idx.data=mod(idx.data-1,planeSelection.length);
			let progress=this.getProgress(idx.data);
			level.data=progress.selectedLevel.data;
			spawnPlane();
		}
		let nextIdx=()=>{
			idx.data=mod(idx.data+1,planeSelection.length);
			let progress=this.getProgress(idx.data);
			level.data=progress.selectedLevel.data;
			spawnPlane();
		}
		let unlock=()=>{
			let progress=this.getProgress(idx.data);
			progress.unlockedLevel.data=1;
			progress.selectedLevel.data=1;
			unlocked.data=true;
		}
		let tryPlay=()=>{
			let progress=this.getProgress(idx.data);
			if(progress.unlockedLevel.data>=level.data){
				gameRunner.start();
				show.data=false;
			}
		}
		let unlockPrice=bind(0);
		let upgradePrice=bind(0);
		let downgradePrice=bind(0);
		let unlockBtn=new ButtonPrice(unlockPrice,unlock);
		let upgradeBtn=new ButtonPrice(upgradePrice,levelUp);
		let downgradeBtn=new ButtonPrice(downgradePrice,levelDown);
		this.attr("class",()=>show.data?"":"hidden")(show);
		this.define(html`
			${()=>{
				let plane=this.getPlane(idx.data,level.data);
				let progress=this.getProgress(idx.data);
				let upPrice=level.data*(level.data+1)*planeSelection[idx.data].upgradePrice/2;
				if(level.data>=5){
					upPrice*=2;
				}

				unlocked.data=progress.unlockedLevel.data>0;
				unlockPrice.data=planeSelection[idx.data].unlockPrice;
				upgradePrice.data=(progress.unlockedLevel.data-1)<level.data?upPrice:0;

				return html`
				<div>
					<div class="top">
						<div>
							<h1>Unlimited Skies</h1>
							<div class="play ${!unlocked.data?"locked":""}">
								${new ButtonClickable("PLAY",tryPlay)}
							</div>
						</div>
					</div>
					<div class="prev">
						<button
							onclick=${attr(act(prevIdx))}
							class="${idx.data==0?"hidden":""}"
						>
							<
						</button>
					</div>
					<div class="next">
						<button
							onclick=${attr(act(nextIdx))}
							class="${(idx.data==planeSelection.length-1)?"hidden":""}"
						>
							>
						</button>
					</div>
					<div class="bottom">
						<span class="level">lv ${level}</span>
						<span class="name">${plane.name}</span>
						<span class="description">${plane.description}</span>
						${()=>{
							if(!unlocked.data){
								return html`
								<div class="unlock">
									Unlock
									${unlockBtn}
								</div>`
							}else{
								return html`
								<div class="bar">
									${()=>Array(Math.max(5,progress.unlockedLevel.data)).fill().map((_,i,arr)=>
										html`
										<div
											class="segment
												${(level.data>=i+1)?"filled":""}
												${i==0?"first":""}
												${i==arr.length-1?"last":""}
											"
										></div>`	
									)}
								</div>
								<div class="upgrades">
									<div class="down ${level.data==0?"hidden":""}">
										Level Down
										${downgradeBtn}
									</div>
									<div class="up">
										Level Up
										${upgradeBtn}
									</div>
								</div>`;
							}
						}}
					</div>
				<div>`;
			}}
		`(idx,level,coins,unlocked));
	}
	getPlane(idx,level){
		let levels=planeSelection[idx].levels;
		let opts=Object.keys(levels).map(o=>Number(o));
		opts.sort((a,b)=>a-b);
		let closest=0;
		for(let i=0;i<opts.length;i++){
			let o=opts[i];
			if(o==level){
				return planeSelection[idx].levels[level];
			}else if(o<level){
				closest=o;
			}else{
				break;
			}
		}
		return planeSelection[idx].levels[closest];
	}
	getPlaneFull(idx,level){
		let levels=planeSelection[idx].levels;
		let opts=Object.keys(levels).map(o=>Number(o));
		opts.sort((a,b)=>a-b);
		let closest=0;
		for(let i=0;i<opts.length;i++){
			let o=opts[i];
			if(o==level){
				return [planeSelection[idx].levels[level],level,planeSelection[idx].spawnClass];
			}else if(o<level){
				closest=o;
			}else{
				break;
			}
		}
		return [planeSelection[idx].levels[closest],closest,planeSelection[idx].spawnClass];
	}
	getProgress(idx){
		return playerProgress.unlocks[idx];
	}
	getCoins(){
		return playerProgress.coins;
	}
}
defineElm(PlaneSelector,scss`&{
	overflow:hidden;
	position: absolute;
	display: block;
	inset:0;
	z-index:10;
	${theme.center}
	.locked{
		${ButtonClickable}{
			>button{
				background-color: ${rgb(.3)} !important;
				>.surface{
					color: ${rgb(.6)};
					background-color: ${rgb(.4)} !important;
				}
			}
		}
	}
	>div{
		position:relative;
		${theme.center}
		height:200px;
		flex-grow:1;
		>.prev{
			margin-right:200px;
			${theme.mobile}{
				margin-right:75px;
			}
			width:100px;
			${theme.center}
			button{
				font-family: 'Fredoka One', sans-serif;
				font-size:100px;
				border:none;
				background:none;
			}
		}
		>.next{
			margin-left:200px;
			${theme.mobile}{
				margin-left:75px;
			}
			width:100px;
			${theme.center}
			button{
				font-family: 'Fredoka One', sans-serif;
				font-size:100px;
				border:none;
				background:none;
			}
		}
	
		>.top{
			position:absolute;
			bottom:200px;
			${theme.center}
			>div{
				font-size:60px;
				font-family: 'Fredoka One', sans-serif;
				text-align:center;
				${theme.mobile}{
					font-size:40px;
				}
				>.play{
					margin-top:40px;
					>${ButtonClickable}{
						>button{
							background-color: ${hsv(.35,.7,.6)};
							>.surface{
								width:100px;
								background-color: ${hsv(.35,.7,.8)};
							}
						}
					}
				}
			}
		}
		>.bottom{
			position:absolute;
			top:200px;
			${theme.mobile}{
				top:150px;
			}
			>.unlock{
				text-align:center;
				font-weight:700;
				font-size: 20px;

				>${ButtonPrice}{
					margin-top:20px;
					>button{
						background-color: ${hsv(.35,.7,.6)};
						>.surface{
							width:100px;
							background-color: ${hsv(.35,.7,.8)};
						}
					}
				}
			}
			>.bar{
				width:420px;
				${theme.mobile}{
					width:320px;
				}
				height:20px;
				border-radius:10px;
				box-sizing:border-box;
				margin-bottom:20px;
				${theme.center}
				align-items:stretch;
				overflow:hidden;
				${theme.boxShadowStep(-3)}
				>.segment{
					background:white;
					flex-grow:1;
					border-right:4px solid ${rgb(.7)};
					&.filled{
						background-color: ${hsv(.35,.7,.8)};
						border-color: ${hsv(.35,.7,.6)};
					}
					&.last{
						border-right:none;
					}
				}
			}
			>.upgrades{
				${theme.center}
				>.up{
					width:200px;
					${theme.mobile}{
						width:150px;
					}
					font-weight:700;
					font-size: 20px;
					text-align:center;
					>${ButtonPrice}{
						margin-top:20px;
						>button{
							background-color: ${hsv(.35,.7,.6)};
							>.surface{
								width:100px;
								background-color: ${hsv(.35,.7,.8)};
								${theme.mobile}{
									width:75px;
								}
							}
						}
					}
				}
				>.down{
					width:200px;
					margin-right:20px;
					${theme.mobile}{
						width:150px;
					}

					font-weight:700;
					font-size: 20px;
					text-align:center;
					>${ButtonPrice}{
						margin-top:20px;
						>button{
							background-color: ${hsv(0,.6,.6)};
							>.surface{
								width:100px;
								background-color: ${hsv(0,.6,.8)};
								${theme.mobile}{
									width:75px;
								}
							}
						}
					}
				}
			}
			button{
				font-family: 'Nunito', sans-serif;
				font-weight:700;
				font-size: 20px;
			}
			>span{
				display:block;
				text-align:center;
				&.description{
					font-size: 20px;
					margin-bottom:20px;
				}
				&.name{
					font-size: 40px;
					font-family: 'Fredoka One', sans-serif;
					margin-bottom:20px;
				}
				&.level{
					font-size: 20px;
					font-family: 'Fredoka One', sans-serif;
				}
				${theme.mobile}{
					&.description{
						font-size: 15px;
						margin-bottom:15px;
					}
					&.name{
						font-size: 30px;
						margin-bottom:15px;
					}
					&.level{
						font-size: 15px;
					}
				}
			}
		}
	}
}`);

class HealthBar extends CustomElm{
	constructor(hp,maxHp){
		super();
		hp=bind(hp);
		maxHp=bind(maxHp);
		this.define(html`
			<div class="health">
				<div style=${attr(()=>"width:"+(hp.data/maxHp.data*100)+"%")(hp,maxHp)}></div>
			</div>
		`);
	}
}
defineElm(HealthBar,scss`&{
	display:flex;
	.health{
		flex-grow:1;
		border-right:4px solid black;
		border-left:4px solid black;
		background: #00000050;
		>div{
			width:50%;
			height:10px;
			background-color: ${hsv(.35,.7,.8)};
			border-bottom: 4px solid ${hsv(.35,.7,.6)};
		}
	}
}`);
class TopDisplay extends CustomElm{
	constructor(selecting,waveNum,hp,maxHp){
		super();
		waveNum=bind(waveNum);
		let coins=this.getCoins();
		this.define(html`
			<div class=${attr(()=>selecting.data?"hidden":"")(selecting)}>
				<div class="wave"><span>wave</span> ${html`${waveNum}`(waveNum)}/20</div>
				${new HealthBar(hp,maxHp)}
			</div>
			${new CoinDisplay(coins)}
		`);
	}
	getCoins(){
		return playerProgress.coins;
	}
}
defineElm(TopDisplay,scss`&{
	pointer-events:none;
	user-select:none;
	position: absolute;
	top:20px;
	right:20px;
	left:20px;
	font-family: 'Nunito', sans-serif;
	font-weight:700;
	font-size: 20px;
	>div{
		height:30px;
		>.wave{
			position:absolute;
			top:30px;
			left:0;
			>span{
				font-size:16px;
			}
		}
		>${HealthBar}{
			position:absolute;
			width:100%;
			top:0;
		}
	}
	>${CoinDisplay}{
		position:absolute;
		right:0;
	}
}`);

class PauseMenu extends CustomElm{
	constructor(text){
		super();
		text=bind(text);
		this.define(html`
			<div class="surface">
				${html`${text}`(text)}
			</div>
		`);
	}
}
defineElm(PauseMenu,scss`&{

}`);

class GameOverMenu extends CustomElm{
	constructor(show,waveNum){
		super();
		show=bind(show);
		waveNum=bind(waveNum);

		let end=()=>{
			console.log("test");
			gameRunner.end();
		};

		let text=def(()=>{
			if(waveNum.data>20){
				return "Nice!";
			}else if(waveNum.data==20){
				return "SO CLOSE!";
			}else if(waveNum.data>10){
				return ":(";
			}
			return "Darn it...";
		},waveNum)

		this.attr("class",()=>show.data?"":"hidden")(show);
		this.define(html`
			<div>
				<span class="title">Game Over</span>
				<span class="subTitle">You survived to wave ${html`${waveNum}`(waveNum)}</span>

				${new ButtonClickable(text,end)}
				
			</div>
		`);
	}
}
defineElm(GameOverMenu,scss`&{
	position: absolute;
	display: block;
	inset:0;
	z-index:10;
	${theme.center}
	color:white;

	>div{
		${theme.center}
		flex-direction:column;
		background-color:#000000D0;
		padding:50px 100px;
		border-radius:20px;
	
		>span{
			display:block;
			text-align:center;
			&.subTitle{
				font-size: 20px;
				margin-bottom:20px;
			}
			&.title{
				font-size: 40px;
				font-family: 'Fredoka One', sans-serif;
				margin-bottom:20px;
			}
		}
		>${ButtonClickable}{
			margin-top:20px;
			>button{
				background-color: ${hsv(.35,.7,.6)};
				>.surface{
					width:100px;
					background-color: ${hsv(.35,.7,.8)};
					white-space: nowrap;
				}
			}
		}
	}

}`);

class GameDescription extends CustomElm{
	constructor(){
		super();
		this.define(html`
			<div class="surface">

			</div>
		`);
	}
}
defineElm(GameDescription,scss`&{

}`);

