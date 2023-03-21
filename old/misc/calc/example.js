
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

class PickerPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Explanation</h2>
				<p class="center">This is a sample website to showcase development with custom elements.</p>
			`,"lg",false,true)}
			${new Surface(html`
				<h2>Examples</h2>
			`,"sm",true)}
		`);
	}
}
defineElm(PickerPage,scss`&{
	width: 100%;
	> .gap{
		height: 40px;
	}
	p.center{
		text-align: center;
	}
}`);

class StepPage extends CustomElm{
	constructor(){
		super();
		let base=bind("#36363F");
		let mod=bind("#000000");
		let scale=bind(1);
		let modScale=bind(1);
		this.define(html`
			${new Surface(html`
				<div>
					${new Input(base)}
					${new InputNumber(scale)}
				</div>
				<div>
					${new Input(mod)}
					${new InputNumber(modScale)}
				</div>
				${()=>{
					let bCol=new Color(base.data);
					let mCol=new Color(mod.data);
					let list=[];
					for(let i=-5;i<=5;i++){
						list.push(html`<div style="background-color:${colorStep(i,bCol,scale.data,mCol,modScale.data)}">${i}</div>`);
					}
					return list;
				}}
			`(base,scale,mod,modScale),"lg",false,true)}
		`);
	}
}
defineElm(StepPage,scss`&{
	width: 100%;
	> .gap{
		height: 40px;
	}
	p.center{
		text-align: center;
	}
}`);

class Color3DPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Explanation</h2>
				<p class="center">This is a sample website to showcase development with custom elements.</p>
			`,"lg",false,true)}
			${new Surface(html`
				<h2>Examples</h2>
			`,"sm",true)}
		`);
	}
}
defineElm(Color3DPage,scss`&{
	width: 100%;
	> .gap{
		height: 40px;
	}
	p.center{
		text-align: center;
	}
}`);

class AboutPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
		<div class="gap"></div>
		${new Surface(html`
			<h2>About</h2>
			<p class="center">This is a sample website to showcase development with custom elements.</p>
		`,"sm",false)}
	`);
	}
}
defineElm(AboutPage,scss`&{
	width: 100%;
	> .gap{
		height: 40px;
	}
	p.center{
		text-align: center;
	}

}`);

// Create global page styles
createStyles(scss`&{
	background-color: ${theme.color.greyStep(-1)};
}`());

// Create data
let title=bind("Elements");
let pages=bind([
	{
		id:"colorpick",
		text:"Color Picker",
		selected:true,
		content: new PickerPage()
	},
	{
		id:"colorstep",
		text:"Color Step",
		selected:false,
		content: new StepPage()
	},
	{
		id:"color",
		text:"3D Colors",
		selected:false,
		content: new Color3DPage()
	},
	{
		id:"about",
		text:"About",
		selected:false,
		content: new AboutPage()
	},
]);

// Set up paging
let selectedPage=bind(null);
selectedPage.data=getSelectedPage();
function getSelectedPage(){
	return pages.find(a=>a.selected.data);
}
function setPage(id){
	pages.forEach(a=>a.selected.data=a.id.data==id);
	selectedPage.data=getSelectedPage();
}

// Set up scroll watcher
let scrollPosition=bind(0);
document.addEventListener('scroll', ()=>{
	scrollPosition.data=window.scrollY;
});

// Create main elements
let calcElm=new Calculator();

// Populate page html
let body=html`
	${calcElm}
`().data;
addElm(body,document.body);
body.disolve();

