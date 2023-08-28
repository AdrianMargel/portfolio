
/*

	This file is kind of a mess, or at least the styles are.
	The CSS still isn't very elagent and many of the things I tried to midigate that are still very experimental.
	However the elements themselves I'm pretty happy with.

	A better reference to look at is the example.js file 

*/

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
	let colorTaint=(a,base,mod,modScl)=>{
		// a = [0,1]
	
		return addColors(base,mod,(1-a)*modScl);
	};
	let colorStep=(a,base,scale,mod,modScl)=>{
		// a = (-infinity,infinity)
	
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
		a*=scale;
		let col=colorScale(sigmoid(a),base);
		col=colorTaint(sigmoid(a),col,mod,modScl);
		return col
	};
	
	let greyStep=(a)=>{
		return colorStep(a,new Color("#eaecef"),5,new Color("#0062ed"),0.05);
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
		return "box-shadow: 0 0 "+genericStep(a,80,0,20)+"px #00000020;";
	}
	let dropShadowStep=(a,offsetY=0)=>{
		return "filter: drop-shadow(0 "+offsetY+"px "+genericStep(a,80,0,20)+"px #00000020);";
	}
	let primary=`font-family: 'Permanent Marker', cursive;`;
	let secondary=`font-family: 'Raleway', sans-serif;`;
	let detail=`font-family: 'Comfortaa', cursive;`;
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
			detail,
			fontSizeStep,
			standard:`
				font-weight: 400;
				${secondary}
				${fontSizeStep(0)}
			`,
			title:`
				${primary}
				${centerText}
				${fontSizeStep(3)}
			`
		},
		elementReset:`
			display: block;
		`,
		boxShadowStep,
		dropShadowStep,
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

//TODO: better list handling


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



// let a=html`<div>${html`<div>testA</div>`()}</div>`();
// let b=html`<div>${html`<div>testB</div>`()}</div>`();
// let sel=bind(null);
// sel.data=a;

// let body=html`
// test
// 	<div>${()=>sel}</div>
// 	<button onClick=${attr(act(()=>{
// 		sel.data=sel.data==a?b:a;
// 	}))}>change</button>
// `(sel).data;
// addElm(body,document.body);
// body.disolve();




// let testList=bind([10,20,"test"]);
// for(let i=0;i<500;i++){
// 	testList.push("test"+i);
// }
// testList.sub(()=>console.log("change"));

// let body=html`
// 	<h1>Repeater</h1>
// 	<button
// 		onClick=${attr(act(()=>{
// 			let randomId=(Math.random()+1).toString(36).substring(7);
// 			testList.lock();
// 			testList.unshift("Item - "+randomId);
// 			testList.unlock();
// 		}))}
// 	>
// 		Add New Item
// 	</button>

// 	${()=>testList.map(
// 		(n,i)=>
// 		html`
// 			<div>
// 				Index: ${i} Value: ${new Item(n)} - 
// 					<button
// 					onClick=${attr(act(()=>{
// 						testList.lock();
// 						testList.splice(i,1);
// 						testList.unlock();
// 					}))}
// 				>
// 					Remove Item
// 				</button>
// 			</div>
// 		`(n)
// 	)}
// `(testList).data;
// addElm(body,document.body);
// body.disolve();



