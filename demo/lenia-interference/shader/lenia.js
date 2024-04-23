class LeniaShader extends FragShader{
	constructor(leniaTexPP){
		let tempList;
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				#define PI ${PI}
				precision highp float;
				precision highp sampler2D;

				uniform sampler2D leniaTex;
				uniform vec2 leniaSize;
				uniform float time;
				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.HASH}

				float growth(float dist,float amp,float freq,float phase){
					return amp*sin(TAU*(dist/freq-phase));
				}
				float[8] check(ivec2 c){
					float[8] totals;
					float[8] weights;
					float weightCombined;

					int kSize=10;
					for(int x=-kSize;x<=kSize;x++){
						for(int y=-kSize;y<=kSize;y++){
							ivec2 offset=ivec2(x,y);
							float l=length(vec2(offset));
							if(l<=float(kSize)){
								float f=l/float(kSize);
								float idxF=clamp(f*f,0.,1.)*8.;
								float m=mod(idxF,1.);
								float m2=1.-m;
								int i=int(idxF);

								float w=1.;
								float v=texelFetch(leniaTex,c+offset,0).r*w;
								totals[i]+=v*m2;
								weights[i]+=w*m2;
								totals[i+1]+=v*m;
								weights[i+1]+=w*m;
							}
						}
					}
					for(int i=0;i<8;i++){
						totals[i]/=weights[i];
					}
					return totals;
				}
				float[8] check2(ivec2 c){
					float[8] totals;
					float[8] weights;
					float weightCombined;

					float vOrigin=texelFetch(leniaTex,c,0).r;

					int kSize=10;
					for(int x=-kSize;x<=kSize;x++){
						for(int y=-kSize;y<=kSize;y++){
							ivec2 offset=ivec2(x,y);
							float l=length(vec2(offset));
							if(l<=float(kSize)&&offset!=ivec2(0,0)){
								float f=l/float(kSize);
								float idxF=clamp(f*f,0.,1.)*8.;
								float m=mod(idxF,1.);
								float m2=1.-m;
								int i=int(idxF);

								float w=1.;
								float v=(cos(TAU*(vOrigin-texelFetch(leniaTex,c+offset,0).r))+1.)*.5*w;
								totals[i]+=v*m2;
								weights[i]+=w*m2;
								totals[i+1]+=v*m;
								weights[i+1]+=w*m;
							}
						}
					}
					for(int i=0;i<8;i++){
						totals[i]/=weights[i];
					}
					return totals;
				}
				float[8] subtract(float[8] a,float[8] b){
					for(int i=0;i<8;i++){
						a[i]-=b[i];
					}
					return a;
				}
				float[8] multiply(float[8] a,float[8] b){
					for(int i=0;i<8;i++){
						a[i]*=b[i];
					}
					return a;
				}
				float[8] square(float[8] a){
					for(int i=0;i<8;i++){
						a[i]*=a[i];
					}
					return a;
				}
				float integral(float[8] a){
					float total=0.;
					for(int i=0;i<8;i++){
						total+=a[i];
					}
					return total/8.;
				}
				float[8] diff(float[8] a){
					float[8] b;
					for(int i=0;i<8;i++){
						if(i>0){
							b[i]+=a[i]-a[i-1];
						}
						if(i<7){
							b[i]+=a[i+1]-a[i];
						}
					}
					return b;
				}
				float compare(float[8] a,float[8] point,vec3 wave){
					// return growth(sqrt(integral(square(subtract(diff(a),point)))),wave[0],wave[1],wave[2]);
					return growth(sqrt(integral(square(subtract(a,point)))),wave[0],wave[1],wave[2]);
				}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord2=ivec2(pos2*leniaSize);
					float[8] dnaVals2a=float[](
						${
							[...Array(7).fill().map(_=>rand(-1,2)),0.0001]
							.map((x,i,arr)=>x)
						}
					);
					float[8] dnaVals2b=float[](
						${
							[...Array(7).fill().map(_=>rand(-1,2)),0.0001]
							.map((x,i,arr)=>x)
						}
					);
					float[8] dnaVals2c=float[](
						${
							[...Array(7).fill().map(_=>rand(-1,2)),0.0001]
							.map((x,i,arr)=>x)
						}
					);
					float[8] dnaVals2d=float[](
						${
							[...Array(7).fill().map(_=>rand(-1,2)),0.0001]
							.map((x,i,arr)=>x)
						}
					);
					vec3 dnaVals3a=vec3(
						${(tempList=Array(3).fill().map(_=>rand())).join(",")}
					);
					vec3 dnaVals3b=vec3(
						${(tempList=Array(3).fill().map(_=>rand())).join(",")}
					);
					vec3 dnaVals3c=vec3(
						${(tempList=Array(3).fill().map(_=>rand())).join(",")}
					);
					vec3 dnaVals3d=vec3(
						${(tempList=Array(3).fill().map(_=>rand())).join(",")}
					);

					float val=texelFetch(leniaTex,coord2,0).r;
					// float neighbors=integral(square(subtract(dnaVals2,check4(coord2))));
					// float neighbors=integral(check3(coord2));
					float[8] c=check(coord2);
					// float[8] c=float[8](pos2.x,pos2.y,0.,0., 0.,0.,0.,0.);
					float delta=clamp(compare(c,dnaVals2a,dnaVals3a)+
						compare(c,dnaVals2b,dnaVals3b)+
						compare(c,dnaVals2c,dnaVals3c)+
						compare(c,dnaVals2d,dnaVals3d),-1.,1.)*.1;
					// float delta=clamp(compare(c,dnaVals2a,vec3(1.,1.,time/100.)),-1.,1.);
					// float delta=clamp(compare(c,dnaVals2a,dnaVals3a),-1.,1.)*.1;
					// float delta=clamp(compare(c,float[8](.5,.5,0.,0., 0.,0.,0.,0.),vec3(1.,1.,0.)),-1.,1.);
					
					if(time==1.){
						outColor=vec4(hash12(vec2(coord2))*pos2.x);
					}else{
						// outColor=vec4(0.,delta,-delta,1.);
						// outColor=vec4(val+delta,delta,-delta,1.);
						outColor=vec4(val,delta,0.,0.);
					}
				}
			`,
		);
		this.leniaTexPP=leniaTexPP;
		this.time=0;
	}
	run(){
		this.uniforms={
			leniaTex:this.leniaTexPP.tex,
			leniaSize:this.leniaTexPP.size,
			time:this.time,
		};
		this.attachments=[
			{
				attachment:this.leniaTexPP.flip().tex,
				...sizeObj(this.leniaTexPP.size)
			}
		];
		super.run();
		this.time++;
	}
}