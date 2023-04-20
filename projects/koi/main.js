class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/cimexis-koi">Github</a></p>
				<p class="center bold projectLink"><a href="demo" rel="nofollow">Demo</a></p>
				${new ImageDisplay("img/fishtank.png")}
				<p>
					This is a simulation of koi fish swimming. I created this to be used as a live website background. Unfortunately the mobile performance is less than what I was hoping for. As a result I ended up shelving the project. I had plans to create a whole ecosystem of fish types with different appearances and behavior. I even did a bit of experimentation with larger fish types which led to some interesting results.</p>
				${new ImageDisplay("img/fish9.png")}
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

let title=bind("Koi");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});