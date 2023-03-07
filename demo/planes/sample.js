
class Ball extends Entity{
	constructor(p,s){
		super();
		this.pos=Vec(p);
		this.velo=Vec(0,0);
		this.size=s;
		this.health=100000;
		this.hb=[];
		this.calcHitbox();
		
		this.texPos=Vec(1,141);
		this.texSize=Vec(59,59);
	}
	getClosest(vec){
		return vec.cln().sub(this.pos).lim(this.size).add(this.pos);
	}
	getDist(vec){
		return this.pos.mag(vec)-this.size;
	}
	calcHitbox(){
		let min=this.pos.cln();
		let max=this.pos.cln();
		min.sub(this.size);
		max.add(this.size);
		this.hb=[min,max];
	}
	getHitbox(){
		return this.hb;
	}
	hit(target){
		this.velo.add(
			this.pos.cln().sub(target.pos).nrm(0.5)
		);
	}
	run(){
		super.run();
		this.pos.add(this.velo);
		// this.velo.add(Vec(0,0.1));
		this.velo.scl(0.95);
		// let bounds=Vec(1000,500);
		// if(this.pos.y+this.size>bounds.y){
		// 	this.velo.y=-Math.abs(this.velo.y*0.5);
		// 	this.pos.y=bounds.y-this.size;
		// }
		// if(this.pos.x-this.size<0){
		// 	this.velo.x=Math.abs(this.velo.x*0.5);
		// 	this.pos.x=this.size;
		// }else if(this.pos.x+this.size>bounds.x){
		// 	this.velo.x=-Math.abs(this.velo.x*0.5);
		// 	this.pos.x=bounds.x-this.size;
		// }
		this.calcHitbox();
	}
	display(disp){
		// disp.setStroke("#101010");
		// disp.noFill();
		// disp.circle2(this.pos.x,this.pos.y,this.size);
		renderer.img(
			this.pos.x,this.pos.y,
			this.size*2,this.size*2,
			0,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			false);
		gameRunner.shadow(this.pos.x,this.pos.y,this.size);
	}
}
class Box extends Entity{
	constructor(p,s,a){
		super();
		this.pos=Vec(p);
		this.velo=Vec(0,0);
		this.size=Vec(s);
		this.hb=[];
		this.calcHitbox();
		this.angle=a;
	}
	getClosest(vec){
		//TODO: if within then just return the point
		let v=vec.cln().sub(this.pos).rot(-this.angle);
		let s=v.cln().sign();
		v.abs();
		if(v.x<this.size.x&&v.y<this.size.y){
			if(v.x-this.size.x>v.y-this.size.y){
				v.x=this.size.x;
			}else{
				v.y=this.size.y;
			}
		}else{
			v.min(this.size);
		}
		return v.scl(s).rot(this.angle).add(this.pos);
	}
	getDist(vec){
		let v=vec.cln().sub(this.pos).rot(-this.angle);
		v.abs();
		if(v.x<this.size.x&&v.y<this.size.y){
			return Math.max(v.x-this.size.x,v.y-this.size.y);
		}else{
			let v2=v.cln();
			v.min(this.size);
			return v2.mag(v);
		}
	}
	calcHitbox(){
		let c1=this.size.cln().rot(this.angle);
		let c2=this.size.cln().scl(Vec(-1,1)).rot(this.angle);
		let c3=this.size.cln().scl(Vec(-1,-1)).rot(this.angle);
		let c4=this.size.cln().scl(Vec(1,-1)).rot(this.angle);
		let min=c1.cln().min(c2).min(c3).min(c4);
		let max=c1.cln().max(c2).max(c3).max(c4);
		min.add(this.pos);
		max.add(this.pos);
		this.hb=[min,max];
	}
	getHitbox(){
		return this.hb;
	}
	hit(target){
		this.velo.add(
			this.pos.cln().sub(target.pos).nrm(0.5)
		);
	}
	run(){
		super.run();
		this.pos.add(this.velo);
		// this.velo.add(Vec(0,0.1));
		this.velo.scl(0.95);
		let bounds=Vec(1000,1000);
		if(this.pos.y>bounds.y){
			this.velo.y=-Math.abs(this.velo.y*0.5);
			this.pos.y=bounds.y;
		}
		if(this.pos.x<0){
			this.velo.x=Math.abs(this.velo.x*0.5);
			this.pos.x=0;
		}else if(this.pos.x>bounds.x){
			this.velo.x=-Math.abs(this.velo.x*0.5);
			this.pos.x=bounds.x;
		}
		this.calcHitbox();
	}
	display(disp){
		let hb=this.getHitbox();
		disp.setStroke("#101010");
		disp.noFill();
		disp.start();
		let r=this.size.cln().rot(this.angle);
		disp.mt2(this.pos.x+r.x,this.pos.y+r.y);
		r=this.size.cln().scl(Vec(-1,1)).rot(this.angle);
		disp.lt2(this.pos.x+r.x,this.pos.y+r.y);
		r=this.size.cln().scl(Vec(-1,-1)).rot(this.angle);
		disp.lt2(this.pos.x+r.x,this.pos.y+r.y);
		r=this.size.cln().scl(Vec(1,-1)).rot(this.angle);
		disp.lt2(this.pos.x+r.x,this.pos.y+r.y);
		disp.path();
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}