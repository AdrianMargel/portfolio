class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/evolving-cells">Github</a></p>
				${new ImageDisplay("img/evocells_s3.png")}
				<p>
					This program simulates a <a href="https://en.wikipedia.org/wiki/Life-like_cellular_automaton">life-like</a> cellular automaton where each cell in the simulation has its own rule set based on a genetic code. This allows different species to evolve and compete with each other for the available space. The ecosystem goes through different stages as different species evolve until it finally reaches a stable state. I find it extremely interesting that the ecosystem itself evolves going through different "meta" states. This is of course because the evolution of new species effects the environment thus allowing for new counter-strategies to evolve.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					This was inspired by classic cellular automata. When I did this project I had already played around with <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">Conway's Game of Life</a> and a few variations of it. Cellular automata can be used to approximate <a href="https://en.wikipedia.org/wiki/Artificial_life">artificial life</a>. However cellular automata are classically bound to follow a single set of rules that are applied to all cells. I was curious what would happen if you treated each cell as its own organism and had the rule set determined by a genetic algorithm. Thus this project was born.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					Below are screenshots of the developement / evolution of an ecosystem.
				</p>
				${new ImageDisplay("img/evocells_s1.png")}
				${new ImageDisplay("img/evocells_s2.png")}
				${new ImageDisplay("img/evocells_s3.png")}
				${new ImageDisplay("img/evocells_s4.png")}
				${new ImageDisplay("img/evocells_s5.png")}
				${new ImageDisplay("img/evocells_s6.png")}
				${new ImageDisplay("img/evocells_s7.png")}
				${new ImageDisplay("img/evocells_s8.png")}
				${new ImageDisplay("img/evocells_s9.png")}
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

let title=bind("Evolving Cells");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});