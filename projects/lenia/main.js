class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/flow-lenia">Github</a></p>
				<p class="center bold projectLink"><a href="/demo/lenia/" rel="nofollow">Flow Lenia Demo</a></p>
				<p class="center bold projectLink"><a href="/demo/lenia-demo/" rel="nofollow">Fluid Lenia Demo</a></p>
				${new ImageDisplay("img/new-lenia-11-b2.png")}
				<p>
					This is an advanced artificial life simulation I built which runs in realtime on the GPU.
				</p>
				<p>
					Cellular automata like Conway's Game of Life are meant to emulate the behavior of simple multicellular life. Conway's Game of Life uses rules that operate on small local neighborhoods with discrete states. Expanding the neighborhood and making the cell states continuous results in Smooth Life cellular automata. Making the kernal more advanced and applying an arbitrary growth function results in Lenia cellular automata. Taking the results of Lenia and applying that to generate a vector flow field that pushes material around results in Flow Lenia. Taking Flow Lenia and combining it with a fluid simulator results in a new automaton I've chosen to call Fluid Lenia. Each species is represented with a different color.
				</p>
				<p>
					I also added the ability for the simulation to adhere to the brightness of a preset greyscale image. I was asked to build this feature by Samuel Bianchini who later used it in an <a href="https://dispotheque.org/en/taking-lifes">exhibition</a> at <a href="https://jeudepaume.org/mediateque/cartels-des-oeuvres/">Jeu de Paume</a>.
				</p>
				${new ImageDisplay("img/butterfly-rainbow3.png")}
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					I came across Bert Chan's work with <a href="https://chakazul.github.io/lenia.html">Lenia</a>. I've been interested in artificial life simulations for a long time and so I was instantly impressed with his results. I did some more digging and discovered <a href="https://sites.google.com/view/flowlenia/videos">Flow Lenia</a> and the work of the <a href="https://flowers.inria.fr/">Flowers Lab</a>. Reading their paper I was a little disappointed that the exploration of multiple coexisting genomes within a single simulation (different species) would have to wait for a future paper. Not wanting to wait, I replicated the results of their paper over a weekend and then reached out to the authors. After some discussions I was able to implement the ability to simulate different species and watch their evolutions. I also implemented additional improvements to the base algorithm to make it more versatile and physically accurate.
				</p>
				<p>
					The idea of simulating multiple species within the same simulation was not new to me as I had already experimented with <a href="/projects/evoCells/">something similar</a> back in highschool.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					There's actually too much to cover here if I went into the implementation, so instead let's just skip to the results. If you are interested in how it works I recommend checking out the Flow Lenia paper or this project's Github link above. 
				</p>
				<h3>Flow Lenia</h3>
				${new ImageDisplay("img/lenia44.png")}
				${new ImageDisplay("img/lenia54-2-channel.png")}
				${new ImageDisplay("img/lenia-goo2.png")}
				${new ImageDisplay("img/lenia9-glave.png")}
				<h3>Fluid Lenia</h3>
				${new ImageDisplay("img/lenia-fluid-14b.png")}
				${new ImageDisplay("img/lenia-fluid-25.png")}
				${new ImageDisplay("img/lenia-fluid-41.png")}
				${new ImageDisplay("img/lenia-fluid-48.png")}
				${new ImageDisplay("img/lenia-fluid-50.png")}
				${new ImageDisplay("img/lenia-fluid-51-full-interferance.png")}
				<h3>Multi-Species Fluid Lenia</h3>
				${new ImageDisplay("img/new-lenia-15.png")}
				${new ImageDisplay("img/new-lenia-18.png")}
				${new ImageDisplay("img/new-lenia-32.png")}
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

let title=bind("Fluid Lenia");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});