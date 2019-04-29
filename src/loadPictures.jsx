//pref pixels
app.preferences.rulerUnits = Units.PIXELS;

// call the target document
var targetDoc = app.activeDocument;

// Select PHOTOS folder
var inFolder = Folder.selectDialog("Please select folder to process");
if (inFolder != null)
{
  var fileList = inFolder.getFiles(/\.(jpg|png)$/i);
}
else
{
  alert('no directory selected');
}

// Make lowest layer active, in order to place pictures beneath other layers 
getMeThisLayer("Background");

// main loop starts here
for(var i = 0; i < fileList.length; i++)
{
  createLayerBelowCurrent("blank");

  pushImageToDocument(fileList[i]);
}

function createNewLayer(name)
{
  var newLayer = app.activeDocument.artLayers.add();
  newLayer.name = name;
}

function pushImageToDocument(file)
{
  // open file
  var imgDoc = open(fileList[i]);

  // keep img name for futur use
  var imgName = app.activeDocument.name.replace(".jpg", "").replace(".png", "");

  //select img, copy & close
  activeDocument.selection.selectAll()
  activeDocument.selection.copy();
  app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);

  // Go back to target image
  activeDocument = targetDoc;

  // paste image as new layer to target document
  app.activeDocument.paste();

  // rename layer to image name
  app.activeDocument.activeLayer.name = imgName;

  // resize img layer to fit document canvas
  var maintainAspectRatio = true;  
  if (app.documents.length > 0) {
    app.activeDocument.suspendHistory('Fit Layer to Canvas', 'FitLayerToCanvas(' + maintainAspectRatio + ')');
  }

  // Move Layer to Right
  var layer = app.activeDocument.activeLayer;
  MoveLayerToRightEdge(layer);

  // hide img layer
  layer.visible = false;

  //deselect all
  activeDocument.selection.deselect();
}

//******************************************
// MOVE LAYER TO
// Author: Max Kielland
//
// Moves layer fLayer to the absolute
// position fX,fY. The unit of fX and fY are
// the same as the ruler setting. 

function MoveLayerToRightEdge(fLayer) {

  var Position = fLayer.bounds;

  Position[0] = app.activeDocument.width + Position[0] - Position[2];
  Position[1] = app.activeDocument.height + Position[1] - Position[3];
  Position[2] = app.activeDocument.width;
  Position[3] = app.activeDocument.height;

  fLayer.translate(Position[0],Position[1]);
}

function getMeThisLayer(aLayerName)
{
  try
  {
    // try to find the layer
    app.activeDocument.activeLayer = app.activeDocument.layers.getByName(aLayerName)
    return
  }

  catch(e)
  {
    //Whoops can't find layer
    alert("Can't find layer " + aLayerName + "\n" + e)
  }
}

function createLayerBelowCurrent(name) {
  var currentActivelayer = app.activeDocument.activeLayer;
  var idx = getLayerIndex(currentActivelayer);

  // Get a reference to the active layer
  var layerRef = app.activeDocument.layers[idx];

  // Create a new Art Layer, by default at the top of the document
  var newLayerRef = app.activeDocument.artLayers.add();
  newLayerRef.name = name

  // Move the new layer set to after the previously first layer
  newLayerRef.move(layerRef, ElementPlacement.PLACEAFTER);
}


function getLayerIndex(ref) {
  // return the idex of ALL layers
  var numOfLayers = app.activeDocument.layers.length;

  // work from the top of the stack down!
  for (var i = numOfLayers - 1; i >= 0; i--) {
    var tempLayer = app.activeDocument.layers[i];
    if (tempLayer == ref) return i

    if (tempLayer.typename == "LayerSet") {
      var subDoc = app.activeDocument.layers[i];
      for (var j = numOfSubLayers - 1; j >= 0; j--) {
        var tempSubLayer = subDoc.layers[j]
        if (tempSubLayer == ref) return j
      }
    }
  }
}

// FIT LAYER TO CANVAS
// via https://forums.adobe.com/message/5413957#5413957
function FitLayerToCanvas(keepAspect) {// keepAspect:Boolean - optional. Default to false  
  var doc = app.activeDocument;
  var layer = doc.activeLayer;
  // do nothing if layer is background or locked  
  if (layer.isBackgroundLayer || layer.allLocked || layer.pixelsLocked
    || layer.positionLocked || layer.transparentPixelsLocked) return;
  // do nothing if layer is not normal artLayer or Smart Object  
  if (layer.kind != LayerKind.NORMAL && layer.kind != LayerKind.SMARTOBJECT) return;
  // store the ruler  
  var defaultRulerUnits = app.preferences.rulerUnits;
  app.preferences.rulerUnits = Units.PIXELS;

  var width = doc.width.as('px');
  var height = doc.height.as('px');
  var bounds = app.activeDocument.activeLayer.bounds;
  var layerWidth = bounds[2].as('px') - bounds[0].as('px');
  var layerHeight = bounds[3].as('px') - bounds[1].as('px');

  // move the layer so top left corner matches canvas top left corner  
  layer.translate(new UnitValue(0 - layer.bounds[0].as('px'), 'px'), new UnitValue(0 - layer.bounds[1].as('px'), 'px'));
  if (!keepAspect) {
    // scale the layer to match canvas  
    layer.resize((width / layerWidth) * 100, (height / layerHeight) * 100, AnchorPosition.TOPRIGHT);
  } else {
    var layerRatio = layerWidth / layerHeight;
    var newWidth = width;
    var newHeight = ((1.0 * width) / layerRatio);
    if (newHeight >= height) {
      newWidth = layerRatio * height;
      newHeight = height;
    }
    var resizePercent = newWidth / layerWidth * 100;
    app.activeDocument.activeLayer.resize(resizePercent, resizePercent, AnchorPosition.TOPLEFT);
  }
  // restore the ruler  
  app.preferences.rulerUnits = defaultRulerUnits;
}  