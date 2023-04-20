class Game{
	constructor(){
		this.board=new Board();
		this.turn="x";
	}
	run(control,disp){
		let mPos=control.getMouse(disp.cam);
		mPos.sclVec(1/20);
		if(control.mouseLDown){
			if(this.board.tryPlace(mPos,this.turn) !== null ){
				this.turn=this.turn==="x"?"o":"x";
			}
		}
		this.board.outline(mPos);
		//disp.cam.pos.x-=Math.random()*0.1;
		//disp.cam.pos.y-=Math.random()*0.1;
		disp.nextTick();
	}
	display(control,disp){
		disp.reset();
		disp.clear();
		disp.ctxF.lineCap = 'round';
		this.board.display(disp);
	}

}
class Board{
	constructor(){
		this.value="";
		this.gridSpace=3.25;
		this.grid=[];
		for(let x=0;x<3;x++){
			let col=[];
			this.grid.push(col);
			for(let y=0;y<3;y++){
				let gridPos=new Vector(x*this.gridSpace,y*this.gridSpace);
				col.push(new Grid(gridPos));
			}
		}
	}
	outline(placePos){
		if(this.value!==""){
			return null;
		}
		let x=Math.floor(placePos.x/this.gridSpace);
		let y=Math.floor(placePos.y/this.gridSpace);
		let correctedPos=new Vector(placePos);
		correctedPos.subVec(new Vector(x*this.gridSpace,y*this.gridSpace));
		let focusPos=null;
		for(let x=0;x<3;x++){
			for(let y=0;y<3;y++){
				this.grid[x][y].resetOutline();
			}
		}
		if(x>=0&&x<3&&y>=0&&y<3){
			focusPos=this.grid[x][y].outline(correctedPos);
		}
		if(focusPos!==null){
			let focus=this.grid[focusPos.x][focusPos.y];
			if(focus.value!==""){//the grid is filled so the next move can be anywhere
				focus=null;
			}
			for(let x=0;x<3;x++){
				for(let y=0;y<3;y++){
					let g=this.grid[x][y];
					g.setFocus(g.value===""&&(focus===null||focus===g));
				}
			}
		}else{
			for(let x=0;x<3;x++){
				for(let y=0;y<3;y++){
					let g=this.grid[x][y];
					g.setFocus(false);
				}
			}
		}
	}
	tryPlace(placePos,val){
		if(this.value!==""){
			return null;
		}
		let x=Math.floor(placePos.x/this.gridSpace);
		let y=Math.floor(placePos.y/this.gridSpace);
		let correctedPos=new Vector(placePos);
		correctedPos.subVec(new Vector(x*this.gridSpace,y*this.gridSpace));
		let placed=null;
		if(x>=0&&x<3&&y>=0&&y<3){
			placed=this.grid[x][y].tryPlace(correctedPos,val);
		}
		if(placed!==null){
			this.grid[x][y].checkLines();
			this.checkLines();
			let selected=this.grid[placed.x][placed.y];
			if(selected.value!==""){//the grid is filled so the next move can be anywhere
				selected=null;
			}
			for(let x=0;x<3;x++){
				for(let y=0;y<3;y++){
					let g=this.grid[x][y];
					g.setSelect(g.value===""&&(selected===null||selected===g));
					//g.setFocus(selected===null||selected===g);
				}
			}
		}
		return placed;
	}
	display(disp){
		let center=new Vector(0,0);
		center.addVec(new Vector(this.gridSpace+1.5,this.gridSpace+1.5));
		center.sclVec(20);

		for(let x=0;x<3;x++){
			for(let y=0;y<3;y++){
				this.grid[x][y].display(disp,this.value==="x"||this.value==="o");
			}
		}

		if(this.value==="x"){
			let sizeX=13*this.gridSpace;
			let sizeY=13*this.gridSpace;
			disp.ctxF.strokeStyle=overlayColor("#858585","7EBC20");
			disp.ctxF.lineWidth=11*this.gridSpace;
			disp.ctxF.lineCap = 'round';
			disp.start();
			disp.mt(center.x-sizeX,center.y-sizeY);
			disp.lt(center.x+sizeX,center.y+sizeY);
			disp.mt(center.x-sizeX,center.y+sizeY);
			disp.lt(center.x+sizeX,center.y-sizeY);
			disp.stroke();
		}else if(this.value==="o"){
			let sizeX=15*this.gridSpace;
			let sizeY=15*this.gridSpace;
			disp.ctxF.strokeStyle=overlayColor("#858585","AF1527");
			disp.ctxF.lineWidth=10*this.gridSpace;
			disp.ctxF.lineCap = 'round';
			disp.start();
			disp.ellipse(center.x,center.y,sizeX,sizeY);
			disp.stroke();
		}
	}
	checkLines(){
		if(this.value!==""){
			return;
		}
		for(let x=0;x<3;x++){
			let colLine=null;
			for(let y=0;y<3;y++){
				if(colLine===null){
					colLine=this.grid[x][y].value;
				}else if((colLine==="x" || colLine==="o")&&colLine!==this.grid[x][y].value){
					colLine="";
					break;
				}
			}
			if(colLine!==""){
				this.value=colLine;
				break;
			}
		}
		for(let y=0;y<3;y++){
			let rowLine=null;
			for(let x=0;x<3;x++){
				if(rowLine===null){
					rowLine=this.grid[x][y].value;
				}else if((rowLine==="x" || rowLine==="o")&&rowLine!==this.grid[x][y].value){
					rowLine="";
					break;
				}
			}
			if(rowLine!==""){
				this.value=rowLine;
				break;
			}
		}

		let diLine=null;
		for(let i=0;i<3;i++){
			if(diLine===null){
				diLine=this.grid[i][i].value;
			}else if((diLine==="x" || diLine==="o")&&diLine!==this.grid[i][i].value){
				diLine="";
				break;
			}
		}
		if(diLine!==""){
			this.value=diLine;
		}

		diLine=null;
		for(let i=0;i<3;i++){
			if(diLine===null){
				diLine=this.grid[i][2-i].value;
			}else if((diLine==="x" || diLine==="o")&&diLine!==this.grid[i][2-i].value){
				diLine="";
				break;
			}
		}
		if(diLine!==""){
			this.value=diLine;
		}
	}
}
class Grid{
	constructor(pos){
		this.selected=true;
		this.focused=false;
		this.value="";
		this.pos=new Vector(pos);
		this.grid=[];
		for(let x=0;x<3;x++){
			let col=[];
			this.grid.push(col);
			for(let y=0;y<3;y++){
				let tilePos=new Vector(x,y);
				tilePos.addVec(this.pos);
				col.push(new Tile(tilePos));
			}
		}
		this.checkLines();
	}
	outline(placePos){
		if(this.value!==""||!this.selected){
			return null;
		}
		let x=Math.floor(placePos.x);
		let y=Math.floor(placePos.y);
		if(x>=0&&x<3&&y>=0&&y<3){
			if(this.grid[x][y].canPlace(placePos)){
				this.grid[x][y].setMark(true);
				return new Vector(x,y);
			}
		}
		return null;
	}
	resetOutline(){
		for(let x=0;x<3;x++){
			for(let y=0;y<3;y++){
				this.grid[x][y].setMark(false);
			}
		}
	}
	tryPlace(placePos,val){
		if(this.value!==""||!this.selected){
			return null;
		}
		let x=Math.floor(placePos.x);
		let y=Math.floor(placePos.y);
		if(x>=0&&x<3&&y>=0&&y<3){
			if(this.grid[x][y].tryPlace(placePos,val)){
				return new Vector(x,y);
			}
		}
		return null;
	}
	setSelect(toSet){
		this.selected=toSet;
	}
	setFocus(toSet){
		this.focused=toSet;
	}
	checkLines(){
		if(this.value!==""){
			return;
		}
		for(let x=0;x<3;x++){
			let colLine=null;
			for(let y=0;y<3;y++){
				if(colLine===null){
					colLine=this.grid[x][y].value;
				}else if((colLine==="x" || colLine==="o")&&colLine!==this.grid[x][y].value){
					colLine="";
					break;
				}
			}
			if(colLine!==""){
				this.value=colLine;
				break;
			}
		}
		for(let y=0;y<3;y++){
			let rowLine=null;
			for(let x=0;x<3;x++){
				if(rowLine===null){
					rowLine=this.grid[x][y].value;
				}else if((rowLine==="x" || rowLine==="o")&&rowLine!==this.grid[x][y].value){
					rowLine="";
					break;
				}
			}
			if(rowLine!==""){
				this.value=rowLine;
				break;
			}
		}

		let diLine=null;
		for(let i=0;i<3;i++){
			if(diLine===null){
				diLine=this.grid[i][i].value;
			}else if((diLine==="x" || diLine==="o")&&diLine!==this.grid[i][i].value){
				diLine="";
				break;
			}
		}
		if(diLine!==""){
			this.value=diLine;
		}

		diLine=null;
		for(let i=0;i<3;i++){
			if(diLine===null){
				diLine=this.grid[i][2-i].value;
			}else if((diLine==="x" || diLine==="o")&&diLine!==this.grid[i][2-i].value){
				diLine="";
				break;
			}
		}
		if(diLine!==""){
			this.value=diLine;
		}
	}
	display(disp,isCovered){
		disp.reset();
		disp.alignCam();

		let center=new Vector(this.pos);
		center.addVec(new Vector(1.5,1.5));
		center.sclVec(20);
		let start=new Vector(this.pos);
		start.sclVec(20);
		let end=new Vector(this.pos);
		end.addVec(new Vector(3,3));
		end.sclVec(20);

		disp.ctxF.lineWidth=3.5;
		disp.ctxF.strokeStyle=overlayColor("#858585","353535");
		disp.start();
		disp.mt(this.pos.x*20,this.pos.y*20);
		disp.lt(this.pos.x*20+20*3,this.pos.y*20);
		disp.lt(this.pos.x*20+20*3,this.pos.y*20+20*3);
		disp.lt(this.pos.x*20,this.pos.y*20+20*3);
		disp.lt(this.pos.x*20,this.pos.y*20);
		disp.stroke();

		disp.ctxF.strokeStyle=overlayColor("#858585","353535");

		let inset=5;
		disp.ctxF.lineWidth=2.5;
		disp.start();
		for(let x=1;x<3;x++){
			disp.mt((this.pos.x+x)*20,this.pos.y*20+inset);
			disp.lt((this.pos.x+x)*20,this.pos.y*20+20*3-inset);
		}
		for(let y=1;y<3;y++){
			disp.mt(this.pos.x*20+inset,(this.pos.y+y)*20);
			disp.lt(this.pos.x*20+20*3-inset,(this.pos.y+y)*20);
		}
		disp.stroke();

		for(let x=0;x<3;x++){
			for(let y=0;y<3;y++){
				this.grid[x][y].display(disp,isCovered||this.value==="x"||this.value==="o");
			}
		}
		if(this.value==="x"){
			let sizeX=13;
			let sizeY=13;
			if(!isCovered){
				disp.ctxF.strokeStyle=overlayColor("#858585","7EBC20");
			}
			disp.ctxF.lineWidth=11;
			disp.ctxF.lineCap = 'round';
			disp.start();
			disp.mt(center.x-sizeX,center.y-sizeY);
			disp.lt(center.x+sizeX,center.y+sizeY);
			disp.mt(center.x-sizeX,center.y+sizeY);
			disp.lt(center.x+sizeX,center.y-sizeY);
			disp.stroke();
		}else if(this.value==="o"){
			let sizeX=15;
			let sizeY=15;
			if(!isCovered){
				disp.ctxF.strokeStyle=overlayColor("#858585","AF1527");
			}
			disp.ctxF.lineWidth=10;
			disp.ctxF.lineCap = 'round';
			disp.start();
			disp.ellipse(center.x,center.y,sizeX,sizeY);
			disp.stroke();
		}

		if(this.selected&&!isCovered){
			disp.ctxF.strokeStyle=overlayColor("#858585","656565");
			let offset=2*Math.sin(disp.timer/Math.PI/6)+2;
			disp.ctxF.lineWidth=3.5;
			disp.start();
			disp.mt(center.x-5,this.pos.y*20-offset);
			disp.lt(center.x,this.pos.y*20+5-offset);
			disp.lt(center.x+5,this.pos.y*20-offset);
			disp.stroke();
		}

		if(this.focused&&!isCovered){
			disp.ctxF.strokeStyle=overlayColor("#858585","656565");
			let length=4;
			disp.ctxF.lineWidth=3.5;
			disp.start();
			disp.mt(start.x,start.y+length);
			disp.lt(start.x,start.y);
			disp.lt(start.x+length,start.y);

			disp.mt(end.x,end.y-length);
			disp.lt(end.x,end.y);
			disp.lt(end.x-length,end.y);

			disp.mt(end.x,start.y+length);
			disp.lt(end.x,start.y);
			disp.lt(end.x-length,start.y);

			disp.mt(start.x,end.y-length);
			disp.lt(start.x,end.y);
			disp.lt(start.x+length,end.y);

			disp.stroke();
		}
	}
}
class Tile{
	constructor(pos){
		this.marked=false;
		this.value="";
		this.pos=new Vector(pos);
	}
	tryPlace(placePos,val){
		if(this.value!==""){
			return false;
		}
		this.value=val;
		return true;
	}
	canPlace(placePos){
		return this.value==="";
	}
	setMark(toSet){
		this.marked=toSet;
	}
	display(disp,isCovered){
		disp.ctxF.strokeStyle=overlayColor("#858585","353535");


		let center=new Vector(this.pos);
		center.addVec(new Vector(0.5,0.5));
		center.sclVec(20);
		if(this.value==="x"){
			let sizeX=4;
			let sizeY=5;
			if(!isCovered){
				disp.ctxF.strokeStyle=overlayColor("#858585","7EBC20");
			}
			disp.ctxF.lineWidth=5;
			disp.ctxF.lineCap = 'round';
			disp.start();
			disp.mt(center.x-sizeX,center.y-sizeY);
			disp.lt(center.x+sizeX,center.y+sizeY);
			disp.mt(center.x-sizeX,center.y+sizeY);
			disp.lt(center.x+sizeX,center.y-sizeY);
			disp.stroke();
		}else if(this.value==="o"){
			let sizeX=5;
			let sizeY=6;
			if(!isCovered){
				disp.ctxF.strokeStyle=overlayColor("#858585","AF1527");
			}
			disp.ctxF.lineWidth=4;
			disp.ctxF.lineCap = 'round';
			disp.start();
			disp.ellipse(center.x,center.y,sizeX,sizeY);
			disp.stroke();
		}else if(this.marked){
			let sizeX=2;
			if(!isCovered){
				disp.ctxF.strokeStyle=overlayColor("#858585","353535");
			}
			disp.ctxF.lineWidth=4;
			disp.ctxF.lineCap = 'round';
			disp.start();
			disp.mt(center.x-sizeX,center.y);
			disp.lt(center.x+sizeX,center.y);
			disp.stroke();
		}

	}
}