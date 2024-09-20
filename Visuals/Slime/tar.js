const constants = {
  /* eslint-disable key-spacing */

  NULL_CHAR: '\u0000',

  TMAGIC: 'ustar' + NULL_CHAR + '00',   // 'ustar', NULL, '00'
  OLDGNU_MAGIC: 'ustar  ' + NULL_CHAR,  // 'ustar  ', NULL

  // Values used in typeflag field.
  REGTYPE:  0,  // regular file
  LNKTYPE:  1,  // link
  SYMTYPE:  2,  // reserved
  CHRTYPE:  3,  // character special
  BLKTYPE:  4,  // block special
  DIRTYPE:  5,  // directory
  FIFOTYPE: 6,  // FIFO special
  CONTTYPE: 7,  // reserved

  // Bits used in the mode field, values in octal.
  TSUID: parseInt('4000', 8),  // set UID on execution
  TSGID: parseInt('2000', 8),  // set GID on execution
  TSVTX: parseInt('1000', 8),  // reserved

  // file permissions
  TUREAD:  parseInt('0400', 8),  // read by owner
  TUWRITE: parseInt('0200', 8),  // write by owner
  TUEXEC:  parseInt('0100', 8),  // execute/search by owner
  TGREAD:  parseInt('0040', 8),  // read by group
  TGWRITE: parseInt('0020', 8),  // write by group
  TGEXEC:  parseInt('0010', 8),  // execute/search by group
  TOREAD:  parseInt('0004', 8),  // read by other
  TOWRITE: parseInt('0002', 8),  // write by other
  TOEXEC:  parseInt('0001', 8),   // execute/search by other

  TPERMALL:  parseInt('0777', 8),   // rwxrwxrwx
  TPERMMASK: parseInt('0777', 8)    // permissions bitmask

  /* eslint-enable key-spacing */
};

const undef = (() => undefined)();

const utils = {

  MAX_SAFE_INTEGER: 9007199254740991,

  undefined: undef,

  isUndefined: (value) => value === undef,

  isString: value => (typeof value == 'string') || (Object.prototype.toString.call(value) == '[object String]'),

  isDateTime: value => Object.prototype.toString.call(value) == '[object Date]',

  isObject: value => (value !== null) && (typeof value == 'object'),

  isFunction: value => typeof value == 'function',

  isLength: value => (typeof value == 'number') && (value > -1) && (value % 1 == 0) && (value <= MAX_SAFE_INTEGER),

  isArray: value => Array.isArray(value),

  isArrayLike: value => utils.isObject(value) && !utils.isFunction(value) && utils.isLength(value.length),

  isArrayBuffer: value => Object.prototype.toString.call(value) == '[object ArrayBuffer]',

  map: (array, iteratee) => Array.prototype.map.call(array, iteratee),

  find: (array, iteratee) => {
    var result = undefined;

    if (utils.isFunction(iteratee)) {
      Array.prototype.every.call(array, function(item, index, array) {
        var found = iteratee(item, index, array);
        if (found) {
          result = item;
        }
        return !found;  // continue if not found
      });
    }

    return result;
  },

  extend: function (target /* ...sources */) {
    return Object.assign.apply(null, arguments);
  },

  toUint8Array: (value) => {
    var i;
    var length;
    var result;

    if (utils.isString(value)) {
      length = value.length;
      result = new Uint8Array(length);
      for (i = 0; i < length; i++) {
        result[i] = value.charCodeAt(i) & 0xFF;
      }
      return result;
    }

    if (utils.isArrayBuffer(value)) {
      return new Uint8Array(value);
    }

    if (utils.isObject(value) && utils.isArrayBuffer(value.buffer)) {
      return new Uint8Array(value.buffer);
    }

    if (utils.isArrayLike(value)) {
      return new Uint8Array(value);
    }

    if (utils.isObject(value) && utils.isFunction(value.toString)) {
      return utils.toUint8Array(value.toString());
    }

    return new Uint8Array();
  }
};





var types = require('./types');

function headerSize(file) {
  // header has fixed size
  return types.recordSize;
}

function dataSize(file) {
  // align to record boundary
  return Math.ceil(file.data.length / types.recordSize) * types.recordSize;
}

function allocateBuffer(files) {
  var totalSize = 0;

  // Calculate space that will be used by each file
  files.forEach(function(file) {
    totalSize += headerSize(file) + dataSize(file);
  });

  // TAR must end with two empty records
  totalSize += types.recordSize * 2;

  // Array SHOULD be initialized with zeros:
  // from TypedArray constructor docs:
  // > When creating a TypedArray instance (i.e. instance of Int8Array
  // > or similar), an array buffer is created internally
  // from ArrayBuffer constructor docs:
  // > A new ArrayBuffer object of the specified size.
  // > Its contents are initialized to 0.
  return new Uint8Array(totalSize);
}

function writeHeader(buffer, file, offset) {
  offset = parseInt(offset) || 0;

  var currentOffset = offset;
  types.posixHeader.forEach(function(field) {
    var value = field[3](file, field);
    var length = value.length;
    for (var i = 0; i < length; i += 1) {
      buffer[currentOffset + i] = value.charCodeAt(i) & 0xFF;
    }
    currentOffset += field[1];  // move to the next field
  });

  var field = utils.find(types.posixHeader, function(field) {
    return field[0] == 'checksum';
  });

  if (field) {
    // Patch checksum field
    var checksum = types.calculateChecksum(buffer, offset, true);
    var value = types.formatTarNumber(checksum, field[1] - 2) +
      constants.NULL_CHAR + ' ';
    currentOffset = offset + field[2];
    for (var i = 0; i < value.length; i += 1) {
      // put bytes
      buffer[currentOffset] = value.charCodeAt(i) & 0xFF;
      currentOffset++;
    }
  }

  return offset + headerSize(file);
}

function writeData(buffer, file, offset) {
  offset = parseInt(offset, 10) || 0;
  buffer.set(file.data, offset);
  return offset + dataSize(file);
}

function tar(files) {
  files = utils.map(files, function(file) {
    return utils.extend({}, file, {
      data: utils.toUint8Array(file.data)
    });
  });

  var buffer = allocateBuffer(files);

  var offset = 0;
  files.forEach(function(file) {
    offset = writeHeader(buffer, file, offset);
    offset = writeData(buffer, file, offset);
  });

  return buffer;
}
