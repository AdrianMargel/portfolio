class HomePage extends CustomElm{
	constructor(allProjects,selectedCategory){
		super();
		allProjects=bind(allProjects);
		let projects=bind([]);
		selectedCategory=bind(selectedCategory);
		link(()=>{
			projects.lock();
			projects.splice(0,projects.length);
			let matched=allProjects.filter((p)=>p.categories.map(x=>x.data).includes(selectedCategory.data));
			projects.push(...matched.splice(0,3));
			projects.unlock();
		},selectedCategory)();
		let selectCat=(category)=>{
			selectedCategory.data=category;
		}
		this.define(html`
			${new Surface(html`
				<h2>Mission</h2>
				<p>I am driven by deep love for programming. I aim to push the limits of what is possible with code, carving my own path as I go. Following the rules but always thinking outside the box - I'm an inherently creative person and I believe code is an art.</p>
				<br>
				<p class="center">${new ButtonLink("About Me",()=>setPage("about"))}</p>
			`,"lg",false,true)}
			${addClass("projects",new Surface(html`
				<h2>Projects</h2>
				<div class="types">
					${new ButtonClickable("Design",()=>selectCat("design"),
						def(()=>selectedCategory.data=="design",selectedCategory)
					)}
					${new ButtonClickable("Programming",()=>selectCat("programming"),
						def(()=>selectedCategory.data=="programming",selectedCategory)
					)}
					${new ButtonClickable("Art",()=>selectCat("art"),
						def(()=>selectedCategory.data=="art",selectedCategory)
					)}
				</div>
				<div class="projectList">
					<div class="inner">
						${html`${()=>projects.map(p=>new ProjectCard(p))}`(projects)}
						${Array(3).fill().map(()=>`<div class="spacer"></div>`)}
					</div>
				</div>
				<div class="more">
					${new ButtonLink("See More",()=>setPage("projects"))}
				</div>
			`,"lg",true))}
			${new Surface(html`
				<h2>Contact</h2>
				<p class="center">Questions, comments, job opportunities, something else? Feel free to reach out to me.</p>
				${new Email("adrianjmargel","gmail","com")}
				<p class="center bold">Github: <a href="https://github.com/AdrianMargel">AdrianMargel</a></p>
			`,"sm")}
		`);
	}
}
defineElm(HomePage,scss`&{
	width: 100%;
	.types{
		${theme.centerX}
		flex-wrap: wrap;
		margin-bottom:10px;
		${ButtonClickable}{
			margin: 20px;
		}
		.surface{
			width:140px;
		}
	}
	${Surface}.projects{
		overflow: hidden;
		.projectList{
			${theme.centerX}
			.inner{

				position: relative;
				${theme.centerX}
				flex-wrap: wrap;
				max-width: 1008px;
				margin: 0 -50px;

				height: 528px;
				${ProjectCard}{
					margin-bottom:500px;
				}
			}
		}
	}
	.more{
		margin-top:30px;
		${theme.font.text}
		${theme.centerX}
	}
	.spacer{
		height: 0px;
		flex: 1;
		min-width: 250px;
		max-width: 350px;
		padding: 0 4px; /*simulate border*/
		margin: 0 10px;
	}
	p.center{
		text-align: center;
	}
	p.bold{
		font-weight: 700;
	}
}`);

