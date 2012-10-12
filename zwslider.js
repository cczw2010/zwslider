/**
* by awen
* cczw2010@gmail.com
* 2012-10-7
**/
(function($){
	$.zwslider={
		/**默认参数*/
		defaults:{
		iWidth:0,			/**每个幻灯的宽度,没有的话取容器的width*/
		iHeight:0,			/**每个幻灯的高度,没有的话取容器的height*/
		autoStart:true,		/**是否开启自动模式*/
		timeout:3000,    	/**自动动画间隔毫秒*/
		onPause:true,		/**鼠标在图片上时是否暂停*/
		canDrag:false,		/**是否开启拖动(支持ios,android)只支持垂直或者水平布局*/
		showBtn:true,		/**是否显示上一页下一页按钮*/
		prevBtn:'',			/**上一页标签的jquery选择器，没有的话就自己创建*/
		nextBtn:'',			/**下一页标签的jquery选择器，没有的话就自己创建*/
		prevClass:'',		/**程序创建的上一页标签的样式，如果指定了上一页id则该键值无效*/
		nextClass:'',		/**程序创建的下一页标签的样式，如果指定了上一页id则该键值无效*/
		//onImageStop : false ,
		curIdx:0,			/**开始的页码默认0*/
		switchMode:'hover', /**click,hover*/
		switchStyle:'fade',	/**动画类型 （fade,h,v 。。扩展中）*/
		switchEase:'swing', /**动画切换效果(swing(默认), linear)可通过ease插件来扩展*/
		switchSpeed:800,	/**动画速度,(毫秒数)*/
		//pannel
		showPannel:true,	/**是否显示面板*/
		showTitle:true,		/**是否显先标题*/
		showPages:true,		/**是否显示页码*/
		//自动生成的pannel面板的设定
		pannelClass:'',		/**面板用户自定义的样式名称*/
		pannelShowType:'none',	/**面板显示动画，none（默认）,slide滑动显示*/
		PagesClass:'',			/**页码用户自定义的的样式*/	
		PagesShowType:'circle',	/**页码的显示样式,num、square、circle(默认)*/

		//切换时的回调，自定制利器
		funcBeforeChange:null,	/*参数:idx,count*/
		funcAfterChange:null,	/*参数:idx,count*/
		//全局变量
		count:0				/*参数:title,url,idx,count*/
	    }
	}
	function zwslider(obj,options){
		/****************初始化参数****************/
		var m_options=$.extend({},$.zwslider.defaults,options);
		var m_obj=$(obj).css({'overflow':'hidden','position':'relative'});
		var skey=m_options.count;
		var m_timeout=m_options.timeout+m_options.switchSpeed;
		var m_pst=m_options.pannelShowType;
		var m_switch=m_options.switchStyle;
		var m_sliderid=$.zwslider.defaults.count;
		var m_curIdx=m_options.curIdx;
 		var m_prevIdx;
 		var m_pause=false;

		var m_ul=m_obj.children('ul');
		var m_lis=m_ul.children('li:visible');
		var m_links=m_lis.children('a');
		var m_imgs=m_links.children('img');
		var m_count=m_lis.length;
		var m_pageCount=0;
		var m_perPage=1;
 		var m_iwidth,m_iheight,m_width,m_height;
		var m_pannelH=30;
		this.m_pannel=null;
		this.m_pagePannel=null;
 		this.m_pages=[];
 		this.m_prevBtn=null;
 		this.m_nextBtn=null;
 		this.drag={
 			drag:false,
			baseP:0,
			startP:0,
			nowP:0
		};
 		var instance=this;

		var m_pli_on='zw_pli_on_'+skey,
				m_cname_i='zwi_'+skey,
				m_cname_ul='zwul_'+skey,
				m_cname_li='zwli_'+skey,
				m_cname_pul="zw_pul_"+skey,
				m_cname_pli="zw_pli_"+skey,
				m_cname_btn='zw_btn_def_'+skey;

		var m_ul_css="margin:0px;padding:0px;position:absolute;";
 		var m_li_css="margin:0px;padding:0px;display:inline-block;*display:inline;";
		switch(m_switch){
			case 'h':
				m_li_css+="float:left;";
 			break;
			case 'v':
				m_li_css+="float:left;";
				if (!-[1,]) {
					m_links.css('float','left');
				};
 			break;
 			case 'fade':
 			default:
 				m_li_css+="position:absolute;left:0px;top:0px;";
 				m_lis.slice(1).css('display','none');
			break;
		}
		
 		var m_i_css="."+m_cname_i+"{border:0px;}";
		addStyle("."+m_cname_ul+"{"+m_ul_css+"}",m_cname_ul);
		addStyle("."+m_cname_li+"{"+m_li_css+"}",m_cname_li);
		addStyle(m_i_css,m_cname_i);
		m_ul.addClass(m_cname_ul);
		m_lis.addClass(m_cname_li);
		m_imgs.addClass(m_cname_i);
 		/****************初始化界面****************/
 		init();
		//面板页码
		if (m_options.showPannel) {
			buildPannel();
		}
		//页码
		if (m_options.showPages) {
			buildPages();
		}
		//上一页  下一页
		if (m_options.showBtn) {
			buildBtn();
		}
		//拖动 
		if (m_options.canDrag&&(m_switch=='v'||m_switch=='h')) {
			bindDrag();
		};
		/****************私有成员函数***************/
		function init(){
			m_iwidth=m_options.iWidth?m_options.iWidth:m_obj.innerWidth();
 			m_iheight=m_options.iHeight?m_options.iHeight:m_obj.innerHeight();
 			m_width=m_obj.innerWidth();
 			m_height=m_obj.innerHeight();

			switch(m_switch){
				case 'h':
					m_perPage=m_width/m_iwidth;
					m_pageCount=Math.ceil(m_count/m_perPage);
					m_ul.css({'width':m_count*m_iwidth,'height':m_height});
	 			break;
				case 'v':
					m_perPage=(m_height*m_width)/(m_iheight*m_iwidth);
					m_pageCount=Math.ceil(m_count/m_perPage);
					m_ul.css({'width':m_width,'height':(m_count*m_iheight)});
	 			break;
	 			case 'fade':
	 			default:
					m_pageCount=m_count;
				break;
			}
 			m_lis.css({'width':m_iwidth,'height':m_iheight});
 			m_imgs.css({'width':m_iwidth,'height':m_iheight});
	 		//m_obj.css({'width':m_width+'px','height':m_height+'px'});
	 		if (instance.m_pannel!=null) {
	 			instance.m_pannel.css({'width':m_width,'top':(m_height-instance.m_pannel.innerHeight())});
	 		};
	 		if (instance.m_pagePannel!=null) {
	 			instance.m_pagePannel.css({'width':m_width,'top':(m_height-instance.m_pannel.innerHeight())});
	 		};
	 		var btntop=(m_height-50)/2;
	 		if (instance.m_prevBtn) {
	 			instance.m_prevBtn.css('top',btntop);
	 		};
	 		if (instance.m_nextBtn) {
	 			instance.m_nextBtn.css('top',btntop);
	 		};
	 		if (instance.scrollTo) {
	 			instance.scrollTo(m_curIdx);
	 		};
		}
		function switchAnimate(){
			if (m_options.funcBeforeChange!=null) {
				m_options.funcBeforeChange(m_curIdx,m_count);
			}
			if (m_pst=='slide'&&instance.m_pannel!=null) {
				instance.m_pannel.slideUp('normal',function(){
 					showTitle();
				});
			}else{
				showTitle();
			}
			var efunc=function(){};
			if (m_options.funcAfterChange!=null) {
				efunc=function(){
					m_options.funcAfterChange(m_curIdx,m_count);
				};
			}
 			switch(m_switch){
				case 'h':
					var left=0;
					if (m_pageCount<m_count&&m_curIdx==m_pageCount-1) {
						left=m_iwidth*m_count-m_width;
					}else{
						left=m_width*m_curIdx;
					}
 					m_ul.animate({'marginLeft':-left+'px'},m_options.switchSpeed,m_options.switchEase,efunc);
				break;
				case 'v':
					var top=0;
					if (m_pageCount<m_count&&m_curIdx==m_pageCount-1) {
						top=m_iheight;
					}else{
						top=m_height*m_curIdx;
					}
					m_ul.animate({'marginTop':-top+'px'},m_options.switchSpeed,m_options.switchEase,efunc);
	 			break;
	 			case 'fade':
	 			default:
					m_lis.eq(m_prevIdx).fadeOut('normal',m_options.switchEase,function(){
						m_lis.eq(m_curIdx).fadeIn(m_options.switchSpeed,m_options.switchEase,efunc);
					});
				break;
			}
			if (m_options.showPages) {
				instance.m_pages[m_prevIdx].removeClass(m_pli_on);
				instance.m_pages[m_curIdx].addClass(m_pli_on);
			}
			if (m_pst=='slide'&&instance.m_pannel!=null) {
				instance.m_pannel.slideDown();
			}
		}
		function showTitle(){
			if (instance.m_pannel!=null) {
				var titles="";
				var perP=Math.round(m_perPage);
 				for (var i = 0; i < perP; i++) {
					var idx=m_curIdx*perP+i;
					if (idx>=m_count) {
						break;
					}
					//这里不用m_imgs是为了防止该li不是图片
					titles+=m_lis.eq(idx).find('img').attr("alt")||"";
				};
				instance.m_pannel.html(titles);
			}
		}
		//title面板 
		//m_pst 显示方式normal，slide
		function buildPannel(){
			var pt=0;
			switch(m_pst){
				case 'none':
					pt=m_height-m_pannelH;
				break;
				case 'slide':
					pt=0;
				break;
			}
			var pclasscommon="zw_pannel";
			var pcommon="."+pclasscommon+"{position:absolute;background:#333;opacity:0.6;filter:alpha(opacity=60);text-align:center;color:#fff;}";
			var pclass="zw_p_"+m_width+"_"+m_pannelH+"_"+pt;
			var pcsst= "."+pclass+"{left:0px;top:"+pt+"px;width:"+m_width+"px;height:"+m_pannelH+"px;line-height:"+m_pannelH+"px;}";
			addStyle(pcommon,'.'+pclasscommon);
			addStyle(pcsst,'.'+pclass);
			instance.m_pannel=$("<div class='"+pclasscommon+" "+pclass+" "+m_options.pannelClass+"'></div>").appendTo(m_obj);
			if (instance.m_pannel) {
				showTitle();
			}
		}
		//上一页  下一页
		function buildBtn(){
			var btn_top=(m_height-50)/2;
			var m_btn_css="."+m_cname_btn+"{position:absolute;top:"+btn_top+"px;width:25px;height:50px;background:#333;font:30px Simsun;color:#ccc;line-height:50px;text-align:center;cursor:pointer;opacity:0.6;filter:alpha(opacity=60);}";
			addStyle(m_btn_css,m_cname_btn);
			var prevBtn=$(m_options.prevBtn);
			if (prevBtn.length==0) {
				prevBtn=$('<div><</div>').appendTo(m_obj);
				prevBtn.addClass(m_cname_btn+" "+m_options.prevClass)
				prevBtn.hover(
					function() {
						$(this).css({"opacity":'1',"color":'#fff'});
					},function() {
						$(this).css({"opacity":'0.6',"color":'#ccc'});
					});
			};
			var nextBtn=$(m_options.nextBtn);
			if (nextBtn.length==0) {
				nextBtn=$('<div>></div>').appendTo(m_obj);
				nextBtn.addClass(m_cname_btn+" "+m_options.nextClass)
				nextBtn.css('right',0);
				nextBtn.hover(
					function() {
						$(this).css({"opacity":'1',"color":'#fff'});
					},function() {
						$(this).css({"opacity":'0.6',"color":'#ccc'});
					});
			};
			prevBtn.bind('click',function(){
				instance.previous();
			});
			nextBtn.bind('click',function(){
				instance.next();
			});
			instance.m_prevBtn=prevBtn;
			instance.m_nextBtn=nextBtn;
		}
		//pages页码
		function buildPages(){
 			var pH=m_pannelH-10,pt=m_height-m_pannelH,ptype=m_options.PagesShowType;
			var m_ul_css= "."+m_cname_pul+"{position:absolute;margin:0px;padding:0px;top:"+pt+"px;width:"+m_width+"px;height:"+pH+"px;line-height:"+pH+"px;}";
			var m_li_css= "float:right;margin:5px;list-style-type:none;width:"+pH+"px;height:"+pH+"px;line-height:"+pH+"px;text-align:center;cursor:pointer;";
			var m_pon_css="";
			switch(ptype){
				case 'num':
					m_li_css+="background-color:#ccc;font-size:14px;color:#333;";
					m_pon_css="background-color:#f90;color:#fff;";
				break;
				case 'square':
					m_li_css+="font:20px Simsun;color:#ccc";
					m_pon_css="color:#f90;";
				break;
				case 'circle':
					m_li_css+="font-size:50px;color:#ccc";
					m_pon_css="color:#f90;";
				break;
			}
			addStyle(m_ul_css,m_cname_pul);
			addStyle("."+m_cname_pli+"{"+m_li_css+"}",m_cname_pli);
			addStyle("."+m_pli_on+"{"+m_pon_css+"}",m_pli_on);

			instance.m_pagePannel=$("<ul>").addClass(m_cname_pul);
			for (var i = m_pageCount-1; i >=0 ; i--) {
				var cname=i==m_curIdx?(m_cname_pli+" "+m_pli_on):m_cname_pli;
				var li=$("<li>").appendTo(instance.m_pagePannel).addClass(cname+" "+m_options.PagesClass).bind('click',i,function(e){
					instance.scrollTo(e.data);
				});
				switch(ptype){
					case 'num':
						li.html(i+1);
					break;
					case 'square':
						li.html('■');
					break;
					case 'circle':
						li.html('•');
					break;
				}
				instance.m_pages[i]=li;
			}
			instance.m_pagePannel.appendTo(m_obj);
		}
		/**拖动*/
		function bindDrag(){
			//初始化事件
			var	hasTouch 	= 'ontouchstart' in window,
				EV_MSTART 	= hasTouch ? 'touchstart' : 'mousedown',
				EV_MMOVE	= hasTouch ? 'touchmove' : 'mousemove',
				EV_MEND	 	= hasTouch ? 'touchend' : 'mouseup',
				EV_MOUT		= hasTouch ? 'touchend' : 'mouseout',
				EV_MCANCEL	= hasTouch ? 'touchcancel' : 'mouseup';
				EV_MCLICK	= 'click';
			m_ul.bind(EV_MSTART,function(event){
 		 		mstart(event);
 			});
 			m_ul.bind(EV_MMOVE,function(event){
				mmove(event);
			});
			m_ul.bind(EV_MOUT,function(event){
				mend(event);
			});
			$(document.body).bind(EV_MEND,function(event){
				mend(event);
			});
			function mstart(e){
				//console.log('start〉'+instance.drag.drag+">m_pause="+m_pause);
				if (!hasTouch) {
  					e.preventDefault();
				}
				m_pause=true;
				instance.drag.drag=false;
 				e=hasTouch?e.touches[0]:e;
 				switch(m_switch){
 					case 'h':
 						instance.drag.startP=e.clientX;
						instance.drag.baseP=parseInt(m_ul.css('marginLeft'))||0;
 					break;
 					case 'v':
						instance.drag.startP=e.clientY;
						instance.drag.baseP=parseInt(m_ul.css('marginTop'))||0;
 					break;
 				}
				
			}
			function mmove(e){
				//console.log('move〉'+instance.drag.drag+">m_pause="+m_pause);
				if (m_pause) {
					instance.drag.drag=true;
					e.preventDefault();
					e=hasTouch?e.changedTouches[0]:e;
					var nowP=0;
					switch(m_switch){
	 					case 'h':
	 						nowP=(instance.drag.baseP+(e.clientX)-instance.drag.startP);
		 					m_ul.css('marginLeft',nowP+"px");
	 					break;
	 					case 'v':
							nowP=(instance.drag.baseP+(e.clientY)-instance.drag.startP);
		 					m_ul.css('marginTop',nowP+"px");
	 					break;
	 				}
					instance.drag.nowP=nowP;
				}
			}
			function mend(e){
				//console.log('up〉'+instance.drag.drag+">m_pause="+m_pause);
				m_pause=false;
				if (instance.drag.drag) {
					e.preventDefault();
 					instance.drag.drag=false;
 					var idx=0;
					if (instance.drag.nowP<0) {
						switch(m_switch){
		 					case 'h':
		 						idx=-Math.round(instance.drag.nowP/m_width);
		 					break;
		 					case 'v':
								idx=-Math.round(instance.drag.nowP/m_height);
		 					break;
		 				}
					}
					instance.scrollTo(idx);
				};
			}
		}
		/**
		 *在web的style标签中增加css样式
		 *@param classText 			正常的css样式字符串
		 *@param checkcssselector   可选，是否检查存在相同样式的css样式选择器
		 */
		function addStyle(classText,checkcssselector) {
		    var styleNode = $("style#cczw");
		    if (styleNode.length<=0) {
		        styleNode = $("<style id='cczw'>");
		        $('head').prepend(styleNode);
		    }
		    if (classText) {
		    	var csst=styleNode[0].styleSheet?styleNode[0].styleSheet.cssText:styleNode.text();
		    	if (checkcssselector) {
		    		if (csst.indexOf(checkcssselector)>=0) {
		    			return;
		    		}
		    	}
		    	if(styleNode[0].styleSheet){// IE
			        styleNode[0].styleSheet.cssText += classText;
			    } else {// w3c
			        var cssText = document.createTextNode(classText);
			        styleNode[0].appendChild(cssText);
			    }
		    }
		} 
		/****************公共成员函数***************/
		//初始化参数
		this.init=function(){
			init();
		}
		this.start=function(){
			m_t=setInterval(function(){instance.next();},m_timeout);
		}
		this.stop=function(){
			clearInterval(m_t);
		}
		this.previous=function(){
			instance.scrollTo(m_curIdx-1);
		}
		this.next=function(){
			instance.scrollTo(m_curIdx+1);
		}
		this.scrollTo=function(pid){
			if (!m_ul.is(":animated")&&!m_lis.is(":animated")&&!m_pause) {
				m_prevIdx=m_curIdx;
				m_curIdx=pid;
				if (m_curIdx<0) {
					m_curIdx=m_pageCount-1;
				};
				if (m_curIdx>=m_pageCount) {
					m_curIdx=0;
				};
	 			switchAnimate();
	 		}
		}

		/****************绑定事件*******************/
		//鼠标悬停处理
		if (m_options.onPause&&m_options.autoStart) {
			m_lis.hover(
				function(){instance.stop();},
				function(){instance.start();});
		}
		//是否自动播放
		var m_t;
		if (m_options.autoStart) {
			instance.start();
		}
		/************更新计数器************/
		$.zwslider.defaults.count+=1;
	}
	$.fn.extend({
		/**
		*对应的html结构为   [div>ul>li>a>img]  
		*param json参数查看 $.zwslider.defaults;
		**/
		zwslider:function(options){
		 	return new zwslider(this,options);
		}
	});
})(jQuery);