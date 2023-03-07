class Tile{
	constructor(){
		//TODO: use weak maps so garbage collection isn't prevented
		this.arrays={
			"planes":[],
			"pBullets":[],
			"aliens":[],
			"aBullets":[],
			"specials":[]
		};
		this.time=0;
	}
	reset(){
		this.arrays={
			"planes":[],
			"pBullets":[],
			"aliens":[],
			"aBullets":[],
			"specials":[]
		};
	}
	mark(target,arrKey){
		if(this.time!=this.getTime()){
			this.time=this.getTime();
			this.reset();
		}
		this.arrays[arrKey].push(target);
	}
	getArr(arrKey){
		if(this.time!=this.getTime()){
			return [];
		}
		return this.arrays[arrKey];
	}
	collide(){
		let a1,a2;
		a1=this.arrays["planes"];
		a2=this.arrays["planes"];
		for(let i=0;i<a1.length;i++){
			for(let j=i+1;j<a2.length;j++){
				a1[i].tryHit(a2[j],true);
			}
		}
		a1=this.arrays["aliens"];
		a2=this.arrays["aliens"];
		for(let i=0;i<a1.length;i++){
			for(let j=i+1;j<a2.length;j++){
				a1[i].tryHit(a2[j],true);
			}
		}

		a1=this.arrays["specials"];
		for(let i=0;i<a1.length;i++){
			a1[i].runSpecial(this.arrays);
		}
	}
	getTime(){
		return gameRunner.time;
	}
}
class Map{
	constructor(s){
		this.scale=200;
		this.size=s.cln().div(this.scale).ceil();

		this.tiles=Array(this.size.x).fill().map(()=>
			Array(this.size.y).fill(null)
		);
		this.activeTiles=new Set();
	}
	prime(){
		this.activeTiles=new Set();
	}
	mark(x,y,target,arrKey){
		let t=this.getTile2(x,y);
		t.mark(target,arrKey);
		this.activeTiles.add(t);
	}
	collide(){
		this.activeTiles.forEach(t=>{
			t.collide();
		});
	}
	getTile(x,y){
		x=mod(Math.floor(x/this.scale),this.size.x);
		y=mod(Math.floor(y/this.scale),this.size.y);
		let t=this.tiles[x][y];
		if(t==null){
			t=new Tile();
			this.tiles[x][y]=t;
		}
		return t;
	}
	getTile2(x,y){
		x=mod(x,this.size.x);
		y=mod(y,this.size.y);
		let t=this.tiles[x][y];
		if(t==null){
			t=new Tile();
			this.tiles[x][y]=t;
		}
		return t;
	}
}
class Entity{
	constructor(){
		this.hits=null;
		this.prime();
		this.alive=true;
		this.health=1;
	}
	prime(){
		this.hits=new Set([this]);
	}
	mark(map,arrKey){
		let hb=this.getHitbox();
		let hb2=[
			hb[0].cln().div(map.scale).flr(),
			hb[1].cln().div(map.scale).ceil()
		];
		for(let x=hb2[0].x;x<hb2[1].x;x++){
			for(let y=hb2[0].y;y<hb2[1].y;y++){
				map.mark(x,y,this,arrKey);
			}
		}
	}
	runSpecial(arrays){
	}
	tryHit(target,symmetrical,special){
		if(!this.alive)
			return;
		if(!this.hits.has(target)){
			this.hits.add(target);
			if(aabb(target.getHitbox(),this.getHitbox())){
				if(this.getDist(target.getClosest(this.pos))<0
					||target.getDist(this.getClosest(target.pos))<0){
					this.hit(target,special);
					if(symmetrical){
						target.assertHit(this,special);
					}
				}
			}
		}
	}
	assertHit(target,special){
		this.hits.add(target);
		this.hit(target,special);
	}

	getClosest(vec){
	}
	getDist(vec){
	}
	getHitbox(){
	}
	hit(target,special){
	}
	hurt(damage,damager){
		this.health-=damage;
	}
	run(){
		if(this.alive){
			this.alive=this.health>0;
			if(!this.alive){
				this.die();
			}
		}
	}
	die(){
	}
	display(disp){
	}
	displayHitbox(disp){
		let hb=this.getHitbox();
		disp.setStroke("#101010");
		disp.noFill();
		disp.rect2(hb[0].x,hb[0].y,hb[1].x-hb[0].x,hb[1].y-hb[0].y);
	}
	getPos(){//TODO: make pos and velo part of entity class constructor
		return this.pos.cln();
	}
	getVelo(){
		return this.velo.cln();
	}
	shove(toShove){
		return this.velo.add(toShove);
	}
}
class Bullet extends Entity{
	constructor(p,v,d,s,r){
		super();
		this.pos=Vec(p);
		this.velo=Vec(v);
		this.damage=d;
		this.size=s;
		this.range=r;
		this.age=0;
		this.hb=[];
		this.calcHitbox();
		this.resistanceWater=0.96;
		this.buoyancy=Vec(0,0.2);
		this.submerged=true;

		this.waveSize=0.5;
		this.splashSize=1;
		this.hasTrail=true;
	}
	trace(map,arrKey){
		let entities=new Set();
		let hb=this.getVeloHitbox();
		let hb2=[
			hb[0].cln().div(map.scale).flr(),
			hb[1].cln().div(map.scale).ceil()
		];
		for(let x=hb2[0].x;x<hb2[1].x;x++){
			for(let y=hb2[0].y;y<hb2[1].y;y++){
				map.getTile2(x,y).getArr(arrKey).forEach(e=>{
					entities.add(e);
				});
			}
		}
		let targets=[...entities];

		let start=this.pos.cln();
		let step=0;
		let minStep=this.size/2;
		let speed=this.velo.mag();
		traceLoop:
		for(let d=0;d<=speed;d+=step){
			let stepV=this.velo.cln().nrm(d);
			this.pos=start.cln().add(stepV);

			// let smallest=null;
			let sDist=Infinity;
			for(let i=0;i<targets.length;i++){
				let dist=this.getDist(targets[i].getClosest(this.pos));
				if(dist<sDist){
					// smallest=targets[i];
					sDist=dist;
					if(dist<=0){
						this.hit(targets[i]);
						break traceLoop;
					}
				}
			}
			step=Math.max(sDist,minStep);
		}
		this.pos=start;
	}
	getClosest(vec){
		return vec.cln().sub(this.pos).nrm(this.size).add(this.pos);
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
	getVeloHitbox(){
		let start=this.pos.cln();
		let end=this.pos.cln().add(this.velo);
		let min=start.cln().min(end);
		let max=start.cln().max(end);
		min.sub(this.size);
		max.add(this.size);
		return [min,max];
	}
	hit(target){
		gameRunner.explode(this.pos.x,this.pos.y,this.velo.x,this.velo.y,this.damage/4.);
		target.hurt(this.damage,this);
		this.alive=false;
	}
	runBase(){
		super.run();
		this.age++;
		if(this.age>this.range){
			this.alive=false;
		}
	}
	run(){
		this.runBase();
		if(gameRunner.isUnderwater(this.pos.x,this.pos.y)){
			let slowed=this.velo.cln();
			this.velo.scl(this.resistanceWater);
			slowed.sub(this.velo);
			gameRunner.wave(this.pos.x,this.pos.y,100,slowed.mag()*this.waveSize);
			if(!this.submerged){
				gameRunner.splash(this.pos.x,this.pos.y,slowed.x,slowed.y,slowed.mag()*this.splashSize);
			}
			this.submerged=true;
			this.velo.add(this.buoyancy);
		}else{
			if(this.hasTrail){
				this.submerged=false;
				let m=this.velo.mag();
				for(let v=0;v<m;v+=20){
					let p=this.velo.cln().nrm(v).add(this.pos);
					gameRunner.cloud(p.x,p.y,255,255,255,10);
					// this.time=(this.time??0)+1;
					// let col=hsv((this.time%100)/100,1,1).toRgb().scl(255);
					// gameRunner.cloud(p.x,p.y,col.x,col.y,col.z,255);
				}
			}
		}
	}
	move(){
		this.pos.add(this.velo);
		this.calcHitbox();
	}
	display(disp){
		bulletRenderer.line(this.pos.x,this.pos.y,this.size,this.velo.x,this.velo.y,this.age,
			.9,.5,.2
		);
	}
	displayVeloHitbox(disp){
		let hb=this.getVeloHitbox();
		disp.setStroke("#101010");
		disp.noFill();
		disp.rect2(hb[0].x,hb[0].y,hb[1].x-hb[0].x,hb[1].y-hb[0].y);
	}
}
//TODO: explosion range
class Bomb extends Bullet{
	constructor(p,v,d,s,r){
		super(p,v,d,s,r);
		this.gravity=Vec(0,1);
		this.resistanceWater=0.93;
		this.buoyancy=Vec(0,-0.2);

		this.waveSize=0.25;
		this.splashSize=0.5;

		this.texSize=Vec(13,7);
		this.texPos=Vec(18,168);
		this.displaySize=Vec(1,this.texSize.y/this.texSize.x).scl(s).scl(2);
		this.hasTrail=false;
	}
	run(){
		this.runBase();
		this.velo.add(this.gravity);
		if(gameRunner.isUnderwater(this.pos.x,this.pos.y)){
			let slowed=this.velo.cln();
			this.velo.scl(this.resistanceWater);
			slowed.sub(this.velo);
			gameRunner.wave(this.pos.x,this.pos.y,100,slowed.mag()*this.waveSize);
			if(!this.submerged){
				gameRunner.splash(this.pos.x,this.pos.y,slowed.x,slowed.y,slowed.mag()*this.splashSize);
			}
			this.submerged=true;
			this.velo.add(this.buoyancy);
		}else{
			this.submerged=false;
		}
	}
	display(disp){
		renderer.img(
			this.pos.x,this.pos.y,
			this.displaySize.x,this.displaySize.y,
			this.velo.ang(),
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			false);
	}
}
class FlowerPot extends Bomb{
	constructor(p,v,d,s,r){
		super(p,v,d,s,r);
		this.gravity=Vec(0,0.5);
		this.resistanceWater=0.93;
		this.buoyancy=Vec(0,-0.3);
		
		this.waveSize=0.5;
		this.splashSize=1;

		this.flowerSize=Vec(7,8).scl(2);
		let flowerIdx=Math.floor(Math.random()*6);
		switch(flowerIdx){
			case 0:
				this.flowerTexSize=Vec(7,8);
				this.flowerTexPos=Vec(42,171);
				break;
			case 1:
				this.flowerTexSize=Vec(7,8);
				this.flowerTexPos=Vec(50,171);
				break;
			case 2:
				this.flowerTexSize=Vec(5,8);
				this.flowerTexPos=Vec(58,171);
				break;
			case 3:
				this.flowerTexSize=Vec(9,8);
				this.flowerTexPos=Vec(64,171);
				break;
			case 4:
				this.flowerTexSize=Vec(12,8);
				this.flowerTexPos=Vec(74,171);
				break;
			case 5:
				this.flowerTexSize=Vec(2,8);
				this.flowerTexPos=Vec(87,171);
				break;
		}

		this.texSize=Vec(9,8);
		this.texPos=Vec(32,167);
		
		let scale=s/this.texSize.x;

		this.flowerSize=this.flowerTexSize.cln().scl(scale).scl(2);
		this.displaySize=Vec(9,8).scl(scale).scl(2);
	}
	display(disp){
		renderer.img(
			this.pos.x,this.pos.y,
			this.displaySize.x,this.displaySize.y,
			this.velo.ang()-PI/2,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			false);
		renderer.img(
			this.pos.x,this.pos.y,
			this.flowerSize.x,this.flowerSize.y,
			this.velo.ang()-PI/2,
			this.flowerTexPos.x,
			this.flowerTexPos.y,
			this.flowerTexSize.x,
			this.flowerTexSize.y,
			false,
			0,-this.flowerSize.y);
	}
}
class BigBomb extends Bomb{
	constructor(p,v,d,s,r){
		super(p,v,d,s,r);
		this.gravity=Vec(0,1);
		this.resistanceWater=0.93;
		this.buoyancy=Vec(0,-0.1);
		
		this.waveSize=0.5;
		this.splashSize=1;

		this.texSize=Vec(20,9);
		this.texPos=Vec(23,147);
		this.displaySize=Vec(1,this.texSize.y/this.texSize.x).scl(s).scl(2);
	}
}
class HugeBomb extends Bomb{
	constructor(p,v,d,s,r){
		super(p,v,d,s,r);
		this.gravity=Vec(0,1);
		this.resistanceWater=0.93;
		this.buoyancy=Vec(0,0);

		this.waveSize=1;
		this.splashSize=1.25;

		this.texSize=Vec(45,11);
		this.texPos=Vec(44,147);
		this.displaySize=Vec(1,this.texSize.y/this.texSize.x).scl(s).scl(2);
	}
}
class Nuke extends Bomb{
	constructor(p,v,d,s,r){
		super(p,v,d,s,r);
		this.gravity=Vec(0,1);
		this.resistanceWater=0.93;
		this.buoyancy=Vec(0,0);

		this.waveSize=2;
		this.splashSize=1.5;

		this.texSize=Vec(76,39);
		this.texPos=Vec(193,293);
		this.displaySize=Vec(1,this.texSize.y/this.texSize.x).scl(s).scl(2);
	}
}
class BulletLite extends Bullet{
	constructor(p,v,d,s,r){
		super(p,v,d,s,r);
		this.waveSize=0.2;
		this.splashSize=1;
	}
}
class BulletExtraLite extends Bullet{
	constructor(p,v,d,s,r){
		super(p,v,d,s,r);
		this.waveSize=0.01;
		this.splashSize=0;
	}
}
class AlienBullet extends Bullet{
	constructor(p,v,d,s,r){
		super(p,v,d,s,r);
		this.waveSize=0.1;
		this.splashSize=1;
		this.hasTrail=false;
	}
	display(disp){
		bulletRenderer.line(this.pos.x,this.pos.y,this.size,this.velo.x,this.velo.y,this.age,
			.3,.6,.1
		);
	}
}
class Particle extends Entity{
	constructor(p,v,s,d,col,air,initialAge=0){
		super();
		this.pos=Vec(p);
		this.velo=Vec(v);
		this.size=s;
		this.duration=d;
		this.age=initialAge;
		this.color=col;
		this.airOnly=air;
	}
	run(){
		this.pos.add(this.velo);
		this.age++;
		if(this.age>this.duration){
			this.alive=false;
		}
	}
	display(){
		particleRenderer.spot(
			this.pos.x,this.pos.y,
			this.size*(1-this.age/this.duration),
			this.velo.x,this.velo.y,
			this.color.x,this.color.y,this.color.z,
			this.airOnly);
	}
}
class SplashParticle extends Particle{
	constructor(p,v,s,d){
		super(p,v,s,d,rgb(1,1,1),1);
		this.gravity=Vec(0,.8);
	}
	run(){
		super.run();
		if(!gameRunner.isUnderwater(this.pos.x,this.pos.y)){
			this.velo.add(this.gravity);
		}
	}
}
class BubbleParticle extends Particle{
	constructor(p,v,s,d){
		super(p,v,s,d,rgb(1.2,1.2,1.2),-1);
		this.gravity=Vec(0,-1);
		this.resistance=0.9;
	}
	run(){
		super.run();
		if(gameRunner.isUnderwater(this.pos.x,this.pos.y)){
			this.velo.add(this.gravity);
			this.velo.scl(this.resistance);
		}else{
			this.alive=false;
		}
	}
	display(){
		particleRenderer.spot(
			this.pos.x,this.pos.y,
			this.size*(1-this.age/this.duration),
			0,0,
			this.color.x,this.color.y,this.color.z,
			this.airOnly);
	}
}
class ExplodeParticle extends Particle{
	constructor(p,v,s,d){
		let colS=rgb(.9,.5,.2).scl(3.);
		super(p,v,s,d,colS,0);
		this.colorStart=colS;
		this.colorEnd=rgb(.2,.2,.2);
	}
	run(){
		super.run();
		this.color=this.colorEnd.cln().mix(this.colorStart,
			Math.pow(1-this.age/this.duration,2)
		);
		gameRunner.cloud(this.pos.x,this.pos.y,50,50,50,5);
	}
}
class WreckParticle extends Particle{
	constructor(p,v,s,d){
		let colS=rgb(.9,.5,.2).scl(3.);
		super(p,v,s,d,colS,0);
		this.colorStart=colS;
		this.colorEnd=rgb(.2,.2,.2);
		this.gravity=Vec(0,0.5);
		this.resistance=0.95;
		this.resistanceWater=0.8;
	}
	run(){
		super.run();
		if(!this.alive){
			return;
		}
		if(gameRunner.isUnderwater(this.pos.x,this.pos.y)){
			this.velo.scl(this.resistanceWater);
		}else{
			this.velo.add(this.gravity).scl(this.resistance);
			gameRunner.cloud(this.pos.x,this.pos.y,50,50,50,100*(1-this.age/this.duration));
		}
		this.color=this.colorEnd.cln().mix(this.colorStart,
			Math.pow(1-this.age/this.duration,2)
		);
	}
	display(){
		particleRenderer.spot(
			this.pos.x,this.pos.y,
			this.size*(1-this.age/this.duration),
			0,0,
			this.color.x,this.color.y,this.color.z,
			this.airOnly);
	}
}
class ThrustParticle extends Particle{
	constructor(p,v,s,d,initialAge){
		let colS=rgb(.9,.5,.2).scl(3.);
		super(p,v,s,d,colS,0,initialAge);
		this.colorStart=colS;
		this.colorEnd=rgb(.6);
	}
	run(){
		super.run();
		this.velo.scl(0.95);
		this.color=this.colorEnd.cln().mix(this.colorStart,
			Math.pow(1-this.age/this.duration,15)
		);
	}
	display(){
		particleRenderer.spot(
			this.pos.x,this.pos.y,
			this.size*(1-this.age/this.duration),
			0,0,
			this.color.x,this.color.y,this.color.z,
			this.airOnly);
	}
}
class CloudMap{
	constructor(s){
		//the size of the cloud map
		this.size=s.cln();
		//the size of each cloud tile
		this.cloudSize=1000;
		//the resolution of each tile
		this.cloudRez=40;
		//the scale of the cloud size
		this.cloudScale=this.cloudSize/this.cloudRez;
		//the length of array within each tile
		this.cloudLength=(this.cloudRez**2)*4;
		this.cloudTimeLength=(this.cloudRez**2);
		//the size of the 2d array of tiles
		this.cloudDims=this.size.cln().div(this.cloudSize).ceil();

		this.clouds=Array(this.cloudDims.x).fill().map(()=>
			Array(this.cloudDims.y).fill(null)
		);
		this.cloudTimes=Array(this.cloudDims.x).fill().map(()=>
			Array(this.cloudDims.y).fill(null)
		);

		this.emptyCloud=new Uint8Array(this.cloudLength);
		this.emptyCloudTime=new Uint32Array(this.cloudTimeLength);

		this.cloudRenderDistance=Vec(8,8);
		this.visibleClouds=new Uint8Array(this.cloudLength*this.cloudRenderDistance.x*this.cloudRenderDistance.y);
		this.visibleCloudTimes=new Uint32Array(this.cloudTimeLength*this.cloudRenderDistance.x*this.cloudRenderDistance.y);

		//where the clouds stop
		this.topY=this.cloudDims.y*this.cloudSize;
	}
	cloud(x,y,r,g,b,a){
		if(y>0||y<-this.topY){
			return;
		}
		x=x/this.cloudScale;
		y=y/this.cloudScale;
		let metaPX=mod(Math.floor(x/this.cloudRez),this.cloudDims.x);
		let metaPY=mod(Math.floor(y/this.cloudRez),this.cloudDims.y);

		this.clouds[metaPX][metaPY]=this.clouds[metaPX][metaPY]??new Uint8Array(this.cloudLength);
		this.cloudTimes[metaPX][metaPY]=this.cloudTimes[metaPX][metaPY]??new Uint32Array(this.cloudTimeLength);

		let tilePX=Math.floor(mod(x,this.cloudRez));
		let tilePY=Math.floor(mod(y,this.cloudRez));
		let tileIdx=tilePX+tilePY*this.cloudRez;
		let idx=tileIdx*4;

		let tDelta=1.-clamp((this.getTime()-this.cloudTimes[metaPX][metaPY][tileIdx])/1000,0,1);

		this.cloudTimes[metaPX][metaPY][tileIdx]=this.getTime();

		let r1=this.clouds[metaPX][metaPY][idx];
		let g1=this.clouds[metaPX][metaPY][idx+1];
		let b1=this.clouds[metaPX][metaPY][idx+2];
		let a1=this.clouds[metaPX][metaPY][idx+3]*tDelta;

		let a2=(1-(1-a1/255)*(1-a/255))*255;
		let m=a/a2;

		this.clouds[metaPX][metaPY][idx]=mix(r1,r,m);
		this.clouds[metaPX][metaPY][idx+1]=mix(g1,g,m);
		this.clouds[metaPX][metaPY][idx+2]=mix(b1,b,m);
		this.clouds[metaPX][metaPY][idx+3]=a2;
	}
	getClouds(screenStart){
		let offsetX=Math.floor(screenStart.x/this.cloudSize);
		let offsetY=Math.floor(screenStart.y/this.cloudSize);
		for(let y=0;y<this.cloudRenderDistance.y;y++){
			for(let x=0;x<this.cloudRenderDistance.x;x++){
				let x1=x+offsetX;
				let y1=y+offsetY;
				let x3=mod(x1,this.cloudRenderDistance.x);
				let y3=mod(y1,this.cloudRenderDistance.y);

				let idx=this.cloudLength*x3 + this.cloudLength*y3*this.cloudRenderDistance.x;
				let idxT=this.cloudTimeLength*x3 + this.cloudTimeLength*y3*this.cloudRenderDistance.x;
				if(y1>0||y1<-this.clouds[0].length){
					this.visibleClouds.set(this.emptyCloud,idx);
					this.visibleCloudTimes.set(this.emptyCloudTime,idxT);
				}else{
					let x2=mod(x1,this.clouds.length);
					let y2=mod(y1,this.clouds[0].length);
					this.visibleClouds.set(
						this.clouds[x2][y2]??this.emptyCloud,
						idx
					);
					this.visibleCloudTimes.set(
						this.cloudTimes[x2][y2]??this.emptyCloudTime,
						idxT
					);
				}
			}
		}
		return {
			arr:this.visibleClouds,
			timeArr:this.visibleCloudTimes,
			width:this.cloudRenderDistance.x*this.cloudRez,
			metaWidth:this.cloudRenderDistance.x,
			metaHeight:this.cloudRenderDistance.y
		};
	}
	getTime(){
		return gameRunner.getTime();
	}
}
class Game{
	constructor(){
		this.time=0;
		this.avrVelo=0;
		this.size=new Vector(100000,8000);

		// this.player=new WrightFlyer(Vec(30,0),0.1);
		this.player=new Jet(Vec(30,0),0.1);
		this.player=new Raptor(Vec(30,0),0.1);

		// this.player=new Biplane(Vec(30,0),0.1);

		// this.player=new Bomber(Vec(30,0),0.1);
		// this.player=new BlackBird(Vec(30,0),0.1);

		// this.player=new BuzzBomb(Vec(30,0),0.1);//TODO
		// this.player=new WarPlane(Vec(30,0),0.1);
		// this.player=new Corsair(Vec(30,0),0.1);

		// this.player=new Slammer(Vec(30,0),0.1);//TODO
		// this.player=new Triebflugel(Vec(30,0),0.1);
		// this.player=new Rocket(Vec(30,0),0.1);

		// this.player=new Helicopter(Vec(30,0),0.1);
		// this.player=new Chopper(Vec(30,0),0.1);

		// this.player=new AirLiner(Vec(30,0),0.1);
		// this.player=new FlyingFortress(Vec(30,0),0.1);
		// this.player=new FlyingCastle(Vec(30,0),0.1);//TODO

		// this.player=new FlappyBird(Vec(30,0),0.1);
		// this.player=new NyanCat(Vec(30,0),0.1);//TODO

		// this.player=new PodRacer(Vec(30,0),0.1);//TODO

		// this.player=new FlyingHouse(Vec(30,0),0.1);
		// this.player=new HotAirBalloon(Vec(30,0),0.1);
		// this.player=new Zepplin(Vec(30,0),0.1);

		//serpant
		//dragon
		//mecha dragon
		
		this.planes=[
			this.player,
			// new Plane(Vec(50,40),Math.random()*TAU),
			// new Plane(Vec(20,25),Math.random()*TAU)
		];
		for(let i=0;i<100;i++){
			// this.planes.push(new Biplane(Vec(50,40),Math.random()*TAU));
		}
		this.aliens=[];
		this.pBullets=[];
		this.aBullets=[];
		this.particles=[];
		this.specials=[];

		this.director=new Director(this);

		this.map=new Map(this.size);
		this.cloudMap=new CloudMap(this.size);

		this.waterSize=100;
		this.waterline=Array(100).fill(0);//TODO: make it so this will work with non-square numbers
		this.waterlineVelo=Array(100).fill(0);

		this.shadowSize=1;
		this.shadowline=Array(10000);

		this.screenStart=Vec(0,0);
		this.screenEnd=Vec(0,0);
		this.bounce=Vec(0,0);
		this.bounceVelo=Vec(0,0);
	}
	getTime(){
		return this.time;
	}
	run(disp,ctrl){
		//TODO: correctly handle map/entity looping
		this.time++;
		// for(let i=0;i<1;i++){
		// 	this.pBullets.push(
		// 		new Bullet(
		// 			Vec(800,400),
		// 			Vec(-5,Math.random()*5-2.5).scl(0.5),
		// 			1,
		// 			10
		// 		)
		// 	);
		// }
		// let ms=ctrl.getMouse(disp.cam);
		// this.aliens[0].pos=ms;

		this.map.prime();

		this.director.run();

		runAndFilter(this.planes,a=>{
			if(a!=this.player){
				a.boost();
				a.shoot(this.pBullets);
			}
			a.prime();
			// a.boost();
			a.run();
			// a.shoot(this.pBullets);
			a.mark(this.map,"planes");
			return a.alive;
		});
		runAndFilter(this.aliens,a=>{
			// if(a!=this.player){
			// 	a.boost();
			// 	a.shoot(this.aBullets);
			// 	a.turn(Math.random()<0.5);
			// }
			// a.move(ctrl.getMouse(disp.cam));
			a.prime();
			a.run();
			a.mark(this.map,"aliens");
			return a.alive;
		});
		runAndFilter(this.pBullets,a=>{
			a.prime();
			a.run();
			a.trace(this.map,"aliens");
			a.move();
			a.mark(this.map,"pBullets");
			return a.alive;
		});
		runAndFilter(this.aBullets,a=>{
			a.prime();
			a.run();
			a.trace(this.map,"planes");
			a.move();
			a.mark(this.map,"aBullets");
			return a.alive;
		});
		runAndFilter(this.particles,a=>{
			a.run();
			return a.alive;
		});
		runAndFilter(this.specials,a=>{
			a.prime();
			a.mark(this.map,"specials");
			return a.alive;
		});

		this.map.collide();

		// for(let i=0;i<this.allies.length;i++){
		// 	for(let j=i+1;j<this.allies.length;j++){
		// 		this.allies[i].tryHit(this.allies[j],true);
		// 	}
		// }

		if(ctrl.mouseDown){
			this.player.shoot(this.pBullets);
        	this.player.boost();
        	// let agile=this.player.getAgility();
			// let posDiff=this.player.pos.cln();
			// posDiff.sub(ctrl.getMouse(disp.cam));
			//println(posDif.getAng()-p1.getAngle());
			this.player.face(ctrl.getMouse(disp.cam));
		}
		this.avrVelo=this.avrVelo*(49/50)+this.player.velo.mag()*(1/50);
		this.waterline=this.waterline.map((w,i)=>{
			let prev=this.waterline[mod(i-1,this.waterline.length)];
			let next=this.waterline[mod(i+1,this.waterline.length)];
			let avg=(prev+next)/2;
			this.waterlineVelo[i]+=(avg-w)*.2;
			this.waterlineVelo[i]-=w*.02;
			this.waterlineVelo[i]*=0.99;
			return Math.max(w+this.waterlineVelo[i],-500);
		});
		this.waterlineVelo=this.waterlineVelo.map((w,i)=>{
			let prev=this.waterlineVelo[mod(i-1,this.waterlineVelo.length)];
			let next=this.waterlineVelo[mod(i+1,this.waterlineVelo.length)];
			let avg=(prev+next+w)/3;
			return w*0.9+avg*0.1;
		});
	}
	offScreen(x,y,width=0){
		if(width==0){
			return x<this.screenStart.x||x>this.screenEnd.x
				||y<this.screenStart.y||y>this.screenEnd.y;
		}
		return x+width<this.screenStart.x||x-width>this.screenEnd.x
			||y<this.screenStart.y||y>this.screenEnd.y;
	}
	getWaterline(x){
		let between=mod(x,this.waterSize)/this.waterSize;

		let idx=mod(Math.floor(x/this.waterSize),this.waterSize);

		let idx1=idx;
		let idx2=mod(idx+1.,this.waterline.length);

		let y1=this.waterline[idx1];
		let y2=this.waterline[idx2];

		return mix(y1,y2,between);
	}
	isUnderwater(x,y){
		if(y<-500)
			return false;
		return this.getWaterline(x)<y;
	}
	splash(x,y,vX,vY,strength){
		if(this.offScreen(x,y)){
			return;
		}
		let n1=Math.min(strength*4+1,100);
		for(let i=0;i<n1;i++){
			let up=VecA(Math.random()*-strength*2,(Math.random()*PI));
			up.y*=3;
			up.x+=vX/5.;
			this.particles.push(new SplashParticle(
				Vec(x,y),
				up,
				strength*(Math.random()+1),
				100
			));
		}
		let n2=Math.min(strength*2+1,100);
		for(let i=0;i<n2;i++){
			let up=VecA(Math.random()*-strength*2,(Math.random()*PI));
			up.y*=3;
			up.scl(0.5);
			up.x+=vX/5.;
			this.particles.push(new SplashParticle(
				Vec(x,y),
				up,
				strength*(Math.random()+1)*4,
				60
			));
		}
	}
	bubbles(x,y,vX,vY,strength){
		if(this.offScreen(x,y)){
			return;
		}
		if(gameRunner.isUnderwater(x,y)){
			let n=Math.min(strength/2-Math.random(),5);
			for(let i=0;i<n;i++){
				let v=VecA(Math.random()*10,Math.random()*TAU);
				v.x+=vX;
				v.y+=vY;
				this.particles.push(new BubbleParticle(
					Vec(x,y),
					v,
					(Math.random()+1)*strength+10,
					(100+strength)*Math.random()
				));
			}
		}
	}
	wave(x,y,width,strength){
		if(this.offScreen(x,y,width)){
			return;
		}
		if(Math.abs(y)>500)
			return;
		x=mod(x,this.waterSize*this.waterline.length);
		let idx=Math.floor(x/this.waterSize);
		let off=Math.floor(width/this.waterSize);
		for(let i=idx-off;i<=idx+off;i++){
			let i2=mod(i,this.waterline.length);
			let scale=width/Math.max(Vec(x,y).mag(Vec(i*this.waterSize,this.waterline[i2])),width);
			this.waterlineVelo[i2]+=strength*scale;
		}
	}
	spark(x,y,vX,vY,strength){
		if(this.offScreen(x,y)){
			return;
		}
		strength=Math.sqrt(Math.max(strength,1))*5;
		
		let speedScale=1;
		if(gameRunner.isUnderwater(x,y)){
			for(let i=-1;i<strength/2;i++){
				let v=VecA(Math.random()*10,Math.random()*TAU);
				this.particles.push(new BubbleParticle(
					Vec(x,y),
					v,
					(Math.random()+1)*strength+10,
					(100+strength)*Math.random()
				));
			}
			speedScale=0.3;
		}
		for(let i=-1;i<strength;i++){
			let v=VecA(Math.random()*-strength*2*speedScale,Math.random()*TAU).add([vX,vY]);
			this.particles.push(new ExplodeParticle(
				Vec(x,y),
				v,
				strength*(Math.random()+1),
				10+strength
			));
		}
	}
	explode(x,y,vX,vY,strength){
		if(this.offScreen(x,y)){
			return;
		}
		strength=Math.sqrt(Math.max(strength,1))*5;
		
		let speedScale=1;
		if(gameRunner.isUnderwater(x,y)){
			for(let i=-1;i<strength/2;i++){
				let v=VecA(Math.random()*10,Math.random()*TAU);
				this.particles.push(new BubbleParticle(
					Vec(x,y),
					v,
					(Math.random()+1)*strength+10,
					(100+strength)*Math.random()
				));
			}
			speedScale=0.3;
		}
		for(let i=-1;i<strength;i++){
			let v=VecA(Math.random()*-strength*3*speedScale,Math.random()*TAU);
			this.particles.push(new ExplodeParticle(
				Vec(x,y),
				v,
				strength*(Math.random()+1)*2,
				20+strength
			));
		}
		this.particles.push(new ExplodeParticle(
			Vec(x,y),
			Vec(0,0),
			strength*10,
			(20+strength)/2
		));
	}
	wreck(x,y,vX,vY,strength){
		strength=Math.sqrt(Math.max(strength,1))*5;
		
		for(let i=-1;i<strength;i++){
			let v=VecA(Math.random()*-strength*3,Math.random()*TAU).add([vX,vY]);
			this.particles.push(new WreckParticle(
				Vec(x,y),
				v,
				strength*(Math.random()+1)*2,
				20+strength*2
			));
		}
	}
	thrust(x,y,vX,vY,strength){
		if(this.offScreen(x,y)){
			return;
		}
		if(!gameRunner.isUnderwater(x,y)){
			let n=Math.min(Math.ceil(Vec(vX,vY).mag()/20),100);
			for(let i=0;i<n;i++){
				let vScale=(i+Math.random())/n;
				let v=Vec(vX,vY)
				v.scl(vScale);

				let sizeScale=Math.sqrt(strength);
				let size=50*sizeScale;
				let spread=VecA(Math.min(strength*10,size/4),Math.random()*TAU);
				let expand=VecA(sizeScale,Math.random()*TAU);

				this.particles.push(new ThrustParticle(
					Vec(x-v.x+spread.x,y-v.y+spread.y),
					expand,
					20*sizeScale,
					size*(Math.random()*0.2+0.8),
					vScale
				));
			}
		}else{
			this.bubbles(x,y,vX,vY,strength*10);
		}
	}
	resetShadow(){
		this.shadowline.fill(1000000);
	}
	shadow(x,y,width){
		width=Math.max(width,50);
		let bottomX=x-(y-this.screenEnd.y)*0.5;
		let topX=x-(y-this.screenStart.y)*0.5;
		if(this.offScreen(bottomX,this.screenEnd.y,width)
			&&this.offScreen(topX,this.screenStart.y,width)){
			return;
		}
		x=x-y*.5;
		let idx=Math.floor(x/this.shadowSize);
		let off=Math.floor(width/this.shadowSize);
		
		for(let i=idx-off;i<=idx+off;i++){
			let i2=mod(i,this.shadowline.length);
			this.shadowline[i2]=Math.min(this.shadowline[i2],y);
		}
	}
	cloud(x,y,r,g,b,a){
		this.cloudMap.cloud(x,y,r,g,b,a);
	}
	getClouds(){
		return this.cloudMap.getClouds(this.screenStart);
	}
	knock(p,strength=100){
		this.bounceVelo.add(p.cln().sub(this.player.pos).nrm(strength));
		// this.bounceVelo.add(this.player.pos.cln().sub(p).nrm(strength));
	}

	display(disp,ctrl,renderer,background){

		renderer.prime();
		bulletRenderer.prime();
		particleRenderer.prime();
		this.resetShadow();

		this.bounceVelo.sub(this.bounce.cln().scl(0.1));
		this.bounceVelo.scl(0.8);
		this.bounce.add(this.bounceVelo);

		let screenSize=disp.getSize();
		let width=screenSize.x;
		let height=screenSize.y;
		let zoomMulti=Math.max(Math.min(width/600,1),0.2);
		//align camera
		//TODO: enforce max screen size/zoom and match it to the cloud grid
		disp.cam.pos=this.player.pos.cln();
		let tz=Math.max(Math.min((this.avrVelo-10)/(30-10),1),0.2);
		disp.cam.zoom=(1-0.5*tz-0.2)*zoomMulti;

		disp.cam.pos.add(this.bounce.cln().div(disp.cam.zoom));
		// disp.cam.zoom=4;
		// disp.cam.zoom=0.25;
		// disp.cam.zoom/=3;

		disp.cam.pos.x-=width/2/disp.cam.zoom;
		disp.cam.pos.y-=height/2/disp.cam.zoom;

		let margin=400;
		this.screenStart=disp.cam.pos.cln();
		this.screenEnd=screenSize.cln().div(disp.cam.zoom).add(this.screenStart);
		this.screenStart.sub(margin);
		this.screenEnd.add(margin);

		// disp.reset();
		disp.clear();
		// this.displayGridDensity(disp,ctrl);
		// this.displayGrid(disp,ctrl);
		// this.displayCloudGrid(disp,ctrl);
		// this.displaySize(disp,ctrl);
		// this.displayHitboxes(disp,ctrl);
		// this.displayVeloHitboxes(disp,ctrl);
		// this.displayDistanceFields(disp,ctrl);
		this.planes.forEach(w=>w.display(disp,renderer));
		this.aliens.forEach(w=>w.display(disp,renderer));
		this.pBullets.forEach(w=>w.display(disp,renderer));
		this.aBullets.forEach(w=>w.display(disp,renderer));
		this.particles.forEach(w=>w.display(disp));
		
		// this.waterline.forEach((w,i)=>disp.circle2(i*this.waterSize,w,10,10));

		background.run(disp.cam,this.waterline,this.shadowline,this.getClouds(),this.time);
		bulletRenderer.run(disp.cam,this.waterline);
		renderer.run(disp.cam,this.waterline);
		particleRenderer.run(disp.cam,this.waterline);

		// disp.rect2(0,0,250,250);
		// disp.rect2(this.screenEnd.x-100,this.screenEnd.y-100,100,100);
		// disp.rect2(this.screenStart.x,this.screenStart.y,100,100);

		// disp.cam.pos=new Vector(this.size);
		// disp.cam.pos.sclVec(0.5);

		// let screenMid=new Vector(disp.canvas.offsetWidth,disp.canvas.offsetHeight);
		// screenMid.sclVec(0.5);
		// screenMid.sclVec(1/disp.cam.zoom);

		// disp.cam.pos.subVec(screenMid);

		// this.tiles.forEach((col,x)=>
		// 	col.forEach((t,y)=>
		// 		t.display(disp,ctrl)
		// 	)
		// );
		// disp.setStroke("#EFE9D7");
		// disp.setWeight(20);
		// disp.setFill("#6D6862");
		// disp.ctx.font=2*disp.cam.zoom+"px 'Fredoka One'";
		// disp.ctx.textAlign="center";
		// disp.ctx.textBaseline="middle";
		// disp.ctx.strokeText(this.points,(this.size.x/2-disp.cam.pos.x)*disp.cam.zoom,(this.size.y+0.5-disp.cam.pos.y)*disp.cam.zoom);
		// disp.ctx.fillText(this.points,(this.size.x/2-disp.cam.pos.x)*disp.cam.zoom,(this.size.y+0.5-disp.cam.pos.y)*disp.cam.zoom);
	}
	displayGrid(disp,ctrl){
		disp.setStroke(rgb(0,0,0,0.1));
		let screenSize=disp.getSize();
		let screenX=screenSize.x/disp.cam.zoom;
		let screenY=screenSize.y/disp.cam.zoom;
		disp.start();
		for(let x=0;x<screenX;x+=this.map.scale){
			let offX=mod(disp.cam.pos.x,this.map.scale);
			disp.mt(x-offX+this.map.scale,0);
			disp.lt(x-offX+this.map.scale,screenY);
		}
		disp.pathOpen();
		disp.start();
		for(let y=0;y<screenY;y+=this.map.scale){
			let offY=mod(disp.cam.pos.y,this.map.scale);
			disp.mt(0,y-offY+this.map.scale);
			disp.lt(screenX,y-offY+this.map.scale);
		}
		disp.pathOpen();
	}
	displayCloudGrid(disp,ctrl){
		disp.setStroke(rgb(0,0,0,0.4));
		let screenSize=disp.getSize();
		let screenX=screenSize.x/disp.cam.zoom;
		let screenY=screenSize.y/disp.cam.zoom;
		disp.start();
		for(let x=0;x<screenX;x+=this.cloudSize){
			let offX=mod(disp.cam.pos.x,this.cloudSize);
			disp.mt(x-offX+this.cloudSize,0);
			disp.lt(x-offX+this.cloudSize,screenY);
		}
		disp.pathOpen();
		disp.start();
		for(let y=0;y<screenY;y+=this.cloudSize){
			let offY=mod(disp.cam.pos.y,this.cloudSize);
			disp.mt(0,y-offY+this.cloudSize);
			disp.lt(screenX,y-offY+this.cloudSize);
		}
		disp.pathOpen();
	}
	displaySize(disp,ctrl){
		disp.setStroke(rgb(0,0,0,1.));
		disp.noFill()
		disp.rect2(0,0,this.size.x,-this.size.y);
	}
	displayGridDensity(disp,ctrl){
		let screenSize=disp.getSize();
		let screenX=screenSize.x/disp.cam.zoom;
		let screenY=screenSize.y/disp.cam.zoom;
		disp.start();
		for(let x=-this.map.scale;x<screenX;x+=this.map.scale){
			let offX=mod(disp.cam.pos.x,this.map.scale);
			for(let y=-this.map.scale;y<screenY;y+=this.map.scale){
				let offY=mod(disp.cam.pos.y,this.map.scale);
				let rX=x+this.map.scale+disp.cam.pos.x;
				let rY=y+this.map.scale+disp.cam.pos.y;
				let tile=this.map.getTile(
					rX,
					rY
				);
				let density=tile.getArr("planes").length+
					tile.getArr("aliens").length+
					tile.getArr("pBullets").length+
					tile.getArr("aBullets").length;
				density=density/10;
				disp.setFill(rgb(0.5,0.8,0,density));
				disp.noStroke();
				disp.rect2(rX-offX,rY-offY,this.map.scale,this.map.scale);
			}
		}
	}
	displayDistanceFields(disp,ctrl){
		function loopColor(input,width){
			return Math.min(Math.max(
				Math.abs(input%width-width/2)*2/width
			,0),1);
		}
		let zoom=10;
		let ms=ctrl.getMouse(disp.cam);
		for(let x=0;x<400;x+=zoom){
			for(let y=0;y<400;y+=zoom){
				let x2=x+ms.x;
				let y2=y+ms.y;
				let arr=[];
				arr.push(...this.map.getTile(x2,y2).getArr("aliens"));
				arr.push(...this.map.getTile(x2,y2).getArr("planes"));
				arr.push(...this.map.getTile(x2,y2).getArr("aBullets"));
				arr.push(...this.map.getTile(x2,y2).getArr("pBullets"));
				let dist=Infinity;
				arr.forEach(a=>{
					dist=Math.min(a.getDist(Vec(x2,y2)),dist);
				});
				if(dist==Infinity){
					dist=0;
				}
				// dist=Math.abs(dist);
				disp.noStroke();
				disp.setFill(rgb(
					loopColor(dist,20),
					loopColor(dist,100),
					loopColor(dist,200),
					0.5
				));
				disp.rect2(x2-zoom/2,y2-zoom/2,zoom+1,zoom+1);
			}
		}
	}
	displayHitboxes(disp,ctrl){
		this.planes.forEach(w=>w.displayHitbox(disp));
		this.aliens.forEach(w=>w.displayHitbox(disp));
		this.pBullets.forEach(w=>w.displayHitbox(disp));
		this.aBullets.forEach(w=>w.displayHitbox(disp));
	}
	displayVeloHitboxes(disp,ctrl){
		this.pBullets.forEach(w=>w.displayVeloHitbox(disp));
		this.aBullets.forEach(w=>w.displayVeloHitbox(disp));
	}
}