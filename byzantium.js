/**
Roma Revised Version
Created: 11/1/2012
Programmed By: Sebastian Rahtz and Nicholas Burlingame
*/

var VERSION = "0.2";
var defaultDatabase='http://bits.nsms.ox.ac.uk:8080/jenkins/job/TEIP5/lastSuccessfulBuild/artifact/release/xml/tei/odd/p5subset.js';
var today=new Date();


var AddedModules = [];
var Back = "";
var Current = "";
var ExcludedAttributes=[];
var ExcludedElements=[];
var ListofValues=[];
var closedAndOpen = [];
var TEI=[];
var author = "";
var currentModule = "";
var description = "";
var filename = "";
var givenXML = "";
var language = "";
var method = "except";
var liveElements = 0;
var moduleCounter = 0;
var teiName = "";
var title = "";
var totElements = 0;
var url='';
var xml = "";

//SETS JSON OBJECT
function teijs(data) {
    TEI=data;
}

function cleanSystem() {
    AddedModules = [];
    Back = "";
    Current = "";
    ExcludedAttributes=[];
    ExcludedElements=[];
    author = "";
    currentModule = "";
    description = "TEI customization made on " + today;
    filename = "myTEI";
    givenXML = "";
    teiName = "";
    title = "My view of the TEI";
    url='';
    xml = "";
}
//DISPLAYS INITIAL MODULES
function showmodules() {
    if(teiName != "" && teiName != "undefined"){
	localStorage.setItem(("tei%*$&#" + teiName), JSON.stringify(TEI, null, 2));
    }
    if (TEI.modules === undefined ) {
	//alert("NO DATABASE LOADED");
    }
    else
    {
    moduleCounter=TEI.modules.length;
    totElements = TEI.elements.length;
    var items = [];
    $.each(TEI.modules, function(i, module) {
	var mString ='<tr id="div' + module.ident + '">';
	if($.inArray(module.ident, AddedModules) != -1)
	{
	    mString += '<td><span class="button removeModule" id="'+module.ident+'R">Remove</span></td>';
	    mString += '<td><span class="button modulelink" >' + module.ident + '</span></td>' ;
	}
	else
	{
            mString += '<td><span class="button addModule" id="' + module.ident + 'A">Add</span></td>';
	    mString += '<td class="unselected">' + module.ident + '</td>';
	}
	mString += '<td>' + module.desc + '</td></tr>';
	items.push(mString);
     });

    $('#moduleList').html(items.join(''));
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
	sliceColors: ['#dc3912','#3366cc','#7f7f7f','#109618','#66aa00','#dd4477','#0099c6','#990099 '],
	borderColor: '#7f7f7f'});
    }
}


//SHOWS ADDED OR SUBTRACTED MODULES
function showNewModules(){
	$('#selected').empty();
	var items = [];
	$.each(AddedModules, function(i, module){
		items.push('<li>' + AddedModules[i] + '</li>');
	});
/*	$('#selected').html($('<p/>', { html: "Modules Selected:" }));
	$('#selected').append($('<ul/>', {
		'class': 'selected',
		html: items.join('')
	}));*/
}

//DISPLAYS ELEMENTS
function showelements(name  )
{	
	var totalElements = 0;
	var usedElements = 0;
    var items = [];
    $('#elements').html($('<h2/>', {html: "Elements in module " + name }));
    $.each(TEI.elements, function(i, element) {
        if (element.module == name) {
			totalElements += 1;
			currentModule = name;
            items.push('<tr class="filetable"><td><span class="button addRemove" id="' + name + "," + element.ident + '">');
			if($.inArray((name + "," + element.ident), ExcludedElements) == -1){
				items.push("Included");
				usedElements+=1;
			}
			else{
				items.push("Excluded");
			}
			items.push('</span></td><td><span class="button elementlink">' + element.ident + '</span></td><td>' + element.desc + '</td></tr>');
          }
        });
	
    $('#elements').append('<div id="sparkline" style="float:right" border="1"><span class="elementSparkline"></span><ul><li>Red: Unsed elements</li><li>Blue: Used elements</li></ul></div>');
    $('#elements').append($('<table/>', {'class': 'elements',html:  items.join('') }));
	$(".elementSparkline").sparkline([(totalElements-usedElements),usedElements], {
	type: 'pie',
	width: '200',
	height: '200',
	sliceColors: ['#dc3912','#3366cc','#7f7f7f','#109618','#66aa00','#dd4477','#0099c6','#990099 '],
	borderColor: '#7f7f7f'});
}

function loadFile(xml){
	AddedModules = [];
	xmlDoc = $.parseXML(xml);
	$xml = $(xmlDoc);
	title = $xml.find("title").text();
	filename = $xml.find("schemaSpec").attr("ident");
	author = $xml.find("author").text();
	description = "Sorry, but descriptions do not currently work for loaded files";
	teiName = $xml.find("schemaSpec").attr("source");
	language = $xml.find("schemaSpec").attr("docLang");
        $('#title').val(title);
        $('#description').val(description);
        $('#author').val(author);
        $('#languageSelect').val(language);
        $('#methodSelect').val(method);
        $('#filename').val(filename);
	if(teiName == "undefined" || teiName == null){
		teiName = "";
	}
	$xml.find("moduleRef").each(function(i, item) {
		key = item.getAttribute('key');
		AddedModules.push(key);
		excepts = item.getAttribute('except');
	    if (excepts != null) {
		var individualExcepts = excepts.split(" ");
		$.each(individualExcepts, function(i, except){
			if(except != ""){
				ExcludedElements.push(key+","+except);
			}
		})
		    }
	})
	$xml.find("elementSpec").each(function(i, item){
		var module = item.getAttribute('module');
		var element = item.getAttribute('ident');
		$(this).find('attDef[mode="delete"]').each(function(i, test){
			var attribute = test.getAttribute('ident');
			ExcludedAttributes.push(module + "," + element + "," + attribute);
		})
		$(this).find('attDef[mode="change"]').each(function(i, test){
			var attribute = test.getAttribute('ident');
			var data = "att," + module + "," + element + "," + attribute;
			var openClose = "att," + module + "," + element + "," + attribute;
			$(test).find('valList').each(function(i, test2){
				openClose = test2.getAttribute('type') + "," + openClose;
				$(test2).find("valItem").each(function(i, test3){
					data = data + "," + test3.getAttribute("ident");
				})
			})
			closedAndOpen.push(openClose);
			ListofValues.push(data);
		})
	})	
	    }


//DISPLAYS ATTRIBUTES
function showattributes(name ) {
	Back = "Elements";
	Current = "Attributes";
	var addableitems = [];
	var unaddableitems = [];
	var bigString = ""
	var totalAttributes = 0;
	var usedAttributes = 0;
	var excludedAttributes = 0;
	var unavailableAttributes = 0;
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
								totalAttributes+=1;
								if($.inArray(classAttributeModule, AddedModules) != -1){
									addableitems.push('<tr><td><span class="button addRemoveAttribute" id="' + currentModule + "," + name + "," + attribute.ident + '">');
									if($.inArray((currentModule + "," + name + "," + attribute.ident), ExcludedAttributes) == -1){
										addableitems.push("Included");
										usedAttributes += 1;
									}
									else{
										addableitems.push("Excluded");
										excludedAttributes += 1;
									}
									addableitems.push('</span></td><td>' + '<span class="button attributelink" id="att,' + currentModule + "," + name + "," + attribute.ident + '" >'+ attribute.ident + "</span></td><td>"  + attribute.desc + '</td></tr>');
								}
								else{
									unaddableitems.push('<tr><td><button disabled="disabled">Requires: ' + classAttributeModule + "</span></td><td>"+ attribute.ident + '</td><td> ' + attribute.desc + '</td></tr>');
									unavailableAttributes +=1;
								}
								
							})
						}
					});
					
				});
				
			}
		}
	});
	$('#attributes').append('<div id="sparkline" style="float:right" border="1"><span class="attributeSparkline"></span><ul><li>Red: Unused attributes</li><li>Blue: Used attributes</li><li>Gray: Unavailable Attributes</li></ul></div>');
	$('#attributes').append($('<table/>', {'class': 'attributes',html: addableitems.join('') + unaddableitems.join('')}));
	$(".attributeSparkline").sparkline([excludedAttributes,usedAttributes,unavailableAttributes], {
	type: 'pie',
	width: '200',
	height: '200',
	sliceColors: ['#dc3912','#3366cc','#7f7f7f','#109618','#66aa00','#dd4477','#0099c6','#990099 '],
	borderColor: '#7f7f7f'});
}
function alterattributes(id){
	$("#attributeIdent").text(id);
	$("#attAlterName").text("Attribute Name: " + id.split(',')[3]);
	$(".closedOrOpen").html("Open List");
	$.each(closedAndOpen, function(i, closeOpen){
		if(closeOpen.split(',')[2] + closeOpen.split(',')[3] + closeOpen.split(',')[4] == id.split(',')[1] + id.split(',')[2] + id.split(',')[3]){
			if(closeOpen.split(',')[0] == 'closed'){
				$(".closedOrOpen").html("Closed List");
			}
			if(closeOpen.split(',')[0] == 'open'){
				$(".closedOrOpen").html("Open List");
			}
		}
	})
	$("#listOfValues").val("");
	$.each(ListofValues, function(i, value){
		if(value.split(',')[1] + value.split(',')[2] + value.split(',')[3] == id.split(',')[1] + id.split(',')[2] + id.split(',')[3]){
			var values = value.split(',')[4];
			var valueList = value.split(',');
			$.each(valueList, function(i, value){
				if(i > (valueList.length-6)){
				}
				else{
					values = values + ',' + valueList[i+5];
				}
			})
			$("#listOfValues").val(values);
		}
	})
}

//READY FUNCTION. 
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
        cleanSystem();
    doShowAll();
    $('#defaultDatabase').html(defaultDatabase);
    $('#colophon').html("Byzantium " + VERSION + ". Written by Nick Burlingame. Date: " + today);
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
}


//Sets the XML to be outputted.
function setXML(){
	//alert(ListofValues);
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
		var includeString = "";
		var currentModule = name;
	        $.each(TEI.elements, function(i, element) {
		    if (element.module == currentModule && $.inArray((currentModule + "," + element.ident), ExcludedElements) == -1) {
			includeString += " " + element.ident;
		    }
		})
		$.each(ExcludedElements, function(j, element){
			if(element.split(',')[0] == currentModule){
			    excludeString += " " + element.split(',')[1];
			}
		})
		    if (excludeString == '') 
			{
			    $xml.find("schemaSpec").append($(mr).attr({key: currentModule}));
			}
			else 
			{
			    if (method == 'include') {
				$xml.find("schemaSpec").append($(mr).attr({key: currentModule, include: includeString}));
			    }
			    else
			    {
				$xml.find("schemaSpec").append($(mr).attr({key: currentModule, except: excludeString}));
			    }
			}
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
		var es = document.createElementNS("http://www.tei-c.org/ns/1.0", 'elementSpec');
		var al = document.createElementNS("http://www.tei-c.org/ns/1.0", 'attList');
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
				var ad = document.createElementNS("http://www.tei-c.org/ns/1.0", 'attDef');
				$xml.find("elementSpec[ident=" + currentElement + "][module=" + currentModule + "]").children().append($(ad).attr({ident: currentAttribute, mode: "delete"}));
			}
		})
		out = new XMLSerializer().serializeToString(xmlDoc);
		xml = out;			
	})	
	var includedValue = [];
	
	$.each(ListofValues, function(i, value){
		if($.inArray(value.split(',')[1], AddedModules) != -1){
			if($.inArray((value.split(',')[1] + "," + value.split(',')[2]), ExcludedElements) == -1){
				if($.inArray((value.split(',')[1] + "," + value.split(',')[2] + ',' + value.split(',')[3]), ExcludedAttributes) == -1){
					includedValue.push(value);
				}
			}
		}
	})
	var beenHereBefore = 0;
	$.each(ListofValues, function(i, value){
		var es = $.parseXML("<elementSpec/>").documentElement;
		var al = $.parseXML("<attList/>").documentElement;
		var vl = $.parseXML("<valList type='closed' mode='replace'/>").documentElement;
		var change = "change";
		var module = value.split(",")[1];
		var element = value.split(",")[2];
		var exclusions = $xml.find("elementSpec[ident=" + element + "][module=" + module + "]");
		if($.inArray(value, includedValue) != -1){
			
			var hasAtt = "false";
			var data = '';
			var closeOpen = '';
			$.each(ExcludedAttributes, function(i, attribute){
				if(value.split(',')[1] + "," + value.split(',')[2] == attribute.split(',')[0] + "," + attribute.split(',')[1]){
					hasAtt = "true";
				}
			})
			$.each(closedAndOpen, function(i, posCloseOpen){
				if(value.split(',')[1] + value.split(',')[2] + value.split(',')[3] == posCloseOpen.split(',')[2] + posCloseOpen.split(',')[3] + posCloseOpen.split(',')[4]){
					closeOpen = posCloseOpen.split(',')[0];
				}
			})
			if(hasAtt == "true" || beenHereBefore > 0){
				data = '<attDef ident="' + value.split(",")[3] + '" mode="change" xmlns="http://www.tei-c.org/ns/1.0"><valList type="' + closeOpen + '" mode="replace">';
			}
			else{
				data = '<elementSpec xmlns="http://www.tei-c.org/ns/1.0" ident="'+element+'" module="' + module + '" mode="change"><attList><attDef ident="' + value.split(",")[3] + '" mode="change" xmlns="http://www.tei-c.org/ns/1.0"><valList type="' + closeOpen + '" mode="replace">';
			}
			var splitList = value.split(",");
			$.each(splitList, function(i){
				if(i > (splitList.length-5)){
				}
				else{
					data = data + '<valItem ident="' + value.split(",")[i+4] + '"/>'
				}
			})
			if(hasAtt == "true" || beenHereBefore > 0){
				data = data + '</valList></attDef>'
			}
			else{
				data = data + '</valList></attDef></attList></elementSpec>'
				beenHereBefore = 1;
			}
			var at = $.parseXML(data).documentElement;
			if(hasAtt == "true"){
				$xml.find("elementSpec[ident=" + element + "][module=" + module + "]").find("attList").append($(at));
			}
			else{
				$xml.find("schemaSpec").append($(at));
			}
		}
	})
	
	out = new XMLSerializer().serializeToString(xmlDoc);
	xml = out;
}

//This function is used to show the name of all the projects that are saved to the browser.
 function doShowAll(){
   var key = "";
   var pairs = "";
   var i=0;
   for (i=0; i<=localStorage.length-1; i++) {
	 key = localStorage.key(i);
	 if(key.split("%*$&#")[0] != "proj"){
	 }
	 else{
		pairs += "<tr><td class='fname'>"+key.split("%*$&#")[1]+"</td><td><button class='load'>Load</button><td><button class='delete'>Delete</button></tr>\n";
	 }
       }
     if (pairs != "") {
	 $('#items_table').html('<table><tr><th>Name</th><th>Action</th></tr>' + pairs + '</table>');
     }
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

    function showFiles(files,listContainer) {
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
	 document.getElementById(listContainer).innerHTML = '<ul>' + output.join('') + '</ul>';
     }
 
    function makeReport () {
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
	$("#repMethod").text("Method " + method);
	if(AddedModules.length > 0){
		$("#repModulesTag").text("Modules Added:");
		$("#repModules").empty();
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
		$("#repElements").empty();
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
		$("#repAttributes").empty();
		var items = [];
		setXML();
		xmlDoc = $.parseXML(xml);
		$xml = $(xmlDoc);
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
	
	
}

function editinfo () {
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
	method = $("#methodSelect").val();
}

$(document).on("click","span.newProject", function(){
    cleanSystem();
    AddedModules = [];
    AddedModules.push("core");
    AddedModules.push("tei");
    AddedModules.push("header");
    AddedModules.push("textstructure");
    showNewModules();
    $("#tabs").tabs("select", 1); 
});

$(document).on("click","span.saveStartInfo", function(){
    editinfo();
    $("#tabs").tabs("select", 2); 
});



$(document).on("click","button.TEI_Custom", function(){
	$('#UploadCustom').show();
	$("#ExistingSelector").hide();
	$("#OnlineSelector").hide();
        $("#tabs").tabs("select", 2); 
})

$(document).on("click","span.TEI_Default", function(){
	loadDefaultTEI()
	$('#message').html('<p>Default database loaded</p>')
        $("#tabs").tabs("select", 3); 
});



$(document).on("click","span.TEI_Online", function(){
//	$("#UploadCustom").hide();
//	$("#OnlineSelector").show();
//	$("#ExistingSelector").hide();
})

$(document).on("click","span.setOnline", function(){
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
			showNewModules();
			$("#actions").show();
		});
	}
	$('#message').html('<p>' + teiName + ' database loaded</p>')
})

$(document).on("click","span.TEI_Existing", function(){
//	$("#ExistingSelector").show();
//	$("#OnlineSelector").hide();
//	$("#UploadCustom").hide();
	doShowTEI();
})

$(document).on("click","span.setExisting", function(){
	var name = $('#loadTEI').val();
	teiName = name;
	if(localStorage.getItem("tei%*$&#" + name) == null){
		loadDefault();
	}
	else{
		var getTEI = localStorage.getItem("tei%*$&#" + name);
		TEI = JSON.parse(getTEI);
	}
	$("#actions").show();
	$('#message').html('<p>' + teiName + ' database loaded</p>')
})



$(document).on("click","span.SubmitTEI", function(){
	showNewModules();
	if(TEI == []){
	}
	else{
		$('#actions').show();
		showNewModules();
	}
});

$(document).on("click","span.loadProject", function(){
    url = defaultDatabase,
	loadTEI();
	doShowAll();
        $("#tabs").tabs("select", 2); 
});

//Used to save a project to the browser.
$(document).on("click","span.save", function(){
	var name = $("#saveAs").val(); 
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
$(document).on("click","span.load", function(){
    var name = $(this).parent().parent().children('td.fname').text();
    var data = localStorage.getItem('proj%*$&#'+name);
    loadFile(data.replace(/&/g,"&amp;"));
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
	$('#modules').show();
	$('#actions').show();
    $("#tabs").tabs("select", 2); 
    
})

$(document).on("click","span.delete", function(){
    var name = $(this).parent().parent().children('td.fname').text();
    localStorage.removeItem("proj%*$&#" + name);
    doShowAll();
})

$(document).on("click","span.output", function(){
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
$(document).on("click","span.addRemove", function(){
	name = $(this).attr('id');
	action = $(this).html();
	if(action == "Included"){
		ExcludedElements.push(name);
		$(this).html("Excluded");
	}
	if(action == "Excluded"){
		ExcludedElements.splice($.inArray(name, ExcludedElements),1);
		$(this).html("Included");
	}
	showelements(name.split(',')[0]);
})


//CLICK BUTTON EVENT FOR ADDING/REMOVING ATTRIBUTE
$(document).on("click","span.addRemoveAttribute", function(){
	name = $(this).attr('id');
	action = $(this).html();
	if(action == "Included"){
		ExcludedAttributes.push(name);
		$(this).html("Excluded");
	}
	if(action == "Excluded"){
		ExcludedAttributes.splice($.inArray(name, ExcludedAttributes),1);
		$(this).html("Included");
	}
	showattributes(name.split(',')[1]);
})

//CLICK BUTTON EVENT FOR VIEWING ELEMENTS

$(document).on("click","span.modulelink",function() {
	Back = "Modules";
	Current = "Elements";
    showelements($(this).text() );
    $("#tabs").tabs("select", 4); 
        return false;
})


//CLICK BUTTON EVENT FOR VIEWING ATTRIBUTES
$(document).on("click","span.elementlink",function(){
    showattributes($(this).text() );
    $("#tabs").tabs("select", 5); 
    return false;
})

$(document).on("click","span.attributelink", function(){
	alterattributes($(this).attr("id"));
    $("#tabs").tabs("select", 6); 

		return false;
})

//CLICK BUTTON EVENT FOR ADDING MODULE
$(document).on("click","span.addModule",function() {
	name = $(this).attr('id');
	var exists = false;
	var index = $.inArray(name.substring(0, name.length - 1), AddedModules);
	if(index == -1){
		AddedModules.push(name.substring(0, name.length - 1));
	}
        showmodules();
	showNewModules();
})

//CLICK BUTTON EVENT FOR REMOVING MODULE
$(document).on("click","span.removeModule",function(){
	name = $(this).attr('id');
	var exists = false;
	if($.inArray(name.substring(0, name.length - 1), AddedModules) != -1){
		AddedModules.splice($.inArray(name.substring(0, name.length - 1), AddedModules),1);
	}
        showmodules();
	showNewModules();
})



$(document).on("click","span.continueToLoad", function(){
	var xmldata = $("#inputarea").val();

    xml = xmldata.replace(/&/g,"&amp;")
    givenXML = xml;
    loadFile(xml);
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
	$('#actions').show();
	showNewModules();
        $("#tabs").tabs("select", 3); 
})

$(document).on("click","span.loadCustomJSON", function(){
	eval($('#inputarea').val());
	teiName = $("#JSONfile").val();
	showNewModules();
	$('#actions').show();
	$('#message').html('<p>' + teiName + ' database loaded</p>')
        $("#tabs").tabs("select", 3); 
})

$(document).on("click","span.outputXML", function(){

})

$(document).on("click", "span.saveAttributeInfo", function(){
	if($("#listOfValues").val() != ""){
		var index = -1;
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
		
		var closeOpen = ""
		if($(".closedOrOpen").html() == "Closed List"){
			closeOpen = "closed,";
		}
		else{
			closeOpen = "open,";
		}
		closeOpen = closeOpen + $("#attributeIdent").text().replace(/;/g,",");
		index = -1;
		$.each(closedAndOpen, function(i, value){
			if(value.split(',')[2] == closeOpen.split(',')[2] && value.split(',')[3] == closeOpen.split(',')[3] && value.split(',')[4] == closeOpen.split(',')[4]){
				index = i;
			}
		})
		if(index != -1){
			closedAndOpen[index] = closeOpen;
		}
		else{
			closedAndOpen.push(closeOpen);
		}
	}
})
$(document).on("click", "span.closedOrOpen", function(){
	if($(".closedOrOpen").html() == "Open List"){
		$(".closedOrOpen").html("Closed List");
	}
	else{
		$(".closedOrOpen").html("Open List");
	}
})
$(document).on("click","span.removeJSON", function(){
	var name = $("JSONtoremove").val();
	if(name == ''){
	}
	else{
		localStorage.removeItem("tei%*$&#" + name);
	}
	doShowTEI();
})
$(document).on("click", "span.restart", function(){
	$('#projectSelection').show();
	$('#actions').hide();
	$('#UploadCustom').hide();
	$('#OnlineSelector').hide();
	$('#ExistingSelector').hide();
	$('#selected').empty();
	$('#selected').show();
    cleanSystem();
})

