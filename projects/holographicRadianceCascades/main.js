class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/radiance-cascades">Github</a></p>
				<p class="center bold projectLink"><a href="https://arxiv.org/abs/2505.02041">Paper</a></p>
				<p class="center bold projectLink"><a href="/demo/nested-radiance-cascades-fast/" rel="nofollow">Demo (fast)</a></p>
				<p class="center bold projectLink"><a href="/demo/nested-radiance-cascades-accurate/" rel="nofollow">Demo (accurate)</a></p>
				${new ImageDisplay("img/radiance-cascade-nested-19.png")}
				<p>
					Holographic Radiance Cascades (HRC) is a novel solution for calculating direct global illumination. It runs in constant time, unaffected by scene complexity or number of light sources.
				</p>
				<p>
					HRC is heavily based on the the Radiance Cascades (RC) algorithm and thus inherits many of the same properties/advantages that RC offers. HRC is able to more accurately capture lighting details such as hard shadows which RC struggles with. Though it is worth noting that this increased accuracy comes the cost of performance. However, HRC is still able to resolve the lighting for 2D scenes in realtime with a higher accuracy than RC can accomplish and with the same computational budget.
				</p>
				<p>
					In 2D HRC is a near perfect solution to lighting. Unforunately in 3D the scaling costs are much higher. Whether HRC can be modified to be viable for realtime 3D applications remains an open question. 
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					I came across the work of Alexander Sannikov and his invention of the RC algorithm. In particular, seeing his passion during <a href="https://youtu.be/TrHHTQqmAaM?si=8odMfVK4PAk9CMOi">this presentation</a> got me very excited about this work! As a result I learned all I could about RC and started looking for ways to improve and build off it. HRC is my contribution to this line of work. Collaborating with some incredibly smart people online, my initial concept and demo for HRC has been refined and generalized to allow for some really incredible things that no one expected to be possible. And there remains more ground to explore.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Explanation</h2>
				<p>
					There is far too much to cover, thus I will only be giving a brief and oversimplified explanation here. 
				</p>
				<p>
					Traditionally realtime approximation of ambient lighting is done using light probes. Each probe is effectively a low resolution camera that takes sample rays around it, accumulating the average light and then interpolating it back onto the surrounding scene.
				</p>
				<p>
					When working with light probes both the sample resolution of each probe and the number of probes (probe density) can be adjusted to balance accuracy and performance. In a perfect world you would have one probe per pixel in the rendered image and with a high number of samples per probe. In this extreme case this is equivalent to brute force ray tracing the scene. Obviously for realtime rendering this is not feasible, which begs the question: what is the optimal arrangement of probes and sample rays?
				</p>
				<p>
					The classic Radiance Cascades algorithm answers this question in a novel way. Instead of using a single grid of probes, instead it uses multiple grids of probes at different scales. Each of these grids is called a cascade. At the smallest scale each probe only uses a few samples, but the probe density is very high. At the largest scale there are very few probes but each probe has a high number of sample rays.
				</p>
				<p>
					These samples are then interpolated and merged down into the next cascade starting at the largest scale and moving down to smaller scales until at the final level of interpolation we are merging into each pixel.
				</p>
				<p>
					This turns out to be a very powerful strategy for approximating lighting. But unfortunately it is not perfect and cannot capture detailed lighting effects such as hard shadows. As a result RC is very effective for approximating ambient lighting effects but still requires a separate ray tracing pass to calculate hard shadows from point light sources. I was very interested in finding a way to improve the algorithm so that it could be used for both direct and ambient lighting as part of the same algorithm. HRC is the result this endeavour.
				</p>
				<p>
					HRC improves upon the classic RC algorithm by changing the structure of the cascades from using probe grids to using holographic boundaries. Instead of interpolating between probes we interpolate from holographic boundaries. Doing it this way is more expensive than classic RC but allows for the lighting to be much more accurately captured.
				</p>
				<p>
					Additionally the structure of HRC allows for the construction of rays using the samples captured from the previous cascade. Normally when merging we start at the largest scale and merge down. But in HRC we can go the other way, starting at the smallest scale and merging up to construct each next cascade from the previous one. This allows us to construct all of the rays we need without doing any ray tracing. Zero-ray ray tracing! This turns out to be much more efficient than any other method of ray tracing and completely eliminates the need for any kind of ray tracing acceleration structure (such as octrees) since we can use HRC as its own ray tracing acceleration structure. This increases the memory cost of the algorithm but <span class="bold">massively</span> improves performance.
				</p>
			`,"sm")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				${addClass("small",new ImageDisplay("img/radiance-cascade-nested-13.png"))}
				${addClass("small",new ImageDisplay("img/radiance-cascade-nested-26-accurate.png"))}
				${addClass("small",new ImageDisplay("img/radiance-cascade-nested-29.png"))}
				${addClass("small",new ImageDisplay("img/radiance-cascade-normal5.png"))}
				${addClass("small",new ImageDisplay("img/simple-merge.png"))}
				<h3>Some Fun Glitches</h3>
				${addClass("small",new ImageDisplay("img/radiance-glitch47.png"))}
				${addClass("small",new ImageDisplay("img/radiance-glitch37.png"))}
				${addClass("small",new ImageDisplay("img/radiance-glitch43.png"))}
				${addClass("small",new ImageDisplay("img/radiance-glitch10.png"))}
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

let title=bind("Holographic Radiance Cascades");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});