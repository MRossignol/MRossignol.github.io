
function PresetsSelector (presets, rootDiv, getCurrentState, onPresetSelect) {

  var savedPresetsPosition = null;
  var selectedPresetPosition = 0;

  var presetsHolder = document.createElement('div');
  presetsHolder.classList.add('presetsHolder');
  var presetsList = document.createElement('div');
  presetsList.classList.add('presetsList');
  var exportButton = document.createElement('input');
  exportButton.type = 'button';
  exportButton.classList.add('presetsExport');
  exportButton.value = 'Export presets to file';
  rootDiv.appendChild(presetsHolder);
  presetsHolder.appendChild(presetsList);
  rootDiv.appendChild(exportButton);

  function fillPresetsList() {
    var allItems = [{name: 'Presets'}, {name: 'Save new...'}].concat(presets.entries);
    while (presetsList.firstChild)
      presetsList.removeChild(presetsList.lastChild);
    allItems.forEach( function(preset, index) {
      console.log(preset.name);
      var item = document.createElement('div');
      item.classList.add('presetItem');
      item.innerText = preset.name;
      item.addEventListener('click', function() {
	presetClicked(preset, index);
      });
      presetsList.appendChild(item);
    });
  }

  function openPresets () {
    savedPresetsPosition = presetsHolder.getBoundingClientRect();
    presetsHolder.style.position = 'absolute';
    presetsHolder.style.zIndex = 1000;
    presetsHolder.style.top = savedPresetsPosition.top+'px';
    presetsHolder.style.left = savedPresetsPosition.left+'px';
    presetsHolder.style.height = savedPresetsPosition.height+'px';
    setTimeout(function() {
      var presetsListDimensions = presetsList.getBoundingClientRect();
      presetsHolder.style.height = presetsListDimensions.height+'px';
      presetsList.style.top = '0px';
      document.addEventListener('click', closePresets);
    });
  }

  function closePresets () {
    presetsHolder.style.top = savedPresetsPosition.top+'px';
    presetsHolder.style.left = savedPresetsPosition.left+'px';
    presetsHolder.style.height = savedPresetsPosition.height+'px';
    presetsList.style.top = (-34*selectedPresetPosition-5)+'px';
    savedPresetsPosition = null;
    document.removeEventListener('click', closePresets);
  }

  function presetClicked (preset, index) {
    if (savedPresetsPosition) {
      switch(index) {
      case 0:
	break;
      case 1:
	var newName = prompt('Please give a name to save the current settings as a new preset');
	if (newName != null && newName.length > 0) {
	  selectedPresetPosition = presets.save(newName, getCurrentState()) + 2;
	  fillPresetsList();
	}
	break;
      default:
	selectedPresetPosition = index;
	onPresetSelect(preset);
      }
      closePresets();
    }
    else openPresets();
  }

  function exportPresets () {
    var fileName = ' reverb-presets-export-'+
	+ new Date().toLocaleString().replace(/\//g, '-').replace(',', '').replace(' AM', 'am').replace(' PM', 'pm')
	+ '.json';
    const elem = window.document.createElement('a');
    elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(presets.entries)));
    elem.download = fileName;
    elem.style.visibility = 'hidden';
    document.body.appendChild(elem);
    elem.click();        
    document.body.removeChild(elem);
  }

  this.loadPreset = function(name) {
    let position = presets.entries.findIndex(function(item) {return item.name.toLowerCase() == name.toLowerCase();});
    if (position != -1) {
      openPresets();
      setTimeout(function() {
	presetClicked(presets.entries[position], position+2);
      });
    }
  };
  
  exportButton.addEventListener('click', exportPresets);
  
  fillPresetsList();
}
