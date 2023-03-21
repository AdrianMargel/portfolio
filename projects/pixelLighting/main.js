class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/pixel-renderer">Github</a></p>
				${new ImageDisplay("img/pixelRender.png")}
				<p>
					This program is able to render lighting effects on a 3d surface including shadows. It works by running a simple ray tracing algorithm to calculate the light from each light source. The program is able to handle multiple light sources. It can also support color, both colored light sources and colored pixels on the surface being rendered.
				</p>
				<p>
					The program runs on the CPU and thus is optimized to do as few calculations as possible. This means that the program is extremely fast when dealing with few light sources and or dim light sources that do not require many lighting calculations. In fact the program for the most part is able to do lighting in real time. However when trying to calculate too many light sources, especially bright ones, the program will slow down. This is only a problem in the case of using this for real time lighting, if used for rendering pixel art there is no problem.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					This project was inspired by looking at the development process behind the game <a href="http://rainworldgame.com/">Rain World</a>. I discovered that much of Rain World's amazing art is done by a simple engine which uses ray tracing to render the lighting. This lead me to create this project as a simplified version of Rain World's rendering engine.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					Below are a few examples of the program rendering lighting for different test cases.
				</p>
				<h3>Animation</h3>
				${new VideoDisplay("video/vid.mp4")}
				<h3>Images</h3>
				${new ImageDisplay("img/pixelRender2.png")}
				${new ImageDisplay("img/pixelRender3.png")}
				${new ImageDisplay("img/pixelRender4.png")}
				${new ImageDisplay("img/pixelRender5.png")}
				${new ImageDisplay("img/pixelRender6.png")}
				${new ImageDisplay("img/pixelRender7.png")}
				${new ImageDisplay("img/pixelRender8.png")}
				${new ImageDisplay("img/pixelRender9.png")}
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

let title=bind("Pixel Renderer");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});