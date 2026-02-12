
let startA=Vec(150,0);
let startB=Vec(150,100);
let endA=Vec(250,100);
let endB=Vec(250,0);

let startA2=Vec(150,0);
let startB2=Vec(150,100);
let endA2=Vec(250,100);
let endB2=Vec(250,0);

let pin=Vec(200,0);

function draw(disp,ctrl){

	disp.setFill(rgb(1));
	disp.fullRect();

	// disp.setStroke(rgb(0,.05));
	// for(let a=0;a<200;a+=3){
	// 	for(let b=0;b<200;b+=3){
	// 		if(b<a){
	// 			let dir=Vec(200,b).sub([0,a]);
	// 			if(b+dir.y<0){
	// 				disp.setStroke(rgb(1,0,0,.05));
	// 				disp.setFill(rgb(1,0,0,5));
	// 			}else{
	// 				disp.setStroke(rgb(0,1,0,.05));
	// 				disp.setFill(rgb(0,1,0,5));
					
	// 			}
	// 			disp.start();
	// 			disp.mt(0,a);
	// 			disp.lt(200,b);
	// 			disp.lt(dir.cln().add([200,b]));
	// 			// disp.path();
	// 			disp.noStroke();
	// 			// disp.rect(a,b,3,3);
	// 			disp.rect(lineSpace([0,a],[200,b]),3,3);
	// 		}
	// 	}
	// }
	let mp=disp.view.transformInv(ctrl.mousePos());
	
	
	// [startA,startB,endA,endB].map(p=>p.rot(.01,pin));

	let closestIdx=0;
	[startA,startB,endA,endB,pin]
		.map(p=>p.mag(mp))
		.reduce((a,b,i)=>{
			if(a>b){
				closestIdx=i;
				return b;
			}
			return a;
		});
	
	let selectedPoint=[startA,startB,endA,endB,pin][closestIdx];
	
	disp.setStroke(rgb(0,1,0));
	disp.circ(selectedPoint,10);
	
	disp.setStroke(rgb(0,0,1));
	disp.circ(pin,6);
	
	if(ctrl.mouseDown()){
		selectedPoint.set(mp);
	}

	// {
	// 	disp.setStroke(rgb(0,.05));
	// 	let startDist=startA.mag(startB);
	// 	for(let a=0;a<startDist;a+=5){
	// 		let endDist=endA.mag(endB);
	// 		for(let b=0;b<endDist;b+=5){
	// 			let p1=Vec(startA).mix(startB,a/startDist);
	// 			let p2=Vec(endA).mix(endB,b/endDist);

	// 			disp.start();
	// 			disp.mt(p1);
	// 			disp.lt(p2);
	// 			disp.path();
	// 		}
	// 	}
	// }
	// {
	// 	disp.setFill(rgb(1,0,0,1));
	// 	disp.noStroke();
	// 	let startDist=startA.mag(startB);
	// 	for(let a=0;a<startDist;a+=5){
	// 		let endDist=endA.mag(endB);
	// 		for(let b=0;b<endDist;b+=5){
	// 			let p1=Vec(startA).mix(startB,a/startDist);
	// 			let p2=Vec(endA).mix(endB,b/endDist);
	// 			disp.setFill(rgb(1,0,0,1));
	// 			disp.rect(lineSpace2(p1,p2),3,3);
	// 		}
	// 	}
	// }
	{
		disp.setStroke(rgb(0,.02));
		for(let a=0;a<1;a+=.01){
			for(let b=0;b<1;b+=.01){
				let l1=Vec(startA).mix(startB,a);
				let l2=Vec(endA).mix(endB,a);
				let p=l1.mix(l2,b);

				disp.start();
				disp.line(realSpace2(p));
				disp.path();
			}
		}
	}
	{

		disp.setFill(rgb(0,1,0,1));
		disp.noStroke();
		for(let a=0;a<1;a+=.05){
			for(let b=0;b<1;b+=.05){
				let l1=Vec(startA).mix(startB,a);
				let l2=Vec(endA).mix(endB,a);
				let p=l1.mix(l2,b);

				disp.rect(p,3,3);
			}
		}
	}
	// {
	// 	disp.setStroke(rgb(0,.05));
	// 	for(let a=0;a<100;a++){
	// 		for(let b=0;b<100;b++){
	// 			let p1=VecA(100,a/100*TAU).add(mp);
	// 			let p2=VecA(100,b/100*TAU).add(mp);

	// 			disp.start();
	// 			disp.mt(p1);
	// 			disp.lt(p2);
	// 			disp.path();

	// 			disp.setFill(rgb(1,0,0,1));
	// 			disp.rect(lineSpace2(p1,p2),3,3);
	// 		}
	// 	}
	// }

	let p1=Vec(50,200);
	let p2=mp;
	disp.setStroke(rgb(0));

	disp.start();
	disp.line(realSpace2(mp));
	disp.path();

	disp.setStroke(rgb(1,0,0,.5));
	disp.noFill();
	disp.rect(-100,-100,200,200);
	disp.start();
	disp.mt(0,-1000);
	disp.lt(0,1000);
	disp.path();
}

function lineSpace(p1,p2){
	p1=Vec(p1);
	p2=Vec(p2);

	let offset=100;
	let y=p2.y - (p2.y-p1.y) * (p2.x/(p2.x-p1.x));
	let y2=p2.y - (p2.y-p1.y) * ((p2.x-offset)/(p2.x-p1.x));
	return Vec(y2,y);
	// return Vec(y,(y2-y)/offset*100);
}
function lineSpace2(p1,p2){
	p1=Vec(p1);
	p2=Vec(p2);

	let offset=100;
	let y=p2.y - (p2.y-p1.y) * (p2.x/(p2.x-p1.x));
	let y2=p2.y - (p2.y-p1.y) * ((p2.x-offset)/(p2.x-p1.x));
	// return Vec(y,y2);
	return Vec((y2-y)/offset*100,y);
}
function realSpace2(p){
	let diff=Vec(1,p.x/100).nrm(1000);
	let p1=Vec(0,p.y).sub(diff);
	let p2=Vec(0,p.y).add(diff);
	return [p1,p2];
}

function lineSpace3(p1,p2){
	p1=Vec(p1);
	p2=Vec(p2);

	let a=p1.ang(p2);
	p1.rot(-a);
	p2.rot(-a);
	let h=p1.y;

	let r=100;
	let w=sqrt(r*r-h*h);

	p1.x=w;
	p2.x=-w;
	p1.rot(a);
	p2.rot(a);
	
	// display.setStroke(rgb(1,0,0));
	// display.start();
	// display.mt(p1);
	// display.lt(p2);
	// display.path();

	return Vec(p1.ang()/PI*100,p2.ang()/PI*100);
	// return Vec(p1.y,a*100);
}