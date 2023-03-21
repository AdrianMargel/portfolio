class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/jelly-engine">Github</a></p>
				${new ImageDisplay("img/jelly.png")}
				<p>
					This program is a simple physics engine able to approximate soft body physics in real time on a single CPU thread. It uses a sping/mass model to approximate soft body physics in a way that is visually plausible. Basically this means that each node in the shape is connected to each of its neighbors with a spring. Self collisions (where the shape collides with itself) are handled by shape memory. If a node detects that the springs connecting it to its neighbors are not in the correct order it will apply a force to try to correct this. This means that the shape can still collide with itself but because of this specialized shape memory will almost always return to its original form.
				</p>
				<p>
					I had also tried to put a system in place to handle global self-collisions but this ended up being too expensive to implement and would mean the system would no longer run in real time. This lead to a bit of a rabbit hole where I discovered that doing realistic physics is actually an extremely complicated problem. To keep things simple I opted for a simulation able to do physics that look relatively realistic rather than physics which are 100% realistic.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					I got the idea for this project from the game <a href="https://en.wikipedia.org/wiki/World_of_Goo">World of Goo</a> which is a puzzle game based on creating bouncy jello-like structures to reach a goal.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					The program is able to simulate jello-like objects. The simulation admittedly is not completely realistic but it produces visually plausible results. The simulation is also stable allowing for shapes to recover from having extreme distortions applied to them. Below are a few images from the program running.
				</p>
				${new ImageDisplay("img/jelly1.png")}
				${new ImageDisplay("img/jelly2.png")}
				${new ImageDisplay("img/jelly3.png")}
				${new ImageDisplay("img/jelly4.png")}
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

let title=bind("Jelly Engine");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});