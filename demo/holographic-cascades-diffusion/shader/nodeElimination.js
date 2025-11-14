class NodeEliminationShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define PI ${PI}
				#define TAU ${TAU}
				precision highp float;
				precision highp int;
				precision highp sampler2D;
				
				uniform sampler2D primeMatrixTex;
				uniform vec2 primeMatrixSize;
				uniform sampler2D blockMatrixTex;
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
					Block blk=newBlock(blkIdx(idx,lvl),lvl);
					Matrix blkMtx=newBlockMatrix(blk);
					Matrix prmMtx=newPrimeMatrix(blk);

					//a=starting node
					//b=ending node
					//m=middle node (the node being eliminated)

					int m=mapMidIdx(eliminatedMidIdx,blkMtx);
					Element abElm=newElement(elmIdx(idx,blkMtx),blkMtx);
					int a=abElm.coord.x;
					int b=abElm.coord.y;
					Element amElm=newElement(ivec2(a,m),blkMtx);
					Element mbElmP=newElement(ivec2(0,b),prmMtx);

					bool isAElimated=a==m;

					float ab=getVal(abElm,blockMatrixTex,size);
					float am=getVal(amElm,blockMatrixTex,size); //TODO: double check this

					float mb=getVal(mbElmP,primeMatrixTex,primeMatrixSize);

					float val=ab+am*mb;//TODO: double check this

					outColor=vec4(val,0.,0.,0.);
				}
			`,
		);
	}
	run(eliminatedMidIdx,cascadeNum,isHalf,cascadeNumMax,channelCount,blockMatrixTexPP,primeMatrixTex){
		this.uniforms={
			eliminatedMidIdx,
			cascadeNum,
			isHalf,
			cascadeNumMax,
			channelCount,
			primeMatrixTex:primeMatrixTex.tex,
			primeMatrixSize:primeMatrixTex.size,
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