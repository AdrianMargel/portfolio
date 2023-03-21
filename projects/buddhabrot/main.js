class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				${new ImageDisplay("img/buddhabrot_4.png")}
				<p>
					This program is able to render the <a href="https://en.wikipedia.org/wiki/Buddhabrot">Buddhabrot</a> as well as the <a href="https://en.wikipedia.org/wiki/Mandelbrot_set">Mandelbrot</a> and <a href="https://en.wikipedia.org/wiki/Julia_set">Julia set</a>. By using my own code to render these fractals I am able to better customize the way they are rendered. I also can render new types of fractals by making arbitrary changes to the equations / code used to render the fractal.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					A friend of mine sent me a small piece of code he wrote that was able to render a basic Mandelbrot. I had wanted to play around with rendering fractals for a long time and now had a good place to start. I began to build off of the code he sent me rewriting large parts of it to allow it to be able to render more than just the Mandelbrot. I later came across an interesting post by the user cupe <a href="http://erleuchtet.org/2010/07/ridiculously-large-buddhabrot.html">here</a> which described some interesting variations to the Buddhabrot which I drew inspiration from.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					Below are a few of the more interesting renders I created with the program.
				</p>
				<h3>Mandelbrot</h3>
				${new ImageDisplay("img/buddhabrot_3.png")}
				<h3>Buddhabrot</h3>
				${new ImageDisplay("img/buddhabrot_10.png")}
				${new ImageDisplay("img/buddhabrot_8.png")}
				${new ImageDisplay("img/buddhabrot_12.png")}
				<h3>Anti Buddhabrot</h3>
				${new ImageDisplay("img/buddhabrot.png")}
				<h3>Other</h3>
				${new ImageDisplay("img/buddhabrot_11.png")}
				${new ImageDisplay("img/buddhabrot_5.png")}
				${new ImageDisplay("img/buddhabrot_6.png")}
				${new ImageDisplay("img/buddhabrot_7.png")}
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

let title=bind("Buddhabrot");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});