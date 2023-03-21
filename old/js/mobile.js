//--------------------------------------------
//MOBILE MENU (hack)
//--------------------------------------------

var nav=document.getElementsByTagName("HEADER")[0].getElementsByTagName("DIV")[1];
var navDown;
var isMobile=false;

window.addEventListener("resize", checkMobile);
checkMobile();

function checkMobile(){
	if(window.innerWidth<700){
		if(!isMobile){
			nav.classList.add("mobileNav");

			let navList=nav.getElementsByTagName("UL")[0];
			navList.innerHTML="<li class=\"toggleMenu\"><button class=\"xIcon\" onclick=\"toggleNav()\"></button></li>"+navList.innerHTML;

			closeNav();
			isMobile=true;
		}
	}else if(isMobile){
		openNav();
		nav.classList.remove("mobileNav");

		let navList=nav.getElementsByTagName("UL")[0];
		navList.innerHTML=navList.innerHTML.split("</button></li>")[1];
		isMobile=false;
	}
}

function toggleNav(){
	if(navDown){
		closeNav();
	}else{
		openNav();
	}
}
function closeNav(){
	let invis=nav.getElementsByTagName("LI");
	for(var i=0;i<invis.length;i++){
		if(invis[i].classList.contains("toggleMenu")){
			invis[i].getElementsByTagName("BUTTON")[0].classList.remove("xIcon");
			invis[i].getElementsByTagName("BUTTON")[0].classList.add("menuIcon");
		}else{
			invis[i].classList.add("hidden");
		}
	}
	navDown=false;
}
function openNav(){
	let invis=nav.getElementsByTagName("LI");
	for(var i=0;i<invis.length;i++){
		if(invis[i].classList.contains("toggleMenu")){
			invis[i].getElementsByTagName("BUTTON")[0].classList.remove("menuIcon");
			invis[i].getElementsByTagName("BUTTON")[0].classList.add("xIcon");
		}else{
			invis[i].classList.remove("hidden");
		}
	}
	navDown=true;
}