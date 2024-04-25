// Create global page styles
createStyles(scss`&{
	background-color: ${theme.color.greyStep(-1)};
	overflow:hidden;
	canvas{
		position:absolute;
		width:100vw;
		height:100vh;
	}
	.canvas{
		opacity:1;
		image-rendering: pixelated;
	}
	p{
		${theme.center}
	}
}`());

let glCanvasElm=newElm("canvas");
let gl=glCanvasElm.getContext("webgl2",{
	premultipliedAlpha: true
});
gl.getExtension("EXT_color_buffer_float");
gl.getExtension("EXT_float_blend");

let inLength=100000;
let randArr=Array(inLength).fill().map(x=>flr(rand()*inLength));
let sorter=new Sorter(randArr);

console.log(randArr);
let t=new Date().getTime();
let sortArr=sorter.run();
console.log(sortArr);
console.log(new Date().getTime()-t+" ms");

// Populate page html
let body=html`
	<p>Check the browser console (F12). You can refresh the page to run another test sort.</p>
	<p>Note that the output array may be a slightly different size than the input due to it being forced onto a rectangular texture.</p>
	${addClass("canvas",glCanvasElm)}
`();
addElm(body,document.body);
body.disolve();

