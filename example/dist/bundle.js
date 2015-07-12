require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"arsenic":[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var Arsenic = _react2['default'].createClass({
  displayName: 'Arsenic',

  propTypes: {
    width: _react.PropTypes.number,
    height: _react.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      directionX: -1, // -1:left;0:random;1:right
      directionY: -1, // -1:up;0:random;1:down
      velocityX: [.1, .2], // [minX,maxX]
      velocityY: [.5, 1], // [minY,maxY]
      bounceX: true, // bounce at left and right edge
      bounceY: false, // bounce at top and bottom edge
      parallax: .2, // float [0-1...]; 0: no paralax
      pivot: 0, // float [0-1...]; 0: no paralax
      density: 6000, // px^2 per node
      dotRadius: [1, 5], // px value or [minR,maxR]
      //backgroundColor: 'rgba(9,9,9,1)',   // default transparent; use alpha value for motion blur and ghosting
      //dotColor: 'rgba(99,99,99,.5)',
      linkColor: 'rgba(99,99,99,.8)',
      linkDistance: 50,
      linkWidth: 2
    };
  },

  componentDidMount: function componentDidMount() {
    var _this = this;

    var canvas = _react2['default'].findDOMNode(this);
    if (canvas.tagName != 'CANVAS') return;

    var options = this.props;

    var ctx = this._ctx = canvas.getContext('2d', {
      alpha: !options.backgroundColor
    });
    var tilt = {
      x: 0,
      y: 0
    };
    var _, w, h;

    var update = function update() {

      if (options.backgroundColor) {
        ctx.fillStyle = options.backgroundColor;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = options.dotColor;
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      ctx.beginPath();

      for (var i = 0, p, x, y; i < _.length; i++) {
        p = _[i];

        /* MOVE */
        p.x += p.vx;
        p.y += p.vy;

        /* POSITION */
        if (options.parallax) {
          var fac = p.z * options.parallax;
          p.dx += (tilt.x * fac - p.dx) / 10;
          p.dy += (tilt.y * fac - p.dy) / 10;
        }

        x = p.x + p.dx;
        y = p.y + p.dy;

        if (x < 0 || x > w) options.bounceX ? p.vx = -p.vx : p.x = (x + w) % w - p.dx;

        if (y < 0 || y > h) options.bounceY ? p.vy = -p.vy : p.y = (y + h) % h - p.dy;

        /* DRAW */
        ctx.moveTo(x + p.r, y);
        ctx.arc(x, y, p.r, 0, Math.PI * 2);

        // loop back no double connections
        for (var j = i - 1; j >= 0; j--) {
          var q = _[j],
              dx = q.x - p.x,
              dy = q.y - p.y,
              dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < options.linkDistance) {
            var x = p.x + p.dx,
                y = p.y + p.dy,
                x2 = q.x + q.dx,
                y2 = q.y + q.dy,
                a = Math.atan2(y2 - y, x2 - x),
                cos = Math.cos(a),
                sin = Math.sin(a);

            x += p.r * cos;
            y += p.r * sin;
            x2 -= q.r * cos;
            y2 -= q.r * sin;

            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
          }
        }
      };
      ctx.stroke();
      options.dotColor && ctx.fill();

      requestAnimationFrame(update);
    };

    function onMousemove(ev) {
      tilt.x = ev.pageX - window.innerWidth / 2;
      tilt.y = ev.pageY - window.innerHeight / 2;
    }

    function onOrientation(ev) {
      tilt.x = Math.min(Math.max(-ev.gamma, -30), 30) * (window.innerWidth / 30);
      tilt.y = Math.min(Math.max(-ev.beta, -30), 30) * (window.innerHeight / 30);
    }

    var onResize = this._refresh = function () {
      _ = _this._ = _this._ || [];

      var radius = [].concat(options.dotRadius);
      if (radius.length == 1 || radius[0] == radius[1]) {
        radius = radius[0];
      };
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;

      var vx = options.velocityX,
          vy = options.velocityY,
          random = Math.random;

      var num = Math.ceil(w * h / options.density);

      for (var i = _.length - 1; i >= 0; i--) if (_[i].x > w || _[i].y > h) _.splice(i, 1);

      if (num < _.length) _.splice(num);

      while (num > _.length) {
        var r = random();
        _.push({
          // position
          z: (r - options.pivot) / 4, //z
          r: radius[1] ? r * (radius[1] - radius[0]) + radius[0] : radius,
          x: Math.ceil(random() * w),
          y: Math.ceil(random() * h),
          //  velocity: (random)direction * clamped random velocity
          vx: (options.directionX || (random() > .5 ? 1 : -1)) * (random() * (vx[1] - vx[0]) + vx[0]),
          vy: (options.directionY || (random() > .5 ? 1 : -1)) * (random() * (vy[1] - vy[0]) + vy[0]),
          // offset
          dx: 0,
          dy: 0
        });
      }

      ctx.strokeStyle = options.linkColor;
      ctx.lineWidth = options.linkWidth;
      ctx.fillStyle = options.dotColor;
    };

    window.addEventListener('resize', onResize, false);
    document.addEventListener('mousemove', onMousemove, false);
    window.addEventListener('deviceorientation', onOrientation, false);
    onResize();
    update();
  },

  render: function render() {
    return _react2['default'].createElement('canvas', this.props);
  }

});

module.exports = Arsenic;

},{"react":undefined}]},{},[]);
