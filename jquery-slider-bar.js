/*
Author : Yoha Cai
         中国科大软件研一小硕一枚
         24k纯汉纸
         yohacai@qq.com
Comment: 
         15年12月某天下午，yoha在实验室百无聊赖，数据挖掘看得头疼。
         于是乎灵光一现，要不做点好玩的吧。
         但是，实验室的电脑呵呵哒，你们懂的。那就做个jquery插件吧，记得之前做项目的时候有次
         需要用到音乐播放器插件，在网上翻了半天也没找到满意的，那就做个这个吧。
         但是，播放器做到1/3的时候，发现进度条和音量调节使用input type=range这个html自带的进度条
         效果很糟糕。唉，木有办法，再开发个进度条的插件吧。
*/
;(function($)
    {
        var sliderBar = function(options)
        {
            this.widget = 
            {
                "offsetWidth" : 0,
                "offsetHeight" : 0,
                thumb:
                {
                    "offsetHeight" : 0,
                    "offsetWidth" : 0,
                }
            }
            this.defaults = {
                width  : "100%",
                height : "100%",
                color  : "#ddd",
                track  : {
                    start     : 0.5,
                    preColor  : "#3FB8AF",
                    postColor : "#ddd"
                },
                thumb : {
                    'background'  : "#eee",
                    'border' : "1px solid #aaa",
                    "box-shadow" : "0px 0px 5px #aaa",
                    "border-radius" : "100%",
                    "height"  :  "120%" ,  //只能使用百分数
                    "hover"   :{
                              "box-shadow":"0px 0px 10px #454590"
                               }
                }

            };
            this.options = $.extend( {} , this.defaults , options );
        };


        var tools = {
            getFilePath : function(file) //获取文件相对路径
             {
                 var filePath = "";
                $script = $("script");
                for(var i=0;i< $script.length ; i++)
                {
                  var src = $($script[i]).attr('src');
                  src = src?src.replace(/\\/,'/'):"undefined";
                  var fileName = src.substring(src.lastIndexOf('/')+1,src.length);
                 if(fileName == file)
                 filePath = src.substring(0,src.lastIndexOf('/')+1);
                }
            return filePath;
            },
          fileQuote : function(fileName,tagName,path)  //在head内添加文件引用
            {
                $head = $("head");
                switch(tagName)
                {
                    case "script" :  $head.append("<script src="+path+fileName+"></script>"); break;
                    case "link"   :  $head.append("<link rel='stylesheet' href="+path+fileName+" />"); break;
                    default       :  $head.append("<"+tagName+"></"+tagName+">"); break;
                }
            }
        };

        var moveThumb = function($thumb,distance,speed)
        {
            var preLen = distance+$thumb[0].offsetWidth/2;
            var postLen = $thumb.parent()[0].offsetWidth-preLen;
            var maxPosition = $thumb.parent()[0].offsetWidth-$thumb[0].offsetWidth/2;
            $preTrack =  $thumb.prev().prev();
            $postTrack = $thumb.prev();
            $val = $thumb.next();
            if(speed==""||speed==undefined){
            $thumb.css("left",distance+"px");
            $preTrack.css("width",preLen+"px");
            $postTrack .css("width",postLen+"px");
            }
            else
            {
                $thumb.animate({"left":distance+"px"},speed);
                $preTrack.animate({"width":preLen+"px"},speed);
                $postTrack.animate({"width":postLen+"px"},speed);
            }
            $thumb.parent().parent().attr("value",(distance/maxPosition).toFixed(5));
            $val.html("");
            $val.html((distance/maxPosition).toFixed(5));
            $val.html("");
            //alert((distance/maxPosition).toFixed(5));
        };

        
        sliderBar.prototype.create = function($element)
        {
                var _this = this;
                var UI_Init = function($element)   //样式设置
                {
                preTrack_Width = _this.options.track.start*100+"%";  //已滑动的部分长度
                postTrack_Width = (1-_this.options.track.start)*100+"%"; //未滑动部分长度

                $element.css({"width":_this.options.width,"height":_this.options.height});              
                $element.children(".preTrack").css({"width":preTrack_Width,"background":_this.options.track.preColor});
                $element.children(".postTrack").css({"width":postTrack_Width,"background":_this.options.track.postColor});
               
                $element.children(".thumb").css(_this.options.thumb);
                
                thumb_Height = $element.parent()[0].offsetHeight*(parseInt(_this.options.thumb.height.split("%")[0])/100);   //计算滑块真实长度
                thumb_Left  = $element[0].offsetWidth*_this.options.track.start-thumb_Height/2+"px"; //计算滑块真实位置

                thumb_Top =  (thumb_Height-$element.parent()[0].offsetHeight)/2+"px";
                thumb_Width = thumb_Height + "px";
                $element.children(".thumb").css({"width":thumb_Width,"left":thumb_Left,"top":"-"+thumb_Top});
                }
                var Data_init = function($element)
                {
                    _this.widget.offsetWidth = $element[0].offsetWidth;
                    _this.widget.offsetHeight = $element[0].offsetHeight;
                    _this.widget.thumb.offsetWidth = $element.children(".thumb")[0].offsetWidth;
                    _this.widget.thumb.offsetHeight = $element.children(".thumb")[0].offsetHeight;
                }
                $barWraper = $("<div class='sliderBarWraper'></div>");
                $preTrack = $("<div class='preTrack'></div>");
                $postTrack = $("<div class='postTrack'></div>");
                $thumb = $("<div class='thumb'></div>");
                $val = $("<div class='sliderVal' style='display:none'></div>");
                $val.html(this.options.track.start);
                $barWraper.append($preTrack);
                $barWraper.append($postTrack);
                $barWraper.append($thumb);
                $barWraper.append($val);
                $element.append($barWraper);
                UI_Init($barWraper);
                Data_init($barWraper);
                return $barWraper;
        };
        sliderBar.prototype.bindListener = function($element)
        {
            var _this = this;
            $thumb = $element.children(".thumb");
            $preTrack = $element.children(".preTrack");
            $postTrack = $element.children(".postTrack");

            var thumbListener = function($thumb)
            {    //滑块事件监听集合
                var isDown = 0;
                var eX = 0;
                var lastX = 0;
                var flush = function()
                {
                    isDown = 0;
                    eX = 0;   
                }
                $thumb.hover(
                 function(){
                    $(this).css(_this.options.thumb.hover);
                           },
                 function(){
                $(this).css(_this.options.thumb)
                            });   //滑块的悬停监听，用户可以自行设置样式

            $thumb.mousedown(function(event){
                isDown = 1;
                eX = event.clientX;
            });
            $thumb.mouseup(function(event)
                {
                    flush();
                });
            $("html").mouseup(function(event)
                {
                    flush();
                });
            $("html").mousemove(function(event){
                if( isDown == 1 )
                {
                    var left = parseInt($thumb.css("left").split("px")[0]);
                    var maxPosition = $thumb.parent()[0].offsetWidth-$thumb[0].offsetWidth/2;
                    var minPosition = 0;
                    //console.log($thumb.parent().offset().left+$thumb.parent()[0].offsetWidth);
                    var wrapOffset = $thumb.parent().offset().left;
                    if((_this.widget.offsetWidth+wrapOffset+_this.widget.thumb.offsetWidth/2)>event.clientX&&event.clientX>wrapOffset)
                    {
                        if(left<=maxPosition&&left>=minPosition){
                        var distance = event.clientX - eX;
                        //console.log("left:"+left+"dis:"+distance);
                        if((left==maxPosition&&distance<0)||(left==0&&distance>0)||(left>0&&left<maxPosition))
                        {
                        moveDis = left+distance;
                        if(moveDis<=0)     //防止滑块越界
                            moveDis = 0;
                        if(moveDis>maxPosition)
                        	moveDis = maxPosition;
                        moveThumb($thumb,moveDis);
                        eX = event.clientX;
                        }
                       }
                    }
                    else if((_this.widget.offsetWidth+wrapOffset)<event.clientX)
                       {

                            moveThumb($thumb,maxPosition);
                       }
                    else if(event.clientX<wrapOffset)
                       {
                            moveThumb($thumb,minPosition);
                       }

                }
            });

           $preTrack.click(function(event){
                var left = parseInt($thumb.css("left").split("px")[0]);
                var wrapOffset = $element.offset().left;
                var position = event.clientX - wrapOffset-_this.widget.thumb.offsetWidth/2;
                moveThumb($thumb,position,80);
            });

           $postTrack.click(function(event){
                var left = parseInt($thumb.css("left").split("px")[0]);
                var wrapOffset = $element.offset().left;
                var position = event.clientX - wrapOffset-_this.widget.thumb.offsetWidth/2;
                moveThumb($thumb,position,80);
            });

            } //滑块事件监听集合
            thumbListener($thumb);
        };
        var init = function()
        {
            tools.fileQuote("style.css","link",tools.getFilePath("jquery-slider-bar.js"));
        }

        $.fn.sliderBar = function(options)
        {          
            init();
            var newSlider = new sliderBar(options);
            $wraper = newSlider.create(this);
            newSlider.bindListener($wraper);
        };
        $.fn.onchange = function(closure)
        {
            $(this).bind('DOMNodeInserted',closure);
        };
    })(jQuery);