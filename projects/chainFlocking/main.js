class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/chain-flocking">Github</a></p>
				${new ImageDisplay("img/chainflock1.png")}
				<p>
					This is just a small project to play around with different kinds of emergent behavior that can arize from flocking algorithms. The chain flocking algorithm I came up with is a modified version of the <a href="https://en.wikipedia.org/wiki/Boids">boids algorithm</a> but where each boid is attracted to a single other boid in the flock. This leads to "chains" of boids forming each one following in a line after the one in front of it. Admittedly this doesn't have many practical uses and mostly just exists as an interesting experiment.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					This was heavily inspired by the <a href="https://en.wikipedia.org/wiki/Boids">boids algorithm</a>. I had already made a few different variations of the boids algorithm in the past and so I wanted to try something new to see how difficult it would be to create cohesive flocking behaviour from simple rules. This project exists almost completely just as a test to allow me to get a better feel for flocking algorithms.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					Below are a few examples of the flocking algorithm running.
				</p>
				${new ImageDisplay("img/chainflock2.png")}
				${new ImageDisplay("img/chainflock3.png")}
				${new ImageDisplay("img/chainflock4.png")}
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

let title=bind("Chain Flocking");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});