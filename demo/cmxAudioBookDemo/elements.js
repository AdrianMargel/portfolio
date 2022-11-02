
/*

	This file is kind of a mess, or at least the styles are.
	The CSS still isn't very elagent and many of the things I tried to midigate that are still very experimental.
	However the elements themselves I'm pretty happy with.

	A better reference to look at is the example.js file 

*/
let demoPath="/demo/books";

//TODO: support in depth color classes, make it it's own file/module
class Color{
	constructor(rOrC=0,g=0,b=0,a=1){
		if(typeof rOrC=="object"){
			this.r=rOrC.r;
			this.g=rOrC.g;
			this.b=rOrC.b;
			this.a=rOrC.a;
		}else if(isHex(rOrC)){
			let c=hexToRgb(rOrC);
			this.r=c.r/255;
			this.g=c.g/255;
			this.b=c.b/255;
			this.a=1;
		}else{
			this.r=rOrC;
			this.g=g;
			this.b=b;
			this.a=a;
		}
	}
	toString(){
		return rgbToHex(this.r*255,this.g*255,this.b*255,this.a*255);
	}
	addCol(col){
		this.r+=col.r;
		this.g+=col.g;
		this.b+=col.b;
		return this;
	}
	subCol(col){
		this.r-=col.r;
		this.g-=col.g;
		this.b-=col.b;
		return this;
	}
	sclCol(a){
		this.r*=a;
		this.g*=a;
		this.b*=a;
		return this;
	}
	apply(f){
		this.r=f(this.r);
		this.g=f(this.g);
		this.b=f(this.b);
		return this;
	}
	limCol(){
		this.r=Math.max(Math.min(this.r,1),0);
		this.g=Math.max(Math.min(this.g,1),0);
		this.b=Math.max(Math.min(this.b,1),0);
		return this;
	}
}

function sigmoid(x){
	return 1/(1+Math.pow(Math.E,-x));
}
function blendColors(col1,col2,mix){
	let invMix=1-mix;
	return new Color(
		col1.r*invMix+col2.r*mix,
		col1.g*invMix+col2.g*mix,
		col1.b*invMix+col2.b*mix,
		col1.a*invMix+col2.a*mix,
	);
}
function blendValues(v1,v2,mix){
	let invMix=1-mix;
	return v1*invMix+v2*mix;
}
let colorInvert=(col)=>{
	let inv=new Color(col);
	inv.r=1-inv.r;
	inv.g=1-inv.g;
	inv.b=1-inv.b;
	return inv;
}
let theme;
{
	let white=new Color(1,1,1);
	let black=new Color(0,0,0);

	let colorScale=(a,base)=>{
		// a = [0,1]
		let blend=(a-0.5)*2;

		if(blend>0){
			return blendColors(base,white,blend);
		}else{
			return blendColors(base,black,-blend);
		}
	};
	let greyStep=(a)=>{
		// a = (-infinity,infinity)
		let shadow=new Color("#130016").sclCol(0.5);
		// shadow=new Color("#000000");
		let base=new Color("#363636").addCol(new Color("#00000A"));
		base.subCol(shadow).limCol();

		let minCol=Math.min(base.r,base.g,base.b);
		let maxCol=Math.max(base.r,base.g,base.b);

		let darkDist=maxCol;
		let lightDist=1-minCol;
		let totalDist=darkDist+lightDist;

		let lightScale=lightDist/totalDist;
		let darkScale=darkDist/totalDist;

		if(a>0){
			a*=darkScale;
		}else{
			a*=lightScale;
		}
		a*=0.6;
		return colorScale(sigmoid(a),base).addCol(shadow);
	};
	// let greyStep=(a)=>{
	// 	let base=new Color("#502005");
	// 	return base.apply((v)=>v*sigmoid(a)*5).addCol(new Color("#001040")).limCol();
	// };
	// let greyStep=(a)=>{
	// 	let base=new Color("#FF5020");
	// 	return base.apply((v)=>v*sigmoid(a)*(a+4)*0.2).apply((v)=>1-(1-Math.min(v,1))**1.5).addCol(new Color("#000040")).limCol();
	// };
	// let greyStep=(a)=>{
	// 	let base=new Color("#50FF20");
	// 	return base.apply((v)=>v*sigmoid(a)*(a+4)*0.2).apply((v)=>1-(1-Math.min(v,1))**1.5).addCol(new Color("#400050")).limCol();
	// };
	// let greyStep=(a)=>{
	// 	let base=new Color("#FF5020");
	// 	return base.apply((v)=>v*sigmoid(-a)*(-a+4)*0.2).apply((v)=>1-(1-Math.min(v,1))**1.5).addCol(new Color("#100030")).limCol();
	// };
	let greyStep2=(a)=>{
		// a = (-infinity,infinity)
		let base=new Color("#363639");

		let minCol=Math.min(base.r,base.g,base.b);
		let maxCol=Math.max(base.r,base.g,base.b);

		let darkDist=maxCol;
		let lightDist=1-minCol;
		let totalDist=darkDist+lightDist;

		let lightScale=lightDist/totalDist;
		let darkScale=darkDist/totalDist;

		if(a>0){
			a*=darkScale;
		}else{
			a*=lightScale;
		}
		a*=0.6;
		return colorScale(sigmoid(a),base);
	};
	let genericStep=(a,maxSize,minSize,mid)=>{
		let smallDist=mid-minSize;
		let bigDist=maxSize-mid;
		let totalDist=smallDist+bigDist;

		let smallScale=smallDist/totalDist;
		let bigScale=bigDist/totalDist;
		if(a>0){
			a*=smallScale;
			let blend=(sigmoid(a)-0.5)*2;
			return blendValues(mid,maxSize,blend);
		}else{
			a*=bigScale;
			let blend=(sigmoid(a)-0.5)*2;
			return blendValues(mid,minSize,-blend);
		}

	}
	let fontSizeStep=(a)=>{
		return "font-size:"+Math.floor(genericStep(a,150,10,24))+"px;";
	}
	let boxShadowStep=(a)=>{
		return "box-shadow: 0 0 "+genericStep(a,80,0,30)+"px #00000080;";
	}
	let primary=`font-family: 'Sen', sans-serif;`;
	let secondary=`font-family: 'Montserrat', sans-serif;`;
	let center=`
		display: flex;
		justify-content: center;
		align-items: center;
	`;
	let centerX=`
		display: flex;
		justify-content: center;
	`;
	let centerY=`
		display: flex;
		align-items: center;
	`;
	let centerText=`text-align: center;`;
	theme={
		color:{
			greyStep,
			greyStep2,
			highlight: "#7AC16C",
			highlightDark:"#58934C",
			red:"#E5324A",
			pink:"#F27DB2",
			white,
			black,
		},
		font:{
			primary,
			secondary,
			fontSizeStep,
			standard:`
				font-weight: 400;
				${secondary}
				${fontSizeStep(0)}
			`,
			title:`
				font-weight: 700;
				${primary}
				${centerText}
				${fontSizeStep(2)}
			`
		},
		elementReset:`
			display: block;
		`,
		boxShadowStep,
		center,
		centerX,
		centerY,
		centerText
	}
}
function easeInOutExpo(x) {
	return x === 0
		? 0
		: x === 1
		? 1
		: x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
		: (2 - Math.pow(2, -20 * x + 10)) / 2;
}
function easeInOutQuad(x) {
	return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

//${Array.apply(null, Array(10)).map((_,i)=>`<div style="${theme.boxShadowStep(i-5)}">TEST${i-5}</div>`)}

class LoadingSpinner extends CustomElm{
	constructor(){
		super();
		let rot=bind(0);
		let spin=animate((t,diff)=>{
			rot.data+=diff*TAU;
		},2,true);
		spin.start();
		
		this.define(html`
			<div style=${attr(()=>"transform:rotate("+rot.data+"rad)")(rot)}>
				<div style="transform:rotate(240deg)">
					<div></div>
				</div>
				<div style="transform:rotate(120deg)">
					<div></div>
				</div>
				<div style="transform:rotate(0deg)">
					<div></div>
				</div>
			</div>
		`);
	}
}
defineElm(LoadingSpinner,scss`&{
	${theme.elementReset}
	>div{
		position: relative;
		width: 100px;
		height: 100px;
		border-radius:54px;
		border: 4px solid ${theme.color.highlight};
		${theme.center};
		>div{
			width: 110px;
			height: 40px;
			position: absolute;
			>div{
				position: absolute;
				inset:0;
				left:95px;
				background-color:${theme.color.greyStep(-1)};
			}
		}
	}
}`)
class Slider extends CustomElm{
	constructor(visible,inside){
		super();
		visible=bind(visible);

		let heightStart=0;
		let heightEnd=0;
		let height=bind(visible.data?null:0);
		let slide=animate((ellapsed,diff)=>{
			if(ellapsed==1){
				height.data=visible.data?null:0;
			}else{
				let t=easeInOutQuad(ellapsed);
				height.data=(1-t)*heightStart+t*heightEnd;
			}
		},0.4);
		visible.sub(()=>{
			let targetHeight=getElm(".inner",this).offsetHeight;
			heightStart=height.data??targetHeight;
			heightEnd=visible.data?targetHeight:0;
			slide.start();
		});
		
		this.define(html`
			<div
				style=${attr(()=>
					height.data!=null?("height:"+height.data+"px;"):""
				)(height)}
			>
				<div class="inner">
					${inside}
				</div>
			</div>
		`());
	}
}
defineElm(Slider,scss`&{
	${theme.elementReset}
	>div{
		overflow: hidden;
	}
}`);

class Email extends CustomElm{
	constructor(name,domain,top){
		super();
		name=bind(name);
		domain=bind(domain);
		top=bind(top);
		let shown=bind(false);
		this.define(html`
			${()=>shown.data?
				(html`
					<div>
						<p>
							<span>${name}</span><img src="${demoPath}/img/at.png" alt="@"/><span>${domain}</span><img src="${demoPath}/img/dot.png" alt="."/><span>${top}</span>
						</p>
					</div>
				`(name,domain,top)):
				(html`
					<div class="click" onclick=${attr(act(()=>shown.data=true))}>
						<p>click to show email</p>
					</div>
				`())
			}
		`(shown));
	}
}
defineElm(Email,scss`&{
	>.click{
		user-select:none;
		cursor:pointer;
		color: ${theme.color.greyStep(5)};
	}
	>div{
		background-color: ${theme.color.greyStep2(0)};
		border: 2px solid ${theme.color.greyStep2(2)};
		height: 40px;
		${theme.center}
		border-radius: 35px;
		padding: 0 20px;
		p{
			${theme.center}
			margin: 0;
			${theme.font.primary}
			font-weight: 700;
		}
	}
}`);

class Input extends CustomElm{
	constructor(text){
		super();
		text=bind(text);
		this.define(html`
			<input
				value=${attr(text)(text)}
				oninput=${attr(act((event)=>{
					text.data=event.target.value;
				}))()}
			/>
		`);
	}
}
defineElm(Input,scss`&{
	input{
		border-radius: 8px;
		border-bottom-right-radius: 0;
		border-top-left-radius: 0;
		${theme.font.secondary}
		border: 2px solid ${theme.color.greyStep2(2)};
		background-color: ${theme.color.greyStep2(0)};
		color: ${theme.color.white};
		padding: 5px 10px;
		${theme.font.fontSizeStep(-1)}
	}
}`);

class ButtonClickable extends CustomElm{
	constructor(text,event,selected=false){
		super();
		text=bind(text);
		event=bind(event);
		selected=bind(selected);
		this.define(html`
			<button
				class=${attr(()=>selected.data?"selected":"")(selected)}
				onclick=${attr(act(event.data))(event)}
			>
				<div class="surface">
					${html`${text}`(text)}
				</div>
				<div class="selector"><div></div></div>
			</button>
		`);
	}
}
defineElm(ButtonClickable,scss`&{
	>button{
		position: relative;
		padding: 0;
		border: none;
		background-color: ${theme.color.highlightDark};
		border-radius: 6px;
		${theme.boxShadowStep(-3)}
		.surface{
			${theme.font.fontSizeStep(-0.5)};
			${theme.font.primary}
			font-weight: 700;
			color: ${theme.color.white};
			background-color: ${theme.color.highlight};
			border: none;
			padding: 10px 30px;
			border-radius: 6px;
			position: relative;
			bottom: 10px;
			transition: bottom 0.1s;
		}
		.selector{
			opacity: 0;
			position: absolute;
			border: 12px solid transparent;
			border-bottom-color: #28282E;
			width: 0;
			height: 0;
			bottom: -12px;
			right: calc(50% - 12px);
			transition: bottom 0.4s, opacity 0.4s;
			div{
				position: absolute;
				border: 10px solid transparent;
				border-bottom-color: white;
				width: 0;
				height: 0;
				top: -4px;
				right: calc(50% - 10px);
			}
		}
		&.selected .selector{
			opacity: 1;
			bottom: -6px;
		}
		&:active .surface{
			bottom: 4px;
		}
		&:active .selector{
			bottom: -12px;
		}
	}
}`);

class ButtonLink extends CustomElm{
	constructor(text,event){
		super();
		text=bind(text);
		event=bind(event);
		this.define(html`
			<button
				onclick=${attr(act(event.data))(event)}
			>
				${html`${text}`(text)}
			</button>
		`);
	}
}
defineElm(ButtonLink,scss`&{
	>button{
		font: inherit;
		margin: 0;
		padding: 0;
		display: inline;
		cursor: pointer;
		background-color: transparent;
		color: #7AC16C;
		&:hover{
			text-decoration: underline;
		}
	}
}`);

class Switch extends CustomElm{
	constructor(val,options){
		super();
		val=bind(val);
		options=bind(options);
		let index=def(()=>options.findIndex(o=>o.data==val.data),val,options);

		this.define(html`
			<div>
				<div
					class=${attr(()=>
						(index.data==-1?"hide":"")+(index.data==0?"start":"")+(index.data==options.length-1?" end":"")+" highlight"
					)(index)}
					style=${attr(()=>
						`left:${Math.max(index.data*150-1,0)}px`
					)(index)}
				></div>
				<div class="items">
					${options.map(o=>html`
						<div
							class=${attr(()=>(val.data==o.data?"selected":"")+" item")(val)}
							onclick=${attr(act(()=>val.data=o.data))}
						>
							<p>${o}</p>
						</div>
					`)}
				</div>
			</div>
		`);
	}
}
{
	let size=150;
	let height=50;
	let round=size/2;
	let animSpeed=0.5;
	defineElm(Switch,scss`&{
		${theme.elementReset}
		${theme.center}
		>div{
			position: relative;
			>.highlight{
				box-sizing:border-box;
				position: absolute;
				top:0;
				left:0;
				width:${size+1}px;
				height:${height}px;
				border-top-left-radius: 0;
				border-bottom-left-radius: 0;
				border-top-right-radius: 0;
				border-bottom-right-radius: 0;
				border: 2px solid ${theme.color.highlight};
				transition:
					left ${animSpeed}s,
					border-top-left-radius ${animSpeed}s,
					border-bottom-left-radius ${animSpeed}s,
					border-top-right-radius ${animSpeed}s,
					border-bottom-right-radius ${animSpeed}s;
				&.hide{
					display: none;
				}
				&.start{
					border-top-left-radius: ${round}px;
					border-bottom-left-radius: ${round}px;
				}
				&.end{
					border-top-right-radius: ${round}px;
					border-bottom-right-radius: ${round}px;
				}
			}
			>.items{
				${theme.center}
				>.item{
					${theme.font.secondary}
					${theme.font.fontSizeStep(-1)}
					font-weight: 800;
					color: ${theme.color.greyStep2(5)};
					transition: color ${animSpeed}s;
					user-select:none;
					cursor: pointer;

					box-sizing:border-box;
					${theme.center}
					border: 2px solid ${theme.color.greyStep2(2)};
					border-left-width: 1px;
					border-right-width: 1px;
					background-color: ${theme.color.greyStep2(0)};
					width:${size}px;
					height:${height}px;
					&.selected{
						color: ${theme.color.highlight};
					}
					&:first-child{
						border-left-width: 2px;
						border-top-left-radius: ${round}px;
						border-bottom-left-radius: ${round}px;
					}
					&:last-child{
						border-right-width: 2px;
						border-top-right-radius: ${round}px;
						border-bottom-right-radius: ${round}px;
					}
				}
			}
		}
	}`);
}
class SwitchVertical extends CustomElm{
	constructor(val,options,optionsDisplay=options){
		super();
		val=bind(val);
		options=bind(options);
		optionsDisplay=bind(optionsDisplay);
		let index=def(()=>options.findIndex(o=>o.data==val.data),val,options);

		this.define(html`
			<div>
				<div
					class=${attr(()=>
						(index.data==-1?"hide":"")+(index.data==0?"start":"")+(index.data==options.length-1?" end":"")+" highlight"
					)(index)}
					style=${attr(()=>
						`top:${Math.max(index.data*50-1,0)}px`
					)(index)}
				></div>
				<div class="items">
					${options.map((o,i)=>html`
						<div
							class=${attr(()=>(val.data==o.data?"selected":"")+" item")(val)}
							onclick=${attr(act(()=>val.data=o.data))}
						>
							<p>${optionsDisplay[i]?.data??o}</p>
						</div>
					`)}
				</div>
			</div>
		`);
	}
}
{
	let size=150;
	let height=50;
	let round=height/2;
	let animSpeed=0.5;
	defineElm(SwitchVertical,scss`&{
		${theme.elementReset}
		${theme.center}
		>div{
			position: relative;
			>.highlight{
				box-sizing:border-box;
				position: absolute;
				top:0;
				left:0;
				width:${size}px;
				height:${height+1}px;
				border-top-left-radius: 0;
				border-bottom-left-radius: 0;
				border-top-right-radius: 0;
				border-bottom-right-radius: 0;
				border: 2px solid ${theme.color.highlight};
				transition:
					top ${animSpeed}s,
					border-top-left-radius ${animSpeed}s,
					border-bottom-left-radius ${animSpeed}s,
					border-top-right-radius ${animSpeed}s,
					border-bottom-right-radius ${animSpeed}s;
				&.hide{
					display: none;
				}
				&.start{
					border-top-left-radius: ${round}px;
					border-top-right-radius: ${round}px;
				}
				&.end{
					border-bottom-left-radius: ${round}px;
					border-bottom-right-radius: ${round}px;
				}
			}
			>.items{
				${theme.center}
				flex-direction: column;
				>.item{
					${theme.font.secondary}
					${theme.font.fontSizeStep(-1)}
					font-weight: 800;
					color: ${theme.color.greyStep2(5)};
					transition: color ${animSpeed}s;
					user-select:none;
					cursor: pointer;

					box-sizing:border-box;
					${theme.center}
					border: 2px solid ${theme.color.greyStep2(2)};
					border-top-width: 1px;
					border-bottom-width: 1px;
					background-color: ${theme.color.greyStep2(0)};
					width:${size}px;
					height:${height}px;
					&.selected{
						color: ${theme.color.highlight};
					}
					&:first-child{
						border-top-width: 2px;
						border-top-right-radius: ${round}px;
						border-top-left-radius: ${round}px;
					}
					&:last-child{
						border-bottom-width: 2px;
						border-bottom-right-radius: ${round}px;
						border-bottom-left-radius: ${round}px;
					}
				}
			}
		}
	}`);
}

class SearchInput extends CustomElm{
	constructor(text,event){
		super();
		text=bind(text);
		event=bind(event);
		
		let enterF=(e)=>{
			if(e.keyCode==13){
				e.preventDefault();
				setPage("search");
			}
		}

		this.define(html`
			<div class="main">
				<input
					value=${attr(text)(text)}
					oninput=${attr(act((event)=>{
						text.data=event.target.value;
					}))()}
					onkeypress=${attr(act(enterF))}
					placeholder="Search..."
				/>
				<div onclick=${attr(act(()=>{
					setPage("search");
				}))}>
					<img
						src="${demoPath}/icons/magnifying-glass.svg"
						alt="Magnifying Glass Icon"
					/>
				</div>
			</div>
			<div class="cover"></div>
		`);
	}
}
defineElm(SearchInput,scss`&{
	>.main{
		position: relative;
		${theme.centerY}
		background-color: ${theme.color.greyStep(0)};
		${theme.boxShadowStep(0)}
		top: 15px;
		padding: 15px;
		border-radius: 40px;
		>input{
			position: relative;
			box-sizing: border-box;
			height: 40px;
			border-radius: 20px;
			z-index: 1;

			${theme.font.secondary}
			border: 2px solid ${theme.color.greyStep2(2)};
			background-color: ${theme.color.greyStep2(0)};
			color: ${theme.color.white};
			padding: 5px 10px;
			${theme.font.fontSizeStep(-1)}
		}
		>div{
			cursor: pointer;
				position: absolute;
				right: 20px;
				width: 40px;
				height: 40px;
				z-index: 2;
				${theme.center}
			>img{
				user-select: none;
				pointer-events:none;
				height: 20px;
				width: 20px;
			}
		}
	}
	>.cover{
		position: absolute;
		left: 0;
		right: 0;
		top:0;
		height: 40px;
		${theme.boxShadowStep(-2)}
		background-color: ${theme.color.greyStep(0)};
	}
}`);


class Header extends CustomElm{
	constructor(text){
		super();
		this.define(html`
			<div class="back"></div>
			<h1>Cimexis ${html`${text}`(text)}</h1>
		`);
	}
}
defineElm(Header,(()=>{
	let size="400px";

	return scss`&{
		${theme.elementReset}
		${theme.center}
		height: ${size};
		background-color: ${theme.color.greyStep(0)};
		z-index: 12;
		position: relative;
		> .back{
			position: absolute;
			height:${size};
			width:${size};
			background-image: url('/img/logo.png');
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
		}
		> h1{
			position: relative;
			margin-top: ${3+5}px;
			padding-bottom: 5px;
			background-color: ${theme.color.greyStep(0)};
			${theme.font.title}
		}
	}`})()
);

class Nav extends CustomElm{
	constructor(openTab,scroll,searchCriteria){
		super();
		openTab=bind(openTab);
		let isDown;
		if(scroll!=null){
			isDown=def(()=>scroll.data>400,scroll);
		}else{
			isDown=bind(false);
		}
		this.define(html`
			<div class=${attr(()=>isDown.data?"down":"")(isDown)}>
				${new SearchInput(searchCriteria.text)}
				<button
					class=${attr(()=>"favourites "+(openTab.data=="favourites"?"selected":""))(openTab)}
					onclick=${attr(act(()=>{
						if(openTab.data=="favourites"){
							openTab.data="";
						}else{
							openTab.data="favourites";
						}	
					}))}
				>
					<img src="${demoPath}/icons/heart.svg" alt="Heart Icon"/>
					<div class="selector"><div>
				</button>
				<button
					class=${attr(()=>"bookmarks "+(openTab.data=="bookmarks"?"selected":""))(openTab)}
					onclick=${attr(act(()=>{
						if(openTab.data=="bookmarks"){
							openTab.data="";
						}else{
							openTab.data="bookmarks";
						}
					}))}
				>
					<img src="${demoPath}/icons/bookmark.svg" alt="Bookmark Icon"/>
					<div class="selector"><div>
				</button>
				
				<button
					class="home"
					onclick=${attr(act(()=>{
						setPage("home");
					}))}
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
						<!--! Font Awesome Free 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. -->
						<path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/>
					</svg>
				</button>
			</div>
		`);
	}
}
defineElm(Nav,(()=>{
	let height="50px";
	let space="20px";
	let width="200px";
	let transWhite=new Color(theme.color.white);
	transWhite.a=0.5;

	return scss`
	&{
		${theme.elementReset}
		height: ${height};
	}
	>div{
		${theme.elementReset}
		${theme.center}
		height: ${height};
		background-color: ${theme.color.greyStep(0)};
		${theme.boxShadowStep(0)}
		position: relative;
		z-index: 11;
		>.bookmarks{
			right: 40px;
			>img{
				margin-top: 10px;
				width: 20px;
			}
		}
		>.favourites{
			right: 100px;
			>img{
				margin-top: 10px;
				width: 25px;
			}
		}
		>button.home{
			left: 40px;
			>svg{
				margin-top: 7px;
				height: 25px;
				fill: ${theme.color.white};
				transition: fill 0.2s;
			}
			&:hover{
				border-bottom-color: transparent;
				>svg{
					fill: ${theme.color.highlight};
				}
			}
		}
		>button{
			position: absolute;
			z-index: 2;
			width: 50px;
			height: 50px;
			border-radius: 0px;
			border-top-left-radius: 25px;
			border-top-right-radius: 25px;
			background-color: ${theme.color.greyStep(-1)};
			border-bottom: 4px solid transparent;
			transition: border-bottom-color 0.2s;
			${theme.center}
			>img{
				pointer-events: none;
			}
			&.selected{
				border-bottom-color: ${theme.color.highlight};
				>.selector{
					opacity: 1;
				}
			}
			>.selector{
				opacity: 0;
				transition: opacity 0.2s;
				position: absolute;
				bottom:-54px;
				width: 0px;
				border: 25px solid transparent;
				border-top-color: ${theme.color.highlight};
			}
			&:hover{
				border-bottom-color: ${theme.color.highlight};
			}
		}
		&.down{
			position: fixed;
			left: 0;
			right: 0;
			top: 0;
		}


	}`})()
);

class TextArc extends CustomElm{
	constructor(text,radius,startAng,endAng,tilt=0,invert=false,includeEnd=true,renderAsSvg=false){
		super();
		text=bind(text);
		radius=bind(radius);
		startAng=bind(startAng);
		endAng=bind(endAng);
		tilt=bind(tilt);
		invert=bind(invert);
		includeEnd=bind(includeEnd);
		renderAsSvg=bind(renderAsSvg);
		let angDiff=startAng.data-endAng.data;

		this.define(html`
			${()=>{
				let letters=text.data.split("");
				let maxLength=includeEnd.data?letters.length-1:letters.length;
				return letters.map((l,i)=>{
					return html`
					<span style=${
						attr(()=>`
							transform:
								rotate(${startAng.data-(i/(maxLength))*angDiff*(invert.data?-1:1)}rad)
								translateX(${radius.data}px)
								rotate(${PI/2+tilt.data+(invert.data?PI:0)}rad);
							`)(radius,startAng,endAng,tilt,invert)}
					}>
						${()=>renderAsSvg.data?`
							<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
								<text x="25" y="25">${l}</text>
							</svg>`:l
						}
					</span>`
				})
			}}
		`(text));
	}
}
defineElm(TextArc,scss`
&{
	${theme.elementReset}
	${theme.center}
	width: 0;
	height: 0;
}
>span{
	position: absolute;
	display: inline-block;
	>svg{
		width:50px;
	}
}
`);
class TextArcMid extends CustomElm{
	constructor(text,radius,midAng,letterAng,tilt=0,invert=false,renderAsSvg=false){
		super();
		text=bind(text);
		radius=bind(radius);
		midAng=bind(midAng);
		letterAng=bind(letterAng);
		tilt=bind(tilt);
		invert=bind(invert);
		renderAsSvg=bind(renderAsSvg);

		this.define(html`
			${()=>{
				let letters=text.data.split("");
				let startAng=midAng.data-letters.length/2*letterAng.data;
				let endAng=midAng.data+letters.length/2*letterAng.data;
				let angDiff=startAng-endAng;
				return letters.map((l,i)=>{
					return html`
					<span style=${
						attr(()=>`
							transform:
								rotate(${(invert.data?endAng:startAng)-(i/(letters.length-1))*angDiff*(invert.data?-1:1)}rad)
								translateX(${radius.data}px)
								rotate(${PI/2+tilt.data+(invert.data?PI:0)}rad);
						`)(radius,midAng,letterAng,tilt,invert)}
					}>
						${()=>renderAsSvg.data?`
							<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
								<text x="25" y="25">${l}</text>
							</svg>`:l
						}
					</span>`
				})
			}}
		`(text));
	}
}
defineElm(TextArcMid,scss`
&{
	${theme.elementReset}
	${theme.center}
	width: 0;
	height: 0;
}
>span{
	position: absolute;
	display: inline-block;
	>svg{
		width:50px;
	}
}
`);

class EndSymbol extends CustomElm{
	constructor(){
		super();
		this.define(html`
			<div class="icon"></div>
			<div class="line"></div>
			<div class="cover"></div>
		`);
	}
}
defineElm(EndSymbol,scss`&{
	height: 70px;
	${theme.centerX}
	opacity: 0.2;
	position: absolute;
	bottom: 0;
	right: calc(50% - 90px);
	width: 180px;
	.icon{
		position: absolute;
		top: 0px;
		width: 60px;
		height: 60px;
		background-image: url("${demoPath}/img/logoSmall.png");
		background-position: center;
		background-size: cover;
		z-index: 2;
	}
	.line{
		position: absolute;
		top: 30px;
		width: 100%;
		border-top: 1px solid white;
	}
	.cover{
		position: absolute;
		top: 0px;
		width: 60px;
		height: 60px;
		background-color: #28282E;
	}
}`);

class Surface extends CustomElm{
	constructor(contentElement,width="md",invisible=false,isTop=false){
		super();
		isTop=bind(isTop,false);
		width=bind(width,false);
		invisible=bind(invisible,false);
		//width=sm,md,lg
		this.define(html`
			<div
				class=${attr(()=>{
					return [isTop.data?"top":"","size-"+width.data,invisible.data?"":"visible"].join(" ")
				})(isTop,width,invisible)}
			>
				${contentElement}
			</div>`);
	}
}
defineElm(Surface,scss`&{
	${theme.elementReset}
	width: 100%;
	${theme.centerX}
	> div{
		flex-grow:1;
		${theme.elementReset}
		margin: 0 100px;
		padding: 40px 40px;
		&.visible{
			border: 4px solid ${theme.color.greyStep(0)};
			background-color: ${theme.color.greyStep(-0.5)};
			${theme.boxShadowStep(-1)}
		}

		&.size-sm{
			max-width: 900px;
		}
		&.size-md{
			max-width: 980px;
		}
		&.size-lg{
			max-width: 1060px;
		}
		&.size-full{
			margin: 0;
		}
		&.top{
			border-top: none;
			padding-top: 50px;
		}
		> *:first-child {
			margin-top:0;
		}
		> *:last-child {
			margin-bottom:0;
		}
}
}`);

class Page extends CustomElm{
	constructor(page){
		super();
		this.define(html`
			<div class="back">
				<div></div>
			</div>
			<div class="main">
				${()=>page.data?.content?.data??new MissingPage()}
			</div>
			<div class="foot">
				${new EndSymbol()}
			</div>
		`(page));
	}
}
defineElm(Page,scss`&{
	${theme.elementReset}
	${theme.centerY}
	flex-direction: column;
	position:relative;
	> .back{
		position: absolute;
		inset: 0;
		bottom: 100px;
		${theme.centerX}
		> div{
			${theme.boxShadowStep(-1)}
			flex-grow: 1;
			border: 4px solid ${theme.color.greyStep(0)};
			border-top: none;
			max-width: 900px;
			margin: 0 150px;
		}
	}
	> .main{
		width: 100%;
		position: relative;
		min-height: calc(100vh - 450px);
		${theme.centerX}
	}
	> .foot{
		margin-top: 20px;
		height: 80px;
		position: relative;
	}
	h3{
		text-align: center;
		${theme.font.fontSizeStep(3)}
		margin: 20px 0;
	}
	p{
		font-size: 20px;
		margin: 15px 40px;
		line-height: 1.4;
	}
	.handwritten{
		font-size: 30px;
		line-height: 1;
		letter-spacing: 0.1rem;
		font-family: 'Sue Ellen Francisco', cursive;
	}
}`);

class MissingPage extends CustomElm{
	constructor(){
		super();
		this.define(html`<p>
			404 Error - Page Not Found
		</p>`);
	}
}
defineElm(MissingPage,scss`&{
	${theme.center}
}`);

class BookShelf extends CustomElm{
	constructor(books){
		super();
		let bookBound;
		if(books.data==null){
			bookBound=bind(null);
			bookBound.data=books;
		}else{
			bookBound=books;
		}

		let cards=[];
		function closeCards(card){
			cards.forEach(c=>c!=card?c.close():null);
		}
		
		this.define(html`
			${html`${()=>
				cards=bookBound.data.map(b=>new BookCard(b,(c)=>closeCards(c)))
			}`(bookBound)}
			${Array(2).fill().map(b=>html`<div class="gap"></div>`)}
		`);
	}
}
defineElm(BookShelf,scss`&{
	${theme.centerX}
	flex-wrap: wrap;
	.gap{
		width: 250px;
		height:0;
		margin: 0 20px;
	}
}`);

class BookInfo extends CustomElm{
	constructor(book){
		super();

		if(book==null){
			return;
		}

		let liked=bind(false);
		let loaded;
		if(typeof book.data=="function"){
			loaded=bind(false);
			book.sub(()=>{
				loaded.data=true;
				linkLiked();
			});
			book.data();
		}else{
			loaded=bind(true);
			linkLiked();
		}
		function linkLiked(){
			link(()=>{
				liked.data=book.liked.data;
			},book.liked)();
			
			link(()=>{
				book.liked.data=liked.data;
			},liked);
		}
		
		this.define(html`
			<p class="title">
				${html`${
					()=>loaded.data?html`${book.title}`(book.title):"-"
				}`(loaded)}
			</p>
			
			<div
				class=${attr(()=>"heart "+(liked.data?"liked":""))(liked)}
				onclick=${attr(act(()=>liked.data=!liked.data))}
			
			>
				<img class="solid" src="${demoPath}/icons/heart-solid.svg" alt="Heart Icon"/>
				<img class="path" src="${demoPath}/icons/heart.svg" alt="Heart Icon"/>
			</div>
			<div class="list">
				<p><span class="minor">by</span> 
					${html`${
						()=>loaded.data?html`${book.author}`(book.author):"-"
					}`(loaded)}
				</p>
				<p><span class="minor">
					${html`${
						()=>loaded.data?html`${book.date}`(book.date):"-"
					}`(loaded)}
				</span></p>
			</div>
			<p>
				${html`${
					()=>loaded.data?html`${book.description}`(book.description):"-"
				}`(loaded)}
			</p>
		`());
	}
}
defineElm(BookInfo,scss`
&{
	${theme.elementReset}
	text-align:left;
	overflow: auto;
	position:relative;
}
p{
	margin: 15px 40px;
}
>.heart{
	user-select: none;
	position: absolute;
	top:15px;
	right:40px;
	width:50px;
	height:50px;
	${theme.center}
	box-sizing:border-box;
	border-radius:25px;
	border:2px solid ${theme.color.greyStep2(1)};
	transition: border 0.2s;
	>img{
		position: absolute;
		user-select: none;
		pointer-events: none;
		width: 25px;
	}
	>img.solid{
		display: none;
	}
	>img.path{
		display: block;
	}
	&:hover{
		border:2px solid ${theme.color.highlight};
	}
	&.liked{
		>img.solid{
			display: block;
		}
		>img.path{
			display: none;
		}
	}
}
>.list{
	margin: 15px 40px;
	${theme.center}
	justify-content: space-between;
	border-bottom: 2px solid ${theme.color.greyStep(5)};
	flex-wrap: wrap;
	p{
		margin: 0
	}
}
>section{
	flex-grow:1;
	flex-basis: 0;
}
>p.title{
	${theme.font.fontSizeStep(2)}
	font-weight: 700;
	padding-right:50px;
}
span.minor{
	${theme.font.fontSizeStep(-1)}
	color: ${theme.color.greyStep(5)};
	font-weight: 700;
}
`);

class BookCard extends CustomElm{
	constructor(book,onToggle){
		super();
		
		let open=bind(false);
		this.open=open;
		
		let loaded;
		if(typeof book.data=="function"){
			loaded=bind(false);
			book.sub(()=>{
				loaded.data=true;
			});
			book.data();
		}else{
			loaded=bind(true);
		}

		open.sub(()=>{
			if(open.data){
				addClass("open",this);
			}else{
				removeClass("open",this);
			}
		});
		
		let slowRot=bind(0);
		animate((ellapsed,diff)=>{
			slowRot.data+=diff*0.15;
		},1,true).start();

		let started=bind(false);
		let startText=def(()=>started.data?"RESUME RESUME RESUME ":"LISTEN LISTEN LISTEN ",started);
		
		this.define(html`
			<div class="cardFace" onclick=${attr(act(()=>{
				open.data=!open.data;
				if(open.data){
					onToggle(this);
				}
			}))}>
				<div
					class="icon"
					style=${attr(()=>
						!loaded.data?"":`background-image: url("${demoPath}/books/${book.id.data}/${book.coverImgHigh.data}"),url("${demoPath}/books/${book.id.data}/${book.coverImgLow.data}");`
					)(loaded,book)}
				></div>
				<div class="text">
					<p class="title">
						${html`${
							()=>loaded.data?html`${book.title}`(book.title):"-"
						}`(loaded)}
					</p>
					<p class="author">
						${html`${
							()=>loaded.data?html`${book.author}`(book.author):"-"
						}`(loaded)}
					</p>
				</div>
			</div>
			<div class="fullWidth">
				${new Slider(open,html`
					<div class="cardPreview">
						<div class="inner">
							<div class="info">
								${new BookInfo(book)}
								<div class="player">
									${new ButtonClickable(html`<img src="${demoPath}/icons/play-2.svg" alt="Play Button"/>`,()=>{
										play(book);
									})}
									<div style=${attr(()=>`
										transform:
											rotate(${slowRot.data}rad);`)(slowRot)}
									>
										${new TextArc(startText,60,0,TAU,0,false,false,true)}
									</div>
								</div>
							</div>
						</div>
					</div>
				`)}
			</div>
			${new Slider(open,html`
				<div class="cardPreviewSpace">
					<div class="indicator"></div>
				</div>
			`)}
		`());
	}
	close(){
		this.open.data=false;
	}
}
defineElm(BookCard,scss`
&{
	${theme.elementReset}
	width: 250px;
	margin: 20px 20px;
}
&.open{
	.cardPreview{
		z-index: 2;
	}
}
>.fullWidth{
	position: absolute;
	right: 0;
	left: 0;
}
>.cardFace{
	${theme.boxShadowStep(-2)}
	background-color: ${theme.color.greyStep(0)};
	border-radius: 16px;
	flex-direction: column;
	${theme.centerY}
	>.icon{
		width: 250px;
		height: 250px;
		background-size: cover;
		background-position: center; 
		border-radius: 16px;
	}
	>.text{
		flex-grow:1;
		flex-direction: column;
		${theme.centerY}
		justify-content:space-between;
		>p{
			${theme.center}
			text-align: center;
			${theme.font.fontSizeStep(-1)}
			&.title{
				margin-bottom:0;
			}
			&.author{
				color: ${theme.color.greyStep(5)};
				${theme.font.fontSizeStep(-1)}
			}
		}
	}
}

.cardPreview{
	position: relative;
	padding-top: 15px;
	>.inner{
		padding: 0 140px;
		height: 250px;
		background-color: ${theme.color.greyStep(-2)};
		border-top: 4px solid ${theme.color.highlight};
		${theme.centerX}
		>.info{
			max-width: 1060px;
			flex-grow:1;
			${theme.centerX}
			>${BookInfo}{
				flex-grow:1;
				flex-basis: 0;
			}
			>.player{
				${theme.center}
				margin: 25px;
				flex-grow: 0;
				min-width: 200px;
				border-radius: 8px;
				>img{
					z-index:1;
					position: absolute;
					width: 50px;
					margin-left:8px;
				}
				>${ButtonClickable}{
					position: absolute;
					button{
						border-radius: 50px;
					}
					.surface{
						width: 100px;
						height: 100px;
						padding:0;
						border-radius: 50px;
						background-color: ${theme.color.highlight};
						${theme.center}
					}
					img{
						pointer-events:none;
						margin-left:8px;
						width: 50px;
					}
				}
				${TextArc}{
					user-select:none;
					pointer-events:none;
					${theme.font.fontSizeStep(-0.5)};
					${theme.font.primary}
					font-weight: 700;
					fill: ${theme.color.highlight};
					position: absolute;
				}
			}
		}
	}
}
.cardPreviewSpace{
	height: 250px;
	${theme.centerX}
	>.indicator{
		position: relative;
		z-index: 2;

		bottom: 15px;
		border: 15px solid transparent;
		border-bottom: 15px solid ${theme.color.highlight};
		width: 0;
		height: 0;
	}
}
`);

class BookCardSmall extends CustomElm{
	constructor(book){
		super();

		let loaded;
		let completion;
		if(typeof book.data=="function"){
			loaded=bind(false);
			book.sub(()=>{
				completion=def(()=>
					book.chapters.findIndex(c=>c.selected.data)/(Math.max(book.chapters.length-1,1))
				,...book.chapters.map(c=>c.selected));
				loaded.data=true;
			});
			book.data();
		}else{
			completion=def(()=>
				book.chapters.findIndex(c=>c.selected.data)/(Math.max(book.chapters.length-1,1))
			,...book.chapters.map(c=>c.selected));
			loaded=bind(true);
		}

		this.define(html`
			<div class="cardFace" onclick=${attr(act(()=>{
				play(book);
			}))}>
				<div
					class="icon"
					style=${attr(()=>
						!loaded.data?"":`background-image: url("${demoPath}/books/${book.id.data}/${book.coverImgHigh.data}"),url("${demoPath}/books/${book.id.data}/${book.coverImgLow.data}");`
					)(loaded,book)}
				></div>
				<p>
					${html`${
						()=>loaded.data?html`${book.title}`(book.title):"-"
					}`(loaded)}
				</p>
				<div class="hover">
					<p>RESUME</p>
				</div>
				${html`${()=>!loaded.data?"":html`
					<div class="progress" style=${attr(()=>`width:${completion.data*100}%`)(completion)}>
						<div></div>
					</div>`
				}`(loaded)}
			</div>
		`());
	}
	close(){
		this.open.data=false;
	}
}
defineElm(BookCardSmall,scss`
&{
	${theme.elementReset}
	margin: 20px 20px;
}
>.cardFace{
	position: relative;
	${theme.boxShadowStep(-2)}
	background-color: ${theme.color.greyStep(-2)};
	border-radius: 8px;
	${theme.center}
	overflow:hidden;
	>.icon{
		width: 50px;
		height: 50px;
		margin: 10px;
		background-size: cover;
		background-position: center; 
		border-radius: 8px;
	}
	>p{
		flex-grow:1;
	}
	>.progress{
		position: absolute;
		bottom:0;
		left:0;
		height:4px;
		background-color: ${theme.color.highlight};
		>div{
			position: absolute;
			right:-6px;
			bottom:0;
			width: 12px;
			height: 16px;
			border-radius: 6px;
			border-bottom-right-radius:0;
			background-color: ${theme.color.highlight};

		}
	}
	>.hover{
		opacity: 0;
		transition: opacity 0.2s;
		position: absolute;
		inset: 0;
		background-color: ${theme.color.greyStep(-2)};
		${theme.center}
		>p{
			user-select:none;
			pointer-events:none;
			${theme.font.fontSizeStep(-0.5)};
			${theme.font.primary}
			font-weight: 700;
			color: ${theme.color.highlight};
			position: absolute;
		}
	}
	&:hover>.hover{
		opacity: 1;
	}
}
`);

class Side extends CustomElm{
	constructor(title,scroll,shown,bookIdxList){
		super();
		title=bind(title);
		scroll=bind(scroll);
		shown=bind(shown);

		let results=bind(null,false);
		link(()=>{
			link(
				()=>{
					results.data=bookIdxList.data.map(idx=>books[idx.data]).reverse();
				},
				bookIdxList.data
			)();
		},bookIdxList)();

		this.define(html`
			<div
				class=${attr(()=>"content "+(shown.data?"shown":""))(shown)}
				style=${attr(()=>`
					top:${Math.max(450-scroll.data,50)}px;
					right:${shown.data?0:-400}px;`
				)(scroll,shown)}
			>
				<p>${html`${title}`(title)}</p>
				<div class="list">
					${html`${()=>results.data.map(x=>new BookCardSmall(x))}`(results)}
				</div>
			</div>
		`);
	}
}
defineElm(Side,scss`&{
	>.shown.content{
		z-index:10;
	}
	>.content{
		transition: right 0.6s;
		background-color: ${theme.color.greyStep(-4)};
		position: fixed;
		right: 0px;
		top: 50px;
		bottom:0;
		width: 400px;
		max-width: 100vw;
		z-index: 9;
		overflow: hidden;
		>p{
			position:relative;
			z-index: 1;
			${theme.font.primary}
			${theme.font.fontSizeStep(1)}
			padding:25px 0;
			margin: 0;
			background-color: ${theme.color.greyStep(-2)};
			border-bottom: 8px solid ${theme.color.greyStep(-2)};
			font-weight: 700;
			text-align: center;
			${theme.boxShadowStep(0)}
		}
		>.list{
			position:absolute;
			inset:0;
			top: 100px;
			overflow: auto;
		}
	}
}`);

class GenreCard extends CustomElm{
	constructor(genre){
		super();
		this.define(html`
			<div
				onclick=${attr(act(()=>{
					setGenre(genre);
					setPage("genre");
				}))}
				style=${attr(()=>`background-image: url("${demoPath}/genres/${genre.imgHigh.data}"),url("${demoPath}/genres/${genre.imgLow.data}");`)(genre.imgHigh,genre.imgLow)}
			>
				<p>${html`${genre.name}`(genre.name)}</p>
			</div>
		`);
	}
}
defineElm(GenreCard,scss`&{
	${theme.elementReset}
	margin: 20px 20px;
	>div{
		border: 4px solid ${theme.color.greyStep(0)};
		${theme.boxShadowStep(-1)}
		height: 150px;
		${theme.center}
		background-size: cover;
		background-position: center;
		>p{
			text-align: center;
			${theme.font.primary}
			font-size: 30px;
			letter-spacing: 10px;
			line-height: 1.5;
	
			padding: 5px 20px;
			background-color: ${theme.color.greyStep(-1)};
			border-radius: 30px;
		}
	}
}`);

class HomePage extends CustomElm{
	constructor(books,genres,highlighted){
		super();
		let recentBooks=books.filter((_,i)=>i>=books.length-6).reverse();
		let highlightResults=highlighted.map((idx)=>books[idx.data]);
		this.define(html`
			${addClass("main",new Surface(html`
				<h2>Discover a World of <span>Free</span> Audio Books</h2>
				${new ButtonClickable("Explore",()=>{
					window.scrollTo(0,getElm(".main",this).offsetHeight+400-25-25);
				})}
			`,"full",true,true))}

			${new Surface(html`
				<h3>Recently Added</h3>
				<p class="center">Check out our newest audio books</p>
			`,"lg",false)}
			${new Surface(html`
				${new BookShelf(recentBooks)}
			`,"sm",true)}

			${new Surface(html`
				<h3>Our Favourites</h3>
				<p class="center">Get started with a few of our favourites</p>
			`,"lg",false)}
			${new Surface(html`
				${new BookShelf(highlightResults)}
			`,"sm",true)}
			
			${new Surface(html`
				<h3>Genres</h3>
				<p class="center">Browse your favourite genres</p>
			`,"lg",false)}
			${addClass("genres",new Surface(html`
				${genres.map((g)=>new GenreCard(g))}
			`,"sm",true))}

			${new Surface(html`
				<h3>About Us</h3>
			`,"lg",false)}
			${new Surface(html`
				<p class="center">
					Hello! This website is a project developed by <a href="https://www.adrianmargel.ca/">Adrian Margel</a> to provide audio books for various public domain works.
				</p>
				<div class="aboutUsButton">
					${new ButtonClickable("Learn More",()=>{
						setPage("about")
					})}
				</div>
			`,"sm",true)}
		`);
	}
}
defineElm(HomePage,scss`&{
	width: 100%;
	> .gap{
		height: 40px;
	}
	p.center{
		text-align: center;
	}
	>.main{
		height: calc(100vh - 450px);
		min-height: 400px;
		background-color: ${theme.color.greyStep(-1)};
		>div{
			${theme.center}
			flex-direction: column;
			h2{
				text-align: center;
				${theme.font.primary}
				font-size: 30px;
				letter-spacing: 10px;
				line-height: 1.5;
				>span{
					font-weight: 700;
					border-bottom: 2px solid #7AC16C;
					padding-left: 10px;
					margin-left: -10px;
				}
			}
			>${ButtonClickable}{
				margin-top: 40px;
				.surface{
					padding-left: 60px;
					padding-right: 60px;
				}
			}
		}
	}
	>.genres{
		>div{
			${theme.center}
			flex-direction: column;
			>${GenreCard}{
				align-self: stretch;
				text-align: center;
			}
		}
	}
	.aboutUsButton{
		margin-top:25px;
		${theme.center};
	}
}`);
class SearchPage extends CustomElm{
	constructor(search,books,genres,searchResults,searching){
		super();
		let results=def(()=>searchResults.data.map(idx=>books[idx]),searchResults);
		this.define(html`
			${new Surface(html`
				<div>
					<div class="side">
						<p class="center">Search By</p>
						${new SwitchVertical(search.type,["Title","Author"])}
						<p class="center">Genre</p>
						${new SwitchVertical(search.genre,["all",...genres.map(g=>g.id.data)],["All",...genres.map(g=>g.name.data)])}
					</div>
				</div>
				<div class="text">
					<p class="result">Results for "${html`${()=>safe(search.text.data)}`(search.text)}"</p>
				</div>
				<p class="center">Can't find what you're looking for? ${new ButtonLink("Request it",()=>{
					setPage("request");
				})}</p>
				${new BookShelf(results)}
				${html`${()=>searching.data?html`<div class='searching'><p>Searching...</p>${new LoadingSpinner()}</div>`:""}`(searching)}
			`,"sm",true,true)}
		`);
	}
}
defineElm(SearchPage,scss`&{
	width: 100%;
	${Surface}{
		min-height: 1200px;
		>div{
			>div{
				position: relative;
				>.side{
					position: absolute;
					left: -200px;
					width: 200px;
				}
				&.text{
					${theme.font.fontSizeStep(1)}
					height: 1em;
					margin: 20px;
					${theme.center}
					>p.result{
						max-width: 100%;
						position: absolute;
						font: inherit;
						text-align: center;
						margin: 0;
						text-overflow: ellipsis;
						white-space: nowrap;
						overflow: hidden;
					}
				}
				&.searching{
					margin-top:50px;
					${theme.center}
					>p{
						position: relative;
						z-index:1;
						${theme.font.fontSizeStep(0)}
						${theme.font.primary}
						font-weight:700;
						background-color:${theme.color.greyStep(-1)};
						color:${theme.color.highlight};
						border: 2px solid ${theme.color.highlight};
						border-radius:25px;
						padding: 0 20px;
					}
					>${LoadingSpinner}{
						position: absolute;
					}
				}
			}
		}
	}
	p.center{
		text-align: center;
	}
}`);
class GenrePage extends CustomElm{
	constructor(books,selectedGenre,genreResults){
		super();
		
		let results=def(()=>genreResults.data.map(idx=>books[idx]),genreResults);
		this.define(html`
			${()=>selectedGenre.data==null?"":html`
				${addClass("title",new Surface(html`
					<div
						class="cover"
						style=${attr(()=>`background-image: url("${demoPath}/genres/${selectedGenre.data.imgHigh.data}"),url("${demoPath}/genres/${selectedGenre.data.imgLow.data}");`)(selectedGenre.data.imgHigh,selectedGenre.data.imgLow)}
					>
						<h2>${html`${selectedGenre.data.name}`(selectedGenre.data.name)}</h2>
					</div>
				`,"lg",false,true))}
				${new Surface(html`
					${new BookShelf(results)}
				`,"sm",true,true)}`
			}
		`(selectedGenre));
	}
}
defineElm(GenrePage,scss`&{
	width: 100%;
	>.title{
		>div{
			position: relative;
			height:${150-50-40}px;
			>.cover{
				background-size: cover;
				background-position: center; 
				position: absolute;
				inset:0;
				${theme.center}
			}
		}
	}
	p.center{
		text-align: center;
	}
	h2{
		text-align: center;
		${theme.font.primary}
		font-size: 30px;
		letter-spacing: 10px;
		line-height: 1.5;

		padding: 5px 20px;
		background-color: ${theme.color.greyStep(-1)};
		border-radius: 30px;
	}
}`);

class AboutPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>About Us</h2>
				<p>
					Hello! This website is a project developed by <a href="https://www.adrianmargel.ca/">Adrian Margel</a> to provide audio books for various public domain works.
				</p>
				<h2>FAQ</h2>
				<h3 class="first">I can't find the book I'm looking for</h3>
				<p>
					We can only create audio books for books which are in the public domain or which we have permission to use.
					If the book you are looking for is in the public domain then we encourage you to ${new ButtonLink("request it.",()=>{
						setPage("request");
					})}
				</p>
				<p>
					Alternatively if you have a book you've written which you'd like us to do feel free to reach out to us via email.
				</p>

				<h3>Where can I find the original text?</h3>
				<p>Most of the books on this site can be found in text form on <a href="https://www.gutenberg.org/">Project Gutenberg</a>.</p>

				<h3>Do I have to pay to listen?</h3>
				<p>No. Everything on this site is free to listen to. Although if you would like to support this project (and future projects like it) we'd always appreciate a donation!</p>

				<h3>Where can I donate?</h3>
				<p>Right now there unfortunately there isn't anywhere you can donate...</p>

				<h3>The audio sounds wrong</h3>
				<p>
					The audio books we provide are generated using cutting edge artificial intelligence.
					We try to review the audio before putting it up, but occasionally a few mistakes might slip through.
					Feel free to let us know about any issues you come across.
				</p>

				<h3>Can I use these audio books for my own project?</h3>
				<p>
					Please contact us if you'd like to get permission to use our audio books.
				</p>
				<div class="center">${new Email("something","gmail","com")}</div>

				<h2>Acknowledgements</h2>
				<p>The fonts and icons used on this site are from Google Fonts and Font Awesome respectively.</p>
			`,"sm",false,true)}
		`);
	}
}
defineElm(AboutPage,scss`&{
	width: 100%;
	p.center{
		text-align: center;
	}
	div.center{
		${theme.center}
	}
	h2{
		text-align: center;
		${theme.font.primary}
		${theme.font.fontSizeStep(2)};
		line-height: 1.5;
		margin-top: 50px;
	}
	h3{
		background-color: ${theme.color.greyStep(1)};
		text-align: center;
		${theme.font.primary}
		${theme.font.fontSizeStep(0)};
		line-height: 1.5;
		margin-top: 50px;
		&.first{
			margin-top: 20px;
		}
	}
}`);
class RequestPage extends CustomElm{
	constructor(){
		super();
		//TODO
		let title=bind("");
		let name=bind("");
		let email=bind("");

		let needsTitle=bind(false);
		title.sub(()=>{
			needsTitle.data=false;
		});

		let emailInvalid=bind(false);
		email.sub(()=>{
			emailInvalid.data=false;
		});

		let radius=bind(0);
		let opacity=bind(0);
		let requestedAnim=animate((t)=>{
			radius.data=easeInOutExpo(Math.min(t*2,1))*250;
			opacity.data=easeInOutExpo(1-Math.abs(t*2-1));
		},2);
		this.define(html`
			${new Surface(html`
				<h2>Request a book</h2>
				<p class="center">
					(Remember we can only add books which are in the public domain to our library)
				</p>
				<div class=${attr(()=>"input "+(needsTitle.data?"failed":""))(needsTitle)}>
					<label>Book Title: <span class="require">(required)</span></label>
					${new Input(title)}
				</div>
				<div class="input">
					<label>Author Name: <span class="option">(optional)</span></label>
					${new Input(name)}
				</div>
				<div class=${attr(()=>"input "+(emailInvalid.data?"failed":""))(emailInvalid)}>
					<label>Your Email: <span class="option">(optional)</span><span class="require">(invalid)</span></label>
					<p>This will allow us to let you know once the book is added</p>
					${new Input(email)}
				</div>
				<div class="center">
					${new ButtonClickable("Request!",()=>{
						let valid=true;
						if(title.data.trim()==""){
							needsTitle.data=true;
							valid=false;
						}
						if(email.data.trim()!=""&&!isValidEmail(email.data.trim())){
							emailInvalid.data=true;
							valid=false;
						}

						if(valid){
							requestBook(title.data,name.data,email.data);
							title.data="";
							name.data="";
							requestedAnim.start();
						}
					})}
					<div class="ringCenter"
						style=${attr(()=>`margin-top:${radius.data*2*2/3}px; opacity:${opacity.data};`)(radius,opacity)}
					>
						<div
							class="ring"
							style=${attr(()=>`width:${Math.max(radius.data*2-20,0)}px; height:${Math.max(radius.data*2-20,0)}px;`)(radius)}
						></div>
						${new TextArcMid("Requested!",radius,-PI/2,0.1,0,false,true)}
					</div>
				</div>
			`,"sm",false,true)}
		`);
	}
}
defineElm(RequestPage,scss`&{
	${Surface}{
		>div{
			position: relative;
			overflow: hidden;
		}
	}
	width: 100%;
	p.center{
		text-align: center;
	}
	div.center{
		${theme.center}
	}
	h2{
		text-align: center;
		${theme.font.primary}
		${theme.font.fontSizeStep(2)};
		line-height: 1.5;
		margin-top: 50px;
	}
	div.input{
		${theme.center}
		flex-direction:column;
		margin: 30px 40px;
		>label{
			${theme.font.fontSizeStep(-0.5)};
			text-align: center;
			margin: 0;
			${theme.font.primary}
			font-weight: 700;
			>span.option{
				color: ${theme.color.greyStep(5)}
			}
			>span.require{
				display:none;
			}
		}
		>p{
			margin: 0;
		}
		${Input}{
			margin-top: 10px;
			align-self:stretch;
			${theme.center}
			input{
				width:0;
				max-width: 400px;
				flex-grow:1;
			}
		}
		&.failed{
			${Input}{
				input{
					border-color: ${theme.color.red}
				}
			}
			>label{
				>span.option{
					display: none;
				}
				>span.require{
					display: inline;
					color: ${theme.color.red}
				}
			}
		}
	}
	${ButtonClickable}{
		position: relative;
		z-index:1;
	}
	.ringCenter{
		pointer-events:none;
		position: absolute;
		${theme.center}
		${TextArcMid}{
			${theme.font.fontSizeStep(2)};
			fill:${theme.color.white};
			position: absolute;
			font-weight: 700;
		}
		.ring{
			position: absolute;
			width:200px;
			height:200px;
			border-radius: 50%;
			border: 50px solid ${theme.color.highlight};
		}
	}
}`);

class ChaperList extends CustomElm{
	constructor(book,selectFunc){
		super();
		if(book==null){
			return;
		}

		let loaded;
		if(typeof book.data=="function"){
			loaded=bind(false);
			book.sub(()=>{
				loaded.data=true;
			});
			book.data();
		}else{
			loaded=bind(true);
		}

		this.define(html`
			${()=>loaded.data?book.chapters.map((chapter,i)=>html`
				<div onclick=${attr(act(()=>{
					selectFunc(chapter);
				}))}>
					<div class=${attr(()=>chapter.selected.data?"selected":"")(chapter.selected)}>
						<p class="title">${html`${chapter.name}`(chapter.name)}</p>
						<p class="time">${html`${()=>msToTime(chapter.time.data)}`(chapter.time)}</p>
						<div
							class="cover"
							style=${attr(()=>`width:${Math.min(chapter.progress.data/chapter.time.data,1)*100}%`)(chapter.progress,chapter.time)}
						></div>
					</div>
				</div>
			`):""}
		`(loaded));
	}
}
defineElm(ChaperList,scss`&{
	>div{
		user-select:none;
		padding: 5px 10px;
		cursor: pointer;
		>div{
			position:relative;
			background-color: ${theme.color.greyStep(-2)};
			height: 50px;
			${theme.centerY}
			border-radius: 4px;
			overflow: hidden;
			transition: background-color 0.2s;
			p{
				padding: 2px 10px;
				background-color: ${theme.color.greyStep(-2)};
				position:relative;
				z-index:1;
				margin-left: 10px;
				border-radius: 20px;
			}
			>.title{
				border: 2px solid transparent;
				transition: color 0.2s;
			}
			p.time{
				position: absolute;
				right: 10px;
				color: ${theme.color.greyStep(2)};
				font-weight: 700;
			}
			>.cover{
				box-sizing: border-box;
				background-color: ${theme.color.greyStep(-1)};
				border-right: 8px solid ${theme.color.highlight};
				position: absolute;
				top:0;
				bottom:0;
				left:0;
				transition: background-color 0.2s;
			}
			&.selected{
				>.title{
					color: ${theme.color.highlight};
					font-weight: 700;
					border: 2px solid ${theme.color.highlight};
				}
			}
		}
		&:hover{
			>div{
				background-color: ${theme.color.greyStep(0)};
				>.title{
					color: ${theme.color.highlight};
				}
				>.cover{
					background-color: ${theme.color.greyStep(1)};
				}
			}
		}
	}
}`);

class SlideInput extends CustomElm{
	constructor(val,min,max){
		super();
		val=bind(val);
		min=bind(min);
		max=bind(max);
		let range=def(()=>max.data-min.data,min,max);

		let mDown=(e)=>{
			document.addEventListener("mousemove",mMove);
			document.addEventListener("mouseup",mUp);
			mMove(e);
		};
		let mMove=(e)=>{
			e.preventDefault();
			let box=this.getBoundingClientRect();
			let elmPos=new Vector(box.left,box.top);
			let elmSize=new Vector(this.offsetWidth-16,this.offsetHeight);
			let clickPos=new Vector(e.clientX,e.clientY);
			clickPos.subVec(elmPos);
			clickPos.x-=8;
			if(elmSize.x!=0){
				val.data=
					Math.min(Math.max(
						clickPos.x/elmSize.x*range.data+min.data
					,min.data),max.data);
			}
		};
		let mUp=()=>{
			document.removeEventListener("mousemove",mMove);
			document.removeEventListener("mouseup",mUp);
		};
		this.define(html`
			<div
				onmousedown=${attr(act(
					mDown
				))}
			>
				<div class="bar">
					<div>
						<div class="knob"
							style=${attr(()=>`
								left: ${Math.min(Math.max((val.data-min.data)/range.data,0),1)*100}%`
							)(val,range)}
						></div>
					</div>
				</div>
			</div>
		`);
	}
}
{
	let knobSize=20;
	let barHeight=4;
	let fullHeight=20;
	defineElm(SlideInput,scss`&{
		>div{
			position: relative;
			height: ${fullHeight}px;
			${theme.center}
			cursor: pointer;
			>.bar{
				flex-grow:1;
				height: ${barHeight}px;
				background-color: ${theme.color.greyStep(2)};
				border-radius: ${barHeight/2}px;
				>div{
					position: relative;
					margin-right: ${knobSize}px;
					>.knob{
						top: ${-(knobSize-barHeight)/2}px;
						width: ${knobSize}px;
						height: ${knobSize}px;
						background-color: ${theme.color.highlight};
						position: absolute;
						border-radius: ${knobSize/2}px;
					}
				}
			}
		}
	}`);
}
class VolumeInput extends CustomElm{
	constructor(volume){
		super();
		let minimized=bind(true);
		this.define(html`
			<div
				class=${attr(()=>
					"volume "+
					(minimized.data?"":"open ")+
					(volume.data==0?"off":(volume.data<0.5?"low":"high"))
				)(minimized,volume)}
				onclick=${attr(act(()=>{
					minimized.data=!minimized.data;
				}))}
			>
				<img class="off" src="${demoPath}/icons/volume-off.svg" alt="Volume Icon"/>
				<img class="low" src="${demoPath}/icons/volume-low.svg" alt="Volume Icon"/>
				<img class="high" src="${demoPath}/icons/volume-high.svg" alt="Volume Icon"/>
			</div>
			<div class=${attr(()=>"slide"+(minimized.data?" minimized":""))(minimized)}>
				${new SlideInput(volume,0,1,2)}
			</div>
		`);
	}
}
defineElm(VolumeInput,scss`&{
	width: 200px;
	${theme.center}
	>.volume{
		position: relative;
		min-width:50px;
		min-height:50px;
		box-sizing: border-box;
		border:2px solid ${theme.color.greyStep2(1)};
		border-radius:25px;
		${theme.center}
		transition: border 0.2s;
		&.off>img.off{
			display:block;
		}
		&.low>img.low{
			display:block;
		}
		&.high>img.high{
			display:block;
		}
		>img{
			position: absolute;
			left:8px;
			display:none;
			height:25px;
		}
		&.open{
			border:2px solid ${theme.color.highlight};
		}
		&:hover{
			border:2px solid ${theme.color.highlight};
		}
	}
	>.slide{
		flex-grow:1;
		${theme.center}
	}
	>.minimized{
		display: none;
	}
	${SlideInput}{
		flex-grow:1;
		margin-left:20px;
	}
}`);

class Player extends CustomElm{
	constructor(open,book,volume){
		super();
		open=bind(open);
		let minimized=bind(false);

		let loaded=bind(false);
		let selectedChapter=bind(null,false);
		link(()=>{
			if(book.data==null){
				loaded.data=false;
				selectedChapter.data=null;
			}else{
				 if(typeof book.data.data=="function"){
					loaded.data=false;
					book.data.sub(()=>{
						loaded.data=true;
						selectedChapter.data=book.data.chapters.find((c)=>
							c.selected.data
						);
					});
					book.data.data();
				}else{
					loaded.data=true;
					selectedChapter.data=book.data.chapters.find((c)=>
						c.selected.data
					);
				}
			}
		},book)();

		let cssClassOpen=bind("");
		let frame1=0;
		let closeAnim=animate((t)=>{
			if(t==0){
				if(open.data){
					cssClassOpen.data="openStart";
				}else{
					cssClassOpen.data="closeStart";
				}
				frame1=0;
			}else if(t!=1){
				// Firefox requires an additional 1 frame delay
				if(frame1==1){
					if(open.data){
						cssClassOpen.data="openMid";
					}else{
						cssClassOpen.data="closeMid";
					}
				}else{
					frame1++;
				}
			}else{
				if(open.data){
					cssClassOpen.data="openEnd";
				}else{
					cssClassOpen.data="closeEnd";
					minimized.data=false;
				}
			}
		},0.6);
		open.sub(()=>{
			pause();
			closeAnim.start();
		});

		let cssClassMinim=bind("");
		let frame2=0;
		let minimAnim=animate((t)=>{
			if(t==0){
				if(minimized.data){
					cssClassMinim.data="minimStart";
				}else{
					cssClassMinim.data="maximStart";
				}
				frame2=0;
			}else if(t!=1){
				// Firefox requires an additional 1 frame delay
				if(frame2==1){
					if(minimized.data){
						cssClassMinim.data="minimMid";
					}else{
						cssClassMinim.data="maximMid";
					}
				}else{
					frame2++;
				}
			}else{
				if(minimized.data){
					cssClassMinim.data="minimEnd";
				}else{
					cssClassMinim.data="maximEnd";
				}
			}
		},0.6);
		minimized.sub(()=>{
			minimAnim.start();
		});

		link(()=>{
			if(open.data&&!minimized.data){
				lockPage();
			}else{
				unlockPage();
			}
		},minimized,open);

		let selectChapterFunc=(chapter)=>{
			selectedChapter.data=chapter;
			book.data.chapters.forEach(c=>c.selected.data=c==chapter);
		}
		
		let audioPlayer=new AudioPlayer(volume.data);

		let playAnim=animate((t,diff)=>{
			if(selectedChapter.data!=null){
				selectedChapter.data.progress.data=audioPlayer.getTime();
			}
		},1,true);
		playAnim.start();

		let playing=bind(false);
		function play(){
			playing.data=true;
			audioPlayer.play();
		}
		function pause(){
			playing.data=false;
			audioPlayer.pause();
		}
		function setProgress(t){
			audioPlayer.setTime(t);
		}

		link(()=>{
			playing.data=false;
			audioPlayer.pause();
			audioPlayer.selectChapter(book.data,selectedChapter.data);
		},selectedChapter)();

		link(()=>{
			audioPlayer.setVolume(volume.data);
		},volume);

		let dragging=bind(false);
		let mouseupF=()=>{
			dragging.data=false;
			document.removeEventListener("mouseup",mouseupF);
		};
		let spaceF=(e)=>{
			if(e.code=="Space"&&open.data){
				e.preventDefault();
				if(playing.data){
					pause();
				}else{
					play();
				}
				return false;
			}
		}
		document.addEventListener("keydown",spaceF);

		this.define(html`
			<div
				class=${attr(()=>[
					cssClassOpen.data,
					cssClassMinim.data,
					open.data?"opened":"closed",
					minimized.data?"minimized":"maximized"
				].join(" "))(cssClassOpen,cssClassMinim)}
			>
				<div class="head">
					<p>
						${html`${
							()=>loaded.data?html`${book.data.title}`(book.data.title):"-"
						}`(loaded,book)}
						- 
						${html`${
							()=>selectedChapter.data!=null?html`${selectedChapter.data.name}`(selectedChapter.data.name):"-"
						}`(selectedChapter)}
					</p>
					<div class="right">
						<div class="down" onclick=${attr(act(()=>{
							minimized.data=!minimized.data;
						}))}>
							<img src="${demoPath}/icons/chevron-down.svg" alt="Minimize Icon"/>
						</div>
						<div class="close" onclick=${attr(act(()=>{
							open.data=false;
						}))}>
							<img src="${demoPath}/icons/xmark.svg" alt="Close Icon"/>
						</div>
					</div>
					<div class="left">
						<div class="logo">
							<img src="${demoPath}/img/logoSmall.png" alt="Logo"/>
						</div>
					</div>
				</div>
				<div class="body">
					<div class="player">
						${new VolumeInput(volume)}
						<div class="icon">
							<div
								class="back"
								style=${attr(()=>
									!loaded.data?"":`background-image: url("${demoPath}/books/${book.data.id.data}/${book.data.coverImgHigh.data}"),url("${demoPath}/books/${book.data.id.data}/${book.data.coverImgLow.data}");`
								)(loaded,book)}
							></div>
							<div
								class="front"
								style=${attr(()=>
									!loaded.data?"":`background-image: url("${demoPath}/books/${book.data.id.data}/${book.data.coverImgHigh.data}"),url("${demoPath}/books/${book.data.id.data}/${book.data.coverImgLow.data}");`
								)(loaded,book)}
							></div>
							${addClass("toggle",new ButtonClickable(
								html`${()=>playing.data?`<img class="pause" src="${demoPath}/icons/pause-2.svg" alt="Pause"/>`:`<img class="play" src="${demoPath}/icons/play-2.svg" alt="Play"/>`}`(playing),
								()=>{
									if(playing.data){
										pause();
									}else{
										play();
									}
								}
							))}
						</div>
						<div
							class=${attr(()=>"bar "+(dragging.data?"dragging":""))(dragging)}
							onmousedown=${attr(act((e)=>{
								e.preventDefault();
								if(selectedChapter.data!=null){
									pause();
									let bar=getElm(".player>.bar",this);
									setProgress(selectedChapter.data.time.data*e.offsetX/bar.offsetWidth);
								}
								dragging.data=true;
								document.addEventListener("mouseup",mouseupF);
							}))}
							onmousemove=${attr(act((e)=>{
								e.preventDefault();
								if(selectedChapter.data!=null&&dragging.data){
									let bar=getElm(".player>.bar",this);
									setProgress(selectedChapter.data.time.data*e.offsetX/bar.offsetWidth);
								}
							}))}
						>
							<div class="center"></div>
							<div class="start"></div>
							<div class="end"></div>
							
							${html`${()=>selectedChapter.data==null?"":html`
								<div
									class="progress"
									style=${attr(()=>`width:${Math.min(selectedChapter.data.progress.data/selectedChapter.data.time.data,1)*100}%`)(selectedChapter.data.progress,selectedChapter.data.time)}
								>
									<div class="indicator">
										<p class="current">${html`${()=>msToTime(selectedChapter.data.progress.data)}`(selectedChapter.data.progress)}</p>
										<p class="total">${html`${()=>msToTime(selectedChapter.data.time.data)}`(selectedChapter.data.time)}</p>
									</div>
								</div>
							`}`(selectedChapter)}
						</div>
					</div>
					<div class="chapters">
						${html`${()=>new BookInfo(book.data)}`(book)}
						${html`${()=>new ChaperList(book.data,selectChapterFunc)}`(book)}
					</div>
				</div>
			</div>
		`);
	}
}
defineElm(Player,scss`&{

	>.closed{
		display: none;
	}
	>.minimized{
		>.head>.right>.down>img{
			transform: rotate(180deg);
		}
	}
	
	>.openStart{
		display: flex;
		opacity: 0;
	}
	>.openMid{
		display: flex;
		opacity: 1;
	}
	>.openEnd{
		display: flex;
		opacity: 1;
	}
	>.closeStart{
		display: flex;
		opacity: 1;
	}
	>.closeMid{
		display: flex;
		opacity: 0;
	}
	>.closeEnd{
		display: none;	
	}
	
	>.minimStart{
		top: unset;
		right: unset;
		width: 100%;
		height: 100%;
	}
	>.minimMid{
		top: unset;
		right: unset;
		bottom: 25px;
		left: 25px;
		width: 400px;
		height: 450px;
	}
	>.minimEnd{
		top: unset;
		right: unset;
		bottom: 25px;
		left: 25px;
		width: 400px;
		height: 450px;
	}

	>.maximStart{
		top: unset;
		right: unset;
		bottom: 25px;
		left: 25px;
		width: 400px;
		height: 450px;
	}
	>.maximMid{
		top: unset;
		right: unset;
		bottom: 0px;
		left: 0px;
		width: 100%;
		height: 100%;
	}
	>.maximEnd{
		inset: 0;
	}

	>div{
		transition: opacity 0.6s, width 0.6s, height 0.6s, left 0.6s, bottom 0.6s;
		position: fixed;
		inset: 0;
		background-color: ${theme.color.greyStep(-4)};
		z-index: 20;
		display:flex;
		flex-direction: column;
		${theme.boxShadowStep(0)}
		overflow: hidden;
		>.head{
			position:relative;
			z-index: 1;
			min-height: 50px;
			background-color: ${theme.color.greyStep(-1)};
			${theme.boxShadowStep(0)}
			${theme.center};
			>p{
				padding-left:70px;
				padding-right:110px;
				text-align:center;
				margin:0 10px;
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
			}
			>.left{
				position: absolute;
				left: 10px;
				${theme.center}
				.logo >img{
					opacity: 0.2;
					height: 60px;
				}
				>div>img{
					user-select: none;
					pointer-events: none;
				}
			}
			>.right{
				position: absolute;
				right: 10px;
				${theme.center}
				>div{
					${theme.center}
					background-color: ${theme.color.greyStep(-2)};
					width: 40px;
					height: 40px;
					border-radius: 20px;
					margin: 0 5px;
					>img{
						user-select: none;
						pointer-events: none;
					}
				}
				.down >img{
					height: 20px;
				}
				.close >img{
					width: 14px;
				}
			}
		}
		>.body{
			display: flex;
			flex-grow:1;
			overflow-x: auto;
			overflow-y: hidden;
			>.chapters{
				max-width: 500px;
				flex-grow:1;
				min-width: 400px;
				max-height: 100%;
				align-self: stretch;
				background-color: ${theme.color.greyStep(-4)};
				overflow: auto;
				border-left: 8px solid ${theme.color.greyStep(-2)};
				padding: 5px 0;
			}
			>.player{
				min-width: min(100vw, 400px);
				flex-grow:2;
				align-self: stretch;
				${theme.center};
				flex-direction: column;
				>${VolumeInput}{
					margin-top:50px;
				}
				>.icon{
					position: relative;
					z-index:1;
					width:250px;
					height:250px;
					margin-top:20px;
					margin-bottom:20px;
					border-radius: 16px;
					${theme.center};
					>.toggle{
						position: absolute;
						bottom:-50px;
						button{
							border-radius: 50px;
						}
						.surface{
							width: 100px;
							height: 100px;
							padding:0;
							border-radius: 50px;
							background-color: ${theme.color.highlight};
							${theme.center}
						}
						img{
							pointer-events:none;
							width: 50px;
							&.play{
								margin-left:8px;
							}
						}
					}
					>.back{
						position: absolute;
						inset: 0;
						background-size: cover;
						background-position: center; 
						filter: blur(20px);
						border-radius: 16px;
					}
					>.front{
						position: absolute;
						inset: 0;
						background-size: cover;
						background-position: center; 
						border-radius: 16px;
					}
				}
				>.bar{
					position: relative;
					min-height:150px;
					align-self: stretch;
					${theme.center};
					margin: 0 40px;
					>*{
						user-select:none;
						pointer-events:none;
					}
					>.center{
						position: absolute;
						right:0;
						left:0;
						background-color: ${theme.color.greyStep(0)};
						height:4px;
					}
					>.start{
						position: absolute;
						left:-4px;
						height:25px;
						width: 4px;
						background-color: ${theme.color.highlight};
					}
					>.end{
						position: absolute;
						right:-4px;
						height:25px;
						width: 4px;
						background-color: ${theme.color.highlight};
					}
					>.progress{
						position: absolute;
						left:0;
						height:4px;
						background-color: ${theme.color.highlight};
						>.indicator{
							position: absolute;
							box-sizing: border-box;
							right:-15px;
							top:-13px;
							height:30px;
							width: 30px;
							border-radius: 15px;
							background-color: ${theme.color.greyStep(-4)};
							border:4px solid ${theme.color.highlight};
							${theme.center};
							transition: background-color 0.2s;
							>p{
								padding: 2px 10px;
								background-color: ${theme.color.greyStep(-4)};
								position:relative;
								z-index:1;
								border-radius: 20px;
							}
							>.current{
								user-select: none;
								position: absolute;
								bottom:12px;
							}
							>.total{
								user-select: none;
								position: absolute;
								top:12px;
							}
						}
					}
					&:hover{
						>.progress>.indicator{
							background-color: ${theme.color.highlight};
						}
					}
					&.dragging{
						>.center{
							background-color: ${theme.color.greyStep(2)};
						}
						>.progress>.indicator{
							background-color: ${theme.color.highlight};
						}
					}
				}
			}
		}
	}
}`);


