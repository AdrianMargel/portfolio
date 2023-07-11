//TODO: compensate for timestep
class EffectManager{
	constructor(game){
		this.game=game;
	}
	splash(x,y,vX,vY,strength){
		let vec=loopVec(Vec(x,y),this.game.getPlayer().getPos());
		x=vec.x;
		y=vec.y;
		
		if(this.game.offScreen(x,y)||strength<1){
			return;
		}
		let n1=Math.min(strength*4+1,100);
		for(let i=0;i<n1;i++){
			let up=VecA(Math.random()*-strength*2,(Math.random()*PI));
			up.y*=3;
			up.x+=vX/5.;
			this.game.particles.push(new SplashParticle(
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
			this.game.particles.push(new SplashParticle(
				Vec(x,y),
				up,
				strength*(Math.random()+1)*4,
				60
			));
		}
	}
	bubbles(x,y,vX,vY,strength){
		let vec=loopVec(Vec(x,y),this.game.getPlayer().getPos());
		x=vec.x;
		y=vec.y;

		if(this.game.offScreen(x,y)){
			return;
		}
		if(this.game.isUnderwater(x,y)){
			let n=Math.min(strength/2-Math.random(),5);
			for(let i=0;i<n;i++){
				let v=VecA(Math.random()*10,Math.random()*TAU);
				v.x+=vX;
				v.y+=vY;
				this.game.particles.push(new BubbleParticle(
					Vec(x,y),
					v,
					(Math.random()+1)*strength+10,
					(100+strength)*Math.random()
				));
			}
		}
	}
	spark(x,y,vX,vY,strength){
		let vec=loopVec(Vec(x,y),this.game.getPlayer().getPos());
		x=vec.x;
		y=vec.y;

		if(this.game.offScreen(x,y)){
			return;
		}
		strength=Math.sqrt(Math.max(strength,1))*5;
		
		let speedScale=1;
		if(this.game.isUnderwater(x,y)){
			for(let i=-1;i<strength/2;i++){
				let v=VecA(Math.random()*10,Math.random()*TAU);
				this.game.particles.push(new BubbleParticle(
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
			this.game.particles.push(new ExplodeParticle(
				Vec(x,y),
				v,
				strength*(Math.random()+1),
				10+strength
			));
		}
	}
	explode(x,y,vX,vY,strength){
		let vec=loopVec(Vec(x,y),this.game.getPlayer().getPos());
		x=vec.x;
		y=vec.y;

		if(this.game.offScreen(x,y)){
			return;
		}
		strength=Math.sqrt(Math.max(strength,1))*5;
		
		let speedScale=1;
		if(this.game.isUnderwater(x,y)){
			for(let i=-1;i<strength/2;i++){
				let v=VecA(Math.random()*10,Math.random()*TAU);
				this.game.particles.push(new BubbleParticle(
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
			this.game.particles.push(new ExplodeParticle(
				Vec(x,y),
				v,
				strength*(Math.random()+1)*2,
				20+strength
			));
		}
		this.game.particles.push(new ExplodeParticle(
			Vec(x,y),
			Vec(0,0),
			strength*10,
			(20+strength)/2
		));
	}
	wreck(x,y,vX,vY,strength){
		let vec=loopVec(Vec(x,y),this.game.getPlayer().getPos());
		x=vec.x;
		y=vec.y;

		strength=Math.sqrt(Math.max(strength,1))*5;
		
		for(let i=-1;i<strength;i++){
			let v=VecA(Math.random()*-strength*3,Math.random()*TAU).add([vX,vY]);
			this.game.particles.push(new WreckParticle(
				Vec(x,y),
				v,
				strength*(Math.random()+1)*2,
				20+strength*2
			));
		}
	}
	thrust(x,y,vX,vY,strength){
		let vec=loopVec(Vec(x,y),this.game.getPlayer().getPos());
		x=vec.x;
		y=vec.y;
		
		if(this.game.offScreen(x,y)){
			return;
		}
		if(!this.game.isUnderwater(x,y)){
			let n=Math.min(Math.ceil(Vec(vX,vY).mag()/20),100);
			for(let i=0;i<n;i++){
				let vScale=(i+Math.random())/n;
				let v=Vec(vX,vY)
				v.scl(vScale);

				let sizeScale=Math.sqrt(strength);
				let size=50*sizeScale;
				let spread=VecA(Math.min(strength*10,size/4),Math.random()*TAU);
				let expand=VecA(sizeScale,Math.random()*TAU);

				this.game.particles.push(new ThrustParticle(
					Vec(x-v.x+spread.x,y-v.y+spread.y),
					expand,
					20*sizeScale,
					size*(Math.random()*0.2+0.8),
					vScale
				));
			}
		}else{
			this.game.bubbles(x,y,vX,vY,strength*10);
		}
	}
}