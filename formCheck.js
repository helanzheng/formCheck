(function(root, factory){
	if(typeof define==='function' &&define.amd) {
    define(['jquery'], factory);
	} else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
	} else {
    root.returnExports = factory(root.jQuery);
	}
}(this, function ($) {
	return function(config,callback){
		var name=[config.check.length],isok=false;
		for(i=0;i<config.check.length;i++){
			name[i]=config.form.find('[fc-name="'+config.check[i].name+'"]');
			name[i].attr('fc-idx',i);
		}
		//邮箱格式
		function isEmail(str){
       var reg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
       return reg.test(str);
		}
		//域名格式
		function isdomain(str){
       var reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,}-{0,1}[a-zA-Z0-9\u4e00-\u9fa5]{1,}\.[a-zA-Z]{2,}$/;
       return reg.test(str);
		}
		//金额格式
		function isMoney(str){
       var reg = /^\d{1,}\.{0,1}\d{0,2}$/;
       return reg.test(str);
		}
		function strlen(str){
	    var len = 0;
	    for (var i=0; i<str.length; i++) { 
	     var c = str.charCodeAt(i); 
	    //单字节加1 
	     if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) { 
	       len++; 
	     } else { 
	      len+=2; 
	     } 
	    } 
	    return len;
		}
		function isNumKey(keyCode,point) {
	    // 数字
	    if (keyCode>=48&&keyCode<=57) return true;
	    // 小数字键盘
	    if (keyCode>=96&&keyCode<=105) return true;
	    // Backspace, del, 左右方向键
	    if ([8,46,37,39].indexOf(keyCode)>-1) return true;
	    //小数点
	    if ((keyCode==190||keyCode==110)&&point==true) return true
	    return false
		}
		function errText(val,typ,def){
			if(val){
				return val[typ]?val[typ]:def;
			}
			else return def;
		}
		//检查结果
		function checkresult(idx){
			var input=config.check[idx],val=name[idx].val();
			//检查为空
			if(!input.empty){
				if(val==''||val==input.InvalidVal) return errText(input.errText,'empty','内容不能为空');
			}
			//检查类型
			if(input.type){
				switch(input.type){
					case 'number':
						if(isNaN(val)) return errText(input.errText,'error','内容必须为数字');
						else if(input.number){
							if(input.number.range){
								if(!isNaN(input.number.range)){
									if(Number(val)<input.number.range) return errText(input.errText,'error','不能低于'+input.number.range);
								}else{
									if(Number(val)<input.number.range[0]||Number(val)>input.number.range[1]) return errText(input.errText,'error','必须在'+input.number.range[0]+'与'+input.number.range[1]+'之间');
								}
							}
						}
						break;
					case 'email':
						if(!isEmail(val)&&val!='') return errText(input.errText,'error','邮箱格式不正确');
						break;
					case 'domain':
						if(!isdomain(val)&&val!='') return errText(input.errText,'error','域名格式不正确');
						break;
					case 'custom':
						if(!input.custom.exp.test(val)) return input.custom.errText;
						break;
					case 'checkbox':
						if(!name[idx].is(':checked')) return errText(input.errText,'error','请勾选此项');
						break;
					case 'file':
						if(input.file.ext){
							var fileext=val.split('.');
							fileext=fileext[fileext.length-1];
							if(input.file.ext.indexOf(fileext)==-1)
							return errText(input.errText,'error','文件格式不正确');
						}
						break;
					case 'money':
						if(!isMoney(val)&&val!='') return errText(input.errText,'error','金额格式不正确');
						break;
				}
			}
			//检查长度
			if(input.len){
				if(!isNaN(input.len)){
					if(strlen(val)<input.len) return errText(input.errText,'len','长度不少于'+input.len+'位');
				}else{
					if((strlen(val)<input.len[0]||strlen(val)>input.len[1])&&val.length!=0) return errText(input.errText,'len','长度必须为'+input.len[0]+'-'+input.len[1]+'位');
				}
			}
			//检查内容是否一致
			if(input.sameto){
				if(val!=config.form.find('[fc-name="'+input.sameto+'"]').val()) return errText(input.errText,'notsame','两次输入内容不一致');
			}
			return false;
		}
		
		//输出结果
		function output(idx,text){
			var out=config.form.find('[fc-out="'+config.check[idx].name+'"]');
			var clapos=config.form.find('[fc-name="'+config.check[idx].name+'"]');
			var hide=config.form.find('[fc-hide="'+config.check[idx].name+'"]');
			var result=checkresult(idx);

			if(config.output)
				out=config.form.find('[fc-out="'+config.output+'"]');
			if(config.errClassPos=='parent')
				clapos=clapos.parent();

			if(text==''){
				clapos.removeClass('fc-error');
				out.css('display','none');
				hide.css('display','inline-block');
				if(out.find('span').length)
					out.find('span').text('');
				else
					out.text('');
			}else{
				clapos.addClass('fc-error');
				out.css('display','inline-block');
				hide.css('display','none');
				if(out.find('span').length)
					out.find('span').text(text);
				else
					out.text(text);
			}
		}
		//清除错误
		function clearerror(idx){
			var out=config.form.find('[fc-out="'+config.check[idx].name+'"]');
			var clapos=config.form.find('[fc-name="'+config.check[idx].name+'"]');
			var hide=config.form.find('[fc-hide="'+config.check[idx].name+'"]');
			if(config.output)
				out=config.form.find('[fc-out="'+config.output+'"]');
			if(config.errClassPos=='parent')
				clapos=clapos.parent();
			clapos.removeClass('fc-error');
			out.css('display','none');
			hide.css('display','inline-block');
		}
		//-----------
		//绑定事件
		(function(){
			function add($this){
				if(!$this.hasClass('fc-ignore')){
					var idx=parseInt($this.attr("fc-idx"));
					var result=checkresult(idx);
					if(result){
						output(idx,result);
					}else{
						output(idx,'');
					}
				}
			}
			function clear($this){
				var idx=parseInt($this.attr("fc-idx"));
				clearerror(idx);
			}
			for(i=0;i<config.check.length;i++){
				if(name[i].attr('type')=='file'){
					name[i].change(function(){
						add($(this));
					});
				}else{
					name[i].blur(function() {
						add($(this));
					}).focus(function(){
						clear($(this));
					});
					if(config.check[i].type=='number'){
						name[i].keydown(function(e){
							var point=true;
							if($(this).val().indexOf('.')>0) point=false;
							if(!isNumKey(e.keyCode,point)){
								return false;
							}
						});
						name[i].keyup(function(e){
							var idx=parseInt($(this).attr("fc-idx"));
							var mat=$(this).val().match(/^\.\d{0,}$/);
							if(mat) $(this).val('0'+mat);
							if(config.check[idx].number){
								if(config.check[idx].number.type=='money'){
									var mat=[$(this).val().match(/\d{1,}\.\d{2}\d{1,}/),$(this).val().match(/\d{1,}\.\d{2}/)];
									if(mat[0]) $(this).val(mat[1]);
								}
							}
						});
						name[i].blur(function(){
							$(this).val($(this).val().replace(/\.$/g,''));
						});
					}
				}
			}
		})();
		//提交操作
		function submitform(){
			for(var i=0;i<name.length;i++){
				if(name[i].hasClass('fc-ignore')) continue;
				var result=checkresult(i);
				if(result){
					output(i,result);
					isok=false;
					return false;
				}else{
					output(i,'');
					isok=true;
				}
			}
			if(isok){
				if(callback) callback();
				return true;
			}else{
				return false;
			}
			return false;
		}
		(function(){
			var realform=config.form.find('[fc-name]').eq(0).parents('form');
			if(config.form.find('[fc-name="submit"]').length==0){
				realform.eq(0).on('submit',submitform);
			}
			config.form.find('[fc-name="submit"]').click(function(){
				if(!$(this).hasClass('disabled')||!$(this).attr('disabled')){
					if(realform.length&&config.autosubmit==true) realform.eq(0).submit();
					else return submitform();
				}
			});
			if(config.entersubmit){
				config.form.find('input[type="text"]').on('keydown',function(e){
					if(e.keyCode==13){
						if(realform.length&&config.form.find('[fc-name="submit"]').length==0) realform.eq(0).submit();
						else return submitform();
					}
				});
			}
		})();
	}
}));