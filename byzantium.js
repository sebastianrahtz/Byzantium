/**
Roma Revised Version .1
Created: 11/1/2012
Programmed By: Sebastian Rahtz and Nicholas Burlingame
*/

var url='';
var TEI=[];
var AddedModules=[];
var ExcludedElements=[];
var ExcludedAttributes=[];
var Back = ""
var Current = ""
var currentModule = ""
var xml = ""
var title = ""
var filename = ""
var author = ""
var description = ""
var givenXML = ""
var teiName = ""

//SETS JSON OBJECT
function teijs(data) {
    TEI=data;
    //showmodules();
}

//DISPLAYS INITIAL MODULES
function showmodules() {
	if(teiName != "" && teiName != "undefined"){
		localStorage.setItem(("tei%*$&#" + teiName), JSON.stringify(TEI, null, 2));
	}
    var items = [];
	var moduleCounter = 0;
    $.each(TEI.modules, function(i, module) {
            items.push('<li><button class="addModule" id="' + module.ident + 'A">Add</button><button class="removeModule" id="'+module.ident+'R">Remove<button class="modulelink" style="border:none; color:blue; cursor: pointer;">' + module.ident + '</button>' + module.desc + '</li>');
			moduleCounter += 1;
        });
    $('#modules').html($('<p/>', { html: "Found " + TEI.modules.length + " modules"}));

    $('#modules').append($('<ul/>', {
        'class': 'modules',
        html: items.join('')
    }));
}

//SHOWS ADDED OR SUBTRACTED MODULES
function showNewModules(){
	$('#selected').empty();
	var items = [];
	$.each(AddedModules, function(i, module){
		items.push('<li>' + AddedModules[i] + '</li>');
	});
	$('#selected').html($('<p/>', { html: "Items Selected:" }));
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
            items.push('<td><button class="addRemove" id="' + name + ":" + element.ident + '">');
			if($.inArray((name + ":" + element.ident), ExcludedElements) == -1){
				items.push("Exclude");
			}
			else{
				items.push("Include");
			}
			items.push('</button><button class="elementlink" style="border:none; color:blue; cursor: pointer;">' + element.ident + '</button>' + element.desc + '</td></tr>');
          }
        });
	
    $('#elements').append($('<table/>', {'class': 'elements',html: '<tr><td>Include/Exclude</td></tr>' + items.join('') }));
}

function loadFile(xml){
	AddedModules = [];
	//alert( xml);
	xmlDoc = $.parseXML(xml);
	$xml = $(xmlDoc);
	teiName = $xml.find("schemaSpec").attr("teiName");
	if(teiName == "undefined" || teiName == null){
		teiName = "";
	}
	$xml.find("moduleRef").each(function(i, item) {
		//alert(item.getAttribute('except'));
		//alert(item.getAttribute('key'));
		key = item.getAttribute('key');
		excepts = item.getAttribute('except');
		AddedModules.push(key);
		//ExcludedElements.push(key+":"+e);
		var individualExcepts = excepts.split(" ");
		$.each(individualExcepts, function(i, except){
			if(except != ""){
				ExcludedElements.push(key+":"+except);
			}
		})
	})
	$xml.find("elementSpec").each(function(i, item){
		var module = item.getAttribute('module');
		var element = item.getAttribute('ident');
		$(this).find("attDef").each(function(i, test){
			var attribute = test.getAttribute('ident');
			ExcludedAttributes.push(module + ";" + element + ";" + attribute);
		})
	})
	//alert(xml);
	//alert("Got here");
	//alert($xml.find("moduleRef").except());
	//$title = $xml.find("title");
	
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

					//alert("THIS MODULE: " + classAttributeModule);
					//alert("THIS CLASS: " + classAttributeClass);
					$.each(TEI.attclasses, function(i, attclass){
						//alert(attclass.ident);
						if(attclass.ident == classAttributeClass){
							$.each(attclass.attributes, function(i, attribute){
								if($.inArray(classAttributeModule, AddedModules) != -1){
									addableitems.push('<tr><td><button class="addRemoveAttribute" id="' + classAttributeModule + ";" + name + ";" + attribute.ident + '">');
									if($.inArray((classAttributeModule + ";" + name + ";" + attribute.ident), ExcludedAttributes) == -1){
										addableitems.push("Exclude");
									}
									else{
										addableitems.push("Include");
									}
									addableitems.push('</button>' + "  " + attribute.ident + "    "  + attribute.desc + '</td></tr>');
								}
								else{
									unaddableitems.push('<tr><td><button disabled="disabled">Requires Module: ' + classAttributeModule + "</button>"+ attribute.ident + '        ' + attribute.desc + '</td></tr>');
								}
								//alert(attribute.ident);
								
							})
						}
					});
					
				});
				
				/*$.each(TEI.attclasses, function(i, attclass){
					alert(attclass.ident);
					$.each(attclass.attributes, function(i, attribute){
						alert(attribute.ident);
					})
				})*/
				/*$.each(element.attributes, function(i, attribute){
					items.push('<td><button class="addRemoveAttribute" id="' + currentModule + ";" + name + ";" + attribute.ident + '">');
					if($.inArray((currentModule + ";" + name + ";" + attribute.ident), ExcludedAttributes) == -1){
						items.push("Exclude");
					}
					else{
						items.push("Include");
					}
					items.push('</button>' + "  " + attribute.ident + "    "  + attribute.desc + '</td></tr>');
				});*/
			}
		}
	});
	$('#attributes').append($('<table/>', {'class': 'attributes',html: '<tr><td>Include/Exclude</td></tr>' + addableitems.join('') + unaddableitems.join('')}));
}


//READY FUNCTION. DISPLAYS MODULES
$(document).ready(function(){
	if(localStorage.getItem("tei%*$&#Default") === null){
		$.ajax({
		url: 'http://users.ox.ac.uk/~rahtz/new.js',
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
	//$('#projectSelection').hide();
	$('#teiSelection').hide();
	$('#upload').hide();
	$('#UploadCustom').hide();
	$('#UploadCustom').hide();
	$('#OnlineSelector').hide();
	$('#ExistingSelector').hide();
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
		   $('#message').hide()
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
	var output = [];
	var attributesOutput = [];
	var items = [];
	xml = '<?xml version="1.0"?>' +
		'<TEI xml:lang="en" xmlns="http://www.tei-c.org/ns/1.0"><teiHeader><fileDesc><titleStmt><title>';
	if(title != ""){
		xml = xml + title;
	}
	else{
		xml = xml + "My TEI Extension";
	}
	xml = xml + '</title><author>';
	if(author != ""){
		xml = xml + author;
	}
	else{
		xml = xml + 'generated by Roma 4.9';
	}
	xml = xml + '</author></titleStmt><publicationStmt><p>for use by whoever wants it</p></publicationStmt><notesStmt><note type="ns">http://www.example.org/ns/nonTEI</note></notesStmt><sourceDesc><p>created on Sunday 30th September 2012 12:40:50 PM</p></sourceDesc></fileDesc></teiHeader><text><front><divGen type="toc"/></front><body><p>';
	if(description != ""){
		xml = xml + description;
	}
	else{
		xml = xml + "My TEI Customization starts with modules tei, core, textstructure and header";
	}
	xml = xml + '</p><schemaSpec xml:lang="en" prefix="tei_" docLang="en" ident="';
	if (filename != ""){
		xml = xml + filename;
	}
	else{
		xml = xml + 'myTEI';
	}
	xml = xml + '" ';
	if(teiName != ""){
		xml = xml + 'teiName="' + teiName + '"';
	}
	xml = xml + '>';
	$.each(AddedModules, function(i, name) {
		var currentModule = name;
		var currentElements = "";
		$.each(ExcludedElements, function(j, element){
			if(element.split(':')[0] == name){
				currentModule = currentModule + ':' + element.split(':')[1];
			}
		})
		$.each(ExcludedAttributes, function(k, attribute){
			if(attribute.split(';')[0] == name){
				if($.inArray((attribute.split(';')[0] + ":" + attribute.split(';')[1]), ExcludedElements) == -1){
					//currentElements = attribute.split(';')[0] + ';' + attribute.split(';')[1] + ';' + attribute.split(';')[2];
					attributesOutput.push(attribute);
				}
			}
		})
		output.push(currentModule);
	})
	$.each(output, function(i, module){
		var splitOutput = module.split(":");
		key = "";
		excludes = "";
		$.each(splitOutput, function(j, elements){
			if(j == 0){
				key = elements;
			}
			else{
				excludes = excludes + " "  + elements;
			}
		})
		xml = xml + '<moduleRef except="' + excludes + '" key="' + key + '"/>';
		items.push('<p>key="' + key + '" excludes="' + excludes + '"</p>');
	})
	usedModules = [];
	usedElements = [];
	var finalAttributes = [];
	var attributeString = "";
	$.each(attributesOutput, function(i, AttribElement){
		var currentModule = AttribElement.split(";")[0];
		$.each(attributesOutput, function(j, AttribElement2){
			var currentElement = AttribElement2.split(';')[1];
			attributeString = currentModule + ";" + currentElement;
			$.each(attributesOutput, function(k, AttribElement3){
				if(currentModule == AttribElement3.split(';')[0]){
					if(currentElement == AttribElement3.split(';')[1]){
						attributeString = attributeString + ";" + AttribElement3.split(';')[2];
					}
				}
			})
			if($.inArray(attributeString, usedElements) == -1){
				if(attributeString.split(';').length > 2 ){
					usedElements.push(attributeString);
				}
			}
			attributeString = "";
		})
	})
	$.each(usedElements, function(i, element){
		var module = "";
		var elementSpec = "";
		var attributeString = "";
		var currentElement = element.split(';');
		$.each(currentElement, function(i, element){
			if(i == 0){
				module = element;
			}
			else if(i == 1){
				elementSpec = element;
			}
			else{
				attributeString = attributeString + '<attDef ident="' + element + '" mode="delete"/>';
			}
		})
		xml = xml + '<elementSpec ident="' + elementSpec + '" mode="change" module="' + module.split(':')[0] + '"> <attList>' + attributeString + '</attList></elementSpec>'
	})
	xml = xml + '</schemaSpec></body></text></TEI>';
	
	
	if(givenXML != ""){
		//alert("TOTALLY GOT HERE GUYS!");
		xmlDoc = $.parseXML(givenXML);
		$xml = $(xmlDoc);
		//$xml.find("moduleRef")
		$xml.find("moduleRef").remove();
		$xml.find("elementSpec").remove();
		if(teiName != ""){
			$xml.find("schemaSpec").attr({teiName: teiName});
		}
		$.each(AddedModules, function(i, item){
			var mr = $.parseXML("<moduleRef/>").documentElement
			var currentModule = item;
			var exceptions = "";
			$.each(ExcludedElements, function(j, element){
				if(element.split(":")[0] == item){
					exceptions = exceptions + " " + element.split(":")[1]
				}
			})
			$xml.find("schemaSpec").append($(mr).attr({key: currentModule, except: exceptions}));
			//$xml.find("schemaSpec").append($(mr).attr({key: currentModule, except: exceptions}).append($(lvl)));
		})
		var es = $.parseXML("<elementSpec/>").documentElement;
		var al = $.parseXML("<attList/>").documentElement;
		$.each(usedElements, function(i, item){
			currentModule = item.split(";")[0];
			currentElement = item.split(";")[1];
			attributeArray = item.split(";");
			$xml.find("schemaSpec").append($(es).attr({ident: currentElement, module: currentModule, mode: "change"}).append($(al)));
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
		//alert(usedElements);
		out = new XMLSerializer().serializeToString(xmlDoc);
		xml = out;
	}
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
		url: 'http://users.ox.ac.uk/~rahtz/new.js',
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
 
 

 
 
//--------------------------------------------------------------------------------------------------------------
//------------------------------------------------BUTTON CLICKS HERE--------------------------------------------
//--------------------------------------------------------------------------------------------------------------


 $(document).on("click","button.newProject", function(){
	$('#projectSelection').hide();
	$('#startInfo').show();
	//loadTEI();
	//showNewModules();
	//$('#actions').show();
});

$(document).on("click","button.saveStartInfo", function(){
	AddedModules.push("core");
	AddedModules.push("tei");
	AddedModules.push("header");
	AddedModules.push("textstructure");
	title = $("#title").val();
	filename = $("#filename").val();
	author = $("#author").val();
	description = $("#description").val();
	$('#startInfo').hide();
	$('#teiSelection').show();
	$('#OnlineSelector').hide();
	$('#ExistingSelector').hide();
	$('#UploadCustom').hide();
	/*showmodules();
	showNewModules();
	$('#actions').show();*/

});

$(document).on("click","button.TEI_Custom", function(){
	$('#UploadCustom').show();
	$("#ExistingSelector").hide();
	$("#OnlineSelector").hide();
})

$(document).on("click","button.TEI_Default", function(){
	loadDefaultTEI()
	/**$("#UploadCustom").hide();
	$("#OnlineSelector").hide();
	$("#ExistingSelector").hide();*/
	$("#teiSelection").hide();
	showmodules();
	showNewModules();
	$("#actions").show();
	$('#message').html('<p>Default database loaded</p>')
	$("#message").delay(1000).fadeOut();
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
	$("#message").delay(1000).fadeOut();
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
	$("#message").delay(1000).fadeOut();
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
	url = 'http://users.ox.ac.uk/~rahtz/new.js';
	loadTEI();
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
		//alert(localStorage.getItem("tei%*$&#" + teiName));
		var L = localStorage.getItem("tei%*$&#" + teiName);
		//alert(L);
		if (L != null) {
			//alert("GOT HERE");
			TEI = JSON.parse(L);
		
		}
		else{
			loadDefaultTEI();
			//loadDefaultTEI();
		}
	}
	else{
		loadDefaultTEI();
	}
	//alert(TEI)
	showNewModules();
	showmodules();
	$('#modules').show();
	$('#actions').show();
	$('#loadProjectTools').hide();
	//doShowAll();
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
	if(value == "XML"){
		uri='http://oxgarage.oucs.ox.ac.uk:8080/ege-webservice/Conversions/TEI%3Atext%3Axml/xml%3Aapplication%3Axml/';
	}
	if(value == "RELAX NG Schema"){
		uri = 'http://oxgarage.oucs.ox.ac.uk:8080/ege-webservice/Conversions/ODD%3Atext%3Axml/ODDC%3Atext%3Axml/relaxng%3Aapplication%3Axml-relaxng/';
	}
	if(value == "ISO Schematron"){
		uri = 'http://oxgarage.oucs.ox.ac.uk:8080/ege-webservice/Conversions/ODD%3Atext%3Axml/ODDC%3Atext%3Axml/isosch%3Atext%3Axml/conversion?properties=<conversions><conversion index="0"></conversion><conversion index="1"></conversion></conversions>'
	}
	if(value == "Schematron"){
		uri = 'http://oxgarage.oucs.ox.ac.uk:8080/ege-webservice/Conversions/ODD%3Atext%3Axml/ODDC%3Atext%3Axml/sch%3Atext%3Axml/conversion?properties=<conversions><conversion index="0"></conversion><conversion index="1"></conversion></conversions>'
	}
	if(value == "DTD"){
		uri = 'http://oxgarage.oucs.ox.ac.uk:8080/ege-webservice/Conversions/ODD%3Atext%3Axml/ODDC%3Atext%3Axml/dtd%3Aapplication%3Axml-dtd/conversion?properties=<conversions><conversion index="0"></conversion><conversion index="1"><property id="oxgarage.getImages">true</property><property id="oxgarage.getOnlineImages">true</property><property id="oxgarage.lang">en</property><property id="oxgarage.textOnly">false</property><property id="pl.psnc.dl.ege.tei.profileNames">default</property></conversion></conversions>'
	}
	if(value == "JSON"){
		uri = "http://oxgarage.oucs.ox.ac.uk:8080/ege-webservice/Conversions/ODD%3Atext%3Axml/ODDC%3Atext%3Axml/oddjson%3Aapplication%3Ajson/"
	}
	setXML();
	var f = document.createElement('form');
	f.id="outputFormMulti";
    f.action = uri;
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
	$('#modules').hide();
	$('#selected').hide();
	$('#elements').show();
	Back = "Modules";
	Current = "Elements";
    showelements($(this).text() );
        return false;
})


//CLICK BUTTON EVENT FOR VIEWING ATTRIBUTES
$(document).on("click","button.elementlink",function(){
	showattributes($(this).text() );
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
})

//CLICK BUTTON EVENT FOR REMOVING MODULE
$(document).on("click","button.removeModule",function(){
	name = $(this).attr('id');
	var exists = false;
	if($.inArray(name.substring(0, name.length - 1), AddedModules) != -1){
		AddedModules.splice($.inArray(name.substring(0, name.length - 1), AddedModules),1);
	}
	showNewModules();
})


//CLICK BUTTON EVENT FOR BACK
$(document).on("click","button.back", function(){
	if(Back == "Modules"){
		$('#modules').show();
		$('#selected').show();
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
	//alert(givenXML);
	loadFile(xmldata);
	//alert(teiName);
	if(teiName != "undefined" && teiName != null){
		//alert(localStorage.getItem("tei%*$&#" + teiName));
		TEI = JSON.parse(localStorage.getItem("tei%*$&#" + teiName));
	}
	else{
		loadDefaultTEI();
	}
	//loadDefaultTEI();
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
	$("#message").delay(1000).fadeOut();
	//$('#projectSelection').show();
})

$(document).on("click","button.outputXML", function(){

})

$(document).on("click","button.removeJSON", function(){
	var name = $("#JSONtoremove").val();
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
	//$('#projectSelection').hide();
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
	url='';
	TEI=[];
	AddedModules=[];
	ExcludedElements=[];
	ExcludedAttributes=[];
	Back = ""
	Current = ""
	currentModule = ""
	xml = ""
	title = ""
	filename = ""
	author = ""
	description = ""
	givenXML = ""
	teiName = ""
})