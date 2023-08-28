class NavSlice extends CustomElm{
	constructor(item,selectItemFunc,sAng,eAng){
		super();
		let ringSize=120;
		let svgSize=600;
		let inset=15;
		let textGap=30;
		let mid=new Vector(svgSize/2,svgSize/2);

		let smallRingSize=80;

		// let startAng=i*PI/length+PI;
		// let endAng=(i+1)*PI/length+PI;
		sAng=bind(sAng);
		eAng=bind(eAng);
		let startAng=sAng.data;
		let endAng=eAng.data;
		let midAng=(endAng-startAng)/2+startAng;

		let outer=ringSize;
		let inner=outer-inset;
		let hitBoxRingSize=150;

		let startOut=new Vector(startAng,outer,true);
		startOut.addVec(mid);
		let startIn=new Vector(startAng,inner,true);
		startIn.addVec(mid);
		let endOut=new Vector(endAng,outer,true);
		endOut.addVec(mid);
		let endIn=new Vector(endAng,inner,true);
		endIn.addVec(mid);

		let outerSm=smallRingSize;
		let innerSm=outerSm-inset;

		let startOutSm=new Vector(startAng,outerSm,true);
		startOutSm.addVec(mid);
		let startInSm=new Vector(startAng,innerSm,true);
		startInSm.addVec(mid);
		let endOutSm=new Vector(endAng,outerSm,true);
		endOutSm.addVec(mid);
		let endInSm=new Vector(endAng,innerSm,true);
		endInSm.addVec(mid);

		this.define(html`
			<div class="back">
				<svg viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">
					<path class="slice" d="
						M ${startOut.x} ${startOut.y}
						L ${startIn.x} ${startIn.y}
						A ${inner} ${inner} 0 0 1 ${endIn.x} ${endIn.y}
						L ${endOut.x} ${endOut.y}
						A ${outer} ${outer} 0 0 0 ${startOut.x} ${startOut.y}
						"
					/>
				</svg>
			</div>
			<div class="front">
				${new TextArcMid(item.text,inner+textGap,midAng,0.2)}
			</div>
		`(item.text));
		this.attr("onclick",act(()=>{selectItemFunc(item.id.data)}))(item);

		let angExtraHb=0.1;
		let startHb=new Vector(startAng-angExtraHb/2,hitBoxRingSize,true);
		startHb.addVec(mid);
		let endHb=new Vector(endAng+angExtraHb/2,hitBoxRingSize,true);
		endHb.addVec(mid);
		this.attr("style",`clip-path: path('
			M ${mid.x} ${mid.y}
			L ${endHb.x} ${endHb.y}
			A ${hitBoxRingSize} ${hitBoxRingSize} 0 0 0 ${startHb.x} ${startHb.y}
		');`.replaceAll("\n",""))();
		
    }
}
defineElm(NavSlice,scss`
&{
	z-index: 10;
	${theme.elementReset}
	${theme.center}
	width: 600px;
	height: 600px;
	position: absolute;
	
	${theme.font.fontSizeStep(-1)};
	color: ${theme.color.greyStep(-2)};
	transition: color 0.2s;
	user-select: none;
	/*background-color: #FF000010;*/
}
>.back{
	z-index: 1;
	position: absolute;
	width: 600px;
	height: 600px;
	>svg{
		width: 600px;
		height: 600px;
		fill: ${theme.color.greyStep(1)};
		stroke: ${theme.color.greyStep(0)};
		stroke-width: 2;
		transition: stroke 0.2s, fill 0.2s;
	}
}
>.front{
	z-index: 1;
	position: absolute;
}
&:hover{
	color: ${theme.color.greyStep(-5)};
	.back >svg{
		stroke: ${theme.color.greyStep(-5)};
		fill: ${theme.color.greyStep(-5)};
	}
}
`);
class SubNav extends CustomElm{
	constructor(items,selectedItem,selectItemFunc){
		super();
		items=bind(items);

		let svgSize=600;
		let mid=new Vector(svgSize/2,svgSize/2);

		let ringSize=250;
		let inset=50;
		let outer=ringSize;
		let inner=outer-inset;
		let gapAng=0.12;
		let startAngHb=PI/6;
		let endAngHb=PI*5/6;
		let startAng=PI/6+gapAng;
		let endAng=PI*5/6-gapAng;
		let diffAng=endAng-startAng;

		let outerHb=outer+5;
		let startHb=new Vector(startAngHb,outerHb,true);
		startHb.addVec(mid);
		let endHb=new Vector(endAngHb,outerHb,true);
		endHb.addVec(mid);

		let sliderDist=inner-10;
		let sliderSize=diffAng/items.length/2;
		let sliderAngle=bind((endAng-startAng)/2+startAng);
		let sliderUpdateNum=bind(0);
		let desiredAngle=bind(0);
		updateDesiredAng();

		function updateDesiredAng(){
			let idx=items.indexOf(selectedItem.data);
			desiredAngle.data=endAng-(endAng-startAng)*(idx+0.5)/items.length;
		}

		animate((ellapsed,diff)=>{
			//TODO: base this off time
			let closest=Math.floor((endAng-desiredAngle.data)/diffAng*items.length);
			let closestAng=endAng-(endAng-startAng)*(closest+0.5)/items.length;
			sliderAngle.data=
				sliderAngle.data*0.8
				+desiredAngle.data*0.04
				+closestAng*0.16;
		},1,true).start();


		let sliderStart,sliderEnd,sliderPointerP1,sliderPointerP2,sliderPointerP3;

		link(()=>{
			let sliderAng=sliderAngle.data;
			sliderStart=new Vector(sliderAng-sliderSize,sliderDist,true);
			sliderStart.addVec(mid);
			sliderEnd=new Vector(sliderAng+sliderSize,sliderDist,true);
			sliderEnd.addVec(mid);

			let sliderMid=new Vector(sliderAng,sliderDist,true);
			sliderMid.addVec(mid);
			sliderPointerP1=new Vector(10,0);
			sliderPointerP2=new Vector(-5,-10);
			sliderPointerP3=new Vector(-5,10);
			sliderPointerP1.rotVec(sliderAng);
			sliderPointerP1.addVec(sliderMid);
			sliderPointerP2.rotVec(sliderAng);
			sliderPointerP2.addVec(sliderMid);
			sliderPointerP3.rotVec(sliderAng);
			sliderPointerP3.addVec(sliderMid);
			sliderUpdateNum.data++;
		},sliderAngle)();

		this.define(html`
			<svg viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">
				<path class="slider"
					d=${attr(()=>`
						M ${sliderStart.x} ${sliderStart.y}
						A ${sliderDist} ${sliderDist} 0 0 1 ${sliderEnd.x} ${sliderEnd.y}
					`)(sliderUpdateNum)}
				/>
				<path class="sliderArrow"
					d=${attr(()=>`
					M ${sliderPointerP1.x} ${sliderPointerP1.y}
					L ${sliderPointerP2.x} ${sliderPointerP2.y}
					L ${sliderPointerP3.x} ${sliderPointerP3.y}
					L ${sliderPointerP1.x} ${sliderPointerP1.y}
					`)(sliderUpdateNum)}
				/>
			</svg>
			${html`${items.map((item,i)=>{
				let angS=endAng-diffAng*i/items.length;
				let angE=endAng-diffAng*(i+1)/items.length;
				return new SubNavSlice(item,selectItemFunc,outer,angS,angE);
			})}
			`(items)}
		`);
		this.attr("style",`clip-path: path('
			M ${mid.x} ${mid.y}
			L ${startHb.x} ${startHb.y}
			A ${outerHb} ${outerHb} 0 0 1 ${endHb.x} ${endHb.y}
		');`.replaceAll("\n",""))();
		this.attr(
			"onmousemove",
			act((e)=>{
				let mouseP=new Vector(e.clientX,e.clientY);
				let bound=this.getBoundingClientRect();
				mouseP.subVec(new Vector(bound.left,bound.top));
				let desiredAng=mid.getAng(mouseP);
				desiredAng=Math.max(Math.min(desiredAng,endAng-sliderSize),startAng+sliderSize);
				desiredAngle.data=desiredAng;
			})
		)();
		this.attr(
			"onmouseout",
			act((e)=>{
				updateDesiredAng();
			})
		)();
	}
}
defineElm(SubNav,scss`
&{
	position: absolute;
	${theme.elementReset}
	${theme.center}
	width:600px;
	height:600px;
	z-index:1;
}
>svg{
	z-index:1;
	position: absolute;
	width:600px;
	fill: ${theme.color.greyStep(1)};
	stroke: ${theme.color.greyStep(-0.5)};
	stroke-width: 2px;
	.slider{
		stroke: ${theme.color.greyStep(0)};
		fill: transparent;
	}
	.sliderArrow{
		fill: ${theme.color.greyStep(-2)};
		stroke: ${theme.color.greyStep(1)};
		stroke-width: 4px;
	}
}
`);
class SubNavSlice extends CustomElm{
	constructor(item,selectItemFunc,radius,startAng,endAng){
		super();
		item=bind(item);
		startAng=bind(startAng);
		endAng=bind(endAng);
		radius=bind(radius);

		let svgSize=600;
		let mid=new Vector(svgSize/2,svgSize/2);
		
		let ringSize=radius.data;
		let inset=50;
		let outer=ringSize;
		let inner=outer-inset;
		let textRingSize=ringSize-inset/2;
		let midAng=(endAng.data-startAng.data)/2+startAng.data;

		let startOut=new Vector(startAng.data,outer,true);
		startOut.addVec(mid);
		let startIn=new Vector(startAng.data,inner,true);
		startIn.addVec(mid);
		let endOut=new Vector(endAng.data,outer,true);
		endOut.addVec(mid);
		let endIn=new Vector(endAng.data,inner,true);
		endIn.addVec(mid);

		let extraHb=5;
		let extraAngHb=0.01;
		let outerHb=outer+extraHb;
		let innerHb=inner-extraHb;
		let startAngHb=startAng.data+extraAngHb;
		let endAngHb=endAng.data-extraAngHb;
		let startOutHb=new Vector(startAngHb,outerHb,true);
		startOutHb.addVec(mid);
		let startInHb=new Vector(startAngHb,innerHb,true);
		startInHb.addVec(mid);
		let endOutHb=new Vector(endAngHb,outerHb,true);
		endOutHb.addVec(mid);
		let endInHb=new Vector(endAngHb,innerHb,true);
		endInHb.addVec(mid);

		this.define(html`
			<svg viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">
				<path d="
					M ${startOut.x} ${startOut.y}
					L ${startIn.x} ${startIn.y}
					A ${inner} ${inner} 0 0 0 ${endIn.x} ${endIn.y}
					L ${endOut.x} ${endOut.y}
					A ${outer} ${outer} 0 0 1 ${startOut.x} ${startOut.y}
					"
				/>
			</svg>
			<p
				class="text"
				style=${
					attr(()=>`
						transform:
							rotate(${midAng}rad)
							translateX(${textRingSize}px)
							rotate(${-PI/2}rad);
					`)()}
				}
			>${html`${item.text}`(item.text)}</p>
		`);
		this.attr("style",`clip-path: path('
			M ${startOutHb.x} ${startOutHb.y}
			L ${startInHb.x} ${startInHb.y}
			A ${innerHb} ${innerHb} 0 0 0 ${endInHb.x} ${endInHb.y}
			L ${endOutHb.x} ${endOutHb.y}
			A ${outerHb} ${outerHb} 0 0 1 ${startOutHb.x} ${startOutHb.y}
		');`.replaceAll("\n",""))();
		this.attr("class",()=>item.selected.data?"selected":"")(item.selected);
		this.attr("onclick",act(()=>{selectItemFunc(item.id.data)}))();
	}

}
defineElm(SubNavSlice,scss`
&{
	display:none;
	${theme.center}
	z-index:0;
	width:600px;
	height:600px;
	position: absolute;
	z-index:1;
}
&:hover{
	z-index:2;
	>.text{
		color: ${theme.color.greyStep(-5)};
	}
	>svg{
		stroke: ${theme.color.greyStep(-5)};
	}
}
&.selected{
	z-index:2;
	>.text{
		color: ${theme.color.greyStep(1)};
	}
	>svg{
		stroke: ${theme.color.greyStep(-5)};
		fill: ${theme.color.greyStep(-5)};
	}
}
>svg{
	transition: fill 0.2s;
	position: absolute;
	width:600px;
	stroke: ${theme.color.greyStep(0)};
	fill: transparent;
	stroke-width: 2px;
}
>.text{
	pointer-events:none;
	transition: color 0.2s;
	position: absolute;
	z-index:1;
	${theme.font.fontSizeStep(-1.5)}
	color: ${theme.color.greyStep(-2)};
	font-weight:700;
}
`);

class NavCenter extends CustomElm{
	constructor(){
		super();
		let svgSize=200;
		let midButtonSize=50;
		let mid=new Vector(svgSize/2,svgSize/2);
		this.define(html`
			<svg viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">
				<circle cx="${mid.x}" cy="${mid.y}" r="${midButtonSize}">
			</svg>
			<p>Sign In</p>
		`);
		this.attr("style",`clip-path: circle(${midButtonSize+5}px);`)();
	}
}
defineElm(NavCenter,scss`
&{
	width:200px;
	height:200px;
	${theme.center}
}
>svg{
	z-index:2;
	position: absolute;
	width:200px;
	fill: ${theme.color.greyStep(1)};
	stroke: ${theme.color.greyStep(0)};
	stroke-width: 2px;
	circle{
		transition: stroke 0.2s, fill 0.2s;
		position:relative;
	}
	circle:hover{
		stroke: ${theme.color.greyStep(-5)};
		fill: ${theme.color.greyStep(-5)};
	}
}
>p{
	pointer-events:none;
	z-index:2;
	position: absolute;
	font-weight: 700;
	${theme.font.fontSizeStep(-0.5)}
	color: orange;
}
`);
class Nav extends CustomElm{
	constructor(items,selectedItem,selectItemFunc,scroll,width){
		super();
		let isDown;
		if(scroll!=null){
			isDown=def(()=>scroll.data>window.innerHeight-50,scroll);
		}else{
			isDown=bind(false);
		}
		width=bind(width);

		let hasMid=def(()=>items.length%2==0,items);
		let gapAng=0.1/2;
		let svgSize=200;
		let midButtonSize=50;
		let mid=new Vector(svgSize/2,svgSize/2);

		let smallRingSize=75;
		let edge=400;

		let slowRot=bind(0);
		animate((ellapsed,diff)=>{
			slowRot.data+=diff*0.15;
		},1,true).start();

		let lastI=items.indexOf(selectedItem.data);
		let currentI=lastI;
		let animatedI=lastI;
		
		let lastOpacity=1;
		let currentOpacity=bind(1);
		let textUpdated=false;

		let navRot=bind(lastI*-1/items.length*TAU);
		let navAnimation=animate((ellapsed,diff)=>{
			//TODO: text ring should fade and change
			let t=easeInOutQuad(ellapsed);
			let lastT=easeInOutQuad(ellapsed-diff);
			let start=lastI*-1/items.length*TAU;
			let end=currentI*-1/items.length*TAU;
			let move=end-start;

			if(ellapsed<0.5){
				currentOpacity.data=lastOpacity*(1-t*2);
			}else{
				if(!textUpdated){
					textUpdated=true;
					updateRingText();
				}
				currentOpacity.data=(t*2-1);
			}

			animatedI=currentI*t+lastI*(1-t);
			navRot.data=animatedI*-1/items.length*TAU;
			if(ellapsed==1){
				lastI=currentI;
			}
			slowRot.data-=(t-lastT)*move;
		},1,false);

		selectedItem.sub(()=>{
			let idx=items.indexOf(selectedItem.data);
			lastI=animatedI;

			let diffI=mod(idx-currentI,items.length);
			let midI=items.length/2;
			if(diffI<midI){
				currentI+=diffI;
			}else{
				currentI-=items.length-diffI;
			}

			textUpdated=false;
			lastOpacity=currentOpacity.data;

			navAnimation.start();
		});

		let ringText=bind("");
		let ringTextBig=bind("");
		updateRingText();
		//"home home home home home home home "
		function updateRingText(){
			let text=selectedItem.data.text.data.toLowerCase()+" ";
			let tarLeng=35;
			let textLeng=text.length;
			let multi=Math.round(tarLeng/textLeng);
			let textFull="";
			for(let i=0;i<multi;i++){
				textFull+=text;
			}
			ringText.data=textFull;
			ringTextBig.data=textFull.toUpperCase();
		}

		this.define(html`
			<div class="back">
			<svg 
				viewBox=${
					attr(()=>{
						let pageWidth=width.data;
						let pageHeight=pageWidth*2/3;
						return `"0 0 ${pageWidth} ${pageHeight}"`
					})(width)
				}
				style=${
					attr(()=>{
						let pageWidth=width.data;
						let pageHeight=pageWidth*2/3;
						let pageMid=new Vector(pageWidth/2,pageHeight/2);
						let offShoot1=new Vector(PI/3+PI/2,pageWidth,true);
						offShoot1.addVec(pageMid);
						let offShoot2=new Vector(-PI/3+PI/2,pageWidth,true);
						offShoot2.addVec(pageMid);

						let offShoot3=new Vector(smallRingSize,smallRingSize);
						offShoot3.addVec(pageMid);
						let offShoot4=new Vector(-smallRingSize,smallRingSize);
						offShoot4.addVec(pageMid);

						
						let offShoot5=new Vector(PI/3+PI/2,smallRingSize,true);
						offShoot5.addVec(pageMid);
						let offShoot6=new Vector(-PI/3+PI/2,smallRingSize,true);
						offShoot6.addVec(pageMid);

						let extra=5;
				
						return `clip-path: path('
							M ${offShoot6.x} ${offShoot6.y+extra}
							L ${offShoot3.x} ${offShoot3.y+extra}
							L ${offShoot4.x} ${offShoot4.y+extra}
							L ${offShoot5.x} ${offShoot5.y+extra}
							L ${offShoot1.x} ${offShoot1.y+extra}
							L ${-extra} ${-extra}
							L ${pageWidth+extra} ${-extra}
							L ${offShoot2.x} ${offShoot2.y+extra}
						');`.replaceAll("\n","")
					})(width)
				}
				width=${attr(()=>width)(width)}
				height=${attr(()=>width.data*2/3)(width)}
				xmlns="http://www.w3.org/2000/svg"
			>
				<path class="highlight" d=${
					attr(()=>{
						let pageWidth=width.data;
						let pageHeight=pageWidth*2/3;
						let pageMid=new Vector(pageWidth/2,pageHeight/2);
						let pageEdge1=pageMid.x+edge;
						let pageEdge2=pageMid.x-edge;
				
						let startAng=PI/6;
						let endAng=startAng+TAU/3;
						let startSm=new Vector(startAng,smallRingSize,true);
						startSm.addVec(pageMid);
						let endSm=new Vector(endAng,smallRingSize,true);
						endSm.addVec(pageMid);
				
						let offShoot1=new Vector(PI/6,1,true);
						offShoot1.addVec(startSm);
						let edge1=intersectLines(startSm,offShoot1,new Vector(pageEdge1,0),new Vector(pageEdge1,1),true);
				
						let offShoot2=new Vector(-PI/6,1,true);
						offShoot2.addVec(endSm);
						let edge2=intersectLines(endSm,offShoot2,new Vector(pageEdge2,0),new Vector(pageEdge2,1),true);
						

						return `
							M ${pageWidth+10} ${0}
							L ${pageWidth+10} ${edge1.y}
							L ${edge1.x} ${edge1.y}
							L ${startSm.x} ${startSm.y}
							A ${smallRingSize} ${smallRingSize} 0 0 1 ${endSm.x} ${endSm.y}
							L ${edge2.x} ${edge2.y}
							L ${-10} ${edge2.y}
							L ${-10} ${0}
						`
					})(width)}
				/>
			</svg>
			</div>
			<div class="front">
				<div class="items" style=${attr(()=>`
					transform:
						rotate(${navRot.data}rad);`)(navRot)}
				>
					${items.map((a,i)=>new NavSlice(
						a,
						selectItemFunc,
						i*TAU/items.length+PI/6+gapAng,
						(i+1)*TAU/items.length+PI/6-gapAng)
					)}
				</div>
				${new NavCenter()}
				<div class="ringContain" style=${attr(()=>`
					opacity:${currentOpacity.data};
					transform:
						rotate(${slowRot.data}rad);`)(slowRot,currentOpacity)}
				>
					${addClass("ring bottom",new TextArc(ringText,95,0,TAU,0,true,false,true))}
				</div>
				<div class="ringContain bottom" style=${attr(()=>`
					opacity:${currentOpacity.data};
					transform:
						rotate(${slowRot.data}rad);`)(slowRot,currentOpacity)}
				>
					${addClass("ring bottom",new TextArc(ringTextBig,95,0,TAU,0,true,false,true))}
				</div>
				${new SubNav(
					items[0].subPages,
					items[0].paging.selectedSubPage,
					(id)=>{
						items[0].paging.setSubPage(id);
					}).attr("style",()=>`transform: rotate(${navRot.data+PI*2/3}rad);`)(navRot)}
			</div>

		`(items));
	}
}
defineElm(Nav,(()=>{
	return scss`
	&{
		${theme.elementReset}
		position:relative;
		${theme.font.detail}
	}
	>.back{
		${theme.center}
		position: absolute;
		top:0;
		left: 0;
		right: 0;
		height: 0;
		z-index: 2;
		>svg{
			fill: ${theme.color.greyStep(1)};
			stroke: ${theme.color.greyStep(0)};
			stroke-width: 2px;
			>.highlight{
				stroke: orange;
				stroke-width: 4px;
			}
		}
	}
	>.front{
		position: absolute;
		top:0;
		left: 0;
		right: 0;
		height: 0;
		${theme.center}
		>.items{
			${theme.center}
			position: relative;
			z-index:3;
		}
		>${NavCenter}{
			z-index:3;
			position: absolute;
		}
		>.ringContain{
			z-index:2;
			user-select: none;
			
			>.ring{
				opacity: 0.2;
				position: absolute;
				${theme.font.fontSizeStep(-4)};
				color: ${theme.color.greyStep(-5)};
			}
			&.bottom{
				z-index:0;
				>.ring{
					opacity:1;
					font-weight: bold;
				}
			}
		}
	}
	`})()
);