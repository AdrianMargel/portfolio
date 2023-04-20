class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/2d-fluid">Github</a></p>
				<p class="center bold projectLink"><a href="demo" rel="nofollow">Demo</a></p>
				${new ImageDisplay("img/image2.png")}
				<p>
					This is a realtime 2D fluid simulation running on the CPU. The simulation is stable even under high pressure. This project was inspired largely by Google's <a href="https://google.github.io/liquidfun/">Liquid Fun</a>.
				</p>
				${new VideoDisplay("video/2d-fluid.mp4")}
			`,"lg",false,true)}
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

let title=bind("2D Fluid Simulator");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});