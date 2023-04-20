class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				${new ImageDisplay("img/wave-lighting3.png")}
				<p>
					This program simulates the way 2D pressure waves behave. This was largely inspired by <a href="http://www.falstad.com/ripple/">Paul Falstad's project</a> by the same name.
				</p>
				<p>
					The purpose for this project was to gain a better understanding of how pressure waves work and to explore if they could be used for light simulation. I discovered that simulating light as a wave was technically feasible but would not result in hard shadows unless run at a super high level of detail. The required level of detail would be too computationally expensive to be viable. I also discovered that waves are much more prone to creating interference patterns than I had expected.
				</p>
				<h3>Animation</h3>
				${new VideoDisplay("video/light.mp4")}
				${new VideoDisplay("video/light2.mp4")}
			`,"lg",false,true)}
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

let title=bind("Ripple Tank");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});