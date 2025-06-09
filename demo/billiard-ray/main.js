// Create global page styles
createStyles(scss`&{
	background-color: black;
	overflow:hidden;
	canvas{
		position:absolute;
		width:100vw;
		height:100vh;
	}
}`());

let canvasElm=newElm("canvas");

// Populate page html
let body=html`
	${addClass("canvas",canvasElm)}
`();
addElm(body,document.body);
body.disolve();

let display=new CanvasDisplay(canvasElm);
display.view=new Cam([-1,-1],100);
let control=new Control();
control.connect(canvasElm);

let frameAnim=animate((t)=>{
	display.view.zoom+=control.mouseWheelDelta()*10;
	display.clear();
	
	triangle=new Triangle(display.transformInv(control.mousePos()));

	let t1=abs((t*.5)%2-1);
	let t2=abs((t*.1)%2-1);
	triangle.drawRay(t1,(t2-.5)*PI,display,control);
	
	triangle.drawTri(display,control);
	
	control.resetDelta();
},1,true).start();
