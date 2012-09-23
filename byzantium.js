var url='http://tei.oucs.ox.ac.uk/test.js';
var url="http://localhost/Byzantium/p5subset.json";
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

$(document).ready(function(){ 
   $('#message').html('<p>Loading source.....</p>');
   $.ajax({
    url: url,
    dataType: 'jsonp',
    jsonpCallback: 'teijs'
   });
   $('#message').html('<p>Successfuly read ' + url);

});
$(document).on("click","button.modulelink",function() {
    showelements($(this).text() );
        return false;
})

