class WebAudio {

  ac = null;
  destination = null;

  waitingConnections = [];
  nodes = {};
  currentNodeNum = 0;

  knownTypes = [
    'analyzer', 'bufferSource', 'worklet', 'filter', 'merger', 'splitter',
    'constant', 'convolver', 'delay', 'compressor', 'gain', 'iirFilter',
    'mediaSource', 'oscillator', 'pan', 'waveShaper', 'simplePan'
  ];

  constructor(source) {
    if (source) {
      if (source instanceof AudioContext || source instanceof OfflineAudioContext) {
	// "source" is already an AudioContext
	this.ac = source;
      } else if (source instanceof WebAudio) {
	// "source" is another WebAudio object
	this.ac = source.ac;
      } else {
	// "source" is an options object
	this.ac = new AudioContext(source);
      }
    } else {
      this.ac = new AudioContext();
    }
    this.destination = this.ac.destination;
    for (let nodeType of this.knownTypes) {
      this[nodeType] = function() {
	return this._makeNode(nodeType, ...this._parseArguments(arguments));
      };
    }
  }

  resume () {
    this.ac.resume();
  }
  
  loadBuffer (source) {
    const me = this;
    if (source instanceof File) {
      return new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.onload = function(ev) {
	  me.ac.decodeAudioData(ev.target.result).then(resolve);
	};
	reader.readAsArrayBuffer(source);
      });
    } else {
      return new Promise((resolve, reject) => {
	fetch(source, {'mode': 'no-cors'})
	  .then(response => response.arrayBuffer())
	  .then(arrayBuffer => me.ac.decodeAudioData(arrayBuffer))
	  .then(resolve);
      });
    }
  }

  setParameterCurve(param, type, curve) {
    const methodName = (type && type.startsWith('exp')) ? 'exponentialRampToValueAtTime' : 'linearRampToValueAtTime';
    for (let point of curve) {
      param[methodName](point[0], point[1]);
    }
  }
  
  //////////////
  // INTERNAL //
  //////////////
  
  _makeNode (nodeType, name, options, outputs) {
    if (!name) {
      name = `node_${++this.currentNodeNum}`;
    }
    const node = this._createNodeBase(nodeType, options);
    if (!node) return null;
    if (this.nodes.hasOwnProperty(name)) {
      console.warn(`Warning, name "${name}" is used twice in the node graph, this will probably not work.`);
    }
    this.nodes[name] = node;
    if (!outputs) {
      outputs = [];
    } else if (!Array.isArray(outputs) || outputs.length==3 && Number.isInteger(outputs[1])) {
      outputs = [outputs];
    }
    for (let output of outputs) {
      this._connect(node, output);
    }
    this._resolveWaitingOutputs(node, name);
    return node;
  };

  _createNodeBase(type, options) {
    switch(type) {
    case 'analyzer': return new AnalyserNode(this.ac, options);
    case 'bufferSource': return new AudioBufferSourceNode(this.ac, options);
    case 'worklet': return new AudioWorkletNode(this.ac, options.script, options);
    case 'filter': return new BiquadFilterNode(this.ac, options);
    case 'constant': return new ConstantSourceNode(this.ac, options);
    case 'convolver': return new ConvolverNode(this.ac, options);
    case 'delay': return new DelayNode(this.ac, options);
    case 'compressor': return new DynamicsCompressorNode(this.ac, options);
    case 'gain': return new GainNode(this.ac, options);
    case 'iirFilter': return new IIRFilterNode(this.ac, options);
    case 'mediaSource': return new MediaElementAudioSourceNode(this.ac, options);
    case 'oscillator': return new OscillatorNode(this.ac, options);
    case 'pan': return new PannerNode(this.ac, options);
    case 'waveShaper': return new WaveShaperNode(this.ac, options);
    case 'simplePan': return new StrereoPannerNode(this.ac, options);
    case 'merger':
      if (!options.numberOfInputs) options.numberOfInputs = 2;
      return new ChannelMergerNode(this.ac, options);
    case 'splitter':
      if (!options.numberOfOutputs) options.numberOfOutputs = 2;
      return new ChannelSplitterNode(this.ac, options);
    }
    return null;
  }
  
  _connect(node, output) {
    if (Array.isArray(output)) {
      if (typeof(output[0]) == 'string') {
	if (this.nodes[output[0]]) {
	  node.connect(this.nodes[output[0]], output[1], output[2]);
	} else {
	  this.waitingConnections.push({
	    src: node,
	    dst: output[0],
	    srcChannel: output[1],
	    dstChannel: output[2]
	  });
	}
      } else {
	node.connect(output[0], output[1], output[2]);
      }
    } else {
      if (typeof(output) == 'string') {
	if (this.nodes[output]) {
	  node.connect(this.nodes[output]);
	} else {
	  this.waitingConnections.push({
	    src: node,
	    dst: output
	  });
	}
      } else {
	node.connect(output);
      }
    }
  }

  _resolveWaitingOutputs(node, name) {
    this.waitingConnections = this.waitingConnections.filter((connection) => {
      if (connection.dst != name) {
	return true;
      }
      if (connection.srcChannel) {
	connection.src.connect(node, connection.srcChannel, connection.dstChannel);
      } else {
	connection.src.connect(node);
      }
      return false;
    });
  }

  _parseArguments(args) {
    let name = null, options = {}, outputs = [];
    switch(args.length) {
    case 0:
      return [null, {}, []];
    case 3:
      return [args[0], args[1], args[2]];
    case 1:
      if (typeof(args[0]) == 'string' || args[0] instanceof AudioNode)
	return [null, {}, args[0]];
      else
	return [null, args[0], null];
    case 2:
    default:
      let pos = 0;
      if (typeof(args[0]) == 'string') {
	if (typeof(args[1]) == 'string' || args[1] instanceof AudioNode)
	  return [args[0], {}, args[1]];
	else
	  return [null, args[0], args[1]];
      } else {
	return [null, args[0], args[1]];
      }
    }
  }
  
}
