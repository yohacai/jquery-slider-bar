{
                width  : "100%",    //滑动条宽度
                height : "100%",    //滑动条高度
                color  : "#ddd",    //滑动条背景
                track  : {
                    start     : 0.5,  //起始值0-1之间
                    preColor  : "#3FB8AF",  //已滑动的轨迹背景色
                    postColor : "#ddd"      //未滑动的轨迹背景色
                },
                thumb : {            //滑块的样式，可以自己添加任意css代码
                    'background'  : "#eee",   //滑块的颜色
                    'border' : "1px solid #aaa",   //滑块的边框
                    "box-shadow" : "0px 0px 5px #aaa",
                    "border-radius" : "100%",
                    "height"  :  "120%" ,     //只能使用百分数
                    "hover"   :{            //滑块悬停效果
                              "box-shadow":"0px 0px 10px #454590"
                               }
                }
}