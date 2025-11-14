let SHADER_FUNCS={
	INT_MATH:glsl`
		int powI(int a,int b){
			return int(pow(float(a),float(b))+.5);
		}
		int modI(int a,int b){
			return ((a%b)+b)%b;
		}
	`,
	DATA_TEX:glsl`
		ivec2 getIdxCoord(int idx,vec2 size){
			int width=int(size.x);
		
			int y=idx/width;
			int x=idx-(y*width);

			if(y<0||y>=int(size.y)){
				return ivec2(-1);
			}
			return ivec2(x,y);
		}
		vec2 getIdxPos(int idx,vec2 size){
			ivec2 coord=getIdxCoord(idx,size);
			if(coord.x==-1){
				return vec2(-1.);
			}
			//sample from center of the pixel
			return (vec2(coord)+.5)/size;
		}
	`,
	HASH:glsl`
		//1 out, 1 in...
		float hash11(float p){
			p = fract(p * .1031);
			p *= p + 33.33;
			p *= p + p;
			return fract(p);
		}
		//  1 out, 2 in...
		float hash12(vec2 p){
			vec3 p3  = fract(vec3(p.xyx) * .1031);
			p3 += dot(p3, p3.yzx + 33.33);
			return fract((p3.x + p3.y) * p3.z);
		}
		//  1 out, 3 in...
		float hash13(vec3 p3){
			p3  = fract(p3 * .1031);
			p3 += dot(p3, p3.zyx + 31.32);
			return fract((p3.x + p3.y) * p3.z);
		}
		// 4 out, 2 in...
		vec4 hash42(vec2 p){
			vec4 p4 = fract(vec4(p.xyxy) * vec4(.1031, .1030, .0973, .1099));
			p4 += dot(p4, p4.wzxy+33.33);
			return fract((p4.xxyz+p4.yzzw)*p4.zywx);

		}
	`,
	CASCADE:glsl`
		//TODO: better handling of statics?
		//TODO: reduce duplicate/unnecessary calculations?
		int getChannelCount(){
			return channelCount;
		}
		int getCascadeNumMax(){
			return cascadeNumMax;
		}
		vec2 getCascadeSize(){
			int s=powI(2,getCascadeNumMax());
			return vec2(s,s);
		}

		int idxFromCoord(ivec2 coord,ivec2 dims){
			return coord.x+coord.y*dims.x;
		}
		ivec2 coordFromIdx(int idx,ivec2 dims){
			int y=idx/dims.x;
			int x=idx-(y*dims.x);
			return ivec2(x,y);
		}

		struct Level{
			// IDENTITY:
			int cascadeNum;
			bool isHalf;
			// PROPERTIES:
			ivec2 dims;
			ivec2 scale;
		};
		Level newLevel(int cascadeNum,bool isHalf){
			int cascadeNumMax=getCascadeNumMax();
			
			int height=powI(2,cascadeNumMax-cascadeNum);
			int width=height/(int(isHalf)+1); //branchless
			ivec2 dims=ivec2(width,height);

			int scaleBase=powI(2,cascadeNum);
			int scaleHeight=scaleBase+1;
			int scaleWidth=scaleBase*(int(isHalf)+1)+1; //branchless
			ivec2 scale=ivec2(scaleWidth,scaleHeight);
			
			return Level(
				cascadeNum,
				isHalf,
				
				dims,
				scale
			);
		}

		struct Block{
			// IDENTITY:
			Level lvl;
			int idx;
			ivec2 coord;
			// PROPERTIES:
			ivec2 size;
		};
		Block newBlock(int idx,Level lvl){
			ivec2 size=lvl.scale;
			return Block(
				lvl,
				idx,
				coordFromIdx(idx,lvl.dims),

				size
			);
		}
		Block newBlock(ivec2 coord,Level lvl){
			ivec2 size=lvl.scale;
			return Block(
				lvl,
				idxFromCoord(coord,lvl.dims),
				coord,

				size
			);
		}

		struct Matrix{
			// IDENTITY:
			Block blk;
			// PROPERTIES:
			ivec2 dims;
			int edgeCount;
			int midCount;
			int channelCount;
		};
		Matrix newBlockMatrix(Block blk){
			int edgeCount=2*(blk.size.x-1+blk.size.y-1);
			int midCount=blk.size.y-2;
			int channelCount=getChannelCount();
			ivec2 dims=ivec2(
				edgeCount+midCount,
				edgeCount+midCount+channelCount
			);
			return Matrix(
				blk,

				dims,
				edgeCount,
				midCount,
				channelCount
			);
		}
		Matrix newCascadeMatrix(Block blk){
			int edgeCount=2*(blk.size.x-1+blk.size.y-1);
			int midCount=blk.size.y-2;
			int channelCount=getChannelCount();
			ivec2 dims=ivec2(
				midCount,
				edgeCount+channelCount
			);
			return Matrix(
				blk,

				dims,
				edgeCount,
				midCount,
				channelCount
			);
		}
		Matrix newPrimeMatrix(Block blk){
			int edgeCount=2*(blk.size.x-1+blk.size.y-1);
			int midCount=blk.size.y-2;
			int channelCount=getChannelCount();
			ivec2 dims=ivec2(
				1,
				edgeCount+midCount+channelCount
			);
			return Matrix(
				blk,

				dims,
				edgeCount,
				midCount,
				channelCount
			);
		}

		struct Element{
			// IDENTITY:
			Matrix mtx;
			int idx;
			ivec2 coord;
		};
		Element newElement(int idx,Matrix mtx){
			return Element(
				mtx,
				idx,
				coordFromIdx(idx,mtx.dims)
			);
		}
		Element newElement(ivec2 coord,Matrix mtx){
			return Element(
				mtx,
				idxFromCoord(coord,mtx.dims),
				coord
			);
		}

		int getBlockMatrixCount(Level lvl){
			Block blk=newBlock(0,lvl);
			Matrix mtx=newBlockMatrix(blk);
			return int(mtx.dims.x*mtx.dims.y);
		}
		int getCascadeMatrixCount(Level lvl){
			Block blk=newBlock(0,lvl);
			Matrix mtx=newCascadeMatrix(blk);
			return int(mtx.dims.x*mtx.dims.y);
		}
		int getPrimeMatrixCount(Level lvl){
			Block blk=newBlock(0,lvl);
			Matrix mtx=newPrimeMatrix(blk);
			return int(mtx.dims.x*mtx.dims.y);
		}
		
		ivec2 getMergeDir(bool isHalf){
			return ivec2(int(isHalf),int(!isHalf)); //branchless
		}

		int csdIdx(int globalIdx,Level lvl){
			int count=getCascadeMatrixCount(lvl);
			return globalIdx/count;
		}
		int blkIdx(int globalIdx,Level lvl){
			int count=getBlockMatrixCount(lvl);
			return globalIdx/count;
		}
		int prmIdx(int globalIdx,Level lvl){
			int count=getPrimeMatrixCount(lvl);
			return globalIdx/count;
		}

		int elmIdx(int globalIdx,Matrix mtx){
			return globalIdx-mtx.blk.idx*mtx.dims.x*mtx.dims.y;
		}

		float getVal(Element elm,sampler2D tex,vec2 size){
			ivec2 coord=getIdxCoord(
				elm.idx+elm.mtx.blk.idx*elm.mtx.dims.x*elm.mtx.dims.y,
				size
			);
			return texelFetch(tex,coord,0).r;
		}
	`,
	CASCADE_COORD:glsl`
		int getEdgeCoordComponent(int idx,int limit,int halfCount){
			bool onHalf=idx<halfCount;
			int val=min(modI(idx,halfCount),limit);
			int nVal=limit-val;

			return val*int(onHalf)+nVal*int(!onHalf); //branchless
		}
		ivec2 getEdgeCoord(int edgeIdx,Block blk){
			ivec2 blkPos=blk.coord*(blk.size-1);

			int w=blk.size.x-1;
			int h=blk.size.y-1;
			int halfCount=w+h;
			int count=halfCount*2;

			ivec2 elmPos=ivec2(
                getEdgeCoordComponent(modI(edgeIdx-h,count),w,halfCount),
				getEdgeCoordComponent(edgeIdx,h,halfCount)
			);

			return blkPos+elmPos;
		}
		ivec2 getMidCoord(int midIdx,Block blk){
			ivec2 blkPos=blk.coord*(blk.size-1);

			int w=blk.size.x-1;
			int h=blk.size.y-1;
			ivec2 mergeDir=getMergeDir(blk.lvl.isHalf);
			int mid=w/2*mergeDir.x+h/2*mergeDir.y; //branchless
			
			ivec2 elmPos=(midIdx+1)*mergeDir.yx+mid*mergeDir;

			return blkPos+elmPos;
		}
	`,
	GAMMA:glsl`
		vec3 gammaCorrect(vec3 col){
			float gammaExp=${1./2.2};
			return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
		}
		vec3 gammaShift(vec3 col){
			float gammaExp=2.2;
			return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
		}
	`
};