class WebAudio {

  ac = null;

  waitingConnections = [];
  nodes = {};
  currentNodeNum = 0;

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
  }

  
  makeNode (nodeType, options, outputs, name) {
    if (!name) {
      name = `node_${++currentNodeNum}`;
    }
    var node;
    switch(nodeType) {
    case 'analyzer':
      node = new AnalyserNode(this.ac, options);
      break;
    case 'bufferSource':
      node = new AudioBufferSourceNode(this.ac, options);
      break;
    case 'worklet':
      node = new AudioWorkletNode(this.ac, options.script, options);
      break;
    case 'filter':
      node = new BiquadFilterNode(this.ac, options);
      break;
    case 'merger':
      if (!options.numberOfInputs) options.numberOfInputs = 2;
      node = new ChannelMergerNode(this.ac, options);
      break;
    case 'splitter':
      if (!options.numberOfOutputs) options.numberOfOutputs = 2;
      node = new ChannelSplitterNode(this.ac, options);
      break;
    case 'constant':
      node = new ConstantSourceNode(this.ac, options);
      break;
    case 'convolver':
      node = new ConvolverNode(this.ac, options);
      break;
    case 'delay':
      node = new DelayNode(this.ac, options);
      break;
    case 'compressor':
      node = new DynamicsCompressorNode(this.ac, options);
      break;
    case 'gain':
      node = new GainNode(this.ac, options);
      break;
    case 'iirFilter':
      node = new IIRFilterNode(this.ac, options);
      break;
    case 'mediaSource':
      node = new MediaElementAudioSourceNode(this.ac, options);
      break;
    case 'oscillator':
      node = new OscillatorNode(this.ac, options);
      break;
    case 'pan':
      node = new PannerNode(this.ac, options);
      break;
    case 'waveShaper':
      node = new WaveShaperNode(this.ac, options);
      break;
    case 'simplePan':
      node = new StrereoPannerNode(this.ac, options);
      break;
    }
    if (!node) {
      return null;
    }
    if (this.nodes.hasOwnProperty(name)) {
      console.warn(`Warning, name "${name}" is used twice in the node graph, this will probably not work.`);
    }
    this.nodes[name] = node;
    if (!Array.isArray(outputs) || outputs.length==3 && Number.isInteger(outputs[1])) {
      outputs = [outputs];
    }
    for (let output of outputs) {
      if (Array.isArray(output)) {
	if (typeof(output[0]) == 'str') {
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
	if (typeof(output) == 'str') {
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
    resolveWaitingOutputs(namedNodes, waitingOutputs);
    return node;
  };
  

  const resolveWaitingOutputs = (namedNodes, waitingOutputs) => {
    for (let connection in waitingOutputs) {
      if (!namedNodes[connection.dst]) {
	console.warn(`Warning, name "${connection.dst}" is referred to as a destination but not found in the graph.`);
	continue;
      }
      if (connection.hasOwnProperty('srcChannel')) {
	connection.src.connect(namedNodes[connection.dst], connection.srcChannel, connection.dstChannel);
      } else {
	connection.src.connect(namedNodes[connection.dst]);
      }
    }
  };

  
  
})()
