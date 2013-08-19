$(function () {
    $('.notices').tooltip()
    $('#navbarExample').scrollspy()
})

// prototype和jQuery的冲突，接下来使用jQuery代替$
jQuery.noConflict();

// 根据radio的选择加载checkbox
function checkRadio() {
    var chkObjs = document.getElementsByName("channel");
    var indexRow = document.getElementById("seriesIndex");
    var authorRow = document.getElementById("guideAuthor");
    indexRow.innerHTML = "";
    authorRow.innerHTML = "";
    for (var i = 0; i < chkObjs.length; i++) {
        if (chkObjs[i].checked) {
            if (chkObjs[i].value == "PROFESSIONAL") {
                indexRow.innerHTML = document.getElementById("seriesIndexTemplate").innerHTML;
                authorRow.innerHTML = document.getElementById("guideAuthorTemplate").innerHTML;
            }
        }
    }
}

// 加载页面的时候自动检查，目的：进入修改页面时显示已勾选
window.onload = checkRadio;

// 根据惠内容详情生成内容概述
function generateSummary() {
    var detail = jQuery('#textarea_detail').val();
    var params = "detail=" + encodeURIComponent(detail);
    new Ajax.Request("/admin/hui_content/generate_summary", {
        method: 'post',
        parameters: params,
        onSuccess: function(transport) {
            var result = transport.responseJSON;
            if (result.status == "succ") {
                jQuery('#textarea_summary').val(result.summary);
            } else {
                alert(result.message);
            }
        }
    });
}

// 选择信息详情的模板
function chooseTemplate(templateName) {
    var tem = document.getElementById(templateName).innerHTML;
    jQuery('#textarea_detail').val(tem);
}
// 选择信息详情的模板块
function chooseTemplatePart(partName) {
    var tem = document.getElementById(partName).innerHTML;
    var detail = jQuery('#textarea_detail').val() + tem;
    jQuery('#textarea_detail').val(detail);
}
// 选择信息概要的模板
function chooseSummaryTemplate(templateName) {
    var tem = document.getElementById(templateName).innerHTML;
    jQuery('#textarea_summary').val(tem);
}

// 提交表单之前检查作者或推荐人和概述是否填写
function checkInput() {
    if (document.getElementById('submitter').value.trim() == "") {
        var chkObjs = document.getElementsByName("channel");
        var flag = 0;
        for (var i = 0; i < chkObjs.length; i++) {
            if (chkObjs[i].checked) {
                if (chkObjs[i].value == "WEEKLY" || chkObjs[i].value == "PRICE") {
                    flag = 1;
                }
                break;
            }
        }
        if (flag == 0) {
            alert("请输入作者或推荐人");
            return false;
        }
    }
    if (jQuery('#textarea_summary').val().trim() == "") {
        alert("请输入信息概述");
        return false;
    }

    //检查作者userEmail
    if (jQuery('#isValidAuthor').attr('value') == 'false') {
        alert('请输入正确的作者信息');      
        return false;
    }
    return true;
}

// 设置默认过期时间
function setExpiredTime() {
    var expiredTime = document.getElementById('expiredTime').value;
    document.getElementById('endTimeInput').value = expiredTime;
}

// 检查该userEmail的作者信息是否已存在
function checkAuthor(userEmail) {
    if (userEmail == '') {
        return;
    }
    var params = "userEmail=" + userEmail;
    jQuery('#isAuthorExist').html("");
    new Ajax.Request("/admin/guide_author/isAuthorExist", {
        method: 'get',
        parameters: params,
        onSuccess: function(transport) {
            var result = transport.responseJSON;
            if (result.status != "succ") {
                jQuery('#isAuthorExist').html(userEmail + "的作者信息不存在！<a href='/admin/guide_author/add' target='_blank'>请添加</a>");
                jQuery('#isValidAuthor').attr('value', 'false');
            } else {
                jQuery('#isValidAuthor').attr('value', 'true');
            }
        }
    });
}

// 根据userEmail查询作者昵称
function searchNickName() {
    var email = jQuery('#email').val();
    if (email == '') {
        return;
    }
    jQuery('#emailAlert').html("");
    var params = "email=" + email;
    new Ajax.Request("/admin/userinfo/search_user_by_email", {
        method: 'get',
        parameters: params,
        onSuccess: function(transport) {
            var result = transport.responseJSON;
            var emailAlert = "";
            var submitter = "";
            if (result.status == "succ") {
                if (result.userPic == "") {
                    emailAlert = "无头像";
                }
                if (result.nickName == "") {
                    emailAlert += "无昵称，请手动填写！";
                    submitter = "";
                } else {
                    submitter = result.nickName;
                }
            } else {
                emailAlert = "不存在该用户";
            }
            jQuery('#emailAlert').html(emailAlert);
            jQuery('#submitter').val(submitter);
        }
    });
}

// 社区分享类型，输入“目标URL”后查询
function checkFeed() {
    jQuery('#feedAlert').html('');
    var channelRadio = jQuery('input:radio[name="channel"]:checked').val();
    if (channelRadio != "FEED") {
        return;
    }
    var targetUrl = jQuery('#targetUrl').val();
    if (targetUrl == '') {
        jQuery('#feedAlert').html('请输入社区分享的链接');
        return;
    }
    var params = "targetUrl=" + targetUrl;
    new Ajax.Request("/admin/hui_deliver/check_feed_id", {
        method: 'get',
        parameters: params,
        onSuccess: function(transport) {
            var result = transport.responseJSON;
            jQuery('#feedAlert').html(result.message);
        }
    });
}

//转换器，createHtml生成返现链接，HighlightContent高亮文本、overstrikingContent加粗文本等
function createHtml() {
    var name = document.getElementById("link_name").value;
    var link = document.getElementById("link_link").value;
    var html = "<a href=\"" + link + "\" target=\"_blank\">" + name + "</a>";
    var htmlCode = document.getElementById("link_html");
    htmlCode.value = html;
    
    var encodedLink = encodeURIComponent(link);
    var targetLink = "/proxy?purl=" + encodedLink + "&sid=179";
    var html = "<a href=\"" + targetLink + "\" target=\"_blank\">" + name + "</a>";
    var htmlCpscode = document.getElementById("link_html2");
    htmlCpscode.value = html;
    
    var encodedLink1 = encodeURIComponent(link);
    var targetLink1 = "/proxy?purl=" + encodedLink1 + "&sid=179";
    var htmlCpslink = document.getElementById("link_html3");
    htmlCpslink.value = targetLink1;
}
    
function HighlightContent () {
  var content = document.getElementById('link_name').value;
  var code = "<span style = \"color:#bb0200\">" + content + "</span>";
  var ct_output = document.getElementById('link_html');
  ct_output.value = code;
  document.getElementById('link_html2').value = "";
  document.getElementById('link_html3').value = ""; 
}
    
function overstrikingContent () {
  var content = document.getElementById('link_name').value;
  var code = "<b>" + content + "</b>";
  var ct_output = document.getElementById('link_html');
  ct_output.value = code;
  document.getElementById('link_html2').value = "";
  document.getElementById('link_html3').value = "";  
}

/*<input type="button" class="btn" id="bth_bgImg" value="换背景图" onclick="changeBgImg();"/>          
function changeBgImg () {
    var imgData = document.getElementById('link_link').value;
    var imgUrl = "url(" + imgData + ")";
    document.getElementsByTagName('body')[0].style.backgroundImage = imgUrl;
}*/

//提取商品所在电商的域名
function getDomain () {
  var productLink = document.getElementById('targetUrl').value;  
  if(productLink.indexOf("gome") < 0) {
    var domain = productLink.split( ".")[1] + "." + productLink.split( ".")[2].split( "/")[0];
    document.getElementsByName("merchantDomain")[0].value = domain;
  } else {
    var domain = productLink.split( ".")[1] + "." + productLink.split( ".")[2] + "." + productLink.split( ".")[3].split( "/")[0];
    document.getElementsByName("merchantDomain")[0].value = domain;
  }
}

//限制主标题的字数，以免超出范围
function limit(obj, limit) {
    var val = obj.value;
    if (len(val) > limit) {
        val=val.substring(0,limit);
        while (len(val) > limit){
            val = val.substring(0, val.length - 1);
        };
        obj.value = val;
    } 
} 
function len(s) {
    s = String(s);
    return s.length + (s.match(/[^\x00-\xff]/g) || "").length;
}

//自动调整信息详情和信息概述的文本框高度
function setHeight(obj) {
  obj.style.height = obj.scrollHeight + "px";
}

function resetSize(obj) {
  obj.style.height = "250px";
  obj.style.width = "600px";
}

