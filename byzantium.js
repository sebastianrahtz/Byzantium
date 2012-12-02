/*
Roma Revised Version
Started: 11/1/2012
Programmed By: Sebastian Rahtz and Nicholas Burlingame

Copyright TEI Consortium.

These material is dual-licensed:

1. Distributed under a Creative Commons Attribution-ShareAlike 3.0
Unported License http://creativecommons.org/licenses/by-sa/3.0/ 

2. http://www.opensource.org/licenses/BSD-2-Clause
                
All rights reserved.


*/

var VERSION = "0.4";
var EMAIL = "tei@it.ox.ac.uk";
var defaultDatabase='http://bits.nsms.ox.ac.uk:8080/jenkins/job/TEIP5/lastSuccessfulBuild/artifact/release/xml/tei/odd/p5subset.js';
var OXGARAGE="http://oxgarage.oucs.ox.ac.uk:8080/ege-webservice/";
var TODAY=new Date();


var AddedModules = [];
var Back = "";
var Current = "";
var ExcludedAttributes=[];
var ExcludedMembers=[];
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
var liveMembers = 0;
var moduleCounter = 0;
var teiName = "";
var title = "";
var totMembers = 0;
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
    ExcludedMembers=[];
    ListofValues = [];
    author = "";
    currentModule = "";
    description = "TEI customization made on " + TODAY;
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
	alert("NO DATABASE LOADED");
    }
    else
    {
	moduleCounter=TEI.modules.length;
	totMembers = TEI.members.length;
	var items = [];
	$.each(TEI.modules, function(i, module) {
	var mString ='<tr class="list" id="div' + module.ident + '">';
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
    liveMembers=0;
    $.each(AddedModules, function(i, module){
	$.each(TEI.members, function(i, member){
	    if (member.module == module) { liveMembers +=1; }
	});
    });
    $("#moduleSummary").html('<p>' + TEI.modules.length + " modules available, of which " + AddedModules.length + " are in use, containing " + liveMembers + " members, of which " +  ExcludedMembers.length + " are excluded</p>");
	$(".moduleSparkline").sparkline([(totMembers-liveMembers),(liveMembers-ExcludedMembers.length),ExcludedMembers.length], {
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
}

//DISPLAYS MEMBERS
function showmembers(name  )
{	
	var totalMembers = 0;
	var usedMembers = 0;
    var items = [];
    $('#members').html($('<h2/>', {html: "Members of module " + name }));
    $.each(TEI.members, function(i, member) {
        if (member.module == name) {
	    totalMembers += 1;
	    currentModule = name;
            items.push('<tr class="list"><td>');
	    items.push('<span class="button addRemove" id="' + name + "," + member.ident + '">');
	    if($.inArray((name + "," + member.ident), ExcludedMembers) == -1){
		items.push("Exclude");
		items.push('</span></td><td><span class="button memberlink">' + member.ident + '</span></td><td>' + member.desc + '</td></tr>');
		usedMembers+=1;
	    }
	    else{
		items.push("Include");
		items.push('</span></td><td class="unselected">' + member.ident + '</td><td>' + member.desc + '</td></tr>');

	    }
          }
        });
	
    $('#members').append('<div id="sparkline" style="float:right" border="1"><span class="membersparkline"></span><ul><li>Red: Unused members</li><li>Blue: Used members</li></ul></div>');
    $('#members').append($('<table/>', {'class': 'members',html:  items.join('') }));
	$(".membersparkline").sparkline([(totalMembers-usedMembers),usedMembers], {
	type: 'pie',
	width: '200',
	height: '200',
	sliceColors: ['#dc3912','#3366cc','#7f7f7f','#109618','#66aa00','#dd4477','#0099c6','#990099 '],
	borderColor: '#7f7f7f'});
}

//Loads an xml file from either local host or from HTML storage
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
	//Populates the module segment.
	$xml.find("moduleRef").each(function(i, item) {
		key = item.getAttribute('key');
		AddedModules.push(key);
		excepts = item.getAttribute('except');
		includes = item.getAttribute('include');
	    if (excepts != null) {
		$.each(excepts.split(" "), function(i, except){
		    if(except != ""){
			ExcludedMembers.push(key+","+except);
		    }
		})
		    }
	    else {
		if (includes != null) {
		    var individualIncludes = includes.split(" ");
		    $.each(TEI.members, function(i, member){
			if(member.module == key && $.inArray(member.ident, individualIncludes) == -1) {
			    ExcludedMembers.push(key+","+member.ident);
			}
		    })
			}
	    }
	})
	//This part populates the elements and the attributes.
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
	var addableitems = [];
	var unaddableitems = [];
	var bigString = ""
	var totalAttributes = 0;
	var usedAttributes = 0;
	var excludedAttributes = 0;
	var unavailableAttributes = 0;
	$('#attributes').html($('<h2/>', {html: "Attributes of " + name }));
        $.each(TEI.members, function(i, member){
	    if(member.ident == name){
		$.each(member.attributes, function(i, attribute){
		    totalAttributes +=1;
		    addableitems.push('<tr class="list"><td>local</td><td><span class="button addRemoveAttribute" id="' + currentModule + "," + name + "," + attribute.ident + '">');
		    if($.inArray((currentModule + "," + name + "," + attribute.ident), ExcludedAttributes) == -1){
			addableitems.push("Exclude");
			usedAttributes += 1;
			addableitems.push('</span></td><td>' + '<span class="button attributelink" id="att,' + currentModule + "," + name + "," + attribute.ident + '" >'+ attribute.ident + "</span></td><td>"  + attribute.desc + '</td></tr>');
		    }
		    else{
			addableitems.push("Include");
			excludedAttributes += 1;
			addableitems.push('</span></td><td>' + attribute.ident + "</td><td>"  + attribute.desc + '</td></tr>');
		    }
		});
		$.each(member.classattributes, function(i, classattribute){
		    var classAttributeModule = classattribute.module;
		    var classAttributeClass  = classattribute.class;
		    $.each(TEI.members, function(i, attclass){
			if(attclass.ident == classAttributeClass){
			    $.each(attclass.attributes, function(i, attribute){
				totalAttributes +=1;
				if($.inArray(classAttributeModule, AddedModules) != -1){
				    addableitems.push('<tr class="list"><td>' + classAttributeClass + '</td><td><span class="button addRemoveAttribute" id="' + currentModule + "," + name + "," + attribute.ident + '">');
				    if($.inArray((currentModule + "," + name + "," + attribute.ident), ExcludedAttributes) == -1){
					addableitems.push("Exclude");
					usedAttributes += 1;
				    }
				    else{
					addableitems.push("Include");
					excludedAttributes += 1;
				    }
				    addableitems.push('</span></td><td>' + '<span class="button attributelink" id="att,' + currentModule + "," + name + "," + attribute.ident + '" >'+ attribute.ident + "</span></td><td>"  + attribute.desc + '</td></tr>');
				}
				else{
				    unaddableitems.push('<tr class="list"><td>' + classAttributeClass + '</td><td><button disabled="disabled">Requires: ' + classAttributeModule + "</span></td><td>"+ attribute.ident + '</td><td> ' + attribute.desc + '</td></tr>');
				    unavailableAttributes +=1;
				}				
		    });
			}
		    });
		});
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
//Alters the attributes' lists, as well as making them open or closed.
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
    doShowProjects();
    doShowDatabases();
    $('#defaultDatabase').html(defaultDatabase);
    $('#colophon').html("Byzantium " + VERSION + ". Written by Nick Burlingame. Contact: " + EMAIL + ". Date: " + TODAY);
})

function status(message) {
    $('#message').html('<p>' + message.replace(/</g,'&lt;') + '</p>');

}
//Loads the TEI Object.
function loadTEI(){
    status("Loading source....." + url);
   $.ajax({
    url: url,
    dataType: 'jsonp',
       jsonpCallback: 'teijs',
       success: function(data) {
           status("Successfuly read " + url);
       }
   });
}


//Sets the XML to be outputted.
function setXML(){
    var types=[];
    	$.each(TEI.members, function(i, name) {
	    types[name.ident]=[];
	    types[name.ident]["type"]=name.type;
	});

	if(givenXML == ""){
		xml = '<?xml version="1.0"?><TEI xml:lang="en" xmlns="http://www.tei-c.org/ns/1.0"><teiHeader><fileDesc><titleStmt><title/><author/></titleStmt>'
		+ '<publicationStmt><p>for use by whoever wants it</p></publicationStmt><sourceDesc><p>created on ' + TODAY + '</p></sourceDesc>'
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
	
    // first create the moduleRef elements
	$.each(AddedModules, function(i, name) {
	    var mr = document.createElementNS("http://www.tei-c.org/ns/1.0", 'moduleRef');
		var excludeString = "";
		var includeString = "";
		var currentModule = name;
	        $.each(TEI.members, function(i, member) {
		    if (member.module == currentModule && $.inArray((currentModule + "," + member.ident), ExcludedMembers) == -1) {
			includeString += " " + member.ident;
		    }
		})
		$.each(ExcludedMembers, function(j, member){
			if(member.split(',')[0] == currentModule){
			    excludeString += " " + member.split(',')[1];
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
	var usedModules = [];
	var changedElements = [];
	var finalAttributes = [];
	var attributeString = "";
    var change = "change";

    // go over excluded attributes and check modules are still available, then  generate a list of elements which 
    // are affected, with list of attributes to delete
	$.each(ExcludedAttributes, function(i, attrib){
	    var currentModule = attrib.split(',')[0];
	    var currentMember = attrib.split(',')[1];
	    var currentAttribute = attrib.split(',')[2];
	    var currentType = types[currentMember]["type"]
	    if($.inArray(currentModule, AddedModules) != -1 && $.inArray(currentModule + "," + currentMember, ExcludedMembers) == -1) 
	    {
		var ad = document.createElementNS("http://www.tei-c.org/ns/1.0", 'attDef');
		if ($xml.find('*[ident="' + currentMember + '"]').length > 0) {
		    $xml.find('*[ident="' + currentMember + '"]').find('attList').append($(ad).attr({ident: currentAttribute, mode: "delete"}));
		}
		else
		{
		    var es = document.createElementNS("http://www.tei-c.org/ns/1.0", types[currentMember]["type"]);
		    var al = document.createElementNS("http://www.tei-c.org/ns/1.0", 'attList');
			$(al).append($(ad).attr({ident: currentAttribute, mode: "delete"}));
			$(es).append($(al));
			$xml.find("schemaSpec").append($(es).attr({ident: currentMember, module: currentModule, mode: change}));
		}
		out = new XMLSerializer().serializeToString(xmlDoc);
		xmlDoc = $.parseXML(out);
		$xml = $(xmlDoc);
	    }
	});

    var includedValue = [];
	
    // ok, now we can deal with the changed attributes, for which we have created <valList>s
	$.each(ListofValues, function(i, value){
		if($.inArray(value.split(',')[1], AddedModules) != -1){
			if($.inArray((value.split(',')[1] + "," + value.split(',')[2]), ExcludedMembers) == -1){
				if($.inArray((value.split(',')[1] + "," + value.split(',')[2] + ',' + value.split(',')[3]), ExcludedAttributes) == -1){
					includedValue.push(value);
				}
			}
		}
	})
	var beenHereBefore = 0;
	var currentModEle = "";
	var previousModEle = "";
	$.each(ListofValues, function(i, value){
		var es = document.createElementNS("http://www.tei-c.org/ns/1.0", types[currentMember]["type"]);
		var al = document.createElementNS("http://www.tei-c.org/ns/1.0", 'attList');
		var vl = document.createElementNS("http://www.tei-c.org/ns/1.0", 'valList');
		var vl = $.parseXML("<valList type='closed' mode='replace'/>").documentElement;
		var module = value.split(",")[1];
		var element = value.split(",")[2];
		currentModEle = module + "," + element;
		if(currentModEle != previousModEle){
			beenHereBefore = 0;
		}
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
			}
			var at = $.parseXML(data).documentElement;
			if(hasAtt == "true" || beenHereBefore > 0){
				$xml.find("elementSpec[ident=" + element + "][module=" + module + "]").find("attList").append($(at));
			}
			else{
				$xml.find("schemaSpec").append($(at));
				beenHereBefore = 1;
			}
		}
		previousModEle = currentModEle;
	})
	
	out = new XMLSerializer().serializeToString(xmlDoc);
	xml = out;
}

//This function is used to show the name of all the projects that are saved to the browser.
 function doShowProjects(){
   var key = "";
   var pairs = "";
   var i=0;
   for (i=0; i<=localStorage.length-1; i++) {
	 key = localStorage.key(i);
	 if(key.split("%*$&#")[0] != "proj"){
	 }
	 else{
	pairs += "<tr><td class='fname'>"+key.split("%*$&#")[1]+"</td><td><span class='button load'>Load</span><td><span class='button delete'>Delete</span></tr>\n";
	 }
       }
     if (pairs != "") {
	 $('#items_table').html('<table>' + pairs + '</table>');
     }
 }
 
  function doShowDatabases(){
   var key = "";
   var pairs = "";
   var i=0;
   for (i=0; i<=localStorage.length-1; i++) {
	 key = localStorage.key(i);
	 if(key.split("%*$&#")[0] != "tei"){
	 }
	 else{
		pairs += "<tr><td class='fname'>"+key.split("%*$&#")[1]+"</td><td><span class='button loadDatabase'>Load</span><td><span class='button deleteDatabase'>Delete</span></tr>\n";
	 }
       }
     if (pairs != "") {
	 $('#teiitems_table').html('<table>' + pairs + '</table>');
     }
 }
 //Loads the default TEI that Sebastian created.
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
	     // Read in the file data
	     reader.readAsText(f);
	 }
	 document.getElementById(listContainer).innerHTML = '<ul>' + output.join('') + '</ul>';
     }
 
 //Creates the report page
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
	if(ExcludedMembers.length > 0){
		$("#repElementsTag").text("Elements Excluded:");
		$("#repElements").empty();
		var items = [];
		setXML();
		xmlDoc = $.parseXML(xml);
		$xml = $(xmlDoc);
		
		$xml.find("moduleRef").each(function(i, element){
			var module = element.getAttribute('key');
			var elementList = element.getAttribute("except");
		    if (elementList != null) {
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




$(document).on("click","span.TEI_Default", function(){
	loadDefaultTEI()
	status("Default database loaded");
        $("#tabs").tabs("select", 3); 
});

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
		    $("#tabs").tabs("select", 3); 
		});
	}
    status(TEIurl + " database loaded")
    $("#tabs").tabs("select", 3); 
    doShowDatabases();
})

$(document).on("click","span.loadProject", function(){
    url = defaultDatabase,
	loadTEI();
	doShowProjects();
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
	doShowProjects();
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
    $("#tabs").tabs("select", 2); 
    
})

$(document).on("click","span.delete", function(){
    var name = $(this).parent().parent().children('td.fname').text();
    localStorage.removeItem("proj%*$&#" + name);
    doShowProjects();
})

$(document).on("click","span.output", function(){
	var value = $("#outputSelection").val();	
    switch (value)	
    {	
    case "TEI ODD":  	
  target="TEI%3Atext%3Axml/xml%3Aapplication%3Axml"; break;	
    case "RELAX NG Compact Schema":  	
  target = "ODD%3Atext%3Axml/ODDC%3Atext%3Axml/rnc%3Aapplication%3Arelaxng-compact"; break;	
    case "RELAX NG Schema":  	
  target = "ODD%3Atext%3Axml/ODDC%3Atext%3Axml/relaxng%3Aapplication%3Axml-relaxng"; break;	
    case "XSD Schema":  	
  target = "ODD%3Atext%3Axml/ODDC%3Atext%3Axml/xsd%3Aapplication%3Axml-xsd"; break;	
    case "ISO Schematron":  	
  target = "ODD%3Atext%3Axml/ODDC%3Atext%3Axml/isosch%3Atext%3Axml"; break;	
    case "Schematron":  	
  target = "ODD%3Atext%3Axml/ODDC%3Atext%3Axml/sch%3Atext%3Axml"; break;	
    case "DTD":  	
  target = 'ODD%3Atext%3Axml/ODDC%3Atext%3Axml/dtd%3Aapplication%3Axml-dtd'; break;
    case "HTML documentation":  	
  target = "ODD%3Atext%3Axml/ODDC%3Atext%3Axml/oddhtml%3Aapplication%3Axhtml%2Bxml"; break;
    case "ePub documentation":  	
  target = "ODD%3Atext%3Axml/ODDC%3Atext%3Axml/TEI%3Atext%3Axml/epub%3Aapplication%3Aepub%2Bzip/"; break;
    case "JSON":  	
  target = "ODD%3Atext%3Axml/ODDC%3Atext%3Axml/oddjson%3Aapplication%3Ajson"; break;	
    }
    oxgproperties ="?properties=<conversions><conversion%20index='0'><property%20id='pl.psnc.dl.ege.tei.profileNames'>tei</property></conversion><conversion%20index='1'><property%20id='pl.psnc.dl.ege.tei.profileNames'>tei</property><property%20id='oxgarage.textOnly'>true</property><property%20id='oxgarage.lang'>" + language +  "</property></conversion></conversions>";
    setXML();	
    var f = document.createElement('form');	
    f.id="outputFormMulti";
    status("Send request to " + OXGARAGE + "Conversions/" + target + "/" + oxgproperties);
    f.action = OXGARAGE + "Conversions/" + target + "/" + oxgproperties;
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
    alert(xml)
    //f.submit();
    $('#outputFormMulti').remove();
})



//CLICK BUTTON EVENT FOR ADDING/REMOVING ELEMENT
$(document).on("click","span.addRemove", function(){
	name = $(this).attr('id');
	action = $(this).html();
	if(action == "Exclude"){
		ExcludedMembers.push(name);
		$(this).html("Include");
	}
	if(action == "Include"){
		ExcludedMembers.splice($.inArray(name, ExcludedMembers),1);
		$(this).html("Exclude");
	}
	showmembers(name.split(',')[0]);
})


//CLICK BUTTON EVENT FOR ADDING/REMOVING ATTRIBUTE
$(document).on("click","span.addRemoveAttribute", function(){
	name = $(this).attr('id');
	action = $(this).html();
	if(action == "Exclude"){
		ExcludedAttributes.push(name);
		$(this).html("Include");
	}
	if(action == "Include"){
		ExcludedAttributes.splice($.inArray(name, ExcludedAttributes),1);
		$(this).html("Exclude");
	}
	showattributes(name.split(',')[1]);
})

//CLICK BUTTON EVENT FOR VIEWING ELEMENTS

$(document).on("click","span.modulelink",function() {
    showmembers($(this).text() );
    $("#tabs").tabs("select", 4); 
        return false;
})


//CLICK BUTTON EVENT FOR VIEWING ATTRIBUTES
$(document).on("click","span.memberlink",function(){
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
	teiName = $("#TEI_LocalName").val();
	showNewModules();
	$('#actions').show();
    status(teiName + ' database loaded')
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

$(document).on("click","span.loadDatabase", function(){
    var thisname = $(this).parent().parent().children('td.fname').text();
    var L = localStorage.getItem("tei%*$&#" + thisname);
    if (L != null) {
	TEI = JSON.parse(L);
    }
    else{
	loadDefaultTEI();
    }
    status(thisname + ' database loaded');
    doShowDatabases();
    $("#tabs").tabs("select", 3);     
})

$(document).on("click","span.deleteDatabase", function(){
    var name = $(this).parent().parent().children('td.fname').text();
    localStorage.removeItem("tei%*$&#" + name);
    doShowDatabases();
})
