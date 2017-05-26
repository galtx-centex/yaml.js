(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Dumper, Inline, Utils;

Utils = require('./Utils');

Inline = require('./Inline');

Dumper = (function() {
  function Dumper() {}

  Dumper.indentation = 4;

  Dumper.prototype.dump = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    var i, key, len, output, prefix, value, willBeInlined;
    if (inline == null) {
      inline = 0;
    }
    if (indent == null) {
      indent = 0;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    output = '';
    prefix = (indent ? Utils.strRepeat(' ', indent) : '');
    if (inline <= 0 || typeof input !== 'object' || input instanceof Date || Utils.isEmpty(input)) {
      output += prefix + Inline.dump(input, exceptionOnInvalidType, objectEncoder);
    } else {
      if (input instanceof Array) {
        for (i = 0, len = input.length; i < len; i++) {
          value = input[i];
          willBeInlined = inline - 1 <= 0 || typeof value !== 'object' || Utils.isEmpty(value);
          output += prefix + '-' + (willBeInlined ? ' ' : "\n") + this.dump(value, inline - 1, (willBeInlined ? 0 : indent + this.indentation), exceptionOnInvalidType, objectEncoder) + (willBeInlined ? "\n" : '');
        }
      } else {
        for (key in input) {
          value = input[key];
          willBeInlined = inline - 1 <= 0 || typeof value !== 'object' || Utils.isEmpty(value);
          output += prefix + Inline.dump(key, exceptionOnInvalidType, objectEncoder) + ':' + (willBeInlined ? ' ' : "\n") + this.dump(value, inline - 1, (willBeInlined ? 0 : indent + this.indentation), exceptionOnInvalidType, objectEncoder) + (willBeInlined ? "\n" : '');
        }
      }
    }
    return output;
  };

  return Dumper;

})();

module.exports = Dumper;


},{"./Inline":6,"./Utils":10}],2:[function(require,module,exports){
var Escaper, Pattern;

Pattern = require('./Pattern');

Escaper = (function() {
  var ch;

  function Escaper() {}

  Escaper.LIST_ESCAPEES = ['\\', '\\\\', '\\"', '"', "\x00", "\x01", "\x02", "\x03", "\x04", "\x05", "\x06", "\x07", "\x08", "\x09", "\x0a", "\x0b", "\x0c", "\x0d", "\x0e", "\x0f", "\x10", "\x11", "\x12", "\x13", "\x14", "\x15", "\x16", "\x17", "\x18", "\x19", "\x1a", "\x1b", "\x1c", "\x1d", "\x1e", "\x1f", (ch = String.fromCharCode)(0x0085), ch(0x00A0), ch(0x2028), ch(0x2029)];

  Escaper.LIST_ESCAPED = ['\\\\', '\\"', '\\"', '\\"', "\\0", "\\x01", "\\x02", "\\x03", "\\x04", "\\x05", "\\x06", "\\a", "\\b", "\\t", "\\n", "\\v", "\\f", "\\r", "\\x0e", "\\x0f", "\\x10", "\\x11", "\\x12", "\\x13", "\\x14", "\\x15", "\\x16", "\\x17", "\\x18", "\\x19", "\\x1a", "\\e", "\\x1c", "\\x1d", "\\x1e", "\\x1f", "\\N", "\\_", "\\L", "\\P"];

  Escaper.MAPPING_ESCAPEES_TO_ESCAPED = (function() {
    var i, j, mapping, ref;
    mapping = {};
    for (i = j = 0, ref = Escaper.LIST_ESCAPEES.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      mapping[Escaper.LIST_ESCAPEES[i]] = Escaper.LIST_ESCAPED[i];
    }
    return mapping;
  })();

  Escaper.PATTERN_CHARACTERS_TO_ESCAPE = new Pattern('[\\x00-\\x1f]|\xc2\x85|\xc2\xa0|\xe2\x80\xa8|\xe2\x80\xa9');

  Escaper.PATTERN_MAPPING_ESCAPEES = new Pattern(Escaper.LIST_ESCAPEES.join('|').split('\\').join('\\\\'));

  Escaper.PATTERN_SINGLE_QUOTING = new Pattern('[\'":{}[\\],*#?]|^[-?|<>=!%@`]');

  Escaper.requiresDoubleQuoting = function(value) {
    return this.PATTERN_CHARACTERS_TO_ESCAPE.test(value);
  };

  Escaper.escapeWithDoubleQuotes = function(value) {
    var result;
    result = this.PATTERN_MAPPING_ESCAPEES.replace(value, (function(_this) {
      return function(str) {
        return _this.MAPPING_ESCAPEES_TO_ESCAPED[str];
      };
    })(this));
    return '"' + result + '"';
  };

  Escaper.requiresSingleQuoting = function(value) {
    return this.PATTERN_SINGLE_QUOTING.test(value);
  };

  Escaper.escapeWithSingleQuotes = function(value) {
    return "'" + value.replace(/'/g, "''") + "'";
  };

  return Escaper;

})();

module.exports = Escaper;


},{"./Pattern":8}],3:[function(require,module,exports){
var DumpException,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DumpException = (function(superClass) {
  extend(DumpException, superClass);

  function DumpException(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  DumpException.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<DumpException> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<DumpException> ' + this.message;
    }
  };

  return DumpException;

})(Error);

module.exports = DumpException;


},{}],4:[function(require,module,exports){
var ParseException,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ParseException = (function(superClass) {
  extend(ParseException, superClass);

  function ParseException(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  ParseException.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<ParseException> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<ParseException> ' + this.message;
    }
  };

  return ParseException;

})(Error);

module.exports = ParseException;


},{}],5:[function(require,module,exports){
var ParseMore,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ParseMore = (function(superClass) {
  extend(ParseMore, superClass);

  function ParseMore(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  ParseMore.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<ParseMore> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<ParseMore> ' + this.message;
    }
  };

  return ParseMore;

})(Error);

module.exports = ParseMore;


},{}],6:[function(require,module,exports){
var DumpException, Escaper, Inline, ParseException, ParseMore, Pattern, Unescaper, Utils,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Pattern = require('./Pattern');

Unescaper = require('./Unescaper');

Escaper = require('./Escaper');

Utils = require('./Utils');

ParseException = require('./Exception/ParseException');

ParseMore = require('./Exception/ParseMore');

DumpException = require('./Exception/DumpException');

Inline = (function() {
  function Inline() {}

  Inline.REGEX_QUOTED_STRING = '(?:"(?:[^"\\\\]*(?:\\\\.[^"\\\\]*)*)"|\'(?:[^\']*(?:\'\'[^\']*)*)\')';

  Inline.PATTERN_TRAILING_COMMENTS = new Pattern('^\\s*#.*$');

  Inline.PATTERN_QUOTED_SCALAR = new Pattern('^' + Inline.REGEX_QUOTED_STRING);

  Inline.PATTERN_THOUSAND_NUMERIC_SCALAR = new Pattern('^(-|\\+)?[0-9,]+(\\.[0-9]+)?$');

  Inline.PATTERN_SCALAR_BY_DELIMITERS = {};

  Inline.settings = {};

  Inline.configure = function(exceptionOnInvalidType, objectDecoder) {
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = null;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.settings.exceptionOnInvalidType = exceptionOnInvalidType;
    this.settings.objectDecoder = objectDecoder;
  };

  Inline.parse = function(value, exceptionOnInvalidType, objectDecoder) {
    var context, result;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.settings.exceptionOnInvalidType = exceptionOnInvalidType;
    this.settings.objectDecoder = objectDecoder;
    if (value == null) {
      return '';
    }
    value = Utils.trim(value);
    if (0 === value.length) {
      return '';
    }
    context = {
      exceptionOnInvalidType: exceptionOnInvalidType,
      objectDecoder: objectDecoder,
      i: 0
    };
    switch (value.charAt(0)) {
      case '[':
        result = this.parseSequence(value, context);
        ++context.i;
        break;
      case '{':
        result = this.parseMapping(value, context);
        ++context.i;
        break;
      default:
        result = this.parseScalar(value, null, ['"', "'"], context);
    }
    if (this.PATTERN_TRAILING_COMMENTS.replace(value.slice(context.i), '') !== '') {
      throw new ParseException('Unexpected characters near "' + value.slice(context.i) + '".');
    }
    return result;
  };

  Inline.dump = function(value, exceptionOnInvalidType, objectEncoder) {
    var ref, result, type;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    if (value == null) {
      return 'null';
    }
    type = typeof value;
    if (type === 'object') {
      if (objectEncoder != null) {
        result = objectEncoder(value);
        if (typeof result === 'string' || (result != null)) {
          return result;
        }
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return this.dumpObject(value);
    }
    if (type === 'boolean') {
      return (value ? 'true' : 'false');
    }
    if (Utils.isDigits(value)) {
      return (type === 'string' ? "'" + value + "'" : String(parseInt(value)));
    }
    if (Utils.isNumeric(value)) {
      return (type === 'string' ? "'" + value + "'" : String(parseFloat(value)));
    }
    if (type === 'number') {
      return (value === 2e308 ? '.Inf' : (value === -2e308 ? '-.Inf' : (isNaN(value) ? '.NaN' : value)));
    }
    if (Escaper.requiresDoubleQuoting(value)) {
      return Escaper.escapeWithDoubleQuotes(value);
    }
    if (Escaper.requiresSingleQuoting(value)) {
      return Escaper.escapeWithSingleQuotes(value);
    }
    if ('' === value) {
      return '""';
    }
    if (Utils.PATTERN_DATE.test(value)) {
      return "'" + value + "'";
    }
    if ((ref = value.toLowerCase()) === 'null' || ref === '~' || ref === 'true' || ref === 'false') {
      return "'" + value + "'";
    }
    return value;
  };

  Inline.dumpObject = function(value, exceptionOnInvalidType, objectSupport) {
    var j, key, len1, output, val;
    if (objectSupport == null) {
      objectSupport = null;
    }
    if (value instanceof Array) {
      output = [];
      for (j = 0, len1 = value.length; j < len1; j++) {
        val = value[j];
        output.push(this.dump(val));
      }
      return '[' + output.join(', ') + ']';
    } else {
      output = [];
      for (key in value) {
        val = value[key];
        output.push(this.dump(key) + ': ' + this.dump(val));
      }
      return '{' + output.join(', ') + '}';
    }
  };

  Inline.parseScalar = function(scalar, delimiters, stringDelimiters, context, evaluate) {
    var i, joinedDelimiters, match, output, pattern, ref, ref1, strpos, tmp;
    if (delimiters == null) {
      delimiters = null;
    }
    if (stringDelimiters == null) {
      stringDelimiters = ['"', "'"];
    }
    if (context == null) {
      context = null;
    }
    if (evaluate == null) {
      evaluate = true;
    }
    if (context == null) {
      context = {
        exceptionOnInvalidType: this.settings.exceptionOnInvalidType,
        objectDecoder: this.settings.objectDecoder,
        i: 0
      };
    }
    i = context.i;
    if (ref = scalar.charAt(i), indexOf.call(stringDelimiters, ref) >= 0) {
      output = this.parseQuotedScalar(scalar, context);
      i = context.i;
      if (delimiters != null) {
        tmp = Utils.ltrim(scalar.slice(i), ' ');
        if (!(ref1 = tmp.charAt(0), indexOf.call(delimiters, ref1) >= 0)) {
          throw new ParseException('Unexpected characters (' + scalar.slice(i) + ').');
        }
      }
    } else {
      if (!delimiters) {
        output = scalar.slice(i);
        i += output.length;
        strpos = output.indexOf(' #');
        if (strpos !== -1) {
          output = Utils.rtrim(output.slice(0, strpos));
        }
      } else {
        joinedDelimiters = delimiters.join('|');
        pattern = this.PATTERN_SCALAR_BY_DELIMITERS[joinedDelimiters];
        if (pattern == null) {
          pattern = new Pattern('^(.+?)(' + joinedDelimiters + ')');
          this.PATTERN_SCALAR_BY_DELIMITERS[joinedDelimiters] = pattern;
        }
        if (match = pattern.exec(scalar.slice(i))) {
          output = match[1];
          i += output.length;
        } else {
          throw new ParseException('Malformed inline YAML string (' + scalar + ').');
        }
      }
      if (evaluate) {
        output = this.evaluateScalar(output, context);
      }
    }
    context.i = i;
    return output;
  };

  Inline.parseQuotedScalar = function(scalar, context) {
    var i, match, output;
    i = context.i;
    if (!(match = this.PATTERN_QUOTED_SCALAR.exec(scalar.slice(i)))) {
      throw new ParseMore('Malformed inline YAML string (' + scalar.slice(i) + ').');
    }
    output = match[0].substr(1, match[0].length - 2);
    if ('"' === scalar.charAt(i)) {
      output = Unescaper.unescapeDoubleQuotedString(output);
    } else {
      output = Unescaper.unescapeSingleQuotedString(output);
    }
    i += match[0].length;
    context.i = i;
    return output;
  };

  Inline.parseSequence = function(sequence, context) {
    var e, i, isQuoted, len, output, ref, value;
    output = [];
    len = sequence.length;
    i = context.i;
    i += 1;
    while (i < len) {
      context.i = i;
      switch (sequence.charAt(i)) {
        case '[':
          output.push(this.parseSequence(sequence, context));
          i = context.i;
          break;
        case '{':
          output.push(this.parseMapping(sequence, context));
          i = context.i;
          break;
        case ']':
          return output;
        case ',':
        case ' ':
        case "\n":
          break;
        default:
          isQuoted = ((ref = sequence.charAt(i)) === '"' || ref === "'");
          value = this.parseScalar(sequence, [',', ']'], ['"', "'"], context);
          i = context.i;
          if (!isQuoted && typeof value === 'string' && (value.indexOf(': ') !== -1 || value.indexOf(":\n") !== -1)) {
            try {
              value = this.parseMapping('{' + value + '}');
            } catch (error) {
              e = error;
            }
          }
          output.push(value);
          --i;
      }
      ++i;
    }
    throw new ParseMore('Malformed inline YAML string ' + sequence);
  };

  Inline.parseMapping = function(mapping, context) {
    var done, i, key, len, output, shouldContinueWhileLoop, value;
    output = {};
    len = mapping.length;
    i = context.i;
    i += 1;
    shouldContinueWhileLoop = false;
    while (i < len) {
      context.i = i;
      switch (mapping.charAt(i)) {
        case ' ':
        case ',':
        case "\n":
          ++i;
          context.i = i;
          shouldContinueWhileLoop = true;
          break;
        case '}':
          return output;
      }
      if (shouldContinueWhileLoop) {
        shouldContinueWhileLoop = false;
        continue;
      }
      key = this.parseScalar(mapping, [':', ' ', "\n"], ['"', "'"], context, false);
      i = context.i;
      done = false;
      while (i < len) {
        context.i = i;
        switch (mapping.charAt(i)) {
          case '[':
            value = this.parseSequence(mapping, context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            break;
          case '{':
            value = this.parseMapping(mapping, context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            break;
          case ':':
          case ' ':
          case "\n":
            break;
          default:
            value = this.parseScalar(mapping, [',', '}'], ['"', "'"], context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            --i;
        }
        ++i;
        if (done) {
          break;
        }
      }
    }
    throw new ParseMore('Malformed inline YAML string ' + mapping);
  };

  Inline.evaluateScalar = function(scalar, context) {
    var cast, date, exceptionOnInvalidType, firstChar, firstSpace, firstWord, objectDecoder, raw, scalarLower, subValue, trimmedScalar;
    scalar = Utils.trim(scalar);
    scalarLower = scalar.toLowerCase();
    switch (scalarLower) {
      case 'null':
      case '':
      case '~':
        return null;
      case 'true':
        return true;
      case 'false':
        return false;
      case '.inf':
        return 2e308;
      case '.nan':
        return 0/0;
      case '-.inf':
        return 2e308;
      default:
        firstChar = scalarLower.charAt(0);
        switch (firstChar) {
          case '!':
            firstSpace = scalar.indexOf(' ');
            if (firstSpace === -1) {
              firstWord = scalarLower;
            } else {
              firstWord = scalarLower.slice(0, firstSpace);
            }
            switch (firstWord) {
              case '!':
                if (firstSpace !== -1) {
                  return parseInt(this.parseScalar(scalar.slice(2)));
                }
                return null;
              case '!str':
                return Utils.ltrim(scalar.slice(4));
              case '!!str':
                return Utils.ltrim(scalar.slice(5));
              case '!!int':
                return parseInt(this.parseScalar(scalar.slice(5)));
              case '!!bool':
                return Utils.parseBoolean(this.parseScalar(scalar.slice(6)), false);
              case '!!float':
                return parseFloat(this.parseScalar(scalar.slice(7)));
              case '!!timestamp':
                return Utils.stringToDate(Utils.ltrim(scalar.slice(11)));
              default:
                if (context == null) {
                  context = {
                    exceptionOnInvalidType: this.settings.exceptionOnInvalidType,
                    objectDecoder: this.settings.objectDecoder,
                    i: 0
                  };
                }
                objectDecoder = context.objectDecoder, exceptionOnInvalidType = context.exceptionOnInvalidType;
                if (objectDecoder) {
                  trimmedScalar = Utils.rtrim(scalar);
                  firstSpace = trimmedScalar.indexOf(' ');
                  if (firstSpace === -1) {
                    return objectDecoder(trimmedScalar, null);
                  } else {
                    subValue = Utils.ltrim(trimmedScalar.slice(firstSpace + 1));
                    if (!(subValue.length > 0)) {
                      subValue = null;
                    }
                    return objectDecoder(trimmedScalar.slice(0, firstSpace), subValue);
                  }
                }
                if (exceptionOnInvalidType) {
                  throw new ParseException('Custom object support when parsing a YAML file has been disabled.');
                }
                return null;
            }
            break;
          case '0':
            if ('0x' === scalar.slice(0, 2)) {
              return Utils.hexDec(scalar);
            } else if (Utils.isDigits(scalar)) {
              return Utils.octDec(scalar);
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else {
              return scalar;
            }
            break;
          case '+':
            if (Utils.isDigits(scalar)) {
              raw = scalar;
              cast = parseInt(raw);
              if (raw === String(cast)) {
                return cast;
              } else {
                return raw;
              }
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
          case '-':
            if (Utils.isDigits(scalar.slice(1))) {
              if ('0' === scalar.charAt(1)) {
                return -Utils.octDec(scalar.slice(1));
              } else {
                raw = scalar.slice(1);
                cast = parseInt(raw);
                if (raw === String(cast)) {
                  return -cast;
                } else {
                  return -raw;
                }
              }
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
          default:
            if (date = Utils.stringToDate(scalar)) {
              return date;
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
        }
    }
  };

  return Inline;

})();

module.exports = Inline;


},{"./Escaper":2,"./Exception/DumpException":3,"./Exception/ParseException":4,"./Exception/ParseMore":5,"./Pattern":8,"./Unescaper":9,"./Utils":10}],7:[function(require,module,exports){
var Inline, ParseException, ParseMore, Parser, Pattern, Utils;

Inline = require('./Inline');

Pattern = require('./Pattern');

Utils = require('./Utils');

ParseException = require('./Exception/ParseException');

ParseMore = require('./Exception/ParseMore');

Parser = (function() {
  Parser.prototype.PATTERN_FOLDED_SCALAR_ALL = new Pattern('^(?:(?<type>![^\\|>]*)\\s+)?(?<separator>\\||>)(?<modifiers>\\+|\\-|\\d+|\\+\\d+|\\-\\d+|\\d+\\+|\\d+\\-)?(?<comments> +#.*)?$');

  Parser.prototype.PATTERN_FOLDED_SCALAR_END = new Pattern('(?<separator>\\||>)(?<modifiers>\\+|\\-|\\d+|\\+\\d+|\\-\\d+|\\d+\\+|\\d+\\-)?(?<comments> +#.*)?$');

  Parser.prototype.PATTERN_SEQUENCE_ITEM = new Pattern('^\\-((?<leadspaces>\\s+)(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_ANCHOR_VALUE = new Pattern('^&(?<ref>[^ ]+) *(?<value>.*)');

  Parser.prototype.PATTERN_COMPACT_NOTATION = new Pattern('^(?<key>' + Inline.REGEX_QUOTED_STRING + '|[^ \'"\\{\\[].*?) *\\:(\\s+(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_MAPPING_ITEM = new Pattern('^(?<key>' + Inline.REGEX_QUOTED_STRING + '|[^ \'"\\[\\{].*?) *\\:(\\s+(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_DECIMAL = new Pattern('\\d+');

  Parser.prototype.PATTERN_INDENT_SPACES = new Pattern('^ +');

  Parser.prototype.PATTERN_TRAILING_LINES = new Pattern('(\n*)$');

  Parser.prototype.PATTERN_YAML_HEADER = new Pattern('^\\%YAML[: ][\\d\\.]+.*\n', 'm');

  Parser.prototype.PATTERN_LEADING_COMMENTS = new Pattern('^(\\#.*?\n)+', 'm');

  Parser.prototype.PATTERN_DOCUMENT_MARKER_START = new Pattern('^\\-\\-\\-.*?\n', 'm');

  Parser.prototype.PATTERN_DOCUMENT_MARKER_END = new Pattern('^\\.\\.\\.\\s*$', 'm');

  Parser.prototype.PATTERN_FOLDED_SCALAR_BY_INDENTATION = {};

  Parser.prototype.CONTEXT_NONE = 0;

  Parser.prototype.CONTEXT_SEQUENCE = 1;

  Parser.prototype.CONTEXT_MAPPING = 2;

  function Parser(offset) {
    this.offset = offset != null ? offset : 0;
    this.lines = [];
    this.currentLineNb = -1;
    this.currentLine = '';
    this.refs = {};
  }

  Parser.prototype.parse = function(value, exceptionOnInvalidType, objectDecoder) {
    var alias, allowOverwrite, block, c, context, data, e, first, i, indent, isRef, j, k, key, l, lastKey, len, len1, len2, len3, lineCount, m, matches, mergeNode, n, name, parsed, parsedItem, parser, ref, ref1, ref2, refName, refValue, val, values;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.currentLineNb = -1;
    this.currentLine = '';
    this.lines = this.cleanup(value).split("\n");
    data = null;
    context = this.CONTEXT_NONE;
    allowOverwrite = false;
    while (this.moveToNextLine()) {
      if (this.isCurrentLineEmpty()) {
        continue;
      }
      if ("\t" === this.currentLine[0]) {
        throw new ParseException('A YAML file cannot contain tabs as indentation.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
      isRef = mergeNode = false;
      if (values = this.PATTERN_SEQUENCE_ITEM.exec(this.currentLine)) {
        if (this.CONTEXT_MAPPING === context) {
          throw new ParseException('You cannot define a sequence item when in a mapping');
        }
        context = this.CONTEXT_SEQUENCE;
        if (data == null) {
          data = [];
        }
        if ((values.value != null) && (matches = this.PATTERN_ANCHOR_VALUE.exec(values.value))) {
          isRef = matches.ref;
          values.value = matches.value;
        }
        if (!(values.value != null) || '' === Utils.trim(values.value, ' ') || Utils.ltrim(values.value, ' ').indexOf('#') === 0) {
          if (this.currentLineNb < this.lines.length - 1 && !this.isNextLineUnIndentedCollection()) {
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            data.push(parser.parse(this.getNextEmbedBlock(null, true), exceptionOnInvalidType, objectDecoder));
          } else {
            data.push(null);
          }
        } else {
          if (((ref = values.leadspaces) != null ? ref.length : void 0) && (matches = this.PATTERN_COMPACT_NOTATION.exec(values.value))) {
            c = this.getRealCurrentLineNb();
            parser = new Parser(c);
            parser.refs = this.refs;
            block = values.value;
            indent = this.getCurrentLineIndentation();
            if (this.isNextLineIndented(false)) {
              block += "\n" + this.getNextEmbedBlock(indent + values.leadspaces.length + 1, true);
            }
            data.push(parser.parse(block, exceptionOnInvalidType, objectDecoder));
          } else {
            data.push(this.parseValue(values.value, exceptionOnInvalidType, objectDecoder));
          }
        }
      } else if ((values = this.PATTERN_MAPPING_ITEM.exec(this.currentLine)) && values.key.indexOf(' #') === -1) {
        if (this.CONTEXT_SEQUENCE === context) {
          throw new ParseException('You cannot define a mapping item when in a sequence');
        }
        context = this.CONTEXT_MAPPING;
        if (data == null) {
          data = {};
        }
        Inline.configure(exceptionOnInvalidType, objectDecoder);
        try {
          key = Inline.parseScalar(values.key);
        } catch (error) {
          e = error;
          e.parsedLine = this.getRealCurrentLineNb() + 1;
          e.snippet = this.currentLine;
          throw e;
        }
        if ('<<' === key) {
          mergeNode = true;
          allowOverwrite = true;
          if (((ref1 = values.value) != null ? ref1.indexOf('*') : void 0) === 0) {
            refName = values.value.slice(1);
            if (this.refs[refName] == null) {
              throw new ParseException('Reference "' + refName + '" does not exist.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            refValue = this.refs[refName];
            if (typeof refValue !== 'object') {
              throw new ParseException('YAML merge keys used with a scalar value instead of an object.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            if (refValue instanceof Array) {
              for (i = j = 0, len = refValue.length; j < len; i = ++j) {
                value = refValue[i];
                if (data[name = String(i)] == null) {
                  data[name] = value;
                }
              }
            } else {
              for (key in refValue) {
                value = refValue[key];
                if (data[key] == null) {
                  data[key] = value;
                }
              }
            }
          } else {
            if ((values.value != null) && values.value !== '') {
              value = values.value;
            } else {
              value = this.getNextEmbedBlock();
            }
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            parsed = parser.parse(value, exceptionOnInvalidType);
            if (typeof parsed !== 'object') {
              throw new ParseException('YAML merge keys used with a scalar value instead of an object.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            if (parsed instanceof Array) {
              for (l = 0, len1 = parsed.length; l < len1; l++) {
                parsedItem = parsed[l];
                if (typeof parsedItem !== 'object') {
                  throw new ParseException('Merge items must be objects.', this.getRealCurrentLineNb() + 1, parsedItem);
                }
                if (parsedItem instanceof Array) {
                  for (i = m = 0, len2 = parsedItem.length; m < len2; i = ++m) {
                    value = parsedItem[i];
                    k = String(i);
                    if (!data.hasOwnProperty(k)) {
                      data[k] = value;
                    }
                  }
                } else {
                  for (key in parsedItem) {
                    value = parsedItem[key];
                    if (!data.hasOwnProperty(key)) {
                      data[key] = value;
                    }
                  }
                }
              }
            } else {
              for (key in parsed) {
                value = parsed[key];
                if (!data.hasOwnProperty(key)) {
                  data[key] = value;
                }
              }
            }
          }
        } else if ((values.value != null) && (matches = this.PATTERN_ANCHOR_VALUE.exec(values.value))) {
          isRef = matches.ref;
          values.value = matches.value;
        }
        if (mergeNode) {

        } else if (!(values.value != null) || '' === Utils.trim(values.value, ' ') || Utils.ltrim(values.value, ' ').indexOf('#') === 0) {
          if (!(this.isNextLineIndented()) && !(this.isNextLineUnIndentedCollection())) {
            if (allowOverwrite || data[key] === void 0) {
              data[key] = null;
            }
          } else {
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            val = parser.parse(this.getNextEmbedBlock(), exceptionOnInvalidType, objectDecoder);
            if (allowOverwrite || data[key] === void 0) {
              data[key] = val;
            }
          }
        } else {
          val = this.parseValue(values.value, exceptionOnInvalidType, objectDecoder);
          if (allowOverwrite || data[key] === void 0) {
            data[key] = val;
          }
        }
      } else {
        lineCount = this.lines.length;
        if (1 === lineCount || (2 === lineCount && Utils.isEmpty(this.lines[1]))) {
          try {
            value = Inline.parse(this.lines[0], exceptionOnInvalidType, objectDecoder);
          } catch (error) {
            e = error;
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
          if (typeof value === 'object') {
            if (value instanceof Array) {
              first = value[0];
            } else {
              for (key in value) {
                first = value[key];
                break;
              }
            }
            if (typeof first === 'string' && first.indexOf('*') === 0) {
              data = [];
              for (n = 0, len3 = value.length; n < len3; n++) {
                alias = value[n];
                data.push(this.refs[alias.slice(1)]);
              }
              value = data;
            }
          }
          return value;
        } else if ((ref2 = Utils.ltrim(value).charAt(0)) === '[' || ref2 === '{') {
          try {
            return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
          } catch (error) {
            e = error;
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
        }
        throw new ParseException('Unable to parse.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
      if (isRef) {
        if (data instanceof Array) {
          this.refs[isRef] = data[data.length - 1];
        } else {
          lastKey = null;
          for (key in data) {
            lastKey = key;
          }
          this.refs[isRef] = data[lastKey];
        }
      }
    }
    if (Utils.isEmpty(data)) {
      return null;
    } else {
      return data;
    }
  };

  Parser.prototype.getRealCurrentLineNb = function() {
    return this.currentLineNb + this.offset;
  };

  Parser.prototype.getCurrentLineIndentation = function() {
    return this.currentLine.length - Utils.ltrim(this.currentLine, ' ').length;
  };

  Parser.prototype.getNextEmbedBlock = function(indentation, includeUnindentedCollection) {
    var data, indent, isItUnindentedCollection, newIndent, removeComments, removeCommentsPattern, unindentedEmbedBlock;
    if (indentation == null) {
      indentation = null;
    }
    if (includeUnindentedCollection == null) {
      includeUnindentedCollection = false;
    }
    this.moveToNextLine();
    if (indentation == null) {
      newIndent = this.getCurrentLineIndentation();
      unindentedEmbedBlock = this.isStringUnIndentedCollectionItem(this.currentLine);
      if (!(this.isCurrentLineEmpty()) && 0 === newIndent && !unindentedEmbedBlock) {
        throw new ParseException('Indentation problem.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
    } else {
      newIndent = indentation;
    }
    data = [this.currentLine.slice(newIndent)];
    if (!includeUnindentedCollection) {
      isItUnindentedCollection = this.isStringUnIndentedCollectionItem(this.currentLine);
    }
    removeCommentsPattern = this.PATTERN_FOLDED_SCALAR_END;
    removeComments = !removeCommentsPattern.test(this.currentLine);
    while (this.moveToNextLine()) {
      indent = this.getCurrentLineIndentation();
      if (indent === newIndent) {
        removeComments = !removeCommentsPattern.test(this.currentLine);
      }
      if (removeComments && this.isCurrentLineComment()) {
        continue;
      }
      if (this.isCurrentLineBlank()) {
        data.push(this.currentLine.slice(newIndent));
        continue;
      }
      if (isItUnindentedCollection && !this.isStringUnIndentedCollectionItem(this.currentLine) && indent === newIndent) {
        this.moveToPreviousLine();
        break;
      }
      if (indent >= newIndent) {
        data.push(this.currentLine.slice(newIndent));
      } else if (Utils.ltrim(this.currentLine).charAt(0) === '#') {

      } else if (0 === indent) {
        this.moveToPreviousLine();
        break;
      } else {
        throw new ParseException('Indentation problem.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
    }
    return data.join("\n");
  };

  Parser.prototype.moveToNextLine = function() {
    if (this.currentLineNb >= this.lines.length - 1) {
      return false;
    }
    this.currentLine = this.lines[++this.currentLineNb];
    return true;
  };

  Parser.prototype.moveToPreviousLine = function() {
    this.currentLine = this.lines[--this.currentLineNb];
  };

  Parser.prototype.parseValue = function(value, exceptionOnInvalidType, objectDecoder) {
    var e, foldedIndent, matches, modifiers, pos, ref, ref1, val;
    if (0 === value.indexOf('*')) {
      pos = value.indexOf('#');
      if (pos !== -1) {
        value = value.substr(1, pos - 2);
      } else {
        value = value.slice(1);
      }
      if (this.refs[value] === void 0) {
        throw new ParseException('Reference "' + value + '" does not exist.', this.currentLine);
      }
      return this.refs[value];
    }
    if (matches = this.PATTERN_FOLDED_SCALAR_ALL.exec(value)) {
      modifiers = (ref = matches.modifiers) != null ? ref : '';
      foldedIndent = Math.abs(parseInt(modifiers));
      if (isNaN(foldedIndent)) {
        foldedIndent = 0;
      }
      val = this.parseFoldedScalar(matches.separator, this.PATTERN_DECIMAL.replace(modifiers, ''), foldedIndent);
      if (matches.type != null) {
        Inline.configure(exceptionOnInvalidType, objectDecoder);
        return Inline.parseScalar(matches.type + ' ' + val);
      } else {
        return val;
      }
    }
    if ((ref1 = value.charAt(0)) === '[' || ref1 === '{' || ref1 === '"' || ref1 === "'") {
      while (true) {
        try {
          return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
        } catch (error) {
          e = error;
          if (e instanceof ParseMore && this.moveToNextLine()) {
            value += "\n" + Utils.trim(this.currentLine, ' ');
          } else {
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
        }
      }
    } else {
      if (this.isNextLineIndented()) {
        value += "\n" + this.getNextEmbedBlock();
      }
      return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
    }
  };

  Parser.prototype.parseFoldedScalar = function(separator, indicator, indentation) {
    var isCurrentLineBlank, j, len, line, matches, newText, notEOF, pattern, ref, text;
    if (indicator == null) {
      indicator = '';
    }
    if (indentation == null) {
      indentation = 0;
    }
    notEOF = this.moveToNextLine();
    if (!notEOF) {
      return '';
    }
    isCurrentLineBlank = this.isCurrentLineBlank();
    text = '';
    while (notEOF && isCurrentLineBlank) {
      if (notEOF = this.moveToNextLine()) {
        text += "\n";
        isCurrentLineBlank = this.isCurrentLineBlank();
      }
    }
    if (0 === indentation) {
      if (matches = this.PATTERN_INDENT_SPACES.exec(this.currentLine)) {
        indentation = matches[0].length;
      }
    }
    if (indentation > 0) {
      pattern = this.PATTERN_FOLDED_SCALAR_BY_INDENTATION[indentation];
      if (pattern == null) {
        pattern = new Pattern('^ {' + indentation + '}(.*)$');
        Parser.prototype.PATTERN_FOLDED_SCALAR_BY_INDENTATION[indentation] = pattern;
      }
      while (notEOF && (isCurrentLineBlank || (matches = pattern.exec(this.currentLine)))) {
        if (isCurrentLineBlank) {
          text += this.currentLine.slice(indentation);
        } else {
          text += matches[1];
        }
        if (notEOF = this.moveToNextLine()) {
          text += "\n";
          isCurrentLineBlank = this.isCurrentLineBlank();
        }
      }
    } else if (notEOF) {
      text += "\n";
    }
    if (notEOF) {
      this.moveToPreviousLine();
    }
    if ('>' === separator) {
      newText = '';
      ref = text.split("\n");
      for (j = 0, len = ref.length; j < len; j++) {
        line = ref[j];
        if (line.length === 0 || line.charAt(0) === ' ') {
          newText = Utils.rtrim(newText, ' ') + line + "\n";
        } else {
          newText += line + ' ';
        }
      }
      text = newText;
    }
    if ('+' !== indicator) {
      text = Utils.rtrim(text);
    }
    if ('' === indicator) {
      text = this.PATTERN_TRAILING_LINES.replace(text, "\n");
    } else if ('-' === indicator) {
      text = this.PATTERN_TRAILING_LINES.replace(text, '');
    }
    return text;
  };

  Parser.prototype.isNextLineIndented = function(ignoreComments) {
    var EOF, currentIndentation, ret;
    if (ignoreComments == null) {
      ignoreComments = true;
    }
    currentIndentation = this.getCurrentLineIndentation();
    EOF = !this.moveToNextLine();
    if (ignoreComments) {
      while (!EOF && this.isCurrentLineEmpty()) {
        EOF = !this.moveToNextLine();
      }
    } else {
      while (!EOF && this.isCurrentLineBlank()) {
        EOF = !this.moveToNextLine();
      }
    }
    if (EOF) {
      return false;
    }
    ret = false;
    if (this.getCurrentLineIndentation() > currentIndentation) {
      ret = true;
    }
    this.moveToPreviousLine();
    return ret;
  };

  Parser.prototype.isCurrentLineEmpty = function() {
    var trimmedLine;
    trimmedLine = Utils.trim(this.currentLine, ' ');
    return trimmedLine.length === 0 || trimmedLine.charAt(0) === '#';
  };

  Parser.prototype.isCurrentLineBlank = function() {
    return '' === Utils.trim(this.currentLine, ' ');
  };

  Parser.prototype.isCurrentLineComment = function() {
    var ltrimmedLine;
    ltrimmedLine = Utils.ltrim(this.currentLine, ' ');
    return ltrimmedLine.charAt(0) === '#';
  };

  Parser.prototype.cleanup = function(value) {
    var count, i, indent, j, l, len, len1, line, lines, ref, ref1, ref2, smallestIndent, trimmedValue;
    if (value.indexOf("\r") !== -1) {
      value = value.split("\r\n").join("\n").split("\r").join("\n");
    }
    count = 0;
    ref = this.PATTERN_YAML_HEADER.replaceAll(value, ''), value = ref[0], count = ref[1];
    this.offset += count;
    ref1 = this.PATTERN_LEADING_COMMENTS.replaceAll(value, '', 1), trimmedValue = ref1[0], count = ref1[1];
    if (count === 1) {
      this.offset += Utils.subStrCount(value, "\n") - Utils.subStrCount(trimmedValue, "\n");
      value = trimmedValue;
    }
    ref2 = this.PATTERN_DOCUMENT_MARKER_START.replaceAll(value, '', 1), trimmedValue = ref2[0], count = ref2[1];
    if (count === 1) {
      this.offset += Utils.subStrCount(value, "\n") - Utils.subStrCount(trimmedValue, "\n");
      value = trimmedValue;
      value = this.PATTERN_DOCUMENT_MARKER_END.replace(value, '');
    }
    lines = value.split("\n");
    smallestIndent = -1;
    for (j = 0, len = lines.length; j < len; j++) {
      line = lines[j];
      if (Utils.trim(line, ' ').length === 0) {
        continue;
      }
      indent = line.length - Utils.ltrim(line).length;
      if (smallestIndent === -1 || indent < smallestIndent) {
        smallestIndent = indent;
      }
    }
    if (smallestIndent > 0) {
      for (i = l = 0, len1 = lines.length; l < len1; i = ++l) {
        line = lines[i];
        lines[i] = line.slice(smallestIndent);
      }
      value = lines.join("\n");
    }
    return value;
  };

  Parser.prototype.isNextLineUnIndentedCollection = function(currentIndentation) {
    var notEOF, ret;
    if (currentIndentation == null) {
      currentIndentation = null;
    }
    if (currentIndentation == null) {
      currentIndentation = this.getCurrentLineIndentation();
    }
    notEOF = this.moveToNextLine();
    while (notEOF && this.isCurrentLineEmpty()) {
      notEOF = this.moveToNextLine();
    }
    if (false === notEOF) {
      return false;
    }
    ret = false;
    if (this.getCurrentLineIndentation() === currentIndentation && this.isStringUnIndentedCollectionItem(this.currentLine)) {
      ret = true;
    }
    this.moveToPreviousLine();
    return ret;
  };

  Parser.prototype.isStringUnIndentedCollectionItem = function() {
    return this.currentLine === '-' || this.currentLine.slice(0, 2) === '- ';
  };

  return Parser;

})();

module.exports = Parser;


},{"./Exception/ParseException":4,"./Exception/ParseMore":5,"./Inline":6,"./Pattern":8,"./Utils":10}],8:[function(require,module,exports){
var Pattern;

Pattern = (function() {
  Pattern.prototype.regex = null;

  Pattern.prototype.rawRegex = null;

  Pattern.prototype.cleanedRegex = null;

  Pattern.prototype.mapping = null;

  function Pattern(rawRegex, modifiers) {
    var _char, capturingBracketNumber, cleanedRegex, i, len, mapping, name, part, subChar;
    if (modifiers == null) {
      modifiers = '';
    }
    cleanedRegex = '';
    len = rawRegex.length;
    mapping = null;
    capturingBracketNumber = 0;
    i = 0;
    while (i < len) {
      _char = rawRegex.charAt(i);
      if (_char === '\\') {
        cleanedRegex += rawRegex.slice(i, +(i + 1) + 1 || 9e9);
        i++;
      } else if (_char === '(') {
        if (i < len - 2) {
          part = rawRegex.slice(i, +(i + 2) + 1 || 9e9);
          if (part === '(?:') {
            i += 2;
            cleanedRegex += part;
          } else if (part === '(?<') {
            capturingBracketNumber++;
            i += 2;
            name = '';
            while (i + 1 < len) {
              subChar = rawRegex.charAt(i + 1);
              if (subChar === '>') {
                cleanedRegex += '(';
                i++;
                if (name.length > 0) {
                  if (mapping == null) {
                    mapping = {};
                  }
                  mapping[name] = capturingBracketNumber;
                }
                break;
              } else {
                name += subChar;
              }
              i++;
            }
          } else {
            cleanedRegex += _char;
            capturingBracketNumber++;
          }
        } else {
          cleanedRegex += _char;
        }
      } else {
        cleanedRegex += _char;
      }
      i++;
    }
    this.rawRegex = rawRegex;
    this.cleanedRegex = cleanedRegex;
    this.regex = new RegExp(this.cleanedRegex, 'g' + modifiers.replace('g', ''));
    this.mapping = mapping;
  }

  Pattern.prototype.exec = function(str) {
    var index, matches, name, ref;
    this.regex.lastIndex = 0;
    matches = this.regex.exec(str);
    if (matches == null) {
      return null;
    }
    if (this.mapping != null) {
      ref = this.mapping;
      for (name in ref) {
        index = ref[name];
        matches[name] = matches[index];
      }
    }
    return matches;
  };

  Pattern.prototype.test = function(str) {
    this.regex.lastIndex = 0;
    return this.regex.test(str);
  };

  Pattern.prototype.replace = function(str, replacement) {
    this.regex.lastIndex = 0;
    return str.replace(this.regex, replacement);
  };

  Pattern.prototype.replaceAll = function(str, replacement, limit) {
    var count;
    if (limit == null) {
      limit = 0;
    }
    this.regex.lastIndex = 0;
    count = 0;
    while (this.regex.test(str) && (limit === 0 || count < limit)) {
      this.regex.lastIndex = 0;
      str = str.replace(this.regex, replacement);
      count++;
    }
    return [str, count];
  };

  return Pattern;

})();

module.exports = Pattern;


},{}],9:[function(require,module,exports){
var Pattern, Unescaper, Utils;

Utils = require('./Utils');

Pattern = require('./Pattern');

Unescaper = (function() {
  function Unescaper() {}

  Unescaper.PATTERN_ESCAPED_CHARACTER = new Pattern('\\\\([0abt\tnvfre "\\/\\\\N_LP]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8})');

  Unescaper.unescapeSingleQuotedString = function(value) {
    return value.replace(/\'\'/g, '\'');
  };

  Unescaper.unescapeDoubleQuotedString = function(value) {
    if (this._unescapeCallback == null) {
      this._unescapeCallback = (function(_this) {
        return function(str) {
          return _this.unescapeCharacter(str);
        };
      })(this);
    }
    return this.PATTERN_ESCAPED_CHARACTER.replace(value, this._unescapeCallback);
  };

  Unescaper.unescapeCharacter = function(value) {
    var ch;
    ch = String.fromCharCode;
    switch (value.charAt(1)) {
      case '0':
        return ch(0);
      case 'a':
        return ch(7);
      case 'b':
        return ch(8);
      case 't':
        return "\t";
      case "\t":
        return "\t";
      case 'n':
        return "\n";
      case 'v':
        return ch(11);
      case 'f':
        return ch(12);
      case 'r':
        return ch(13);
      case 'e':
        return ch(27);
      case ' ':
        return ' ';
      case '"':
        return '"';
      case '/':
        return '/';
      case '\\':
        return '\\';
      case 'N':
        return ch(0x0085);
      case '_':
        return ch(0x00A0);
      case 'L':
        return ch(0x2028);
      case 'P':
        return ch(0x2029);
      case 'x':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 2)));
      case 'u':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 4)));
      case 'U':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 8)));
      default:
        return '';
    }
  };

  return Unescaper;

})();

module.exports = Unescaper;


},{"./Pattern":8,"./Utils":10}],10:[function(require,module,exports){
var Pattern, Utils,
  hasProp = {}.hasOwnProperty;

Pattern = require('./Pattern');

Utils = (function() {
  function Utils() {}

  Utils.REGEX_LEFT_TRIM_BY_CHAR = {};

  Utils.REGEX_RIGHT_TRIM_BY_CHAR = {};

  Utils.REGEX_SPACES = /\s+/g;

  Utils.REGEX_DIGITS = /^\d+$/;

  Utils.REGEX_OCTAL = /[^0-7]/gi;

  Utils.REGEX_HEXADECIMAL = /[^a-f0-9]/gi;

  Utils.PATTERN_DATE = new Pattern('^' + '(?<year>[0-9][0-9][0-9][0-9])' + '-(?<month>[0-9][0-9]?)' + '-(?<day>[0-9][0-9]?)' + '(?:(?:[Tt]|[ \t]+)' + '(?<hour>[0-9][0-9]?)' + ':(?<minute>[0-9][0-9])' + ':(?<second>[0-9][0-9])' + '(?:\.(?<fraction>[0-9]*))?' + '(?:[ \t]*(?<tz>Z|(?<tz_sign>[-+])(?<tz_hour>[0-9][0-9]?)' + '(?::(?<tz_minute>[0-9][0-9]))?))?)?' + '$', 'i');

  Utils.LOCAL_TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60 * 1000;

  Utils.trim = function(str, _char) {
    var regexLeft, regexRight;
    if (_char == null) {
      _char = '\\s';
    }
    regexLeft = this.REGEX_LEFT_TRIM_BY_CHAR[_char];
    if (regexLeft == null) {
      this.REGEX_LEFT_TRIM_BY_CHAR[_char] = regexLeft = new RegExp('^' + _char + '' + _char + '*');
    }
    regexLeft.lastIndex = 0;
    regexRight = this.REGEX_RIGHT_TRIM_BY_CHAR[_char];
    if (regexRight == null) {
      this.REGEX_RIGHT_TRIM_BY_CHAR[_char] = regexRight = new RegExp(_char + '' + _char + '*$');
    }
    regexRight.lastIndex = 0;
    return str.replace(regexLeft, '').replace(regexRight, '');
  };

  Utils.ltrim = function(str, _char) {
    var regexLeft;
    if (_char == null) {
      _char = '\\s';
    }
    regexLeft = this.REGEX_LEFT_TRIM_BY_CHAR[_char];
    if (regexLeft == null) {
      this.REGEX_LEFT_TRIM_BY_CHAR[_char] = regexLeft = new RegExp('^' + _char + '' + _char + '*');
    }
    regexLeft.lastIndex = 0;
    return str.replace(regexLeft, '');
  };

  Utils.rtrim = function(str, _char) {
    var regexRight;
    if (_char == null) {
      _char = '\\s';
    }
    regexRight = this.REGEX_RIGHT_TRIM_BY_CHAR[_char];
    if (regexRight == null) {
      this.REGEX_RIGHT_TRIM_BY_CHAR[_char] = regexRight = new RegExp(_char + '' + _char + '*$');
    }
    regexRight.lastIndex = 0;
    return str.replace(regexRight, '');
  };

  Utils.isEmpty = function(value) {
    return !value || value === '' || value === '0' || (value instanceof Array && value.length === 0) || this.isEmptyObject(value);
  };

  Utils.isEmptyObject = function(value) {
    var k;
    return value instanceof Object && ((function() {
      var results;
      results = [];
      for (k in value) {
        if (!hasProp.call(value, k)) continue;
        results.push(k);
      }
      return results;
    })()).length === 0;
  };

  Utils.subStrCount = function(string, subString, start, length) {
    var c, i, j, len, ref, sublen;
    c = 0;
    string = '' + string;
    subString = '' + subString;
    if (start != null) {
      string = string.slice(start);
    }
    if (length != null) {
      string = string.slice(0, length);
    }
    len = string.length;
    sublen = subString.length;
    for (i = j = 0, ref = len; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (subString === string.slice(i, sublen)) {
        c++;
        i += sublen - 1;
      }
    }
    return c;
  };

  Utils.isDigits = function(input) {
    this.REGEX_DIGITS.lastIndex = 0;
    return this.REGEX_DIGITS.test(input);
  };

  Utils.octDec = function(input) {
    this.REGEX_OCTAL.lastIndex = 0;
    return parseInt((input + '').replace(this.REGEX_OCTAL, ''), 8);
  };

  Utils.hexDec = function(input) {
    this.REGEX_HEXADECIMAL.lastIndex = 0;
    input = this.trim(input);
    if ((input + '').slice(0, 2) === '0x') {
      input = (input + '').slice(2);
    }
    return parseInt((input + '').replace(this.REGEX_HEXADECIMAL, ''), 16);
  };

  Utils.utf8chr = function(c) {
    var ch;
    ch = String.fromCharCode;
    if (0x80 > (c %= 0x200000)) {
      return ch(c);
    }
    if (0x800 > c) {
      return ch(0xC0 | c >> 6) + ch(0x80 | c & 0x3F);
    }
    if (0x10000 > c) {
      return ch(0xE0 | c >> 12) + ch(0x80 | c >> 6 & 0x3F) + ch(0x80 | c & 0x3F);
    }
    return ch(0xF0 | c >> 18) + ch(0x80 | c >> 12 & 0x3F) + ch(0x80 | c >> 6 & 0x3F) + ch(0x80 | c & 0x3F);
  };

  Utils.parseBoolean = function(input, strict) {
    var lowerInput;
    if (strict == null) {
      strict = true;
    }
    if (typeof input === 'string') {
      lowerInput = input.toLowerCase();
      if (!strict) {
        if (lowerInput === 'no') {
          return false;
        }
      }
      if (lowerInput === '0') {
        return false;
      }
      if (lowerInput === 'false') {
        return false;
      }
      if (lowerInput === '') {
        return false;
      }
      return true;
    }
    return !!input;
  };

  Utils.isNumeric = function(input) {
    this.REGEX_SPACES.lastIndex = 0;
    return typeof input === 'number' || typeof input === 'string' && !isNaN(input) && input.replace(this.REGEX_SPACES, '') !== '';
  };

  Utils.stringToDate = function(str) {
    var date, day, fraction, hour, info, minute, month, second, tz_hour, tz_minute, tz_offset, year;
    if (!(str != null ? str.length : void 0)) {
      return null;
    }
    info = this.PATTERN_DATE.exec(str);
    if (!info) {
      return null;
    }
    year = parseInt(info.year, 10);
    month = parseInt(info.month, 10) - 1;
    day = parseInt(info.day, 10);
    if (info.hour == null) {
      date = new Date(Date.UTC(year, month, day));
      return date;
    }
    hour = parseInt(info.hour, 10);
    minute = parseInt(info.minute, 10);
    second = parseInt(info.second, 10);
    if (info.fraction != null) {
      fraction = info.fraction.slice(0, 3);
      while (fraction.length < 3) {
        fraction += '0';
      }
      fraction = parseInt(fraction, 10);
    } else {
      fraction = 0;
    }
    if (info.tz != null) {
      tz_hour = parseInt(info.tz_hour, 10);
      if (info.tz_minute != null) {
        tz_minute = parseInt(info.tz_minute, 10);
      } else {
        tz_minute = 0;
      }
      tz_offset = (tz_hour * 60 + tz_minute) * 60000;
      if ('-' === info.tz_sign) {
        tz_offset *= -1;
      }
    }
    date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (tz_offset) {
      date.setTime(date.getTime() - tz_offset);
    }
    return date;
  };

  Utils.strRepeat = function(str, number) {
    var i, res;
    res = '';
    i = 0;
    while (i < number) {
      res += str;
      i++;
    }
    return res;
  };

  Utils.getStringFromFile = function(path, callback) {
    var data, fs, j, len1, name, ref, req, xhr;
    if (callback == null) {
      callback = null;
    }
    xhr = null;
    if (typeof window !== "undefined" && window !== null) {
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        ref = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          name = ref[j];
          try {
            xhr = new ActiveXObject(name);
          } catch (error) {}
        }
      }
    }
    if (xhr != null) {
      if (callback != null) {
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
              return callback(xhr.responseText);
            } else {
              return callback(null);
            }
          }
        };
        xhr.open('GET', path, true);
        return xhr.send(null);
      } else {
        xhr.open('GET', path, false);
        xhr.send(null);
        if (xhr.status === 200 || xhr.status === 0) {
          return xhr.responseText;
        }
        return null;
      }
    } else {
      req = require;
      fs = req('fs');
      if (callback != null) {
        return fs.readFile(path, function(err, data) {
          if (err) {
            return callback(null);
          } else {
            return callback(String(data));
          }
        });
      } else {
        data = fs.readFileSync(path);
        if (data != null) {
          return String(data);
        }
        return null;
      }
    }
  };

  return Utils;

})();

module.exports = Utils;


},{"./Pattern":8}],11:[function(require,module,exports){
var Dumper, Parser, Utils, Yaml;

Parser = require('./Parser');

Dumper = require('./Dumper');

Utils = require('./Utils');

Yaml = (function() {
  function Yaml() {}

  Yaml.parse = function(input, exceptionOnInvalidType, objectDecoder) {
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    return new Parser().parse(input, exceptionOnInvalidType, objectDecoder);
  };

  Yaml.parseFile = function(path, callback, exceptionOnInvalidType, objectDecoder) {
    var input;
    if (callback == null) {
      callback = null;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    if (callback != null) {
      return Utils.getStringFromFile(path, (function(_this) {
        return function(input) {
          var result;
          result = null;
          if (input != null) {
            result = _this.parse(input, exceptionOnInvalidType, objectDecoder);
          }
          callback(result);
        };
      })(this));
    } else {
      input = Utils.getStringFromFile(path);
      if (input != null) {
        return this.parse(input, exceptionOnInvalidType, objectDecoder);
      }
      return null;
    }
  };

  Yaml.dump = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    var yaml;
    if (inline == null) {
      inline = 2;
    }
    if (indent == null) {
      indent = 4;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    yaml = new Dumper();
    yaml.indentation = indent;
    return yaml.dump(input, inline, 0, exceptionOnInvalidType, objectEncoder);
  };

  Yaml.register = function() {
    var require_handler;
    require_handler = function(module, filename) {
      return module.exports = YAML.parseFile(filename);
    };
    if ((typeof require !== "undefined" && require !== null ? require.extensions : void 0) != null) {
      require.extensions['.yml'] = require_handler;
      return require.extensions['.yaml'] = require_handler;
    }
  };

  Yaml.stringify = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    return this.dump(input, inline, indent, exceptionOnInvalidType, objectEncoder);
  };

  Yaml.load = function(path, callback, exceptionOnInvalidType, objectDecoder) {
    return this.parseFile(path, callback, exceptionOnInvalidType, objectDecoder);
  };

  return Yaml;

})();

if (typeof window !== "undefined" && window !== null) {
  window.YAML = Yaml;
}

if (typeof window === "undefined" || window === null) {
  this.YAML = Yaml;
}

module.exports = Yaml;


},{"./Dumper":1,"./Parser":7,"./Utils":10}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9EdW1wZXIuY29mZmVlIiwic3JjL0VzY2FwZXIuY29mZmVlIiwic3JjL0V4Y2VwdGlvbi9EdW1wRXhjZXB0aW9uLmNvZmZlZSIsInNyYy9FeGNlcHRpb24vUGFyc2VFeGNlcHRpb24uY29mZmVlIiwic3JjL0V4Y2VwdGlvbi9QYXJzZU1vcmUuY29mZmVlIiwic3JjL0lubGluZS5jb2ZmZWUiLCJzcmMvUGFyc2VyLmNvZmZlZSIsInNyYy9QYXR0ZXJuLmNvZmZlZSIsInNyYy9VbmVzY2FwZXIuY29mZmVlIiwic3JjL1V0aWxzLmNvZmZlZSIsInNyYy9ZYW1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0NBLElBQUE7O0FBQUEsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFJSjs7O0VBR0YsTUFBQyxDQUFBLFdBQUQsR0FBZ0I7O21CQWFoQixJQUFBLEdBQU0sU0FBQyxLQUFELEVBQVEsTUFBUixFQUFvQixNQUFwQixFQUFnQyxzQkFBaEMsRUFBZ0UsYUFBaEU7QUFDRixRQUFBOztNQURVLFNBQVM7OztNQUFHLFNBQVM7OztNQUFHLHlCQUF5Qjs7O01BQU8sZ0JBQWdCOztJQUNsRixNQUFBLEdBQVM7SUFDVCxNQUFBLEdBQVMsQ0FBSSxNQUFILEdBQWUsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsR0FBaEIsRUFBcUIsTUFBckIsQ0FBZixHQUFpRCxFQUFsRDtJQUVULElBQUcsTUFBQSxJQUFVLENBQVYsSUFBZSxPQUFPLEtBQVAsS0FBbUIsUUFBbEMsSUFBOEMsS0FBQSxZQUFpQixJQUEvRCxJQUF1RSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQWQsQ0FBMUU7TUFDSSxNQUFBLElBQVUsTUFBQSxHQUFTLE1BQU0sQ0FBQyxJ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Q0FBQyxVQUFXLENBQUEsT0FBQSxDQUFuQixHQUE4QixnQkFGbEM7O0VBUE87O0VBY1gsSUFBQyxDQUFBLFNBQUQsR0FBWSxTQUFDLEtBQUQsRUFBUSxNQUFSLEVBQWdCLE1BQWhCLEVBQXdCLHNCQUF4QixFQUFnRCxhQUFoRDtBQUNSLFdBQU8sSUFBQyxDQUFBLElBQUQsQ0FBTSxLQUFOLEVBQWEsTUFBYixFQUFxQixNQUFyQixFQUE2QixzQkFBN0IsRUFBcUQsYUFBckQ7RUFEQzs7RUFNWixJQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsc0JBQWpCLEVBQXlDLGFBQXpDO0FBQ0gsV0FBTyxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVgsRUFBaUIsUUFBakIsRUFBMkIsc0JBQTNCLEVBQW1ELGFBQW5EO0VBREo7Ozs7Ozs7RUFLWCxNQUFNLENBQUUsSUFBUixHQUFlOzs7QUFHZixJQUFPLGdEQUFQO0VBQ0ksSUFBQyxDQUFBLElBQUQsR0FBUSxLQURaOzs7QUFHQSxNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcblV0aWxzICAgPSByZXF1aXJlICcuL1V0aWxzJ1xuSW5saW5lICA9IHJlcXVpcmUgJy4vSW5saW5lJ1xuXG4jIER1bXBlciBkdW1wcyBKYXZhU2NyaXB0IHZhcmlhYmxlcyB0byBZQU1MIHN0cmluZ3MuXG4jXG5jbGFzcyBEdW1wZXJcblxuICAgICMgVGhlIGFtb3VudCBvZiBzcGFjZXMgdG8gdXNlIGZvciBpbmRlbnRhdGlvbiBvZiBuZXN0ZWQgbm9kZXMuXG4gICAgQGluZGVudGF0aW9uOiAgIDRcblxuXG4gICAgIyBEdW1wcyBhIEphdmFTY3JpcHQgdmFsdWUgdG8gWUFNTC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICBpbnB1dCAgICAgICAgICAgICAgICAgICBUaGUgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgaW5saW5lICAgICAgICAgICAgICAgICAgVGhlIGxldmVsIHdoZXJlIHlvdSBzd2l0Y2ggdG8gaW5saW5lIFlBTUxcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIGluZGVudCAgICAgICAgICAgICAgICAgIFRoZSBsZXZlbCBvZiBpbmRlbnRhdGlvbiAodXNlZCBpbnRlcm5hbGx5KVxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RW5jb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgVGhlIFlBTUwgcmVwcmVzZW50YXRpb24gb2YgdGhlIEphdmFTY3JpcHQgdmFsdWVcbiAgICAjXG4gICAgZHVtcDogKGlucHV0LCBpbmxpbmUgPSAwLCBpbmRlbnQgPSAwLCBleGNlcHRpb25PbkludmFsaWRUeXBlID0gZmFsc2UsIG9iamVjdEVuY29kZXIgPSBudWxsKSAtPlxuICAgICAgICBvdXRwdXQgPSAnJ1xuICAgICAgICBwcmVmaXggPSAoaWYgaW5kZW50IHRoZW4gVXRpbHMuc3RyUmVwZWF0KCcgJywgaW5kZW50KSBlbHNlICcnKVxuXG4gICAgICAgIGlmIGlubGluZSA8PSAwIG9yIHR5cGVvZihpbnB1dCkgaXNudCAnb2JqZWN0JyBvciBpbnB1dCBpbnN0YW5jZW9mIERhdGUgb3IgVXRpbHMuaXNFbXB0eShpbnB1dClcbiAgICAgICAgICAgIG91dHB1dCArPSBwcmVmaXggKyBJbmxpbmUuZHVtcChpbnB1dCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcilcbiAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIGlucHV0IGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICBmb3IgdmFsdWUgaW4gaW5wdXRcbiAgICAgICAgICAgICAgICAgICAgd2lsbEJlSW5saW5lZCA9IChpbmxpbmUgLSAxIDw9IDAgb3IgdHlwZW9mKHZhbHVlKSBpc250ICdvYmplY3QnIG9yIFV0aWxzLmlzRW1wdHkodmFsdWUpKVxuXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCArPVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICctJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAoaWYgd2lsbEJlSW5saW5lZCB0aGVuICcgJyBlbHNlIFwiXFxuXCIpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIEBkdW1wKHZhbHVlLCBpbmxpbmUgLSAxLCAoaWYgd2lsbEJlSW5saW5lZCB0aGVuIDAgZWxzZSBpbmRlbnQgKyBAaW5kZW50YXRpb24pLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3RFbmNvZGVyKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAoaWYgd2lsbEJlSW5saW5lZCB0aGVuIFwiXFxuXCIgZWxzZSAnJylcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIGlucHV0XG4gICAgICAgICAgICAgICAgICAgIHdpbGxCZUlubGluZWQgPSAoaW5saW5lIC0gMSA8PSAwIG9yIHR5cGVvZih2YWx1ZSkgaXNudCAnb2JqZWN0JyBvciBVdGlscy5pc0VtcHR5KHZhbHVlKSlcblxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz1cbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZpeCArXG4gICAgICAgICAgICAgICAgICAgICAgICBJbmxpbmUuZHVtcChrZXksIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdEVuY29kZXIpICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChpZiB3aWxsQmVJbmxpbmVkIHRoZW4gJyAnIGVsc2UgXCJcXG5cIikgK1xuICAgICAgICAgICAgICAgICAgICAgICAgQGR1bXAodmFsdWUsIGlubGluZSAtIDEsIChpZiB3aWxsQmVJbmxpbmVkIHRoZW4gMCBlbHNlIGluZGVudCArIEBpbmRlbnRhdGlvbiksIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdEVuY29kZXIpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChpZiB3aWxsQmVJbmxpbmVkIHRoZW4gXCJcXG5cIiBlbHNlICcnKVxuXG4gICAgICAgIHJldHVybiBvdXRwdXRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IER1bXBlclxuIiwiXG5QYXR0ZXJuID0gcmVxdWlyZSAnLi9QYXR0ZXJuJ1xuXG4jIEVzY2FwZXIgZW5jYXBzdWxhdGVzIGVzY2FwaW5nIHJ1bGVzIGZvciBzaW5nbGVcbiMgYW5kIGRvdWJsZS1xdW90ZWQgWUFNTCBzdHJpbmdzLlxuY2xhc3MgRXNjYXBlclxuXG4gICAgIyBNYXBwaW5nIGFycmF5cyBmb3IgZXNjYXBpbmcgYSBkb3VibGUgcXVvdGVkIHN0cmluZy4gVGhlIGJhY2tzbGFzaCBpc1xuICAgICMgZmlyc3QgdG8gZW5zdXJlIHByb3BlciBlc2NhcGluZy5cbiAgICBATElTVF9FU0NBUEVFUzogICAgICAgICAgICAgICAgIFsnXFxcXCcsICdcXFxcXFxcXCcsICdcXFxcXCInLCAnXCInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFx4MDBcIiwgIFwiXFx4MDFcIiwgIFwiXFx4MDJcIiwgIFwiXFx4MDNcIiwgIFwiXFx4MDRcIiwgIFwiXFx4MDVcIiwgIFwiXFx4MDZcIiwgIFwiXFx4MDdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxceDA4XCIsICBcIlxceDA5XCIsICBcIlxceDBhXCIsICBcIlxceDBiXCIsICBcIlxceDBjXCIsICBcIlxceDBkXCIsICBcIlxceDBlXCIsICBcIlxceDBmXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXHgxMFwiLCAgXCJcXHgxMVwiLCAgXCJcXHgxMlwiLCAgXCJcXHgxM1wiLCAgXCJcXHgxNFwiLCAgXCJcXHgxNVwiLCAgXCJcXHgxNlwiLCAgXCJcXHgxN1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFx4MThcIiwgIFwiXFx4MTlcIiwgIFwiXFx4MWFcIiwgIFwiXFx4MWJcIiwgIFwiXFx4MWNcIiwgIFwiXFx4MWRcIiwgIFwiXFx4MWVcIiwgIFwiXFx4MWZcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY2ggPSBTdHJpbmcuZnJvbUNoYXJDb2RlKSgweDAwODUpLCBjaCgweDAwQTApLCBjaCgweDIwMjgpLCBjaCgweDIwMjkpXVxuICAgIEBMSVNUX0VTQ0FQRUQ6ICAgICAgICAgICAgICAgICAgWydcXFxcXFxcXCcsICdcXFxcXCInLCAnXFxcXFwiJywgJ1xcXFxcIicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXFxcMFwiLCAgIFwiXFxcXHgwMVwiLCBcIlxcXFx4MDJcIiwgXCJcXFxceDAzXCIsIFwiXFxcXHgwNFwiLCBcIlxcXFx4MDVcIiwgXCJcXFxceDA2XCIsIFwiXFxcXGFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxcXFxiXCIsICAgXCJcXFxcdFwiLCAgIFwiXFxcXG5cIiwgICBcIlxcXFx2XCIsICAgXCJcXFxcZlwiLCAgIFwiXFxcXHJcIiwgICBcIlxcXFx4MGVcIiwgXCJcXFxceDBmXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXFxceDEwXCIsIFwiXFxcXHgxMVwiLCBcIlxcXFx4MTJcIiwgXCJcXFxceDEzXCIsIFwiXFxcXHgxNFwiLCBcIlxcXFx4MTVcIiwgXCJcXFxceDE2XCIsIFwiXFxcXHgxN1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxcXHgxOFwiLCBcIlxcXFx4MTlcIiwgXCJcXFxceDFhXCIsIFwiXFxcXGVcIiwgICBcIlxcXFx4MWNcIiwgXCJcXFxceDFkXCIsIFwiXFxcXHgxZVwiLCBcIlxcXFx4MWZcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxcXFxOXCIsIFwiXFxcXF9cIiwgXCJcXFxcTFwiLCBcIlxcXFxQXCJdXG5cbiAgICBATUFQUElOR19FU0NBUEVFU19UT19FU0NBUEVEOiAgIGRvID0+XG4gICAgICAgIG1hcHBpbmcgPSB7fVxuICAgICAgICBmb3IgaSBpbiBbMC4uLkBMSVNUX0VTQ0FQRUVTLmxlbmd0aF1cbiAgICAgICAgICAgIG1hcHBpbmdbQExJU1RfRVNDQVBFRVNbaV1dID0gQExJU1RfRVNDQVBFRFtpXVxuICAgICAgICByZXR1cm4gbWFwcGluZ1xuXG4gICAgIyBDaGFyYWN0ZXJzIHRoYXQgd291bGQgY2F1c2UgYSBkdW1wZWQgc3RyaW5nIHRvIHJlcXVpcmUgZG91YmxlIHF1b3RpbmcuXG4gICAgQFBBVFRFUk5fQ0hBUkFDVEVSU19UT19FU0NBUEU6ICBuZXcgUGF0dGVybiAnW1xcXFx4MDAtXFxcXHgxZl18XFx4YzJcXHg4NXxcXHhjMlxceGEwfFxceGUyXFx4ODBcXHhhOHxcXHhlMlxceDgwXFx4YTknXG5cbiAgICAjIE90aGVyIHByZWNvbXBpbGVkIHBhdHRlcm5zXG4gICAgQFBBVFRFUk5fTUFQUElOR19FU0NBUEVFUzogICAgICBuZXcgUGF0dGVybiBATElTVF9FU0NBUEVFUy5qb2luKCd8Jykuc3BsaXQoJ1xcXFwnKS5qb2luKCdcXFxcXFxcXCcpXG4gICAgQFBBVFRFUk5fU0lOR0xFX1FVT1RJTkc6ICAgICAgICBuZXcgUGF0dGVybiAnW1xcJ1wiOnt9W1xcXFxdLCojP118XlstP3w8Pj0hJUBgXSdcblxuXG5cbiAgICAjIERldGVybWluZXMgaWYgYSBKYXZhU2NyaXB0IHZhbHVlIHdvdWxkIHJlcXVpcmUgZG91YmxlIHF1b3RpbmcgaW4gWUFNTC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgIEEgSmF2YVNjcmlwdCB2YWx1ZSB2YWx1ZVxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dIHRydWUgICAgaWYgdGhlIHZhbHVlIHdvdWxkIHJlcXVpcmUgZG91YmxlIHF1b3Rlcy5cbiAgICAjXG4gICAgQHJlcXVpcmVzRG91YmxlUXVvdGluZzogKHZhbHVlKSAtPlxuICAgICAgICByZXR1cm4gQFBBVFRFUk5fQ0hBUkFDVEVSU19UT19FU0NBUEUudGVzdCB2YWx1ZVxuXG5cbiAgICAjIEVzY2FwZXMgYW5kIHN1cnJvdW5kcyBhIEphdmFTY3JpcHQgdmFsdWUgd2l0aCBkb3VibGUgcXVvdGVzLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHZhbHVlICAgQSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgVGhlIHF1b3RlZCwgZXNjYXBlZCBzdHJpbmdcbiAgICAjXG4gICAgQGVzY2FwZVdpdGhEb3VibGVRdW90ZXM6ICh2YWx1ZSkgLT5cbiAgICAgICAgcmVzdWx0ID0gQFBBVFRFUk5fTUFQUElOR19FU0NBUEVFUy5yZXBsYWNlIHZhbHVlLCAoc3RyKSA9PlxuICAgICAgICAgICAgcmV0dXJuIEBNQVBQSU5HX0VTQ0FQRUVTX1RPX0VTQ0FQRURbc3RyXVxuICAgICAgICByZXR1cm4gJ1wiJytyZXN1bHQrJ1wiJ1xuXG5cbiAgICAjIERldGVybWluZXMgaWYgYSBKYXZhU2NyaXB0IHZhbHVlIHdvdWxkIHJlcXVpcmUgc2luZ2xlIHF1b3RpbmcgaW4gWUFNTC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgIEEgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dIHRydWUgaWYgdGhlIHZhbHVlIHdvdWxkIHJlcXVpcmUgc2luZ2xlIHF1b3Rlcy5cbiAgICAjXG4gICAgQHJlcXVpcmVzU2luZ2xlUXVvdGluZzogKHZhbHVlKSAtPlxuICAgICAgICByZXR1cm4gQFBBVFRFUk5fU0lOR0xFX1FVT1RJTkcudGVzdCB2YWx1ZVxuXG5cbiAgICAjIEVzY2FwZXMgYW5kIHN1cnJvdW5kcyBhIEphdmFTY3JpcHQgdmFsdWUgd2l0aCBzaW5nbGUgcXVvdGVzLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHZhbHVlICAgQSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgVGhlIHF1b3RlZCwgZXNjYXBlZCBzdHJpbmdcbiAgICAjXG4gICAgQGVzY2FwZVdpdGhTaW5nbGVRdW90ZXM6ICh2YWx1ZSkgLT5cbiAgICAgICAgcmV0dXJuIFwiJ1wiK3ZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKStcIidcIlxuXG5cbm1vZHVsZS5leHBvcnRzID0gRXNjYXBlclxuIiwiXG5jbGFzcyBEdW1wRXhjZXB0aW9uIGV4dGVuZHMgRXJyb3JcblxuICAgIGNvbnN0cnVjdG9yOiAoQG1lc3NhZ2UsIEBwYXJzZWRMaW5lLCBAc25pcHBldCkgLT5cblxuICAgIHRvU3RyaW5nOiAtPlxuICAgICAgICBpZiBAcGFyc2VkTGluZT8gYW5kIEBzbmlwcGV0P1xuICAgICAgICAgICAgcmV0dXJuICc8RHVtcEV4Y2VwdGlvbj4gJyArIEBtZXNzYWdlICsgJyAobGluZSAnICsgQHBhcnNlZExpbmUgKyAnOiBcXCcnICsgQHNuaXBwZXQgKyAnXFwnKSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuICc8RHVtcEV4Y2VwdGlvbj4gJyArIEBtZXNzYWdlXG5cbm1vZHVsZS5leHBvcnRzID0gRHVtcEV4Y2VwdGlvblxuIiwiXG5jbGFzcyBQYXJzZUV4Y2VwdGlvbiBleHRlbmRzIEVycm9yXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBtZXNzYWdlLCBAcGFyc2VkTGluZSwgQHNuaXBwZXQpIC0+XG5cbiAgICB0b1N0cmluZzogLT5cbiAgICAgICAgaWYgQHBhcnNlZExpbmU/IGFuZCBAc25pcHBldD9cbiAgICAgICAgICAgIHJldHVybiAnPFBhcnNlRXhjZXB0aW9uPiAnICsgQG1lc3NhZ2UgKyAnIChsaW5lICcgKyBAcGFyc2VkTGluZSArICc6IFxcJycgKyBAc25pcHBldCArICdcXCcpJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gJzxQYXJzZUV4Y2VwdGlvbj4gJyArIEBtZXNzYWdlXG5cbm1vZHVsZS5leHBvcnRzID0gUGFyc2VFeGNlcHRpb25cbiIsIlxuY2xhc3MgUGFyc2VNb3JlIGV4dGVuZHMgRXJyb3JcblxuICAgIGNvbnN0cnVjdG9yOiAoQG1lc3NhZ2UsIEBwYXJzZWRMaW5lLCBAc25pcHBldCkgLT5cblxuICAgIHRvU3RyaW5nOiAtPlxuICAgICAgICBpZiBAcGFyc2VkTGluZT8gYW5kIEBzbmlwcGV0P1xuICAgICAgICAgICAgcmV0dXJuICc8UGFyc2VNb3JlPiAnICsgQG1lc3NhZ2UgKyAnIChsaW5lICcgKyBAcGFyc2VkTGluZSArICc6IFxcJycgKyBAc25pcHBldCArICdcXCcpJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gJzxQYXJzZU1vcmU+ICcgKyBAbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlTW9yZVxuIiwiXG5QYXR0ZXJuICAgICAgICAgPSByZXF1aXJlICcuL1BhdHRlcm4nXG5VbmVzY2FwZXIgICAgICAgPSByZXF1aXJlICcuL1VuZXNjYXBlcidcbkVzY2FwZXIgICAgICAgICA9IHJlcXVpcmUgJy4vRXNjYXBlcidcblV0aWxzICAgICAgICAgICA9IHJlcXVpcmUgJy4vVXRpbHMnXG5QYXJzZUV4Y2VwdGlvbiAgPSByZXF1aXJlICcuL0V4Y2VwdGlvbi9QYXJzZUV4Y2VwdGlvbidcblBhcnNlTW9yZSAgICAgICA9IHJlcXVpcmUgJy4vRXhjZXB0aW9uL1BhcnNlTW9yZSdcbkR1bXBFeGNlcHRpb24gICA9IHJlcXVpcmUgJy4vRXhjZXB0aW9uL0R1bXBFeGNlcHRpb24nXG5cbiMgSW5saW5lIFlBTUwgcGFyc2luZyBhbmQgZHVtcGluZ1xuY2xhc3MgSW5saW5lXG5cbiAgICAjIFF1b3RlZCBzdHJpbmcgcmVndWxhciBleHByZXNzaW9uXG4gICAgQFJFR0VYX1FVT1RFRF9TVFJJTkc6ICAgICAgICAgICAgICAgJyg/OlwiKD86W15cIlxcXFxcXFxcXSooPzpcXFxcXFxcXC5bXlwiXFxcXFxcXFxdKikqKVwifFxcJyg/OlteXFwnXSooPzpcXCdcXCdbXlxcJ10qKSopXFwnKSdcblxuICAgICMgUHJlLWNvbXBpbGVkIHBhdHRlcm5zXG4gICAgI1xuICAgIEBQQVRURVJOX1RSQUlMSU5HX0NPTU1FTlRTOiAgICAgICAgIG5ldyBQYXR0ZXJuICdeXFxcXHMqIy4qJCdcbiAgICBAUEFUVEVSTl9RVU9URURfU0NBTEFSOiAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXicrQFJFR0VYX1FVT1RFRF9TVFJJTkdcbiAgICBAUEFUVEVSTl9USE9VU0FORF9OVU1FUklDX1NDQUxBUjogICBuZXcgUGF0dGVybiAnXigtfFxcXFwrKT9bMC05LF0rKFxcXFwuWzAtOV0rKT8kJ1xuICAgIEBQQVRURVJOX1NDQUxBUl9CWV9ERUxJTUlURVJTOiAgICAgIHt9XG5cbiAgICAjIFNldHRpbmdzXG4gICAgQHNldHRpbmdzOiB7fVxuXG5cbiAgICAjIENvbmZpZ3VyZSBZQU1MIGlubGluZS5cbiAgICAjXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBleGNlcHRpb25PbkludmFsaWRUeXBlICB0cnVlIGlmIGFuIGV4Y2VwdGlvbiBtdXN0IGJlIHRocm93biBvbiBpbnZhbGlkIHR5cGVzIChhIEphdmFTY3JpcHQgcmVzb3VyY2Ugb3Igb2JqZWN0KSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICBAY29uZmlndXJlOiAoZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IG51bGwsIG9iamVjdERlY29kZXIgPSBudWxsKSAtPlxuICAgICAgICAjIFVwZGF0ZSBzZXR0aW5nc1xuICAgICAgICBAc2V0dGluZ3MuZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGV4Y2VwdGlvbk9uSW52YWxpZFR5cGVcbiAgICAgICAgQHNldHRpbmdzLm9iamVjdERlY29kZXIgPSBvYmplY3REZWNvZGVyXG4gICAgICAgIHJldHVyblxuXG5cbiAgICAjIENvbnZlcnRzIGEgWUFNTCBzdHJpbmcgdG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgICAgICAgICAgICAgICAgICBBIFlBTUwgc3RyaW5nXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBleGNlcHRpb25PbkludmFsaWRUeXBlICB0cnVlIGlmIGFuIGV4Y2VwdGlvbiBtdXN0IGJlIHRocm93biBvbiBpbnZhbGlkIHR5cGVzIChhIEphdmFTY3JpcHQgcmVzb3VyY2Ugb3Igb2JqZWN0KSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gIEEgSmF2YVNjcmlwdCBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBZQU1MIHN0cmluZ1xuICAgICNcbiAgICAjIEB0aHJvdyBbUGFyc2VFeGNlcHRpb25dXG4gICAgI1xuICAgIEBwYXJzZTogKHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlID0gZmFsc2UsIG9iamVjdERlY29kZXIgPSBudWxsKSAtPlxuICAgICAgICAjIFVwZGF0ZSBzZXR0aW5ncyBmcm9tIGxhc3QgY2FsbCBvZiBJbmxpbmUucGFyc2UoKVxuICAgICAgICBAc2V0dGluZ3MuZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGV4Y2VwdGlvbk9uSW52YWxpZFR5cGVcbiAgICAgICAgQHNldHRpbmdzLm9iamVjdERlY29kZXIgPSBvYmplY3REZWNvZGVyXG5cbiAgICAgICAgaWYgbm90IHZhbHVlP1xuICAgICAgICAgICAgcmV0dXJuICcnXG5cbiAgICAgICAgdmFsdWUgPSBVdGlscy50cmltIHZhbHVlXG5cbiAgICAgICAgaWYgMCBpcyB2YWx1ZS5sZW5ndGhcbiAgICAgICAgICAgIHJldHVybiAnJ1xuXG4gICAgICAgICMgS2VlcCBhIGNvbnRleHQgb2JqZWN0IHRvIHBhc3MgdGhyb3VnaCBzdGF0aWMgbWV0aG9kc1xuICAgICAgICBjb250ZXh0ID0ge2V4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXIsIGk6IDB9XG5cbiAgICAgICAgc3dpdGNoIHZhbHVlLmNoYXJBdCgwKVxuICAgICAgICAgICAgd2hlbiAnWydcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGFyc2VTZXF1ZW5jZSB2YWx1ZSwgY29udGV4dFxuICAgICAgICAgICAgICAgICsrY29udGV4dC5pXG4gICAgICAgICAgICB3aGVuICd7J1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBwYXJzZU1hcHBpbmcgdmFsdWUsIGNvbnRleHRcbiAgICAgICAgICAgICAgICArK2NvbnRleHQuaVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBwYXJzZVNjYWxhciB2YWx1ZSwgbnVsbCwgWydcIicsIFwiJ1wiXSwgY29udGV4dFxuXG4gICAgICAgICMgU29tZSBjb21tZW50cyBhcmUgYWxsb3dlZCBhdCB0aGUgZW5kXG4gICAgICAgIGlmIEBQQVRURVJOX1RSQUlMSU5HX0NPTU1FTlRTLnJlcGxhY2UodmFsdWVbY29udGV4dC5pLi5dLCAnJykgaXNudCAnJ1xuICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdVbmV4cGVjdGVkIGNoYXJhY3RlcnMgbmVhciBcIicrdmFsdWVbY29udGV4dC5pLi5dKydcIi4nXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuXG5cbiAgICAjIER1bXBzIGEgZ2l2ZW4gSmF2YVNjcmlwdCB2YXJpYWJsZSB0byBhIFlBTUwgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIHZhbHVlICAgICAgICAgICAgICAgICAgIFRoZSBKYXZhU2NyaXB0IHZhcmlhYmxlIHRvIGNvbnZlcnRcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdEVuY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gdG8gc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSBZQU1MIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgI1xuICAgICMgQHRocm93IFtEdW1wRXhjZXB0aW9uXVxuICAgICNcbiAgICBAZHVtcDogKHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlID0gZmFsc2UsIG9iamVjdEVuY29kZXIgPSBudWxsKSAtPlxuICAgICAgICBpZiBub3QgdmFsdWU/XG4gICAgICAgICAgICByZXR1cm4gJ251bGwnXG4gICAgICAgIHR5cGUgPSB0eXBlb2YgdmFsdWVcbiAgICAgICAgaWYgdHlwZSBpcyAnb2JqZWN0J1xuICAgICAgICAgICAgaWYgb2JqZWN0RW5jb2Rlcj9cbiAgICAgICAgICAgICAgICByZXN1bHQgPSBvYmplY3RFbmNvZGVyIHZhbHVlXG4gICAgICAgICAgICAgICAgaWYgdHlwZW9mIHJlc3VsdCBpcyAnc3RyaW5nJyBvciByZXN1bHQ/XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgICAgIGlmIHZhbHVlIGluc3RhbmNlb2YgRGF0ZVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICByZXR1cm4gQGR1bXBPYmplY3QgdmFsdWVcbiAgICAgICAgaWYgdHlwZSBpcyAnYm9vbGVhbidcbiAgICAgICAgICAgIHJldHVybiAoaWYgdmFsdWUgdGhlbiAndHJ1ZScgZWxzZSAnZmFsc2UnKVxuICAgICAgICBpZiBVdGlscy5pc0RpZ2l0cyh2YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiAoaWYgdHlwZSBpcyAnc3RyaW5nJyB0aGVuIFwiJ1wiK3ZhbHVlK1wiJ1wiIGVsc2UgU3RyaW5nKHBhcnNlSW50KHZhbHVlKSkpXG4gICAgICAgIGlmIFV0aWxzLmlzTnVtZXJpYyh2YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiAoaWYgdHlwZSBpcyAnc3RyaW5nJyB0aGVuIFwiJ1wiK3ZhbHVlK1wiJ1wiIGVsc2UgU3RyaW5nKHBhcnNlRmxvYXQodmFsdWUpKSlcbiAgICAgICAgaWYgdHlwZSBpcyAnbnVtYmVyJ1xuICAgICAgICAgICAgcmV0dXJuIChpZiB2YWx1ZSBpcyBJbmZpbml0eSB0aGVuICcuSW5mJyBlbHNlIChpZiB2YWx1ZSBpcyAtSW5maW5pdHkgdGhlbiAnLS5JbmYnIGVsc2UgKGlmIGlzTmFOKHZhbHVlKSB0aGVuICcuTmFOJyBlbHNlIHZhbHVlKSkpXG4gICAgICAgIGlmIEVzY2FwZXIucmVxdWlyZXNEb3VibGVRdW90aW5nIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gRXNjYXBlci5lc2NhcGVXaXRoRG91YmxlUXVvdGVzIHZhbHVlXG4gICAgICAgIGlmIEVzY2FwZXIucmVxdWlyZXNTaW5nbGVRdW90aW5nIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gRXNjYXBlci5lc2NhcGVXaXRoU2luZ2xlUXVvdGVzIHZhbHVlXG4gICAgICAgIGlmICcnIGlzIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gJ1wiXCInXG4gICAgICAgIGlmIFV0aWxzLlBBVFRFUk5fREFURS50ZXN0IHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gXCInXCIrdmFsdWUrXCInXCI7XG4gICAgICAgIGlmIHZhbHVlLnRvTG93ZXJDYXNlKCkgaW4gWydudWxsJywnficsJ3RydWUnLCdmYWxzZSddXG4gICAgICAgICAgICByZXR1cm4gXCInXCIrdmFsdWUrXCInXCJcbiAgICAgICAgIyBEZWZhdWx0XG4gICAgICAgIHJldHVybiB2YWx1ZTtcblxuXG4gICAgIyBEdW1wcyBhIEphdmFTY3JpcHQgb2JqZWN0IHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgdmFsdWUgICAgICAgICAgICAgICAgICAgVGhlIEphdmFTY3JpcHQgb2JqZWN0IHRvIGR1bXBcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdEVuY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gZG8gc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gc3RyaW5nIFRoZSBZQU1MIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgI1xuICAgIEBkdW1wT2JqZWN0OiAodmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdFN1cHBvcnQgPSBudWxsKSAtPlxuICAgICAgICAjIEFycmF5XG4gICAgICAgIGlmIHZhbHVlIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIG91dHB1dCA9IFtdXG4gICAgICAgICAgICBmb3IgdmFsIGluIHZhbHVlXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggQGR1bXAgdmFsXG4gICAgICAgICAgICByZXR1cm4gJ1snK291dHB1dC5qb2luKCcsICcpKyddJ1xuXG4gICAgICAgICMgTWFwcGluZ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRwdXQgPSBbXVxuICAgICAgICAgICAgZm9yIGtleSwgdmFsIG9mIHZhbHVlXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggQGR1bXAoa2V5KSsnOiAnK0BkdW1wKHZhbClcbiAgICAgICAgICAgIHJldHVybiAneycrb3V0cHV0LmpvaW4oJywgJykrJ30nXG5cblxuICAgICMgUGFyc2VzIGEgc2NhbGFyIHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgc2NhbGFyXG4gICAgIyBAcGFyYW0gW0FycmF5XSAgICBkZWxpbWl0ZXJzXG4gICAgIyBAcGFyYW0gW0FycmF5XSAgICBzdHJpbmdEZWxpbWl0ZXJzXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICBjb250ZXh0XG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBldmFsdWF0ZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBXaGVuIG1hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgaXMgcGFyc2VkXG4gICAgI1xuICAgIEBwYXJzZVNjYWxhcjogKHNjYWxhciwgZGVsaW1pdGVycyA9IG51bGwsIHN0cmluZ0RlbGltaXRlcnMgPSBbJ1wiJywgXCInXCJdLCBjb250ZXh0ID0gbnVsbCwgZXZhbHVhdGUgPSB0cnVlKSAtPlxuICAgICAgICB1bmxlc3MgY29udGV4dD9cbiAgICAgICAgICAgIGNvbnRleHQgPSBleGNlcHRpb25PbkludmFsaWRUeXBlOiBAc2V0dGluZ3MuZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcjogQHNldHRpbmdzLm9iamVjdERlY29kZXIsIGk6IDBcbiAgICAgICAge2l9ID0gY29udGV4dFxuXG4gICAgICAgIGlmIHNjYWxhci5jaGFyQXQoaSkgaW4gc3RyaW5nRGVsaW1pdGVyc1xuICAgICAgICAgICAgIyBRdW90ZWQgc2NhbGFyXG4gICAgICAgICAgICBvdXRwdXQgPSBAcGFyc2VRdW90ZWRTY2FsYXIgc2NhbGFyLCBjb250ZXh0XG4gICAgICAgICAgICB7aX0gPSBjb250ZXh0XG5cbiAgICAgICAgICAgIGlmIGRlbGltaXRlcnM/XG4gICAgICAgICAgICAgICAgdG1wID0gVXRpbHMubHRyaW0gc2NhbGFyW2kuLl0sICcgJ1xuICAgICAgICAgICAgICAgIGlmIG5vdCh0bXAuY2hhckF0KDApIGluIGRlbGltaXRlcnMpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnVW5leHBlY3RlZCBjaGFyYWN0ZXJzICgnK3NjYWxhcltpLi5dKycpLidcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIFwibm9ybWFsXCIgc3RyaW5nXG4gICAgICAgICAgICBpZiBub3QgZGVsaW1pdGVyc1xuICAgICAgICAgICAgICAgIG91dHB1dCA9IHNjYWxhcltpLi5dXG4gICAgICAgICAgICAgICAgaSArPSBvdXRwdXQubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICAjIFJlbW92ZSBjb21tZW50c1xuICAgICAgICAgICAgICAgIHN0cnBvcyA9IG91dHB1dC5pbmRleE9mICcgIydcbiAgICAgICAgICAgICAgICBpZiBzdHJwb3MgaXNudCAtMVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgPSBVdGlscy5ydHJpbSBvdXRwdXRbMC4uLnN0cnBvc11cblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGpvaW5lZERlbGltaXRlcnMgPSBkZWxpbWl0ZXJzLmpvaW4oJ3wnKVxuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBAUEFUVEVSTl9TQ0FMQVJfQllfREVMSU1JVEVSU1tqb2luZWREZWxpbWl0ZXJzXVxuICAgICAgICAgICAgICAgIHVubGVzcyBwYXR0ZXJuP1xuICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuID0gbmV3IFBhdHRlcm4gJ14oLis/KSgnK2pvaW5lZERlbGltaXRlcnMrJyknXG4gICAgICAgICAgICAgICAgICAgIEBQQVRURVJOX1NDQUxBUl9CWV9ERUxJTUlURVJTW2pvaW5lZERlbGltaXRlcnNdID0gcGF0dGVyblxuICAgICAgICAgICAgICAgIGlmIG1hdGNoID0gcGF0dGVybi5leGVjIHNjYWxhcltpLi5dXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCA9IG1hdGNoWzFdXG4gICAgICAgICAgICAgICAgICAgIGkgKz0gb3V0cHV0Lmxlbmd0aFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdNYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nICgnK3NjYWxhcisnKS4nXG5cblxuICAgICAgICAgICAgaWYgZXZhbHVhdGVcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSBAZXZhbHVhdGVTY2FsYXIgb3V0cHV0LCBjb250ZXh0XG5cbiAgICAgICAgY29udGV4dC5pID0gaVxuICAgICAgICByZXR1cm4gb3V0cHV0XG5cblxuICAgICMgUGFyc2VzIGEgcXVvdGVkIHNjYWxhciB0byBZQU1MLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHNjYWxhclxuICAgICMgQHBhcmFtIFtPYmplY3RdICAgY29udGV4dFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlTW9yZV0gV2hlbiBtYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nIGlzIHBhcnNlZFxuICAgICNcbiAgICBAcGFyc2VRdW90ZWRTY2FsYXI6IChzY2FsYXIsIGNvbnRleHQpIC0+XG4gICAgICAgIHtpfSA9IGNvbnRleHRcblxuICAgICAgICB1bmxlc3MgbWF0Y2ggPSBAUEFUVEVSTl9RVU9URURfU0NBTEFSLmV4ZWMgc2NhbGFyW2kuLl1cbiAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZU1vcmUgJ01hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgKCcrc2NhbGFyW2kuLl0rJykuJ1xuXG4gICAgICAgIG91dHB1dCA9IG1hdGNoWzBdLnN1YnN0cigxLCBtYXRjaFswXS5sZW5ndGggLSAyKVxuXG4gICAgICAgIGlmICdcIicgaXMgc2NhbGFyLmNoYXJBdChpKVxuICAgICAgICAgICAgb3V0cHV0ID0gVW5lc2NhcGVyLnVuZXNjYXBlRG91YmxlUXVvdGVkU3RyaW5nIG91dHB1dFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRwdXQgPSBVbmVzY2FwZXIudW5lc2NhcGVTaW5nbGVRdW90ZWRTdHJpbmcgb3V0cHV0XG5cbiAgICAgICAgaSArPSBtYXRjaFswXS5sZW5ndGhcblxuICAgICAgICBjb250ZXh0LmkgPSBpXG4gICAgICAgIHJldHVybiBvdXRwdXRcblxuXG4gICAgIyBQYXJzZXMgYSBzZXF1ZW5jZSB0byBhIFlBTUwgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHNlcXVlbmNlXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICBjb250ZXh0XG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgQSBZQU1MIHN0cmluZ1xuICAgICNcbiAgICAjIEB0aHJvdyBbUGFyc2VNb3JlXSBXaGVuIG1hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgaXMgcGFyc2VkXG4gICAgI1xuICAgIEBwYXJzZVNlcXVlbmNlOiAoc2VxdWVuY2UsIGNvbnRleHQpIC0+XG4gICAgICAgIG91dHB1dCA9IFtdXG4gICAgICAgIGxlbiA9IHNlcXVlbmNlLmxlbmd0aFxuICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgIGkgKz0gMVxuXG4gICAgICAgICMgW2ZvbywgYmFyLCAuLi5dXG4gICAgICAgIHdoaWxlIGkgPCBsZW5cbiAgICAgICAgICAgIGNvbnRleHQuaSA9IGlcbiAgICAgICAgICAgIHN3aXRjaCBzZXF1ZW5jZS5jaGFyQXQoaSlcbiAgICAgICAgICAgICAgICB3aGVuICdbJ1xuICAgICAgICAgICAgICAgICAgICAjIE5lc3RlZCBzZXF1ZW5jZVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCBAcGFyc2VTZXF1ZW5jZSBzZXF1ZW5jZSwgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgICAgICAgICAgd2hlbiAneydcbiAgICAgICAgICAgICAgICAgICAgIyBOZXN0ZWQgbWFwcGluZ1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCBAcGFyc2VNYXBwaW5nIHNlcXVlbmNlLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgICAgICAgICB3aGVuICddJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0XG4gICAgICAgICAgICAgICAgd2hlbiAnLCcsICcgJywgXCJcXG5cIlxuICAgICAgICAgICAgICAgICAgICAjIERvIG5vdGhpbmdcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlzUXVvdGVkID0gKHNlcXVlbmNlLmNoYXJBdChpKSBpbiBbJ1wiJywgXCInXCJdKVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBwYXJzZVNjYWxhciBzZXF1ZW5jZSwgWycsJywgJ10nXSwgWydcIicsIFwiJ1wiXSwgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgbm90KGlzUXVvdGVkKSBhbmQgdHlwZW9mKHZhbHVlKSBpcyAnc3RyaW5nJyBhbmQgKHZhbHVlLmluZGV4T2YoJzogJykgaXNudCAtMSBvciB2YWx1ZS5pbmRleE9mKFwiOlxcblwiKSBpc250IC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBFbWJlZGRlZCBtYXBwaW5nP1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAcGFyc2VNYXBwaW5nICd7Jyt2YWx1ZSsnfSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE5vLCBpdCdzIG5vdFxuXG5cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggdmFsdWVcblxuICAgICAgICAgICAgICAgICAgICAtLWlcblxuICAgICAgICAgICAgKytpXG5cbiAgICAgICAgdGhyb3cgbmV3IFBhcnNlTW9yZSAnTWFsZm9ybWVkIGlubGluZSBZQU1MIHN0cmluZyAnK3NlcXVlbmNlXG5cblxuICAgICMgUGFyc2VzIGEgbWFwcGluZyB0byBhIFlBTUwgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIG1hcHBpbmdcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIGNvbnRleHRcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZU1vcmVdIFdoZW4gbWFsZm9ybWVkIGlubGluZSBZQU1MIHN0cmluZyBpcyBwYXJzZWRcbiAgICAjXG4gICAgQHBhcnNlTWFwcGluZzogKG1hcHBpbmcsIGNvbnRleHQpIC0+XG4gICAgICAgIG91dHB1dCA9IHt9XG4gICAgICAgIGxlbiA9IG1hcHBpbmcubGVuZ3RoXG4gICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgaSArPSAxXG5cbiAgICAgICAgIyB7Zm9vOiBiYXIsIGJhcjpmb28sIC4uLn1cbiAgICAgICAgc2hvdWxkQ29udGludWVXaGlsZUxvb3AgPSBmYWxzZVxuICAgICAgICB3aGlsZSBpIDwgbGVuXG4gICAgICAgICAgICBjb250ZXh0LmkgPSBpXG4gICAgICAgICAgICBzd2l0Y2ggbWFwcGluZy5jaGFyQXQoaSlcbiAgICAgICAgICAgICAgICB3aGVuICcgJywgJywnLCBcIlxcblwiXG4gICAgICAgICAgICAgICAgICAgICsraVxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmkgPSBpXG4gICAgICAgICAgICAgICAgICAgIHNob3VsZENvbnRpbnVlV2hpbGVMb29wID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHdoZW4gJ30nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXRcblxuICAgICAgICAgICAgaWYgc2hvdWxkQ29udGludWVXaGlsZUxvb3BcbiAgICAgICAgICAgICAgICBzaG91bGRDb250aW51ZVdoaWxlTG9vcCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgIyBLZXlcbiAgICAgICAgICAgIGtleSA9IEBwYXJzZVNjYWxhciBtYXBwaW5nLCBbJzonLCAnICcsIFwiXFxuXCJdLCBbJ1wiJywgXCInXCJdLCBjb250ZXh0LCBmYWxzZVxuICAgICAgICAgICAge2l9ID0gY29udGV4dFxuXG4gICAgICAgICAgICAjIFZhbHVlXG4gICAgICAgICAgICBkb25lID0gZmFsc2VcblxuICAgICAgICAgICAgd2hpbGUgaSA8IGxlblxuICAgICAgICAgICAgICAgIGNvbnRleHQuaSA9IGlcbiAgICAgICAgICAgICAgICBzd2l0Y2ggbWFwcGluZy5jaGFyQXQoaSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnWydcbiAgICAgICAgICAgICAgICAgICAgICAgICMgTmVzdGVkIHNlcXVlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBwYXJzZVNlcXVlbmNlIG1hcHBpbmcsIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU3BlYzogS2V5cyBNVVNUIGJlIHVuaXF1ZTsgZmlyc3Qgb25lIHdpbnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFBhcnNlciBjYW5ub3QgYWJvcnQgdGhpcyBtYXBwaW5nIGVhcmxpZXIsIHNpbmNlIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGFyZSBwcm9jZXNzZWQgc2VxdWVudGlhbGx5LlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb3V0cHV0W2tleV0gPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0W2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAneydcbiAgICAgICAgICAgICAgICAgICAgICAgICMgTmVzdGVkIG1hcHBpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQHBhcnNlTWFwcGluZyBtYXBwaW5nLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNwZWM6IEtleXMgTVVTVCBiZSB1bmlxdWU7IGZpcnN0IG9uZSB3aW5zLlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBQYXJzZXIgY2Fubm90IGFib3J0IHRoaXMgbWFwcGluZyBlYXJsaWVyLCBzaW5jZSBsaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBhcmUgcHJvY2Vzc2VkIHNlcXVlbnRpYWxseS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG91dHB1dFtrZXldID09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFtrZXldID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJzonLCAnICcsIFwiXFxuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICMgRG8gbm90aGluZ1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBwYXJzZVNjYWxhciBtYXBwaW5nLCBbJywnLCAnfSddLCBbJ1wiJywgXCInXCJdLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNwZWM6IEtleXMgTVVTVCBiZSB1bmlxdWU7IGZpcnN0IG9uZSB3aW5zLlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBQYXJzZXIgY2Fubm90IGFib3J0IHRoaXMgbWFwcGluZyBlYXJsaWVyLCBzaW5jZSBsaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBhcmUgcHJvY2Vzc2VkIHNlcXVlbnRpYWxseS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG91dHB1dFtrZXldID09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFtrZXldID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAtLWlcblxuICAgICAgICAgICAgICAgICsraVxuXG4gICAgICAgICAgICAgICAgaWYgZG9uZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgIHRocm93IG5ldyBQYXJzZU1vcmUgJ01hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgJyttYXBwaW5nXG5cblxuICAgICMgRXZhbHVhdGVzIHNjYWxhcnMgYW5kIHJlcGxhY2VzIG1hZ2ljIHZhbHVlcy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBzY2FsYXJcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgIEBldmFsdWF0ZVNjYWxhcjogKHNjYWxhciwgY29udGV4dCkgLT5cbiAgICAgICAgc2NhbGFyID0gVXRpbHMudHJpbShzY2FsYXIpXG4gICAgICAgIHNjYWxhckxvd2VyID0gc2NhbGFyLnRvTG93ZXJDYXNlKClcblxuICAgICAgICBzd2l0Y2ggc2NhbGFyTG93ZXJcbiAgICAgICAgICAgIHdoZW4gJ251bGwnLCAnJywgJ34nXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgIHdoZW4gJ3RydWUnXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIHdoZW4gJ2ZhbHNlJ1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgd2hlbiAnLmluZidcbiAgICAgICAgICAgICAgICByZXR1cm4gSW5maW5pdHlcbiAgICAgICAgICAgIHdoZW4gJy5uYW4nXG4gICAgICAgICAgICAgICAgcmV0dXJuIE5hTlxuICAgICAgICAgICAgd2hlbiAnLS5pbmYnXG4gICAgICAgICAgICAgICAgcmV0dXJuIEluZmluaXR5XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmlyc3RDaGFyID0gc2NhbGFyTG93ZXIuY2hhckF0KDApXG4gICAgICAgICAgICAgICAgc3dpdGNoIGZpcnN0Q2hhclxuICAgICAgICAgICAgICAgICAgICB3aGVuICchJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RTcGFjZSA9IHNjYWxhci5pbmRleE9mKCcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpcnN0U3BhY2UgaXMgLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFdvcmQgPSBzY2FsYXJMb3dlclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0V29yZCA9IHNjYWxhckxvd2VyWzAuLi5maXJzdFNwYWNlXVxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIGZpcnN0V29yZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyEnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpcnN0U3BhY2UgaXNudCAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50IEBwYXJzZVNjYWxhcihzY2FsYXJbMi4uXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchc3RyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMubHRyaW0gc2NhbGFyWzQuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchIXN0cidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLmx0cmltIHNjYWxhcls1Li5dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnISFpbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludChAcGFyc2VTY2FsYXIoc2NhbGFyWzUuLl0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyEhYm9vbCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLnBhcnNlQm9vbGVhbihAcGFyc2VTY2FsYXIoc2NhbGFyWzYuLl0pLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchIWZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChAcGFyc2VTY2FsYXIoc2NhbGFyWzcuLl0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyEhdGltZXN0YW1wJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMuc3RyaW5nVG9EYXRlKFV0aWxzLmx0cmltKHNjYWxhclsxMS4uXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgY29udGV4dD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQgPSBleGNlcHRpb25PbkludmFsaWRUeXBlOiBAc2V0dGluZ3MuZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcjogQHNldHRpbmdzLm9iamVjdERlY29kZXIsIGk6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge29iamVjdERlY29kZXIsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGV9ID0gY29udGV4dFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgSWYgb2JqZWN0RGVjb2RlciBmdW5jdGlvbiBpcyBnaXZlbiwgd2UgY2FuIGRvIGN1c3RvbSBkZWNvZGluZyBvZiBjdXN0b20gdHlwZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaW1tZWRTY2FsYXIgPSBVdGlscy5ydHJpbSBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0U3BhY2UgPSB0cmltbWVkU2NhbGFyLmluZGV4T2YoJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZmlyc3RTcGFjZSBpcyAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3REZWNvZGVyIHRyaW1tZWRTY2FsYXIsIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJWYWx1ZSA9IFV0aWxzLmx0cmltIHRyaW1tZWRTY2FsYXJbZmlyc3RTcGFjZSsxLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIHN1YlZhbHVlLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViVmFsdWUgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdERlY29kZXIgdHJpbW1lZFNjYWxhclswLi4uZmlyc3RTcGFjZV0sIHN1YlZhbHVlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXhjZXB0aW9uT25JbnZhbGlkVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdDdXN0b20gb2JqZWN0IHN1cHBvcnQgd2hlbiBwYXJzaW5nIGEgWUFNTCBmaWxlIGhhcyBiZWVuIGRpc2FibGVkLidcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgICAgICAgICB3aGVuICcwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgJzB4JyBpcyBzY2FsYXJbMC4uLjJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLmhleERlYyBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgVXRpbHMuaXNEaWdpdHMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLm9jdERlYyBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgVXRpbHMuaXNOdW1lcmljIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnKydcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIFV0aWxzLmlzRGlnaXRzIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhdyA9IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc3QgPSBwYXJzZUludChyYXcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmF3IGlzIFN0cmluZyhjYXN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhd1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5pc051bWVyaWMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIEBQQVRURVJOX1RIT1VTQU5EX05VTUVSSUNfU0NBTEFSLnRlc3Qgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc2NhbGFyLnJlcGxhY2UoJywnLCAnJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJy0nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBVdGlscy5pc0RpZ2l0cyhzY2FsYXJbMS4uXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAnMCcgaXMgc2NhbGFyLmNoYXJBdCgxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLVV0aWxzLm9jdERlYyhzY2FsYXJbMS4uXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhdyA9IHNjYWxhclsxLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc3QgPSBwYXJzZUludChyYXcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJhdyBpcyBTdHJpbmcoY2FzdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtY2FzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLXJhd1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5pc051bWVyaWMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIEBQQVRURVJOX1RIT1VTQU5EX05VTUVSSUNfU0NBTEFSLnRlc3Qgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc2NhbGFyLnJlcGxhY2UoJywnLCAnJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGRhdGUgPSBVdGlscy5zdHJpbmdUb0RhdGUoc2NhbGFyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIFV0aWxzLmlzTnVtZXJpYyhzY2FsYXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIEBQQVRURVJOX1RIT1VTQU5EX05VTUVSSUNfU0NBTEFSLnRlc3Qgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc2NhbGFyLnJlcGxhY2UoJywnLCAnJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NhbGFyXG5cbm1vZHVsZS5leHBvcnRzID0gSW5saW5lXG4iLCJcbklubGluZSAgICAgICAgICA9IHJlcXVpcmUgJy4vSW5saW5lJ1xuUGF0dGVybiAgICAgICAgID0gcmVxdWlyZSAnLi9QYXR0ZXJuJ1xuVXRpbHMgICAgICAgICAgID0gcmVxdWlyZSAnLi9VdGlscydcblBhcnNlRXhjZXB0aW9uICA9IHJlcXVpcmUgJy4vRXhjZXB0aW9uL1BhcnNlRXhjZXB0aW9uJ1xuUGFyc2VNb3JlICAgICAgID0gcmVxdWlyZSAnLi9FeGNlcHRpb24vUGFyc2VNb3JlJ1xuXG4jIFBhcnNlciBwYXJzZXMgWUFNTCBzdHJpbmdzIHRvIGNvbnZlcnQgdGhlbSB0byBKYXZhU2NyaXB0IG9iamVjdHMuXG4jXG5jbGFzcyBQYXJzZXJcblxuICAgICMgUHJlLWNvbXBpbGVkIHBhdHRlcm5zXG4gICAgI1xuICAgIFBBVFRFUk5fRk9MREVEX1NDQUxBUl9BTEw6ICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXig/Oig/PHR5cGU+IVteXFxcXHw+XSopXFxcXHMrKT8oPzxzZXBhcmF0b3I+XFxcXHx8PikoPzxtb2RpZmllcnM+XFxcXCt8XFxcXC18XFxcXGQrfFxcXFwrXFxcXGQrfFxcXFwtXFxcXGQrfFxcXFxkK1xcXFwrfFxcXFxkK1xcXFwtKT8oPzxjb21tZW50cz4gKyMuKik/JCdcbiAgICBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfRU5EOiAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJyg/PHNlcGFyYXRvcj5cXFxcfHw+KSg/PG1vZGlmaWVycz5cXFxcK3xcXFxcLXxcXFxcZCt8XFxcXCtcXFxcZCt8XFxcXC1cXFxcZCt8XFxcXGQrXFxcXCt8XFxcXGQrXFxcXC0pPyg/PGNvbW1lbnRzPiArIy4qKT8kJ1xuICAgIFBBVFRFUk5fU0VRVUVOQ0VfSVRFTTogICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFwtKCg/PGxlYWRzcGFjZXM+XFxcXHMrKSg/PHZhbHVlPi4rPykpP1xcXFxzKiQnXG4gICAgUEFUVEVSTl9BTkNIT1JfVkFMVUU6ICAgICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeJig/PHJlZj5bXiBdKykgKig/PHZhbHVlPi4qKSdcbiAgICBQQVRURVJOX0NPTVBBQ1RfTk9UQVRJT046ICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14oPzxrZXk+JytJbmxpbmUuUkVHRVhfUVVPVEVEX1NUUklORysnfFteIFxcJ1wiXFxcXHtcXFxcW10uKj8pICpcXFxcOihcXFxccysoPzx2YWx1ZT4uKz8pKT9cXFxccyokJ1xuICAgIFBBVFRFUk5fTUFQUElOR19JVEVNOiAgICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXig/PGtleT4nK0lubGluZS5SRUdFWF9RVU9URURfU1RSSU5HKyd8W14gXFwnXCJcXFxcW1xcXFx7XS4qPykgKlxcXFw6KFxcXFxzKyg/PHZhbHVlPi4rPykpP1xcXFxzKiQnXG4gICAgUEFUVEVSTl9ERUNJTUFMOiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdcXFxcZCsnXG4gICAgUEFUVEVSTl9JTkRFTlRfU1BBQ0VTOiAgICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeICsnXG4gICAgUEFUVEVSTl9UUkFJTElOR19MSU5FUzogICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICcoXFxuKikkJ1xuICAgIFBBVFRFUk5fWUFNTF9IRUFERVI6ICAgICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFwlWUFNTFs6IF1bXFxcXGRcXFxcLl0rLipcXG4nLCAnbSdcbiAgICBQQVRURVJOX0xFQURJTkdfQ09NTUVOVFM6ICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14oXFxcXCMuKj9cXG4pKycsICdtJ1xuICAgIFBBVFRFUk5fRE9DVU1FTlRfTUFSS0VSX1NUQVJUOiAgICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFwtXFxcXC1cXFxcLS4qP1xcbicsICdtJ1xuICAgIFBBVFRFUk5fRE9DVU1FTlRfTUFSS0VSX0VORDogICAgICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFwuXFxcXC5cXFxcLlxcXFxzKiQnLCAnbSdcbiAgICBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfQllfSU5ERU5UQVRJT046ICAge31cblxuICAgICMgQ29udGV4dCB0eXBlc1xuICAgICNcbiAgICBDT05URVhUX05PTkU6ICAgICAgIDBcbiAgICBDT05URVhUX1NFUVVFTkNFOiAgIDFcbiAgICBDT05URVhUX01BUFBJTkc6ICAgIDJcblxuXG4gICAgIyBDb25zdHJ1Y3RvclxuICAgICNcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIG9mZnNldCAgVGhlIG9mZnNldCBvZiBZQU1MIGRvY3VtZW50ICh1c2VkIGZvciBsaW5lIG51bWJlcnMgaW4gZXJyb3IgbWVzc2FnZXMpXG4gICAgI1xuICAgIGNvbnN0cnVjdG9yOiAoQG9mZnNldCA9IDApIC0+XG4gICAgICAgIEBsaW5lcyAgICAgICAgICA9IFtdXG4gICAgICAgIEBjdXJyZW50TGluZU5iICA9IC0xXG4gICAgICAgIEBjdXJyZW50TGluZSAgICA9ICcnXG4gICAgICAgIEByZWZzICAgICAgICAgICA9IHt9XG5cblxuICAgICMgUGFyc2VzIGEgWUFNTCBzdHJpbmcgdG8gYSBKYXZhU2NyaXB0IHZhbHVlLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHZhbHVlICAgICAgICAgICAgICAgICAgIEEgWUFNTCBzdHJpbmdcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdERlY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gdG8gZGVzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgICMgQHJldHVybiBbT2JqZWN0XSAgQSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gSWYgdGhlIFlBTUwgaXMgbm90IHZhbGlkXG4gICAgI1xuICAgIHBhcnNlOiAodmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBmYWxzZSwgb2JqZWN0RGVjb2RlciA9IG51bGwpIC0+XG4gICAgICAgIEBjdXJyZW50TGluZU5iID0gLTFcbiAgICAgICAgQGN1cnJlbnRMaW5lID0gJydcbiAgICAgICAgQGxpbmVzID0gQGNsZWFudXAodmFsdWUpLnNwbGl0IFwiXFxuXCJcblxuICAgICAgICBkYXRhID0gbnVsbFxuICAgICAgICBjb250ZXh0ID0gQENPTlRFWFRfTk9ORVxuICAgICAgICBhbGxvd092ZXJ3cml0ZSA9IGZhbHNlXG4gICAgICAgIHdoaWxlIEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgICAgICBpZiBAaXNDdXJyZW50TGluZUVtcHR5KClcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAjIFRhYj9cbiAgICAgICAgICAgIGlmIFwiXFx0XCIgaXMgQGN1cnJlbnRMaW5lWzBdXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdBIFlBTUwgZmlsZSBjYW5ub3QgY29udGFpbiB0YWJzIGFzIGluZGVudGF0aW9uLicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgIGlzUmVmID0gbWVyZ2VOb2RlID0gZmFsc2VcbiAgICAgICAgICAgIGlmIHZhbHVlcyA9IEBQQVRURVJOX1NFUVVFTkNFX0lURU0uZXhlYyBAY3VycmVudExpbmVcbiAgICAgICAgICAgICAgICBpZiBAQ09OVEVYVF9NQVBQSU5HIGlzIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdZb3UgY2Fubm90IGRlZmluZSBhIHNlcXVlbmNlIGl0ZW0gd2hlbiBpbiBhIG1hcHBpbmcnXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IEBDT05URVhUX1NFUVVFTkNFXG4gICAgICAgICAgICAgICAgZGF0YSA/PSBbXVxuXG4gICAgICAgICAgICAgICAgaWYgdmFsdWVzLnZhbHVlPyBhbmQgbWF0Y2hlcyA9IEBQQVRURVJOX0FOQ0hPUl9WQUxVRS5leGVjIHZhbHVlcy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICBpc1JlZiA9IG1hdGNoZXMucmVmXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcy52YWx1ZSA9IG1hdGNoZXMudmFsdWVcblxuICAgICAgICAgICAgICAgICMgQXJyYXlcbiAgICAgICAgICAgICAgICBpZiBub3QodmFsdWVzLnZhbHVlPykgb3IgJycgaXMgVXRpbHMudHJpbSh2YWx1ZXMudmFsdWUsICcgJykgb3IgVXRpbHMubHRyaW0odmFsdWVzLnZhbHVlLCAnICcpLmluZGV4T2YoJyMnKSBpcyAwXG4gICAgICAgICAgICAgICAgICAgIGlmIEBjdXJyZW50TGluZU5iIDwgQGxpbmVzLmxlbmd0aCAtIDEgYW5kIG5vdCBAaXNOZXh0TGluZVVuSW5kZW50ZWRDb2xsZWN0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlciA9IG5ldyBQYXJzZXIgY1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyLnJlZnMgPSBAcmVmc1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoIHBhcnNlci5wYXJzZShAZ2V0TmV4dEVtYmVkQmxvY2sobnVsbCwgdHJ1ZSksIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXIpXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCBudWxsXG5cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbHVlcy5sZWFkc3BhY2VzPy5sZW5ndGggYW5kIG1hdGNoZXMgPSBAUEFUVEVSTl9DT01QQUNUX05PVEFUSU9OLmV4ZWMgdmFsdWVzLnZhbHVlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgVGhpcyBpcyBhIGNvbXBhY3Qgbm90YXRpb24gZWxlbWVudCwgYWRkIHRvIG5leHQgYmxvY2sgYW5kIHBhcnNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gQGdldFJlYWxDdXJyZW50TGluZU5iKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlciA9IG5ldyBQYXJzZXIgY1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyLnJlZnMgPSBAcmVmc1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9jayA9IHZhbHVlcy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50ID0gQGdldEN1cnJlbnRMaW5lSW5kZW50YXRpb24oKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgQGlzTmV4dExpbmVJbmRlbnRlZChmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9jayArPSBcIlxcblwiK0BnZXROZXh0RW1iZWRCbG9jayhpbmRlbnQgKyB2YWx1ZXMubGVhZHNwYWNlcy5sZW5ndGggKyAxLCB0cnVlKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2ggcGFyc2VyLnBhcnNlIGJsb2NrLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG5cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoIEBwYXJzZVZhbHVlIHZhbHVlcy52YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZXMgPSBAUEFUVEVSTl9NQVBQSU5HX0lURU0uZXhlYyBAY3VycmVudExpbmUpIGFuZCB2YWx1ZXMua2V5LmluZGV4T2YoJyAjJykgaXMgLTFcbiAgICAgICAgICAgICAgICBpZiBAQ09OVEVYVF9TRVFVRU5DRSBpcyBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnWW91IGNhbm5vdCBkZWZpbmUgYSBtYXBwaW5nIGl0ZW0gd2hlbiBpbiBhIHNlcXVlbmNlJ1xuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBAQ09OVEVYVF9NQVBQSU5HXG4gICAgICAgICAgICAgICAgZGF0YSA/PSB7fVxuXG4gICAgICAgICAgICAgICAgIyBGb3JjZSBjb3JyZWN0IHNldHRpbmdzXG4gICAgICAgICAgICAgICAgSW5saW5lLmNvbmZpZ3VyZSBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IElubGluZS5wYXJzZVNjYWxhciB2YWx1ZXMua2V5XG4gICAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgICAgICBlLnBhcnNlZExpbmUgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDFcbiAgICAgICAgICAgICAgICAgICAgZS5zbmlwcGV0ID0gQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZVxuXG4gICAgICAgICAgICAgICAgaWYgJzw8JyBpcyBrZXlcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VOb2RlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBhbGxvd092ZXJ3cml0ZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWVzLnZhbHVlPy5pbmRleE9mKCcqJykgaXMgMFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmTmFtZSA9IHZhbHVlcy52YWx1ZVsxLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgQHJlZnNbcmVmTmFtZV0/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdSZWZlcmVuY2UgXCInK3JlZk5hbWUrJ1wiIGRvZXMgbm90IGV4aXN0LicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZlZhbHVlID0gQHJlZnNbcmVmTmFtZV1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdHlwZW9mIHJlZlZhbHVlIGlzbnQgJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1lBTUwgbWVyZ2Uga2V5cyB1c2VkIHdpdGggYSBzY2FsYXIgdmFsdWUgaW5zdGVhZCBvZiBhbiBvYmplY3QuJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmVmVmFsdWUgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgTWVyZ2UgYXJyYXkgd2l0aCBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgdmFsdWUsIGkgaW4gcmVmVmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtTdHJpbmcoaSldID89IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBNZXJnZSBvYmplY3RzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcmVmVmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID89IHZhbHVlXG5cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWVzLnZhbHVlPyBhbmQgdmFsdWVzLnZhbHVlIGlzbnQgJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlcy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQGdldE5leHRFbWJlZEJsb2NrKClcblxuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyID0gbmV3IFBhcnNlciBjXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIucmVmcyA9IEByZWZzXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZWQgPSBwYXJzZXIucGFyc2UgdmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGVcblxuICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIHR5cGVvZiBwYXJzZWQgaXMgJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1lBTUwgbWVyZ2Uga2V5cyB1c2VkIHdpdGggYSBzY2FsYXIgdmFsdWUgaW5zdGVhZCBvZiBhbiBvYmplY3QuJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgcGFyc2VkIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIElmIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIG1lcmdlIGtleSBpcyBhIHNlcXVlbmNlLCB0aGVuIHRoaXMgc2VxdWVuY2UgaXMgZXhwZWN0ZWQgdG8gY29udGFpbiBtYXBwaW5nIG5vZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBhbmQgZWFjaCBvZiB0aGVzZSBub2RlcyBpcyBtZXJnZWQgaW4gdHVybiBhY2NvcmRpbmcgdG8gaXRzIG9yZGVyIGluIHRoZSBzZXF1ZW5jZS4gS2V5cyBpbiBtYXBwaW5nIG5vZGVzIGVhcmxpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGluIHRoZSBzZXF1ZW5jZSBvdmVycmlkZSBrZXlzIHNwZWNpZmllZCBpbiBsYXRlciBtYXBwaW5nIG5vZGVzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBwYXJzZWRJdGVtIGluIHBhcnNlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgdHlwZW9mIHBhcnNlZEl0ZW0gaXMgJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnTWVyZ2UgaXRlbXMgbXVzdCBiZSBvYmplY3RzLicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgcGFyc2VkSXRlbVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHBhcnNlZEl0ZW0gaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBNZXJnZSBhcnJheSB3aXRoIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHZhbHVlLCBpIGluIHBhcnNlZEl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrID0gU3RyaW5nKGkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGRhdGEuaGFzT3duUHJvcGVydHkoaylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrXSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgTWVyZ2Ugb2JqZWN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcGFyc2VkSXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBkYXRhLmhhc093blByb3BlcnR5KGtleSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWVcblxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgSWYgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUga2V5IGlzIGEgc2luZ2xlIG1hcHBpbmcgbm9kZSwgZWFjaCBvZiBpdHMga2V5L3ZhbHVlIHBhaXJzIGlzIGluc2VydGVkIGludG8gdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBjdXJyZW50IG1hcHBpbmcsIHVubGVzcyB0aGUga2V5IGFscmVhZHkgZXhpc3RzIGluIGl0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIHBhcnNlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgZGF0YS5oYXNPd25Qcm9wZXJ0eShrZXkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZVxuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB2YWx1ZXMudmFsdWU/IGFuZCBtYXRjaGVzID0gQFBBVFRFUk5fQU5DSE9SX1ZBTFVFLmV4ZWMgdmFsdWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGlzUmVmID0gbWF0Y2hlcy5yZWZcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzLnZhbHVlID0gbWF0Y2hlcy52YWx1ZVxuXG5cbiAgICAgICAgICAgICAgICBpZiBtZXJnZU5vZGVcbiAgICAgICAgICAgICAgICAgICAgIyBNZXJnZSBrZXlzXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBub3QodmFsdWVzLnZhbHVlPykgb3IgJycgaXMgVXRpbHMudHJpbSh2YWx1ZXMudmFsdWUsICcgJykgb3IgVXRpbHMubHRyaW0odmFsdWVzLnZhbHVlLCAnICcpLmluZGV4T2YoJyMnKSBpcyAwXG4gICAgICAgICAgICAgICAgICAgICMgSGFzaFxuICAgICAgICAgICAgICAgICAgICAjIGlmIG5leHQgbGluZSBpcyBsZXNzIGluZGVudGVkIG9yIGVxdWFsLCB0aGVuIGl0IG1lYW5zIHRoYXQgdGhlIGN1cnJlbnQgdmFsdWUgaXMgbnVsbFxuICAgICAgICAgICAgICAgICAgICBpZiBub3QoQGlzTmV4dExpbmVJbmRlbnRlZCgpKSBhbmQgbm90KEBpc05leHRMaW5lVW5JbmRlbnRlZENvbGxlY3Rpb24oKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU3BlYzogS2V5cyBNVVNUIGJlIHVuaXF1ZTsgZmlyc3Qgb25lIHdpbnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEJ1dCBvdmVyd3JpdGluZyBpcyBhbGxvd2VkIHdoZW4gYSBtZXJnZSBub2RlIGlzIHVzZWQgaW4gY3VycmVudCBibG9jay5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGFsbG93T3ZlcndyaXRlIG9yIGRhdGFba2V5XSBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSBudWxsXG5cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyID0gbmV3IFBhcnNlciBjXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIucmVmcyA9IEByZWZzXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWwgPSBwYXJzZXIucGFyc2UgQGdldE5leHRFbWJlZEJsb2NrKCksIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBTcGVjOiBLZXlzIE1VU1QgYmUgdW5pcXVlOyBmaXJzdCBvbmUgd2lucy5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgQnV0IG92ZXJ3cml0aW5nIGlzIGFsbG93ZWQgd2hlbiBhIG1lcmdlIG5vZGUgaXMgdXNlZCBpbiBjdXJyZW50IGJsb2NrLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgYWxsb3dPdmVyd3JpdGUgb3IgZGF0YVtrZXldIGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbFxuXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB2YWwgPSBAcGFyc2VWYWx1ZSB2YWx1ZXMudmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcblxuICAgICAgICAgICAgICAgICAgICAjIFNwZWM6IEtleXMgTVVTVCBiZSB1bmlxdWU7IGZpcnN0IG9uZSB3aW5zLlxuICAgICAgICAgICAgICAgICAgICAjIEJ1dCBvdmVyd3JpdGluZyBpcyBhbGxvd2VkIHdoZW4gYSBtZXJnZSBub2RlIGlzIHVzZWQgaW4gY3VycmVudCBibG9jay5cbiAgICAgICAgICAgICAgICAgICAgaWYgYWxsb3dPdmVyd3JpdGUgb3IgZGF0YVtrZXldIGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsXG5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjIDEtbGluZXIgb3B0aW9uYWxseSBmb2xsb3dlZCBieSBuZXdsaW5lXG4gICAgICAgICAgICAgICAgbGluZUNvdW50ID0gQGxpbmVzLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIDEgaXMgbGluZUNvdW50IG9yICgyIGlzIGxpbmVDb3VudCBhbmQgVXRpbHMuaXNFbXB0eShAbGluZXNbMV0pKVxuICAgICAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gSW5saW5lLnBhcnNlIEBsaW5lc1swXSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuICAgICAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnBhcnNlZExpbmUgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc25pcHBldCA9IEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgdHlwZW9mIHZhbHVlIGlzICdvYmplY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3QgPSB2YWx1ZVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBrZXkgb2YgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3QgPSB2YWx1ZVtrZXldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR5cGVvZiBmaXJzdCBpcyAnc3RyaW5nJyBhbmQgZmlyc3QuaW5kZXhPZignKicpIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgYWxpYXMgaW4gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoIEByZWZzW2FsaWFzWzEuLl1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhXG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlXG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIFV0aWxzLmx0cmltKHZhbHVlKS5jaGFyQXQoMCkgaW4gWydbJywgJ3snXVxuICAgICAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJbmxpbmUucGFyc2UgdmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5wYXJzZWRMaW5lID0gQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnNuaXBwZXQgPSBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZVxuXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdVbmFibGUgdG8gcGFyc2UuJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgaWYgaXNSZWZcbiAgICAgICAgICAgICAgICBpZiBkYXRhIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgQHJlZnNbaXNSZWZdID0gZGF0YVtkYXRhLmxlbmd0aC0xXVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbGFzdEtleSA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgZm9yIGtleSBvZiBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0S2V5ID0ga2V5XG4gICAgICAgICAgICAgICAgICAgIEByZWZzW2lzUmVmXSA9IGRhdGFbbGFzdEtleV1cblxuXG4gICAgICAgIGlmIFV0aWxzLmlzRW1wdHkoZGF0YSlcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBkYXRhXG5cblxuXG4gICAgIyBSZXR1cm5zIHRoZSBjdXJyZW50IGxpbmUgbnVtYmVyICh0YWtlcyB0aGUgb2Zmc2V0IGludG8gYWNjb3VudCkuXG4gICAgI1xuICAgICMgQHJldHVybiBbSW50ZWdlcl0gICAgIFRoZSBjdXJyZW50IGxpbmUgbnVtYmVyXG4gICAgI1xuICAgIGdldFJlYWxDdXJyZW50TGluZU5iOiAtPlxuICAgICAgICByZXR1cm4gQGN1cnJlbnRMaW5lTmIgKyBAb2Zmc2V0XG5cblxuICAgICMgUmV0dXJucyB0aGUgY3VycmVudCBsaW5lIGluZGVudGF0aW9uLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdICAgICBUaGUgY3VycmVudCBsaW5lIGluZGVudGF0aW9uXG4gICAgI1xuICAgIGdldEN1cnJlbnRMaW5lSW5kZW50YXRpb246IC0+XG4gICAgICAgIHJldHVybiBAY3VycmVudExpbmUubGVuZ3RoIC0gVXRpbHMubHRyaW0oQGN1cnJlbnRMaW5lLCAnICcpLmxlbmd0aFxuXG5cbiAgICAjIFJldHVybnMgdGhlIG5leHQgZW1iZWQgYmxvY2sgb2YgWUFNTC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICAgICAgICAgIGluZGVudGF0aW9uIFRoZSBpbmRlbnQgbGV2ZWwgYXQgd2hpY2ggdGhlIGJsb2NrIGlzIHRvIGJlIHJlYWQsIG9yIG51bGwgZm9yIGRlZmF1bHRcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICAgICAgICAgIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSAgIFdoZW4gaW5kZW50YXRpb24gcHJvYmxlbSBhcmUgZGV0ZWN0ZWRcbiAgICAjXG4gICAgZ2V0TmV4dEVtYmVkQmxvY2s6IChpbmRlbnRhdGlvbiA9IG51bGwsIGluY2x1ZGVVbmluZGVudGVkQ29sbGVjdGlvbiA9IGZhbHNlKSAtPlxuICAgICAgICBAbW92ZVRvTmV4dExpbmUoKVxuXG4gICAgICAgIGlmIG5vdCBpbmRlbnRhdGlvbj9cbiAgICAgICAgICAgIG5ld0luZGVudCA9IEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKClcblxuICAgICAgICAgICAgdW5pbmRlbnRlZEVtYmVkQmxvY2sgPSBAaXNTdHJpbmdVbkluZGVudGVkQ29sbGVjdGlvbkl0ZW0gQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgIGlmIG5vdChAaXNDdXJyZW50TGluZUVtcHR5KCkpIGFuZCAwIGlzIG5ld0luZGVudCBhbmQgbm90KHVuaW5kZW50ZWRFbWJlZEJsb2NrKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnSW5kZW50YXRpb24gcHJvYmxlbS4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5ld0luZGVudCA9IGluZGVudGF0aW9uXG5cblxuICAgICAgICBkYXRhID0gW0BjdXJyZW50TGluZVtuZXdJbmRlbnQuLl1dXG5cbiAgICAgICAgdW5sZXNzIGluY2x1ZGVVbmluZGVudGVkQ29sbGVjdGlvblxuICAgICAgICAgICAgaXNJdFVuaW5kZW50ZWRDb2xsZWN0aW9uID0gQGlzU3RyaW5nVW5JbmRlbnRlZENvbGxlY3Rpb25JdGVtIEBjdXJyZW50TGluZVxuXG4gICAgICAgICMgQ29tbWVudHMgbXVzdCBub3QgYmUgcmVtb3ZlZCBpbnNpZGUgYSBzdHJpbmcgYmxvY2sgKGllLiBhZnRlciBhIGxpbmUgZW5kaW5nIHdpdGggXCJ8XCIpXG4gICAgICAgICMgVGhleSBtdXN0IG5vdCBiZSByZW1vdmVkIGluc2lkZSBhIHN1Yi1lbWJlZGRlZCBibG9jayBhcyB3ZWxsXG4gICAgICAgIHJlbW92ZUNvbW1lbnRzUGF0dGVybiA9IEBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfRU5EXG4gICAgICAgIHJlbW92ZUNvbW1lbnRzID0gbm90IHJlbW92ZUNvbW1lbnRzUGF0dGVybi50ZXN0IEBjdXJyZW50TGluZVxuXG4gICAgICAgIHdoaWxlIEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgICAgICBpbmRlbnQgPSBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpXG5cbiAgICAgICAgICAgIGlmIGluZGVudCBpcyBuZXdJbmRlbnRcbiAgICAgICAgICAgICAgICByZW1vdmVDb21tZW50cyA9IG5vdCByZW1vdmVDb21tZW50c1BhdHRlcm4udGVzdCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgaWYgcmVtb3ZlQ29tbWVudHMgYW5kIEBpc0N1cnJlbnRMaW5lQ29tbWVudCgpXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaWYgQGlzQ3VycmVudExpbmVCbGFuaygpXG4gICAgICAgICAgICAgICAgZGF0YS5wdXNoIEBjdXJyZW50TGluZVtuZXdJbmRlbnQuLl1cbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpZiBpc0l0VW5pbmRlbnRlZENvbGxlY3Rpb24gYW5kIG5vdCBAaXNTdHJpbmdVbkluZGVudGVkQ29sbGVjdGlvbkl0ZW0oQGN1cnJlbnRMaW5lKSBhbmQgaW5kZW50IGlzIG5ld0luZGVudFxuICAgICAgICAgICAgICAgIEBtb3ZlVG9QcmV2aW91c0xpbmUoKVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGlmIGluZGVudCA+PSBuZXdJbmRlbnRcbiAgICAgICAgICAgICAgICBkYXRhLnB1c2ggQGN1cnJlbnRMaW5lW25ld0luZGVudC4uXVxuICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5sdHJpbShAY3VycmVudExpbmUpLmNoYXJBdCgwKSBpcyAnIydcbiAgICAgICAgICAgICAgICAjIERvbid0IGFkZCBsaW5lIHdpdGggY29tbWVudHNcbiAgICAgICAgICAgIGVsc2UgaWYgMCBpcyBpbmRlbnRcbiAgICAgICAgICAgICAgICBAbW92ZVRvUHJldmlvdXNMaW5lKClcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnSW5kZW50YXRpb24gcHJvYmxlbS4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG5cbiAgICAgICAgcmV0dXJuIGRhdGEuam9pbiBcIlxcblwiXG5cblxuICAgICMgTW92ZXMgdGhlIHBhcnNlciB0byB0aGUgbmV4dCBsaW5lLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dXG4gICAgI1xuICAgIG1vdmVUb05leHRMaW5lOiAtPlxuICAgICAgICBpZiBAY3VycmVudExpbmVOYiA+PSBAbGluZXMubGVuZ3RoIC0gMVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgQGN1cnJlbnRMaW5lID0gQGxpbmVzWysrQGN1cnJlbnRMaW5lTmJdO1xuXG4gICAgICAgIHJldHVybiB0cnVlXG5cblxuICAgICMgTW92ZXMgdGhlIHBhcnNlciB0byB0aGUgcHJldmlvdXMgbGluZS5cbiAgICAjXG4gICAgbW92ZVRvUHJldmlvdXNMaW5lOiAtPlxuICAgICAgICBAY3VycmVudExpbmUgPSBAbGluZXNbLS1AY3VycmVudExpbmVOYl1cbiAgICAgICAgcmV0dXJuXG5cblxuICAgICMgUGFyc2VzIGEgWUFNTCB2YWx1ZS5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgICAgICAgICAgICAgICAgICBBIFlBTUwgdmFsdWVcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gQSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gV2hlbiByZWZlcmVuY2UgZG9lcyBub3QgZXhpc3RcbiAgICAjXG4gICAgcGFyc2VWYWx1ZTogKHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyKSAtPlxuICAgICAgICBpZiAwIGlzIHZhbHVlLmluZGV4T2YoJyonKVxuICAgICAgICAgICAgcG9zID0gdmFsdWUuaW5kZXhPZiAnIydcbiAgICAgICAgICAgIGlmIHBvcyBpc250IC0xXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHIoMSwgcG9zLTIpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZVsxLi5dXG5cbiAgICAgICAgICAgIGlmIEByZWZzW3ZhbHVlXSBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1JlZmVyZW5jZSBcIicrdmFsdWUrJ1wiIGRvZXMgbm90IGV4aXN0LicsIEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICByZXR1cm4gQHJlZnNbdmFsdWVdXG5cblxuICAgICAgICBpZiBtYXRjaGVzID0gQFBBVFRFUk5fRk9MREVEX1NDQUxBUl9BTEwuZXhlYyB2YWx1ZVxuICAgICAgICAgICAgbW9kaWZpZXJzID0gbWF0Y2hlcy5tb2RpZmllcnMgPyAnJ1xuXG4gICAgICAgICAgICBmb2xkZWRJbmRlbnQgPSBNYXRoLmFicyhwYXJzZUludChtb2RpZmllcnMpKVxuICAgICAgICAgICAgaWYgaXNOYU4oZm9sZGVkSW5kZW50KSB0aGVuIGZvbGRlZEluZGVudCA9IDBcbiAgICAgICAgICAgIHZhbCA9IEBwYXJzZUZvbGRlZFNjYWxhciBtYXRjaGVzLnNlcGFyYXRvciwgQFBBVFRFUk5fREVDSU1BTC5yZXBsYWNlKG1vZGlmaWVycywgJycpLCBmb2xkZWRJbmRlbnRcbiAgICAgICAgICAgIGlmIG1hdGNoZXMudHlwZT9cbiAgICAgICAgICAgICAgICAjIEZvcmNlIGNvcnJlY3Qgc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBJbmxpbmUuY29uZmlndXJlIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICByZXR1cm4gSW5saW5lLnBhcnNlU2NhbGFyIG1hdGNoZXMudHlwZSsnICcrdmFsXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbFxuXG4gICAgICAgICMgVmFsdWUgY2FuIGJlIG11bHRpbGluZSBjb21wYWN0IHNlcXVlbmNlIG9yIG1hcHBpbmcgb3Igc3RyaW5nXG4gICAgICAgIGlmIHZhbHVlLmNoYXJBdCgwKSBpbiBbJ1snLCAneycsICdcIicsIFwiJ1wiXVxuICAgICAgICAgICAgd2hpbGUgdHJ1ZVxuICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSW5saW5lLnBhcnNlIHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgICAgICBpZiBlIGluc3RhbmNlb2YgUGFyc2VNb3JlIGFuZCBAbW92ZVRvTmV4dExpbmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgKz0gXCJcXG5cIiArIFV0aWxzLnRyaW0oQGN1cnJlbnRMaW5lLCAnICcpXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucGFyc2VkTGluZSA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5zbmlwcGV0ID0gQGN1cnJlbnRMaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIEBpc05leHRMaW5lSW5kZW50ZWQoKVxuICAgICAgICAgICAgICAgIHZhbHVlICs9IFwiXFxuXCIgKyBAZ2V0TmV4dEVtYmVkQmxvY2soKVxuICAgICAgICAgICAgcmV0dXJuIElubGluZS5wYXJzZSB2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG4gICAgICAgIHJldHVyblxuXG5cbiAgICAjIFBhcnNlcyBhIGZvbGRlZCBzY2FsYXIuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgICAgIHNlcGFyYXRvciAgIFRoZSBzZXBhcmF0b3IgdGhhdCB3YXMgdXNlZCB0byBiZWdpbiB0aGlzIGZvbGRlZCBzY2FsYXIgKHwgb3IgPilcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgICAgICBpbmRpY2F0b3IgICBUaGUgaW5kaWNhdG9yIHRoYXQgd2FzIHVzZWQgdG8gYmVnaW4gdGhpcyBmb2xkZWQgc2NhbGFyICgrIG9yIC0pXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICAgICAgaW5kZW50YXRpb24gVGhlIGluZGVudGF0aW9uIHRoYXQgd2FzIHVzZWQgdG8gYmVnaW4gdGhpcyBmb2xkZWQgc2NhbGFyXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgICAgIFRoZSB0ZXh0IHZhbHVlXG4gICAgI1xuICAgIHBhcnNlRm9sZGVkU2NhbGFyOiAoc2VwYXJhdG9yLCBpbmRpY2F0b3IgPSAnJywgaW5kZW50YXRpb24gPSAwKSAtPlxuICAgICAgICBub3RFT0YgPSBAbW92ZVRvTmV4dExpbmUoKVxuICAgICAgICBpZiBub3Qgbm90RU9GXG4gICAgICAgICAgICByZXR1cm4gJydcblxuICAgICAgICBpc0N1cnJlbnRMaW5lQmxhbmsgPSBAaXNDdXJyZW50TGluZUJsYW5rKClcbiAgICAgICAgdGV4dCA9ICcnXG5cbiAgICAgICAgIyBMZWFkaW5nIGJsYW5rIGxpbmVzIGFyZSBjb25zdW1lZCBiZWZvcmUgZGV0ZXJtaW5pbmcgaW5kZW50YXRpb25cbiAgICAgICAgd2hpbGUgbm90RU9GIGFuZCBpc0N1cnJlbnRMaW5lQmxhbmtcbiAgICAgICAgICAgICMgbmV3bGluZSBvbmx5IGlmIG5vdCBFT0ZcbiAgICAgICAgICAgIGlmIG5vdEVPRiA9IEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgICAgICAgICAgdGV4dCArPSBcIlxcblwiXG4gICAgICAgICAgICAgICAgaXNDdXJyZW50TGluZUJsYW5rID0gQGlzQ3VycmVudExpbmVCbGFuaygpXG5cblxuICAgICAgICAjIERldGVybWluZSBpbmRlbnRhdGlvbiBpZiBub3Qgc3BlY2lmaWVkXG4gICAgICAgIGlmIDAgaXMgaW5kZW50YXRpb25cbiAgICAgICAgICAgIGlmIG1hdGNoZXMgPSBAUEFUVEVSTl9JTkRFTlRfU1BBQ0VTLmV4ZWMgQGN1cnJlbnRMaW5lXG4gICAgICAgICAgICAgICAgaW5kZW50YXRpb24gPSBtYXRjaGVzWzBdLmxlbmd0aFxuXG5cbiAgICAgICAgaWYgaW5kZW50YXRpb24gPiAwXG4gICAgICAgICAgICBwYXR0ZXJuID0gQFBBVFRFUk5fRk9MREVEX1NDQUxBUl9CWV9JTkRFTlRBVElPTltpbmRlbnRhdGlvbl1cbiAgICAgICAgICAgIHVubGVzcyBwYXR0ZXJuP1xuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBuZXcgUGF0dGVybiAnXiB7JytpbmRlbnRhdGlvbisnfSguKikkJ1xuICAgICAgICAgICAgICAgIFBhcnNlcjo6UEFUVEVSTl9GT0xERURfU0NBTEFSX0JZX0lOREVOVEFUSU9OW2luZGVudGF0aW9uXSA9IHBhdHRlcm5cblxuICAgICAgICAgICAgd2hpbGUgbm90RU9GIGFuZCAoaXNDdXJyZW50TGluZUJsYW5rIG9yIG1hdGNoZXMgPSBwYXR0ZXJuLmV4ZWMgQGN1cnJlbnRMaW5lKVxuICAgICAgICAgICAgICAgIGlmIGlzQ3VycmVudExpbmVCbGFua1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IEBjdXJyZW50TGluZVtpbmRlbnRhdGlvbi4uXVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSBtYXRjaGVzWzFdXG5cbiAgICAgICAgICAgICAgICAjIG5ld2xpbmUgb25seSBpZiBub3QgRU9GXG4gICAgICAgICAgICAgICAgaWYgbm90RU9GID0gQG1vdmVUb05leHRMaW5lKClcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSBcIlxcblwiXG4gICAgICAgICAgICAgICAgICAgIGlzQ3VycmVudExpbmVCbGFuayA9IEBpc0N1cnJlbnRMaW5lQmxhbmsoKVxuXG4gICAgICAgIGVsc2UgaWYgbm90RU9GXG4gICAgICAgICAgICB0ZXh0ICs9IFwiXFxuXCJcblxuXG4gICAgICAgIGlmIG5vdEVPRlxuICAgICAgICAgICAgQG1vdmVUb1ByZXZpb3VzTGluZSgpXG5cblxuICAgICAgICAjIFJlbW92ZSBsaW5lIGJyZWFrcyBvZiBlYWNoIGxpbmVzIGV4Y2VwdCB0aGUgZW1wdHkgYW5kIG1vcmUgaW5kZW50ZWQgb25lc1xuICAgICAgICBpZiAnPicgaXMgc2VwYXJhdG9yXG4gICAgICAgICAgICBuZXdUZXh0ID0gJydcbiAgICAgICAgICAgIGZvciBsaW5lIGluIHRleHQuc3BsaXQgXCJcXG5cIlxuICAgICAgICAgICAgICAgIGlmIGxpbmUubGVuZ3RoIGlzIDAgb3IgbGluZS5jaGFyQXQoMCkgaXMgJyAnXG4gICAgICAgICAgICAgICAgICAgIG5ld1RleHQgPSBVdGlscy5ydHJpbShuZXdUZXh0LCAnICcpICsgbGluZSArIFwiXFxuXCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG5ld1RleHQgKz0gbGluZSArICcgJ1xuICAgICAgICAgICAgdGV4dCA9IG5ld1RleHRcblxuICAgICAgICBpZiAnKycgaXNudCBpbmRpY2F0b3JcbiAgICAgICAgICAgICMgUmVtb3ZlIGFueSBleHRyYSBzcGFjZSBvciBuZXcgbGluZSBhcyB3ZSBhcmUgYWRkaW5nIHRoZW0gYWZ0ZXJcbiAgICAgICAgICAgIHRleHQgPSBVdGlscy5ydHJpbSh0ZXh0KVxuXG4gICAgICAgICMgRGVhbCB3aXRoIHRyYWlsaW5nIG5ld2xpbmVzIGFzIGluZGljYXRlZFxuICAgICAgICBpZiAnJyBpcyBpbmRpY2F0b3JcbiAgICAgICAgICAgIHRleHQgPSBAUEFUVEVSTl9UUkFJTElOR19MSU5FUy5yZXBsYWNlIHRleHQsIFwiXFxuXCJcbiAgICAgICAgZWxzZSBpZiAnLScgaXMgaW5kaWNhdG9yXG4gICAgICAgICAgICB0ZXh0ID0gQFBBVFRFUk5fVFJBSUxJTkdfTElORVMucmVwbGFjZSB0ZXh0LCAnJ1xuXG4gICAgICAgIHJldHVybiB0ZXh0XG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBuZXh0IGxpbmUgaXMgaW5kZW50ZWQuXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgbmV4dCBsaW5lIGlzIGluZGVudGVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNOZXh0TGluZUluZGVudGVkOiAoaWdub3JlQ29tbWVudHMgPSB0cnVlKSAtPlxuICAgICAgICBjdXJyZW50SW5kZW50YXRpb24gPSBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpXG4gICAgICAgIEVPRiA9IG5vdCBAbW92ZVRvTmV4dExpbmUoKVxuXG4gICAgICAgIGlmIGlnbm9yZUNvbW1lbnRzXG4gICAgICAgICAgICB3aGlsZSBub3QoRU9GKSBhbmQgQGlzQ3VycmVudExpbmVFbXB0eSgpXG4gICAgICAgICAgICAgICAgRU9GID0gbm90IEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHdoaWxlIG5vdChFT0YpIGFuZCBAaXNDdXJyZW50TGluZUJsYW5rKClcbiAgICAgICAgICAgICAgICBFT0YgPSBub3QgQG1vdmVUb05leHRMaW5lKClcblxuICAgICAgICBpZiBFT0ZcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAgIHJldCA9IGZhbHNlXG4gICAgICAgIGlmIEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKCkgPiBjdXJyZW50SW5kZW50YXRpb25cbiAgICAgICAgICAgIHJldCA9IHRydWVcblxuICAgICAgICBAbW92ZVRvUHJldmlvdXNMaW5lKClcblxuICAgICAgICByZXR1cm4gcmV0XG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGxpbmUgaXMgYmxhbmsgb3IgaWYgaXQgaXMgYSBjb21tZW50IGxpbmUuXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBsaW5lIGlzIGVtcHR5IG9yIGlmIGl0IGlzIGEgY29tbWVudCBsaW5lLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNDdXJyZW50TGluZUVtcHR5OiAtPlxuICAgICAgICB0cmltbWVkTGluZSA9IFV0aWxzLnRyaW0oQGN1cnJlbnRMaW5lLCAnICcpXG4gICAgICAgIHJldHVybiB0cmltbWVkTGluZS5sZW5ndGggaXMgMCBvciB0cmltbWVkTGluZS5jaGFyQXQoMCkgaXMgJyMnXG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGxpbmUgaXMgYmxhbmsuXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBsaW5lIGlzIGJsYW5rLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNDdXJyZW50TGluZUJsYW5rOiAtPlxuICAgICAgICByZXR1cm4gJycgaXMgVXRpbHMudHJpbShAY3VycmVudExpbmUsICcgJylcblxuXG4gICAgIyBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgbGluZSBpcyBhIGNvbW1lbnQgbGluZS5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSAgICAgUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGxpbmUgaXMgYSBjb21tZW50IGxpbmUsIGZhbHNlIG90aGVyd2lzZVxuICAgICNcbiAgICBpc0N1cnJlbnRMaW5lQ29tbWVudDogLT5cbiAgICAgICAgIyBDaGVja2luZyBleHBsaWNpdGx5IHRoZSBmaXJzdCBjaGFyIG9mIHRoZSB0cmltIGlzIGZhc3RlciB0aGFuIGxvb3BzIG9yIHN0cnBvc1xuICAgICAgICBsdHJpbW1lZExpbmUgPSBVdGlscy5sdHJpbShAY3VycmVudExpbmUsICcgJylcblxuICAgICAgICByZXR1cm4gbHRyaW1tZWRMaW5lLmNoYXJBdCgwKSBpcyAnIydcblxuXG4gICAgIyBDbGVhbnVwcyBhIFlBTUwgc3RyaW5nIHRvIGJlIHBhcnNlZC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSBUaGUgaW5wdXQgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIGNsZWFuZWQgdXAgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgY2xlYW51cDogKHZhbHVlKSAtPlxuICAgICAgICBpZiB2YWx1ZS5pbmRleE9mKFwiXFxyXCIpIGlzbnQgLTFcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3BsaXQoXCJcXHJcXG5cIikuam9pbihcIlxcblwiKS5zcGxpdChcIlxcclwiKS5qb2luKFwiXFxuXCIpXG5cbiAgICAgICAgIyBTdHJpcCBZQU1MIGhlYWRlclxuICAgICAgICBjb3VudCA9IDBcbiAgICAgICAgW3ZhbHVlLCBjb3VudF0gPSBAUEFUVEVSTl9ZQU1MX0hFQURFUi5yZXBsYWNlQWxsIHZhbHVlLCAnJ1xuICAgICAgICBAb2Zmc2V0ICs9IGNvdW50XG5cbiAgICAgICAgIyBSZW1vdmUgbGVhZGluZyBjb21tZW50c1xuICAgICAgICBbdHJpbW1lZFZhbHVlLCBjb3VudF0gPSBAUEFUVEVSTl9MRUFESU5HX0NPTU1FTlRTLnJlcGxhY2VBbGwgdmFsdWUsICcnLCAxXG4gICAgICAgIGlmIGNvdW50IGlzIDFcbiAgICAgICAgICAgICMgSXRlbXMgaGF2ZSBiZWVuIHJlbW92ZWQsIHVwZGF0ZSB0aGUgb2Zmc2V0XG4gICAgICAgICAgICBAb2Zmc2V0ICs9IFV0aWxzLnN1YlN0ckNvdW50KHZhbHVlLCBcIlxcblwiKSAtIFV0aWxzLnN1YlN0ckNvdW50KHRyaW1tZWRWYWx1ZSwgXCJcXG5cIilcbiAgICAgICAgICAgIHZhbHVlID0gdHJpbW1lZFZhbHVlXG5cbiAgICAgICAgIyBSZW1vdmUgc3RhcnQgb2YgdGhlIGRvY3VtZW50IG1hcmtlciAoLS0tKVxuICAgICAgICBbdHJpbW1lZFZhbHVlLCBjb3VudF0gPSBAUEFUVEVSTl9ET0NVTUVOVF9NQVJLRVJfU1RBUlQucmVwbGFjZUFsbCB2YWx1ZSwgJycsIDFcbiAgICAgICAgaWYgY291bnQgaXMgMVxuICAgICAgICAgICAgIyBJdGVtcyBoYXZlIGJlZW4gcmVtb3ZlZCwgdXBkYXRlIHRoZSBvZmZzZXRcbiAgICAgICAgICAgIEBvZmZzZXQgKz0gVXRpbHMuc3ViU3RyQ291bnQodmFsdWUsIFwiXFxuXCIpIC0gVXRpbHMuc3ViU3RyQ291bnQodHJpbW1lZFZhbHVlLCBcIlxcblwiKVxuICAgICAgICAgICAgdmFsdWUgPSB0cmltbWVkVmFsdWVcblxuICAgICAgICAgICAgIyBSZW1vdmUgZW5kIG9mIHRoZSBkb2N1bWVudCBtYXJrZXIgKC4uLilcbiAgICAgICAgICAgIHZhbHVlID0gQFBBVFRFUk5fRE9DVU1FTlRfTUFSS0VSX0VORC5yZXBsYWNlIHZhbHVlLCAnJ1xuXG4gICAgICAgICMgRW5zdXJlIHRoZSBibG9jayBpcyBub3QgaW5kZW50ZWRcbiAgICAgICAgbGluZXMgPSB2YWx1ZS5zcGxpdChcIlxcblwiKVxuICAgICAgICBzbWFsbGVzdEluZGVudCA9IC0xXG4gICAgICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgICAgICBjb250aW51ZSBpZiBVdGlscy50cmltKGxpbmUsICcgJykubGVuZ3RoID09IDBcbiAgICAgICAgICAgIGluZGVudCA9IGxpbmUubGVuZ3RoIC0gVXRpbHMubHRyaW0obGluZSkubGVuZ3RoXG4gICAgICAgICAgICBpZiBzbWFsbGVzdEluZGVudCBpcyAtMSBvciBpbmRlbnQgPCBzbWFsbGVzdEluZGVudFxuICAgICAgICAgICAgICAgIHNtYWxsZXN0SW5kZW50ID0gaW5kZW50XG4gICAgICAgIGlmIHNtYWxsZXN0SW5kZW50ID4gMFxuICAgICAgICAgICAgZm9yIGxpbmUsIGkgaW4gbGluZXNcbiAgICAgICAgICAgICAgICBsaW5lc1tpXSA9IGxpbmVbc21hbGxlc3RJbmRlbnQuLl1cbiAgICAgICAgICAgIHZhbHVlID0gbGluZXMuam9pbihcIlxcblwiKVxuXG4gICAgICAgIHJldHVybiB2YWx1ZVxuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiB0aGUgbmV4dCBsaW5lIHN0YXJ0cyB1bmluZGVudGVkIGNvbGxlY3Rpb25cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSAgICAgUmV0dXJucyB0cnVlIGlmIHRoZSBuZXh0IGxpbmUgc3RhcnRzIHVuaW5kZW50ZWQgY29sbGVjdGlvbiwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgI1xuICAgIGlzTmV4dExpbmVVbkluZGVudGVkQ29sbGVjdGlvbjogKGN1cnJlbnRJbmRlbnRhdGlvbiA9IG51bGwpIC0+XG4gICAgICAgIGN1cnJlbnRJbmRlbnRhdGlvbiA/PSBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpXG4gICAgICAgIG5vdEVPRiA9IEBtb3ZlVG9OZXh0TGluZSgpXG5cbiAgICAgICAgd2hpbGUgbm90RU9GIGFuZCBAaXNDdXJyZW50TGluZUVtcHR5KClcbiAgICAgICAgICAgIG5vdEVPRiA9IEBtb3ZlVG9OZXh0TGluZSgpXG5cbiAgICAgICAgaWYgZmFsc2UgaXMgbm90RU9GXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICByZXQgPSBmYWxzZVxuICAgICAgICBpZiBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpIGlzIGN1cnJlbnRJbmRlbnRhdGlvbiBhbmQgQGlzU3RyaW5nVW5JbmRlbnRlZENvbGxlY3Rpb25JdGVtKEBjdXJyZW50TGluZSlcbiAgICAgICAgICAgIHJldCA9IHRydWVcblxuICAgICAgICBAbW92ZVRvUHJldmlvdXNMaW5lKClcblxuICAgICAgICByZXR1cm4gcmV0XG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBzdHJpbmcgaXMgdW4taW5kZW50ZWQgY29sbGVjdGlvbiBpdGVtXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3RyaW5nIGlzIHVuLWluZGVudGVkIGNvbGxlY3Rpb24gaXRlbSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgI1xuICAgIGlzU3RyaW5nVW5JbmRlbnRlZENvbGxlY3Rpb25JdGVtOiAtPlxuICAgICAgICByZXR1cm4gQGN1cnJlbnRMaW5lIGlzICctJyBvciBAY3VycmVudExpbmVbMC4uLjJdIGlzICctICdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlclxuIiwiXG4jIFBhdHRlcm4gaXMgYSB6ZXJvLWNvbmZsaWN0IHdyYXBwZXIgZXh0ZW5kaW5nIFJlZ0V4cCBmZWF0dXJlc1xuIyBpbiBvcmRlciB0byBtYWtlIFlBTUwgcGFyc2luZyByZWdleCBtb3JlIGV4cHJlc3NpdmUuXG4jXG5jbGFzcyBQYXR0ZXJuXG5cbiAgICAjIEBwcm9wZXJ0eSBbUmVnRXhwXSBUaGUgUmVnRXhwIGluc3RhbmNlXG4gICAgcmVnZXg6ICAgICAgICAgIG51bGxcblxuICAgICMgQHByb3BlcnR5IFtTdHJpbmddIFRoZSByYXcgcmVnZXggc3RyaW5nXG4gICAgcmF3UmVnZXg6ICAgICAgIG51bGxcblxuICAgICMgQHByb3BlcnR5IFtTdHJpbmddIFRoZSBjbGVhbmVkIHJlZ2V4IHN0cmluZyAodXNlZCB0byBjcmVhdGUgdGhlIFJlZ0V4cCBpbnN0YW5jZSlcbiAgICBjbGVhbmVkUmVnZXg6ICAgbnVsbFxuXG4gICAgIyBAcHJvcGVydHkgW09iamVjdF0gVGhlIGRpY3Rpb25hcnkgbWFwcGluZyBuYW1lcyB0byBjYXB0dXJpbmcgYnJhY2tldCBudW1iZXJzXG4gICAgbWFwcGluZzogICAgICAgIG51bGxcblxuICAgICMgQ29uc3RydWN0b3JcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gcmF3UmVnZXggVGhlIHJhdyByZWdleCBzdHJpbmcgZGVmaW5pbmcgdGhlIHBhdHRlcm5cbiAgICAjXG4gICAgY29uc3RydWN0b3I6IChyYXdSZWdleCwgbW9kaWZpZXJzID0gJycpIC0+XG4gICAgICAgIGNsZWFuZWRSZWdleCA9ICcnXG4gICAgICAgIGxlbiA9IHJhd1JlZ2V4Lmxlbmd0aFxuICAgICAgICBtYXBwaW5nID0gbnVsbFxuXG4gICAgICAgICMgQ2xlYW51cCByYXcgcmVnZXggYW5kIGNvbXB1dGUgbWFwcGluZ1xuICAgICAgICBjYXB0dXJpbmdCcmFja2V0TnVtYmVyID0gMFxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgbGVuXG4gICAgICAgICAgICBfY2hhciA9IHJhd1JlZ2V4LmNoYXJBdChpKVxuICAgICAgICAgICAgaWYgX2NoYXIgaXMgJ1xcXFwnXG4gICAgICAgICAgICAgICAgIyBJZ25vcmUgbmV4dCBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICBjbGVhbmVkUmVnZXggKz0gcmF3UmVnZXhbaS4uaSsxXVxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgZWxzZSBpZiBfY2hhciBpcyAnKCdcbiAgICAgICAgICAgICAgICAjIEluY3JlYXNlIGJyYWNrZXQgbnVtYmVyLCBvbmx5IGlmIGl0IGlzIGNhcHR1cmluZ1xuICAgICAgICAgICAgICAgIGlmIGkgPCBsZW4gLSAyXG4gICAgICAgICAgICAgICAgICAgIHBhcnQgPSByYXdSZWdleFtpLi5pKzJdXG4gICAgICAgICAgICAgICAgICAgIGlmIHBhcnQgaXMgJyg/OidcbiAgICAgICAgICAgICAgICAgICAgICAgICMgTm9uLWNhcHR1cmluZyBicmFja2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFuZWRSZWdleCArPSBwYXJ0XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgcGFydCBpcyAnKD88J1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBDYXB0dXJpbmcgYnJhY2tldCB3aXRoIHBvc3NpYmx5IGEgbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FwdHVyaW5nQnJhY2tldE51bWJlcisrXG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgaSArIDEgPCBsZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJDaGFyID0gcmF3UmVnZXguY2hhckF0KGkgKyAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHN1YkNoYXIgaXMgJz4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFuZWRSZWdleCArPSAnKCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBBc3NvY2lhdGUgYSBuYW1lIHdpdGggYSBjYXB0dXJpbmcgYnJhY2tldCBudW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmcgPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmdbbmFtZV0gPSBjYXB0dXJpbmdCcmFja2V0TnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lICs9IHN1YkNoYXJcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhbmVkUmVnZXggKz0gX2NoYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcHR1cmluZ0JyYWNrZXROdW1iZXIrK1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY2xlYW5lZFJlZ2V4ICs9IF9jaGFyXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2xlYW5lZFJlZ2V4ICs9IF9jaGFyXG5cbiAgICAgICAgICAgIGkrK1xuXG4gICAgICAgIEByYXdSZWdleCA9IHJhd1JlZ2V4XG4gICAgICAgIEBjbGVhbmVkUmVnZXggPSBjbGVhbmVkUmVnZXhcbiAgICAgICAgQHJlZ2V4ID0gbmV3IFJlZ0V4cCBAY2xlYW5lZFJlZ2V4LCAnZycrbW9kaWZpZXJzLnJlcGxhY2UoJ2cnLCAnJylcbiAgICAgICAgQG1hcHBpbmcgPSBtYXBwaW5nXG5cblxuICAgICMgRXhlY3V0ZXMgdGhlIHBhdHRlcm4ncyByZWdleCBhbmQgcmV0dXJucyB0aGUgbWF0Y2hpbmcgdmFsdWVzXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc3RyaW5nIHRvIHVzZSB0byBleGVjdXRlIHRoZSBwYXR0ZXJuXG4gICAgI1xuICAgICMgQHJldHVybiBbQXJyYXldIFRoZSBtYXRjaGluZyB2YWx1ZXMgZXh0cmFjdGVkIGZyb20gY2FwdHVyaW5nIGJyYWNrZXRzIG9yIG51bGwgaWYgbm90aGluZyBtYXRjaGVkXG4gICAgI1xuICAgIGV4ZWM6IChzdHIpIC0+XG4gICAgICAgIEByZWdleC5sYXN0SW5kZXggPSAwXG4gICAgICAgIG1hdGNoZXMgPSBAcmVnZXguZXhlYyBzdHJcblxuICAgICAgICBpZiBub3QgbWF0Y2hlcz9cbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgICAgaWYgQG1hcHBpbmc/XG4gICAgICAgICAgICBmb3IgbmFtZSwgaW5kZXggb2YgQG1hcHBpbmdcbiAgICAgICAgICAgICAgICBtYXRjaGVzW25hbWVdID0gbWF0Y2hlc1tpbmRleF1cblxuICAgICAgICByZXR1cm4gbWF0Y2hlc1xuXG5cbiAgICAjIFRlc3RzIHRoZSBwYXR0ZXJuJ3MgcmVnZXhcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBzdHJpbmcgdG8gdXNlIHRvIHRlc3QgdGhlIHBhdHRlcm5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlIGlmIHRoZSBzdHJpbmcgbWF0Y2hlZFxuICAgICNcbiAgICB0ZXN0OiAoc3RyKSAtPlxuICAgICAgICBAcmVnZXgubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gQHJlZ2V4LnRlc3Qgc3RyXG5cblxuICAgICMgUmVwbGFjZXMgb2NjdXJlbmNlcyBtYXRjaGluZyB3aXRoIHRoZSBwYXR0ZXJuJ3MgcmVnZXggd2l0aCByZXBsYWNlbWVudFxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHNvdXJjZSBzdHJpbmcgdG8gcGVyZm9ybSByZXBsYWNlbWVudHNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSByZXBsYWNlbWVudCBUaGUgc3RyaW5nIHRvIHVzZSBpbiBwbGFjZSBvZiBlYWNoIHJlcGxhY2VkIG9jY3VyZW5jZS5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddIFRoZSByZXBsYWNlZCBzdHJpbmdcbiAgICAjXG4gICAgcmVwbGFjZTogKHN0ciwgcmVwbGFjZW1lbnQpIC0+XG4gICAgICAgIEByZWdleC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSBAcmVnZXgsIHJlcGxhY2VtZW50XG5cblxuICAgICMgUmVwbGFjZXMgb2NjdXJlbmNlcyBtYXRjaGluZyB3aXRoIHRoZSBwYXR0ZXJuJ3MgcmVnZXggd2l0aCByZXBsYWNlbWVudCBhbmRcbiAgICAjIGdldCBib3RoIHRoZSByZXBsYWNlZCBzdHJpbmcgYW5kIHRoZSBudW1iZXIgb2YgcmVwbGFjZWQgb2NjdXJlbmNlcyBpbiB0aGUgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHNvdXJjZSBzdHJpbmcgdG8gcGVyZm9ybSByZXBsYWNlbWVudHNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSByZXBsYWNlbWVudCBUaGUgc3RyaW5nIHRvIHVzZSBpbiBwbGFjZSBvZiBlYWNoIHJlcGxhY2VkIG9jY3VyZW5jZS5cbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gbGltaXQgVGhlIG1heGltdW0gbnVtYmVyIG9mIG9jY3VyZW5jZXMgdG8gcmVwbGFjZSAoMCBtZWFucyBpbmZpbml0ZSBudW1iZXIgb2Ygb2NjdXJlbmNlcylcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtBcnJheV0gQSBkZXN0cnVjdHVyYWJsZSBhcnJheSBjb250YWluaW5nIHRoZSByZXBsYWNlZCBzdHJpbmcgYW5kIHRoZSBudW1iZXIgb2YgcmVwbGFjZWQgb2NjdXJlbmNlcy4gRm9yIGluc3RhbmNlOiBbXCJteSByZXBsYWNlZCBzdHJpbmdcIiwgMl1cbiAgICAjXG4gICAgcmVwbGFjZUFsbDogKHN0ciwgcmVwbGFjZW1lbnQsIGxpbWl0ID0gMCkgLT5cbiAgICAgICAgQHJlZ2V4Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgY291bnQgPSAwXG4gICAgICAgIHdoaWxlIEByZWdleC50ZXN0KHN0cikgYW5kIChsaW1pdCBpcyAwIG9yIGNvdW50IDwgbGltaXQpXG4gICAgICAgICAgICBAcmVnZXgubGFzdEluZGV4ID0gMFxuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UgQHJlZ2V4LCByZXBsYWNlbWVudFxuICAgICAgICAgICAgY291bnQrK1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFtzdHIsIGNvdW50XVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblxuXG4iLCJcblV0aWxzICAgPSByZXF1aXJlICcuL1V0aWxzJ1xuUGF0dGVybiA9IHJlcXVpcmUgJy4vUGF0dGVybidcblxuIyBVbmVzY2FwZXIgZW5jYXBzdWxhdGVzIHVuZXNjYXBpbmcgcnVsZXMgZm9yIHNpbmdsZSBhbmQgZG91YmxlLXF1b3RlZCBZQU1MIHN0cmluZ3MuXG4jXG5jbGFzcyBVbmVzY2FwZXJcblxuICAgICMgUmVnZXggZnJhZ21lbnQgdGhhdCBtYXRjaGVzIGFuIGVzY2FwZWQgY2hhcmFjdGVyIGluXG4gICAgIyBhIGRvdWJsZSBxdW90ZWQgc3RyaW5nLlxuICAgIEBQQVRURVJOX0VTQ0FQRURfQ0hBUkFDVEVSOiAgICAgbmV3IFBhdHRlcm4gJ1xcXFxcXFxcKFswYWJ0XFx0bnZmcmUgXCJcXFxcL1xcXFxcXFxcTl9MUF18eFswLTlhLWZBLUZdezJ9fHVbMC05YS1mQS1GXXs0fXxVWzAtOWEtZkEtRl17OH0pJztcblxuXG4gICAgIyBVbmVzY2FwZXMgYSBzaW5nbGUgcXVvdGVkIHN0cmluZy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICAgICAgdmFsdWUgQSBzaW5nbGUgcXVvdGVkIHN0cmluZy5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICAgICAgVGhlIHVuZXNjYXBlZCBzdHJpbmcuXG4gICAgI1xuICAgIEB1bmVzY2FwZVNpbmdsZVF1b3RlZFN0cmluZzogKHZhbHVlKSAtPlxuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFwnXFwnL2csICdcXCcnKVxuXG5cbiAgICAjIFVuZXNjYXBlcyBhIGRvdWJsZSBxdW90ZWQgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgICAgICB2YWx1ZSBBIGRvdWJsZSBxdW90ZWQgc3RyaW5nLlxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gICAgICBUaGUgdW5lc2NhcGVkIHN0cmluZy5cbiAgICAjXG4gICAgQHVuZXNjYXBlRG91YmxlUXVvdGVkU3RyaW5nOiAodmFsdWUpIC0+XG4gICAgICAgIEBfdW5lc2NhcGVDYWxsYmFjayA/PSAoc3RyKSA9PlxuICAgICAgICAgICAgcmV0dXJuIEB1bmVzY2FwZUNoYXJhY3RlcihzdHIpXG5cbiAgICAgICAgIyBFdmFsdWF0ZSB0aGUgc3RyaW5nXG4gICAgICAgIHJldHVybiBAUEFUVEVSTl9FU0NBUEVEX0NIQVJBQ1RFUi5yZXBsYWNlIHZhbHVlLCBAX3VuZXNjYXBlQ2FsbGJhY2tcblxuXG4gICAgIyBVbmVzY2FwZXMgYSBjaGFyYWN0ZXIgdGhhdCB3YXMgZm91bmQgaW4gYSBkb3VibGUtcXVvdGVkIHN0cmluZ1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgICAgICB2YWx1ZSBBbiBlc2NhcGVkIGNoYXJhY3RlclxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gICAgICBUaGUgdW5lc2NhcGVkIGNoYXJhY3RlclxuICAgICNcbiAgICBAdW5lc2NhcGVDaGFyYWN0ZXI6ICh2YWx1ZSkgLT5cbiAgICAgICAgY2ggPSBTdHJpbmcuZnJvbUNoYXJDb2RlXG4gICAgICAgIHN3aXRjaCB2YWx1ZS5jaGFyQXQoMSlcbiAgICAgICAgICAgIHdoZW4gJzAnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDApXG4gICAgICAgICAgICB3aGVuICdhJ1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCg3KVxuICAgICAgICAgICAgd2hlbiAnYidcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goOClcbiAgICAgICAgICAgIHdoZW4gJ3QnXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXFx0XCJcbiAgICAgICAgICAgIHdoZW4gXCJcXHRcIlxuICAgICAgICAgICAgICAgIHJldHVybiBcIlxcdFwiXG4gICAgICAgICAgICB3aGVuICduJ1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlxcblwiXG4gICAgICAgICAgICB3aGVuICd2J1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCgxMSlcbiAgICAgICAgICAgIHdoZW4gJ2YnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDEyKVxuICAgICAgICAgICAgd2hlbiAncidcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMTMpXG4gICAgICAgICAgICB3aGVuICdlJ1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCgyNylcbiAgICAgICAgICAgIHdoZW4gJyAnXG4gICAgICAgICAgICAgICAgcmV0dXJuICcgJ1xuICAgICAgICAgICAgd2hlbiAnXCInXG4gICAgICAgICAgICAgICAgcmV0dXJuICdcIidcbiAgICAgICAgICAgIHdoZW4gJy8nXG4gICAgICAgICAgICAgICAgcmV0dXJuICcvJ1xuICAgICAgICAgICAgd2hlbiAnXFxcXCdcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1xcXFwnXG4gICAgICAgICAgICB3aGVuICdOJ1xuICAgICAgICAgICAgICAgICMgVSswMDg1IE5FWFQgTElORVxuICAgICAgICAgICAgICAgIHJldHVybiBjaCgweDAwODUpXG4gICAgICAgICAgICB3aGVuICdfJ1xuICAgICAgICAgICAgICAgICMgVSswMEEwIE5PLUJSRUFLIFNQQUNFXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDB4MDBBMClcbiAgICAgICAgICAgIHdoZW4gJ0wnXG4gICAgICAgICAgICAgICAgIyBVKzIwMjggTElORSBTRVBBUkFUT1JcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMHgyMDI4KVxuICAgICAgICAgICAgd2hlbiAnUCdcbiAgICAgICAgICAgICAgICAjIFUrMjAyOSBQQVJBR1JBUEggU0VQQVJBVE9SXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDB4MjAyOSlcbiAgICAgICAgICAgIHdoZW4gJ3gnXG4gICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLnV0ZjhjaHIoVXRpbHMuaGV4RGVjKHZhbHVlLnN1YnN0cigyLCAyKSkpXG4gICAgICAgICAgICB3aGVuICd1J1xuICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy51dGY4Y2hyKFV0aWxzLmhleERlYyh2YWx1ZS5zdWJzdHIoMiwgNCkpKVxuICAgICAgICAgICAgd2hlbiAnVSdcbiAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMudXRmOGNocihVdGlscy5oZXhEZWModmFsdWUuc3Vic3RyKDIsIDgpKSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gJydcblxubW9kdWxlLmV4cG9ydHMgPSBVbmVzY2FwZXJcbiIsIlxuUGF0dGVybiA9IHJlcXVpcmUgJy4vUGF0dGVybidcblxuIyBBIGJ1bmNoIG9mIHV0aWxpdHkgbWV0aG9kc1xuI1xuY2xhc3MgVXRpbHNcblxuICAgIEBSRUdFWF9MRUZUX1RSSU1fQllfQ0hBUjogICB7fVxuICAgIEBSRUdFWF9SSUdIVF9UUklNX0JZX0NIQVI6ICB7fVxuICAgIEBSRUdFWF9TUEFDRVM6ICAgICAgICAgICAgICAvXFxzKy9nXG4gICAgQFJFR0VYX0RJR0lUUzogICAgICAgICAgICAgIC9eXFxkKyQvXG4gICAgQFJFR0VYX09DVEFMOiAgICAgICAgICAgICAgIC9bXjAtN10vZ2lcbiAgICBAUkVHRVhfSEVYQURFQ0lNQUw6ICAgICAgICAgL1teYS1mMC05XS9naVxuXG4gICAgIyBQcmVjb21waWxlZCBkYXRlIHBhdHRlcm5cbiAgICBAUEFUVEVSTl9EQVRFOiAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14nK1xuICAgICAgICAgICAgJyg/PHllYXI+WzAtOV1bMC05XVswLTldWzAtOV0pJytcbiAgICAgICAgICAgICctKD88bW9udGg+WzAtOV1bMC05XT8pJytcbiAgICAgICAgICAgICctKD88ZGF5PlswLTldWzAtOV0/KScrXG4gICAgICAgICAgICAnKD86KD86W1R0XXxbIFxcdF0rKScrXG4gICAgICAgICAgICAnKD88aG91cj5bMC05XVswLTldPyknK1xuICAgICAgICAgICAgJzooPzxtaW51dGU+WzAtOV1bMC05XSknK1xuICAgICAgICAgICAgJzooPzxzZWNvbmQ+WzAtOV1bMC05XSknK1xuICAgICAgICAgICAgJyg/OlxcLig/PGZyYWN0aW9uPlswLTldKikpPycrXG4gICAgICAgICAgICAnKD86WyBcXHRdKig/PHR6Plp8KD88dHpfc2lnbj5bLStdKSg/PHR6X2hvdXI+WzAtOV1bMC05XT8pJytcbiAgICAgICAgICAgICcoPzo6KD88dHpfbWludXRlPlswLTldWzAtOV0pKT8pKT8pPycrXG4gICAgICAgICAgICAnJCcsICdpJ1xuXG4gICAgIyBMb2NhbCB0aW1lem9uZSBvZmZzZXQgaW4gbXNcbiAgICBATE9DQUxfVElNRVpPTkVfT0ZGU0VUOiAgICAgbmV3IERhdGUoKS5nZXRUaW1lem9uZU9mZnNldCgpICogNjAgKiAxMDAwXG5cbiAgICAjIFRyaW1zIHRoZSBnaXZlbiBzdHJpbmcgb24gYm90aCBzaWRlc1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHN0cmluZyB0byB0cmltXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gX2NoYXIgVGhlIGNoYXJhY3RlciB0byB1c2UgZm9yIHRyaW1taW5nIChkZWZhdWx0OiAnXFxcXHMnKVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gQSB0cmltbWVkIHN0cmluZ1xuICAgICNcbiAgICBAdHJpbTogKHN0ciwgX2NoYXIgPSAnXFxcXHMnKSAtPlxuICAgICAgICByZWdleExlZnQgPSBAUkVHRVhfTEVGVF9UUklNX0JZX0NIQVJbX2NoYXJdXG4gICAgICAgIHVubGVzcyByZWdleExlZnQ/XG4gICAgICAgICAgICBAUkVHRVhfTEVGVF9UUklNX0JZX0NIQVJbX2NoYXJdID0gcmVnZXhMZWZ0ID0gbmV3IFJlZ0V4cCAnXicrX2NoYXIrJycrX2NoYXIrJyonXG4gICAgICAgIHJlZ2V4TGVmdC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJlZ2V4UmlnaHQgPSBAUkVHRVhfUklHSFRfVFJJTV9CWV9DSEFSW19jaGFyXVxuICAgICAgICB1bmxlc3MgcmVnZXhSaWdodD9cbiAgICAgICAgICAgIEBSRUdFWF9SSUdIVF9UUklNX0JZX0NIQVJbX2NoYXJdID0gcmVnZXhSaWdodCA9IG5ldyBSZWdFeHAgX2NoYXIrJycrX2NoYXIrJyokJ1xuICAgICAgICByZWdleFJpZ2h0Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHJlZ2V4TGVmdCwgJycpLnJlcGxhY2UocmVnZXhSaWdodCwgJycpXG5cblxuICAgICMgVHJpbXMgdGhlIGdpdmVuIHN0cmluZyBvbiB0aGUgbGVmdCBzaWRlXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc3RyaW5nIHRvIHRyaW1cbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBfY2hhciBUaGUgY2hhcmFjdGVyIHRvIHVzZSBmb3IgdHJpbW1pbmcgKGRlZmF1bHQ6ICdcXFxccycpXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSBBIHRyaW1tZWQgc3RyaW5nXG4gICAgI1xuICAgIEBsdHJpbTogKHN0ciwgX2NoYXIgPSAnXFxcXHMnKSAtPlxuICAgICAgICByZWdleExlZnQgPSBAUkVHRVhfTEVGVF9UUklNX0JZX0NIQVJbX2NoYXJdXG4gICAgICAgIHVubGVzcyByZWdleExlZnQ/XG4gICAgICAgICAgICBAUkVHRVhfTEVGVF9UUklNX0JZX0NIQVJbX2NoYXJdID0gcmVnZXhMZWZ0ID0gbmV3IFJlZ0V4cCAnXicrX2NoYXIrJycrX2NoYXIrJyonXG4gICAgICAgIHJlZ2V4TGVmdC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShyZWdleExlZnQsICcnKVxuXG5cbiAgICAjIFRyaW1zIHRoZSBnaXZlbiBzdHJpbmcgb24gdGhlIHJpZ2h0IHNpZGVcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBzdHJpbmcgdG8gdHJpbVxuICAgICMgQHBhcmFtIFtTdHJpbmddIF9jaGFyIFRoZSBjaGFyYWN0ZXIgdG8gdXNlIGZvciB0cmltbWluZyAoZGVmYXVsdDogJ1xcXFxzJylcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddIEEgdHJpbW1lZCBzdHJpbmdcbiAgICAjXG4gICAgQHJ0cmltOiAoc3RyLCBfY2hhciA9ICdcXFxccycpIC0+XG4gICAgICAgIHJlZ2V4UmlnaHQgPSBAUkVHRVhfUklHSFRfVFJJTV9CWV9DSEFSW19jaGFyXVxuICAgICAgICB1bmxlc3MgcmVnZXhSaWdodD9cbiAgICAgICAgICAgIEBSRUdFWF9SSUdIVF9UUklNX0JZX0NIQVJbX2NoYXJdID0gcmVnZXhSaWdodCA9IG5ldyBSZWdFeHAgX2NoYXIrJycrX2NoYXIrJyokJ1xuICAgICAgICByZWdleFJpZ2h0Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHJlZ2V4UmlnaHQsICcnKVxuXG5cbiAgICAjIENoZWNrcyBpZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgZW1wdHkgKG51bGwsIHVuZGVmaW5lZCwgZW1wdHkgc3RyaW5nLCBzdHJpbmcgJzAnLCBlbXB0eSBBcnJheSwgZW1wdHkgT2JqZWN0KVxuICAgICNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2tcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlIGlmIHRoZSB2YWx1ZSBpcyBlbXB0eVxuICAgICNcbiAgICBAaXNFbXB0eTogKHZhbHVlKSAtPlxuICAgICAgICByZXR1cm4gbm90KHZhbHVlKSBvciB2YWx1ZSBpcyAnJyBvciB2YWx1ZSBpcyAnMCcgb3IgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkgYW5kIHZhbHVlLmxlbmd0aCBpcyAwKSBvciBAaXNFbXB0eU9iamVjdCh2YWx1ZSlcblxuICAgICMgQ2hlY2tzIGlmIHRoZSBnaXZlbiB2YWx1ZSBpcyBhbiBlbXB0eSBvYmplY3RcbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgZW1wdHkgYW5kIGlzIGFuIG9iamVjdFxuICAgICNcbiAgICBAaXNFbXB0eU9iamVjdDogKHZhbHVlKSAtPlxuICAgICAgICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgYW5kIChrIGZvciBvd24gayBvZiB2YWx1ZSkubGVuZ3RoIGlzIDBcblxuICAgICMgQ291bnRzIHRoZSBudW1iZXIgb2Ygb2NjdXJlbmNlcyBvZiBzdWJTdHJpbmcgaW5zaWRlIHN0cmluZ1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHJpbmcgVGhlIHN0cmluZyB3aGVyZSB0byBjb3VudCBvY2N1cmVuY2VzXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3ViU3RyaW5nIFRoZSBzdWJTdHJpbmcgdG8gY291bnRcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gc3RhcnQgVGhlIHN0YXJ0IGluZGV4XG4gICAgIyBAcGFyYW0gW0ludGVnZXJdIGxlbmd0aCBUaGUgc3RyaW5nIGxlbmd0aCB1bnRpbCB3aGVyZSB0byBjb3VudFxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdIFRoZSBudW1iZXIgb2Ygb2NjdXJlbmNlc1xuICAgICNcbiAgICBAc3ViU3RyQ291bnQ6IChzdHJpbmcsIHN1YlN0cmluZywgc3RhcnQsIGxlbmd0aCkgLT5cbiAgICAgICAgYyA9IDBcblxuICAgICAgICBzdHJpbmcgPSAnJyArIHN0cmluZ1xuICAgICAgICBzdWJTdHJpbmcgPSAnJyArIHN1YlN0cmluZ1xuXG4gICAgICAgIGlmIHN0YXJ0P1xuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nW3N0YXJ0Li5dXG4gICAgICAgIGlmIGxlbmd0aD9cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZ1swLi4ubGVuZ3RoXVxuXG4gICAgICAgIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgICAgICAgc3VibGVuID0gc3ViU3RyaW5nLmxlbmd0aFxuICAgICAgICBmb3IgaSBpbiBbMC4uLmxlbl1cbiAgICAgICAgICAgIGlmIHN1YlN0cmluZyBpcyBzdHJpbmdbaS4uLnN1Ymxlbl1cbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgICAgICBpICs9IHN1YmxlbiAtIDFcblxuICAgICAgICByZXR1cm4gY1xuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiBpbnB1dCBpcyBvbmx5IGNvbXBvc2VkIG9mIGRpZ2l0c1xuICAgICNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSBpbnB1dCBUaGUgdmFsdWUgdG8gdGVzdFxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dIHRydWUgaWYgaW5wdXQgaXMgb25seSBjb21wb3NlZCBvZiBkaWdpdHNcbiAgICAjXG4gICAgQGlzRGlnaXRzOiAoaW5wdXQpIC0+XG4gICAgICAgIEBSRUdFWF9ESUdJVFMubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gQFJFR0VYX0RJR0lUUy50ZXN0IGlucHV0XG5cblxuICAgICMgRGVjb2RlIG9jdGFsIHZhbHVlXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIGlucHV0IFRoZSB2YWx1ZSB0byBkZWNvZGVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtJbnRlZ2VyXSBUaGUgZGVjb2RlZCB2YWx1ZVxuICAgICNcbiAgICBAb2N0RGVjOiAoaW5wdXQpIC0+XG4gICAgICAgIEBSRUdFWF9PQ1RBTC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBwYXJzZUludCgoaW5wdXQrJycpLnJlcGxhY2UoQFJFR0VYX09DVEFMLCAnJyksIDgpXG5cblxuICAgICMgRGVjb2RlIGhleGFkZWNpbWFsIHZhbHVlXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIGlucHV0IFRoZSB2YWx1ZSB0byBkZWNvZGVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtJbnRlZ2VyXSBUaGUgZGVjb2RlZCB2YWx1ZVxuICAgICNcbiAgICBAaGV4RGVjOiAoaW5wdXQpIC0+XG4gICAgICAgIEBSRUdFWF9IRVhBREVDSU1BTC5sYXN0SW5kZXggPSAwXG4gICAgICAgIGlucHV0ID0gQHRyaW0oaW5wdXQpXG4gICAgICAgIGlmIChpbnB1dCsnJylbMC4uLjJdIGlzICcweCcgdGhlbiBpbnB1dCA9IChpbnB1dCsnJylbMi4uXVxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoKGlucHV0KycnKS5yZXBsYWNlKEBSRUdFWF9IRVhBREVDSU1BTCwgJycpLCAxNilcblxuXG4gICAgIyBHZXQgdGhlIFVURi04IGNoYXJhY3RlciBmb3IgdGhlIGdpdmVuIGNvZGUgcG9pbnQuXG4gICAgI1xuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSBjIFRoZSB1bmljb2RlIGNvZGUgcG9pbnRcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddIFRoZSBjb3JyZXNwb25kaW5nIFVURi04IGNoYXJhY3RlclxuICAgICNcbiAgICBAdXRmOGNocjogKGMpIC0+XG4gICAgICAgIGNoID0gU3RyaW5nLmZyb21DaGFyQ29kZVxuICAgICAgICBpZiAweDgwID4gKGMgJT0gMHgyMDAwMDApXG4gICAgICAgICAgICByZXR1cm4gY2goYylcbiAgICAgICAgaWYgMHg4MDAgPiBjXG4gICAgICAgICAgICByZXR1cm4gY2goMHhDMCB8IGM+PjYpICsgY2goMHg4MCB8IGMgJiAweDNGKVxuICAgICAgICBpZiAweDEwMDAwID4gY1xuICAgICAgICAgICAgcmV0dXJuIGNoKDB4RTAgfCBjPj4xMikgKyBjaCgweDgwIHwgYz4+NiAmIDB4M0YpICsgY2goMHg4MCB8IGMgJiAweDNGKVxuXG4gICAgICAgIHJldHVybiBjaCgweEYwIHwgYz4+MTgpICsgY2goMHg4MCB8IGM+PjEyICYgMHgzRikgKyBjaCgweDgwIHwgYz4+NiAmIDB4M0YpICsgY2goMHg4MCB8IGMgJiAweDNGKVxuXG5cbiAgICAjIFJldHVybnMgdGhlIGJvb2xlYW4gdmFsdWUgZXF1aXZhbGVudCB0byB0aGUgZ2l2ZW4gaW5wdXRcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ3xPYmplY3RdICAgIGlucHV0ICAgICAgIFRoZSBpbnB1dCB2YWx1ZVxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgICAgICAgICBzdHJpY3QgICAgICBJZiBzZXQgdG8gZmFsc2UsIGFjY2VwdCAneWVzJyBhbmQgJ25vJyBhcyBib29sZWFuIHZhbHVlc1xuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dICAgICAgICAgdGhlIGJvb2xlYW4gdmFsdWVcbiAgICAjXG4gICAgQHBhcnNlQm9vbGVhbjogKGlucHV0LCBzdHJpY3QgPSB0cnVlKSAtPlxuICAgICAgICBpZiB0eXBlb2YoaW5wdXQpIGlzICdzdHJpbmcnXG4gICAgICAgICAgICBsb3dlcklucHV0ID0gaW5wdXQudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgaWYgbm90IHN0cmljdFxuICAgICAgICAgICAgICAgIGlmIGxvd2VySW5wdXQgaXMgJ25vJyB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgaWYgbG93ZXJJbnB1dCBpcyAnMCcgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIGlmIGxvd2VySW5wdXQgaXMgJ2ZhbHNlJyB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgaWYgbG93ZXJJbnB1dCBpcyAnJyB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgcmV0dXJuICEhaW5wdXRcblxuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiBpbnB1dCBpcyBudW1lcmljXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdIGlucHV0IFRoZSB2YWx1ZSB0byB0ZXN0XG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSBpZiBpbnB1dCBpcyBudW1lcmljXG4gICAgI1xuICAgIEBpc051bWVyaWM6IChpbnB1dCkgLT5cbiAgICAgICAgQFJFR0VYX1NQQUNFUy5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiB0eXBlb2YoaW5wdXQpIGlzICdudW1iZXInIG9yIHR5cGVvZihpbnB1dCkgaXMgJ3N0cmluZycgYW5kICFpc05hTihpbnB1dCkgYW5kIGlucHV0LnJlcGxhY2UoQFJFR0VYX1NQQUNFUywgJycpIGlzbnQgJydcblxuXG4gICAgIyBSZXR1cm5zIGEgcGFyc2VkIGRhdGUgZnJvbSB0aGUgZ2l2ZW4gc3RyaW5nXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgZGF0ZSBzdHJpbmcgdG8gcGFyc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtEYXRlXSBUaGUgcGFyc2VkIGRhdGUgb3IgbnVsbCBpZiBwYXJzaW5nIGZhaWxlZFxuICAgICNcbiAgICBAc3RyaW5nVG9EYXRlOiAoc3RyKSAtPlxuICAgICAgICB1bmxlc3Mgc3RyPy5sZW5ndGhcbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgICAgIyBQZXJmb3JtIHJlZ3VsYXIgZXhwcmVzc2lvbiBwYXR0ZXJuXG4gICAgICAgIGluZm8gPSBAUEFUVEVSTl9EQVRFLmV4ZWMgc3RyXG4gICAgICAgIHVubGVzcyBpbmZvXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgICAgICMgRXh0cmFjdCB5ZWFyLCBtb250aCwgZGF5XG4gICAgICAgIHllYXIgPSBwYXJzZUludCBpbmZvLnllYXIsIDEwXG4gICAgICAgIG1vbnRoID0gcGFyc2VJbnQoaW5mby5tb250aCwgMTApIC0gMSAjIEluIGphdmFzY3JpcHQsIGphbnVhcnkgaXMgMCwgZmVicnVhcnkgMSwgZXRjLi4uXG4gICAgICAgIGRheSA9IHBhcnNlSW50IGluZm8uZGF5LCAxMFxuXG4gICAgICAgICMgSWYgbm8gaG91ciBpcyBnaXZlbiwgcmV0dXJuIGEgZGF0ZSB3aXRoIGRheSBwcmVjaXNpb25cbiAgICAgICAgdW5sZXNzIGluZm8uaG91cj9cbiAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSBEYXRlLlVUQyh5ZWFyLCBtb250aCwgZGF5KVxuICAgICAgICAgICAgcmV0dXJuIGRhdGVcblxuICAgICAgICAjIEV4dHJhY3QgaG91ciwgbWludXRlLCBzZWNvbmRcbiAgICAgICAgaG91ciA9IHBhcnNlSW50IGluZm8uaG91ciwgMTBcbiAgICAgICAgbWludXRlID0gcGFyc2VJbnQgaW5mby5taW51dGUsIDEwXG4gICAgICAgIHNlY29uZCA9IHBhcnNlSW50IGluZm8uc2Vjb25kLCAxMFxuXG4gICAgICAgICMgRXh0cmFjdCBmcmFjdGlvbiwgaWYgZ2l2ZW5cbiAgICAgICAgaWYgaW5mby5mcmFjdGlvbj9cbiAgICAgICAgICAgIGZyYWN0aW9uID0gaW5mby5mcmFjdGlvblswLi4uM11cbiAgICAgICAgICAgIHdoaWxlIGZyYWN0aW9uLmxlbmd0aCA8IDNcbiAgICAgICAgICAgICAgICBmcmFjdGlvbiArPSAnMCdcbiAgICAgICAgICAgIGZyYWN0aW9uID0gcGFyc2VJbnQgZnJhY3Rpb24sIDEwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZyYWN0aW9uID0gMFxuXG4gICAgICAgICMgQ29tcHV0ZSB0aW1lem9uZSBvZmZzZXQgaWYgZ2l2ZW5cbiAgICAgICAgaWYgaW5mby50ej9cbiAgICAgICAgICAgIHR6X2hvdXIgPSBwYXJzZUludCBpbmZvLnR6X2hvdXIsIDEwXG4gICAgICAgICAgICBpZiBpbmZvLnR6X21pbnV0ZT9cbiAgICAgICAgICAgICAgICB0el9taW51dGUgPSBwYXJzZUludCBpbmZvLnR6X21pbnV0ZSwgMTBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0el9taW51dGUgPSAwXG5cbiAgICAgICAgICAgICMgQ29tcHV0ZSB0aW1lem9uZSBkZWx0YSBpbiBtc1xuICAgICAgICAgICAgdHpfb2Zmc2V0ID0gKHR6X2hvdXIgKiA2MCArIHR6X21pbnV0ZSkgKiA2MDAwMFxuICAgICAgICAgICAgaWYgJy0nIGlzIGluZm8udHpfc2lnblxuICAgICAgICAgICAgICAgIHR6X29mZnNldCAqPSAtMVxuXG4gICAgICAgICMgQ29tcHV0ZSBkYXRlXG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZSBEYXRlLlVUQyh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgZnJhY3Rpb24pXG4gICAgICAgIGlmIHR6X29mZnNldFxuICAgICAgICAgICAgZGF0ZS5zZXRUaW1lIGRhdGUuZ2V0VGltZSgpIC0gdHpfb2Zmc2V0XG5cbiAgICAgICAgcmV0dXJuIGRhdGVcblxuXG4gICAgIyBSZXBlYXRzIHRoZSBnaXZlbiBzdHJpbmcgYSBudW1iZXIgb2YgdGltZXNcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBzdHIgICAgIFRoZSBzdHJpbmcgdG8gcmVwZWF0XG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICBudW1iZXIgIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gcmVwZWF0IHRoZSBzdHJpbmdcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBUaGUgcmVwZWF0ZWQgc3RyaW5nXG4gICAgI1xuICAgIEBzdHJSZXBlYXQ6IChzdHIsIG51bWJlcikgLT5cbiAgICAgICAgcmVzID0gJydcbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IG51bWJlclxuICAgICAgICAgICAgcmVzICs9IHN0clxuICAgICAgICAgICAgaSsrXG4gICAgICAgIHJldHVybiByZXNcblxuXG4gICAgIyBSZWFkcyB0aGUgZGF0YSBmcm9tIHRoZSBnaXZlbiBmaWxlIHBhdGggYW5kIHJldHVybnMgdGhlIHJlc3VsdCBhcyBzdHJpbmdcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBwYXRoICAgICAgICBUaGUgcGF0aCB0byB0aGUgZmlsZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gY2FsbGJhY2sgICAgQSBjYWxsYmFjayB0byByZWFkIGZpbGUgYXN5bmNocm9ub3VzbHkgKG9wdGlvbmFsKVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSByZXN1bHRpbmcgZGF0YSBhcyBzdHJpbmdcbiAgICAjXG4gICAgQGdldFN0cmluZ0Zyb21GaWxlOiAocGF0aCwgY2FsbGJhY2sgPSBudWxsKSAtPlxuICAgICAgICB4aHIgPSBudWxsXG4gICAgICAgIGlmIHdpbmRvdz9cbiAgICAgICAgICAgIGlmIHdpbmRvdy5YTUxIdHRwUmVxdWVzdFxuICAgICAgICAgICAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgICAgICAgICBlbHNlIGlmIHdpbmRvdy5BY3RpdmVYT2JqZWN0XG4gICAgICAgICAgICAgICAgZm9yIG5hbWUgaW4gW1wiTXN4bWwyLlhNTEhUVFAuNi4wXCIsIFwiTXN4bWwyLlhNTEhUVFAuMy4wXCIsIFwiTXN4bWwyLlhNTEhUVFBcIiwgXCJNaWNyb3NvZnQuWE1MSFRUUFwiXVxuICAgICAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgIHhociA9IG5ldyBBY3RpdmVYT2JqZWN0KG5hbWUpXG5cbiAgICAgICAgaWYgeGhyP1xuICAgICAgICAgICAgIyBCcm93c2VyXG4gICAgICAgICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgICAgICAgICAjIEFzeW5jXG4gICAgICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIHhoci5yZWFkeVN0YXRlIGlzIDRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHhoci5zdGF0dXMgaXMgMjAwIG9yIHhoci5zdGF0dXMgaXMgMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHhoci5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbClcbiAgICAgICAgICAgICAgICB4aHIub3BlbiAnR0VUJywgcGF0aCwgdHJ1ZVxuICAgICAgICAgICAgICAgIHhoci5zZW5kIG51bGxcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICMgU3luY1xuICAgICAgICAgICAgICAgIHhoci5vcGVuICdHRVQnLCBwYXRoLCBmYWxzZVxuICAgICAgICAgICAgICAgIHhoci5zZW5kIG51bGxcblxuICAgICAgICAgICAgICAgIGlmIHhoci5zdGF0dXMgaXMgMjAwIG9yIHhoci5zdGF0dXMgPT0gMFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geGhyLnJlc3BvbnNlVGV4dFxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBOb2RlLmpzLWxpa2VcbiAgICAgICAgICAgIHJlcSA9IHJlcXVpcmVcbiAgICAgICAgICAgIGZzID0gcmVxKCdmcycpICMgUHJldmVudCBicm93c2VyaWZ5IGZyb20gdHJ5aW5nIHRvIGxvYWQgJ2ZzJyBtb2R1bGVcbiAgICAgICAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICAgICAgICAgICMgQXN5bmNcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZSBwYXRoLCAoZXJyLCBkYXRhKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrIG51bGxcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgU3RyaW5nKGRhdGEpXG5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjIFN5bmNcbiAgICAgICAgICAgICAgICBkYXRhID0gZnMucmVhZEZpbGVTeW5jIHBhdGhcbiAgICAgICAgICAgICAgICBpZiBkYXRhP1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nKGRhdGEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbHNcbiIsIlxuUGFyc2VyID0gcmVxdWlyZSAnLi9QYXJzZXInXG5EdW1wZXIgPSByZXF1aXJlICcuL0R1bXBlcidcblV0aWxzICA9IHJlcXVpcmUgJy4vVXRpbHMnXG5cbiMgWWFtbCBvZmZlcnMgY29udmVuaWVuY2UgbWV0aG9kcyB0byBsb2FkIGFuZCBkdW1wIFlBTUwuXG4jXG5jbGFzcyBZYW1sXG5cbiAgICAjIFBhcnNlcyBZQU1MIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyBUaGUgcGFyc2UgbWV0aG9kLCB3aGVuIHN1cHBsaWVkIHdpdGggYSBZQU1MIHN0cmluZyxcbiAgICAjIHdpbGwgZG8gaXRzIGJlc3QgdG8gY29udmVydCBZQU1MIGluIGEgZmlsZSBpbnRvIGEgSmF2YVNjcmlwdCBvYmplY3QuXG4gICAgI1xuICAgICMgIFVzYWdlOlxuICAgICMgICAgIG15T2JqZWN0ID0gWWFtbC5wYXJzZSgnc29tZTogeWFtbCcpO1xuICAgICMgICAgIGNvbnNvbGUubG9nKG15T2JqZWN0KTtcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBpbnB1dCAgICAgICAgICAgICAgICAgICBBIHN0cmluZyBjb250YWluaW5nIFlBTUxcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMsIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RGVjb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBkZXNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtPYmplY3RdICBUaGUgWUFNTCBjb252ZXJ0ZWQgdG8gYSBKYXZhU2NyaXB0IG9iamVjdFxuICAgICNcbiAgICAjIEB0aHJvdyBbUGFyc2VFeGNlcHRpb25dIElmIHRoZSBZQU1MIGlzIG5vdCB2YWxpZFxuICAgICNcbiAgICBAcGFyc2U6IChpbnB1dCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3REZWNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgcmV0dXJuIG5ldyBQYXJzZXIoKS5wYXJzZShpbnB1dCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcilcblxuXG4gICAgIyBQYXJzZXMgWUFNTCBmcm9tIGZpbGUgcGF0aCBpbnRvIGEgSmF2YVNjcmlwdCBvYmplY3QuXG4gICAgI1xuICAgICMgVGhlIHBhcnNlRmlsZSBtZXRob2QsIHdoZW4gc3VwcGxpZWQgd2l0aCBhIFlBTUwgZmlsZSxcbiAgICAjIHdpbGwgZG8gaXRzIGJlc3QgdG8gY29udmVydCBZQU1MIGluIGEgZmlsZSBpbnRvIGEgSmF2YVNjcmlwdCBvYmplY3QuXG4gICAgI1xuICAgICMgIFVzYWdlOlxuICAgICMgICAgIG15T2JqZWN0ID0gWWFtbC5wYXJzZUZpbGUoJ2NvbmZpZy55bWwnKTtcbiAgICAjICAgICBjb25zb2xlLmxvZyhteU9iamVjdCk7XG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgcGF0aCAgICAgICAgICAgICAgICAgICAgQSBmaWxlIHBhdGggcG9pbnRpbmcgdG8gYSB2YWxpZCBZQU1MIGZpbGVcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMsIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RGVjb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBkZXNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtPYmplY3RdICBUaGUgWUFNTCBjb252ZXJ0ZWQgdG8gYSBKYXZhU2NyaXB0IG9iamVjdCBvciBudWxsIGlmIHRoZSBmaWxlIGRvZXNuJ3QgZXhpc3QuXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gSWYgdGhlIFlBTUwgaXMgbm90IHZhbGlkXG4gICAgI1xuICAgIEBwYXJzZUZpbGU6IChwYXRoLCBjYWxsYmFjayA9IG51bGwsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBmYWxzZSwgb2JqZWN0RGVjb2RlciA9IG51bGwpIC0+XG4gICAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICAgICAgIyBBc3luY1xuICAgICAgICAgICAgVXRpbHMuZ2V0U3RyaW5nRnJvbUZpbGUgcGF0aCwgKGlucHV0KSA9PlxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG51bGxcbiAgICAgICAgICAgICAgICBpZiBpbnB1dD9cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gQHBhcnNlIGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgcmVzdWx0XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICMgU3luY1xuICAgICAgICAgICAgaW5wdXQgPSBVdGlscy5nZXRTdHJpbmdGcm9tRmlsZSBwYXRoXG4gICAgICAgICAgICBpZiBpbnB1dD9cbiAgICAgICAgICAgICAgICByZXR1cm4gQHBhcnNlIGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuXG5cbiAgICAjIER1bXBzIGEgSmF2YVNjcmlwdCBvYmplY3QgdG8gYSBZQU1MIHN0cmluZy5cbiAgICAjXG4gICAgIyBUaGUgZHVtcCBtZXRob2QsIHdoZW4gc3VwcGxpZWQgd2l0aCBhbiBvYmplY3QsIHdpbGwgZG8gaXRzIGJlc3RcbiAgICAjIHRvIGNvbnZlcnQgdGhlIG9iamVjdCBpbnRvIGZyaWVuZGx5IFlBTUwuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgaW5wdXQgICAgICAgICAgICAgICAgICAgSmF2YVNjcmlwdCBvYmplY3RcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIGlubGluZSAgICAgICAgICAgICAgICAgIFRoZSBsZXZlbCB3aGVyZSB5b3Ugc3dpdGNoIHRvIGlubGluZSBZQU1MXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICBpbmRlbnQgICAgICAgICAgICAgICAgICBUaGUgYW1vdW50IG9mIHNwYWNlcyB0byB1c2UgZm9yIGluZGVudGF0aW9uIG9mIG5lc3RlZCBub2Rlcy5cbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdEVuY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gdG8gc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBvcmlnaW5hbCBKYXZhU2NyaXB0IG9iamVjdFxuICAgICNcbiAgICBAZHVtcDogKGlucHV0LCBpbmxpbmUgPSAyLCBpbmRlbnQgPSA0LCBleGNlcHRpb25PbkludmFsaWRUeXBlID0gZmFsc2UsIG9iamVjdEVuY29kZXIgPSBudWxsKSAtPlxuICAgICAgICB5YW1sID0gbmV3IER1bXBlcigpXG4gICAgICAgIHlhbWwuaW5kZW50YXRpb24gPSBpbmRlbnRcblxuICAgICAgICByZXR1cm4geWFtbC5kdW1wKGlucHV0LCBpbmxpbmUsIDAsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdEVuY29kZXIpXG5cblxuICAgICMgUmVnaXN0ZXJzIC55bWwgZXh0ZW5zaW9uIHRvIHdvcmsgd2l0aCBub2RlJ3MgcmVxdWlyZSgpIGZ1bmN0aW9uLlxuICAgICNcbiAgICBAcmVnaXN0ZXI6IC0+XG4gICAgICAgIHJlcXVpcmVfaGFuZGxlciA9IChtb2R1bGUsIGZpbGVuYW1lKSAtPlxuICAgICAgICAgICAgIyBGaWxsIGluIHJlc3VsdFxuICAgICAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBZQU1MLnBhcnNlRmlsZSBmaWxlbmFtZVxuXG4gICAgICAgICMgUmVnaXN0ZXIgcmVxdWlyZSBleHRlbnNpb25zIG9ubHkgaWYgd2UncmUgb24gbm9kZS5qc1xuICAgICAgICAjIGhhY2sgZm9yIGJyb3dzZXJpZnlcbiAgICAgICAgaWYgcmVxdWlyZT8uZXh0ZW5zaW9ucz9cbiAgICAgICAgICAgIHJlcXVpcmUuZXh0ZW5zaW9uc1snLnltbCddID0gcmVxdWlyZV9oYW5kbGVyXG4gICAgICAgICAgICByZXF1aXJlLmV4dGVuc2lvbnNbJy55YW1sJ10gPSByZXF1aXJlX2hhbmRsZXJcblxuXG4gICAgIyBBbGlhcyBvZiBkdW1wKCkgbWV0aG9kIGZvciBjb21wYXRpYmlsaXR5IHJlYXNvbnMuXG4gICAgI1xuICAgIEBzdHJpbmdpZnk6IChpbnB1dCwgaW5saW5lLCBpbmRlbnQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdEVuY29kZXIpIC0+XG4gICAgICAgIHJldHVybiBAZHVtcCBpbnB1dCwgaW5saW5lLCBpbmRlbnQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdEVuY29kZXJcblxuXG4gICAgIyBBbGlhcyBvZiBwYXJzZUZpbGUoKSBtZXRob2QgZm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucy5cbiAgICAjXG4gICAgQGxvYWQ6IChwYXRoLCBjYWxsYmFjaywgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcikgLT5cbiAgICAgICAgcmV0dXJuIEBwYXJzZUZpbGUgcGF0aCwgY2FsbGJhY2ssIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcblxuXG4jIEV4cG9zZSBZQU1MIG5hbWVzcGFjZSB0byBicm93c2VyXG53aW5kb3c/LllBTUwgPSBZYW1sXG5cbiMgTm90IGluIHRoZSBicm93c2VyP1xudW5sZXNzIHdpbmRvdz9cbiAgICBAWUFNTCA9IFlhbWxcblxubW9kdWxlLmV4cG9ydHMgPSBZYW1sXG4iXX0=
