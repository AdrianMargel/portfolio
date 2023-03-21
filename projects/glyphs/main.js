class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/glyphs">Github</a></p>
				${new ImageDisplay("img/glyphs.png")}
				<p>
					This program generates random glyphs. These glyphs do not hold any meaning or form any kind of coherent language and are just meant to look nice.
				</p>
				<p>
					To generate these glyphs the program starts with a single starting point. It then randomly generates lines of different predetermined types off of that point. Everytime a new line is generated it is tested to see if that line falls within a certain boundry. If the line does not it will generate a new line until it finds one that does. Once a line is found that stays within the defined boundry it will add the point where that line ends to the list of possible starting points for new lines to be generated off of. By creating randomized spacing between the letters generated the program is able to create something which looks like an actual language!
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					This was inspired in part by this old <a href="https://www.reddit.com/r/proceduralgeneration/comments/5wzo7j/monthly_challenge_16_march_2017_procedural_runes/">reddit post</a> and in part because I wanted a system to create visually interesting gibberish to use with some of my other projects. Kind of like a glyph lorem ipsum.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					Below are a few examples of the system being used with my <a href="https://adrianmargel.ca/projects/alchemyCircles">alchemy circles</a>.
				</p>
				${new ImageDisplay("img/alchemyCircleGlyphs_4.png")}
				${new ImageDisplay("img/alchemyCircleGlyphs_5.png")}
				${new ImageDisplay("img/alchemyCircleGlyphs_6.png")}
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

let title=bind("Glyphs");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});