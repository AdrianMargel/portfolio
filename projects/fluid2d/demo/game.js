class Game{
	constructor(){
		this.board=new Board();
		this.particles=new Array(2000).fill().map(()=>
			new Particle(new Vector(80*Math.random(),80*Math.random()))
		);
	}
	run(ctrl){
		for(let t=0;t<1;t++){
			this.board.prime();
			this.particles.forEach(p=>{
				p.flip(this.board);
				p.mark(this.board);
			});
			this.particles.forEach(p=>p.run1(this.board,ctrl));
			this.particles.forEach(p=>p.run2(this.board,ctrl));
		}
		if(ctrl.isKeyDown("A")){
			this.particles.push(new Particle(
				new Vector(5*Math.random()+40,5*Math.random()+10)
			));
		}
	}
	display(disp){
		disp.reset();
		disp.clear();

		disp.noStroke();
		// this.board.display(disp);
		disp.setFill("#FFFFFF50");
		this.particles.forEach(p=>p.display(disp));

		let mPos=gameControl.getMouse(gameDisplay.cam);
		disp.setStroke("#FFFFFF");
		disp.noFill();
		disp.circle(mPos.x,mPos.y,15,15);
	}
}
class Board{
	constructor(){
		this.size=new Vector(80,80);
		this.grid=new Array(this.size.x).fill().map((_,x)=>
			new Array(this.size.y).fill().map(
				(__,y)=>new Tile(x,y)
			)
		);
	}
	prime(){
		this.grid.forEach(arr=>
			arr.forEach(item=>
				item.prime()
			)
		);
	}
	getTile(pos){
		let x=Math.floor(pos.x);
		let y=Math.floor(pos.y);
		return this.grid[x]?.[y]??null;
	}
	display(disp){
		this.grid.forEach(arr=>
			arr.forEach(item=>
				item.display(disp)
			)
		);
	}
}
class Tile{
	constructor(x,y){
		this.x=x;
		this.y=y;
		this.val=0;
		this.particles=[];
	}
	prime(){
		this.val=0;
		this.particles=[];
	}
	mark(p){
		this.val=p.pressure;
		this.particles.push(p);
	}
	getParticles(){
		return this.particles;
	}
	display(disp){
		if(this.val==0){
			return;
		}
		disp.noStroke();
		let val=Math.max(Math.min(this.val/5,1),0)*255;
		disp.setFill(rgbToHex(val,val,val));
		disp.rect(this.x,this.y,1,1);
	}
}
class Particle{
	constructor(p){
		this.size=1;
		this.pos=new Vector(p);
		this.velo=new Vector();
		this.nextVelo=this.velo.clnVec();
		this.gravity=new Vector(0,0.01);

		this.pressure=1;
		this.particles=[];
	}
	mark(board){
		let tile=board.getTile(this.pos);
		if(tile!=null){
			tile.mark(this);
		}
	}
	run1(board){
		this.particles=[];
		let range=this.size;
		let selfWeight=1;

		let totalP=0;
		for(let x=Math.floor(this.pos.x-range);x<=Math.floor(this.pos.x+range);x++){
			for(let y=Math.floor(this.pos.y-range);y<=Math.floor(this.pos.y+range);y++){
				let tile=board.getTile(new Vector(x,y));
				if(tile!=null){
					tile.getParticles(this).forEach(p=>{
						if(p==this){
							let w=selfWeight;
							this.particles.push({w,p});
							totalP+=w;
							return;
						}
						let dist=p.pos.getMag(this.pos);
						if(dist>range){
							return;
						}
						let w=(range-dist)/range;
						this.particles.push({w,p});
						totalP+=w;
					});
				}
			}
		}
		this.pressure=totalP;
	}
	run2(board,ctrl){
		let repel=1.0;
		// let repel2=0.05;
		let attract=5;
		let attractMax=2;

		let avgVelo=new Vector();
		let avgPos=new Vector();
		// let totalV=0;
		let forceVec=new Vector();
		let totalW=0;

		this.particles.forEach(store=>{
			let p=store.p;
			let w=store.w;
			if(p==this){
				let weight=p.pressure*w;
				totalW+=weight;
				avgVelo.addVec(p.velo.clnVec().sclVec(weight));
				avgPos.addVec(p.pos.clnVec().sclVec(weight));
				// totalV+=p.velo.getMag()*weight;
				return;
			}
			let ang=p.pos.getAng(this.pos);
			let weight=p.pressure*w;
			totalW+=weight;

			// let pDiff=p.pos.clnVec().subVec(this.pos);
			// let vDiff=p.velo.clnVec().subVec(this.velo);
			// let pdAng=pDiff.getAng();
			// vDiff.rotVec(-pdAng);
			// vDiff.y=0;
			// vDiff.rotVec(pdAng);
			// damp.addVec(vDiff.sclVec(weight));

			forceVec.addVec(new Vector(ang,weight,true));
			avgVelo.addVec(p.velo.clnVec().sclVec(weight));
			avgPos.addVec(p.pos.clnVec().sclVec(weight));
			// totalV+=p.velo.getMag()*weight;
		});

		// let forceVec2=forceVec.clnVec().sclVec(repel2).limVec(repel);
		let pullVec=new Vector();
		let grav=this.gravity.clnVec();
		if(totalW>0){
			avgVelo.sclVec(1/totalW);
			avgPos.sclVec(1/totalW);
			forceVec.sclVec(1/totalW);
			// grav.sclVec(1/totalW);
			
			pullVec=avgPos.subVec(this.pos);
			pullVec.sclVec(1/Math.max(totalW,attract/attractMax));
			// totalV/=totalW;
		}
		// let chaos=0;
		// if(totalV>0){
		// 	chaos=avgVelo.getMag()/totalV;
		// }
		// chaos=1;

		this.nextVelo=avgVelo
			.addVec(forceVec.sclVec(repel))
			.addVec(pullVec.sclVec(attract));

		// grav.sclVec(Math.max(1-(totalW-selfWeight),0));
		this.nextVelo.addVec(grav);

		// this.nextVelo.addVec(new Vector(Math.random()*TAU,Math.random()*0.01,true));

		let mPos=ctrl.getMouse(gameDisplay.cam);
		if(mPos.inRange(this.pos,15)){
			// this.nextVelo.addVec(mPos.subVec(this.pos).nrmVec(-0.1))
		}
		let offA=ctrl.isKeyDown("D")?PI/3:0;
		for(let a=0;a<=20;a++){
			let shove=mPos.clnVec().addVec(new Vector(a/20*PI+offA,25,true));
			if(shove.inRange(this.pos,5)){
				this.nextVelo.addVec(shove.subVec(this.pos).nrmVec(-0.1))
			}
		}

		if(ctrl.isKeyDown("W")){
			if(Math.abs(this.pos.x-20)<10&&Math.abs(this.pos.y-60)<10){
				this.nextVelo.addVec(new Vector(0.1,0));
			}
		}
	}
	flip(board){
		this.velo=this.nextVelo.clnVec();

		this.pos.addVec(this.velo);

		let small=Math.random()*0.001;
		let bounce=1;
		if(this.pos.x<0){
			this.pos.x=small;
			this.velo.x=Math.abs(this.velo.x)*bounce;
		}else if(this.pos.x>board.size.x){
			this.pos.x=board.size.x-small;
			this.velo.x=-Math.abs(this.velo.x)*bounce;
		}
		if(this.pos.y<0){
			this.pos.y=small;
			this.velo.y=Math.abs(this.velo.y)*bounce;
		}else if(this.pos.y>board.size.y){
			this.pos.y=board.size.y-small;
			this.velo.y=-Math.abs(this.velo.y)*bounce;
		}
	}
	display(disp){
		// let val=Math.max(Math.min(this.pressure/5,1),0)*255;
		// disp.setFill(rgbToHex(val,val,val));
		disp.circle(this.pos.x,this.pos.y,this.size/2,this.size/2);
	}
}