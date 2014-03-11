(function($, window, document, undefined) {
    var pluginName = "stickyScroll",
        dataPlugin = "plugin_" + pluginName,
        defaults = {
            baseLimitScroll: null,
            parentContainer: null,
            offsetTop: 20,
            easeTiming: 0.5,
            debug: false
        },
        scrollTimeout,
        _debugMode = false;
    var resetStyle = function(e) {
        e.removeAttr('style');
        e.css('padding-top', '');
    };

    var scrollHandler = function(_this, _document, _window, _currentContainer) {
        if (_this.options._target_scrolltop === undefined) {
            var _target_scrolltop = parseInt(_this.element.offset().top);
            // create additional setting var to get the target original position only after the first scroll
            _this.options._target_scrolltop = _target_scrolltop;
        } else {
            _target_scrolltop = _this.options._target_scrolltop;
        }
        limit = (_this.options.baseLimitScroll !== null && _this.options.baseLimitScroll.length == 1) ?
            (_this.options.baseLimitScroll.offset().top + _this.options.baseLimitScroll.outerHeight(true)) :
            $(document).height();
        limit = parseFloat(limit).toFixed(0);

        var parentContainer = (_this.options.parentContainer !== null && _this.options.parentContainer.length == 1) ? _this.options.parentContainer : _document;
        var parentContainerTopPos = (parentContainer.offset() !== undefined) ? parseInt(parentContainer.offset().top) : 0;
        var _window_scrolltop = parseInt(_window.scrollTop());
        var targetHeight = parseInt(_this.element.outerHeight(true));
        if (limit < parentContainer.height()) {
            return;
        }
        if (_window_scrolltop <= _target_scrolltop) {
            resetStyle(_currentContainer);
            return;
        }
        if (((_window_scrolltop - parentContainer.height() - parentContainerTopPos) + targetHeight + _this.options.offsetTop) >= 0) {
            if ((_window_scrolltop + _this.options.offsetTop) > _target_scrolltop && _window_scrolltop < _target_scrolltop) {
                resetStyle(_currentContainer);
                return;
            }
            if (_debugMode) {
                console.log('check 1');
            }
            if (((_window_scrolltop + targetHeight) < _target_scrolltop) && _this.options._original_pos != _target_scrolltop) {
                resetStyle(_currentContainer);
                return;
            }
            if (_debugMode) {
                console.log('check 2');
            }
            if (((_window_scrolltop - targetHeight) + parentContainer.height()) < _target_scrolltop && _this.options._original_pos != _target_scrolltop) {
                resetStyle(_currentContainer);
                return;
            }
            if (_debugMode) {
                console.log('check 3');
            }
            if (_window_scrolltop <= _target_scrolltop) {
                resetStyle(_currentContainer);
                return;
            }
            if (_debugMode) {
                console.log('check 4');
            }
            if ((_window_scrolltop + targetHeight + _this.options.offsetTop) < parentContainer.height()) {
                resetStyle(_currentContainer);
                return;
            }
            var easeStyle = 'all ' + _this.options.easeTiming + 's ease';
            if (_this.options.baseLimitScroll !== undefined && (_window_scrolltop + targetHeight + (_this.options.offsetTop)) < limit) {
                var computedTop = ((_window_scrolltop - _target_scrolltop) < _this.options.offsetTop) ? (_window_scrolltop - _target_scrolltop) : _this.options.offsetTop;
                if ($.browser.msie) {
                    _currentContainer.animate({}, (_this.options.easeTiming * 1000), 'linear').css({
                        'margin-top': computedTop,
                        'top': '0px',
                        'position': 'fixed',
                        'width': _this.element.width(),
                        'display': 'block'
                    });
                } else {
                    _currentContainer.css({
                        'top': '0px',
                        'margin-top': computedTop,
                        'position': 'fixed',
                        'display': 'block',
                        'width': _this.element.width(),
                        '-webkit-transition': easeStyle,
                        '-moz-transition': easeStyle,
                        'transition': easeStyle
                    });
                }
            } else {
                if ($.browser.msie) {
                    _currentContainer.animate({
                        'top': (limit - (parseInt(_window_scrolltop) + targetHeight + _this.options.offsetTop)) + "px"
                    }, (_this.options * 1000), 'linear').css({
                        'top': (limit - (parseInt(_window_scrolltop) + targetHeight + _this.options.offsetTop)) + "px",
                        'position': 'fixed',
                        'display': 'block',
                        'width': _this.element.width(),
                        'padding-top': '',
                        '-webkit-transition': '',
                        '-moz-transition': '',
                        'transition': ''
                    });
                } else {
                    _currentContainer.css({
                        'top': (limit - (parseInt(_window_scrolltop) + targetHeight + _this.options.offsetTop)),
                        'position': 'fixed',
                        'display': 'block',
                        'padding-top': '',
                        'width': _this.element.width(),
                        '-webkit-transition': '',
                        '-moz-transition': '',
                        'transition': ''
                    });
                }
            }
        } else {
            resetStyle(_currentContainer);
        }
    };
    // The actual plugin constructor
    var Plugin = function(element) {
        this.options = $.extend({}, defaults);
    };
    Plugin.prototype = {
        recalculatePosition: function() {
            this.options._original_pos = parseInt(this.element.offset().top);
            delete this.options._target_scrolltop;
        },
        init: function(options) {
            $.extend(this.options, options);
            _debugMode = !! ("console" in window && window.console && "log" in window.console && window.console.log && typeof window.console.log == 'function' && this.options.debug);
            $this = this;
            _currentContainer = $this.element;
            $this.options._original_pos = parseInt($this.element.offset().top);
            var _window = $(window);
            var _document = $(document);

            _window.on('scroll', function() {
                scrollHandler($this, _document, _window, _currentContainer);
            });
        }
    };
    /*
     * Plugin wrapper, preventing against multiple instantiations and
     * allowing any public function to be called via the jQuery plugin,
     * e.g. $(element).pluginName('functionName', arg1, arg2, ...)
     */
    $.fn[pluginName] = function(arg) {
        var args, instance;
        // only allow the plugin to be instantiated once
        if (!(this.data(dataPlugin) instanceof Plugin)) {
            // if no instance, create one
            this.data(dataPlugin, new Plugin(this));
        }
        instance = this.data(dataPlugin);
        instance.element = this;
        // Is the first parameter an object (arg), or was omitted,
        // call Plugin.init( arg )
        if (typeof arg === 'undefined' || typeof arg === 'object') {
            if (typeof instance['init'] === 'function') {
                instance.init(arg);
            }
            // checks that the requested public method exists
        } else if (typeof arg === 'string' && typeof instance[arg] === 'function') {
            // copy arguments & remove function name
            args = Array.prototype.slice.call(arguments, 1);
            // call the method
            return instance[arg].apply(instance, args);
        } else {
            $.error('Method ' + arg + ' does not exist on jQuery.' + pluginName);
        }
    };
}(jQuery, window, document));
