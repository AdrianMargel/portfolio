class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/radiance-cascades">Github</a></p>
				<p class="center bold projectLink"><a href="/demo/nested-radiance-cascades-fast/" rel="nofollow">Demo (fast)</a></p>
				<p class="center bold projectLink"><a href="/demo/nested-radiance-cascades-accurate/" rel="nofollow">Demo (accurate)</a></p>
				${new ImageDisplay("img/radiance-cascade-nested-19.png")}
				<p>
					TODO: this page is incomplete. Please check back later.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					TODO: this page is incomplete. Please check back later.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Implementation</h2>
				${new ImageDisplay("img/radiance-glitch37.png")}
			`,"lg")}
			<div class="gap"></div>
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

let title=bind("Holographic Radiance Cascades");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});