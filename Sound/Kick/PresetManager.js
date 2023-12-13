
function PresetManager (storageKey, defaultPresets) {

  this.entries = defaultPresets;
  
  var localPresetsJson = window.localStorage.getItem(storageKey);
  if (localPresetsJson) this.entries = JSON.parse(localPresetsJson);

  
  this.save = function (name, values) {
    let newItem = {
      name: name,
      values: values
    };
    this.entries.push(newItem);
    this.entries.sort((item1, item2) => item1.name.localeCompare(item2.name));
    window.localStorage.setItem(storageKey, JSON.stringify(this.entries));
    return this.entries.indexOf(newItem);
  };
  
}
