/**
Roma Revised Version .1
Created: 11/1/2012
Programmed By: Sebastian Rahtz and Nicholas Burlingame
*/

var VERSION = "0.1";
var defaultDatabase='http://bits.nsms.ox.ac.uk:8080/jenkins/job/TEIP5/lastSuccessfulBuild/artifact/release/xml/tei/odd/p5subset.json';


var AddedModules=[];
var Back = "";
var Current = "";
var ExcludedAttributes=[];
var ExcludedElements=[];
var ListofValues=[];
var TEI=[];
var author = "";
var currentModule = "";
var description = "";
var filename = "";
var givenXML = "";
var language = "";
var liveElements = 0;
var moduleCounter = 0;
var teiName = "";
var title = "";
var today=new Date();
var totElements = 0;
var url='';
var xml = "";

//SETS JSON OBJECT
function teijs(data) {
    TEI=data;
}

function cleanSystem() {
    AddedModules=[];
    Back = "";
    Current = "";
    ExcludedAttributes=[];
    ExcludedElements=[];
    TEI=[];
    author = "";
    currentModule = "";
    description = "";
    filename = "";
    givenXML = "";
    teiName = "";
    title = "";
    url='';
    xml = "";
}
//DISPLAYS INITIAL MODULES
function showmodules() {
	if(teiName != "" && teiName != "undefined"){
		localStorage.setItem(("tei%*$&#" + teiName), JSON.stringify(TEI, null, 2));
	}
    moduleCounter=TEI.modules.length;
    totElements = TEI.elements.length;
    var items = [];
    $.each(TEI.modules, function(i, module) {
	var mString ='<tr id="div' + module.ident + '"><td><button class="addModule" id="' + module.ident + 'A">Add</button><button class="removeModule" id="'+module.ident+'R">Remove</button></td>';
	if($.inArray(module.ident, AddedModules) != -1)
	{
	    mString += '<td><button class="modulelink" style="border:none; color:blue; cursor: pointer;">' + module.ident + '</button></td>' 
	}
	else
	{
	    mString += '<td class="unselected">' + module.ident + '</td>';
	}
	mString += '<td>' + module.desc + '</td></tr>';
	items.push(mString);
     });

    $('#moduleList').html(items.join(''));
    showPie();
}

function showPie () {
    liveElements=0;
    $.each(AddedModules, function(i, module){
	$.each(TEI.elements, function(i, element){
	    if (element.module == module) { liveElements +=1; }
	});
    });
    $("#moduleSummary").html('<p>' + TEI.modules.length + " modules available, of which " + AddedModules.length + " are in use, containing " + liveElements + " elements, of which " +  ExcludedElements.length + " are excluded</p>");
    $(".moduleSparkline").sparkline([(totElements-liveElements),(liveElements-ExcludedElements.length),ExcludedElements.length], {
	type: 'pie',
	width: '200',
	height: '200',
	sliceColors: ['#3366cc','#dc3912','#7f7f7f','#109618','#66aa00','#dd4477','#0099c6','#990099 '],
	borderColor: '#7f7f7f'});
}


//SHOWS ADDED OR SUBTRACTED MODULES
function showNewModules(){
	$('#selected').empty();
	var items = [];
	$.each(AddedModules, function(i, module){
		items.push('<li>' + AddedModules[i] + '</li>');
	});
	$('#selected').html($('<p/>', { html: "Modules Selected:" }));
	$('#selected').append($('<ul/>', {
		'class': 'selected',
		html: items.join('')
	}));
}

//DISPLAYS ELEMENTS
function showelements(name  )
{
	
    var items = [];
    $('#elements').html($('<h2/>', {html: "Elements in module " + name }));
    $.each(TEI.elements, function(i, element) {
        if (element.module == name) {
			currentModule = name;
            items.push('<tr><td><button class="addRemove" id="' + name + "," + element.ident + '">');
			if($.inArray((name + "," + element.ident), ExcludedElements) == -1){
				items.push("Exclude");
			}
			else{
				items.push("Include");
			}
			items.push('</button></td><td><button class="elementlink" style="border:none; color:blue; cursor: pointer;">' + element.ident + '</button></td><td>' + element.desc + '</td></tr>');
          }
        });
	
    $('#elements').append($('<table/>', {'class': 'elements',html:  items.join('') }));
}

function loadFile(xml){
	AddedModules = [];
	xmlDoc = $.parseXML(xml);
	$xml = $(xmlDoc);
	title = $xml.find("title").text();
	filename = $xml.find("schemaSpec").attr("ident");
	author = $xml.find("author").text();
	description = "Sorry, but descriptions do not currently work for loaded files";
	teiName = $xml.find("schemaSpec").attr("teiName");
	language = $xml.find("schemaSpec").attr("docLang");
	if(teiName == "undefined" || teiName == null){
		teiName = "";
	}
	$xml.find("moduleRef").each(function(i, item) {
		key = item.getAttribute('key');
		excepts = item.getAttribute('except');
		AddedModules.push(key);
		var individualExcepts = excepts.split(" ");
		$.each(individualExcepts, function(i, except){
			if(except != ""){
				ExcludedElements.push(key+","+except);
			}
		})
	})
	$xml.find("elementSpec").each(function(i, item){
		var module = item.getAttribute('module');
		var element = item.getAttribute('ident');
		$(this).find("attDef").each(function(i, test){
			var attribute = test.getAttribute('ident');
			ExcludedAttributes.push(module + "," + element + "," + attribute);
		})
	})
	
}


//DISPLAYS ATTRIBUTES
function showattributes(name ) {
	$('#attributes').show();
	$('#elements').hide();
	Back = "Elements";
	Current = "Attributes";
	var addableitems = [];
	var unaddableitems = [];
	var bigString = ""
	$('#attributes').html($('<h2/>', {html: "Attributes in element " + name }));
	$.each(TEI.elements, function(i, element){
		if(element.module == currentModule){
			if(element.ident == name){
				$.each(element.classattributes, function(i, classattribute){
					var classAttributeModule = classattribute.module;
					var classAttributeClass  = classattribute.class;
					$.each(TEI.attclasses, function(i, attclass){
						if(attclass.ident == classAttributeClass){
							$.each(attclass.attributes, function(i, attribute){
								if($.inArray(classAttributeModule, AddedModules) != -1){
									addableitems.push('<tr><td><button class="addRemoveAttribute" id="' + currentModule + "," + name + "," + attribute.ident + '">');
									if($.inArray((currentModule + "," + name + "," + attribute.ident), ExcludedAttributes) == -1){
										addableitems.push("Exclude");
									}
									else{
										addableitems.push("Include");
									}
									addableitems.push('</button></td><td>' + '<button class="attributelink" id="att,' + currentModule + "," + name + "," + attribute.ident + '" style="border:none; color:blue; cursor: pointer;">'+ attribute.ident + "</button></td><td>"  + attribute.desc + '</td></tr>');
								}
								else{
									unaddableitems.push('<tr><td><button disabled="disabled">Requires: ' + classAttributeModule + "</button></td><td>"+ attribute.ident + '</td><td> ' + attribute.desc + '</td></tr>');
								}
								
							})
						}
					});
					
				});
				
			}
		}
	});
	$('#attributes').append($('<table/>', {'class': 'attributes',html: addableitems.join('') + unaddableitems.join('')}));
}
function alterattributes(id){
	$("#attributes").hide();
	$("#actions").hide();
	$("#alterAttributes").show();
	$("#attributeIdent").text(id);
	$("#attAlterName").text("Attribute Name: " + id.split(',')[3]);
}

//READY FUNCTION. DISPLAYS MODULES
$(document).ready(function(){
	if(localStorage.getItem("tei%*$&#Default") === null){
		$.ajax({
		    url:  defaultDatabase,
		    dataType: 'jsonp',
		    jsonpCallback: 'teijs',
		    success: function(data) {
		   localStorage.setItem("tei%*$&#Default", JSON.stringify(data, null, 2));
		    }
		});
	}
	
	
	$('#actions').hide();
	$('#loadProjectTools').hide();
	$('#startInfo').hide();
	$('#teiSelection').hide();
	$('#upload').hide();
	$('#UploadCustom').hide();
	$('#UploadCustom').hide();
	$('#OnlineSelector').hide();
	$('#ExistingSelector').hide();
	$('#reportPage').hide();
	$('#alterAttributes').hide();
        cleanSystem();
	document.getElementById('colophon').innerHTML = "Byzantium " + VERSION + ". Written by Nick Burlingame. Date: " + today;
})


//Loads the TEI Object.
function loadTEI(){
   $('#message').html('<p>Loading source.....' + url + '</p>');
   $.ajax({
    url: url,
    dataType: 'jsonp',
       jsonpCallback: 'teijs',
       success: function(data) {
           $('#message').html('<p>Successfuly read ' + url)
       }
   });
   AddedModules.push("core");
   AddedModules.push("tei");
   AddedModules.push("header");
   AddedModules.push("textstructure");
   /**showNewModules();*/
   //doShowAll();
}


//Sets the XML to be outputted.
function setXML(){
	if(givenXML == ""){
		xml = '<?xml version="1.0"?><TEI xml:lang="en" xmlns="http://www.tei-c.org/ns/1.0"><teiHeader><fileDesc><titleStmt><title/><author/></titleStmt>'
		+ '<publicationStmt><p>for use by whoever wants it</p></publicationStmt><sourceDesc><p>created on ' + today + '</p></sourceDesc>'
		+ '</fileDesc></teiHeader><text><front><divGen type="toc"/></front><body><p>';
		if (description != ""){
			xml = xml + description;
		}
		else{
			xml = xml + "My TEI Customization starts with modules tei, core, textstructure and header";
		}
		xml = xml + '</p><schemaSpec xml:lang="en" prefix="tei_" docLang="en" ident=""></schemaSpec></body></text></TEI>';
	}
	else{
		xml = givenXML;
		xmlDoc = $.parseXML(xml);
		$xml = $(xmlDoc);
		$xml.find("moduleRef").remove();
		$xml.find("elementSpec").remove();
		$xml.find("title").empty();
		$xml.find("author").empty();
		out = new XMLSerializer().serializeToString(xmlDoc);
		xml = out;
	}
	
	xmlDoc = $.parseXML(xml);
	$xml = $(xmlDoc);
	$xml.find("title").append(title);
	$xml.find("author").append(author);
	$xml.find("schemaSpec").attr({ident: filename})
	if(teiName!=""){
		$xml.find("schemaSpec").attr({source: teiName});
	}
	if(language!=""){
		$xml.find("schemaSpec").attr({docLang: language});
	}
	
	$.each(AddedModules, function(i, name) {
	    var mr = document.createElementNS("http://www.tei-c.org/ns/1.0", 'moduleRef');
		var excludeString = "";
		var currentModule = name;
		$.each(ExcludedElements, function(j, element){
			if(element.split(',')[0] == currentModule){
				excludeString = excludeString + " " + element.split(',')[1];
			}
		})
		$xml.find("schemaSpec").append($(mr).attr({key: currentModule, except: excludeString}));
	})
	
	var excludes = [];
	$.each(ExcludedAttributes, function(i, attribute){
		if($.inArray(attribute.split(',')[0], AddedModules) != -1){
			if($.inArray((attribute.split(',')[0] + "," + attribute.split(',')[1]), ExcludedElements) == -1){
				excludes.push(attribute);
			}
		}
	})
	usedModules = [];
	usedElements = [];
	var finalAttributes = [];
	var attributeString = "";
	$.each(excludes, function(i, AttribElement){
		var currentModule = AttribElement.split(",")[0];
		$.each(excludes, function(j, AttribElement2){
			var currentElement = AttribElement2.split(',')[1];
			attributeString = currentModule + "," + currentElement;
			$.each(excludes, function(k, AttribElement3){
				if(currentModule == AttribElement3.split(',')[0]){
					if(currentElement == AttribElement3.split(',')[1]){
						attributeString = attributeString + "," + AttribElement3.split(',')[2];
					}
				}
			})
			if($.inArray(attributeString, usedElements) == -1){
				if(attributeString.split(',').length > 2 ){
					usedElements.push(attributeString);
				}
			}
			attributeString = "";
		})
	})
	//alert(usedElements);
	
	$.each(usedElements, function(i, item){
		var es = $.parseXML("<elementSpec/>").documentElement;
		var al = $.parseXML("<attList/>").documentElement;
		var change = "change";
		currentModule = item.split(",")[0];
		currentElement = item.split(",")[1];
		attributeArray = item.split(",");
		$xml.find("schemaSpec").append($(es).attr({ident: currentElement, module: currentModule, mode: change}));
		$xml.find("elementSpec[ident=" + currentElement + "][module=" + currentModule + "]").append($(al));
		$.each(attributeArray, function(j, item2){
			if(j < 2){
			}
			else{
				currentAttribute = item2;
				var ad = $.parseXML("<attDef/>").documentElement;
				$xml.find("elementSpec[ident=" + currentElement + "][module=" + currentModule + "]").children().append($(ad).attr({ident: currentAttribute, mode: "delete"}));
			}
		})
			
	})	
	var includedValue = [];
	
	$.each(ListofValues, function(i, value){
		if($.inArray(value.split(',')[1], AddedModules) != -1){
			if($.inArray((value.split(',')[1] + "," + value.split(',')[2]), ExcludedElements) == -1){
				if($.inArray((value.split(',')[1] + "," + value.split(',')[2] + ',' + value.split(',')[3]), ExcludedAttributes) == -1){
					excludes.push(value);
				}
			}
		}
	})
	
	$.each(ListofValues, function(i, value){
		var es = $.parseXML("<elementSpec/>").documentElement;
		var al = $.parseXML("<attList/>").documentElement;
		var change = "change";
		var module = value.split(",")[1];
		var element = value.split(",")[2];
		alert($xml.find("elementSpec[ident=" + element + "][module=" + module + "]"));
		var exclusions = $xml.find("elementSpec[ident=" + element + "][module=" + module + "]");
		//alert(value);
	})
	
	out = new XMLSerializer().serializeToString(xmlDoc);
	xml = out;
	//alert(xml);

}

//This function is used to show the name of all the projects that are saved to the browser.
 function doShowAll(){
   var key = "";
   var pairs = "<tr><th>Name</th></tr>\n";
   var i=0;
   for (i=0; i<=localStorage.length-1; i++) {
	 key = localStorage.key(i);
	 if(key.split("%*$&#")[0] != "proj"){
	 }
	 else{
		pairs += "<tr><td>"+key.split("%*$&#")[1]+"</td></tr>\n";
	 }
   }
   if (pairs == "<tr><th>Name</th><th>Value</th></tr>\n") {
	 pairs += "<tr><td><i>empty</i></td>\n<td><i>empty</i></td></tr>\n";
   }
   document.getElementById('pairs').innerHTML = pairs;
 }
 
  function doShowTEI(){
   var key = "";
   var pairs = "<tr><th>Name</th></tr>\n";
   var i=0;
   for (i=0; i<=localStorage.length-1; i++) {
	 key = localStorage.key(i);
	 if(key.split("%*$&#")[0] != "tei"){
	 }
	 else{
		pairs += "<tr><td>"+key.split("%*$&#")[1]+"</td></tr>\n";
	 }
   }
   if (pairs == "<tr><th>Name</th><th>Value</th></tr>\n") {
	 pairs += "<tr><td><i>empty</i></td>\n<td><i>empty</i></td></tr>\n";
   }
   document.getElementById('teipairs').innerHTML = pairs;
 }
 
 function loadDefaultTEI(){
 	if(localStorage.getItem("tei%*$&#Default") === null){
		$.ajax({
		    url: defaultDatabase,
		dataType: 'jsonp',
		jsonpCallback: 'teijs',
		success: function(data) {
		   localStorage.setItem("tei%*$&#Default", JSON.stringify(data, null, 2));
		}
		});
	}
	else{
		TEI = JSON.parse(localStorage.getItem("tei%*$&#Default"));
	}
 
 }
 
 
function checkFileSupport() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //  alert("Great success! All the File APIs are supported.");
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
}



     function handleFileSelect(evt) {
	 var files = evt.target.files; // FileList object

	 // files is a FileList of File objects. List some properties.
	 var output = [];
	 for (var i = 0, f; f = files[i]; i++) {
	     output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
			 f.size, ' bytes, last modified: ',
			 f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
			 '</li>');
	     var reader = new FileReader();
	     // Closure to capture the file information.
	     reader.onload = (function(theFile) {
		 return function(e) {
		     document.getElementById('inputarea').innerHTML=this.result;
		 };
	     })(f);
	     // Read in the image file as a data URL.
	     reader.readAsText(f);
	 }
	 document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
     }


 
 
//--------------------------------------------------------------------------------------------------------------
//------------------------------------------------BUTTON CLICKS HERE--------------------------------------------
//--------------------------------------------------------------------------------------------------------------


$(document).on("click","button.newProject", function(){
//	$('#projectSelection').hide();
//	$('#startInfo').show();
	//loadTEI();
	//showNewModules();
	//$('#actions').show();
    cleanSystem();
    $("#tabs").tabs("select", 1); 
});

$(document).on("click","button.saveStartInfo", function(){
	AddedModules.push("core");
	AddedModules.push("tei");
	AddedModules.push("header");
	AddedModules.push("textstructure");

	if($("#title").val() != ""){
		title = $("#title").val();
	}
	else{
		title = "My TEI Extension";
	}
	if($("#filename").val() != ""){
		filename = $("#filename").val();
	}
	else{
		filename = "myTEI"
	}
	if($("#author").val() != ""){
		author = $("#author").val();
	}
	else{
		author = 'generated by Byzantium ' + VERSION;
	}
	if($("#description").val() != ""){
		description = $("#description").val();
	}
	else{
		description = "My TEI Customization starts with modules tei, core, textstructure and header";
	}
	language = $("#languageSelect").val();
	$('#startInfo').hide();
	$('#teiSelection').show();
	$('#OnlineSelector').hide();
	$('#ExistingSelector').hide();
	$('#UploadCustom').hide();
	/*showmodules();
	showNewModules();
	$('#actions').show();*/
    $("#tabs").tabs("select", 2); 

});

$(document).on("click","button.TEI_Custom", function(){
	$('#UploadCustom').show();
	$("#ExistingSelector").hide();
	$("#OnlineSelector").hide();
    $("#tabs").tabs("select", 2); 
})

$(document).on("click","button.TEI_Default", function(){
	loadDefaultTEI()
	$('#message').html('<p>Default database loaded</p>')
	/**$("#UploadCustom").hide();
	$("#OnlineSelector").hide();
	$("#ExistingSelector").hide();
	$("#teiSelection").hide();*/
	showmodules();
	showNewModules();
	$("#actions").show();
    $("#tabs").tabs("select", 3); 
    //	$("#message").delay(1000).fadeOut();
	//$("#projectSelection").show();
});



$(document).on("click","button.TEI_Online", function(){
	$("#UploadCustom").hide();
	$("#OnlineSelector").show();
	$("#ExistingSelector").hide();

	
})
$(document).on("click","button.setOnline", function(){
	var TEIurl= $('#TEI_OnlineSelector').val();
	var name = $('#TEI_OnlineName').val();
	teiName = name;
	if((TEIurl != "") && (name != "")){
		$.when($.ajax({
		url: TEIurl,
		dataType: 'jsonp',
		jsonpCallback: 'teijs',
		success: function(data) {
		   localStorage.setItem("tei%*$&#"+name, JSON.stringify(data, null, 2));
		}
		})).done(function(){
			$("#teiSelection").hide();
			showmodules();
			showNewModules();
			$("#actions").show();
		});
	}
	$('#message').html('<p>' + teiName + ' database loaded</p>')
//	$("#message").delay(1000).fadeOut();
	//$("#projectSelection").show();
})

$(document).on("click","button.TEI_Existing", function(){
	$("#ExistingSelector").show();
	$("#OnlineSelector").hide();
	$("#UploadCustom").hide();
	doShowTEI();
})

$(document).on("click","button.setExisting", function(){
	var name = $('#loadTEI').val();
	teiName = name;
	if(localStorage.getItem("tei%*$&#" + name) == null){
		loadDefault();
	}
	else{
		var getTEI = localStorage.getItem("tei%*$&#" + name);
		TEI = JSON.parse(getTEI);
	}
	$("#teiSelection").hide();
	showmodules();
	showNewModules();
	$("#actions").show();
	$('#message').html('<p>' + teiName + ' database loaded</p>')
//	$("#message").delay(1000).fadeOut();
	//$("#projectSelection").show();
})



$(document).on("click","button.SubmitTEI", function(){
	showNewModules();
	if(TEI == []){
	}
	else{
		$('#teiSelection').hide();
		$('#actions').show();
		showmodules();
		showNewModules();
		
	}
});

$(document).on("click","button.loadProject", function(){
	$('#projectSelection').hide();
    url = defaultDatabase,
	loadTEI();
    $("#tabs").tabs("select", 2); 
	$('#modules').hide();
	$('#loadProjectTools').show();
	doShowAll();
});

//Used to save a project to the browser.
$(document).on("click","button.save", function(){
	var name = $("#saveAs").val(); 
	//alert(name);
	if(name == ''){
	}
	else{
		setXML();
		var data = xml;
		localStorage.setItem("proj%*$&#"+name, data);
		
	}
	doShowAll();
})

//Used to load a project from the browser.
$(document).on("click","button.load", function(){
	var name = $("#loadAs").val();
	if(name == ''){
	}
	else{
		var data = localStorage.getItem('proj%*$&#'+name);
		loadFile(data);
	}
	if(teiName != "undefined" && teiName != null){
		var L = localStorage.getItem("tei%*$&#" + teiName);
		if (L != null) {
			TEI = JSON.parse(L);
		}
		else{
			loadDefaultTEI();
		}
	}
	else{
		loadDefaultTEI();
	}
	showNewModules();
	showmodules();
	$('#modules').show();
	$('#actions').show();
	$('#loadProjectTools').hide();
    $("#tabs").tabs("select", 2); 
    
})

$(document).on("click","button.delete", function(){
	var name = $("#deleteProject").val();
	if(name == ''){
	}
	else{
		localStorage.removeItem("proj%*$&#" + name);
	}
	doShowAll();
})

$(document).on("click","button.output", function(){
	var value = $("#outputSelection").val();	
    switch (value)	
    {	
    case "TEI ODD":  	
  target="TEI%3Atext%3Axml/xml%3Aapplication%3Axml"; break;	
    case "RELAX NG Schema":  	
  target = "ODD%3Atext%3Axml/ODDC%3Atext%3Axml/relaxng%3Aapplication%3Axml-relaxng"; break;	
    case "ISO Schematron":  	
  target = "ODD%3Atext%3Axml/ODDC%3Atext%3Axml/isosch%3Atext%3Axml"; break;	
    case "Schematron":  	
  target = "ODD%3Atext%3Axml/ODDC%3Atext%3Axml/sch%3Atext%3Axml"; break;	
    case "DTD":  	
  target = 'ODD%3Atext%3Axml/ODDC%3Atext%3Axml/dtd%3Aapplication%3Axml-dtd'; break;
    case "HTML documentation":  	
  target = "ODD%3Atext%3Axml/ODDC%3Atext%3Axml/oddhtml%3Aapplication%3Axhtml%2Bxml"; break;
    case "JSON":  	
  target = "ODD%3Atext%3Axml/ODDC%3Atext%3Axml/oddjson%3Aapplication%3Ajson"; break;	
    }
    setXML();	
    var f = document.createElement('form');	
    f.id="outputFormMulti";
    f.action = "http://oxgarage.oucs.ox.ac.uk:8080/ege-webservice/Conversions/" + target + "/";
    f.method = "post";
    f.innerHTML = f.innerHTML + "<textarea name='input' style='display:none;'>default</textarea>";
	if(filename != ""){
		f.innerHTML = f.innerHTML + "<input name='filename' value='" + filename + "' style='display:none;'/>";
	}
	else{
		f.innerHTML = f.innerHTML + "<input name='filename' value='" + "myTEI" + "' style='display:none;'/>";
	}
    document.getElementsByTagName("body")[0].appendChild(f);
    document.getElementsByName("input")[0].value=xml;
    f.submit();
	$('#outputFormMulti').remove();
})



//CLICK BUTTON EVENT FOR ADDING/REMOVING ELEMENT
$(document).on("click","button.addRemove", function(){
	name = $(this).attr('id');
	action = $(this).html();
	if(action == "Exclude"){
		ExcludedElements.push(name);
		$(this).html("Include");
	}
	if(action == "Include"){
		ExcludedElements.splice($.inArray(name.substring(0, name.length - 1), ExcludedElements),1);
		$(this).html("Exclude");
	}
	
})


//CLICK BUTTON EVENT FOR ADDING/REMOVING ATTRIBUTE
$(document).on("click","button.addRemoveAttribute", function(){
	name = $(this).attr('id');
	//alert(name);
	action = $(this).html();
	if(action == "Exclude"){
		ExcludedAttributes.push(name);
		$(this).html("Include");
	}
	if(action == "Include"){
		ExcludedAttributes.splice($.inArray(name.substring(0, name.length - 1), ExcludedAttributes),1);
		$(this).html("Exclude");
	}
})

//CLICK BUTTON EVENT FOR VIEWING ELEMENTS
$(document).on("click","button.modulelink",function() {
//	$('#modules').hide();
//	$('#selected').hide();
//	$('#elements').show();
	Back = "Modules";
	Current = "Elements";
    showelements($(this).text() );
    $("#tabs").tabs("select", 4); 
        return false;
})


//CLICK BUTTON EVENT FOR VIEWING ATTRIBUTES
$(document).on("click","button.elementlink",function(){
    showattributes($(this).text() );
    $("#tabs").tabs("select", 5); 
    return false;
})

$(document).on("click","button.attributelink", function(){
	alterattributes($(this).attr("id"));
    $("#tabs").tabs("select", 6); 

		return false;
})

//CLICK BUTTON EVENT FOR ADDING MODULE
$(document).on("click","button.addModule",function() {
	name = $(this).attr('id');
	var exists = false;
	var index = $.inArray(name.substring(0, name.length - 1), AddedModules);
	if(index == -1){
		AddedModules.push(name.substring(0, name.length - 1));
	}
	showNewModules();
	showmodules();
})

//CLICK BUTTON EVENT FOR REMOVING MODULE
$(document).on("click","button.removeModule",function(){
	name = $(this).attr('id');
	var exists = false;
	if($.inArray(name.substring(0, name.length - 1), AddedModules) != -1){
		AddedModules.splice($.inArray(name.substring(0, name.length - 1), AddedModules),1);
	}
	showNewModules();
	showmodules();
})


//CLICK BUTTON EVENT FOR BACK
$(document).on("click","button.back", function(){
	if(Back == "Modules"){
		$('#modules').show();
		$('#selected').show();
	    showPie();
	}
	if(Back == "Elements"){
		$('#elements').show();
	}
	if(Current == "Elements"){
		$('#elements').hide();
		$('#attributes').hide();
	}
	if(Current == "Attributes"){
		$('#attributes').hide();
		Back = "Modules"
		Current = "Elements"
	}
})

$(document).on("click","button.uploadProject", function(){
	$('#projectSelection').hide();
	$('#upload').show();
})

$(document).on("click","button.continueToLoad", function(){
	var xmldata = $("#inputarea").val();
	xml = xmldata
	givenXML = xmldata
	loadFile(xmldata);
	if(teiName != "undefined" && teiName != null){
		var L = localStorage.getItem("tei%*$&#" + teiName);
		if (L != null) {
			TEI = JSON.parse(L);
		}
		else{
			loadDefaultTEI();
		}
	}
	else{
		loadDefaultTEI();
	}
	$('#upload').hide();
	$('#actions').show();
	showmodules();
	showNewModules();
})

$(document).on("click","button.loadCustomJSON", function(){
	//TEI = eval($('#JSONinputarea').val());
	eval($('#JSONinputarea').val());
	teiName = $("#JSONname").val();
	$('#teiSelection').hide();
	showmodules();
	showNewModules();
	$('#actions').show();
	$('#message').html('<p>' + teiName + ' database loaded</p>')
//	$("#message").delay(1000).fadeOut();
})

$(document).on("click","button.outputXML", function(){

})

$(document).on("click","button.returnToModules", function(){
	$('#reportPage').hide();
	$("#modules").show();
	$("#elements").hide();
	$("#attributes").hide();
	$("#actions").show();
	$("#selected").show();
	showmodules();
})

$(document).on("click","button.report", function(){
	$("#modules").hide();
	$("#elements").hide();
	$("#attributes").hide();
	$("#actions").hide();
	$("#selected").hide();
	$("#reportPage").show();
	if(filename != ""){
		$("#repFilename").text("Filename: " + filename);
	}
	if(title != ""){
		$("#repTitle").text("Title: " + title);
	}
	if(author != ""){
		$("#repAuthor").text("Author: " + author);
	}
	if(description != ""){
		$("#repDescription").text("Description: " + description);
	}
	if(language != ""){
		$("#repLanguage").text("Language: " + language);
	}
	if(AddedModules.length > 0){
		$("#repModulesTag").text("Modules Added:");
		
		var items = [];
		setXML();
		xmlDoc = $.parseXML(xml);
		$xml = $(xmlDoc);
		
		$xml.find("moduleRef").each(function(i, element) {
			module = element.getAttribute('key');
			items.push('<li>' + module + '</li>');
		});
		
		$('#repModules').append($('<ul/>', {
			'class': 'repModules',
			html: items.join('')
		}));
		

	}
	if(ExcludedElements.length > 0){
		$("#repElementsTag").text("Elements Excluded:");
		
		var items = [];
		setXML();
		xmlDoc = $.parseXML(xml);
		$xml = $(xmlDoc);
		
		$xml.find("moduleRef").each(function(i, element){
			var module = element.getAttribute('key');
			var elementList = element.getAttribute("except");
			var elementArray = elementList.split(" ");
			if(elementArray.length > 1){
				items.push('<dl><dt>Elements excluded in ' + module + ":</dt>");
				$.each(elementArray, function(i, singleElement) {
					if(singleElement != ""){
						items.push('<dd>- ' + singleElement + '</dd>');
					}
				})
				items.push('</dl>');
			}
		
		})
		$('#repElements').append($('<ul/>', {
			'class': 'repElements',
			html: items.join('')
		}));
		
	}
	if (ExcludedAttributes.length > 0){
		$("#repAttributesTag").text("Attributes Excluded:");
		var items = [];
		setXML();
		xmlDoc = $.parseXML(xml);
		$xml = $(xmlDoc);
		//alert(xml);
		$xml.find("elementSpec").each(function(i, layer){
			//alert("Got here");
			var module = layer.getAttribute('module');
			var element = layer.getAttribute('ident');
			items.push('<dl><dt>Attributes excluded in element: ' + element + ' in module: ' + module + '</dt>');
			$(this).find("attDef").each(function(i, attributeLayer){
				var attribute = attributeLayer.getAttribute("ident");
				items.push('<dd>- ' + attribute + '</dd>');
			})
			items.push('</dl>');
		})
		$('#repAttributes').append($('<ul/>', {
			'class': 'repAttributes',
			html: items.join('')
		}));
	}
	
	
})

$(document).on("click", "button.saveAttributeInfo", function(){
	if($("#listOfValues").val() != ""){
		index = -1;
		var values = $("#attributeIdent").text().replace(/;/g,",");
		values = values + "," + $("#listOfValues").val();
		$.each(ListofValues, function(i, listValue) {
			if(values.split(',')[1] == listValue.split(',')[1] && values.split(',')[2] == listValue.split(',')[2] && values.split(',')[3] == listValue.split(',')[3]){
				index = i;
			}
		})
		if(index != -1){
			ListofValues[index] = values;
		}
		else{
			ListofValues.push(values);
		}
	}
    /*	$("#alterAttributes").hide();
	$("#attributes").show();
	$("#actions").show();
    */
})

$(document).on("click","button.removeJSON", function(){
	var name = $("JSONtoremove").val();
	if(name == ''){
	}
	else{
		localStorage.removeItem("tei%*$&#" + name);
	}
	doShowTEI();
})
$(document).on("click", "button.restart", function(){
	$('#projectSelection').show();
	$('#actions').hide();
	$('#loadProjectTools').hide();
	$('#startInfo').hide();
	$('#teiSelection').hide();
	$('#upload').hide();
	$('#UploadCustom').hide();
	$('#UploadCustom').hide();
	$('#OnlineSelector').hide();
	$('#ExistingSelector').hide();
	$('#modules').empty();
	$('#modules').show();
	$('#elements').hide();
	$('#attributes').hide();
	$('#selected').empty();
	$('#selected').show();
	$("#reportPage").hide();
	$("#alterAttributes").hide();
    cleanSystem();
})

