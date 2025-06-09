
class Triangle{
	constructor(mid){
		this.corners=[Vec(0,0),Vec(1,0),mid]

		this.lines=this.corners.map((v,i,arr)=>
			[v,arr[(i+1)%arr.length]]
		);

		this.lengths=this.corners.map((v,i,arr)=>v.mag(arr[(i+1)%arr.length]));
		this.angles=this.corners.map((v,i,arr)=>v.ang(arr[(i+1)%arr.length]));
		this.turns=this.angles.map((a,i,arr)=>a-arr[mod(i-1,arr.length)]+PI);
	}

	drawRay(x,rayAng,disp){
		let pathIdx=0;
		let path=[];

		let balance=[0,0,0];

		let dir=true;
		let lineIdx=0;
		let ang=-rayAng;
		let pos=this.corners[1].cln().sub(Vec(x,0)).rot(-rayAng);
		let anchor=this.corners[0].cln().sub(Vec(x,0)).rot(-rayAng);
		let invert=false;

		disp.noFill();
		disp.setStroke("red");
		disp.setWeight(2);

		disp.start();
		disp.line([[x,0],VecA(5,rayAng+PI/2.).add([x,0])]);
		disp.path();
		
		for(let i=0;i<100;i++){
			if(dir){
				let nextLength=invert
					?this.lengths[lineIdx]
					:this.lengths[mod(lineIdx-1,3)];
				 
				let nextAng=ang-this.turns[lineIdx];
				let nextPos=anchor.cln().add(VecA(
					nextLength,
					nextAng
				));
				
				if(nextPos.x>0.){
					balance[lineIdx]++;
					
					disp.setStroke("white");
					disp.start();
					disp.line([pos.cln().rot(rayAng).add([x,0]),nextPos.cln().rot(rayAng).add([x,0])]);
					disp.path();

					disp.setStroke("green");
					disp.start();
					disp.line([anchor.cln().rot(rayAng).add([x,0]),nextPos.cln().rot(rayAng).add([x,0])]);
					disp.path();
					
					ang=nextAng;
					pos=nextPos;
					invert=!invert;
					path[pathIdx++]=false;
				}else{
					dir=!dir;
					anchor=pos;
					ang=ang+PI;
					if(invert){
						lineIdx=mod(lineIdx-1,3);
					}else{
						lineIdx=mod(lineIdx+1,3);
					}
				}
			}else{
				let nextLength=invert
					?this.lengths[mod(lineIdx-1,3)]
					:this.lengths[lineIdx];

				let nextAng=ang+this.turns[lineIdx];
				let nextPos=anchor.cln().add(VecA(
					nextLength,
					nextAng
				));
				if(nextPos.x<0.){
					balance[lineIdx]--;

					disp.setStroke("white");
					disp.start();
					disp.line([pos.cln().rot(rayAng).add([x,0]),nextPos.cln().rot(rayAng).add([x,0])]);
					disp.path();
					
					disp.setStroke("green");
					disp.start();
					disp.line([anchor.cln().rot(rayAng).add([x,0]),nextPos.cln().rot(rayAng).add([x,0])]);
					disp.path();

					ang=nextAng;
					pos=nextPos;
					invert=!invert;
					path[pathIdx++]=true;
				}else{
					dir=!dir;
					anchor=pos;
					ang=ang+PI;
					if(invert){
						lineIdx=mod(lineIdx+1,3);
					}else{
						lineIdx=mod(lineIdx-1,3);
					}
				}
			}
			if(i!=0&&balance[0]==0&&balance[1]==0&&balance[2]==0){
				let start=this.corners[Number(invert)];
				return path;
			}
		}
		return null;
	}

	drawTri(disp){
		disp.noFill();
		disp.setStroke("white");
		disp.setWeight(2);

		disp.start();
		disp.line(this.corners);
		disp.path(true);
	}
}