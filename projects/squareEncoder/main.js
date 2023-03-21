class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/square-encoder">Github</a></p>
				${new ImageDisplay("img/crystal_encoding.png")}
				<p>
					This program is able to take any shape defined on a grid and describe it in terms of squares of various sizes. This creates interesting patterns resembling greeble while maintaining the original filled shape.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					This was inspired by the io game "blockor.io" which sadly no longer exists. In the game you play as a block and try to eat smaller blocks to grow. As you grow smaller blocks merge together into larger blocks creating an interesting greeble-like effect. The game was glitchy and had some problems but I liked the concept so I decided to make my own version of it that worked properly.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p class="center">
					Below are a few examples from the program.
				</p>
				<h3>Animation</h3>
				${new VideoDisplay("video/square.mp4")}
				<h3>Images</h3>
				${new ImageDisplay("img/squares1.png")}
				${new ImageDisplay("img/squares2.png")}
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

let title=bind("Square Encoder");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});