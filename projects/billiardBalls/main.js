class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="/demo/billiards/" rel="nofollow">GPU Fractal Demo</a></p>
				<p class="center bold projectLink"><a href="/demo/billiard-ray/" rel="nofollow">CPU Diagram Demo</a></p>
				${addClass("small",new ImageDisplay("img/triangle-bounce-12.png"))}
				<p>
					This program visualizes the Billiard Ball math problem as a fractal, demonstrating the inherently chaotic nature of the problem in a way that can be easily seen. This is closely related to other similar fractals and chaotic systems such as double pendulums or the 3-body problem.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					A few friends of mine were doing a summer internship involving an unsolved math problem, <a href="https://gwtokarsky.github.io/">The Great Periodic Path Hunt</a>. The problem looked interesting to me so I decided to write up some GPU shaders to visualize the structure of the problem.
				</p>
				<p>
					To briefly summarize what the problem is: Imagine a triangle shaped billiard table. Now imagine rolling a ball on that table, allowing it to follow a straight path bouncing each time it hits a wall. The question is for any shape of triangle is there a path where the ball will eventually return back to where it started and repeat the same path again (imagining that the ball travels infinitely without any friction and perfectly elastic bounces).
				</p>
				<p>
					I suspected the problem was chaotic by nature due to the infinite bouncing, which is similar to the kind of recursion present in Mandelbrot and Collatz Conjecture. And so I was curious to explore the problem space visually and better understand it. It turned out that like many other chaotic systems the visualisation of the problem yields a complex and beautiful fractal.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Implementation</h2>
				<p>
					To analyze this problem we start by considering the space of all possible starting conditions from which a path could be generated. We can quickly reduce the dimensionality down to 4 dimensions by realizing first that the scale and rotation of the triangle don't affect whether a path is periodic. Thus all triangles can be uniquely described with 2 variables. Secondly when the ball is bouncing around we know that it will eventually come into contact with all 3 walls. Once it comes into contact with a wall then we can continue calculating the path forward or backwards from that point without any reason to care about the initial 2D point from which the path originated. This means that the only information we really need when considering a path is a starting position on one of the lines (as a 1D scalar) and the angle of the bounce. So we get 2 more variables to describe the path, giving us a total of 4 dimensions to explore.
				</p>
				<p>
					Now that we know the dimensionality of the problem we can start thinking about ways to calculate solutions to these paths. One way is to look at the problem from the perspective of the ball. From the ball's perspective when it reflects off a wall it is equivalent to entering into a new reflected triangle and continuing on the same straight line. From this perspective the ball never deviates from a straight line path:
				</p>
				${addClass("small",new ImageDisplay("img/triangle-bounce-line-1.png"))}
				<p>
					Thinking about the problem in this way allows us to think of the ball's path in terms of ray-tracing a straight line through an infinite space of reflected triangles. Now we can make use of existing ray-tracing techniques to very efficiently trace paths through this infinite space and search for periodic paths.
				</p>
				<p>
					While ray tracing through this space if the ray hits a triangle side with the same rotation as the initial rotation it started at then that becomes a candidate for a periodic path. We can efficiently keep track of this without worrying about floating point inaccuracies by counting the number of rotations and reflected rotations of the same angle. If they ever become equal then we are back at the initial rotation.
				</p>
				<p>
					Once these candidates are generated they are not guaranteed to be periodic. Even though the ray is returning to the same angle it also has to return to the same initial position on the line. In order to determine this we can consider all rays that would return to the same position on the line. This is equivalent to tracing rays at the same angle as the angle between the starting line and ending line. If a ray exists that could connect the two lines along this angle then we know a periodic path exists. We can find this by rotating our frame of reference to align with these rays and then keeping track of the minimum and maximum x-values of each line we trace through, rotating these values back gives us a corridor of which any rays will produce a periodic path:
				</p>
				${addClass("small",new ImageDisplay("img/triangle-path-3.png"))}
				<p>
					Each of these corridors represents a class of periodic path solutions which covers some area of the problem space. If we flatten that covering down to the 2D space of all possible triangles then we can build a map of overlapping coverings. If that map could cover the full set of all possible triangles then it would solve the problem and prove that: yes, all triangles have a periodic path.
				</p>
				<p>
					Having placated my curiosity, this is where my journey ends. I enjoyed visualizing the problem, but the amount of compute needed to outright solve it (if even possible) is beyond me. The problem was an interesting exploration for me to better understand chaos, but solving it has little if any practical application.
				</p>
				<h3>Candidates Visualized:</h3>
				${addClass("small",new ImageDisplay("img/triangle-bounce-7.png"))}
				<h3>Filtered Periotic Paths Visualized:</h3>
				<p class="center">(GPU)</p>
				${addClass("small",new ImageDisplay("img/triangle-bounce-9.png"))}
				${addClass("small",new ImageDisplay("img/triangle-bounce-11.png"))}
				<p class="center">(CPU Prototype)</p>
				${addClass("small",new ImageDisplay("img/triangle-bounce-4.png"))}
			`,"lg")}
			<div class="gap"></div>
			<p class="center">${new ButtonLink("back to top",()=>scrollToTop())}</p>
		`);
	}
}
defineElm(ProjectPage,scss`&{
	width: 100%;
	${ImageDisplay}.small{
		>img{
			max-width:50%;
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

let title=bind("Billiard Ball Fractal");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});