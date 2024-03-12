class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/evolving-ant-farm">Github</a></p>
				${new ImageDisplay("img/antfarm11.png")}
				<p>
					This program is based off of <a href="https://en.wikipedia.org/wiki/Langton%27s_ant">Langton's ant</a> but with a few important differences. Firstly rather than a single ant there are many ants all existing along side each other. Secondly each ant has a genome which determines its behaviour which is able to evolve. Thirdly each ant has a limited lifespan and the ability to produce offspring. This causes the emergence of species which compete with one another for space and resources in a kind of controlled ant farm.
				</p>
				<p>
					This was created in order to explore the effects evolution would have on a complex system.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					This was primarily inspired by a <a href="https://adrianmargel.ca/projects/evoCells">previous project</a> I did involving a variation of <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">Conway's Game of Life</a> with the ability for cells to evolve their own rule set. I was surprised at the complexity that emerged from such a simple system and especially fascinated that it would almost always converge on an ecosystem built on a symbiotic relationship between two different species. I decided to try to apply the same concept to Langton's ant as I was interested to see if it would exhibit similar behaviours to the cellular automata.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Animation</h2>
				${new VideoDisplay("video/antfarm-small.mp4")}
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Discoveries</h2>
				<p>
					Through tweaking the rules of the simulation and trying different things I was able to make a number of interesting discoveries, many which may have applications beyond just this project.
				</p>
				<h3>Direct Competition</h3>
				<p>
					In early versions of the project I had a constant number of organisms and had it set up that when one organism died another random organism would give birth. This would always lead to a single species taking over completely with very little genetic diversity. The reason was that by having the reproduction set up in this way it put all organisms in a global competition with each other. As all organisms were now forced to compete directly with all other organisms along a single dimension - longest lifespan - it caused the system to always converge to a single species.
				</p>
				<p>
					It turns out that the only way to have a diverse ecosystem without convergence on a single species is to have the rules allow for species to compete along different dimensions, usually through use of different strategies. As long as species are locked into direct competition with each other one species will always come out on top.
				</p>
				<h3>Mutation Rates</h3>
				<p>
					Determining the best mutation rates for an evolutionary algorithm usually just comes down to trying different things and making a best guess. At least this is the way it is most commonly done. However I have discovered that by making the mutation rates themselves a mutatable field it almost completely removes this problem. Species which mutate mutation rates that are optimal for effective evolution are able to evolve faster and have more successful offspring. Thus species will overtime evolve to have mutation rates that are best suited to the current environment. This also allows for species to change their mutation rates when the environment changes as well, which would normally not be possible.
				</p>
				<h3>Resource Scarcity</h3>
				<p>
					It is important to balance out the amount of resources so that survival is not made too easy or too hard. If resources are too scarce then obviously all the organisms will die out. What is more surprising though is that if resources are too abundant then it can still lead to an extinction. When there are too many resources there will be a massive spike in the population. Because resources are so common natural selection will be too weak to ensure evolution is creating useful mutations. As a result the population will eventually reach a point where it can no longer expand and suddenly resources will start to become scarce. At this point all the organisms that have not needed to evolve to deal with scarcity will die off leading to a mass extinction. Often times the mass extinction itself will have an effect on the environment which can lead to a feedback loop killing even more organisms. In many cases this will kill off 100% of all organisms. Thus it is important the difficulty of survival / resources available are properly balanced.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					Below are a few examples of the structures generated by the ant farm at different sizes. The color for each pixel is determined by the species of the ant which last modified the tile. As species evolve their color randomly shifts, this allows a visual way to approximate the genetic diversity between species.
				</p>
				<h3>Large</h3>
				${new ImageDisplay("img/antfarm20.png")}
				${new ImageDisplay("img/antfarm26.png")}
				${new ImageDisplay("img/antfarm47.png")}
				<h3>Medium</h3>
				${new ImageDisplay("img/antfarm_70.png")}
				${new ImageDisplay("img/antfarm_57.png")}
				${new ImageDisplay("img/antfarm_58.png")}
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

let title=bind("Ant Farm");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});