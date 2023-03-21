class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/ray-tracer">Github</a></p>
				${new ImageDisplay("img/raytrace.png")}
				<p>
					This is a simple ray tracer able to render lighting effects on simple environments. This was done mostly to give myself a better understanding of 3d rendering rather than a serious attempt to create a rendering engine.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p class="center">
					Below are a few examples from the program.
				</p>
				${new ImageDisplay("img/raytrace2.png")}
				${new ImageDisplay("img/raytrace3.png")}
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

let title=bind("Ray Tracer");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});