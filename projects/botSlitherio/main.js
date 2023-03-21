class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				${new ImageDisplay("img/slitherAI1.png")}
				<p>
					This is a simplified version of the online game <a href="http://slither.io/">slither.io</a>. This program, however, has AI that compete with one another rather than human players. Each bot is powered on a simple neural net allowing learning to take place overtime. The neural networks are trained using a basic evolutionary algorithm.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					I created this in grade 11 as a way to familiarize myself with the basics of neural networks. I picked slitherio as the game for its simplicity and because I had previously made a simple version of slitherio in grade 10 using hard coded AI. This meant I was already familiar with programming the game, but I was also curious how much my programming skills had improved in a year.
				</p>
				<p>
					Ultimately I ended up showing this off at my highschool's AP night - an event where the school highlights the most impressive accomplishments of its students to encourage parents to enroll their kids into the Advanced Placement(AP) program. Ironically the live display for the program was set up right beside the main stage for the speakers and so after the event was finished I had quite a few bored parents who jokingly told me that watching my little snake program was the only thing keeping them awake throughout the event.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					The bots were able to demonstrate some very basic learning but due to the small number of neurons for each bot this learning ability was quite limited.
				</p>
			`,"lg")}
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

let title=bind("Slitherio AI");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});