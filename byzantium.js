var url='http://tei.oucs.ox.ac.uk/test.js';
//var url="http://localhost/Byzantium/p5subset.json";
//var url="http://bits.nsms.ox.ac.uk:8080/jenkins/job/TEIP5/lastSuccessfulBuild/artifact/release/xml/tei/odd/p5subset.json";
var TEI=[];

function teijs(data) {
    TEI=data;
    showmodules();
}

function showmodules() {
    var items = [];
    $.each(TEI.modules, function(i, module) {
	    items.push('<li><button class="modulelink" style="border:none; color:blue; cursor: pointer;">' + module.ident + '</button>' + module.desc + '</li>');
	});
    $('#modules').html($('<p/>', { html: "Found " + TEI.modules.length + " modules"}));

    $('#modules').append($('<ul/>', {
	'class': 'modules',
	html: items.join('')
    }));
}


function showelements(name  )
{
    var items = [];
    $('#elements').html($('<h2/>', {html: "Elements in module " + name }));
    $.each(TEI.elements, function(i, element) {
	if (element.module == name) {
	    items.push('<li><button class="elementlink" style="border:none; color:blue; cursor: pointer;">' + element.ident + '</button>' + element.desc + '</li>');
	  }
	});
    $('#elements').append($('<ul/>', {'class': 'elements',html: items.join('') }));
}

function showattributes(name  )
{
    var items = [];
    $('#attributes').html($('<h2/>', {html: "Attributes in element " + name }));
    $.each(TEI.elements, function(i, element) {
	if (element.ident == name) {
	    $.each(element.attributes, function(i, att) {
	    items.push('<li><button class="attributelink" style="border:none; color:blue; cursor: pointer;">' + att.ident + '</button>' + att.desc + '</li>');
	    }
		  )}});
    $('#attributes').append($('<ul/>', {'class': 'elements',html: items.join('') }));
}

$(document).ready(function(){ 
   $('#message').html('<p>Loading source.....' + url + '</p>');
   $.ajax({
    url: url,
    dataType: 'jsonp',
       jsonpCallback: 'teijs',
       success: function(data) {
	   $('#message').html('<p>Successfuly read ' + url)
       }
   });

});
$(document).on("click","button.modulelink",function() {
    showelements($(this).text() );
        return false;
})
$(document).on("click","button.elementlink",function() {
    showattributes($(this).text() );
        return false;
})

