class ProjectsPage extends CustomElm{
	constructor(allProjects,selectedCategory){
		super();
		allProjects=bind(allProjects);
		let projects=bind([]);
		selectedCategory=bind(selectedCategory);
		link(()=>{
			projects.lock();
			projects.splice(0,projects.length);
			let matched=allProjects.filter((p)=>p.categories.map(x=>x.data).includes(selectedCategory.data));
			projects.push(...matched);
			projects.unlock();
		},selectedCategory)();
		let selectCat=(category)=>{
			selectedCategory.data=category;
		}
		this.define(html`
			${new Surface(html`
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
				<div class="projects">
					<div class="inner">
						${html`${()=>projects.map(p=>new ProjectCard(p))}`(projects)}
						${Array(4).fill().map(()=>`<div class="spacer"></div>`)}
					</div>
				</div>
				<p class="center">${new ButtonLink("back to top",()=>scrollToTop())}</p>
			`,"lg",true,true)}
		`);
	}
}
defineElm(ProjectsPage,scss`&{
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
	.projects{
		${theme.centerX}
		.inner{
			position: relative;
			${theme.centerX}
			flex-wrap: wrap;
			margin: 0 -50px;
			${theme.mobile}{
				margin: 0 -40px;
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
}`);

