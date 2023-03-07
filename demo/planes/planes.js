class Plane extends Entity{
	constructor(p,a){
		super();

		this.thrustLimit=1;
		this.thrustRecover=0.25;
		this.thrustPotential=15;
		this.thrustPotLim=15;
		
		this.agilityMin=0.04;
		this.agilityMax=0.08;
		this.agilityFall=0.08;
		
		this.resistanceMin=0.9995;
		this.resistanceMax=0.995;
		this.fallResistance=0.9995;
		this.transfer=0.15;

		this.resistanceWater=0.97;
		this.buoyancy=Vec(0,-0.5);
		this.submerged=false;
		this.bubbling=false;//TODO: add time limit

		this.cooldown=0;
		this.cooldownMax=10;
		this.bulletSpeed=50;
		this.bulletSize=6;
		this.bulletDamage=1;
		this.bulletRange=100;
		this.accuracy=0.05;
		
		this.minSpeed=5;//min speed for lift
		this.maxSpeed=40;//speed for max efficiency
		
		this.maxHealth=2000*1000;
		this.health=this.maxHealth;
		
		this.gravity=Vec(0,0.2);

		this.ceilingStart=2000;
		this.ceilingEnd=6000;
		
		this.pos=Vec(p);
		this.velo=Vec(0,0);
		this.angle=a;
		this.size=Vec(88,31).scl(2);
		this.texPos=Vec(1,1);
		this.texSize=Vec(88,31);
		this.offset=Vec(0,0);
		this.bulletOffset=Vec(0,0);

		this.waveSize=5;
		this.splashSize=7;

		this.thrust=0;
		this.agility=0;

		this.bubbleTime=0;
		this.bubbleMax=40;

		this.hb=[];
		this.calcHitbox();
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
	run(){
		super.run();
		
		this.velo.add(VecA(this.thrust,this.angle));
		this.thrust=0;
		if(this.thrustPotential<this.thrustPotLim){
			this.thrustPotential+=this.thrustRecover;
		}
		
		let speedEff=this.getEfficiency();
		
		this.velo.add(this.gravity);
		this.velo.scl(this.resistanceMin+(this.resistanceMax-this.resistanceMin)*speedEff);
		
		this.pos.add(this.velo);
		
		let vSpeed=this.velo.mag();
		let vAngle=this.velo.ang();
		let dotP=Math.cos(this.angle-vAngle);
		
		if(dotP>=0){
			let eff=dotP*this.transfer*speedEff;
			this.velo.sub(VecA(vSpeed*eff,vAngle));
			this.velo.add(VecA(vSpeed*eff,this.angle));
			this.agility=this.agilityMin+(this.agilityMax-this.agilityMin)*speedEff;
		}else{
			this.velo.scl(this.fallResistance);
			this.agility=this.agilityFall;
		}
		
		if(this.cooldown>0){
			this.cooldown--;
		}
		if(gameRunner.isUnderwater(this.pos.x,this.pos.y)){
			let slowed=this.velo.cln();
			this.velo.scl(this.resistanceWater);

			slowed.sub(this.velo);
			let strength=slowed.mag();
			gameRunner.wave(this.pos.x,this.pos.y,100,strength*this.waveSize);
			if(!this.submerged){
				let splash=slowed.mag()*this.splashSize;
				if(splash>2)
					gameRunner.splash(this.pos.x+this.velo.x*5,this.pos.y+this.velo.y*5,slowed.x*100,slowed.y*100,splash);
				// gameRunner.knock(this.pos.cln().sub(slowed),splash);
			}
			this.submerged=true;
			this.velo.add(this.buoyancy);

			if(strength>0.3&&this.bubbleTime<this.bubbleMax&&this.bubbling){
				this.bubbleTime++;
				gameRunner.bubbles(this.pos.x,this.pos.y,0,0,
					(strength-0.5)*10*(1-this.bubbleTime/this.bubbleMax)
				);
			}else{
				this.bubbleTime=0;
				this.bubbling=false;
			}
		}else{
			this.bubbling=true;
			this.submerged=false;
		}

		gameRunner.wave(this.pos.x,this.pos.y,100,this.velo.mag()/20);
		
		this.calcHitbox();
	}
	getAgility(){
		return this.agilityMin+(this.agilityMax-this.agilityMin)*this.getEfficiency();
	}
	getEfficiency(){
		let vSpeed=this.velo.mag();
		return Math.max(Math.min((vSpeed-this.minSpeed)/(this.maxSpeed-this.minSpeed),1),0);
	}
	face(target){
		let ang=this.pos.ang(target);
		this.faceAng(ang);
	}
	faceAng(ang){
		this.angle+=clamp(
			nrmAngPI(ang-this.angle),-this.agility,this.agility);
	}
	boost(){
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=this.heightEfficiency();
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
	}
	heightEfficiency(){
		let alt=-this.pos.y;
		if(alt>this.ceilingEnd){
			return 0;
		}
		if(alt<this.ceilingStart){
			return 1;
		}
		return (this.ceilingEnd-alt)/(this.ceilingEnd-this.ceilingStart);
	}
	shoot(bulletsArr){
		if(this.cooldown==0){
			let flip=nrmAngPI(this.angle+PI/2)<0;

			let ra=(Math.random()-0.5)*2*this.accuracy;
			let s=this.bulletSpeed;
			let pVelo=VecA(s,this.angle+ra);
			pVelo.add(this.velo);
			let pPos=Vec(this.size.x/2.,0).add(this.offset).add(this.bulletOffset);
			if(flip){
				pPos.y*=-1;
			}
			pPos.rot(this.angle);
			pPos.add(this.pos);
			bulletsArr.push(new Bullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
			this.cooldown=this.cooldownMax;
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
			this.offset.x,
			this.offset.y);
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}
class Jet extends Plane{
	constructor(p,a){
		super(p,a);
		this.level=1;

		this.bulletSize=6+3*(this.level-1);
		this.bulletDamage=1+(this.level-1);
	}
	boost(){
		let hE=this.heightEfficiency();
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=hE;
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
		
		let offset=VecA(-this.size.x/2,this.angle);
		offset.add(this.pos);

		gameRunner.thrust(offset.x,offset.y,this.velo.x,this.velo.y,
			bPower
		);
		let m=this.velo.mag();
		for(let v=0;v<m;v+=20){
			let p=this.velo.cln().nrm(v).add(offset);
			gameRunner.cloud(p.x,p.y,255,255,255,30*hE);
		}
	}
}
class WrightFlyer extends Plane{
	constructor(p,a){
		super(p,a);
		
		this.thrustLimit=0.2;
		this.thrustRecover=0.2;
		this.thrustPotential=0.2;
		this.thrustPotLim=0.2;
		this.transfer=0.1;

		this.agilityMin=0.04;
		this.agilityMax=0.06;
		this.agilityFall=0.06;
		
		this.cooldown=0;
		this.cooldownMax=25;
		this.bulletSpeed=15;

		this.minSpeed=5;//min speed for lift
		this.maxSpeed=20;//speed for max efficiency
		
		this.ceilingStart=2000;
		this.ceilingEnd=4000;

		this.size=Vec(82,29).scl(2);
		this.texPos=Vec(389,523);
		this.texSize=Vec(82,29);
		this.offset=Vec(0,0);
		
		this.propPos=Vec(-39,-4);
		this.propSize=Vec(3,27).scl(2);
		this.propTexPos=Vec(472,523);
		this.propTexSize=Vec(3,27);
		this.propOffset=Vec(0,0);

		this.propTime=0;
		this.propSpeed=0;
	}
	run(){
		super.run();
		this.propSpeed*=0.95;
		this.propTime+=this.propSpeed;
	}
	boost(){
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=this.heightEfficiency();
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
		this.propSpeed+=0.003;
	}
	display(){
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
			this.offset.x,
			this.offset.y);
		
		let propP=this.propPos.cln();
		if(flip){
			propP.y*=-1;
		}
		propP.rot(this.angle).add(this.pos);
		let propHeight=Math.abs(VecA(1,this.propTime*TAU).x);
		renderer.img(
			propP.x,propP.y,
			this.propSize.x,this.propSize.y*propHeight,
			this.angle,
			this.propTexPos.x,
			this.propTexPos.y,
			this.propTexSize.x,
			this.propTexSize.y,
			flip,
			this.offset.x,
			this.offset.y);
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);

	}
}
class Raptor extends Plane{
	constructor(p,a){
		super(p,a);

		this.level=1;

		this.thrustLimit=1;
		this.thrustRecover=0.4;
		this.thrustPotential=15;
		this.thrustPotLim=15;
		this.transfer=0.2;

		this.agilityMin=0.06;
		this.agilityMax=0.08;
		this.agilityFall=0.08;
		
		this.cooldown=0;
		this.cooldownMax=5;
		this.bulletSpeed=75;
		this.bulletRange=100;
		this.bulletSize=6*this.level;
		this.bulletDamage=3+(this.level-1);
		this.accuracy=0.02;

		this.buoyancy=Vec(0,-0.7);

		this.size=Vec(103,36).scl(2);
		this.texPos=Vec(272,109);
		this.texSize=Vec(103,36);
		this.offset=Vec(0,0);
	}
	boost(){
		let hE=this.heightEfficiency();
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=hE;
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
		
		let offset=VecA(-this.size.x/2,this.angle);
		offset.add(this.pos);

		gameRunner.thrust(offset.x,offset.y,this.velo.x,this.velo.y,
			bPower
		);
		let m=this.velo.mag();
		for(let v=0;v<m;v+=20){
			let p=this.velo.cln().nrm(v).add(offset);
			gameRunner.cloud(p.x,p.y,255,255,255,30*hE);
		}
	}
}
class Biplane extends Plane{
	constructor(p,a){
		super(p,a);

		this.level=1;

		this.wingNum=this.level+1;
		if(this.level==0){
			this.wingNum=0;
		}
		let wingModifier=10;
		let wingBaseline=Math.max(0,this.wingNum-2);
		let wingScale=wingModifier/(wingBaseline+wingModifier);

		this.thrustLimit=0.4;
		this.thrustRecover=0.4;
		this.thrustPotential=0.4;
		this.thrustPotLim=0.4;
		
		this.agilityMin=0.06*wingScale;
		this.agilityMax=0.08*wingScale;
		this.agilityFall=0.08*wingScale;
		
		this.cooldown=0;
		this.cooldownMax=15;
		this.bulletSpeed=30;
		this.bulletRange=30;
		this.bulletSize=6;
		
		this.resistanceMin=0.999;
		this.resistanceMax=0.98;
		this.fallResistance=0.999;
		this.transfer=1-(1-0.15)*wingScale;

		this.gravity=Vec(0,0.15);
		if(this.wingNum==0){
			this.transfer=0;
			this.gravity=Vec(0,0.2);
		}
		this.buoyancy=Vec(0,-0.75);
		
		this.minSpeed=5;//min speed for lift
		this.maxSpeed=30;//speed for max efficiency
		
		this.health=2500;
		this.maxHealth=this.health;
		
		this.size=Vec(72,32).scl(2);
		this.texPos=Vec(1,65);
		this.texSize=Vec(72,32);
		this.offset=Vec(-20,4);//TODO: get this to work and consider flipping
		
		this.propSize=Vec(3,30).scl(2);
		this.propPos=Vec(74,-6);
		this.propTime=0;
		this.propSpeed=0;
		this.propIdxs=[0,1,2,1];
		this.propTexPos=[Vec(74,65),Vec(78,65),Vec(82,65)];
		this.propTexSize=Vec(3,30);
		
		this.wingSize=Vec(24,4).scl(2);
		this.wingPos=Vec(42,-13);
		this.wingGap=Vec(0,-21).scl(2);
		this.wingTexPos=Vec(86,117);
		this.wingTexSize=Vec(24,4);
		if(this.wingNum%2==1){
			this.wingPos.y=-4;
		}

		this.supportSize=Vec(1,1).scl(2);
		this.supportPos1=Vec(-13,0);
		this.supportPos2=Vec(15,0);
		this.supportTexPos=Vec(111,117);
		this.supportTexSize=Vec(1,1);

	}
	shoot(bulletsArr){
		if(this.cooldown==0){
			let ra=(Math.random()-0.5)*2*this.accuracy;
			let s=this.bulletSpeed;
			
			let wingHeight=(this.wingNum-1)*this.wingGap.y;
			for(let i=0;i<this.wingNum;i++){
				let w=i/Math.max((this.wingNum-1),1);
				let wingP=this.wingPos.cln();
				wingP.x+=this.wingSize.x/2;
				wingP.y+=wingHeight*w-wingHeight/2;
				wingP.add(this.offset);
				if(Math.cos(this.angle)<0){
					wingP.y*=-1;
				}
				wingP.rot(this.angle).add(this.pos);

				let pVelo=VecA(s,this.angle+ra);
				pVelo.add(this.velo);
				bulletsArr.push(new Bullet(wingP,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
			}
			if(this.wingNum==0){
				let wingP=this.wingPos.cln();
				wingP.x+=this.wingSize.x/2;
				wingP.add(this.offset);
				if(Math.cos(this.angle)<0){
					wingP.y*=-1;
				}
				wingP.rot(this.angle).add(this.pos);

				let pVelo=VecA(s,this.angle+ra);
				pVelo.add(this.velo);
				bulletsArr.push(new Bullet(wingP,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
			}
			this.cooldown=this.cooldownMax;
		}
	}
	run(){
		super.run();
		this.propSpeed*=0.9;
		this.propTime=(this.propTime+this.propSpeed)%(this.propIdxs.length);
	}
	boost(){
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=this.heightEfficiency();
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
		this.propSpeed+=0.1;
	}
	display(disp,renderer){
		let flip=nrmAngPI(this.angle+PI/2)<0;
		let propP=this.propPos.cln();
		if(flip){
			propP.y*=-1;
		}
		propP.rot(this.angle).add(this.pos);
		let propI=this.propIdxs[Math.floor(this.propTime)];
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			flip,
			this.offset.x,
			this.offset.y);
		renderer.img(
			propP.x,propP.y,
			this.propSize.x,this.propSize.y,
			this.angle,
			this.propTexPos[propI].x,
			this.propTexPos[propI].y,
			this.propTexSize.x,
			this.propTexSize.y,
			flip,
			this.offset.x,
			this.offset.y);

		let wingHeight=(this.wingNum-1)*this.wingGap.y;
		if(this.wingNum>=2){
			{
				let supportP=this.wingPos.cln().add(this.supportPos1);
				if(flip){
					supportP.y*=-1;
				}
				supportP.rot(this.angle).add(this.pos);
				renderer.img(
					supportP.x,supportP.y,
					this.supportSize.x,this.supportSize.y+wingHeight,
					this.angle,
					this.supportTexPos.x,
					this.supportTexPos.y,
					this.supportTexSize.x,
					this.supportTexSize.y,
					flip,
					this.offset.x,
					this.offset.y);
			}
			{
				let supportP=this.wingPos.cln().add(this.supportPos2);
				if(flip){
					supportP.y*=-1;
				}
				supportP.rot(this.angle).add(this.pos);
				renderer.img(
					supportP.x,supportP.y,
					this.supportSize.x,this.supportSize.y+wingHeight,
					this.angle,
					this.supportTexPos.x,
					this.supportTexPos.y,
					this.supportTexSize.x,
					this.supportTexSize.y,
					flip,
					this.offset.x,
					this.offset.y);
			}
		}
		for(let i=0;i<this.wingNum;i++){
			let w=i/Math.max((this.wingNum-1),1);
			let wingP=this.wingPos.cln();
			wingP.y+=wingHeight*w-wingHeight/2;
			if(flip){
				wingP.y*=-1;
			}
			wingP.rot(this.angle).add(this.pos);
			renderer.img(
				wingP.x,wingP.y,
				this.wingSize.x,this.wingSize.y,
				this.angle,
				this.wingTexPos.x,
				this.wingTexPos.y,
				this.wingTexSize.x,
				this.wingTexSize.y,
				flip,
				this.offset.x,
				this.offset.y);
		}
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}

class Bomber extends Plane{
	constructor(p,a){
		super(p,a);
		this.level=1;

		this.thrustLimit=0.4;
		this.thrustRecover=0.3;
		this.thrustPotential=1;
		this.thrustPotLim=1;
		
		this.agilityMin=0.03;
		this.agilityMax=0.05;
		this.agilityFall=0.05;

		this.buoyancy=Vec(0,-0.6);
		
		this.ceilingStart=4000;
		this.ceilingEnd=10000;

		this.cooldownMax=6;
		this.bulletDamage=1;
		this.bulletSpeed=12;
		this.bulletSize=13;
		this.bulletRange=200;
		switch(this.level){
			case 0:
				this.bulletSize=12;
				this.cooldownMax=10;
				this.bulletDamage=3;
				break;
			case 2:
				this.bulletSize=23;
				this.cooldownMax=10;
				this.bulletDamage=3;
				break;
			case 3:
				this.bulletSize=45;
				this.cooldownMax=20;
				this.bulletDamage=5;
				break;
			case 4:
				this.bulletSize=45;
				this.cooldownMax=10;
				this.bulletDamage=5;
				break;
			default:
				this.bulletSize=13;
		}

		this.minSpeed=10;
		this.maxSpeed=80;
		
		this.resistanceMin=0.999;
		this.resistanceMax=0.95;
		this.fallResistance=0.999;
		this.transfer=0.2;
		
		this.maxHealth=1500;
		this.health=this.maxHealth;

		this.size=Vec(70,57).scl(2);
		this.texPos=Vec(90,1);
		this.texSize=Vec(70,57);
	}
	shoot(bulletsArr){
		if(this.cooldown==0){
			let ra=(Math.random()-0.5);
			let s=this.bulletSpeed;
			let pVelo=VecA(s,-PI/2+ra);
			pVelo.add(this.velo);
			let pPos=Vec(0,0);
			pPos.add(this.pos);
			switch(this.level){
				case 0:
					bulletsArr.push(new FlowerPot(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
					break;
				case 2:
					bulletsArr.push(new BigBomb(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
					break;
				case 3:
					bulletsArr.push(new HugeBomb(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
					break;
				case 4:
					bulletsArr.push(new HugeBomb(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
					break;
				default:
					bulletsArr.push(new Bomb(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
					break;
			}
			this.cooldown=this.cooldownMax;
		}
	}
}
class BlackBird extends Plane{
	constructor(p,a){
		super(p,a);
		this.level=1;

		this.thrustLimit=0.4;
		this.thrustRecover=0.3;
		this.thrustPotential=1;
		this.thrustPotLim=1;
		
		this.agilityMin=0.02;
		this.agilityMax=0.04;
		this.agilityFall=0.04;

		this.buoyancy=Vec(0,-0.6);
		
		this.ceilingStart=4000;
		this.ceilingEnd=10000;

		this.cooldownMax=100;
		this.cooldown=this.cooldownMax;
		this.bulletDamage=5;
		this.bulletSpeed=20;
		this.bulletRange=250;
		this.bulletSize=76;

		this.minSpeed=10;
		this.maxSpeed=80;
		
		this.resistanceMin=0.999;
		this.resistanceMax=0.98;
		this.fallResistance=0.999;
		this.transfer=0.2;
		
		this.maxHealth=1500;
		this.health=this.maxHealth;

		this.size=Vec(203,68).scl(2);
		this.texPos=Vec(149,385);
		this.texSize=Vec(203,68);
		this.offset=Vec(60,0);
		this.thrusterPos1=Vec(-100,-21).scl(2);
		this.thrusterPos2=Vec(-100,14).scl(2);

		this.waveSize=8;
	}
	boost(){
		let hE=this.heightEfficiency();
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=hE;
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
		
		let offset1=VecA(this.thrusterPos1).add(this.offset);
		let offset2=VecA(this.thrusterPos2).add(this.offset);
		let flip=nrmAngPI(this.angle+PI/2)<0;
		if(flip){
			offset1.y*=-1;
			offset2.y*=-1;
		}
		offset1.rot(this.angle);
		offset2.rot(this.angle);
		offset1.add(this.pos);
		offset2.add(this.pos);
		gameRunner.thrust(offset1.x,offset1.y,this.velo.x,this.velo.y,
			bPower
		);
		gameRunner.thrust(offset2.x,offset2.y,this.velo.x,this.velo.y,
			bPower
		);
		let m=this.velo.mag();
		for(let v=0;v<m;v+=20){
			let p1=this.velo.cln().nrm(v).add(offset1);
			let p2=this.velo.cln().nrm(v).add(offset2);
			gameRunner.cloud(p1.x,p1.y,255,255,255,30*hE);
			gameRunner.cloud(p2.x,p2.y,255,255,255,30*hE);
		}
	}
	shoot(bulletsArr){
		if(this.cooldown==0){
			let ra=(Math.random()-0.5);
			let s=this.bulletSpeed;
			let pVelo=VecA(s,-PI/2+ra);
			pVelo.add(this.velo);
			let pPos=Vec(0,0);
			pPos.add(this.pos);
			bulletsArr.push(new Nuke(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
			this.cooldown=this.cooldownMax;
		}
	}
}
class BuzzBomb extends Plane{
	constructor(p,a){
		super(p,a);
		this.level=1;

		this.thrustLimit=0.4;
		this.thrustRecover=0.4;
		this.thrustPotential=0.4;
		this.thrustPotLim=0.4;
		
		this.agilityMin=0.06;
		this.agilityMax=0.06;
		this.agilityFall=0.06;

		this.buoyancy=Vec(0,-0.8);
		
		this.ceilingStart=4000;
		this.ceilingEnd=10000;

		this.minSpeed=10;
		this.maxSpeed=20;

		this.size=Vec(60,25).scl(2);
		this.texPos=Vec(299,183);
		this.texSize=Vec(60,25);

		this.waveSize=2;
		this.splashSize=5;
	}
	shoot(){

	}
	boost(){
		let hE=this.heightEfficiency();
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=hE;
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
		
		let flip=nrmAngPI(this.angle+PI/2)<0;
		let offset=Vec(-this.size.x/2,-20);
		if(flip){
			offset.y*=-1;
		}
		offset.rot(this.angle);
		offset.add(this.pos);

		gameRunner.thrust(offset.x,offset.y,this.velo.x,this.velo.y,
			bPower*0.3
		);
		let m=this.velo.mag();
		for(let v=0;v<m;v+=20){
			let p=this.velo.cln().nrm(v).add(offset);
			gameRunner.cloud(p.x,p.y,255,255,255,15*hE);
		}
	}
}
class WarPlane extends Plane{
	constructor(p,a){
		super(p,a);
		this.level=1;

		this.thrustLimit=1;
		this.thrustRecover=0.3;
		this.thrustPotential=10;
		this.thrustPotLim=10;
		
		this.agilityMin=0.04;
		this.agilityMax=0.05;
		this.agilityFall=0.05;
		
		this.buoyancy=Vec(0,-0.6);
		
		this.cooldown=0;
		this.cooldownMax=6;
		this.bulletSpeed=50;
		this.bulletRange=100;
		this.bulletSize=6;

		this.canBomb=this.level>1;
		this.bombCooldown=0;
		this.bombCooldownMax=20;
		switch(this.level){
			case 2:
				this.bombCooldownMax=20;
				break;
			case 3:
				this.bombCooldownMax=10;
				break;
			case 4:
				this.bombCooldownMax=5;
				break;
		}
		this.bombSpeed=12;
		this.bombRange=200;
		this.bombSize=13;
		this.bombDamage=1;
		
		this.resistanceMin=0.999;
		this.resistanceMax=0.98;
		this.fallResistance=0.999;
		this.transfer=0.3;
		
		this.minSpeed=10;//min speed for lift
		this.maxSpeed=40;//speed for max efficiency
		
		this.health=2500;
		this.maxHealth=this.health;
		
		this.size=Vec(75,32).scl(2);
		this.texPos=Vec(161,1);
		this.texSize=Vec(75,32);
		
		this.propSize=Vec(6,27).scl(2);
		this.propPos=Vec(80.9,-9);
		this.propTime=0;
		this.propSpeed=0;
		this.propIdxs=[0,1,2,1];
		this.propTexPos=[Vec(237,1),Vec(244,1),Vec(251,1)];
		this.propTexSize=Vec(6,27);
		this.offset=Vec(-20,8);
	}
	run(){
		super.run();
		if(this.bombCooldown>0){
			this.bombCooldown--;
		}
		this.propSpeed*=0.9;
		this.propTime=(this.propTime+this.propSpeed)%(this.propIdxs.length);
	}
	boost(){
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=this.heightEfficiency();
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
		this.propSpeed+=0.1;
	}
	display(disp,renderer){
		// disp.circle2(this.pos.x,this.pos.y,10,10);
		let flip=nrmAngPI(this.angle+PI/2)<0;
		let propP=this.propPos.cln();
		if(flip){
			propP.y*=-1;
		}
		propP.rot(this.angle).add(this.pos);
		let propI=this.propIdxs[Math.floor(this.propTime)];
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			flip,
			this.offset.x,
			this.offset.y);
		renderer.img(
			propP.x,propP.y,
			this.propSize.x,this.propSize.y,
			this.angle,
			this.propTexPos[propI].x,
			this.propTexPos[propI].y,
			this.propTexSize.x,
			this.propTexSize.y,
			flip,
			this.offset.x,
			this.offset.y);
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
	shoot(bulletsArr){
		if(this.canBomb&&this.bombCooldown==0){
			let ra=(Math.random()-0.5);
			let s=this.bombSpeed;
			let pVelo=VecA(s,-PI/2+ra);
			pVelo.add(this.velo);
			let pPos=Vec(0,0);
			pPos.add(this.pos);
			bulletsArr.push(new Bomb(pPos,pVelo,this.bombDamage,this.bombSize,this.bombRange));
			this.bombCooldown=this.bombCooldownMax;
		}
		super.shoot(bulletsArr);
	}
}
class Corsair extends Plane{
	constructor(p,a){
		super(p,a);

		this.level=1;

		this.thrustLimit=1;
		this.thrustRecover=0.4;
		this.thrustPotential=10;
		this.thrustPotLim=10;
		
		this.agilityMin=0.04;
		this.agilityMax=0.05;
		this.agilityFall=0.05;
		
		this.buoyancy=Vec(0,-0.6);
		
		this.cooldown=0;
		this.cooldownMax=4-(this.level-1);
		this.bulletSpeed=50;
		this.bulletRange=80;
		this.bulletSize=6;
		this.bulletDamage=3;
		this.accuracy=0.05*this.level;
		
		this.resistanceMin=0.999;
		this.resistanceMax=0.98;
		this.fallResistance=0.999;
		this.transfer=0.15;
		
		this.minSpeed=10;//min speed for lift
		this.maxSpeed=40;//speed for max efficiency
		
		this.health=2500;
		this.maxHealth=this.health;
		
		this.size=Vec(106,53).scl(2);
		this.texPos=Vec(353,415);
		this.texSize=Vec(106,53);
		this.offset=Vec(-20,8);
		
		this.propSize=Vec(3,44).scl(2);
		this.propPos=Vec(110.9,-11);
		this.propTime=0;
		this.propSpeed=0;
		this.propTexPos=Vec(461,415);
		this.propTexSize=Vec(3,44);

		this.noseSize=Vec(7,6).scl(2);
		this.nosePos=Vec(112.9,-11);
		this.noseTexPos=Vec(465,415);
		this.noseTexSize=Vec(7,6);
	}
	run(){
		super.run();
		this.propSpeed*=0.95;
		this.propTime+=this.propSpeed;
	}
	boost(){
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=this.heightEfficiency();
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
		this.propSpeed+=0.005;
	}
	shoot(bulletsArr){
		if(this.cooldown==0){
			let shots=Math.max(-this.cooldownMax-1,1);
			for(let i=0;i<shots;i++){
				let ra=(Math.random()-0.5)*2*this.accuracy;
				let s=this.bulletSpeed;
				let pVelo=VecA(s,this.angle+ra);
				pVelo.add(this.velo);
				let pPos=VecA(this.size.x/2.,this.angle);
				pPos.add(this.pos);
				if(shots>5){
					bulletsArr.push(new BulletExtraLite(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
				}else if(shots>1){
					bulletsArr.push(new BulletLite(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
				}else{
					bulletsArr.push(new Bullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
				}
				this.cooldown=Math.max(this.cooldownMax,0);
			}
		}
	}
	display(disp,renderer){
		// disp.circle2(this.pos.x,this.pos.y,10,10);
		let flip=nrmAngPI(this.angle+PI/2)<0;
		let propP=this.propPos.cln();
		let noseP=this.nosePos.cln();
		if(flip){
			propP.y*=-1;
			noseP.y*=-1;
		}
		propP.rot(this.angle).add(this.pos);
		noseP.rot(this.angle).add(this.pos);
		let propHeight=Math.abs(VecA(1,this.propTime*TAU).x);
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			flip,
			this.offset.x,
			this.offset.y);
		renderer.img(
			noseP.x,noseP.y,
			this.noseSize.x,this.noseSize.y,
			this.angle,
			this.noseTexPos.x,
			this.noseTexPos.y,
			this.noseTexSize.x,
			this.noseTexSize.y,
			flip,
			this.offset.x,
			this.offset.y);
		renderer.img(
			propP.x,propP.y,
			this.propSize.x,this.propSize.y*propHeight,
			this.angle,
			this.propTexPos.x,
			this.propTexPos.y,
			this.propTexSize.x,
			this.propTexSize.y,
			flip,
			this.offset.x,
			this.offset.y);
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}
class Slammer extends Plane{
	constructor(p,a){
		super(p,a);
		this.level=1;
		
		this.thrustLimit=0.5;
		this.thrustRecover=0.5;
		this.thrustPotential=0.5;
		this.thrustPotLim=0.5;
		
		this.agilityMin=0.04;
		this.agilityMax=0.05;
		this.agilityFall=0.05;
		
		this.buoyancy=Vec(0,-1);
		
		this.resistanceMin=0.999;
		this.resistanceMax=0.98;
		this.fallResistance=0.999;
		this.transfer=0.15;

		this.minSpeed=10;
		this.maxSpeed=80;

		this.size=Vec(42,42).scl(2);
		this.texPos=Vec(272,23);
		this.texSize=Vec(42,42);

		this.damage=1;
		
		this.propNum=3;
		this.propSize=Vec(6,35).scl(2);
		this.propMidSize=Vec(0,20).scl(2);
		this.propPos=Vec(0,0);
		this.propTime=0;
		this.propSpeed=0;
		this.propTexPos=Vec(315,1);
		this.propTexSize=Vec(6,35);

		this.bodyAngle=0;
		this.bodySize=Vec(52,10).scl(2);
		this.bodyPos=Vec(0,0);
		this.bodyTexPos=Vec(262,1);
		this.bodyTexSize=Vec(52,10);
	}
	shoot(){
		
	}
	run(){
		super.run();
		// this.bodyAngle+=clamp(nrmAngPI(this.angle-this.bodyAngle),-0.03,0.03);
		this.bodyAngle+=nrmAngPI(this.angle-this.bodyAngle)/10;
		this.propSpeed*=0.95;
		this.propTime+=this.propSpeed;
	}
	boost(){
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=this.heightEfficiency();
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
		this.propSpeed+=0.005;
	}
	display(){
		let flip=nrmAngPI(this.angle+PI/2)<0;
		
		for(let i=0;i<this.propNum;i++){
			let propR=VecA(1,(this.propTime+i/this.propNum)*TAU);
			let propHeight=propR.x;
			if(propR.y<0){
				continue;
			}
			let propP=this.propPos.cln()
				.add(this.propMidSize.cln().scl(propHeight))
				.add(this.propSize.cln().scl(Vec(0,propHeight/2)));
			if(flip){
				propP.y*=-1;
			}
			propP.rot(this.angle-PI/2).add(this.pos);
			renderer.img(
				propP.x,propP.y,
				this.propSize.x,this.propSize.y*propHeight,
				this.angle-PI/2,
				this.propTexPos.x,
				this.propTexPos.y,
				this.propTexSize.x,
				this.propTexSize.y,
				flip,
				this.offset.x,
				this.offset.y);
		}
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.bodyAngle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			flip,
			this.offset.x,
			this.offset.y);
		
		renderer.img(
			this.pos.x,this.pos.y,
			this.bodySize.x,this.bodySize.y,
			this.angle,
			this.bodyTexPos.x,
			this.bodyTexPos.y,
			this.bodyTexSize.x,
			this.bodyTexSize.y,
			flip,
			this.offset.x,
			this.offset.y);
		
		for(let i=0;i<this.propNum;i++){
			let propR=VecA(1,(this.propTime+i/this.propNum)*TAU);
			let propHeight=propR.x;
			if(propR.y>0){
				continue;
			}
			let propP=this.propPos.cln()
				.add(this.propMidSize.cln().scl(propHeight))
				.add(this.propSize.cln().scl(Vec(0,propHeight/2)));
			if(flip){
				propP.y*=-1;
			}
			propP.rot(this.angle-PI/2).add(this.pos);
			renderer.img(
				propP.x,propP.y,
				this.propSize.x,this.propSize.y*propHeight,
				this.angle-PI/2,
				this.propTexPos.x,
				this.propTexPos.y,
				this.propTexSize.x,
				this.propTexSize.y,
				flip,
				this.offset.x,
				this.offset.y);
		}
		
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}
class Triebflugel extends Plane{
	constructor(p,a){
		super(p,a);

		this.level=1;

		this.propNum=3;

		this.thrustLimit=2;
		this.thrustRecover=0.2*(1+(this.level-1)/4);
		this.thrustPotential=8;
		this.thrustPotLim=8;
		
		this.agilityMin=0.04;
		this.agilityMax=0.06;
		this.agilityFall=0.03;
		
		this.buoyancy=Vec(0,-0.6);
		
		this.cooldown=0;
		this.cooldownMax=100;
		this.bulletSpeed=50;
		this.bulletRange=100;
		this.bulletSize=6;
		this.bulletDamage=1;
		
		this.resistanceMin=0.9999;
		this.resistanceMax=0.998;
		this.fallResistance=0.9999;
		this.transfer=0.2;
		
		this.minSpeed=10;//min speed for lift
		this.maxSpeed=80;//speed for max efficiency
		
		this.health=2500;
		this.maxHealth=this.health;
		
		this.size=Vec(87,47).scl(2);
		this.texPos=Vec(211,197);
		this.texSize=Vec(87,47);
		this.offset=Vec(-19,0);
		
		this.propSize=Vec(9,30).scl(2);
		this.propMidSize=Vec(0,15/2).scl(2);
		this.propPos=Vec(19,0);
		this.propTime=0;
		this.propSpeed=0;
		this.propTexPos=Vec(193,255);
		this.propTexSize=Vec(9,1);

		this.engineSize=Vec(15,9).scl(2).scl(this.level);
		this.engineTexPos=Vec(193,259);
		this.engineTexSize=Vec(15,9);
	}
	run(){
		super.run();
		this.propSpeed*=0.95;
		this.propTime+=this.velo.mag()/1000;
		this.cooldown=Math.max(0,this.cooldown-this.velo.mag()/4);
	}
	shoot(bulletsArr){
		
		if(this.cooldown==0){
			let ra=(Math.random()-0.5)*2*this.accuracy;
			let s=this.bulletSpeed;
			let pVelo=VecA(s,this.angle+ra);
			pVelo.add(this.velo);

			let flip=nrmAngPI(this.angle+PI/2)<0;
			for(let i=0;i<this.propNum;i++){
				let propR=VecA(1,(this.propTime+i/this.propNum)*TAU);
				let propHeight=propR.x;
				let propP=this.propPos.cln()
					.add(this.propMidSize.cln().scl(propHeight))
					.add(this.propSize.cln().scl(Vec(0,propHeight/2)));
				let engineP=propP.cln();
				engineP.y+=(this.propSize.y*propHeight/2);
				engineP.add(this.offset);
				if(flip){
					propP.y*=-1;
					engineP.y*=-1;
				}
				engineP.rot(this.angle).add(this.pos);
				
				bulletsArr.push(new BulletLite(engineP,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
			}

			this.cooldown=this.cooldownMax;
		}
	}
	boost(){
		let hE=this.heightEfficiency();
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=hE;
		this.thrust+=bPower;
		this.thrustPotential-=bPower;

		let flip=nrmAngPI(this.angle+PI/2)<0;
		for(let i=0;i<this.propNum;i++){
			let propR=VecA(1,(this.propTime+i/this.propNum)*TAU);
			let propHeight=propR.x;
			let propP=this.propPos.cln()
				.add(this.propMidSize.cln().scl(propHeight))
				.add(this.propSize.cln().scl(Vec(0,propHeight/2)));
			let engineP=propP.cln();
			engineP.y+=(this.propSize.y*propHeight/2);
			engineP.add(this.offset);
			if(flip){
				propP.y*=-1;
				engineP.y*=-1;
			}
			engineP.rot(this.angle).add(this.pos);

			gameRunner.thrust(engineP.x,engineP.y,this.velo.x,this.velo.y,
				bPower
			);
		}
		let m=this.velo.mag();
		for(let v=0;v<m;v+=20){
			let t=this.propTime+v/m*this.propSpeed;
			for(let i=0;i<this.propNum;i++){
				let propR=VecA(1,(t+i/this.propNum)*TAU);
				let propHeight=propR.x;
				let propP=this.propPos.cln()
					.add(this.propMidSize.cln().scl(propHeight))
					.add(this.propSize.cln().scl(Vec(0,propHeight/2)));
				let engineP=propP.cln();
				engineP.y+=(this.propSize.y*propHeight/2);
				engineP.add(this.offset);
				if(flip){
					propP.y*=-1;
					engineP.y*=-1;
				}
				engineP.rot(this.angle).add(this.pos);

				let p=this.velo.cln().nrm(v).add(engineP);
				gameRunner.cloud(p.x,p.y,255,255,255,30*hE);
			}
		}
	}
	display(disp,renderer){
		// disp.circle2(this.pos.x,this.pos.y,10,10);
		let flip=nrmAngPI(this.angle+PI/2)<0;
		
		for(let i=0;i<this.propNum;i++){
			let propR=VecA(1,(this.propTime+i/this.propNum)*TAU);
			let propHeight=propR.x;
			if(propR.y<0){
				continue;
			}
			let propP=this.propPos.cln()
				.add(this.propMidSize.cln().scl(propHeight))
				.add(this.propSize.cln().scl(Vec(0,propHeight/2)));
			let engineP=propP.cln();
			engineP.y+=(this.propSize.y*propHeight/2);
			engineP.add(this.offset);
			let engineAng=PI/12;
			if(flip){
				propP.y*=-1;
				engineP.y*=-1;
				engineAng*=-1;
			}
			propP.rot(this.angle).add(this.pos);
			engineP.rot(this.angle).add(this.pos);
			renderer.img(
				propP.x,propP.y,
				this.propSize.x,this.propSize.y*propHeight,
				this.angle,
				this.propTexPos.x,
				this.propTexPos.y,
				this.propTexSize.x,
				this.propTexSize.y,
				flip,
				this.offset.x,
				this.offset.y);
			renderer.img(
				engineP.x,engineP.y,
				this.engineSize.x,this.engineSize.y,
				this.angle+engineAng,
				this.engineTexPos.x,
				this.engineTexPos.y,
				this.engineTexSize.x,
				this.engineTexSize.y,
				flip);
		}
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			flip,
			this.offset.x,
			this.offset.y);
		
		for(let i=0;i<this.propNum;i++){
			let propR=VecA(1,(this.propTime+i/this.propNum)*TAU);
			let propHeight=propR.x;
			if(propR.y>0){
				continue;
			}
			let propP=this.propPos.cln()
				.add(this.propMidSize.cln().scl(propHeight))
				.add(this.propSize.cln().scl(Vec(0,propHeight/2)));
			let engineP=propP.cln();
			engineP.y+=(this.propSize.y*propHeight/2);
			engineP.add(this.offset);
			let engineAng=PI/12;
			if(flip){
				propP.y*=-1;
				engineP.y*=-1;
				engineAng*=-1;
			}
			propP.rot(this.angle).add(this.pos);
			engineP.rot(this.angle).add(this.pos);
			renderer.img(
				propP.x,propP.y,
				this.propSize.x,this.propSize.y*propHeight,
				this.angle,
				this.propTexPos.x,
				this.propTexPos.y,
				this.propTexSize.x,
				this.propTexSize.y,
				flip,
				this.offset.x,
				this.offset.y);
			renderer.img(
				engineP.x,engineP.y,
				this.engineSize.x,this.engineSize.y,
				this.angle+engineAng,
				this.engineTexPos.x,
				this.engineTexPos.y,
				this.engineTexSize.x,
				this.engineTexSize.y,
				flip);
		}
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}

class Rocket extends Plane{
	constructor(p,a){
		super(p,a);

		this.level=1;

		this.thrustLimit=this.level;
		this.thrustRecover=this.level;
		this.thrustPotential=this.level;
		this.thrustPotLim=this.level;
		
		this.agilityMin=0.03;
		this.agilityMax=0.03;
		this.agilityFall=0.03;
		
		this.buoyancy=Vec(0,-1.4);
		
		this.resistanceMin=0.999;
		this.resistanceMax=0.98;
		this.fallResistance=0.999;
		this.transfer=0.1;
		
		this.minSpeed=10;//min speed for lift
		this.maxSpeed=200;//speed for max efficiency
		
		this.health=2500;
		this.maxHealth=this.health;
		
		this.size=Vec(361,53).scl(2);
		this.texPos=Vec(132,681);
		this.texSize=Vec(361,53);
		this.offset=Vec(-19,0);

		this.boosting=false;
	}
	shoot(){

	}
	run(){
		if(this.boosting){
			let bPower=Math.min(this.thrustLimit,this.thrustPotential);
			this.thrust+=bPower;
			this.thrustPotential-=bPower;

			let backP=VecA(-this.size.x/2-50,this.angle).add(this.pos)
			gameRunner.thrust(backP.x+this.velo.x,backP.y+this.velo.y,this.velo.x,this.velo.y,5);

			let m=this.velo.mag();
			for(let v=0;v<m;v+=20){
				for(let i=0;i<2;i++){
					let p1=this.velo.cln().nrm(v).add(backP).add(VecA(i/2*50,this.velo.ang()+PI/2));
					gameRunner.cloud(p1.x,p1.y,255,255,255,255);
					let p2=this.velo.cln().nrm(v).add(backP).add(VecA(-i/2*50,this.velo.ang()+PI/2));
					gameRunner.cloud(p2.x,p2.y,255,255,255,255);
				}
			}
		}

		super.run();
	}
	boost(){
		this.boosting=true;
	}
}
class Helicopter extends Plane{
	constructor(p,a){
		super(p,a);

		this.level=1;

		this.thrustLimit=2;
		this.thrustRecover=0.7;
		this.thrustPotential=10;
		this.thrustPotLim=10;
		
		this.agilityMin=0.06;
		this.agilityMax=0.06;
		this.agilityFall=0.06;
		
		this.buoyancy=Vec(0,-0.8);
		
		this.cooldown=0;
		this.cooldownMax=6;
		this.bulletSpeed=50;
		this.bulletRange=50;
		this.bulletSize=6+3*(this.level-1);
		this.bulletDamage=1+(this.level-1);
		this.accuracy=0.1;
		
		this.resistanceMin=0.999;
		this.resistanceMax=0.98;
		this.fallResistance=0.999;
		this.transfer=0;
		this.gravity=Vec(0,0.5);
		
		this.health=2500;
		this.maxHealth=this.health;
		
		this.size=Vec(110,37).scl(2);
		this.texPos=Vec(161,67);
		this.texSize=Vec(110,37);
		this.offset=Vec(-44,0);
		this.bulletOffset=Vec(0,15);
		
		this.propSize=Vec(102,3).scl(2);
		this.propPos=Vec(44,-32);
		this.propTime=0;
		this.propSpeed=0;
		this.propTexPos=Vec(161,143);
		this.propTexSize=Vec(102,3);

		this.tailSize=Vec(5,15).scl(2);
		this.tailPos=Vec(-95,-10);
		this.tailTime=0;
		this.tailTexPos=Vec(265,143);
		this.tailTexSize=Vec(5,15);
	}
	run(){
		let flip=nrmAngPI(this.angle+PI/2)<0;
		if(flip){
			this.velo.add(VecA(this.thrust,this.angle+PI/2));
		}else{
			this.velo.add(VecA(this.thrust,this.angle-PI/2));
		}
		this.thrust=0;
		super.run();

		this.propSpeed*=0.95;
		this.propTime+=this.propSpeed;
		this.tailTime+=0.4;
	}
	boost(){
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=this.heightEfficiency();
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
		this.propSpeed+=0.005;
	}
	shoot(bulletsArr){
		if(this.cooldown==0){
			
			if(this.level==0){
				let propHeight=VecA(1,this.propTime*TAU).x;
				
				let ra=(Math.random()-0.5)*2*this.accuracy;
				let s=this.bulletSpeed;
				let pVelo=VecA(s*propHeight,this.angle+ra);
				pVelo.add(this.velo);
				let pPos=VecA(0,this.angle);
				pPos.add(this.pos);
				bulletsArr.push(new Bullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
			}else{
				let flip=nrmAngPI(this.angle+PI/2)<0;
	
				let ra=(Math.random()-0.5)*2*this.accuracy;
				let s=this.bulletSpeed;
				let pVelo=VecA(s,this.angle+ra);
				pVelo.add(this.velo);
				let pPos=Vec(this.size.x/2.,0).add(this.offset).add(this.bulletOffset);
				if(flip){
					pPos.y*=-1;
				}
				pPos.rot(this.angle);
				pPos.add(this.pos);
				bulletsArr.push(new Bullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));
				this.cooldown=this.cooldownMax;
			}
			this.cooldown=this.cooldownMax;
		}
	}
	display(disp,renderer){
		// disp.circle2(this.pos.x,this.pos.y,10,10);
		let flip=nrmAngPI(this.angle+PI/2)<0;
		let propP=this.propPos.cln();
		let tailP=this.tailPos.cln().add(this.offset);
		if(flip){
			propP.y*=-1;
			tailP.y*=-1;
		}
		propP.rot(this.angle).add(this.pos);
		tailP.rot(this.angle).add(this.pos);
		if(this.level==0){
			let propHeight=VecA(1,this.propTime*TAU).x;
			let propFlip=propHeight<0;
			let p=Vec(-this.propPos.x*propHeight,0);
			p.rot(this.angle).add(this.pos);
			let a=this.angle;
			propHeight=Math.abs(propHeight);
			if(propFlip){
				a+=PI;
			}
			renderer.img(
				p.x,p.y,
				this.size.x*propHeight,this.size.y,
				a,
				this.texPos.x,
				this.texPos.y,
				this.texSize.x,
				this.texSize.y,
				flip!=propFlip,
				this.offset.x+this.propPos.x,
				this.offset.y);
			renderer.img(
				propP.x,propP.y,
				this.propSize.x,this.propSize.y,
				this.angle,
				this.propTexPos.x,
				this.propTexPos.y,
				this.propTexSize.x,
				this.propTexSize.y,
				flip,
				this.offset.x,
				this.offset.y);
		}else{
			let propHeight=Math.abs(VecA(1,this.propTime*TAU).x);
			renderer.img(
				this.pos.x,this.pos.y,
				this.size.x,this.size.y,
				this.angle,
				this.texPos.x,
				this.texPos.y,
				this.texSize.x,
				this.texSize.y,
				flip,
				this.offset.x,
				this.offset.y);
			renderer.img(
				propP.x,propP.y,
				this.propSize.x*propHeight,this.propSize.y,
				this.angle,
				this.propTexPos.x,
				this.propTexPos.y,
				this.propTexSize.x,
				this.propTexSize.y,
				flip,
				this.offset.x,
				this.offset.y);
			renderer.img(
				tailP.x,tailP.y,
				this.tailSize.x,this.tailSize.y,
				this.angle+this.tailTime,
				this.tailTexPos.x,
				this.tailTexPos.y,
				this.tailTexSize.x,
				this.tailTexSize.y,
				flip);
		}
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}
class Chopper extends Helicopter{
	constructor(p,a){
		super(p,a);

		this.level=1;

		this.thrustLimit=2;
		this.thrustRecover=1.2;
		this.thrustPotential=10;
		this.thrustPotLim=10;
		
		this.agilityMin=0.08;
		this.agilityMax=0.08;
		this.agilityFall=0.08;
		
		this.buoyancy=Vec(0,-1);
		
		this.cooldown=0;
		this.cooldownMax=3;
		this.bulletSpeed=80;
		this.bulletRange=50;
		this.bulletSize=6*this.level;
		this.bulletDamage=3+(this.level-1);
		this.accuracy=0.01;
		
		this.resistanceMin=0.999;
		this.resistanceMax=0.98;
		this.fallResistance=0.999;
		this.transfer=0;
		this.gravity=Vec(0,0.8);
		
		this.health=2500;
		this.maxHealth=this.health;
		
		this.size=Vec(130,36).scl(2);
		this.texPos=Vec(1,677);
		this.texSize=Vec(130,36);
		this.offset=Vec(-41,0);
		
		this.propSize=Vec(105,3).scl(2);
		this.propPos=Vec(41,-36);
		this.propTime=0;
		this.propSpeed=0;
		this.propTexPos=Vec(1,751);
		this.propTexSize=Vec(105,3);

		this.tailSize=Vec(19,5).scl(2);
		this.tailPos=Vec(-110,-5);
		this.tailTime=0;
		this.tailTexPos=Vec(1,759);
		this.tailTexSize=Vec(19,5);
	}
}
class AirLiner extends Plane{
	constructor(p,a){
		super(p,a);

		this.level=1;

		this.thrustLimit=1;
		this.thrustRecover=0.15;
		this.thrustPotential=10;
		this.thrustPotLim=10;
		
		this.agilityMin=0.03;
		this.agilityMax=0.04;
		this.agilityFall=0.04;
		
		this.cooldown=0;
		this.cooldownMax=50;
		this.bulletSize=6;
		this.bulletDamage=1;
		
		this.minSpeed=10;//min speed for lift
		this.maxSpeed=40;//speed for max efficiency
		
		this.health=2500;
		this.maxHealth=this.health;
		
		this.size=Vec(191,78).scl(2);
		this.texPos=Vec(197,523);
		this.texSize=Vec(191,78);
		this.offset=Vec(0,0);

		this.logoSize=Vec(13,16).scl(2);
		this.logoTexPos=Vec(389,583);
		this.logoTexSize=Vec(13,16);
		this.logoOffset=Vec(-150,-36);

		this.engineOffset=Vec(40,50);
	}
	boost(){
		let flip=nrmAngPI(this.angle+PI/2)<0;
		let hE=this.heightEfficiency();
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=hE;
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
		
		let offset=this.engineOffset.cln();
		if(flip){
			offset.y*=-1;
		}
		offset.rot(this.angle).add(this.pos);

		let m=this.velo.mag();
		for(let v=0;v<m;v+=20){
			let p=this.velo.cln().nrm(v).add(offset);
			gameRunner.cloud(p.x,p.y,255,255,255,40*hE);
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
			this.offset.x,
			this.offset.y);
		
		let lOff=this.logoOffset.cln();
		let lMod=1;
		if(flip){
			lOff.y*=-1;
			lMod=-1;
		}
		renderer.img(
			this.pos.x,this.pos.y,
			this.logoSize.x*lMod,this.logoSize.y*lMod,
			this.angle,
			this.logoTexPos.x,
			this.logoTexPos.y,
			this.logoTexSize.x,
			this.logoTexSize.y,
			false,
			lOff.x,
			lOff.y);
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}
class FlyingFortress extends Plane{
	constructor(p,a){
		super(p,a);

		this.level=4;

		this.thrustLimit=1;
		this.thrustRecover=0.25;
		this.thrustPotential=10;
		this.thrustPotLim=10;
		
		this.agilityMin=0.02;
		this.agilityMax=0.03;
		this.agilityFall=0.03;
		
		this.cooldown=0;
		this.cooldownMax=20;
		this.bulletSize=6;
		this.bulletDamage=1;

		this.resistanceMin=0.995;
		this.resistanceMax=0.99;
		this.fallResistance=0.995;
		
		this.minSpeed=10;//min speed for lift
		this.maxSpeed=30;//speed for max efficiency
		
		this.health=2500;
		this.maxHealth=this.health;
		
		this.size=Vec(191,93).scl(2);
		this.texPos=Vec(1,197);
		this.texSize=Vec(191,93);
		this.offset=Vec(0,0);
		
		this.propSize=Vec(5,17).scl(2);
		this.propTime=0;
		this.propSpeed=0;
		this.propIdxs=[0,1,2,1];
		this.propTexPos=[Vec(193,219),Vec(199,219),Vec(205,219)];
		this.propTexSize=Vec(5,17);
		this.props=[Vec(135.9,12),Vec(109.9,28)];

		this.gunPos1=Vec(191,0);
		this.gunPos2=Vec(-170,-20);

		this.turretSize=Vec(13,7).scl(2);
		this.turretTexPos=Vec(193,197);
		this.turretTexSize=Vec(13,7);
		this.gunSize=Vec(7,2).scl(2);
		this.gunTexPos=Vec(193,213);
		this.gunTexSize=Vec(7,2);
		this.gunOffset=Vec(10,0);
		this.turretAngleList=Array(this.level).fill().map(x=>0);
		this.turretSpinList=Array(this.level).fill().map(x=>0);
		this.turretCooldownList=Array(this.level).fill().map(x=>0);
		this.turretPosList=[
			Vec(90,-40),Vec(60,-40),Vec(30,-35),
			Vec(45,-8)
		];
		this.turretBulletSpeed=30;
		this.turretBulletSize=4;
		this.turretBulletDamage=1;
		this.turretBulletRange=50;
		this.turretCooldownMax=Math.floor(20/this.level);
	}
	run(){
		super.run();
		this.propSpeed*=0.9;
		this.propTime=(this.propTime+this.propSpeed)%(this.propIdxs.length);
		for(let i=0;i<this.turretAngleList.length;i++){
			this.turretAngleList[i]+=this.turretSpinList[i];
			this.turretSpinList[i]=clamp(this.turretSpinList[i]+(Math.random()*2-1)*0.01,-0.1,0.1);
		}
	}
	boost(){
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=this.heightEfficiency();
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
		this.propSpeed+=0.1;
	}
	shoot(bulletsArr){
		if(this.cooldown==0){
			let flip=nrmAngPI(this.angle+PI/2)<0;
			let ra=(Math.random()-0.5)*2*this.accuracy;
			let s=this.bulletSpeed;

			let pVelo1=VecA(s,this.angle+ra);
			pVelo1.add(this.velo);
			let pPos1=this.gunPos1.cln();
			let pVelo2=VecA(-s,this.angle+ra);
			pVelo2.add(this.velo);
			let pPos2=this.gunPos2.cln();
			if(flip){
				pPos1.y*=-1;
				pPos2.y*=-1;
			}
			pPos1.rot(this.angle).add(this.pos);
			pPos2.rot(this.angle).add(this.pos);

			bulletsArr.push(new Bullet(pPos1,pVelo1,this.bulletDamage,this.bulletSize,this.bulletRange));
			bulletsArr.push(new Bullet(pPos2,pVelo2,this.bulletDamage,this.bulletSize,this.bulletRange));

			this.cooldown=this.cooldownMax;
		}
		let flip=nrmAngPI(this.angle+PI/2)<0;
		for(let i=0;i<this.turretAngleList.length;i++){
			if(this.turretCooldownList[i]==0){
				let p=this.turretPosList[i%this.turretPosList.length].cln();
				let ang=this.turretAngleList[i];
				if(flip){
					p.y*=-1;
				}
				p.rot(this.angle).add(this.pos);

				let ra=(Math.random()-0.5)*2*this.accuracy;
				let s=this.turretBulletSpeed;
				let pVelo=VecA(s,ang+ra);
				pVelo.add(this.velo);

				bulletsArr.push(new Bullet(p,pVelo,this.turretBulletDamage,this.turretBulletSize,this.turretBulletRange));
				this.turretCooldownList[i]=Math.floor((Math.random()+1)*this.turretCooldownMax);
			}else{
				this.turretCooldownList[i]--;
			}
		}
	}
	display(){
		let flip=nrmAngPI(this.angle+PI/2)<0;
		let propI=this.propIdxs[Math.floor(this.propTime)];
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			flip,
			this.offset.x,
			this.offset.y);
		for(let i=0;i<this.props.length;i++){
			let p=this.props[i].cln();
			if(flip){
				p.y*=-1;
			}
			p.rot(this.angle).add(this.pos);
			renderer.img(
				p.x,p.y,
				this.propSize.x,this.propSize.y,
				this.angle,
				this.propTexPos[propI].x,
				this.propTexPos[propI].y,
				this.propTexSize.x,
				this.propTexSize.y,
				false);
		}
		for(let i=0;i<this.turretAngleList.length;i++){
			let p=this.turretPosList[i%this.turretPosList.length].cln();
			let ang=this.turretAngleList[i];
			if(flip){
				p.y*=-1;
			}
			p.rot(this.angle).add(this.pos);
			renderer.img(
				p.x,p.y,
				this.turretSize.x,this.turretSize.y,
				this.angle,
				this.turretTexPos.x,
				this.turretTexPos.y,
				this.turretTexSize.x,
				this.turretTexSize.y,
				flip);
			
			renderer.img(
				p.x,p.y,
				this.gunSize.x,this.gunSize.y,
				ang,
				this.gunTexPos.x,
				this.gunTexPos.y,
				this.gunTexSize.x,
				this.gunTexSize.y,
				false,
				this.gunOffset.x,
				this.gunOffset.y);
		}
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}
class FlyingCastle extends Plane{
	constructor(p,a){
		super(p,a);

		this.level=1;

		this.thrustLimit=0.5;
		this.thrustRecover=0.5;
		this.thrustPotential=0.5;
		this.thrustPotLim=0.5;
		
		this.agilityMin=0.1;
		this.agilityMax=0.1;
		this.agilityFall=0.1;
		this.gravity=Vec(0,0);
		
		this.cooldown=0;
		this.cooldownMax=0;
		this.bulletSize=6;
		this.bulletDamage=1;

		this.resistanceMin=0.95;
		this.resistanceMax=0.95;
		this.fallResistance=0.95;
		
		this.minSpeed=10;//min speed for lift
		this.maxSpeed=30;//speed for max efficiency
		
		this.health=2500;
		this.maxHealth=this.health;
		
		this.size=Vec(253,228).scl(2);
		this.texPos=Vec(494,342);
		this.texSize=Vec(253,228);
		this.offset=Vec(0,-84);
	}
	display(disp,renderer){
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			0,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			false,
			this.offset.x,
			this.offset.y);
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}

class HotAirBalloon extends Plane{
	constructor(p,a){
		super(p,a);

		this.level=1;

		this.thrustLimit=0;
		this.thrustRecover=0;
		this.thrustPotential=0;
		this.thrustPotLim=0;
		
		this.agilityMin=0.08;
		this.agilityMax=0.08;
		this.agilityFall=0.08;
		
		this.cooldown=0;
		this.cooldownMax=5;
		this.bulletSpeed=100;
		this.bulletRange=100;
		this.bulletSize=6;
		this.bulletDamage=1;
		this.accuracy=0.01;
		this.kickback=2;
		
		this.fallResistance=0.9;
		this.transfer=0;
		
		this.health=2500;
		this.maxHealth=this.health;
		
		this.size=Vec(18,27).scl(2);
		this.texPos=Vec(130,385);
		this.texSize=Vec(18,27);
		this.offset=Vec(0,-10);

		this.basketAngle=0;
		this.balloonAngle=0;

		this.posList=[Vec(0,0),Vec(0,0),Vec(0,0)];
		this.veloList=[Vec(0,0),Vec(0,0),Vec(0,0)];
		this.distList=[20,60];

		this.balloonPos=Vec(0,0);
		this.balloonSize=Vec(128,145).scl(2);
		this.balloonTexPos=Vec(1,385);
		this.balloonTexSize=Vec(128,145);

		this.gunSize=Vec(15,5).scl(2);
		this.gunTexPos=Vec(130,441);
		this.gunTexSize=Vec(15,5);
		this.gunOffset=Vec(15,0);

		this.lift=Vec(0,-.6);
		this.gravity=Vec(0,.5);
		this.buoyancy=Vec(0,-0.5);
		this.damp=0.9;
		this.localResistance=0.95;
	}
	run(){

		if(this.cooldown>0){
			this.cooldown--;
		}
		if(gameRunner.isUnderwater(this.pos.x,this.pos.y)){
			let waterScale=clamp((this.pos.y-gameRunner.getWaterline(this.pos.x))/100,0,1);
			let slowed=this.velo.cln();
			this.velo.scl(this.resistanceWater);

			slowed.sub(this.velo);
			let strength=slowed.mag();
			gameRunner.wave(this.pos.x,this.pos.y,100,strength*this.waveSize);
			if(!this.submerged){
				let splash=slowed.mag()*this.splashSize;
				if(splash>2)
					gameRunner.splash(this.pos.x+this.velo.x*5,this.pos.y+this.velo.y*5,slowed.x*100,slowed.y*100,splash);
				// gameRunner.knock(this.pos.cln().sub(slowed),splash);
			}
			this.submerged=true;
			this.veloList[0].add(this.buoyancy.cln().scl(waterScale));

			if(strength>0.3&&this.bubbling){
				gameRunner.bubbles(this.pos.x,this.pos.y,0,0,
					(strength-0.5)*10
				);
			}else{
				this.bubbling=false;
			}
		}else{
			this.bubbling=true;
			this.submerged=false;
		}
		gameRunner.wave(this.pos.x,this.pos.y,100,this.velo.mag()/20);

		this.agility=this.agilityFall;

		this.veloList[0].add(this.gravity);
		this.veloList[this.veloList.length-1].add(this.lift.cln().scl(this.heightEfficiency()));

		for(let i=0;i<this.posList.length-1;i++){
			let curr=this.posList[i];
			let next=this.posList[i+1];
			let cDist=this.distList[i];

			let mid=curr.cln().mix(next,0.5);
			let dir=curr.cln().sub(next);
			let start=dir.cln().nrm(cDist).add(mid);
			let end=dir.cln().nrm(-cDist).add(mid);

			let elastic=0.1;

			if(i==0||i==this.posList.length-1){
				this.veloList[i].add(start.cln().sub(curr).scl(elastic));
			}else{
				this.veloList[i].add(start.cln().sub(curr).scl(elastic/2));
			}
			if(i+1==0||i+1==this.posList.length-1){
				this.veloList[i+1].add(end.cln().sub(next).scl(elastic));
			}else{
				this.veloList[i+1].add(end.cln().sub(next).scl(elastic/2));
			}
		};
		
		for(let i=0;i<this.posList.length;i++){
			this.veloList[i].scl(this.localResistance);
			this.posList[i].add(this.veloList[i]);
			this.posList[i].add(this.velo);
		};
		for(let i=0;i<this.posList.length-1;i++){
			let curr=this.posList[i];
			let next=this.posList[i+1];
			let ang=curr.ang(next);
			let cVelo=this.veloList[i];
			let nVelo=this.veloList[i+1];


			let damp1=cVelo.cln().sub(nVelo).rot(-ang);
			damp1.x*=this.damp;
			damp1.rot(ang).add(nVelo);
			this.veloList[i]=damp1;

			let damp2=nVelo.cln().sub(cVelo).rot(-ang);
			damp2.x*=this.damp;
			damp2.rot(ang).add(cVelo);
			this.veloList[i+1]=damp2;
		};

		let avg=Vec(0,0)
		for(let i=0;i<this.posList.length;i++){
			avg.add(this.veloList[i]);
		}
		avg.div(this.posList.length);
		this.velo.add(avg);
		this.velo.scl(this.fallResistance);
		
		this.pos=this.posList[0].cln();
		this.basketAngle=this.posList[0].ang(this.posList[1])+PI/2;
		this.balloonPos=this.posList[this.posList.length-1].cln();
		this.balloonAngle=this.posList[this.posList.length-1].ang(this.posList[this.posList.length-2])-PI/2;
	}
	shoot(bulletsArr){
		if(this.cooldown==0){
			let ra=(Math.random()-0.5)*2*this.accuracy;
			let s=this.bulletSpeed;
			let pVelo=VecA(s,this.angle+ra);
			pVelo.add(this.velo);
			let pPos=VecA(this.size.x/2.,this.angle);
			pPos.add(this.pos);
			bulletsArr.push(new Bullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));

			this.veloList[0].add(pVelo.cln().nrm(-this.kickback));

			this.cooldown=this.cooldownMax;
		}
	}
	display(disp,renderer){
		// this.posList.forEach(p=>disp.circle2(p.x,p.y,10));
		renderer.img(
			this.pos.x,this.pos.y,
			this.gunSize.x,this.gunSize.y,
			this.angle,
			this.gunTexPos.x,
			this.gunTexPos.y,
			this.gunTexSize.x,
			this.gunTexSize.y,
			false,
			this.gunOffset.x,
			this.gunOffset.y);
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.basketAngle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			false,
			this.offset.x,
			this.offset.y);
		
		renderer.img(
			this.balloonPos.x,this.balloonPos.y,
			this.balloonSize.x,this.balloonSize.y,
			this.balloonAngle,
			this.balloonTexPos.x,
			this.balloonTexPos.y,
			this.balloonTexSize.x,
			this.balloonTexSize.y,
			false,
			this.offset.x,
			this.offset.y);
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}
class FlyingHouse extends HotAirBalloon{
	constructor(p,a){
		super(p,a);

		this.kickback=1;

		this.size=Vec(66,75).scl(2);
		this.texPos=Vec(130,523);
		this.texSize=Vec(66,75);
		this.offset=Vec(0,-20);

		this.distList=[40,60];

		this.balloonSize=Vec(15,21).scl(2);
		this.balloonTexPos=Vec(130,453);
		this.balloonTexSize=Vec(15,21);
		
		this.gravity=Vec(0,1);
		this.buoyancy=Vec(0,-.8);
		this.resistanceWater=0.94;

		this.waveSize=2.5;
		this.splashSize=4;

		this.balloonPosList=Array(40).fill().map(b=>VecA(100,Math.random()*TAU));
		this.balloonVeloList=Array(40).fill().map(b=>Vec(0,0));
		this.resistanceBalloon=0.9;
		this.balloonLift=Vec(0,-5);
		this.balloonPushRadius=40;
		this.balloonPushStrength=5;
		this.balloonContribution=Vec(0,-0.015);
		this.liftBase=Vec(0,-.5);
	}
	run(){
		super.run();
		for(let i=0;i<this.balloonPosList.length;i++){
			for(let j=i+1;j<this.balloonPosList.length;j++){
				if(this.balloonPosList[i].within(this.balloonPosList[j],this.balloonPushRadius)){
					let diff=this.balloonPosList[i].cln().sub(this.balloonPosList[j]);
					let bumpStrength=clamp((this.balloonPushRadius-diff.mag())/this.balloonPushRadius,0,1)*this.balloonPushStrength;
					let bump=diff.cln().nrm(bumpStrength);
					this.balloonVeloList[i].add(bump);
					this.balloonVeloList[j].sub(bump);
				}
			}
		}
		for(let i=0;i<this.balloonPosList.length;i++){
			this.balloonVeloList[i].add(this.balloonLift);
			this.balloonVeloList[i].add(this.balloonPosList[i].cln().sub(this.pos).scl(-0.015));
			this.balloonPosList[i].add(this.balloonVeloList[i]);
			this.balloonVeloList[i].scl(this.resistanceBalloon);
		}
		this.lift=this.balloonContribution.cln().scl(this.balloonPosList.length).add(this.liftBase);
	}
	display(disp,renderer){
		// this.posList.forEach(p=>disp.circle2(p.x,p.y,10));
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.basketAngle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			false,
			this.offset.x,
			this.offset.y);
		
		this.balloonPosList.forEach(b=>{
			renderer.img(
				b.x,b.y,
				this.balloonSize.x,this.balloonSize.y,
				b.ang(this.pos)-PI/2,
				this.balloonTexPos.x,
				this.balloonTexPos.y,
				this.balloonTexSize.x,
				this.balloonTexSize.y,
				false,
				this.offset.x,
				this.offset.y);
		});
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}
class Zepplin extends Plane{
	constructor(p,a){
		super(p,a);
		this.level=1;
		this.propNum=3+this.level;

		let thrust=0.25*this.propNum;
		this.thrustLimit=thrust;
		this.thrustRecover=thrust;
		this.thrustPotential=thrust;
		this.thrustPotLim=thrust;
		
		this.agilityMin=0.02;
		this.agilityMax=0.02;
		this.agilityFall=0.02;
		
		this.resistanceMin=0.95;
		this.resistanceMax=0.95;
		this.fallResistance=0.95;
		this.transfer=0.15;

		this.gravity=Vec(0,1.5);
		this.lift=Vec(0,-1.5);
		this.buoyancy=Vec(0,-1);
		
		this.cooldown=0;
		this.cooldownMax=5;
		this.bulletSpeed=100;
		this.bulletRange=100;
		this.bulletSize=6;
		this.bulletDamage=3;
		this.accuracy=0.01;
		this.kickback=0;

		this.lookAngle=this.angle;
		this.lookAgility=0.1;
		this.gunOffset=Vec(180,50);

		this.size=Vec(326,57).scl(2);
		this.texPos=Vec(748,684);
		this.texSize=Vec(326,57);
		this.offset=Vec(0,4);

		this.propSize=Vec(14,4).scl(2);
		this.propTime=0;
		this.propSpeed=0;
		this.propIdxs=[0,1,2,1];
		this.propTexPos=[Vec(1075,770),Vec(1075,780),Vec(1075,790)];
		this.propTexSize=Vec(14,4);
		this.propOffset=Vec(0,-16);

		this.engineSize=Vec(10,13).scl(2);
		this.engineTexPos=Vec(1090,772);
		this.engineTexSize=Vec(10,13);
	}
	run(){
		this.velo.add(VecA(this.thrust,this.lookAngle));
		this.thrust=0;
		super.run();
		this.velo.add(this.lift.cln().scl(this.heightEfficiency()));
		this.propSpeed*=0.9;
		this.propTime=(this.propTime+this.propSpeed)%(this.propIdxs.length);
	}
	boost(){
		let bPower=Math.min(this.thrustLimit,this.thrustPotential);
		bPower*=this.heightEfficiency();
		this.thrust+=bPower;
		this.thrustPotential-=bPower;
		this.propSpeed+=0.1;
	}
	
	faceAng(ang){
		this.angle+=clamp(
			nrmAngPI(ang-this.angle),-this.agility,this.agility);
		
		this.lookAngle+=clamp(
			nrmAngPI(ang-this.lookAngle),-this.lookAgility,this.lookAgility);
	}
	shoot(bulletsArr){
		if(this.cooldown==0){
			let flip=nrmAngPI(this.angle+PI/2)<0;
			let gunPos=this.gunOffset.cln().add(this.offset);
			if(flip){
				gunPos.y*=-1;
			}
			gunPos.rot(this.angle).add(this.pos);

			let ra=(Math.random()-0.5)*2*this.accuracy;
			let s=this.bulletSpeed;
			let pVelo=VecA(s,this.lookAngle+ra);
			pVelo.add(this.velo);
			let pPos=gunPos;
			bulletsArr.push(new Bullet(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));

			this.velo.add(pVelo.cln().nrm(-this.kickback));

			this.cooldown=this.cooldownMax;
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
			this.offset.x,
			this.offset.y);

		let propI=this.propIdxs[Math.floor(this.propTime)];
		for(let i=0;i<this.propNum;i++){
			let p=Vec(300/Math.max(this.propNum-1,1)*i+200-this.size.x/2,30);
			if(flip){
				p.y*=-1;
			}
			p.rot(this.angle).add(this.pos);

			renderer.img(
				p.x,p.y,
				this.engineSize.x,this.engineSize.y,
				this.lookAngle+PI/2,
				this.engineTexPos.x,
				this.engineTexPos.y,
				this.engineTexSize.x,
				this.engineTexSize.y,
				false);
			renderer.img(
				p.x,p.y,
				this.propSize.x,this.propSize.y,
				this.lookAngle+PI/2,
				this.propTexPos[propI].x,
				this.propTexPos[propI].y,
				this.propTexSize.x,
				this.propTexSize.y,
				false,
				this.propOffset.x,
				this.propOffset.y);
		}
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}

class NyanCat extends Plane{
	constructor(p,a){
		super(p,a);
		
		this.thrustLimit=0.5;
		this.thrustRecover=0.5;
		this.thrustPotential=0.5;
		this.thrustPotLim=0.5;
		
		this.agilityMin=0.08;
		this.agilityMax=0.08;
		this.agilityFall=0.08;
		
		this.resistanceMin=0.9995;
		this.resistanceMax=0.99;
		this.fallResistance=0.9995;
		this.transfer=0;

		this.gravity=Vec(0,0.1);
		this.buoyancy=Vec(0,-0.8);

		this.size=Vec(21,18).scl(4);
		this.texPos=Vec(1,130);
		this.texSize=Vec(21,18);

		this.walkTime=0;

		this.tailSize=Vec(7,7).scl(4);
		this.tailPos=Vec(-55.9,12);
		this.tailIdxs=[0,1,2,3,4];
		this.tailTexPos=[Vec(23,131),Vec(31,131),Vec(39,131),Vec(47,131),Vec(55,131)];
		this.tailOffset=[Vec(0,-4),Vec(0,0),Vec(0,0),Vec(0,4),Vec(0,4)];
		this.tailTexSize=Vec(7,7);

		this.pawSize=Vec(4,4).scl(4);
		this.pawTexPos=Vec(18,184);
		this.pawTexSize=Vec(4,4);

		this.headSize=Vec(16,13).scl(4);
		this.headPos=Vec(32,8);
		this.headTexPos=Vec(1,168);
		this.headTexSize=Vec(16,13);
	}
	run(){
		super.run();
		this.walkTime+=this.velo.mag()*0.001*this.heightEfficiency()+0.01;
	}
	display(disp,renderer){
		let flip=nrmAngPI(this.angle+PI/2)<0;
		let drawPaw=(pawPos)=>{
			let p=VecA(6,this.walkTime*TAU);
			p.y=0;
			p.add(pawPos);
			renderer.img(
				this.pos.x,this.pos.y,
				this.pawSize.x,this.pawSize.y,
				this.angle,
				this.pawTexPos.x,
				this.pawTexPos.y,
				this.pawTexSize.x,
				this.pawTexSize.y,
				flip,
				p.x,
				p.y);
		}
		drawPaw(Vec(40-4,36));
		drawPaw(Vec(20-4,36));
		drawPaw(Vec(-32,36));
		drawPaw(Vec(-12,36));
		
		let tailI=this.tailIdxs[Math.floor((this.walkTime*this.tailIdxs.length+2)%(this.tailIdxs.length))];
		renderer.img(
			this.pos.x,this.pos.y,
			this.tailSize.x,this.tailSize.y,
			this.angle,
			this.tailTexPos[tailI].x,
			this.tailTexPos[tailI].y,
			this.tailTexSize.x,
			this.tailTexSize.y,
			flip,
			this.tailPos.x+this.tailOffset[tailI].x,
			this.tailPos.y+this.tailOffset[tailI].y);
		
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			flip,
			this.offset.x,
			this.offset.y);

		let headPos=VecA(6,this.walkTime*TAU).add(this.headPos);
		renderer.img(
			this.pos.x,this.pos.y,
			this.headSize.x,this.headSize.y,
			this.angle,
			this.headTexPos.x,
			this.headTexPos.y,
			this.headTexSize.x,
			this.headTexSize.y,
			flip,
			headPos.x,
			headPos.y);
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}

class FlappyBird extends Plane{
	constructor(p,a){
		super(p,a);

		this.jump=20;
		this.jumpForward=10;
		this.jumping=false;
		this.canJump=true;
		
		this.agilityMin=TAU;
		this.agilityMax=TAU;
		this.agilityFall=TAU;
		
		this.resistanceMin=0.995;
		this.resistanceMax=0.995;
		this.fallResistance=0.995;
		this.transfer=0;

		this.gravity=Vec(0,0.5);
		this.buoyancy=Vec(0,-0.8);
		
		this.bulletDamage=1;
		this.bulletSpeed=12;
		this.bulletSize=13*2;
		this.bulletRange=200;

		this.size=Vec(15,12).scl(4);
		this.texPos=Vec(403,583);
		this.texSize=Vec(15,12);

		this.wingSize=Vec(7,8).scl(4);
		this.wingPos=Vec(-24,4);
		this.wingTime=0;
		this.wingSpeed=0.2;
		this.wingIdxs=[0,1,2,1];
		this.wingTexPos=[Vec(419,583),Vec(427,583),Vec(435,583)];
		this.wingTexSize=Vec(7,8);
	}
	run(){
		this.thrust=0;
		super.run();
		this.wingTime+=this.wingSpeed;
		if(!this.jumping){
			this.canJump=true;
		}
		this.jumping=false;
	}
	shoot(bulletsArr){
		if(!this.jumping&&this.canJump){
			let ra=(Math.random()-0.5);
			let s=this.bulletSpeed;
			let pVelo=VecA(s,-PI/2+ra);
			pVelo.add(this.velo);
			let pPos=Vec(0,0);
			pPos.add(this.pos);
			bulletsArr.push(new Bomb(pPos,pVelo,this.bulletDamage,this.bulletSize,this.bulletRange));

			let hE=this.heightEfficiency();
			this.velo.y=-this.jump*hE;
			this.velo.add(VecA(this.jumpForward*hE,this.angle));
			this.canJump=false;
		}
		this.jumping=true;
	}
	display(disp,renderer){
		let flip=nrmAngPI(this.angle+PI/2)<0;
		let wingI=this.wingIdxs[Math.floor(this.wingTime)%this.wingTexPos.length];
		renderer.img(
			this.pos.x,this.pos.y,
			this.size.x,this.size.y,
			this.angle,
			this.texPos.x,
			this.texPos.y,
			this.texSize.x,
			this.texSize.y,
			flip,
			this.offset.x,
			this.offset.y);
		renderer.img(
			this.pos.x,this.pos.y,
			this.wingSize.x,this.wingSize.y,
			this.angle,
			this.wingTexPos[wingI].x,
			this.wingTexPos[wingI].y,
			this.wingTexSize.x,
			this.wingTexSize.y,
			flip,
			this.wingPos.x,
			this.wingPos.y);
		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}

class PodRacer extends Plane{
	constructor(p,a){
		super(p,a);

		this.level=1;
		
		this.thrustLimit=1;
		this.thrustRecover=1;
		this.thrustPotential=1;
		this.thrustPotLim=1;
		
		this.agilityMin=0.08;
		this.agilityMax=0.08;
		this.agilityFall=0.08;
		
		this.resistanceMin=0.9995;
		this.resistanceMax=0.99;
		this.fallResistance=0.9995;
		this.transfer=0;

		this.gravity=Vec(0,0.1);
		this.buoyancy=Vec(0,-0.8);

		this.size=Vec(46,13).scl(2);
		this.texPos=Vec(114,127);
		this.texSize=Vec(46,13);

		this.thrusterNum=this.level+1;
		if(this.level==0){
			this.thrusterNum=0;
		}
		this.thrusterRange=400;
		this.podResistance=0.99;
		this.thrusterPushRadius=200;
		this.thrusterPushStrength=0.5;

		this.thrusterPosList=Array(this.thrusterNum).fill().map(x=>VecA(this.thrusterRange/2*Math.random(),Math.random()*TAU));
		this.thrusterVeloList=Array(this.thrusterNum).fill().map(x=>Vec(0,0));
		this.thrusterThrustList=Array(this.thrusterNum).fill().map(x=>100);
		this.thrusterSubmergedList=Array(this.thrusterNum).fill().map(x=>false);

		this.engine1Size=Vec(84,20).scl(2);
		this.engine1TexPos=Vec(90,155);
		this.engine1TexSize=Vec(84,20);

		this.engine2Size=Vec(84,20).scl(2);
		this.engine2TexPos=Vec(175,155);
		this.engine2TexSize=Vec(84,20);

		this.waveSize=4/Math.max(this.level,1);
		this.splashSize=6;
	}
	shoot(bulletsArr){
		if(this.level==0){
			super.shoot(bulletsArr);
		}
	}
	run(){
		let speedEff=this.getEfficiency();
		
		for(let i=0;i<this.thrusterPosList.length;i++){
			for(let j=i+1;j<this.thrusterPosList.length;j++){
				if(this.thrusterPosList[i].within(this.thrusterPosList[j],this.thrusterPushRadius)){
					//TODO: smooth this out
					let diff=this.thrusterPosList[i].cln().sub(this.thrusterPosList[j]);
					let bumpStrength=clamp((this.thrusterPushRadius-diff.mag())/this.thrusterPushRadius,0,1)*this.thrusterPushStrength;
					let bump=diff.cln().nrm(bumpStrength);
					this.thrusterPosList[i].add(bump);
					this.thrusterPosList[j].sub(bump);
				}
			}
		}

		let resist=this.resistanceMin+(this.resistanceMax-this.resistanceMin)*speedEff;
		for(let i=0;i<this.thrusterPosList.length;i++){
			let v=this.thrusterVeloList[i];
			let p=this.thrusterPosList[i];
			v.add(VecA(this.thrust,this.angle));
			v.add(this.gravity);
			v.scl(resist);
			p.add(v);

			let dist=p.mag(this.pos);
			if(dist>this.thrusterRange){
				let ang=this.pos.ang(p);
				let bounce=VecA(this.thrusterRange-dist,ang).scl(0.1).lim(100);
				v.add(bounce);
				this.velo.sub(bounce);
			}
			if(gameRunner.isUnderwater(p.x,p.y)){
				let slowed=v.cln();
				v.scl(this.resistanceWater);
	
				slowed.sub(v);
				let strength=slowed.mag();
				gameRunner.wave(p.x,p.y,100,strength*this.waveSize);
				if(!this.thrusterSubmergedList[i]){
					let splash=slowed.mag()*this.splashSize;
					if(splash>2)
						gameRunner.splash(p.x+v.x*5,p.y+v.y*5,slowed.x*100,slowed.y*100,splash);
				}
				this.thrusterSubmergedList[i]=true;
				v.add(this.buoyancy);
			}else{
				this.thrusterSubmergedList[i]=false;
			}
		}
		this.velo.scl(this.podResistance);
		this.thrust=0;
		super.run();
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
			this.offset.x,
			this.offset.y);
		
		for(let i=0;i<this.thrusterPosList.length;i++){
			let p=this.thrusterPosList[i];
			if(i%2==0){
				renderer.img(
					p.x,p.y,
					this.engine1Size.x,this.engine1Size.y,
					this.angle,
					this.engine1TexPos.x,
					this.engine1TexPos.y,
					this.engine1TexSize.x,
					this.engine1TexSize.y,
					flip,
					this.offset.x,
					this.offset.y);
			}else{
				renderer.img(
					p.x,p.y,
					this.engine2Size.x,this.engine2Size.y,
					this.angle,
					this.engine2TexPos.x,
					this.engine2TexPos.y,
					this.engine2TexSize.x,
					this.engine2TexSize.y,
					flip,
					this.offset.x,
					this.offset.y);
			}

			gameRunner.shadow(p.x,p.y,this.engine1Size.x/4);//TODO: use hit boxes
		}
		
		// renderer.img(
		// 	this.pos.x,this.pos.y,
		// 	this.engine2Size.x,this.engine2Size.y,
		// 	this.angle,
		// 	this.engine2TexPos.x,
		// 	this.engine2TexPos.y,
		// 	this.engine2TexSize.x,
		// 	this.engine2TexSize.y,
		// 	flip,
		// 	this.offset.x,
		// 	this.offset.y);

		gameRunner.shadow(this.pos.x,this.pos.y,(this.hb[1].x-this.hb[0].x)/2);
	}
}