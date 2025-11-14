class InitShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define PI ${PI}
				#define TAU ${TAU}
				precision highp float;
				precision highp int;
				precision highp sampler2D;

				uniform sampler2D inputTex;
				uniform vec2 inputSize;
				uniform vec2 size;
				uniform int cascadeNumMax;
				uniform int channelCount;
				in vec2 pos;

				out vec4 outColor;

				${SHADER_FUNCS.INT_MATH}
				${SHADER_FUNCS.DATA_TEX}
				${SHADER_FUNCS.CASCADE}
				${SHADER_FUNCS.CASCADE_COORD}

				bool isReflective(vec4 v){
					return v.a<0.;
				}
				bool isAbsorptive(vec4 v){
					return (v.a>0.)&&!isReflective(v);
				}

				vec4 getInitValue(ivec2 coord){
					vec2 p=vec2(coord)/getCascadeSize();
					vec2 pi=vec2(p.x,1.-p.y);
					return texture(inputTex,pi);
					// return texelFetch(inputTex,coord*4,0);
				}
				float selfConnection(ivec2 coord){
					vec4 v1=getInitValue(coord);
					if(isReflective(v1)){
						return 0.;
					}

					float baseWeight=1./8.;
					float total;
					for(int x=-1;x<=1;x++){
						for(int y=-1;y<=1;y++){
							if(x!=0||y!=0){
								vec4 v=getInitValue(coord+ivec2(x,y));
								total+=float(isReflective(v));
							}
						}
					}
					return float(total)*baseWeight/4.;
				}
				float initVal(ivec2 mtxCoord,Matrix mtx){
					//note that midCount will always be 0 for the smallest cascade which is the one we initialize

					ivec2 aCoord=getEdgeCoord(mtxCoord.x,mtx.blk);
					vec4 a=getInitValue(aCoord);
					
					if(mtxCoord.x==mtxCoord.y){
						//map self-connection
						return selfConnection(aCoord);
					}else if(mtxCoord.y<mtx.edgeCount){
						//map edge node
						ivec2 bCoord=getEdgeCoord(mtxCoord.y,mtx.blk);
						vec4 b=getInitValue(bCoord);

						if(isReflective(a)||isReflective(b)||isAbsorptive(a)){
							return 0.;
						}
						bool isDiagonal=modI(mtxCoord.y-mtxCoord.x,mtx.edgeCount)==2;
						float baseWeight=1./8.;
						
						//divide each non-diagonal weight by 2 since these connections will get merged later
						return baseWeight/(1.+float(!isDiagonal)); //branchless
					}else{
						//map channel output
						int channelIdx=mtxCoord.y-mtx.edgeCount;
						if(isReflective(a)){
							return mod(float(aCoord.x+aCoord.y),2.)/4.*.1
								+.1*float(channelIdx==0)
								+.01*float(channelIdx==1)
								+.15*float(channelIdx==2);
							// return 1.;
						}
						float val=(a.x*float(channelIdx==0))
							+(a.y*float(channelIdx==1))
							+(a.z*float(channelIdx==2)); //branchless
						//divide by 4 to account for overlap since these connections will get merged twice later
						return val*.25;
					}
				}
				
				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord=ivec2(pos2*size);
					int idx=coord.x+coord.y*int(size.x);

					Level lvl=newLevel(0,false);
					Block blk=newBlock(blkIdx(idx,lvl),lvl);
					Matrix mtx=newBlockMatrix(blk);
					Element elm=newElement(elmIdx(idx,mtx),mtx);

					float val=initVal(elm.coord,mtx);

					outColor=vec4(val);
				}
			`,
		);
	}
	run(cascadeNumMax,channelCount,inputTex,blockMatrixTex){
		this.uniforms={
			cascadeNumMax,
			channelCount,
			inputTex:inputTex.tex,
			inputSize:inputTex.size,
			size:blockMatrixTex.size,
		};
		this.attachments=[
			{
				attachment:blockMatrixTex.tex,
				...sizeObj(blockMatrixTex.size)
			}
		];
		super.run();
		this.time++;
	}
}