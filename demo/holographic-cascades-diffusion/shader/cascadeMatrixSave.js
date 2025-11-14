class CascadeMatrixSaveShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define PI ${PI}
				#define TAU ${TAU}
				precision highp float;
				precision highp int;
				precision highp sampler2D;
				
				uniform sampler2D blockMatrixTex;
				uniform vec2 blockMatrixSize;
				uniform vec2 size;
				uniform int cascadeNum;
				uniform int cascadeNumMax;
				uniform bool isHalf;
				uniform int channelCount;
				in vec2 pos;
				
				out vec4 outColor;

				${SHADER_FUNCS.INT_MATH}
				${SHADER_FUNCS.DATA_TEX}
				${SHADER_FUNCS.CASCADE}

				int mapEdgeIdx(int edgeIdx){
					return edgeIdx;
				}
				int mapMidIdx(int midIdx,Matrix tarMtx){
					return midIdx+tarMtx.edgeCount;
				}
				int mapChannelIdx(int channelIdx,Matrix tarMtx){
					return channelIdx+(tarMtx.edgeCount+tarMtx.midCount);
				}

				int mapIdxX(int srcIdx,Matrix srcMtx,Matrix tarMtx){
					//map middle node
					return mapMidIdx(srcIdx,tarMtx);
				}
				int mapIdxY(int srcIdx,Matrix srcMtx,Matrix tarMtx){
					if(srcIdx<srcMtx.edgeCount){
						//map edge node
						return mapEdgeIdx(srcIdx);
					}else{
						//map channel output
						int channelIdx=srcIdx-srcMtx.edgeCount; //don't need to subtract midCount because it will always be 0 for a cascade matrix
						return mapChannelIdx(channelIdx,tarMtx);
					}
				}

				Element getBlockElm(Element csdElm,Matrix blkMtx){
					ivec2 coordBlk=ivec2(
						mapIdxX(csdElm.coord.x,csdElm.mtx,blkMtx),
						mapIdxY(csdElm.coord.y,csdElm.mtx,blkMtx)
					);
					return newElement(coordBlk,blkMtx);
				}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord=ivec2(pos2*size);
					int idx=coord.x+coord.y*int(size.x);

					Level lvl=newLevel(cascadeNum,isHalf);
					Block blk=newBlock(csdIdx(idx,lvl),lvl);
					Matrix csdMtx=newCascadeMatrix(blk);
					Matrix blkMtx=newBlockMatrix(blk);

					Element csdElm=newElement(elmIdx(idx,csdMtx),csdMtx);
					Element blkElm=getBlockElm(csdElm,blkMtx);

					float val=getVal(blkElm,blockMatrixTex,blockMatrixSize);
					
					outColor=vec4(val,0.,0.,0.);
				}
			`,
		);
	}
	run(cascadeNum,isHalf,cascadeNumMax,channelCount,blockMatrixTex,cascadeMatrixTex){
		this.uniforms={
			cascadeNum,
			isHalf,
			cascadeNumMax,
			channelCount,
			blockMatrixTex:blockMatrixTex.tex,
			blockMatrixSize:blockMatrixTex.size,
			size:cascadeMatrixTex.size,
		};
		this.attachments=[
			{
				attachment:cascadeMatrixTex.tex,
				...sizeObj(cascadeMatrixTex.size)
			}
		];
		super.run();
	}
}