const stopThresholdDefault = 0.3;
const bounceDeceleration = 0.04;
const bounceAcceleration = 0.30;

function init(_ref) {
  var _ref$source = _ref.source;
  var sourceEl = _ref$source === undefined ? document : _ref$source;
  var updateCallback = _ref.update;
  var _ref$multiplier = _ref.multiplier;
  var multiplier = _ref$multiplier === undefined ? 1 : _ref$multiplier;
  var _ref$friction = _ref.friction;
  var friction = _ref$friction === undefined ? 0.92 : _ref$friction;
  var initialValues = _ref.initialValues;
  var boundX = _ref.boundX;
  var boundY = _ref.boundY;
  var _ref$bounce = _ref.bounce;
  var bounce = _ref$bounce === undefined ? true : _ref$bounce;

  var boundXmin, boundXmax, boundYmin, boundYmax, pointerLastX, pointerLastY, pointerCurrentX, pointerCurrentY, pointerId, decVelX, decVelY;
  var targetX = 0;
  var targetY = 0;
  var stopThreshold = stopThresholdDefault * multiplier;
  var ticking = false;
  var pointerActive = false;
  var numberOfTicks = 0;
  var decelerating = false;
  var trackingPoints = [];

  /**
   * Initialize instance
   */
  (function init() {
      sourceEl = typeof sourceEl === 'string' ? document.querySelector(sourceEl) : sourceEl;
      if (!sourceEl) {
          throw new Error('IMPETUS: source not found.');
      }

      if (!updateCallback) {
          throw new Error('IMPETUS: update function not defined.');
      }

      if (initialValues) {
          if (initialValues[0]) {
              targetX = initialValues[0];
          }
          if (initialValues[1]) {
              targetY = initialValues[1];
          }
          callUpdateCallback();
      }

      // Initialize bound values
      if (boundX) {
          boundXmin = boundX[0];
          boundXmax = boundX[1];
      }
      if (boundY) {
          boundYmin = boundY[0];
          boundYmax = boundY[1];
      }
  })();

  /**
   * Update the current x and y values
   * @public
   * @param {Number} x
   * @param {Number} y
   */
  function setValues (x, y) {
      if (typeof x === 'number') {
          targetX = x;
      }
      if (typeof y === 'number') {
          targetY = y;
      }
  }

  /**
   * Update the multiplier value
   * @public
   * @param {Number} val
   */
  function setMultiplier (val) {
      multiplier = val;
      stopThreshold = stopThresholdDefault * multiplier;
  };

  /**
   * Update boundX value
   * @public
   * @param {Number[]} boundX
   */
  function setBoundX (boundX) {
      boundXmin = boundX[0];
      boundXmax = boundX[1];
  }

  /**
   * Update boundY value
   * @public
   * @param {Number[]} boundY
   */
  function setBoundY (boundY) {
      boundYmin = boundY[0];
      boundYmax = boundY[1];
  }

  /**
   * Executes the update function
   */
  function callUpdateCallback() {
      updateCallback.call(sourceEl, targetX, targetY);
  }

  /**
   * Initializes movement tracking
   * @param  {Object} ev Normalized event
   */
  function onDown(pointer) {
      if (!pointerActive) {
          pointerActive = true;
          decelerating = false;
          pointerId = pointer.id;

          pointerLastX = pointerCurrentX = pointer.clientX;
          pointerLastY = pointerCurrentY = pointer.clientY;
          trackingPoints = [];
          addTrackingPoint(pointerLastX, pointerLastY);
      }
  }

  /**
   * Handles move events
   * @param  {Object} ev Normalized event
   */
  function onMove(pointer) {
      if (pointerActive && pointer.id === pointerId) {
          pointerCurrentX = pointer.clientX;
          pointerCurrentY = pointer.clientY;
          addTrackingPoint(pointerLastX, pointerLastY);
          requestTick();
      }
  }

  /**
   * Handles up/end events
   * @param {Object} ev Normalized event
   */
  function onUp(pointer) {
      //var event = normalizeEvent(ev);

      if (pointerActive && pointer.id === pointerId) {
          stopTracking();
      }
  }

  /**
   * Stops movement tracking, starts animation
   */
  function stopTracking() {
      pointerActive = false;
      numberOfTicks = 0;

      addTrackingPoint(pointerLastX, pointerLastY);
      startDecelAnim();
  }

  /**
   * Records movement for the last 100ms
   * @param {number} x
   * @param {number} y [description]
   */
  function addTrackingPoint(x, y) {
      var time = Date.now();
      while (trackingPoints.length > 0) {
          if (time - trackingPoints[0].time <= 100) {
              break;
          }
          trackingPoints.shift();
      }

      trackingPoints.push({ x: x, y: y, time: time });
  }

  /**
   * Calculate new values, call update function
   */
  function updateAndRender() {
      var pointerChangeX = pointerCurrentX - pointerLastX;
      var pointerChangeY = pointerCurrentY - pointerLastY;

      targetX += pointerChangeX * multiplier;
      targetY += pointerChangeY * multiplier;

      if (bounce) {
          var diff = checkBounds();
          if (diff.x !== 0) {
              targetX -= pointerChangeX * dragOutOfBoundsMultiplier(diff.x) * multiplier;
          }
          if (diff.y !== 0) {
              targetY -= pointerChangeY * dragOutOfBoundsMultiplier(diff.y) * multiplier;
          }
      } else {
          checkBounds(true);
      }

      callUpdateCallback();

      pointerLastX = pointerCurrentX;
      pointerLastY = pointerCurrentY;
      ticking = false;
  }

  /**
   * Returns a value from around 0.5 to 1, based on distance
   * @param {Number} val
   */
  function dragOutOfBoundsMultiplier(val) {
      return 0.000005 * Math.pow(val, 2) + 0.0001 * val + 0.55;
  }

  /**
   * prevents animating faster than current framerate
   */
  function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateAndRender);
      }
      ticking = true;
  }

  /**
   * Determine position relative to bounds
   * @param {Boolean} restrict Whether to restrict target to bounds
   */
  function checkBounds(restrict) {
      var xDiff = 0;
      var yDiff = 0;

      if (boundXmin !== undefined && targetX < boundXmin) {
          xDiff = boundXmin - targetX;
      } else if (boundXmax !== undefined && targetX > boundXmax) {
          xDiff = boundXmax - targetX;
      }

      if (boundYmin !== undefined && targetY < boundYmin) {
          yDiff = boundYmin - targetY;
      } else if (boundYmax !== undefined && targetY > boundYmax) {
          yDiff = boundYmax - targetY;
      }

      if (restrict) {
          if (xDiff !== 0) {
              targetX = xDiff > 0 ? boundXmin : boundXmax;
          }
          if (yDiff !== 0) {
              targetY = yDiff > 0 ? boundYmin : boundYmax;
          }
      }

      return {
          x: xDiff,
          y: yDiff,
          inBounds: xDiff === 0 && yDiff === 0
      };
  }

  /**
   * Initialize animation of values coming to a stop
   */
  function startDecelAnim() {
      var firstPoint = trackingPoints[0];
      var lastPoint = trackingPoints[trackingPoints.length - 1];

      var xOffset = lastPoint.x - firstPoint.x;
      var yOffset = lastPoint.y - firstPoint.y;
      var timeOffset = lastPoint.time - firstPoint.time;

      var D = timeOffset / 15 / multiplier;

      decVelX = xOffset / D || 0; // prevent NaN
      decVelY = yOffset / D || 0;

      var diff = checkBounds();

      if (Math.abs(decVelX) > 1 || Math.abs(decVelY) > 1 || !diff.inBounds) {
          decelerating = true;
          requestAnimationFrame(stepDecelAnim);
      }
  }

  /**
   * Animates values slowing down
   */
  function stepDecelAnim() {
      if (!decelerating) {
          return;
      }

      numberOfTicks++;
      if(numberOfTicks >= 70) {
        decelerating = false;
      }

      decVelX *= friction;
      decVelY *= friction;

      targetX += decVelX;
      targetY += decVelY;

      var diff = checkBounds();

      if (Math.abs(decVelX) > stopThreshold || Math.abs(decVelY) > stopThreshold || !diff.inBounds) {

          if (bounce) {
              var reboundAdjust = 2.5;

              if (diff.x !== 0) {
                  if (diff.x * decVelX <= 0) {
                      decVelX += diff.x * bounceDeceleration;
                  } else {
                      var adjust = diff.x > 0 ? reboundAdjust : -reboundAdjust;
                      decVelX = (diff.x + adjust) * bounceAcceleration;
                  }
              }
              if (diff.y !== 0) {
                  if (diff.y * decVelY <= 0) {
                      decVelY += diff.y * bounceDeceleration;
                  } else {
                      var adjust = diff.y > 0 ? reboundAdjust : -reboundAdjust;
                      decVelY = (diff.y + adjust) * bounceAcceleration;
                  }
              }
          } else {
              if (diff.x !== 0) {
                  if (diff.x > 0) {
                      targetX = boundXmin;
                  } else {
                      targetX = boundXmax;
                  }
                  decVelX = 0;
              }
              if (diff.y !== 0) {
                  if (diff.y > 0) {
                      targetY = boundYmin;
                  } else {
                      targetY = boundYmax;
                  }
                  decVelY = 0;
              }
          }

          callUpdateCallback();

          requestAnimationFrame(stepDecelAnim);
      } else {
          decelerating = false;
      }
  }

  function update(data = {}) {
    if(data.move) onMove(data.move);
    if(data.down) onDown(data.down);
    if(data.up) onUp(data.up);
    if(data.boundX) setBoundX(data.boundX);
    if(data.boundY) setBoundY(data.boundY);
    if(data.x) setValues(data.x, data.y);
  }

  return update;
}

export default init;