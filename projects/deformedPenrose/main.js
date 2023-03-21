class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				${new ImageDisplay("img/gradientpenrose16.png")}
				<p>
					This program is able to generate various aperiodic tiles (such as Penrose tiles and Penrose sun tiles) and apply arbitrary deformations to these tiles. These arbitrary deformations allow anything from simple gradients as shown above to animated movement as can be seen <a href="https://www.reddit.com/r/proceduralgeneration/comments/eexir6/procedurally_generated_penrose_tiles_with/">here.</a>
				</p>
				<p>
					The problem can be broken up into 3 separate components:
				</p>
				<ol>
					<li>Generating Penrose tiles - this is done by recursively subdividing shapes. A really simple explanation for this can be found <a href="https://preshing.com/20110831/penrose-tiling-explained/">here</a>.</li>
					<li>Identifying the different types of nodes - this is done by representing each node's neighborhood as a set of angles and shape types (blue or red). After this it is possible to search all nodes where a certain criteria is met. When a match is found the rotation/offset is subtracted off to "normalize" the node's neighborhood for the final step.</li>
					<li>Apply distortions - once the type of node has been identified and the neighborhood normalized then deformations can be applied to these nodes. These deformations are arbitrarily hard coded depending on the desired effect.</li>
				</ol>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					This was inspired by the work of Richard Welberry on <a href="https://www.iucr.org/news/newsletter/volume-27/number-3/deformed-penrose-tiling-and-quasicrystals">crystal deformations and quasicrystals</a>. Unfortunately the methods he describes using were difficult for me to understand and replicate. Terms like "rhombicicosahedron internal space projection window" or "5D hypercubic space" sound more like science fiction than real scientific terms. As a result I was forced to come up with my own methods, since I was interested in replicating the aesthetics of these crystal deformations and not accurately describing their properties this was not too difficult.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					Below are a few examples of different deformations.
				</p>
				<h3>Penrose Tiles</h3>
				${new ImageDisplay("img/gradientpenrose10.png")}
				${new ImageDisplay("img/gradientpenrose15.png")}
				<h3>Penrose Sun Tiles</h3>
				${new ImageDisplay("img/gradientpenrose14_sun.png")}
				<h3>Penrose Sun to Penrose Tiles</h3>
				${new ImageDisplay("img/gradientpenrosetosun.png")}
				<h3>Arbitrary Deformations</h3>
				${new ImageDisplay("img/gradientpenrose12.png")}
				${new ImageDisplay("img/gradientpenrose13.png")}
			`,"lg")}
			<p class="center">${new ButtonLink("back to top",()=>scrollToTop())}</p>
		`);
	}
}
defineElm(ProjectPage,scss`&{
	width: 100%;
	ol{
		list-style-type: decimal;
		padding-left:40px;
		li{
			margin: 20px 0;
			${theme.font.sizeStep(-.5)};
		}
	}
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

let title=bind("Deformed Penrose");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});