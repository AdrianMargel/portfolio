class LeniaShader extends FragShader{
	constructor(kSize=10){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				#define PI ${PI}
				precision highp float;
				precision highp sampler2D;

				uniform sampler2D leniaTex;
				uniform sampler2D lenia2Tex;
				uniform vec2 size;
				uniform float rand;
				in vec2 pos;

				layout(location = 0) out vec4 outColor0;

				${SHADER_FUNCS.HASH}
				
				ivec2 loopCoord(ivec2 coord){
					return ivec2(mod(vec2(coord),size));
				}

				float growth(float dist,float amp,float freq,float phase){
					return amp*sin(TAU*(dist/freq-phase));
				}
				float[8] check(ivec2 c,sampler2D tex){
					float[8] totals;
					float[8] weights;
					float weightCombined;

					int kSize=${kSize};
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
								float v=texelFetch(tex,loopCoord(c+offset),0).r*w;
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
				float[8] normal(float[8] a){
					float total=integral(a);
					if(total==0.){
						return a;
					}
					for(int i=0;i<8;i++){
						a[i]/=total;
					}
					return a;
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

				float[16] subtract(float[16] a,float[16] b){
					for(int i=0;i<16;i++){
						a[i]-=b[i];
					}
					return a;
				}
				float[16] multiply(float[16] a,float[16] b){
					for(int i=0;i<16;i++){
						a[i]*=b[i];
					}
					return a;
				}
				float[16] square(float[16] a){
					for(int i=0;i<16;i++){
						a[i]*=a[i];
					}
					return a;
				}
				float integral(float[16] a){
					float total=0.;
					for(int i=0;i<16;i++){
						total+=a[i];
					}
					return total/16.;
				}
				float[16] normal(float[16] a){
					float total=integral(a);
					if(total==0.){
						return a;
					}
					for(int i=0;i<16;i++){
						a[i]/=total;
					}
					return a;
				}
				float[16] diff(float[16] a){
					float[16] b;
					for(int i=0;i<16;i++){
						if(i>0){
							b[i]+=a[i]-a[i-1];
						}
						if(i<7){
							b[i]+=a[i+1]-a[i];
						}
					}
					return b;
				}
				
				vec2 compare(float[16] a,float[16] point,vec3 wave,vec3 wave2){
					float dist=sqrt(integral(square(subtract(a,point))));
					return vec2(
						growth(dist,wave[0],wave[1],wave[2]),
						growth(dist,wave2[0],wave2[1],wave2[2])
					);
				}
				float compare(float[16] a,float[16] point,vec3 wave){
					float dist=sqrt(integral(square(subtract(a,point))));
					return growth(dist,wave[0],wave[1],wave[2]);
				}
				float compare(float[8] a,float[8] point,vec3 wave){
					float dist=sqrt(integral(square(subtract(a,point))));
					return growth(dist,wave[0],wave[1],wave[2]);
				}

				float gene(float[8] c){
					${[...Array(4).fill().map((_,i)=>glsl`
						float[8] dnaVals${i+1}=float[](
							${Array(8).fill().map(_=>rand(-1,2))}
						);
						vec3 dnaVec${i+1}=vec3(
							${Array(3).fill().map(_=>rand())}
						);
					`)].join("")}
					return clamp(
						compare(c,dnaVals1,dnaVec1)+
						compare(c,dnaVals2,dnaVec2)+
						compare(c,dnaVals3,dnaVec3)+
						compare(c,dnaVals4,dnaVec4),
						-1.,1.);
				}
				float gene(float[16] c){
					${[...Array(4).fill().map((_,i)=>glsl`
						float[16] dnaVals${i+1}=float[](
							${Array(16).fill().map(_=>rand(-1,2))}
						);
						vec3 dnaVec${i+1}=vec3(
							${Array(3).fill().map(_=>rand())}
						);
					`)].join("")}
					return clamp(
						compare(c,dnaVals1,dnaVec1)+
						compare(c,dnaVals2,dnaVec2)+
						compare(c,dnaVals3,dnaVec3)+
						compare(c,dnaVals4,dnaVec4),
						-1.,1.);
				}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord2=ivec2(pos2*size);

					float[8] c1=check(coord2,leniaTex);
					// float[8] c2=check(coord2,lenia2Tex);
					// c1=normal(c1);
					// c2=normal(c2);
					/*float[16] cMerge=float[](${[
						...Array(8).fill().map((x,i)=>glsl`c1[${i}]`),
						...Array(8).fill().map((x,i)=>glsl`c2[${i}]`)
					]});*/
					// cMerge=normal(cMerge);
					float result=gene(c1);
					// vec2 result=vec2(geneA(cMerge),geneB(cMerge));

					outColor0=vec4(result,0.,0.,0.);
				}
			`,
		);
	}
	run(leniaTex,lenia2Tex,affinityTex){
		this.uniforms={
			leniaTex:leniaTex.tex,
			lenia2Tex:lenia2Tex.tex,
			size:leniaTex.size,
			rand: rand(),
		};
		this.attachments=[
			{
				attachment:affinityTex.tex,
				...sizeObj(affinityTex.size)
			}
		];
		super.run();
	}
}