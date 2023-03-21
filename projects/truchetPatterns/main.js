class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				${new ImageDisplay("img/truchetpattern_wide.png")}
				<p>
					This program procedurally generates <a href="https://en.wikipedia.org/wiki/Truchet_tiles">Truchet Patterns</a>. This is done by creating a bunch of tiles at different sizes and then rendering each tile as one of a select number of possible Truchet tile types. Each of these tile types interlocks seamlessly with every other type of tile regardless of size allowing for a continuous seamless pattern. To get tiles of different sizes an initial tile grid is generated and then tiles are randomly selected out of this grid to be split into 4 smaller tiles (similar to a quadtree).
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
				This was heavily inspired by Christopher Carlson's <a href="https://christophercarlson.com/portfolio/multi-scale-truchet-patterns/">Multi-Scale Truchet Patterns</a>.</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					I also tried out some interesting animation effects like the one shown below.
				</p>
				${new VideoDisplay("video/truchet.mp4")}
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

let title=bind("Truchet Patterns");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});