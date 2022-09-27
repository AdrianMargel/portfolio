
/*
	TODO: 
		-triangle
		-colors
*/

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
		this.limit();
	}
	limit(){
		function lim(c){
			return Math.max(Math.min(c,1),0);
		}
		
		this.r=lim(this.r);
		this.g=lim(this.g);
		this.b=lim(this.b);
		this.a=lim(this.a);
	}
	toString(){
		return rgbToHex(this.r*255,this.g*255,this.b*255,this.a*255);
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
function addColors(col1,col2,mix){
	return new Color(
		col1.r+col2.r*mix,
		col1.g+col2.g*mix,
		col1.b+col2.b*mix,
		col1.a+col2.a*mix,
	);
}
function blendValues(v1,v2,mix){
	let invMix=1-mix;
	return v1*invMix+v2*mix;
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
		let base=new Color("#36363F");

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
			highlight: "#7AC16C",
			white,
			black
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

//${Array.apply(null, Array(10)).map((_,i)=>`<div style="${theme.boxShadowStep(i-5)}">TEST${i-5}</div>`)}

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
defineElm(Input);

class InputNumber extends CustomElm{
	constructor(num,unit){
		super();
		num=bind(num);
		unit=bind(unit);
		this.define(html`
			<input
				value=${attr(num)(num)}
				oninput=${attr(act((event)=>{
					let v=parseFloat(event.target.value);
					if(isNaN(v)){
						v=0;
					}
					num.data=Math.max(v,0);
				}))()}
				type="number"
			/>
			<p><span>${html`${unit}`(unit)}</span><p>
		`);
	}
}
defineElm(InputNumber,scss`&{
	${theme.elementReset}
	position: relative;
	>p{
		${theme.font.secondary}
		${theme.font.fontSizeStep(-1)}
		font-weight: 800;
		color: ${theme.color.greyStep(5)};
		position: absolute;
		right: 10px;
		top:0;
		bottom:0;
		${theme.center}
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
		background-color: #58934C;
		border-radius: 6px;
		${theme.boxShadowStep(-3)}
		.surface{
			font-family: 'Sen', sans-serif;
			font-weight: 700;
			font-size: 20px;
			color: white;
			background-color: #7AC16C;
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
		z-index: 2;
		position: relative;
		> .back{
			position: absolute;
			height:${size};
			width:${size};
			background-image: url('./img/logo.png');
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

//TODO: better list handling

class Nav extends CustomElm{
	constructor(items,scroll){
		super();
		let isDown;
		if(scroll!=null){
			isDown=def(()=>scroll.data>400,scroll);
		}else{
			isDown=bind(false);
		}
		let hasMid=def(()=>items.length%2==0,items);
		this.define(html`
			<div class=${attr(()=>isDown.data?"down":"")(isDown)}>
				${html`${
					()=>hasMid.data?
					`
						<div class="mid">
							<div class="cover"><div></div></div>
							<div class="shadowHider"></div>
							<div class="icon"></div>
						</div>
					`:""
				}`(hasMid)}
				${()=>{
					let list=items.map((a)=>html`
						<button
							onclick=${attr(act(()=>setPage(a.id.data)))}
							class=${attr(()=>a.selected.data?"selected":"")(a.selected)}
						>
						<span>${html`${a.text}`(a.text)}</span>
						</button>
					`());
					if(list.length%2==0){
						list.splice(Math.floor(list.length/2),0,newElm("div","midGap"));
					}
					return list;
				}}
			</div>
		`(items));
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
		z-index: 1;
		button{
			transition: border-color 0.2s, color 0.2s;
			height: ${height};
			width: ${width};
			${theme.center}

			font-weight: 700;
			${theme.font.primary}
			${theme.centerText}
			${theme.font.fontSizeStep(-0.5)}
			color: ${transWhite};

			border: none;
			border-bottom: 4px solid;
			border-radius:0;
			background: none;
			padding: 0 ${space};
			padding-top: 4px;
			border-color: transparent;
			> span{
				z-index: 1;
			}
			&:hover{
				color: ${theme.color.white};
				border-color: ${transWhite};
			}
			&.selected{
				border-color: ${theme.color.highlight};
				color: ${theme.color.highlight};
			}
		}
		.mid{
			position: absolute;
			width: 100%;
			height: 100%;
			justify-content: center;
			display: flex;
			opacity: 0;
			transition: opacity 0.5s;
			pointer-events: none;
			.cover{
				position: absolute;
				transform: scaleY(0.8) rotate(-45deg)
				> div{
					width: 65px;
					height: 65px;
					background-color: #36363F;
					box-shadow: 0 0 30px #00000080;
				}
			}
			.shadowHider{
				background-color: #36363F;
				position: absolute;
				top: 0px;
				height: 35px;
				width: 100%;
			}
			.icon{
				width: 60px;
				height: 60px;
				background-image: url("./img/logoSmall.png");
				background-position: center;
				background-size: cover;
				position: absolute;
			}
		}
		.midGap{
			margin-right: 0;
			transition: margin 0.5s;
		}
		&.down{
			position: fixed;
			left: 0;
			right: 0;
			top: 0;
			.midGap{
				margin-right: 50px;
			}
			.mid{
				opacity: 1;
			}
		}


	}`})()
);

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
		background-image: url("./img/logoSmall.png");
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

	h2{
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
		this.define(html`
			404 Error - Page Not Found
		`);
	}
}
defineElm(MissingPage,scss`&{

}`);

class Slider extends CustomElm{
	constructor(val,min,max,decimals=2){
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
			let box=this.getBoundingClientRect();
			let elmPos=new Vector(box.left,box.top);
			let elmSize=new Vector(this.offsetWidth-16,this.offsetHeight);
			let clickPos=new Vector(e.clientX,e.clientY);
			clickPos.subVec(elmPos);
			clickPos.x-=8;
			if(elmSize.x!=0){
				val.data=
					round(
						Math.min(Math.max(
							clickPos.x/elmSize.x*range.data+min.data
						,min.data),max.data),
						decimals
					);
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
				<p class="start">
					${html`${min}`(min)}
				</p>
				<div class="bar">
					<div>
						<div class="knob"
							style=${attr(()=>`
								left: ${Math.min(Math.max((val.data-min.data)/range.data,0),1)*100}%`
							)(val,range)}
						></div>
					</div>
				</div>
				<p class="end">
					${html`${max}`(max)}
				</p>
			</div>
		`);
	}
}
{
	let knobSize=20;
	let barHeight=8;
	let fullHeight=20;
	defineElm(Slider,scss`&{
		width:500px;
		>div{
			margin-top: 10px;
			margin-bottom: 30px;
			position: relative;
			height: ${fullHeight}px;
			${theme.center}
			cursor: pointer;
			>.bar{
				flex-grow:1;
				height: ${barHeight}px;
				background-color: ${theme.color.greyStep(1)};
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
			>.start{
				${theme.font.secondary}
				${theme.font.fontSizeStep(-1)}
				font-weight: 800;
				color: ${theme.color.greyStep(5)};

				margin: 0;
				user-select: none;
				position: absolute;
				top: 20px;
				left: 0;
			}
			>.end{
				${theme.font.secondary}
				${theme.font.fontSizeStep(-1)}
				font-weight: 800;
				color: ${theme.color.greyStep(5)};
				
				margin: 0;
				user-select: none;
				position: absolute;
				top: 20px;
				right: 0;
			}
		}
	}`);
}
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
						`left:${Math.max(index.data*50-1,0)}px`
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
	let size=50;
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
				height:${size}px;
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
					color: ${theme.color.greyStep(5)};
					transition: color ${animSpeed}s;
					user-select:none;
					cursor: pointer;

					box-sizing:border-box;
					${theme.center}
					border: 2px solid ${theme.color.greyStep(2)};
					border-left-width: 1px;
					border-right-width: 1px;
					background-color: ${theme.color.greyStep(0)};
					width:${size}px;
					height:${size}px;
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

class CalcField extends CustomElm{
	constructor(val,name,hoverDim,selectedDim,highlightDim,max,precision=2,unit){
		super();
		val=bind(val);
		name=bind(name);
		hoverDim=bind(hoverDim);
		selectedDim=bind(selectedDim);
		max=bind(max);
		unit=bind(unit);

		this.define(html`
			<div
				class=${attr(()=>highlightDim.data==name.data?"selected":"")(highlightDim,name)}
				onmouseover=${attr(act(()=>{
					hoverDim.data=name.data;
				}))}
				onmouseout=${attr(act(()=>{
					hoverDim.data="";
				}))}
				onmousedown=${attr(act(()=>{
					selectedDim.data=name.data;
				}))}
			>
				<div class="highlight"></div>
				<p>${html`${name}`(name)}</p>
				<div>
					${new InputNumber(val,unit)}
					${new Slider(val,0,max,precision)}
				</div>
			</div>
		`);
	}
}
defineElm(CalcField,scss`&{
	>div{
		position: relative;
		${theme.center}
		flex-direction: column;
		padding: 10px 20px;
		&.selected{
			>.highlight{
				background-color: ${theme.color.greyStep(-0.5)};
				${theme.boxShadowStep(-2)}
			}
			>p{
				background-color: ${theme.color.greyStep(-1)};
				border-bottom: 2px solid ${theme.color.highlight};
			}
		}
		>.highlight{
			position: absolute;
			top: 30px;
			left: 0;
			right: 0;
			bottom: 0;
			border-radius: 20px;
		}
		>p{
			${theme.font.primary}
			${theme.font.fontSizeStep(0)}
			font-weight: 800;
			
			position: relative;
			padding: 5px 10px;
			background-color: ${theme.color.greyStep(-1)};
			border: 2px solid transparent;
			user-select: none;
			margin-bottom: 10px;
		}
		>div{
			position: relative;
		}
	}
}`);
class Calculator extends CustomElm{
	constructor(){
		super();
		let hoverDim=bind("");
		let selectedDim=bind("");
		this.highlightDim=def(()=>hoverDim.data||selectedDim.data,selectedDim,hoverDim);

		this.type=bind("Circular");
		this.unit=bind("FT");
		this.unitSquared=def(()=>this.unit.data+"<sup>2</sup>",this.unit);

		this.depthVal=bind(10);
		this.lengthVal=bind(40);
		this.widthVal=bind(60);
		this.side1Val=bind(50);
		this.side2Val=bind(50);
		this.side3Val=bind(50);
		this.areaVal=bind(1000);

		let precisionIn=3;
		let precisionOut=1;

		this.surfaceArea=def(
			()=>this.calcArea(),
			this.type,
			this.unit,
			this.depthVal,
			this.lengthVal,
			this.widthVal,
			this.side1Val,
			this.side2Val,
			this.side3Val,
			this.areaVal
		);
		this.volume=def(
			()=>this.surfaceArea.data*this.depthVal.data,
			this.surfaceArea,
			this.depthVal
		);

		this.unit.sub(()=>{
			if(this.unit.data=="FT"){
				([this.lengthVal,this.widthVal,this.depthVal,this.side1Val,this.side2Val,this.side3Val]).forEach(a=>a.data=round(this.convert(a.data,"M","FT"),precisionIn));
				this.areaVal.data=round(this.convert(this.areaVal.data,"M2","FT2"),precisionIn);
			}else{
				([this.lengthVal,this.widthVal,this.depthVal,this.side1Val,this.side2Val,this.side3Val]).forEach(a=>a.data=round(this.convert(a.data,"FT","M"),precisionIn));
				this.areaVal.data=round(this.convert(this.areaVal.data,"FT2","M2"),precisionIn);
			}
		});

		this.define(html`
			<div class="container">
				<div class="controls">
					<div class="shape">
						${(["Circular","Rectangular","Triangular","Arbitrary"]).map(
							(t)=>new ButtonClickable(
								t,
								()=>{this.type.data=t},
								def(()=>this.type.data==t,this.type)
							)
						)}
					</div>
					<div class="dimensions">
						${html`
							${()=>{
								switch(this.type.data){
									case "Circular":
									case "Rectangular":
										return [
											new CalcField(this.lengthVal,"Length",hoverDim,selectedDim,this.highlightDim,100,precisionIn,this.unit),
											new CalcField(this.widthVal,"Width",hoverDim,selectedDim,this.highlightDim,100,precisionIn,this.unit),
											new CalcField(this.depthVal,"Average Depth",hoverDim,selectedDim,this.highlightDim,50,precisionIn,this.unit)
										];
									case "Triangular":
										return [
											new CalcField(this.side1Val,"Side Length 1",hoverDim,selectedDim,this.highlightDim,100,precisionIn,this.unit),
											new CalcField(this.side2Val,"Side Length 2",hoverDim,selectedDim,this.highlightDim,100,precisionIn,this.unit),
											new CalcField(this.side3Val,"Side Length 3",hoverDim,selectedDim,this.highlightDim,100,precisionIn,this.unit),
											new CalcField(this.depthVal,"Average Depth",hoverDim,selectedDim,this.highlightDim,50,precisionIn,this.unit)
										];
									case "Arbitrary":
										return [
											new CalcField(this.areaVal,"Surface Area",hoverDim,selectedDim,this.highlightDim,5000,precisionIn,this.unitSquared),
											new CalcField(this.depthVal,"Average Depth",hoverDim,selectedDim,this.highlightDim,50,precisionIn,this.unit)
										];
									default:
										return [];
								}
							}}
						`(this.type)}
					</div>
					${new Switch(this.unit,["FT","M"])}
				</div>
			</div>
			<div class="canvasContainer">
				<canvas></canvas>
			</div>
			<div class="container">
				<div class="results">
					<p>Surface Area</p>
					<div>
						<p class="first">
							${html`${()=>round(
								this.convert(this.surfaceArea.data,this.unit.data+"2","FT2"),
								precisionOut
							).toLocaleString()}`(this.surfaceArea)}
						</p>
						<p><span>FT<sup>2</sup></span></p>
					</div>
					<div>
						<p class="first">
							${html`${()=>round(
								this.convert(this.surfaceArea.data,this.unit.data+"2","M2"),
								precisionOut
							).toLocaleString()}`(this.surfaceArea)}
						</p>
						<p><span>M<sup>2</sup></span></p>
					</div>
					<div>
						<p class="first">
							${html`${()=>round(
								this.convert(this.surfaceArea.data,this.unit.data+"2","ACRE"),
								precisionOut
							).toLocaleString()}`(this.surfaceArea)}
						</p>
						<p><span>Acres</span></p>
					</div>
					<p>Volume</p>
					<div>
						<p class="first">
							${html`${()=>round(
								this.convert(this.volume.data,this.unit.data+"3","FT3"),
								precisionOut
							).toLocaleString()}`(this.volume)}
						</p>
						<p><span>FT<sup>3</sup></span></p>
					</div>
					<div>
						<p class="first">
							${html`${()=>round(
								this.convert(this.volume.data,this.unit.data+"3","M3"),
								precisionOut
							).toLocaleString()}`(this.volume)}
						</p>
						<p><span>M<sup>3</sup></span></p>
					</div>
					<div>
						<p class="first">
							${html`${()=>round(
								this.convert(this.volume.data,this.unit.data+"3","GALLON"),
								precisionOut
							).toLocaleString()}`(this.volume)}
						</p>
						<p><span>Gallons</span></p>
					</div>
					<div>
						<p class="first">
							${html`${()=>round(
								this.convert(this.volume.data,this.unit.data+"3","LITER"),
								precisionOut
							).toLocaleString()}`(this.volume)}
						</p>
						<p><span>Liters</span></p>
					</div>
				</div>
			</div>
		`);
		let canvas=getElm("canvas",this);
		let canvasC=getElm(".canvasContainer",this);
		this.disp=new Display(canvas,canvasC);

		this.anim=animate((t,d)=>{
			this.display(t,d);
		},1,true);
	}
	convert(val,inUnit,outUnit){
		let ftCnv=0.3048;
		let acreCnv=0.0002471054;
		let literCnv=1000;
		let gallonCnv=264.172052;

		let valM=0;
		switch(inUnit){
			case "M":
				valM=val;
				break;
			case "FT":
				valM=val*ftCnv;
				break;
			case "M2":
				valM=val;
				break;
			case "FT2":
				valM=val*(ftCnv**2);
				break;
			
			case "M3":
				valM=val;
				break;
			case "FT3":
				valM=val*(ftCnv**3);
				break;
		}
		
		switch(outUnit){
			case "M":
				return valM;
			case "FT":
				return valM/ftCnv;
			
			case "M2":
				return valM;
			case "FT2":
				return valM/(ftCnv**2);
			case "ACRE":
				return valM*acreCnv;
			
			case "M3":
				return valM;
			case "FT3":
				return valM/(ftCnv**3);
			case "GALLON":
				return valM*gallonCnv;
			case "LITER":
				return valM*literCnv;

			default:
				return 0;
		}
	}
	calcArea(){
		switch(this.type.data){
			case "Circular":
				return PI*this.lengthVal.data/2*this.widthVal.data/2;
			case "Rectangular":
				return this.lengthVal.data*this.widthVal.data;
			case "Triangular":{
				let [a1,a2,a3]=this.calcAngles(this.side1Val.data,this.side2Val.data,this.side3Val.data);
				let vec1=new Vector(0,0);
				let vec2=new Vector(this.side2Val.data,0);
				let vec3=new Vector(a1,this.side3Val.data,true);
				
				let area1=vec3.x*vec3.y/2;

				let vecDiff=new Vector(vec2);
				vecDiff.subVec(vec3);
				let area2=vecDiff.x*vecDiff.y/2;

				return area1-area2;
			}
			case "Arbitrary":
				return this.areaVal.data;
			default:
				return 0;
		}

	}
	calcAngles(side1,side2,side3){
		function cosLaw(a,b,c){
			return Math.acos((b**2+c**2-a**2)/(2*b*c))
		}
		return [
			cosLaw(side1,side2,side3),
			cosLaw(side2,side3,side1),
			cosLaw(side3,side1,side2)
		];
	}
	isValidTriangle(side1,side2,side3){
		return (side1+side2)>side3&&(side1+side3)>side2&&(side2+side3)>side1;
	}
	getHitbox(){
		if(this.type.data==="Triangular"){
			let [a1,a2,a3]=this.calcAngles(this.side1Val.data,this.side2Val.data,this.side3Val.data);
			let vec1=new Vector(0,0);
			let vec2=new Vector(this.side2Val.data,0);
			let vec3=new Vector(-a1,this.side3Val.data,true);
			let min=new Vector(vec1);
			min.minVec(vec2);
			min.minVec(vec3);
			let max=new Vector(vec1);
			max.maxVec(vec2);
			max.maxVec(vec3);
			return [min,max];
		}else if(this.type.data==="Arbitrary"){
			let avg=Math.sqrt(this.areaVal.data);
			return [new Vector(-avg/2,-avg/2),new Vector(avg/2,avg/2)];
		
		}else{
			return [new Vector(-this.widthVal.data/2,-this.lengthVal.data/2),new Vector(this.widthVal.data/2,this.lengthVal.data/2)];
		}
	}
	display(time,diff){
		let disp=this.disp;
		disp.clear();

		if(this.type.data=="Triangular"&&!this.isValidTriangle(this.side1Val.data,this.side2Val.data,this.side3Val.data)){
			disp.center();
			disp.setFill(theme.color.white);
			disp.ctx.textAlign = 'center';
			disp.ctx.textBaseline = "middle";
			disp.ctx.font = "700 24px 'Montserrat', sans-serif";
			disp.ctx.fillText("Invalid Triangle",(0-disp.cam.pos.x)*disp.cam.zoom,(0-disp.cam.pos.y)*disp.cam.zoom);
			return;
		}

		let hb=this.getHitbox();
		let hbSize=new Vector(hb[1]);
		hbSize.subVec(hb[0]);
		if(hbSize.x==0&&hbSize.y==0){
			return;
		}
		let margin=100;
		disp.cam.zoom=Math.max(Math.min((disp.canvasSize.x-margin)/hbSize.x,(disp.canvasSize.y-margin)/hbSize.y),0.1);
		disp.center();
		disp.cam.pos.addVec(new Vector(hb[0].x+hbSize.x/2,hb[0].y+hbSize.y/2))
		
		let cSizeX=disp.canvasSize.x/disp.cam.zoom;
		let cSizeY=disp.canvasSize.y/disp.cam.zoom;
		if(cSizeX<1000&&cSizeY<1000){
			disp.setWeight(0.1*(this.unit.data=="FT"?1:0.3048)*disp.cam.zoom);
			disp.setStroke(theme.color.greyStep(-1));
			disp.start();
			let offX=-disp.cam.pos.x%1;
			let offY=-disp.cam.pos.y%1;
			for(let i=0;i<cSizeX;i++){
				disp.mt(i+offX,0);
				disp.lt(i+offX,cSizeY);
			}
			for(let i=0;i<cSizeY;i++){
				disp.mt(0,i+offY);
				disp.lt(cSizeX,i+offY);
			}
			disp.pathOpen();
			disp.setWeight(0.3*(this.unit.data=="FT"?1:0.3048)*disp.cam.zoom);
			disp.setStroke(theme.color.greyStep(-1));
			disp.start();
			let offX2=-disp.cam.pos.x%5;
			let offY2=-disp.cam.pos.y%5;
			for(let i=0;i<cSizeX;i+=5){
				disp.mt(i+offX2,0);
				disp.lt(i+offX2,cSizeY);
			}
			for(let i=0;i<cSizeY;i+=5){
				disp.mt(0,i+offY2);
				disp.lt(cSizeX,i+offY2);
			}
			disp.pathOpen();
		}

		if(this.type.data=="Circular"||this.type.data=="Rectangular"){
			disp.setWeight(4);
			disp.noFill();
			disp.ctx.setLineDash([10,10]);

			disp.setStroke((this.highlightDim.data=="Width")?theme.color.highlight:theme.color.greyStep(2));
			disp.start();
			disp.mt2(-this.widthVal.data/2,0);
			disp.lt2(this.widthVal.data/2,0);
			disp.pathOpen();

			disp.setStroke((this.highlightDim.data=="Length")?theme.color.highlight:theme.color.greyStep(2));
			disp.start();
			disp.mt2(0,-this.lengthVal.data/2);
			disp.lt2(0,this.lengthVal.data/2);
			disp.pathOpen();

			disp.ctx.setLineDash([]);
			
			if(this.type.data=="Circular"){
				disp.noFill();
				disp.setStroke(theme.color.white);
				disp.ellipse2(0,0, this.widthVal.data/2,this.lengthVal.data/2);
			}else if(this.type.data=="Rectangular"){
				disp.noFill();
				disp.setStroke(theme.color.white);
				disp.rect2(-this.widthVal.data/2,-this.lengthVal.data/2,this.widthVal.data,this.lengthVal.data);
			}
		
			disp.setFill(theme.color.highlight);
			disp.setStroke(theme.color.greyStep(-2));
			disp.setWeight(10);
			disp.ctx.textAlign = 'center';
			disp.ctx.textBaseline = "middle";
			disp.ctx.font = "700 24px 'Montserrat', sans-serif";
			if(this.highlightDim.data=="Length"){
				disp.ctx.strokeText(this.lengthVal.data,(0-disp.cam.pos.x)*disp.cam.zoom,(0-disp.cam.pos.y)*disp.cam.zoom);
				disp.ctx.fillText(this.lengthVal.data,(0-disp.cam.pos.x)*disp.cam.zoom,(0-disp.cam.pos.y)*disp.cam.zoom);
			}else if(this.highlightDim.data=="Width"){
				disp.ctx.strokeText(this.widthVal.data,(0-disp.cam.pos.x)*disp.cam.zoom,(0-disp.cam.pos.y)*disp.cam.zoom);
				disp.ctx.fillText(this.widthVal.data,(0-disp.cam.pos.x)*disp.cam.zoom,(0-disp.cam.pos.y)*disp.cam.zoom);
			}
		}else if(this.type.data=="Triangular"){
			disp.setWeight(4);
			disp.noFill();
			disp.setStroke(theme.color.white);
			
			let [a1,a2,a3]=this.calcAngles(this.side1Val.data,this.side2Val.data,this.side3Val.data);
			let vec1=new Vector(0,0);
			let vec2=new Vector(this.side2Val.data,0);
			let vec3=new Vector(-a1,this.side3Val.data,true);
			disp.setStroke((this.highlightDim.data=="Side Length 1")?theme.color.highlight:theme.color.white);
			disp.start();
			disp.mt2(vec2.x,vec2.y);
			disp.lt2(vec3.x,vec3.y);
			disp.pathOpen();
			disp.setStroke((this.highlightDim.data=="Side Length 2")?theme.color.highlight:theme.color.white);
			disp.start();
			disp.mt2(vec1.x,vec1.y);
			disp.lt2(vec2.x,vec2.y);
			disp.pathOpen();
			disp.setStroke((this.highlightDim.data=="Side Length 3")?theme.color.highlight:theme.color.white);
			disp.start();
			disp.mt2(vec3.x,vec3.y);
			disp.lt2(vec1.x,vec1.y);
			disp.pathOpen();
			
			disp.setFill(theme.color.highlight);
			disp.setStroke(theme.color.greyStep(-2));
			disp.setWeight(10);
			disp.ctx.textAlign = 'center';
			disp.ctx.textBaseline = "middle";
			disp.ctx.font = "700 24px 'Montserrat', sans-serif";
			if(this.highlightDim.data=="Side Length 1"){
				let mid=new Vector(vec2);
				mid.subVec(vec3);
				mid.sclVec(0.5);
				mid.addVec(vec3);
				disp.ctx.strokeText(this.side1Val.data,(mid.x-disp.cam.pos.x)*disp.cam.zoom,(mid.y-disp.cam.pos.y)*disp.cam.zoom);
				disp.ctx.fillText(this.side1Val.data,(mid.x-disp.cam.pos.x)*disp.cam.zoom,(mid.y-disp.cam.pos.y)*disp.cam.zoom);
			}else if(this.highlightDim.data=="Side Length 2"){
				let mid=new Vector(vec1);
				mid.subVec(vec2);
				mid.sclVec(0.5);
				mid.addVec(vec2);
				disp.ctx.strokeText(this.side2Val.data,(mid.x-disp.cam.pos.x)*disp.cam.zoom,(mid.y-disp.cam.pos.y)*disp.cam.zoom);
				disp.ctx.fillText(this.side2Val.data,(mid.x-disp.cam.pos.x)*disp.cam.zoom,(mid.y-disp.cam.pos.y)*disp.cam.zoom);
			}else if(this.highlightDim.data=="Side Length 3"){
				let mid=new Vector(vec3);
				mid.subVec(vec1);
				mid.sclVec(0.5);
				mid.addVec(vec1);
				disp.ctx.strokeText(this.side3Val.data,(mid.x-disp.cam.pos.x)*disp.cam.zoom,(mid.y-disp.cam.pos.y)*disp.cam.zoom);
				disp.ctx.fillText(this.side3Val.data,(mid.x-disp.cam.pos.x)*disp.cam.zoom,(mid.y-disp.cam.pos.y)*disp.cam.zoom);
			}
		}else if(this.type.data=="Arbitrary"){
			disp.setStroke(theme.color.white);
			disp.setWeight(4);
			disp.noFill();
			disp.ctx.textAlign = 'center';
			disp.ctx.textBaseline = "middle";
			disp.ctx.font = "700 200px 'Montserrat', sans-serif";
			disp.ctx.strokeText("?",(0-disp.cam.pos.x)*disp.cam.zoom,(0-disp.cam.pos.y)*disp.cam.zoom);

			let avg=Math.sqrt(this.areaVal.data)/2;
			disp.start();
			disp.mt2(avg,avg);
			disp.lt2(avg,-avg);
			disp.lt2(-avg,-avg);
			disp.lt2(-avg,avg);
			disp.path();
		}
	}
	connectedCallback(){
		this.disp.connect();
		this.anim.start();
	}
}
defineElm(Calculator,scss`&{
	>.container{
		${theme.centerX}
		>div{
			max-width: 1400px;
		}
		border-bottom: 4px solid ${theme.color.greyStep(0)};
		border-top: 4px solid ${theme.color.greyStep(0)};
	}
	.controls{
		${theme.centerX}
		flex-direction:column;
		>p{
			border-bottom: 1px solid white;
		}
		>.shape{
			margin-top:40px;
			${theme.centerX}
			flex-wrap: wrap;
			>${ButtonClickable}{
				button{
					width: 250px;
				}
				margin: 20px 20px;
			}
		}
		>.dimensions{
			${theme.centerX}
			justify-content: space-around;
			flex-wrap: wrap;
			>${CalcField}{
				margin: 20px 20px;
			}
		}
		>${Switch}{
			position: relative;
			top: 27px;
		}
	}
	>.canvasContainer{
		background-color: ${theme.color.greyStep(-2)};
		height: 400px;
	}
	.results{
		padding-bottom: 25px;
		>p{
			text-align: center;
			${theme.font.primary}
			${theme.font.fontSizeStep(0)}
			font-weight: 800;

			margin-top: 25px;
		}
		>div{
			${theme.centerX}
			>p{
				flex-basis: 0;
				flex-grow: 1;
				margin: 0 5px;
				&.first{
					text-align: right;
				}
				>span{
					${theme.font.secondary}
					${theme.font.fontSizeStep(-1)}
					font-weight: 800;
					color: ${theme.color.greyStep(5)};
				}
			}
		}
	}
}`);

function round(val,precision){
	let scale=10**precision;
	return Math.round(val*scale)/scale;
}
