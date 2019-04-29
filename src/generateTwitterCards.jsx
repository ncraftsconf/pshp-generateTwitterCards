// Photoshop twitter card generation script

#include "../lib/json2.js"

var speakerNameGroup = app.activeDocument.layers.getByName('NAME');
var sessionTitleGroup = app.activeDocument.layers.getByName('TITLE');
var dateGroup = app.activeDocument.layers.getByName('Date');
var hourGroup = app.activeDocument.layers.getByName('Hour');
var roomGroup = app.activeDocument.layers.getByName('Room');

alert('starting');

// Retrieve JSON
var sessions = loadJson('../data/sessions.json').sessions;

for (var key in sessions) 
{
	if (sessions.hasOwnProperty(key)) 
	{
		generateCard(sessions[key]);
	}
}

alert('finished');

function generateCard(cardData)
{
	// Update card text 
	speakerNameGroup.textItem.contents = cardData.speakerName;
	sessionTitleGroup.textItem.contents = insertLineBreak(cardData.title,28);
	dateGroup.textItem.contents = cardData.date;
	hourGroup.textItem.contents = cardData.time;
	roomGroup.textItem.contents = cardData.room;

	// make speaker's picture visible
	var speakerPhotoLayer;
	try {

		speakerPhotoLayer = getMeThisLayer(cardData.speakerPhoto);
		speakerPhotoLayer.visible = true;	
	} catch (error) {
		alert('error couldn\'t find speaker photo layer ' + cardData.speakerPhoto);
	}

	// hide speaker picture again
	if (speakerPhotoLayer != null)
	{
		// save card to disk
		saveJpeg('twitterCard-' + cardData.speakerPhoto);

		speakerPhotoLayer.visible = false;
	}	
}

function insertLineBreak(text,nbchars)
{
	for (var position=nbchars; position<text.length-1; position=position+nbchars)
	{
		position = findPrevSpace(text,position);
		text = [text.slice(0, position), '\r', text.slice(position)].join('');
	}
	return text;
}

function findPrevSpace(text, position)
{
	while (text[position]!=' ' && position > 0)
	{
		position = position-1;
	}

	return position+1;
}

function loadJson(relPath) {
	var script = new File($.fileName);
	var jsonFile = new File(script.path + '/' + relPath); 
	
	jsonFile.open('r');
	var str = jsonFile.read();
	jsonFile.close();

	return JSON.parse(str);
}

function saveJpeg(name) {
	var doc = app.activeDocument;

	var file = new File(doc.path + '/' + name + '.jpg');

	var options = new JPEGSaveOptions();
	options.quality = 5;
	doc.saveAs(file, options, true);
}


function getMeThisLayer(aLayerName)
{
  try
  {
    // try to find the layer
	app.activeDocument.activeLayer = app.activeDocument.layers.getByName(aLayerName)
	return app.activeDocument.activeLayer;
  }
  catch(e)
  {
    //Whoops can't find layer
	alert("Can't find layer " + aLayerName + "\n" + e);
	return;
  }
}