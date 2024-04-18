class AudioManager{
	constructor(book,chapter){
		this.book=book;
		this.chapter=chapter;
		this.chapterOrigin=chapter;
		this.audio=new SoundManager();
	}
	selectBook(book){
		this.pause();
		player.close(false);
		this.book.lock();
		for(let k in this.book){
			if(isBound(this.book[k])){
				if(Array.isArray(this.book[k])){
					this.book[k].lock();
					this.book[k].splice(0,this.book[k].length,...book[k]);
					this.book[k].unlock();
				}else if(this.book[k]!=null){
					this.book[k].data=book[k].data;
				}else{
					this.book[k]=book[k];
				}
			}
		}
		this.book.unlock(false);
		this.book.update();
		let chapOpts=this.book.chapters.filter(x=>x.selected!=null);
		this.selectChapter(chapOpts.find(c=>c.selected?.data??false)??chapOpts[0]);
	}
	selectChapter(chapter){
		let sel=this.book.chapters.find(c=>c.selected?.data??false);
		if(sel!=null){
			sel.selected.data=false;
		}
		chapter.selected.data=true;
		this.chapterOrigin=chapter;

		this.chapter.lock();
		for(let k in this.chapter){
			if(isBound(this.chapter[k])){
				if(Array.isArray(this.chapter[k])){
					if(!Array.isArray(chapter[k])){
						continue;
					}
					this.chapter[k].lock();
					this.chapter[k].splice(0,this.chapter[k].length,...chapter[k]);
					this.chapter[k].unlock();
				}else if(this.chapter[k]!=null){
					if(chapter[k]==null){
						continue;
					}
					this.chapter[k].data=chapter[k].data;
				}else{
					this.chapter[k]=chapter[k];
				}
			}
		}
		this.chapter.unlock(false);
		this.chapter.update();
		this.audio.setAudio(
			this.book.src.data+"/"+this.chapter.src.data
		);
	}
	play(){
		this.audio.play();
		player.play();
	}
	pause(){
		this.audio.pause();
		player.pause();
	}
	next(){
		let chapOpts=this.book.chapters.filter(x=>x.selected!=null);
		let chapI=chapOpts.findIndex(c=>c.selected.data);
		if(chapI==-1){
			return false;
		}
		chapI++;
		if(chapI<chapOpts.length){
			this.selectChapter(chapOpts[chapI]);
			return true;
		}
		return false;
	}
	prev(){
		let chapOpts=this.book.chapters.filter(x=>x.selected!=null);
		let chapI=chapOpts.findIndex(c=>c.selected.data);
		if(chapI==-1){
			return false;
		}
		chapI--;
		if(chapI>=0){
			this.selectChapter(chapOpts[chapI]);
			return true;
		}
		return false;
	}
	setTime(v,updateAudio=true){
		this.chapter.time.data=v;
		this.chapterOrigin.time.data=v;
		if(updateAudio){
			this.audio.setTime(v);
		}
	}
	updateTime(){
		this.audio.setTime(this.chapter.time.data);
	}
	setTimeMax(v){
		this.chapter.timeMax.data=v;
	}
	setVolume(v){
		this.audio.setVolume(v);
		player.setVolume(v);
	}
}

class SoundManager{
	constructor(){
		this.volumeBase=1;
		this.volume=1;
		this.muted=false;
		this.playing=false;
		this.loading=true;

		this.audioPlayer=document.createElement("audio");
		this.audioPlayer.addEventListener("ended",()=>{
			if(this.playing){
				if(!audio.next()){
					audio.pause();
				}else{
					audio.setTime(0);
				}
			}
		});

		this.anim=animate(
			()=>{
				if(!this.loading){
					audio.setTime(this.audioPlayer.currentTime/this.audioPlayer.duration,false);
				}
			},
			1,
			true
		);
		this.audioPlayer.addEventListener('canplay',()=>{
			if(this.loading){
				this.loading=false;
				audio.setTimeMax(this.audioPlayer.duration);
				audio.updateTime();
				if(this.playing){
					this.play();
				}else{
					this.pause();
				}
			}
		});
	}
	loopEnd(){
		if(this.audioPlayer.currentTime+1>=this.audioPlayer.duration){
			audio.setTime(0);
		}
	}
	play(){
		this.playing=true;
		if(!this.loading){
			this.loopEnd();
			this.audioPlayer.play();
		}
		this.anim.start();
	}
	pause(){
		this.playing=false;
		if(!this.loading){
			this.audioPlayer.pause();
		}
		this.anim.stop();
	}
	setAudio(src){
		this.loading=true;
		this.audioPlayer.setAttribute("src",src);
		this.audioPlayer.volume=this.volume;
		this.audioPlayer.pause();
	}
	setTime(t){
		if(!this.loading){
			this.audioPlayer.currentTime=t*this.audioPlayer.duration;
		}
	}
	setVolume(vol){
		this.volumeBase=vol;
		if(!this.muted){
			this.volume=vol;
			this.audioPlayer.volume=vol;
		}
	}
	mute(){
		this.muted=true;

		this.volume=0;
		this.audioPlayer.volume=this.volume;
	}
	unmute(){
		this.muted=false;

		this.volume=this.volumeBase;
		this.audioPlayer.volume=this.volume;
	}
}