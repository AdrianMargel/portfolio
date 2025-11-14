class NodePrimerShader extends FragShader{
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
				uniform int eliminatedMidIdx;
				in vec2 pos;

				out vec4 outColor;

				${SHADER_FUNCS.INT_MATH}
				${SHADER_FUNCS.DATA_TEX}
				${SHADER_FUNCS.CASCADE}

				int mapMidIdx(int midIdx,Matrix mtx){
					return midIdx+mtx.edgeCount;
				}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord=ivec2(pos2*size);
					int idx=coord.x+coord.y*int(size.x);

					Level lvl=newLevel(cascadeNum,isHalf);
					Block blk=newBlock(prmIdx(idx,lvl),lvl);
					Matrix blkMtx=newBlockMatrix(blk);
					Matrix prmMtx=newPrimeMatrix(blk);

					int m=mapMidIdx(eliminatedMidIdx,blkMtx);
					
					Element prmElm=newElement(elmIdx(idx,prmMtx),prmMtx);
					Element blkElm=newElement(ivec2(m,prmElm.coord.y),blkMtx);

					//technically the infinite geometric sum is shared by the entire prime matrix block
					//so there is a little room for optimization to reuse/share these calculations
					Element selfBlkElm=newElement(ivec2(m,m),blkMtx);
					float selfWeight=getVal(selfBlkElm,blockMatrixTex,blockMatrixSize);
					//prevent dividing by 0
					float safeSelfWeight=min(selfWeight,.9999999);
					float infiniteGeometricSum=1./(1.-safeSelfWeight);

					bool isSelf=prmElm.coord.y==m;

					float val=getVal(blkElm,blockMatrixTex,blockMatrixSize)*infiniteGeometricSum*float(!isSelf); //branchless

					outColor=vec4(val,0.,0.,0.);
				}
			`,
		);
	}
	run(eliminatedMidIdx,cascadeNum,isHalf,cascadeNumMax,channelCount,blockMatrixTex,primeMatrixTex){
		this.uniforms={
			eliminatedMidIdx,
			cascadeNum,
			isHalf,
			cascadeNumMax,
			channelCount,
			blockMatrixTex:blockMatrixTex.tex,
			blockMatrixSize:blockMatrixTex.size,
			size:primeMatrixTex.size,
		};
		this.attachments=[
			{
				attachment:primeMatrixTex.tex,
				...sizeObj(primeMatrixTex.size)
			}
		];
		super.run();
	}
}