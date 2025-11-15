class Game{
	constructor(){
		this.mazeImg=new Image();
		this.mazeImgLoaded=false;
		this.mazeImg.onload=()=>{
			this.mazeImgLoaded=true;
		};

		this.previousMPos=null;

		this.orbsToggled=true;
		// A quick thanks to this maze generator that saved me some time here:
		// https://keesiemeijer.github.io/maze-generator/#generate
		this.mazeImg.src='./img/maze.png';
	}
	clear(disp,barrierDisp){
		disp.clear();
		barrierDisp.clear();
	}
	drawInteractive(disp,barrierDisp,ctrl,t,brush){
		let onePix=disp.size.x/129;
		disp.ctx.lineCap="round";
		barrierDisp.ctx.lineCap="round";

		let mPos=disp.view.transformInv(ctrl.mousePos());
		let start=mPos;
		let end=this.previousMPos??mPos;
		if(ctrl.mouseDown()){
			this.previousMPos=mPos;
		}else{
			this.previousMPos=null;
		}

		if(ctrl.mouseDown("L")){
			disp.noStroke();
			if(brush.type=="color"){
				disp.setStroke(rgb(brush.r,brush.g,brush.b,brush.opacity).gammaShift());
				disp.setWeight(brush.size*onePix);
				disp.start();
				disp.mt(start);
				disp.lt(end);
				disp.path()
			}else if(brush.type=="rainbow"){
				disp.setStroke(hsv(t/4,1,1,brush.opacity).toRgb().gammaShift());
				disp.setWeight(brush.size*onePix);
				disp.start();
				disp.mt(start);
				disp.lt(end);
				disp.path()
			}else if(brush.type=="barrier"){
				barrierDisp.setStroke(rgb(0.,0.,0.,brush.opacity));
				barrierDisp.setWeight(brush.size*onePix);
				barrierDisp.start();
				barrierDisp.mt(start);
				barrierDisp.lt(end);
				barrierDisp.path()
			}else if(brush.type=="erase"){
				disp.ctx.globalCompositeOperation="destination-out";
				disp.setStroke(rgb(0.,0.,0.,brush.opacity));
				disp.setWeight(brush.size*onePix);
				disp.start();
				disp.mt(start);
				disp.lt(end);
				disp.path()
				disp.ctx.globalCompositeOperation="source-over";

				barrierDisp.ctx.globalCompositeOperation="destination-out";
				barrierDisp.setStroke(rgb(0.,0.,0.,brush.opacity));
				barrierDisp.setWeight(brush.size*onePix);
				barrierDisp.start();
				barrierDisp.mt(start);
				barrierDisp.lt(end);
				barrierDisp.path()
				barrierDisp.ctx.globalCompositeOperation="source-over";
			}
		}
		if(ctrl.mouseDown("R")){
				disp.ctx.globalCompositeOperation="destination-out";
				disp.noStroke();
				disp.setFill(rgb(0.,0.,0.,brush.opacity));
				disp.circ(disp.view.transformInv(ctrl.mousePos()),brush.size*onePix);
				disp.ctx.globalCompositeOperation="source-over";

				barrierDisp.ctx.globalCompositeOperation="destination-out";
				barrierDisp.noStroke();
				barrierDisp.setFill(rgb(0.,0.,0.,brush.opacity));
				barrierDisp.circ(disp.view.transformInv(ctrl.mousePos()),brush.size*onePix);
				barrierDisp.ctx.globalCompositeOperation="source-over";
		}
	}
	drawOrbs(disp,t){
		disp.clear();
		if(this.orbsToggled){
			let orbCount=3;
			for(let i=0;i<orbCount;i++){
				disp.setFill(hsv(i/orbCount,1,1).toRgb().gammaShift());
				disp.circ(
					VecA(1,(i)/orbCount*TAU+t).scl([.015,.25]).add([.06,.3]).scl(disp.size),
					10
				);
			}
		}
	}
	drawEdge(barrierDisp){
		let onePix=barrierDisp.size.x/129;
		barrierDisp.noFill();
		barrierDisp.setStroke(rgb(0));
		barrierDisp.setWeight(onePix*1.);
		barrierDisp.rect(1.5*onePix,1.5*onePix,barrierDisp.size.cln().sub(3*onePix));
	}
	drawMaze(barrierDisp){
		if(this.mazeImgLoaded){
			let onePix=barrierDisp.size.x/129;
			barrierDisp.ctx.imageSmoothingEnabled=false;
			barrierDisp.ctx.drawImage(this.mazeImg,0.,0,this.mazeImg.width*onePix,this.mazeImg.height*onePix);
		}
	}
	toggleOrbs(){
		return this.orbsToggled=!this.orbsToggled;
	}
}