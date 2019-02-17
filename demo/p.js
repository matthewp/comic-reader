// update Pinterest Red

((w, d, a) => {
  let $ = {
    w,
    d,
    a,
    b: chrome || browser,
    v: {
      debug: false,
      css: '',
      lang: 'en',
      detect: {}
    },
    s: {},
    f: {
      // console.log to background window
      debug: o => {
        if (o && $.v.debug) {
          console.log(o);
        }
      },
      // get a DOM property or text attribute
      get: o => {
        let r = null;
        if (typeof o.el[o.att] === 'string') {
          r = o.el[o.tt];
        } else {
          r = o.el.getAttribute(o.att);
        }
        return r;
      },
      // set a DOM property or text attribute
      set: o =>  {
        if (typeof o.el[o.att] === 'string') {
          o.el[o.att] = o.string;
        } else {
          o.el.setAttribute(o.att, o.string);
        }
      },
      // create a DOM element
      make: o => {
        let el = false, t, a, k;
        for (t in o) {
          el = $.d.createElement(t);
          for (a in o[t]) {
            if (typeof o[t][a] === 'string') {
              $.f.set({
                el: el,
                att: a,
                string: o[t][a]
              });
            } else {
              if (a === 'style') {
                for (k in o[t][a]) {
                  el.style[k] = o[t][a][k];
                }
              }
            }
          }
          break;
        }
        return el;
      },
      // send a ping from the background process to log.pinterest.com
      log: o => {
        o.a = $.v.hazLogin ? 1 : 0;
        $.f.send({
          act: 'log',
          data: o
        });
      },
      changeClass: o => {
        let i;
        if (o.el) {
          if (!o.el.length) {
            o.el = [o.el];
          }
          for (i = 0; i < o.el.length; i = i + 1) {
            if (o.el[i] && o.el[i].classList) {
              if (o.add && o.add.length) {
                o.el[i].classList.add.apply(o.el[i].classList, o.add);
              }
              if (o.remove && o.remove.length) {
                o.el[i].classList.remove.apply(o.el[i].classList, o.remove);
              }
            }
          }
        }
      },
      // return an event's target element
      getEl: e => {
        let r = e.target;
        // text node; return parent
        if (r.targetNodeType === 3) {
          r = r.parentNode;
        }
        return r;
      },
      // return moz, webkit, ms, etc
      getVendorPrefix: () => {
        let x = /^(moz|webkit|ms)(?=[A-Z])/i, r = '', p;
        for (p in $.d.b.style) {
          if (x.test(p)) {
            r = `-${p.match(x)[0].toLowerCase()}-`
            break;
          }
        }
        return r;
      },
      // send a message
      send: o => {
        o.via = $.a.k.toLowerCase();
        o.to = 'background';
        $.b.runtime.sendMessage(o, () => {});
      },
      // clean troublesome characters from strings that may be shown onscreen
      clean: o => {
        let r, fixThese;
        if (o.str) {
          // thank you: Jan Lenhart
          // https://github.com/janl/mustache.js/blob/master/mustache.js
          fixThese = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
          };
          // clean the string
          o.str = o.str.replace(/[&<>"'`=\/]/g, r => {
            return fixThese[r];
          });
          // use a DOM parser to re-render printable things
          r = new DOMParser().parseFromString(o.str, "text/html").documentElement.textContent;
        }
        return r;
      },
      // given window.navigator.language, return appropriate strings
      getStrings: () => {
        let key, k, lang = 'en';
        key = $.w.navigator.language.toLowerCase();
        // to test set key to 'ja' or similar;
        if ($.a.str[key]) {
          lang = key;
        } else {
          k = key.split('-')[0];
          if ($.a.str[k]) {
            lang = k;
          }
        }
        $.v.str = $.a.str[lang];
        // if we're missing any strings, fill with English
        for (k in $.a.str['en']) {
          if (!$.v.str[k]) {
            $.v.str[k] = $.a.str['en'][k];
          }
        }
      },
      // build stylesheet
      buildStyleSheet: () => {
        let css, rules, k, re, repl;
        css = $.f.make({'STYLE': {'type': 'text/css'}});
        rules = $.v.css;
        // each rule has our randomly-created key at its root to minimize style collisions
        rules = rules.replace(/\._/g, '.' + a.k + '_')
        // strings to replace in CSS rules
        repl = {
          '%prefix%': $.f.getVendorPrefix()
        }
        // replace everything in repl throughout rules
        for (k in repl) {
          if (repl[k].hasOwnProperty) {
            // re = new RegExp(k, 'g');
            rules = rules.replace(new RegExp(k, 'g'), repl[k]);
          }
        }
        // add rules to stylesheet
        if (css.styleSheet) {
          css.styleSheet.cssText = rules;
        } else {
          css.appendChild($.d.createTextNode(rules));
        }
        // add stylesheet to page
        if ($.d.h) {
          $.d.h.appendChild(css);
        } else {
          $.d.b.appendChild(css);
        }
        $.d.b.style.visibility = 'visible';
      },
      // recursive function to make rules out of a Sass-like object
      presentation: o => {
        // make CSS rules
        let name, i, k, pad, key, rules = '', selector = o.str || '';
        for (k in o.obj) {
          if (typeof o.obj[k] === 'string') {
            rules = `${rules}\n ${k}: ${o.obj[k]};`;
          }
          if (typeof o.obj[k] === 'object') {
            key = selector + ' ' + k;
            key = key.replace(/ &/g, '');
            key = key.replace(/,/g, `, ${selector}`);
            $.f.presentation({obj: o.obj[k], str: key});
          }
        }
        // add selector and rules to stylesheet
        if (selector && rules) {
          $.v.css = `${$.v.css}${selector} { ${rules}\n}\n`;
        }
        // if this is our root, remove from current context and make stylesheet
        if (o.obj === $.a.styles) {
          $.w.setTimeout(() => {
            $.f.buildStyleSheet();
          }, 1);
        }
      },
      // build complex structure from a JSON template
      buildOne: o => {
        let key, classNames, i, container, child, text, value;
        for (key in o.obj) {
          value = o.obj[key];
          if (typeof value === 'string') {
            // addClass may contain more than one selector
            if (key === 'addClass') {
              classNames = value.split(' ');
              for (i = 0; i < classNames.length; i = i + 1) {
                o.el.className = `${o.el.className} ${$.a.k}_${classNames[i]}`;
              }
            } else {
              if (key !== 'tag') {
                $.f.set({
                  el: o.el,
                  att: key,
                  string: value
                });
              }
            }
          } else {
            // create a new container
            container = {
              [value.tag || 'SPAN']: {
                'className': `${$.a.k}_${key}`
              }
            };
            child = $.f.make(container);
            o.el.appendChild(child);
            if (!$.s[key]) {
              $.s[key] = child;
              // fill with translated text if needed
              if ($.v.str[key]) {
                text = $.v.str[key];
                if (child.tagName === 'INPUT') {
                  // placeholder
                  child.placeholder = text;
                } else {
                  // string in non-input element
                  child.textContent = text;
                }
              }
            }
            // recurse
            $.f.buildOne({obj: value, el: child});
          }
        }
      },
      // scale an image fit in an area equal to the height of the available window by half the width of the available window
      scale: o => {
        let ratio, fitWidth, fitHeight, getFit;
        // default: use original height + width
        o.fit = {
          h: o.org.h,
          w: o.org.w
        };
        // get aspect ratios for image and container
        ratio = {
          a: o.fit.h / o.fit.w,
          b: o.lim.h / o.lim.w
        }
        // fit width; scale height
        fitWidth = () => {
          o.fit.w = o.lim.w;
          o.fit.h = o.fit.w * ratio.a;
        };
        // fit height; scale width
        fitHeight = () => {
          o.fit.h = o.lim.h;
          o.fit.w = o.fit.h / ratio.a;
        };
        // decide if we need to fit to width or height
        getFit = () => {
          if (ratio.a < ratio.b) {
            // image is proportionally wider than container
            fitWidth();
          } else {
            // image is proportionally taller than container
            fitHeight();
          }
        }
        // trivial condition: our image fits inside the container
        if (o.fit.h <= o.lim.h && o.fit.w <= o.lim.w) {
          // we're done; do nothing
        } else {
          // image size is changing
          if (ratio.a === 1) {
            // it's a square, so scale to fit the smaller side of the rectangular container
            o.fit.w = o.fit.h = Math.min(o.lim.h, o.lim.w);
          } else {
            // look at the shape of our container
            if (ratio.b === 1) {
              // square container
              if (ratio.a > 1) {
                // portrait image in square container; fit to height
                fitHeight();
              } else {
                // landscape image in square container; fit to width
                fitWidth();
              }
            } else {
              // rectangular container
              if (ratio.a > 1) {
                // portrait image
                if (ratio.b < 1) {
                  // portrait image in lansdcape container; fit to height
                  fitHeight();
                } else {
                  // portrait image in portrait container; decide if we need to fit to height or width
                  getFit();
                }
              } else {
                // landscape image
                if (ratio.b > 1) {
                  // landscape image in portrait container; fit to width
                  fitWidth();
                } else {
                  // landscape image in landscape container; decide if we need to fit to height or width
                  getFit();
                }
              }
            }
          }
        }
        $.s.backdrop.style.height = ~~o.fit.h + 'px';
        $.s.backdrop.style.width = ~~o.fit.w + 'px';
        $.s.canvas.height = o.fit.h;
        $.s.canvas.width = o.fit.w;
        $.v.ctx = $.s.canvas.getContext('2d');
        // default selection
        $.v.select = {
          x: $.a.select.handlePad,
          y: $.a.select.handlePad,
          w: o.fit.w - $.a.select.handlePad * 2,
          h: o.fit.h - $.a.select.handlePad * 2,
          limitX: o.fit.w,
          limitY: o.fit.h,
          // mode can be free, stretch, or move
          mode: 'free'
        };
        // run the callback when done
        o.fun();
      },
      // detect entities
      detect: {
        // convert rgb to hsv
        rgbToHsv: rgb => {
          let r, g, b, rr, gg, bb, h, s, v, diff, diffc;
          r = parseInt(rgb.substr(1, 1), 16) / 255;
          g = parseInt(rgb.substr(2, 1), 16) / 255;
          b = parseInt(rgb.substr(3, 1), 16) / 255;
          h, s, v = Math.max(r, g, b);
          diff = v - Math.min(r, g, b);
          diffc = n => {
            return (v - n) / 6 / diff + 1 / 2;
          };
          if (!diff) {
            h = s = 0;
          } else {
            s = diff / v;
            rr = diffc(r);
            gg = diffc(g);
            bb = diffc(b);
            if (r === v) {
              h = bb - gg;
            } else {
              if (g === v) {
                h = (1 / 3) + rr - bb;
              } else {
                if (b === v) {
                  h = (2 / 3) + gg - rr;
                }
              }
            }
            if (h < 0) {
              h = h + 1;
            } else {
              if (h > 1) {
                h = h - 1;
              }
            }
          }
          return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v / 2)
          };
        },
        // reduce resolution and separate into background vs non-background samples
        reduce: o => {
          let r, c, i, k, canvas, ctx, imageData, tempArray, pix, hex, hsv, bgCounter, colorInventoryCounter, colorInventoryObject, colorInventoryArray, mod, bgHsv;
          colorInventoryObject = {};
          colorInventoryCounter = 0;
          colorInventoryArray = [];
          mod = {
            r: [-1, 0, 1, 1, 1, 0, -1, -1],
            c: [1, 1, 1, 0, -1, -1, -1, 0]
          };
          // redraw at scaled resolution
          canvas = $.f.make({'CANVAS':{}});
          canvas.height = $.v.select.limitY;
          canvas.width = $.v.select.limitX;
          ctx = canvas.getContext('2d');
          ctx.drawImage(o.img, 0, 0, canvas.width, canvas.height);
          // get our image data
          imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          /*
            We're going to analyze a limited sample of the image; here's how:
            - swatchLimit: what is the square root of the maximum safe number of swatches we can analyze without a call stack size error?
              * for now, let's call it 80 x 80 = 6400
              * note: 71x71 = 5049
            - swatchSize: the larger of image width / swatchLimit and image height / swatchLimit
            - swatchMin: what's the miniumum size of a swatch, in case we have a tiny image to search
          */
          $.v.detect.swatchSize = Math.max(Math.min(~~(canvas.width / $.a.detect.swatchLimit), ~~(canvas.height / $.a.detect.swatchLimit)), $.a.detect.swatchMin);
          $.f.debug("Swatch size: " + $.v.detect.swatchSize);
          // sample some swatches, counting colors found along the way
          $.v.detect.sample = [];
          for (r = 0; r < canvas.height; r = r + $.v.detect.swatchSize) {
            tempArray = [];
            for (c = 0; c < canvas.width; c = c + $.v.detect.swatchSize) {
              pix = (r * canvas.width + c) * 4;
              hex = '#' + ('00' + imageData[pix].toString(16)).substr(-2,2) + ('00' + imageData[pix + 1].toString(16)).substr(-2,2) + ('00' + imageData[pix + 2].toString(16)).substr(-2,2);
              hsv = $.f.detect.rgbToHsv(hex);
              if (!colorInventoryObject[hex]) {
                colorInventoryObject[hex] = {'t': 0};
                colorInventoryCounter = colorInventoryCounter + 1;
              }
              colorInventoryObject[hex].t = colorInventoryObject[hex].t + 1;
              // we're pushing an object and not a value here because we will also set flags like isBg on the same array element
              tempArray.push({'hex': hex, 'hsv': hsv});
            }
            $.v.detect.sample.push(tempArray);
          }
          // push to an array for sorting
          for (k in colorInventoryObject) {
            colorInventoryArray.push({
              k: k,
              t: colorInventoryObject[k].t
            });
          }
          // sort so we get the most common colors on top
          colorInventoryArray.sort(
            function (a, b) {
              if (a.t < b.t) {
                return 1;
              }
              if (a.t > b.t) {
                return -1;
              }
              return 0;
            }
          );
          bgHsv = $.f.detect.rgbToHsv(colorInventoryArray[0].k);
          // tag the top $.a.detect.isBackgroundThreshold colors as background
          for (r = 0; r < $.v.detect.sample.length; r = r + 1) {
            for (c = 0; c < $.v.detect.sample[0].length; c = c + 1) {
              hex = $.v.detect.sample[r][c].hex;
              for (i = 0; i < $.a.detect.isBackgroundThreshold; i = i + 1) {
                if (hex === colorInventoryArray[i].k) {
                  $.v.detect.sample[r][c].isBg = true;
                  break;
                }
              }
              if (!$.v.detect.sample[r][c].isBg) {
                if ($.v.detect.sample[r][c].hsv.h === bgHsv.h && $.v.detect.sample[r][c].hsv.v === bgHsv.v) {
                  $.v.detect.sample[r][c].isBg = true;
                }
              }
            }
          }
          // also tag swatches that have $.a.detect.neighborScanLimit or more background neighbors
          for (r = 0; r < $.v.detect.sample.length; r = r + 1) {
            for (c = 0; c < $.v.detect.sample[0].length; c = c + 1) {
              if (!$.v.detect.sample[r][c].isBg) {
                bgCounter = 0;
                for (i = 0; i < 8; i = i + 1) {
                  var tr = r + mod.r[i];
                  var tc = c + mod.c[i];
                  if (tr > -1 && tc > -1 && tr < $.v.detect.sample.length && $.v.detect.sample[0].length) {
                    if (typeof $.v.detect.sample[tr][tc] === 'object') {
                      if ($.v.detect.sample[tr][tc].isBg) {
                        bgCounter = bgCounter + 1;
                        // bigger numbers will select smaller rectangles in noisy pages like GitHub
                        if (bgCounter > $.a.detect.neighborScanLimit) {
                          $.v.detect.sample[r][c].isBgNext = true;
                          break;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          // add swatches from bgNext array to isBg; must be done on separate pass
          for (r = 0; r < $.v.detect.sample.length; r = r + 1) {
            for (c = 0; c < $.v.detect.sample[0].length; c = c + 1) {
              if ($.v.detect.sample[r][c].isBgNext) {
                $.v.detect.sample[r][c].isBg = true;
              }
            }
          }
        },
        // using vertical/horizontal flood-fill, find the non-background area with biggest difference between top/bottom and right/left
        select: o => {
          let r, c, flood, getFloodable, getNextFloodable, getArea, whatResult, minRow, minCol, maxRow, maxCol, toGo = 0, floodMe = {}, areaFound = [], mod;
          mod = {
            r: [-1, 0, 1, 0],
            c: [0, 1, 0, -1]
          };
          // floodMe lets us detect "floodability" without constantly checking if we're on a valid sample swatch
          for (r = 0; r < $.v.detect.sample.length; r = r + 1) {
            for (c = 0; c < $.v.detect.sample[0].length; c = c + 1) {
              if (!$.v.detect.sample[r][c].isBg) {
                floodMe[r + '/' + c] = true;
                toGo = toGo + 1;
              }
            }
          }
          // minRow and minCol have been set to maximum; maxRow and maxCol have been set to zero
          flood = (r, c) => {
            let i, tr, tc;
            if (floodMe[r + '/' + c]) {
              // have we found new min/max row/col values?
              if (r < minRow) {
                minRow = r;
              }
              if (r > maxRow) {
                maxRow = r;
              }
              if (c < minCol) {
                minCol = c;
              }
              if (c > maxCol) {
                maxCol = c;
              }
              // tag this as already having been flooded, so we don't recurse it again later
              floodMe[r + '/' + c] = false;
              // decrease the master count of swatches left to flood
              toGo = toGo - 1;
              // check for neighbors that might need flooding
              for (i = 0; i < 4; i = i + 1) {
                tr = r + mod.r[i];
                tc = c + mod.c[i];
                if (floodMe[tr + '/' + tc] === true) {
                  flood(tr, tc);
                }
              }
            }
          };
          // find the next thing we can flood and start flooding it
          getFloodable = () => {
            let r, c, k;
            maxRow = 0;
            maxCol = 0;
            minRow = $.v.detect.sample.length;
            minCol = $.v.detect.sample[0].length;
            // start flooding in the first available swatch
            for (k in floodMe) {
              if (floodMe[k]) {
                r = k.split('/')[0] - 0;
                c = k.split('/')[1] - 0;
                flood(r, c);
                break;
              }
            }
          }
          // Done finding things. what's the best area to show?
          whatResult = () => {
            let a, i, k, th, tw, minSelectSize, skip;
            // we want our minimum size for dot selectors to be 2x handle length
            minSelectSize = ($.a.select.handleLength / $.v.detect.swatchSize) * 2;
            // apply some pinmarklet-ish logic to discovered areas
            for (i = areaFound.length - 1; i > -1; i = i - 1) {
              k = areaFound[i];
              areaFound[i].score = k.h * k.w;
              // don't select tiny things
              if (k.h < minSelectSize || k.w < minSelectSize) {
                areaFound.splice(i, 1);
              } else {
                th = k.h;
                tw = k.w;
                // don't select ads
                if (tw > th * 3) {
                  areaFound.splice(i, 1);
                  skip = true;
                }
                if (th > tw * 3) {
                  th = tw * 3;
                }
                if (!skip) {
                  areaFound[i].score = th * tw;
                }
              }
            }
            // sort by score
            areaFound.sort((a, b) => {
              if (a.score < b.score) {
                return 1;
              }
              if (a.score > b.score) {
                return -1;
              }
              return 0;
            });

            $.v.detect.areaFound = [areaFound][0];
            // got something!
            if (areaFound.length === 1 && areaFound[0].c === 0 && areaFound[0].r === 0) {
              $.v.select.x = areaFound[0].c * $.v.detect.swatchSize + $.a.select.handlePad;
              $.v.select.y = areaFound[0].r * $.v.detect.swatchSize + $.a.select.handlePad;
              $.v.select.h = areaFound[0].h * $.v.detect.swatchSize - ($.a.select.handlePad * 2);
              $.v.select.w = areaFound[0].w * $.v.detect.swatchSize - ($.a.select.handlePad * 2);
            } else if (areaFound.length >= 1) {
              $.v.select.x = areaFound[0].c * $.v.detect.swatchSize;
              $.v.select.y = areaFound[0].r * $.v.detect.swatchSize;
              $.v.select.h = areaFound[0].h * $.v.detect.swatchSize;
              $.v.select.w = areaFound[0].w * $.v.detect.swatchSize;
            }
            return;
          };
          // get the next area and start flooding it
          getArea = () => {
            getFloodable();
            // bump to end of execution thread so recursing finishes
            $.w.setTimeout(() => {
              areaFound.push({'h': maxRow - minRow, 'w': maxCol - minCol, 'r': minRow, 'c': minCol});
              if (toGo) {
                // lather, rinse, repeat
                getArea();
              } else {
                // return best area
                o.callback(whatResult());
              }
            }, 10);
          };
          // start getting areas
          getArea();
        }
      },
      // open the pin create form
      pop: o => {
        // what to log
        let logMe, dualScreenLeft, dualScreenTop, height, width, left, top, query;

        dualScreenLeft = $.w.screenLeft != undefined ? $.w.screenLeft : screen.left;
        dualScreenTop = $.w.screenTop != undefined ? $.w.screenTop : screen.top;

        width = $.w.outerWidth ? $.w.outerWidth : $.w.defaultStatus.documentElement.clientWidth ? $.w.defaultStatus.documentElement.clientWidth : screen.width;
        height = $.w.outerHeight ? $.w.outerHeight : $.w.defaultStatus.documentElement.clientHeight ? $.w.defaultStatus.documentElement.clientHeight : screen.height;
        left = ((width - $.a.pop.width) / 2) + dualScreenLeft;
        top = ((height - $.a.pop.height) / 2) + dualScreenTop;

        logMe = {event: 'click', xm: 'h', repin: o.id};
        query = 'https://www.pinterest.com/pin/' + o.id + '/repin/x/';

        // open pop-up window
        $.w.open(query, 'pin' + new Date().getTime(), 'status=no,resizable=yes,scrollbars=yes,personalbar=no,directories=no,location=no,toolbar=no,menubar=no,height=' + $.a.pop.height + ',width=' + $.a.pop.width + ',left=' + left + ',top=' + top);
        $.f.log(logMe);
      },
      // fulfill internal requests from DOM objects
      cmd: {
        // rerun a new image URL
        rerun: o => {
          let media = $.f.get({el: o, att: 'media'});
          if (media) {
            // log the click
            $.f.log({
              event: 'click',
              overlay: 'search',
              action: 'rerun'
            });
            $.v.xm = 'g';
            $.v.searchMe = media;
            $.f.load();
          }
        },
        // filter from an annotation
        filter: o => {
          var tation = $.f.get({el: o, att: 'tation'});
          if (tation) {
            $.v.query.data.f = tation;
            $.f.log({
              event: 'click',
              overlay: 'search',
              action: 'rerun',
              filter: tation
            });
            $.f.send($.v.query);
          }
        },
        // close the create form
        close: f => {
          // f is either a span or the boolean True
          if (f !== true) {
            f = false;
          }
          $.f.send({act: 'closeSearch', data: { keydown: f }});
        },
        // save a pin we found in results
        save: o => {
          // log the click
          $.f.log({
            event: 'click',
            overlay: 'search',
            action: 'open_create'
          });
          // open the form
          if ($.v.hazLogin) {
            $.f.send({
              act: 'openCreate',
              data: {
                media: $.f.get({el: o, att: 'media'}),
                id: $.f.get({el: o, att: 'pinId'}),
                description: $.f.get({el: o, att: 'description'}) || ''
              }
            });
          } else {
            $.f.pop({id: $.f.get({el: o, att: 'pinId'})});
          }
        },
        // visit a pin we found in results
        visit: o => {
          $.f.log({
            event: 'click',
            action: 'open_pin',
            overlay: 'search'
          });
          $.w.open('https://www.pinterest.com/pin/' + $.f.get({el: o, att: 'pinId'}), '_blank');
        }
      },
      // fulfill external requests from background process
      act: {
        showSearchError: o => {
          $.f.fail({
            failBody: o.data.message
          });
        },
        showResults: r => {
          let i, p, img, thumb, mask, ft, ftDomain, ftDesc, description, ftDeets, avatar, pinner, cc, tation, note, board, saveButton, searchButton, logMe, noteColor, anno, tate, grid, hazPreviousQuery;
          noteColor = $.a.noteColor;

          // check to see if there were annotations in the last render
          anno = $.d.getElementsByClassName(`${$.a.k}_annoHeader`)[0];
          // if so, lets remove
          if (anno !== undefined) {
            anno.remove();
          }

          // make an annotation link
          tate = o => {
            return $.f.make({'SPAN':{
              className: `${$.a.k}_annoHeader ${$.a.k}_tation`,
              innerText: o.str,
              tation: o.str,
              cmd: 'filter'
            }});
          }

          cc = 0;
          $.d.b.scrollTop = 0;
          $.f.debug('rendering Search results');
          $.f.debug(r);
          for (i = 0; i < $.v.columnCount; i = i + 1) {
            $.d.getElementById('c_' + i).innerHTML = '';
          }

          if (r.data.data && r.data.data.length) {
            $.v.search_identifier = r.data.search_identifier;
            if (r.data.url) {
              $.f.debug('Searching by data URL.');
              $.v.search_url = r.data.url;
            }

            if (r.data.annotations.length) {
              // create an element for the annotations
              anno = $.f.make({'DIV':{
                className: `${$.a.k}_annoHeader`
              }});

              grid = $.d.getElementsByClassName(`${$.a.k}_grid`)[0];
              // insert the annotations header at the front of the grid
              grid.insertBefore(anno, grid.firstChild);

              // if we have previously run a query from an annotation, place it first
              hazPreviousQuery = 0;
              if ($.v.query.data.f) {
                tation = tate({str: $.v.query.data.f});
                tation.style.backgroundColor = '#' + noteColor[0];
                anno.appendChild(tation);
                hazPreviousQuery = 1;
              }
              for (i = 0; i < r.data.annotations.length; i = i + 1) {
                // if we have already shown this annotation because we clicked on it previously, skip it
                if (r.data.annotations[i] !== $.v.query.data.f) {
                  tation = tate({str: r.data.annotations[i]});
                  tation.style.backgroundColor = '#' + noteColor[i + hazPreviousQuery];
                  anno.appendChild(tation);
                }
              }
            }

            for (i = 0; i < r.data.data.length; i = i + 1) {
              p = r.data.data[i];

              thumb = $.f.make({'DIV':{
                className: `${$.a.k}_thumb`
              }});

              img = $.f.make({'IMG':{
                src: p.image_medium_url
              }});
              thumb.appendChild(img);

              ft = $.f.make({'DIV': {
                className: `${$.a.k}_ft`
              }});

              if (p.domain) {
                ftDomain = $.f.make({'SPAN': {
                  className: `${$.a.k}_domain`,
                  innerText: p.domain
                }});
                ft.appendChild(ftDomain);
              }

              description = '';
              if (p.description && p.description.trim()) {
                description = p.description.trim();
              }
              if (p.title && p.title.trim()) {
                description = p.title.trim();
              }

              if (description) {
                ftDesc = $.f.make({'SPAN': {
                  className: `${$.a.k}_description`,
                  innerText: description
                }});
                ft.appendChild(ftDesc);
              }

              ftDeets = $.f.make({'SPAN': {
                className: `${$.a.k}_deets`
              }});

              avatar = $.f.make({'SPAN': {
                className: `${$.a.k}_avatar`
              }});

              avatar.style.backgroundImage = 'url(' + p.pinner.image_medium_url + ')';
              ftDeets.appendChild(avatar);

              pinner = $.f.make({'SPAN': {
                className: `${$.a.k}_pinner`,
                innerText: p.pinner.full_name
              }});
              ftDeets.appendChild(pinner);

              board = $.f.make({'SPAN': {
                className: `${$.a.k}_board`,
                innerText: p.board.name
              }});
              ftDeets.appendChild(board);

              ft.appendChild(ftDeets);

              thumb.appendChild(ft);

              mask = $.f.make({'DIV':{
                className: `${$.a.k}_mask`,
                cmd: 'visit',
                pinId: p.id,
                media: p.image_large_url
              }});
              thumb.appendChild(mask);

              saveButton = thumb.appendChild($.f.make({'SPAN': {
                className: `${$.a.k}_saveButton`,
                cmd: 'save',
                innerText: $.v.str.save,
                pinId: p.id,
                media: p.image_large_url,
                description: description
              }}));
              thumb.appendChild(saveButton);

              searchButton = thumb.appendChild($.f.make({'SPAN': {
                className: `${$.a.k}_searchButton`,
                cmd: 'rerun',
                media: p.image_large_url
              }}));
              thumb.appendChild(searchButton);

              // add this thumb to the right column
              $.d.getElementById('c_' + cc).appendChild(thumb);

              // next time, use the next column
              cc = (cc + 1) % $.v.columnCount;
            }
          }
        },
        populateSearch: o => {
          if (o.data && o.data.searchMe) {
            $.v.xm = o.data.method;
            $.v.hazLogin = o.data.hazLogin;
            if ($.v.hazLogin) {
              $.v.authed = 1;
            } else {
              $.v.authed = 0;
            }
            // searchMe is the URL we're going to render in the background of $.s.search
            $.v.searchMe = o.data.searchMe;
            $.f.load();
          }
        },
        query: () => {
          let scaledX, scaledY, scaledW, scaledH, query, downImg, downImgCanvas, downImgCanvasContext, addHeight, addWidth, newY, newX;

          scaledX = $.v.select.x / $.v.select.limitX;
          scaledY = $.v.select.y / $.v.select.limitY;
          scaledW = $.v.select.w / $.v.select.limitX;
          scaledH = $.v.select.h / $.v.select.limitY;

          // if selector is less than the minimum, force the query size to be the minimum
          if ($.v.select.h < $.a.select.minimum) {
            addHeight = ($.a.select.minimum - $.v.select.h) / 2;
            // find the new Y axis
            newY = $.v.select.y - addHeight;
            // check that the selector Y axis is within the limits
            // is not within limits
            if ($.v.select.y <= $.v.select.limitY - $.a.select.minimum) {
              scaledH = $.a.select.minimum / $.v.select.limitY;
              if (newY <= 0) {
                // if minY is less than 0, then just let it be 0
                scaledY = 0;
              } else {
                // if Y axis is outside of its limits
                scaledY = newY / $.v.select.limitY;
              }
            // is within limits
            } else if ($.v.select.y > $.v.select.h - $.a.select.minimum) {
              scaledY = newY / $.v.select.limitY;
            }
          }

          // if selector width is less than limit - do the same thing as above
          if ($.v.select.w < $.a.select.minimum) {
            addWidth = ($.a.select.minimum - $.v.select.w) / 2;
            newX = $.v.select.x - addWidth;
            if ($.v.select.x <= $.v.select.limitX - $.a.select.minimum) {
              scaledW = $.a.select.minimum / $.v.select.limitX;
              if (newX <= 0) {
                scaledX = 0;
              } else {
                scaledX = newX / $.v.select.limitX;
              }
            } else if ($.v.select.x > $.v.select.w - $.a.select.minimum) {
              scaledX = newX / $.v.select.limitX;
            }
          }

          if (scaledY < 0) {
            scaledY = 0;
          }
          if (scaledX < 0) {
            scaledX = 0;
          }
          if (scaledH > 1) {
            scaledH = 1;
          }
          if (scaledW > 1) {
            scaledW = 1;
          }

          $.v.query = {
            act: 'runSearch',
            data: {
              x: scaledX,
              y: scaledY,
              w: scaledW,
              h: scaledH
            }
          };

          if ($.v.search_url) {
            $.v.query.data.u = $.v.search_url;
          } else {
            // r = right-click, which is screenshot
            if ($.v.xm !== 'r') {
              // we might be hovering over a data: URI
              if ($.v.searchMe.match(/^data/)) {
                $.v.query.data.img = $.v.searchMe;
              } else {
                $.v.query.data.u = $.v.searchMe;
              }
            } else {
              // it's a screenshot
              $.v.query.data.img = $.v.searchMe;
            }
          }
          if ($.v.query.data.img) {
            // downsize if our data:URI is larger than $.a.searchResolution in either dimension
            // our select position and size will still work because they are all between 0 and 1
            downImg = new Image();
            downImg.onload = () => {
              if (downImg.naturalHeight > $.a.searchResolution || downImg.naturalWidth > $.a.searchResolution) {
                downImgCanvas = $.d.createElement('CANVAS');
                downImgCanvas.height = $.a.searchResolution;
                downImgCanvas.width = $.a.searchResolution;
                downImgCanvasContext = downImgCanvas.getContext('2d');
                downImgCanvasContext.drawImage(downImg, 0, 0, $.a.searchResolution, $.a.searchResolution);
                // remember: convert the canvas, not the context
                $.v.query.data.img = downImgCanvas.toDataURL();
              }
              $.f.send($.v.query);
            };
            downImg.src = $.v.query.data.img;
          } else {
            $.f.send($.v.query);
          }
        }
      },
      // watch for key events
      keydown: e => {
        switch (e.keyCode) {
          case 27:
            // escape
            $.f.cmd.close(true);
            break;
          default:
        }
      },
      // watch for click events
      click: e => {
        let el, cmd;
        el = $.f.getEl(e);
        cmd = $.f.get({el: el, att: 'cmd'});
        if (cmd && typeof $.f.cmd[cmd] === 'function') {
          // always pass the element that was clicked to its handler
          $.f.cmd[cmd](el);
          return;
        }
      },
      // search has returned an error
      fail: o => {
        $.s.failBody.innerText = $.f.clean({str: o.failBody});
        $.s.main.className += ` ${$.a.k}_hazFail`;
      },
      // draw the selector
      select: () => {
        let dotX, dotY, dotH, dotW, i, x, y;
        // clear everything
        $.v.ctx.clearRect(0, 0, $.v.select.limitX, $.v.select.limitY);
        $.v.ctx.fillStyle = "rgba(0,0,0,.50)";
        // outer translucent shape: draw a line around the entire canvas
        $.v.ctx.beginPath();
        $.v.ctx.moveTo(0,0);
        $.v.ctx.lineTo($.v.select.limitX, 0);
        $.v.ctx.lineTo($.v.select.limitX, $.v.select.limitY);
        $.v.ctx.lineTo(0, $.v.select.limitY);
        $.v.ctx.closePath();
        // inner transparent shape: only the selected area
        $.v.ctx.moveTo($.v.select.x, $.v.select.y);
        $.v.ctx.lineTo($.v.select.x + $.v.select.w, $.v.select.y);
        $.v.ctx.lineTo($.v.select.x + $.v.select.w, $.v.select.y + $.v.select.h);
        $.v.ctx.lineTo($.v.select.x, $.v.select.y + $.v.select.h);
        $.v.ctx.closePath();
        // fill the area outside the selected box with 50% black
        $.v.ctx.fill('evenodd');
        // start working on selector handles
        $.v.ctx.lineWidth = $.a.select.handleWidth;
        $.v.ctx.lineCap = "round";
        $.v.ctx.strokeStyle = $.a.select.handleColor;
        // the horizontal lines
        $.v.ctx.beginPath();
        // top side
        $.v.ctx.moveTo($.v.select.x, $.v.select.y);
        $.v.ctx.lineTo($.v.select.x + $.v.select.w, $.v.select.y);
        // bottom side
        $.v.ctx.moveTo($.v.select.x, $.v.select.y + $.v.select.h);
        $.v.ctx.lineTo($.v.select.x + $.v.select.w, $.v.select.y + $.v.select.h);
        // style the line so it has exactly two dashes, spaced so they appear at the beginning and end
        if ($.v.select.w < $.a.select.handleLength * 2) {
          $.v.ctx.setLineDash([$.a.select.handleLength, 0]);
        } else {
          $.v.ctx.setLineDash([$.a.select.handleLength, $.v.select.w - $.a.select.handleLength * 2]);
        }
        // draw it
        $.v.ctx.stroke();
        // the vertical lines
        $.v.ctx.beginPath();
        // left side
        $.v.ctx.moveTo($.v.select.x, $.v.select.y);
        $.v.ctx.lineTo($.v.select.x, $.v.select.y + $.v.select.h);
        $.v.ctx.setLineDash([$.a.select.handleLength, $.v.select.y + $.v.select.h - $.a.select.handleLength * 2]);
        // right side
        $.v.ctx.moveTo($.v.select.x + $.v.select.w, $.v.select.y);
        $.v.ctx.lineTo($.v.select.x + $.v.select.w, $.v.select.y + $.v.select.h);
        // style the line so it has exactly two dashes, spaced so they appear at the beginning and end
        if ($.v.select.h < $.a.select.handleLength * 2) {
          $.v.ctx.setLineDash([$.a.select.handleLength, 0]);
        } else {
          $.v.ctx.setLineDash([$.a.select.handleLength, $.v.select.h - $.a.select.handleLength * 2]);
        }
        // draw it
        $.v.ctx.stroke();
        // find the x and y coordindates of all interesting objects and draw white dots
        if ($.v.detect.areaFound && $.v.detect.areaFound.length > 1) {
          $.v.detect.dotCoords = [];
          for (i = 0; i < $.v.detect.areaFound.length; i++) {
            dotX = $.v.detect.areaFound[i].c * $.v.detect.swatchSize;
            dotY = $.v.detect.areaFound[i].r * $.v.detect.swatchSize;
            dotH = $.v.detect.areaFound[i].h * $.v.detect.swatchSize;
            dotW = $.v.detect.areaFound[i].w * $.v.detect.swatchSize;
            // x and y axis of center of dot
            x = dotX + (dotW/2);
            y = dotY + (dotH/2);
            $.v.detect.dotCoords.push([x,y]);
            // draw dots
            $.v.ctx.closePath();
            $.v.ctx.beginPath();
            $.v.ctx.arc(x, y, 7, 0, (2 * Math.PI));
            $.v.ctx.fillStyle = '#ffffff';
            $.v.ctx.fill();
          }
        }
      },
      // update the selector
      update: o => {
        let i, overEl, rect, canvasRect;
        // what element are we over right now?
        overEl = $.f.getEl(o.e);
        // get canvas position
        canvasRect = $.s.canvas.getBoundingClientRect();
        // find cursor position over canvas
        $.v.canvasX = (o.e.clientX - canvasRect.left);
        $.v.canvasY = (o.e.clientY - canvasRect.top);
        // always reset canvas classname, to show the right cursor if we're not over it
        $.s.canvas.className = $.a.k + '_canvas';

        // mouse actions
        switch (o.act) {
          // mouse down
          case 'down':
            if (overEl === $.s.canvas) {
              // if we're over the canvas, do whatever we have cued up in nextMode
              $.v.select.mode = $.v.select.nextMode;
              // after that, our next mode will always be free
              $.v.select.nextMode = 'free';

              // if a dot is clicked, check the id and redraw the select box
              if (typeof $.v.selectedDot === 'number') {
                $.v.select.x = $.v.detect.areaFound[$.v.selectedDot].c * $.v.detect.swatchSize;
                $.v.select.y = $.v.detect.areaFound[$.v.selectedDot].r * $.v.detect.swatchSize;
                $.v.select.h = $.v.detect.areaFound[$.v.selectedDot].h * $.v.detect.swatchSize;
                $.v.select.w = $.v.detect.areaFound[$.v.selectedDot].w * $.v.detect.swatchSize;
                // log the click
                $.f.log({
                  event: 'click',
                  overlay: 'search',
                  action: 'hint'
                });
                $.f.select();
                $.f.act.query();
              }
            }

            break;
          // mouse up
          case 'up':
              // if we are stretching or moving
              switch ($.v.select.mode) {
                case 'stretch':
                case 'move':
                  // log the click
                  $.f.log({
                    event: 'click',
                    overlay: 'search',
                    action: 'resize'
                  });
                  $.f.act.query();
                  break;
                default:
              }
              // ready for next action
              $.v.select.mode = 'free';
            break;
          // mouse move
          default:
            // move does several things, depending on what mode we're in
            switch ($.v.select.mode) {
              // start a new selection
              case 'init':
                  // set initial x and y, and start stretching to the southeast
                  $.v.select.x = $.v.canvasX;
                  $.v.select.y = $.v.canvasY;
                  // save the initial reference point
                  $.v.select.start = {
                    x: $.v.select.x,
                    y: $.v.select.y
                  };
                  // from now on we're stretching a 0x0 selection
                  $.v.select.mode = 'stretch';
                break;
              // stretch an existing selection
              case 'stretch':
                  // don't go outside the window
                  if ($.v.canvasX < 0) {
                    $.v.canvasX = 0;
                  } else {
                    if ($.v.canvasX > $.v.select.limitX) {
                      $.v.canvasX = $.v.select.limitX;
                    }
                  }
                  if ($.v.canvasY < 0) {
                    $.v.canvasY = 0;
                  } else {
                    if ($.v.canvasY > $.v.select.limitY) {
                      $.v.canvasY = $.v.select.limitY;
                    }
                  }
                  // if we went negative, swap things around
                  $.v.select.w = $.v.canvasX - $.v.select.start.x;
                  if ($.v.select.w < 0) {
                    $.v.select.x = $.v.canvasX;
                    $.v.select.w = Math.abs($.v.select.w);
                  }
                  $.v.select.h = $.v.canvasY - $.v.select.start.y;
                  if ($.v.select.h < 0) {
                    $.v.select.y = $.v.canvasY;
                    $.v.select.h = Math.abs($.v.select.h);
                  }
                  // update our visible selection
                  $.f.select();
                break;
              // move an existing selection
              case 'move':
                  // test new x, y, h, and w parameters
                  $.v.select.x = $.v.canvasX - $.v.select.move.x;
                  // don't go outside the canvas
                  if ($.v.select.x < 0) {
                    $.v.select.x = 0;
                  } else {
                    if ($.v.select.x + $.v.select.w > $.v.select.limitX) {
                      $.v.select.x = $.v.select.limitX - $.v.select.w;
                    }
                  }
                  $.v.select.y = $.v.canvasY - $.v.select.move.y;
                  if ($.v.select.y < 0) {
                    $.v.select.y = 0;
                  } else {
                    if ($.v.select.y + $.v.select.h > $.v.select.limitY) {
                      $.v.select.y = $.v.select.limitY - $.v.select.h;
                    }
                  }
                  // update our visible selection
                  $.f.select();
                break;
              // we're moving around with mouse down
              default:
                // only worry about the cursor if we're over the canvas
                if (overEl === $.s.canvas) {
                  // we're not in stretch or move mode, so be ready to start a new selector
                  $.v.select.nextMode = 'init';

                  // are we over a dot?
                  rect = $.s.canvas.getBoundingClientRect();
                  $.v.selectedDot = null;
                  if ($.v.detect.dotCoords) {
                    for (i = 0; i < $.v.detect.dotCoords.length; i++) {
                      if (o.e.clientX < ($.v.detect.dotCoords[i][0] + rect.left + 10)) {
                        if (o.e.clientX > ($.v.detect.dotCoords[i][0] + rect.left - 10)) {
                          if (o.e.clientY < ($.v.detect.dotCoords[i][1] + rect.top + 10)) {
                            if (o.e.clientY > ($.v.detect.dotCoords[i][1] + rect.top - 10)) {
                               $.f.changeClass({el: $.s.canvas, add: [$.a.k + '_move', $.a.k + '_onDot']});
                               $.v.selectedDot = i;
                               break;
                            }
                          }
                        }
                      }
                    }
                  }
                  // do we need to change our cursor?
                  if ($.v.canvasX > $.v.select.x) {
                    if ($.v.canvasX < $.v.select.x + $.v.select.w) {
                      if ($.v.canvasY > $.v.select.y) {
                        if ($.v.canvasY < $.v.select.y + $.v.select.h) {
                          // we're inside the selected area; show the move cursor
                          $.f.changeClass({el: $.s.canvas, add: [$.a.k + '_move']});
                          $.v.select.nextMode = 'move';
                          // note the x/y position inside the already selected area
                          // so we can move the selected box without jumping around
                          $.v.select.move = {
                            x: $.v.canvasX - $.v.select.x,
                            y: $.v.canvasY - $.v.select.y
                          };
                          // see if we're over one of the handles on the left side
                          if ($.v.canvasX < $.v.select.x + $.a.select.handleLength) {
                            // see if we're over the northwest handle
                            if ($.v.canvasY < $.v.select.y + $.a.select.handleLength) {
                              $.f.changeClass({el: $.s.canvas, add: [$.a.k + '_nw']});
                              // be ready to stretch on mousedown
                              $.v.select.start = {
                                x: $.v.select.x + $.v.select.w,
                                y: $.v.select.y + $.v.select.h
                              };
                              $.v.select.nextMode = 'stretch';
                            }
                            // see if we're over the southwest handle
                            if ($.v.canvasY > $.v.select.y + $.v.select.h - $.a.select.handleLength) {
                              $.f.changeClass({el: $.s.canvas, add: [$.a.k + '_sw']});
                              // be ready to stretch on mousedown
                              $.v.select.start = {
                                x: $.v.select.x + $.v.select.w,
                                y: $.v.select.y
                              };
                              $.v.select.nextMode = 'stretch';
                            }
                          }
                          // see if we're over one of the handles on the right side
                          if ($.v.canvasX > $.v.select.x + $.v.select.w - $.a.select.handleLength) {
                            // see if we're over the northeast handle
                            if ($.v.canvasY < $.v.select.y + $.a.select.handleLength) {
                              $.f.changeClass({el: $.s.canvas, add: [$.a.k + '_ne']});
                              // be ready to stretch on mousedown
                              $.v.select.start = {
                                x: $.v.select.x,
                                y: $.v.select.y + $.v.select.h
                              };
                              $.v.select.nextMode = 'stretch';
                            }
                            // see if we're over the southeast handle
                            if ($.v.canvasY > $.v.select.y + $.v.select.h - $.a.select.handleLength) {
                              $.f.changeClass({el: $.s.canvas, add: [$.a.k + '_se']});
                              // be ready to stretch on mousedown
                              $.v.select.start = {
                                x: $.v.select.x,
                                y: $.v.select.y
                              };
                              $.v.select.nextMode = 'stretch';
                            }
                          }
                        }
                      }
                    }
                  }
                }
              break;
            }
          break;
        }
      },
      // load the image to be searched
      load: o => {
        let img, dim, callback;

        img = new Image();
        img.onload = () => {
          callback = () => {
            let gridLeft, i, col, runMe;
            // show image resized for searching
            $.s.backdrop.style.backgroundImage = 'url("' + img.src + '")';
            // initialize our selector
            if ($.v.xm === 'r') {
              // search a screenshot
              $.f.detect.reduce({img: img});
              $.f.detect.select({callback: () => {
                $.f.select();
                $.f.act.query();
                // log the render
                $.f.log({
                  event: 'render',
                  overlay: 'search',
                  action: 'screenshot'
                });
              }});
            } else {
              // search an image
              $.f.select();
              $.f.act.query();
              // log the render
              $.f.log({
                event: 'render',
                overlay: 'search',
                action: 'image'
              });
            }

            gridLeft = $.v.select.limitX + $.a.contentPad;
            $.s.grid.style.left = gridLeft + 'px';

            $.v.columnCount = ~~(($.w.innerWidth - gridLeft)  / $.a.thumbWidth) ;
            if (!$.v.columnCount) {
              $.v.columnCount = 1;
            }
            $.s.grid.style.width = $.v.columnCount * $.a.thumbWidth + 'px';
            $.s.bd.style.width = $.v.select.limitX + 40 + ($.v.columnCount * $.a.thumbWidth) + 'px';
            for (i = 0; i < $.v.columnCount; i = i + 1) {
              col = $.d.createElement('DIV');
              col.className =  $.a.k + '_col';
              col.id = 'c_' + i;
              $.s.grid.appendChild(col);
            }
            $.f.debug('Search grid rendered.');
          };
          // this gets us $.v.dim.fit.h and $.v.dim.fit.w, which will be important for moving the selector box around later
          $.f.scale({
            fun: callback,
            lim: {
              // 128 here is search.top * 2
              h: $.w.innerHeight - 128,
              w: $.w.innerWidth / 2
            },
            org: {
              h: img.height,
              w: img.width
            }
          });
        };
        $.s.grid.innerHTML = '';
        img.src = $.v.searchMe;
      },
      // start here
      init: () => {
        $.d.b = $.d.getElementsByTagName('BODY')[0];
        // don't do anything if you can't find document.body
        if ($.d.b) {
          // don't allow right-click menus unless we are in debug mode
          if (!$.v.debug) {
            $.d.addEventListener('contextmenu', event => event.preventDefault());
          }
          // avoid flash-of-unstyled-content
          $.d.b.style.visibility = 'hidden';
          // we'll add CSS to document.head
          $.d.h = $.d.getElementsByTagName('HEAD')[0];
          // get the right strings for navigator.language
          $.f.getStrings();
          // build stylesheet
          $.f.presentation({obj: $.a.styles});
          // listen for clicks and keystrokes
          $.d.addEventListener('keydown', $.f.keydown);
          $.d.b.addEventListener('click', $.f.click);
          // listen on document.body so we can do the right thing when we mouse outside the canvas
          $.d.b.addEventListener('mousedown', e => {
            $.f.update({e: e, act: 'down'});
          });
          $.d.b.addEventListener('mouseup', e => {
            $.f.update({e: e, act: 'up'});
          });
          $.d.b.addEventListener('mousemove', e => {
            $.f.update({e: e, act: 'move'});
          });
          // if an incoming message from script is for us and triggers a valid function, run it
          $.b.runtime.onMessage.addListener( r => {
            if (r.to && r.to === $.a.k.toLowerCase()) {
              if (r.act && typeof $.f.act[r.act] === 'function') {
                $.f.act[r.act](r);
              }
            }
          });
          $.f.buildOne({obj: $.a.structure, el: $.d.b});
          // freshen boards
          $.f.send({act: 'getBoards'});
        }
      }
    }
  };
  $.w.addEventListener('load', () => {
    // get debug flag from local storage and then init
    $.b.storage.local.get('debug', r => {
      $.v.debug = r.debug;
      $.f.init();
    });
  });
})(window, document, {
  k: 'SEARCH',
  noteColor: [
    'F13535',
    'E2780D',
    '0FA573',
    '0A6955',
    '364A4C',
    '133A5E',
    '09569D',
    '0084FF',
    'B469EB',
    '8546A5',
    '5B2677',
    '6E0F3C'
  ],
  pop: {
    height: 650,
    width: 800
  },
  // downsize screenshots to this value
  searchResolution: 512,
  // support the entity autodetect function in $.f.detect
  detect: {
    // what's the largest number of swatches per side?
    swatchLimit: 64,
    // what's the minimum size per swatch?
    swatchMin: 2,
    // how many neighbors should we look at to determine contiguous areas?
    neighborScanLimit: 1,
    // how many background-colored neighbors shoudl we look for to determine whether a swatch is background?
    isBackgroundThreshold: 3
  },
  select: {
    // default distance from image corners for initial render
    handlePad: 20,
    // line width
    handleWidth: 6,
    // line length
    handleLength: 25,
    // color
    handleColor: '#fff',
    //minimum selector size for query
    minimum: 150
  },
  contentPad: 80,
  thumbWidth: 220,
  // our structure
  structure: {
    main: {
      hd: {
        headerMessage: {},
        x: {
          cmd: 'close'
        }
      },
      bd: {
        search: {
          backdrop: {
            canvas: {
              tag: 'CANVAS'
            }
          }
        },
        grid: {}
      },
      fail: {
        failBox: {
          failHeader: {
            failHeaderMsg: {},
            xFail: {
              cmd: 'close'
            }
          },
          failBody: {}
        }
      }
    }
  },
  // a SASS-like object to be turned into stylesheets
  styles: {
    'body': {
      'background': '#fff',
      'margin': '0',
      'padding': '0',
      'font-family': '"Helvetica Neue", Helvetica, "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", メイリオ, Meiryo, "ＭＳ Ｐゴシック", arial, sans-serif',
      '%prefix%font-smoothing': 'antialiased',
      '-moz-osx-font-smoothing': 'grayscale',
      '%prefix%user-select': 'none'
    },
    '*': {
      '%prefix%box-sizing': 'border-box'
    },
    '._main': {
      '._hd': {
        'background': '#fff url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzJweCIgd2lkdGg9IjMycHgiIHZpZXdCb3g9IjAgMCAzMCAzMCI+PGc+PHBhdGggZD0iTTI5LjQ0OSwxNC42NjIgQzI5LjQ0OSwyMi43MjIgMjIuODY4LDI5LjI1NiAxNC43NSwyOS4yNTYgQzYuNjMyLDI5LjI1NiAwLjA1MSwyMi43MjIgMC4wNTEsMTQuNjYyIEMwLjA1MSw2LjYwMSA2LjYzMiwwLjA2NyAxNC43NSwwLjA2NyBDMjIuODY4LDAuMDY3IDI5LjQ0OSw2LjYwMSAyOS40NDksMTQuNjYyIiBmaWxsPSIjZmZmIj48L3BhdGg+PHBhdGggZD0iTTE0LjczMywxLjY4NiBDNy41MTYsMS42ODYgMS42NjUsNy40OTUgMS42NjUsMTQuNjYyIEMxLjY2NSwyMC4xNTkgNS4xMDksMjQuODU0IDkuOTcsMjYuNzQ0IEM5Ljg1NiwyNS43MTggOS43NTMsMjQuMTQzIDEwLjAxNiwyMy4wMjIgQzEwLjI1MywyMi4wMSAxMS41NDgsMTYuNTcyIDExLjU0OCwxNi41NzIgQzExLjU0OCwxNi41NzIgMTEuMTU3LDE1Ljc5NSAxMS4xNTcsMTQuNjQ2IEMxMS4xNTcsMTIuODQyIDEyLjIxMSwxMS40OTUgMTMuNTIyLDExLjQ5NSBDMTQuNjM3LDExLjQ5NSAxNS4xNzUsMTIuMzI2IDE1LjE3NSwxMy4zMjMgQzE1LjE3NSwxNC40MzYgMTQuNDYyLDE2LjEgMTQuMDkzLDE3LjY0MyBDMTMuNzg1LDE4LjkzNSAxNC43NDUsMTkuOTg4IDE2LjAyOCwxOS45ODggQzE4LjM1MSwxOS45ODggMjAuMTM2LDE3LjU1NiAyMC4xMzYsMTQuMDQ2IEMyMC4xMzYsMTAuOTM5IDE3Ljg4OCw4Ljc2NyAxNC42NzgsOC43NjcgQzEwLjk1OSw4Ljc2NyA4Ljc3NywxMS41MzYgOC43NzcsMTQuMzk4IEM4Ljc3NywxNS41MTMgOS4yMSwxNi43MDkgOS43NDksMTcuMzU5IEM5Ljg1NiwxNy40ODggOS44NzIsMTcuNiA5Ljg0LDE3LjczMSBDOS43NDEsMTguMTQxIDkuNTIsMTkuMDIzIDkuNDc3LDE5LjIwMyBDOS40MiwxOS40NCA5LjI4OCwxOS40OTEgOS4wNCwxOS4zNzYgQzcuNDA4LDE4LjYyMiA2LjM4NywxNi4yNTIgNi4zODcsMTQuMzQ5IEM2LjM4NywxMC4yNTYgOS4zODMsNi40OTcgMTUuMDIyLDYuNDk3IEMxOS41NTUsNi40OTcgMjMuMDc4LDkuNzA1IDIzLjA3OCwxMy45OTEgQzIzLjA3OCwxOC40NjMgMjAuMjM5LDIyLjA2MiAxNi4yOTcsMjIuMDYyIEMxNC45NzMsMjIuMDYyIDEzLjcyOCwyMS4zNzkgMTMuMzAyLDIwLjU3MiBDMTMuMzAyLDIwLjU3MiAxMi42NDcsMjMuMDUgMTIuNDg4LDIzLjY1NyBDMTIuMTkzLDI0Ljc4NCAxMS4zOTYsMjYuMTk2IDEwLjg2MywyNy4wNTggQzEyLjA4NiwyNy40MzQgMTMuMzg2LDI3LjYzNyAxNC43MzMsMjcuNjM3IEMyMS45NSwyNy42MzcgMjcuODAxLDIxLjgyOCAyNy44MDEsMTQuNjYyIEMyNy44MDEsNy40OTUgMjEuOTUsMS42ODYgMTQuNzMzLDEuNjg2IiBmaWxsPSIjYmQwODFjIj48L3BhdGg+PC9nPjwvc3ZnPg==) 20px 35% no-repeat',
        'color': '#333',
        'height': '68px',
        'line-height': '65px',
        'font-size': '24px',
        'font-weight': 'bold',
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'right': '0',
        'text-align': 'left',
        'text-indent': '65px',
        'cursor': 'default',
        'z-index': '2',
        '%prefix%transform': 'translateZ(0)',
        '._x': {
          'z-index': '3',
          'opacity': '.5',
          'position': 'absolute',
          'right': '25px',
          'top': '0',
          'cursor': 'pointer',
          'height': '65px',
          'width': '15px',
          'background': 'transparent url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTVweCIgd2lkdGg9IjE1cHgiIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGc+PGxpbmUgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiB4MT0iMTAiIHkxPSIxMCIgeDI9IjcwIiB5Mj0iNzAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyMCIvPjxsaW5lIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgeDE9IjcwIiB5MT0iMTAiIHgyPSIxMCIgeTI9IjcwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMjAiLz48L2c+PC9zdmc+) 50% 50% no-repeat',
          '&:hover': {
            'opacity': '1'
          }
        }
      },
      '._bd': {
        'display': 'block',
        'position': 'relative',
        'margin': '0',
        'text-align': 'left',
        'padding-top': '10px',
        'height': '100vh',
        '._saveButton': {
          'position': 'absolute',
          'top': '10px',
          'left': '10px',
          'width': 'auto',
          'border-radius': '4px',
          'background': '#e60023 url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjEwcHgiIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAwIDEwIDIwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogIDxnPgogICAgPHBhdGggZD0iTTAuNDgzMDc2OSwwIEMwLjQ4MzA3NjksMC43NzIxNDI5IDEuMzI1Mzg0NiwxLjQzMjg1NzEgMi4xMzc2OTIzLDEuNzg0Mjg1NyBMMi4xMzc2OTIzLDcuMzU3MTQyOSBDMC43NTg0NjE1LDguMTQyODU3MSAwLDkuNzUzNTcxNCAwLDExLjQyODU3MTQgTDQuMjAyMzA3NywxMS40Mjg1NzE0IEw0LjIwMTUzODUsMTcuMjEyMTQyOSBDNC4yMDE1Mzg1LDE3LjIxMjE0MjkgNC4zNDE1Mzg1LDE5LjY1OTI4NTcgNSwyMCBDNS42NTc2OTIzLDE5LjY1OTI4NTcgNS43OTc2OTIzLDE3LjIxMjE0MjkgNS43OTc2OTIzLDE3LjIxMjE0MjkgTDUuNzk2OTIzMSwxMS40Mjg1NzE0IEwxMCwxMS40Mjg1NzE0IEMxMCw5Ljc1MzU3MTQgOS4yNDE1Mzg1LDguMTQyODU3MSA3Ljg2MTUzODUsNy4zNTcxNDI5IEw3Ljg2MTUzODUsMS43ODQyODU3IEM4LjY3NDYxNTQsMS40MzI4NTcxIDkuNTE2MTUzOCwwLjc3MjE0MjkgOS41MTYxNTM4LDAgTDAuNDgzMDc2OSwwIEwwLjQ4MzA3NjksMCBaIiBmaWxsPSIjRkZGRkZGIj48L3BhdGg+CiAgPC9nPgo8L3N2Zz4=) 10px 9px no-repeat',
          'background-size': '10px 20px',
          'padding': '0 10px 0 0',
          'text-indent': '26px',
          'color': '#fff',
          'font-size': '14px',
          'line-height': '36px',
          'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
          'font-style': 'normal',
          'font-weight': 'bold',
          'text-align': 'left',
          '%prefix%font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
          'opacity': '0',
          'cursor': 'pointer'
        },
        '._search': {
          'margin-top': '10px',
          'position': 'fixed',
          'top': '64px',
          'left': '66px',
          '._backdrop': {
            'background': 'transparent url() 0 0 no-repeat',
            'border-radius': '10px',
            'background-size': '100% 100%',
            'position': 'absolute',
            'top': '0',
            '._canvas': {
              'border-radius': '6px',
              'cursor': 'crosshair',
              '&._move': {
                'cursor': 'move',
                '&._nw': {
                  'cursor': 'nw-resize'
                },
                '&._ne': {
                  'cursor': 'ne-resize'
                },
                '&._se': {
                  'cursor': 'se-resize'
                },
                '&._sw': {
                  'cursor': 'sw-resize'
                },
                '&._onDot': {
                  'cursor': 'pointer'
                }
              }
            },
            '&:hover ._saveButton': {
              'opacity': '1',
            }
          }
        },
        '._grid': {
          'margin-top': '16px',
          'text-align': 'left',
          'position': 'absolute',
          'top': '54px',
          'z-index': '1',
          '._annoHeader': {
            'height': '45px',
            'border-radius': '8px',
            'display': 'block',
            'vertical-align': 'top',
            'cursor': 'pointer',
            'background': '#fff',
            'position': 'relative',
            'padding-left': '5px',
            'margin-bottom': '5px',
            'overflow': 'hidden',
            '&._tation': {
              'display': 'inline-block',
              'padding': '0 13px',
              'color': '#efefef',
              'margin': '4px',
              'height': '38px',
              'line-height': '38px',
              'border-radius': '4px',
              'font-weight': 'bold',
              'font-size': '16px',
              'cursor': 'pointer',
              'opacity': '0.9',
              '&:hover': {
                'opacity': '1'
              }
            }
          },
          '._col': {
            'display': 'inline-block',
            'width': '220px',
            'vertical-align': 'top',
            'text-align': 'left',
            '._thumb': {
              'border-radius': '8px',
              'margin': '0',
              'display': 'block',
              'width': '220px',
              'background': '#eee',
              'vertical-align': 'top',
              'overflow': 'hidden',
              'cursor': 'pointer',
              'background': '#fff',
              'position': 'relative',
              'border': '10px solid #fff',
              '&:hover': {
                'background': '#eee',
                'border-color': '#eee'
              },
              '&._hazNote': {
                'margin-bottom': '8px',
                '&:hover': {
                  'background': '#fff',
                  'border-color': '#fff'
                }
              },
              '._mask': {
                'position': 'absolute',
                'top': '0',
                'left': '0',
                'bottom': '0',
                'right': '0'
              },
              '._searchButton': {
                'position': 'absolute',
                'top': '8px',
                'right': '8px',
                'height': '40px',
                'width': '40px',
                'border-radius': '20px',
                'background': 'rgba(0,0,0,.4) url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxtYXNrIGlkPSJtIj48cmVjdCBmaWxsPSIjZmZmIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI2IiByeT0iNiIvPjxyZWN0IGZpbGw9IiMwMDAiIHg9IjUiIHk9IjUiIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgcng9IjEiIHJ5PSIxIi8+PHJlY3QgZmlsbD0iIzAwMCIgeD0iMTAiIHk9IjAiIHdpZHRoPSI0IiBoZWlnaHQ9IjI0Ii8+PHJlY3QgZmlsbD0iIzAwMCIgeD0iMCIgeT0iMTAiIHdpZHRoPSIyNCIgaGVpZ2h0PSI0Ii8+PC9tYXNrPjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNmZmYiIG1hc2s9InVybCgjbSkiLz48L3N2Zz4=) 50% 50% no-repeat',
                'background-size': '24px 24px',
                'opacity': '0'
              },
              '&:hover ._saveButton, &:hover ._searchButton': {
                'opacity': '1'
              },
              'img': {
                'display': 'block',
                'width': '200px',
                'border-radius': '8px'
              },
              '._ft': {
                'display': 'block',
                'font-size': '12px',
                'span': {
                  'position': 'relative',
                  'display': 'block',
                  'padding': '10px',
                  'color': '#333',
                  '&._domain': {
                    'color': '#b9b9b9',
                    'font-weight': 'bold',
                    'white-space': 'pre',
                    'overflow': 'hidden',
                    'text-overflow': 'ellipsis',
                    'width': '180px'
                  },
                  '&._deets': {
                    'display': 'block',
                    'position': 'relative',
                    'height': '50px',
                    '._avatar': {
                      'position': 'absolute',
                      'top': '10px',
                      'left': '10px',
                      'height': '30px',
                      'width': '30px',
                      'padding': '0',
                      'border-radius': '15px',
                      'background': 'transparent url() 0 0 no-repeat',
                      'background-size': '30px 30px'
                    },
                    '._pinner': {
                      'border': 'none',
                      'position': 'absolute',
                      'top': '5px',
                      'left': '50px',
                      'height': '25px',
                      'padding': '0',
                      'line-height': '25px',
                      'font-weight': 'bold',
                      'white-space': 'pre',
                      'overflow': 'hidden',
                      'text-overflow': 'ellipsis',
                      'width': '150px'
                    },
                    '._board': {
                      'border': 'none',
                      'position': 'absolute',
                      'top': '20px',
                      'left': '50px',
                      'padding': '0',
                      'height': '25px',
                      'line-height': '25px',
                      'white-space': 'pre',
                      'overflow': 'hidden',
                      'text-overflow': 'ellipsis',
                      'width': '150px'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '._fail': {
      'display': 'none',
      'position': 'fixed',
      'top': '0',
      'left': '0',
      'height': '100%',
      'width': '100%',
      'z-index': '4',
      'background': 'rgba(0, 0, 0, .5)',
      '._failBox': {
        'position': 'absolute',
        'top': '40%',
        'left': '50%',
        'margin-left': '-220px',
        'margin-top': '-90px',
        'width': '380px',
        'border-radius': '6px',
        'background': '#fff',
        'overflow': 'hidden',
        '._failHeader': {
          'display': 'block',
          'font-color': '#e7e7e7',
          'font-weight': 'bold',
          'height': '65px',
          'padding': '20px 20px 20px 20px',
          'margin': '0',
          'border-bottom': '1px solid #e7e7e7',
          '._failHeaderMsg': {
            'display': 'block',
            'position': 'absolute',
            'font-color': '#e7e7e7',
            'font-size': '20px'
          },
          //  close the error message
          '._xFail': {
            'font-size': '20px',
            'position': 'absolute',
            'top': '25px',
            'right': '25px',
            'cursor': 'pointer',
            'height': '16px',
            'width': '16px',
            'background': 'transparent url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDMyIDMyIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxwYXRoIGZpbGw9IiM4ODgiIGQ9Ik0xLDZBMSwxLDAgMCAxIDYsMUwxNiwxMUwyNiwxQTEsMSwwIDAgMSAzMSw2TDIxLDE2TDMxLDI2QTEsMSwwIDAgMSAyNiwzMUwxNiwyMUw2LDMxQTEsMSwwIDAgMSAxLDI2TDExLDE2WiIvPjwvZz48L3N2Zz4=) 0 0 no-repeat',
            'opacity': '.5',
            '&:hover': {
              'opacity': '1'
            }
          }
        },
        '._failBody': {
          'font-size': '14px',
          'line-height': '20px',
          'padding': '20px',
          'display': 'block'
        }
      }
    },
    // show error message
    '&._hazFail': {
      '._fail': {
        'display': 'block'
      }
    }
  },
  str: {
    // new plan: keys and values in search strings get double-quotes, since
    // that's the way we get them back from translators.
    "en": {
      "headerMessage": "More like this from Pinterest",
      "save": "Save",
      "failHeaderMsg": "Oops!",
    },
    "cs": {
      "headerMessage": "Více podobných z Pinterestu",
      "save": "Uložit"
    },
    "da": {
      "headerMessage": "Mere som dette fra Pinterest",
      "save": "Gem"
    },
    "de": {
      "headerMessage": "Mehr davon von Pinterest",
      "save": "Merken"
    },
    "es": {
      "headerMessage": "Más como esto en Pinterest",
      "save": "Guardar"
    },
    "es-mx": {
      "headerMessage": "Más de esto de Pinterest",
      "save": "Guardar"
    },
    "el": {
      "headerMessage": "Άλλα παρόμοια από το Pinterest.",
      "save": "Κράτα το"
    },
    "fi": {
      "headerMessage": "Lisää tällaista Pinterestiltä",
      "save": "Tallenna"
    },
    "fr": {
      "headerMessage": "Plus de contenu similaire issu de Pinterest",
      "save": "Enregistrer"
    },
    "hi": {
      "headerMessage": "Pinterest की ओर से इसके जैसी और अधिक सामग्री",
      "save": "सेव करें"
    },
    "hu": {
      "headerMessage": "Több ehhez hasonló a Pinterestről",
      "save": "Mentés"
    },
    "id": {
      "headerMessage": "Lebih banyak lagi yang seperti ini dari Pinterest",
      "save": "Simpan"
    },
    "it": {
      "headerMessage": "Altri risultati simili da Pinterest",
      "save": "Salva"
    },
    "ja": {
      "headerMessage": "よく似たアイデアを Pinterest で検索",
      "save": "保存"
    },
    "ko": {
      "headerMessage": "Pinterest에서 비슷한 항목 더 보기",
      "save": "저장"
    },
    "ms": {
      "headerMessage": "Lebih banyak seperti ini daripada Pinterest",
      "save": "Simpan"
    },
    "nb": {
      "headerMessage": "Mer lignende innhold fra Pinterest",
      "save": "Lagre"
    },
    "nl": {
      "headerMessage": "Meer zoals dit van Pinterest",
      "save": "Bewaren"
    },
    "pl": {
      "headerMessage": "Więcej w tym stylu na Pintereście",
      "save": "Zapisz"
    },
    "pt": {
      "headerMessage": "Mais como este no Pinterest",
      "save": "Guardar"
    },
    "pt-br": {
      "headerMessage": "Mais ideias como esta no Pinterest",
      "save": "Salvar"
    },
    "ro": {
      "headerMessage": "Mai multe asemănătoare de pe Pinterest",
      "save": "Salvează"
    },
    "ru": {
      "headerMessage": "Показать похожие",
      "save": "Сохранить"
    },
    "sk": {
      "headerMessage": "Viac podobných z Pinterestu",
      "save": "Uložiť"
    },
    "sv": {
      "headerMessage": "Mer som liknar detta från Pinterest",
      "save": "Spara"
    },
    "th": {
      "headerMessage": "เนื้อหาที่คล้ายกันบน Pinterest",
      "save": "บันทึก"
    },
    "tl": {
      "headerMessage": "Higit pang katulad nito mula sa Pinterest",
      "save": "I-save"
    },
    "tr": {
      "headerMessage": "Pinterest'ten buna benzer daha fazla içerik",
      "save": "Kaydet"
    },
    "uk": {
      "headerMessage": "Більше таких матеріалів у Pinterest",
      "save": "Зберегти"
    },
    "vi": {
      "headerMessage": "Nhiều nội dung tương tự hơn từ Pinterest",
      "save": "Lưu"
    }
  }
});
