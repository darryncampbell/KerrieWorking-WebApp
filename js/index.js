/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */



var kerrieId = 9747;
var thirtyMinuteTreatmentId = 31148;
var g_guid = "";

function ajaxRequest(guid, url, method, parameters, async, functionToCall, parseDaysAhead)
{
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var response = xmlhttp.responseText;
			//console.log(response);
			//document.getElementById('output').innerHTML = response;
			if (guid == "init")
			{
				//  Need to obtain the Guid from the response
			if (window.DOMParser)
			  {
			  parser=new DOMParser();
			  xmlDoc=parser.parseFromString(response,"text/html");
			  }
//			else // code for IE
//			  {
//			  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
//			  xmlDoc.async=false;
//			  xmlDoc.loadXML(response);
//			  }
			  var guidNode = xmlDoc.getElementById('OnlineBookingGuid');
			  console.log(guidNode.value);
			  if (guidNode != null){
				g_guid = guidNode.value;
				guid = g_guid;
			}
			}
			functionToCall(guid, response, parseDaysAhead);
		}
	}
	xmlhttp.open(method, url, async);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send(parameters);
	return "";
}


function test()
{
}

function getGuid()
{
	var url  = "http://book.gettimely.com/Booking/Location/bodyimagebeautysalons";
	var guid = "init";
	ajaxRequest(guid, url, "GET", "", true, postSalon);
}

function postSalon(guid)
{
	var url  = "http://book.gettimely.com/Booking/Location/bodyimagebeautysalons";
	ajaxRequest(guid, url, "POST", "ResellerCode=&OnlineBookingGuid=" + guid + "&LocationId=5875", true, request30MinuteTreatment)
}

function request30MinuteTreatment(guid)
{
	var url  = "http://book.gettimely.com/Booking/Service?obg=" + guid;
	ajaxRequest(guid, url, "POST", "OnlineBookingMultiServiceEnabled=True&LocationId=0&ServiceIds=" + thirtyMinuteTreatmentId, true, getAvailableDatesForTreatment);
}

function getAvailableDatesForTreatment(guid)
{
	var theMonth = new Date().getMonth() + 1;
	var theYear = new Date().getFullYear();
	var url  = "http://book.gettimely.com/Booking/GetOpenDates?obg=" + guid + "&month=" + theMonth + "&year=" + theYear + "&staffId=" + kerrieId;
	ajaxRequest(guid, url, "GET", "", true, getTodaysBookings)
}

function getTodaysBookings(guid, availableSlots)
{
	var d = new Date(new Date().getTime());
	var theDay   = ("00" + d.getDate()).slice(-2);
	var theMonth = ("00" + (d.getMonth()+1)).slice(-2);
	var theYear = d.getFullYear();
	console.log(theDay + "/" + theMonth + "/" + theYear);
	var url  = "http://book.gettimely.com/booking/gettimeslots/?obg=" + guid + "&dateSelected=" + theYear + "-" + theMonth + "-" + theDay + "&staffId=" + kerrieId + "&tzName=Europe/London&tzId=";
	ajaxRequest(guid, url, "GET", "", true, parseResponse, 0)
}

function getNextSevenDaysBookings(guid)
{
	var daysAhead = 1;
	while (daysAhead <= 8)
	{
		var d = new Date(new Date().getTime() + (daysAhead * 24 * 60 * 60 * 1000));
		var theDay   = ("00" + d.getDate()).slice(-2);
		var theMonth = ("00" + (d.getMonth()+1)).slice(-2);
		var theYear = d.getFullYear();
		console.log(theDay + "/" + theMonth + "/" + theYear);
		var url  = "http://book.gettimely.com/booking/gettimeslots/?obg=" + guid + "&dateSelected=" + theYear + "-" + theMonth + "-" + theDay + "&staffId=" + kerrieId + "&tzName=Europe/London&tzId=";
		ajaxRequest(guid, url, "GET", "", true, parseResponse, daysAhead)
		daysAhead++;
	}
}

function test()
{
	var d = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
	var theDay   = ("00" + d.getDate()).slice(-2);
	var theMonth = ("00" + d.getMonth()+1).slice(-2);
	var theYear = d.getFullYear();
	$("span").removeClass("glyphicon-refresh-animate");
}

function setSpinning()
{
$("span").addClass("glyphicon-refresh-animate");
}

function stopSpinning()
{
$("span").removeClass("glyphicon-refresh-animate");
}

function parseResponse(guid, response, parseDaysAhead)
{
if (window.DOMParser)
  {
  parser=new DOMParser();
  xmlDoc=parser.parseFromString(response,"text/html");
  }
//else // code for IE
//  {
//  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
//  xmlDoc.async=false;
//  xmlDoc.loadXML(response);
//  }

  if (response.indexOf("Session timeout") > -1)
  {
	//  Session has timed out, re-establish it:
	g_guid = "";
	pageLoad();
  }
  else
  {
  if (parseDaysAhead == 0)
	getNextSevenDaysBookings(g_guid);

	console.log(response);

	// Write the date heading
	var dayHeading = xmlDoc.getElementsByTagName("h3");
	var dayHeadingAsString = dayHeading[0].innerHTML;
	var actualDate = dayHeadingAsString.indexOf("Times available on ");
	console.log(actualDate);
	if (actualDate > -1)
	{
		dayHeadingAsString = dayHeadingAsString.substring("Times available on ".length, dayHeadingAsString.length);
	}

	document.getElementById("day" + parseDaysAhead + "Heading").innerHTML = "<H2>" + dayHeadingAsString + " slots free:</H2>";

	//  Write the available times
  var freeTimes = customerNode = xmlDoc.getElementsByTagName ("label").length;
  var timeList;
	if (freeTimes == 0)
		timeList = "<H3>No times available</H3>";
	else
		timeList = "<UL class='list-group'>"
  for (var i = 0; i < freeTimes; i++)
  {
	  var customerNode = xmlDoc.getElementsByTagName ("label")[i];
	  var nodeText = customerNode.innerHTML;
    console.log("DCC DEBUG: " + nodeText);
	  var n = nodeText.indexOf("<");
    var time = nodeText.substring(0, n);
	//  alert(customerNode.innerHTML);
		time = time.replace(/\r?\n|\r/g,"").trim();
		time = "<LI class='list-group-item'>" + time + "</LI>";
		console.log(time);
		timeList += time;
//		if (timeList == "")
//			timeList = time;
//		else
//			timeList = timeList + ", " + time;
	//	alert(time);
	}
	if (freeTimes > 0)
		timeList += "</UL>";
	document.getElementById("day" + parseDaysAhead + "Content").innerHTML = timeList;
	stopSpinning();

}
}

function pageLoad()
{
	setSpinning();
	//var phoneModel = device.model;
//	console.log("Phone Model: " + phoneModel);
//	document.getElementById("day0Heading").innerHTML = phoneModel;
	if (g_guid == "")
		g_guid = getGuid();
	else
		refreshData();
}

function refreshData()
{
	//  First just try and populate the sessions but if that has timed out then
	//  re-establish the session
	if (g_guid != "")
	{
		setSpinning();
		getTodaysBookings(g_guid, null);
	}
	else
	{
		pageLoad();
	}

}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        pageLoad();
		//var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }






};

app.initialize();
