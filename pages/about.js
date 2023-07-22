class SubSkill extends CustomElm{
	constructor(name,time,displayTime,timeMax){
		name=bind(name);
		time=bind(time);
		displayTime=bind(displayTime);
		timeMax=bind(timeMax);
		super();
		this.define(html`
			<div class="desc">
				<div class="start"></div>
				<p>${name}</p>
			</div>
			<div class="bar">
				<p>${displayTime}</p>
				<div class="inner" style=${attr(()=>"width:"+(time.data/timeMax.data*100)+"%;")(time,timeMax)}></div>
			</div>
		`);
	}
}
defineElm(SubSkill,scss`&{
	${theme.elementReset}
	${theme.center}
	position:relative;
	&.small{
		.desc p{
			${theme.font.sizeStep(-2)}
		}
	}
	.desc{
		box-sizing: border-box;
		background-color: ${theme.color.greyStep(0)};
		border: 2px solid ${theme.color.greyStep(2)};
		border-top-right-radius: 12px;
		border-bottom-right-radius: 12px;
		position: relative;
		.start{
			position:absolute;
			top:-12px;
			bottom:-2px;
			left: -2px;
			border-left: 4px solid ${theme.color.highlight};
		}
		margin-left:40px;
		height:40px;
		min-width:120px;
		max-width:120px;
		margin-right:10px;
		${theme.center}
		flex-direction:column;
		p{
			margin: 0;
		}
	}
	.bar{
		flex-grow:1;
		${theme.centerY}
		p{
			position: absolute;
			${theme.font.sizeStep(-1)}
			font-weight: 700;
			margin-left:20px;
			white-space: nowrap;
		}
		.inner{
			box-sizing: border-box;
			height:40px;
			border-bottom: 4px solid ${theme.color.highlight};
		}
		${theme.mobile}{
			display: none;
		}
	}
}`);
class Skill extends CustomElm{
	constructor(name,time,displayTime,timeMax,content){
		super();
		name=bind(name);
		time=bind(time);
		displayTime=bind(displayTime);
		timeMax=bind(timeMax);
		let toggle=bind(true);
		let hasContent=content!=null;

		let contentFoldStyle=bind("");
		let contentHeight=0;
		let animating=false;
		let contentFoldAnimation=animate((time)=>{
			if(time==0){
				contentHeight=getElm(".subSkills>div",this).offsetHeight;
				contentFoldStyle.data=`height:${contentHeight}px;`;
				animating=true;
			}else if(time==1){
				contentFoldStyle.data=`height:0;`;
				animating=false;
			}else{
				let t=easeInOutQuad(time);
				contentFoldStyle.data=`height:${(1-t)*contentHeight}px;`;
			}
		},0.4);
		let contentUnfoldAnimation=animate((time)=>{
			if(time==0){
				contentFoldStyle.data=`height:0;`;
				contentHeight=getElm(".subSkills>div",this).offsetHeight;
				animating=true;
			}else if(time==1){
				contentFoldStyle.data=``;
				animating=false;
			}else{
				let t=easeInOutQuad(time);
				contentFoldStyle.data=`height:${t*contentHeight}px;`;
			}
		},0.4);
		this.define(html`
			<div class="skill">
				<div class="desc">
					${
						hasContent?(html`<button
							class=${attr(()=>toggle.data?"toggled":"")(toggle)}
							onclick=${attr(act(()=>{
								if(!animating){
									if(toggle.data){
										contentUnfoldAnimation.stop();
										contentFoldAnimation.start();
									}else{
										contentFoldAnimation.stop();
										contentUnfoldAnimation.start();
									}
									toggle.data=!toggle.data;
								}
							}))}>
							<img
								src="/icons/chevron-down.svg"
								alt="Arrow"
							/>
						</button>`):
						`<div class="empty"></div>`
					}
					<p>${name}</p>
				</div>
				<div class="bar">
				<p>${displayTime}</p>
					<div class="inner" style=${attr(()=>"width:"+(time.data/timeMax.data*100)+"%;")(time,timeMax)}></div>
				</div>
			</div>
			<div
				class=${attr(()=>(toggle.data?"toggled":"")+" subSkills")(toggle)}
				style=${attr(contentFoldStyle)(contentFoldStyle)}
			>
				<div>
					${content}
				</div>
			</div>
		`);
	}
}
defineElm(Skill,scss`&{
	${theme.elementReset}
	&.small{
		.desc p{
			${theme.font.sizeStep(-2)}
		}
	}
	.skill{
		${theme.center}
		position:relative;
		.desc{
			position:relative;
			box-sizing: border-box;
			background-color: ${theme.color.greyStep(0)};
			border: 2px solid ${theme.color.greyStep(2)};
			border-radius: 12px;
			height:40px;
			min-width:${120+40}px;
			max-width:${120+40}px;
			padding-left:${40}px;
			margin-right:10px;
			${theme.center}
			p{
				margin: 0;
			}
			.empty{
				position:absolute;
				inset:-2px;
				right:unset;
				width:44px;
				height:40px;
				border-radius: 12px;
				border-top-right-radius: 0;
				border-bottom-right-radius: 0;
				border-right: 2px solid ${theme.color.greyStep(2)};
				transition: background-color 0.2s;
			}
			button{
				position:absolute;
				inset:-2px;
				right:unset;
				width:44px;
				height:40px;
				border-radius: 12px;
				border-top-right-radius: 0;
				border-bottom-right-radius: 0;
				background-color: ${theme.color.greyStep(2)};
				transition: background-color 0.2s;
				${theme.center}
				>img{
					width:25px;
					transform: scale(1);
					transition: transform 0.5s;
				}
				&:hover{
					background-color: ${theme.color.highlight};
				}
				&.toggled{
					background-color: ${theme.color.highlight};
					>img{
						transform: scale(-1);
					}
				}
			}
		}
		.bar{
			flex-grow:1;
			${theme.centerY}
			position: relative;
			overflow:hidden;
			p{
				position: absolute;
				${theme.font.sizeStep(-1)}
				font-weight: 700;
				margin-left:20px;
				padding:0 5px;
				background-color: ${theme.color.highlight};
				border-radius:20px;
				white-space: nowrap;
			}
			.inner{
				height:40px;
				background-color:${theme.color.highlight};
				border-right: 8px solid ${theme.color.highlightDark};
			}
			${theme.mobile}{
				display: none;
			}
		}
	}
	.subSkills{
		>div{
			border: 1px solid transparent;
			border-left: none;
			border-right: none;
			margin: -1px 0;
		}
		${SubSkill}{
			margin: 10px 0;
		}
		overflow: hidden;
	}
}`);
class AboutPage extends CustomElm{
	constructor(){
		super();
		let yearsMax=6;
		this.define(html`
		${addClass("intro",new Surface(html`
			<h2>Who I Am</h2>
			<p>I'm a software developer with a focus on web technoligies. In this constantly evolving industry flexability and adaptation are key to success. There is no greater skill than the ability to learn and this is a skill I've mastered. Almost everything I know about programming I've taught myself. With every line of code I write I continue to sharpen my skills - and with well over a hundred thousand lines of code behind me in personal projects alone, this portfolio speaks for itself.</p>
			<p>I've worked on a huge variety of projects. Everything ranging from novel artificial intelligence models to my own reactive web framework which I used to build this website. Programming is both my career and my passion so I am always excited to explore new areas where I can apply my skills.</p>
			<p class="center buttonDiv">
				${new ButtonClickable("My Resume",()=>window.open("/resume/resume-2023-web.docx", '_blank'))}
			</p>
		`,"lg",false,true))}
		${addClass("skills",new Surface(html`
			<h2>Skills</h2>
			<p class="center updated">(updated early 2023)</p>
			<p class="center">Listed below is the number of years I have <span class="bold">actively</span> been practicing each skill.</p>
			<div class="list">
				<p class="group">Web</p>
				${new Skill("HTML",6,"6 years",yearsMax)}
				${new Skill("CSS",6,"6 years",yearsMax,html`
					${new SubSkill("Sass",5,"5 years",yearsMax)}
				`)}
				${new Skill("JS",5,"5 years",yearsMax,html`
					${new SubSkill("Node.js",4,"4 years",yearsMax)}
					${new SubSkill("WebGL",2,"2 years",yearsMax)}
					${new SubSkill("Vue",2,"2 years",yearsMax)}
					${new SubSkill("Jest",2,"2 years",yearsMax)}
					${new SubSkill("Puppeteer",1,"1 year",yearsMax)}
					${new SubSkill("Deno",1,"1 year",yearsMax)}
					${new SubSkill("Socket.io",1,"1 year",yearsMax)}
					${new SubSkill("WebRTC",.75,"<1 year",yearsMax)}
					${new SubSkill("React",.75,"<1 year",yearsMax)}
				`)}

				<p class="group">Application / Server</p>
				${new Skill("Java",5,"5 years",yearsMax)}
				${new Skill("C#",4,"4 years",yearsMax,html`
					${addClass("small",new SubSkill(".NET Framework",4,"4 years",yearsMax))}
					${new SubSkill(".NET Core",3,"3 years",yearsMax)}
					${new SubSkill("LINQ",3,"3 years",yearsMax)}
				`)}
				${new Skill("PHP",1,"1 year",yearsMax)}
				${new Skill("Python",.75,"<1 year",yearsMax)}
				
				<p class="group">Database</p>
				${new Skill("SQL",4,"4 years",yearsMax)}
				${new Skill("MongoDB",.75,"<1 year",yearsMax)}

				<p class="group">Other</p>
				${new Skill("Git",6,"6 years",yearsMax)}
				${new Skill("GLSL",2,"2 years",yearsMax)}
				${new Skill("OpenCL",1,"1 year",yearsMax)}
				${new Skill("Docker",.75,"<1 year",yearsMax)}
				${addClass("small",new Skill("Google API",.75,"<1 year",yearsMax))}
				${addClass("small",new Skill("Big Commerce",.75,"<1 year",yearsMax))}
			</div>
		`,"sm",true))}
		${new Surface(html`
			<h2>Philosophy</h2>
			<br>
			<h3>Results</h3>
			<p>I value the ability to demonstrate results. Why explain what a project should be when you can just show off what it is? This is why many of my projects have a strong visual component to them. Pages of explanation can often be summarized by a handful of clever visualizations. I aim to clearly showcase my projects in a way that can be easily understood even by those with only basic background knowledge. Often times bad work can be hidden behind hard to understand design and confusing explanations, thus I try to make it clear what each project’s purpose is and let the viewer judge the results for themselves. Anyone can claim to have any skill but the only true test is the results they are able to produce.</p>
			<br>
			<h3>Independence</h3>
			<p>I value the ability to work independently. It is important to be able to reach set goals without needing to rely on other people. I am primarily a self-taught programmer, learning the basics in highschool and teaching myself from there through online resources and personal code projects. There is an absolutely staggering amount to learn about and so I try to limit myself to only learning practical skills I can use right now. This approach of learning new skills as I need them has given me the ability to acquire new skills extremely quickly while working on projects. Often times the projects I work on require the use of skills I don’t have. Rather than relying on someone else, I teach myself the necessary skills as I need them.</p>
			<br>
			<h3>Perseverance</h3>
			<p>I value having the ability to persevere and see a project through to completion. Spending countless hours on a project is worth very little if the goal of the project is not met. It is almost guaranteed that there will be complications when working on a project that will make it more difficult than it initially seemed. I believe it is important to carry on regardless and see it through to completion. Some of the projects I’ve finished have taken hundreds of hours spread across multiple years. I could have abandon these projects at any time and no one would have known. However the act of completing these difficult projects often forced me to see things from a new perspective, leaving me with a deeper understanding of code - and of course one more finished project.</p>
			<br>
			<h3>Polish</h3>
			<p>I value the ability to create a clean and polished end product. There comes a point in any project where it is “good enough” and that is often the place where it is tempting to stop. However often a few extra hours of work on small details and subtleties can make the difference between an okay user experience and an unforgettable one. Small details which most users will never consciously notice all contribute to the overall feel of the finished project and shape how the user will remember the experience. In my view this step is often given the least attention despite being one of the most critical in shaping the user experience. This final layer of polish on a project is like the thin layer of icing on a cake and everyone knows how much better cake is with icing!</p>
		`,"sm")}
		<div class="gap"></div>
		${new Surface(html`
			<h2>About Website</h2>
			<p>This website was designed and built by myself using pure HTML, CSS and JavaScript. Fonts from <a href="https://fonts.google.com/">Google Fonts</a>. Icons from <a href="https://fontawesome.com/">Font Awesome</a>.</p>
		`,"sm")}
		`);
	}
}
defineElm(AboutPage,scss`&{
	width: 100%;
	.intro>div{
		${theme.center};
		flex-direction: column;
		>.pic{
			background-color: ${theme.color.greyStep(1)};
			background: url('/img/me.jpg');
			background-position: center;
			background-size: cover;
			border: 6px solid ${theme.color.greyStep(-2)};
			box-sizing: border-box;
			width: 200px;
			height: 200px;
			border-radius: 50%;
			margin-bottom:20px;
		}
		p{
			margin-top:0;
		}
		.buttonDiv{
			margin-top:20px;
		}
	}
	>.gap{
		height:50px;	
	}
	h3{
		padding-bottom: 10px;
		color:${theme.color.greyStep(10)};
		border-bottom: 2px solid ${theme.color.greyStep(8)};
	}
	.skills>div{
		>h2{
			margin-bottom:0;
		}
		>p{
			margin: 0 40px;
			margin-top:0;
			margin-bottom:20px;
		}
		>.list{
			margin: 0 40px;
			margin-top:40px;
			>${Skill}{
				margin:10px 0;
				margin-top:20px;
			}
			>${SubSkill}{
				margin:10px 0;
			}
			>.group{
				// ${theme.font.interact}
				${theme.font.sizeStep(0)}
				font-weight:700;
				color:${theme.color.white};
				border-bottom: 2px solid ${theme.color.greyStep(2)};
			}
		}
		>p.updated{
			color:${theme.color.greyStep(10)};
		}
	}
	span.bold{
		font-weight:700;
	}
	p.center{
		text-align:center;
	}
}`);