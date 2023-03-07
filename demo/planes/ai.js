class Director{
	constructor(game){
		this.game=game;

		this.ais=[];
		//TODO: perge dead from all lists
		this.shields=[];
		this.swarm=[];
		this.flock=[];
		this.snipers=[];
		this.wreckers=[];

		this.bossDefense=[];
		this.bossOffense=[];

		this.wave=0;
		this.waveTime=0;

		this.spawnBossAxe(1);
		this.spawnSniper(100);
		this.spawnDart(100);
		this.spawnShield(100);

		return;
		
		for(let i=0;i<100;i++){
			let toAdd=new Swarmer(Vec(Math.random()*10000,-Math.random()*1000-500),i/80*TAU);
			let ai=new SwarmerAI(toAdd,this);
			this.ais.push(ai);
			this.game.aliens.push(toAdd);
			this.game.specials.push(toAdd);

			this.swarm.push(ai);
		}
		for(let i=0;i<100;i++){
			let toAdd=new Shield(Vec(Math.random()*10000,-Math.random()*3000-500),i/80*TAU);
			let ai=new ShieldAI(toAdd,this);
			this.ais.push(ai);
			this.game.aliens.push(toAdd);

			this.shields.push(ai);
		}
		for(let i=0;i<200;i++){
			let toAdd=new Dart(Vec(Math.random()*10000,-Math.random()*3000-500),i/80*TAU);
			let ai=new FlockAI(toAdd,this);
			this.ais.push(ai);
			this.game.aliens.push(toAdd);

			this.flock.push(ai);
		}
		for(let i=0;i<20;i++){
			let toAdd=new Shell(Vec(Math.random()*10000,-Math.random()*3000-500),i/80*TAU);
			let ai=new FlockAI(toAdd,this);
			this.ais.push(ai);
			this.game.aliens.push(toAdd);

			this.flock.push(ai);
		}
		for(let i=0;i<30;i++){
			let toAdd=new Arrow(Vec(Math.random()*10000,-Math.random()*3000-500),i/80*TAU);
			let ai=new FlockAI(toAdd,this);
			this.ais.push(ai);
			this.game.aliens.push(toAdd);

			this.flock.push(ai);
		}
		for(let i=0;i<30;i++){
			let toAdd=new Sniper(Vec(Math.random()*10000,-Math.random()*3000-500),i/80*TAU);
			let ai=new SniperAI(toAdd,this);
			this.ais.push(ai);
			this.game.aliens.push(toAdd);

			this.snipers.push(ai);
		}
		for(let i=0;i<20;i++){
			let toAdd=new StarGunner(Vec(Math.random()*10000,-Math.random()*3000-500),i/80*TAU);
			let ai=new StarAI(toAdd,this);
			this.ais.push(ai);
			this.game.aliens.push(toAdd);

			this.snipers.push(ai);
		}
		for(let i=0;i<0;i++){
			let toAdd=new Wrecker(Vec(Math.random()*10000,-Math.random()*3000-500),i/80*TAU);
			let ai=new WreckerAI(toAdd,this);
			this.ais.push(ai);
			this.game.aliens.push(toAdd);
			this.game.specials.push(toAdd);

			this.wreckers.push(ai);
		}
		for(let i=0;i<0;i++){
			let toAdd=new BossDrill(Vec(Math.random()*10000,-Math.random()*3000-500),Math.random()*TAU);
			let ai=new BossDrillAI(toAdd,this);
			this.ais.push(ai);
			this.game.aliens.push(toAdd);
			this.game.specials.push(toAdd);

			this.bossOffense.push(ai);
		}
		for(let i=0;i<1;i++){
			let toAdd=new BossAxe(Vec(Math.random()*10000,-Math.random()*3000-500),Math.random()*TAU);
			let ai=new BossAxeAI(toAdd,this);
			this.ais.push(ai);
			this.game.aliens.push(toAdd);
			this.game.specials.push(toAdd);

			this.bossDefense.push(ai);
		}
		for(let i=0;i<0;i++){
			let toAdd=new BossSpike(Vec(Math.random()*10000,-Math.random()*3000-500),Math.random()*TAU);
			let ai=new BossSpikeAI(toAdd,this);
			this.ais.push(ai);
			this.game.aliens.push(toAdd);
			this.game.specials.push(toAdd);

			this.bossDefense.push(ai);
		}
		
		for(let i=0;i<0;i++){
			let toAdd=new BossYarn(Vec(Math.random()*10000,-Math.random()*3000-500),Math.random()*TAU);
			let ai=new BossYarnAI(toAdd,this);
			this.ais.push(ai);
			this.game.aliens.push(toAdd);
			this.game.specials.push(toAdd);

			this.bossDefense.push(ai);
		}
	}
	spawnSwarmer(count,time=100){
		for(let i=0;i<count;i++){
			let trigger=(p)=>{
				let toAdd=new Swarmer(p,Math.random()*TAU);
				let ai=new SwarmerAI(toAdd,this);
				this.ais.push(ai);
				this.game.aliens.push(toAdd);
				this.game.specials.push(toAdd);

				this.swarm.push(ai);
			}
			let toAdd=new Spawner(
				trigger,
				Vec(Math.random()*10000,-Math.random()*1000-500),
				0.8,
				time
			);
			this.game.aliens.push(toAdd);
		}
	}
	spawnShield(count,time=100){
		for(let i=0;i<count;i++){
			let trigger=(p)=>{
				let toAdd=new Shield(p,Math.random()*TAU);
				let ai=new ShieldAI(toAdd,this);
				this.ais.push(ai);
				this.game.aliens.push(toAdd);
	
				this.shields.push(ai);
			}
			let toAdd=new Spawner(
				trigger,
				Vec(Math.random()*10000,-Math.random()*1000-500),
				1.5,
				time
			);
			this.game.aliens.push(toAdd);
		}
	}
	spawnDart(count,time=100){
		for(let i=0;i<count;i++){
			let trigger=(p)=>{
				let toAdd=new Dart(p,Math.random()*TAU);
				let ai=new FlockAI(toAdd,this);
				this.ais.push(ai);
				this.game.aliens.push(toAdd);
	
				this.flock.push(ai);
			}
			let toAdd=new Spawner(
				trigger,
				Vec(Math.random()*10000,-Math.random()*1000-500),
				1,
				time
			);
			this.game.aliens.push(toAdd);
		}
	}
	spawnArrow(count,time=100){
		for(let i=0;i<count;i++){
			let trigger=(p)=>{
				let toAdd=new Arrow(p,Math.random()*TAU);
				let ai=new FlockAI(toAdd,this);
				this.ais.push(ai);
				this.game.aliens.push(toAdd);
	
				this.flock.push(ai);
			}
			let toAdd=new Spawner(
				trigger,
				Vec(Math.random()*10000,-Math.random()*1000-500),
				1.2,
				time
			);
			this.game.aliens.push(toAdd);
		}
	}
	spawnShell(count,time=100){
		for(let i=0;i<count;i++){
			let trigger=(p)=>{
				let toAdd=new Shell(p,Math.random()*TAU);
				let ai=new FlockAI(toAdd,this);
				this.ais.push(ai);
				this.game.aliens.push(toAdd);
	
				this.flock.push(ai);
			}
			let toAdd=new Spawner(
				trigger,
				Vec(Math.random()*10000,-Math.random()*1000-500),
				1.2,
				time
			);
			this.game.aliens.push(toAdd);
		}
	}
	spawnSniper(count,time=100){
		for(let i=0;i<count;i++){
			let trigger=(p)=>{
				let toAdd=new Sniper(p,Math.random()*TAU);
				let ai=new SniperAI(toAdd,this);
				this.ais.push(ai);
				this.game.aliens.push(toAdd);
	
				this.snipers.push(ai);
			}
			let toAdd=new Spawner(
				trigger,
				Vec(Math.random()*10000,-Math.random()*1000-500),
				1.5,
				time
			);
			this.game.aliens.push(toAdd);
		}
	}
	spawnStar(count,time=100){
		for(let i=0;i<count;i++){
			let trigger=(p)=>{
				let toAdd=new StarGunner(p,Math.random()*TAU);
				let ai=new StarAI(toAdd,this);
				this.ais.push(ai);
				this.game.aliens.push(toAdd);
	
				this.snipers.push(ai);
			}
			let toAdd=new Spawner(
				trigger,
				Vec(Math.random()*10000,-Math.random()*1000-500),
				1,
				time
			);
			this.game.aliens.push(toAdd);
		}
	}
	spawnWrecker(count,time=100){
		for(let i=0;i<count;i++){
			let trigger=(p)=>{
				let toAdd=new Wrecker(p,Math.random()*TAU);
				let ai=new WreckerAI(toAdd,this);
				this.ais.push(ai);
				this.game.aliens.push(toAdd);
				this.game.specials.push(toAdd);
	
				this.wreckers.push(ai);
			}
			let toAdd=new Spawner(
				trigger,
				Vec(Math.random()*10000,-Math.random()*1000-500),
				1.2,
				time
			);
			this.game.aliens.push(toAdd);
		}
	}
	spawnBossDrill(count,time=300){
		for(let i=0;i<count;i++){
			let trigger=(p)=>{
				let toAdd=new BossDrill(p,Math.random()*TAU);
				let ai=new BossDrillAI(toAdd,this);
				this.ais.push(ai);
				this.game.aliens.push(toAdd);
				this.game.specials.push(toAdd);
	
				this.bossOffense.push(ai);
			}
			let toAdd=new Spawner(
				trigger,
				Vec(Math.random()*10000,-Math.random()*1000-500),
				2,
				time
			);
			this.game.aliens.push(toAdd);
		}
	}
	spawnBossAxe(count,time=300){
		for(let i=0;i<count;i++){
			let trigger=(p)=>{
				let toAdd=new BossAxe(p,Math.random()*TAU);
				let ai=new BossAxeAI(toAdd,this);
				this.ais.push(ai);
				this.game.aliens.push(toAdd);
				this.game.specials.push(toAdd);
	
				this.bossDefense.push(ai);
			}
			let toAdd=new Spawner(
				trigger,
				Vec(Math.random()*10000,-Math.random()*1000-500),
				2,
				time
			);
			this.game.aliens.push(toAdd);
		}
	}
	spawnBossSpike(count,time=300){
		for(let i=0;i<count;i++){
			let trigger=(p)=>{
				let toAdd=new BossSpike(p,Math.random()*TAU);
				let ai=new BossSpikeAI(toAdd,this);
				this.ais.push(ai);
				this.game.aliens.push(toAdd);
				this.game.specials.push(toAdd);
	
				this.bossDefense.push(ai);
			}
			let toAdd=new Spawner(
				trigger,
				Vec(Math.random()*10000,-Math.random()*1000-500),
				2,
				time
			);
			this.game.aliens.push(toAdd);
		}
	}
	spawnBossYarn(count,time=300){
		for(let i=0;i<count;i++){
			let trigger=(p)=>{
				let toAdd=new BossYarn(p,Math.random()*TAU);
				let ai=new BossYarnAI(toAdd,this);
				this.ais.push(ai);
				this.game.aliens.push(toAdd);
				this.game.specials.push(toAdd);
	
				this.bossDefense.push(ai);
			}
			let toAdd=new Spawner(
				trigger,
				Vec(Math.random()*10000,-Math.random()*1000-500),
				2,
				time
			);
			this.game.aliens.push(toAdd);
		}
	}
	run(){
		runAndFilter(this.ais,a=>{
			if(a.checkOverride()){
				a.run();
			}
			return a.alive;
		});
	}
	getRandom(key){
		let arr=this[key];
		if(Array.isArray(arr)){
			let item=arr[Math.floor(Math.random()*arr.length)];
			if(item?.alive){
				return item;
			}else{
				return null;
			}
		}
	}
	playerPos(){
		return this.game.player.pos.cln();
	}
}
class BasicAI{
	constructor(body,director){
		this.body=body;
		this.body.setHead(this);
		this.director=director;
		this.alive=true;
		this.overriding=null;
	}
	checkOverride(){
		if(this.overriding!=null&&
			(!this.overriding.alive||this.body.head==null)
		){
			this.overriding=null;
		}
		return this.overriding==null;
	}
	override(ai){
		this.overriding=ai;
	}
	run(){
		this.alive=this.body.alive;
		if(!this.alive){
			this.die();
		}
	}
	hit(){
		
	}
	die(){

	}
	getPos(){
		return this.body.getPos();
	}
	getVelo(){
		return this.body.getVelo();
	}
	getAng(){
		return this.body.angle;
	}
	playerPos(){
		return this.director.playerPos();
	}
}
class ShieldAI extends BasicAI{
	constructor(body,director){
		super(body,director);
		this.head=null;
		this.tail=null;
		this.chain={
			count:1
		};
	}
	override(ai){
		this.disconnect();
		super.override(ai);
	}
	run(){
		super.run();
		if(!this.alive){
			return;
		}
		
		let h=this.director.getRandom("shields");
		if(
			h!=null
			&&h!=this
			&&h.overriding==null
			&&h.chain!=this.chain
			&&h.chain.count<12
			&&(h.chain.count>this.chain.count||this.chain.count<=2)
			&&h.getPos().mag(this.getPos())<1000
		){
			this.disconnect();

			if(h.chain.count==1){
				h.head=this;
				h.tail=this;
				this.head=h;
				this.tail=h;
			}else{
				this.head=h;
				this.tail=h.tail;
				h.tail.head=this;
				h.tail=this;
			}

			this.chain=h.chain;
			this.chain.count++;
		}

		if(this.chain.count>1){
			let self=this.getPos();
			let p1=this.head.getPos();
			let p2=this.tail.getPos();
			if(this.chain.count>2){
				let ang=p1.ang(p2);
				let gap=Math.sin(3*PI/(this.chain.count*2))*150;
				let gapV=VecA(gap,ang-PI/2);

				let p=p2.cln().sub(p1).scl(.5).add(p1).add(gapV);
				this.body.faceAng(ang-PI/2);
				this.body.move(p);
			}
			
			//break connection if pushed too far from neighbors
			if(p1.mag(self)>1500||p2.mag(self)>1500){
				this.disconnect();
			}

		}
		if(this.chain.count<=2){
			this.body.face(this.playerPos());
		}
	}
	disconnect(){
		if(this.chain.count>1){
			if(this.chain.count==2){
				this.head.tail=null;
				this.tail.head=null;
			}else{
				this.head.tail=this.tail;
				this.tail.head=this.head;
			}
			this.chain.count--;
			this.head=null;
			this.tail=null;
			this.chain={
				count:1
			};
		}
	}
	die(){
		this.disconnect();
	}
}
class SwarmerAI extends BasicAI{
	constructor(body,director){
		super(body,director);
		this.head=null;
		this.tail=null;
		this.chain={};
	}
	override(ai){
		this.disconnect();
		super.override(ai);
	}
	run(){
		super.run();
		if(!this.alive){
			return;
		}
		
		if(this.head!=null&&!this.head.alive){
			this.head=null;
		}
		if(this.tail!=null&&!this.tail.alive){
			this.tail=null;
		}
		if(this.head==null){
			let h=this.director.getRandom("swarm");
			if(
				h!=null
				&&h!=this
				&&h.overriding==null
				&&h.tail==null
				&&h.chain!=this.chain
				&&h.getPos().mag(this.getPos())<500
			){
				this.head=h;
				h.tail=this;

				let next=this;
				while(next!=null&&next!=h){
					next.chain=h.chain;
					next=next.tail;
				}
			}
			let p=this.playerPos();
			this.body.boost(0.7);
			this.body.face(p);
		}else{
			let p1=this.head.getPos();
			let p2=this.getPos();
			let p=p2.cln().sub(p1).nrm(80).add(p1);
			this.body.face(p1);
			this.body.move(p);
		}
	}
	die(){
		this.disconnect();
	}
	disconnect(){
		if(this.head!=null){
			this.head.tail=this.tail;
		}
		if(this.tail!=null){
			this.tail.head=this.head;
		}
		this.head=null;
		this.tail=null;

	}
}
class FlockAI extends BasicAI{
	constructor(body,director){
		super(body,director);
		this.awareness=new Set();
	}
	run(){
		super.run();

		let p=this.playerPos();
		this.body.face(p);
		
		let repel=Vec(0,0);
		let avgV=Vec(0,0);
		let total=0;
		let toRemove=[];
		this.awareness.forEach(a=>{
			let diff=a.getPos().sub(this.getPos());
			let strength=Math.max((250-diff.mag())/250,0);

			total+=strength;
			if(strength==0){
				toRemove.push(a);
				return;
			}

			diff.nrm(-strength);
			repel.add(diff);

			avgV.add(a.getVelo().scl(strength));
		});
		toRemove.forEach(a=>{
			this.awareness.delete(a);
		});

		if(total>0){
			avgV.div(total);
			this.body.velo.mix(avgV,0.1);
		}
		this.body.boost(0.5);

		this.body.moveDir(repel,0.5);
		this.body.shoot(gameRunner.aBullets,this.getPos().mag(p)>1000);
	}
	hit(target){
		if(target.head instanceof FlockAI){
			this.awareness.add(target);
		}
	}
}
class SniperAI extends BasicAI{
	constructor(body,director){
		super(body,director);
		this.protector=null;
	}
	run(){
		super.run();
		if(this.protector!=null
			&&(
				!this.protector.alive
				||!(this.protector.chain.count>=6||this.protector.chain.count<=2)
			)
		){
			this.protector.protecting=null;
			this.protector=null;
		}
		if(this.protector==null){
			let s=this.director.getRandom("shields");
			if(
				s!=null
				&&s.protecting==null
				&&(s.chain.count>=6||s.chain.count<=2)
				&&s.getPos().mag(this.getPos())<1000
			){
				s.protecting=this;
				this.protector=s;
			}				

			let p=this.playerPos();
			let self=this.getPos();
			let safeP=self.cln().sub(p).nrm(2500).add(p);
			safeP.y=Math.min(0,safeP.y);

			this.body.face(p);
			this.body.move(safeP);
			this.body.shoot(gameRunner.aBullets,self.mag(p)>5000);
		}else{
			let p=this.playerPos();
			let prot=this.protector.getPos().add(VecA(-120,this.protector.getAng()));
			let self=this.getPos();

			this.body.face(p);
			this.body.move(prot);
			this.body.shoot(gameRunner.aBullets,self.mag(p)>5000);
		}
	}
	disconnect(){
		if(this.protector!=null){
			this.protector.protecting=null;
			this.protector=null;
		}
	}
	die(){
		this.disconnect();
	}
}
class StarAI extends SniperAI{
	constructor(body,director){
		super(body,director);
	}
	run(){
		super.run();
		let isForward=this.playerPos().mag(this.getPos())>800;
		if(!isForward){
			this.disconnect();
		}
		this.body.setMode(isForward);
	}
}
class WreckerAI extends BasicAI{
	constructor(body,director){
		super(body,director);
		this.protector=null;
	}
	run(){
		super.run();

		let p=this.playerPos();
		p.y=clamp(p.y,-10000,1000)

		this.body.face(p);
		this.body.move(p);
	}
}
class BossSpikeAI extends BasicAI{
	//TODO: stay away from other bosses
	constructor(body,director){
		super(body,director);
		this.flock=new Set();
	}
	die(){
		this.flock.forEach((a)=>{
			a.randomizeCooldown();
		});
	}
	run(){
		super.run();

		let p=this.playerPos();
		let self=this.getPos();
		p.y=clamp(p.y,-10000,1000);
		this.body.spin=0.025+Math.max(1-p.mag(self)/2000,0)*0.2;

		// let ms=gameControl.getMouse(gameDisplay.cam);
		this.body.move(p);
		this.body.face(p);
		// this.body.shoot(gameRunner.aBullets);
		// this.body.boost();

		if(this.flock.size<150){
			let dart=this.director.getRandom("flock");
			if(
				dart!=null
				&&dart.overriding==null
				&&!this.flock.has(dart.body)
				&&dart.getPos().mag(this.getPos())<10000
			){
				this.flock.add(dart.body);
				dart.body.head=this;
				dart.override(this);
			}
		}

		let remaining=this.flock.size;
		let ringRadius=1500;
		let ringGap=200;
		let ringIdx=0;
		let toRemove=[];
		this.flock.forEach((a)=>{
			ringIdx++;
			let ringCount=Math.ceil(ringRadius*TAU/ringGap);
			let realCount=Math.min(remaining,ringCount);
			let m=VecA(ringRadius,ringIdx/realCount*TAU).add(self);
			if((ringIdx+1)>ringCount){
				ringIdx=0;
				remaining-=ringCount;
				ringRadius+=ringGap;
			}

			if(!a.alive){
				toRemove.push(a);
			}else{
				let currP=a.getPos();
				if(currP.mag(m)<100){
					a.velo.mix(this.getVelo(),0.1);
				}
				a.move(m);
				a.face(p);
				if(currP.mag(p)<1000){
					a.shoot(gameRunner.aBullets);
				}
			}
		});
		toRemove.forEach(a=>{
			this.flock.delete(a);
		});
	}
}
class BossDrillAI extends BasicAI{
	constructor(body,director){
		super(body,director);
	}
	run(){
		super.run();

		let p=this.playerPos();
		let self=this.getPos();
		let ang=nrmAngPI(self.ang(p)-this.body.angle);

		if(Math.abs(ang)<0.2&&p.y<1000&&p.y>-10000){
			this.body.boost();
			this.body.shoot(gameRunner.aBullets);
		}
		this.body.face(p);
	}
}
class BossAxeAI extends BasicAI{
	constructor(body,director){
		super(body,director);
		this.shields=new Set();
		this.shieldAgility=0.01;
		this.shieldAngle=body.angle;
	}
	faceAng(ang){
		this.shieldAngle+=clamp(
			nrmAngPI(ang-this.shieldAngle),-this.shieldAgility,this.shieldAgility);
	}
	run(){
		super.run();

		let p=this.playerPos();
		let self=this.getPos();
		let safeP=self.cln().sub(p).nrm(5000).add(p);
		safeP.y=clamp(safeP.y,-5000,-1000);
		
		if(this.shields.size<10){
			let shield=this.director.getRandom("shields");
			if(
				shield!=null
				&&shield.overriding==null
				&&!this.shields.has(shield.body)
				&&shield.getPos().mag(this.getPos())<10000
			){
				this.shields.add(shield.body);
				shield.body.head=this;
				shield.override(this);
			}
		}

		let remaining=this.shields.size;
		let baseRadius=500;
		let ringSpan=PI/2;
		let ringRadius=baseRadius;
		let ringGap=300;
		let ringIdx=0;
		let toRemove=[];
		this.shields.forEach((a)=>{
			ringIdx++;
			let ringCount=Math.ceil(ringRadius*ringSpan/ringGap);
			if(ringCount%2==0){
				ringCount++;
			}
			let realCount=Math.min(remaining,ringCount+1);
			let ang=this.shieldAngle;
			if(realCount>1){
				let ratio=(ringIdx-1)/(realCount-1);
				let angOff;
				if(Math.abs(ratio-0.5)<0.0001){
					angOff=0;
				}else{
					angOff=ratio<0.5?-PI/12:PI/12;
				}
				ang=(ringIdx-1)/(realCount-1)*ringSpan+this.shieldAngle-ringSpan/2+angOff;
			}
			let m=VecA(ringRadius,ang).add(self).add(VecA(-baseRadius,this.shieldAngle));
			if((ringIdx+1)>realCount){
				ringIdx=0;
				remaining-=realCount;
				ringRadius+=ringGap;
			}

			if(!a.alive){
				toRemove.push(a);
			}else{
				a.move(m);
				a.faceAng(ang);
			}
		});
		toRemove.forEach(a=>{
			this.shields.delete(a);
		});

		this.body.face(p);
		this.faceAng(this.body.angle);
		this.body.move(safeP);
		this.body.shoot(gameRunner.aBullets);
	}
}
class BossYarnAI extends BasicAI{
	constructor(body,director){
		super(body,director);
		this.swarm=new Set();
		this.swarmAngle=0;
	}
	run(){
		super.run();
		let p=this.playerPos();
		let self=this.getPos();
		this.body.move(p);
		
		if(this.swarm.size<100){
			let swarmer=this.director.getRandom("swarm");
			if(
				swarmer!=null
				&&swarmer.overriding==null
				&&!this.swarm.has(swarmer.body)
				&&swarmer.getPos().mag(this.getPos())<10000
			){
				this.swarm.add(swarmer.body);
				swarmer.body.head=this;
				swarmer.override(this);
			}
		}
		let orbitLength=this.swarm.size;
		let orbitGap=80;
		let orbitCirc=orbitGap*orbitLength;
		let orbitRadius=Math.max(orbitCirc/TAU,200);
		let orbitSpeed=100/(orbitRadius*TAU);
		this.swarmAngle+=orbitSpeed;
		let toRemove=[];

		let swarmArr=[...this.swarm];

		let swarmCenter;
		let chase=self.mag(p)<2000;
		if(chase){
			swarmCenter=p;
			this.body.open();
		}else{
			swarmCenter=self;
			this.body.close();
		}
		swarmArr.forEach((a,i)=>{
			let i1=mod(i-1,swarmArr.length);
			let i2=mod(i+1,swarmArr.length);

			let pA=a.getPos();
			let p1=swarmArr[i1].getPos();
			let p2=swarmArr[i2].getPos();
			let gap=80;
			let pMid1=pA.cln().sub(p1).nrm(gap).add(p1);
			let pMid2=pA.cln().sub(p2).nrm(gap).add(p2);
			let pMid=pMid1.cln().mix(pMid2,0.5);
			let pDir=p1.cln().sub(pA).nrm(20);

			let strength1=
				Math.max(
					1-Math.abs(
						nrmAngPI(pDir.ang()-pA.ang(swarmCenter))/PI
					),
					0
				);
			if(chase){
				strength1=Math.pow(strength1,3)*2;
			}
			
			// let strength2=
			// Math.max(
			// 	1-Math.abs(
			// 		nrmAngPI(pDir.ang()-pA.ang(p))/PI
			// 	),
			// 	0
			// );
			// let strength=Math.max(strength1,strength2);
			
			// let strength2=clamp((4000-pA.mag(p))/4000,0,1)*10;
			// let attract=p.cln().sub(pA).nrm(strength2);
			pDir.scl(strength1);
			
			a.face(p1);
			a.moveDir(pMid.cln().sub(pA).add(pDir));

			if(!a.alive){
				toRemove.push(a);
			}
		});
		toRemove.forEach(a=>{
			this.swarm.delete(a);
		});
	}
}