class Spawner extends Entity{
	constructor(trigger,p,s,time){
		super();

		this.pos=Vec(p);
		this.trigger=trigger;
		this.spawnMax=time;
		this.spawnTime=this.spawnMax;

		this.scale=s;
		this.arrowSize=Vec(19,32).scl(s*2);
		this.arrowTexPos=Vec(504,131);
		this.arrowTexSize=Vec(19,32);

		this.barSize=Vec(12,10).scl(s*2);
		this.barTexPos=Vec(524,131);
		this.barTexSize=Vec(12,10);

		this.size=Vec(1,1);
		this.calcHitbox();
	}
	calcHitbox(){
		let c1=this.size.cln().scl(.5).rot(this.angle);
		let c2=this.size.cln().scl(Vec(-.5,.5)).rot(this.angle);
		let c3=this.size.cln().scl(Vec(-.5,-.5)).rot(this.angle);
		let c4=this.size.cln().scl(Vec(.5,-.5)).rot(this.angle);
		let min=c1.cln().min(c2).min(c3).min(c4);
		let max=c1.cln().max(c2).max(c3).max(c4);
		min.add(this.pos);
		max.add(this.pos);
		this.hb=[min,max];
	}
	getHitbox(){
		return this.hb;
	}
	run(){
		this.spawnTime--;
		if(this.spawnTime<=0){
			this.alive=false;
			this.die();
		}
	}
	die(){
		this.trigger(this.pos);
	}
	display(){
		let baseDist=40;
		let bars=Math.ceil(this.spawnMax/100);
		let barDist=baseDist*bars*this.scale;
		let barGap=baseDist*this.scale;
		let arrowOff1=this.spawnTime/this.spawnMax*barDist;
		let arrowOff2=this.spawnTime/this.spawnMax*baseDist;

		if(bars>1){
			for(let i=0;i<bars;i++){
				let barOff=(this.spawnTime+i*barGap)%barDist;
				barOff=clamp(barOff,barGap,barDist-barGap);
				renderer.img(
					this.pos.x,this.pos.y,
					this.barSize.x,this.barSize.y,
					PI/2,
					this.barTexPos.x,
					this.barTexPos.y,
					this.barTexSize.x,
					this.barTexSize.y,
					false,
					-this.barSize.x/2-barOff,-this.barSize.y/2-4);
				
				renderer.img(
					this.pos.x,this.pos.y,
					this.barSize.x,this.barSize.y,
					PI/2,
					this.barTexPos.x,
					this.barTexPos.y,
					this.barTexSize.x,
					this.barTexSize.y,
					true,
					-this.barSize.x/2-barOff,-this.barSize.y/2-4);

					renderer.img(
						this.pos.x,this.pos.y,
						this.barSize.x,this.barSize.y,
						-PI/2,
						this.barTexPos.x,
						this.barTexPos.y,
						this.barTexSize.x,
						this.barTexSize.y,
						false,
						-this.barSize.x/2-barOff,-this.barSize.y/2-4);
					
					renderer.img(
						this.pos.x,this.pos.y,
						this.barSize.x,this.barSize.y,
						-PI/2,
						this.barTexPos.x,
						this.barTexPos.y,
						this.barTexSize.x,
						this.barTexSize.y,
						true,
						-this.barSize.x/2-barOff,-this.barSize.y/2-4);
			}
		}
		
		renderer.img(
			this.pos.x,this.pos.y,
			this.arrowSize.x,this.arrowSize.y,
			PI/2,
			this.arrowTexPos.x,
			this.arrowTexPos.y,
			this.arrowTexSize.x,
			this.arrowTexSize.y,
			false,
			-this.arrowSize.x/2-arrowOff1,0);
		
		renderer.img(
			this.pos.x,this.pos.y,
			this.arrowSize.x,this.arrowSize.y,
			-PI/2,
			this.arrowTexPos.x,
			this.arrowTexPos.y,
			this.arrowTexSize.x,
			this.arrowTexSize.y,
			false,
			-this.arrowSize.x/2-arrowOff1,0);
			
		renderer.img(
			this.pos.x,this.pos.y,
			this.arrowSize.x,this.arrowSize.y,
			0,
			this.arrowTexPos.x,
			this.arrowTexPos.y,
			this.arrowTexSize.x,
			this.arrowTexSize.y,
			false,
			-this.arrowSize.x/2-arrowOff2,0);
		
		renderer.img(
			this.pos.x,this.pos.y,
			this.arrowSize.x,this.arrowSize.y,
			PI,
			this.arrowTexPos.x,
			this.arrowTexPos.y,
			this.arrowTexSize.x,
			this.arrowTexSize.y,
			false,
			-this.arrowSize.x/2-arrowOff2,0);
	}
}
class Alien extends Entity{
	constructor(p,a){
		super();

		this.speed=1;
		this.agility=0.1;
		this.pushSpeed=1;

		this.resistance=0.95;
		this.resistanceWater=0.9;
		this.buoyancy=Vec(0,0);
		this.submerged=false;
		this.bubbling=false;
		this.splashSize=2;
		this.waveSize=1;

		this.cooldownMax=100;
		this.cooldown=Math.floor(Math.random()*this.cooldownMax);
		this.bulletSpeed=30;
		this.bulletSize=8;
		this.bulletDamage=1;
		this.bulletRange=50;
		this.accuracy=0.05;

		this.pos=Vec(p);
		this.velo=Vec(0,0);
		this.angle=a;
		this.size=Vec(56,102).scl(2);
		this.texPos=Vec(324,1);
		this.texSize=Vec(56,102);

		this.head=null;
		
		this.calcHitbox();
	}
	randomizeCooldown(){
		this.cooldown=Math.floor(Math.random()*this.cooldownMax);
	}
	setHead(head){
		this.head=head;
	}
	getClosest(vec){
		let v=vec.cln().sub(this.pos).rot(-this.angle);
		let s=v.cln().sign();
		let sz=this.size.cln().scl(.5);
		v.abs();
		if(v.x<sz.x&&v.y<sz.y){
			return vec.cln();
		}else{
			v.min(sz);
		}
		return v.scl(s).rot(this.angle).add(this.pos);
	}
	getDist(vec){
		let v=vec.cln().sub(this.pos).rot(-this.angle);
		let sz=this.size.cln().scl(.5);
		v.abs();
		if(v.x<sz.x&&v.y<sz.y){
			return Math.max(v.x-sz.x,v.y-sz.y);
		}else{
			let v2=v.cln();
			v.min(sz);
			return v2.mag(v);
		}
	}
	calcHitbox(){
		let c1=this.size.cln().scl(.5).rot(this.angle);
		let c2=this.size.cln().scl(Vec(-.5,.5)).rot(this.angle);
		let c3=this.size.cln().scl(Vec(-.5,-.5)).rot(this.angle);
		let c4=this.size.cln().scl(Vec(.5,-.5)).rot(this.angle);
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
		let diff=this.pos.cln().sub(target.pos);
		let mag=diff.mag()/this.size.cln().add(target.size).mag();
		let push=Math.max(1-mag,0);
		this.velo.add(
			diff.nrm(push).scl(this.pushSpeed)
		);
		if(this.head!=null){
			this.head.hit(target);
		}
	}
	die(){
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,5);
	}
	run(){
		super.run();
		this.velo.scl(this.resistance);
		this.pos.add(this.velo);

		if(gameRunner.isUnderwater(this.pos.x,this.pos.y)){
			let slowed=this.velo.cln();
			this.velo.scl(this.resistanceWater);

			slowed.sub(this.velo);
			let strength=slowed.mag();
			gameRunner.wave(this.pos.x,this.pos.y,100,strength*this.waveSize);
			if(!this.submerged){
				let splash=strength*this.splashSize;
				if(splash>2)
					gameRunner.splash(this.pos.x+this.velo.x*5,this.pos.y+this.velo.y*5,slowed.x*10,slowed.y*10,splash);
			}
			this.submerged=true;
			this.velo.add(this.buoyancy);
		}else{
			this.submerged=false;
		}

		if(this.cooldown>0){
			this.cooldown--;
		}

		this.calcHitbox();
	}
	shoot(bulletsArr,dryFire){
		if(!this.alive)
			return;
		if(this.cooldown==0){
			if(!dryFire){
				let ra=(Math.random()-0.5)*2*this.accuracy;
				let s=this.bulletSpeed;
				let pVelo=VecA(s,this.angle+ra);
				pVelo.add(this.velo);
				let pPos=VecA(this.size.x/2.,this.angle);
				pPos.add(this.pos);
				bulletsArr.push(new AlienBullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
			}
			this.cooldown=this.cooldownMax;
		}
	}
	move(target,speed=1){
		this.velo.sub(this.pos.cln().add(this.velo).sub(target).lim(this.speed*speed));
	}
	moveDir(dir,speed=1){
		this.velo.add(dir.cln().lim(this.speed*speed));
	}
	boost(speed=1){
		this.velo.add(VecA(this.speed*speed,this.angle));
	}
	slow(resist){
		this.velo.scl(resist);
	}
	face(target){
		let ang=this.pos.ang(target);
		this.faceAng(ang);
	}
	faceAng(ang){
		this.angle+=clamp(
			nrmAngPI(ang-this.angle),-this.agility,this.agility);
	}
	display(disp,renderer){
		let flip=nrmAngPI(this.angle+PI/2)<0;
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			flip);
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}
class Shield extends Alien{
	constructor(p,a){
		super(p,a);

		this.maxHealth=2;
		this.health=this.maxHealth;

		this.size=Vec(56,102).scl(2);
		this.texPos=Vec(377,1);
		this.texSize=Vec(56,102);

		this.speed=0.8;
		this.agility=0.03;
		this.shieldTime=0;
		this.shieldTimeMax=10;

		this.pushSpeed=0.3;

		this.color=new Color("AAFF0000");
	}
	run(){
		super.run();
		if(this.shieldTime>0){
			this.shieldTime--;
			this.color.w=this.shieldTime/this.shieldTimeMax;
		}
	}
	hurt(damage,damager){
		if(Math.abs(nrmAngPI(damager.pos.ang(this.pos)-this.angle))>PI/2){
			this.shieldTime=this.shieldTimeMax;
		}else{
			this.health-=damage;
		}
	}
	shoot(){

	}
	display(disp,renderer){
		let flip=nrmAngPI(this.angle+PI/2)<0;
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			flip);

		if(this.shieldTime>0){
			let p=VecA(-this.size.x+5,this.angle).add(this.pos);
			let a=0.85;
			disp.noStroke();
			disp.setFill(this.color);
			disp.start();
			disp.arc2(p.x,p.y,
				this.size.x*1.5,this.angle-a,this.angle+a);
			disp.shape();
		}
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}
class Swarmer extends Alien{
	constructor(p,a){
		super(p,a);

		this.maxHealth=2;
		this.health=this.maxHealth;

		this.size=Vec(30,17).scl(2);
		this.texPos=Vec(336,1);
		this.texSize=Vec(30,17);

		this.speed=10;
		this.pushSpeed=3;
		this.agility=0.03;
		this.resistance=0.8;
		this.resistanceWater=0.8;

		this.splashSize=1;
		this.waveSize=0.1;

		this.cooldownMax=10;
		this.cooldown=0;
		this.damage=1;
	}
	runSpecial(arrays){
		let a2=arrays["planes"];
		for(let j=0;j<a2.length;j++){
			this.tryHit(a2[j],false,true);
		}
	}
	hit(target,special){
		if(special){
			if(this.cooldown==0){
				gameRunner.spark(this.pos.x,this.pos.y,this.velo.x/3,this.velo.y/3,0);
				target.hurt(this.damage,this);
				this.cooldown=this.cooldownMax;
			}
		}else{
			super.hit(target);
		}
	}
	die(){
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,2);
	}
	shoot(){

	}
}
class Dart extends Alien{
	constructor(p,a){
		super(p,a);

		this.maxHealth=3;
		this.health=this.maxHealth;

		this.size=Vec(40,35).scl(2);
		this.texPos=Vec(336,37);
		this.texSize=Vec(40,35);

		this.speed=0.5;
		this.resistance=0.99;
		this.agility=0.1;
		this.pushSpeed=2;

		this.splashSize=2;
		this.waveSize=1;
	}
}
class Arrow extends Alien{
	constructor(p,a){
		super(p,a);

		this.maxHealth=3;
		this.health=this.maxHealth;

		this.size=Vec(73,63).scl(2);
		this.texPos=Vec(434,1);
		this.texSize=Vec(73,63);

		this.speed=1;
		this.resistance=0.99;
		this.agility=0.05;
		this.pushSpeed=2;

		this.cooldownMax=150;
		this.cooldown=Math.floor(Math.random()*this.cooldownMax);
		this.bulletSpeed=40;

		this.splashSize=2;
		this.waveSize=1;
	}
	shoot(bulletsArr,dryFire){
		if(!this.alive)
			return;
		if(this.cooldown==0){
			if(!dryFire){
				let ra=(Math.random()-0.5)*2*this.accuracy;
				let s=this.bulletSpeed;
				{
					let pVelo=VecA(s,this.angle+ra);
					pVelo.add(this.velo);
					let pPos=Vec(this.size.x/2-20,14);
					if(Math.cos(this.angle)<0)
						pPos.y*=-1;
					pPos.rot(this.angle);
					pPos.add(this.pos);
					bulletsArr.push(new AlienBullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
				}
				{
					let pVelo=VecA(s,this.angle+ra);
					pVelo.add(this.velo);
					let pPos=Vec(this.size.x/2-20,-14);
					if(Math.cos(this.angle)<0)
						pPos.y*=-1;
					pPos.rot(this.angle);
					pPos.add(this.pos);
					bulletsArr.push(new AlienBullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
				}
			}
			this.cooldown=this.cooldownMax;
		}
	}
}
class Shell extends Alien{
	constructor(p,a){
		super(p,a);

		this.maxHealth=5;
		this.health=this.maxHealth;

		this.size=Vec(59,64).scl(2);
		this.texPos=Vec(508,1);
		this.texSize=Vec(59,64);

		this.speed=0.3;
		this.resistance=0.99;
		this.agility=0.05;
		this.pushSpeed=2;
		this.cooldownMax=200;
		this.cooldown=Math.floor(Math.random()*this.cooldownMax);

		this.splashSize=2;
		this.waveSize=1;
	}
}
class Sniper extends Alien{
	constructor(p,a){
		super(p,a);

		this.maxHealth=5;
		this.health=this.maxHealth;

		this.size=Vec(78,86).scl(2);
		this.texPos=Vec(568,1);
		this.texSize=Vec(78,86);

		this.hitboxSize=Vec(53,86).scl(2);
		this.hitboxOffset=Vec(0,0);
		this.displayOffset=Vec(25,0);

		this.speed=0.5;
		this.pushSpeed=0.5;
		
		this.cooldownMax=300;
		this.cooldown=Math.floor(Math.random()*this.cooldownMax);
		this.bulletSpeed=50;
		this.bulletSize=12;
		this.bulletDamage=5;
		this.bulletRange=100;
		this.accuracy=0.05;
	}
	//TODO: adjust hitbox function to include hitbox size and offset
	getClosest(vec){
		let v=vec.cln().sub(this.pos).rot(-this.angle).add(this.hitboxOffset);
		let s=v.cln().sign();
		let sz=this.hitboxSize.cln().scl(.5);
		v.abs();
		if(v.x<sz.x&&v.y<sz.y){
			return vec.cln();
		}else{
			v.min(sz);
		}
		return v.scl(s).rot(this.angle).add(this.pos);
	}
	getDist(vec){
		let v=vec.cln().sub(this.pos).rot(-this.angle).add(this.hitboxOffset);
		let sz=this.hitboxSize.cln().scl(.5);
		v.abs();
		if(v.x<sz.x&&v.y<sz.y){
			return Math.max(v.x-sz.x,v.y-sz.y);
		}else{
			let v2=v.cln();
			v.min(sz);
			return v2.mag(v);
		}
	}
	display(disp,renderer){
		let flip=nrmAngPI(this.angle+PI/2)<0;
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			flip,
			this.displayOffset.x,
			this.displayOffset.y);
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}

class StarGunner extends Alien{
	constructor(p,a){
		super(p,a);

		this.maxHealth=3;
		this.health=this.maxHealth;

		this.size=Vec(69,50).scl(2);
		this.texPos=Vec(434,129);
		this.texSize=Vec(69,50);

		this.hitboxSize=Vec(53,86).scl(2);
		this.hitboxOffset=Vec(0,0);
		this.displayOffset=Vec(0,0);

		this.speed=0.5;
		this.pushSpeed=0.5;
		this.agility=0.2;

		this.cooldownMax1=300;
		this.bulletSpeed1=100;
		this.bulletSize1=8;
		this.bulletDamage1=1;
		this.bulletRange1=50;
		this.accuracy1=0.05;

		this.cooldownMax2=5;
		this.bulletSpeed2=50;
		this.bulletSize2=16;
		this.bulletDamage2=3;
		this.bulletRange2=30;
		this.accuracy2=0.2;
		this.kickBack=10;

		this.setMode(true);
	}
	setMode(isForward){
		if(this.isForward==isForward){
			return;
		}
		this.isForward=isForward;
		if(this.isForward){
			this.cooldownMax=this.cooldownMax1;
			this.cooldown=Math.floor(Math.random()*this.cooldownMax);
			this.bulletSpeed=this.bulletSpeed1;
			this.bulletSize=this.bulletSize1;
			this.bulletDamage=this.bulletDamage1;
			this.bulletRange=this.bulletRange1;
			this.accuracy=this.accuracy1;
		}else{
			this.cooldownMax=this.cooldownMax2;
			this.cooldown=Math.floor(Math.random()*this.cooldownMax);
			this.bulletSpeed=this.bulletSpeed2;
			this.bulletSize=this.bulletSize2;
			this.bulletDamage=this.bulletDamage2;
			this.bulletRange=this.bulletRange2;
			this.accuracy=this.accuracy2;
		}
	}
	shoot(bulletsArr,dryFire){
		if(!this.alive)
			return;
		if(this.cooldown==0){
			if(!dryFire){
				let ra=(Math.random()-0.5)*2*this.accuracy;
				let s=this.bulletSpeed;
				let pVelo;
				if(this.isForward){
					pVelo=VecA(s,this.angle+ra);
				}else{
					pVelo=VecA(s,this.angle+ra+PI);
					this.shove(pVelo.cln().nrm(-this.kickBack));
				}
				pVelo.add(this.velo);
				let pPos=VecA(0,0);
				pPos.add(this.pos);
				bulletsArr.push(new AlienBullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
			}
			this.cooldown=this.cooldownMax;
		}
	}
	faceAng(ang){
		if(this.isForward){
			this.angle+=clamp(
				nrmAngPI(ang-this.angle),-this.agility,this.agility);
		}else{
			this.angle+=clamp(
				nrmAngPI(ang-this.angle-PI),-this.agility,this.agility);
		}
	}
	getClosest(vec){
		let v=vec.cln().sub(this.pos).rot(-this.angle).add(this.hitboxOffset);
		let s=v.cln().sign();
		let sz=this.hitboxSize.cln().scl(.5);
		v.abs();
		if(v.x<sz.x&&v.y<sz.y){
			return vec.cln();
		}else{
			v.min(sz);
		}
		return v.scl(s).rot(this.angle).add(this.pos);
	}
	getDist(vec){
		let v=vec.cln().sub(this.pos).rot(-this.angle).add(this.hitboxOffset);
		let sz=this.hitboxSize.cln().scl(.5);
		v.abs();
		if(v.x<sz.x&&v.y<sz.y){
			return Math.max(v.x-sz.x,v.y-sz.y);
		}else{
			let v2=v.cln();
			v.min(sz);
			return v2.mag(v);
		}
	}
	display(disp,renderer){
		let flip=nrmAngPI(this.angle+PI/2)<0;
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			false,
			this.displayOffset.x,
			this.displayOffset.y);
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}
class Wrecker extends Alien{
	constructor(p,a){
		super(p,a);

		this.maxHealth=5;
		this.health=this.maxHealth;

		this.size=Vec(62,62).scl(2);
		this.texPos=Vec(647,1);
		this.texSize=Vec(62,62);
		
		this.blade1Size=Vec(16,54).scl(2);
		this.blade1TexPos=Vec(710,1);
		this.blade1TexSize=Vec(16,54);
		this.blade1Offset=Vec(0,-42).scl(2);
		this.blade1Angle=PI/2;

		this.blade2Size=Vec(16,39).scl(2);
		this.blade2TexPos=Vec(727,1);
		this.blade2TexSize=Vec(16,39);
		this.blade2Offset=Vec(0,34).scl(2);
		this.blade2Angle=PI/2;

		this.faceSize=Vec(14,14).scl(2);
		this.faceTexPos=Vec(728,81);
		this.faceTexSize=Vec(14,14);
		this.facePos=Vec(0,0);

		this.speed=0.5;
		this.resistance=0.99;
		this.pushSpeed=0.5;
		this.agility=0.02;
		
		this.cooldownMax=0;
		this.cooldown=0;

		this.damage=1;
		this.spin=0;
	}
	//TODO: adjust sdfs and hitbox to be a circle
	// getClosest(vec){
	// 	let v=vec.cln().sub(this.pos).rot(-this.angle).add(this.hitboxOffset);
	// 	let s=v.cln().sign();
	// 	let sz=this.hitboxSize.cln().scl(.5);
	// 	v.abs();
	// 	if(v.x<sz.x&&v.y<sz.y){
	// 		return vec.cln();
	// 	}else{
	// 		v.min(sz);
	// 	}
	// 	return v.scl(s).rot(this.angle).add(this.pos);
	// }
	// getDist(vec){
	// 	let v=vec.cln().sub(this.pos).rot(-this.angle).add(this.hitboxOffset);
	// 	let sz=this.hitboxSize.cln().scl(.5);
	// 	v.abs();
	// 	if(v.x<sz.x&&v.y<sz.y){
	// 		return Math.max(v.x-sz.x,v.y-sz.y);
	// 	}else{
	// 		let v2=v.cln();
	// 		v.min(sz);
	// 		return v2.mag(v);
	// 	}
	// }
	runSpecial(arrays){
		let a2=arrays["planes"];
		for(let j=0;j<a2.length;j++){
			this.tryHit(a2[j],false,true);
		}
	}
	hit(target,special){
		if(special){
			if(this.cooldown==0){
				let sparkP=target.getPos().sub(this.pos).nrm(this.size.x/2).add(this.pos);
				gameRunner.spark(sparkP.x,sparkP.y,0,0,0);
				target.hurt(this.damage,this);
				this.cooldown=this.cooldownMax;
			}
		}else{
			super.hit(target);
		}
		let shoveDir=target.getPos().sub(this.pos).nrm(this.spin*5);
		target.shove(shoveDir);
	}
	
	faceAng(ang){
		let look=VecA(15,ang);
		this.facePos=look.sub(this.facePos).lim(1).add(this.facePos);
		super.faceAng(ang);
	}
	run(){
		super.run();
		this.spin=this.velo.mag()/50+1;
		this.blade1Angle+=this.spin/TAU;
		this.blade2Angle-=this.spin*0.75/TAU;
	}
	die(){
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,8);
	}
	display(disp,renderer){
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			false);
		
		renderer.img(
			this.pos.x,this.pos.y,
			this.blade1Size.x,this.blade1Size.y,
			this.angle+this.blade1Angle,
			this.blade1TexPos.x,
			this.blade1TexPos.y,
			this.blade1TexSize.x,
			this.blade1TexSize.y,
			false,
			this.blade1Offset.x,
			this.blade1Offset.y);
		renderer.img(
			this.pos.x,this.pos.y,
			this.blade1Size.x,this.blade1Size.y,
			this.angle+this.blade1Angle+PI,
			this.blade1TexPos.x,
			this.blade1TexPos.y,
			this.blade1TexSize.x,
			this.blade1TexSize.y,
			false,
			this.blade1Offset.x,
			this.blade1Offset.y);
			
		renderer.img(
			this.pos.x,this.pos.y,
			this.blade2Size.x,this.blade2Size.y,
			this.angle+this.blade2Angle+PI,
			this.blade2TexPos.x,
			this.blade2TexPos.y,
			this.blade2TexSize.x,
			this.blade2TexSize.y,
			true,
			this.blade2Offset.x,
			this.blade2Offset.y);
		renderer.img(
			this.pos.x,this.pos.y,
			this.blade2Size.x,this.blade2Size.y,
			this.angle+this.blade2Angle,
			this.blade2TexPos.x,
			this.blade2TexPos.y,
			this.blade2TexSize.x,
			this.blade2TexSize.y,
			true,
			this.blade2Offset.x,
			this.blade2Offset.y);
		
		renderer.img(
			this.pos.x+this.facePos.x,this.pos.y+this.facePos.y,
			this.faceSize.x,this.faceSize.y,
			0,
			this.faceTexPos.x,
			this.faceTexPos.y,
			this.faceTexSize.x,
			this.faceTexSize.y,
			false);

		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}

class BossSpike extends Alien{
	constructor(p,a){
		super(p,a);

		this.maxHealth=25;
		this.health=this.maxHealth;

		this.size=Vec(110,110).scl(2);
		this.texPos=Vec(744,1);
		this.texSize=Vec(110,110);
		
		this.spike1Size=Vec(57,46).scl(2);
		this.spike1TexPos=Vec(855,1);
		this.spike1TexSize=Vec(57,46);
		this.spike1Offset=Vec(-40,0).scl(2);
		this.spike1Angle=0;

		this.spike2Size=Vec(38,46).scl(2);
		this.spike2TexPos=Vec(913,1);
		this.spike2TexSize=Vec(38,46);
		this.spike2Offset=Vec(-60,0).scl(2);
		this.spike2Angle=0;
		this.spike3Angle=0;

		this.speed=1;
		this.resistance=0.8;
		this.pushSpeed=0.25;
		this.agility=0;
		
		this.cooldownMax=10;
		this.cooldown=0;

		this.damage=20;
		this.spin=0.025;
	}
	shoot(){
	}
	runSpecial(arrays){
		let a2=arrays["planes"];
		for(let j=0;j<a2.length;j++){
			this.tryHit(a2[j],false,true);
		}
	}
	hit(target,special){
		let shoveDir=target.getPos().sub(this.pos).nrm(this.spin*100);
		target.shove(shoveDir);
		if(special){
			if(this.cooldown==0){
				let sparkP=target.getPos().sub(this.pos).nrm(this.size.x/2).add(this.pos);
				gameRunner.spark(sparkP.x,sparkP.y,0,0,3);
				target.hurt(this.damage,this);
				this.cooldown=this.cooldownMax;
			}
		}else{
			super.hit(target);
		}
	}
	die(){
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,20);
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,10);
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,5);
	}
	run(){
		super.run();
		this.spike1Angle+=this.spin;
		this.spike2Angle-=this.spin;
		this.spike3Angle+=this.spin/2;
	}
	//TODO: circle sdf
	display(disp,renderer){
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			false);
		
		for(let n=0;n<6;n++){
			renderer.img(
				this.pos.x,this.pos.y,
				this.spike2Size.x,this.spike2Size.y,
				this.angle+n/6*TAU+this.spike2Angle,
				this.spike2TexPos.x,
				this.spike2TexPos.y,
				this.spike2TexSize.x,
				this.spike2TexSize.y,
				false,
				this.spike2Offset.x,
				this.spike2Offset.y);
		}
		for(let n=0;n<6;n++){
			renderer.img(
				this.pos.x,this.pos.y,
				this.spike2Size.x,this.spike2Size.y,
				this.angle+n/6*TAU+this.spike3Angle,
				this.spike2TexPos.x,
				this.spike2TexPos.y,
				this.spike2TexSize.x,
				this.spike2TexSize.y,
				false,
				this.spike2Offset.x,
				this.spike2Offset.y);
		}
		for(let n=0;n<3;n++){
			renderer.img(
				this.pos.x,this.pos.y,
				this.spike1Size.x,this.spike1Size.y,
				this.angle+n/3*TAU+this.spike1Angle,
				this.spike1TexPos.x,
				this.spike1TexPos.y,
				this.spike1TexSize.x,
				this.spike1TexSize.y,
				false,
				this.spike1Offset.x,
				this.spike1Offset.y);
		}

		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}

class BossDrill extends Alien{
	constructor(p,a){
		super(p,a);

		this.maxHealth=25;
		this.health=this.maxHealth;

		this.size=Vec(142,150).scl(2);
		this.texPos=Vec(952,1);
		this.texSize=Vec(142,150);
		this.offset=Vec(30,0).scl(2);

		this.triSize=Vec(38,30).scl(2);
		this.triTexPos=Vec(1095,25);
		this.triTexSize=Vec(38,30);
		this.triOffset=Vec(7,0).scl(2).add(this.offset);

		this.eye1Size=Vec(5,11).scl(2);
		this.eye1TexPos=Vec(1105,1);
		this.eye1TexSize=Vec(5,11);

		this.eye2Size=Vec(3,9).scl(2);
		this.eye2TexPos=Vec(1101,1);
		this.eye2TexSize=Vec(3,9);

		this.eye3Size=Vec(2,3).scl(2);
		this.eye3TexPos=Vec(1098,1);
		this.eye3TexSize=Vec(2,3);

		this.eye4Size=Vec(2,1).scl(2);
		this.eye4TexPos=Vec(1095,1);
		this.eye4TexSize=Vec(2,1);

		this.gunSize=Vec(14,8).scl(2);
		this.gunTexPos=Vec(1111,1);
		this.gunTexSize=Vec(14,8);
		this.gunAngle1=0.0;
		this.gunAngle2=0.0;
		this.gunAngle3=0.0;

		this.speed=0.5;
		this.resistance=0.98;
		this.resistanceWater=0.97;
		this.pushSpeed=0.25;
		this.agilityNormal=0.01;
		this.agilityBoost=0.03;
		this.agility=this.agilityNormal;
		this.boostCooldown=0;
		this.boostCooldownMax=30;
		
		this.gunCooldownMax=30;
		this.gunCooldown=0;
		this.gunSpeed=0;
		this.gunAccel=0.005;
		this.gunResistance=0.95;
		this.damage=1;

		this.bulletSpeed=50;
		this.bulletRange=50;

		this.eyeSpin1=PI/2+0.5;
		this.eyeSpin2=PI/2+0.1;
	}
	runSpecial(arrays){
		let a2=arrays["planes"];
		for(let j=0;j<a2.length;j++){
			this.tryHit(a2[j],false,true);
		}
	}
	hit(target,special){
		let shoveDir=target.getPos().sub(this.pos).nrm(this.gunSpeed*30);
		target.shove(shoveDir);
		super.hit(target);
	}
	die(){
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,20);
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,10);
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,5);
	}
	run(){
		super.run();
		this.gunSpeed*=this.gunResistance;
		let drillSpeed=this.gunSpeed+0.03;
		// this.gunAngle1+=drillSpeed;
		// this.gunAngle2+=drillSpeed*75/46;
		// this.gunAngle3+=drillSpeed*75/20;
		this.gunAngle1+=drillSpeed;
		this.gunAngle2+=drillSpeed*2;
		this.gunAngle3+=drillSpeed*3;
		if(this.boostCooldown>0){
			this.boostCooldown--;
			this.boost(1,false);
		}
		this.agility=this.boostCooldown==0?this.agilityNormal:this.agilityBoost;
	}
	face(target){
		super.face(target);
		let p=target.cln().sub(this.getPos()).lim(30);
		p.z=40;
		p.nrm(40);
		this.eyeSpin2=Vec(p.yz).ang();
		this.eyeSpin1=Vec(p.xz).ang();
	}
	shoot(bulletsArr,dryFire){
		if(!this.alive)
			return;
		this.gunSpeed+=this.gunAccel;
		let gunCount=8;
		let fireIdx=this.gunCooldown;
		for(let i=0;i<gunCount;i++){
			fireIdx++;
			if(fireIdx%this.gunCooldownMax!=0){
				continue;
			}
			let p=VecA(75,i/gunCount*TAU+this.gunAngle1);
			if(p.x>0){
				continue;
			}
			p.x=40*2;
			
			if(!dryFire){
				let ra=(Math.random()-0.5)*2*this.accuracy;
				let s=this.bulletSpeed;
				let pVelo=VecA(s,this.angle+ra);
				pVelo.add(this.velo);
				let pPos=p.cln().rot(this.angle);
				pPos.add(this.pos);
				bulletsArr.push(new AlienBullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
			}
		}
		gunCount=6;
		for(let i=0;i<gunCount;i++){
			fireIdx++;
			if(fireIdx%this.gunCooldownMax!=0){
				continue;
			}
			let p=VecA(46,i/gunCount*TAU+this.gunAngle2);
			if(p.x>0){
				continue;
			}
			p.x=60*2;
			
			if(!dryFire){
				let ra=(Math.random()-0.5)*2*this.accuracy;
				let s=this.bulletSpeed;
				let pVelo=VecA(s,this.angle+ra);
				pVelo.add(this.velo);
				let pPos=p.cln().rot(this.angle);
				pPos.add(this.pos);
				bulletsArr.push(new AlienBullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
			}
		}
		gunCount=3;
		for(let i=0;i<gunCount;i++){
			fireIdx++;
			if(fireIdx%this.gunCooldownMax!=0){
				continue;
			}
			let p=VecA(20,i/gunCount*TAU+this.gunAngle3);
			if(p.x>0){
				continue;
			}
			p.x=80*2;

			if(!dryFire){
				let ra=(Math.random()-0.5)*2*this.accuracy;
				let s=this.bulletSpeed;
				let pVelo=VecA(s,this.angle+ra);
				pVelo.add(this.velo);
				let pPos=p.cln().rot(this.angle);
				pPos.add(this.pos);
				bulletsArr.push(new AlienBullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
			}
		}
		fireIdx+=Math.floor(Math.random()*2);
		this.gunCooldown=fireIdx%this.gunCooldownMax;
	}
	boost(power,real=true){
		super.boost(power);
		if(real){
			this.boostCooldown=this.boostCooldownMax;
		}
		
		let offset=VecA(-this.size.x/2+this.offset.x,this.angle);
		offset.add(this.pos);
		let offset2=VecA(20*2,this.angle+PI/2);

		gameRunner.thrust(offset.x,offset.y,this.velo.x,this.velo.y,
			Math.random()+0.5
		);
		gameRunner.thrust(offset.x+offset2.x,offset.y+offset2.y,this.velo.x,this.velo.y,
			Math.random()+0.5
		);
		gameRunner.thrust(offset.x-offset2.x,offset.y-offset2.y,this.velo.x,this.velo.y,
			Math.random()+0.5
		);
		let m=this.velo.mag();
		let cloudCol=RGB(255,255,255,50).scl(255);
		for(let v=0;v<m;v+=20){
			let p=this.velo.cln().nrm(v).add(offset).add(VecA(Math.random()*20,Math.random()*TAU));
			gameRunner.cloud(p.x,p.y,cloudCol.x,cloudCol.y,cloudCol.z,cloudCol.w);
			gameRunner.cloud(p.x+offset2.x,p.y+offset2.y,cloudCol.x,cloudCol.y,cloudCol.z,cloudCol.w);
			gameRunner.cloud(p.x-offset2.x,p.y-offset2.y,cloudCol.x,cloudCol.y,cloudCol.z,cloudCol.w);
		}
	}
	//TODO: triangle sdf
	display(disp,renderer){
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			false,
			this.offset.x,
			this.offset.y);
		
		// let eyeCenter=VecA(40,this.eyeSpin1,0,this.eyeSpin2);
		let eyeDotCount=20;
		for(let i=0;i<eyeDotCount;i++){
			let p=VecA(40,i/eyeDotCount*TAU);
			p.xy=Vec(p.xy).rot(this.eyeSpin1);
			p.yz=Vec(p.yz).rot(this.eyeSpin2);
			if(p.z<5){
				continue;
			}
			let p2=VecA(40,(i+0.01)/eyeDotCount*TAU);
			p2.xy=Vec(p2.xy).rot(this.eyeSpin1);
			p2.yz=Vec(p2.yz).rot(this.eyeSpin2);
			let ang=p.ang(p2);
			if(i==0){
				renderer.img(
					this.pos.x+p.x,this.pos.y+p.y,
					this.eye1Size.x,this.eye1Size.y,
					0,
					this.eye1TexPos.x,
					this.eye1TexPos.y,
					this.eye1TexSize.x,
					this.eye1TexSize.y,
					false);
			}else if(i==1||i==eyeDotCount-1){
				renderer.img(
					this.pos.x+p.x,this.pos.y+p.y,
					this.eye2Size.x,this.eye2Size.y,
					0,
					this.eye2TexPos.x,
					this.eye2TexPos.y,
					this.eye2TexSize.x,
					this.eye2TexSize.y,
					false);
			}else if(i==2){
				renderer.img(
					this.pos.x+p.x,this.pos.y+p.y,
					this.eye3Size.x,this.eye3Size.y,
					ang+PI,
					this.eye3TexPos.x,
					this.eye3TexPos.y,
					this.eye3TexSize.x,
					this.eye3TexSize.y,
					false);
			}else if(i==eyeDotCount-2){
				renderer.img(
					this.pos.x+p.x,this.pos.y+p.y,
					this.eye3Size.x,this.eye3Size.y,
					ang,
					this.eye3TexPos.x,
					this.eye3TexPos.y,
					this.eye3TexSize.x,
					this.eye3TexSize.y,
					false);
			}else{
				renderer.img(
					this.pos.x+p.x,this.pos.y+p.y,
					this.eye4Size.x,this.eye4Size.y,
					ang,
					this.eye4TexPos.x,
					this.eye4TexPos.y,
					this.eye4TexSize.x,
					this.eye4TexSize.y,
					false);
			}
		}
		
		let eyeDotCount2=20;
		for(let i=0;i<eyeDotCount2;i++){
			let p=VecA(40,i/eyeDotCount2*TAU);
			p.yz=Vec(p.yz).rot(PI/2);
			p.xy=Vec(p.xy).rot(this.eyeSpin1);
			p.yz=Vec(p.yz).rot(this.eyeSpin2);
			if(p.z<5){
				continue;
			}
			let p2=VecA(40,(i+0.01)/eyeDotCount2*TAU);
			p2.yz=Vec(p2.yz).rot(PI/2);
			p2.xy=Vec(p2.xy).rot(this.eyeSpin1);
			p2.yz=Vec(p2.yz).rot(this.eyeSpin2);
			let ang=p.ang(p2);
			if(i==0||i==1||i==eyeDotCount2-1){
				//do nothing
			}else if(i==2){
				renderer.img(
					this.pos.x+p.x,this.pos.y+p.y,
					this.eye3Size.x,this.eye3Size.y,
					ang+PI,
					this.eye3TexPos.x,
					this.eye3TexPos.y,
					this.eye3TexSize.x,
					this.eye3TexSize.y,
					false);
			}else if(i==eyeDotCount2-2){
				renderer.img(
					this.pos.x+p.x,this.pos.y+p.y,
					this.eye3Size.x,this.eye3Size.y,
					ang,
					this.eye3TexPos.x,
					this.eye3TexPos.y,
					this.eye3TexSize.x,
					this.eye3TexSize.y,
					false);
			}else{
				renderer.img(
					this.pos.x+p.x,this.pos.y+p.y,
					this.eye4Size.x,this.eye4Size.y,
					ang,
					this.eye4TexPos.x,
					this.eye4TexPos.y,
					this.eye4TexSize.x,
					this.eye4TexSize.y,
					false);
			}
		}

		let gunCount=8;
		for(let i=0;i<gunCount;i++){
			let p=VecA(75,i/gunCount*TAU+this.gunAngle1);
			if(p.x>0){
				continue;
			}
			p.x=40*2;

			renderer.img(
				this.pos.x,this.pos.y,
				this.gunSize.x,this.gunSize.y,
				this.angle,
				this.gunTexPos.x,
				this.gunTexPos.y,
				this.gunTexSize.x,
				this.gunTexSize.y,
				false,
				p.x,
				p.y);
		}
		gunCount=6;
		for(let i=0;i<gunCount;i++){
			let p=VecA(46,i/gunCount*TAU+this.gunAngle2);
			if(p.x>0){
				continue;
			}
			p.x=60*2;

			renderer.img(
				this.pos.x,this.pos.y,
				this.gunSize.x,this.gunSize.y,
				this.angle,
				this.gunTexPos.x,
				this.gunTexPos.y,
				this.gunTexSize.x,
				this.gunTexSize.y,
				false,
				p.x,
				p.y);
		}
		gunCount=3;
		for(let i=0;i<gunCount;i++){
			let p=VecA(20,i/gunCount*TAU+this.gunAngle3);
			if(p.x>0){
				continue;
			}
			p.x=80*2;

			renderer.img(
				this.pos.x,this.pos.y,
				this.gunSize.x,this.gunSize.y,
				this.angle,
				this.gunTexPos.x,
				this.gunTexPos.y,
				this.gunTexSize.x,
				this.gunTexSize.y,
				false,
				p.x,
				p.y);
		}

		renderer.img(
			this.pos.x,this.pos.y,
			this.triSize.x,this.triSize.y,
			this.angle,
			this.triTexPos.x,
			this.triTexPos.y,
			this.triTexSize.x,
			this.triTexSize.y,
			false,
			this.triOffset.x,
			this.triOffset.y);

		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}

class BossAxe extends Alien{
	constructor(p,a){
		super(p,a);

		this.maxHealth=25;
		this.health=this.maxHealth;

		this.size=Vec(202,118).scl(2);
		this.texPos=Vec(1134,1);
		this.texSize=Vec(202,118);
		this.offset=Vec(100,0);
		
		this.coverSize=Vec(16,28).scl(2);
		this.coverTexPos=Vec(1337,1);
		this.coverTexSize=Vec(16,28);
		this.coverOffset=Vec(0,-142);
		this.coverOffset2=Vec(0,40);
		this.coverOpen=1;
		this.coverSpeed=0.1;
		this.coverOpenLength=38;

		this.speed=1;
		this.resistance=0.8;
		this.pushSpeed=0.25;
		this.agilityNormal=0.025;
		this.agilityFire=0.01;
		this.agility=this.agilityNormal;

		this.cooldownMax=500;
		this.cooldown=Math.floor(Math.random()*this.cooldownMax);
		this.bulletSpeed=80;
		this.bulletSize=30;
		this.bulletDamage=20;
		this.bulletRange=150;
		this.accuracy=0;
		this.fireChainMax=100;
		this.fireChain=0;
		this.fireChainMod=10;

		this.damage=20;
		this.spin=0.025;
	}
	die(){
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,20);
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,10);
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,5);
	}
	shoot(bulletsArr,dryFire){
		if(!this.alive)
			return;
		if(this.cooldown<20){
			this.coverOpen=clamp(this.coverOpen+this.coverSpeed,0,1);
		}else if(this.fireChain==0){
			this.coverOpen=clamp(this.coverOpen-this.coverSpeed,0,1);

		}
		if(this.cooldown==0){
			if(!dryFire){
				this.fireChain=this.fireChainMax;
				this.agility=this.agilityFire;
			}
			this.cooldown=this.cooldownMax;
		}
		if(this.fireChain>0){
			if(this.fireChain%this.fireChainMod==0){
				let ra=(Math.random()-0.5)*2*this.accuracy;
				let s=this.bulletSpeed;
				let pVelo=VecA(s,this.angle+ra);
				pVelo.add(this.velo);
				let pPos=VecA(0,this.angle);
				pPos.add(this.pos);
				bulletsArr.push(new AlienBullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
			}
			this.fireChain--;
		}else{
			this.agility=this.agilityNormal;
		}
	}
	//TODO: axe sdf
	display(disp,renderer){
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			false,
			this.offset.x,
			this.offset.y);
		
		let coverCount=5;
		let a=PI*2/3-0.8;
		let coverPos1=this.coverOffset2.cln().rot(this.angle).add(this.pos);
		let coverPos2=this.coverOffset2.cln();
		coverPos2.y*=-1;
		coverPos2.rot(this.angle).add(this.pos);
		for(let n=0;n<=coverCount;n++){
			renderer.img(
				coverPos1.x,coverPos1.y,
				this.coverSize.x,this.coverSize.y,
				this.angle+n/coverCount*a-a/2,
				this.coverTexPos.x,
				this.coverTexPos.y,
				this.coverTexSize.x,
				this.coverTexSize.y,
				false,
				this.coverOffset.x,
				this.coverOffset.y-this.coverOpen*this.coverOpenLength);
			renderer.img(
				coverPos2.x,coverPos2.y,
				this.coverSize.x,this.coverSize.y,
				this.angle+n/coverCount*a-a/2+PI,
				this.coverTexPos.x,
				this.coverTexPos.y,
				this.coverTexSize.x,
				this.coverTexSize.y,
				false,
				this.coverOffset.x,
				this.coverOffset.y-this.coverOpen*this.coverOpenLength);
		}

		let chargeP=VecA(-100,this.angle).add(this.pos);

		bulletRenderer.line(
			chargeP.x,
			chargeP.y,
			(1-this.cooldown/this.cooldownMax)*60,
			0,
			0,
			10,
			.3,.6,.1
		);

		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}

class BossYarn extends Alien{
	constructor(p,a){
		super(p,a);

		this.maxHealth=25;
		this.health=this.maxHealth;

		this.size=Vec(122,122).scl(2);
		this.texPos=Vec(1477,1);
		this.texSize=Vec(122,122);
		this.offset=Vec(0,0);

		this.isOpen=false;
		this.arrowOpen=0;
		this.openSpeed=0.02;

		this.arrowSize=Vec(38,53).scl(2);
		this.arrowTexPos=Vec(1354,1);
		this.arrowTexSize=Vec(38,53);
		this.arrowOffset=Vec(0,-53+2);

		this.arrow2Size=Vec(36,27).scl(2);
		this.arrow2TexPos=Vec(1354,171);
		this.arrow2TexSize=Vec(36,27);
		this.arrow2Offset=Vec(0,-118);
		this.arrow2Spin=0;
		
		this.blockSize=Vec(30,30).scl(2);
		this.blockTexPos=Vec(1354,109);
		this.blockTexSize=Vec(30,30);
		this.blockOffset=Vec(0,-93);

		this.ringSize=Vec(82,82).scl(2);
		this.ringTexPos=Vec(1394,1);
		this.ringTexSize=Vec(82,82);

		this.letterSize=Vec(5,7).scl(2);
		this.letterTexPos=Vec(1391,167);
		this.letterTexSize=Vec(5,7);
		this.letterOffset=Vec(0,-110);
		this.letterCount=9;
		this.letters=Array(50).fill().map(x=>Math.floor(Math.random()*(this.letterCount+2)));

		this.speed=2;
		this.resistance=0.8;
		this.pushSpeed=0.25;
	}
	run(){
		super.run();
		this.arrow2Spin+=0.02;
		this.angle-=0.005;
		if(this.isOpen){
			this.arrowOpen=Math.max(this.arrowOpen-this.openSpeed,0);
		}else{
			this.arrowOpen=Math.min(this.arrowOpen+this.openSpeed,1);
		}
	}
	open(){
		this.isOpen=true;
	}
	close(){
		this.isOpen=false;
	}
	die(){
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,20);
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,10);
		gameRunner.wreck(this.pos.x,this.pos.y,this.velo.x,this.velo.y,5);
	}
	shoot(){
	}
	//TODO: circle sdf
	display(disp,renderer){
		
		let arrowCount=6;
		
		for(let n=0;n<arrowCount;n++){
			renderer.img(
				this.pos.x,this.pos.y,
				this.arrow2Size.x,this.arrow2Size.y,
				this.angle+(n+0.5)/arrowCount*TAU+this.arrow2Spin,
				this.arrow2TexPos.x,
				this.arrow2TexPos.y,
				this.arrow2TexSize.x,
				this.arrow2TexSize.y,
				false,
				this.arrow2Offset.x,
				this.arrow2Offset.y+this.arrowOpen*60);
		}
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			false,
			this.offset.x,
			this.offset.y);
		for(let n=0;n<this.letters.length;n++){
			let l=this.letters[n];
			if(l>=this.letterCount){
				continue;
			}
			renderer.img(
				this.pos.x,this.pos.y,
				this.letterSize.x,this.letterSize.y,
				this.angle+(n)/this.letters.length*TAU,
				this.letterTexPos.x+l*this.letterTexSize.x,
				this.letterTexPos.y,
				this.letterTexSize.x,
				this.letterTexSize.y,
				false,
				this.letterOffset.x,
				this.letterOffset.y);
		}
		
		for(let n=0;n<arrowCount;n++){
			renderer.img(
				this.pos.x,this.pos.y,
				this.arrowSize.x,this.arrowSize.y,
				this.angle+n/arrowCount*TAU,
				this.arrowTexPos.x,
				this.arrowTexPos.y,
				this.arrowTexSize.x,
				this.arrowTexSize.y,
				false,
				this.arrowOffset.x,
				this.arrowOffset.y-this.arrowOpen*60);
		}
		for(let n=0;n<arrowCount;n++){
			renderer.img(
				this.pos.x,this.pos.y,
				this.blockSize.x,this.blockSize.y,
				this.angle+(n+0.5)/arrowCount*TAU,
				this.blockTexPos.x,
				this.blockTexPos.y,
				this.blockTexSize.x,
				this.blockTexSize.y,
				false,
				this.blockOffset.x,
				this.blockOffset.y);
		}
		
		renderer.img(
			this.pos.x,this.pos.y,
			this.ringSize.x,this.ringSize.y,
			this.angle,
			this.ringTexPos.x,
			this.ringTexPos.y,
			this.ringTexSize.x,
			this.ringTexSize.y,
			false);

		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}