class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="/demo/mandelbulb/" rel="nofollow">Demo</a></p>
				${new ImageDisplay("img/mandelbulb.png")}
				<p>
					This program allows realtime rendering of the 3D Mandelbulb fractal. This is achieved by ray-marching a Signed Distance Field(SDF) of the Mandelbulb fractal. 
					The inspiration for this project came from the incredible work of <a href="https://iquilezles.org/articles/mandelbulb/">Inigo Quilez</a>.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				${new ImageDisplay("img/mandelbulb2.png")}
				${new ImageDisplay("img/mandelbulb3.png")}
				${new ImageDisplay("img/mandelbulb4.png")}
				${new ImageDisplay("img/mandelbulb5.png")}
			`,"lg")}
			<p class="center">${new ButtonLink("back to top",()=>scrollToTop())}</p>
		`);
	}
}
defineElm(ProjectPage,scss`&{
	width: 100%;
	>.gap{
		height: 40px;
	}
	p.center{
		${theme.centerText}
	}
	.bold{
		font-weight: 700;
	}
	.projectLink{
		a{
			padding: 5px 10px;
			background-color: ${theme.color.greyStep(-2)};
			border-radius: 50px;
		}
	}
}`);

let title=bind("Mandelbulb");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});