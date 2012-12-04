/*globals $, XMLSerializer, FileReader*/
/*jslint eqeq:true*/
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


(function () {

'use strict';
var VERSION = '0.4',
    EMAIL = 'tei@it.ox.ac.uk',
    defaultDatabase = 'http://bits.nsms.ox.ac.uk:8080/jenkins/job/TEIP5/lastSuccessfulBuild/artifact/release/xml/tei/odd/p5subset.js',
    OXGARAGE = 'http://oxgarage.oucs.ox.ac.uk:8080/ege-webservice/',
    TODAY = new Date(),
    xmlDoc,
    $xml,
    AddedModules = [],
    Back = '',
    Current = '',
    ExcludedAttributes=[],
    ExcludedMembers=[],
    ListofValues=[],
    closedAndOpen = [],
    TEI=[],
    author = '',
    currentModule = '',
    description = '',
    filename = '',
    givenXML = '',
    language = '',
    method = 'except',
    liveMembers = 0,
    moduleCounter = 0,
    teiName = '',
    title = '',
    totMembers = 0,
    url = '',
    xml = '';

// SETS JSON OBJECT
function teijs(data) {
    TEI = data;
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
// DISPLAYS INITIAL MODULES
function showModules() {
    if (teiName != "" && teiName != "undefined"){
        localStorage.setItem(("tei%*$&#" + teiName), JSON.stringify(TEI, null, 2));
    }
    if (TEI.modules === undefined ) {
        alert("NO DATABASE LOADED");
    }
    else {
        moduleCounter=TEI.modules.length;
        totMembers = TEI.members.length;
        var items = [];
        $.each(TEI.modules, function(i, module) {
            var mString ='<tr class="list" id="div' + module.ident + '">';
            if ($.inArray(module.ident, AddedModules) != -1) {
                mString += '<td><span class="button removeModule" id="' + module.ident + 'R">Remove</span></td>';
                mString += '<td><span class="button modulelink" >' + module.ident + '</span></td>' ;
            }
            else {
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
                if (member.module == module) {
                    liveMembers++;
                }
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


// SHOWS ADDED OR SUBTRACTED MODULES
function showNewModules(){
    $('#selected').empty();
    var items = [];
    $.each(AddedModules, function(i, module){
        items.push('<li>' + AddedModules[i] + '</li>');
    });
}

// DISPLAYS MEMBERS
function showmembers(name) {
    var totalMembers = 0,
        usedMembers = 0,
        items = [];
    $('#members').html($('<h2/>', {html: "Members of module " + name }));
    $.each(TEI.members, function(i, member) {
        if (member.module == name) {
            totalMembers++;
            currentModule = name;
            items.push('<tr class="list"><td>');
            items.push('<span class="button addRemove" id="' + name + "," + member.ident + '">');
            if ($.inArray((name + "," + member.ident), ExcludedMembers) == -1) {
                items.push("Exclude");
                items.push('</span></td><td><span class="button memberlink">' + member.ident + '</span></td><td>' + member.desc + '</td></tr>');
                usedMembers+=1;
            }
            else {
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

// Loads an xml file from either local host or from HTML storage
function loadFile(xml) {
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
    if (teiName == "undefined" || teiName == null){
        teiName = "";
    }
    // Populates the module segment.
    $xml.find("moduleRef").each(function(i, item) {
        var excepts, includes, individualIncludes,
            key = item.getAttribute('key');
        AddedModules.push(key);
        excepts = item.getAttribute('except');
        includes = item.getAttribute('include');
        if (excepts != null) {
            $.each(excepts.split(" "), function(i, except){
                if (except != ""){
                    ExcludedMembers.push(key+","+except);
                }
            });
        }
        else {
            if (includes != null) {
                individualIncludes = includes.split(" ");
                $.each(TEI.members, function(i, member){
                    if (member.module == key && $.inArray(member.ident, individualIncludes) == -1) {
                        ExcludedMembers.push(key+","+member.ident);
                    }
                });
            }
        }
    });
    // This part populates the elements and the attributes.
    $xml.find("elementSpec").each(function(i, item){
        var module = item.getAttribute('module'),
            element = item.getAttribute('ident');
        $(this).find('attDef[mode="delete"]').each(function(i, test){
            var attribute = test.getAttribute('ident');
            ExcludedAttributes.push(module + "," + element + "," + attribute);
        });
        $(this).find('attDef[mode="change"]').each(function(i, test){
            var attribute = test.getAttribute('ident'),
                data = "att," + module + "," + element + "," + attribute,
                openClose = "att," + module + "," + element + "," + attribute;
            $(test).find('valList').each(function(i, test2){
                openClose = test2.getAttribute('type') + "," + openClose;
                $(test2).find("valItem").each(function(i, test3){
                    data = data + "," + test3.getAttribute("ident");
                });
            });
            closedAndOpen.push(openClose);
            ListofValues.push(data);
        });
    });
}


// DISPLAYS ATTRIBUTES
function showattributes(name ) {
    var addableitems = [],
        unaddableitems = [],
        bigString = '',
        totalAttributes = 0,
        usedAttributes = 0,
        excludedAttributes = 0,
        unavailableAttributes = 0;
    $('#attributes').html($('<h2/>', {html: "Attributes of " + name }));
    $.each(TEI.members, function(i, member) {
        if (member.ident != name) {
            return;
        }
        $.each(member.attributes, function(i, attribute){
            totalAttributes++;
            addableitems.push('<tr class="list"><td>local</td><td><span class="button addRemoveAttribute" id="' + currentModule + "," + name + "," + attribute.ident + '">');
            if ($.inArray((currentModule + "," + name + "," + attribute.ident), ExcludedAttributes) == -1) {
                addableitems.push("Exclude");
                usedAttributes++;
                addableitems.push('</span></td><td>' + '<span class="button attributelink" id="att,' + currentModule + "," + name + "," + attribute.ident + '" >'+ attribute.ident + "</span></td><td>"  + attribute.desc + '</td></tr>');
            }
            else {
                addableitems.push("Include");
                excludedAttributes++;
                addableitems.push('</span></td><td>' + attribute.ident + "</td><td>"  + attribute.desc + '</td></tr>');
            }
        });
        $.each(member.classattributes, function(i, classattribute){
            var classAttributeModule = classattribute.module,
                classAttributeClass = classattribute.className;
            $.each(TEI.members, function(i, attclass) {
                if (attclass.ident != classAttributeClass) {
                    return;
                }
                $.each(attclass.attributes, function(i, attribute) {
                    totalAttributes++;
                    if ($.inArray(classAttributeModule, AddedModules) != -1) {
                        addableitems.push('<tr class="list"><td>' + classAttributeClass + '</td><td><span class="button addRemoveAttribute" id="' + currentModule + "," + name + "," + attribute.ident + '">');
                        if ($.inArray((currentModule + "," + name + "," + attribute.ident), ExcludedAttributes) == -1){
                            addableitems.push("Exclude");
                            usedAttributes++;
                        }
                        else {
                            addableitems.push("Include");
                            excludedAttributes++;
                        }
                        addableitems.push('</span></td><td>' + '<span class="button attributelink" id="att,' + currentModule + "," + name + "," + attribute.ident + '" >'+ attribute.ident + "</span></td><td>"  + attribute.desc + '</td></tr>');
                    }
                    else {
                        unaddableitems.push('<tr class="list"><td>' + classAttributeClass + '</td><td><button disabled="disabled">Requires: ' + classAttributeModule + "</span></td><td>"+ attribute.ident + '</td><td> ' + attribute.desc + '</td></tr>');
                        unavailableAttributes +=1;
                    }
                });
            });
        });
    });

    $('#attributes').append('<div id="sparkline" style="float:right" border="1"><span class="attributeSparkline"></span><ul><li>Red: Unused attributes</li><li>Blue: Used attributes</li><li>Gray: Unavailable Attributes</li></ul></div>');
    $('#attributes').append($('<table/>', {'class': 'attributes',html: addableitems.join('') + unaddableitems.join('')}));
    $(".attributeSparkline").sparkline([excludedAttributes,usedAttributes,unavailableAttributes], {
        type: 'pie',
        width: '200',
        height: '200',
        sliceColors: ['#dc3912','#3366cc','#7f7f7f','#109618','#66aa00','#dd4477','#0099c6','#990099 '],
        borderColor: '#7f7f7f'
    });
}
// Alters the attributes' lists, as well as making them open or closed.
function alterattributes(id){
    $("#attributeIdent").text(id);
    $("#attAlterName").text("Attribute Name: " + id.split(',')[3]);
    $(".closedOrOpen").html("Open List");
    $.each(closedAndOpen, function(i, closeOpen) {
        if (closeOpen.split(',')[2] + closeOpen.split(',')[3] + closeOpen.split(',')[4] == id.split(',')[1] + id.split(',')[2] + id.split(',')[3]) {
            if (closeOpen.split(',')[0] == 'closed') {
                $(".closedOrOpen").html("Closed List");
            }
            if (closeOpen.split(',')[0] == 'open') {
                $(".closedOrOpen").html("Open List");
            }
        }
    });
    $("#listOfValues").val("");
    $.each(ListofValues, function(i, value) {
        if (value.split(',')[1] + value.split(',')[2] + value.split(',')[3] == id.split(',')[1] + id.split(',')[2] + id.split(',')[3]) {
            var values = value.split(',')[4],
                valueList = value.split(',');
            $.each(valueList, function(i, value) {
                if (i > (valueList.length-6)) {
                }
                else {
                    values += ',' + valueList[i+5];
                }
            });
            $("#listOfValues").val(values);
        }
    });
}


function status(message) {
    $('#message').html('<p>' + message.replace(/</g,'&lt;') + '</p>');

}
// Loads the TEI Object.
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


// Sets the XML to be outputted.
function setXML(){
    var out, types=[],
        excludes = [],
        usedModules = [],
        changedElements = [],
        finalAttributes = [],
        attributeString = '';
    $.each(TEI.members, function(i, name) {
        types[name.ident]=[];
        types[name.ident].type = name.type;
    });

    if (givenXML == "") {
        xml = '<?xml version="1.0"?><TEI xml:lang="en" xmlns="http://www.tei-c.org/ns/1.0"><teiHeader><fileDesc><titleStmt><title/><author/></titleStmt>'
        + '<publicationStmt><p>for use by whoever wants it</p></publicationStmt><sourceDesc><p>created on ' + TODAY + '</p></sourceDesc>'
        + '</fileDesc></teiHeader><text><front><divGen type="toc"/></front><body><p>';
        if (description != "") {
            xml += description;
        }
        else{
            xml += "My TEI Customization starts with modules tei, core, textstructure and header";
        }
        xml += '</p><schemaSpec xml:lang="en" prefix="tei_" docLang="en" ident=""></schemaSpec></body></text></TEI>';
    }
    else {
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
    $xml.find("schemaSpec").attr({ident: filename});
    if (teiName!=""){
        $xml.find("schemaSpec").attr({source: teiName});
    }
    if (language!=""){
        $xml.find("schemaSpec").attr({docLang: language});
    }

    // first create the moduleRef elements
    $.each(AddedModules, function(i, name) {
        var mr = document.createElementNS('http://www.tei-c.org/ns/1.0', 'moduleRef'),
            excludeString = '',
            includeString = '',
            currentModule = name;
        $.each(TEI.members, function(i, member) {
            if (member.module == currentModule && $.inArray((currentModule + "," + member.ident), ExcludedMembers) == -1) {
                includeString += " " + member.ident;
            }
        });
        $.each(ExcludedMembers, function(j, member) {
            if (member.split(',')[0] == currentModule) {
                excludeString += " " + member.split(',')[1];
            }
        });
        if (excludeString == '') {
            $xml.find("schemaSpec").append($(mr).attr({key: currentModule}));
        }
        else {
            if (method == 'include') {
                $xml.find("schemaSpec").append($(mr).attr({key: currentModule, include: includeString.replace(/^\s+/, '')}));
            }
            else {
                $xml.find("schemaSpec").append($(mr).attr({key: currentModule, except: excludeString.replace(/^\s+/, '')}));
            }
        }
    });

    // go over excluded attributes and check modules are still available, then generate a list of elements which
    // are affected, with list of attributes to delete
    $.each(ExcludedAttributes, function(i, attrib){
        var ad, es, al,
            currentModule = attrib.split(',')[0],
            currentMember = attrib.split(',')[1],
            currentAttribute = attrib.split(',')[2],
            currentType = types[currentMember].type;
        if ($.inArray(currentModule, AddedModules) != -1 && $.inArray(currentModule + "," + currentMember, ExcludedMembers) == -1) {
            ad = document.createElementNS("http://www.tei-c.org/ns/1.0", 'attDef');
            if ($xml.find('*[ident="' + currentMember + '"]').length > 0) {
                $xml.find('*[ident="' + currentMember + '"]').find('attList').append($(ad).attr({ident: currentAttribute, mode: "delete"}));
            }
            else {
                es = document.createElementNS("http://www.tei-c.org/ns/1.0", types[currentMember].type);
                al = document.createElementNS("http://www.tei-c.org/ns/1.0", 'attList');
                $(al).append($(ad).attr({ident: currentAttribute, mode: "delete"}));
                $(es).append($(al));
                $xml.find("schemaSpec").append($(es).attr({ident: currentMember, module: currentModule, mode: "change"}));
            }
        }

        out = new XMLSerializer().serializeToString(xmlDoc);
        xmlDoc = $.parseXML(out);
        $xml = $(xmlDoc);
    });

    // ok, now we can deal with the changed attributes, for which we have create <valList>s
    $.each(ListofValues, function(i, value) {
        var vi, ad, vl, es, al, splitList, closeOpen, currentModule = value.split(',')[1],
            currentMember = value.split(',')[2],
            currentAttribute = value.split(',')[3],
            currentType = types[currentMember].type;
        if ($.inArray(currentModule, AddedModules) != -1 && $.inArray(currentModule + "," + currentMember, ExcludedMembers) == -1) {
            $.each(closedAndOpen, function(i, posCloseOpen) {
                if (value.split(',')[1] + value.split(',')[2] + value.split(',')[3] == posCloseOpen.split(',')[2] + posCloseOpen.split(',')[3] + posCloseOpen.split(',')[4]){
                    closeOpen = posCloseOpen.split(',')[0];
                }
            });
            ad = document.createElementNS("http://www.tei-c.org/ns/1.0", 'attDef');
            vl = document.createElementNS("http://www.tei-c.org/ns/1.0", 'valList');
            $(vl).attr({mode: 'replace',type: closeOpen});
            splitList = value.split(',');
            $.each(splitList, function(i, val) {
                if (i > 3) {
                    vi = document.createElementNS("http://www.tei-c.org/ns/1.0", 'valItem');
                    $(vi).attr({ident: val});
                    $(vl).append($(vi));
                }
            });
            $(ad).append($(vl));
            if ($xml.find('*[ident="' + currentMember + '"]').length > 0) {
                $xml.find('*[ident="' + currentMember + '"]').find('attList').append($(ad).attr({ident: currentAttribute, mode: "change"}));
            }
            else {
                es = document.createElementNS("http://www.tei-c.org/ns/1.0", types[currentMember].type);
                al = document.createElementNS("http://www.tei-c.org/ns/1.0", 'attList');
                $(al).append($(ad).attr({ident: currentAttribute, mode: "change"}));
                $(es).append($(al));
                $xml.find("schemaSpec").append($(es).attr({ident: currentMember, module: currentModule, mode: "change"}));
            }
        }
    });

    out = new XMLSerializer().serializeToString(xmlDoc);
    xml = out;
}

//This function is used to show the name of all the projects that are saved to the browser.
 function doShowProjects() {
   var key = '',
        pairs = '',
        i=0;
    for (i=0; i <= localStorage.length-1; i++) {
        key = localStorage.key(i);
        if (key.split("%*$&#")[0] != "proj") {
        }
        else {
            pairs += "<tr><td class='fname'>"+key.split("%*$&#")[1]+"</td><td><span class='button load'>Load</span><td><span class='button delete'>Delete</span></tr>\n";
        }
    }
    if (pairs != "") {
        $('#items_table').html('<table>' + pairs + '</table>');
    }
 }

  function doShowDatabases(){
   var key = '',
    pairs = '',
    i=0;
   for (i=0; i <= localStorage.length-1; i++) {
        key = localStorage.key(i);
        if (key.split('%*$&#')[0] != 'tei'){
        }
        else{
            pairs += "<tr><td class='fname'>" + key.split('%*$&#')[1] + "</td><td><span class='button loadDatabase'>Load</span><td><span class='button deleteDatabase'>Delete</span></tr>\n";
        }
    }
    if (pairs != '') {
        $('#teiitems_table').html('<table>' + pairs + '</table>');
    }
}
// Loads the default TEI that Sebastian created.
function loadDefaultTEI(){
    if (localStorage.getItem("tei%*$&#Default") === null){
        $.ajax({
            url: defaultDatabase,
            dataType: 'jsonp',
            jsonpCallback: 'teijs',
            success: function(data) {
                localStorage.setItem("tei%*$&#Default", JSON.stringify(data, null, 2));
            }
        });
    }
    else {
        TEI = JSON.parse(localStorage.getItem("tei%*$&#Default"));
    }
}

function checkFileSupport() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //  alert("Great success! All the File APIs are supported.");
    }
    else {
        alert('The File APIs are not fully supported in this browser.');
    }
}

function showFiles(files, listContainer) {
     // files is a FileList of File objects. List some properties.
     var i, f, reader, output = [];
     for (i = 0; f = files[i]; i++) {
         output.push(
            '<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
             f.size, ' bytes, last modified: ',
             f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
             '</li>'
         );
         reader = new FileReader();
         // Closure to capture the file information.
         reader.onload = (function(theFile) {
            return function(e) {
                $('#inputarea').html(this.result);
            };
         }(f));
         // Read in the file data
         reader.readAsText(f);
     }
     $('#' + listContainer).html('<ul>' + output.join('') + '</ul>');
 }

// Creates the report page
function makeReport () {
    var items;
    if (filename != '') {
        $("#repFilename").text("Filename: " + filename);
    }
    if (title != '') {
        $("#repTitle").text("Title: " + title);
    }
    if (author != '') {
        $("#repAuthor").text("Author: " + author);
    }
    if (description != '') {
        $("#repDescription").text("Description: " + description);
    }
    if (language != '') {
        $("#repLanguage").text("Language: " + language);
    }
    $("#repMethod").text("Method " + method);
    if (AddedModules.length > 0) {
        $("#repModulesTag").text("Modules Added:");
        $("#repModules").empty();
        items = [];
        setXML();
        xmlDoc = $.parseXML(xml);
        $xml = $(xmlDoc);

        $xml.find("moduleRef").each(function(i, element) {
            var module = element.getAttribute('key');
            items.push('<li>' + module + '</li>');
        });

        $('#repModules').append($('<ul/>', {
            'class': 'repModules',
            html: items.join('')
        }));
    }
    if (ExcludedMembers.length > 0) {
        $("#repElementsTag").text("Elements Excluded:");
        $("#repElements").empty();
        items = [];
        setXML();
        xmlDoc = $.parseXML(xml);
        $xml = $(xmlDoc);

        $xml.find("moduleRef").each(function(i, element) {
            var elementArray,
                module = element.getAttribute('key'),
                elementList = element.getAttribute("except");
            if (elementList != null) {
                elementArray = elementList.split(" ");
                if (elementArray.length > 1){
                    items.push('<dl><dt>Elements excluded in ' + module + ":</dt>");
                    $.each(elementArray, function(i, singleElement) {
                        if (singleElement != ""){
                            items.push('<dd>- ' + singleElement + '</dd>');
                        }
                    });
                    items.push('</dl>');
                }
            }
        });
        $('#repElements').append($('<ul/>', {
            'class': 'repElements',
            html: items.join('')
        }));
    }
    if (ExcludedAttributes.length > 0) {
        $("#repAttributesTag").text("Attributes Excluded:");
        $("#repAttributes").empty();
        items = [];
        setXML();
        xmlDoc = $.parseXML(xml);
        $xml = $(xmlDoc);
        $xml.find("elementSpec").each(function(i, layer) {
            var module = layer.getAttribute('module'),
                element = layer.getAttribute('ident');
            items.push('<dl><dt>Attributes excluded in element: ' + element + ' in module: ' + module + '</dt>');
            $(this).find("attDef").each(function(i, attributeLayer){
                var attribute = attributeLayer.getAttribute("ident");
                items.push('<dd>- ' + attribute + '</dd>');
            });
            items.push('</dl>');
        });
        $('#repAttributes').append($('<ul/>', {
            'class': 'repAttributes',
            html: items.join('')
        }));
    }
}

function editInfo () {
    if ($("#title").val() != ""){
        title = $("#title").val();
    }
    else {
        title = "My TEI Extension";
    }
    if ($("#filename").val() != ""){
        filename = $("#filename").val();
    }
    else {
        filename = 'myTEI';
    }
    if ($("#author").val() != ""){
        author = $("#author").val();
    }
    else {
        author = 'generated by Byzantium ' + VERSION;
    }
    if ($("#description").val() != "") {
        description = $("#description").val();
    }
    else {
        description = "My TEI Customization starts with modules tei, core, textstructure and header";
    }
    language = $("#languageSelect").val();
    method = $("#methodSelect").val();
}

function makePreview() {
    setXML();
    $('#Preview').html("<pre>" + xml.replace(/</g,'\n&lt;') + "</pre>");
}

// READY FUNCTION.
$(function(){
    if (localStorage.getItem("tei%*$&#Default") === null) {
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

    $("span.newProject").click(function() {
        cleanSystem();
        AddedModules = [];
        AddedModules.push("core");
        AddedModules.push("tei");
        AddedModules.push("header");
        AddedModules.push("textstructure");
        showNewModules();
        $("#tabs").tabs("select", 1);
    });

    $("span.saveStartInfo").click(function(){
        editInfo();
        $("#tabs").tabs("select", 2);
    });


    $("span.TEI_Default").click(function(){
        loadDefaultTEI();
        status("Default database loaded");
        $("#tabs").tabs("select", 3);
    });

    $("span.setOnline").click(function() {
        var TEIurl= $('#TEI_OnlineSelector').val(),
            name = $('#TEI_OnlineName').val();
        teiName = name;
        if ((TEIurl != "") && (name != "")) {
            $.when($.ajax({
                url: TEIurl,
                dataType: 'jsonp',
                jsonpCallback: 'teijs',
                success: function(data) {
                   localStorage.setItem("tei%*$&#"+name, JSON.stringify(data, null, 2));
                }
            })).done(function() {
                $("#tabs").tabs("select", 3);
            });
        }
        status(TEIurl + " database loaded");
        $("#tabs").tabs("select", 3);
        doShowDatabases();
    });

    $('span.loadProject').click(function(){
        url = defaultDatabase;
        loadTEI();
        doShowProjects();
            $("#tabs").tabs("select", 2);
    });

    //Used to save a project to the browser.
    $("span.save").click(function() {
        var data, name = $("#saveAs").val();
        if (name == ''){
        }
        else{
            setXML();
            data = xml;
            localStorage.setItem("proj%*$&#"+name, data);
        }
        doShowProjects();
    });

    //Used to load a project from the browser.
    $("span.load").click(function () {
        var l,
            name = $(this).parent().parent().children('td.fname').text(),
            data = localStorage.getItem('proj%*$&#'+name);
        loadFile(data.replace(/&/g,"&amp;"));
        if (teiName != "undefined" && teiName != null) {
            l = localStorage.getItem("tei%*$&#" + teiName);
            if (l != null) {
                TEI = JSON.parse(l);
            }
            else{
                loadDefaultTEI();
            }
        }
        else {
            loadDefaultTEI();
        }
        showNewModules();
        $("#tabs").tabs("select", 2);
    });

    $("span.delete").click(function(){
        var name = $(this).parent().parent().children('td.fname').text();
        localStorage.removeItem("proj%*$&#" + name);
        doShowProjects();
    });

    $('span.output').click(function() {
        var f, target, oxgproperties, value = $("#outputSelection").val();
        switch (value) {
            case 'TEI ODD':
                target='TEI:text:xml/xml:application:xml'; break;
            case 'RELAX NG Compact Schema':
                target = 'ODD:text:xml/ODDC:text:xml/rnc:application:relaxng-compact'; break;
            case 'RELAX NG Schema':
                target = 'ODD:text:xml/ODDC:text:xml/relaxng:application:xml-relaxng'; break;
            case 'XSD Schema':
                target = 'ODD:text:xml/ODDC:text:xml/xsd:application:xml-xsd'; break;
            case 'ISO Schematron':
                target = 'ODD:text:xml/ODDC:text:xml/isosch:text:xml'; break;
            case 'Schematron':
                target = 'ODD:text:xml/ODDC:text:xml/sch:text:xml'; break;
            case 'DTD':
                target = 'ODD:text:xml/ODDC:text:xml/dtd:application:xml-dtd'; break;
            case 'HTML documentation':
                target = 'ODD:text:xml/ODDC:text:xml/oddhtml:application:xhtml+xml'; break;
            case 'ePub documentation':
                target = 'ODD:text:xml/ODDC:text:xml/TEI:text:xml/epub:application:epub+zip/'; break;
            case 'JSON':
                target = 'ODD:text:xml/ODDC:text:xml/oddjson:application:json'; break;
        }
        target = encodeURIComponent(target);
        oxgproperties ="?properties=<conversions><conversion%20index='0'><property%20id='pl.psnc.dl.ege.tei.profileNames'>tei</property></conversion><conversion%20index='1'><property%20id='pl.psnc.dl.ege.tei.profileNames'>tei</property><property%20id='oxgarage.textOnly'>true</property><property%20id='oxgarage.lang'>" + language +  "</property></conversion></conversions>";
        setXML();
        f = document.createElement('form');
        f.id="outputFormMulti";
        status("Send request to " + OXGARAGE + "Conversions/" + target + "/" + oxgproperties);
        f.action = OXGARAGE + "Conversions/" + target + "/" + oxgproperties;
        f.method = "post";
        f.innerHTML += "<textarea name='input' style='display:none;'>default</textarea>";
        if (filename != "") {
            f.innerHTML += "<input name='filename' value='" + filename + "' style='display:none;'/>";
        }
        else {
            f.innerHTML += "<input name='filename' value='" + "myTEI" + "' style='display:none;'/>";
        }
        document.getElementsByTagName("body")[0].appendChild(f);
        document.getElementsByName("input")[0].value=xml;
        f.submit();
        $('#outputFormMulti').remove();
    });


    // CLICK BUTTON EVENT FOR ADDING/REMOVING ELEMENT
    $('span.addRemove').click(function() {
        var action;
        name = $(this).attr('id');
        action = $(this).html();
        if (action == "Exclude"){
            ExcludedMembers.push(name);
            $(this).html("Include");
        }
        if (action == "Include"){
            ExcludedMembers.splice($.inArray(name, ExcludedMembers),1);
            $(this).html("Exclude");
        }
        showmembers(name.split(',')[0]);
    });


    //CLICK BUTTON EVENT FOR ADDING/REMOVING ATTRIBUTE
    $('span.addRemoveAttribute').click(function() {
        var action;
        name = $(this).attr('id');
        action = $(this).html();
        if (action == "Exclude"){
            ExcludedAttributes.push(name);
            $(this).html("Include");
        }
        if (action == "Include"){
            ExcludedAttributes.splice($.inArray(name, ExcludedAttributes),1);
            $(this).html("Exclude");
        }
        showattributes(name.split(',')[1]);
    });

    //CLICK BUTTON EVENT FOR VIEWING ELEMENTS

    $('span.modulelink').click(function() {
        showmembers($(this).text());
        $("#tabs").tabs("select", 4);
        return false;
    });


    // CLICK BUTTON EVENT FOR VIEWING ATTRIBUTES
    $('span.memberlink').click(function(){
        showattributes($(this).text());
        $("#tabs").tabs("select", 5);
        return false;
    });

    $('span.attributelink').click(function() {
        alterattributes($(this).attr("id"));
        $("#tabs").tabs("select", 6);
        return false;
    });

    // CLICK BUTTON EVENT FOR ADDING MODULE
    $('span.addModule').click(function() {
        var index, exists = false;
        name = $(this).attr('id');
        index = $.inArray(name.substring(0, name.length - 1), AddedModules);
        if(index == -1) {
            AddedModules.push(name.substring(0, name.length - 1));
        }
        showModules();
        showNewModules();
    });

    // CLICK BUTTON EVENT FOR REMOVING MODULE
    $('span.removeModule').click(function() {
        var exists = false;
        name = $(this).attr('id');
        if ($.inArray(name.substring(0, name.length - 1), AddedModules) != -1) {
            AddedModules.splice($.inArray(name.substring(0, name.length - 1), AddedModules),1);
        }
        showModules();
        showNewModules();
    });

    $('span.continueToLoad').click(function() {
        var l, xmldata = $("#inputarea").val();
        xml = xmldata.replace(/&/g, '&amp;');
        givenXML = xml;
        loadFile(xml);
        if (teiName != "undefined" && teiName != null) {
            l = localStorage.getItem("tei%*$&#" + teiName);
            if (l != null) {
                TEI = JSON.parse(l);
            }
            else {
                loadDefaultTEI();
            }
        }
        else {
            loadDefaultTEI();
        }
        $('#actions').show();
        showNewModules();
        $("#tabs").tabs("select", 3);
    });

    $('span.loadCustomJSON').click(function() {
        eval($('#inputarea').val());
        teiName = $("#TEI_LocalName").val();
        showNewModules();
        $('#actions').show();
        status(teiName + ' database loaded');
        $("#tabs").tabs("select", 3);
    });

    $('span.outputXML').click(function() {
    });

    $('span.saveAttributeInfo').click(function() {
        var closeOpen = '', values, index = -1;
        if ($("#listOfValues").val() == "") {
            return;
        }
        values = $("#attributeIdent").text().replace(/;/g,",");
        values += ',' + $("#listOfValues").val();
        $.each(ListofValues, function(i, listValue) {
            if (values.split(',')[1] == listValue.split(',')[1] && values.split(',')[2] == listValue.split(',')[2] && values.split(',')[3] == listValue.split(',')[3]){
                index = i;
            }
        });
        if (index != -1) {
            ListofValues[index] = values;
        }
        else {
            ListofValues.push(values);
        }

        if ($(".closedOrOpen").html() == "Closed List") {
            closeOpen = "closed,";
        }
        else {
            closeOpen = "open,";
        }
        closeOpen +=  $("#attributeIdent").text().replace(/;/g,",");
        index = -1;
        $.each(closedAndOpen, function(i, value) {
            if (value.split(',')[2] == closeOpen.split(',')[2] && value.split(',')[3] == closeOpen.split(',')[3] && value.split(',')[4] == closeOpen.split(',')[4]){
                index = i;
            }
        });
        if (index != -1) {
            closedAndOpen[index] = closeOpen;
        }
        else {
            closedAndOpen.push(closeOpen);
        }
    });
    $('span.closedOrOpen').click(function() {
        if ($(".closedOrOpen").html() == "Open List"){
            $(".closedOrOpen").html("Closed List");
        }
        else{
            $(".closedOrOpen").html("Open List");
        }
    });
    $('span.restart').click(function() {
        $('#projectSelection').show();
        $('#actions').hide();
        $('#UploadCustom').hide();
        $('#OnlineSelector').hide();
        $('#ExistingSelector').hide();
        $('#selected').empty();
        $('#selected').show();
        cleanSystem();
    });

    $('span.loadDatabase').click(function() {
        var thisname = $(this).parent().parent().children('td.fname').text(),
            l = localStorage.getItem("tei%*$&#" + thisname);
        if (l != null) {
            TEI = JSON.parse(l);
        }
        else {
            loadDefaultTEI();
        }
        status(thisname + ' database loaded');
        doShowDatabases();
        $("#tabs").tabs("select", 3);
    });

    $('span.deleteDatabase').click(function() {
        var name = $(this).parent().parent().children('td.fname').text();
        localStorage.removeItem("tei%*$&#" + name);
        doShowDatabases();
    });
});

// EXPORTS
window.checkFileSupport = checkFileSupport;
window.editInfo = editInfo;
window.doShowDatabases = doShowDatabases;
window.showModules = showModules;
window.makeReport = makeReport;
window.makePreview = makePreview;

}());
