class BlockMatrixMergeShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define PI ${PI}
				#define TAU ${TAU}
				precision highp float;
				precision highp int;
				precision highp sampler2D;

				uniform sampler2D blockMatrixTex;
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

				int getCornerIdx(int corner,ivec2 size){
					//keep in mind dividing by 2 also floors the result because it is an int
					return corner/2*(size.x-1)
						+(corner+1)/2*(size.y-1);
				}
				int mergeSideStartCorner(ivec2 mergeDir,bool reverse){
					return (int(!reverse)*2)*mergeDir.x
						+(1+int(reverse)*2)*mergeDir.y; //branchless
				}
				int mergeSideEndCorner(ivec2 mergeDir,bool reverse){
					return modI(mergeSideStartCorner(mergeDir,reverse)+1,4);
				}

				int mapEdgeIdx(int edgeIdx,ivec2 mergeDir,bool reverse,Matrix srcMtx,Matrix tarMtx){
					ivec2 srcSize=srcMtx.blk.size;
					int mergeCount=srcMtx.edgeCount/2;
					int srcStart=-(srcSize.x-1)/2*mergeDir.x
						+((srcSize.y-1)/2-mergeCount)*mergeDir.y; //branchless
					if(reverse){
						srcStart-=mergeCount;
					}
					int tarStart=getCornerIdx(mergeSideEndCorner(mergeDir,reverse),tarMtx.blk.size);

					edgeIdx=modI(edgeIdx-srcStart,srcMtx.edgeCount);
					if(edgeIdx>mergeCount){
						return -1;
					}

					edgeIdx=modI(edgeIdx+tarStart,tarMtx.edgeCount);
					return edgeIdx;
				}
				int mapMidIdx(int midIdx,ivec2 mergeDir,bool reverse,Matrix srcMtx,Matrix tarMtx){
					if(!reverse==(mergeDir.x==1)){
						//reverse order
						midIdx=srcMtx.midCount-1-midIdx;
					}
					int tarStart=getCornerIdx(mergeSideStartCorner(mergeDir,reverse),tarMtx.blk.size);
					
					//note that we don't need to worry about modulo since all the middle nodes
					//are on a single side, they never wrap around a corner
					midIdx=midIdx+tarStart+1;
					return midIdx;
				}
				int mapChannelIdx(int channelIdx,Matrix tarMtx){
					return channelIdx+(tarMtx.edgeCount+tarMtx.midCount);
				}

				int mapIdx(int srcIdx,ivec2 mergeDir,bool reverse,Matrix srcMtx,Matrix tarMtx){
					if(srcIdx<srcMtx.edgeCount){
						//map edge node
						return mapEdgeIdx(srcIdx,mergeDir,reverse,srcMtx,tarMtx);
					}else if(srcIdx<srcMtx.edgeCount+srcMtx.midCount){
						//map middle node
						int midIdx=srcIdx-srcMtx.edgeCount;
						return mapMidIdx(midIdx,mergeDir,reverse,srcMtx,tarMtx);
					}else{
						//map channel output
						int channelIdx=srcIdx-(srcMtx.edgeCount+srcMtx.midCount);
						return mapChannelIdx(channelIdx,tarMtx);
					}
				}
				float merge(Element srcElm,Matrix mtxA,Matrix mtxB,ivec2 mergeDir){
					ivec2 coordA=ivec2(
						mapIdx(srcElm.coord.x,mergeDir,false,srcElm.mtx,mtxA),
						mapIdx(srcElm.coord.y,mergeDir,false,srcElm.mtx,mtxA)
					);
					ivec2 coordB=ivec2(
						mapIdx(srcElm.coord.x,mergeDir,true,srcElm.mtx,mtxB),
						mapIdx(srcElm.coord.y,mergeDir,true,srcElm.mtx,mtxB)
					);

					float val;
					if(coordA.x!=-1&&coordA.y!=-1){
						Element elmA=newElement(coordA,mtxA);
						val=getVal(elmA,blockMatrixTex,size);
					}
					if(coordB.x!=-1&&coordB.y!=-1){
						Element elmB=newElement(coordB,mtxB);
						val+=getVal(elmB,blockMatrixTex,size);
					}

					return val;
				}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord=ivec2(pos2*size);
					int idx=coord.x+coord.y*int(size.x);

					Level lvl=newLevel(cascadeNum,isHalf);
					Block blk=newBlock(blkIdx(idx,lvl),lvl);
					Matrix mtx=newBlockMatrix(blk);
					Element elm=newElement(elmIdx(idx,mtx),mtx);

					ivec2 mergeDir=getMergeDir(isHalf);

					Level prevLvl=newLevel(cascadeNum-int(!isHalf),!isHalf); //branchless
					ivec2 prevBlkCoord=blk.coord*(mergeDir+1); //branchless
					Block prevBlkA=newBlock(prevBlkCoord,prevLvl);
					Block prevBlkB=newBlock(prevBlkCoord+mergeDir,prevLvl);

					Matrix mtxA=newBlockMatrix(prevBlkA);
					Matrix mtxB=newBlockMatrix(prevBlkB);

					float val=merge(elm,mtxA,mtxB,mergeDir);

					outColor=vec4(val,0.,0.,0.);
				}
			`,
		);
	}
	run(cascadeNum,isHalf,cascadeNumMax,channelCount,blockMatrixTexPP){
		this.uniforms={
			cascadeNum,
			isHalf,
			cascadeNumMax,
			channelCount,
			blockMatrixTex:blockMatrixTexPP.tex,
			size:blockMatrixTexPP.size,
		};
		this.attachments=[
			{
				attachment:blockMatrixTexPP.flip().tex,
				...sizeObj(blockMatrixTexPP.size)
			}
		];
		super.run();
	}
}