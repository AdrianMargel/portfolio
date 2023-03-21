class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/3d-solar-system">Github</a></p>
				${new ImageDisplay("img/solar9.png")}
				<p>
					This program simulates the formation of a simple 3D solar system. When the simulation starts there are a huge number of tiny little micro-planets, overtime these micro-planets collide and merge with each other until there are only a few large planets left orbiting the sun.
				</p>
				<p>
					The program is able to simulate gravitational attraction and simple planetary collisions by merging the two planets into a single mass. This means that the program is general and can be adapted to run a large range of scenarios beyond just solar system formation. Possible examples include binary star systems, black holes, collisions between solar systems, etc.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					This was inspired by a demo project in my highschool computer science class. The teacher was showing a demo on how to create a simple solar system using rotations to the class. I had already mastered the skills he planned on teaching through that demo on my own and so found myself extremely bored. I decided to keep myself entertained that I would make a more advanced solar system simulation.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					As stated above, this was inspired by a simple demo my computer science teacher did with the class in highschool. The example the teacher was doing just had a simple method that would rotate planets around a central point - this was the first thing to go. I quickly scrapped the simple rotation method for an equation able to calculate gravitational attraction. After this I decided that the two dimensions we were using in class weren't enough, so I added a new dimension, the third dimension! This was all fine but planets would still just phase through each other when they collided. So I gave planets the ability to collide with each other merging into larger planets - all while conserving mass and energy of course. At this point I increased the number of planets from just a few planets to a few hundred. I then watched as these hundreds of small planets collide and merge with one another until only a small handful of large planets remained orbiting the sun.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					Below are examples of the simulated formation of a solar system. Keep in mind that although the sun looks small it has a much higher density than the planets do.
				</p>
				<h3>Animation</h3>
				${new VideoDisplay("video/solar.mp4")}
				<h3>Images</h3>
				${new ImageDisplay("img/solar1.png")}
				${new ImageDisplay("img/solar3.png")}
				${new ImageDisplay("img/solar6.png")}
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

let title=bind("Solar System");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});