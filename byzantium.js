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
    $('#modules').html($('<ul/>', {
	'class': 'modules',
	html: items.join('')
    }));
}


function showelements(name  )
{
    var items = [];
    $.each(TEI.elements, function(i, element) {
	if (element.module == name) {
	    items.push('<li><button class="elementlink" style="border:none; color:blue; cursor: pointer;">' + element.ident + '</button>' + element.desc + '</li>');
	  }
	});
    $('#elements').html($('<ul/>', {'class': 'elements',html: items.join('') }));
}

 $(document).ready(function(){ 
     $('#modules').html($('<p id="message">Loading TEI P5.....</p>', {}));
   $.ajax({
    url: url,
    dataType: 'jsonp',
    jsonpCallback: 'teijs'
   });

});
$(document).on("click","button.modulelink",function() {
    showelements($(this).text() );
        return false;
})

