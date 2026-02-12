
let startA=Vec(150,0);
let startB=Vec(150,100);
let endA=Vec(250,100);
let endB=Vec(250,0);
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
	
	
	[startA,startB,endA,endB].map(p=>p.rot(.01,pin));

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

	{
		disp.setStroke(rgb(0,.05));
		let startDist=startA.mag(startB);
		for(let a=0;a<startDist;a+=5){
			let endDist=endA.mag(endB);
			for(let b=0;b<endDist;b+=5){
				let p1=Vec(startA).mix(startB,a/startDist);
				let p2=Vec(endA).mix(endB,b/endDist);

				disp.start();
				disp.mt(p1);
				disp.lt(p2);
				disp.path();
			}
		}
	}
	{
		disp.setFill(rgb(1,0,0,1));
		disp.noStroke();
		let startDist=startA.mag(startB);
		for(let a=0;a<startDist;a+=5){
			let endDist=endA.mag(endB);
			for(let b=0;b<endDist;b+=5){
				let p1=Vec(startA).mix(startB,a/startDist);
				let p2=Vec(endA).mix(endB,b/endDist);
		disp.setFill(rgb(1,0,0,1));
				disp.rect(lineSpace(p1,p2),3,3);
		disp.setFill(rgb(0,1,0,1));
				disp.rect(lineSpace2(p1,p2),3,3);
			}
		}
	}

	// let p1=Vec(100,200);
	// let p2=disp.view.transformInv(ctrl.mousePos());
	// disp.setStroke(rgb(0));
	// disp.start();
	// disp.mt(p1);
	// disp.lt(p2);
	// disp.path();

	// disp.rect(lineSpace(p1,p2),3,3);
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
	return Vec(y,y2);
	// return Vec(y,(y2-y)/offset*100);
}
function lineSpace2(p1,p2){
	p1=Vec(p1);
	p2=Vec(p2);

	let offset=100;
	let y=p2.y - (p2.y-p1.y) * (p2.x/(p2.x-p1.x));
	let y2=p2.y - (p2.y-p1.y) * ((p2.x-offset)/(p2.x-p1.x));
	// return Vec(y,y2);
	return Vec(y,(y2-y)/offset*100);
}