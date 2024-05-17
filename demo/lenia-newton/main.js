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
}`());

let glCanvasElm=newElm("canvas");
let gl=glCanvasElm.getContext("webgl2",{
	premultipliedAlpha: true
});
gl.getExtension("EXT_color_buffer_float");
gl.getExtension("EXT_float_blend");

let shaderManager=new ShaderManager();
let lenia=new Lenia();

let frameAnim=animate(()=>{
	lenia.run();
},1,true).start();

// Populate page html
let body=html`
	${addClass("canvas",glCanvasElm)}
`();
addElm(body,document.body);
body.disolve();

