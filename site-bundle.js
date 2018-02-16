if (typeof jQuery === 'undefined') {
    throw new Error('Bootstrap\'s JavaScript requires jQuery')
} +
function($) {
    'use strict';

    function transitionEnd() {
        var el = document.createElement('bootstrap')
        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        }
        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                }
            }
        }
        return false
    }
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false
        var $el = this
        $(this).one('bsTransitionEnd', function() {
            called = true
        })
        var callback = function() {
            if (!called) $($el).trigger($.support.transition.end)
        }
        setTimeout(callback, duration)
        return this
    }
    $(function() {
        $.support.transition = transitionEnd()
        if (!$.support.transition) return
        $.event.special.bsTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function(e) {
                if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
            }
        }
    })
}(jQuery); + function($) {
    'use strict';
    var dismiss = '[data-dismiss="alert"]'
    var Alert = function(el) {
        $(el).on('click', dismiss, this.close)
    }
    Alert.VERSION = '3.2.0'
    Alert.prototype.close = function(e) {
        var $this = $(this)
        var selector = $this.attr('data-target')
        if (!selector) {
            selector = $this.attr('href')
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '')
        }
        var $parent = $(selector)
        if (e) e.preventDefault()
        if (!$parent.length) {
            $parent = $this.hasClass('alert') ? $this : $this.parent()
        }
        $parent.trigger(e = $.Event('close.bs.alert'))
        if (e.isDefaultPrevented()) return
        $parent.removeClass('in')

        function removeElement() {
            $parent.detach().trigger('closed.bs.alert').remove()
        }
        $.support.transition && $parent.hasClass('fade') ? $parent.one('bsTransitionEnd', removeElement).emulateTransitionEnd(150) : removeElement()
    }

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.alert')
            if (!data) $this.data('bs.alert', (data = new Alert(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }
    var old = $.fn.alert
    $.fn.alert = Plugin
    $.fn.alert.Constructor = Alert
    $.fn.alert.noConflict = function() {
        $.fn.alert = old
        return this
    }
    $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)
}(jQuery); + function($) {
    'use strict';
    var Button = function(element, options) {
        this.$element = $(element)
        this.options = $.extend({}, Button.DEFAULTS, options)
        this.isLoading = false
    }
    Button.VERSION = '3.2.0'
    Button.DEFAULTS = {
        loadingText: 'loading...'
    }
    Button.prototype.setState = function(state) {
        var d = 'disabled'
        var $el = this.$element
        var val = $el.is('input') ? 'val' : 'html'
        var data = $el.data()
        state = state + 'Text'
        if (data.resetText == null) $el.data('resetText', $el[val]())
        $el[val](data[state] == null ? this.options[state] : data[state])
        setTimeout($.proxy(function() {
            if (state == 'loadingText') {
                this.isLoading = true
                $el.addClass(d).attr(d, d)
            } else if (this.isLoading) {
                this.isLoading = false
                $el.removeClass(d).removeAttr(d)
            }
        }, this), 0)
    }
    Button.prototype.toggle = function() {
        var changed = true
        var $parent = this.$element.closest('[data-toggle="buttons"]')
        if ($parent.length) {
            var $input = this.$element.find('input')
            if ($input.prop('type') == 'radio') {
                if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
                else $parent.find('.active').removeClass('active')
            }
            if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
        }
        if (changed) this.$element.toggleClass('active')
    }

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.button')
            var options = typeof option == 'object' && option
            if (!data) $this.data('bs.button', (data = new Button(this, options)))
            if (option == 'toggle') data.toggle()
            else if (option) data.setState(option)
        })
    }
    var old = $.fn.button
    $.fn.button = Plugin
    $.fn.button.Constructor = Button
    $.fn.button.noConflict = function() {
        $.fn.button = old
        return this
    }
    $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function(e) {
        var $btn = $(e.target)
        if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
        Plugin.call($btn, 'toggle')
        e.preventDefault()
    })
}(jQuery); + function($) {
    'use strict';
    var Carousel = function(element, options) {
        this.$element = $(element).on('keydown.bs.carousel', $.proxy(this.keydown, this))
        this.$indicators = this.$element.find('.carousel-indicators')
        this.options = options
        this.paused = this.sliding = this.interval = this.$active = this.$items = null
        this.options.pause == 'hover' && this.$element.on('mouseenter.bs.carousel', $.proxy(this.pause, this)).on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
    }
    Carousel.VERSION = '3.2.0'
    Carousel.DEFAULTS = {
        interval: 5000,
        pause: 'hover',
        wrap: true
    }
    Carousel.prototype.keydown = function(e) {
        switch (e.which) {
            case 37:
                this.prev();
                break
            case 39:
                this.next();
                break
            default:
                return
        }
        e.preventDefault()
    }
    Carousel.prototype.cycle = function(e) {
        e || (this.paused = false)
        this.interval && clearInterval(this.interval)
        this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
        return this
    }
    Carousel.prototype.getItemIndex = function(item) {
        this.$items = item.parent().children('.item')
        return this.$items.index(item || this.$active)
    }
    Carousel.prototype.to = function(pos) {
        var that = this
        var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))
        if (pos > (this.$items.length - 1) || pos < 0) return
        if (this.sliding) return this.$element.one('slid.bs.carousel', function() {
            that.to(pos)
        })
        if (activeIndex == pos) return this.pause().cycle()
        return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
    }
    Carousel.prototype.pause = function(e) {
        e || (this.paused = true)
        if (this.$element.find('.next, .prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end)
            this.cycle(true)
        }
        this.interval = clearInterval(this.interval)
        return this
    }
    Carousel.prototype.next = function() {
        if (this.sliding) return
        return this.slide('next')
    }
    Carousel.prototype.prev = function() {
        if (this.sliding) return
        return this.slide('prev')
    }
    Carousel.prototype.slide = function(type, next) {
        var $active = this.$element.find('.item.active')
        var $next = next || $active[type]()
        var isCycling = this.interval
        var direction = type == 'next' ? 'left' : 'right'
        var fallback = type == 'next' ? 'first' : 'last'
        var that = this
        if (!$next.length) {
            if (!this.options.wrap) return
            $next = this.$element.find('.item')[fallback]()
        }
        if ($next.hasClass('active')) return (this.sliding = false)
        var relatedTarget = $next[0]
        var slideEvent = $.Event('slide.bs.carousel', {
            relatedTarget: relatedTarget,
            direction: direction
        })
        this.$element.trigger(slideEvent)
        if (slideEvent.isDefaultPrevented()) return
        this.sliding = true
        isCycling && this.pause()
        if (this.$indicators.length) {
            this.$indicators.find('.active').removeClass('active')
            var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
            $nextIndicator && $nextIndicator.addClass('active')
        }
        var slidEvent = $.Event('slid.bs.carousel', {
            relatedTarget: relatedTarget,
            direction: direction
        })
        if ($.support.transition && this.$element.hasClass('slide')) {
            $next.addClass(type)
            $next[0].offsetWidth
            $active.addClass(direction)
            $next.addClass(direction)
            $active.one('bsTransitionEnd', function() {
                $next.removeClass([type, direction].join(' ')).addClass('active')
                $active.removeClass(['active', direction].join(' '))
                that.sliding = false
                setTimeout(function() {
                    that.$element.trigger(slidEvent)
                }, 0)
            }).emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000)
        } else {
            $active.removeClass('active')
            $next.addClass('active')
            this.sliding = false
            this.$element.trigger(slidEvent)
        }
        isCycling && this.cycle()
        return this
    }

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.carousel')
            var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
            var action = typeof option == 'string' ? option : options.slide
            if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
            if (typeof option == 'number') data.to(option)
            else if (action) data[action]()
            else if (options.interval) data.pause().cycle()
        })
    }
    var old = $.fn.carousel
    $.fn.carousel = Plugin
    $.fn.carousel.Constructor = Carousel
    $.fn.carousel.noConflict = function() {
        $.fn.carousel = old
        return this
    }
    $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function(e) {
        var href
        var $this = $(this)
        var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, ''))
        if (!$target.hasClass('carousel')) return
        var options = $.extend({}, $target.data(), $this.data())
        var slideIndex = $this.attr('data-slide-to')
        if (slideIndex) options.interval = false
        Plugin.call($target, options)
        if (slideIndex) {
            $target.data('bs.carousel').to(slideIndex)
        }
        e.preventDefault()
    })
    $(window).on('load', function() {
        $('[data-ride="carousel"]').each(function() {
            var $carousel = $(this)
            Plugin.call($carousel, $carousel.data())
        })
    })
}(jQuery); + function($) {
    'use strict';
    var Collapse = function(element, options) {
        this.$element = $(element)
        this.options = $.extend({}, Collapse.DEFAULTS, options)
        this.transitioning = null
        if (this.options.parent) this.$parent = $(this.options.parent)
        if (this.options.toggle) this.toggle()
    }
    Collapse.VERSION = '3.2.0'
    Collapse.DEFAULTS = {
        toggle: true
    }
    Collapse.prototype.dimension = function() {
        var hasWidth = this.$element.hasClass('width')
        return hasWidth ? 'width' : 'height'
    }
    Collapse.prototype.show = function() {
        if (this.transitioning || this.$element.hasClass('in')) return
        var startEvent = $.Event('show.bs.collapse')
        this.$element.trigger(startEvent)
        if (startEvent.isDefaultPrevented()) return
        var actives = this.$parent && this.$parent.find('> .panel > .in')
        if (actives && actives.length) {
            var hasData = actives.data('bs.collapse')
            if (hasData && hasData.transitioning) return
            Plugin.call(actives, 'hide')
            hasData || actives.data('bs.collapse', null)
        }
        var dimension = this.dimension()
        this.$element.removeClass('collapse').addClass('collapsing')[dimension](0)
        this.transitioning = 1
        var complete = function() {
            this.$element.removeClass('collapsing').addClass('collapse in')[dimension]('')
            this.transitioning = 0
            this.$element.trigger('shown.bs.collapse')
        }
        if (!$.support.transition) return complete.call(this)
        var scrollSize = $.camelCase(['scroll', dimension].join('-'))
        this.$element.one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize])
    }
    Collapse.prototype.hide = function() {
        if (this.transitioning || !this.$element.hasClass('in')) return
        var startEvent = $.Event('hide.bs.collapse')
        this.$element.trigger(startEvent)
        if (startEvent.isDefaultPrevented()) return
        var dimension = this.dimension()
        this.$element[dimension](this.$element[dimension]())[0].offsetHeight
        this.$element.addClass('collapsing').removeClass('collapse').removeClass('in')
        this.transitioning = 1
        var complete = function() {
            this.transitioning = 0
            this.$element.trigger('hidden.bs.collapse').removeClass('collapsing').addClass('collapse')
        }
        if (!$.support.transition) return complete.call(this)
        this.$element[dimension](0).one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(350)
    }
    Collapse.prototype.toggle = function() {
        this[this.$element.hasClass('in') ? 'hide' : 'show']()
    }

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.collapse')
            var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data && options.toggle && option == 'show') option = !option
            if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }
    var old = $.fn.collapse
    $.fn.collapse = Plugin
    $.fn.collapse.Constructor = Collapse
    $.fn.collapse.noConflict = function() {
        $.fn.collapse = old
        return this
    }
    $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function(e) {
        var href
        var $this = $(this)
        var target = $this.attr('data-target') || e.preventDefault() || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')
        var $target = $(target)
        var data = $target.data('bs.collapse')
        var option = data ? 'toggle' : $this.data()
        var parent = $this.attr('data-parent')
        var $parent = parent && $(parent)
        if (!data || !data.transitioning) {
            if ($parent) $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass('collapsed')
            $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
        }
        Plugin.call($target, option)
    })
}(jQuery); + function($) {
    'use strict';
    var backdrop = '.dropdown-backdrop'
    var toggle = '[data-toggle="dropdown"]'
    var Dropdown = function(element) {
        $(element).on('click.bs.dropdown', this.toggle)
    }
    Dropdown.VERSION = '3.2.0'
    Dropdown.prototype.toggle = function(e) {
        var $this = $(this)
        if ($this.is('.disabled, :disabled')) return
        var $parent = getParent($this)
        var isActive = $parent.hasClass('open')
        clearMenus()
        if (!isActive) {
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
            }
            var relatedTarget = {
                relatedTarget: this
            }
            $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))
            if (e.isDefaultPrevented()) return
            $this.trigger('focus')
            $parent.toggleClass('open').trigger('shown.bs.dropdown', relatedTarget)
        }
        return false
    }
    Dropdown.prototype.keydown = function(e) {
        if (!/(38|40|27)/.test(e.keyCode)) return
        var $this = $(this)
        e.preventDefault()
        e.stopPropagation()
        if ($this.is('.disabled, :disabled')) return
        var $parent = getParent($this)
        var isActive = $parent.hasClass('open')
        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) $parent.find(toggle).trigger('focus')
            return $this.trigger('click')
        }
        var desc = ' li:not(.divider):visible a'
        var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)
        if (!$items.length) return
        var index = $items.index($items.filter(':focus'))
        if (e.keyCode == 38 && index > 0) index--
            if (e.keyCode == 40 && index < $items.length - 1) index++
                if (!~index) index = 0
        $items.eq(index).trigger('focus')
    }

    function clearMenus(e) {
        if (e && e.which === 3) return
        $(backdrop).remove()
        $(toggle).each(function() {
            var $parent = getParent($(this))
            var relatedTarget = {
                relatedTarget: this
            }
            if (!$parent.hasClass('open')) return
            $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
            if (e.isDefaultPrevented()) return
            $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
        })
    }

    function getParent($this) {
        var selector = $this.attr('data-target')
        if (!selector) {
            selector = $this.attr('href')
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '')
        }
        var $parent = selector && $(selector)
        return $parent && $parent.length ? $parent : $this.parent()
    }

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.dropdown')
            if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }
    var old = $.fn.dropdown
    $.fn.dropdown = Plugin
    $.fn.dropdown.Constructor = Dropdown
    $.fn.dropdown.noConflict = function() {
        $.fn.dropdown = old
        return this
    }
    $(document).on('click.bs.dropdown.data-api', clearMenus).on('click.bs.dropdown.data-api', '.dropdown form', function(e) {
        e.stopPropagation()
    }).on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle).on('keydown.bs.dropdown.data-api', toggle + ', [role="menu"], [role="listbox"]', Dropdown.prototype.keydown)
}(jQuery); + function($) {
    'use strict';
    var Modal = function(element, options) {
        this.options = options
        this.$body = $(document.body)
        this.$element = $(element)
        this.$backdrop = this.isShown = null
        this.scrollbarWidth = 0
        if (this.options.remote) {
            this.$element.find('.modal-content').load(this.options.remote, $.proxy(function() {
                this.$element.trigger('loaded.bs.modal')
            }, this))
        }
    }
    Modal.VERSION = '3.2.0'
    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    }
    Modal.prototype.toggle = function(_relatedTarget) {
        return this.isShown ? this.hide() : this.show(_relatedTarget)
    }
    Modal.prototype.show = function(_relatedTarget) {
        var that = this
        var e = $.Event('show.bs.modal', {
            relatedTarget: _relatedTarget
        })
        this.$element.trigger(e)
        if (this.isShown || e.isDefaultPrevented()) return
        this.isShown = true
        this.checkScrollbar()
        this.$body.addClass('modal-open')
        this.setScrollbar()
        this.escape()
        this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))
        this.backdrop(function() {
            var transition = $.support.transition && that.$element.hasClass('fade')
            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body)
            }
            that.$element.show().scrollTop(0)
            if (transition) {
                that.$element[0].offsetWidth
            }
            that.$element.addClass('in').attr('aria-hidden', false)
            that.enforceFocus()
            var e = $.Event('shown.bs.modal', {
                relatedTarget: _relatedTarget
            })
            transition ? that.$element.find('.modal-dialog').one('bsTransitionEnd', function() {
                that.$element.trigger('focus').trigger(e)
            }).emulateTransitionEnd(300) : that.$element.trigger('focus').trigger(e)
        })
    }
    Modal.prototype.hide = function(e) {
        if (e) e.preventDefault()
        e = $.Event('hide.bs.modal')
        this.$element.trigger(e)
        if (!this.isShown || e.isDefaultPrevented()) return
        this.isShown = false
        this.$body.removeClass('modal-open')
        this.resetScrollbar()
        this.escape()
        $(document).off('focusin.bs.modal')
        this.$element.removeClass('in').attr('aria-hidden', true).off('click.dismiss.bs.modal')
        $.support.transition && this.$element.hasClass('fade') ? this.$element.one('bsTransitionEnd', $.proxy(this.hideModal, this)).emulateTransitionEnd(300) : this.hideModal()
    }
    Modal.prototype.enforceFocus = function() {
        $(document).off('focusin.bs.modal').on('focusin.bs.modal', $.proxy(function(e) {
            if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                this.$element.trigger('focus')
            }
        }, this))
    }
    Modal.prototype.escape = function() {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.bs.modal', $.proxy(function(e) {
                e.which == 27 && this.hide()
            }, this))
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.bs.modal')
        }
    }
    Modal.prototype.hideModal = function() {
        var that = this
        this.$element.hide()
        this.backdrop(function() {
            that.$element.trigger('hidden.bs.modal')
        })
    }
    Modal.prototype.removeBackdrop = function() {
        this.$backdrop && this.$backdrop.remove()
        this.$backdrop = null
    }
    Modal.prototype.backdrop = function(callback) {
        var that = this
        var animate = this.$element.hasClass('fade') ? 'fade' : ''
        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate
            this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').appendTo(this.$body)
            this.$element.on('click.dismiss.bs.modal', $.proxy(function(e) {
                if (e.target !== e.currentTarget) return
                this.options.backdrop == 'static' ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this)
            }, this))
            if (doAnimate) this.$backdrop[0].offsetWidth
            this.$backdrop.addClass('in')
            if (!callback) return
            doAnimate ? this.$backdrop.one('bsTransitionEnd', callback).emulateTransitionEnd(150) : callback()
        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in')
            var callbackRemove = function() {
                that.removeBackdrop()
                callback && callback()
            }
            $.support.transition && this.$element.hasClass('fade') ? this.$backdrop.one('bsTransitionEnd', callbackRemove).emulateTransitionEnd(150) : callbackRemove()
        } else if (callback) {
            callback()
        }
    }
    Modal.prototype.checkScrollbar = function() {
        if (document.body.clientWidth >= window.innerWidth) return
        this.scrollbarWidth = this.scrollbarWidth || this.measureScrollbar()
    }
    Modal.prototype.setScrollbar = function() {
        var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
        if (this.scrollbarWidth) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
    }
    Modal.prototype.resetScrollbar = function() {
        this.$body.css('padding-right', '')
    }
    Modal.prototype.measureScrollbar = function() {
        var scrollDiv = document.createElement('div')
        scrollDiv.className = 'modal-scrollbar-measure'
        this.$body.append(scrollDiv)
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
        this.$body[0].removeChild(scrollDiv)
        return scrollbarWidth
    }

    function Plugin(option, _relatedTarget) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.modal')
            var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
            if (typeof option == 'string') data[option](_relatedTarget)
            else if (options.show) data.show(_relatedTarget)
        })
    }
    var old = $.fn.modal
    $.fn.modal = Plugin
    $.fn.modal.Constructor = Modal
    $.fn.modal.noConflict = function() {
        $.fn.modal = old
        return this
    }
    $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function(e) {
        var $this = $(this)
        var href = $this.attr('href')
        var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, '')))
        var option = $target.data('bs.modal') ? 'toggle' : $.extend({
            remote: !/#/.test(href) && href
        }, $target.data(), $this.data())
        if ($this.is('a')) e.preventDefault()
        $target.one('show.bs.modal', function(showEvent) {
            if (showEvent.isDefaultPrevented()) return
            $target.one('hidden.bs.modal', function() {
                $this.is(':visible') && $this.trigger('focus')
            })
        })
        Plugin.call($target, option, this)
    })
}(jQuery); + function($) {
    'use strict';
    var Tooltip = function(element, options) {
        this.type = this.options = this.enabled = this.timeout = this.hoverState = this.$element = null
        this.init('tooltip', element, options)
    }
    Tooltip.VERSION = '3.2.0'
    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false,
        viewport: {
            selector: 'body',
            padding: 0
        }
    }
    Tooltip.prototype.init = function(type, element, options) {
        this.enabled = true
        this.type = type
        this.$element = $(element)
        this.options = this.getOptions(options)
        this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport)
        var triggers = this.options.trigger.split(' ')
        for (var i = triggers.length; i--;) {
            var trigger = triggers[i]
            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
            } else if (trigger != 'manual') {
                var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin'
                var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'
                this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
            }
        }
        this.options.selector ? (this._options = $.extend({}, this.options, {
            trigger: 'manual',
            selector: ''
        })) : this.fixTitle()
    }
    Tooltip.prototype.getDefaults = function() {
        return Tooltip.DEFAULTS
    }
    Tooltip.prototype.getOptions = function(options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options)
        if (options.delay && typeof options.delay == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            }
        }
        return options
    }
    Tooltip.prototype.getDelegateOptions = function() {
        var options = {}
        var defaults = this.getDefaults()
        this._options && $.each(this._options, function(key, value) {
            if (defaults[key] != value) options[key] = value
        })
        return options
    }
    Tooltip.prototype.enter = function(obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type)
        if (!self) {
            self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
            $(obj.currentTarget).data('bs.' + this.type, self)
        }
        clearTimeout(self.timeout)
        self.hoverState = 'in'
        if (!self.options.delay || !self.options.delay.show) return self.show()
        self.timeout = setTimeout(function() {
            if (self.hoverState == 'in') self.show()
        }, self.options.delay.show)
    }
    Tooltip.prototype.leave = function(obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type)
        if (!self) {
            self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
            $(obj.currentTarget).data('bs.' + this.type, self)
        }
        clearTimeout(self.timeout)
        self.hoverState = 'out'
        if (!self.options.delay || !self.options.delay.hide) return self.hide()
        self.timeout = setTimeout(function() {
            if (self.hoverState == 'out') self.hide()
        }, self.options.delay.hide)
    }
    Tooltip.prototype.show = function() {
        var e = $.Event('show.bs.' + this.type)
        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e)
            var inDom = $.contains(document.documentElement, this.$element[0])
            if (e.isDefaultPrevented() || !inDom) return
            var that = this
            var $tip = this.tip()
            var tipId = this.getUID(this.type)
            this.setContent()
            $tip.attr('id', tipId)
            this.$element.attr('aria-describedby', tipId)
            if (this.options.animation) $tip.addClass('fade')
            var placement = typeof this.options.placement == 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement
            var autoToken = /\s?auto?\s?/i
            var autoPlace = autoToken.test(placement)
            if (autoPlace) placement = placement.replace(autoToken, '') || 'top'
            $tip.detach().css({
                top: 0,
                left: 0,
                display: 'block'
            }).addClass(placement).data('bs.' + this.type, this)
            this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
            var pos = this.getPosition()
            var actualWidth = $tip[0].offsetWidth
            var actualHeight = $tip[0].offsetHeight
            if (autoPlace) {
                var orgPlacement = placement
                var $parent = this.$element.parent()
                var parentDim = this.getPosition($parent)
                placement = placement == 'bottom' && pos.top + pos.height + actualHeight - parentDim.scroll > parentDim.height ? 'top' : placement == 'top' && pos.top - parentDim.scroll - actualHeight < 0 ? 'bottom' : placement == 'right' && pos.right + actualWidth > parentDim.width ? 'left' : placement == 'left' && pos.left - actualWidth < parentDim.left ? 'right' : placement
                $tip.removeClass(orgPlacement).addClass(placement)
            }
            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)
            this.applyPlacement(calculatedOffset, placement)
            var complete = function() {
                that.$element.trigger('shown.bs.' + that.type)
                that.hoverState = null
            }
            $.support.transition && this.$tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(150) : complete()
        }
    }
    Tooltip.prototype.applyPlacement = function(offset, placement) {
        var $tip = this.tip()
        var width = $tip[0].offsetWidth
        var height = $tip[0].offsetHeight
        var marginTop = parseInt($tip.css('margin-top'), 10)
        var marginLeft = parseInt($tip.css('margin-left'), 10)
        if (isNaN(marginTop)) marginTop = 0
        if (isNaN(marginLeft)) marginLeft = 0
        offset.top = offset.top + marginTop
        offset.left = offset.left + marginLeft
        $.offset.setOffset($tip[0], $.extend({
            using: function(props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                })
            }
        }, offset), 0)
        $tip.addClass('in')
        var actualWidth = $tip[0].offsetWidth
        var actualHeight = $tip[0].offsetHeight
        if (placement == 'top' && actualHeight != height) {
            offset.top = offset.top + height - actualHeight
        }
        var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)
        if (delta.left) offset.left += delta.left
        else offset.top += delta.top
        var arrowDelta = delta.left ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
        var arrowPosition = delta.left ? 'left' : 'top'
        var arrowOffsetPosition = delta.left ? 'offsetWidth' : 'offsetHeight'
        $tip.offset(offset)
        this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], arrowPosition)
    }
    Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
    }
    Tooltip.prototype.setContent = function() {
        var $tip = this.tip()
        var title = this.getTitle()
        $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
        $tip.removeClass('fade in top bottom left right')
    }
    Tooltip.prototype.hide = function() {
        var that = this
        var $tip = this.tip()
        var e = $.Event('hide.bs.' + this.type)
        this.$element.removeAttr('aria-describedby')

        function complete() {
            if (that.hoverState != 'in') $tip.detach()
            that.$element.trigger('hidden.bs.' + that.type)
        }
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $tip.removeClass('in')
        $.support.transition && this.$tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(150) : complete()
        this.hoverState = null
        return this
    }
    Tooltip.prototype.fixTitle = function() {
        var $e = this.$element
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
        }
    }
    Tooltip.prototype.hasContent = function() {
        return this.getTitle()
    }
    Tooltip.prototype.getPosition = function($element) {
        $element = $element || this.$element
        var el = $element[0]
        var isBody = el.tagName == 'BODY'
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : null, {
            scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
            width: isBody ? $(window).width() : $element.outerWidth(),
            height: isBody ? $(window).height() : $element.outerHeight()
        }, isBody ? {
            top: 0,
            left: 0
        } : $element.offset())
    }
    Tooltip.prototype.getCalculatedOffset = function(placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? {
            top: pos.top + pos.height,
            left: pos.left + pos.width / 2 - actualWidth / 2
        } : placement == 'top' ? {
            top: pos.top - actualHeight,
            left: pos.left + pos.width / 2 - actualWidth / 2
        } : placement == 'left' ? {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left - actualWidth
        } : {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left + pos.width
        }
    }
    Tooltip.prototype.getViewportAdjustedDelta = function(placement, pos, actualWidth, actualHeight) {
        var delta = {
            top: 0,
            left: 0
        }
        if (!this.$viewport) return delta
        var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
        var viewportDimensions = this.getPosition(this.$viewport)
        if (/right|left/.test(placement)) {
            var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll
            var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
            if (topEdgeOffset < viewportDimensions.top) {
                delta.top = viewportDimensions.top - topEdgeOffset
            } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
                delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
            }
        } else {
            var leftEdgeOffset = pos.left - viewportPadding
            var rightEdgeOffset = pos.left + viewportPadding + actualWidth
            if (leftEdgeOffset < viewportDimensions.left) {
                delta.left = viewportDimensions.left - leftEdgeOffset
            } else if (rightEdgeOffset > viewportDimensions.width) {
                delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
            }
        }
        return delta
    }
    Tooltip.prototype.getTitle = function() {
        var title
        var $e = this.$element
        var o = this.options
        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title)
        return title
    }
    Tooltip.prototype.getUID = function(prefix) {
        do prefix += ~~(Math.random() * 1000000)
        while (document.getElementById(prefix))
        return prefix
    }
    Tooltip.prototype.tip = function() {
        return (this.$tip = this.$tip || $(this.options.template))
    }
    Tooltip.prototype.arrow = function() {
        return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
    }
    Tooltip.prototype.validate = function() {
        if (!this.$element[0].parentNode) {
            this.hide()
            this.$element = null
            this.options = null
        }
    }
    Tooltip.prototype.enable = function() {
        this.enabled = true
    }
    Tooltip.prototype.disable = function() {
        this.enabled = false
    }
    Tooltip.prototype.toggleEnabled = function() {
        this.enabled = !this.enabled
    }
    Tooltip.prototype.toggle = function(e) {
        var self = this
        if (e) {
            self = $(e.currentTarget).data('bs.' + this.type)
            if (!self) {
                self = new this.constructor(e.currentTarget, this.getDelegateOptions())
                $(e.currentTarget).data('bs.' + this.type, self)
            }
        }
        self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
    Tooltip.prototype.destroy = function() {
        clearTimeout(this.timeout)
        this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
    }

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.tooltip')
            var options = typeof option == 'object' && option
            if (!data && option == 'destroy') return
            if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }
    var old = $.fn.tooltip
    $.fn.tooltip = Plugin
    $.fn.tooltip.Constructor = Tooltip
    $.fn.tooltip.noConflict = function() {
        $.fn.tooltip = old
        return this
    }
}(jQuery); + function($) {
    'use strict';
    var Popover = function(element, options) {
        this.init('popover', element, options)
    }
    if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')
    Popover.VERSION = '3.2.0'
    Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
        placement: 'right',
        trigger: 'click',
        content: '',
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    })
    Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)
    Popover.prototype.constructor = Popover
    Popover.prototype.getDefaults = function() {
        return Popover.DEFAULTS
    }
    Popover.prototype.setContent = function() {
        var $tip = this.tip()
        var title = this.getTitle()
        var content = this.getContent()
        $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
        $tip.find('.popover-content').empty()[this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'](content)
        $tip.removeClass('fade top bottom left right in')
        if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
    }
    Popover.prototype.hasContent = function() {
        return this.getTitle() || this.getContent()
    }
    Popover.prototype.getContent = function() {
        var $e = this.$element
        var o = this.options
        return $e.attr('data-content') || (typeof o.content == 'function' ? o.content.call($e[0]) : o.content)
    }
    Popover.prototype.arrow = function() {
        return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
    }
    Popover.prototype.tip = function() {
        if (!this.$tip) this.$tip = $(this.options.template)
        return this.$tip
    }

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.popover')
            var options = typeof option == 'object' && option
            if (!data && option == 'destroy') return
            if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }
    var old = $.fn.popover
    $.fn.popover = Plugin
    $.fn.popover.Constructor = Popover
    $.fn.popover.noConflict = function() {
        $.fn.popover = old
        return this
    }
}(jQuery); + function($) {
    'use strict';

    function ScrollSpy(element, options) {
        var process = $.proxy(this.process, this)
        this.$body = $('body')
        this.$scrollElement = $(element).is('body') ? $(window) : $(element)
        this.options = $.extend({}, ScrollSpy.DEFAULTS, options)
        this.selector = (this.options.target || '') + ' .nav li > a'
        this.offsets = []
        this.targets = []
        this.activeTarget = null
        this.scrollHeight = 0
        this.$scrollElement.on('scroll.bs.scrollspy', process)
        this.refresh()
        this.process()
    }
    ScrollSpy.VERSION = '3.2.0'
    ScrollSpy.DEFAULTS = {
        offset: 10
    }
    ScrollSpy.prototype.getScrollHeight = function() {
        return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
    }
    ScrollSpy.prototype.refresh = function() {
        var offsetMethod = 'offset'
        var offsetBase = 0
        if (!$.isWindow(this.$scrollElement[0])) {
            offsetMethod = 'position'
            offsetBase = this.$scrollElement.scrollTop()
        }
        this.offsets = []
        this.targets = []
        this.scrollHeight = this.getScrollHeight()
        var self = this
        this.$body.find(this.selector).map(function() {
            var $el = $(this)
            var href = $el.data('target') || $el.attr('href')
            var $href = /^#./.test(href) && $(href)
            return ($href && $href.length && $href.is(':visible') && [
                [$href[offsetMethod]().top + offsetBase, href]
            ]) || null
        }).sort(function(a, b) {
            return a[0] - b[0]
        }).each(function() {
            self.offsets.push(this[0])
            self.targets.push(this[1])
        })
    }
    ScrollSpy.prototype.process = function() {
        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
        var scrollHeight = this.getScrollHeight()
        var maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height()
        var offsets = this.offsets
        var targets = this.targets
        var activeTarget = this.activeTarget
        var i
        if (this.scrollHeight != scrollHeight) {
            this.refresh()
        }
        if (scrollTop >= maxScroll) {
            return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
        }
        if (activeTarget && scrollTop <= offsets[0]) {
            return activeTarget != (i = targets[0]) && this.activate(i)
        }
        for (i = offsets.length; i--;) {
            activeTarget != targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1]) && this.activate(targets[i])
        }
    }
    ScrollSpy.prototype.activate = function(target) {
        this.activeTarget = target
        $(this.selector).parentsUntil(this.options.target, '.active').removeClass('active')
        var selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]'
        var active = $(selector).parents('li').addClass('active')
        if (active.parent('.dropdown-menu').length) {
            active = active.closest('li.dropdown').addClass('active')
        }
        active.trigger('activate.bs.scrollspy')
    }

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.scrollspy')
            var options = typeof option == 'object' && option
            if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }
    var old = $.fn.scrollspy
    $.fn.scrollspy = Plugin
    $.fn.scrollspy.Constructor = ScrollSpy
    $.fn.scrollspy.noConflict = function() {
        $.fn.scrollspy = old
        return this
    }
    $(window).on('load.bs.scrollspy.data-api', function() {
        $('[data-spy="scroll"]').each(function() {
            var $spy = $(this)
            Plugin.call($spy, $spy.data())
        })
    })
}(jQuery); + function($) {
    'use strict';
    var Tab = function(element) {
        this.element = $(element)
    }
    Tab.VERSION = '3.2.0'
    Tab.prototype.show = function() {
        var $this = this.element
        var $ul = $this.closest('ul:not(.dropdown-menu)')
        var selector = $this.data('target')
        if (!selector) {
            selector = $this.attr('href')
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '')
        }
        if ($this.parent('li').hasClass('active')) return
        var previous = $ul.find('.active:last a')[0]
        var e = $.Event('show.bs.tab', {
            relatedTarget: previous
        })
        $this.trigger(e)
        if (e.isDefaultPrevented()) return
        var $target = $(selector)
        this.activate($this.closest('li'), $ul)
        this.activate($target, $target.parent(), function() {
            $this.trigger({
                type: 'shown.bs.tab',
                relatedTarget: previous
            })
        })
    }
    Tab.prototype.activate = function(element, container, callback) {
        var $active = container.find('> .active')
        var transition = callback && $.support.transition && $active.hasClass('fade')

        function next() {
            $active.removeClass('active').find('> .dropdown-menu > .active').removeClass('active')
            element.addClass('active')
            if (transition) {
                element[0].offsetWidth
                element.addClass('in')
            } else {
                element.removeClass('fade')
            }
            if (element.parent('.dropdown-menu')) {
                element.closest('li.dropdown').addClass('active')
            }
            callback && callback()
        }
        transition ? $active.one('bsTransitionEnd', next).emulateTransitionEnd(150) : next()
        $active.removeClass('in')
    }

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.tab')
            if (!data) $this.data('bs.tab', (data = new Tab(this)))
            if (typeof option == 'string') data[option]()
        })
    }
    var old = $.fn.tab
    $.fn.tab = Plugin
    $.fn.tab.Constructor = Tab
    $.fn.tab.noConflict = function() {
        $.fn.tab = old
        return this
    }
    $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function(e) {
        e.preventDefault()
        Plugin.call($(this), 'show')
    })
}(jQuery); + function($) {
    'use strict';
    var Affix = function(element, options) {
        this.options = $.extend({}, Affix.DEFAULTS, options)
        this.$target = $(this.options.target).on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this)).on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this))
        this.$element = $(element)
        this.affixed = this.unpin = this.pinnedOffset = null
        this.checkPosition()
    }
    Affix.VERSION = '3.2.0'
    Affix.RESET = 'affix affix-top affix-bottom'
    Affix.DEFAULTS = {
        offset: 0,
        target: window
    }
    Affix.prototype.getPinnedOffset = function() {
        if (this.pinnedOffset) return this.pinnedOffset
        this.$element.removeClass(Affix.RESET).addClass('affix')
        var scrollTop = this.$target.scrollTop()
        var position = this.$element.offset()
        return (this.pinnedOffset = position.top - scrollTop)
    }
    Affix.prototype.checkPositionWithEventLoop = function() {
        setTimeout($.proxy(this.checkPosition, this), 1)
    }
    Affix.prototype.checkPosition = function() {
        if (!this.$element.is(':visible')) return
        var scrollHeight = $(document).height()
        var scrollTop = this.$target.scrollTop()
        var position = this.$element.offset()
        var offset = this.options.offset
        var offsetTop = offset.top
        var offsetBottom = offset.bottom
        if (typeof offset != 'object') offsetBottom = offsetTop = offset
        if (typeof offsetTop == 'function') offsetTop = offset.top(this.$element)
        if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)
        var affix = this.unpin != null && (scrollTop + this.unpin <= position.top) ? false : offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' : offsetTop != null && (scrollTop <= offsetTop) ? 'top' : false
        if (this.affixed === affix) return
        if (this.unpin != null) this.$element.css('top', '')
        var affixType = 'affix' + (affix ? '-' + affix : '')
        var e = $.Event(affixType + '.bs.affix')
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        this.affixed = affix
        this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null
        this.$element.removeClass(Affix.RESET).addClass(affixType).trigger($.Event(affixType.replace('affix', 'affixed')))
        if (affix == 'bottom') {
            this.$element.offset({
                top: scrollHeight - this.$element.height() - offsetBottom
            })
        }
    }

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.affix')
            var options = typeof option == 'object' && option
            if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }
    var old = $.fn.affix
    $.fn.affix = Plugin
    $.fn.affix.Constructor = Affix
    $.fn.affix.noConflict = function() {
        $.fn.affix = old
        return this
    }
    $(window).on('load', function() {
        $('[data-spy="affix"]').each(function() {
            var $spy = $(this)
            var data = $spy.data()
            data.offset = data.offset || {}
            if (data.offsetBottom) data.offset.bottom = data.offsetBottom
            if (data.offsetTop) data.offset.top = data.offsetTop
            Plugin.call($spy, data)
        })
    })
}(jQuery);
(function(w) {
    "use strict";
    w.matchMedia = w.matchMedia || function(doc, undefined) {
        var bool, docElem = doc.documentElement,
            refNode = docElem.firstElementChild || docElem.firstChild,
            fakeBody = doc.createElement("body"),
            div = doc.createElement("div");
        div.id = "mq-test-1";
        div.style.cssText = "position:absolute;top:-100em";
        fakeBody.style.background = "none";
        fakeBody.appendChild(div);
        return function(q) {
            div.innerHTML = '&shy;<style media="' + q + '"> #mq-test-1 { width: 42px; }</style>';
            docElem.insertBefore(fakeBody, refNode);
            bool = div.offsetWidth === 42;
            docElem.removeChild(fakeBody);
            return {
                matches: bool,
                media: q
            };
        };
    }(w.document);
})(this);
(function(w) {
    "use strict";
    var respond = {};
    w.respond = respond;
    respond.update = function() {};
    var requestQueue = [],
        xmlHttp = function() {
            var xmlhttpmethod = false;
            try {
                xmlhttpmethod = new w.XMLHttpRequest();
            } catch (e) {
                xmlhttpmethod = new w.ActiveXObject("Microsoft.XMLHTTP");
            }
            return function() {
                return xmlhttpmethod;
            };
        }(),
        ajax = function(url, callback) {
            var req = xmlHttp();
            if (!req) {
                return;
            }
            req.open("GET", url, true);
            req.onreadystatechange = function() {
                if (req.readyState !== 4 || req.status !== 200 && req.status !== 304) {
                    return;
                }
                callback(req.responseText);
            };
            if (req.readyState === 4) {
                return;
            }
            req.send(null);
        };
    respond.ajax = ajax;
    respond.queue = requestQueue;
    respond.regex = {
        media: /@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi,
        keyframes: /@(?:\-(?:o|moz|webkit)\-)?keyframes[^\{]+\{(?:[^\{\}]*\{[^\}\{]*\})+[^\}]*\}/gi,
        urls: /(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,
        findStyles: /@media *([^\{]+)\{([\S\s]+?)$/,
        only: /(only\s+)?([a-zA-Z]+)\s?/,
        minw: /\([\s]*min\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/,
        maxw: /\([\s]*max\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/
    };
    respond.mediaQueriesSupported = w.matchMedia && w.matchMedia("only all") !== null && w.matchMedia("only all").matches;
    if (respond.mediaQueriesSupported) {
        return;
    }
    var doc = w.document,
        docElem = doc.documentElement,
        mediastyles = [],
        rules = [],
        appendedEls = [],
        parsedSheets = {},
        resizeThrottle = 30,
        head = doc.getElementsByTagName("head")[0] || docElem,
        base = doc.getElementsByTagName("base")[0],
        links = head.getElementsByTagName("link"),
        lastCall, resizeDefer, eminpx, getEmValue = function() {
            var ret, div = doc.createElement("div"),
                body = doc.body,
                originalHTMLFontSize = docElem.style.fontSize,
                originalBodyFontSize = body && body.style.fontSize,
                fakeUsed = false;
            div.style.cssText = "position:absolute;font-size:1em;width:1em";
            if (!body) {
                body = fakeUsed = doc.createElement("body");
                body.style.background = "none";
            }
            docElem.style.fontSize = "100%";
            body.style.fontSize = "100%";
            body.appendChild(div);
            if (fakeUsed) {
                docElem.insertBefore(body, docElem.firstChild);
            }
            ret = div.offsetWidth;
            if (fakeUsed) {
                docElem.removeChild(body);
            } else {
                body.removeChild(div);
            }
            docElem.style.fontSize = originalHTMLFontSize;
            if (originalBodyFontSize) {
                body.style.fontSize = originalBodyFontSize;
            }
            ret = eminpx = parseFloat(ret);
            return ret;
        },
        applyMedia = function(fromResize) {
            var name = "clientWidth",
                docElemProp = docElem[name],
                currWidth = doc.compatMode === "CSS1Compat" && docElemProp || doc.body[name] || docElemProp,
                styleBlocks = {},
                lastLink = links[links.length - 1],
                now = new Date().getTime();
            if (fromResize && lastCall && now - lastCall < resizeThrottle) {
                w.clearTimeout(resizeDefer);
                resizeDefer = w.setTimeout(applyMedia, resizeThrottle);
                return;
            } else {
                lastCall = now;
            }
            for (var i in mediastyles) {
                if (mediastyles.hasOwnProperty(i)) {
                    var thisstyle = mediastyles[i],
                        min = thisstyle.minw,
                        max = thisstyle.maxw,
                        minnull = min === null,
                        maxnull = max === null,
                        em = "em";
                    if (!!min) {
                        min = parseFloat(min) * (min.indexOf(em) > -1 ? eminpx || getEmValue() : 1);
                    }
                    if (!!max) {
                        max = parseFloat(max) * (max.indexOf(em) > -1 ? eminpx || getEmValue() : 1);
                    }
                    if (!thisstyle.hasquery || (!minnull || !maxnull) && (minnull || currWidth >= min) && (maxnull || currWidth <= max)) {
                        if (!styleBlocks[thisstyle.media]) {
                            styleBlocks[thisstyle.media] = [];
                        }
                        styleBlocks[thisstyle.media].push(rules[thisstyle.rules]);
                    }
                }
            }
            for (var j in appendedEls) {
                if (appendedEls.hasOwnProperty(j)) {
                    if (appendedEls[j] && appendedEls[j].parentNode === head) {
                        head.removeChild(appendedEls[j]);
                    }
                }
            }
            appendedEls.length = 0;
            for (var k in styleBlocks) {
                if (styleBlocks.hasOwnProperty(k)) {
                    var ss = doc.createElement("style"),
                        css = styleBlocks[k].join("\n");
                    ss.type = "text/css";
                    ss.media = k;
                    head.insertBefore(ss, lastLink.nextSibling);
                    if (ss.styleSheet) {
                        ss.styleSheet.cssText = css;
                    } else {
                        ss.appendChild(doc.createTextNode(css));
                    }
                    appendedEls.push(ss);
                }
            }
        },
        translate = function(styles, href, media) {
            var qs = styles.replace(respond.regex.keyframes, "").match(respond.regex.media),
                ql = qs && qs.length || 0;
            href = href.substring(0, href.lastIndexOf("/"));
            var repUrls = function(css) {
                    return css.replace(respond.regex.urls, "$1" + href + "$2$3");
                },
                useMedia = !ql && media;
            if (href.length) {
                href += "/";
            }
            if (useMedia) {
                ql = 1;
            }
            for (var i = 0; i < ql; i++) {
                var fullq, thisq, eachq, eql;
                if (useMedia) {
                    fullq = media;
                    rules.push(repUrls(styles));
                } else {
                    fullq = qs[i].match(respond.regex.findStyles) && RegExp.$1;
                    rules.push(RegExp.$2 && repUrls(RegExp.$2));
                }
                eachq = fullq.split(",");
                eql = eachq.length;
                for (var j = 0; j < eql; j++) {
                    thisq = eachq[j];
                    mediastyles.push({
                        media: thisq.split("(")[0].match(respond.regex.only) && RegExp.$2 || "all",
                        rules: rules.length - 1,
                        hasquery: thisq.indexOf("(") > -1,
                        minw: thisq.match(respond.regex.minw) && parseFloat(RegExp.$1) + (RegExp.$2 || ""),
                        maxw: thisq.match(respond.regex.maxw) && parseFloat(RegExp.$1) + (RegExp.$2 || "")
                    });
                }
            }
            applyMedia();
        },
        makeRequests = function() {
            if (requestQueue.length) {
                var thisRequest = requestQueue.shift();
                ajax(thisRequest.href, function(styles) {
                    translate(styles, thisRequest.href, thisRequest.media);
                    parsedSheets[thisRequest.href] = true;
                    w.setTimeout(function() {
                        makeRequests();
                    }, 0);
                });
            }
        },
        ripCSS = function() {
            for (var i = 0; i < links.length; i++) {
                var sheet = links[i],
                    href = sheet.href,
                    media = sheet.media,
                    isCSS = sheet.rel && sheet.rel.toLowerCase() === "stylesheet";
                if (!!href && isCSS && !parsedSheets[href]) {
                    if (sheet.styleSheet && sheet.styleSheet.rawCssText) {
                        translate(sheet.styleSheet.rawCssText, href, media);
                        parsedSheets[href] = true;
                    } else {
                        if (!/^([a-zA-Z:]*\/\/)/.test(href) && !base || href.replace(RegExp.$1, "").split("/")[0] === w.location.host) {
                            if (href.substring(0, 2) === "//") {
                                href = w.location.protocol + href;
                            }
                            requestQueue.push({
                                href: href,
                                media: media
                            });
                        }
                    }
                }
            }
            makeRequests();
        };
    ripCSS();
    respond.update = ripCSS;
    respond.getEmValue = getEmValue;

    function callMedia() {
        applyMedia(true);
    }
    if (w.addEventListener) {
        w.addEventListener("resize", callMedia, false);
    } else if (w.attachEvent) {
        w.attachEvent("onresize", callMedia);
    }
})(this);;
(function() {
    "use strict";

    function setup($) {
        $.fn._fadeIn = $.fn.fadeIn;
        var noOp = $.noop || function() {};
        var msie = /MSIE/.test(navigator.userAgent);
        var ie6 = /MSIE 6.0/.test(navigator.userAgent) && !/MSIE 8.0/.test(navigator.userAgent);
        var mode = document.documentMode || 0;
        var setExpr = $.isFunction(document.createElement('div').style.setExpression);
        $.blockUI = function(opts) {
            install(window, opts);
        };
        $.unblockUI = function(opts) {
            remove(window, opts);
        };
        $.growlUI = function(title, message, timeout, onClose) {
            var $m = $('<div class="growlUI"></div>');
            if (title) $m.append('<h1>' + title + '</h1>');
            if (message) $m.append('<h2>' + message + '</h2>');
            if (timeout === undefined) timeout = 3000;
            var callBlock = function(opts) {
                opts = opts || {};
                $.blockUI({
                    message: $m,
                    fadeIn: typeof opts.fadeIn !== 'undefined' ? opts.fadeIn : 700,
                    fadeOut: typeof opts.fadeOut !== 'undefined' ? opts.fadeOut : 1000,
                    timeout: typeof opts.timeout !== 'undefined' ? opts.timeout : timeout,
                    centerY: false,
                    showOverlay: false,
                    onUnblock: onClose,
                    css: $.blockUI.defaults.growlCSS
                });
            };
            callBlock();
            var nonmousedOpacity = $m.css('opacity');
            $m.mouseover(function() {
                callBlock({
                    fadeIn: 0,
                    timeout: 30000
                });
                var displayBlock = $('.blockMsg');
                displayBlock.stop();
                displayBlock.fadeTo(300, 1);
            }).mouseout(function() {
                $('.blockMsg').fadeOut(1000);
            });
        };
        $.fn.block = function(opts) {
            if (this[0] === window) {
                $.blockUI(opts);
                return this;
            }
            var fullOpts = $.extend({}, $.blockUI.defaults, opts || {});
            this.each(function() {
                var $el = $(this);
                if (fullOpts.ignoreIfBlocked && $el.data('blockUI.isBlocked'))
                    return;
                $el.unblock({
                    fadeOut: 0
                });
            });
            return this.each(function() {
                if ($.css(this, 'position') == 'static') {
                    this.style.position = 'relative';
                    $(this).data('blockUI.static', true);
                }
                this.style.zoom = 1;
                install(this, opts);
            });
        };
        $.fn.unblock = function(opts) {
            if (this[0] === window) {
                $.unblockUI(opts);
                return this;
            }
            return this.each(function() {
                remove(this, opts);
            });
        };
        $.blockUI.version = 2.66;
        $.blockUI.defaults = {
            message: '<div>Loading data...</div>',
            title: null,
            draggable: true,
            theme: false,
            css: {
                padding: '20px',
                margin: 0,
                width: '30%',
                top: '40%',
                left: '35%',
                textAlign: 'center',
                color: '#fff',
                border: 'none',
                backgroundColor: '#000',
                cursor: 'wait',
                opacity: .7,
                'border-radius': '4px'
            },
            themedCSS: {
                width: '30%',
                top: '40%',
                left: '35%'
            },
            overlayCSS: {
                backgroundColor: '#000',
                opacity: 0.3,
                cursor: 'wait'
            },
            cursorReset: 'default',
            growlCSS: {
                width: '350px',
                top: '10px',
                left: '',
                right: '10px',
                border: 'none',
                padding: '5px',
                opacity: 0.6,
                cursor: 'default',
                color: '#fff',
                backgroundColor: '#000',
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                'border-radius': '10px'
            },
            iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',
            forceIframe: false,
            baseZ: 1000,
            centerX: true,
            centerY: true,
            allowBodyStretch: true,
            bindEvents: true,
            constrainTabKey: true,
            fadeIn: 200,
            fadeOut: 400,
            timeout: 0,
            showOverlay: true,
            focusInput: true,
            focusableElements: ':input:enabled:visible',
            onBlock: null,
            onUnblock: null,
            onOverlayClick: null,
            quirksmodeOffsetHack: 4,
            blockMsgClass: 'blockMsg',
            ignoreIfBlocked: false
        };
        var pageBlock = null;
        var pageBlockEls = [];

        function install(el, opts) {
            var css, themedCSS;
            var full = (el == window);
            var loading = (opts && opts.message !== undefined ? opts.message : undefined);
            var msg = '<h4><i class="fa fa-spinner fa-spin"></i>  ' + loading + '</h4>';
            opts = $.extend({}, $.blockUI.defaults, opts || {});
            if (opts.ignoreIfBlocked && $(el).data('blockUI.isBlocked'))
                return;
            opts.overlayCSS = $.extend({}, $.blockUI.defaults.overlayCSS, opts.overlayCSS || {});
            css = $.extend({}, $.blockUI.defaults.css, opts.css || {});
            if (opts.onOverlayClick)
                opts.overlayCSS.cursor = 'pointer';
            themedCSS = $.extend({}, $.blockUI.defaults.themedCSS, opts.themedCSS || {});
            msg = msg === undefined ? opts.message : msg;
            if (full && pageBlock)
                remove(window, {
                    fadeOut: 0
                });
            if (msg && typeof msg != 'string' && (msg.parentNode || msg.jquery)) {
                var node = msg.jquery ? msg[0] : msg;
                var data = {};
                $(el).data('blockUI.history', data);
                data.el = node;
                data.parent = node.parentNode;
                data.display = node.style.display;
                data.position = node.style.position;
                if (data.parent)
                    data.parent.removeChild(node);
            }
            $(el).data('blockUI.onUnblock', opts.onUnblock);
            var z = opts.baseZ;
            var lyr1, lyr2, lyr3, s;
            if (msie || opts.forceIframe)
                lyr1 = $('<iframe class="blockUI" style="z-index:' + (z++) + ';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="' + opts.iframeSrc + '"></iframe>');
            else
                lyr1 = $('<div class="blockUI" style="display:none"></div>');
            if (opts.theme)
                lyr2 = $('<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:' + (z++) + ';display:none"></div>');
            else
                lyr2 = $('<div class="blockUI blockOverlay" style="z-index:' + (z++) + ';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');
            if (opts.theme && full) {
                s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:' + (z + 10) + ';display:none;position:fixed">';
                if (opts.title) {
                    s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + (opts.title || '&nbsp;') + '</div>';
                }
                s += '<div class="ui-widget-content ui-dialog-content"></div>';
                s += '</div>';
            } else if (opts.theme) {
                s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:' + (z + 10) + ';display:none;position:absolute">';
                if (opts.title) {
                    s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + (opts.title || '&nbsp;') + '</div>';
                }
                s += '<div class="ui-widget-content ui-dialog-content"></div>';
                s += '</div>';
            } else if (full) {
                s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage" style="z-index:' + (z + 10) + ';display:none;position:fixed"></div>';
            } else {
                s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement" style="z-index:' + (z + 10) + ';display:none;position:absolute"></div>';
            }
            lyr3 = $(s);
            if (msg) {
                if (opts.theme) {
                    lyr3.css(themedCSS);
                    lyr3.addClass('ui-widget-content');
                } else
                    lyr3.css(css);
            }
            if (!opts.theme)
                lyr2.css(opts.overlayCSS);
            lyr2.css('position', full ? 'fixed' : 'absolute');
            if (msie || opts.forceIframe)
                lyr1.css('opacity', 0.0);
            var layers = [lyr1, lyr2, lyr3],
                $par = full ? $('body') : $(el);
            $.each(layers, function() {
                this.appendTo($par);
            });
            if (opts.theme && opts.draggable && $.fn.draggable) {
                lyr3.draggable({
                    handle: '.ui-dialog-titlebar',
                    cancel: 'li'
                });
            }
            var expr = setExpr && (!$.support.boxModel || $('object,embed', full ? null : el).length > 0);
            if (ie6 || expr) {
                if (full && opts.allowBodyStretch && $.support.boxModel)
                    $('html,body').css('height', '100%');
                if ((ie6 || !$.support.boxModel) && !full) {
                    var t = sz(el, 'borderTopWidth'),
                        l = sz(el, 'borderLeftWidth');
                    var fixT = t ? '(0 - ' + t + ')' : 0;
                    var fixL = l ? '(0 - ' + l + ')' : 0;
                }
                $.each(layers, function(i, o) {
                    var s = o[0].style;
                    s.position = 'absolute';
                    if (i < 2) {
                        if (full)
                            s.setExpression('height', 'Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:' + opts.quirksmodeOffsetHack + ') + "px"');
                        else
                            s.setExpression('height', 'this.parentNode.offsetHeight + "px"');
                        if (full)
                            s.setExpression('width', 'jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"');
                        else
                            s.setExpression('width', 'this.parentNode.offsetWidth + "px"');
                        if (fixL) s.setExpression('left', fixL);
                        if (fixT) s.setExpression('top', fixT);
                    } else if (opts.centerY) {
                        if (full) s.setExpression('top', '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
                        s.marginTop = 0;
                    } else if (!opts.centerY && full) {
                        var top = (opts.css && opts.css.top) ? parseInt(opts.css.top, 10) : 0;
                        var expression = '((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + ' + top + ') + "px"';
                        s.setExpression('top', expression);
                    }
                });
            }
            if (msg) {
                if (opts.theme)
                    lyr3.find('.ui-widget-content').append(msg);
                else
                    lyr3.append(msg);
                if (msg.jquery || msg.nodeType)
                    $(msg).show();
            }
            if ((msie || opts.forceIframe) && opts.showOverlay)
                lyr1.show();
            if (opts.fadeIn) {
                var cb = opts.onBlock ? opts.onBlock : noOp;
                var cb1 = (opts.showOverlay && !msg) ? cb : noOp;
                var cb2 = msg ? cb : noOp;
                if (opts.showOverlay)
                    lyr2._fadeIn(opts.fadeIn, cb1);
                if (msg)
                    lyr3._fadeIn(opts.fadeIn, cb2);
            } else {
                if (opts.showOverlay)
                    lyr2.show();
                if (msg)
                    lyr3.show();
                if (opts.onBlock)
                    opts.onBlock();
            }
            bind(1, el, opts);
            if (full) {
                pageBlock = lyr3[0];
                pageBlockEls = $(opts.focusableElements, pageBlock);
                if (opts.focusInput)
                    setTimeout(focus, 20);
            } else
                center(lyr3[0], opts.centerX, opts.centerY);
            if (opts.timeout) {
                var to = setTimeout(function() {
                    if (full)
                        $.unblockUI(opts);
                    else
                        $(el).unblock(opts);
                }, opts.timeout);
                $(el).data('blockUI.timeout', to);
            }
        }

        function remove(el, opts) {
            var count;
            var full = (el == window);
            var $el = $(el);
            var data = $el.data('blockUI.history');
            var to = $el.data('blockUI.timeout');
            if (to) {
                clearTimeout(to);
                $el.removeData('blockUI.timeout');
            }
            opts = $.extend({}, $.blockUI.defaults, opts || {});
            bind(0, el, opts);
            if (opts.onUnblock === null) {
                opts.onUnblock = $el.data('blockUI.onUnblock');
                $el.removeData('blockUI.onUnblock');
            }
            var els;
            if (full)
                els = $('body').children().filter('.blockUI').add('body > .blockUI');
            else
                els = $el.find('>.blockUI');
            if (opts.cursorReset) {
                if (els.length > 1)
                    els[1].style.cursor = opts.cursorReset;
                if (els.length > 2)
                    els[2].style.cursor = opts.cursorReset;
            }
            if (full)
                pageBlock = pageBlockEls = null;
            if (opts.fadeOut) {
                count = els.length;
                els.stop().fadeOut(opts.fadeOut, function() {
                    if (--count === 0)
                        reset(els, data, opts, el);
                });
            } else
                reset(els, data, opts, el);
        }

        function reset(els, data, opts, el) {
            var $el = $(el);
            if ($el.data('blockUI.isBlocked'))
                return;
            els.each(function(i, o) {
                if (this.parentNode)
                    this.parentNode.removeChild(this);
            });
            if (data && data.el) {
                data.el.style.display = data.display;
                data.el.style.position = data.position;
                if (data.parent)
                    data.parent.appendChild(data.el);
                $el.removeData('blockUI.history');
            }
            if ($el.data('blockUI.static')) {
                $el.css('position', 'static');
            }
            if (typeof opts.onUnblock == 'function')
                opts.onUnblock(el, opts);
            var body = $(document.body),
                w = body.width(),
                cssW = body[0].style.width;
            body.width(w - 1).width(w);
            body[0].style.width = cssW;
        }

        function bind(b, el, opts) {
            var full = el == window,
                $el = $(el);
            if (!b && (full && !pageBlock || !full && !$el.data('blockUI.isBlocked')))
                return;
            $el.data('blockUI.isBlocked', b);
            if (!full || !opts.bindEvents || (b && !opts.showOverlay))
                return;
            var events = 'mousedown mouseup keydown keypress keyup touchstart touchend touchmove';
            if (b)
                $(document).bind(events, opts, handler);
            else
                $(document).unbind(events, handler);
        }

        function handler(e) {
            if (e.type === 'keydown' && e.keyCode && e.keyCode == 9) {
                if (pageBlock && e.data.constrainTabKey) {
                    var els = pageBlockEls;
                    var fwd = !e.shiftKey && e.target === els[els.length - 1];
                    var back = e.shiftKey && e.target === els[0];
                    if (fwd || back) {
                        setTimeout(function() {
                            focus(back);
                        }, 10);
                        return false;
                    }
                }
            }
            var opts = e.data;
            var target = $(e.target);
            if (target.hasClass('blockOverlay') && opts.onOverlayClick)
                opts.onOverlayClick(e);
            if (target.parents('div.' + opts.blockMsgClass).length > 0)
                return true;
            return target.parents().children().filter('div.blockUI').length === 0;
        }

        function focus(back) {
            if (!pageBlockEls)
                return;
            var e = pageBlockEls[back === true ? pageBlockEls.length - 1 : 0];
            if (e)
                e.focus();
        }

        function center(el, x, y) {
            var p = el.parentNode,
                s = el.style;
            var l = ((p.offsetWidth - el.offsetWidth) / 2) - sz(p, 'borderLeftWidth');
            var t = ((p.offsetHeight - el.offsetHeight) / 2) - sz(p, 'borderTopWidth');
            if (x) s.left = l > 0 ? (l + 'px') : '0';
            if (y) s.top = t > 0 ? (t + 'px') : '0';
        }

        function sz(el, p) {
            return parseInt($.css(el, p), 10) || 0;
        }
    }
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        define(['jquery'], setup);
    } else {
        setup(jQuery);
    }
})();

function QR8bitByte(data) {
    this.mode = QRMode.MODE_8BIT_BYTE;
    this.data = data;
}
QR8bitByte.prototype = {
    getLength: function(buffer) {
        return this.data.length;
    },
    write: function(buffer) {
        for (var i = 0; i < this.data.length; i++) {
            buffer.put(this.data.charCodeAt(i), 8);
        }
    }
};

function QRCode(typeNumber, errorCorrectLevel) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = errorCorrectLevel;
    this.modules = null;
    this.moduleCount = 0;
    this.dataCache = null;
    this.dataList = new Array();
}
QRCode.prototype = {
    addData: function(data) {
        var newData = new QR8bitByte(data);
        this.dataList.push(newData);
        this.dataCache = null;
    },
    isDark: function(row, col) {
        if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
            throw new Error(row + "," + col);
        }
        return this.modules[row][col];
    },
    getModuleCount: function() {
        return this.moduleCount;
    },
    make: function() {
        if (this.typeNumber < 1) {
            var typeNumber = 1;
            for (typeNumber = 1; typeNumber < 40; typeNumber++) {
                var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this.errorCorrectLevel);
                var buffer = new QRBitBuffer();
                var totalDataCount = 0;
                for (var i = 0; i < rsBlocks.length; i++) {
                    totalDataCount += rsBlocks[i].dataCount;
                }
                for (var i = 0; i < this.dataList.length; i++) {
                    var data = this.dataList[i];
                    buffer.put(data.mode, 4);
                    buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
                    data.write(buffer);
                }
                if (buffer.getLengthInBits() <= totalDataCount * 8)
                    break;
            }
            this.typeNumber = typeNumber;
        }
        this.makeImpl(false, this.getBestMaskPattern());
    },
    makeImpl: function(test, maskPattern) {
        this.moduleCount = this.typeNumber * 4 + 17;
        this.modules = new Array(this.moduleCount);
        for (var row = 0; row < this.moduleCount; row++) {
            this.modules[row] = new Array(this.moduleCount);
            for (var col = 0; col < this.moduleCount; col++) {
                this.modules[row][col] = null;
            }
        }
        this.setupPositionProbePattern(0, 0);
        this.setupPositionProbePattern(this.moduleCount - 7, 0);
        this.setupPositionProbePattern(0, this.moduleCount - 7);
        this.setupPositionAdjustPattern();
        this.setupTimingPattern();
        this.setupTypeInfo(test, maskPattern);
        if (this.typeNumber >= 7) {
            this.setupTypeNumber(test);
        }
        if (this.dataCache == null) {
            this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
        }
        this.mapData(this.dataCache, maskPattern);
    },
    setupPositionProbePattern: function(row, col) {
        for (var r = -1; r <= 7; r++) {
            if (row + r <= -1 || this.moduleCount <= row + r) continue;
            for (var c = -1; c <= 7; c++) {
                if (col + c <= -1 || this.moduleCount <= col + c) continue;
                if ((0 <= r && r <= 6 && (c == 0 || c == 6)) || (0 <= c && c <= 6 && (r == 0 || r == 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
                    this.modules[row + r][col + c] = true;
                } else {
                    this.modules[row + r][col + c] = false;
                }
            }
        }
    },
    getBestMaskPattern: function() {
        var minLostPoint = 0;
        var pattern = 0;
        for (var i = 0; i < 8; i++) {
            this.makeImpl(true, i);
            var lostPoint = QRUtil.getLostPoint(this);
            if (i == 0 || minLostPoint > lostPoint) {
                minLostPoint = lostPoint;
                pattern = i;
            }
        }
        return pattern;
    },
    createMovieClip: function(target_mc, instance_name, depth) {
        var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
        var cs = 1;
        this.make();
        for (var row = 0; row < this.modules.length; row++) {
            var y = row * cs;
            for (var col = 0; col < this.modules[row].length; col++) {
                var x = col * cs;
                var dark = this.modules[row][col];
                if (dark) {
                    qr_mc.beginFill(0, 100);
                    qr_mc.moveTo(x, y);
                    qr_mc.lineTo(x + cs, y);
                    qr_mc.lineTo(x + cs, y + cs);
                    qr_mc.lineTo(x, y + cs);
                    qr_mc.endFill();
                }
            }
        }
        return qr_mc;
    },
    setupTimingPattern: function() {
        for (var r = 8; r < this.moduleCount - 8; r++) {
            if (this.modules[r][6] != null) {
                continue;
            }
            this.modules[r][6] = (r % 2 == 0);
        }
        for (var c = 8; c < this.moduleCount - 8; c++) {
            if (this.modules[6][c] != null) {
                continue;
            }
            this.modules[6][c] = (c % 2 == 0);
        }
    },
    setupPositionAdjustPattern: function() {
        var pos = QRUtil.getPatternPosition(this.typeNumber);
        for (var i = 0; i < pos.length; i++) {
            for (var j = 0; j < pos.length; j++) {
                var row = pos[i];
                var col = pos[j];
                if (this.modules[row][col] != null) {
                    continue;
                }
                for (var r = -2; r <= 2; r++) {
                    for (var c = -2; c <= 2; c++) {
                        if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
                            this.modules[row + r][col + c] = true;
                        } else {
                            this.modules[row + r][col + c] = false;
                        }
                    }
                }
            }
        }
    },
    setupTypeNumber: function(test) {
        var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
        for (var i = 0; i < 18; i++) {
            var mod = (!test && ((bits >> i) & 1) == 1);
            this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
        }
        for (var i = 0; i < 18; i++) {
            var mod = (!test && ((bits >> i) & 1) == 1);
            this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
        }
    },
    setupTypeInfo: function(test, maskPattern) {
        var data = (this.errorCorrectLevel << 3) | maskPattern;
        var bits = QRUtil.getBCHTypeInfo(data);
        for (var i = 0; i < 15; i++) {
            var mod = (!test && ((bits >> i) & 1) == 1);
            if (i < 6) {
                this.modules[i][8] = mod;
            } else if (i < 8) {
                this.modules[i + 1][8] = mod;
            } else {
                this.modules[this.moduleCount - 15 + i][8] = mod;
            }
        }
        for (var i = 0; i < 15; i++) {
            var mod = (!test && ((bits >> i) & 1) == 1);
            if (i < 8) {
                this.modules[8][this.moduleCount - i - 1] = mod;
            } else if (i < 9) {
                this.modules[8][15 - i - 1 + 1] = mod;
            } else {
                this.modules[8][15 - i - 1] = mod;
            }
        }
        this.modules[this.moduleCount - 8][8] = (!test);
    },
    mapData: function(data, maskPattern) {
        var inc = -1;
        var row = this.moduleCount - 1;
        var bitIndex = 7;
        var byteIndex = 0;
        for (var col = this.moduleCount - 1; col > 0; col -= 2) {
            if (col == 6) col--;
            while (true) {
                for (var c = 0; c < 2; c++) {
                    if (this.modules[row][col - c] == null) {
                        var dark = false;
                        if (byteIndex < data.length) {
                            dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
                        }
                        var mask = QRUtil.getMask(maskPattern, row, col - c);
                        if (mask) {
                            dark = !dark;
                        }
                        this.modules[row][col - c] = dark;
                        bitIndex--;
                        if (bitIndex == -1) {
                            byteIndex++;
                            bitIndex = 7;
                        }
                    }
                }
                row += inc;
                if (row < 0 || this.moduleCount <= row) {
                    row -= inc;
                    inc = -inc;
                    break;
                }
            }
        }
    }
};
QRCode.PAD0 = 0xEC;
QRCode.PAD1 = 0x11;
QRCode.createData = function(typeNumber, errorCorrectLevel, dataList) {
    var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
    var buffer = new QRBitBuffer();
    for (var i = 0; i < dataList.length; i++) {
        var data = dataList[i];
        buffer.put(data.mode, 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
        data.write(buffer);
    }
    var totalDataCount = 0;
    for (var i = 0; i < rsBlocks.length; i++) {
        totalDataCount += rsBlocks[i].dataCount;
    }
    if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")");
    }
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
    }
    while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
    }
    while (true) {
        if (buffer.getLengthInBits() >= totalDataCount * 8) {
            break;
        }
        buffer.put(QRCode.PAD0, 8);
        if (buffer.getLengthInBits() >= totalDataCount * 8) {
            break;
        }
        buffer.put(QRCode.PAD1, 8);
    }
    return QRCode.createBytes(buffer, rsBlocks);
}
QRCode.createBytes = function(buffer, rsBlocks) {
    var offset = 0;
    var maxDcCount = 0;
    var maxEcCount = 0;
    var dcdata = new Array(rsBlocks.length);
    var ecdata = new Array(rsBlocks.length);
    for (var r = 0; r < rsBlocks.length; r++) {
        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;
        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);
        dcdata[r] = new Array(dcCount);
        for (var i = 0; i < dcdata[r].length; i++) {
            dcdata[r][i] = 0xff & buffer.buffer[i + offset];
        }
        offset += dcCount;
        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i++) {
            var modIndex = i + modPoly.getLength() - ecdata[r].length;
            ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
        }
    }
    var totalCodeCount = 0;
    for (var i = 0; i < rsBlocks.length; i++) {
        totalCodeCount += rsBlocks[i].totalCount;
    }
    var data = new Array(totalCodeCount);
    var index = 0;
    for (var i = 0; i < maxDcCount; i++) {
        for (var r = 0; r < rsBlocks.length; r++) {
            if (i < dcdata[r].length) {
                data[index++] = dcdata[r][i];
            }
        }
    }
    for (var i = 0; i < maxEcCount; i++) {
        for (var r = 0; r < rsBlocks.length; r++) {
            if (i < ecdata[r].length) {
                data[index++] = ecdata[r][i];
            }
        }
    }
    return data;
}
var QRMode = {
    MODE_NUMBER: 1 << 0,
    MODE_ALPHA_NUM: 1 << 1,
    MODE_8BIT_BYTE: 1 << 2,
    MODE_KANJI: 1 << 3
};
var QRErrorCorrectLevel = {
    L: 1,
    M: 0,
    Q: 3,
    H: 2
};
var QRMaskPattern = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
};
var QRUtil = {
    PATTERN_POSITION_TABLE: [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170]
    ],
    G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
    G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
    G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),
    getBCHTypeInfo: function(data) {
        var d = data << 10;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
            d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15)));
        }
        return ((data << 10) | d) ^ QRUtil.G15_MASK;
    },
    getBCHTypeNumber: function(data) {
        var d = data << 12;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
            d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18)));
        }
        return (data << 12) | d;
    },
    getBCHDigit: function(data) {
        var digit = 0;
        while (data != 0) {
            digit++;
            data >>>= 1;
        }
        return digit;
    },
    getPatternPosition: function(typeNumber) {
        return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },
    getMask: function(maskPattern, i, j) {
        switch (maskPattern) {
            case QRMaskPattern.PATTERN000:
                return (i + j) % 2 == 0;
            case QRMaskPattern.PATTERN001:
                return i % 2 == 0;
            case QRMaskPattern.PATTERN010:
                return j % 3 == 0;
            case QRMaskPattern.PATTERN011:
                return (i + j) % 3 == 0;
            case QRMaskPattern.PATTERN100:
                return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
            case QRMaskPattern.PATTERN101:
                return (i * j) % 2 + (i * j) % 3 == 0;
            case QRMaskPattern.PATTERN110:
                return ((i * j) % 2 + (i * j) % 3) % 2 == 0;
            case QRMaskPattern.PATTERN111:
                return ((i * j) % 3 + (i + j) % 2) % 2 == 0;
            default:
                throw new Error("bad maskPattern:" + maskPattern);
        }
    },
    getErrorCorrectPolynomial: function(errorCorrectLength) {
        var a = new QRPolynomial([1], 0);
        for (var i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
        }
        return a;
    },
    getLengthInBits: function(mode, type) {
        if (1 <= type && type < 10) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 10;
                case QRMode.MODE_ALPHA_NUM:
                    return 9;
                case QRMode.MODE_8BIT_BYTE:
                    return 8;
                case QRMode.MODE_KANJI:
                    return 8;
                default:
                    throw new Error("mode:" + mode);
            }
        } else if (type < 27) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 12;
                case QRMode.MODE_ALPHA_NUM:
                    return 11;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 10;
                default:
                    throw new Error("mode:" + mode);
            }
        } else if (type < 41) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 14;
                case QRMode.MODE_ALPHA_NUM:
                    return 13;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 12;
                default:
                    throw new Error("mode:" + mode);
            }
        } else {
            throw new Error("type:" + type);
        }
    },
    getLostPoint: function(qrCode) {
        var moduleCount = qrCode.getModuleCount();
        var lostPoint = 0;
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount; col++) {
                var sameCount = 0;
                var dark = qrCode.isDark(row, col);
                for (var r = -1; r <= 1; r++) {
                    if (row + r < 0 || moduleCount <= row + r) {
                        continue;
                    }
                    for (var c = -1; c <= 1; c++) {
                        if (col + c < 0 || moduleCount <= col + c) {
                            continue;
                        }
                        if (r == 0 && c == 0) {
                            continue;
                        }
                        if (dark == qrCode.isDark(row + r, col + c)) {
                            sameCount++;
                        }
                    }
                }
                if (sameCount > 5) {
                    lostPoint += (3 + sameCount - 5);
                }
            }
        }
        for (var row = 0; row < moduleCount - 1; row++) {
            for (var col = 0; col < moduleCount - 1; col++) {
                var count = 0;
                if (qrCode.isDark(row, col)) count++;
                if (qrCode.isDark(row + 1, col)) count++;
                if (qrCode.isDark(row, col + 1)) count++;
                if (qrCode.isDark(row + 1, col + 1)) count++;
                if (count == 0 || count == 4) {
                    lostPoint += 3;
                }
            }
        }
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount - 6; col++) {
                if (qrCode.isDark(row, col) && !qrCode.isDark(row, col + 1) && qrCode.isDark(row, col + 2) && qrCode.isDark(row, col + 3) && qrCode.isDark(row, col + 4) && !qrCode.isDark(row, col + 5) && qrCode.isDark(row, col + 6)) {
                    lostPoint += 40;
                }
            }
        }
        for (var col = 0; col < moduleCount; col++) {
            for (var row = 0; row < moduleCount - 6; row++) {
                if (qrCode.isDark(row, col) && !qrCode.isDark(row + 1, col) && qrCode.isDark(row + 2, col) && qrCode.isDark(row + 3, col) && qrCode.isDark(row + 4, col) && !qrCode.isDark(row + 5, col) && qrCode.isDark(row + 6, col)) {
                    lostPoint += 40;
                }
            }
        }
        var darkCount = 0;
        for (var col = 0; col < moduleCount; col++) {
            for (var row = 0; row < moduleCount; row++) {
                if (qrCode.isDark(row, col)) {
                    darkCount++;
                }
            }
        }
        var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;
        return lostPoint;
    }
};
var QRMath = {
    glog: function(n) {
        if (n < 1) {
            throw new Error("glog(" + n + ")");
        }
        return QRMath.LOG_TABLE[n];
    },
    gexp: function(n) {
        while (n < 0) {
            n += 255;
        }
        while (n >= 256) {
            n -= 255;
        }
        return QRMath.EXP_TABLE[n];
    },
    EXP_TABLE: new Array(256),
    LOG_TABLE: new Array(256)
};
for (var i = 0; i < 8; i++) {
    QRMath.EXP_TABLE[i] = 1 << i;
}
for (var i = 8; i < 256; i++) {
    QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
}
for (var i = 0; i < 255; i++) {
    QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
}

function QRPolynomial(num, shift) {
    if (num.length == undefined) {
        throw new Error(num.length + "/" + shift);
    }
    var offset = 0;
    while (offset < num.length && num[offset] == 0) {
        offset++;
    }
    this.num = new Array(num.length - offset + shift);
    for (var i = 0; i < num.length - offset; i++) {
        this.num[i] = num[i + offset];
    }
}
QRPolynomial.prototype = {
    get: function(index) {
        return this.num[index];
    },
    getLength: function() {
        return this.num.length;
    },
    multiply: function(e) {
        var num = new Array(this.getLength() + e.getLength() - 1);
        for (var i = 0; i < this.getLength(); i++) {
            for (var j = 0; j < e.getLength(); j++) {
                num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
            }
        }
        return new QRPolynomial(num, 0);
    },
    mod: function(e) {
        if (this.getLength() - e.getLength() < 0) {
            return this;
        }
        var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
        var num = new Array(this.getLength());
        for (var i = 0; i < this.getLength(); i++) {
            num[i] = this.get(i);
        }
        for (var i = 0; i < e.getLength(); i++) {
            num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
        }
        return new QRPolynomial(num, 0).mod(e);
    }
};

function QRRSBlock(totalCount, dataCount) {
    this.totalCount = totalCount;
    this.dataCount = dataCount;
}
QRRSBlock.RS_BLOCK_TABLE = [
    [1, 26, 19],
    [1, 26, 16],
    [1, 26, 13],
    [1, 26, 9],
    [1, 44, 34],
    [1, 44, 28],
    [1, 44, 22],
    [1, 44, 16],
    [1, 70, 55],
    [1, 70, 44],
    [2, 35, 17],
    [2, 35, 13],
    [1, 100, 80],
    [2, 50, 32],
    [2, 50, 24],
    [4, 25, 9],
    [1, 134, 108],
    [2, 67, 43],
    [2, 33, 15, 2, 34, 16],
    [2, 33, 11, 2, 34, 12],
    [2, 86, 68],
    [4, 43, 27],
    [4, 43, 19],
    [4, 43, 15],
    [2, 98, 78],
    [4, 49, 31],
    [2, 32, 14, 4, 33, 15],
    [4, 39, 13, 1, 40, 14],
    [2, 121, 97],
    [2, 60, 38, 2, 61, 39],
    [4, 40, 18, 2, 41, 19],
    [4, 40, 14, 2, 41, 15],
    [2, 146, 116],
    [3, 58, 36, 2, 59, 37],
    [4, 36, 16, 4, 37, 17],
    [4, 36, 12, 4, 37, 13],
    [2, 86, 68, 2, 87, 69],
    [4, 69, 43, 1, 70, 44],
    [6, 43, 19, 2, 44, 20],
    [6, 43, 15, 2, 44, 16],
    [4, 101, 81],
    [1, 80, 50, 4, 81, 51],
    [4, 50, 22, 4, 51, 23],
    [3, 36, 12, 8, 37, 13],
    [2, 116, 92, 2, 117, 93],
    [6, 58, 36, 2, 59, 37],
    [4, 46, 20, 6, 47, 21],
    [7, 42, 14, 4, 43, 15],
    [4, 133, 107],
    [8, 59, 37, 1, 60, 38],
    [8, 44, 20, 4, 45, 21],
    [12, 33, 11, 4, 34, 12],
    [3, 145, 115, 1, 146, 116],
    [4, 64, 40, 5, 65, 41],
    [11, 36, 16, 5, 37, 17],
    [11, 36, 12, 5, 37, 13],
    [5, 109, 87, 1, 110, 88],
    [5, 65, 41, 5, 66, 42],
    [5, 54, 24, 7, 55, 25],
    [11, 36, 12],
    [5, 122, 98, 1, 123, 99],
    [7, 73, 45, 3, 74, 46],
    [15, 43, 19, 2, 44, 20],
    [3, 45, 15, 13, 46, 16],
    [1, 135, 107, 5, 136, 108],
    [10, 74, 46, 1, 75, 47],
    [1, 50, 22, 15, 51, 23],
    [2, 42, 14, 17, 43, 15],
    [5, 150, 120, 1, 151, 121],
    [9, 69, 43, 4, 70, 44],
    [17, 50, 22, 1, 51, 23],
    [2, 42, 14, 19, 43, 15],
    [3, 141, 113, 4, 142, 114],
    [3, 70, 44, 11, 71, 45],
    [17, 47, 21, 4, 48, 22],
    [9, 39, 13, 16, 40, 14],
    [3, 135, 107, 5, 136, 108],
    [3, 67, 41, 13, 68, 42],
    [15, 54, 24, 5, 55, 25],
    [15, 43, 15, 10, 44, 16],
    [4, 144, 116, 4, 145, 117],
    [17, 68, 42],
    [17, 50, 22, 6, 51, 23],
    [19, 46, 16, 6, 47, 17],
    [2, 139, 111, 7, 140, 112],
    [17, 74, 46],
    [7, 54, 24, 16, 55, 25],
    [34, 37, 13],
    [4, 151, 121, 5, 152, 122],
    [4, 75, 47, 14, 76, 48],
    [11, 54, 24, 14, 55, 25],
    [16, 45, 15, 14, 46, 16],
    [6, 147, 117, 4, 148, 118],
    [6, 73, 45, 14, 74, 46],
    [11, 54, 24, 16, 55, 25],
    [30, 46, 16, 2, 47, 17],
    [8, 132, 106, 4, 133, 107],
    [8, 75, 47, 13, 76, 48],
    [7, 54, 24, 22, 55, 25],
    [22, 45, 15, 13, 46, 16],
    [10, 142, 114, 2, 143, 115],
    [19, 74, 46, 4, 75, 47],
    [28, 50, 22, 6, 51, 23],
    [33, 46, 16, 4, 47, 17],
    [8, 152, 122, 4, 153, 123],
    [22, 73, 45, 3, 74, 46],
    [8, 53, 23, 26, 54, 24],
    [12, 45, 15, 28, 46, 16],
    [3, 147, 117, 10, 148, 118],
    [3, 73, 45, 23, 74, 46],
    [4, 54, 24, 31, 55, 25],
    [11, 45, 15, 31, 46, 16],
    [7, 146, 116, 7, 147, 117],
    [21, 73, 45, 7, 74, 46],
    [1, 53, 23, 37, 54, 24],
    [19, 45, 15, 26, 46, 16],
    [5, 145, 115, 10, 146, 116],
    [19, 75, 47, 10, 76, 48],
    [15, 54, 24, 25, 55, 25],
    [23, 45, 15, 25, 46, 16],
    [13, 145, 115, 3, 146, 116],
    [2, 74, 46, 29, 75, 47],
    [42, 54, 24, 1, 55, 25],
    [23, 45, 15, 28, 46, 16],
    [17, 145, 115],
    [10, 74, 46, 23, 75, 47],
    [10, 54, 24, 35, 55, 25],
    [19, 45, 15, 35, 46, 16],
    [17, 145, 115, 1, 146, 116],
    [14, 74, 46, 21, 75, 47],
    [29, 54, 24, 19, 55, 25],
    [11, 45, 15, 46, 46, 16],
    [13, 145, 115, 6, 146, 116],
    [14, 74, 46, 23, 75, 47],
    [44, 54, 24, 7, 55, 25],
    [59, 46, 16, 1, 47, 17],
    [12, 151, 121, 7, 152, 122],
    [12, 75, 47, 26, 76, 48],
    [39, 54, 24, 14, 55, 25],
    [22, 45, 15, 41, 46, 16],
    [6, 151, 121, 14, 152, 122],
    [6, 75, 47, 34, 76, 48],
    [46, 54, 24, 10, 55, 25],
    [2, 45, 15, 64, 46, 16],
    [17, 152, 122, 4, 153, 123],
    [29, 74, 46, 14, 75, 47],
    [49, 54, 24, 10, 55, 25],
    [24, 45, 15, 46, 46, 16],
    [4, 152, 122, 18, 153, 123],
    [13, 74, 46, 32, 75, 47],
    [48, 54, 24, 14, 55, 25],
    [42, 45, 15, 32, 46, 16],
    [20, 147, 117, 4, 148, 118],
    [40, 75, 47, 7, 76, 48],
    [43, 54, 24, 22, 55, 25],
    [10, 45, 15, 67, 46, 16],
    [19, 148, 118, 6, 149, 119],
    [18, 75, 47, 31, 76, 48],
    [34, 54, 24, 34, 55, 25],
    [20, 45, 15, 61, 46, 16]
];
QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
    var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
    if (rsBlock == undefined) {
        throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
    }
    var length = rsBlock.length / 3;
    var list = new Array();
    for (var i = 0; i < length; i++) {
        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];
        for (var j = 0; j < count; j++) {
            list.push(new QRRSBlock(totalCount, dataCount));
        }
    }
    return list;
}
QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {
    switch (errorCorrectLevel) {
        case QRErrorCorrectLevel.L:
            return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
        case QRErrorCorrectLevel.M:
            return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
        case QRErrorCorrectLevel.Q:
            return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
        case QRErrorCorrectLevel.H:
            return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
        default:
            return undefined;
    }
}

function QRBitBuffer() {
    this.buffer = new Array();
    this.length = 0;
}
QRBitBuffer.prototype = {
    get: function(index) {
        var bufIndex = Math.floor(index / 8);
        return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) == 1;
    },
    put: function(num, length) {
        for (var i = 0; i < length; i++) {
            this.putBit(((num >>> (length - i - 1)) & 1) == 1);
        }
    },
    getLengthInBits: function() {
        return this.length;
    },
    putBit: function(bit) {
        var bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
            this.buffer.push(0);
        }
        if (bit) {
            this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
        }
        this.length++;
    }
};
(function($) {
    $.fn.qrcode = function(options) {
        if (typeof options === 'string') {
            options = {
                text: options
            };
        }
        options = $.extend({}, {
            render: "canvas",
            width: 256,
            height: 256,
            typeNumber: -1,
            correctLevel: QRErrorCorrectLevel.H,
            background: "#ffffff",
            foreground: "#000000"
        }, options);
        var createCanvas = function() {
            var qrcode = new QRCode(options.typeNumber, options.correctLevel);
            qrcode.addData(options.text);
            qrcode.make();
            var canvas = document.createElement('canvas');
            canvas.width = options.width;
            canvas.height = options.height;
            var ctx = canvas.getContext('2d');
            var tileW = options.width / qrcode.getModuleCount();
            var tileH = options.height / qrcode.getModuleCount();
            for (var row = 0; row < qrcode.getModuleCount(); row++) {
                for (var col = 0; col < qrcode.getModuleCount(); col++) {
                    ctx.fillStyle = qrcode.isDark(row, col) ? options.foreground : options.background;
                    var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                    var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                    ctx.fillRect(Math.round(col * tileW), Math.round(row * tileH), w, h);
                }
            }
            return canvas;
        }
        var createTable = function() {
            var qrcode = new QRCode(options.typeNumber, options.correctLevel);
            qrcode.addData(options.text);
            qrcode.make();
            var $table = $('<table></table>').css("width", options.width + "px").css("height", options.height + "px").css("border", "0px").css("border-collapse", "collapse").css('background-color', options.background);
            var tileW = options.width / qrcode.getModuleCount();
            var tileH = options.height / qrcode.getModuleCount();
            for (var row = 0; row < qrcode.getModuleCount(); row++) {
                var $row = $('<tr></tr>').css('height', tileH + "px").appendTo($table);
                for (var col = 0; col < qrcode.getModuleCount(); col++) {
                    $('<td></td>').css('width', tileW + "px").css('background-color', qrcode.isDark(row, col) ? options.foreground : options.background).appendTo($row);
                }
            }
            return $table;
        }
        return this.each(function() {
            var element = options.render == "canvas" ? createCanvas() : createTable();
            $(element).appendTo(this);
        });
    };
})(jQuery);
(function($) {
    var $ie6 = (function() {
        return false === $.support.boxModel && $.support.objectAll && $.support.leadingWhitespace;
    })();
    $.jGrowl = function(m, o) {
        if ($('#jGrowl').length === 0)
            $('<div id="jGrowl"></div>').addClass((o && o.position) ? o.position : $.jGrowl.defaults.position).appendTo('body');
        $('#jGrowl').jGrowl(m, o);
    };
    $.fn.jGrowl = function(m, o) {
        if ($.isFunction(this.each)) {
            var args = arguments;
            return this.each(function() {
                if ($(this).data('jGrowl.instance') === undefined) {
                    $(this).data('jGrowl.instance', $.extend(new $.fn.jGrowl(), {
                        notifications: [],
                        element: null,
                        interval: null
                    }));
                    $(this).data('jGrowl.instance').startup(this);
                }
                if ($.isFunction($(this).data('jGrowl.instance')[m])) {
                    $(this).data('jGrowl.instance')[m].apply($(this).data('jGrowl.instance'), $.makeArray(args).slice(1));
                } else {
                    $(this).data('jGrowl.instance').create(m, o);
                }
            });
        }
    };
    $.extend($.fn.jGrowl.prototype, {
        defaults: {
            pool: 6,
            header: '',
            group: '',
            sticky: false,
            position: 'bottom-left',
            glue: 'after',
            theme: 'default',
            themeState: 'highlight',
            corners: '',
            check: 50,
            life: 4000,
            closeDuration: 'fast',
            openDuration: 'fast',
            easing: 'swing',
            closer: true,
            closeTemplate: '<i class="fa fa-times" />',
            closerTemplate: '<div>[ close all ]</div>',
            log: function() {},
            beforeOpen: function() {},
            afterOpen: function() {},
            open: function() {},
            beforeClose: function() {},
            close: function() {},
            animateOpen: {
                opacity: 'show'
            },
            animateClose: {
                opacity: 'hide'
            }
        },
        notifications: [],
        element: null,
        interval: null,
        create: function(message, options) {
            var o = $.extend({}, this.defaults, options);
            if (typeof o.speed !== 'undefined') {
                o.openDuration = o.speed;
                o.closeDuration = o.speed;
            }
            this.notifications.push({
                message: message,
                options: o
            });
            o.log.apply(this.element, [this.element, message, o]);
        },
        render: function(n) {
            var self = this;
            var message = n.message;
            var o = n.options;
            o.themeState = (o.themeState === '') ? '' : 'ui-state-' + o.themeState;
            var notification = $('<div/>').addClass('jGrowl-notification ' + o.themeState + ' ui-corner-all' + ((o.group !== undefined && o.group !== '') ? ' ' + o.group : '')).append($('<div/>').addClass('jGrowl-close').html(o.closeTemplate)).append($('<div/>').addClass('jGrowl-header').html(o.header)).append($('<div/>').addClass('jGrowl-message').html(message)).data("jGrowl", o).addClass(o.theme).children('div.jGrowl-close').bind("click.jGrowl", function() {
                $(this).parent().trigger('jGrowl.beforeClose');
            }).parent();
            $(notification).bind("mouseover.jGrowl", function() {
                $('div.jGrowl-notification', self.element).data("jGrowl.pause", true);
            }).bind("mouseout.jGrowl", function() {
                $('div.jGrowl-notification', self.element).data("jGrowl.pause", false);
            }).bind('jGrowl.beforeOpen', function() {
                if (o.beforeOpen.apply(notification, [notification, message, o, self.element]) !== false) {
                    $(this).trigger('jGrowl.open');
                }
            }).bind('jGrowl.open', function() {
                if (o.open.apply(notification, [notification, message, o, self.element]) !== false) {
                    if (o.glue == 'after') {
                        $('div.jGrowl-notification:last', self.element).after(notification);
                    } else {
                        $('div.jGrowl-notification:first', self.element).before(notification);
                    }
                    $(this).animate(o.animateOpen, o.openDuration, o.easing, function() {
                        if ($.support.opacity === false)
                            this.style.removeAttribute('filter');
                        if ($(this).data("jGrowl") !== null)
                            $(this).data("jGrowl").created = new Date();
                        $(this).trigger('jGrowl.afterOpen');
                    });
                }
            }).bind('jGrowl.afterOpen', function() {
                o.afterOpen.apply(notification, [notification, message, o, self.element]);
            }).bind('jGrowl.beforeClose', function() {
                if (o.beforeClose.apply(notification, [notification, message, o, self.element]) !== false)
                    $(this).trigger('jGrowl.close');
            }).bind('jGrowl.close', function() {
                $(this).animate(o.animateClose, o.closeDuration, o.easing, function() {
                    if ($.isFunction(o.close)) {
                        if (o.close.apply(notification, [notification, message, o, self.element]) !== false)
                            $(this).remove();
                    } else {
                        $(this).remove();
                    }
                });
            }).trigger('jGrowl.beforeOpen');
            if (o.corners !== '' && $.fn.corner !== undefined) $(notification).corner(o.corners);
            if ($('div.jGrowl-notification:parent', self.element).length > 1 && $('div.jGrowl-closer', self.element).length === 0 && this.defaults.closer !== false) {
                $(this.defaults.closerTemplate).addClass('jGrowl-closer ' + this.defaults.themeState + ' ui-corner-all').addClass(this.defaults.theme).appendTo(self.element).animate(this.defaults.animateOpen, this.defaults.speed, this.defaults.easing).bind("click.jGrowl", function() {
                    $(this).siblings().trigger("jGrowl.beforeClose");
                    if ($.isFunction(self.defaults.closer)) {
                        self.defaults.closer.apply($(this).parent()[0], [$(this).parent()[0]]);
                    }
                });
            }
        },
        update: function() {
            if (this.notifications.length > 0)
                this.render(this.notifications.shift());
            var jGrowl_notifications = $(this.element).find('div.jGrowl-notification:parent');
            var count = jGrowl_notifications.length;
            jGrowl_notifications.each(function() {
                if ($(this).data("jGrowl") !== undefined && $(this).data("jGrowl").created !== undefined) {
                    if (count > 5) {
                        $(this).remove();
                        count--;
                    } else if ($(this).data("jGrowl").created.getTime() + parseInt($(this).data("jGrowl").life, 10) < (new Date()).getTime()) {
                        $(this).trigger('jGrowl.close');
                    }
                }
            });
            if ($(this.element).find('div.jGrowl-notification:parent').length < 2) {
                $(this.element).find('div.jGrowl-closer').animate(this.defaults.animateClose, this.defaults.speed, this.defaults.easing, function() {
                    $(this).remove();
                });
            }
        },
        startup: function(e) {
            this.element = $(e).addClass('jGrowl').append('<div class="jGrowl-notification"></div>');
            this.interval = setInterval(function() {
                $(e).data('jGrowl.instance').update();
            }, parseInt(this.defaults.check, 10));
            if ($ie6) {
                $(this.element).addClass('ie6');
            }
        },
        shutdown: function() {
            $(this.element).removeClass('jGrowl').find('div.jGrowl-notification').trigger('jGrowl.close').parent().empty();
            clearInterval(this.interval);
        },
        close: function() {
            $(this.element).find('div.jGrowl-notification').each(function() {
                $(this).trigger('jGrowl.beforeClose');
            });
        }
    });
    $.jGrowl.defaults = $.fn.jGrowl.prototype.defaults;
})(jQuery);
(function() {
    var initializing = false;
    window.JQClass = function() {};
    JQClass.classes = {};
    JQClass.extend = function extender(prop) {
        var base = this.prototype;
        initializing = true;
        var prototype = new this();
        initializing = false;
        for (var name in prop) {
            prototype[name] = typeof prop[name] == 'function' && typeof base[name] == 'function' ? (function(name, fn) {
                return function() {
                    var __super = this._super;
                    this._super = function(args) {
                        return base[name].apply(this, args || []);
                    };
                    var ret = fn.apply(this, arguments);
                    this._super = __super;
                    return ret;
                };
            })(name, prop[name]) : prop[name];
        }

        function JQClass() {
            if (!initializing && this._init) {
                this._init.apply(this, arguments);
            }
        }
        JQClass.prototype = prototype;
        JQClass.prototype.constructor = JQClass;
        JQClass.extend = extender;
        return JQClass;
    };
})();
(function($) {
    JQClass.classes.JQPlugin = JQClass.extend({
        name: 'plugin',
        defaultOptions: {},
        regionalOptions: {},
        _getters: [],
        _getMarker: function() {
            return 'is-' + this.name;
        },
        _init: function() {
            $.extend(this.defaultOptions, (this.regionalOptions && this.regionalOptions['']) || {});
            var jqName = camelCase(this.name);
            $[jqName] = this;
            $.fn[jqName] = function(options) {
                var otherArgs = Array.prototype.slice.call(arguments, 1);
                if ($[jqName]._isNotChained(options, otherArgs)) {
                    return $[jqName][options].apply($[jqName], [this[0]].concat(otherArgs));
                }
                return this.each(function() {
                    if (typeof options === 'string') {
                        if (options[0] === '_' || !$[jqName][options]) {
                            throw 'Unknown method: ' + options;
                        }
                        $[jqName][options].apply($[jqName], [this].concat(otherArgs));
                    } else {
                        $[jqName]._attach(this, options);
                    }
                });
            };
        },
        setDefaults: function(options) {
            $.extend(this.defaultOptions, options || {});
        },
        _isNotChained: function(name, otherArgs) {
            if (name === 'option' && (otherArgs.length === 0 || (otherArgs.length === 1 && typeof otherArgs[0] === 'string'))) {
                return true;
            }
            return $.inArray(name, this._getters) > -1;
        },
        _attach: function(elem, options) {
            elem = $(elem);
            if (elem.hasClass(this._getMarker())) {
                return;
            }
            elem.addClass(this._getMarker());
            options = $.extend({}, this.defaultOptions, this._getMetadata(elem), options || {});
            var inst = $.extend({
                name: this.name,
                elem: elem,
                options: options
            }, this._instSettings(elem, options));
            elem.data(this.name, inst);
            this._postAttach(elem, inst);
            this.option(elem, options);
        },
        _instSettings: function(elem, options) {
            return {};
        },
        _postAttach: function(elem, inst) {},
        _getMetadata: function(elem) {
            try {
                var data = elem.data(this.name.toLowerCase()) || '';
                data = data.replace(/'/g, '"');
                data = data.replace(/([a-zA-Z0-9]+):/g, function(match, group, i) {
                    var count = data.substring(0, i).match(/"/g);
                    return (!count || count.length % 2 === 0 ? '"' + group + '":' : group + ':');
                });
                data = $.parseJSON('{' + data + '}');
                for (var name in data) {
                    var value = data[name];
                    if (typeof value === 'string' && value.match(/^new Date\((.*)\)$/)) {
                        data[name] = eval(value);
                    }
                }
                return data;
            } catch (e) {
                return {};
            }
        },
        _getInst: function(elem) {
            return $(elem).data(this.name) || {};
        },
        option: function(elem, name, value) {
            elem = $(elem);
            var inst = elem.data(this.name);
            if (!name || (typeof name === 'string' && value == null)) {
                var options = (inst || {}).options;
                return (options && name ? options[name] : options);
            }
            if (!elem.hasClass(this._getMarker())) {
                return;
            }
            var options = name || {};
            if (typeof name === 'string') {
                options = {};
                options[name] = value;
            }
            this._optionsChanged(elem, inst, options);
            $.extend(inst.options, options);
        },
        _optionsChanged: function(elem, inst, options) {},
        destroy: function(elem) {
            elem = $(elem);
            if (!elem.hasClass(this._getMarker())) {
                return;
            }
            this._preDestroy(elem, this._getInst(elem));
            elem.removeData(this.name).removeClass(this._getMarker());
        },
        _preDestroy: function(elem, inst) {}
    });

    function camelCase(name) {
        return name.replace(/-([a-z])/g, function(match, group) {
            return group.toUpperCase();
        });
    }
    $.JQPlugin = {
        createPlugin: function(superClass, overrides) {
            if (typeof superClass === 'object') {
                overrides = superClass;
                superClass = 'JQPlugin';
            }
            superClass = camelCase(superClass);
            var className = camelCase(overrides.name);
            JQClass.classes[className] = JQClass.classes[superClass].extend(overrides);
            new JQClass.classes[className]();
        }
    };
})(jQuery);
(function($, window, undefined) {
    var resources = {
        nojQuery: "jQuery was not found. Please ensure jQuery is referenced before the SignalR client JavaScript file.",
        noTransportOnInit: "No transport could be initialized successfully. Try specifying a different transport or none at all for auto initialization.",
        errorOnNegotiate: "Error during negotiation request.",
        stoppedWhileLoading: "The connection was stopped during page load.",
        stoppedWhileNegotiating: "The connection was stopped during the negotiate request.",
        errorParsingNegotiateResponse: "Error parsing negotiate response.",
        errorDuringStartRequest: "Error during start request. Stopping the connection.",
        stoppedDuringStartRequest: "The connection was stopped during the start request.",
        errorParsingStartResponse: "Error parsing start response: '{0}'. Stopping the connection.",
        invalidStartResponse: "Invalid start response: '{0}'. Stopping the connection.",
        protocolIncompatible: "You are using a version of the client that isn't compatible with the server. Client version {0}, server version {1}.",
        sendFailed: "Send failed.",
        parseFailed: "Failed at parsing response: {0}",
        longPollFailed: "Long polling request failed.",
        eventSourceFailedToConnect: "EventSource failed to connect.",
        eventSourceError: "Error raised by EventSource",
        webSocketClosed: "WebSocket closed.",
        pingServerFailedInvalidResponse: "Invalid ping response when pinging server: '{0}'.",
        pingServerFailed: "Failed to ping server.",
        pingServerFailedStatusCode: "Failed to ping server.  Server responded with status code {0}, stopping the connection.",
        pingServerFailedParse: "Failed to parse ping server response, stopping the connection.",
        noConnectionTransport: "Connection is in an invalid state, there is no transport active.",
        webSocketsInvalidState: "The Web Socket transport is in an invalid state, transitioning into reconnecting.",
        reconnectTimeout: "Couldn't reconnect within the configured timeout of {0} ms, disconnecting.",
        reconnectWindowTimeout: "The client has been inactive since {0} and it has exceeded the inactivity timeout of {1} ms. Stopping the connection."
    };
    if (typeof($) !== "function") {
        throw new Error(resources.nojQuery);
    }
    var signalR, _connection, _pageLoaded = (window.document.readyState === "complete"),
        _pageWindow = $(window),
        _negotiateAbortText = "__Negotiate Aborted__",
        events = {
            onStart: "onStart",
            onStarting: "onStarting",
            onReceived: "onReceived",
            onError: "onError",
            onConnectionSlow: "onConnectionSlow",
            onReconnecting: "onReconnecting",
            onReconnect: "onReconnect",
            onStateChanged: "onStateChanged",
            onDisconnect: "onDisconnect"
        },
        ajaxDefaults = {
            processData: true,
            timeout: null,
            async: true,
            global: false,
            cache: false
        },
        log = function(msg, logging) {
            if (logging === false) {
                return;
            }
            var m;
            if (typeof(window.console) === "undefined") {
                return;
            }
            m = "[" + new Date().toTimeString() + "] SignalR: " + msg;
            if (window.console.debug) {
                window.console.debug(m);
            } else if (window.console.log) {
                window.console.log(m);
            }
        },
        changeState = function(connection, expectedState, newState) {
            if (expectedState === connection.state) {
                connection.state = newState;
                $(connection).triggerHandler(events.onStateChanged, [{
                    oldState: expectedState,
                    newState: newState
                }]);
                return true;
            }
            return false;
        },
        isDisconnecting = function(connection) {
            return connection.state === signalR.connectionState.disconnected;
        },
        supportsKeepAlive = function(connection) {
            return connection._.keepAliveData.activated && connection.transport.supportsKeepAlive(connection);
        },
        configureStopReconnectingTimeout = function(connection) {
            var stopReconnectingTimeout, onReconnectTimeout;
            if (!connection._.configuredStopReconnectingTimeout) {
                onReconnectTimeout = function(connection) {
                    var message = signalR._.format(signalR.resources.reconnectTimeout, connection.disconnectTimeout);
                    connection.log(message);
                    $(connection).triggerHandler(events.onError, [signalR._.error(message, "TimeoutException")]);
                    connection.stop(false, false);
                };
                connection.reconnecting(function() {
                    var connection = this;
                    if (connection.state === signalR.connectionState.reconnecting) {
                        stopReconnectingTimeout = window.setTimeout(function() {
                            onReconnectTimeout(connection);
                        }, connection.disconnectTimeout);
                    }
                });
                connection.stateChanged(function(data) {
                    if (data.oldState === signalR.connectionState.reconnecting) {
                        window.clearTimeout(stopReconnectingTimeout);
                    }
                });
                connection._.configuredStopReconnectingTimeout = true;
            }
        };
    signalR = function(url, qs, logging) {
        return new signalR.fn.init(url, qs, logging);
    };
    signalR._ = {
        defaultContentType: "application/x-www-form-urlencoded; charset=UTF-8",
        ieVersion: (function() {
            var version, matches;
            if (window.navigator.appName === 'Microsoft Internet Explorer') {
                matches = /MSIE ([0-9]+\.[0-9]+)/.exec(window.navigator.userAgent);
                if (matches) {
                    version = window.parseFloat(matches[1]);
                }
            }
            return version;
        })(),
        error: function(message, source, context) {
            var e = new Error(message);
            e.source = source;
            if (typeof context !== "undefined") {
                e.context = context;
            }
            return e;
        },
        transportError: function(message, transport, source, context) {
            var e = this.error(message, source, context);
            e.transport = transport ? transport.name : undefined;
            return e;
        },
        format: function() {
            var s = arguments[0];
            for (var i = 0; i < arguments.length - 1; i++) {
                s = s.replace("{" + i + "}", arguments[i + 1]);
            }
            return s;
        },
        firefoxMajorVersion: function(userAgent) {
            var matches = userAgent.match(/Firefox\/(\d+)/);
            if (!matches || !matches.length || matches.length < 2) {
                return 0;
            }
            return parseInt(matches[1], 10);
        },
        configurePingInterval: function(connection) {
            var config = connection._.config,
                onFail = function(error) {
                    $(connection).triggerHandler(events.onError, [error]);
                };
            if (config && !connection._.pingIntervalId && config.pingInterval) {
                connection._.pingIntervalId = window.setInterval(function() {
                    signalR.transports._logic.pingServer(connection).fail(onFail);
                }, config.pingInterval);
            }
        }
    };
    signalR.events = events;
    signalR.resources = resources;
    signalR.ajaxDefaults = ajaxDefaults;
    signalR.changeState = changeState;
    signalR.isDisconnecting = isDisconnecting;
    signalR.connectionState = {
        connecting: 0,
        connected: 1,
        reconnecting: 2,
        disconnected: 4
    };
    signalR.hub = {
        start: function() {
            throw new Error("SignalR: Error loading hubs. Ensure your hubs reference is correct, e.g. <script src='/signalr/js'></script>.");
        }
    };
    if (typeof _pageWindow.on == "function") {
        _pageWindow.on("load", function() {
            _pageLoaded = true;
        });
    } else {
        _pageWindow.load(function() {
            _pageLoaded = true;
        });
    }

    function validateTransport(requestedTransport, connection) {
        if ($.isArray(requestedTransport)) {
            for (var i = requestedTransport.length - 1; i >= 0; i--) {
                var transport = requestedTransport[i];
                if ($.type(transport) !== "string" || !signalR.transports[transport]) {
                    connection.log("Invalid transport: " + transport + ", removing it from the transports list.");
                    requestedTransport.splice(i, 1);
                }
            }
            if (requestedTransport.length === 0) {
                connection.log("No transports remain within the specified transport array.");
                requestedTransport = null;
            }
        } else if (!signalR.transports[requestedTransport] && requestedTransport !== "auto") {
            connection.log("Invalid transport: " + requestedTransport.toString() + ".");
            requestedTransport = null;
        } else if (requestedTransport === "auto" && signalR._.ieVersion <= 8) {
            return ["longPolling"];
        }
        return requestedTransport;
    }

    function getDefaultPort(protocol) {
        if (protocol === "http:") {
            return 80;
        } else if (protocol === "https:") {
            return 443;
        }
    }

    function addDefaultPort(protocol, url) {
        if (url.match(/:\d+$/)) {
            return url;
        } else {
            return url + ":" + getDefaultPort(protocol);
        }
    }

    function ConnectingMessageBuffer(connection, drainCallback) {
        var that = this,
            buffer = [];
        that.tryBuffer = function(message) {
            if (connection.state === $.signalR.connectionState.connecting) {
                buffer.push(message);
                return true;
            }
            return false;
        };
        that.drain = function() {
            if (connection.state === $.signalR.connectionState.connected) {
                while (buffer.length > 0) {
                    drainCallback(buffer.shift());
                }
            }
        };
        that.clear = function() {
            buffer = [];
        };
    }
    signalR.fn = signalR.prototype = {
        init: function(url, qs, logging) {
            var $connection = $(this);
            this.url = url;
            this.qs = qs;
            this.lastError = null;
            this._ = {
                keepAliveData: {},
                connectingMessageBuffer: new ConnectingMessageBuffer(this, function(message) {
                    $connection.triggerHandler(events.onReceived, [message]);
                }),
                lastMessageAt: new Date().getTime(),
                lastActiveAt: new Date().getTime(),
                beatInterval: 5000,
                beatHandle: null,
                totalTransportConnectTimeout: 0
            };
            if (typeof(logging) === "boolean") {
                this.logging = logging;
            }
        },
        _parseResponse: function(response) {
            var that = this;
            if (!response) {
                return response;
            } else if (typeof response === "string") {
                return that.json.parse(response);
            } else {
                return response;
            }
        },
        _originalJson: window.JSON,
        json: window.JSON,
        isCrossDomain: function(url, against) {
            var link;
            url = $.trim(url);
            against = against || window.location;
            if (url.indexOf("http") !== 0) {
                return false;
            }
            link = window.document.createElement("a");
            link.href = url;
            return link.protocol + addDefaultPort(link.protocol, link.host) !== against.protocol + addDefaultPort(against.protocol, against.host);
        },
        ajaxDataType: "text",
        contentType: "application/json; charset=UTF-8",
        logging: false,
        state: signalR.connectionState.disconnected,
        clientProtocol: "1.5",
        reconnectDelay: 2000,
        transportConnectTimeout: 0,
        disconnectTimeout: 30000,
        reconnectWindow: 30000,
        keepAliveWarnAt: 2 / 3,
        start: function(options, callback) {
            var connection = this,
                config = {
                    pingInterval: 300000,
                    waitForPageLoad: true,
                    transport: "auto",
                    jsonp: false
                },
                initialize, deferred = connection._deferral || $.Deferred(),
                parser = window.document.createElement("a");
            connection.lastError = null;
            connection._deferral = deferred;
            if (!connection.json) {
                throw new Error("SignalR: No JSON parser found. Please ensure json2.js is referenced before the SignalR.js file if you need to support clients without native JSON parsing support, e.g. IE<8.");
            }
            if ($.type(options) === "function") {
                callback = options;
            } else if ($.type(options) === "object") {
                $.extend(config, options);
                if ($.type(config.callback) === "function") {
                    callback = config.callback;
                }
            }
            config.transport = validateTransport(config.transport, connection);
            if (!config.transport) {
                throw new Error("SignalR: Invalid transport(s) specified, aborting start.");
            }
            connection._.config = config;
            if (!_pageLoaded && config.waitForPageLoad === true) {
                connection._.deferredStartHandler = function() {
                    connection.start(options, callback);
                };
                _pageWindow.bind("load", connection._.deferredStartHandler);
                return deferred.promise();
            }
            if (connection.state === signalR.connectionState.connecting) {
                return deferred.promise();
            } else if (changeState(connection, signalR.connectionState.disconnected, signalR.connectionState.connecting) === false) {
                deferred.resolve(connection);
                return deferred.promise();
            }
            configureStopReconnectingTimeout(connection);
            parser.href = connection.url;
            if (!parser.protocol || parser.protocol === ":") {
                connection.protocol = window.document.location.protocol;
                connection.host = parser.host || window.document.location.host;
            } else {
                connection.protocol = parser.protocol;
                connection.host = parser.host;
            }
            connection.baseUrl = connection.protocol + "//" + connection.host;
            connection.wsProtocol = connection.protocol === "https:" ? "wss://" : "ws://";
            if (config.transport === "auto" && config.jsonp === true) {
                config.transport = "longPolling";
            }
            if (connection.url.indexOf("//") === 0) {
                connection.url = window.location.protocol + connection.url;
                connection.log("Protocol relative URL detected, normalizing it to '" + connection.url + "'.");
            }
            if (this.isCrossDomain(connection.url)) {
                connection.log("Auto detected cross domain url.");
                if (config.transport === "auto") {
                    config.transport = ["webSockets", "serverSentEvents", "longPolling"];
                }
                if (typeof(config.withCredentials) === "undefined") {
                    config.withCredentials = true;
                }
                if (!config.jsonp) {
                    config.jsonp = !$.support.cors;
                    if (config.jsonp) {
                        connection.log("Using jsonp because this browser doesn't support CORS.");
                    }
                }
                connection.contentType = signalR._.defaultContentType;
            }
            connection.withCredentials = config.withCredentials;
            connection.ajaxDataType = config.jsonp ? "jsonp" : "text";
            $(connection).bind(events.onStart, function(e, data) {
                if ($.type(callback) === "function") {
                    callback.call(connection);
                }
                deferred.resolve(connection);
            });
            connection._.initHandler = signalR.transports._logic.initHandler(connection);
            initialize = function(transports, index) {
                var noTransportError = signalR._.error(resources.noTransportOnInit);
                index = index || 0;
                if (index >= transports.length) {
                    if (index === 0) {
                        connection.log("No transports supported by the server were selected.");
                    } else if (index === 1) {
                        connection.log("No fallback transports were selected.");
                    } else {
                        connection.log("Fallback transports exhausted.");
                    }
                    $(connection).triggerHandler(events.onError, [noTransportError]);
                    deferred.reject(noTransportError);
                    connection.stop();
                    return;
                }
                if (connection.state === signalR.connectionState.disconnected) {
                    return;
                }
                var transportName = transports[index],
                    transport = signalR.transports[transportName],
                    onFallback = function() {
                        initialize(transports, index + 1);
                    };
                connection.transport = transport;
                try {
                    connection._.initHandler.start(transport, function() {
                        var isFirefox11OrGreater = signalR._.firefoxMajorVersion(window.navigator.userAgent) >= 11,
                            asyncAbort = !!connection.withCredentials && isFirefox11OrGreater;
                        connection.log("The start request succeeded. Transitioning to the connected state.");
                        if (supportsKeepAlive(connection)) {
                            signalR.transports._logic.monitorKeepAlive(connection);
                        }
                        signalR.transports._logic.startHeartbeat(connection);
                        signalR._.configurePingInterval(connection);
                        if (!changeState(connection, signalR.connectionState.connecting, signalR.connectionState.connected)) {
                            connection.log("WARNING! The connection was not in the connecting state.");
                        }
                        connection._.connectingMessageBuffer.drain();
                        $(connection).triggerHandler(events.onStart);
                        _pageWindow.bind("unload", function() {
                            connection.log("Window unloading, stopping the connection.");
                            connection.stop(asyncAbort);
                        });
                        if (isFirefox11OrGreater) {
                            _pageWindow.bind("beforeunload", function() {
                                window.setTimeout(function() {
                                    connection.stop(asyncAbort);
                                }, 0);
                            });
                        }
                    }, onFallback);
                } catch (error) {
                    connection.log(transport.name + " transport threw '" + error.message + "' when attempting to start.");
                    onFallback();
                }
            };
            var url = connection.url + "/negotiate",
                onFailed = function(error, connection) {
                    var err = signalR._.error(resources.errorOnNegotiate, error, connection._.negotiateRequest);
                    $(connection).triggerHandler(events.onError, err);
                    deferred.reject(err);
                    connection.stop();
                };
            $(connection).triggerHandler(events.onStarting);
            url = signalR.transports._logic.prepareQueryString(connection, url);
            connection.log("Negotiating with '" + url + "'.");
            connection._.negotiateRequest = signalR.transports._logic.ajax(connection, {
                url: url,
                error: function(error, statusText) {
                    if (statusText !== _negotiateAbortText) {
                        onFailed(error, connection);
                    } else {
                        deferred.reject(signalR._.error(resources.stoppedWhileNegotiating, null, connection._.negotiateRequest));
                    }
                },
                success: function(result) {
                    var res, keepAliveData, protocolError, transports = [],
                        supportedTransports = [];
                    try {
                        res = connection._parseResponse(result);
                    } catch (error) {
                        onFailed(signalR._.error(resources.errorParsingNegotiateResponse, error), connection);
                        return;
                    }
                    keepAliveData = connection._.keepAliveData;
                    connection.appRelativeUrl = res.Url;
                    connection.id = res.ConnectionId;
                    connection.token = res.ConnectionToken;
                    connection.webSocketServerUrl = res.WebSocketServerUrl;
                    connection._.pollTimeout = res.ConnectionTimeout * 1000 + 10000;
                    connection.disconnectTimeout = res.DisconnectTimeout * 1000;
                    connection._.totalTransportConnectTimeout = connection.transportConnectTimeout + res.TransportConnectTimeout * 1000;
                    if (res.KeepAliveTimeout) {
                        keepAliveData.activated = true;
                        keepAliveData.timeout = res.KeepAliveTimeout * 1000;
                        keepAliveData.timeoutWarning = keepAliveData.timeout * connection.keepAliveWarnAt;
                        connection._.beatInterval = (keepAliveData.timeout - keepAliveData.timeoutWarning) / 3;
                    } else {
                        keepAliveData.activated = false;
                    }
                    connection.reconnectWindow = connection.disconnectTimeout + (keepAliveData.timeout || 0);
                    if (!res.ProtocolVersion || res.ProtocolVersion !== connection.clientProtocol) {
                        protocolError = signalR._.error(signalR._.format(resources.protocolIncompatible, connection.clientProtocol, res.ProtocolVersion));
                        $(connection).triggerHandler(events.onError, [protocolError]);
                        deferred.reject(protocolError);
                        return;
                    }
                    $.each(signalR.transports, function(key) {
                        if ((key.indexOf("_") === 0) || (key === "webSockets" && !res.TryWebSockets)) {
                            return true;
                        }
                        supportedTransports.push(key);
                    });
                    if ($.isArray(config.transport)) {
                        $.each(config.transport, function(_, transport) {
                            if ($.inArray(transport, supportedTransports) >= 0) {
                                transports.push(transport);
                            }
                        });
                    } else if (config.transport === "auto") {
                        transports = supportedTransports;
                    } else if ($.inArray(config.transport, supportedTransports) >= 0) {
                        transports.push(config.transport);
                    }
                    initialize(transports);
                }
            });
            return deferred.promise();
        },
        starting: function(callback) {
            var connection = this;
            $(connection).bind(events.onStarting, function(e, data) {
                callback.call(connection);
            });
            return connection;
        },
        send: function(data) {
            var connection = this;
            if (connection.state === signalR.connectionState.disconnected) {
                throw new Error("SignalR: Connection must be started before data can be sent. Call .start() before .send()");
            }
            if (connection.state === signalR.connectionState.connecting) {
                throw new Error("SignalR: Connection has not been fully initialized. Use .start().done() or .start().fail() to run logic after the connection has started.");
            }
            connection.transport.send(connection, data);
            return connection;
        },
        received: function(callback) {
            var connection = this;
            $(connection).bind(events.onReceived, function(e, data) {
                callback.call(connection, data);
            });
            return connection;
        },
        stateChanged: function(callback) {
            var connection = this;
            $(connection).bind(events.onStateChanged, function(e, data) {
                callback.call(connection, data);
            });
            return connection;
        },
        error: function(callback) {
            var connection = this;
            $(connection).bind(events.onError, function(e, errorData, sendData) {
                connection.lastError = errorData;
                callback.call(connection, errorData, sendData);
            });
            return connection;
        },
        disconnected: function(callback) {
            var connection = this;
            $(connection).bind(events.onDisconnect, function(e, data) {
                callback.call(connection);
            });
            return connection;
        },
        connectionSlow: function(callback) {
            var connection = this;
            $(connection).bind(events.onConnectionSlow, function(e, data) {
                callback.call(connection);
            });
            return connection;
        },
        reconnecting: function(callback) {
            var connection = this;
            $(connection).bind(events.onReconnecting, function(e, data) {
                callback.call(connection);
            });
            return connection;
        },
        reconnected: function(callback) {
            var connection = this;
            $(connection).bind(events.onReconnect, function(e, data) {
                callback.call(connection);
            });
            return connection;
        },
        stop: function(async, notifyServer) {
            var connection = this,
                deferral = connection._deferral;
            if (connection._.deferredStartHandler) {
                _pageWindow.unbind("load", connection._.deferredStartHandler);
            }
            delete connection._.config;
            delete connection._.deferredStartHandler;
            if (!_pageLoaded && (!connection._.config || connection._.config.waitForPageLoad === true)) {
                connection.log("Stopping connection prior to negotiate.");
                if (deferral) {
                    deferral.reject(signalR._.error(resources.stoppedWhileLoading));
                }
                return;
            }
            if (connection.state === signalR.connectionState.disconnected) {
                return;
            }
            connection.log("Stopping connection.");
            window.clearTimeout(connection._.beatHandle);
            window.clearInterval(connection._.pingIntervalId);
            if (connection.transport) {
                connection.transport.stop(connection);
                if (notifyServer !== false) {
                    connection.transport.abort(connection, async);
                }
                if (supportsKeepAlive(connection)) {
                    signalR.transports._logic.stopMonitoringKeepAlive(connection);
                }
                connection.transport = null;
            }
            if (connection._.negotiateRequest) {
                connection._.negotiateRequest.abort(_negotiateAbortText);
                delete connection._.negotiateRequest;
            }
            if (connection._.initHandler) {
                connection._.initHandler.stop();
            }
            delete connection._deferral;
            delete connection.messageId;
            delete connection.groupsToken;
            delete connection.id;
            delete connection._.pingIntervalId;
            delete connection._.lastMessageAt;
            delete connection._.lastActiveAt;
            connection._.connectingMessageBuffer.clear();
            $(connection).unbind(events.onStart);
            changeState(connection, connection.state, signalR.connectionState.disconnected);
            $(connection).triggerHandler(events.onDisconnect);
            return connection;
        },
        log: function(msg) {
            log(msg, this.logging);
        }
    };
    signalR.fn.init.prototype = signalR.fn;
    signalR.noConflict = function() {
        if ($.connection === signalR) {
            $.connection = _connection;
        }
        return signalR;
    };
    if ($.connection) {
        _connection = $.connection;
    }
    $.connection = $.signalR = signalR;
}(window.jQuery, window));
(function($, window, undefined) {
    var signalR = $.signalR,
        events = $.signalR.events,
        changeState = $.signalR.changeState,
        startAbortText = "__Start Aborted__",
        transportLogic;
    signalR.transports = {};

    function beat(connection) {
        if (connection._.keepAliveData.monitoring) {
            checkIfAlive(connection);
        }
        if (transportLogic.markActive(connection)) {
            connection._.beatHandle = window.setTimeout(function() {
                beat(connection);
            }, connection._.beatInterval);
        }
    }

    function checkIfAlive(connection) {
        var keepAliveData = connection._.keepAliveData,
            timeElapsed;
        if (connection.state === signalR.connectionState.connected) {
            timeElapsed = new Date().getTime() - connection._.lastMessageAt;
            if (timeElapsed >= keepAliveData.timeout) {
                connection.log("Keep alive timed out.  Notifying transport that connection has been lost.");
                connection.transport.lostConnection(connection);
            } else if (timeElapsed >= keepAliveData.timeoutWarning) {
                if (!keepAliveData.userNotified) {
                    connection.log("Keep alive has been missed, connection may be dead/slow.");
                    $(connection).triggerHandler(events.onConnectionSlow);
                    keepAliveData.userNotified = true;
                }
            } else {
                keepAliveData.userNotified = false;
            }
        }
    }

    function getAjaxUrl(connection, path) {
        var url = connection.url + path;
        if (connection.transport) {
            url += "?transport=" + connection.transport.name;
        }
        return transportLogic.prepareQueryString(connection, url);
    }

    function InitHandler(connection) {
        this.connection = connection;
        this.startRequested = false;
        this.startCompleted = false;
        this.connectionStopped = false;
    }
    InitHandler.prototype = {
        start: function(transport, onSuccess, onFallback) {
            var that = this,
                connection = that.connection,
                failCalled = false;
            if (that.startRequested || that.connectionStopped) {
                connection.log("WARNING! " + transport.name + " transport cannot be started. Initialization ongoing or completed.");
                return;
            }
            connection.log(transport.name + " transport starting.");
            transport.start(connection, function() {
                if (!failCalled) {
                    that.initReceived(transport, onSuccess);
                }
            }, function(error) {
                if (!failCalled) {
                    failCalled = true;
                    that.transportFailed(transport, error, onFallback);
                }
                return !that.startCompleted || that.connectionStopped;
            });
            that.transportTimeoutHandle = window.setTimeout(function() {
                if (!failCalled) {
                    failCalled = true;
                    connection.log(transport.name + " transport timed out when trying to connect.");
                    that.transportFailed(transport, undefined, onFallback);
                }
            }, connection._.totalTransportConnectTimeout);
        },
        stop: function() {
            this.connectionStopped = true;
            window.clearTimeout(this.transportTimeoutHandle);
            signalR.transports._logic.tryAbortStartRequest(this.connection);
        },
        initReceived: function(transport, onSuccess) {
            var that = this,
                connection = that.connection;
            if (that.startRequested) {
                connection.log("WARNING! The client received multiple init messages.");
                return;
            }
            if (that.connectionStopped) {
                return;
            }
            that.startRequested = true;
            window.clearTimeout(that.transportTimeoutHandle);
            connection.log(transport.name + " transport connected. Initiating start request.");
            signalR.transports._logic.ajaxStart(connection, function() {
                that.startCompleted = true;
                onSuccess();
            });
        },
        transportFailed: function(transport, error, onFallback) {
            var connection = this.connection,
                deferred = connection._deferral,
                wrappedError;
            if (this.connectionStopped) {
                return;
            }
            window.clearTimeout(this.transportTimeoutHandle);
            if (!this.startRequested) {
                transport.stop(connection);
                connection.log(transport.name + " transport failed to connect. Attempting to fall back.");
                onFallback();
            } else if (!this.startCompleted) {
                wrappedError = signalR._.error(signalR.resources.errorDuringStartRequest, error);
                connection.log(transport.name + " transport failed during the start request. Stopping the connection.");
                $(connection).triggerHandler(events.onError, [wrappedError]);
                if (deferred) {
                    deferred.reject(wrappedError);
                }
                connection.stop();
            } else {}
        }
    };
    transportLogic = signalR.transports._logic = {
        ajax: function(connection, options) {
            return $.ajax($.extend(true, {}, $.signalR.ajaxDefaults, {
                type: "GET",
                data: {},
                xhrFields: {
                    withCredentials: connection.withCredentials
                },
                contentType: connection.contentType,
                dataType: connection.ajaxDataType
            }, options));
        },
        pingServer: function(connection) {
            var url, xhr, deferral = $.Deferred();
            if (connection.transport) {
                url = connection.url + "/ping";
                url = transportLogic.addQs(url, connection.qs);
                xhr = transportLogic.ajax(connection, {
                    url: url,
                    success: function(result) {
                        var data;
                        try {
                            data = connection._parseResponse(result);
                        } catch (error) {
                            deferral.reject(signalR._.transportError(signalR.resources.pingServerFailedParse, connection.transport, error, xhr));
                            connection.stop();
                            return;
                        }
                        if (data.Response === "pong") {
                            deferral.resolve();
                        } else {
                            deferral.reject(signalR._.transportError(signalR._.format(signalR.resources.pingServerFailedInvalidResponse, result), connection.transport, null, xhr));
                        }
                    },
                    error: function(error) {
                        if (error.status === 401 || error.status === 403) {
                            deferral.reject(signalR._.transportError(signalR._.format(signalR.resources.pingServerFailedStatusCode, error.status), connection.transport, error, xhr));
                            connection.stop();
                        } else {
                            deferral.reject(signalR._.transportError(signalR.resources.pingServerFailed, connection.transport, error, xhr));
                        }
                    }
                });
            } else {
                deferral.reject(signalR._.transportError(signalR.resources.noConnectionTransport, connection.transport));
            }
            return deferral.promise();
        },
        prepareQueryString: function(connection, url) {
            var preparedUrl;
            preparedUrl = transportLogic.addQs(url, "clientProtocol=" + connection.clientProtocol);
            preparedUrl = transportLogic.addQs(preparedUrl, connection.qs);
            if (connection.token) {
                preparedUrl += "&connectionToken=" + window.encodeURIComponent(connection.token);
            }
            if (connection.data) {
                preparedUrl += "&connectionData=" + window.encodeURIComponent(connection.data);
            }
            return preparedUrl;
        },
        addQs: function(url, qs) {
            var appender = url.indexOf("?") !== -1 ? "&" : "?",
                firstChar;
            if (!qs) {
                return url;
            }
            if (typeof(qs) === "object") {
                return url + appender + $.param(qs);
            }
            if (typeof(qs) === "string") {
                firstChar = qs.charAt(0);
                if (firstChar === "?" || firstChar === "&") {
                    appender = "";
                }
                return url + appender + qs;
            }
            throw new Error("Query string property must be either a string or object.");
        },
        getUrl: function(connection, transport, reconnecting, poll, ajaxPost) {
            var baseUrl = transport === "webSockets" ? "" : connection.baseUrl,
                url = baseUrl + connection.appRelativeUrl,
                qs = "transport=" + transport;
            if (!ajaxPost && connection.groupsToken) {
                qs += "&groupsToken=" + window.encodeURIComponent(connection.groupsToken);
            }
            if (!reconnecting) {
                url += "/connect";
            } else {
                if (poll) {
                    url += "/poll";
                } else {
                    url += "/reconnect";
                }
                if (!ajaxPost && connection.messageId) {
                    qs += "&messageId=" + window.encodeURIComponent(connection.messageId);
                }
            }
            url += "?" + qs;
            url = transportLogic.prepareQueryString(connection, url);
            if (!ajaxPost) {
                url += "&tid=" + Math.floor(Math.random() * 11);
            }
            return url;
        },
        maximizePersistentResponse: function(minPersistentResponse) {
            return {
                MessageId: minPersistentResponse.C,
                Messages: minPersistentResponse.M,
                Initialized: typeof(minPersistentResponse.S) !== "undefined" ? true : false,
                ShouldReconnect: typeof(minPersistentResponse.T) !== "undefined" ? true : false,
                LongPollDelay: minPersistentResponse.L,
                GroupsToken: minPersistentResponse.G
            };
        },
        updateGroups: function(connection, groupsToken) {
            if (groupsToken) {
                connection.groupsToken = groupsToken;
            }
        },
        stringifySend: function(connection, message) {
            if (typeof(message) === "string" || typeof(message) === "undefined" || message === null) {
                return message;
            }
            return connection.json.stringify(message);
        },
        ajaxSend: function(connection, data) {
            var payload = transportLogic.stringifySend(connection, data),
                url = getAjaxUrl(connection, "/send"),
                xhr, onFail = function(error, connection) {
                    $(connection).triggerHandler(events.onError, [signalR._.transportError(signalR.resources.sendFailed, connection.transport, error, xhr), data]);
                };
            xhr = transportLogic.ajax(connection, {
                url: url,
                type: connection.ajaxDataType === "jsonp" ? "GET" : "POST",
                contentType: signalR._.defaultContentType,
                data: {
                    data: payload
                },
                success: function(result) {
                    var res;
                    if (result) {
                        try {
                            res = connection._parseResponse(result);
                        } catch (error) {
                            onFail(error, connection);
                            connection.stop();
                            return;
                        }
                        transportLogic.triggerReceived(connection, res);
                    }
                },
                error: function(error, textStatus) {
                    if (textStatus === "abort" || textStatus === "parsererror") {
                        return;
                    }
                    onFail(error, connection);
                }
            });
            return xhr;
        },
        ajaxAbort: function(connection, async) {
            if (typeof(connection.transport) === "undefined") {
                return;
            }
            async = typeof async === "undefined" ? true: async;
            var url = getAjaxUrl(connection, "/abort");
            transportLogic.ajax(connection, {
                url: url,
                async: async,
                timeout: 1000,
                type: "POST"
            });
            connection.log("Fired ajax abort async = " + async + ".");
        },
        ajaxStart: function(connection, onSuccess) {
            var rejectDeferred = function(error) {
                    var deferred = connection._deferral;
                    if (deferred) {
                        deferred.reject(error);
                    }
                },
                triggerStartError = function(error) {
                    connection.log("The start request failed. Stopping the connection.");
                    $(connection).triggerHandler(events.onError, [error]);
                    rejectDeferred(error);
                    connection.stop();
                };
            connection._.startRequest = transportLogic.ajax(connection, {
                url: getAjaxUrl(connection, "/start"),
                success: function(result, statusText, xhr) {
                    var data;
                    try {
                        data = connection._parseResponse(result);
                    } catch (error) {
                        triggerStartError(signalR._.error(signalR._.format(signalR.resources.errorParsingStartResponse, result), error, xhr));
                        return;
                    }
                    if (data.Response === "started") {
                        onSuccess();
                    } else {
                        triggerStartError(signalR._.error(signalR._.format(signalR.resources.invalidStartResponse, result), null, xhr));
                    }
                },
                error: function(xhr, statusText, error) {
                    if (statusText !== startAbortText) {
                        triggerStartError(signalR._.error(signalR.resources.errorDuringStartRequest, error, xhr));
                    } else {
                        connection.log("The start request aborted because connection.stop() was called.");
                        rejectDeferred(signalR._.error(signalR.resources.stoppedDuringStartRequest, null, xhr));
                    }
                }
            });
        },
        tryAbortStartRequest: function(connection) {
            if (connection._.startRequest) {
                connection._.startRequest.abort(startAbortText);
                delete connection._.startRequest;
            }
        },
        tryInitialize: function(connection, persistentResponse, onInitialized) {
            if (persistentResponse.Initialized && onInitialized) {
                onInitialized();
            } else if (persistentResponse.Initialized) {
                connection.log("WARNING! The client received an init message after reconnecting.");
            }
        },
        triggerReceived: function(connection, data) {
            if (!connection._.connectingMessageBuffer.tryBuffer(data)) {
                $(connection).triggerHandler(events.onReceived, [data]);
            }
        },
        processMessages: function(connection, minData, onInitialized) {
            var data;
            transportLogic.markLastMessage(connection);
            if (minData) {
                data = transportLogic.maximizePersistentResponse(minData);
                transportLogic.updateGroups(connection, data.GroupsToken);
                if (data.MessageId) {
                    connection.messageId = data.MessageId;
                }
                if (data.Messages) {
                    $.each(data.Messages, function(index, message) {
                        transportLogic.triggerReceived(connection, message);
                    });
                    transportLogic.tryInitialize(connection, data, onInitialized);
                }
            }
        },
        monitorKeepAlive: function(connection) {
            var keepAliveData = connection._.keepAliveData;
            if (!keepAliveData.monitoring) {
                keepAliveData.monitoring = true;
                transportLogic.markLastMessage(connection);
                connection._.keepAliveData.reconnectKeepAliveUpdate = function() {
                    transportLogic.markLastMessage(connection);
                };
                $(connection).bind(events.onReconnect, connection._.keepAliveData.reconnectKeepAliveUpdate);
                connection.log("Now monitoring keep alive with a warning timeout of " + keepAliveData.timeoutWarning + ", keep alive timeout of " + keepAliveData.timeout + " and disconnecting timeout of " + connection.disconnectTimeout);
            } else {
                connection.log("Tried to monitor keep alive but it's already being monitored.");
            }
        },
        stopMonitoringKeepAlive: function(connection) {
            var keepAliveData = connection._.keepAliveData;
            if (keepAliveData.monitoring) {
                keepAliveData.monitoring = false;
                $(connection).unbind(events.onReconnect, connection._.keepAliveData.reconnectKeepAliveUpdate);
                connection._.keepAliveData = {};
                connection.log("Stopping the monitoring of the keep alive.");
            }
        },
        startHeartbeat: function(connection) {
            connection._.lastActiveAt = new Date().getTime();
            beat(connection);
        },
        markLastMessage: function(connection) {
            connection._.lastMessageAt = new Date().getTime();
        },
        markActive: function(connection) {
            if (transportLogic.verifyLastActive(connection)) {
                connection._.lastActiveAt = new Date().getTime();
                return true;
            }
            return false;
        },
        isConnectedOrReconnecting: function(connection) {
            return connection.state === signalR.connectionState.connected || connection.state === signalR.connectionState.reconnecting;
        },
        ensureReconnectingState: function(connection) {
            if (changeState(connection, signalR.connectionState.connected, signalR.connectionState.reconnecting) === true) {
                $(connection).triggerHandler(events.onReconnecting);
            }
            return connection.state === signalR.connectionState.reconnecting;
        },
        clearReconnectTimeout: function(connection) {
            if (connection && connection._.reconnectTimeout) {
                window.clearTimeout(connection._.reconnectTimeout);
                delete connection._.reconnectTimeout;
            }
        },
        verifyLastActive: function(connection) {
            if (new Date().getTime() - connection._.lastActiveAt >= connection.reconnectWindow) {
                var message = signalR._.format(signalR.resources.reconnectWindowTimeout, new Date(connection._.lastActiveAt), connection.reconnectWindow);
                connection.log(message);
                $(connection).triggerHandler(events.onError, [signalR._.error(message, "TimeoutException")]);
                connection.stop(false, false);
                return false;
            }
            return true;
        },
        reconnect: function(connection, transportName) {
            var transport = signalR.transports[transportName];
            if (transportLogic.isConnectedOrReconnecting(connection) && !connection._.reconnectTimeout) {
                if (!transportLogic.verifyLastActive(connection)) {
                    return;
                }
                connection._.reconnectTimeout = window.setTimeout(function() {
                    if (!transportLogic.verifyLastActive(connection)) {
                        return;
                    }
                    transport.stop(connection);
                    if (transportLogic.ensureReconnectingState(connection)) {
                        connection.log(transportName + " reconnecting.");
                        transport.start(connection);
                    }
                }, connection.reconnectDelay);
            }
        },
        handleParseFailure: function(connection, result, error, onFailed, context) {
            var wrappedError = signalR._.transportError(signalR._.format(signalR.resources.parseFailed, result), connection.transport, error, context);
            if (onFailed && onFailed(wrappedError)) {
                connection.log("Failed to parse server response while attempting to connect.");
            } else {
                $(connection).triggerHandler(events.onError, [wrappedError]);
                connection.stop();
            }
        },
        initHandler: function(connection) {
            return new InitHandler(connection);
        },
        foreverFrame: {
            count: 0,
            connections: {}
        }
    };
}(window.jQuery, window));
(function($, window, undefined) {
    var signalR = $.signalR,
        events = $.signalR.events,
        changeState = $.signalR.changeState,
        transportLogic = signalR.transports._logic;
    signalR.transports.webSockets = {
        name: "webSockets",
        supportsKeepAlive: function() {
            return true;
        },
        send: function(connection, data) {
            var payload = transportLogic.stringifySend(connection, data);
            try {
                connection.socket.send(payload);
            } catch (ex) {
                $(connection).triggerHandler(events.onError, [signalR._.transportError(signalR.resources.webSocketsInvalidState, connection.transport, ex, connection.socket), data]);
            }
        },
        start: function(connection, onSuccess, onFailed) {
            var url, opened = false,
                that = this,
                reconnecting = !onSuccess,
                $connection = $(connection);
            if (!window.WebSocket) {
                onFailed();
                return;
            }
            if (!connection.socket) {
                if (connection.webSocketServerUrl) {
                    url = connection.webSocketServerUrl;
                } else {
                    url = connection.wsProtocol + connection.host;
                }
                url += transportLogic.getUrl(connection, this.name, reconnecting);
                connection.log("Connecting to websocket endpoint '" + url + "'.");
                connection.socket = new window.WebSocket(url);
                connection.socket.onopen = function() {
                    opened = true;
                    connection.log("Websocket opened.");
                    transportLogic.clearReconnectTimeout(connection);
                    if (changeState(connection, signalR.connectionState.reconnecting, signalR.connectionState.connected) === true) {
                        $connection.triggerHandler(events.onReconnect);
                    }
                };
                connection.socket.onclose = function(event) {
                    var error;
                    if (this === connection.socket) {
                        if (opened && typeof event.wasClean !== "undefined" && event.wasClean === false) {
                            error = signalR._.transportError(signalR.resources.webSocketClosed, connection.transport, event);
                            connection.log("Unclean disconnect from websocket: " + (event.reason || "[no reason given]."));
                        } else {
                            connection.log("Websocket closed.");
                        }
                        if (!onFailed || !onFailed(error)) {
                            if (error) {
                                $(connection).triggerHandler(events.onError, [error]);
                            }
                            that.reconnect(connection);
                        }
                    }
                };
                connection.socket.onmessage = function(event) {
                    var data;
                    try {
                        data = connection._parseResponse(event.data);
                    } catch (error) {
                        transportLogic.handleParseFailure(connection, event.data, error, onFailed, event);
                        return;
                    }
                    if (data) {
                        if ($.isEmptyObject(data) || data.M) {
                            transportLogic.processMessages(connection, data, onSuccess);
                        } else {
                            transportLogic.triggerReceived(connection, data);
                        }
                    }
                };
            }
        },
        reconnect: function(connection) {
            transportLogic.reconnect(connection, this.name);
        },
        lostConnection: function(connection) {
            this.reconnect(connection);
        },
        stop: function(connection) {
            transportLogic.clearReconnectTimeout(connection);
            if (connection.socket) {
                connection.log("Closing the Websocket.");
                connection.socket.close();
                connection.socket = null;
            }
        },
        abort: function(connection, async) {
            transportLogic.ajaxAbort(connection, async);
        }
    };
}(window.jQuery, window));
(function($, window, undefined) {
    var signalR = $.signalR,
        events = $.signalR.events,
        changeState = $.signalR.changeState,
        transportLogic = signalR.transports._logic,
        clearReconnectAttemptTimeout = function(connection) {
            window.clearTimeout(connection._.reconnectAttemptTimeoutHandle);
            delete connection._.reconnectAttemptTimeoutHandle;
        };
    signalR.transports.serverSentEvents = {
        name: "serverSentEvents",
        supportsKeepAlive: function() {
            return true;
        },
        timeOut: 3000,
        start: function(connection, onSuccess, onFailed) {
            var that = this,
                opened = false,
                $connection = $(connection),
                reconnecting = !onSuccess,
                url;
            if (connection.eventSource) {
                connection.log("The connection already has an event source. Stopping it.");
                connection.stop();
            }
            if (!window.EventSource) {
                if (onFailed) {
                    connection.log("This browser doesn't support SSE.");
                    onFailed();
                }
                return;
            }
            url = transportLogic.getUrl(connection, this.name, reconnecting);
            try {
                connection.log("Attempting to connect to SSE endpoint '" + url + "'.");
                connection.eventSource = new window.EventSource(url, {
                    withCredentials: connection.withCredentials
                });
            } catch (e) {
                connection.log("EventSource failed trying to connect with error " + e.Message + ".");
                if (onFailed) {
                    onFailed();
                } else {
                    $connection.triggerHandler(events.onError, [signalR._.transportError(signalR.resources.eventSourceFailedToConnect, connection.transport, e)]);
                    if (reconnecting) {
                        that.reconnect(connection);
                    }
                }
                return;
            }
            if (reconnecting) {
                connection._.reconnectAttemptTimeoutHandle = window.setTimeout(function() {
                    if (opened === false) {
                        if (connection.eventSource.readyState !== window.EventSource.OPEN) {
                            that.reconnect(connection);
                        }
                    }
                }, that.timeOut);
            }
            connection.eventSource.addEventListener("open", function(e) {
                connection.log("EventSource connected.");
                clearReconnectAttemptTimeout(connection);
                transportLogic.clearReconnectTimeout(connection);
                if (opened === false) {
                    opened = true;
                    if (changeState(connection, signalR.connectionState.reconnecting, signalR.connectionState.connected) === true) {
                        $connection.triggerHandler(events.onReconnect);
                    }
                }
            }, false);
            connection.eventSource.addEventListener("message", function(e) {
                var res;
                if (e.data === "initialized") {
                    return;
                }
                try {
                    res = connection._parseResponse(e.data);
                } catch (error) {
                    transportLogic.handleParseFailure(connection, e.data, error, onFailed, e);
                    return;
                }
                transportLogic.processMessages(connection, res, onSuccess);
            }, false);
            connection.eventSource.addEventListener("error", function(e) {
                var error = signalR._.transportError(signalR.resources.eventSourceError, connection.transport, e);
                if (this !== connection.eventSource) {
                    return;
                }
                if (onFailed && onFailed(error)) {
                    return;
                }
                connection.log("EventSource readyState: " + connection.eventSource.readyState + ".");
                if (e.eventPhase === window.EventSource.CLOSED) {
                    connection.log("EventSource reconnecting due to the server connection ending.");
                    that.reconnect(connection);
                } else {
                    connection.log("EventSource error.");
                    $connection.triggerHandler(events.onError, [error]);
                }
            }, false);
        },
        reconnect: function(connection) {
            transportLogic.reconnect(connection, this.name);
        },
        lostConnection: function(connection) {
            this.reconnect(connection);
        },
        send: function(connection, data) {
            transportLogic.ajaxSend(connection, data);
        },
        stop: function(connection) {
            clearReconnectAttemptTimeout(connection);
            transportLogic.clearReconnectTimeout(connection);
            if (connection && connection.eventSource) {
                connection.log("EventSource calling close().");
                connection.eventSource.close();
                connection.eventSource = null;
                delete connection.eventSource;
            }
        },
        abort: function(connection, async) {
            transportLogic.ajaxAbort(connection, async);
        }
    };
}(window.jQuery, window));
(function($, window, undefined) {
    var signalR = $.signalR,
        events = $.signalR.events,
        changeState = $.signalR.changeState,
        transportLogic = signalR.transports._logic,
        createFrame = function() {
            var frame = window.document.createElement("iframe");
            frame.setAttribute("style", "position:absolute;top:0;left:0;width:0;height:0;visibility:hidden;");
            return frame;
        },
        loadPreventer = (function() {
            var loadingFixIntervalId = null,
                loadingFixInterval = 1000,
                attachedTo = 0;
            return {
                prevent: function() {
                    if (signalR._.ieVersion <= 8) {
                        if (attachedTo === 0) {
                            loadingFixIntervalId = window.setInterval(function() {
                                var tempFrame = createFrame();
                                window.document.body.appendChild(tempFrame);
                                window.document.body.removeChild(tempFrame);
                                tempFrame = null;
                            }, loadingFixInterval);
                        }
                        attachedTo++;
                    }
                },
                cancel: function() {
                    if (attachedTo === 1) {
                        window.clearInterval(loadingFixIntervalId);
                    }
                    if (attachedTo > 0) {
                        attachedTo--;
                    }
                }
            };
        })();
    signalR.transports.foreverFrame = {
        name: "foreverFrame",
        supportsKeepAlive: function() {
            return true;
        },
        iframeClearThreshold: 50,
        start: function(connection, onSuccess, onFailed) {
            var that = this,
                frameId = (transportLogic.foreverFrame.count += 1),
                url, frame = createFrame(),
                frameLoadHandler = function() {
                    connection.log("Forever frame iframe finished loading and is no longer receiving messages.");
                    if (!onFailed || !onFailed()) {
                        that.reconnect(connection);
                    }
                };
            if (window.EventSource) {
                if (onFailed) {
                    connection.log("Forever Frame is not supported by SignalR on browsers with SSE support.");
                    onFailed();
                }
                return;
            }
            frame.setAttribute("data-signalr-connection-id", connection.id);
            loadPreventer.prevent();
            url = transportLogic.getUrl(connection, this.name);
            url += "&frameId=" + frameId;
            window.document.documentElement.appendChild(frame);
            connection.log("Binding to iframe's load event.");
            if (frame.addEventListener) {
                frame.addEventListener("load", frameLoadHandler, false);
            } else if (frame.attachEvent) {
                frame.attachEvent("onload", frameLoadHandler);
            }
            frame.src = url;
            transportLogic.foreverFrame.connections[frameId] = connection;
            connection.frame = frame;
            connection.frameId = frameId;
            if (onSuccess) {
                connection.onSuccess = function() {
                    connection.log("Iframe transport started.");
                    onSuccess();
                };
            }
        },
        reconnect: function(connection) {
            var that = this;
            if (transportLogic.isConnectedOrReconnecting(connection) && transportLogic.verifyLastActive(connection)) {
                window.setTimeout(function() {
                    if (!transportLogic.verifyLastActive(connection)) {
                        return;
                    }
                    if (connection.frame && transportLogic.ensureReconnectingState(connection)) {
                        var frame = connection.frame,
                            src = transportLogic.getUrl(connection, that.name, true) + "&frameId=" + connection.frameId;
                        connection.log("Updating iframe src to '" + src + "'.");
                        frame.src = src;
                    }
                }, connection.reconnectDelay);
            }
        },
        lostConnection: function(connection) {
            this.reconnect(connection);
        },
        send: function(connection, data) {
            transportLogic.ajaxSend(connection, data);
        },
        receive: function(connection, data) {
            var cw, body, response;
            if (connection.json !== connection._originalJson) {
                data = connection._originalJson.stringify(data);
            }
            response = connection._parseResponse(data);
            transportLogic.processMessages(connection, response, connection.onSuccess);
            if (connection.state === $.signalR.connectionState.connected) {
                connection.frameMessageCount = (connection.frameMessageCount || 0) + 1;
                if (connection.frameMessageCount > signalR.transports.foreverFrame.iframeClearThreshold) {
                    connection.frameMessageCount = 0;
                    cw = connection.frame.contentWindow || connection.frame.contentDocument;
                    if (cw && cw.document && cw.document.body) {
                        body = cw.document.body;
                        while (body.firstChild) {
                            body.removeChild(body.firstChild);
                        }
                    }
                }
            }
        },
        stop: function(connection) {
            var cw = null;
            loadPreventer.cancel();
            if (connection.frame) {
                if (connection.frame.stop) {
                    connection.frame.stop();
                } else {
                    try {
                        cw = connection.frame.contentWindow || connection.frame.contentDocument;
                        if (cw.document && cw.document.execCommand) {
                            cw.document.execCommand("Stop");
                        }
                    } catch (e) {
                        connection.log("Error occurred when stopping foreverFrame transport. Message = " + e.message + ".");
                    }
                }
                if (connection.frame.parentNode === window.document.documentElement) {
                    window.document.documentElement.removeChild(connection.frame);
                }
                delete transportLogic.foreverFrame.connections[connection.frameId];
                connection.frame = null;
                connection.frameId = null;
                delete connection.frame;
                delete connection.frameId;
                delete connection.onSuccess;
                delete connection.frameMessageCount;
                connection.log("Stopping forever frame.");
            }
        },
        abort: function(connection, async) {
            transportLogic.ajaxAbort(connection, async);
        },
        getConnection: function(id) {
            return transportLogic.foreverFrame.connections[id];
        },
        started: function(connection) {
            if (changeState(connection, signalR.connectionState.reconnecting, signalR.connectionState.connected) === true) {
                $(connection).triggerHandler(events.onReconnect);
            }
        }
    };
}(window.jQuery, window));
(function($, window, undefined) {
    var signalR = $.signalR,
        events = $.signalR.events,
        changeState = $.signalR.changeState,
        isDisconnecting = $.signalR.isDisconnecting,
        transportLogic = signalR.transports._logic;
    signalR.transports.longPolling = {
        name: "longPolling",
        supportsKeepAlive: function() {
            return false;
        },
        reconnectDelay: 3000,
        start: function(connection, onSuccess, onFailed) {
            var that = this,
                fireConnect = function() {
                    fireConnect = $.noop;
                    connection.log("LongPolling connected.");
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        connection.log("WARNING! The client received an init message after reconnecting.");
                    }
                },
                tryFailConnect = function(error) {
                    if (onFailed(error)) {
                        connection.log("LongPolling failed to connect.");
                        return true;
                    }
                    return false;
                },
                privateData = connection._,
                reconnectErrors = 0,
                fireReconnected = function(instance) {
                    window.clearTimeout(privateData.reconnectTimeoutId);
                    privateData.reconnectTimeoutId = null;
                    if (changeState(instance, signalR.connectionState.reconnecting, signalR.connectionState.connected) === true) {
                        instance.log("Raising the reconnect event");
                        $(instance).triggerHandler(events.onReconnect);
                    }
                },
                maxFireReconnectedTimeout = 3600000;
            if (connection.pollXhr) {
                connection.log("Polling xhr requests already exists, aborting.");
                connection.stop();
            }
            connection.messageId = null;
            privateData.reconnectTimeoutId = null;
            privateData.pollTimeoutId = window.setTimeout(function() {
                (function poll(instance, raiseReconnect) {
                    var messageId = instance.messageId,
                        connect = (messageId === null),
                        reconnecting = !connect,
                        polling = !raiseReconnect,
                        url = transportLogic.getUrl(instance, that.name, reconnecting, polling, true),
                        postData = {};
                    if (instance.messageId) {
                        postData.messageId = instance.messageId;
                    }
                    if (instance.groupsToken) {
                        postData.groupsToken = instance.groupsToken;
                    }
                    if (isDisconnecting(instance) === true) {
                        return;
                    }
                    connection.log("Opening long polling request to '" + url + "'.");
                    instance.pollXhr = transportLogic.ajax(connection, {
                        xhrFields: {
                            onprogress: function() {
                                transportLogic.markLastMessage(connection);
                            }
                        },
                        url: url,
                        type: "POST",
                        contentType: signalR._.defaultContentType,
                        data: postData,
                        timeout: connection._.pollTimeout,
                        success: function(result) {
                            var minData, delay = 0,
                                data, shouldReconnect;
                            connection.log("Long poll complete.");
                            reconnectErrors = 0;
                            try {
                                minData = connection._parseResponse(result);
                            } catch (error) {
                                transportLogic.handleParseFailure(instance, result, error, tryFailConnect, instance.pollXhr);
                                return;
                            }
                            if (privateData.reconnectTimeoutId !== null) {
                                fireReconnected(instance);
                            }
                            if (minData) {
                                data = transportLogic.maximizePersistentResponse(minData);
                            }
                            transportLogic.processMessages(instance, minData, fireConnect);
                            if (data && $.type(data.LongPollDelay) === "number") {
                                delay = data.LongPollDelay;
                            }
                            if (isDisconnecting(instance) === true) {
                                return;
                            }
                            shouldReconnect = data && data.ShouldReconnect;
                            if (shouldReconnect) {
                                if (!transportLogic.ensureReconnectingState(instance)) {
                                    return;
                                }
                            }
                            if (delay > 0) {
                                privateData.pollTimeoutId = window.setTimeout(function() {
                                    poll(instance, shouldReconnect);
                                }, delay);
                            } else {
                                poll(instance, shouldReconnect);
                            }
                        },
                        error: function(data, textStatus) {
                            var error = signalR._.transportError(signalR.resources.longPollFailed, connection.transport, data, instance.pollXhr);
                            window.clearTimeout(privateData.reconnectTimeoutId);
                            privateData.reconnectTimeoutId = null;
                            if (textStatus === "abort") {
                                connection.log("Aborted xhr request.");
                                return;
                            }
                            if (!tryFailConnect(error)) {
                                reconnectErrors++;
                                if (connection.state !== signalR.connectionState.reconnecting) {
                                    connection.log("An error occurred using longPolling. Status = " + textStatus + ".  Response = " + data.responseText + ".");
                                    $(instance).triggerHandler(events.onError, [error]);
                                }
                                if ((connection.state === signalR.connectionState.connected || connection.state === signalR.connectionState.reconnecting) && !transportLogic.verifyLastActive(connection)) {
                                    return;
                                }
                                if (!transportLogic.ensureReconnectingState(instance)) {
                                    return;
                                }
                                privateData.pollTimeoutId = window.setTimeout(function() {
                                    poll(instance, true);
                                }, that.reconnectDelay);
                            }
                        }
                    });
                    if (reconnecting && raiseReconnect === true) {
                        privateData.reconnectTimeoutId = window.setTimeout(function() {
                            fireReconnected(instance);
                        }, Math.min(1000 * (Math.pow(2, reconnectErrors) - 1), maxFireReconnectedTimeout));
                    }
                }(connection));
            }, 250);
        },
        lostConnection: function(connection) {
            if (connection.pollXhr) {
                connection.pollXhr.abort("lostConnection");
            }
        },
        send: function(connection, data) {
            transportLogic.ajaxSend(connection, data);
        },
        stop: function(connection) {
            window.clearTimeout(connection._.pollTimeoutId);
            window.clearTimeout(connection._.reconnectTimeoutId);
            delete connection._.pollTimeoutId;
            delete connection._.reconnectTimeoutId;
            if (connection.pollXhr) {
                connection.pollXhr.abort();
                connection.pollXhr = null;
                delete connection.pollXhr;
            }
        },
        abort: function(connection, async) {
            transportLogic.ajaxAbort(connection, async);
        }
    };
}(window.jQuery, window));
(function($, window, undefined) {
    var eventNamespace = ".hubProxy",
        signalR = $.signalR;

    function makeEventName(event) {
        return event + eventNamespace;
    }

    function map(arr, fun, thisp) {
        var i, length = arr.length,
            result = [];
        for (i = 0; i < length; i += 1) {
            if (arr.hasOwnProperty(i)) {
                result[i] = fun.call(thisp, arr[i], i, arr);
            }
        }
        return result;
    }

    function getArgValue(a) {
        return $.isFunction(a) ? null : ($.type(a) === "undefined" ? null : a);
    }

    function hasMembers(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return true;
            }
        }
        return false;
    }

    function clearInvocationCallbacks(connection, error) {
        var callbacks = connection._.invocationCallbacks,
            callback;
        if (hasMembers(callbacks)) {
            connection.log("Clearing hub invocation callbacks with error: " + error + ".");
        }
        connection._.invocationCallbackId = 0;
        delete connection._.invocationCallbacks;
        connection._.invocationCallbacks = {};
        for (var callbackId in callbacks) {
            callback = callbacks[callbackId];
            callback.method.call(callback.scope, {
                E: error
            });
        }
    }

    function hubProxy(hubConnection, hubName) {
        return new hubProxy.fn.init(hubConnection, hubName);
    }
    hubProxy.fn = hubProxy.prototype = {
        init: function(connection, hubName) {
            this.state = {};
            this.connection = connection;
            this.hubName = hubName;
            this._ = {
                callbackMap: {}
            };
        },
        constructor: hubProxy,
        hasSubscriptions: function() {
            return hasMembers(this._.callbackMap);
        },
        on: function(eventName, callback) {
            var that = this,
                callbackMap = that._.callbackMap;
            eventName = eventName.toLowerCase();
            if (!callbackMap[eventName]) {
                callbackMap[eventName] = {};
            }
            callbackMap[eventName][callback] = function(e, data) {
                callback.apply(that, data);
            };
            $(that).bind(makeEventName(eventName), callbackMap[eventName][callback]);
            return that;
        },
        off: function(eventName, callback) {
            var that = this,
                callbackMap = that._.callbackMap,
                callbackSpace;
            eventName = eventName.toLowerCase();
            callbackSpace = callbackMap[eventName];
            if (callbackSpace) {
                if (callbackSpace[callback]) {
                    $(that).unbind(makeEventName(eventName), callbackSpace[callback]);
                    delete callbackSpace[callback];
                    if (!hasMembers(callbackSpace)) {
                        delete callbackMap[eventName];
                    }
                } else if (!callback) {
                    $(that).unbind(makeEventName(eventName));
                    delete callbackMap[eventName];
                }
            }
            return that;
        },
        invoke: function(methodName) {
            var that = this,
                connection = that.connection,
                args = $.makeArray(arguments).slice(1),
                argValues = map(args, getArgValue),
                data = {
                    H: that.hubName,
                    M: methodName,
                    A: argValues,
                    I: connection._.invocationCallbackId
                },
                d = $.Deferred(),
                callback = function(minResult) {
                    var result = that._maximizeHubResponse(minResult),
                        source, error;
                    $.extend(that.state, result.State);
                    if (result.Progress) {
                        if (d.notifyWith) {
                            d.notifyWith(that, [result.Progress.Data]);
                        } else if (!connection._.progressjQueryVersionLogged) {
                            connection.log("A hub method invocation progress update was received but the version of jQuery in use (" + $.prototype.jquery + ") does not support progress updates. Upgrade to jQuery 1.7+ to receive progress notifications.");
                            connection._.progressjQueryVersionLogged = true;
                        }
                    } else if (result.Error) {
                        if (result.StackTrace) {
                            connection.log(result.Error + "\n" + result.StackTrace + ".");
                        }
                        source = result.IsHubException ? "HubException" : "Exception";
                        error = signalR._.error(result.Error, source);
                        error.data = result.ErrorData;
                        connection.log(that.hubName + "." + methodName + " failed to execute. Error: " + error.message);
                        d.rejectWith(that, [error]);
                    } else {
                        connection.log("Invoked " + that.hubName + "." + methodName);
                        d.resolveWith(that, [result.Result]);
                    }
                };
            connection._.invocationCallbacks[connection._.invocationCallbackId.toString()] = {
                scope: that,
                method: callback
            };
            connection._.invocationCallbackId += 1;
            if (!$.isEmptyObject(that.state)) {
                data.S = that.state;
            }
            connection.log("Invoking " + that.hubName + "." + methodName);
            connection.send(data);
            return d.promise();
        },
        _maximizeHubResponse: function(minHubResponse) {
            return {
                State: minHubResponse.S,
                Result: minHubResponse.R,
                Progress: minHubResponse.P ? {
                    Id: minHubResponse.P.I,
                    Data: minHubResponse.P.D
                } : null,
                Id: minHubResponse.I,
                IsHubException: minHubResponse.H,
                Error: minHubResponse.E,
                StackTrace: minHubResponse.T,
                ErrorData: minHubResponse.D
            };
        }
    };
    hubProxy.fn.init.prototype = hubProxy.fn;

    function hubConnection(url, options) {
        var settings = {
            qs: null,
            logging: false,
            useDefaultPath: true
        };
        $.extend(settings, options);
        if (!url || settings.useDefaultPath) {
            url = (url || "") + "/signalr";
        }
        return new hubConnection.fn.init(url, settings);
    }
    hubConnection.fn = hubConnection.prototype = $.connection();
    hubConnection.fn.init = function(url, options) {
        var settings = {
                qs: null,
                logging: false,
                useDefaultPath: true
            },
            connection = this;
        $.extend(settings, options);
        $.signalR.fn.init.call(connection, url, settings.qs, settings.logging);
        connection.proxies = {};
        connection._.invocationCallbackId = 0;
        connection._.invocationCallbacks = {};
        connection.received(function(minData) {
            var data, proxy, dataCallbackId, callback, hubName, eventName;
            if (!minData) {
                return;
            }
            if (typeof(minData.P) !== "undefined") {
                dataCallbackId = minData.P.I.toString();
                callback = connection._.invocationCallbacks[dataCallbackId];
                if (callback) {
                    callback.method.call(callback.scope, minData);
                }
            } else if (typeof(minData.I) !== "undefined") {
                dataCallbackId = minData.I.toString();
                callback = connection._.invocationCallbacks[dataCallbackId];
                if (callback) {
                    connection._.invocationCallbacks[dataCallbackId] = null;
                    delete connection._.invocationCallbacks[dataCallbackId];
                    callback.method.call(callback.scope, minData);
                }
            } else {
                data = this._maximizeClientHubInvocation(minData);
                connection.log("Triggering client hub event '" + data.Method + "' on hub '" + data.Hub + "'.");
                hubName = data.Hub.toLowerCase();
                eventName = data.Method.toLowerCase();
                proxy = this.proxies[hubName];
                $.extend(proxy.state, data.State);
                $(proxy).triggerHandler(makeEventName(eventName), [data.Args]);
            }
        });
        connection.error(function(errData, origData) {
            var callbackId, callback;
            if (!origData) {
                return;
            }
            callbackId = origData.I;
            callback = connection._.invocationCallbacks[callbackId];
            if (callback) {
                connection._.invocationCallbacks[callbackId] = null;
                delete connection._.invocationCallbacks[callbackId];
                callback.method.call(callback.scope, {
                    E: errData
                });
            }
        });
        connection.reconnecting(function() {
            if (connection.transport && connection.transport.name === "webSockets") {
                clearInvocationCallbacks(connection, "Connection started reconnecting before invocation result was received.");
            }
        });
        connection.disconnected(function() {
            clearInvocationCallbacks(connection, "Connection was disconnected before invocation result was received.");
        });
    };
    hubConnection.fn._maximizeClientHubInvocation = function(minClientHubInvocation) {
        return {
            Hub: minClientHubInvocation.H,
            Method: minClientHubInvocation.M,
            Args: minClientHubInvocation.A,
            State: minClientHubInvocation.S
        };
    };
    hubConnection.fn._registerSubscribedHubs = function() {
        var connection = this;
        if (!connection._subscribedToHubs) {
            connection._subscribedToHubs = true;
            connection.starting(function() {
                var subscribedHubs = [];
                $.each(connection.proxies, function(key) {
                    if (this.hasSubscriptions()) {
                        subscribedHubs.push({
                            name: key
                        });
                        connection.log("Client subscribed to hub '" + key + "'.");
                    }
                });
                if (subscribedHubs.length === 0) {
                    connection.log("No hubs have been subscribed to.  The client will not receive data from hubs.  To fix, declare at least one client side function prior to connection start for each hub you wish to subscribe to.");
                }
                connection.data = connection.json.stringify(subscribedHubs);
            });
        }
    };
    hubConnection.fn.createHubProxy = function(hubName) {
        hubName = hubName.toLowerCase();
        var proxy = this.proxies[hubName];
        if (!proxy) {
            proxy = hubProxy(this, hubName);
            this.proxies[hubName] = proxy;
        }
        this._registerSubscribedHubs();
        return proxy;
    };
    hubConnection.fn.init.prototype = hubConnection.fn;
    $.hubConnection = hubConnection;
}(window.jQuery, window));
(function($, undefined) {
    $.signalR.version = "2.2.2";
}(window.jQuery));
(function($) {
    var data_click = "unobtrusiveAjaxClick",
        data_target = "unobtrusiveAjaxClickTarget",
        data_validation = "unobtrusiveValidation";

    function getFunction(code, argNames) {
        var fn = window,
            parts = (code || "").split(".");
        while (fn && parts.length) {
            fn = fn[parts.shift()];
        }
        if (typeof(fn) === "function") {
            return fn;
        }
        argNames.push(code);
        return Function.constructor.apply(null, argNames);
    }

    function isMethodProxySafe(method) {
        return method === "GET" || method === "POST";
    }

    function asyncOnBeforeSend(xhr, method) {
        if (!isMethodProxySafe(method)) {
            xhr.setRequestHeader("X-HTTP-Method-Override", method);
        }
    }

    function asyncOnSuccess(element, data, contentType) {
        var mode;
        if (contentType.indexOf("application/x-javascript") !== -1) {
            return;
        }
        mode = (element.getAttribute("data-ajax-mode") || "").toUpperCase();
        $(element.getAttribute("data-ajax-update")).each(function(i, update) {
            var top;
            switch (mode) {
                case "BEFORE":
                    top = update.firstChild;
                    $("<div />").html(data).contents().each(function() {
                        update.insertBefore(this, top);
                    });
                    break;
                case "AFTER":
                    $("<div />").html(data).contents().each(function() {
                        update.appendChild(this);
                    });
                    break;
                case "REPLACE-WITH":
                    $(update).replaceWith(data);
                    break;
                default:
                    $(update).html(data);
                    break;
            }
        });
    }

    function asyncRequest(element, options) {
        var confirm, loading, method, duration;
        confirm = element.getAttribute("data-ajax-confirm");
        if (confirm && !window.confirm(confirm)) {
            return;
        }
        loading = $(element.getAttribute("data-ajax-loading"));
        duration = parseInt(element.getAttribute("data-ajax-loading-duration"), 10) || 0;
        $.extend(options, {
            type: element.getAttribute("data-ajax-method") || undefined,
            url: element.getAttribute("data-ajax-url") || undefined,
            cache: !!element.getAttribute("data-ajax-cache"),
            beforeSend: function(xhr) {
                var result;
                asyncOnBeforeSend(xhr, method);
                result = getFunction(element.getAttribute("data-ajax-begin"), ["xhr"]).apply(element, arguments);
                if (result !== false) {
                    loading.show(duration);
                }
                return result;
            },
            complete: function() {
                loading.hide(duration);
                getFunction(element.getAttribute("data-ajax-complete"), ["xhr", "status"]).apply(element, arguments);
            },
            success: function(data, status, xhr) {
                asyncOnSuccess(element, data, xhr.getResponseHeader("Content-Type") || "text/html");
                getFunction(element.getAttribute("data-ajax-success"), ["data", "status", "xhr"]).apply(element, arguments);
            },
            error: function() {
                getFunction(element.getAttribute("data-ajax-failure"), ["xhr", "status", "error"]).apply(element, arguments);
            }
        });
        options.data.push({
            name: "X-Requested-With",
            value: "XMLHttpRequest"
        });
        method = options.type.toUpperCase();
        if (!isMethodProxySafe(method)) {
            options.type = "POST";
            options.data.push({
                name: "X-HTTP-Method-Override",
                value: method
            });
        }
        $.ajax(options);
    }

    function validate(form) {
        var validationInfo = $(form).data(data_validation);
        return !validationInfo || !validationInfo.validate || validationInfo.validate();
    }
    $(document).on("click", "a[data-ajax=true]", function(evt) {
        evt.preventDefault();
        asyncRequest(this, {
            url: this.href,
            type: "GET",
            data: []
        });
    });
    $(document).on("click", "form[data-ajax=true] input[type=image]", function(evt) {
        var name = evt.target.name,
            target = $(evt.target),
            form = $(target.parents("form")[0]),
            offset = target.offset();
        form.data(data_click, [{
            name: name + ".x",
            value: Math.round(evt.pageX - offset.left)
        }, {
            name: name + ".y",
            value: Math.round(evt.pageY - offset.top)
        }]);
        setTimeout(function() {
            form.removeData(data_click);
        }, 0);
    });
    $(document).on("click", "form[data-ajax=true] :submit", function(evt) {
        var name = evt.currentTarget.name,
            target = $(evt.target),
            form = $(target.parents("form")[0]);
        form.data(data_click, name ? [{
            name: name,
            value: evt.currentTarget.value
        }] : []);
        form.data(data_target, target);
        setTimeout(function() {
            form.removeData(data_click);
            form.removeData(data_target);
        }, 0);
    });
    $(document).on("submit", "form[data-ajax=true]", function(evt) {
        var clickInfo = $(this).data(data_click) || [],
            clickTarget = $(this).data(data_target),
            isCancel = clickTarget && clickTarget.hasClass("cancel");
        evt.preventDefault();
        if (!isCancel && !validate(this)) {
            return;
        }
        asyncRequest(this, {
            url: this.action,
            type: this.method || "GET",
            data: clickInfo.concat($(this).serializeArray())
        });
    });
}(jQuery));
window.emotify = (function() {
    var emotify, EMOTICON_RE, emoticons = {},
        lookup = [];
    emotify = function(txt, callback) {
        callback = callback || function(img, title, smiley, text) {
            return '<img title="' + title + '" style="max-height:80px;" src="' + img + '" class="smiley"/>';
        };
        return txt.replace(EMOTICON_RE, function(a, b, text) {
            var i = 0,
                smiley = text,
                e = emoticons[text];
            if (!e) {
                while (i < lookup.length && !lookup[i].regexp.test(text)) {
                    i++
                };
                var item = lookup[i];
                if (item) {
                    smiley = item.name;
                    e = emoticons[smiley];
                }
            }
            return e ? (b + callback(e[0], e[1], smiley, text)) : a;
        });
    };
    emotifyTable = function(txt, callback) {
        callback = callback || function(img, title, smiley, text) {
            return '<img title="' + title + '" height="20px" src="' + img + '" class="smiley"/>';
        };
        return txt.replace(EMOTICON_RE, function(a, b, text) {
            var i = 0,
                smiley = text,
                e = emoticons[text];
            if (!e) {
                while (i < lookup.length && !lookup[i].regexp.test(text)) {
                    i++
                };
                smiley = lookup[i].name;
                e = emoticons[smiley];
            }
            return e ? (b + callback(e[0], e[1], smiley, text)) : a;
        });
    };
    emotify.emoticons = function() {
        var args = Array.prototype.slice.call(arguments),
            base_url = typeof args[0] === 'string' ? args.shift() : '',
            replace_all = typeof args[0] === 'boolean' ? args.shift() : false,
            smilies = args[0],
            e, arr = [],
            alts, i, regexp_str;
        if (smilies) {
            if (replace_all) {
                emoticons = {};
                lookup = [];
            }
            for (e in smilies) {
                emoticons[e] = smilies[e];
                emoticons[e][0] = base_url + emoticons[e][0];
            }
            for (e in emoticons) {
                if (emoticons[e].length > 2) {
                    alts = emoticons[e].slice(2).concat(e);
                    i = alts.length
                    while (i--) {
                        alts[i] = alts[i].replace(/(\W)/g, '\\$1');
                    }
                    regexp_str = alts.join('|');
                    lookup.push({
                        name: e,
                        regexp: new RegExp('^' + regexp_str + '$')
                    });
                } else {
                    regexp_str = e.replace(/(\W)/g, '\\$1');
                }
                arr.push(regexp_str);
            }
            EMOTICON_RE = new RegExp('(^|\\s)(' + arr.join('|') + ')(?=(?:$|\\s))', 'g');
        }
        return emoticons;
    };
    return emotify;
})();
(function(factory) {
        "use strict";
        if (typeof define === 'function' && define.amd) {
            define(['jquery'], function($) {
                return factory($, window, document);
            });
        } else if (typeof exports === 'object') {
            module.exports = function(root, $) {
                if (!root) {
                    root = window;
                }
                if (!$) {
                    $ = typeof window !== 'undefined' ? require('jquery') : require('jquery')(root);
                }
                return factory($, root, root.document);
            };
        } else {
            factory(jQuery, window, document);
        }
    }
    (function($, window, document, undefined) {
        "use strict";
        var DataTable = function(options) {
            this.$ = function(sSelector, oOpts) {
                return this.api(true).$(sSelector, oOpts);
            };
            this._ = function(sSelector, oOpts) {
                return this.api(true).rows(sSelector, oOpts).data();
            };
            this.api = function(traditional) {
                return traditional ? new _Api(_fnSettingsFromNode(this[_ext.iApiIndex])) : new _Api(this);
            };
            this.fnAddData = function(data, redraw) {
                var api = this.api(true);
                var rows = $.isArray(data) && ($.isArray(data[0]) || $.isPlainObject(data[0])) ? api.rows.add(data) : api.row.add(data);
                if (redraw === undefined || redraw) {
                    api.draw();
                }
                return rows.flatten().toArray();
            };
            this.fnAdjustColumnSizing = function(bRedraw) {
                var api = this.api(true).columns.adjust();
                var settings = api.settings()[0];
                var scroll = settings.oScroll;
                if (bRedraw === undefined || bRedraw) {
                    api.draw(false);
                } else if (scroll.sX !== "" || scroll.sY !== "") {
                    _fnScrollDraw(settings);
                }
            };
            this.fnClearTable = function(bRedraw) {
                var api = this.api(true).clear();
                if (bRedraw === undefined || bRedraw) {
                    api.draw();
                }
            };
            this.fnClose = function(nTr) {
                this.api(true).row(nTr).child.hide();
            };
            this.fnDeleteRow = function(target, callback, redraw) {
                var api = this.api(true);
                var rows = api.rows(target);
                var settings = rows.settings()[0];
                var data = settings.aoData[rows[0][0]];
                rows.remove();
                if (callback) {
                    callback.call(this, settings, data);
                }
                if (redraw === undefined || redraw) {
                    api.draw();
                }
                return data;
            };
            this.fnDestroy = function(remove) {
                this.api(true).destroy(remove);
            };
            this.fnDraw = function(complete) {
                this.api(true).draw(complete);
            };
            this.fnFilter = function(sInput, iColumn, bRegex, bSmart, bShowGlobal, bCaseInsensitive) {
                var api = this.api(true);
                if (iColumn === null || iColumn === undefined) {
                    api.search(sInput, bRegex, bSmart, bCaseInsensitive);
                } else {
                    api.column(iColumn).search(sInput, bRegex, bSmart, bCaseInsensitive);
                }
                api.draw();
            };
            this.fnGetData = function(src, col) {
                var api = this.api(true);
                if (src !== undefined) {
                    var type = src.nodeName ? src.nodeName.toLowerCase() : '';
                    return col !== undefined || type == 'td' || type == 'th' ? api.cell(src, col).data() : api.row(src).data() || null;
                }
                return api.data().toArray();
            };
            this.fnGetNodes = function(iRow) {
                var api = this.api(true);
                return iRow !== undefined ? api.row(iRow).node() : api.rows().nodes().flatten().toArray();
            };
            this.fnGetPosition = function(node) {
                var api = this.api(true);
                var nodeName = node.nodeName.toUpperCase();
                if (nodeName == 'TR') {
                    return api.row(node).index();
                } else if (nodeName == 'TD' || nodeName == 'TH') {
                    var cell = api.cell(node).index();
                    return [cell.row, cell.columnVisible, cell.column];
                }
                return null;
            };
            this.fnIsOpen = function(nTr) {
                return this.api(true).row(nTr).child.isShown();
            };
            this.fnOpen = function(nTr, mHtml, sClass) {
                return this.api(true).row(nTr).child(mHtml, sClass).show().child()[0];
            };
            this.fnPageChange = function(mAction, bRedraw) {
                var api = this.api(true).page(mAction);
                if (bRedraw === undefined || bRedraw) {
                    api.draw(false);
                }
            };
            this.fnSetColumnVis = function(iCol, bShow, bRedraw) {
                var api = this.api(true).column(iCol).visible(bShow);
                if (bRedraw === undefined || bRedraw) {
                    api.columns.adjust().draw();
                }
            };
            this.fnSettings = function() {
                return _fnSettingsFromNode(this[_ext.iApiIndex]);
            };
            this.fnSort = function(aaSort) {
                this.api(true).order(aaSort).draw();
            };
            this.fnSortListener = function(nNode, iColumn, fnCallback) {
                this.api(true).order.listener(nNode, iColumn, fnCallback);
            };
            this.fnUpdate = function(mData, mRow, iColumn, bRedraw, bAction) {
                var api = this.api(true);
                if (iColumn === undefined || iColumn === null) {
                    api.row(mRow).data(mData);
                } else {
                    api.cell(mRow, iColumn).data(mData);
                }
                if (bAction === undefined || bAction) {
                    api.columns.adjust();
                }
                if (bRedraw === undefined || bRedraw) {
                    api.draw();
                }
                return 0;
            };
            this.fnVersionCheck = _ext.fnVersionCheck;
            var _that = this;
            var emptyInit = options === undefined;
            var len = this.length;
            if (emptyInit) {
                options = {};
            }
            this.oApi = this.internal = _ext.internal;
            for (var fn in DataTable.ext.internal) {
                if (fn) {
                    this[fn] = _fnExternApiFunc(fn);
                }
            }
            this.each(function() {
                var o = {};
                var oInit = len > 1 ? _fnExtend(o, options, true) : options;
                var i = 0,
                    iLen, j, jLen, k, kLen;
                var sId = this.getAttribute('id');
                var bInitHandedOff = false;
                var defaults = DataTable.defaults;
                var $this = $(this);
                if (this.nodeName.toLowerCase() != 'table') {
                    _fnLog(null, 0, 'Non-table node initialisation (' + this.nodeName + ')', 2);
                    return;
                }
                _fnCompatOpts(defaults);
                _fnCompatCols(defaults.column);
                _fnCamelToHungarian(defaults, defaults, true);
                _fnCamelToHungarian(defaults.column, defaults.column, true);
                _fnCamelToHungarian(defaults, $.extend(oInit, $this.data()));
                var allSettings = DataTable.settings;
                for (i = 0, iLen = allSettings.length; i < iLen; i++) {
                    var s = allSettings[i];
                    if (s.nTable == this || s.nTHead.parentNode == this || (s.nTFoot && s.nTFoot.parentNode == this)) {
                        var bRetrieve = oInit.bRetrieve !== undefined ? oInit.bRetrieve : defaults.bRetrieve;
                        var bDestroy = oInit.bDestroy !== undefined ? oInit.bDestroy : defaults.bDestroy;
                        if (emptyInit || bRetrieve) {
                            return s.oInstance;
                        } else if (bDestroy) {
                            s.oInstance.fnDestroy();
                            break;
                        } else {
                            _fnLog(s, 0, 'Cannot reinitialise DataTable', 3);
                            return;
                        }
                    }
                    if (s.sTableId == this.id) {
                        allSettings.splice(i, 1);
                        break;
                    }
                }
                if (sId === null || sId === "") {
                    sId = "DataTables_Table_" + (DataTable.ext._unique++);
                    this.id = sId;
                }
                var oSettings = $.extend(true, {}, DataTable.models.oSettings, {
                    "sDestroyWidth": $this[0].style.width,
                    "sInstance": sId,
                    "sTableId": sId
                });
                oSettings.nTable = this;
                oSettings.oApi = _that.internal;
                oSettings.oInit = oInit;
                allSettings.push(oSettings);
                oSettings.oInstance = (_that.length === 1) ? _that : $this.dataTable();
                _fnCompatOpts(oInit);
                if (oInit.oLanguage) {
                    _fnLanguageCompat(oInit.oLanguage);
                }
                if (oInit.aLengthMenu && !oInit.iDisplayLength) {
                    oInit.iDisplayLength = $.isArray(oInit.aLengthMenu[0]) ? oInit.aLengthMenu[0][0] : oInit.aLengthMenu[0];
                }
                oInit = _fnExtend($.extend(true, {}, defaults), oInit);
                _fnMap(oSettings.oFeatures, oInit, ["bPaginate", "bLengthChange", "bFilter", "bSort", "bSortMulti", "bInfo", "bProcessing", "bAutoWidth", "bSortClasses", "bServerSide", "bDeferRender"]);
                _fnMap(oSettings, oInit, ["asStripeClasses", "ajax", "fnServerData", "fnFormatNumber", "sServerMethod", "aaSorting", "aaSortingFixed", "aLengthMenu", "sPaginationType", "sAjaxSource", "sAjaxDataProp", "iStateDuration", "sDom", "bSortCellsTop", "iTabIndex", "fnStateLoadCallback", "fnStateSaveCallback", "renderer", "searchDelay", "rowId", ["iCookieDuration", "iStateDuration"],
                    ["oSearch", "oPreviousSearch"],
                    ["aoSearchCols", "aoPreSearchCols"],
                    ["iDisplayLength", "_iDisplayLength"],
                    ["bJQueryUI", "bJUI"]
                ]);
                _fnMap(oSettings.oScroll, oInit, [
                    ["sScrollX", "sX"],
                    ["sScrollXInner", "sXInner"],
                    ["sScrollY", "sY"],
                    ["bScrollCollapse", "bCollapse"]
                ]);
                _fnMap(oSettings.oLanguage, oInit, "fnInfoCallback");
                _fnCallbackReg(oSettings, 'aoDrawCallback', oInit.fnDrawCallback, 'user');
                _fnCallbackReg(oSettings, 'aoServerParams', oInit.fnServerParams, 'user');
                _fnCallbackReg(oSettings, 'aoStateSaveParams', oInit.fnStateSaveParams, 'user');
                _fnCallbackReg(oSettings, 'aoStateLoadParams', oInit.fnStateLoadParams, 'user');
                _fnCallbackReg(oSettings, 'aoStateLoaded', oInit.fnStateLoaded, 'user');
                _fnCallbackReg(oSettings, 'aoRowCallback', oInit.fnRowCallback, 'user');
                _fnCallbackReg(oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow, 'user');
                _fnCallbackReg(oSettings, 'aoHeaderCallback', oInit.fnHeaderCallback, 'user');
                _fnCallbackReg(oSettings, 'aoFooterCallback', oInit.fnFooterCallback, 'user');
                _fnCallbackReg(oSettings, 'aoInitComplete', oInit.fnInitComplete, 'user');
                _fnCallbackReg(oSettings, 'aoPreDrawCallback', oInit.fnPreDrawCallback, 'user');
                oSettings.rowIdFn = _fnGetObjectDataFn(oInit.rowId);
                _fnBrowserDetect(oSettings);
                var oClasses = oSettings.oClasses;
                if (oInit.bJQueryUI) {
                    $.extend(oClasses, DataTable.ext.oJUIClasses, oInit.oClasses);
                    if (oInit.sDom === defaults.sDom && defaults.sDom === "lfrtip") {
                        oSettings.sDom = '<"H"lfr>t<"F"ip>';
                    }
                    if (!oSettings.renderer) {
                        oSettings.renderer = 'jqueryui';
                    } else if ($.isPlainObject(oSettings.renderer) && !oSettings.renderer.header) {
                        oSettings.renderer.header = 'jqueryui';
                    }
                } else {
                    $.extend(oClasses, DataTable.ext.classes, oInit.oClasses);
                }
                $this.addClass(oClasses.sTable);
                if (oSettings.iInitDisplayStart === undefined) {
                    oSettings.iInitDisplayStart = oInit.iDisplayStart;
                    oSettings._iDisplayStart = oInit.iDisplayStart;
                }
                if (oInit.iDeferLoading !== null) {
                    oSettings.bDeferLoading = true;
                    var tmp = $.isArray(oInit.iDeferLoading);
                    oSettings._iRecordsDisplay = tmp ? oInit.iDeferLoading[0] : oInit.iDeferLoading;
                    oSettings._iRecordsTotal = tmp ? oInit.iDeferLoading[1] : oInit.iDeferLoading;
                }
                var oLanguage = oSettings.oLanguage;
                $.extend(true, oLanguage, oInit.oLanguage);
                if (oLanguage.sUrl) {
                    $.ajax({
                        dataType: 'json',
                        url: oLanguage.sUrl,
                        success: function(json) {
                            _fnLanguageCompat(json);
                            _fnCamelToHungarian(defaults.oLanguage, json);
                            $.extend(true, oLanguage, json);
                            _fnInitialise(oSettings);
                        },
                        error: function() {
                            _fnInitialise(oSettings);
                        }
                    });
                    bInitHandedOff = true;
                }
                if (oInit.asStripeClasses === null) {
                    oSettings.asStripeClasses = [oClasses.sStripeOdd, oClasses.sStripeEven];
                }
                var stripeClasses = oSettings.asStripeClasses;
                var rowOne = $this.children('tbody').find('tr').eq(0);
                if ($.inArray(true, $.map(stripeClasses, function(el, i) {
                        return rowOne.hasClass(el);
                    })) !== -1) {
                    $('tbody tr', this).removeClass(stripeClasses.join(' '));
                    oSettings.asDestroyStripes = stripeClasses.slice();
                }
                var anThs = [];
                var aoColumnsInit;
                var nThead = this.getElementsByTagName('thead');
                if (nThead.length !== 0) {
                    _fnDetectHeader(oSettings.aoHeader, nThead[0]);
                    anThs = _fnGetUniqueThs(oSettings);
                }
                if (oInit.aoColumns === null) {
                    aoColumnsInit = [];
                    for (i = 0, iLen = anThs.length; i < iLen; i++) {
                        aoColumnsInit.push(null);
                    }
                } else {
                    aoColumnsInit = oInit.aoColumns;
                }
                for (i = 0, iLen = aoColumnsInit.length; i < iLen; i++) {
                    _fnAddColumn(oSettings, anThs ? anThs[i] : null);
                }
                _fnApplyColumnDefs(oSettings, oInit.aoColumnDefs, aoColumnsInit, function(iCol, oDef) {
                    _fnColumnOptions(oSettings, iCol, oDef);
                });
                if (rowOne.length) {
                    var a = function(cell, name) {
                        return cell.getAttribute('data-' + name) !== null ? name : null;
                    };
                    $(rowOne[0]).children('th, td').each(function(i, cell) {
                        var col = oSettings.aoColumns[i];
                        if (col.mData === i) {
                            var sort = a(cell, 'sort') || a(cell, 'order');
                            var filter = a(cell, 'filter') || a(cell, 'search');
                            if (sort !== null || filter !== null) {
                                col.mData = {
                                    _: i + '.display',
                                    sort: sort !== null ? i + '.@data-' + sort : undefined,
                                    type: sort !== null ? i + '.@data-' + sort : undefined,
                                    filter: filter !== null ? i + '.@data-' + filter : undefined
                                };
                                _fnColumnOptions(oSettings, i);
                            }
                        }
                    });
                }
                var features = oSettings.oFeatures;
                var loadedInit = function() {
                    if (oInit.aaSorting === undefined) {
                        var sorting = oSettings.aaSorting;
                        for (i = 0, iLen = sorting.length; i < iLen; i++) {
                            sorting[i][1] = oSettings.aoColumns[i].asSorting[0];
                        }
                    }
                    _fnSortingClasses(oSettings);
                    if (features.bSort) {
                        _fnCallbackReg(oSettings, 'aoDrawCallback', function() {
                            if (oSettings.bSorted) {
                                var aSort = _fnSortFlatten(oSettings);
                                var sortedColumns = {};
                                $.each(aSort, function(i, val) {
                                    sortedColumns[val.src] = val.dir;
                                });
                                _fnCallbackFire(oSettings, null, 'order', [oSettings, aSort, sortedColumns]);
                                _fnSortAria(oSettings);
                            }
                        });
                    }
                    _fnCallbackReg(oSettings, 'aoDrawCallback', function() {
                        if (oSettings.bSorted || _fnDataSource(oSettings) === 'ssp' || features.bDeferRender) {
                            _fnSortingClasses(oSettings);
                        }
                    }, 'sc');
                    var captions = $this.children('caption').each(function() {
                        this._captionSide = $(this).css('caption-side');
                    });
                    var thead = $this.children('thead');
                    if (thead.length === 0) {
                        thead = $('<thead/>').appendTo($this);
                    }
                    oSettings.nTHead = thead[0];
                    var tbody = $this.children('tbody');
                    if (tbody.length === 0) {
                        tbody = $('<tbody/>').appendTo($this);
                    }
                    oSettings.nTBody = tbody[0];
                    var tfoot = $this.children('tfoot');
                    if (tfoot.length === 0 && captions.length > 0 && (oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "")) {
                        tfoot = $('<tfoot/>').appendTo($this);
                    }
                    if (tfoot.length === 0 || tfoot.children().length === 0) {
                        $this.addClass(oClasses.sNoFooter);
                    } else if (tfoot.length > 0) {
                        oSettings.nTFoot = tfoot[0];
                        _fnDetectHeader(oSettings.aoFooter, oSettings.nTFoot);
                    }
                    if (oInit.aaData) {
                        for (i = 0; i < oInit.aaData.length; i++) {
                            _fnAddData(oSettings, oInit.aaData[i]);
                        }
                    } else if (oSettings.bDeferLoading || _fnDataSource(oSettings) == 'dom') {
                        _fnAddTr(oSettings, $(oSettings.nTBody).children('tr'));
                    }
                    oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
                    oSettings.bInitialised = true;
                    if (bInitHandedOff === false) {
                        _fnInitialise(oSettings);
                    }
                };
                if (oInit.bStateSave) {
                    features.bStateSave = true;
                    _fnCallbackReg(oSettings, 'aoDrawCallback', _fnSaveState, 'state_save');
                    _fnLoadState(oSettings, oInit, loadedInit);
                } else {
                    loadedInit();
                }
            });
            _that = null;
            return this;
        };
        var _ext;
        var _Api;
        var _api_register;
        var _api_registerPlural;
        var _re_dic = {};
        var _re_new_lines = /[\r\n]/g;
        var _re_html = /<.*?>/g;
        var _re_date = /^\d{2,4}[\.\/\-]\d{1,2}[\.\/\-]\d{1,2}([T ]{1}\d{1,2}[:\.]\d{2}([\.:]\d{2})?)?$/;
        var _re_escape_regex = new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-'].join('|\\') + ')', 'g');
        var _re_formatted_numeric = /[',$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfk]/gi;
        var _empty = function(d) {
            return !d || d === true || d === '-' ? true : false;
        };
        var _intVal = function(s) {
            var integer = parseInt(s, 10);
            return !isNaN(integer) && isFinite(s) ? integer : null;
        };
        var _numToDecimal = function(num, decimalPoint) {
            if (!_re_dic[decimalPoint]) {
                _re_dic[decimalPoint] = new RegExp(_fnEscapeRegex(decimalPoint), 'g');
            }
            return typeof num === 'string' && decimalPoint !== '.' ? num.replace(/\./g, '').replace(_re_dic[decimalPoint], '.') : num;
        };
        var _isNumber = function(d, decimalPoint, formatted) {
            var strType = typeof d === 'string';
            if (_empty(d)) {
                return true;
            }
            if (decimalPoint && strType) {
                d = _numToDecimal(d, decimalPoint);
            }
            if (formatted && strType) {
                d = d.replace(_re_formatted_numeric, '');
            }
            return !isNaN(parseFloat(d)) && isFinite(d);
        };
        var _isHtml = function(d) {
            return _empty(d) || typeof d === 'string';
        };
        var _htmlNumeric = function(d, decimalPoint, formatted) {
            if (_empty(d)) {
                return true;
            }
            var html = _isHtml(d);
            return !html ? null : _isNumber(_stripHtml(d), decimalPoint, formatted) ? true : null;
        };
        var _pluck = function(a, prop, prop2) {
            var out = [];
            var i = 0,
                ien = a.length;
            if (prop2 !== undefined) {
                for (; i < ien; i++) {
                    if (a[i] && a[i][prop]) {
                        out.push(a[i][prop][prop2]);
                    }
                }
            } else {
                for (; i < ien; i++) {
                    if (a[i]) {
                        out.push(a[i][prop]);
                    }
                }
            }
            return out;
        };
        var _pluck_order = function(a, order, prop, prop2) {
            var out = [];
            var i = 0,
                ien = order.length;
            if (prop2 !== undefined) {
                for (; i < ien; i++) {
                    if (a[order[i]][prop]) {
                        out.push(a[order[i]][prop][prop2]);
                    }
                }
            } else {
                for (; i < ien; i++) {
                    out.push(a[order[i]][prop]);
                }
            }
            return out;
        };
        var _range = function(len, start) {
            var out = [];
            var end;
            if (start === undefined) {
                start = 0;
                end = len;
            } else {
                end = start;
                start = len;
            }
            for (var i = start; i < end; i++) {
                out.push(i);
            }
            return out;
        };
        var _removeEmpty = function(a) {
            var out = [];
            for (var i = 0, ien = a.length; i < ien; i++) {
                if (a[i]) {
                    out.push(a[i]);
                }
            }
            return out;
        };
        var _stripHtml = function(d) {
            return d.replace(_re_html, '');
        };
        var _unique = function(src) {
            var
                out = [],
                val, i, ien = src.length,
                j, k = 0;
            again: for (i = 0; i < ien; i++) {
                val = src[i];
                for (j = 0; j < k; j++) {
                    if (out[j] === val) {
                        continue again;
                    }
                }
                out.push(val);
                k++;
            }
            return out;
        };
        DataTable.util = {
            throttle: function(fn, freq) {
                var
                    frequency = freq !== undefined ? freq : 200,
                    last, timer;
                return function() {
                    var
                        that = this,
                        now = +new Date(),
                        args = arguments;
                    if (last && now < last + frequency) {
                        clearTimeout(timer);
                        timer = setTimeout(function() {
                            last = undefined;
                            fn.apply(that, args);
                        }, frequency);
                    } else {
                        last = now;
                        fn.apply(that, args);
                    }
                };
            },
            escapeRegex: function(val) {
                return val.replace(_re_escape_regex, '\\$1');
            }
        };

        function _fnHungarianMap(o) {
            var
                hungarian = 'a aa ai ao as b fn i m o s ',
                match, newKey, map = {};
            $.each(o, function(key, val) {
                match = key.match(/^([^A-Z]+?)([A-Z])/);
                if (match && hungarian.indexOf(match[1] + ' ') !== -1) {
                    newKey = key.replace(match[0], match[2].toLowerCase());
                    map[newKey] = key;
                    if (match[1] === 'o') {
                        _fnHungarianMap(o[key]);
                    }
                }
            });
            o._hungarianMap = map;
        }

        function _fnCamelToHungarian(src, user, force) {
            if (!src._hungarianMap) {
                _fnHungarianMap(src);
            }
            var hungarianKey;
            $.each(user, function(key, val) {
                hungarianKey = src._hungarianMap[key];
                if (hungarianKey !== undefined && (force || user[hungarianKey] === undefined)) {
                    if (hungarianKey.charAt(0) === 'o') {
                        if (!user[hungarianKey]) {
                            user[hungarianKey] = {};
                        }
                        $.extend(true, user[hungarianKey], user[key]);
                        _fnCamelToHungarian(src[hungarianKey], user[hungarianKey], force);
                    } else {
                        user[hungarianKey] = user[key];
                    }
                }
            });
        }

        function _fnLanguageCompat(lang) {
            var defaults = DataTable.defaults.oLanguage;
            var zeroRecords = lang.sZeroRecords;
            if (!lang.sEmptyTable && zeroRecords && defaults.sEmptyTable === "No data available in table") {
                _fnMap(lang, lang, 'sZeroRecords', 'sEmptyTable');
            }
            if (!lang.sLoadingRecords && zeroRecords && defaults.sLoadingRecords === "Loading...") {
                _fnMap(lang, lang, 'sZeroRecords', 'sLoadingRecords');
            }
            if (lang.sInfoThousands) {
                lang.sThousands = lang.sInfoThousands;
            }
            var decimal = lang.sDecimal;
            if (decimal) {
                _addNumericSort(decimal);
            }
        }
        var _fnCompatMap = function(o, knew, old) {
            if (o[knew] !== undefined) {
                o[old] = o[knew];
            }
        };

        function _fnCompatOpts(init) {
            _fnCompatMap(init, 'ordering', 'bSort');
            _fnCompatMap(init, 'orderMulti', 'bSortMulti');
            _fnCompatMap(init, 'orderClasses', 'bSortClasses');
            _fnCompatMap(init, 'orderCellsTop', 'bSortCellsTop');
            _fnCompatMap(init, 'order', 'aaSorting');
            _fnCompatMap(init, 'orderFixed', 'aaSortingFixed');
            _fnCompatMap(init, 'paging', 'bPaginate');
            _fnCompatMap(init, 'pagingType', 'sPaginationType');
            _fnCompatMap(init, 'pageLength', 'iDisplayLength');
            _fnCompatMap(init, 'searching', 'bFilter');
            if (typeof init.sScrollX === 'boolean') {
                init.sScrollX = init.sScrollX ? '100%' : '';
            }
            if (typeof init.scrollX === 'boolean') {
                init.scrollX = init.scrollX ? '100%' : '';
            }
            var searchCols = init.aoSearchCols;
            if (searchCols) {
                for (var i = 0, ien = searchCols.length; i < ien; i++) {
                    if (searchCols[i]) {
                        _fnCamelToHungarian(DataTable.models.oSearch, searchCols[i]);
                    }
                }
            }
        }

        function _fnCompatCols(init) {
            _fnCompatMap(init, 'orderable', 'bSortable');
            _fnCompatMap(init, 'orderData', 'aDataSort');
            _fnCompatMap(init, 'orderSequence', 'asSorting');
            _fnCompatMap(init, 'orderDataType', 'sortDataType');
            var dataSort = init.aDataSort;
            if (dataSort && !$.isArray(dataSort)) {
                init.aDataSort = [dataSort];
            }
        }

        function _fnBrowserDetect(settings) {
            if (!DataTable.__browser) {
                var browser = {};
                DataTable.__browser = browser;
                var n = $('<div/>').css({
                    position: 'fixed',
                    top: 0,
                    left: $(window).scrollLeft() * -1,
                    height: 1,
                    width: 1,
                    overflow: 'hidden'
                }).append($('<div/>').css({
                    position: 'absolute',
                    top: 1,
                    left: 1,
                    width: 100,
                    overflow: 'scroll'
                }).append($('<div/>').css({
                    width: '100%',
                    height: 10
                }))).appendTo('body');
                var outer = n.children();
                var inner = outer.children();
                browser.barWidth = outer[0].offsetWidth - outer[0].clientWidth;
                browser.bScrollOversize = inner[0].offsetWidth === 100 && outer[0].clientWidth !== 100;
                browser.bScrollbarLeft = Math.round(inner.offset().left) !== 1;
                browser.bBounding = n[0].getBoundingClientRect().width ? true : false;
                n.remove();
            }
            $.extend(settings.oBrowser, DataTable.__browser);
            settings.oScroll.iBarWidth = DataTable.__browser.barWidth;
        }

        function _fnReduce(that, fn, init, start, end, inc) {
            var
                i = start,
                value, isSet = false;
            if (init !== undefined) {
                value = init;
                isSet = true;
            }
            while (i !== end) {
                if (!that.hasOwnProperty(i)) {
                    continue;
                }
                value = isSet ? fn(value, that[i], i, that) : that[i];
                isSet = true;
                i += inc;
            }
            return value;
        }

        function _fnAddColumn(oSettings, nTh) {
            var oDefaults = DataTable.defaults.column;
            var iCol = oSettings.aoColumns.length;
            var oCol = $.extend({}, DataTable.models.oColumn, oDefaults, {
                "nTh": nTh ? nTh : document.createElement('th'),
                "sTitle": oDefaults.sTitle ? oDefaults.sTitle : nTh ? nTh.innerHTML : '',
                "aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
                "mData": oDefaults.mData ? oDefaults.mData : iCol,
                idx: iCol
            });
            oSettings.aoColumns.push(oCol);
            var searchCols = oSettings.aoPreSearchCols;
            searchCols[iCol] = $.extend({}, DataTable.models.oSearch, searchCols[iCol]);
            _fnColumnOptions(oSettings, iCol, $(nTh).data());
        }

        function _fnColumnOptions(oSettings, iCol, oOptions) {
            var oCol = oSettings.aoColumns[iCol];
            var oClasses = oSettings.oClasses;
            var th = $(oCol.nTh);
            if (!oCol.sWidthOrig) {
                oCol.sWidthOrig = th.attr('width') || null;
                var t = (th.attr('style') || '').match(/width:\s*(\d+[pxem%]+)/);
                if (t) {
                    oCol.sWidthOrig = t[1];
                }
            }
            if (oOptions !== undefined && oOptions !== null) {
                _fnCompatCols(oOptions);
                _fnCamelToHungarian(DataTable.defaults.column, oOptions);
                if (oOptions.mDataProp !== undefined && !oOptions.mData) {
                    oOptions.mData = oOptions.mDataProp;
                }
                if (oOptions.sType) {
                    oCol._sManualType = oOptions.sType;
                }
                if (oOptions.className && !oOptions.sClass) {
                    oOptions.sClass = oOptions.className;
                }
                $.extend(oCol, oOptions);
                _fnMap(oCol, oOptions, "sWidth", "sWidthOrig");
                if (oOptions.iDataSort !== undefined) {
                    oCol.aDataSort = [oOptions.iDataSort];
                }
                _fnMap(oCol, oOptions, "aDataSort");
            }
            var mDataSrc = oCol.mData;
            var mData = _fnGetObjectDataFn(mDataSrc);
            var mRender = oCol.mRender ? _fnGetObjectDataFn(oCol.mRender) : null;
            var attrTest = function(src) {
                return typeof src === 'string' && src.indexOf('@') !== -1;
            };
            oCol._bAttrSrc = $.isPlainObject(mDataSrc) && (attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter));
            oCol._setter = null;
            oCol.fnGetData = function(rowData, type, meta) {
                var innerData = mData(rowData, type, undefined, meta);
                return mRender && type ? mRender(innerData, type, rowData, meta) : innerData;
            };
            oCol.fnSetData = function(rowData, val, meta) {
                return _fnSetObjectDataFn(mDataSrc)(rowData, val, meta);
            };
            if (typeof mDataSrc !== 'number') {
                oSettings._rowReadObject = true;
            }
            if (!oSettings.oFeatures.bSort) {
                oCol.bSortable = false;
                th.addClass(oClasses.sSortableNone);
            }
            var bAsc = $.inArray('asc', oCol.asSorting) !== -1;
            var bDesc = $.inArray('desc', oCol.asSorting) !== -1;
            if (!oCol.bSortable || (!bAsc && !bDesc)) {
                oCol.sSortingClass = oClasses.sSortableNone;
                oCol.sSortingClassJUI = "";
            } else if (bAsc && !bDesc) {
                oCol.sSortingClass = oClasses.sSortableAsc;
                oCol.sSortingClassJUI = oClasses.sSortJUIAscAllowed;
            } else if (!bAsc && bDesc) {
                oCol.sSortingClass = oClasses.sSortableDesc;
                oCol.sSortingClassJUI = oClasses.sSortJUIDescAllowed;
            } else {
                oCol.sSortingClass = oClasses.sSortable;
                oCol.sSortingClassJUI = oClasses.sSortJUI;
            }
        }

        function _fnAdjustColumnSizing(settings) {
            if (settings.oFeatures.bAutoWidth !== false) {
                var columns = settings.aoColumns;
                _fnCalculateColumnWidths(settings);
                for (var i = 0, iLen = columns.length; i < iLen; i++) {
                    columns[i].nTh.style.width = columns[i].sWidth;
                }
            }
            var scroll = settings.oScroll;
            if (scroll.sY !== '' || scroll.sX !== '') {
                _fnScrollDraw(settings);
            }
            _fnCallbackFire(settings, null, 'column-sizing', [settings]);
        }

        function _fnVisibleToColumnIndex(oSettings, iMatch) {
            var aiVis = _fnGetColumns(oSettings, 'bVisible');
            return typeof aiVis[iMatch] === 'number' ? aiVis[iMatch] : null;
        }

        function _fnColumnIndexToVisible(oSettings, iMatch) {
            var aiVis = _fnGetColumns(oSettings, 'bVisible');
            var iPos = $.inArray(iMatch, aiVis);
            return iPos !== -1 ? iPos : null;
        }

        function _fnVisbleColumns(oSettings) {
            var vis = 0;
            $.each(oSettings.aoColumns, function(i, col) {
                if (col.bVisible && $(col.nTh).css('display') !== 'none') {
                    vis++;
                }
            });
            return vis;
        }

        function _fnGetColumns(oSettings, sParam) {
            var a = [];
            $.map(oSettings.aoColumns, function(val, i) {
                if (val[sParam]) {
                    a.push(i);
                }
            });
            return a;
        }

        function _fnColumnTypes(settings) {
            var columns = settings.aoColumns;
            var data = settings.aoData;
            var types = DataTable.ext.type.detect;
            var i, ien, j, jen, k, ken;
            var col, cell, detectedType, cache;
            for (i = 0, ien = columns.length; i < ien; i++) {
                col = columns[i];
                cache = [];
                if (!col.sType && col._sManualType) {
                    col.sType = col._sManualType;
                } else if (!col.sType) {
                    for (j = 0, jen = types.length; j < jen; j++) {
                        for (k = 0, ken = data.length; k < ken; k++) {
                            if (cache[k] === undefined) {
                                cache[k] = _fnGetCellData(settings, k, i, 'type');
                            }
                            detectedType = types[j](cache[k], settings);
                            if (!detectedType && j !== types.length - 1) {
                                break;
                            }
                            if (detectedType === 'html') {
                                break;
                            }
                        }
                        if (detectedType) {
                            col.sType = detectedType;
                            break;
                        }
                    }
                    if (!col.sType) {
                        col.sType = 'string';
                    }
                }
            }
        }

        function _fnApplyColumnDefs(oSettings, aoColDefs, aoCols, fn) {
            var i, iLen, j, jLen, k, kLen, def;
            var columns = oSettings.aoColumns;
            if (aoColDefs) {
                for (i = aoColDefs.length - 1; i >= 0; i--) {
                    def = aoColDefs[i];
                    var aTargets = def.targets !== undefined ? def.targets : def.aTargets;
                    if (!$.isArray(aTargets)) {
                        aTargets = [aTargets];
                    }
                    for (j = 0, jLen = aTargets.length; j < jLen; j++) {
                        if (typeof aTargets[j] === 'number' && aTargets[j] >= 0) {
                            while (columns.length <= aTargets[j]) {
                                _fnAddColumn(oSettings);
                            }
                            fn(aTargets[j], def);
                        } else if (typeof aTargets[j] === 'number' && aTargets[j] < 0) {
                            fn(columns.length + aTargets[j], def);
                        } else if (typeof aTargets[j] === 'string') {
                            for (k = 0, kLen = columns.length; k < kLen; k++) {
                                if (aTargets[j] == "_all" || $(columns[k].nTh).hasClass(aTargets[j])) {
                                    fn(k, def);
                                }
                            }
                        }
                    }
                }
            }
            if (aoCols) {
                for (i = 0, iLen = aoCols.length; i < iLen; i++) {
                    fn(i, aoCols[i]);
                }
            }
        }

        function _fnAddData(oSettings, aDataIn, nTr, anTds) {
            var iRow = oSettings.aoData.length;
            var oData = $.extend(true, {}, DataTable.models.oRow, {
                src: nTr ? 'dom' : 'data',
                idx: iRow
            });
            oData._aData = aDataIn;
            oSettings.aoData.push(oData);
            var nTd, sThisType;
            var columns = oSettings.aoColumns;
            for (var i = 0, iLen = columns.length; i < iLen; i++) {
                columns[i].sType = null;
            }
            oSettings.aiDisplayMaster.push(iRow);
            var id = oSettings.rowIdFn(aDataIn);
            if (id !== undefined) {
                oSettings.aIds[id] = oData;
            }
            if (nTr || !oSettings.oFeatures.bDeferRender) {
                _fnCreateTr(oSettings, iRow, nTr, anTds);
            }
            return iRow;
        }

        function _fnAddTr(settings, trs) {
            var row;
            if (!(trs instanceof $)) {
                trs = $(trs);
            }
            return trs.map(function(i, el) {
                row = _fnGetRowElements(settings, el);
                return _fnAddData(settings, row.data, el, row.cells);
            });
        }

        function _fnNodeToDataIndex(oSettings, n) {
            return (n._DT_RowIndex !== undefined) ? n._DT_RowIndex : null;
        }

        function _fnNodeToColumnIndex(oSettings, iRow, n) {
            return $.inArray(n, oSettings.aoData[iRow].anCells);
        }

        function _fnGetCellData(settings, rowIdx, colIdx, type) {
            var draw = settings.iDraw;
            var col = settings.aoColumns[colIdx];
            var rowData = settings.aoData[rowIdx]._aData;
            var defaultContent = col.sDefaultContent;
            var cellData = col.fnGetData(rowData, type, {
                settings: settings,
                row: rowIdx,
                col: colIdx
            });
            if (cellData === undefined) {
                if (settings.iDrawError != draw && defaultContent === null) {
                    _fnLog(settings, 0, "Requested unknown parameter " + (typeof col.mData == 'function' ? '{function}' : "'" + col.mData + "'") + " for row " + rowIdx + ", column " + colIdx, 4);
                    settings.iDrawError = draw;
                }
                return defaultContent;
            }
            if ((cellData === rowData || cellData === null) && defaultContent !== null && type !== undefined) {
                cellData = defaultContent;
            } else if (typeof cellData === 'function') {
                return cellData.call(rowData);
            }
            if (cellData === null && type == 'display') {
                return '';
            }
            return cellData;
        }

        function _fnSetCellData(settings, rowIdx, colIdx, val) {
            var col = settings.aoColumns[colIdx];
            var rowData = settings.aoData[rowIdx]._aData;
            col.fnSetData(rowData, val, {
                settings: settings,
                row: rowIdx,
                col: colIdx
            });
        }
        var __reArray = /\[.*?\]$/;
        var __reFn = /\(\)$/;

        function _fnSplitObjNotation(str) {
            return $.map(str.match(/(\\.|[^\.])+/g) || [''], function(s) {
                return s.replace(/\\\./g, '.');
            });
        }

        function _fnGetObjectDataFn(mSource) {
            if ($.isPlainObject(mSource)) {
                var o = {};
                $.each(mSource, function(key, val) {
                    if (val) {
                        o[key] = _fnGetObjectDataFn(val);
                    }
                });
                return function(data, type, row, meta) {
                    var t = o[type] || o._;
                    return t !== undefined ? t(data, type, row, meta) : data;
                };
            } else if (mSource === null) {
                return function(data) {
                    return data;
                };
            } else if (typeof mSource === 'function') {
                return function(data, type, row, meta) {
                    return mSource(data, type, row, meta);
                };
            } else if (typeof mSource === 'string' && (mSource.indexOf('.') !== -1 || mSource.indexOf('[') !== -1 || mSource.indexOf('(') !== -1)) {
                var fetchData = function(data, type, src) {
                    var arrayNotation, funcNotation, out, innerSrc;
                    if (src !== "") {
                        var a = _fnSplitObjNotation(src);
                        for (var i = 0, iLen = a.length; i < iLen; i++) {
                            arrayNotation = a[i].match(__reArray);
                            funcNotation = a[i].match(__reFn);
                            if (arrayNotation) {
                                a[i] = a[i].replace(__reArray, '');
                                if (a[i] !== "") {
                                    data = data[a[i]];
                                }
                                out = [];
                                a.splice(0, i + 1);
                                innerSrc = a.join('.');
                                if ($.isArray(data)) {
                                    for (var j = 0, jLen = data.length; j < jLen; j++) {
                                        out.push(fetchData(data[j], type, innerSrc));
                                    }
                                }
                                var join = arrayNotation[0].substring(1, arrayNotation[0].length - 1);
                                data = (join === "") ? out : out.join(join);
                                break;
                            } else if (funcNotation) {
                                a[i] = a[i].replace(__reFn, '');
                                data = data[a[i]]();
                                continue;
                            }
                            if (data === null || data[a[i]] === undefined) {
                                return undefined;
                            }
                            data = data[a[i]];
                        }
                    }
                    return data;
                };
                return function(data, type) {
                    return fetchData(data, type, mSource);
                };
            } else {
                return function(data, type) {
                    return data[mSource];
                };
            }
        }

        function _fnSetObjectDataFn(mSource) {
            if ($.isPlainObject(mSource)) {
                return _fnSetObjectDataFn(mSource._);
            } else if (mSource === null) {
                return function() {};
            } else if (typeof mSource === 'function') {
                return function(data, val, meta) {
                    mSource(data, 'set', val, meta);
                };
            } else if (typeof mSource === 'string' && (mSource.indexOf('.') !== -1 || mSource.indexOf('[') !== -1 || mSource.indexOf('(') !== -1)) {
                var setData = function(data, val, src) {
                    var a = _fnSplitObjNotation(src),
                        b;
                    var aLast = a[a.length - 1];
                    var arrayNotation, funcNotation, o, innerSrc;
                    for (var i = 0, iLen = a.length - 1; i < iLen; i++) {
                        arrayNotation = a[i].match(__reArray);
                        funcNotation = a[i].match(__reFn);
                        if (arrayNotation) {
                            a[i] = a[i].replace(__reArray, '');
                            data[a[i]] = [];
                            b = a.slice();
                            b.splice(0, i + 1);
                            innerSrc = b.join('.');
                            if ($.isArray(val)) {
                                for (var j = 0, jLen = val.length; j < jLen; j++) {
                                    o = {};
                                    setData(o, val[j], innerSrc);
                                    data[a[i]].push(o);
                                }
                            } else {
                                data[a[i]] = val;
                            }
                            return;
                        } else if (funcNotation) {
                            a[i] = a[i].replace(__reFn, '');
                            data = data[a[i]](val);
                        }
                        if (data[a[i]] === null || data[a[i]] === undefined) {
                            data[a[i]] = {};
                        }
                        data = data[a[i]];
                    }
                    if (aLast.match(__reFn)) {
                        data = data[aLast.replace(__reFn, '')](val);
                    } else {
                        data[aLast.replace(__reArray, '')] = val;
                    }
                };
                return function(data, val) {
                    return setData(data, val, mSource);
                };
            } else {
                return function(data, val) {
                    data[mSource] = val;
                };
            }
        }

        function _fnGetDataMaster(settings) {
            return _pluck(settings.aoData, '_aData');
        }

        function _fnClearTable(settings) {
            settings.aoData.length = 0;
            settings.aiDisplayMaster.length = 0;
            settings.aiDisplay.length = 0;
            settings.aIds = {};
        }

        function _fnDeleteIndex(a, iTarget, splice) {
            var iTargetIndex = -1;
            for (var i = 0, iLen = a.length; i < iLen; i++) {
                if (a[i] == iTarget) {
                    iTargetIndex = i;
                } else if (a[i] > iTarget) {
                    a[i]--;
                }
            }
            if (iTargetIndex != -1 && splice === undefined) {
                a.splice(iTargetIndex, 1);
            }
        }

        function _fnInvalidate(settings, rowIdx, src, colIdx) {
            var row = settings.aoData[rowIdx];
            var i, ien;
            var cellWrite = function(cell, col) {
                while (cell.childNodes.length) {
                    cell.removeChild(cell.firstChild);
                }
                cell.innerHTML = _fnGetCellData(settings, rowIdx, col, 'display');
            };
            if (src === 'dom' || ((!src || src === 'auto') && row.src === 'dom')) {
                row._aData = _fnGetRowElements(settings, row, colIdx, colIdx === undefined ? undefined : row._aData).data;
            } else {
                var cells = row.anCells;
                if (cells) {
                    if (colIdx !== undefined) {
                        cellWrite(cells[colIdx], colIdx);
                    } else {
                        for (i = 0, ien = cells.length; i < ien; i++) {
                            cellWrite(cells[i], i);
                        }
                    }
                }
            }
            row._aSortData = null;
            row._aFilterData = null;
            var cols = settings.aoColumns;
            if (colIdx !== undefined) {
                cols[colIdx].sType = null;
            } else {
                for (i = 0, ien = cols.length; i < ien; i++) {
                    cols[i].sType = null;
                }
                _fnRowAttributes(settings, row);
            }
        }

        function _fnGetRowElements(settings, row, colIdx, d) {
            var
                tds = [],
                td = row.firstChild,
                name, col, o, i = 0,
                contents, columns = settings.aoColumns,
                objectRead = settings._rowReadObject;
            d = d !== undefined ? d : objectRead ? {} : [];
            var attr = function(str, td) {
                if (typeof str === 'string') {
                    var idx = str.indexOf('@');
                    if (idx !== -1) {
                        var attr = str.substring(idx + 1);
                        var setter = _fnSetObjectDataFn(str);
                        setter(d, td.getAttribute(attr));
                    }
                }
            };
            var cellProcess = function(cell) {
                if (colIdx === undefined || colIdx === i) {
                    col = columns[i];
                    contents = $.trim(cell.innerHTML);
                    if (col && col._bAttrSrc) {
                        var setter = _fnSetObjectDataFn(col.mData._);
                        setter(d, contents);
                        attr(col.mData.sort, cell);
                        attr(col.mData.type, cell);
                        attr(col.mData.filter, cell);
                    } else {
                        if (objectRead) {
                            if (!col._setter) {
                                col._setter = _fnSetObjectDataFn(col.mData);
                            }
                            col._setter(d, contents);
                        } else {
                            d[i] = contents;
                        }
                    }
                }
                i++;
            };
            if (td) {
                while (td) {
                    name = td.nodeName.toUpperCase();
                    if (name == "TD" || name == "TH") {
                        cellProcess(td);
                        tds.push(td);
                    }
                    td = td.nextSibling;
                }
            } else {
                tds = row.anCells;
                for (var j = 0, jen = tds.length; j < jen; j++) {
                    cellProcess(tds[j]);
                }
            }
            var rowNode = row.firstChild ? row : row.nTr;
            if (rowNode) {
                var id = rowNode.getAttribute('id');
                if (id) {
                    _fnSetObjectDataFn(settings.rowId)(d, id);
                }
            }
            return {
                data: d,
                cells: tds
            };
        }

        function _fnCreateTr(oSettings, iRow, nTrIn, anTds) {
            var
                row = oSettings.aoData[iRow],
                rowData = row._aData,
                cells = [],
                nTr, nTd, oCol, i, iLen;
            if (row.nTr === null) {
                nTr = nTrIn || document.createElement('tr');
                row.nTr = nTr;
                row.anCells = cells;
                nTr._DT_RowIndex = iRow;
                _fnRowAttributes(oSettings, row);
                for (i = 0, iLen = oSettings.aoColumns.length; i < iLen; i++) {
                    oCol = oSettings.aoColumns[i];
                    nTd = nTrIn ? anTds[i] : document.createElement(oCol.sCellType);
                    nTd._DT_CellIndex = {
                        row: iRow,
                        column: i
                    };
                    cells.push(nTd);
                    if ((!nTrIn || oCol.mRender || oCol.mData !== i) && (!$.isPlainObject(oCol.mData) || oCol.mData._ !== i + '.display')) {
                        nTd.innerHTML = _fnGetCellData(oSettings, iRow, i, 'display');
                    }
                    if (oCol.sClass) {
                        nTd.className += ' ' + oCol.sClass;
                    }
                    if (oCol.bVisible && !nTrIn) {
                        nTr.appendChild(nTd);
                    } else if (!oCol.bVisible && nTrIn) {
                        nTd.parentNode.removeChild(nTd);
                    }
                    if (oCol.fnCreatedCell) {
                        oCol.fnCreatedCell.call(oSettings.oInstance, nTd, _fnGetCellData(oSettings, iRow, i), rowData, iRow, i);
                    }
                }
                _fnCallbackFire(oSettings, 'aoRowCreatedCallback', null, [nTr, rowData, iRow]);
            }
            row.nTr.setAttribute('role', 'row');
        }

        function _fnRowAttributes(settings, row) {
            var tr = row.nTr;
            var data = row._aData;
            if (tr) {
                var id = settings.rowIdFn(data);
                if (id) {
                    tr.id = id;
                }
                if (data.DT_RowClass) {
                    var a = data.DT_RowClass.split(' ');
                    row.__rowc = row.__rowc ? _unique(row.__rowc.concat(a)) : a;
                    $(tr).removeClass(row.__rowc.join(' ')).addClass(data.DT_RowClass);
                }
                if (data.DT_RowAttr) {
                    $(tr).attr(data.DT_RowAttr);
                }
                if (data.DT_RowData) {
                    $(tr).data(data.DT_RowData);
                }
            }
        }

        function _fnBuildHead(oSettings) {
            var i, ien, cell, row, column;
            var thead = oSettings.nTHead;
            var tfoot = oSettings.nTFoot;
            var createHeader = $('th, td', thead).length === 0;
            var classes = oSettings.oClasses;
            var columns = oSettings.aoColumns;
            if (createHeader) {
                row = $('<tr/>').appendTo(thead);
            }
            for (i = 0, ien = columns.length; i < ien; i++) {
                column = columns[i];
                cell = $(column.nTh).addClass(column.sClass);
                if (createHeader) {
                    cell.appendTo(row);
                }
                if (oSettings.oFeatures.bSort) {
                    cell.addClass(column.sSortingClass);
                    if (column.bSortable !== false) {
                        cell.attr('tabindex', oSettings.iTabIndex).attr('aria-controls', oSettings.sTableId);
                        _fnSortAttachListener(oSettings, column.nTh, i);
                    }
                }
                if (column.sTitle != cell[0].innerHTML) {
                    cell.html(column.sTitle);
                }
                _fnRenderer(oSettings, 'header')(oSettings, cell, column, classes);
            }
            if (createHeader) {
                _fnDetectHeader(oSettings.aoHeader, thead);
            }
            $(thead).find('>tr').attr('role', 'row');
            $(thead).find('>tr>th, >tr>td').addClass(classes.sHeaderTH);
            $(tfoot).find('>tr>th, >tr>td').addClass(classes.sFooterTH);
            if (tfoot !== null) {
                var cells = oSettings.aoFooter[0];
                for (i = 0, ien = cells.length; i < ien; i++) {
                    column = columns[i];
                    column.nTf = cells[i].cell;
                    if (column.sClass) {
                        $(column.nTf).addClass(column.sClass);
                    }
                }
            }
        }

        function _fnDrawHead(oSettings, aoSource, bIncludeHidden) {
            var i, iLen, j, jLen, k, kLen, n, nLocalTr;
            var aoLocal = [];
            var aApplied = [];
            var iColumns = oSettings.aoColumns.length;
            var iRowspan, iColspan;
            if (!aoSource) {
                return;
            }
            if (bIncludeHidden === undefined) {
                bIncludeHidden = false;
            }
            for (i = 0, iLen = aoSource.length; i < iLen; i++) {
                aoLocal[i] = aoSource[i].slice();
                aoLocal[i].nTr = aoSource[i].nTr;
                for (j = iColumns - 1; j >= 0; j--) {
                    if (!oSettings.aoColumns[j].bVisible && !bIncludeHidden) {
                        aoLocal[i].splice(j, 1);
                    }
                }
                aApplied.push([]);
            }
            for (i = 0, iLen = aoLocal.length; i < iLen; i++) {
                nLocalTr = aoLocal[i].nTr;
                if (nLocalTr) {
                    while ((n = nLocalTr.firstChild)) {
                        nLocalTr.removeChild(n);
                    }
                }
                for (j = 0, jLen = aoLocal[i].length; j < jLen; j++) {
                    iRowspan = 1;
                    iColspan = 1;
                    if (aApplied[i][j] === undefined) {
                        nLocalTr.appendChild(aoLocal[i][j].cell);
                        aApplied[i][j] = 1;
                        while (aoLocal[i + iRowspan] !== undefined && aoLocal[i][j].cell == aoLocal[i + iRowspan][j].cell) {
                            aApplied[i + iRowspan][j] = 1;
                            iRowspan++;
                        }
                        while (aoLocal[i][j + iColspan] !== undefined && aoLocal[i][j].cell == aoLocal[i][j + iColspan].cell) {
                            for (k = 0; k < iRowspan; k++) {
                                aApplied[i + k][j + iColspan] = 1;
                            }
                            iColspan++;
                        }
                        $(aoLocal[i][j].cell).attr('rowspan', iRowspan).attr('colspan', iColspan);
                    }
                }
            }
        }

        function _fnDraw(oSettings) {
            var aPreDraw = _fnCallbackFire(oSettings, 'aoPreDrawCallback', 'preDraw', [oSettings]);
            if ($.inArray(false, aPreDraw) !== -1) {
                _fnProcessingDisplay(oSettings, false);
                return;
            }
            var i, iLen, n;
            var anRows = [];
            var iRowCount = 0;
            var asStripeClasses = oSettings.asStripeClasses;
            var iStripes = asStripeClasses.length;
            var iOpenRows = oSettings.aoOpenRows.length;
            var oLang = oSettings.oLanguage;
            var iInitDisplayStart = oSettings.iInitDisplayStart;
            var bServerSide = _fnDataSource(oSettings) == 'ssp';
            var aiDisplay = oSettings.aiDisplay;
            oSettings.bDrawing = true;
            if (iInitDisplayStart !== undefined && iInitDisplayStart !== -1) {
                oSettings._iDisplayStart = bServerSide ? iInitDisplayStart : iInitDisplayStart >= oSettings.fnRecordsDisplay() ? 0 : iInitDisplayStart;
                oSettings.iInitDisplayStart = -1;
            }
            var iDisplayStart = oSettings._iDisplayStart;
            var iDisplayEnd = oSettings.fnDisplayEnd();
            if (oSettings.bDeferLoading) {
                oSettings.bDeferLoading = false;
                oSettings.iDraw++;
                _fnProcessingDisplay(oSettings, false);
            } else if (!bServerSide) {
                oSettings.iDraw++;
            } else if (!oSettings.bDestroying && !_fnAjaxUpdate(oSettings)) {
                return;
            }
            if (aiDisplay.length !== 0) {
                var iStart = bServerSide ? 0 : iDisplayStart;
                var iEnd = bServerSide ? oSettings.aoData.length : iDisplayEnd;
                for (var j = iStart; j < iEnd; j++) {
                    var iDataIndex = aiDisplay[j];
                    var aoData = oSettings.aoData[iDataIndex];
                    if (aoData.nTr === null) {
                        _fnCreateTr(oSettings, iDataIndex);
                    }
                    var nRow = aoData.nTr;
                    if (iStripes !== 0) {
                        var sStripe = asStripeClasses[iRowCount % iStripes];
                        if (aoData._sRowStripe != sStripe) {
                            $(nRow).removeClass(aoData._sRowStripe).addClass(sStripe);
                            aoData._sRowStripe = sStripe;
                        }
                    }
                    _fnCallbackFire(oSettings, 'aoRowCallback', null, [nRow, aoData._aData, iRowCount, j]);
                    anRows.push(nRow);
                    iRowCount++;
                }
            } else {
                var sZero = oLang.sZeroRecords;
                if (oSettings.iDraw == 1 && _fnDataSource(oSettings) == 'ajax') {
                    sZero = oLang.sLoadingRecords;
                } else if (oLang.sEmptyTable && oSettings.fnRecordsTotal() === 0) {
                    sZero = oLang.sEmptyTable;
                }
                anRows[0] = $('<tr/>', {
                    'class': iStripes ? asStripeClasses[0] : ''
                }).append($('<td />', {
                    'valign': 'top',
                    'colSpan': _fnVisbleColumns(oSettings),
                    'class': oSettings.oClasses.sRowEmpty
                }).html(sZero))[0];
            }
            _fnCallbackFire(oSettings, 'aoHeaderCallback', 'header', [$(oSettings.nTHead).children('tr')[0], _fnGetDataMaster(oSettings), iDisplayStart, iDisplayEnd, aiDisplay]);
            _fnCallbackFire(oSettings, 'aoFooterCallback', 'footer', [$(oSettings.nTFoot).children('tr')[0], _fnGetDataMaster(oSettings), iDisplayStart, iDisplayEnd, aiDisplay]);
            var body = $(oSettings.nTBody);
            body.children().detach();
            body.append($(anRows));
            _fnCallbackFire(oSettings, 'aoDrawCallback', 'draw', [oSettings]);
            oSettings.bSorted = false;
            oSettings.bFiltered = false;
            oSettings.bDrawing = false;
        }

        function _fnReDraw(settings, holdPosition) {
            var
                features = settings.oFeatures,
                sort = features.bSort,
                filter = features.bFilter;
            if (sort) {
                _fnSort(settings);
            }
            if (filter) {
                _fnFilterComplete(settings, settings.oPreviousSearch);
            } else {
                settings.aiDisplay = settings.aiDisplayMaster.slice();
            }
            if (holdPosition !== true) {
                settings._iDisplayStart = 0;
            }
            settings._drawHold = holdPosition;
            _fnDraw(settings);
            settings._drawHold = false;
        }

        function _fnAddOptionsHtml(oSettings) {
            var classes = oSettings.oClasses;
            var table = $(oSettings.nTable);
            var holding = $('<div/>').insertBefore(table);
            var features = oSettings.oFeatures;
            var insert = $('<div/>', {
                id: oSettings.sTableId + '_wrapper',
                'class': classes.sWrapper + (oSettings.nTFoot ? '' : ' ' + classes.sNoFooter)
            });
            oSettings.nHolding = holding[0];
            oSettings.nTableWrapper = insert[0];
            oSettings.nTableReinsertBefore = oSettings.nTable.nextSibling;
            var aDom = oSettings.sDom.split('');
            var featureNode, cOption, nNewNode, cNext, sAttr, j;
            for (var i = 0; i < aDom.length; i++) {
                featureNode = null;
                cOption = aDom[i];
                if (cOption == '<') {
                    nNewNode = $('<div/>')[0];
                    cNext = aDom[i + 1];
                    if (cNext == "'" || cNext == '"') {
                        sAttr = "";
                        j = 2;
                        while (aDom[i + j] != cNext) {
                            sAttr += aDom[i + j];
                            j++;
                        }
                        if (sAttr == "H") {
                            sAttr = classes.sJUIHeader;
                        } else if (sAttr == "F") {
                            sAttr = classes.sJUIFooter;
                        }
                        if (sAttr.indexOf('.') != -1) {
                            var aSplit = sAttr.split('.');
                            nNewNode.id = aSplit[0].substr(1, aSplit[0].length - 1);
                            nNewNode.className = aSplit[1];
                        } else if (sAttr.charAt(0) == "#") {
                            nNewNode.id = sAttr.substr(1, sAttr.length - 1);
                        } else {
                            nNewNode.className = sAttr;
                        }
                        i += j;
                    }
                    insert.append(nNewNode);
                    insert = $(nNewNode);
                } else if (cOption == '>') {
                    insert = insert.parent();
                } else if (cOption == 'l' && features.bPaginate && features.bLengthChange) {
                    featureNode = _fnFeatureHtmlLength(oSettings);
                } else if (cOption == 'f' && features.bFilter) {
                    featureNode = _fnFeatureHtmlFilter(oSettings);
                } else if (cOption == 'r' && features.bProcessing) {
                    featureNode = _fnFeatureHtmlProcessing(oSettings);
                } else if (cOption == 't') {
                    featureNode = _fnFeatureHtmlTable(oSettings);
                } else if (cOption == 'i' && features.bInfo) {
                    featureNode = _fnFeatureHtmlInfo(oSettings);
                } else if (cOption == 'p' && features.bPaginate) {
                    featureNode = _fnFeatureHtmlPaginate(oSettings);
                } else if (DataTable.ext.feature.length !== 0) {
                    var aoFeatures = DataTable.ext.feature;
                    for (var k = 0, kLen = aoFeatures.length; k < kLen; k++) {
                        if (cOption == aoFeatures[k].cFeature) {
                            featureNode = aoFeatures[k].fnInit(oSettings);
                            break;
                        }
                    }
                }
                if (featureNode) {
                    var aanFeatures = oSettings.aanFeatures;
                    if (!aanFeatures[cOption]) {
                        aanFeatures[cOption] = [];
                    }
                    aanFeatures[cOption].push(featureNode);
                    insert.append(featureNode);
                }
            }
            holding.replaceWith(insert);
            oSettings.nHolding = null;
        }

        function _fnDetectHeader(aLayout, nThead) {
            var nTrs = $(nThead).children('tr');
            var nTr, nCell;
            var i, k, l, iLen, jLen, iColShifted, iColumn, iColspan, iRowspan;
            var bUnique;
            var fnShiftCol = function(a, i, j) {
                var k = a[i];
                while (k[j]) {
                    j++;
                }
                return j;
            };
            aLayout.splice(0, aLayout.length);
            for (i = 0, iLen = nTrs.length; i < iLen; i++) {
                aLayout.push([]);
            }
            for (i = 0, iLen = nTrs.length; i < iLen; i++) {
                nTr = nTrs[i];
                iColumn = 0;
                nCell = nTr.firstChild;
                while (nCell) {
                    if (nCell.nodeName.toUpperCase() == "TD" || nCell.nodeName.toUpperCase() == "TH") {
                        iColspan = nCell.getAttribute('colspan') * 1;
                        iRowspan = nCell.getAttribute('rowspan') * 1;
                        iColspan = (!iColspan || iColspan === 0 || iColspan === 1) ? 1 : iColspan;
                        iRowspan = (!iRowspan || iRowspan === 0 || iRowspan === 1) ? 1 : iRowspan;
                        iColShifted = fnShiftCol(aLayout, i, iColumn);
                        bUnique = iColspan === 1 ? true : false;
                        for (l = 0; l < iColspan; l++) {
                            for (k = 0; k < iRowspan; k++) {
                                aLayout[i + k][iColShifted + l] = {
                                    "cell": nCell,
                                    "unique": bUnique
                                };
                                aLayout[i + k].nTr = nTr;
                            }
                        }
                    }
                    nCell = nCell.nextSibling;
                }
            }
        }

        function _fnGetUniqueThs(oSettings, nHeader, aLayout) {
            var aReturn = [];
            if (!aLayout) {
                aLayout = oSettings.aoHeader;
                if (nHeader) {
                    aLayout = [];
                    _fnDetectHeader(aLayout, nHeader);
                }
            }
            for (var i = 0, iLen = aLayout.length; i < iLen; i++) {
                for (var j = 0, jLen = aLayout[i].length; j < jLen; j++) {
                    if (aLayout[i][j].unique && (!aReturn[j] || !oSettings.bSortCellsTop)) {
                        aReturn[j] = aLayout[i][j].cell;
                    }
                }
            }
            return aReturn;
        }

        function _fnBuildAjax(oSettings, data, fn) {
            _fnCallbackFire(oSettings, 'aoServerParams', 'serverParams', [data]);
            if (data && $.isArray(data)) {
                var tmp = {};
                var rbracket = /(.*?)\[\]$/;
                $.each(data, function(key, val) {
                    var match = val.name.match(rbracket);
                    if (match) {
                        var name = match[0];
                        if (!tmp[name]) {
                            tmp[name] = [];
                        }
                        tmp[name].push(val.value);
                    } else {
                        tmp[val.name] = val.value;
                    }
                });
                data = tmp;
            }
            var ajaxData;
            var ajax = oSettings.ajax;
            var instance = oSettings.oInstance;
            var callback = function(json) {
                _fnCallbackFire(oSettings, null, 'xhr', [oSettings, json, oSettings.jqXHR]);
                fn(json);
            };
            if ($.isPlainObject(ajax) && ajax.data) {
                ajaxData = ajax.data;
                var newData = $.isFunction(ajaxData) ? ajaxData(data, oSettings) : ajaxData;
                data = $.isFunction(ajaxData) && newData ? newData : $.extend(true, data, newData);
                delete ajax.data;
            }
            var baseAjax = {
                "data": data,
                "success": function(json) {
                    var error = json.error || json.sError;
                    if (error) {
                        _fnLog(oSettings, 0, error);
                    }
                    oSettings.json = json;
                    callback(json);
                },
                "dataType": "json",
                "cache": false,
                "type": oSettings.sServerMethod,
                "error": function(xhr, error, thrown) {
                    var ret = _fnCallbackFire(oSettings, null, 'xhr', [oSettings, null, oSettings.jqXHR]);
                    if ($.inArray(true, ret) === -1) {
                        if (error == "parsererror") {
                            _fnLog(oSettings, 0, 'Invalid JSON response', 1);
                        } else if (xhr.readyState === 4) {
                            _fnLog(oSettings, 0, 'Ajax error', 7);
                        }
                    }
                    _fnProcessingDisplay(oSettings, false);
                }
            };
            oSettings.oAjaxData = data;
            _fnCallbackFire(oSettings, null, 'preXhr', [oSettings, data]);
            if (oSettings.fnServerData) {
                oSettings.fnServerData.call(instance, oSettings.sAjaxSource, $.map(data, function(val, key) {
                    return {
                        name: key,
                        value: val
                    };
                }), callback, oSettings);
            } else if (oSettings.sAjaxSource || typeof ajax === 'string') {
                oSettings.jqXHR = $.ajax($.extend(baseAjax, {
                    url: ajax || oSettings.sAjaxSource
                }));
            } else if ($.isFunction(ajax)) {
                oSettings.jqXHR = ajax.call(instance, data, callback, oSettings);
            } else {
                oSettings.jqXHR = $.ajax($.extend(baseAjax, ajax));
                ajax.data = ajaxData;
            }
        }

        function _fnAjaxUpdate(settings) {
            if (settings.bAjaxDataGet) {
                settings.iDraw++;
                _fnProcessingDisplay(settings, true);
                _fnBuildAjax(settings, _fnAjaxParameters(settings), function(json) {
                    _fnAjaxUpdateDraw(settings, json);
                });
                return false;
            }
            return true;
        }

        function _fnAjaxParameters(settings) {
            var
                columns = settings.aoColumns,
                columnCount = columns.length,
                features = settings.oFeatures,
                preSearch = settings.oPreviousSearch,
                preColSearch = settings.aoPreSearchCols,
                i, data = [],
                dataProp, column, columnSearch, sort = _fnSortFlatten(settings),
                displayStart = settings._iDisplayStart,
                displayLength = features.bPaginate !== false ? settings._iDisplayLength : -1;
            var param = function(name, value) {
                data.push({
                    'name': name,
                    'value': value
                });
            };
            param('sEcho', settings.iDraw);
            param('iColumns', columnCount);
            param('sColumns', _pluck(columns, 'sName').join(','));
            param('iDisplayStart', displayStart);
            param('iDisplayLength', displayLength);
            var d = {
                draw: settings.iDraw,
                columns: [],
                order: [],
                start: displayStart,
                length: displayLength,
                search: {
                    value: preSearch.sSearch,
                    regex: preSearch.bRegex
                }
            };
            for (i = 0; i < columnCount; i++) {
                column = columns[i];
                columnSearch = preColSearch[i];
                dataProp = typeof column.mData == "function" ? 'function' : column.mData;
                d.columns.push({
                    data: dataProp,
                    name: column.sName,
                    searchable: column.bSearchable,
                    orderable: column.bSortable,
                    search: {
                        value: columnSearch.sSearch,
                        regex: columnSearch.bRegex
                    }
                });
                param("mDataProp_" + i, dataProp);
                if (features.bFilter) {
                    param('sSearch_' + i, columnSearch.sSearch);
                    param('bRegex_' + i, columnSearch.bRegex);
                    param('bSearchable_' + i, column.bSearchable);
                }
                if (features.bSort) {
                    param('bSortable_' + i, column.bSortable);
                }
            }
            if (features.bFilter) {
                param('sSearch', preSearch.sSearch);
                param('bRegex', preSearch.bRegex);
            }
            if (features.bSort) {
                $.each(sort, function(i, val) {
                    d.order.push({
                        column: val.col,
                        dir: val.dir
                    });
                    param('iSortCol_' + i, val.col);
                    param('sSortDir_' + i, val.dir);
                });
                param('iSortingCols', sort.length);
            }
            var legacy = DataTable.ext.legacy.ajax;
            if (legacy === null) {
                return settings.sAjaxSource ? data : d;
            }
            return legacy ? data : d;
        }

        function _fnAjaxUpdateDraw(settings, json) {
            var compat = function(old, modern) {
                return json[old] !== undefined ? json[old] : json[modern];
            };
            var data = _fnAjaxDataSrc(settings, json);
            var draw = compat('sEcho', 'draw');
            var recordsTotal = compat('iTotalRecords', 'recordsTotal');
            var recordsFiltered = compat('iTotalDisplayRecords', 'recordsFiltered');
            if (draw) {
                if (draw * 1 < settings.iDraw) {
                    return;
                }
                settings.iDraw = draw * 1;
            }
            _fnClearTable(settings);
            settings._iRecordsTotal = parseInt(recordsTotal, 10);
            settings._iRecordsDisplay = parseInt(recordsFiltered, 10);
            for (var i = 0, ien = data.length; i < ien; i++) {
                _fnAddData(settings, data[i]);
            }
            settings.aiDisplay = settings.aiDisplayMaster.slice();
            settings.bAjaxDataGet = false;
            _fnDraw(settings);
            if (!settings._bInitComplete) {
                _fnInitComplete(settings, json);
            }
            settings.bAjaxDataGet = true;
            _fnProcessingDisplay(settings, false);
        }

        function _fnAjaxDataSrc(oSettings, json) {
            var dataSrc = $.isPlainObject(oSettings.ajax) && oSettings.ajax.dataSrc !== undefined ? oSettings.ajax.dataSrc : oSettings.sAjaxDataProp;
            if (dataSrc === 'data') {
                return json.aaData || json[dataSrc];
            }
            return dataSrc !== "" ? _fnGetObjectDataFn(dataSrc)(json) : json;
        }

        function _fnFeatureHtmlFilter(settings) {
            var classes = settings.oClasses;
            var tableId = settings.sTableId;
            var language = settings.oLanguage;
            var previousSearch = settings.oPreviousSearch;
            var features = settings.aanFeatures;
            var input = '<input type="search" class="' + classes.sFilterInput + '"/>';
            var str = language.sSearch;
            str = str.match(/_INPUT_/) ? str.replace('_INPUT_', input) : str + input;
            var filter = $('<div/>', {
                'id': !features.f ? tableId + '_filter' : null,
                'class': classes.sFilter
            }).append($('<label/>').append(str));
            var searchFn = function() {
                var n = features.f;
                var val = !this.value ? "" : this.value;
                if (val != previousSearch.sSearch) {
                    _fnFilterComplete(settings, {
                        "sSearch": val,
                        "bRegex": previousSearch.bRegex,
                        "bSmart": previousSearch.bSmart,
                        "bCaseInsensitive": previousSearch.bCaseInsensitive
                    });
                    settings._iDisplayStart = 0;
                    _fnDraw(settings);
                }
            };
            var searchDelay = settings.searchDelay !== null ? settings.searchDelay : _fnDataSource(settings) === 'ssp' ? 400 : 0;
            var jqFilter = $('input', filter).val(previousSearch.sSearch).attr('placeholder', language.sSearchPlaceholder).on('keyup.DT search.DT input.DT paste.DT cut.DT', searchDelay ? _fnThrottle(searchFn, searchDelay) : searchFn).on('keypress.DT', function(e) {
                if (e.keyCode == 13) {
                    return false;
                }
            }).attr('aria-controls', tableId);
            $(settings.nTable).on('search.dt.DT', function(ev, s) {
                if (settings === s) {
                    try {
                        if (jqFilter[0] !== document.activeElement) {
                            jqFilter.val(previousSearch.sSearch);
                        }
                    } catch (e) {}
                }
            });
            return filter[0];
        }

        function _fnFilterComplete(oSettings, oInput, iForce) {
            var oPrevSearch = oSettings.oPreviousSearch;
            var aoPrevSearch = oSettings.aoPreSearchCols;
            var fnSaveFilter = function(oFilter) {
                oPrevSearch.sSearch = oFilter.sSearch;
                oPrevSearch.bRegex = oFilter.bRegex;
                oPrevSearch.bSmart = oFilter.bSmart;
                oPrevSearch.bCaseInsensitive = oFilter.bCaseInsensitive;
            };
            var fnRegex = function(o) {
                return o.bEscapeRegex !== undefined ? !o.bEscapeRegex : o.bRegex;
            };
            _fnColumnTypes(oSettings);
            if (_fnDataSource(oSettings) != 'ssp') {
                _fnFilter(oSettings, oInput.sSearch, iForce, fnRegex(oInput), oInput.bSmart, oInput.bCaseInsensitive);
                fnSaveFilter(oInput);
                for (var i = 0; i < aoPrevSearch.length; i++) {
                    _fnFilterColumn(oSettings, aoPrevSearch[i].sSearch, i, fnRegex(aoPrevSearch[i]), aoPrevSearch[i].bSmart, aoPrevSearch[i].bCaseInsensitive);
                }
                _fnFilterCustom(oSettings);
            } else {
                fnSaveFilter(oInput);
            }
            oSettings.bFiltered = true;
            _fnCallbackFire(oSettings, null, 'search', [oSettings]);
        }

        function _fnFilterCustom(settings) {
            var filters = DataTable.ext.search;
            var displayRows = settings.aiDisplay;
            var row, rowIdx;
            for (var i = 0, ien = filters.length; i < ien; i++) {
                var rows = [];
                for (var j = 0, jen = displayRows.length; j < jen; j++) {
                    rowIdx = displayRows[j];
                    row = settings.aoData[rowIdx];
                    if (filters[i](settings, row._aFilterData, rowIdx, row._aData, j)) {
                        rows.push(rowIdx);
                    }
                }
                displayRows.length = 0;
                $.merge(displayRows, rows);
            }
        }

        function _fnFilterColumn(settings, searchStr, colIdx, regex, smart, caseInsensitive) {
            if (searchStr === '') {
                return;
            }
            var data;
            var out = [];
            var display = settings.aiDisplay;
            var rpSearch = _fnFilterCreateSearch(searchStr, regex, smart, caseInsensitive);
            for (var i = 0; i < display.length; i++) {
                data = settings.aoData[display[i]]._aFilterData[colIdx];
                if (rpSearch.test(data)) {
                    out.push(display[i]);
                }
            }
            settings.aiDisplay = out;
        }

        function _fnFilter(settings, input, force, regex, smart, caseInsensitive) {
            var rpSearch = _fnFilterCreateSearch(input, regex, smart, caseInsensitive);
            var prevSearch = settings.oPreviousSearch.sSearch;
            var displayMaster = settings.aiDisplayMaster;
            var display, invalidated, i;
            var filtered = [];
            if (DataTable.ext.search.length !== 0) {
                force = true;
            }
            invalidated = _fnFilterData(settings);
            if (input.length <= 0) {
                settings.aiDisplay = displayMaster.slice();
            } else {
                if (invalidated || force || prevSearch.length > input.length || input.indexOf(prevSearch) !== 0 || settings.bSorted) {
                    settings.aiDisplay = displayMaster.slice();
                }
                display = settings.aiDisplay;
                for (i = 0; i < display.length; i++) {
                    if (rpSearch.test(settings.aoData[display[i]]._sFilterRow)) {
                        filtered.push(display[i]);
                    }
                }
                settings.aiDisplay = filtered;
            }
        }

        function _fnFilterCreateSearch(search, regex, smart, caseInsensitive) {
            search = regex ? search : _fnEscapeRegex(search);
            if (smart) {
                var a = $.map(search.match(/"[^"]+"|[^ ]+/g) || [''], function(word) {
                    if (word.charAt(0) === '"') {
                        var m = word.match(/^"(.*)"$/);
                        word = m ? m[1] : word;
                    }
                    return word.replace('"', '');
                });
                search = '^(?=.*?' + a.join(')(?=.*?') + ').*$';
            }
            return new RegExp(search, caseInsensitive ? 'i' : '');
        }
        var _fnEscapeRegex = DataTable.util.escapeRegex;
        var __filter_div = $('<div>')[0];
        var __filter_div_textContent = __filter_div.textContent !== undefined;

        function _fnFilterData(settings) {
            var columns = settings.aoColumns;
            var column;
            var i, j, ien, jen, filterData, cellData, row;
            var fomatters = DataTable.ext.type.search;
            var wasInvalidated = false;
            for (i = 0, ien = settings.aoData.length; i < ien; i++) {
                row = settings.aoData[i];
                if (!row._aFilterData) {
                    filterData = [];
                    for (j = 0, jen = columns.length; j < jen; j++) {
                        column = columns[j];
                        if (column.bSearchable) {
                            cellData = _fnGetCellData(settings, i, j, 'filter');
                            if (fomatters[column.sType]) {
                                cellData = fomatters[column.sType](cellData);
                            }
                            if (cellData === null) {
                                cellData = '';
                            }
                            if (typeof cellData !== 'string' && cellData.toString) {
                                cellData = cellData.toString();
                            }
                        } else {
                            cellData = '';
                        }
                        if (cellData.indexOf && cellData.indexOf('&') !== -1) {
                            __filter_div.innerHTML = cellData;
                            cellData = __filter_div_textContent ? __filter_div.textContent : __filter_div.innerText;
                        }
                        if (cellData.replace) {
                            cellData = cellData.replace(/[\r\n]/g, '');
                        }
                        filterData.push(cellData);
                    }
                    row._aFilterData = filterData;
                    row._sFilterRow = filterData.join('  ');
                    wasInvalidated = true;
                }
            }
            return wasInvalidated;
        }

        function _fnSearchToCamel(obj) {
            return {
                search: obj.sSearch,
                smart: obj.bSmart,
                regex: obj.bRegex,
                caseInsensitive: obj.bCaseInsensitive
            };
        }

        function _fnSearchToHung(obj) {
            return {
                sSearch: obj.search,
                bSmart: obj.smart,
                bRegex: obj.regex,
                bCaseInsensitive: obj.caseInsensitive
            };
        }

        function _fnFeatureHtmlInfo(settings) {
            var
                tid = settings.sTableId,
                nodes = settings.aanFeatures.i,
                n = $('<div/>', {
                    'class': settings.oClasses.sInfo,
                    'id': !nodes ? tid + '_info' : null
                });
            if (!nodes) {
                settings.aoDrawCallback.push({
                    "fn": _fnUpdateInfo,
                    "sName": "information"
                });
                n.attr('role', 'status').attr('aria-live', 'polite');
                $(settings.nTable).attr('aria-describedby', tid + '_info');
            }
            return n[0];
        }

        function _fnUpdateInfo(settings) {
            var nodes = settings.aanFeatures.i;
            if (nodes.length === 0) {
                return;
            }
            var
                lang = settings.oLanguage,
                start = settings._iDisplayStart + 1,
                end = settings.fnDisplayEnd(),
                max = settings.fnRecordsTotal(),
                total = settings.fnRecordsDisplay(),
                out = total ? lang.sInfo : lang.sInfoEmpty;
            if (total !== max) {
                out += ' ' + lang.sInfoFiltered;
            }
            out += lang.sInfoPostFix;
            out = _fnInfoMacros(settings, out);
            var callback = lang.fnInfoCallback;
            if (callback !== null) {
                out = callback.call(settings.oInstance, settings, start, end, max, total, out);
            }
            $(nodes).html(out);
        }

        function _fnInfoMacros(settings, str) {
            var
                formatter = settings.fnFormatNumber,
                start = settings._iDisplayStart + 1,
                len = settings._iDisplayLength,
                vis = settings.fnRecordsDisplay(),
                all = len === -1;
            return str.replace(/_START_/g, formatter.call(settings, start)).replace(/_END_/g, formatter.call(settings, settings.fnDisplayEnd())).replace(/_MAX_/g, formatter.call(settings, settings.fnRecordsTotal())).replace(/_TOTAL_/g, formatter.call(settings, vis)).replace(/_PAGE_/g, formatter.call(settings, all ? 1 : Math.ceil(start / len))).replace(/_PAGES_/g, formatter.call(settings, all ? 1 : Math.ceil(vis / len)));
        }

        function _fnInitialise(settings) {
            var i, iLen, iAjaxStart = settings.iInitDisplayStart;
            var columns = settings.aoColumns,
                column;
            var features = settings.oFeatures;
            var deferLoading = settings.bDeferLoading;
            if (!settings.bInitialised) {
                setTimeout(function() {
                    _fnInitialise(settings);
                }, 200);
                return;
            }
            _fnAddOptionsHtml(settings);
            _fnBuildHead(settings);
            _fnDrawHead(settings, settings.aoHeader);
            _fnDrawHead(settings, settings.aoFooter);
            _fnProcessingDisplay(settings, true);
            if (features.bAutoWidth) {
                _fnCalculateColumnWidths(settings);
            }
            for (i = 0, iLen = columns.length; i < iLen; i++) {
                column = columns[i];
                if (column.sWidth) {
                    column.nTh.style.width = _fnStringToCss(column.sWidth);
                }
            }
            _fnCallbackFire(settings, null, 'preInit', [settings]);
            _fnReDraw(settings);
            var dataSrc = _fnDataSource(settings);
            if (dataSrc != 'ssp' || deferLoading) {
                if (dataSrc == 'ajax') {
                    _fnBuildAjax(settings, [], function(json) {
                        var aData = _fnAjaxDataSrc(settings, json);
                        for (i = 0; i < aData.length; i++) {
                            _fnAddData(settings, aData[i]);
                        }
                        settings.iInitDisplayStart = iAjaxStart;
                        _fnReDraw(settings);
                        _fnProcessingDisplay(settings, false);
                        _fnInitComplete(settings, json);
                    }, settings);
                } else {
                    _fnProcessingDisplay(settings, false);
                    _fnInitComplete(settings);
                }
            }
        }

        function _fnInitComplete(settings, json) {
            settings._bInitComplete = true;
            if (json || settings.oInit.aaData) {
                _fnAdjustColumnSizing(settings);
            }
            _fnCallbackFire(settings, null, 'plugin-init', [settings, json]);
            _fnCallbackFire(settings, 'aoInitComplete', 'init', [settings, json]);
        }

        function _fnLengthChange(settings, val) {
            var len = parseInt(val, 10);
            settings._iDisplayLength = len;
            _fnLengthOverflow(settings);
            _fnCallbackFire(settings, null, 'length', [settings, len]);
        }

        function _fnFeatureHtmlLength(settings) {
            var
                classes = settings.oClasses,
                tableId = settings.sTableId,
                menu = settings.aLengthMenu,
                d2 = $.isArray(menu[0]),
                lengths = d2 ? menu[0] : menu,
                language = d2 ? menu[1] : menu;
            var select = $('<select/>', {
                'name': tableId + '_length',
                'aria-controls': tableId,
                'class': classes.sLengthSelect
            });
            for (var i = 0, ien = lengths.length; i < ien; i++) {
                select[0][i] = new Option(language[i], lengths[i]);
            }
            var div = $('<div><label/></div>').addClass(classes.sLength);
            if (!settings.aanFeatures.l) {
                div[0].id = tableId + '_length';
            }
            div.children().append(settings.oLanguage.sLengthMenu.replace('_MENU_', select[0].outerHTML));
            $('select', div).val(settings._iDisplayLength).on('change.DT', function(e) {
                _fnLengthChange(settings, $(this).val());
                _fnDraw(settings);
            });
            $(settings.nTable).on('length.dt.DT', function(e, s, len) {
                if (settings === s) {
                    $('select', div).val(len);
                }
            });
            return div[0];
        }

        function _fnFeatureHtmlPaginate(settings) {
            var
                type = settings.sPaginationType,
                plugin = DataTable.ext.pager[type],
                modern = typeof plugin === 'function',
                redraw = function(settings) {
                    _fnDraw(settings);
                },
                node = $('<div/>').addClass(settings.oClasses.sPaging + type)[0],
                features = settings.aanFeatures;
            if (!modern) {
                plugin.fnInit(settings, node, redraw);
            }
            if (!features.p) {
                node.id = settings.sTableId + '_paginate';
                settings.aoDrawCallback.push({
                    "fn": function(settings) {
                        if (modern) {
                            var
                                start = settings._iDisplayStart,
                                len = settings._iDisplayLength,
                                visRecords = settings.fnRecordsDisplay(),
                                all = len === -1,
                                page = all ? 0 : Math.ceil(start / len),
                                pages = all ? 1 : Math.ceil(visRecords / len),
                                buttons = plugin(page, pages),
                                i, ien;
                            for (i = 0, ien = features.p.length; i < ien; i++) {
                                _fnRenderer(settings, 'pageButton')(settings, features.p[i], i, buttons, page, pages);
                            }
                        } else {
                            plugin.fnUpdate(settings, redraw);
                        }
                    },
                    "sName": "pagination"
                });
            }
            return node;
        }

        function _fnPageChange(settings, action, redraw) {
            var
                start = settings._iDisplayStart,
                len = settings._iDisplayLength,
                records = settings.fnRecordsDisplay();
            if (records === 0 || len === -1) {
                start = 0;
            } else if (typeof action === "number") {
                start = action * len;
                if (start > records) {
                    start = 0;
                }
            } else if (action == "first") {
                start = 0;
            } else if (action == "previous") {
                start = len >= 0 ? start - len : 0;
                if (start < 0) {
                    start = 0;
                }
            } else if (action == "next") {
                if (start + len < records) {
                    start += len;
                }
            } else if (action == "last") {
                start = Math.floor((records - 1) / len) * len;
            } else {
                _fnLog(settings, 0, "Unknown paging action: " + action, 5);
            }
            var changed = settings._iDisplayStart !== start;
            settings._iDisplayStart = start;
            if (changed) {
                _fnCallbackFire(settings, null, 'page', [settings]);
                if (redraw) {
                    _fnDraw(settings);
                }
            }
            return changed;
        }

        function _fnFeatureHtmlProcessing(settings) {
            return $('<div/>', {
                'id': !settings.aanFeatures.r ? settings.sTableId + '_processing' : null,
                'class': settings.oClasses.sProcessing
            }).html(settings.oLanguage.sProcessing).insertBefore(settings.nTable)[0];
        }

        function _fnProcessingDisplay(settings, show) {
            if (settings.oFeatures.bProcessing) {
                $(settings.aanFeatures.r).css('display', show ? 'block' : 'none');
            }
            _fnCallbackFire(settings, null, 'processing', [settings, show]);
        }

        function _fnFeatureHtmlTable(settings) {
            var table = $(settings.nTable);
            table.attr('role', 'grid');
            var scroll = settings.oScroll;
            if (scroll.sX === '' && scroll.sY === '') {
                return settings.nTable;
            }
            var scrollX = scroll.sX;
            var scrollY = scroll.sY;
            var classes = settings.oClasses;
            var caption = table.children('caption');
            var captionSide = caption.length ? caption[0]._captionSide : null;
            var headerClone = $(table[0].cloneNode(false));
            var footerClone = $(table[0].cloneNode(false));
            var footer = table.children('tfoot');
            var _div = '<div/>';
            var size = function(s) {
                return !s ? null : _fnStringToCss(s);
            };
            if (!footer.length) {
                footer = null;
            }
            var scroller = $(_div, {
                'class': classes.sScrollWrapper
            }).append($(_div, {
                'class': classes.sScrollHead
            }).css({
                overflow: 'hidden',
                position: 'relative',
                border: 0,
                width: scrollX ? size(scrollX) : '100%'
            }).append($(_div, {
                'class': classes.sScrollHeadInner
            }).css({
                'box-sizing': 'content-box',
                width: scroll.sXInner || '100%'
            }).append(headerClone.removeAttr('id').css('margin-left', 0).append(captionSide === 'top' ? caption : null).append(table.children('thead'))))).append($(_div, {
                'class': classes.sScrollBody
            }).css({
                position: 'relative',
                overflow: 'auto',
                width: size(scrollX)
            }).append(table));
            if (footer) {
                scroller.append($(_div, {
                    'class': classes.sScrollFoot
                }).css({
                    overflow: 'hidden',
                    border: 0,
                    width: scrollX ? size(scrollX) : '100%'
                }).append($(_div, {
                    'class': classes.sScrollFootInner
                }).append(footerClone.removeAttr('id').css('margin-left', 0).append(captionSide === 'bottom' ? caption : null).append(table.children('tfoot')))));
            }
            var children = scroller.children();
            var scrollHead = children[0];
            var scrollBody = children[1];
            var scrollFoot = footer ? children[2] : null;
            if (scrollX) {
                $(scrollBody).on('scroll.DT', function(e) {
                    var scrollLeft = this.scrollLeft;
                    scrollHead.scrollLeft = scrollLeft;
                    if (footer) {
                        scrollFoot.scrollLeft = scrollLeft;
                    }
                });
            }
            $(scrollBody).css(scrollY && scroll.bCollapse ? 'max-height' : 'height', scrollY);
            settings.nScrollHead = scrollHead;
            settings.nScrollBody = scrollBody;
            settings.nScrollFoot = scrollFoot;
            settings.aoDrawCallback.push({
                "fn": _fnScrollDraw,
                "sName": "scrolling"
            });
            return scroller[0];
        }

        function _fnScrollDraw(settings) {
            var
                scroll = settings.oScroll,
                scrollX = scroll.sX,
                scrollXInner = scroll.sXInner,
                scrollY = scroll.sY,
                barWidth = scroll.iBarWidth,
                divHeader = $(settings.nScrollHead),
                divHeaderStyle = divHeader[0].style,
                divHeaderInner = divHeader.children('div'),
                divHeaderInnerStyle = divHeaderInner[0].style,
                divHeaderTable = divHeaderInner.children('table'),
                divBodyEl = settings.nScrollBody,
                divBody = $(divBodyEl),
                divBodyStyle = divBodyEl.style,
                divFooter = $(settings.nScrollFoot),
                divFooterInner = divFooter.children('div'),
                divFooterTable = divFooterInner.children('table'),
                header = $(settings.nTHead),
                table = $(settings.nTable),
                tableEl = table[0],
                tableStyle = tableEl.style,
                footer = settings.nTFoot ? $(settings.nTFoot) : null,
                browser = settings.oBrowser,
                ie67 = browser.bScrollOversize,
                dtHeaderCells = _pluck(settings.aoColumns, 'nTh'),
                headerTrgEls, footerTrgEls, headerSrcEls, footerSrcEls, headerCopy, footerCopy, headerWidths = [],
                footerWidths = [],
                headerContent = [],
                footerContent = [],
                idx, correction, sanityWidth, zeroOut = function(nSizer) {
                    var style = nSizer.style;
                    style.paddingTop = "0";
                    style.paddingBottom = "0";
                    style.borderTopWidth = "0";
                    style.borderBottomWidth = "0";
                    style.height = 0;
                };
            var scrollBarVis = divBodyEl.scrollHeight > divBodyEl.clientHeight;
            if (settings.scrollBarVis !== scrollBarVis && settings.scrollBarVis !== undefined) {
                settings.scrollBarVis = scrollBarVis;
                _fnAdjustColumnSizing(settings);
                return;
            } else {
                settings.scrollBarVis = scrollBarVis;
            }
            table.children('thead, tfoot').remove();
            if (footer) {
                footerCopy = footer.clone().prependTo(table);
                footerTrgEls = footer.find('tr');
                footerSrcEls = footerCopy.find('tr');
            }
            headerCopy = header.clone().prependTo(table);
            headerTrgEls = header.find('tr');
            headerSrcEls = headerCopy.find('tr');
            headerCopy.find('th, td').removeAttr('tabindex');
            if (!scrollX) {
                divBodyStyle.width = '100%';
                divHeader[0].style.width = '100%';
            }
            $.each(_fnGetUniqueThs(settings, headerCopy), function(i, el) {
                idx = _fnVisibleToColumnIndex(settings, i);
                el.style.width = settings.aoColumns[idx].sWidth;
            });
            if (footer) {
                _fnApplyToChildren(function(n) {
                    n.style.width = "";
                }, footerSrcEls);
            }
            sanityWidth = table.outerWidth();
            if (scrollX === "") {
                tableStyle.width = "100%";
                if (ie67 && (table.find('tbody').height() > divBodyEl.offsetHeight || divBody.css('overflow-y') == "scroll")) {
                    tableStyle.width = _fnStringToCss(table.outerWidth() - barWidth);
                }
                sanityWidth = table.outerWidth();
            } else if (scrollXInner !== "") {
                tableStyle.width = _fnStringToCss(scrollXInner);
                sanityWidth = table.outerWidth();
            }
            _fnApplyToChildren(zeroOut, headerSrcEls);
            _fnApplyToChildren(function(nSizer) {
                headerContent.push(nSizer.innerHTML);
                headerWidths.push(_fnStringToCss($(nSizer).css('width')));
            }, headerSrcEls);
            _fnApplyToChildren(function(nToSize, i) {
                if ($.inArray(nToSize, dtHeaderCells) !== -1) {
                    nToSize.style.width = headerWidths[i];
                }
            }, headerTrgEls);
            $(headerSrcEls).height(0);
            if (footer) {
                _fnApplyToChildren(zeroOut, footerSrcEls);
                _fnApplyToChildren(function(nSizer) {
                    footerContent.push(nSizer.innerHTML);
                    footerWidths.push(_fnStringToCss($(nSizer).css('width')));
                }, footerSrcEls);
                _fnApplyToChildren(function(nToSize, i) {
                    nToSize.style.width = footerWidths[i];
                }, footerTrgEls);
                $(footerSrcEls).height(0);
            }
            _fnApplyToChildren(function(nSizer, i) {
                nSizer.innerHTML = '<div class="dataTables_sizing" style="height:0;overflow:hidden;">' + headerContent[i] + '</div>';
                nSizer.style.width = headerWidths[i];
            }, headerSrcEls);
            if (footer) {
                _fnApplyToChildren(function(nSizer, i) {
                    nSizer.innerHTML = '<div class="dataTables_sizing" style="height:0;overflow:hidden;">' + footerContent[i] + '</div>';
                    nSizer.style.width = footerWidths[i];
                }, footerSrcEls);
            }
            if (table.outerWidth() < sanityWidth) {
                correction = ((divBodyEl.scrollHeight > divBodyEl.offsetHeight || divBody.css('overflow-y') == "scroll")) ? sanityWidth + barWidth : sanityWidth;
                if (ie67 && (divBodyEl.scrollHeight > divBodyEl.offsetHeight || divBody.css('overflow-y') == "scroll")) {
                    tableStyle.width = _fnStringToCss(correction - barWidth);
                }
                if (scrollX === "" || scrollXInner !== "") {
                    _fnLog(settings, 1, 'Possible column misalignment', 6);
                }
            } else {
                correction = '100%';
            }
            divBodyStyle.width = _fnStringToCss(correction);
            divHeaderStyle.width = _fnStringToCss(correction);
            if (footer) {
                settings.nScrollFoot.style.width = _fnStringToCss(correction);
            }
            if (!scrollY) {
                if (ie67) {
                    divBodyStyle.height = _fnStringToCss(tableEl.offsetHeight + barWidth);
                }
            }
            var iOuterWidth = table.outerWidth();
            divHeaderTable[0].style.width = _fnStringToCss(iOuterWidth);
            divHeaderInnerStyle.width = _fnStringToCss(iOuterWidth);
            var bScrolling = table.height() > divBodyEl.clientHeight || divBody.css('overflow-y') == "scroll";
            var padding = 'padding' + (browser.bScrollbarLeft ? 'Left' : 'Right');
            divHeaderInnerStyle[padding] = bScrolling ? barWidth + "px" : "0px";
            if (footer) {
                divFooterTable[0].style.width = _fnStringToCss(iOuterWidth);
                divFooterInner[0].style.width = _fnStringToCss(iOuterWidth);
                divFooterInner[0].style[padding] = bScrolling ? barWidth + "px" : "0px";
            }
            table.children('colgroup').insertBefore(table.children('thead'));
            divBody.scroll();
            if ((settings.bSorted || settings.bFiltered) && !settings._drawHold) {
                divBodyEl.scrollTop = 0;
            }
        }

        function _fnApplyToChildren(fn, an1, an2) {
            var index = 0,
                i = 0,
                iLen = an1.length;
            var nNode1, nNode2;
            while (i < iLen) {
                nNode1 = an1[i].firstChild;
                nNode2 = an2 ? an2[i].firstChild : null;
                while (nNode1) {
                    if (nNode1.nodeType === 1) {
                        if (an2) {
                            fn(nNode1, nNode2, index);
                        } else {
                            fn(nNode1, index);
                        }
                        index++;
                    }
                    nNode1 = nNode1.nextSibling;
                    nNode2 = an2 ? nNode2.nextSibling : null;
                }
                i++;
            }
        }
        var __re_html_remove = /<.*?>/g;

        function _fnCalculateColumnWidths(oSettings) {
            var
                table = oSettings.nTable,
                columns = oSettings.aoColumns,
                scroll = oSettings.oScroll,
                scrollY = scroll.sY,
                scrollX = scroll.sX,
                scrollXInner = scroll.sXInner,
                columnCount = columns.length,
                visibleColumns = _fnGetColumns(oSettings, 'bVisible'),
                headerCells = $('th', oSettings.nTHead),
                tableWidthAttr = table.getAttribute('width'),
                tableContainer = table.parentNode,
                userInputs = false,
                i, column, columnIdx, width, outerWidth, browser = oSettings.oBrowser,
                ie67 = browser.bScrollOversize;
            var styleWidth = table.style.width;
            if (styleWidth && styleWidth.indexOf('%') !== -1) {
                tableWidthAttr = styleWidth;
            }
            for (i = 0; i < visibleColumns.length; i++) {
                column = columns[visibleColumns[i]];
                if (column.sWidth !== null) {
                    column.sWidth = _fnConvertToWidth(column.sWidthOrig, tableContainer);
                    userInputs = true;
                }
            }
            if (ie67 || !userInputs && !scrollX && !scrollY && columnCount == _fnVisbleColumns(oSettings) && columnCount == headerCells.length) {
                for (i = 0; i < columnCount; i++) {
                    var colIdx = _fnVisibleToColumnIndex(oSettings, i);
                    if (colIdx !== null) {
                        columns[colIdx].sWidth = _fnStringToCss(headerCells.eq(i).width());
                    }
                }
            } else {
                var tmpTable = $(table).clone().css('visibility', 'hidden').removeAttr('id');
                tmpTable.find('tbody tr').remove();
                var tr = $('<tr/>').appendTo(tmpTable.find('tbody'));
                tmpTable.find('thead, tfoot').remove();
                tmpTable.append($(oSettings.nTHead).clone()).append($(oSettings.nTFoot).clone());
                tmpTable.find('tfoot th, tfoot td').css('width', '');
                headerCells = _fnGetUniqueThs(oSettings, tmpTable.find('thead')[0]);
                for (i = 0; i < visibleColumns.length; i++) {
                    column = columns[visibleColumns[i]];
                    headerCells[i].style.width = column.sWidthOrig !== null && column.sWidthOrig !== '' ? _fnStringToCss(column.sWidthOrig) : '';
                    if (column.sWidthOrig && scrollX) {
                        $(headerCells[i]).append($('<div/>').css({
                            width: column.sWidthOrig,
                            margin: 0,
                            padding: 0,
                            border: 0,
                            height: 1
                        }));
                    }
                }
                if (oSettings.aoData.length) {
                    for (i = 0; i < visibleColumns.length; i++) {
                        columnIdx = visibleColumns[i];
                        column = columns[columnIdx];
                        $(_fnGetWidestNode(oSettings, columnIdx)).clone(false).append(column.sContentPadding).appendTo(tr);
                    }
                }
                $('[name]', tmpTable).removeAttr('name');
                var holder = $('<div/>').css(scrollX || scrollY ? {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: 1,
                    right: 0,
                    overflow: 'hidden'
                } : {}).append(tmpTable).appendTo(tableContainer);
                if (scrollX && scrollXInner) {
                    tmpTable.width(scrollXInner);
                } else if (scrollX) {
                    tmpTable.css('width', 'auto');
                    tmpTable.removeAttr('width');
                    if (tmpTable.width() < tableContainer.clientWidth && tableWidthAttr) {
                        tmpTable.width(tableContainer.clientWidth);
                    }
                } else if (scrollY) {
                    tmpTable.width(tableContainer.clientWidth);
                } else if (tableWidthAttr) {
                    tmpTable.width(tableWidthAttr);
                }
                var total = 0;
                for (i = 0; i < visibleColumns.length; i++) {
                    var cell = $(headerCells[i]);
                    var border = cell.outerWidth() - cell.width();
                    var bounding = browser.bBounding ? Math.ceil(headerCells[i].getBoundingClientRect().width) : cell.outerWidth();
                    total += bounding;
                    columns[visibleColumns[i]].sWidth = _fnStringToCss(bounding - border);
                }
                table.style.width = _fnStringToCss(total);
                holder.remove();
            }
            if (tableWidthAttr) {
                table.style.width = _fnStringToCss(tableWidthAttr);
            }
            if ((tableWidthAttr || scrollX) && !oSettings._reszEvt) {
                var bindResize = function() {
                    $(window).on('resize.DT-' + oSettings.sInstance, _fnThrottle(function() {
                        _fnAdjustColumnSizing(oSettings);
                    }));
                };
                if (ie67) {
                    setTimeout(bindResize, 1000);
                } else {
                    bindResize();
                }
                oSettings._reszEvt = true;
            }
        }
        var _fnThrottle = DataTable.util.throttle;

        function _fnConvertToWidth(width, parent) {
            if (!width) {
                return 0;
            }
            var n = $('<div/>').css('width', _fnStringToCss(width)).appendTo(parent || document.body);
            var val = n[0].offsetWidth;
            n.remove();
            return val;
        }

        function _fnGetWidestNode(settings, colIdx) {
            var idx = _fnGetMaxLenString(settings, colIdx);
            if (idx < 0) {
                return null;
            }
            var data = settings.aoData[idx];
            return !data.nTr ? $('<td/>').html(_fnGetCellData(settings, idx, colIdx, 'display'))[0] : data.anCells[colIdx];
        }

        function _fnGetMaxLenString(settings, colIdx) {
            var s, max = -1,
                maxIdx = -1;
            for (var i = 0, ien = settings.aoData.length; i < ien; i++) {
                s = _fnGetCellData(settings, i, colIdx, 'display') + '';
                s = s.replace(__re_html_remove, '');
                s = s.replace(/&nbsp;/g, ' ');
                if (s.length > max) {
                    max = s.length;
                    maxIdx = i;
                }
            }
            return maxIdx;
        }

        function _fnStringToCss(s) {
            if (s === null) {
                return '0px';
            }
            if (typeof s == 'number') {
                return s < 0 ? '0px' : s + 'px';
            }
            return s.match(/\d$/) ? s + 'px' : s;
        }

        function _fnSortFlatten(settings) {
            var
                i, iLen, k, kLen, aSort = [],
                aiOrig = [],
                aoColumns = settings.aoColumns,
                aDataSort, iCol, sType, srcCol, fixed = settings.aaSortingFixed,
                fixedObj = $.isPlainObject(fixed),
                nestedSort = [],
                add = function(a) {
                    if (a.length && !$.isArray(a[0])) {
                        nestedSort.push(a);
                    } else {
                        $.merge(nestedSort, a);
                    }
                };
            if ($.isArray(fixed)) {
                add(fixed);
            }
            if (fixedObj && fixed.pre) {
                add(fixed.pre);
            }
            add(settings.aaSorting);
            if (fixedObj && fixed.post) {
                add(fixed.post);
            }
            for (i = 0; i < nestedSort.length; i++) {
                srcCol = nestedSort[i][0];
                aDataSort = aoColumns[srcCol].aDataSort;
                for (k = 0, kLen = aDataSort.length; k < kLen; k++) {
                    iCol = aDataSort[k];
                    sType = aoColumns[iCol].sType || 'string';
                    if (nestedSort[i]._idx === undefined) {
                        nestedSort[i]._idx = $.inArray(nestedSort[i][1], aoColumns[iCol].asSorting);
                    }
                    aSort.push({
                        src: srcCol,
                        col: iCol,
                        dir: nestedSort[i][1],
                        index: nestedSort[i]._idx,
                        type: sType,
                        formatter: DataTable.ext.type.order[sType + "-pre"]
                    });
                }
            }
            return aSort;
        }

        function _fnSort(oSettings) {
            var
                i, ien, iLen, j, jLen, k, kLen, sDataType, nTh, aiOrig = [],
                oExtSort = DataTable.ext.type.order,
                aoData = oSettings.aoData,
                aoColumns = oSettings.aoColumns,
                aDataSort, data, iCol, sType, oSort, formatters = 0,
                sortCol, displayMaster = oSettings.aiDisplayMaster,
                aSort;
            _fnColumnTypes(oSettings);
            aSort = _fnSortFlatten(oSettings);
            for (i = 0, ien = aSort.length; i < ien; i++) {
                sortCol = aSort[i];
                if (sortCol.formatter) {
                    formatters++;
                }
                _fnSortData(oSettings, sortCol.col);
            }
            if (_fnDataSource(oSettings) != 'ssp' && aSort.length !== 0) {
                for (i = 0, iLen = displayMaster.length; i < iLen; i++) {
                    aiOrig[displayMaster[i]] = i;
                }
                if (formatters === aSort.length) {
                    displayMaster.sort(function(a, b) {
                        var
                            x, y, k, test, sort, len = aSort.length,
                            dataA = aoData[a]._aSortData,
                            dataB = aoData[b]._aSortData;
                        for (k = 0; k < len; k++) {
                            sort = aSort[k];
                            x = dataA[sort.col];
                            y = dataB[sort.col];
                            test = x < y ? -1 : x > y ? 1 : 0;
                            if (test !== 0) {
                                return sort.dir === 'asc' ? test : -test;
                            }
                        }
                        x = aiOrig[a];
                        y = aiOrig[b];
                        return x < y ? -1 : x > y ? 1 : 0;
                    });
                } else {
                    displayMaster.sort(function(a, b) {
                        var
                            x, y, k, l, test, sort, fn, len = aSort.length,
                            dataA = aoData[a]._aSortData,
                            dataB = aoData[b]._aSortData;
                        for (k = 0; k < len; k++) {
                            sort = aSort[k];
                            x = dataA[sort.col];
                            y = dataB[sort.col];
                            fn = oExtSort[sort.type + "-" + sort.dir] || oExtSort["string-" + sort.dir];
                            test = fn(x, y);
                            if (test !== 0) {
                                return test;
                            }
                        }
                        x = aiOrig[a];
                        y = aiOrig[b];
                        return x < y ? -1 : x > y ? 1 : 0;
                    });
                }
            }
            oSettings.bSorted = true;
        }

        function _fnSortAria(settings) {
            var label;
            var nextSort;
            var columns = settings.aoColumns;
            var aSort = _fnSortFlatten(settings);
            var oAria = settings.oLanguage.oAria;
            for (var i = 0, iLen = columns.length; i < iLen; i++) {
                var col = columns[i];
                var asSorting = col.asSorting;
                var sTitle = col.sTitle.replace(/<.*?>/g, "");
                var th = col.nTh;
                th.removeAttribute('aria-sort');
                if (col.bSortable) {
                    if (aSort.length > 0 && aSort[0].col == i) {
                        th.setAttribute('aria-sort', aSort[0].dir == "asc" ? "ascending" : "descending");
                        nextSort = asSorting[aSort[0].index + 1] || asSorting[0];
                    } else {
                        nextSort = asSorting[0];
                    }
                    label = sTitle + (nextSort === "asc" ? oAria.sSortAscending : oAria.sSortDescending);
                } else {
                    label = sTitle;
                }
                th.setAttribute('aria-label', label);
            }
        }

        function _fnSortListener(settings, colIdx, append, callback) {
            var col = settings.aoColumns[colIdx];
            var sorting = settings.aaSorting;
            var asSorting = col.asSorting;
            var nextSortIdx;
            var next = function(a, overflow) {
                var idx = a._idx;
                if (idx === undefined) {
                    idx = $.inArray(a[1], asSorting);
                }
                return idx + 1 < asSorting.length ? idx + 1 : overflow ? null : 0;
            };
            if (typeof sorting[0] === 'number') {
                sorting = settings.aaSorting = [sorting];
            }
            if (append && settings.oFeatures.bSortMulti) {
                var sortIdx = $.inArray(colIdx, _pluck(sorting, '0'));
                if (sortIdx !== -1) {
                    nextSortIdx = next(sorting[sortIdx], true);
                    if (nextSortIdx === null && sorting.length === 1) {
                        nextSortIdx = 0;
                    }
                    if (nextSortIdx === null) {
                        sorting.splice(sortIdx, 1);
                    } else {
                        sorting[sortIdx][1] = asSorting[nextSortIdx];
                        sorting[sortIdx]._idx = nextSortIdx;
                    }
                } else {
                    sorting.push([colIdx, asSorting[0], 0]);
                    sorting[sorting.length - 1]._idx = 0;
                }
            } else if (sorting.length && sorting[0][0] == colIdx) {
                nextSortIdx = next(sorting[0]);
                sorting.length = 1;
                sorting[0][1] = asSorting[nextSortIdx];
                sorting[0]._idx = nextSortIdx;
            } else {
                sorting.length = 0;
                sorting.push([colIdx, asSorting[0]]);
                sorting[0]._idx = 0;
            }
            _fnReDraw(settings);
            if (typeof callback == 'function') {
                callback(settings);
            }
        }

        function _fnSortAttachListener(settings, attachTo, colIdx, callback) {
            var col = settings.aoColumns[colIdx];
            _fnBindAction(attachTo, {}, function(e) {
                if (col.bSortable === false) {
                    return;
                }
                if (settings.oFeatures.bProcessing) {
                    _fnProcessingDisplay(settings, true);
                    setTimeout(function() {
                        _fnSortListener(settings, colIdx, e.shiftKey, callback);
                        if (_fnDataSource(settings) !== 'ssp') {
                            _fnProcessingDisplay(settings, false);
                        }
                    }, 0);
                } else {
                    _fnSortListener(settings, colIdx, e.shiftKey, callback);
                }
            });
        }

        function _fnSortingClasses(settings) {
            var oldSort = settings.aLastSort;
            var sortClass = settings.oClasses.sSortColumn;
            var sort = _fnSortFlatten(settings);
            var features = settings.oFeatures;
            var i, ien, colIdx;
            if (features.bSort && features.bSortClasses) {
                for (i = 0, ien = oldSort.length; i < ien; i++) {
                    colIdx = oldSort[i].src;
                    $(_pluck(settings.aoData, 'anCells', colIdx)).removeClass(sortClass + (i < 2 ? i + 1 : 3));
                }
                for (i = 0, ien = sort.length; i < ien; i++) {
                    colIdx = sort[i].src;
                    $(_pluck(settings.aoData, 'anCells', colIdx)).addClass(sortClass + (i < 2 ? i + 1 : 3));
                }
            }
            settings.aLastSort = sort;
        }

        function _fnSortData(settings, idx) {
            var column = settings.aoColumns[idx];
            var customSort = DataTable.ext.order[column.sSortDataType];
            var customData;
            if (customSort) {
                customData = customSort.call(settings.oInstance, settings, idx, _fnColumnIndexToVisible(settings, idx));
            }
            var row, cellData;
            var formatter = DataTable.ext.type.order[column.sType + "-pre"];
            for (var i = 0, ien = settings.aoData.length; i < ien; i++) {
                row = settings.aoData[i];
                if (!row._aSortData) {
                    row._aSortData = [];
                }
                if (!row._aSortData[idx] || customSort) {
                    cellData = customSort ? customData[i] : _fnGetCellData(settings, i, idx, 'sort');
                    row._aSortData[idx] = formatter ? formatter(cellData) : cellData;
                }
            }
        }

        function _fnSaveState(settings) {
            if (!settings.oFeatures.bStateSave || settings.bDestroying) {
                return;
            }
            var state = {
                time: +new Date(),
                start: settings._iDisplayStart,
                length: settings._iDisplayLength,
                order: $.extend(true, [], settings.aaSorting),
                search: _fnSearchToCamel(settings.oPreviousSearch),
                columns: $.map(settings.aoColumns, function(col, i) {
                    return {
                        visible: col.bVisible,
                        search: _fnSearchToCamel(settings.aoPreSearchCols[i])
                    };
                })
            };
            _fnCallbackFire(settings, "aoStateSaveParams", 'stateSaveParams', [settings, state]);
            settings.oSavedState = state;
            settings.fnStateSaveCallback.call(settings.oInstance, settings, state);
        }

        function _fnLoadState(settings, oInit, callback) {
            var i, ien;
            var columns = settings.aoColumns;
            var loaded = function(s) {
                if (!s || !s.time) {
                    callback();
                    return;
                }
                var abStateLoad = _fnCallbackFire(settings, 'aoStateLoadParams', 'stateLoadParams', [settings, state]);
                if ($.inArray(false, abStateLoad) !== -1) {
                    callback();
                    return;
                }
                var duration = settings.iStateDuration;
                if (duration > 0 && s.time < +new Date() - (duration * 1000)) {
                    callback();
                    return;
                }
                if (s.columns && columns.length !== s.columns.length) {
                    callback();
                    return;
                }
                settings.oLoadedState = $.extend(true, {}, state);
                if (s.start !== undefined) {
                    settings._iDisplayStart = s.start;
                    settings.iInitDisplayStart = s.start;
                }
                if (s.length !== undefined) {
                    settings._iDisplayLength = s.length;
                }
                if (s.order !== undefined) {
                    settings.aaSorting = [];
                    $.each(s.order, function(i, col) {
                        settings.aaSorting.push(col[0] >= columns.length ? [0, col[1]] : col);
                    });
                }
                if (s.search !== undefined) {
                    $.extend(settings.oPreviousSearch, _fnSearchToHung(s.search));
                }
                if (s.columns) {
                    for (i = 0, ien = s.columns.length; i < ien; i++) {
                        var col = s.columns[i];
                        if (col.visible !== undefined) {
                            columns[i].bVisible = col.visible;
                        }
                        if (col.search !== undefined) {
                            $.extend(settings.aoPreSearchCols[i], _fnSearchToHung(col.search));
                        }
                    }
                }
                _fnCallbackFire(settings, 'aoStateLoaded', 'stateLoaded', [settings, state]);
                callback();
            }
            if (!settings.oFeatures.bStateSave) {
                callback();
                return;
            }
            var state = settings.fnStateLoadCallback.call(settings.oInstance, settings, loaded);
            if (state !== undefined) {
                loaded(state);
            }
        }

        function _fnSettingsFromNode(table) {
            var settings = DataTable.settings;
            var idx = $.inArray(table, _pluck(settings, 'nTable'));
            return idx !== -1 ? settings[idx] : null;
        }

        function _fnLog(settings, level, msg, tn) {
            msg = 'DataTables warning: ' + (settings ? 'table id=' + settings.sTableId + ' - ' : '') + msg;
            if (tn) {
                msg += '. For more information about this error, please see ' + 'http://datatables.net/tn/' + tn;
            }
            if (!level) {
                var ext = DataTable.ext;
                var type = ext.sErrMode || ext.errMode;
                if (settings) {
                    _fnCallbackFire(settings, null, 'error', [settings, tn, msg]);
                }
                if (type == 'alert') {
                    console.log(msg);
                } else if (type == 'throw') {
                    console.log(msg);
                } else if (typeof type == 'function') {
                    type(settings, tn, msg);
                }
            } else if (window.console && console.log) {
                console.log(msg);
            }
        }

        function _fnMap(ret, src, name, mappedName) {
            if ($.isArray(name)) {
                $.each(name, function(i, val) {
                    if ($.isArray(val)) {
                        _fnMap(ret, src, val[0], val[1]);
                    } else {
                        _fnMap(ret, src, val);
                    }
                });
                return;
            }
            if (mappedName === undefined) {
                mappedName = name;
            }
            if (src[name] !== undefined) {
                ret[mappedName] = src[name];
            }
        }

        function _fnExtend(out, extender, breakRefs) {
            var val;
            for (var prop in extender) {
                if (extender.hasOwnProperty(prop)) {
                    val = extender[prop];
                    if ($.isPlainObject(val)) {
                        if (!$.isPlainObject(out[prop])) {
                            out[prop] = {};
                        }
                        $.extend(true, out[prop], val);
                    } else if (breakRefs && prop !== 'data' && prop !== 'aaData' && $.isArray(val)) {
                        out[prop] = val.slice();
                    } else {
                        out[prop] = val;
                    }
                }
            }
            return out;
        }

        function _fnBindAction(n, oData, fn) {
            $(n).on('click.DT', oData, function(e) {
                n.blur();
                fn(e);
            }).on('keypress.DT', oData, function(e) {
                if (e.which === 13) {
                    e.preventDefault();
                    fn(e);
                }
            }).on('selectstart.DT', function() {
                return false;
            });
        }

        function _fnCallbackReg(oSettings, sStore, fn, sName) {
            if (fn) {
                oSettings[sStore].push({
                    "fn": fn,
                    "sName": sName
                });
            }
        }

        function _fnCallbackFire(settings, callbackArr, eventName, args) {
            var ret = [];
            if (callbackArr) {
                ret = $.map(settings[callbackArr].slice().reverse(), function(val, i) {
                    return val.fn.apply(settings.oInstance, args);
                });
            }
            if (eventName !== null) {
                var e = $.Event(eventName + '.dt');
                $(settings.nTable).trigger(e, args);
                ret.push(e.result);
            }
            return ret;
        }

        function _fnLengthOverflow(settings) {
            var
                start = settings._iDisplayStart,
                end = settings.fnDisplayEnd(),
                len = settings._iDisplayLength;
            if (start >= end) {
                start = end - len;
            }
            start -= (start % len);
            if (len === -1 || start < 0) {
                start = 0;
            }
            settings._iDisplayStart = start;
        }

        function _fnRenderer(settings, type) {
            var renderer = settings.renderer;
            var host = DataTable.ext.renderer[type];
            if ($.isPlainObject(renderer) && renderer[type]) {
                return host[renderer[type]] || host._;
            } else if (typeof renderer === 'string') {
                return host[renderer] || host._;
            }
            return host._;
        }

        function _fnDataSource(settings) {
            if (settings.oFeatures.bServerSide) {
                return 'ssp';
            } else if (settings.ajax || settings.sAjaxSource) {
                return 'ajax';
            }
            return 'dom';
        }
        var __apiStruct = [];
        var __arrayProto = Array.prototype;
        var _toSettings = function(mixed) {
            var idx, jq;
            var settings = DataTable.settings;
            var tables = $.map(settings, function(el, i) {
                return el.nTable;
            });
            if (!mixed) {
                return [];
            } else if (mixed.nTable && mixed.oApi) {
                return [mixed];
            } else if (mixed.nodeName && mixed.nodeName.toLowerCase() === 'table') {
                idx = $.inArray(mixed, tables);
                return idx !== -1 ? [settings[idx]] : null;
            } else if (mixed && typeof mixed.settings === 'function') {
                return mixed.settings().toArray();
            } else if (typeof mixed === 'string') {
                jq = $(mixed);
            } else if (mixed instanceof $) {
                jq = mixed;
            }
            if (jq) {
                return jq.map(function(i) {
                    idx = $.inArray(this, tables);
                    return idx !== -1 ? settings[idx] : null;
                }).toArray();
            }
        };
        _Api = function(context, data) {
            if (!(this instanceof _Api)) {
                return new _Api(context, data);
            }
            var settings = [];
            var ctxSettings = function(o) {
                var a = _toSettings(o);
                if (a) {
                    settings = settings.concat(a);
                }
            };
            if ($.isArray(context)) {
                for (var i = 0, ien = context.length; i < ien; i++) {
                    ctxSettings(context[i]);
                }
            } else {
                ctxSettings(context);
            }
            this.context = _unique(settings);
            if (data) {
                $.merge(this, data);
            }
            this.selector = {
                rows: null,
                cols: null,
                opts: null
            };
            _Api.extend(this, this, __apiStruct);
        };
        DataTable.Api = _Api;
        $.extend(_Api.prototype, {
            any: function() {
                return this.count() !== 0;
            },
            concat: __arrayProto.concat,
            context: [],
            count: function() {
                return this.flatten().length;
            },
            each: function(fn) {
                for (var i = 0, ien = this.length; i < ien; i++) {
                    fn.call(this, this[i], i, this);
                }
                return this;
            },
            eq: function(idx) {
                var ctx = this.context;
                return ctx.length > idx ? new _Api(ctx[idx], this[idx]) : null;
            },
            filter: function(fn) {
                var a = [];
                if (__arrayProto.filter) {
                    a = __arrayProto.filter.call(this, fn, this);
                } else {
                    for (var i = 0, ien = this.length; i < ien; i++) {
                        if (fn.call(this, this[i], i, this)) {
                            a.push(this[i]);
                        }
                    }
                }
                return new _Api(this.context, a);
            },
            flatten: function() {
                var a = [];
                return new _Api(this.context, a.concat.apply(a, this.toArray()));
            },
            join: __arrayProto.join,
            indexOf: __arrayProto.indexOf || function(obj, start) {
                for (var i = (start || 0), ien = this.length; i < ien; i++) {
                    if (this[i] === obj) {
                        return i;
                    }
                }
                return -1;
            },
            iterator: function(flatten, type, fn, alwaysNew) {
                var
                    a = [],
                    ret, i, ien, j, jen, context = this.context,
                    rows, items, item, selector = this.selector;
                if (typeof flatten === 'string') {
                    alwaysNew = fn;
                    fn = type;
                    type = flatten;
                    flatten = false;
                }
                for (i = 0, ien = context.length; i < ien; i++) {
                    var apiInst = new _Api(context[i]);
                    if (type === 'table') {
                        ret = fn.call(apiInst, context[i], i);
                        if (ret !== undefined) {
                            a.push(ret);
                        }
                    } else if (type === 'columns' || type === 'rows') {
                        ret = fn.call(apiInst, context[i], this[i], i);
                        if (ret !== undefined) {
                            a.push(ret);
                        }
                    } else if (type === 'column' || type === 'column-rows' || type === 'row' || type === 'cell') {
                        items = this[i];
                        if (type === 'column-rows') {
                            rows = _selector_row_indexes(context[i], selector.opts);
                        }
                        for (j = 0, jen = items.length; j < jen; j++) {
                            item = items[j];
                            if (type === 'cell') {
                                ret = fn.call(apiInst, context[i], item.row, item.column, i, j);
                            } else {
                                ret = fn.call(apiInst, context[i], item, i, j, rows);
                            }
                            if (ret !== undefined) {
                                a.push(ret);
                            }
                        }
                    }
                }
                if (a.length || alwaysNew) {
                    var api = new _Api(context, flatten ? a.concat.apply([], a) : a);
                    var apiSelector = api.selector;
                    apiSelector.rows = selector.rows;
                    apiSelector.cols = selector.cols;
                    apiSelector.opts = selector.opts;
                    return api;
                }
                return this;
            },
            lastIndexOf: __arrayProto.lastIndexOf || function(obj, start) {
                return this.indexOf.apply(this.toArray.reverse(), arguments);
            },
            length: 0,
            map: function(fn) {
                var a = [];
                if (__arrayProto.map) {
                    a = __arrayProto.map.call(this, fn, this);
                } else {
                    for (var i = 0, ien = this.length; i < ien; i++) {
                        a.push(fn.call(this, this[i], i));
                    }
                }
                return new _Api(this.context, a);
            },
            pluck: function(prop) {
                return this.map(function(el) {
                    return el[prop];
                });
            },
            pop: __arrayProto.pop,
            push: __arrayProto.push,
            reduce: __arrayProto.reduce || function(fn, init) {
                return _fnReduce(this, fn, init, 0, this.length, 1);
            },
            reduceRight: __arrayProto.reduceRight || function(fn, init) {
                return _fnReduce(this, fn, init, this.length - 1, -1, -1);
            },
            reverse: __arrayProto.reverse,
            selector: null,
            shift: __arrayProto.shift,
            sort: __arrayProto.sort,
            splice: __arrayProto.splice,
            toArray: function() {
                return __arrayProto.slice.call(this);
            },
            to$: function() {
                return $(this);
            },
            toJQuery: function() {
                return $(this);
            },
            unique: function() {
                return new _Api(this.context, _unique(this));
            },
            unshift: __arrayProto.unshift
        });
        _Api.extend = function(scope, obj, ext) {
            if (!ext.length || !obj || (!(obj instanceof _Api) && !obj.__dt_wrapper)) {
                return;
            }
            var
                i, ien, j, jen, struct, inner, methodScoping = function(scope, fn, struc) {
                    return function() {
                        var ret = fn.apply(scope, arguments);
                        _Api.extend(ret, ret, struc.methodExt);
                        return ret;
                    };
                };
            for (i = 0, ien = ext.length; i < ien; i++) {
                struct = ext[i];
                obj[struct.name] = typeof struct.val === 'function' ? methodScoping(scope, struct.val, struct) : $.isPlainObject(struct.val) ? {} : struct.val;
                obj[struct.name].__dt_wrapper = true;
                _Api.extend(scope, obj[struct.name], struct.propExt);
            }
        };
        _Api.register = _api_register = function(name, val) {
            if ($.isArray(name)) {
                for (var j = 0, jen = name.length; j < jen; j++) {
                    _Api.register(name[j], val);
                }
                return;
            }
            var
                i, ien, heir = name.split('.'),
                struct = __apiStruct,
                key, method;
            var find = function(src, name) {
                for (var i = 0, ien = src.length; i < ien; i++) {
                    if (src[i].name === name) {
                        return src[i];
                    }
                }
                return null;
            };
            for (i = 0, ien = heir.length; i < ien; i++) {
                method = heir[i].indexOf('()') !== -1;
                key = method ? heir[i].replace('()', '') : heir[i];
                var src = find(struct, key);
                if (!src) {
                    src = {
                        name: key,
                        val: {},
                        methodExt: [],
                        propExt: []
                    };
                    struct.push(src);
                }
                if (i === ien - 1) {
                    src.val = val;
                } else {
                    struct = method ? src.methodExt : src.propExt;
                }
            }
        };
        _Api.registerPlural = _api_registerPlural = function(pluralName, singularName, val) {
            _Api.register(pluralName, val);
            _Api.register(singularName, function() {
                var ret = val.apply(this, arguments);
                if (ret === this) {
                    return this;
                } else if (ret instanceof _Api) {
                    return ret.length ? $.isArray(ret[0]) ? new _Api(ret.context, ret[0]) : ret[0] : undefined;
                }
                return ret;
            });
        };
        var __table_selector = function(selector, a) {
            if (typeof selector === 'number') {
                return [a[selector]];
            }
            var nodes = $.map(a, function(el, i) {
                return el.nTable;
            });
            return $(nodes).filter(selector).map(function(i) {
                var idx = $.inArray(this, nodes);
                return a[idx];
            }).toArray();
        };
        _api_register('tables()', function(selector) {
            return selector ? new _Api(__table_selector(selector, this.context)) : this;
        });
        _api_register('table()', function(selector) {
            var tables = this.tables(selector);
            var ctx = tables.context;
            return ctx.length ? new _Api(ctx[0]) : tables;
        });
        _api_registerPlural('tables().nodes()', 'table().node()', function() {
            return this.iterator('table', function(ctx) {
                return ctx.nTable;
            }, 1);
        });
        _api_registerPlural('tables().body()', 'table().body()', function() {
            return this.iterator('table', function(ctx) {
                return ctx.nTBody;
            }, 1);
        });
        _api_registerPlural('tables().header()', 'table().header()', function() {
            return this.iterator('table', function(ctx) {
                return ctx.nTHead;
            }, 1);
        });
        _api_registerPlural('tables().footer()', 'table().footer()', function() {
            return this.iterator('table', function(ctx) {
                return ctx.nTFoot;
            }, 1);
        });
        _api_registerPlural('tables().containers()', 'table().container()', function() {
            return this.iterator('table', function(ctx) {
                return ctx.nTableWrapper;
            }, 1);
        });
        _api_register('draw()', function(paging) {
            return this.iterator('table', function(settings) {
                if (paging === 'page') {
                    _fnDraw(settings);
                } else {
                    if (typeof paging === 'string') {
                        paging = paging === 'full-hold' ? false : true;
                    }
                    _fnReDraw(settings, paging === false);
                }
            });
        });
        _api_register('page()', function(action) {
            if (action === undefined) {
                return this.page.info().page;
            }
            return this.iterator('table', function(settings) {
                _fnPageChange(settings, action);
            });
        });
        _api_register('page.info()', function(action) {
            if (this.context.length === 0) {
                return undefined;
            }
            var
                settings = this.context[0],
                start = settings._iDisplayStart,
                len = settings.oFeatures.bPaginate ? settings._iDisplayLength : -1,
                visRecords = settings.fnRecordsDisplay(),
                all = len === -1;
            return {
                "page": all ? 0 : Math.floor(start / len),
                "pages": all ? 1 : Math.ceil(visRecords / len),
                "start": start,
                "end": settings.fnDisplayEnd(),
                "length": len,
                "recordsTotal": settings.fnRecordsTotal(),
                "recordsDisplay": visRecords,
                "serverSide": _fnDataSource(settings) === 'ssp'
            };
        });
        _api_register('page.len()', function(len) {
            if (len === undefined) {
                return this.context.length !== 0 ? this.context[0]._iDisplayLength : undefined;
            }
            return this.iterator('table', function(settings) {
                _fnLengthChange(settings, len);
            });
        });
        var __reload = function(settings, holdPosition, callback) {
            if (callback) {
                var api = new _Api(settings);
                api.one('draw', function() {
                    callback(api.ajax.json());
                });
            }
            if (_fnDataSource(settings) == 'ssp') {
                _fnReDraw(settings, holdPosition);
            } else {
                _fnProcessingDisplay(settings, true);
                var xhr = settings.jqXHR;
                if (xhr && xhr.readyState !== 4) {
                    xhr.abort();
                }
                _fnBuildAjax(settings, [], function(json) {
                    _fnClearTable(settings);
                    var data = _fnAjaxDataSrc(settings, json);
                    for (var i = 0, ien = data.length; i < ien; i++) {
                        _fnAddData(settings, data[i]);
                    }
                    _fnReDraw(settings, holdPosition);
                    _fnProcessingDisplay(settings, false);
                });
            }
        };
        _api_register('ajax.json()', function() {
            var ctx = this.context;
            if (ctx.length > 0) {
                return ctx[0].json;
            }
        });
        _api_register('ajax.params()', function() {
            var ctx = this.context;
            if (ctx.length > 0) {
                return ctx[0].oAjaxData;
            }
        });
        _api_register('ajax.reload()', function(callback, resetPaging) {
            return this.iterator('table', function(settings) {
                __reload(settings, resetPaging === false, callback);
            });
        });
        _api_register('ajax.url()', function(url) {
            var ctx = this.context;
            if (url === undefined) {
                if (ctx.length === 0) {
                    return undefined;
                }
                ctx = ctx[0];
                return ctx.ajax ? $.isPlainObject(ctx.ajax) ? ctx.ajax.url : ctx.ajax : ctx.sAjaxSource;
            }
            return this.iterator('table', function(settings) {
                if ($.isPlainObject(settings.ajax)) {
                    settings.ajax.url = url;
                } else {
                    settings.ajax = url;
                }
            });
        });
        _api_register('ajax.url().load()', function(callback, resetPaging) {
            return this.iterator('table', function(ctx) {
                __reload(ctx, resetPaging === false, callback);
            });
        });
        var _selector_run = function(type, selector, selectFn, settings, opts) {
            var
                out = [],
                res, a, i, ien, j, jen, selectorType = typeof selector;
            if (!selector || selectorType === 'string' || selectorType === 'function' || selector.length === undefined) {
                selector = [selector];
            }
            for (i = 0, ien = selector.length; i < ien; i++) {
                a = selector[i] && selector[i].split && !selector[i].match(/[\[\(:]/) ? selector[i].split(',') : [selector[i]];
                for (j = 0, jen = a.length; j < jen; j++) {
                    res = selectFn(typeof a[j] === 'string' ? $.trim(a[j]) : a[j]);
                    if (res && res.length) {
                        out = out.concat(res);
                    }
                }
            }
            var ext = _ext.selector[type];
            if (ext.length) {
                for (i = 0, ien = ext.length; i < ien; i++) {
                    out = ext[i](settings, opts, out);
                }
            }
            return _unique(out);
        };
        var _selector_opts = function(opts) {
            if (!opts) {
                opts = {};
            }
            if (opts.filter && opts.search === undefined) {
                opts.search = opts.filter;
            }
            return $.extend({
                search: 'none',
                order: 'current',
                page: 'all'
            }, opts);
        };
        var _selector_first = function(inst) {
            for (var i = 0, ien = inst.length; i < ien; i++) {
                if (inst[i].length > 0) {
                    inst[0] = inst[i];
                    inst[0].length = 1;
                    inst.length = 1;
                    inst.context = [inst.context[i]];
                    return inst;
                }
            }
            inst.length = 0;
            return inst;
        };
        var _selector_row_indexes = function(settings, opts) {
            var
                i, ien, tmp, a = [],
                displayFiltered = settings.aiDisplay,
                displayMaster = settings.aiDisplayMaster;
            var
                search = opts.search,
                order = opts.order,
                page = opts.page;
            if (_fnDataSource(settings) == 'ssp') {
                return search === 'removed' ? [] : _range(0, displayMaster.length);
            } else if (page == 'current') {
                for (i = settings._iDisplayStart, ien = settings.fnDisplayEnd(); i < ien; i++) {
                    a.push(displayFiltered[i]);
                }
            } else if (order == 'current' || order == 'applied') {
                a = search == 'none' ? displayMaster.slice() : search == 'applied' ? displayFiltered.slice() : $.map(displayMaster, function(el, i) {
                    return $.inArray(el, displayFiltered) === -1 ? el : null;
                });
            } else if (order == 'index' || order == 'original') {
                for (i = 0, ien = settings.aoData.length; i < ien; i++) {
                    if (search == 'none') {
                        a.push(i);
                    } else {
                        tmp = $.inArray(i, displayFiltered);
                        if ((tmp === -1 && search == 'removed') || (tmp >= 0 && search == 'applied')) {
                            a.push(i);
                        }
                    }
                }
            }
            return a;
        };
        var __row_selector = function(settings, selector, opts) {
            var rows;
            var run = function(sel) {
                var selInt = _intVal(sel);
                var i, ien;
                if (selInt !== null && !opts) {
                    return [selInt];
                }
                if (!rows) {
                    rows = _selector_row_indexes(settings, opts);
                }
                if (selInt !== null && $.inArray(selInt, rows) !== -1) {
                    return [selInt];
                } else if (sel === null || sel === undefined || sel === '') {
                    return rows;
                }
                if (typeof sel === 'function') {
                    return $.map(rows, function(idx) {
                        var row = settings.aoData[idx];
                        return sel(idx, row._aData, row.nTr) ? idx : null;
                    });
                }
                var nodes = _removeEmpty(_pluck_order(settings.aoData, rows, 'nTr'));
                if (sel.nodeName) {
                    if (sel._DT_RowIndex !== undefined) {
                        return [sel._DT_RowIndex];
                    } else if (sel._DT_CellIndex) {
                        return [sel._DT_CellIndex.row];
                    } else {
                        var host = $(sel).closest('*[data-dt-row]');
                        return host.length ? [host.data('dt-row')] : [];
                    }
                }
                if (typeof sel === 'string' && sel.charAt(0) === '#') {
                    var rowObj = settings.aIds[sel.replace(/^#/, '')];
                    if (rowObj !== undefined) {
                        return [rowObj.idx];
                    }
                }
                return $(nodes).filter(sel).map(function() {
                    return this._DT_RowIndex;
                }).toArray();
            };
            return _selector_run('row', selector, run, settings, opts);
        };
        _api_register('rows()', function(selector, opts) {
            if (selector === undefined) {
                selector = '';
            } else if ($.isPlainObject(selector)) {
                opts = selector;
                selector = '';
            }
            opts = _selector_opts(opts);
            var inst = this.iterator('table', function(settings) {
                return __row_selector(settings, selector, opts);
            }, 1);
            inst.selector.rows = selector;
            inst.selector.opts = opts;
            return inst;
        });
        _api_register('rows().nodes()', function() {
            return this.iterator('row', function(settings, row) {
                return settings.aoData[row].nTr || undefined;
            }, 1);
        });
        _api_register('rows().data()', function() {
            return this.iterator(true, 'rows', function(settings, rows) {
                return _pluck_order(settings.aoData, rows, '_aData');
            }, 1);
        });
        _api_registerPlural('rows().cache()', 'row().cache()', function(type) {
            return this.iterator('row', function(settings, row) {
                var r = settings.aoData[row];
                return type === 'search' ? r._aFilterData : r._aSortData;
            }, 1);
        });
        _api_registerPlural('rows().invalidate()', 'row().invalidate()', function(src) {
            return this.iterator('row', function(settings, row) {
                _fnInvalidate(settings, row, src);
            });
        });
        _api_registerPlural('rows().indexes()', 'row().index()', function() {
            return this.iterator('row', function(settings, row) {
                return row;
            }, 1);
        });
        _api_registerPlural('rows().ids()', 'row().id()', function(hash) {
            var a = [];
            var context = this.context;
            for (var i = 0, ien = context.length; i < ien; i++) {
                for (var j = 0, jen = this[i].length; j < jen; j++) {
                    var id = context[i].rowIdFn(context[i].aoData[this[i][j]]._aData);
                    a.push((hash === true ? '#' : '') + id);
                }
            }
            return new _Api(context, a);
        });
        _api_registerPlural('rows().remove()', 'row().remove()', function() {
            var that = this;
            this.iterator('row', function(settings, row, thatIdx) {
                var data = settings.aoData;
                var rowData = data[row];
                var i, ien, j, jen;
                var loopRow, loopCells;
                data.splice(row, 1);
                for (i = 0, ien = data.length; i < ien; i++) {
                    loopRow = data[i];
                    loopCells = loopRow.anCells;
                    if (loopRow.nTr !== null) {
                        loopRow.nTr._DT_RowIndex = i;
                    }
                    if (loopCells !== null) {
                        for (j = 0, jen = loopCells.length; j < jen; j++) {
                            loopCells[j]._DT_CellIndex.row = i;
                        }
                    }
                }
                _fnDeleteIndex(settings.aiDisplayMaster, row);
                _fnDeleteIndex(settings.aiDisplay, row);
                _fnDeleteIndex(that[thatIdx], row, false);
                _fnLengthOverflow(settings);
                var id = settings.rowIdFn(rowData._aData);
                if (id !== undefined) {
                    delete settings.aIds[id];
                }
            });
            this.iterator('table', function(settings) {
                for (var i = 0, ien = settings.aoData.length; i < ien; i++) {
                    settings.aoData[i].idx = i;
                }
            });
            return this;
        });
        _api_register('rows.add()', function(rows) {
            var newRows = this.iterator('table', function(settings) {
                var row, i, ien;
                var out = [];
                for (i = 0, ien = rows.length; i < ien; i++) {
                    row = rows[i];
                    if (row.nodeName && row.nodeName.toUpperCase() === 'TR') {
                        out.push(_fnAddTr(settings, row)[0]);
                    } else {
                        out.push(_fnAddData(settings, row));
                    }
                }
                return out;
            }, 1);
            var modRows = this.rows(-1);
            modRows.pop();
            $.merge(modRows, newRows);
            return modRows;
        });
        _api_register('row()', function(selector, opts) {
            return _selector_first(this.rows(selector, opts));
        });
        _api_register('row().data()', function(data) {
            var ctx = this.context;
            if (data === undefined) {
                return ctx.length && this.length ? ctx[0].aoData[this[0]]._aData : undefined;
            }
            ctx[0].aoData[this[0]]._aData = data;
            _fnInvalidate(ctx[0], this[0], 'data');
            return this;
        });
        _api_register('row().node()', function() {
            var ctx = this.context;
            return ctx.length && this.length ? ctx[0].aoData[this[0]].nTr || null : null;
        });
        _api_register('row.add()', function(row) {
            if (row instanceof $ && row.length) {
                row = row[0];
            }
            var rows = this.iterator('table', function(settings) {
                if (row.nodeName && row.nodeName.toUpperCase() === 'TR') {
                    return _fnAddTr(settings, row)[0];
                }
                return _fnAddData(settings, row);
            });
            return this.row(rows[0]);
        });
        var __details_add = function(ctx, row, data, klass) {
            var rows = [];
            var addRow = function(r, k) {
                if ($.isArray(r) || r instanceof $) {
                    for (var i = 0, ien = r.length; i < ien; i++) {
                        addRow(r[i], k);
                    }
                    return;
                }
                if (r.nodeName && r.nodeName.toLowerCase() === 'tr') {
                    rows.push(r);
                } else {
                    var created = $('<tr><td/></tr>').addClass(k);
                    $('td', created).addClass(k).html(r)[0].colSpan = _fnVisbleColumns(ctx);
                    rows.push(created[0]);
                }
            };
            addRow(data, klass);
            if (row._details) {
                row._details.detach();
            }
            row._details = $(rows);
            if (row._detailsShow) {
                row._details.insertAfter(row.nTr);
            }
        };
        var __details_remove = function(api, idx) {
            var ctx = api.context;
            if (ctx.length) {
                var row = ctx[0].aoData[idx !== undefined ? idx : api[0]];
                if (row && row._details) {
                    row._details.remove();
                    row._detailsShow = undefined;
                    row._details = undefined;
                }
            }
        };
        var __details_display = function(api, show) {
            var ctx = api.context;
            if (ctx.length && api.length) {
                var row = ctx[0].aoData[api[0]];
                if (row._details) {
                    row._detailsShow = show;
                    if (show) {
                        row._details.insertAfter(row.nTr);
                    } else {
                        row._details.detach();
                    }
                    __details_events(ctx[0]);
                }
            }
        };
        var __details_events = function(settings) {
            var api = new _Api(settings);
            var namespace = '.dt.DT_details';
            var drawEvent = 'draw' + namespace;
            var colvisEvent = 'column-visibility' + namespace;
            var destroyEvent = 'destroy' + namespace;
            var data = settings.aoData;
            api.off(drawEvent + ' ' + colvisEvent + ' ' + destroyEvent);
            if (_pluck(data, '_details').length > 0) {
                api.on(drawEvent, function(e, ctx) {
                    if (settings !== ctx) {
                        return;
                    }
                    api.rows({
                        page: 'current'
                    }).eq(0).each(function(idx) {
                        var row = data[idx];
                        if (row._detailsShow) {
                            row._details.insertAfter(row.nTr);
                        }
                    });
                });
                api.on(colvisEvent, function(e, ctx, idx, vis) {
                    if (settings !== ctx) {
                        return;
                    }
                    var row, visible = _fnVisbleColumns(ctx);
                    for (var i = 0, ien = data.length; i < ien; i++) {
                        row = data[i];
                        if (row._details) {
                            row._details.children('td[colspan]').attr('colspan', visible);
                        }
                    }
                });
                api.on(destroyEvent, function(e, ctx) {
                    if (settings !== ctx) {
                        return;
                    }
                    for (var i = 0, ien = data.length; i < ien; i++) {
                        if (data[i]._details) {
                            __details_remove(api, i);
                        }
                    }
                });
            }
        };
        var _emp = '';
        var _child_obj = _emp + 'row().child';
        var _child_mth = _child_obj + '()';
        _api_register(_child_mth, function(data, klass) {
            var ctx = this.context;
            if (data === undefined) {
                return ctx.length && this.length ? ctx[0].aoData[this[0]]._details : undefined;
            } else if (data === true) {
                this.child.show();
            } else if (data === false) {
                __details_remove(this);
            } else if (ctx.length && this.length) {
                __details_add(ctx[0], ctx[0].aoData[this[0]], data, klass);
            }
            return this;
        });
        _api_register([_child_obj + '.show()', _child_mth + '.show()'], function(show) {
            __details_display(this, true);
            return this;
        });
        _api_register([_child_obj + '.hide()', _child_mth + '.hide()'], function() {
            __details_display(this, false);
            return this;
        });
        _api_register([_child_obj + '.remove()', _child_mth + '.remove()'], function() {
            __details_remove(this);
            return this;
        });
        _api_register(_child_obj + '.isShown()', function() {
            var ctx = this.context;
            if (ctx.length && this.length) {
                return ctx[0].aoData[this[0]]._detailsShow || false;
            }
            return false;
        });
        var __re_column_selector = /^([^:]+):(name|visIdx|visible)$/;
        var __columnData = function(settings, column, r1, r2, rows) {
            var a = [];
            for (var row = 0, ien = rows.length; row < ien; row++) {
                a.push(_fnGetCellData(settings, rows[row], column));
            }
            return a;
        };
        var __column_selector = function(settings, selector, opts) {
            var
                columns = settings.aoColumns,
                names = _pluck(columns, 'sName'),
                nodes = _pluck(columns, 'nTh');
            var run = function(s) {
                var selInt = _intVal(s);
                if (s === '') {
                    return _range(columns.length);
                }
                if (selInt !== null) {
                    return [selInt >= 0 ? selInt : columns.length + selInt];
                }
                if (typeof s === 'function') {
                    var rows = _selector_row_indexes(settings, opts);
                    return $.map(columns, function(col, idx) {
                        return s(idx, __columnData(settings, idx, 0, 0, rows), nodes[idx]) ? idx : null;
                    });
                }
                var match = typeof s === 'string' ? s.match(__re_column_selector) : '';
                if (match) {
                    switch (match[2]) {
                        case 'visIdx':
                        case 'visible':
                            var idx = parseInt(match[1], 10);
                            if (idx < 0) {
                                var visColumns = $.map(columns, function(col, i) {
                                    return col.bVisible ? i : null;
                                });
                                return [visColumns[visColumns.length + idx]];
                            }
                            return [_fnVisibleToColumnIndex(settings, idx)];
                        case 'name':
                            return $.map(names, function(name, i) {
                                return name === match[1] ? i : null;
                            });
                        default:
                            return [];
                    }
                }
                if (s.nodeName && s._DT_CellIndex) {
                    return [s._DT_CellIndex.column];
                }
                var jqResult = $(nodes).filter(s).map(function() {
                    return $.inArray(this, nodes);
                }).toArray();
                if (jqResult.length || !s.nodeName) {
                    return jqResult;
                }
                var host = $(s).closest('*[data-dt-column]');
                return host.length ? [host.data('dt-column')] : [];
            };
            return _selector_run('column', selector, run, settings, opts);
        };
        var __setColumnVis = function(settings, column, vis) {
            var
                cols = settings.aoColumns,
                col = cols[column],
                data = settings.aoData,
                row, cells, i, ien, tr;
            if (vis === undefined) {
                return col.bVisible;
            }
            if (col.bVisible === vis) {
                return;
            }
            if (vis) {
                var insertBefore = $.inArray(true, _pluck(cols, 'bVisible'), column + 1);
                for (i = 0, ien = data.length; i < ien; i++) {
                    tr = data[i].nTr;
                    cells = data[i].anCells;
                    if (tr) {
                        tr.insertBefore(cells[column], cells[insertBefore] || null);
                    }
                }
            } else {
                $(_pluck(settings.aoData, 'anCells', column)).detach();
            }
            col.bVisible = vis;
            _fnDrawHead(settings, settings.aoHeader);
            _fnDrawHead(settings, settings.aoFooter);
            _fnSaveState(settings);
        };
        _api_register('columns()', function(selector, opts) {
            if (selector === undefined) {
                selector = '';
            } else if ($.isPlainObject(selector)) {
                opts = selector;
                selector = '';
            }
            opts = _selector_opts(opts);
            var inst = this.iterator('table', function(settings) {
                return __column_selector(settings, selector, opts);
            }, 1);
            inst.selector.cols = selector;
            inst.selector.opts = opts;
            return inst;
        });
        _api_registerPlural('columns().header()', 'column().header()', function(selector, opts) {
            return this.iterator('column', function(settings, column) {
                return settings.aoColumns[column].nTh;
            }, 1);
        });
        _api_registerPlural('columns().footer()', 'column().footer()', function(selector, opts) {
            return this.iterator('column', function(settings, column) {
                return settings.aoColumns[column].nTf;
            }, 1);
        });
        _api_registerPlural('columns().data()', 'column().data()', function() {
            return this.iterator('column-rows', __columnData, 1);
        });
        _api_registerPlural('columns().dataSrc()', 'column().dataSrc()', function() {
            return this.iterator('column', function(settings, column) {
                return settings.aoColumns[column].mData;
            }, 1);
        });
        _api_registerPlural('columns().cache()', 'column().cache()', function(type) {
            return this.iterator('column-rows', function(settings, column, i, j, rows) {
                return _pluck_order(settings.aoData, rows, type === 'search' ? '_aFilterData' : '_aSortData', column);
            }, 1);
        });
        _api_registerPlural('columns().nodes()', 'column().nodes()', function() {
            return this.iterator('column-rows', function(settings, column, i, j, rows) {
                return _pluck_order(settings.aoData, rows, 'anCells', column);
            }, 1);
        });
        _api_registerPlural('columns().visible()', 'column().visible()', function(vis, calc) {
            var ret = this.iterator('column', function(settings, column) {
                if (vis === undefined) {
                    return settings.aoColumns[column].bVisible;
                }
                __setColumnVis(settings, column, vis);
            });
            if (vis !== undefined) {
                this.iterator('column', function(settings, column) {
                    _fnCallbackFire(settings, null, 'column-visibility', [settings, column, vis, calc]);
                });
                if (calc === undefined || calc) {
                    this.columns.adjust();
                }
            }
            return ret;
        });
        _api_registerPlural('columns().indexes()', 'column().index()', function(type) {
            return this.iterator('column', function(settings, column) {
                return type === 'visible' ? _fnColumnIndexToVisible(settings, column) : column;
            }, 1);
        });
        _api_register('columns.adjust()', function() {
            return this.iterator('table', function(settings) {
                _fnAdjustColumnSizing(settings);
            }, 1);
        });
        _api_register('column.index()', function(type, idx) {
            if (this.context.length !== 0) {
                var ctx = this.context[0];
                if (type === 'fromVisible' || type === 'toData') {
                    return _fnVisibleToColumnIndex(ctx, idx);
                } else if (type === 'fromData' || type === 'toVisible') {
                    return _fnColumnIndexToVisible(ctx, idx);
                }
            }
        });
        _api_register('column()', function(selector, opts) {
            return _selector_first(this.columns(selector, opts));
        });
        var __cell_selector = function(settings, selector, opts) {
            var data = settings.aoData;
            var rows = _selector_row_indexes(settings, opts);
            var cells = _removeEmpty(_pluck_order(data, rows, 'anCells'));
            var allCells = $([].concat.apply([], cells));
            var row;
            var columns = settings.aoColumns.length;
            var a, i, ien, j, o, host;
            var run = function(s) {
                var fnSelector = typeof s === 'function';
                if (s === null || s === undefined || fnSelector) {
                    a = [];
                    for (i = 0, ien = rows.length; i < ien; i++) {
                        row = rows[i];
                        for (j = 0; j < columns; j++) {
                            o = {
                                row: row,
                                column: j
                            };
                            if (fnSelector) {
                                host = data[row];
                                if (s(o, _fnGetCellData(settings, row, j), host.anCells ? host.anCells[j] : null)) {
                                    a.push(o);
                                }
                            } else {
                                a.push(o);
                            }
                        }
                    }
                    return a;
                }
                if ($.isPlainObject(s)) {
                    return [s];
                }
                var jqResult = allCells.filter(s).map(function(i, el) {
                    return {
                        row: el._DT_CellIndex.row,
                        column: el._DT_CellIndex.column
                    };
                }).toArray();
                if (jqResult.length || !s.nodeName) {
                    return jqResult;
                }
                host = $(s).closest('*[data-dt-row]');
                return host.length ? [{
                    row: host.data('dt-row'),
                    column: host.data('dt-column')
                }] : [];
            };
            return _selector_run('cell', selector, run, settings, opts);
        };
        _api_register('cells()', function(rowSelector, columnSelector, opts) {
            if ($.isPlainObject(rowSelector)) {
                if (rowSelector.row === undefined) {
                    opts = rowSelector;
                    rowSelector = null;
                } else {
                    opts = columnSelector;
                    columnSelector = null;
                }
            }
            if ($.isPlainObject(columnSelector)) {
                opts = columnSelector;
                columnSelector = null;
            }
            if (columnSelector === null || columnSelector === undefined) {
                return this.iterator('table', function(settings) {
                    return __cell_selector(settings, rowSelector, _selector_opts(opts));
                });
            }
            var columns = this.columns(columnSelector, opts);
            var rows = this.rows(rowSelector, opts);
            var a, i, ien, j, jen;
            var cells = this.iterator('table', function(settings, idx) {
                a = [];
                for (i = 0, ien = rows[idx].length; i < ien; i++) {
                    for (j = 0, jen = columns[idx].length; j < jen; j++) {
                        a.push({
                            row: rows[idx][i],
                            column: columns[idx][j]
                        });
                    }
                }
                return a;
            }, 1);
            $.extend(cells.selector, {
                cols: columnSelector,
                rows: rowSelector,
                opts: opts
            });
            return cells;
        });
        _api_registerPlural('cells().nodes()', 'cell().node()', function() {
            return this.iterator('cell', function(settings, row, column) {
                var data = settings.aoData[row];
                return data && data.anCells ? data.anCells[column] : undefined;
            }, 1);
        });
        _api_register('cells().data()', function() {
            return this.iterator('cell', function(settings, row, column) {
                return _fnGetCellData(settings, row, column);
            }, 1);
        });
        _api_registerPlural('cells().cache()', 'cell().cache()', function(type) {
            type = type === 'search' ? '_aFilterData' : '_aSortData';
            return this.iterator('cell', function(settings, row, column) {
                return settings.aoData[row][type][column];
            }, 1);
        });
        _api_registerPlural('cells().render()', 'cell().render()', function(type) {
            return this.iterator('cell', function(settings, row, column) {
                return _fnGetCellData(settings, row, column, type);
            }, 1);
        });
        _api_registerPlural('cells().indexes()', 'cell().index()', function() {
            return this.iterator('cell', function(settings, row, column) {
                return {
                    row: row,
                    column: column,
                    columnVisible: _fnColumnIndexToVisible(settings, column)
                };
            }, 1);
        });
        _api_registerPlural('cells().invalidate()', 'cell().invalidate()', function(src) {
            return this.iterator('cell', function(settings, row, column) {
                _fnInvalidate(settings, row, src, column);
            });
        });
        _api_register('cell()', function(rowSelector, columnSelector, opts) {
            return _selector_first(this.cells(rowSelector, columnSelector, opts));
        });
        _api_register('cell().data()', function(data) {
            var ctx = this.context;
            var cell = this[0];
            if (data === undefined) {
                return ctx.length && cell.length ? _fnGetCellData(ctx[0], cell[0].row, cell[0].column) : undefined;
            }
            _fnSetCellData(ctx[0], cell[0].row, cell[0].column, data);
            _fnInvalidate(ctx[0], cell[0].row, 'data', cell[0].column);
            return this;
        });
        _api_register('order()', function(order, dir) {
            var ctx = this.context;
            if (order === undefined) {
                return ctx.length !== 0 ? ctx[0].aaSorting : undefined;
            }
            if (typeof order === 'number') {
                order = [
                    [order, dir]
                ];
            } else if (order.length && !$.isArray(order[0])) {
                order = Array.prototype.slice.call(arguments);
            }
            return this.iterator('table', function(settings) {
                settings.aaSorting = order.slice();
            });
        });
        _api_register('order.listener()', function(node, column, callback) {
            return this.iterator('table', function(settings) {
                _fnSortAttachListener(settings, node, column, callback);
            });
        });
        _api_register('order.fixed()', function(set) {
            if (!set) {
                var ctx = this.context;
                var fixed = ctx.length ? ctx[0].aaSortingFixed : undefined;
                return $.isArray(fixed) ? {
                    pre: fixed
                } : fixed;
            }
            return this.iterator('table', function(settings) {
                settings.aaSortingFixed = $.extend(true, {}, set);
            });
        });
        _api_register(['columns().order()', 'column().order()'], function(dir) {
            var that = this;
            return this.iterator('table', function(settings, i) {
                var sort = [];
                $.each(that[i], function(j, col) {
                    sort.push([col, dir]);
                });
                settings.aaSorting = sort;
            });
        });
        _api_register('search()', function(input, regex, smart, caseInsen) {
            var ctx = this.context;
            if (input === undefined) {
                return ctx.length !== 0 ? ctx[0].oPreviousSearch.sSearch : undefined;
            }
            return this.iterator('table', function(settings) {
                if (!settings.oFeatures.bFilter) {
                    return;
                }
                _fnFilterComplete(settings, $.extend({}, settings.oPreviousSearch, {
                    "sSearch": input + "",
                    "bRegex": regex === null ? false : regex,
                    "bSmart": smart === null ? true : smart,
                    "bCaseInsensitive": caseInsen === null ? true : caseInsen
                }), 1);
            });
        });
        _api_registerPlural('columns().search()', 'column().search()', function(input, regex, smart, caseInsen) {
            return this.iterator('column', function(settings, column) {
                var preSearch = settings.aoPreSearchCols;
                if (input === undefined) {
                    return preSearch[column].sSearch;
                }
                if (!settings.oFeatures.bFilter) {
                    return;
                }
                $.extend(preSearch[column], {
                    "sSearch": input + "",
                    "bRegex": regex === null ? false : regex,
                    "bSmart": smart === null ? true : smart,
                    "bCaseInsensitive": caseInsen === null ? true : caseInsen
                });
                _fnFilterComplete(settings, settings.oPreviousSearch, 1);
            });
        });
        _api_register('state()', function() {
            return this.context.length ? this.context[0].oSavedState : null;
        });
        _api_register('state.clear()', function() {
            return this.iterator('table', function(settings) {
                settings.fnStateSaveCallback.call(settings.oInstance, settings, {});
            });
        });
        _api_register('state.loaded()', function() {
            return this.context.length ? this.context[0].oLoadedState : null;
        });
        _api_register('state.save()', function() {
            return this.iterator('table', function(settings) {
                _fnSaveState(settings);
            });
        });
        DataTable.versionCheck = DataTable.fnVersionCheck = function(version) {
            var aThis = DataTable.version.split('.');
            var aThat = version.split('.');
            var iThis, iThat;
            for (var i = 0, iLen = aThat.length; i < iLen; i++) {
                iThis = parseInt(aThis[i], 10) || 0;
                iThat = parseInt(aThat[i], 10) || 0;
                if (iThis === iThat) {
                    continue;
                }
                return iThis > iThat;
            }
            return true;
        };
        DataTable.isDataTable = DataTable.fnIsDataTable = function(table) {
            var t = $(table).get(0);
            var is = false;
            if (table instanceof DataTable.Api) {
                return true;
            }
            $.each(DataTable.settings, function(i, o) {
                var head = o.nScrollHead ? $('table', o.nScrollHead)[0] : null;
                var foot = o.nScrollFoot ? $('table', o.nScrollFoot)[0] : null;
                if (o.nTable === t || head === t || foot === t) {
                    is = true;
                }
            });
            return is;
        };
        DataTable.tables = DataTable.fnTables = function(visible) {
            var api = false;
            if ($.isPlainObject(visible)) {
                api = visible.api;
                visible = visible.visible;
            }
            var a = $.map(DataTable.settings, function(o) {
                if (!visible || (visible && $(o.nTable).is(':visible'))) {
                    return o.nTable;
                }
            });
            return api ? new _Api(a) : a;
        };
        DataTable.camelToHungarian = _fnCamelToHungarian;
        _api_register('$()', function(selector, opts) {
            var
                rows = this.rows(opts).nodes(),
                jqRows = $(rows);
            return $([].concat(jqRows.filter(selector).toArray(), jqRows.find(selector).toArray()));
        });
        $.each(['on', 'one', 'off'], function(i, key) {
            _api_register(key + '()', function() {
                var args = Array.prototype.slice.call(arguments);
                args[0] = $.map(args[0].split(/\s/), function(e) {
                    return !e.match(/\.dt\b/) ? e + '.dt' : e;
                }).join(' ');
                var inst = $(this.tables().nodes());
                inst[key].apply(inst, args);
                return this;
            });
        });
        _api_register('clear()', function() {
            return this.iterator('table', function(settings) {
                _fnClearTable(settings);
            });
        });
        _api_register('settings()', function() {
            return new _Api(this.context, this.context);
        });
        _api_register('init()', function() {
            var ctx = this.context;
            return ctx.length ? ctx[0].oInit : null;
        });
        _api_register('data()', function() {
            return this.iterator('table', function(settings) {
                return _pluck(settings.aoData, '_aData');
            }).flatten();
        });
        _api_register('destroy()', function(remove) {
            remove = remove || false;
            return this.iterator('table', function(settings) {
                var orig = settings.nTableWrapper.parentNode;
                var classes = settings.oClasses;
                var table = settings.nTable;
                var tbody = settings.nTBody;
                var thead = settings.nTHead;
                var tfoot = settings.nTFoot;
                var jqTable = $(table);
                var jqTbody = $(tbody);
                var jqWrapper = $(settings.nTableWrapper);
                var rows = $.map(settings.aoData, function(r) {
                    return r.nTr;
                });
                var i, ien;
                settings.bDestroying = true;
                _fnCallbackFire(settings, "aoDestroyCallback", "destroy", [settings]);
                if (!remove) {
                    new _Api(settings).columns().visible(true);
                }
                jqWrapper.off('.DT').find(':not(tbody *)').off('.DT');
                $(window).off('.DT-' + settings.sInstance);
                if (table != thead.parentNode) {
                    jqTable.children('thead').detach();
                    jqTable.append(thead);
                }
                if (tfoot && table != tfoot.parentNode) {
                    jqTable.children('tfoot').detach();
                    jqTable.append(tfoot);
                }
                settings.aaSorting = [];
                settings.aaSortingFixed = [];
                _fnSortingClasses(settings);
                $(rows).removeClass(settings.asStripeClasses.join(' '));
                $('th, td', thead).removeClass(classes.sSortable + ' ' + classes.sSortableAsc + ' ' + classes.sSortableDesc + ' ' + classes.sSortableNone);
                if (settings.bJUI) {
                    $('th span.' + classes.sSortIcon + ', td span.' + classes.sSortIcon, thead).detach();
                    $('th, td', thead).each(function() {
                        var wrapper = $('div.' + classes.sSortJUIWrapper, this);
                        $(this).append(wrapper.contents());
                        wrapper.detach();
                    });
                }
                jqTbody.children().detach();
                jqTbody.append(rows);
                var removedMethod = remove ? 'remove' : 'detach';
                jqTable[removedMethod]();
                jqWrapper[removedMethod]();
                if (!remove && orig) {
                    orig.insertBefore(table, settings.nTableReinsertBefore);
                    jqTable.css('width', settings.sDestroyWidth).removeClass(classes.sTable);
                    ien = settings.asDestroyStripes.length;
                    if (ien) {
                        jqTbody.children().each(function(i) {
                            $(this).addClass(settings.asDestroyStripes[i % ien]);
                        });
                    }
                }
                var idx = $.inArray(settings, DataTable.settings);
                if (idx !== -1) {
                    DataTable.settings.splice(idx, 1);
                }
            });
        });
        $.each(['column', 'row', 'cell'], function(i, type) {
            _api_register(type + 's().every()', function(fn) {
                var opts = this.selector.opts;
                var api = this;
                return this.iterator(type, function(settings, arg1, arg2, arg3, arg4) {
                    fn.call(api[type](arg1, type === 'cell' ? arg2 : opts, type === 'cell' ? opts : undefined), arg1, arg2, arg3, arg4);
                });
            });
        });
        _api_register('i18n()', function(token, def, plural) {
            var ctx = this.context[0];
            var resolved = _fnGetObjectDataFn(token)(ctx.oLanguage);
            if (resolved === undefined) {
                resolved = def;
            }
            if (plural !== undefined && $.isPlainObject(resolved)) {
                resolved = resolved[plural] !== undefined ? resolved[plural] : resolved._;
            }
            return resolved.replace('%d', plural);
        });
        DataTable.version = "1.10.13";
        DataTable.settings = [];
        DataTable.models = {};
        DataTable.models.oSearch = {
            "bCaseInsensitive": true,
            "sSearch": "",
            "bRegex": false,
            "bSmart": true
        };
        DataTable.models.oRow = {
            "nTr": null,
            "anCells": null,
            "_aData": [],
            "_aSortData": null,
            "_aFilterData": null,
            "_sFilterRow": null,
            "_sRowStripe": "",
            "src": null,
            "idx": -1
        };
        DataTable.models.oColumn = {
            "idx": null,
            "aDataSort": null,
            "asSorting": null,
            "bSearchable": null,
            "bSortable": null,
            "bVisible": null,
            "_sManualType": null,
            "_bAttrSrc": false,
            "fnCreatedCell": null,
            "fnGetData": null,
            "fnSetData": null,
            "mData": null,
            "mRender": null,
            "nTh": null,
            "nTf": null,
            "sClass": null,
            "sContentPadding": null,
            "sDefaultContent": null,
            "sName": null,
            "sSortDataType": 'std',
            "sSortingClass": null,
            "sSortingClassJUI": null,
            "sTitle": null,
            "sType": null,
            "sWidth": null,
            "sWidthOrig": null
        };
        DataTable.defaults = {
            "aaData": null,
            "aaSorting": [
                [0, 'asc']
            ],
            "aaSortingFixed": [],
            "ajax": null,
            "aLengthMenu": [10, 25, 50, 100],
            "aoColumns": null,
            "aoColumnDefs": null,
            "aoSearchCols": [],
            "asStripeClasses": null,
            "bAutoWidth": true,
            "bDeferRender": false,
            "bDestroy": false,
            "bFilter": true,
            "bInfo": true,
            "bJQueryUI": false,
            "bLengthChange": true,
            "bPaginate": true,
            "bProcessing": false,
            "bRetrieve": false,
            "bScrollCollapse": false,
            "bServerSide": false,
            "bSort": true,
            "bSortMulti": true,
            "bSortCellsTop": false,
            "bSortClasses": true,
            "bStateSave": false,
            "fnCreatedRow": null,
            "fnDrawCallback": null,
            "fnFooterCallback": null,
            "fnFormatNumber": function(toFormat) {
                return toFormat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, this.oLanguage.sThousands);
            },
            "fnHeaderCallback": null,
            "fnInfoCallback": null,
            "fnInitComplete": null,
            "fnPreDrawCallback": null,
            "fnRowCallback": null,
            "fnServerData": null,
            "fnServerParams": null,
            "fnStateLoadCallback": function(settings) {
                try {
                    return JSON.parse((settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem('DataTables_' + settings.sInstance + '_' + location.pathname));
                } catch (e) {}
            },
            "fnStateLoadParams": null,
            "fnStateLoaded": null,
            "fnStateSaveCallback": function(settings, data) {
                try {
                    (settings.iStateDuration === -1 ? sessionStorage : localStorage).setItem('DataTables_' + settings.sInstance + '_' + location.pathname, JSON.stringify(data));
                } catch (e) {}
            },
            "fnStateSaveParams": null,
            "iStateDuration": 7200,
            "iDeferLoading": null,
            "iDisplayLength": 10,
            "iDisplayStart": 0,
            "iTabIndex": 0,
            "oClasses": {},
            "oLanguage": {
                "oAria": {
                    "sSortAscending": ": activate to sort column ascending",
                    "sSortDescending": ": activate to sort column descending"
                },
                "oPaginate": {
                    "sFirst": "First",
                    "sLast": "Last",
                    "sNext": "Next",
                    "sPrevious": "Previous"
                },
                "sEmptyTable": "No data available in table",
                "sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",
                "sInfoEmpty": "Showing 0 to 0 of 0 entries",
                "sInfoFiltered": "(filtered from _MAX_ total entries)",
                "sInfoPostFix": "",
                "sDecimal": "",
                "sThousands": ",",
                "sLengthMenu": "Show _MENU_ entries",
                "sLoadingRecords": "Loading...",
                "sProcessing": "Processing...",
                "sSearch": "Search:",
                "sSearchPlaceholder": "",
                "sUrl": "",
                "sZeroRecords": "No matching records found"
            },
            "oSearch": $.extend({}, DataTable.models.oSearch),
            "sAjaxDataProp": "data",
            "sAjaxSource": null,
            "sDom": "lfrtip",
            "searchDelay": null,
            "sPaginationType": "simple_numbers",
            "sScrollX": "",
            "sScrollXInner": "",
            "sScrollY": "",
            "sServerMethod": "GET",
            "renderer": null,
            "rowId": "DT_RowId"
        };
        _fnHungarianMap(DataTable.defaults);
        DataTable.defaults.column = {
            "aDataSort": null,
            "iDataSort": -1,
            "asSorting": ['asc', 'desc'],
            "bSearchable": true,
            "bSortable": true,
            "bVisible": true,
            "fnCreatedCell": null,
            "mData": null,
            "mRender": null,
            "sCellType": "td",
            "sClass": "",
            "sContentPadding": "",
            "sDefaultContent": null,
            "sName": "",
            "sSortDataType": "std",
            "sTitle": null,
            "sType": null,
            "sWidth": null
        };
        _fnHungarianMap(DataTable.defaults.column);
        DataTable.models.oSettings = {
            "oFeatures": {
                "bAutoWidth": null,
                "bDeferRender": null,
                "bFilter": null,
                "bInfo": null,
                "bLengthChange": null,
                "bPaginate": null,
                "bProcessing": null,
                "bServerSide": null,
                "bSort": null,
                "bSortMulti": null,
                "bSortClasses": null,
                "bStateSave": null
            },
            "oScroll": {
                "bCollapse": null,
                "iBarWidth": 0,
                "sX": null,
                "sXInner": null,
                "sY": null
            },
            "oLanguage": {
                "fnInfoCallback": null
            },
            "oBrowser": {
                "bScrollOversize": false,
                "bScrollbarLeft": false,
                "bBounding": false,
                "barWidth": 0
            },
            "ajax": null,
            "aanFeatures": [],
            "aoData": [],
            "aiDisplay": [],
            "aiDisplayMaster": [],
            "aIds": {},
            "aoColumns": [],
            "aoHeader": [],
            "aoFooter": [],
            "oPreviousSearch": {},
            "aoPreSearchCols": [],
            "aaSorting": null,
            "aaSortingFixed": [],
            "asStripeClasses": null,
            "asDestroyStripes": [],
            "sDestroyWidth": 0,
            "aoRowCallback": [],
            "aoHeaderCallback": [],
            "aoFooterCallback": [],
            "aoDrawCallback": [],
            "aoRowCreatedCallback": [],
            "aoPreDrawCallback": [],
            "aoInitComplete": [],
            "aoStateSaveParams": [],
            "aoStateLoadParams": [],
            "aoStateLoaded": [],
            "sTableId": "",
            "nTable": null,
            "nTHead": null,
            "nTFoot": null,
            "nTBody": null,
            "nTableWrapper": null,
            "bDeferLoading": false,
            "bInitialised": false,
            "aoOpenRows": [],
            "sDom": null,
            "searchDelay": null,
            "sPaginationType": "two_button",
            "iStateDuration": 0,
            "aoStateSave": [],
            "aoStateLoad": [],
            "oSavedState": null,
            "oLoadedState": null,
            "sAjaxSource": null,
            "sAjaxDataProp": null,
            "bAjaxDataGet": true,
            "jqXHR": null,
            "json": undefined,
            "oAjaxData": undefined,
            "fnServerData": null,
            "aoServerParams": [],
            "sServerMethod": null,
            "fnFormatNumber": null,
            "aLengthMenu": null,
            "iDraw": 0,
            "bDrawing": false,
            "iDrawError": -1,
            "_iDisplayLength": 10,
            "_iDisplayStart": 0,
            "_iRecordsTotal": 0,
            "_iRecordsDisplay": 0,
            "bJUI": null,
            "oClasses": {},
            "bFiltered": false,
            "bSorted": false,
            "bSortCellsTop": null,
            "oInit": null,
            "aoDestroyCallback": [],
            "fnRecordsTotal": function() {
                return _fnDataSource(this) == 'ssp' ? this._iRecordsTotal * 1 : this.aiDisplayMaster.length;
            },
            "fnRecordsDisplay": function() {
                return _fnDataSource(this) == 'ssp' ? this._iRecordsDisplay * 1 : this.aiDisplay.length;
            },
            "fnDisplayEnd": function() {
                var
                    len = this._iDisplayLength,
                    start = this._iDisplayStart,
                    calc = start + len,
                    records = this.aiDisplay.length,
                    features = this.oFeatures,
                    paginate = features.bPaginate;
                if (features.bServerSide) {
                    return paginate === false || len === -1 ? start + records : Math.min(start + len, this._iRecordsDisplay);
                } else {
                    return !paginate || calc > records || len === -1 ? records : calc;
                }
            },
            "oInstance": null,
            "sInstance": null,
            "iTabIndex": 0,
            "nScrollHead": null,
            "nScrollFoot": null,
            "aLastSort": [],
            "oPlugins": {},
            "rowIdFn": null,
            "rowId": null
        };
        DataTable.ext = _ext = {
            buttons: {},
            classes: {},
            builder: "-source-",
            errMode: "alert",
            feature: [],
            search: [],
            selector: {
                cell: [],
                column: [],
                row: []
            },
            internal: {},
            legacy: {
                ajax: null
            },
            pager: {},
            renderer: {
                pageButton: {},
                header: {}
            },
            order: {},
            type: {
                detect: [],
                search: {},
                order: {}
            },
            _unique: 0,
            fnVersionCheck: DataTable.fnVersionCheck,
            iApiIndex: 0,
            oJUIClasses: {},
            sVersion: DataTable.version
        };
        $.extend(_ext, {
            afnFiltering: _ext.search,
            aTypes: _ext.type.detect,
            ofnSearch: _ext.type.search,
            oSort: _ext.type.order,
            afnSortData: _ext.order,
            aoFeatures: _ext.feature,
            oApi: _ext.internal,
            oStdClasses: _ext.classes,
            oPagination: _ext.pager
        });
        $.extend(DataTable.ext.classes, {
            "sTable": "dataTable",
            "sNoFooter": "no-footer",
            "sPageButton": "paginate_button",
            "sPageButtonActive": "current",
            "sPageButtonDisabled": "disabled",
            "sStripeOdd": "odd",
            "sStripeEven": "even",
            "sRowEmpty": "dataTables_empty",
            "sWrapper": "dataTables_wrapper",
            "sFilter": "dataTables_filter",
            "sInfo": "dataTables_info",
            "sPaging": "dataTables_paginate paging_",
            "sLength": "dataTables_length",
            "sProcessing": "dataTables_processing",
            "sSortAsc": "sorting_asc",
            "sSortDesc": "sorting_desc",
            "sSortable": "sorting",
            "sSortableAsc": "sorting_asc_disabled",
            "sSortableDesc": "sorting_desc_disabled",
            "sSortableNone": "sorting_disabled",
            "sSortColumn": "sorting_",
            "sFilterInput": "",
            "sLengthSelect": "",
            "sScrollWrapper": "dataTables_scroll",
            "sScrollHead": "dataTables_scrollHead",
            "sScrollHeadInner": "dataTables_scrollHeadInner",
            "sScrollBody": "dataTables_scrollBody",
            "sScrollFoot": "dataTables_scrollFoot",
            "sScrollFootInner": "dataTables_scrollFootInner",
            "sHeaderTH": "",
            "sFooterTH": "",
            "sSortJUIAsc": "",
            "sSortJUIDesc": "",
            "sSortJUI": "",
            "sSortJUIAscAllowed": "",
            "sSortJUIDescAllowed": "",
            "sSortJUIWrapper": "",
            "sSortIcon": "",
            "sJUIHeader": "",
            "sJUIFooter": ""
        });
        (function() {
            var _empty = '';
            _empty = '';
            var _stateDefault = _empty + 'ui-state-default';
            var _sortIcon = _empty + 'css_right ui-icon ui-icon-';
            var _headerFooter = _empty + 'fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix';
            $.extend(DataTable.ext.oJUIClasses, DataTable.ext.classes, {
                "sPageButton": "fg-button ui-button " + _stateDefault,
                "sPageButtonActive": "ui-state-disabled",
                "sPageButtonDisabled": "ui-state-disabled",
                "sPaging": "dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi " + "ui-buttonset-multi paging_",
                "sSortAsc": _stateDefault + " sorting_asc",
                "sSortDesc": _stateDefault + " sorting_desc",
                "sSortable": _stateDefault + " sorting",
                "sSortableAsc": _stateDefault + " sorting_asc_disabled",
                "sSortableDesc": _stateDefault + " sorting_desc_disabled",
                "sSortableNone": _stateDefault + " sorting_disabled",
                "sSortJUIAsc": _sortIcon + "triangle-1-n",
                "sSortJUIDesc": _sortIcon + "triangle-1-s",
                "sSortJUI": _sortIcon + "carat-2-n-s",
                "sSortJUIAscAllowed": _sortIcon + "carat-1-n",
                "sSortJUIDescAllowed": _sortIcon + "carat-1-s",
                "sSortJUIWrapper": "DataTables_sort_wrapper",
                "sSortIcon": "DataTables_sort_icon",
                "sScrollHead": "dataTables_scrollHead " + _stateDefault,
                "sScrollFoot": "dataTables_scrollFoot " + _stateDefault,
                "sHeaderTH": _stateDefault,
                "sFooterTH": _stateDefault,
                "sJUIHeader": _headerFooter + " ui-corner-tl ui-corner-tr",
                "sJUIFooter": _headerFooter + " ui-corner-bl ui-corner-br"
            });
        }());
        var extPagination = DataTable.ext.pager;

        function _numbers(page, pages) {
            var
                numbers = [],
                buttons = extPagination.numbers_length,
                half = Math.floor(buttons / 2),
                i = 1;
            if (pages <= buttons) {
                numbers = _range(0, pages);
            } else if (page <= half) {
                numbers = _range(0, buttons - 2);
                numbers.push('ellipsis');
                numbers.push(pages - 1);
            } else if (page >= pages - 1 - half) {
                numbers = _range(pages - (buttons - 2), pages);
                numbers.splice(0, 0, 'ellipsis');
                numbers.splice(0, 0, 0);
            } else {
                numbers = _range(page - half + 2, page + half - 1);
                numbers.push('ellipsis');
                numbers.push(pages - 1);
                numbers.splice(0, 0, 'ellipsis');
                numbers.splice(0, 0, 0);
            }
            numbers.DT_el = 'span';
            return numbers;
        }
        $.extend(extPagination, {
            simple: function(page, pages) {
                return ['previous', 'next'];
            },
            full: function(page, pages) {
                return ['first', 'previous', 'next', 'last'];
            },
            numbers: function(page, pages) {
                return [_numbers(page, pages)];
            },
            simple_numbers: function(page, pages) {
                return ['previous', _numbers(page, pages), 'next'];
            },
            full_numbers: function(page, pages) {
                return ['first', 'previous', _numbers(page, pages), 'next', 'last'];
            },
            first_last_numbers: function(page, pages) {
                return ['first', _numbers(page, pages), 'last'];
            },
            _numbers: _numbers,
            numbers_length: 7
        });
        $.extend(true, DataTable.ext.renderer, {
            pageButton: {
                _: function(settings, host, idx, buttons, page, pages) {
                    var classes = settings.oClasses;
                    var lang = settings.oLanguage.oPaginate;
                    var aria = settings.oLanguage.oAria.paginate || {};
                    var btnDisplay, btnClass, counter = 0;
                    var attach = function(container, buttons) {
                        var i, ien, node, button;
                        var clickHandler = function(e) {
                            _fnPageChange(settings, e.data.action, true);
                        };
                        for (i = 0, ien = buttons.length; i < ien; i++) {
                            button = buttons[i];
                            if ($.isArray(button)) {
                                var inner = $('<' + (button.DT_el || 'div') + '/>').appendTo(container);
                                attach(inner, button);
                            } else {
                                btnDisplay = null;
                                btnClass = '';
                                switch (button) {
                                    case 'ellipsis':
                                        container.append('<span class="ellipsis">&#x2026;</span>');
                                        break;
                                    case 'first':
                                        btnDisplay = lang.sFirst;
                                        btnClass = button + (page > 0 ? '' : ' ' + classes.sPageButtonDisabled);
                                        break;
                                    case 'previous':
                                        btnDisplay = lang.sPrevious;
                                        btnClass = button + (page > 0 ? '' : ' ' + classes.sPageButtonDisabled);
                                        break;
                                    case 'next':
                                        btnDisplay = lang.sNext;
                                        btnClass = button + (page < pages - 1 ? '' : ' ' + classes.sPageButtonDisabled);
                                        break;
                                    case 'last':
                                        btnDisplay = lang.sLast;
                                        btnClass = button + (page < pages - 1 ? '' : ' ' + classes.sPageButtonDisabled);
                                        break;
                                    default:
                                        btnDisplay = button + 1;
                                        btnClass = page === button ? classes.sPageButtonActive : '';
                                        break;
                                }
                                if (btnDisplay !== null) {
                                    node = $('<a>', {
                                        'class': classes.sPageButton + ' ' + btnClass,
                                        'aria-controls': settings.sTableId,
                                        'aria-label': aria[button],
                                        'data-dt-idx': counter,
                                        'tabindex': settings.iTabIndex,
                                        'id': idx === 0 && typeof button === 'string' ? settings.sTableId + '_' + button : null
                                    }).html(btnDisplay).appendTo(container);
                                    _fnBindAction(node, {
                                        action: button
                                    }, clickHandler);
                                    counter++;
                                }
                            }
                        }
                    };
                    var activeEl;
                    try {
                        activeEl = $(host).find(document.activeElement).data('dt-idx');
                    } catch (e) {}
                    attach($(host).empty(), buttons);
                    if (activeEl !== undefined) {
                        $(host).find('[data-dt-idx=' + activeEl + ']').focus();
                    }
                }
            }
        });
        $.extend(DataTable.ext.type.detect, [function(d, settings) {
            var decimal = settings.oLanguage.sDecimal;
            return _isNumber(d, decimal) ? 'num' + decimal : null;
        }, function(d, settings) {
            if (d && !(d instanceof Date) && !_re_date.test(d)) {
                return null;
            }
            var parsed = Date.parse(d);
            return (parsed !== null && !isNaN(parsed)) || _empty(d) ? 'date' : null;
        }, function(d, settings) {
            var decimal = settings.oLanguage.sDecimal;
            return _isNumber(d, decimal, true) ? 'num-fmt' + decimal : null;
        }, function(d, settings) {
            var decimal = settings.oLanguage.sDecimal;
            return _htmlNumeric(d, decimal) ? 'html-num' + decimal : null;
        }, function(d, settings) {
            var decimal = settings.oLanguage.sDecimal;
            return _htmlNumeric(d, decimal, true) ? 'html-num-fmt' + decimal : null;
        }, function(d, settings) {
            return _empty(d) || (typeof d === 'string' && d.indexOf('<') !== -1) ? 'html' : null;
        }]);
        $.extend(DataTable.ext.type.search, {
            html: function(data) {
                return _empty(data) ? data : typeof data === 'string' ? data.replace(_re_new_lines, " ").replace(_re_html, "") : '';
            },
            string: function(data) {
                return _empty(data) ? data : typeof data === 'string' ? data.replace(_re_new_lines, " ") : data;
            }
        });
        var __numericReplace = function(d, decimalPlace, re1, re2) {
            if (d !== 0 && (!d || d === '-')) {
                return -Infinity;
            }
            if (decimalPlace) {
                d = _numToDecimal(d, decimalPlace);
            }
            if (d.replace) {
                if (re1) {
                    d = d.replace(re1, '');
                }
                if (re2) {
                    d = d.replace(re2, '');
                }
            }
            return d * 1;
        };

        function _addNumericSort(decimalPlace) {
            $.each({
                "num": function(d) {
                    return __numericReplace(d, decimalPlace);
                },
                "num-fmt": function(d) {
                    return __numericReplace(d, decimalPlace, _re_formatted_numeric);
                },
                "html-num": function(d) {
                    return __numericReplace(d, decimalPlace, _re_html);
                },
                "html-num-fmt": function(d) {
                    return __numericReplace(d, decimalPlace, _re_html, _re_formatted_numeric);
                }
            }, function(key, fn) {
                _ext.type.order[key + decimalPlace + '-pre'] = fn;
                if (key.match(/^html\-/)) {
                    _ext.type.search[key + decimalPlace] = _ext.type.search.html;
                }
            });
        }
        $.extend(_ext.type.order, {
            "date-pre": function(d) {
                return Date.parse(d) || -Infinity;
            },
            "html-pre": function(a) {
                return _empty(a) ? '' : a.replace ? a.replace(/<.*?>/g, "").toLowerCase() : a + '';
            },
            "string-pre": function(a) {
                return _empty(a) ? '' : typeof a === 'string' ? a.toLowerCase() : !a.toString ? '' : a.toString();
            },
            "string-asc": function(x, y) {
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            },
            "string-desc": function(x, y) {
                return ((x < y) ? 1 : ((x > y) ? -1 : 0));
            }
        });
        _addNumericSort('');
        $.extend(true, DataTable.ext.renderer, {
            header: {
                _: function(settings, cell, column, classes) {
                    $(settings.nTable).on('order.dt.DT', function(e, ctx, sorting, columns) {
                        if (settings !== ctx) {
                            return;
                        }
                        var colIdx = column.idx;
                        cell.removeClass(column.sSortingClass + ' ' + classes.sSortAsc + ' ' + classes.sSortDesc).addClass(columns[colIdx] == 'asc' ? classes.sSortAsc : columns[colIdx] == 'desc' ? classes.sSortDesc : column.sSortingClass);
                    });
                },
                jqueryui: function(settings, cell, column, classes) {
                    $('<div/>').addClass(classes.sSortJUIWrapper).append(cell.contents()).append($('<span/>').addClass(classes.sSortIcon + ' ' + column.sSortingClassJUI)).appendTo(cell);
                    $(settings.nTable).on('order.dt.DT', function(e, ctx, sorting, columns) {
                        if (settings !== ctx) {
                            return;
                        }
                        var colIdx = column.idx;
                        cell.removeClass(classes.sSortAsc + " " + classes.sSortDesc).addClass(columns[colIdx] == 'asc' ? classes.sSortAsc : columns[colIdx] == 'desc' ? classes.sSortDesc : column.sSortingClass);
                        cell.find('span.' + classes.sSortIcon).removeClass(classes.sSortJUIAsc + " " + classes.sSortJUIDesc + " " + classes.sSortJUI + " " + classes.sSortJUIAscAllowed + " " + classes.sSortJUIDescAllowed).addClass(columns[colIdx] == 'asc' ? classes.sSortJUIAsc : columns[colIdx] == 'desc' ? classes.sSortJUIDesc : column.sSortingClassJUI);
                    });
                }
            }
        });
        var __htmlEscapeEntities = function(d) {
            return typeof d === 'string' ? d.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : d;
        };
        DataTable.render = {
            number: function(thousands, decimal, precision, prefix, postfix) {
                return {
                    display: function(d) {
                        if (typeof d !== 'number' && typeof d !== 'string') {
                            return d;
                        }
                        var negative = d < 0 ? '-' : '';
                        var flo = parseFloat(d);
                        if (isNaN(flo)) {
                            return __htmlEscapeEntities(d);
                        }
                        flo = flo.toFixed(precision);
                        d = Math.abs(flo);
                        var intPart = parseInt(d, 10);
                        var floatPart = precision ? decimal + (d - intPart).toFixed(precision).substring(2) : '';
                        return negative + (prefix || '') + intPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousands) + floatPart + (postfix || '');
                    }
                };
            },
            text: function() {
                return {
                    display: __htmlEscapeEntities
                };
            }
        };

        function _fnExternApiFunc(fn) {
            return function() {
                var args = [_fnSettingsFromNode(this[DataTable.ext.iApiIndex])].concat(Array.prototype.slice.call(arguments));
                return DataTable.ext.internal[fn].apply(this, args);
            };
        }
        $.extend(DataTable.ext.internal, {
            _fnExternApiFunc: _fnExternApiFunc,
            _fnBuildAjax: _fnBuildAjax,
            _fnAjaxUpdate: _fnAjaxUpdate,
            _fnAjaxParameters: _fnAjaxParameters,
            _fnAjaxUpdateDraw: _fnAjaxUpdateDraw,
            _fnAjaxDataSrc: _fnAjaxDataSrc,
            _fnAddColumn: _fnAddColumn,
            _fnColumnOptions: _fnColumnOptions,
            _fnAdjustColumnSizing: _fnAdjustColumnSizing,
            _fnVisibleToColumnIndex: _fnVisibleToColumnIndex,
            _fnColumnIndexToVisible: _fnColumnIndexToVisible,
            _fnVisbleColumns: _fnVisbleColumns,
            _fnGetColumns: _fnGetColumns,
            _fnColumnTypes: _fnColumnTypes,
            _fnApplyColumnDefs: _fnApplyColumnDefs,
            _fnHungarianMap: _fnHungarianMap,
            _fnCamelToHungarian: _fnCamelToHungarian,
            _fnLanguageCompat: _fnLanguageCompat,
            _fnBrowserDetect: _fnBrowserDetect,
            _fnAddData: _fnAddData,
            _fnAddTr: _fnAddTr,
            _fnNodeToDataIndex: _fnNodeToDataIndex,
            _fnNodeToColumnIndex: _fnNodeToColumnIndex,
            _fnGetCellData: _fnGetCellData,
            _fnSetCellData: _fnSetCellData,
            _fnSplitObjNotation: _fnSplitObjNotation,
            _fnGetObjectDataFn: _fnGetObjectDataFn,
            _fnSetObjectDataFn: _fnSetObjectDataFn,
            _fnGetDataMaster: _fnGetDataMaster,
            _fnClearTable: _fnClearTable,
            _fnDeleteIndex: _fnDeleteIndex,
            _fnInvalidate: _fnInvalidate,
            _fnGetRowElements: _fnGetRowElements,
            _fnCreateTr: _fnCreateTr,
            _fnBuildHead: _fnBuildHead,
            _fnDrawHead: _fnDrawHead,
            _fnDraw: _fnDraw,
            _fnReDraw: _fnReDraw,
            _fnAddOptionsHtml: _fnAddOptionsHtml,
            _fnDetectHeader: _fnDetectHeader,
            _fnGetUniqueThs: _fnGetUniqueThs,
            _fnFeatureHtmlFilter: _fnFeatureHtmlFilter,
            _fnFilterComplete: _fnFilterComplete,
            _fnFilterCustom: _fnFilterCustom,
            _fnFilterColumn: _fnFilterColumn,
            _fnFilter: _fnFilter,
            _fnFilterCreateSearch: _fnFilterCreateSearch,
            _fnEscapeRegex: _fnEscapeRegex,
            _fnFilterData: _fnFilterData,
            _fnFeatureHtmlInfo: _fnFeatureHtmlInfo,
            _fnUpdateInfo: _fnUpdateInfo,
            _fnInfoMacros: _fnInfoMacros,
            _fnInitialise: _fnInitialise,
            _fnInitComplete: _fnInitComplete,
            _fnLengthChange: _fnLengthChange,
            _fnFeatureHtmlLength: _fnFeatureHtmlLength,
            _fnFeatureHtmlPaginate: _fnFeatureHtmlPaginate,
            _fnPageChange: _fnPageChange,
            _fnFeatureHtmlProcessing: _fnFeatureHtmlProcessing,
            _fnProcessingDisplay: _fnProcessingDisplay,
            _fnFeatureHtmlTable: _fnFeatureHtmlTable,
            _fnScrollDraw: _fnScrollDraw,
            _fnApplyToChildren: _fnApplyToChildren,
            _fnCalculateColumnWidths: _fnCalculateColumnWidths,
            _fnThrottle: _fnThrottle,
            _fnConvertToWidth: _fnConvertToWidth,
            _fnGetWidestNode: _fnGetWidestNode,
            _fnGetMaxLenString: _fnGetMaxLenString,
            _fnStringToCss: _fnStringToCss,
            _fnSortFlatten: _fnSortFlatten,
            _fnSort: _fnSort,
            _fnSortAria: _fnSortAria,
            _fnSortListener: _fnSortListener,
            _fnSortAttachListener: _fnSortAttachListener,
            _fnSortingClasses: _fnSortingClasses,
            _fnSortData: _fnSortData,
            _fnSaveState: _fnSaveState,
            _fnLoadState: _fnLoadState,
            _fnSettingsFromNode: _fnSettingsFromNode,
            _fnLog: _fnLog,
            _fnMap: _fnMap,
            _fnBindAction: _fnBindAction,
            _fnCallbackReg: _fnCallbackReg,
            _fnCallbackFire: _fnCallbackFire,
            _fnLengthOverflow: _fnLengthOverflow,
            _fnRenderer: _fnRenderer,
            _fnDataSource: _fnDataSource,
            _fnRowAttributes: _fnRowAttributes,
            _fnCalculateEnd: function() {}
        });
        $.fn.dataTable = DataTable;
        DataTable.$ = $;
        $.fn.dataTableSettings = DataTable.settings;
        $.fn.dataTableExt = DataTable.ext;
        $.fn.DataTable = function(opts) {
            return $(this).dataTable(opts).api();
        };
        $.each(DataTable, function(prop, val) {
            $.fn.DataTable[prop] = val;
        });
        return $.fn.dataTable;
    }));
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'datatables.net'], function($) {
            return factory($, window, document);
        });
    } else if (typeof exports === 'object') {
        module.exports = function(root, $) {
            if (!root) {
                root = window;
            }
            if (!$ || !$.fn.dataTable) {
                $ = require('datatables.net')(root, $).$;
            }
            return factory($, root, root.document);
        };
    } else {
        factory(jQuery, window, document);
    }
}(function($, window, document, undefined) {
    'use strict';
    var DataTable = $.fn.dataTable;
    $.extend(true, DataTable.defaults, {
        dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        renderer: 'bootstrap'
    });
    $.extend(DataTable.ext.classes, {
        sWrapper: "dataTables_wrapper form-inline dt-bootstrap",
        sFilterInput: "form-control input-sm",
        sLengthSelect: "form-control input-sm",
        sProcessing: "dataTables_processing panel panel-default"
    });
    DataTable.ext.renderer.pageButton.bootstrap = function(settings, host, idx, buttons, page, pages) {
        var api = new DataTable.Api(settings);
        var classes = settings.oClasses;
        var lang = settings.oLanguage.oPaginate;
        var aria = settings.oLanguage.oAria.paginate || {};
        var btnDisplay, btnClass, counter = 0;
        var attach = function(container, buttons) {
            var i, ien, node, button;
            var clickHandler = function(e) {
                e.preventDefault();
                if (!$(e.currentTarget).hasClass('disabled') && api.page() != e.data.action) {
                    api.page(e.data.action).draw('page');
                }
            };
            for (i = 0, ien = buttons.length; i < ien; i++) {
                button = buttons[i];
                if ($.isArray(button)) {
                    attach(container, button);
                } else {
                    btnDisplay = '';
                    btnClass = '';
                    switch (button) {
                        case 'ellipsis':
                            btnDisplay = '&#x2026;';
                            btnClass = 'disabled';
                            break;
                        case 'first':
                            btnDisplay = lang.sFirst;
                            btnClass = button + (page > 0 ? '' : ' disabled');
                            break;
                        case 'previous':
                            btnDisplay = lang.sPrevious;
                            btnClass = button + (page > 0 ? '' : ' disabled');
                            break;
                        case 'next':
                            btnDisplay = lang.sNext;
                            btnClass = button + (page < pages - 1 ? '' : ' disabled');
                            break;
                        case 'last':
                            btnDisplay = lang.sLast;
                            btnClass = button + (page < pages - 1 ? '' : ' disabled');
                            break;
                        default:
                            btnDisplay = button + 1;
                            btnClass = page === button ? 'active' : '';
                            break;
                    }
                    if (btnDisplay) {
                        node = $('<li>', {
                            'class': classes.sPageButton + ' ' + btnClass,
                            'id': idx === 0 && typeof button === 'string' ? settings.sTableId + '_' + button : null
                        }).append($('<a>', {
                            'href': '#',
                            'aria-controls': settings.sTableId,
                            'aria-label': aria[button],
                            'data-dt-idx': counter,
                            'tabindex': settings.iTabIndex
                        }).html(btnDisplay)).appendTo(container);
                        settings.oApi._fnBindAction(node, {
                            action: button
                        }, clickHandler);
                        counter++;
                    }
                }
            }
        };
        var activeEl;
        try {
            activeEl = $(host).find(document.activeElement).data('dt-idx');
        } catch (e) {}
        attach($(host).empty().html('<ul class="pagination"/>').children('ul'), buttons);
        if (activeEl !== undefined) {
            $(host).find('[data-dt-idx=' + activeEl + ']').focus();
        }
    };
    return DataTable;
}));;
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.moment = factory()
}(this, function() {
    'use strict';
    var hookCallback;

    function utils_hooks__hooks() {
        return hookCallback.apply(null, arguments);
    }

    function setHookCallback(callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        var k;
        for (k in obj) {
            return false;
        }
        return true;
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [],
            i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }
        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }
        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }
        return a;
    }

    function create_utc__createUTC(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false,
            parsedDateParts: [],
            meridiem: null
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }
    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function(fun) {
            var t = Object(this);
            var len = t.length >>> 0;
            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }
            return false;
        };
    }

    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some.call(flags.parsedDateParts, function(i) {
                return i != null;
            });
            var isNowValid = !isNaN(m._d.getTime()) && flags.overflow < 0 && !flags.empty && !flags.invalidMonth && !flags.invalidWeekday && !flags.nullInput && !flags.invalidFormat && !flags.userInvalidated && (!flags.meridiem || (flags.meridiem && parsedParts));
            if (m._strict) {
                isNowValid = isNowValid && flags.charsLeftOver === 0 && flags.unusedTokens.length === 0 && flags.bigHour === undefined;
            }
            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            } else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function valid__createInvalid(flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        } else {
            getParsingFlags(m).userInvalidated = true;
        }
        return m;
    }

    function isUndefined(input) {
        return input === void 0;
    }
    var momentProperties = utils_hooks__hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;
        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }
        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }
        return to;
    }
    var updateInProgress = false;

    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment(obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor(number) {
        if (number < 0) {
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;
        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }
        return value;
    }

    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) || (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false && (typeof console !== 'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function() {
            if (utils_hooks__hooks.deprecationHandler != null) {
                utils_hooks__hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (var key in arguments[0]) {
                            arg += key + ': ' + arguments[0][key] + ', ';
                        }
                        arg = arg.slice(0, -2);
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }
    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (utils_hooks__hooks.deprecationHandler != null) {
            utils_hooks__hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }
    utils_hooks__hooks.suppressDeprecationWarnings = false;
    utils_hooks__hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function locale_set__set(config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig),
            prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) && !hasOwnProp(childConfig, prop) && isObject(parentConfig[prop])) {
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }
    var keys;
    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function(obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }
    var defaultCalendar = {
        sameDay: '[Today at] LT',
        nextDay: '[Tomorrow at] LT',
        nextWeek: 'dddd [at] LT',
        lastDay: '[Yesterday at] LT',
        lastWeek: '[Last] dddd [at] LT',
        sameElse: 'L'
    };

    function locale_calendar__calendar(key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }
    var defaultLongDateFormat = {
        LTS: 'h:mm:ss A',
        LT: 'h:mm A',
        L: 'MM/DD/YYYY',
        LL: 'MMMM D, YYYY',
        LLL: 'MMMM D, YYYY h:mm A',
        LLLL: 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat(key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];
        if (format || !formatUpper) {
            return format;
        }
        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function(val) {
            return val.slice(1);
        });
        return this._longDateFormat[key];
    }
    var defaultInvalidDate = 'Invalid date';

    function invalidDate() {
        return this._invalidDate;
    }
    var defaultOrdinal = '%d';
    var defaultOrdinalParse = /\d{1,2}/;

    function ordinal(number) {
        return this._ordinal.replace('%d', number);
    }
    var defaultRelativeTime = {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years'
    };

    function relative__relativeTime(number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
    }

    function pastFuture(diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }
    var aliases = {};

    function addUnitAlias(unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp, prop;
        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }
        return normalizedInput;
    }
    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({
                unit: u,
                priority: priorities[u]
            });
        }
        units.sort(function(a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function makeGetSet(unit, keepTime) {
        return function(value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }

    function get_set__get(mom, unit) {
        return mom.isValid() ? mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function get_set__set(mom, unit, value) {
        if (mom.isValid()) {
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    function stringGet(units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }

    function stringSet(units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') + Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }
    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;
    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;
    var formatFunctions = {};
    var formatTokenFunctions = {};

    function addFormatToken(token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function() {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function() {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function() {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens),
            i, length;
        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }
        return function(mom) {
            var output = '',
                i;
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }
        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);
        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }
        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }
        return format;
    }
    var match1 = /\d/;
    var match2 = /\d\d/;
    var match3 = /\d{3}/;
    var match4 = /\d{4}/;
    var match6 = /[+-]?\d{6}/;
    var match1to2 = /\d\d?/;
    var match3to4 = /\d\d\d\d?/;
    var match5to6 = /\d\d\d\d\d\d?/;
    var match1to3 = /\d{1,3}/;
    var match1to4 = /\d{1,4}/;
    var match1to6 = /[+-]?\d{1,6}/;
    var matchUnsigned = /\d+/;
    var matchSigned = /[+-]?\d+/;
    var matchOffset = /Z|[+-]\d\d:?\d\d/gi;
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi;
    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/;
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
    var regexes = {};

    function addRegexToken(token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function(isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken(token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }
        return regexes[token](config._strict, config._locale);
    }

    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    var tokens = {};

    function addParseToken(token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
            func = function(input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken(token, callback) {
        addParseToken(token, function(input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }
    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;
    var indexOf;
    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(o) {
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }
    addFormatToken('M', ['MM', 2], 'Mo', function() {
        return this.month() + 1;
    });
    addFormatToken('MMM', 0, 0, function(format) {
        return this.localeData().monthsShort(this, format);
    });
    addFormatToken('MMMM', 0, 0, function(format) {
        return this.localeData().months(this, format);
    });
    addUnitAlias('month', 'M');
    addUnitPriority('month', 8);
    addRegexToken('M', match1to2);
    addRegexToken('MM', match1to2, match2);
    addRegexToken('MMM', function(isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function(isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });
    addParseToken(['M', 'MM'], function(input, array) {
        array[MONTH] = toInt(input) - 1;
    });
    addParseToken(['MMM', 'MMMM'], function(input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });
    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');

    function localeMonths(m, format) {
        if (!m) {
            return this._months;
        }
        return isArray(this._months) ? this._months[m.month()] : this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }
    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');

    function localeMonthsShort(m, format) {
        if (!m) {
            return this._monthsShort;
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] : this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function units_month__handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = create_utc__createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }
        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse(monthName, format, strict) {
        var i, mom, regex;
        if (this._monthsParseExact) {
            return units_month__handleStrictParse.call(this, monthName, format, strict);
        }
        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }
        for (i = 0; i < 12; i++) {
            mom = create_utc__createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    function setMonth(mom, value) {
        var dayOfMonth;
        if (!mom.isValid()) {
            return mom;
        }
        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                if (typeof value !== 'number') {
                    return mom;
                }
            }
        }
        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth(value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }

    function getDaysInMonth() {
        return daysInMonth(this.year(), this.month());
    }
    var defaultMonthsShortRegex = matchWord;

    function monthsShortRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ? this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }
    var defaultMonthsRegex = matchWord;

    function monthsRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ? this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }
        var shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            mom = create_utc__createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }
        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }
    addFormatToken('Y', 0, 0, function() {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });
    addFormatToken(0, ['YY', 2], 0, function() {
        return this.year() % 100;
    });
    addFormatToken(0, ['YYYY', 4], 0, 'year');
    addFormatToken(0, ['YYYYY', 5], 0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');
    addUnitAlias('year', 'y');
    addUnitPriority('year', 1);
    addRegexToken('Y', matchSigned);
    addRegexToken('YY', match1to2, match2);
    addRegexToken('YYYY', match1to4, match4);
    addRegexToken('YYYYY', match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);
    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function(input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function(input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function(input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }
    utils_hooks__hooks.parseTwoDigitYear = function(input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };
    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear() {
        return isLeapYear(this.year());
    }

    function createDate(y, m, d, h, M, s, ms) {
        var date = new Date(y, m, d, h, M, s, ms);
        if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function firstWeekOffset(year, dow, doy) {
        var
            fwd = 7 + dow - doy,
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;
        return -fwdlw + fwd - 1;
    }

    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;
        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }
        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;
        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }
        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }
    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');
    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');
    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);
    addRegexToken('w', match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W', match1to2);
    addRegexToken('WW', match1to2, match2);
    addWeekParseToken(['w', 'ww', 'W', 'WW'], function(input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    function localeWeek(mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }
    var defaultLocaleWeek = {
        dow: 0,
        doy: 6
    };

    function localeFirstDayOfWeek() {
        return this._week.dow;
    }

    function localeFirstDayOfYear() {
        return this._week.doy;
    }

    function getSetWeek(input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek(input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }
    addFormatToken('d', 0, 'do', 'day');
    addFormatToken('dd', 0, 0, function(format) {
        return this.localeData().weekdaysMin(this, format);
    });
    addFormatToken('ddd', 0, 0, function(format) {
        return this.localeData().weekdaysShort(this, format);
    });
    addFormatToken('dddd', 0, 0, function(format) {
        return this.localeData().weekdays(this, format);
    });
    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');
    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);
    addRegexToken('d', match1to2);
    addRegexToken('e', match1to2);
    addRegexToken('E', match1to2);
    addRegexToken('dd', function(isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd', function(isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd', function(isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });
    addWeekParseToken(['dd', 'ddd', 'dddd'], function(input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });
    addWeekParseToken(['d', 'e', 'E'], function(input, week, config, token) {
        week[token] = toInt(input);
    });

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }
        if (!isNaN(input)) {
            return parseInt(input, 10);
        }
        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }
        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }
    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');

    function localeWeekdays(m, format) {
        if (!m) {
            return this._weekdays;
        }
        return isArray(this._weekdays) ? this._weekdays[m.day()] : this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
    }
    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');

    function localeWeekdaysShort(m) {
        return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }
    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');

    function localeWeekdaysMin(m) {
        return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function day_of_week__handleStrictParse(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];
            for (i = 0; i < 7; ++i) {
                mom = create_utc__createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }
        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse(weekdayName, format, strict) {
        var i, mom, regex;
        if (this._weekdaysParseExact) {
            return day_of_week__handleStrictParse.call(this, weekdayName, format, strict);
        }
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }
        for (i = 0; i < 7; i++) {
            mom = create_utc__createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    function getSetDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }
    var defaultWeekdaysRegex = matchWord;

    function weekdaysRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ? this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }
    var defaultWeekdaysShortRegex = matchWord;

    function weekdaysShortRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }
    var defaultWeekdaysMinRegex = matchWord;

    function weekdaysMinRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }

    function computeWeekdaysParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }
        var minPieces = [],
            shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            mom = create_utc__createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }
        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;
        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }
    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);
    addFormatToken('hmm', 0, 0, function() {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });
    addFormatToken('hmmss', 0, 0, function() {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
    });
    addFormatToken('Hmm', 0, 0, function() {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });
    addFormatToken('Hmmss', 0, 0, function() {
        return '' + this.hours() + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
    });

    function meridiem(token, lowercase) {
        addFormatToken(token, 0, 0, function() {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }
    meridiem('a', true);
    meridiem('A', false);
    addUnitAlias('hour', 'h');
    addUnitPriority('hour', 13);

    function matchMeridiem(isStrict, locale) {
        return locale._meridiemParse;
    }
    addRegexToken('a', matchMeridiem);
    addRegexToken('A', matchMeridiem);
    addRegexToken('H', match1to2);
    addRegexToken('h', match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);
    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['a', 'A'], function(input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function(input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function(input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function(input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function(input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function(input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    function localeIsPM(input) {
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }
    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;

    function localeMeridiem(hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }
    var getSetHour = makeGetSet('Hours', true);
    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        ordinalParse: defaultOrdinalParse,
        relativeTime: defaultRelativeTime,
        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,
        week: defaultLocaleWeek,
        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,
        meridiemParse: defaultLocaleMeridiemParse
    };
    var locales = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    function chooseLocale(names) {
        var i = 0,
            j, next, locale, split;
        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        if (!locales[name] && (typeof module !== 'undefined') && module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                locale_locales__getSetGlobalLocale(oldLocale);
            } catch (e) {}
        }
        return locales[name];
    }

    function locale_locales__getSetGlobalLocale(key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = locale_locales__getLocale(key);
            } else {
                data = defineLocale(key, values);
            }
            if (data) {
                globalLocale = data;
            }
        }
        return globalLocale._abbr;
    }

    function defineLocale(name, config) {
        if (config !== null) {
            var parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride', 'use moment.updateLocale(localeName, config) to change ' + 'an existing locale. moment.defineLocale(localeName, ' + 'config) should only be used for creating a new locale ' + 'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    deprecateSimple('parentLocaleUndefined', 'specified parentLocale is not defined yet. See http://momentjs.com/guides/#/warnings/parent-locale/');
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));
            locale_locales__getSetGlobalLocale(name);
            return locales[name];
        } else {
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, parentConfig = baseConfig;
            if (locales[name] != null) {
                parentConfig = locales[name]._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;
            locale_locales__getSetGlobalLocale(name);
        } else {
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    function locale_locales__getLocale(key) {
        var locale;
        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }
        if (!key) {
            return globalLocale;
        }
        if (!isArray(key)) {
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }
        return chooseLocale(key);
    }

    function locale_locales__listLocales() {
        return keys(locales);
    }

    function checkOverflow(m) {
        var overflow;
        var a = m._a;
        if (a && getParsingFlags(m).overflow === -2) {
            overflow = a[MONTH] < 0 || a[MONTH] > 11 ? MONTH : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE : a[HOUR] < 0 || a[HOUR] > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR : a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE : a[SECOND] < 0 || a[SECOND] > 59 ? SECOND : a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND : -1;
            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }
            getParsingFlags(m).overflow = overflow;
        }
        return m;
    }
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;
    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;
    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];
    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    function configFromISO(config) {
        var i, l, string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;
        if (match) {
            getParsingFlags(config).iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);
        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }
        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }
    utils_hooks__hooks.createFromInputFallback = deprecate('value provided is not in a recognized ISO format. moment construction falls back to js Date(), ' + 'which is not reliable across all browsers and versions. Non ISO date formats are ' + 'discouraged and will be removed in an upcoming major release. Please refer to ' + 'http://momentjs.com/guides/#/warnings/js-date/ for more info.', function(config) {
        config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
    });

    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        var nowValue = new Date(utils_hooks__hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    function configFromArray(config) {
        var i, date, input = [],
            currentDate, yearToUse;
        if (config._d) {
            return;
        }
        currentDate = currentDateArray(config);
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);
            if (config._dayOfYear > daysInYear(yearToUse)) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }
            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }
        if (config._a[HOUR] === 24 && config._a[MINUTE] === 0 && config._a[SECOND] === 0 && config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }
        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }
        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;
        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;
            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);
            if (w.d != null) {
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }
    utils_hooks__hooks.ISO_8601 = function() {};

    function configFromStringAndFormat(config) {
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped, stringLength = string.length,
            totalParsedInputLength = 0;
        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];
        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                } else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            } else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }
        if (config._a[HOUR] <= 12 && getParsingFlags(config).bigHour === true && config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }
        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
        configFromArray(config);
        checkOverflow(config);
    }

    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;
        if (meridiem == null) {
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            return hour;
        }
    }

    function configFromStringAndArray(config) {
        var tempConfig, bestMoment, scoreToBeat, i, currentScore;
        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }
        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);
            if (!valid__isValid(tempConfig)) {
                continue;
            }
            currentScore += getParsingFlags(tempConfig).charsLeftOver;
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;
            getParsingFlags(tempConfig).score = currentScore;
            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }
        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }
        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function(obj) {
            return obj && parseInt(obj, 10);
        });
        configFromArray(config);
    }

    function createFromConfig(config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            res.add(1, 'd');
            res._nextDay = undefined;
        }
        return res;
    }

    function prepareConfig(config) {
        var input = config._i,
            format = config._f;
        config._locale = config._locale || locale_locales__getLocale(config._l);
        if (input === null || (format === undefined && input === '')) {
            return valid__createInvalid({
                nullInput: true
            });
        }
        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }
        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (isDate(input)) {
            config._d = input;
        } else if (format) {
            configFromStringAndFormat(config);
        } else {
            configFromInput(config);
        }
        if (!valid__isValid(config)) {
            config._d = null;
        }
        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date(utils_hooks__hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function(obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof(input) === 'object') {
            configFromObject(config);
        } else if (typeof(input) === 'number') {
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC(input, format, locale, strict, isUTC) {
        var c = {};
        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        if ((isObject(input) && isObjectEmpty(input)) || (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        return createFromConfig(c);
    }

    function local__createLocal(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }
    var prototypeMin = deprecate('moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/', function() {
        var other = local__createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
            return other < this ? this : other;
        } else {
            return valid__createInvalid();
        }
    });
    var prototypeMax = deprecate('moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/', function() {
        var other = local__createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
            return other > this ? this : other;
        } else {
            return valid__createInvalid();
        }
    });

    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return local__createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    function min() {
        var args = [].slice.call(arguments, 0);
        return pickBy('isBefore', args);
    }

    function max() {
        var args = [].slice.call(arguments, 0);
        return pickBy('isAfter', args);
    }
    var now = function() {
        return Date.now ? Date.now() : +(new Date());
    };

    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;
        this._milliseconds = +milliseconds + seconds * 1e3 + minutes * 6e4 + hours * 1000 * 60 * 60;
        this._days = +days + weeks * 7;
        this._months = +months + quarters * 3 + years * 12;
        this._data = {};
        this._locale = locale_locales__getLocale();
        this._bubble();
    }

    function isDuration(obj) {
        return obj instanceof Duration;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    function offset(token, separator) {
        addFormatToken(token, 0, 0, function() {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }
    offset('Z', ':');
    offset('ZZ', '');
    addRegexToken('Z', matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function(input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = ((string || '').match(matcher) || []);
        var chunk = matches[matches.length - 1] || [];
        var parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);
        return parts[0] === '+' ? minutes : -minutes;
    }

    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : local__createLocal(input).valueOf()) - res.valueOf();
            res._d.setTime(res._d.valueOf() + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
        }
    }

    function getDateOffset(m) {
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }
    utils_hooks__hooks.updateOffset = function() {};

    function getSetOffset(input, keepLocalTime) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
            } else if (Math.abs(input) < 16) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone(input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }
            this.utcOffset(input, keepLocalTime);
            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC(keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal(keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;
            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset() {
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone === 0) {
                this.utcOffset(0, true);
            } else {
                this.utcOffset(offsetFromString(matchOffset, this._i));
            }
        }
        return this;
    }

    function hasAlignedHourOffset(input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? local__createLocal(input).utcOffset() : 0;
        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime() {
        return (this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset());
    }

    function isDaylightSavingTimeShifted() {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }
        var c = {};
        copyConfig(c, this);
        c = prepareConfig(c);
        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() && compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }
        return this._isDSTShifted;
    }

    function isLocal() {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset() {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc() {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }
    var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;
    var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;

    function create__createDuration(input, key) {
        var duration = input,
            match = null,
            sign, ret, diffRes;
        if (isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: parseIso(match[2], sign),
                M: parseIso(match[3], sign),
                w: parseIso(match[4], sign),
                d: parseIso(match[5], sign),
                h: parseIso(match[6], sign),
                m: parseIso(match[7], sign),
                s: parseIso(match[8], sign)
            };
        } else if (duration == null) {
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));
            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }
        ret = new Duration(duration);
        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }
        return ret;
    }
    create__createDuration.fn = Duration.prototype;

    function parseIso(inp, sign) {
        var res = inp && parseFloat(inp.replace(',', '.'));
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {
            milliseconds: 0,
            months: 0
        };
        res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }
        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));
        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {
                milliseconds: 0,
                months: 0
            };
        }
        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }
        return res;
    }

    function createAdder(direction, name) {
        return function(val, period) {
            var dur, tmp;
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' + 'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val;
                val = period;
                period = tmp;
            }
            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }

    function add_subtract__addSubtract(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);
        if (!mom.isValid()) {
            return;
        }
        updateOffset = updateOffset == null ? true : updateOffset;
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }
    var add_subtract__add = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function moment_calendar__calendar(time, formats) {
        var now = time || local__createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = utils_hooks__hooks.calendarFormat(this, sod) || 'sameElse';
        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);
        return this.format(output || this.localeData().calendar(format, this, local__createLocal(now)));
    }

    function clone() {
        return new Moment(this);
    }

    function isAfter(input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore(input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween(from, to, units, inclusivity) {
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) && (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
    }

    function isSame(input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter(input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore(input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff(input, units, asFloat) {
        var that, zoneDelta, delta, output;
        if (!this.isValid()) {
            return NaN;
        }
        that = cloneWithOffset(input, this);
        if (!that.isValid()) {
            return NaN;
        }
        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;
        units = normalizeUnits(units);
        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : units === 'minute' ? delta / 6e4 : units === 'hour' ? delta / 36e5 : units === 'day' ? (delta - zoneDelta) / 864e5 : units === 'week' ? (delta - zoneDelta) / 6048e5 : delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff(a, b) {
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;
        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            adjust = (b - anchor) / (anchor2 - anchor);
        }
        return -(wholeMonthDiff + adjust) || 0;
    }
    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    utils_hooks__hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString() {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function moment_format__toISOString() {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if (isFunction(Date.prototype.toISOString)) {
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }

    function format(inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? utils_hooks__hooks.defaultFormatUtc : utils_hooks__hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from(time, withoutSuffix) {
        if (this.isValid() && ((isMoment(time) && time.isValid()) || local__createLocal(time).isValid())) {
            return create__createDuration({
                to: this,
                from: time
            }).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow(withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }

    function to(time, withoutSuffix) {
        if (this.isValid() && ((isMoment(time) && time.isValid()) || local__createLocal(time).isValid())) {
            return create__createDuration({
                from: this,
                to: time
            }).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow(withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }

    function locale(key) {
        var newLocaleData;
        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }
    var lang = deprecate('moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.', function(key) {
        if (key === undefined) {
            return this.localeData();
        } else {
            return this.locale(key);
        }
    });

    function localeData() {
        return this._locale;
    }

    function startOf(units) {
        units = normalizeUnits(units);
        switch (units) {
            case 'year':
                this.month(0);
            case 'quarter':
            case 'month':
                this.date(1);
            case 'week':
            case 'isoWeek':
            case 'day':
            case 'date':
                this.hours(0);
            case 'hour':
                this.minutes(0);
            case 'minute':
                this.seconds(0);
            case 'second':
                this.milliseconds(0);
        }
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }
        return this;
    }

    function endOf(units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }
        if (units === 'date') {
            units = 'day';
        }
        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function to_type__valueOf() {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix() {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate() {
        return new Date(this.valueOf());
    }

    function toArray() {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject() {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON() {
        return this.isValid() ? this.toISOString() : null;
    }

    function moment_valid__isValid() {
        return valid__isValid(this);
    }

    function parsingFlags() {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt() {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }
    addFormatToken(0, ['gg', 2], 0, function() {
        return this.weekYear() % 100;
    });
    addFormatToken(0, ['GG', 2], 0, function() {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken(token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }
    addWeekYearFormatToken('gggg', 'weekYear');
    addWeekYearFormatToken('ggggg', 'weekYear');
    addWeekYearFormatToken('GGGG', 'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');
    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');
    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);
    addRegexToken('G', matchSigned);
    addRegexToken('g', matchSigned);
    addRegexToken('GG', match1to2, match2);
    addRegexToken('gg', match1to2, match2);
    addRegexToken('GGGG', match1to4, match4);
    addRegexToken('gggg', match1to4, match4);
    addRegexToken('GGGGG', match1to6, match6);
    addRegexToken('ggggg', match1to6, match6);
    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function(input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });
    addWeekParseToken(['gg', 'GG'], function(input, week, config, token) {
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    function getSetWeekYear(input) {
        return getSetWeekYearHelper.call(this, input, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy);
    }

    function getSetISOWeekYear(input) {
        return getSetWeekYearHelper.call(this, input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear() {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);
        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }
    addFormatToken('Q', 0, 'Qo', 'quarter');
    addUnitAlias('quarter', 'Q');
    addUnitPriority('quarter', 7);
    addRegexToken('Q', match1);
    addParseToken('Q', function(input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    function getSetQuarter(input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }
    addFormatToken('D', ['DD', 2], 'Do', 'date');
    addUnitAlias('date', 'D');
    addUnitPriority('date', 9);
    addRegexToken('D', match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function(isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });
    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function(input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });
    var getSetDayOfMonth = makeGetSet('Date', true);
    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');
    addUnitAlias('dayOfYear', 'DDD');
    addUnitPriority('dayOfYear', 4);
    addRegexToken('DDD', match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function(input, array, config) {
        config._dayOfYear = toInt(input);
    });

    function getSetDayOfYear(input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }
    addFormatToken('m', ['mm', 2], 0, 'minute');
    addUnitAlias('minute', 'm');
    addUnitPriority('minute', 14);
    addRegexToken('m', match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);
    var getSetMinute = makeGetSet('Minutes', false);
    addFormatToken('s', ['ss', 2], 0, 'second');
    addUnitAlias('second', 's');
    addUnitPriority('second', 15);
    addRegexToken('s', match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);
    var getSetSecond = makeGetSet('Seconds', false);
    addFormatToken('S', 0, 0, function() {
        return ~~(this.millisecond() / 100);
    });
    addFormatToken(0, ['SS', 2], 0, function() {
        return ~~(this.millisecond() / 10);
    });
    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function() {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function() {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function() {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function() {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function() {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function() {
        return this.millisecond() * 1000000;
    });
    addUnitAlias('millisecond', 'ms');
    addUnitPriority('millisecond', 16);
    addRegexToken('S', match1to3, match1);
    addRegexToken('SS', match1to3, match2);
    addRegexToken('SSS', match1to3, match3);
    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }
    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    var getSetMillisecond = makeGetSet('Milliseconds', false);
    addFormatToken('z', 0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    function getZoneAbbr() {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName() {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }
    var momentPrototype__proto = Moment.prototype;
    momentPrototype__proto.add = add_subtract__add;
    momentPrototype__proto.calendar = moment_calendar__calendar;
    momentPrototype__proto.clone = clone;
    momentPrototype__proto.diff = diff;
    momentPrototype__proto.endOf = endOf;
    momentPrototype__proto.format = format;
    momentPrototype__proto.from = from;
    momentPrototype__proto.fromNow = fromNow;
    momentPrototype__proto.to = to;
    momentPrototype__proto.toNow = toNow;
    momentPrototype__proto.get = stringGet;
    momentPrototype__proto.invalidAt = invalidAt;
    momentPrototype__proto.isAfter = isAfter;
    momentPrototype__proto.isBefore = isBefore;
    momentPrototype__proto.isBetween = isBetween;
    momentPrototype__proto.isSame = isSame;
    momentPrototype__proto.isSameOrAfter = isSameOrAfter;
    momentPrototype__proto.isSameOrBefore = isSameOrBefore;
    momentPrototype__proto.isValid = moment_valid__isValid;
    momentPrototype__proto.lang = lang;
    momentPrototype__proto.locale = locale;
    momentPrototype__proto.localeData = localeData;
    momentPrototype__proto.max = prototypeMax;
    momentPrototype__proto.min = prototypeMin;
    momentPrototype__proto.parsingFlags = parsingFlags;
    momentPrototype__proto.set = stringSet;
    momentPrototype__proto.startOf = startOf;
    momentPrototype__proto.subtract = add_subtract__subtract;
    momentPrototype__proto.toArray = toArray;
    momentPrototype__proto.toObject = toObject;
    momentPrototype__proto.toDate = toDate;
    momentPrototype__proto.toISOString = moment_format__toISOString;
    momentPrototype__proto.toJSON = toJSON;
    momentPrototype__proto.toString = toString;
    momentPrototype__proto.unix = unix;
    momentPrototype__proto.valueOf = to_type__valueOf;
    momentPrototype__proto.creationData = creationData;
    momentPrototype__proto.year = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;
    momentPrototype__proto.weekYear = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;
    momentPrototype__proto.month = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;
    momentPrototype__proto.week = momentPrototype__proto.weeks = getSetWeek;
    momentPrototype__proto.isoWeek = momentPrototype__proto.isoWeeks = getSetISOWeek;
    momentPrototype__proto.weeksInYear = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;
    momentPrototype__proto.date = getSetDayOfMonth;
    momentPrototype__proto.day = momentPrototype__proto.days = getSetDayOfWeek;
    momentPrototype__proto.weekday = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear = getSetDayOfYear;
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;
    momentPrototype__proto.utcOffset = getSetOffset;
    momentPrototype__proto.utc = setOffsetToUTC;
    momentPrototype__proto.local = setOffsetToLocal;
    momentPrototype__proto.parseZone = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST = isDaylightSavingTime;
    momentPrototype__proto.isLocal = isLocal;
    momentPrototype__proto.isUtcOffset = isUtcOffset;
    momentPrototype__proto.isUtc = isUtc;
    momentPrototype__proto.isUTC = isUtc;
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;
    momentPrototype__proto.dates = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    momentPrototype__proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);
    var momentPrototype = momentPrototype__proto;

    function moment__createUnix(input) {
        return local__createLocal(input * 1000);
    }

    function moment__createInZone() {
        return local__createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat(string) {
        return string;
    }
    var prototype__proto = Locale.prototype;
    prototype__proto.calendar = locale_calendar__calendar;
    prototype__proto.longDateFormat = longDateFormat;
    prototype__proto.invalidDate = invalidDate;
    prototype__proto.ordinal = ordinal;
    prototype__proto.preparse = preParsePostFormat;
    prototype__proto.postformat = preParsePostFormat;
    prototype__proto.relativeTime = relative__relativeTime;
    prototype__proto.pastFuture = pastFuture;
    prototype__proto.set = locale_set__set;
    prototype__proto.months = localeMonths;
    prototype__proto.monthsShort = localeMonthsShort;
    prototype__proto.monthsParse = localeMonthsParse;
    prototype__proto.monthsRegex = monthsRegex;
    prototype__proto.monthsShortRegex = monthsShortRegex;
    prototype__proto.week = localeWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;
    prototype__proto.weekdays = localeWeekdays;
    prototype__proto.weekdaysMin = localeWeekdaysMin;
    prototype__proto.weekdaysShort = localeWeekdaysShort;
    prototype__proto.weekdaysParse = localeWeekdaysParse;
    prototype__proto.weekdaysRegex = weekdaysRegex;
    prototype__proto.weekdaysShortRegex = weekdaysShortRegex;
    prototype__proto.weekdaysMinRegex = weekdaysMinRegex;
    prototype__proto.isPM = localeIsPM;
    prototype__proto.meridiem = localeMeridiem;

    function lists__get(format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl(format, index, field) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }
        format = format || '';
        if (index != null) {
            return lists__get(format, index, field, 'month');
        }
        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = lists__get(format, i, field, 'month');
        }
        return out;
    }

    function listWeekdaysImpl(localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }
            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;
            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }
            format = format || '';
        }
        var locale = locale_locales__getLocale(),
            shift = localeSorted ? locale._week.dow : 0;
        if (index != null) {
            return lists__get(format, (index + shift) % 7, field, 'day');
        }
        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = lists__get(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function lists__listMonths(format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function lists__listMonthsShort(format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function lists__listWeekdays(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function lists__listWeekdaysShort(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function lists__listWeekdaysMin(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }
    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal: function(number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' : (b === 1) ? 'st' : (b === 2) ? 'nd' : (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);
    var mathAbs = Math.abs;

    function duration_abs__abs() {
        var data = this._data;
        this._milliseconds = mathAbs(this._milliseconds);
        this._days = mathAbs(this._days);
        this._months = mathAbs(this._months);
        data.milliseconds = mathAbs(data.milliseconds);
        data.seconds = mathAbs(data.seconds);
        data.minutes = mathAbs(data.minutes);
        data.hours = mathAbs(data.hours);
        data.months = mathAbs(data.months);
        data.years = mathAbs(data.years);
        return this;
    }

    function duration_add_subtract__addSubtract(duration, input, value, direction) {
        var other = create__createDuration(input, value);
        duration._milliseconds += direction * other._milliseconds;
        duration._days += direction * other._days;
        duration._months += direction * other._months;
        return duration._bubble();
    }

    function duration_add_subtract__add(input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }

    function duration_add_subtract__subtract(input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
    }

    function absCeil(number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble() {
        var milliseconds = this._milliseconds;
        var days = this._days;
        var months = this._months;
        var data = this._data;
        var seconds, minutes, hours, years, monthsFromDays;
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) || (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }
        data.milliseconds = milliseconds % 1000;
        seconds = absFloor(milliseconds / 1000);
        data.seconds = seconds % 60;
        minutes = absFloor(seconds / 60);
        data.minutes = minutes % 60;
        hours = absFloor(minutes / 60);
        data.hours = hours % 24;
        days += absFloor(hours / 24);
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));
        years = absFloor(months / 12);
        months %= 12;
        data.days = days;
        data.months = months;
        data.years = years;
        return this;
    }

    function daysToMonths(days) {
        return days * 4800 / 146097;
    }

    function monthsToDays(months) {
        return months * 146097 / 4800;
    }

    function as(units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;
        units = normalizeUnits(units);
        if (units === 'month' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week':
                    return days / 7 + milliseconds / 6048e5;
                case 'day':
                    return days + milliseconds / 864e5;
                case 'hour':
                    return days * 24 + milliseconds / 36e5;
                case 'minute':
                    return days * 1440 + milliseconds / 6e4;
                case 'second':
                    return days * 86400 + milliseconds / 1000;
                case 'millisecond':
                    return Math.floor(days * 864e5) + milliseconds;
                default:
                    throw new Error('Unknown unit ' + units);
            }
        }
    }

    function duration_as__valueOf() {
        return (this._milliseconds + this._days * 864e5 + (this._months % 12) * 2592e6 + toInt(this._months / 12) * 31536e6);
    }

    function makeAs(alias) {
        return function() {
            return this.as(alias);
        };
    }
    var asMilliseconds = makeAs('ms');
    var asSeconds = makeAs('s');
    var asMinutes = makeAs('m');
    var asHours = makeAs('h');
    var asDays = makeAs('d');
    var asWeeks = makeAs('w');
    var asMonths = makeAs('M');
    var asYears = makeAs('y');

    function duration_get__get(units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }

    function makeGetter(name) {
        return function() {
            return this._data[name];
        };
    }
    var milliseconds = makeGetter('milliseconds');
    var seconds = makeGetter('seconds');
    var minutes = makeGetter('minutes');
    var hours = makeGetter('hours');
    var days = makeGetter('days');
    var months = makeGetter('months');
    var years = makeGetter('years');

    function weeks() {
        return absFloor(this.days() / 7);
    }
    var round = Math.round;
    var thresholds = {
        s: 45,
        m: 45,
        h: 22,
        d: 26,
        M: 11
    };

    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function duration_humanize__relativeTime(posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds = round(duration.as('s'));
        var minutes = round(duration.as('m'));
        var hours = round(duration.as('h'));
        var days = round(duration.as('d'));
        var months = round(duration.as('M'));
        var years = round(duration.as('y'));
        var a = seconds < thresholds.s && ['s', seconds] || minutes <= 1 && ['m'] || minutes < thresholds.m && ['mm', minutes] || hours <= 1 && ['h'] || hours < thresholds.h && ['hh', hours] || days <= 1 && ['d'] || days < thresholds.d && ['dd', days] || months <= 1 && ['M'] || months < thresholds.M && ['MM', months] || years <= 1 && ['y'] || ['yy', years];
        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    function duration_humanize__getSetRelativeTimeRounding(roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof(roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    function duration_humanize__getSetRelativeTimeThreshold(threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }

    function humanize(withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);
        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }
        return locale.postformat(output);
    }
    var iso_string__abs = Math.abs;

    function iso_string__toISOString() {
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days = iso_string__abs(this._days);
        var months = iso_string__abs(this._months);
        var minutes, hours, years;
        minutes = absFloor(seconds / 60);
        hours = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;
        years = absFloor(months / 12);
        months %= 12;
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();
        if (!total) {
            return 'P0D';
        }
        return (total < 0 ? '-' : '') + 'P' + (Y ? Y + 'Y' : '') + (M ? M + 'M' : '') + (D ? D + 'D' : '') + ((h || m || s) ? 'T' : '') + (h ? h + 'H' : '') + (m ? m + 'M' : '') + (s ? s + 'S' : '');
    }
    var duration_prototype__proto = Duration.prototype;
    duration_prototype__proto.abs = duration_abs__abs;
    duration_prototype__proto.add = duration_add_subtract__add;
    duration_prototype__proto.subtract = duration_add_subtract__subtract;
    duration_prototype__proto.as = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds = asSeconds;
    duration_prototype__proto.asMinutes = asMinutes;
    duration_prototype__proto.asHours = asHours;
    duration_prototype__proto.asDays = asDays;
    duration_prototype__proto.asWeeks = asWeeks;
    duration_prototype__proto.asMonths = asMonths;
    duration_prototype__proto.asYears = asYears;
    duration_prototype__proto.valueOf = duration_as__valueOf;
    duration_prototype__proto._bubble = bubble;
    duration_prototype__proto.get = duration_get__get;
    duration_prototype__proto.milliseconds = milliseconds;
    duration_prototype__proto.seconds = seconds;
    duration_prototype__proto.minutes = minutes;
    duration_prototype__proto.hours = hours;
    duration_prototype__proto.days = days;
    duration_prototype__proto.weeks = weeks;
    duration_prototype__proto.months = months;
    duration_prototype__proto.years = years;
    duration_prototype__proto.humanize = humanize;
    duration_prototype__proto.toISOString = iso_string__toISOString;
    duration_prototype__proto.toString = iso_string__toISOString;
    duration_prototype__proto.toJSON = iso_string__toISOString;
    duration_prototype__proto.locale = locale;
    duration_prototype__proto.localeData = localeData;
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;
    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');
    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function(input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function(input, array, config) {
        config._d = new Date(toInt(input));
    });
    utils_hooks__hooks.version = '2.15.1';
    setHookCallback(local__createLocal);
    utils_hooks__hooks.fn = momentPrototype;
    utils_hooks__hooks.min = min;
    utils_hooks__hooks.max = max;
    utils_hooks__hooks.now = now;
    utils_hooks__hooks.utc = create_utc__createUTC;
    utils_hooks__hooks.unix = moment__createUnix;
    utils_hooks__hooks.months = lists__listMonths;
    utils_hooks__hooks.isDate = isDate;
    utils_hooks__hooks.locale = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid = valid__createInvalid;
    utils_hooks__hooks.duration = create__createDuration;
    utils_hooks__hooks.isMoment = isMoment;
    utils_hooks__hooks.weekdays = lists__listWeekdays;
    utils_hooks__hooks.parseZone = moment__createInZone;
    utils_hooks__hooks.localeData = locale_locales__getLocale;
    utils_hooks__hooks.isDuration = isDuration;
    utils_hooks__hooks.monthsShort = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale = defineLocale;
    utils_hooks__hooks.updateLocale = updateLocale;
    utils_hooks__hooks.locales = locale_locales__listLocales;
    utils_hooks__hooks.weekdaysShort = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits = normalizeUnits;
    utils_hooks__hooks.relativeTimeRounding = duration_humanize__getSetRelativeTimeRounding;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;
    utils_hooks__hooks.calendarFormat = getCalendarFormat;
    utils_hooks__hooks.prototype = momentPrototype;
    var _moment = utils_hooks__hooks;
    return _moment;
}));
(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'moment'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'), require('moment'));
    } else {
        if (typeof jQuery === 'undefined') {
            throw 'bootstrap-datetimepicker requires jQuery to be loaded first';
        }
        if (typeof moment === 'undefined') {
            throw 'bootstrap-datetimepicker requires Moment.js to be loaded first';
        }
        factory(jQuery, moment);
    }
}(function($, moment) {
    'use strict';
    if (!moment) {
        throw new Error('bootstrap-datetimepicker requires Moment.js to be loaded first');
    }
    var dateTimePicker = function(element, options) {
        var picker = {},
            date = moment().startOf('d'),
            viewDate = date.clone(),
            unset = true,
            input, component = false,
            widget = false,
            use24Hours, minViewModeNumber = 0,
            actualFormat, parseFormats, currentViewMode, datePickerModes = [{
                clsName: 'days',
                navFnc: 'M',
                navStep: 1
            }, {
                clsName: 'months',
                navFnc: 'y',
                navStep: 1
            }, {
                clsName: 'years',
                navFnc: 'y',
                navStep: 10
            }, {
                clsName: 'decades',
                navFnc: 'y',
                navStep: 100
            }],
            viewModes = ['days', 'months', 'years', 'decades'],
            verticalModes = ['top', 'bottom', 'auto'],
            horizontalModes = ['left', 'right', 'auto'],
            toolbarPlacements = ['default', 'top', 'bottom'],
            keyMap = {
                'up': 38,
                38: 'up',
                'down': 40,
                40: 'down',
                'left': 37,
                37: 'left',
                'right': 39,
                39: 'right',
                'tab': 9,
                9: 'tab',
                'escape': 27,
                27: 'escape',
                'enter': 13,
                13: 'enter',
                'pageUp': 33,
                33: 'pageUp',
                'pageDown': 34,
                34: 'pageDown',
                'shift': 16,
                16: 'shift',
                'control': 17,
                17: 'control',
                'space': 32,
                32: 'space',
                't': 84,
                84: 't',
                'delete': 46,
                46: 'delete'
            },
            keyState = {},
            isEnabled = function(granularity) {
                if (typeof granularity !== 'string' || granularity.length > 1) {
                    throw new TypeError('isEnabled expects a single character string parameter');
                }
                switch (granularity) {
                    case 'y':
                        return actualFormat.indexOf('Y') !== -1;
                    case 'M':
                        return actualFormat.indexOf('M') !== -1;
                    case 'd':
                        return actualFormat.toLowerCase().indexOf('d') !== -1;
                    case 'h':
                    case 'H':
                        return actualFormat.toLowerCase().indexOf('h') !== -1;
                    case 'm':
                        return actualFormat.indexOf('m') !== -1;
                    case 's':
                        return actualFormat.indexOf('s') !== -1;
                    default:
                        return false;
                }
            },
            hasTime = function() {
                return (isEnabled('h') || isEnabled('m') || isEnabled('s'));
            },
            hasDate = function() {
                return (isEnabled('y') || isEnabled('M') || isEnabled('d'));
            },
            getDatePickerTemplate = function() {
                var headTemplate = $('<thead>').append($('<tr>').append($('<th>').addClass('prev').attr('data-action', 'previous').append($('<span>').addClass(options.icons.previous))).append($('<th>').addClass('picker-switch').attr('data-action', 'pickerSwitch').attr('colspan', (options.calendarWeeks ? '6' : '5'))).append($('<th>').addClass('next').attr('data-action', 'next').append($('<span>').addClass(options.icons.next)))),
                    contTemplate = $('<tbody>').append($('<tr>').append($('<td>').attr('colspan', (options.calendarWeeks ? '8' : '7'))));
                return [$('<div>').addClass('datepicker-days').append($('<table>').addClass('table-condensed').append(headTemplate).append($('<tbody>'))), $('<div>').addClass('datepicker-months').append($('<table>').addClass('table-condensed').append(headTemplate.clone()).append(contTemplate.clone())), $('<div>').addClass('datepicker-years').append($('<table>').addClass('table-condensed').append(headTemplate.clone()).append(contTemplate.clone())), $('<div>').addClass('datepicker-decades').append($('<table>').addClass('table-condensed').append(headTemplate.clone()).append(contTemplate.clone()))];
            },
            getTimePickerMainTemplate = function() {
                var topRow = $('<tr>'),
                    middleRow = $('<tr>'),
                    bottomRow = $('<tr>');
                if (isEnabled('h')) {
                    topRow.append($('<td>').append($('<a>').attr({
                        href: '#',
                        tabindex: '-1',
                        'title': 'Increment Hour'
                    }).addClass('btn').attr('data-action', 'incrementHours').append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>').append($('<span>').addClass('timepicker-hour').attr({
                        'data-time-component': 'hours',
                        'title': 'Pick Hour'
                    }).attr('data-action', 'showHours')));
                    bottomRow.append($('<td>').append($('<a>').attr({
                        href: '#',
                        tabindex: '-1',
                        'title': 'Decrement Hour'
                    }).addClass('btn').attr('data-action', 'decrementHours').append($('<span>').addClass(options.icons.down))));
                }
                if (isEnabled('m')) {
                    if (isEnabled('h')) {
                        topRow.append($('<td>').addClass('separator'));
                        middleRow.append($('<td>').addClass('separator').html(':'));
                        bottomRow.append($('<td>').addClass('separator'));
                    }
                    topRow.append($('<td>').append($('<a>').attr({
                        href: '#',
                        tabindex: '-1',
                        'title': 'Increment Minute'
                    }).addClass('btn').attr('data-action', 'incrementMinutes').append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>').append($('<span>').addClass('timepicker-minute').attr({
                        'data-time-component': 'minutes',
                        'title': 'Pick Minute'
                    }).attr('data-action', 'showMinutes')));
                    bottomRow.append($('<td>').append($('<a>').attr({
                        href: '#',
                        tabindex: '-1',
                        'title': 'Decrement Minute'
                    }).addClass('btn').attr('data-action', 'decrementMinutes').append($('<span>').addClass(options.icons.down))));
                }
                if (isEnabled('s')) {
                    if (isEnabled('m')) {
                        topRow.append($('<td>').addClass('separator'));
                        middleRow.append($('<td>').addClass('separator').html(':'));
                        bottomRow.append($('<td>').addClass('separator'));
                    }
                    topRow.append($('<td>').append($('<a>').attr({
                        href: '#',
                        tabindex: '-1',
                        'title': 'Increment Second'
                    }).addClass('btn').attr('data-action', 'incrementSeconds').append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>').append($('<span>').addClass('timepicker-second').attr({
                        'data-time-component': 'seconds',
                        'title': 'Pick Second'
                    }).attr('data-action', 'showSeconds')));
                    bottomRow.append($('<td>').append($('<a>').attr({
                        href: '#',
                        tabindex: '-1',
                        'title': 'Decrement Second'
                    }).addClass('btn').attr('data-action', 'decrementSeconds').append($('<span>').addClass(options.icons.down))));
                }
                if (!use24Hours) {
                    topRow.append($('<td>').addClass('separator'));
                    middleRow.append($('<td>').append($('<button>').addClass('btn btn-primary').attr({
                        'data-action': 'togglePeriod',
                        tabindex: '-1',
                        'title': 'Toggle Period'
                    })));
                    bottomRow.append($('<td>').addClass('separator'));
                }
                return $('<div>').addClass('timepicker-picker').append($('<table>').addClass('table-condensed').append([topRow, middleRow, bottomRow]));
            },
            getTimePickerTemplate = function() {
                var hoursView = $('<div>').addClass('timepicker-hours').append($('<table>').addClass('table-condensed')),
                    minutesView = $('<div>').addClass('timepicker-minutes').append($('<table>').addClass('table-condensed')),
                    secondsView = $('<div>').addClass('timepicker-seconds').append($('<table>').addClass('table-condensed')),
                    ret = [getTimePickerMainTemplate()];
                if (isEnabled('h')) {
                    ret.push(hoursView);
                }
                if (isEnabled('m')) {
                    ret.push(minutesView);
                }
                if (isEnabled('s')) {
                    ret.push(secondsView);
                }
                return ret;
            },
            getToolbar = function() {
                var row = [];
                if (options.showTodayButton) {
                    row.push($('<td>').append($('<a>').attr({
                        'data-action': 'today',
                        'title': options.tooltips.today
                    }).append($('<span>').addClass(options.icons.today))));
                }
                if (!options.sideBySide && hasDate() && hasTime()) {
                    row.push($('<td>').append($('<a>').attr({
                        'data-action': 'togglePicker',
                        'title': 'Select Time'
                    }).append($('<span>').addClass(options.icons.time))));
                }
                if (options.showClear) {
                    row.push($('<td>').append($('<a>').attr({
                        'data-action': 'clear',
                        'title': options.tooltips.clear
                    }).append($('<span>').addClass(options.icons.clear))));
                }
                if (options.showClose) {
                    row.push($('<td>').append($('<a>').attr({
                        'data-action': 'close',
                        'title': options.tooltips.close
                    }).append($('<span>').addClass(options.icons.close))));
                }
                return $('<table>').addClass('table-condensed').append($('<tbody>').append($('<tr>').append(row)));
            },
            getTemplate = function() {
                var template = $('<div>').addClass('bootstrap-datetimepicker-widget dropdown-menu'),
                    dateView = $('<div>').addClass('datepicker').append(getDatePickerTemplate()),
                    timeView = $('<div>').addClass('timepicker').append(getTimePickerTemplate()),
                    content = $('<ul>').addClass('list-unstyled'),
                    toolbar = $('<li>').addClass('picker-switch' + (options.collapse ? ' accordion-toggle' : '')).append(getToolbar());
                if (options.inline) {
                    template.removeClass('dropdown-menu');
                }
                if (use24Hours) {
                    template.addClass('usetwentyfour');
                }
                if (isEnabled('s') && !use24Hours) {
                    template.addClass('wider');
                }
                if (options.sideBySide && hasDate() && hasTime()) {
                    template.addClass('timepicker-sbs');
                    if (options.toolbarPlacement === 'top') {
                        template.append(toolbar);
                    }
                    template.append($('<div>').addClass('row').append(dateView.addClass('col-md-6')).append(timeView.addClass('col-md-6')));
                    if (options.toolbarPlacement === 'bottom') {
                        template.append(toolbar);
                    }
                    return template;
                }
                if (options.toolbarPlacement === 'top') {
                    content.append(toolbar);
                }
                if (hasDate()) {
                    content.append($('<li>').addClass((options.collapse && hasTime() ? 'collapse in' : '')).append(dateView));
                }
                if (options.toolbarPlacement === 'default') {
                    content.append(toolbar);
                }
                if (hasTime()) {
                    content.append($('<li>').addClass((options.collapse && hasDate() ? 'collapse' : '')).append(timeView));
                }
                if (options.toolbarPlacement === 'bottom') {
                    content.append(toolbar);
                }
                return template.append(content);
            },
            dataToOptions = function() {
                var eData, dataOptions = {};
                if (element.is('input') || options.inline) {
                    eData = element.data();
                } else {
                    eData = element.find('input').data();
                }
                if (eData.dateOptions && eData.dateOptions instanceof Object) {
                    dataOptions = $.extend(true, dataOptions, eData.dateOptions);
                }
                $.each(options, function(key) {
                    var attributeName = 'date' + key.charAt(0).toUpperCase() + key.slice(1);
                    if (eData[attributeName] !== undefined) {
                        dataOptions[key] = eData[attributeName];
                    }
                });
                return dataOptions;
            },
            place = function() {
                var position = (component || element).position(),
                    offset = (component || element).offset(),
                    vertical = options.widgetPositioning.vertical,
                    horizontal = options.widgetPositioning.horizontal,
                    parent;
                if (options.widgetParent) {
                    parent = options.widgetParent.append(widget);
                } else if (element.is('input')) {
                    parent = element.after(widget).parent();
                } else if (options.inline) {
                    parent = element.append(widget);
                    return;
                } else {
                    parent = element;
                    element.children().first().after(widget);
                }
                if (vertical === 'auto') {
                    if (offset.top + widget.height() * 1.5 >= $(window).height() + $(window).scrollTop() && widget.height() + element.outerHeight() < offset.top) {
                        vertical = 'top';
                    } else {
                        vertical = 'bottom';
                    }
                }
                if (horizontal === 'auto') {
                    if (parent.width() < offset.left + widget.outerWidth() / 2 && offset.left + widget.outerWidth() > $(window).width()) {
                        horizontal = 'right';
                    } else {
                        horizontal = 'left';
                    }
                }
                if (vertical === 'top') {
                    widget.addClass('top').removeClass('bottom');
                } else {
                    widget.addClass('bottom').removeClass('top');
                }
                if (horizontal === 'right') {
                    widget.addClass('pull-right');
                } else {
                    widget.removeClass('pull-right');
                }
                if (parent.css('position') !== 'relative') {
                    parent = parent.parents().filter(function() {
                        return $(this).css('position') === 'relative';
                    }).first();
                }
                if (parent.length === 0) {
                    throw new Error('datetimepicker component should be placed within a relative positioned container');
                }
                widget.css({
                    top: vertical === 'top' ? 'auto' : position.top + element.outerHeight(),
                    bottom: vertical === 'top' ? position.top + element.outerHeight() : 'auto',
                    left: horizontal === 'left' ? (parent === element ? 0 : position.left) : 'auto',
                    right: horizontal === 'left' ? 'auto' : parent.outerWidth() - element.outerWidth() - (parent === element ? 0 : position.left)
                });
            },
            notifyEvent = function(e) {
                if (e.type === 'dp.change' && ((e.date && e.date.isSame(e.oldDate)) || (!e.date && !e.oldDate))) {
                    return;
                }
                element.trigger(e);
            },
            viewUpdate = function(e) {
                if (e === 'y') {
                    e = 'YYYY';
                }
                notifyEvent({
                    type: 'dp.update',
                    change: e,
                    viewDate: viewDate.clone()
                });
            },
            showMode = function(dir) {
                if (!widget) {
                    return;
                }
                if (dir) {
                    currentViewMode = Math.max(minViewModeNumber, Math.min(3, currentViewMode + dir));
                }
                widget.find('.datepicker > div').hide().filter('.datepicker-' + datePickerModes[currentViewMode].clsName).show();
            },
            fillDow = function() {
                var row = $('<tr>'),
                    currentDate = viewDate.clone().startOf('w').startOf('d');
                if (options.calendarWeeks === true) {
                    row.append($('<th>').addClass('cw').text('#'));
                }
                while (currentDate.isBefore(viewDate.clone().endOf('w'))) {
                    row.append($('<th>').addClass('dow').text(currentDate.format('dd')));
                    currentDate.add(1, 'd');
                }
                widget.find('.datepicker-days thead').append(row);
            },
            isInDisabledDates = function(testDate) {
                return options.disabledDates[testDate.format('YYYY-MM-DD')] === true;
            },
            isInEnabledDates = function(testDate) {
                return options.enabledDates[testDate.format('YYYY-MM-DD')] === true;
            },
            isInDisabledHours = function(testDate) {
                return options.disabledHours[testDate.format('H')] === true;
            },
            isInEnabledHours = function(testDate) {
                return options.enabledHours[testDate.format('H')] === true;
            },
            isValid = function(targetMoment, granularity) {
                if (!targetMoment.isValid()) {
                    return false;
                }
                if (options.disabledDates && granularity === 'd' && isInDisabledDates(targetMoment)) {
                    return false;
                }
                if (options.enabledDates && granularity === 'd' && !isInEnabledDates(targetMoment)) {
                    return false;
                }
                if (options.minDate && targetMoment.isBefore(options.minDate, granularity)) {
                    return false;
                }
                if (options.maxDate && targetMoment.isAfter(options.maxDate, granularity)) {
                    return false;
                }
                if (options.daysOfWeekDisabled && granularity === 'd' && options.daysOfWeekDisabled.indexOf(targetMoment.day()) !== -1) {
                    return false;
                }
                if (options.disabledHours && (granularity === 'h' || granularity === 'm' || granularity === 's') && isInDisabledHours(targetMoment)) {
                    return false;
                }
                if (options.enabledHours && (granularity === 'h' || granularity === 'm' || granularity === 's') && !isInEnabledHours(targetMoment)) {
                    return false;
                }
                if (options.disabledTimeIntervals && (granularity === 'h' || granularity === 'm' || granularity === 's')) {
                    var found = false;
                    $.each(options.disabledTimeIntervals, function() {
                        if (targetMoment.isBetween(this[0], this[1])) {
                            found = true;
                            return false;
                        }
                    });
                    if (found) {
                        return false;
                    }
                }
                return true;
            },
            fillMonths = function() {
                var spans = [],
                    monthsShort = viewDate.clone().startOf('y').startOf('d');
                while (monthsShort.isSame(viewDate, 'y')) {
                    spans.push($('<span>').attr('data-action', 'selectMonth').addClass('month').text(monthsShort.format('MMM')));
                    monthsShort.add(1, 'M');
                }
                widget.find('.datepicker-months td').empty().append(spans);
            },
            updateMonths = function() {
                var monthsView = widget.find('.datepicker-months'),
                    monthsViewHeader = monthsView.find('th'),
                    months = monthsView.find('tbody').find('span');
                monthsViewHeader.eq(0).find('span').attr('title', options.tooltips.prevYear);
                monthsViewHeader.eq(1).attr('title', options.tooltips.selectYear);
                monthsViewHeader.eq(2).find('span').attr('title', options.tooltips.nextYear);
                monthsView.find('.disabled').removeClass('disabled');
                if (!isValid(viewDate.clone().subtract(1, 'y'), 'y')) {
                    monthsViewHeader.eq(0).addClass('disabled');
                }
                monthsViewHeader.eq(1).text(viewDate.year());
                if (!isValid(viewDate.clone().add(1, 'y'), 'y')) {
                    monthsViewHeader.eq(2).addClass('disabled');
                }
                months.removeClass('active');
                if (date.isSame(viewDate, 'y') && !unset) {
                    months.eq(date.month()).addClass('active');
                }
                months.each(function(index) {
                    if (!isValid(viewDate.clone().month(index), 'M')) {
                        $(this).addClass('disabled');
                    }
                });
            },
            updateYears = function() {
                var yearsView = widget.find('.datepicker-years'),
                    yearsViewHeader = yearsView.find('th'),
                    startYear = viewDate.clone().subtract(5, 'y'),
                    endYear = viewDate.clone().add(6, 'y'),
                    html = '';
                yearsViewHeader.eq(0).find('span').attr('title', options.tooltips.nextDecade);
                yearsViewHeader.eq(1).attr('title', options.tooltips.selectDecade);
                yearsViewHeader.eq(2).find('span').attr('title', options.tooltips.prevDecade);
                yearsView.find('.disabled').removeClass('disabled');
                if (options.minDate && options.minDate.isAfter(startYear, 'y')) {
                    yearsViewHeader.eq(0).addClass('disabled');
                }
                yearsViewHeader.eq(1).text(startYear.year() + '-' + endYear.year());
                if (options.maxDate && options.maxDate.isBefore(endYear, 'y')) {
                    yearsViewHeader.eq(2).addClass('disabled');
                }
                while (!startYear.isAfter(endYear, 'y')) {
                    html += '<span data-action="selectYear" class="year' + (startYear.isSame(date, 'y') && !unset ? ' active' : '') + (!isValid(startYear, 'y') ? ' disabled' : '') + '">' + startYear.year() + '</span>';
                    startYear.add(1, 'y');
                }
                yearsView.find('td').html(html);
            },
            updateDecades = function() {
                var decadesView = widget.find('.datepicker-decades'),
                    decadesViewHeader = decadesView.find('th'),
                    startDecade = viewDate.isBefore(moment({
                        y: 1999
                    })) ? moment({
                        y: 1899
                    }) : moment({
                        y: 1999
                    }),
                    endDecade = startDecade.clone().add(100, 'y'),
                    html = '';
                decadesViewHeader.eq(0).find('span').attr('title', options.tooltips.prevCentury);
                decadesViewHeader.eq(2).find('span').attr('title', options.tooltips.nextCentury);
                decadesView.find('.disabled').removeClass('disabled');
                if (startDecade.isSame(moment({
                        y: 1900
                    })) || (options.minDate && options.minDate.isAfter(startDecade, 'y'))) {
                    decadesViewHeader.eq(0).addClass('disabled');
                }
                decadesViewHeader.eq(1).text(startDecade.year() + '-' + endDecade.year());
                if (startDecade.isSame(moment({
                        y: 2000
                    })) || (options.maxDate && options.maxDate.isBefore(endDecade, 'y'))) {
                    decadesViewHeader.eq(2).addClass('disabled');
                }
                while (!startDecade.isAfter(endDecade, 'y')) {
                    html += '<span data-action="selectDecade" class="decade' + (startDecade.isSame(date, 'y') ? ' active' : '') + (!isValid(startDecade, 'y') ? ' disabled' : '') + '" data-selection="' + (startDecade.year() + 6) + '">' + (startDecade.year() + 1) + ' - ' + (startDecade.year() + 12) + '</span>';
                    startDecade.add(12, 'y');
                }
                html += '<span></span><span></span><span></span>';
                decadesView.find('td').html(html);
            },
            fillDate = function() {
                var daysView = widget.find('.datepicker-days'),
                    daysViewHeader = daysView.find('th'),
                    currentDate, html = [],
                    row, clsName, i;
                if (!hasDate()) {
                    return;
                }
                daysViewHeader.eq(0).find('span').attr('title', options.tooltips.prevMonth);
                daysViewHeader.eq(1).attr('title', options.tooltips.selectMonth);
                daysViewHeader.eq(2).find('span').attr('title', options.tooltips.nextMonth);
                daysView.find('.disabled').removeClass('disabled');
                daysViewHeader.eq(1).text(viewDate.format(options.dayViewHeaderFormat));
                if (!isValid(viewDate.clone().subtract(1, 'M'), 'M')) {
                    daysViewHeader.eq(0).addClass('disabled');
                }
                if (!isValid(viewDate.clone().add(1, 'M'), 'M')) {
                    daysViewHeader.eq(2).addClass('disabled');
                }
                currentDate = viewDate.clone().startOf('M').startOf('w').startOf('d');
                for (i = 0; i < 42; i++) {
                    if (currentDate.weekday() === 0) {
                        row = $('<tr>');
                        if (options.calendarWeeks) {
                            row.append('<td class="cw">' + currentDate.week() + '</td>');
                        }
                        html.push(row);
                    }
                    clsName = '';
                    if (currentDate.isBefore(viewDate, 'M')) {
                        clsName += ' old';
                    }
                    if (currentDate.isAfter(viewDate, 'M')) {
                        clsName += ' new';
                    }
                    if (currentDate.isSame(date, 'd') && !unset) {
                        clsName += ' active';
                    }
                    if (!isValid(currentDate, 'd')) {
                        clsName += ' disabled';
                    }
                    if (currentDate.isSame(moment(), 'd')) {
                        clsName += ' today';
                    }
                    if (currentDate.day() === 0 || currentDate.day() === 6) {
                        clsName += ' weekend';
                    }
                    row.append('<td data-action="selectDay" data-day="' + currentDate.format('L') + '" class="day' + clsName + '">' + currentDate.date() + '</td>');
                    currentDate.add(1, 'd');
                }
                daysView.find('tbody').empty().append(html);
                updateMonths();
                updateYears();
                updateDecades();
            },
            fillHours = function() {
                var table = widget.find('.timepicker-hours table'),
                    currentHour = viewDate.clone().startOf('d'),
                    html = [],
                    row = $('<tr>');
                if (viewDate.hour() > 11 && !use24Hours) {
                    currentHour.hour(12);
                }
                while (currentHour.isSame(viewDate, 'd') && (use24Hours || (viewDate.hour() < 12 && currentHour.hour() < 12) || viewDate.hour() > 11)) {
                    if (currentHour.hour() % 4 === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectHour" class="hour' + (!isValid(currentHour, 'h') ? ' disabled' : '') + '">' + currentHour.format(use24Hours ? 'HH' : 'hh') + '</td>');
                    currentHour.add(1, 'h');
                }
                table.empty().append(html);
            },
            fillMinutes = function() {
                var table = widget.find('.timepicker-minutes table'),
                    currentMinute = viewDate.clone().startOf('h'),
                    html = [],
                    row = $('<tr>'),
                    step = options.stepping === 1 ? 5 : options.stepping;
                while (viewDate.isSame(currentMinute, 'h')) {
                    if (currentMinute.minute() % (step * 4) === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectMinute" class="minute' + (!isValid(currentMinute, 'm') ? ' disabled' : '') + '">' + currentMinute.format('mm') + '</td>');
                    currentMinute.add(step, 'm');
                }
                table.empty().append(html);
            },
            fillSeconds = function() {
                var table = widget.find('.timepicker-seconds table'),
                    currentSecond = viewDate.clone().startOf('m'),
                    html = [],
                    row = $('<tr>');
                while (viewDate.isSame(currentSecond, 'm')) {
                    if (currentSecond.second() % 20 === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectSecond" class="second' + (!isValid(currentSecond, 's') ? ' disabled' : '') + '">' + currentSecond.format('ss') + '</td>');
                    currentSecond.add(5, 's');
                }
                table.empty().append(html);
            },
            fillTime = function() {
                var toggle, newDate, timeComponents = widget.find('.timepicker span[data-time-component]');
                if (!use24Hours) {
                    toggle = widget.find('.timepicker [data-action=togglePeriod]');
                    newDate = date.clone().add((date.hours() >= 12) ? -12 : 12, 'h');
                    toggle.text(date.format('A'));
                    if (isValid(newDate, 'h')) {
                        toggle.removeClass('disabled');
                    } else {
                        toggle.addClass('disabled');
                    }
                }
                timeComponents.filter('[data-time-component=hours]').text(date.format(use24Hours ? 'HH' : 'hh'));
                timeComponents.filter('[data-time-component=minutes]').text(date.format('mm'));
                timeComponents.filter('[data-time-component=seconds]').text(date.format('ss'));
                fillHours();
                fillMinutes();
                fillSeconds();
            },
            update = function() {
                if (!widget) {
                    return;
                }
                fillDate();
                fillTime();
            },
            setValue = function(targetMoment) {
                var oldDate = unset ? null : date;
                if (!targetMoment) {
                    unset = true;
                    input.val('');
                    element.data('date', '');
                    notifyEvent({
                        type: 'dp.change',
                        date: false,
                        oldDate: oldDate
                    });
                    update();
                    return;
                }
                targetMoment = targetMoment.clone().locale(options.locale);
                if (options.stepping !== 1) {
                    targetMoment.minutes((Math.round(targetMoment.minutes() / options.stepping) * options.stepping) % 60).seconds(0);
                }
                if (isValid(targetMoment)) {
                    date = targetMoment;
                    viewDate = date.clone();
                    input.val(date.format(actualFormat));
                    element.data('date', date.format(actualFormat));
                    unset = false;
                    update();
                    notifyEvent({
                        type: 'dp.change',
                        date: date.clone(),
                        oldDate: oldDate
                    });
                } else {
                    if (!options.keepInvalid) {
                        input.val(unset ? '' : date.format(actualFormat));
                    }
                    notifyEvent({
                        type: 'dp.error',
                        date: targetMoment
                    });
                }
            },
            hide = function() {
                var transitioning = false;
                if (!widget) {
                    return picker;
                }
                widget.find('.collapse').each(function() {
                    var collapseData = $(this).data('collapse');
                    if (collapseData && collapseData.transitioning) {
                        transitioning = true;
                        return false;
                    }
                    return true;
                });
                if (transitioning) {
                    return picker;
                }
                if (component && component.hasClass('btn')) {
                    component.toggleClass('active');
                }
                widget.hide();
                $(window).off('resize', place);
                widget.off('click', '[data-action]');
                widget.off('mousedown', false);
                widget.remove();
                widget = false;
                notifyEvent({
                    type: 'dp.hide',
                    date: date.clone()
                });
                input.blur();
                return picker;
            },
            clear = function() {
                setValue(null);
            },
            actions = {
                next: function() {
                    var navFnc = datePickerModes[currentViewMode].navFnc;
                    viewDate.add(datePickerModes[currentViewMode].navStep, navFnc);
                    fillDate();
                    viewUpdate(navFnc);
                },
                previous: function() {
                    var navFnc = datePickerModes[currentViewMode].navFnc;
                    viewDate.subtract(datePickerModes[currentViewMode].navStep, navFnc);
                    fillDate();
                    viewUpdate(navFnc);
                },
                pickerSwitch: function() {
                    showMode(1);
                },
                selectMonth: function(e) {
                    var month = $(e.target).closest('tbody').find('span').index($(e.target));
                    viewDate.month(month);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()).month(viewDate.month()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                    viewUpdate('M');
                },
                selectYear: function(e) {
                    var year = parseInt($(e.target).text(), 10) || 0;
                    viewDate.year(year);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                    viewUpdate('YYYY');
                },
                selectDecade: function(e) {
                    var year = parseInt($(e.target).data('selection'), 10) || 0;
                    viewDate.year(year);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                    viewUpdate('YYYY');
                },
                selectDay: function(e) {
                    var day = viewDate.clone();
                    if ($(e.target).is('.old')) {
                        day.subtract(1, 'M');
                    }
                    if ($(e.target).is('.new')) {
                        day.add(1, 'M');
                    }
                    setValue(day.date(parseInt($(e.target).text(), 10)));
                    if (!hasTime() && !options.keepOpen && !options.inline) {
                        hide();
                    }
                },
                incrementHours: function() {
                    var newDate = date.clone().add(1, 'h');
                    if (isValid(newDate, 'h')) {
                        setValue(newDate);
                    }
                },
                incrementMinutes: function() {
                    var newDate = date.clone().add(options.stepping, 'm');
                    if (isValid(newDate, 'm')) {
                        setValue(newDate);
                    }
                },
                incrementSeconds: function() {
                    var newDate = date.clone().add(1, 's');
                    if (isValid(newDate, 's')) {
                        setValue(newDate);
                    }
                },
                decrementHours: function() {
                    var newDate = date.clone().subtract(1, 'h');
                    if (isValid(newDate, 'h')) {
                        setValue(newDate);
                    }
                },
                decrementMinutes: function() {
                    var newDate = date.clone().subtract(options.stepping, 'm');
                    if (isValid(newDate, 'm')) {
                        setValue(newDate);
                    }
                },
                decrementSeconds: function() {
                    var newDate = date.clone().subtract(1, 's');
                    if (isValid(newDate, 's')) {
                        setValue(newDate);
                    }
                },
                togglePeriod: function() {
                    setValue(date.clone().add((date.hours() >= 12) ? -12 : 12, 'h'));
                },
                togglePicker: function(e) {
                    var $this = $(e.target),
                        $parent = $this.closest('ul'),
                        expanded = $parent.find('.in'),
                        closed = $parent.find('.collapse:not(.in)'),
                        collapseData;
                    if (expanded && expanded.length) {
                        collapseData = expanded.data('collapse');
                        if (collapseData && collapseData.transitioning) {
                            return;
                        }
                        if (expanded.collapse) {
                            expanded.collapse('hide');
                            closed.collapse('show');
                        } else {
                            expanded.removeClass('in');
                            closed.addClass('in');
                        }
                        if ($this.is('span')) {
                            $this.toggleClass(options.icons.time + ' ' + options.icons.date);
                        } else {
                            $this.find('span').toggleClass(options.icons.time + ' ' + options.icons.date);
                        }
                    }
                },
                showPicker: function() {
                    widget.find('.timepicker > div:not(.timepicker-picker)').hide();
                    widget.find('.timepicker .timepicker-picker').show();
                },
                showHours: function() {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-hours').show();
                },
                showMinutes: function() {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-minutes').show();
                },
                showSeconds: function() {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-seconds').show();
                },
                selectHour: function(e) {
                    var hour = parseInt($(e.target).text(), 10);
                    if (!use24Hours) {
                        if (date.hours() >= 12) {
                            if (hour !== 12) {
                                hour += 12;
                            }
                        } else {
                            if (hour === 12) {
                                hour = 0;
                            }
                        }
                    }
                    setValue(date.clone().hours(hour));
                    actions.showPicker.call(picker);
                },
                selectMinute: function(e) {
                    setValue(date.clone().minutes(parseInt($(e.target).text(), 10)));
                    actions.showPicker.call(picker);
                },
                selectSecond: function(e) {
                    setValue(date.clone().seconds(parseInt($(e.target).text(), 10)));
                    actions.showPicker.call(picker);
                },
                clear: clear,
                today: function() {
                    if (isValid(moment(), 'd')) {
                        setValue(moment());
                    }
                },
                close: hide
            },
            doAction = function(e) {
                if ($(e.currentTarget).is('.disabled')) {
                    return false;
                }
                actions[$(e.currentTarget).data('action')].apply(picker, arguments);
                return false;
            },
            show = function() {
                var currentMoment, useCurrentGranularity = {
                    'year': function(m) {
                        return m.month(0).date(1).hours(0).seconds(0).minutes(0);
                    },
                    'month': function(m) {
                        return m.date(1).hours(0).seconds(0).minutes(0);
                    },
                    'day': function(m) {
                        return m.hours(0).seconds(0).minutes(0);
                    },
                    'hour': function(m) {
                        return m.seconds(0).minutes(0);
                    },
                    'minute': function(m) {
                        return m.seconds(0);
                    }
                };
                if (input.prop('disabled') || (!options.ignoreReadonly && input.prop('readonly')) || widget) {
                    return picker;
                }
                if (input.val() !== undefined && input.val().trim().length !== 0) {
                    setValue(parseInputDate(input.val().trim()));
                } else if (options.useCurrent && unset && ((input.is('input') && input.val().trim().length === 0) || options.inline)) {
                    currentMoment = moment();
                    if (typeof options.useCurrent === 'string') {
                        currentMoment = useCurrentGranularity[options.useCurrent](currentMoment);
                    }
                    setValue(currentMoment);
                }
                widget = getTemplate();
                fillDow();
                fillMonths();
                widget.find('.timepicker-hours').hide();
                widget.find('.timepicker-minutes').hide();
                widget.find('.timepicker-seconds').hide();
                update();
                showMode();
                $(window).on('resize', place);
                widget.on('click', '[data-action]', doAction);
                widget.on('mousedown', false);
                if (component && component.hasClass('btn')) {
                    component.toggleClass('active');
                }
                widget.show();
                place();
                if (options.focusOnShow && !input.is(':focus')) {
                    input.focus();
                }
                notifyEvent({
                    type: 'dp.show'
                });
                return picker;
            },
            toggle = function() {
                return (widget ? hide() : show());
            },
            parseInputDate = function(inputDate) {
                if (options.parseInputDate === undefined) {
                    if (moment.isMoment(inputDate) || inputDate instanceof Date) {
                        inputDate = moment(inputDate);
                    } else {
                        inputDate = moment(inputDate, parseFormats, options.useStrict);
                    }
                } else {
                    inputDate = options.parseInputDate(inputDate);
                }
                inputDate.locale(options.locale);
                return inputDate;
            },
            keydown = function(e) {
                var handler = null,
                    index, index2, pressedKeys = [],
                    pressedModifiers = {},
                    currentKey = e.which,
                    keyBindKeys, allModifiersPressed, pressed = 'p';
                keyState[currentKey] = pressed;
                for (index in keyState) {
                    if (keyState.hasOwnProperty(index) && keyState[index] === pressed) {
                        pressedKeys.push(index);
                        if (parseInt(index, 10) !== currentKey) {
                            pressedModifiers[index] = true;
                        }
                    }
                }
                for (index in options.keyBinds) {
                    if (options.keyBinds.hasOwnProperty(index) && typeof(options.keyBinds[index]) === 'function') {
                        keyBindKeys = index.split(' ');
                        if (keyBindKeys.length === pressedKeys.length && keyMap[currentKey] === keyBindKeys[keyBindKeys.length - 1]) {
                            allModifiersPressed = true;
                            for (index2 = keyBindKeys.length - 2; index2 >= 0; index2--) {
                                if (!(keyMap[keyBindKeys[index2]] in pressedModifiers)) {
                                    allModifiersPressed = false;
                                    break;
                                }
                            }
                            if (allModifiersPressed) {
                                handler = options.keyBinds[index];
                                break;
                            }
                        }
                    }
                }
                if (handler) {
                    handler.call(picker, widget);
                    e.stopPropagation();
                    e.preventDefault();
                }
            },
            keyup = function(e) {
                keyState[e.which] = 'r';
                e.stopPropagation();
                e.preventDefault();
            },
            change = function(e) {
                var val = $(e.target).val().trim(),
                    parsedDate = val ? parseInputDate(val) : null;
                setValue(parsedDate);
                e.stopImmediatePropagation();
                return false;
            },
            attachDatePickerElementEvents = function() {
                input.on({
                    'change': change,
                    'blur': options.debug ? '' : hide,
                    'keydown': keydown,
                    'keyup': keyup,
                    'focus': options.allowInputToggle ? show : ''
                });
                if (element.is('input')) {
                    input.on({
                        'focus': show
                    });
                } else if (component) {
                    component.on('click', toggle);
                    component.on('mousedown', false);
                }
            },
            detachDatePickerElementEvents = function() {
                input.off({
                    'change': change,
                    'blur': blur,
                    'keydown': keydown,
                    'keyup': keyup,
                    'focus': options.allowInputToggle ? hide : ''
                });
                if (element.is('input')) {
                    input.off({
                        'focus': show
                    });
                } else if (component) {
                    component.off('click', toggle);
                    component.off('mousedown', false);
                }
            },
            indexGivenDates = function(givenDatesArray) {
                var givenDatesIndexed = {};
                $.each(givenDatesArray, function() {
                    var dDate = parseInputDate(this);
                    if (dDate.isValid()) {
                        givenDatesIndexed[dDate.format('YYYY-MM-DD')] = true;
                    }
                });
                return (Object.keys(givenDatesIndexed).length) ? givenDatesIndexed : false;
            },
            indexGivenHours = function(givenHoursArray) {
                var givenHoursIndexed = {};
                $.each(givenHoursArray, function() {
                    givenHoursIndexed[this] = true;
                });
                return (Object.keys(givenHoursIndexed).length) ? givenHoursIndexed : false;
            },
            initFormatting = function() {
                var format = options.format || 'L LT';
                actualFormat = format.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function(formatInput) {
                    var newinput = date.localeData().longDateFormat(formatInput) || formatInput;
                    return newinput.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function(formatInput2) {
                        return date.localeData().longDateFormat(formatInput2) || formatInput2;
                    });
                });
                parseFormats = options.extraFormats ? options.extraFormats.slice() : [];
                if (parseFormats.indexOf(format) < 0 && parseFormats.indexOf(actualFormat) < 0) {
                    parseFormats.push(actualFormat);
                }
                use24Hours = (actualFormat.toLowerCase().indexOf('a') < 1 && actualFormat.replace(/\[.*?\]/g, '').indexOf('h') < 1);
                if (isEnabled('y')) {
                    minViewModeNumber = 2;
                }
                if (isEnabled('M')) {
                    minViewModeNumber = 1;
                }
                if (isEnabled('d')) {
                    minViewModeNumber = 0;
                }
                currentViewMode = Math.max(minViewModeNumber, currentViewMode);
                if (!unset) {
                    setValue(date);
                }
            };
        picker.destroy = function() {
            hide();
            detachDatePickerElementEvents();
            element.removeData('DateTimePicker');
            element.removeData('date');
        };
        picker.toggle = toggle;
        picker.show = show;
        picker.hide = hide;
        picker.disable = function() {
            hide();
            if (component && component.hasClass('btn')) {
                component.addClass('disabled');
            }
            input.prop('disabled', true);
            return picker;
        };
        picker.enable = function() {
            if (component && component.hasClass('btn')) {
                component.removeClass('disabled');
            }
            input.prop('disabled', false);
            return picker;
        };
        picker.ignoreReadonly = function(ignoreReadonly) {
            if (arguments.length === 0) {
                return options.ignoreReadonly;
            }
            if (typeof ignoreReadonly !== 'boolean') {
                throw new TypeError('ignoreReadonly () expects a boolean parameter');
            }
            options.ignoreReadonly = ignoreReadonly;
            return picker;
        };
        picker.options = function(newOptions) {
            if (arguments.length === 0) {
                return $.extend(true, {}, options);
            }
            if (!(newOptions instanceof Object)) {
                throw new TypeError('options() options parameter should be an object');
            }
            $.extend(true, options, newOptions);
            $.each(options, function(key, value) {
                if (picker[key] !== undefined) {
                    picker[key](value);
                } else {
                    throw new TypeError('option ' + key + ' is not recognized!');
                }
            });
            return picker;
        };
        picker.date = function(newDate) {
            if (arguments.length === 0) {
                if (unset) {
                    return null;
                }
                return date.clone();
            }
            if (newDate !== null && typeof newDate !== 'string' && !moment.isMoment(newDate) && !(newDate instanceof Date)) {
                throw new TypeError('date() parameter must be one of [null, string, moment or Date]');
            }
            setValue(newDate === null ? null : parseInputDate(newDate));
            return picker;
        };
        picker.format = function(newFormat) {
            if (arguments.length === 0) {
                return options.format;
            }
            if ((typeof newFormat !== 'string') && ((typeof newFormat !== 'boolean') || (newFormat !== false))) {
                throw new TypeError('format() expects a sting or boolean:false parameter ' + newFormat);
            }
            options.format = newFormat;
            if (actualFormat) {
                initFormatting();
            }
            return picker;
        };
        picker.dayViewHeaderFormat = function(newFormat) {
            if (arguments.length === 0) {
                return options.dayViewHeaderFormat;
            }
            if (typeof newFormat !== 'string') {
                throw new TypeError('dayViewHeaderFormat() expects a string parameter');
            }
            options.dayViewHeaderFormat = newFormat;
            return picker;
        };
        picker.extraFormats = function(formats) {
            if (arguments.length === 0) {
                return options.extraFormats;
            }
            if (formats !== false && !(formats instanceof Array)) {
                throw new TypeError('extraFormats() expects an array or false parameter');
            }
            options.extraFormats = formats;
            if (parseFormats) {
                initFormatting();
            }
            return picker;
        };
        picker.disabledDates = function(dates) {
            if (arguments.length === 0) {
                return (options.disabledDates ? $.extend({}, options.disabledDates) : options.disabledDates);
            }
            if (!dates) {
                options.disabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('disabledDates() expects an array parameter');
            }
            options.disabledDates = indexGivenDates(dates);
            options.enabledDates = false;
            update();
            return picker;
        };
        picker.enabledDates = function(dates) {
            if (arguments.length === 0) {
                return (options.enabledDates ? $.extend({}, options.enabledDates) : options.enabledDates);
            }
            if (!dates) {
                options.enabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('enabledDates() expects an array parameter');
            }
            options.enabledDates = indexGivenDates(dates);
            options.disabledDates = false;
            update();
            return picker;
        };
        picker.daysOfWeekDisabled = function(daysOfWeekDisabled) {
            if (arguments.length === 0) {
                return options.daysOfWeekDisabled.splice(0);
            }
            if ((typeof daysOfWeekDisabled === 'boolean') && !daysOfWeekDisabled) {
                options.daysOfWeekDisabled = false;
                update();
                return picker;
            }
            if (!(daysOfWeekDisabled instanceof Array)) {
                throw new TypeError('daysOfWeekDisabled() expects an array parameter');
            }
            options.daysOfWeekDisabled = daysOfWeekDisabled.reduce(function(previousValue, currentValue) {
                currentValue = parseInt(currentValue, 10);
                if (currentValue > 6 || currentValue < 0 || isNaN(currentValue)) {
                    return previousValue;
                }
                if (previousValue.indexOf(currentValue) === -1) {
                    previousValue.push(currentValue);
                }
                return previousValue;
            }, []).sort();
            if (options.useCurrent && !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, 'd')) {
                    date.add(1, 'd');
                    if (tries === 7) {
                        throw 'Tried 7 times to find a valid date';
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        };
        picker.maxDate = function(maxDate) {
            if (arguments.length === 0) {
                return options.maxDate ? options.maxDate.clone() : options.maxDate;
            }
            if ((typeof maxDate === 'boolean') && maxDate === false) {
                options.maxDate = false;
                update();
                return picker;
            }
            if (typeof maxDate === 'string') {
                if (maxDate === 'now' || maxDate === 'moment') {
                    maxDate = moment();
                }
            }
            var parsedDate = parseInputDate(maxDate);
            if (!parsedDate.isValid()) {
                throw new TypeError('maxDate() Could not parse date parameter: ' + maxDate);
            }
            if (options.minDate && parsedDate.isBefore(options.minDate)) {
                throw new TypeError('maxDate() date parameter is before options.minDate: ' + parsedDate.format(actualFormat));
            }
            options.maxDate = parsedDate;
            if (options.useCurrent && !options.keepInvalid && date.isAfter(maxDate)) {
                setValue(options.maxDate);
            }
            if (viewDate.isAfter(parsedDate)) {
                viewDate = parsedDate.clone().subtract(options.stepping, 'm');
            }
            update();
            return picker;
        };
        picker.minDate = function(minDate) {
            if (arguments.length === 0) {
                return options.minDate ? options.minDate.clone() : options.minDate;
            }
            if ((typeof minDate === 'boolean') && minDate === false) {
                options.minDate = false;
                update();
                return picker;
            }
            if (typeof minDate === 'string') {
                if (minDate === 'now' || minDate === 'moment') {
                    minDate = moment();
                }
            }
            var parsedDate = parseInputDate(minDate);
            if (!parsedDate.isValid()) {
                throw new TypeError('minDate() Could not parse date parameter: ' + minDate);
            }
            if (options.maxDate && parsedDate.isAfter(options.maxDate)) {
                throw new TypeError('minDate() date parameter is after options.maxDate: ' + parsedDate.format(actualFormat));
            }
            options.minDate = parsedDate;
            if (options.useCurrent && !options.keepInvalid && date.isBefore(minDate)) {
                setValue(options.minDate);
            }
            if (viewDate.isBefore(parsedDate)) {
                viewDate = parsedDate.clone().add(options.stepping, 'm');
            }
            update();
            return picker;
        };
        picker.defaultDate = function(defaultDate) {
            if (arguments.length === 0) {
                return options.defaultDate ? options.defaultDate.clone() : options.defaultDate;
            }
            if (!defaultDate) {
                options.defaultDate = false;
                return picker;
            }
            if (typeof defaultDate === 'string') {
                if (defaultDate === 'now' || defaultDate === 'moment') {
                    defaultDate = moment();
                }
            }
            var parsedDate = parseInputDate(defaultDate);
            if (!parsedDate.isValid()) {
                throw new TypeError('defaultDate() Could not parse date parameter: ' + defaultDate);
            }
            if (!isValid(parsedDate)) {
                throw new TypeError('defaultDate() date passed is invalid according to component setup validations');
            }
            options.defaultDate = parsedDate;
            if (options.defaultDate && options.inline || (input.val().trim() === '' && input.attr('placeholder') === undefined)) {
                setValue(options.defaultDate);
            }
            return picker;
        };
        picker.locale = function(locale) {
            if (arguments.length === 0) {
                return options.locale;
            }
            if (!moment.localeData(locale)) {
                throw new TypeError('locale() locale ' + locale + ' is not loaded from moment locales!');
            }
            options.locale = locale;
            date.locale(options.locale);
            viewDate.locale(options.locale);
            if (actualFormat) {
                initFormatting();
            }
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
        picker.stepping = function(stepping) {
            if (arguments.length === 0) {
                return options.stepping;
            }
            stepping = parseInt(stepping, 10);
            if (isNaN(stepping) || stepping < 1) {
                stepping = 1;
            }
            options.stepping = stepping;
            return picker;
        };
        picker.useCurrent = function(useCurrent) {
            var useCurrentOptions = ['year', 'month', 'day', 'hour', 'minute'];
            if (arguments.length === 0) {
                return options.useCurrent;
            }
            if ((typeof useCurrent !== 'boolean') && (typeof useCurrent !== 'string')) {
                throw new TypeError('useCurrent() expects a boolean or string parameter');
            }
            if (typeof useCurrent === 'string' && useCurrentOptions.indexOf(useCurrent.toLowerCase()) === -1) {
                throw new TypeError('useCurrent() expects a string parameter of ' + useCurrentOptions.join(', '));
            }
            options.useCurrent = useCurrent;
            return picker;
        };
        picker.collapse = function(collapse) {
            if (arguments.length === 0) {
                return options.collapse;
            }
            if (typeof collapse !== 'boolean') {
                throw new TypeError('collapse() expects a boolean parameter');
            }
            if (options.collapse === collapse) {
                return picker;
            }
            options.collapse = collapse;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
        picker.icons = function(icons) {
            if (arguments.length === 0) {
                return $.extend({}, options.icons);
            }
            if (!(icons instanceof Object)) {
                throw new TypeError('icons() expects parameter to be an Object');
            }
            $.extend(options.icons, icons);
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
        picker.tooltips = function(tooltips) {
            if (arguments.length === 0) {
                return $.extend({}, options.tooltips);
            }
            if (!(tooltips instanceof Object)) {
                throw new TypeError('tooltips() expects parameter to be an Object');
            }
            $.extend(options.tooltips, tooltips);
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
        picker.useStrict = function(useStrict) {
            if (arguments.length === 0) {
                return options.useStrict;
            }
            if (typeof useStrict !== 'boolean') {
                throw new TypeError('useStrict() expects a boolean parameter');
            }
            options.useStrict = useStrict;
            return picker;
        };
        picker.sideBySide = function(sideBySide) {
            if (arguments.length === 0) {
                return options.sideBySide;
            }
            if (typeof sideBySide !== 'boolean') {
                throw new TypeError('sideBySide() expects a boolean parameter');
            }
            options.sideBySide = sideBySide;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
        picker.viewMode = function(viewMode) {
            if (arguments.length === 0) {
                return options.viewMode;
            }
            if (typeof viewMode !== 'string') {
                throw new TypeError('viewMode() expects a string parameter');
            }
            if (viewModes.indexOf(viewMode) === -1) {
                throw new TypeError('viewMode() parameter must be one of (' + viewModes.join(', ') + ') value');
            }
            options.viewMode = viewMode;
            currentViewMode = Math.max(viewModes.indexOf(viewMode), minViewModeNumber);
            showMode();
            return picker;
        };
        picker.toolbarPlacement = function(toolbarPlacement) {
            if (arguments.length === 0) {
                return options.toolbarPlacement;
            }
            if (typeof toolbarPlacement !== 'string') {
                throw new TypeError('toolbarPlacement() expects a string parameter');
            }
            if (toolbarPlacements.indexOf(toolbarPlacement) === -1) {
                throw new TypeError('toolbarPlacement() parameter must be one of (' + toolbarPlacements.join(', ') + ') value');
            }
            options.toolbarPlacement = toolbarPlacement;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
        picker.widgetPositioning = function(widgetPositioning) {
            if (arguments.length === 0) {
                return $.extend({}, options.widgetPositioning);
            }
            if (({}).toString.call(widgetPositioning) !== '[object Object]') {
                throw new TypeError('widgetPositioning() expects an object variable');
            }
            if (widgetPositioning.horizontal) {
                if (typeof widgetPositioning.horizontal !== 'string') {
                    throw new TypeError('widgetPositioning() horizontal variable must be a string');
                }
                widgetPositioning.horizontal = widgetPositioning.horizontal.toLowerCase();
                if (horizontalModes.indexOf(widgetPositioning.horizontal) === -1) {
                    throw new TypeError('widgetPositioning() expects horizontal parameter to be one of (' + horizontalModes.join(', ') + ')');
                }
                options.widgetPositioning.horizontal = widgetPositioning.horizontal;
            }
            if (widgetPositioning.vertical) {
                if (typeof widgetPositioning.vertical !== 'string') {
                    throw new TypeError('widgetPositioning() vertical variable must be a string');
                }
                widgetPositioning.vertical = widgetPositioning.vertical.toLowerCase();
                if (verticalModes.indexOf(widgetPositioning.vertical) === -1) {
                    throw new TypeError('widgetPositioning() expects vertical parameter to be one of (' + verticalModes.join(', ') + ')');
                }
                options.widgetPositioning.vertical = widgetPositioning.vertical;
            }
            update();
            return picker;
        };
        picker.calendarWeeks = function(calendarWeeks) {
            if (arguments.length === 0) {
                return options.calendarWeeks;
            }
            if (typeof calendarWeeks !== 'boolean') {
                throw new TypeError('calendarWeeks() expects parameter to be a boolean value');
            }
            options.calendarWeeks = calendarWeeks;
            update();
            return picker;
        };
        picker.showTodayButton = function(showTodayButton) {
            if (arguments.length === 0) {
                return options.showTodayButton;
            }
            if (typeof showTodayButton !== 'boolean') {
                throw new TypeError('showTodayButton() expects a boolean parameter');
            }
            options.showTodayButton = showTodayButton;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
        picker.showClear = function(showClear) {
            if (arguments.length === 0) {
                return options.showClear;
            }
            if (typeof showClear !== 'boolean') {
                throw new TypeError('showClear() expects a boolean parameter');
            }
            options.showClear = showClear;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
        picker.widgetParent = function(widgetParent) {
            if (arguments.length === 0) {
                return options.widgetParent;
            }
            if (typeof widgetParent === 'string') {
                widgetParent = $(widgetParent);
            }
            if (widgetParent !== null && (typeof widgetParent !== 'string' && !(widgetParent instanceof $))) {
                throw new TypeError('widgetParent() expects a string or a jQuery object parameter');
            }
            options.widgetParent = widgetParent;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };
        picker.keepOpen = function(keepOpen) {
            if (arguments.length === 0) {
                return options.keepOpen;
            }
            if (typeof keepOpen !== 'boolean') {
                throw new TypeError('keepOpen() expects a boolean parameter');
            }
            options.keepOpen = keepOpen;
            return picker;
        };
        picker.focusOnShow = function(focusOnShow) {
            if (arguments.length === 0) {
                return options.focusOnShow;
            }
            if (typeof focusOnShow !== 'boolean') {
                throw new TypeError('focusOnShow() expects a boolean parameter');
            }
            options.focusOnShow = focusOnShow;
            return picker;
        };
        picker.inline = function(inline) {
            if (arguments.length === 0) {
                return options.inline;
            }
            if (typeof inline !== 'boolean') {
                throw new TypeError('inline() expects a boolean parameter');
            }
            options.inline = inline;
            return picker;
        };
        picker.clear = function() {
            clear();
            return picker;
        };
        picker.keyBinds = function(keyBinds) {
            options.keyBinds = keyBinds;
            return picker;
        };
        picker.debug = function(debug) {
            if (typeof debug !== 'boolean') {
                throw new TypeError('debug() expects a boolean parameter');
            }
            options.debug = debug;
            return picker;
        };
        picker.allowInputToggle = function(allowInputToggle) {
            if (arguments.length === 0) {
                return options.allowInputToggle;
            }
            if (typeof allowInputToggle !== 'boolean') {
                throw new TypeError('allowInputToggle() expects a boolean parameter');
            }
            options.allowInputToggle = allowInputToggle;
            return picker;
        };
        picker.showClose = function(showClose) {
            if (arguments.length === 0) {
                return options.showClose;
            }
            if (typeof showClose !== 'boolean') {
                throw new TypeError('showClose() expects a boolean parameter');
            }
            options.showClose = showClose;
            return picker;
        };
        picker.keepInvalid = function(keepInvalid) {
            if (arguments.length === 0) {
                return options.keepInvalid;
            }
            if (typeof keepInvalid !== 'boolean') {
                throw new TypeError('keepInvalid() expects a boolean parameter');
            }
            options.keepInvalid = keepInvalid;
            return picker;
        };
        picker.datepickerInput = function(datepickerInput) {
            if (arguments.length === 0) {
                return options.datepickerInput;
            }
            if (typeof datepickerInput !== 'string') {
                throw new TypeError('datepickerInput() expects a string parameter');
            }
            options.datepickerInput = datepickerInput;
            return picker;
        };
        picker.parseInputDate = function(parseInputDate) {
            if (arguments.length === 0) {
                return options.parseInputDate;
            }
            if (typeof parseInputDate !== 'function') {
                throw new TypeError('parseInputDate() sholud be as function');
            }
            options.parseInputDate = parseInputDate;
            return picker;
        };
        picker.disabledTimeIntervals = function(disabledTimeIntervals) {
            if (arguments.length === 0) {
                return (options.disabledTimeIntervals ? $.extend({}, options.disabledTimeIntervals) : options.disabledTimeIntervals);
            }
            if (!disabledTimeIntervals) {
                options.disabledTimeIntervals = false;
                update();
                return picker;
            }
            if (!(disabledTimeIntervals instanceof Array)) {
                throw new TypeError('disabledTimeIntervals() expects an array parameter');
            }
            options.disabledTimeIntervals = disabledTimeIntervals;
            update();
            return picker;
        };
        picker.disabledHours = function(hours) {
            if (arguments.length === 0) {
                return (options.disabledHours ? $.extend({}, options.disabledHours) : options.disabledHours);
            }
            if (!hours) {
                options.disabledHours = false;
                update();
                return picker;
            }
            if (!(hours instanceof Array)) {
                throw new TypeError('disabledHours() expects an array parameter');
            }
            options.disabledHours = indexGivenHours(hours);
            options.enabledHours = false;
            if (options.useCurrent && !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, 'h')) {
                    date.add(1, 'h');
                    if (tries === 24) {
                        throw 'Tried 24 times to find a valid date';
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        };
        picker.enabledHours = function(hours) {
            if (arguments.length === 0) {
                return (options.enabledHours ? $.extend({}, options.enabledHours) : options.enabledHours);
            }
            if (!hours) {
                options.enabledHours = false;
                update();
                return picker;
            }
            if (!(hours instanceof Array)) {
                throw new TypeError('enabledHours() expects an array parameter');
            }
            options.enabledHours = indexGivenHours(hours);
            options.disabledHours = false;
            if (options.useCurrent && !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, 'h')) {
                    date.add(1, 'h');
                    if (tries === 24) {
                        throw 'Tried 24 times to find a valid date';
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        };
        picker.viewDate = function(newDate) {
            if (arguments.length === 0) {
                return viewDate.clone();
            }
            if (!newDate) {
                viewDate = date.clone();
                return picker;
            }
            if (typeof newDate !== 'string' && !moment.isMoment(newDate) && !(newDate instanceof Date)) {
                throw new TypeError('viewDate() parameter must be one of [string, moment or Date]');
            }
            viewDate = parseInputDate(newDate);
            viewUpdate();
            return picker;
        };
        if (element.is('input')) {
            input = element;
        } else {
            input = element.find(options.datepickerInput);
            if (input.size() === 0) {
                input = element.find('input');
            } else if (!input.is('input')) {
                throw new Error('CSS class "' + options.datepickerInput + '" cannot be applied to non input element');
            }
        }
        if (element.hasClass('input-group')) {
            if (element.find('.datepickerbutton').size() === 0) {
                component = element.find('.input-group-addon');
            } else {
                component = element.find('.datepickerbutton');
            }
        }
        if (!options.inline && !input.is('input')) {
            throw new Error('Could not initialize DateTimePicker without an input element');
        }
        $.extend(true, options, dataToOptions());
        picker.options(options);
        initFormatting();
        attachDatePickerElementEvents();
        if (input.prop('disabled')) {
            picker.disable();
        }
        if (input.is('input') && input.val().trim().length !== 0) {
            setValue(parseInputDate(input.val().trim()));
        } else if (options.defaultDate && input.attr('placeholder') === undefined) {
            setValue(options.defaultDate);
        }
        if (options.inline) {
            show();
        }
        return picker;
    };
    $.fn.datetimepicker = function(options) {
        return this.each(function() {
            var $this = $(this);
            if (!$this.data('DateTimePicker')) {
                options = $.extend(true, {}, $.fn.datetimepicker.defaults, options);
                $this.data('DateTimePicker', dateTimePicker($this, options));
            }
        });
    };
    $.fn.datetimepicker.defaults = {
        format: false,
        dayViewHeaderFormat: 'MMMM YYYY',
        extraFormats: false,
        stepping: 1,
        minDate: false,
        maxDate: false,
        useCurrent: true,
        collapse: true,
        locale: moment.locale(),
        defaultDate: false,
        disabledDates: false,
        enabledDates: false,
        icons: {
            time: 'glyphicon glyphicon-time',
            date: 'glyphicon glyphicon-calendar',
            up: 'glyphicon glyphicon-chevron-up',
            down: 'glyphicon glyphicon-chevron-down',
            previous: 'glyphicon glyphicon-chevron-left',
            next: 'glyphicon glyphicon-chevron-right',
            today: 'glyphicon glyphicon-screenshot',
            clear: 'glyphicon glyphicon-trash',
            close: 'glyphicon glyphicon-remove'
        },
        tooltips: {
            today: 'Go to today',
            clear: 'Clear selection',
            close: 'Close the picker',
            selectMonth: 'Select Month',
            prevMonth: 'Previous Month',
            nextMonth: 'Next Month',
            selectYear: 'Select Year',
            prevYear: 'Previous Year',
            nextYear: 'Next Year',
            selectDecade: 'Select Decade',
            prevDecade: 'Previous Decade',
            nextDecade: 'Next Decade',
            prevCentury: 'Previous Century',
            nextCentury: 'Next Century'
        },
        useStrict: false,
        sideBySide: false,
        daysOfWeekDisabled: false,
        calendarWeeks: false,
        viewMode: 'days',
        toolbarPlacement: 'default',
        showTodayButton: false,
        showClear: false,
        showClose: false,
        widgetPositioning: {
            horizontal: 'auto',
            vertical: 'auto'
        },
        widgetParent: null,
        ignoreReadonly: false,
        keepOpen: false,
        focusOnShow: true,
        inline: false,
        keepInvalid: false,
        datepickerInput: '.datepickerinput',
        keyBinds: {
            up: function(widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(7, 'd'));
                } else {
                    this.date(d.clone().add(this.stepping(), 'm'));
                }
            },
            down: function(widget) {
                if (!widget) {
                    this.show();
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(7, 'd'));
                } else {
                    this.date(d.clone().subtract(this.stepping(), 'm'));
                }
            },
            'control up': function(widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'y'));
                } else {
                    this.date(d.clone().add(1, 'h'));
                }
            },
            'control down': function(widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'y'));
                } else {
                    this.date(d.clone().subtract(1, 'h'));
                }
            },
            left: function(widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'd'));
                }
            },
            right: function(widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'd'));
                }
            },
            pageUp: function(widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'M'));
                }
            },
            pageDown: function(widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'M'));
                }
            },
            enter: function() {
                this.hide();
            },
            escape: function() {
                this.hide();
            },
            'control space': function(widget) {
                if (widget.find('.timepicker').is(':visible')) {
                    widget.find('.btn[data-action="togglePeriod"]').click();
                }
            },
            t: function() {
                this.date(moment());
            },
            'delete': function() {
                this.clear();
            }
        },
        debug: false,
        allowInputToggle: false,
        disabledTimeIntervals: false,
        disabledHours: false,
        enabledHours: false,
        viewDate: false
    };
}));
if (typeof JSON !== 'object') {
    JSON = {};
}
(function() {
    'use strict';

    function f(n) {
        return n < 10 ? '0' + n : n;
    }
    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function(key) {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null;
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
            return this.valueOf();
        };
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap, indent, meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
            var c = meta[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }

    function str(key, holder) {
        var i, k, v, length, mind = gap,
            partial, value = holder[key];
        if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }
                v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }
    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function(value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {
                '': value
            });
        };
    }
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function(text, reviver) {
            var j;

            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function(a) {
                    return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function' ? walk({
                    '': j
                }, '') : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
}());
(function(window, undefined) {
    "use strict";
    var
        History = window.History = window.History || {},
        jQuery = window.jQuery;
    if (typeof History.Adapter !== 'undefined') {
        throw new Error('History.js Adapter has already been loaded...');
    }
    History.Adapter = {
        bind: function(el, event, callback) {
            jQuery(el).bind(event, callback);
        },
        trigger: function(el, event, extra) {
            jQuery(el).trigger(event, extra);
        },
        extractEventData: function(key, event, extra) {
            var result = (event && event.originalEvent && event.originalEvent[key]) || (extra && extra[key]) || undefined;
            return result;
        },
        onDomLoad: function(callback) {
            jQuery(callback);
        }
    };
    if (typeof History.init !== 'undefined') {
        History.init();
    }
})(window);
(function(window, undefined) {
    "use strict";
    var
        document = window.document,
        setTimeout = window.setTimeout || setTimeout,
        clearTimeout = window.clearTimeout || clearTimeout,
        setInterval = window.setInterval || setInterval,
        History = window.History = window.History || {};
    if (typeof History.initHtml4 !== 'undefined') {
        throw new Error('History.js HTML4 Support has already been loaded...');
    }
    History.initHtml4 = function() {
        if (typeof History.initHtml4.initialized !== 'undefined') {
            return false;
        } else {
            History.initHtml4.initialized = true;
        }
        History.enabled = true;
        History.savedHashes = [];
        History.isLastHash = function(newHash) {
            var oldHash = History.getHashByIndex(),
                isLast;
            isLast = newHash === oldHash;
            return isLast;
        };
        History.isHashEqual = function(newHash, oldHash) {
            newHash = encodeURIComponent(newHash).replace(/%25/g, "%");
            oldHash = encodeURIComponent(oldHash).replace(/%25/g, "%");
            return newHash === oldHash;
        };
        History.saveHash = function(newHash) {
            if (History.isLastHash(newHash)) {
                return false;
            }
            History.savedHashes.push(newHash);
            return true;
        };
        History.getHashByIndex = function(index) {
            var hash = null;
            if (typeof index === 'undefined') {
                hash = History.savedHashes[History.savedHashes.length - 1];
            } else if (index < 0) {
                hash = History.savedHashes[History.savedHashes.length + index];
            } else {
                hash = History.savedHashes[index];
            }
            return hash;
        };
        History.discardedHashes = {};
        History.discardedStates = {};
        History.discardState = function(discardedState, forwardState, backState) {
            var discardedStateHash = History.getHashByState(discardedState),
                discardObject;
            discardObject = {
                'discardedState': discardedState,
                'backState': backState,
                'forwardState': forwardState
            };
            History.discardedStates[discardedStateHash] = discardObject;
            return true;
        };
        History.discardHash = function(discardedHash, forwardState, backState) {
            var discardObject = {
                'discardedHash': discardedHash,
                'backState': backState,
                'forwardState': forwardState
            };
            History.discardedHashes[discardedHash] = discardObject;
            return true;
        };
        History.discardedState = function(State) {
            var StateHash = History.getHashByState(State),
                discarded;
            discarded = History.discardedStates[StateHash] || false;
            return discarded;
        };
        History.discardedHash = function(hash) {
            var discarded = History.discardedHashes[hash] || false;
            return discarded;
        };
        History.recycleState = function(State) {
            var StateHash = History.getHashByState(State);
            if (History.discardedState(State)) {
                delete History.discardedStates[StateHash];
            }
            return true;
        };
        if (History.emulated.hashChange) {
            History.hashChangeInit = function() {
                History.checkerFunction = null;
                var lastDocumentHash = '',
                    iframeId, iframe, lastIframeHash, checkerRunning, startedWithHash = Boolean(History.getHash());
                if (History.isInternetExplorer()) {
                    iframeId = 'historyjs-iframe';
                    iframe = document.createElement('iframe');
                    iframe.setAttribute('id', iframeId);
                    iframe.setAttribute('src', '#');
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                    iframe.contentWindow.document.open();
                    iframe.contentWindow.document.close();
                    lastIframeHash = '';
                    checkerRunning = false;
                    History.checkerFunction = function() {
                        if (checkerRunning) {
                            return false;
                        }
                        checkerRunning = true;
                        var
                            documentHash = History.getHash(),
                            iframeHash = History.getHash(iframe.contentWindow.document);
                        if (documentHash !== lastDocumentHash) {
                            lastDocumentHash = documentHash;
                            if (iframeHash !== documentHash) {
                                lastIframeHash = iframeHash = documentHash;
                                iframe.contentWindow.document.open();
                                iframe.contentWindow.document.close();
                                iframe.contentWindow.document.location.hash = History.escapeHash(documentHash);
                            }
                            History.Adapter.trigger(window, 'hashchange');
                        } else if (iframeHash !== lastIframeHash) {
                            lastIframeHash = iframeHash;
                            if (startedWithHash && iframeHash === '') {
                                History.back();
                            } else {
                                History.setHash(iframeHash, false);
                            }
                        }
                        checkerRunning = false;
                        return true;
                    };
                } else {
                    History.checkerFunction = function() {
                        var documentHash = History.getHash() || '';
                        if (documentHash !== lastDocumentHash) {
                            lastDocumentHash = documentHash;
                            History.Adapter.trigger(window, 'hashchange');
                        }
                        return true;
                    };
                }
                History.intervalList.push(setInterval(History.checkerFunction, History.options.hashChangeInterval));
                return true;
            };
            History.Adapter.onDomLoad(History.hashChangeInit);
        }
        if (History.emulated.pushState) {
            History.onHashChange = function(event) {
                var currentUrl = ((event && event.newURL) || History.getLocationHref()),
                    currentHash = History.getHashByUrl(currentUrl),
                    currentState = null,
                    currentStateHash = null,
                    currentStateHashExits = null,
                    discardObject;
                if (History.isLastHash(currentHash)) {
                    History.busy(false);
                    return false;
                }
                History.doubleCheckComplete();
                History.saveHash(currentHash);
                if (currentHash && History.isTraditionalAnchor(currentHash)) {
                    History.Adapter.trigger(window, 'anchorchange');
                    History.busy(false);
                    return false;
                }
                currentState = History.extractState(History.getFullUrl(currentHash || History.getLocationHref()), true);
                if (History.isLastSavedState(currentState)) {
                    History.busy(false);
                    return false;
                }
                currentStateHash = History.getHashByState(currentState);
                discardObject = History.discardedState(currentState);
                if (discardObject) {
                    if (History.getHashByIndex(-2) === History.getHashByState(discardObject.forwardState)) {
                        History.back(false);
                    } else {
                        History.forward(false);
                    }
                    return false;
                }
                History.pushState(currentState.data, currentState.title, encodeURI(currentState.url), false);
                return true;
            };
            History.Adapter.bind(window, 'hashchange', History.onHashChange);
            History.pushState = function(data, title, url, queue) {
                url = encodeURI(url).replace(/%25/g, "%");
                if (History.getHashByUrl(url)) {
                    throw new Error('History.js does not support states with fragment-identifiers (hashes/anchors).');
                }
                if (queue !== false && History.busy()) {
                    History.pushQueue({
                        scope: History,
                        callback: History.pushState,
                        args: arguments,
                        queue: queue
                    });
                    return false;
                }
                History.busy(true);
                var newState = History.createStateObject(data, title, url),
                    newStateHash = History.getHashByState(newState),
                    oldState = History.getState(false),
                    oldStateHash = History.getHashByState(oldState),
                    html4Hash = History.getHash(),
                    wasExpected = History.expectedStateId == newState.id;
                History.storeState(newState);
                History.expectedStateId = newState.id;
                History.recycleState(newState);
                History.setTitle(newState);
                if (newStateHash === oldStateHash) {
                    History.busy(false);
                    return false;
                }
                History.saveState(newState);
                if (!wasExpected)
                    History.Adapter.trigger(window, 'statechange');
                if (!History.isHashEqual(newStateHash, html4Hash) && !History.isHashEqual(newStateHash, History.getShortUrl(History.getLocationHref()))) {
                    History.setHash(newStateHash, false);
                }
                History.busy(false);
                return true;
            };
            History.replaceState = function(data, title, url, queue) {
                url = encodeURI(url).replace(/%25/g, "%");
                if (History.getHashByUrl(url)) {
                    throw new Error('History.js does not support states with fragment-identifiers (hashes/anchors).');
                }
                if (queue !== false && History.busy()) {
                    History.pushQueue({
                        scope: History,
                        callback: History.replaceState,
                        args: arguments,
                        queue: queue
                    });
                    return false;
                }
                History.busy(true);
                var newState = History.createStateObject(data, title, url),
                    newStateHash = History.getHashByState(newState),
                    oldState = History.getState(false),
                    oldStateHash = History.getHashByState(oldState),
                    previousState = History.getStateByIndex(-2);
                History.discardState(oldState, newState, previousState);
                if (newStateHash === oldStateHash) {
                    History.storeState(newState);
                    History.expectedStateId = newState.id;
                    History.recycleState(newState);
                    History.setTitle(newState);
                    History.saveState(newState);
                    History.Adapter.trigger(window, 'statechange');
                    History.busy(false);
                } else {
                    History.pushState(newState.data, newState.title, newState.url, false);
                }
                return true;
            };
        }
        if (History.emulated.pushState) {
            if (History.getHash() && !History.emulated.hashChange) {
                History.Adapter.onDomLoad(function() {
                    History.Adapter.trigger(window, 'hashchange');
                });
            }
        }
    };
    if (typeof History.init !== 'undefined') {
        History.init();
    }
})(window);
(function(window, undefined) {
    "use strict";
    var
        console = window.console || undefined,
        document = window.document,
        navigator = window.navigator,
        sessionStorage = false,
        setTimeout = window.setTimeout,
        clearTimeout = window.clearTimeout,
        setInterval = window.setInterval,
        clearInterval = window.clearInterval,
        JSON = window.JSON,
        alert = window.alert,
        History = window.History = window.History || {},
        history = window.history;
    try {
        sessionStorage = window.sessionStorage;
        sessionStorage.setItem('TEST', '1');
        sessionStorage.removeItem('TEST');
    } catch (e) {
        sessionStorage = false;
    }
    JSON.stringify = JSON.stringify || JSON.encode;
    JSON.parse = JSON.parse || JSON.decode;
    if (typeof History.init !== 'undefined') {
        throw new Error('History.js Core has already been loaded...');
    }
    History.init = function(options) {
        if (typeof History.Adapter === 'undefined') {
            return false;
        }
        if (typeof History.initCore !== 'undefined') {
            History.initCore();
        }
        if (typeof History.initHtml4 !== 'undefined') {
            History.initHtml4();
        }
        return true;
    };
    History.initCore = function(options) {
        if (typeof History.initCore.initialized !== 'undefined') {
            return false;
        } else {
            History.initCore.initialized = true;
        }
        History.options = History.options || {};
        History.options.hashChangeInterval = History.options.hashChangeInterval || 100;
        History.options.safariPollInterval = History.options.safariPollInterval || 500;
        History.options.doubleCheckInterval = History.options.doubleCheckInterval || 500;
        History.options.disableSuid = History.options.disableSuid || false;
        History.options.storeInterval = History.options.storeInterval || 1000;
        History.options.busyDelay = History.options.busyDelay || 250;
        History.options.debug = History.options.debug || false;
        History.options.initialTitle = History.options.initialTitle || document.title;
        History.options.html4Mode = History.options.html4Mode || false;
        History.options.delayInit = History.options.delayInit || false;
        History.intervalList = [];
        History.clearAllIntervals = function() {
            var i, il = History.intervalList;
            if (typeof il !== "undefined" && il !== null) {
                for (i = 0; i < il.length; i++) {
                    clearInterval(il[i]);
                }
                History.intervalList = null;
            }
        };
        History.debug = function() {
            if ((History.options.debug || false)) {
                History.log.apply(History, arguments);
            }
        };
        History.log = function() {
            var
                consoleExists = !(typeof console === 'undefined' || typeof console.log === 'undefined' || typeof console.log.apply === 'undefined'),
                textarea = document.getElementById('log'),
                message, i, n, args, arg;
            if (consoleExists) {
                args = Array.prototype.slice.call(arguments);
                message = args.shift();
                if (typeof console.debug !== 'undefined') {
                    console.debug.apply(console, [message, args]);
                } else {
                    console.log.apply(console, [message, args]);
                }
            } else {
                message = ("\n" + arguments[0] + "\n");
            }
            for (i = 1, n = arguments.length; i < n; ++i) {
                arg = arguments[i];
                if (typeof arg === 'object' && typeof JSON !== 'undefined') {
                    try {
                        arg = JSON.stringify(arg);
                    } catch (Exception) {}
                }
                message += "\n" + arg + "\n";
            }
            if (textarea) {
                textarea.value += message + "\n-----\n";
                textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
            } else if (!consoleExists) {
                alert(message);
            }
            return true;
        };
        History.getInternetExplorerMajorVersion = function() {
            var result = History.getInternetExplorerMajorVersion.cached = (typeof History.getInternetExplorerMajorVersion.cached !== 'undefined') ? History.getInternetExplorerMajorVersion.cached : (function() {
                var v = 3,
                    div = document.createElement('div'),
                    all = div.getElementsByTagName('i');
                while ((div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->') && all[0]) {}
                return (v > 4) ? v : false;
            })();
            return result;
        };
        History.isInternetExplorer = function() {
            var result = History.isInternetExplorer.cached = (typeof History.isInternetExplorer.cached !== 'undefined') ? History.isInternetExplorer.cached : Boolean(History.getInternetExplorerMajorVersion());
            return result;
        };
        if (History.options.html4Mode) {
            History.emulated = {
                pushState: true,
                hashChange: true
            };
        } else {
            History.emulated = {
                pushState: !Boolean(window.history && window.history.pushState && window.history.replaceState && !((/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(navigator.userAgent) || (/AppleWebKit\/5([0-2]|3[0-2])/i).test(navigator.userAgent))),
                hashChange: Boolean(!(('onhashchange' in window) || ('onhashchange' in document)) || (History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8))
            };
        }
        History.enabled = !History.emulated.pushState;
        History.bugs = {
            setHash: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),
            safariPoll: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),
            ieDoubleCheck: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8),
            hashEscape: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 7)
        };
        History.isEmptyObject = function(obj) {
            for (var name in obj) {
                if (obj.hasOwnProperty(name)) {
                    return false;
                }
            }
            return true;
        };
        History.cloneObject = function(obj) {
            var hash, newObj;
            if (obj) {
                hash = JSON.stringify(obj);
                newObj = JSON.parse(hash);
            } else {
                newObj = {};
            }
            return newObj;
        };
        History.getRootUrl = function() {
            var rootUrl = document.location.protocol + '//' + (document.location.hostname || document.location.host);
            if (document.location.port || false) {
                rootUrl += ':' + document.location.port;
            }
            rootUrl += '/';
            return rootUrl;
        };
        History.getBaseHref = function() {
            var
                baseElements = document.getElementsByTagName('base'),
                baseElement = null,
                baseHref = '';
            if (baseElements.length === 1) {
                baseElement = baseElements[0];
                baseHref = baseElement.href.replace(/[^\/]+$/, '');
            }
            baseHref = baseHref.replace(/\/+$/, '');
            if (baseHref) baseHref += '/';
            return baseHref;
        };
        History.getBaseUrl = function() {
            var baseUrl = History.getBaseHref() || History.getBasePageUrl() || History.getRootUrl();
            return baseUrl;
        };
        History.getPageUrl = function() {
            var
                State = History.getState(false, false),
                stateUrl = (State || {}).url || History.getLocationHref(),
                pageUrl;
            pageUrl = stateUrl.replace(/\/+$/, '').replace(/[^\/]+$/, function(part, index, string) {
                return (/\./).test(part) ? part : part + '/';
            });
            return pageUrl;
        };
        History.getBasePageUrl = function() {
            var basePageUrl = (History.getLocationHref()).replace(/[#\?].*/, '').replace(/[^\/]+$/, function(part, index, string) {
                return (/[^\/]$/).test(part) ? '' : part;
            }).replace(/\/+$/, '') + '/';
            return basePageUrl;
        };
        History.getFullUrl = function(url, allowBaseHref) {
            var fullUrl = url,
                firstChar = url.substring(0, 1);
            allowBaseHref = (typeof allowBaseHref === 'undefined') ? true : allowBaseHref;
            if (/[a-z]+\:\/\//.test(url)) {} else if (firstChar === '/') {
                fullUrl = History.getRootUrl() + url.replace(/^\/+/, '');
            } else if (firstChar === '#') {
                fullUrl = History.getPageUrl().replace(/#.*/, '') + url;
            } else if (firstChar === '?') {
                fullUrl = History.getPageUrl().replace(/[\?#].*/, '') + url;
            } else {
                if (allowBaseHref) {
                    fullUrl = History.getBaseUrl() + url.replace(/^(\.\/)+/, '');
                } else {
                    fullUrl = History.getBasePageUrl() + url.replace(/^(\.\/)+/, '');
                }
            }
            return fullUrl.replace(/\#$/, '');
        };
        History.getShortUrl = function(url) {
            var shortUrl = url,
                baseUrl = History.getBaseUrl(),
                rootUrl = History.getRootUrl();
            if (History.emulated.pushState) {
                shortUrl = shortUrl.replace(baseUrl, '');
            }
            shortUrl = shortUrl.replace(rootUrl, '/');
            if (History.isTraditionalAnchor(shortUrl)) {
                shortUrl = './' + shortUrl;
            }
            shortUrl = shortUrl.replace(/^(\.\/)+/g, './').replace(/\#$/, '');
            return shortUrl;
        };
        History.getLocationHref = function(doc) {
            doc = doc || document;
            if (doc.URL === doc.location.href)
                return doc.location.href;
            if (doc.location.href === decodeURIComponent(doc.URL))
                return doc.URL;
            if (doc.location.hash && decodeURIComponent(doc.location.href.replace(/^[^#]+/, "")) === doc.location.hash)
                return doc.location.href;
            if (doc.URL.indexOf('#') == -1 && doc.location.href.indexOf('#') != -1)
                return doc.location.href;
            return doc.URL || doc.location.href;
        };
        History.store = {};
        History.idToState = History.idToState || {};
        History.stateToId = History.stateToId || {};
        History.urlToId = History.urlToId || {};
        History.storedStates = History.storedStates || [];
        History.savedStates = History.savedStates || [];
        History.normalizeStore = function() {
            History.store.idToState = History.store.idToState || {};
            History.store.urlToId = History.store.urlToId || {};
            History.store.stateToId = History.store.stateToId || {};
        };
        History.getState = function(friendly, create) {
            if (typeof friendly === 'undefined') {
                friendly = true;
            }
            if (typeof create === 'undefined') {
                create = true;
            }
            var State = History.getLastSavedState();
            if (!State && create) {
                State = History.createStateObject();
            }
            if (friendly) {
                State = History.cloneObject(State);
                State.url = State.cleanUrl || State.url;
            }
            return State;
        };
        History.getIdByState = function(newState) {
            var id = History.extractId(newState.url),
                str;
            if (!id) {
                str = History.getStateString(newState);
                if (typeof History.stateToId[str] !== 'undefined') {
                    id = History.stateToId[str];
                } else if (typeof History.store.stateToId[str] !== 'undefined') {
                    id = History.store.stateToId[str];
                } else {
                    while (true) {
                        id = (new Date()).getTime() + String(Math.random()).replace(/\D/g, '');
                        if (typeof History.idToState[id] === 'undefined' && typeof History.store.idToState[id] === 'undefined') {
                            break;
                        }
                    }
                    History.stateToId[str] = id;
                    History.idToState[id] = newState;
                }
            }
            return id;
        };
        History.normalizeState = function(oldState) {
            var newState, dataNotEmpty;
            if (!oldState || (typeof oldState !== 'object')) {
                oldState = {};
            }
            if (typeof oldState.normalized !== 'undefined') {
                return oldState;
            }
            if (!oldState.data || (typeof oldState.data !== 'object')) {
                oldState.data = {};
            }
            newState = {};
            newState.normalized = true;
            newState.title = oldState.title || '';
            newState.url = History.getFullUrl(oldState.url ? oldState.url : (History.getLocationHref()));
            newState.hash = History.getShortUrl(newState.url);
            newState.data = History.cloneObject(oldState.data);
            newState.id = History.getIdByState(newState);
            newState.cleanUrl = newState.url.replace(/\??\&_suid.*/, '');
            newState.url = newState.cleanUrl;
            dataNotEmpty = !History.isEmptyObject(newState.data);
            if ((newState.title || dataNotEmpty) && History.options.disableSuid !== true) {
                newState.hash = History.getShortUrl(newState.url).replace(/\??\&_suid.*/, '');
                if (!/\?/.test(newState.hash)) {
                    newState.hash += '?';
                }
                newState.hash += '&_suid=' + newState.id;
            }
            newState.hashedUrl = History.getFullUrl(newState.hash);
            if ((History.emulated.pushState || History.bugs.safariPoll) && History.hasUrlDuplicate(newState)) {
                newState.url = newState.hashedUrl;
            }
            return newState;
        };
        History.createStateObject = function(data, title, url) {
            var State = {
                'data': data,
                'title': title,
                'url': url
            };
            State = History.normalizeState(State);
            return State;
        };
        History.getStateById = function(id) {
            id = String(id);
            var State = History.idToState[id] || History.store.idToState[id] || undefined;
            return State;
        };
        History.getStateString = function(passedState) {
            var State, cleanedState, str;
            State = History.normalizeState(passedState);
            cleanedState = {
                data: State.data,
                title: passedState.title,
                url: passedState.url
            };
            str = JSON.stringify(cleanedState);
            return str;
        };
        History.getStateId = function(passedState) {
            var State, id;
            State = History.normalizeState(passedState);
            id = State.id;
            return id;
        };
        History.getHashByState = function(passedState) {
            var State, hash;
            State = History.normalizeState(passedState);
            hash = State.hash;
            return hash;
        };
        History.extractId = function(url_or_hash) {
            var id, parts, url, tmp;
            if (url_or_hash.indexOf('#') != -1) {
                tmp = url_or_hash.split("#")[0];
            } else {
                tmp = url_or_hash;
            }
            parts = /(.*)\&_suid=([0-9]+)$/.exec(tmp);
            url = parts ? (parts[1] || url_or_hash) : url_or_hash;
            id = parts ? String(parts[2] || '') : '';
            return id || false;
        };
        History.isTraditionalAnchor = function(url_or_hash) {
            var isTraditional = !(/[\/\?\.]/.test(url_or_hash));
            return isTraditional;
        };
        History.extractState = function(url_or_hash, create) {
            var State = null,
                id, url;
            create = create || false;
            id = History.extractId(url_or_hash);
            if (id) {
                State = History.getStateById(id);
            }
            if (!State) {
                url = History.getFullUrl(url_or_hash);
                id = History.getIdByUrl(url) || false;
                if (id) {
                    State = History.getStateById(id);
                }
                if (!State && create && !History.isTraditionalAnchor(url_or_hash)) {
                    State = History.createStateObject(null, null, url);
                }
            }
            return State;
        };
        History.getIdByUrl = function(url) {
            var id = History.urlToId[url] || History.store.urlToId[url] || undefined;
            return id;
        };
        History.getLastSavedState = function() {
            return History.savedStates[History.savedStates.length - 1] || undefined;
        };
        History.getLastStoredState = function() {
            return History.storedStates[History.storedStates.length - 1] || undefined;
        };
        History.hasUrlDuplicate = function(newState) {
            var hasDuplicate = false,
                oldState;
            oldState = History.extractState(newState.url);
            hasDuplicate = oldState && oldState.id !== newState.id;
            return hasDuplicate;
        };
        History.storeState = function(newState) {
            History.urlToId[newState.url] = newState.id;
            History.storedStates.push(History.cloneObject(newState));
            return newState;
        };
        History.isLastSavedState = function(newState) {
            var isLast = false,
                newId, oldState, oldId;
            if (History.savedStates.length) {
                newId = newState.id;
                oldState = History.getLastSavedState();
                oldId = oldState.id;
                isLast = (newId === oldId);
            }
            return isLast;
        };
        History.saveState = function(newState) {
            if (History.isLastSavedState(newState)) {
                return false;
            }
            History.savedStates.push(History.cloneObject(newState));
            return true;
        };
        History.getStateByIndex = function(index) {
            var State = null;
            if (typeof index === 'undefined') {
                State = History.savedStates[History.savedStates.length - 1];
            } else if (index < 0) {
                State = History.savedStates[History.savedStates.length + index];
            } else {
                State = History.savedStates[index];
            }
            return State;
        };
        History.getCurrentIndex = function() {
            var index = null;
            if (History.savedStates.length < 1) {
                index = 0;
            } else {
                index = History.savedStates.length - 1;
            }
            return index;
        };
        History.getHash = function(doc) {
            var url = History.getLocationHref(doc),
                hash;
            hash = History.getHashByUrl(url);
            return hash;
        };
        History.unescapeHash = function(hash) {
            var result = History.normalizeHash(hash);
            result = decodeURIComponent(result);
            return result;
        };
        History.normalizeHash = function(hash) {
            var result = hash.replace(/[^#]*#/, '').replace(/#.*/, '');
            return result;
        };
        History.setHash = function(hash, queue) {
            var State, pageUrl;
            if (queue !== false && History.busy()) {
                History.pushQueue({
                    scope: History,
                    callback: History.setHash,
                    args: arguments,
                    queue: queue
                });
                return false;
            }
            History.busy(true);
            State = History.extractState(hash, true);
            if (State && !History.emulated.pushState) {
                History.pushState(State.data, State.title, State.url, false);
            } else if (History.getHash() !== hash) {
                if (History.bugs.setHash) {
                    pageUrl = History.getPageUrl();
                    History.pushState(null, null, pageUrl + '#' + hash, false);
                } else {
                    document.location.hash = hash;
                }
            }
            return History;
        };
        History.escapeHash = function(hash) {
            var result = History.normalizeHash(hash);
            result = window.encodeURIComponent(result);
            if (!History.bugs.hashEscape) {
                result = result.replace(/\%21/g, '!').replace(/\%26/g, '&').replace(/\%3D/g, '=').replace(/\%3F/g, '?');
            }
            return result;
        };
        History.getHashByUrl = function(url) {
            var hash = String(url).replace(/([^#]*)#?([^#]*)#?(.*)/, '$2');
            hash = History.unescapeHash(hash);
            return hash;
        };
        History.setTitle = function(newState) {
            var title = newState.title,
                firstState;
            if (!title) {
                firstState = History.getStateByIndex(0);
                if (firstState && firstState.url === newState.url) {
                    title = firstState.title || History.options.initialTitle;
                }
            }
            try {
                document.getElementsByTagName('title')[0].innerHTML = title.replace('<', '&lt;').replace('>', '&gt;').replace(' & ', ' &amp; ');
            } catch (Exception) {}
            document.title = title;
            return History;
        };
        History.queues = [];
        History.busy = function(value) {
            if (typeof value !== 'undefined') {
                History.busy.flag = value;
            } else if (typeof History.busy.flag === 'undefined') {
                History.busy.flag = false;
            }
            if (!History.busy.flag) {
                clearTimeout(History.busy.timeout);
                var fireNext = function() {
                    var i, queue, item;
                    if (History.busy.flag) return;
                    for (i = History.queues.length - 1; i >= 0; --i) {
                        queue = History.queues[i];
                        if (queue.length === 0) continue;
                        item = queue.shift();
                        History.fireQueueItem(item);
                        History.busy.timeout = setTimeout(fireNext, History.options.busyDelay);
                    }
                };
                History.busy.timeout = setTimeout(fireNext, History.options.busyDelay);
            }
            return History.busy.flag;
        };
        History.busy.flag = false;
        History.fireQueueItem = function(item) {
            return item.callback.apply(item.scope || History, item.args || []);
        };
        History.pushQueue = function(item) {
            History.queues[item.queue || 0] = History.queues[item.queue || 0] || [];
            History.queues[item.queue || 0].push(item);
            return History;
        };
        History.queue = function(item, queue) {
            if (typeof item === 'function') {
                item = {
                    callback: item
                };
            }
            if (typeof queue !== 'undefined') {
                item.queue = queue;
            }
            if (History.busy()) {
                History.pushQueue(item);
            } else {
                History.fireQueueItem(item);
            }
            return History;
        };
        History.clearQueue = function() {
            History.busy.flag = false;
            History.queues = [];
            return History;
        };
        History.stateChanged = false;
        History.doubleChecker = false;
        History.doubleCheckComplete = function() {
            History.stateChanged = true;
            History.doubleCheckClear();
            return History;
        };
        History.doubleCheckClear = function() {
            if (History.doubleChecker) {
                clearTimeout(History.doubleChecker);
                History.doubleChecker = false;
            }
            return History;
        };
        History.doubleCheck = function(tryAgain) {
            History.stateChanged = false;
            History.doubleCheckClear();
            if (History.bugs.ieDoubleCheck) {
                History.doubleChecker = setTimeout(function() {
                    History.doubleCheckClear();
                    if (!History.stateChanged) {
                        tryAgain();
                    }
                    return true;
                }, History.options.doubleCheckInterval);
            }
            return History;
        };
        History.safariStatePoll = function() {
            var
                urlState = History.extractState(History.getLocationHref()),
                newState;
            if (!History.isLastSavedState(urlState)) {
                newState = urlState;
            } else {
                return;
            }
            if (!newState) {
                newState = History.createStateObject();
            }
            History.Adapter.trigger(window, 'popstate');
            return History;
        };
        History.back = function(queue) {
            if (queue !== false && History.busy()) {
                History.pushQueue({
                    scope: History,
                    callback: History.back,
                    args: arguments,
                    queue: queue
                });
                return false;
            }
            History.busy(true);
            History.doubleCheck(function() {
                History.back(false);
            });
            history.go(-1);
            return true;
        };
        History.forward = function(queue) {
            if (queue !== false && History.busy()) {
                History.pushQueue({
                    scope: History,
                    callback: History.forward,
                    args: arguments,
                    queue: queue
                });
                return false;
            }
            History.busy(true);
            History.doubleCheck(function() {
                History.forward(false);
            });
            history.go(1);
            return true;
        };
        History.go = function(index, queue) {
            var i;
            if (index > 0) {
                for (i = 1; i <= index; ++i) {
                    History.forward(queue);
                }
            } else if (index < 0) {
                for (i = -1; i >= index; --i) {
                    History.back(queue);
                }
            } else {
                throw new Error('History.go: History.go requires a positive or negative integer passed.');
            }
            return History;
        };
        if (History.emulated.pushState) {
            var emptyFunction = function() {};
            History.pushState = History.pushState || emptyFunction;
            History.replaceState = History.replaceState || emptyFunction;
        } else {
            History.onPopState = function(event, extra) {
                var stateId = false,
                    newState = false,
                    currentHash, currentState;
                History.doubleCheckComplete();
                currentHash = History.getHash();
                if (currentHash) {
                    currentState = History.extractState(currentHash || History.getLocationHref(), true);
                    if (currentState) {
                        History.replaceState(currentState.data, currentState.title, currentState.url, false);
                    } else {
                        History.Adapter.trigger(window, 'anchorchange');
                        History.busy(false);
                    }
                    History.expectedStateId = false;
                    return false;
                }
                stateId = History.Adapter.extractEventData('state', event, extra) || false;
                if (stateId) {
                    newState = History.getStateById(stateId);
                } else if (History.expectedStateId) {
                    newState = History.getStateById(History.expectedStateId);
                } else {
                    newState = History.extractState(History.getLocationHref());
                }
                if (!newState) {
                    newState = History.createStateObject(null, null, History.getLocationHref());
                }
                History.expectedStateId = false;
                if (History.isLastSavedState(newState)) {
                    History.busy(false);
                    return false;
                }
                History.storeState(newState);
                History.saveState(newState);
                History.setTitle(newState);
                History.Adapter.trigger(window, 'statechange');
                History.busy(false);
                return true;
            };
            History.Adapter.bind(window, 'popstate', History.onPopState);
            History.pushState = function(data, title, url, queue) {
                if (History.getHashByUrl(url) && History.emulated.pushState) {
                    throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
                }
                if (queue !== false && History.busy()) {
                    History.pushQueue({
                        scope: History,
                        callback: History.pushState,
                        args: arguments,
                        queue: queue
                    });
                    return false;
                }
                History.busy(true);
                var newState = History.createStateObject(data, title, url);
                if (History.isLastSavedState(newState)) {
                    History.busy(false);
                } else {
                    History.storeState(newState);
                    History.expectedStateId = newState.id;
                    history.pushState(newState.id, newState.title, newState.url);
                    History.Adapter.trigger(window, 'popstate');
                }
                return true;
            };
            History.replaceState = function(data, title, url, queue) {
                if (History.getHashByUrl(url) && History.emulated.pushState) {
                    throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
                }
                if (queue !== false && History.busy()) {
                    History.pushQueue({
                        scope: History,
                        callback: History.replaceState,
                        args: arguments,
                        queue: queue
                    });
                    return false;
                }
                History.busy(true);
                var newState = History.createStateObject(data, title, url);
                if (History.isLastSavedState(newState)) {
                    History.busy(false);
                } else {
                    History.storeState(newState);
                    History.expectedStateId = newState.id;
                    history.replaceState(newState.id, newState.title, newState.url);
                    History.Adapter.trigger(window, 'popstate');
                }
                return true;
            };
        }
        if (sessionStorage) {
            try {
                History.store = JSON.parse(sessionStorage.getItem('History.store')) || {};
            } catch (err) {
                History.store = {};
            }
            History.normalizeStore();
        } else {
            History.store = {};
            History.normalizeStore();
        }
        History.Adapter.bind(window, "unload", History.clearAllIntervals);
        History.saveState(History.storeState(History.extractState(History.getLocationHref(), true)));
        if (sessionStorage) {
            History.onUnload = function() {
                var currentStore, item, currentStoreString;
                try {
                    currentStore = JSON.parse(sessionStorage.getItem('History.store')) || {};
                } catch (err) {
                    currentStore = {};
                }
                currentStore.idToState = currentStore.idToState || {};
                currentStore.urlToId = currentStore.urlToId || {};
                currentStore.stateToId = currentStore.stateToId || {};
                for (item in History.idToState) {
                    if (!History.idToState.hasOwnProperty(item)) {
                        continue;
                    }
                    currentStore.idToState[item] = History.idToState[item];
                }
                for (item in History.urlToId) {
                    if (!History.urlToId.hasOwnProperty(item)) {
                        continue;
                    }
                    currentStore.urlToId[item] = History.urlToId[item];
                }
                for (item in History.stateToId) {
                    if (!History.stateToId.hasOwnProperty(item)) {
                        continue;
                    }
                    currentStore.stateToId[item] = History.stateToId[item];
                }
                History.store = currentStore;
                History.normalizeStore();
                currentStoreString = JSON.stringify(currentStore);
                try {
                    sessionStorage.setItem('History.store', currentStoreString);
                } catch (e) {
                    if (e.code === DOMException.QUOTA_EXCEEDED_ERR) {
                        if (sessionStorage.length) {
                            sessionStorage.removeItem('History.store');
                            sessionStorage.setItem('History.store', currentStoreString);
                        } else {}
                    } else {
                        throw e;
                    }
                }
            };
            History.intervalList.push(setInterval(History.onUnload, History.options.storeInterval));
            History.Adapter.bind(window, 'beforeunload', History.onUnload);
            History.Adapter.bind(window, 'unload', History.onUnload);
        }
        if (!History.emulated.pushState) {
            if (History.bugs.safariPoll) {
                History.intervalList.push(setInterval(History.safariStatePoll, History.options.safariPollInterval));
            }
            if (navigator.vendor === 'Apple Computer, Inc.' || (navigator.appCodeName || '') === 'Mozilla') {
                History.Adapter.bind(window, 'hashchange', function() {
                    History.Adapter.trigger(window, 'popstate');
                });
                if (History.getHash()) {
                    History.Adapter.onDomLoad(function() {
                        History.Adapter.trigger(window, 'hashchange');
                    });
                }
            }
        }
    };
    if (!History.options || !History.options.delayInit) {
        History.init();
    }
})(window);
(function defineMustache(global, factory) {
    if (typeof exports === 'object' && exports && typeof exports.nodeName !== 'string') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        global.Mustache = {};
        factory(global.Mustache);
    }
}(this, function mustacheFactory(mustache) {
    var objectToString = Object.prototype.toString;
    var isArray = Array.isArray || function isArrayPolyfill(object) {
        return objectToString.call(object) === '[object Array]';
    };

    function isFunction(object) {
        return typeof object === 'function';
    }

    function typeStr(obj) {
        return isArray(obj) ? 'array' : typeof obj;
    }

    function escapeRegExp(string) {
        return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    }

    function hasProperty(obj, propName) {
        return obj != null && typeof obj === 'object' && (propName in obj);
    }
    var regExpTest = RegExp.prototype.test;

    function testRegExp(re, string) {
        return regExpTest.call(re, string);
    }
    var nonSpaceRe = /\S/;

    function isWhitespace(string) {
        return !testRegExp(nonSpaceRe, string);
    }
    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
            return entityMap[s];
        });
    }
    var whiteRe = /\s*/;
    var spaceRe = /\s+/;
    var equalsRe = /\s*=/;
    var curlyRe = /\s*\}/;
    var tagRe = /#|\^|\/|>|\{|&|=|!/;

    function parseTemplate(template, tags) {
        if (!template)
            return [];
        var sections = [];
        var tokens = [];
        var spaces = [];
        var hasTag = false;
        var nonSpace = false;

        function stripSpace() {
            if (hasTag && !nonSpace) {
                while (spaces.length)
                    delete tokens[spaces.pop()];
            } else {
                spaces = [];
            }
            hasTag = false;
            nonSpace = false;
        }
        var openingTagRe, closingTagRe, closingCurlyRe;

        function compileTags(tagsToCompile) {
            if (typeof tagsToCompile === 'string')
                tagsToCompile = tagsToCompile.split(spaceRe, 2);
            if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
                throw new Error('Invalid tags: ' + tagsToCompile);
            openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
            closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
            closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
        }
        compileTags(tags || mustache.tags);
        var scanner = new Scanner(template);
        var start, type, value, chr, token, openSection;
        while (!scanner.eos()) {
            start = scanner.pos;
            value = scanner.scanUntil(openingTagRe);
            if (value) {
                for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
                    chr = value.charAt(i);
                    if (isWhitespace(chr)) {
                        spaces.push(tokens.length);
                    } else {
                        nonSpace = true;
                    }
                    tokens.push(['text', chr, start, start + 1]);
                    start += 1;
                    if (chr === '\n')
                        stripSpace();
                }
            }
            if (!scanner.scan(openingTagRe))
                break;
            hasTag = true;
            type = scanner.scan(tagRe) || 'name';
            scanner.scan(whiteRe);
            if (type === '=') {
                value = scanner.scanUntil(equalsRe);
                scanner.scan(equalsRe);
                scanner.scanUntil(closingTagRe);
            } else if (type === '{') {
                value = scanner.scanUntil(closingCurlyRe);
                scanner.scan(curlyRe);
                scanner.scanUntil(closingTagRe);
                type = '&';
            } else {
                value = scanner.scanUntil(closingTagRe);
            }
            if (!scanner.scan(closingTagRe))
                throw new Error('Unclosed tag at ' + scanner.pos);
            token = [type, value, start, scanner.pos];
            tokens.push(token);
            if (type === '#' || type === '^') {
                sections.push(token);
            } else if (type === '/') {
                openSection = sections.pop();
                if (!openSection)
                    throw new Error('Unopened section "' + value + '" at ' + start);
                if (openSection[1] !== value)
                    throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
            } else if (type === 'name' || type === '{' || type === '&') {
                nonSpace = true;
            } else if (type === '=') {
                compileTags(value);
            }
        }
        openSection = sections.pop();
        if (openSection)
            throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
        return nestTokens(squashTokens(tokens));
    }

    function squashTokens(tokens) {
        var squashedTokens = [];
        var token, lastToken;
        for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
            token = tokens[i];
            if (token) {
                if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
                    lastToken[1] += token[1];
                    lastToken[3] = token[3];
                } else {
                    squashedTokens.push(token);
                    lastToken = token;
                }
            }
        }
        return squashedTokens;
    }

    function nestTokens(tokens) {
        var nestedTokens = [];
        var collector = nestedTokens;
        var sections = [];
        var token, section;
        for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
            token = tokens[i];
            switch (token[0]) {
                case '#':
                case '^':
                    collector.push(token);
                    sections.push(token);
                    collector = token[4] = [];
                    break;
                case '/':
                    section = sections.pop();
                    section[5] = token[2];
                    collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
                    break;
                default:
                    collector.push(token);
            }
        }
        return nestedTokens;
    }

    function Scanner(string) {
        this.string = string;
        this.tail = string;
        this.pos = 0;
    }
    Scanner.prototype.eos = function eos() {
        return this.tail === '';
    };
    Scanner.prototype.scan = function scan(re) {
        var match = this.tail.match(re);
        if (!match || match.index !== 0)
            return '';
        var string = match[0];
        this.tail = this.tail.substring(string.length);
        this.pos += string.length;
        return string;
    };
    Scanner.prototype.scanUntil = function scanUntil(re) {
        var index = this.tail.search(re),
            match;
        switch (index) {
            case -1:
                match = this.tail;
                this.tail = '';
                break;
            case 0:
                match = '';
                break;
            default:
                match = this.tail.substring(0, index);
                this.tail = this.tail.substring(index);
        }
        this.pos += match.length;
        return match;
    };

    function Context(view, parentContext) {
        this.view = view;
        this.cache = {
            '.': this.view
        };
        this.parent = parentContext;
    }
    Context.prototype.push = function push(view) {
        return new Context(view, this);
    };
    Context.prototype.lookup = function lookup(name) {
        var cache = this.cache;
        var value;
        if (cache.hasOwnProperty(name)) {
            value = cache[name];
        } else {
            var context = this,
                names, index, lookupHit = false;
            while (context) {
                if (name.indexOf('.') > 0) {
                    value = context.view;
                    names = name.split('.');
                    index = 0;
                    while (value != null && index < names.length) {
                        if (index === names.length - 1)
                            lookupHit = hasProperty(value, names[index]);
                        value = value[names[index++]];
                    }
                } else {
                    value = context.view[name];
                    lookupHit = hasProperty(context.view, name);
                }
                if (lookupHit)
                    break;
                context = context.parent;
            }
            cache[name] = value;
        }
        if (isFunction(value))
            value = value.call(this.view);
        return value;
    };

    function Writer() {
        this.cache = {};
    }
    Writer.prototype.clearCache = function clearCache() {
        this.cache = {};
    };
    Writer.prototype.parse = function parse(template, tags) {
        var cache = this.cache;
        var tokens = cache[template];
        if (tokens == null)
            tokens = cache[template] = parseTemplate(template, tags);
        return tokens;
    };
    Writer.prototype.render = function render(template, view, partials) {
        var tokens = this.parse(template);
        var context = (view instanceof Context) ? view : new Context(view);
        return this.renderTokens(tokens, context, partials, template);
    };
    Writer.prototype.renderTokens = function renderTokens(tokens, context, partials, originalTemplate) {
        var buffer = '';
        var token, symbol, value;
        for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
            value = undefined;
            token = tokens[i];
            symbol = token[0];
            if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate);
            else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate);
            else if (symbol === '>') value = this.renderPartial(token, context, partials, originalTemplate);
            else if (symbol === '&') value = this.unescapedValue(token, context);
            else if (symbol === 'name') value = this.escapedValue(token, context);
            else if (symbol === 'text') value = this.rawValue(token);
            if (value !== undefined)
                buffer += value;
        }
        return buffer;
    };
    Writer.prototype.renderSection = function renderSection(token, context, partials, originalTemplate) {
        var self = this;
        var buffer = '';
        var value = context.lookup(token[1]);

        function subRender(template) {
            return self.render(template, context, partials);
        }
        if (!value) return;
        if (isArray(value)) {
            for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
                buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
            }
        } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
            buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
        } else if (isFunction(value)) {
            if (typeof originalTemplate !== 'string')
                throw new Error('Cannot use higher-order sections without the original template');
            value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);
            if (value != null)
                buffer += value;
        } else {
            buffer += this.renderTokens(token[4], context, partials, originalTemplate);
        }
        return buffer;
    };
    Writer.prototype.renderInverted = function renderInverted(token, context, partials, originalTemplate) {
        var value = context.lookup(token[1]);
        if (!value || (isArray(value) && value.length === 0))
            return this.renderTokens(token[4], context, partials, originalTemplate);
    };
    Writer.prototype.renderPartial = function renderPartial(token, context, partials) {
        if (!partials) return;
        var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
        if (value != null)
            return this.renderTokens(this.parse(value), context, partials, value);
    };
    Writer.prototype.unescapedValue = function unescapedValue(token, context) {
        var value = context.lookup(token[1]);
        if (value != null)
            return value;
    };
    Writer.prototype.escapedValue = function escapedValue(token, context) {
        var value = context.lookup(token[1]);
        if (value != null)
            return mustache.escape(value);
    };
    Writer.prototype.rawValue = function rawValue(token) {
        return token[1];
    };
    mustache.name = 'mustache.js';
    mustache.version = '2.2.1';
    mustache.tags = ['{{', '}}'];
    var defaultWriter = new Writer();
    mustache.clearCache = function clearCache() {
        return defaultWriter.clearCache();
    };
    mustache.parse = function parse(template, tags) {
        return defaultWriter.parse(template, tags);
    };
    mustache.render = function render(template, view, partials) {
        if (typeof template !== 'string') {
            throw new TypeError('Invalid template! Template should be a "string" ' + 'but "' + typeStr(template) + '" was given as the first ' + 'argument for mustache#render(template, view, partials)');
        }
        return defaultWriter.render(template, view, partials);
    };
    mustache.to_html = function to_html(template, view, partials, send) {
        var result = mustache.render(template, view, partials);
        if (isFunction(send)) {
            send(result);
        } else {
            return result;
        }
    };
    mustache.escape = escapeHtml;
    mustache.Scanner = Scanner;
    mustache.Context = Context;
    mustache.Writer = Writer;
}));
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = function(root, jQuery) {
            if (jQuery === undefined) {
                if (typeof window !== 'undefined') {
                    jQuery = require('jquery');
                } else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        factory(jQuery);
    }
}(function(jQuery) {
    var S2 = (function() {
        if (jQuery && jQuery.fn && jQuery.fn.select2 && jQuery.fn.select2.amd) {
            var S2 = jQuery.fn.select2.amd;
        }
        var S2;
        (function() {
            if (!S2 || !S2.requirejs) {
                if (!S2) {
                    S2 = {};
                } else {
                    require = S2;
                }
                var requirejs, require, define;
                (function(undef) {
                    var main, req, makeMap, handlers, defined = {},
                        waiting = {},
                        config = {},
                        defining = {},
                        hasOwn = Object.prototype.hasOwnProperty,
                        aps = [].slice,
                        jsSuffixRegExp = /\.js$/;

                    function hasProp(obj, prop) {
                        return hasOwn.call(obj, prop);
                    }

                    function normalize(name, baseName) {
                        var nameParts, nameSegment, mapValue, foundMap, lastIndex, foundI, foundStarMap, starI, i, j, part, baseParts = baseName && baseName.split("/"),
                            map = config.map,
                            starMap = (map && map['*']) || {};
                        if (name && name.charAt(0) === ".") {
                            if (baseName) {
                                name = name.split('/');
                                lastIndex = name.length - 1;
                                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                                }
                                name = baseParts.slice(0, baseParts.length - 1).concat(name);
                                for (i = 0; i < name.length; i += 1) {
                                    part = name[i];
                                    if (part === ".") {
                                        name.splice(i, 1);
                                        i -= 1;
                                    } else if (part === "..") {
                                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                                            break;
                                        } else if (i > 0) {
                                            name.splice(i - 1, 2);
                                            i -= 2;
                                        }
                                    }
                                }
                                name = name.join("/");
                            } else if (name.indexOf('./') === 0) {
                                name = name.substring(2);
                            }
                        }
                        if ((baseParts || starMap) && map) {
                            nameParts = name.split('/');
                            for (i = nameParts.length; i > 0; i -= 1) {
                                nameSegment = nameParts.slice(0, i).join("/");
                                if (baseParts) {
                                    for (j = baseParts.length; j > 0; j -= 1) {
                                        mapValue = map[baseParts.slice(0, j).join('/')];
                                        if (mapValue) {
                                            mapValue = mapValue[nameSegment];
                                            if (mapValue) {
                                                foundMap = mapValue;
                                                foundI = i;
                                                break;
                                            }
                                        }
                                    }
                                }
                                if (foundMap) {
                                    break;
                                }
                                if (!foundStarMap && starMap && starMap[nameSegment]) {
                                    foundStarMap = starMap[nameSegment];
                                    starI = i;
                                }
                            }
                            if (!foundMap && foundStarMap) {
                                foundMap = foundStarMap;
                                foundI = starI;
                            }
                            if (foundMap) {
                                nameParts.splice(0, foundI, foundMap);
                                name = nameParts.join('/');
                            }
                        }
                        return name;
                    }

                    function makeRequire(relName, forceSync) {
                        return function() {
                            var args = aps.call(arguments, 0);
                            if (typeof args[0] !== 'string' && args.length === 1) {
                                args.push(null);
                            }
                            return req.apply(undef, args.concat([relName, forceSync]));
                        };
                    }

                    function makeNormalize(relName) {
                        return function(name) {
                            return normalize(name, relName);
                        };
                    }

                    function makeLoad(depName) {
                        return function(value) {
                            defined[depName] = value;
                        };
                    }

                    function callDep(name) {
                        if (hasProp(waiting, name)) {
                            var args = waiting[name];
                            delete waiting[name];
                            defining[name] = true;
                            main.apply(undef, args);
                        }
                        if (!hasProp(defined, name) && !hasProp(defining, name)) {
                            throw new Error('No ' + name);
                        }
                        return defined[name];
                    }

                    function splitPrefix(name) {
                        var prefix, index = name ? name.indexOf('!') : -1;
                        if (index > -1) {
                            prefix = name.substring(0, index);
                            name = name.substring(index + 1, name.length);
                        }
                        return [prefix, name];
                    }
                    makeMap = function(name, relName) {
                        var plugin, parts = splitPrefix(name),
                            prefix = parts[0];
                        name = parts[1];
                        if (prefix) {
                            prefix = normalize(prefix, relName);
                            plugin = callDep(prefix);
                        }
                        if (prefix) {
                            if (plugin && plugin.normalize) {
                                name = plugin.normalize(name, makeNormalize(relName));
                            } else {
                                name = normalize(name, relName);
                            }
                        } else {
                            name = normalize(name, relName);
                            parts = splitPrefix(name);
                            prefix = parts[0];
                            name = parts[1];
                            if (prefix) {
                                plugin = callDep(prefix);
                            }
                        }
                        return {
                            f: prefix ? prefix + '!' + name : name,
                            n: name,
                            pr: prefix,
                            p: plugin
                        };
                    };

                    function makeConfig(name) {
                        return function() {
                            return (config && config.config && config.config[name]) || {};
                        };
                    }
                    handlers = {
                        require: function(name) {
                            return makeRequire(name);
                        },
                        exports: function(name) {
                            var e = defined[name];
                            if (typeof e !== 'undefined') {
                                return e;
                            } else {
                                return (defined[name] = {});
                            }
                        },
                        module: function(name) {
                            return {
                                id: name,
                                uri: '',
                                exports: defined[name],
                                config: makeConfig(name)
                            };
                        }
                    };
                    main = function(name, deps, callback, relName) {
                        var cjsModule, depName, ret, map, i, args = [],
                            callbackType = typeof callback,
                            usingExports;
                        relName = relName || name;
                        if (callbackType === 'undefined' || callbackType === 'function') {
                            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
                            for (i = 0; i < deps.length; i += 1) {
                                map = makeMap(deps[i], relName);
                                depName = map.f;
                                if (depName === "require") {
                                    args[i] = handlers.require(name);
                                } else if (depName === "exports") {
                                    args[i] = handlers.exports(name);
                                    usingExports = true;
                                } else if (depName === "module") {
                                    cjsModule = args[i] = handlers.module(name);
                                } else if (hasProp(defined, depName) || hasProp(waiting, depName) || hasProp(defining, depName)) {
                                    args[i] = callDep(depName);
                                } else if (map.p) {
                                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                                    args[i] = defined[depName];
                                } else {
                                    throw new Error(name + ' missing ' + depName);
                                }
                            }
                            ret = callback ? callback.apply(defined[name], args) : undefined;
                            if (name) {
                                if (cjsModule && cjsModule.exports !== undef && cjsModule.exports !== defined[name]) {
                                    defined[name] = cjsModule.exports;
                                } else if (ret !== undef || !usingExports) {
                                    defined[name] = ret;
                                }
                            }
                        } else if (name) {
                            defined[name] = callback;
                        }
                    };
                    requirejs = require = req = function(deps, callback, relName, forceSync, alt) {
                        if (typeof deps === "string") {
                            if (handlers[deps]) {
                                return handlers[deps](callback);
                            }
                            return callDep(makeMap(deps, callback).f);
                        } else if (!deps.splice) {
                            config = deps;
                            if (config.deps) {
                                req(config.deps, config.callback);
                            }
                            if (!callback) {
                                return;
                            }
                            if (callback.splice) {
                                deps = callback;
                                callback = relName;
                                relName = null;
                            } else {
                                deps = undef;
                            }
                        }
                        callback = callback || function() {};
                        if (typeof relName === 'function') {
                            relName = forceSync;
                            forceSync = alt;
                        }
                        if (forceSync) {
                            main(undef, deps, callback, relName);
                        } else {
                            setTimeout(function() {
                                main(undef, deps, callback, relName);
                            }, 4);
                        }
                        return req;
                    };
                    req.config = function(cfg) {
                        return req(cfg);
                    };
                    requirejs._defined = defined;
                    define = function(name, deps, callback) {
                        if (typeof name !== 'string') {
                            throw new Error('See almond README: incorrect module build, no module name');
                        }
                        if (!deps.splice) {
                            callback = deps;
                            deps = [];
                        }
                        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
                            waiting[name] = [name, deps, callback];
                        }
                    };
                    define.amd = {
                        jQuery: true
                    };
                }());
                S2.requirejs = requirejs;
                S2.require = require;
                S2.define = define;
            }
        }());
        S2.define("almond", function() {});
        S2.define('jquery', [], function() {
            var _$ = jQuery || $;
            if (_$ == null && console && console.error) {
                console.error('Select2: An instance of jQuery or a jQuery-compatible library was not ' + 'found. Make sure that you are including jQuery before Select2 on your ' + 'web page.');
            }
            return _$;
        });
        S2.define('select2/utils', ['jquery'], function($) {
            var Utils = {};
            Utils.Extend = function(ChildClass, SuperClass) {
                var __hasProp = {}.hasOwnProperty;

                function BaseConstructor() {
                    this.constructor = ChildClass;
                }
                for (var key in SuperClass) {
                    if (__hasProp.call(SuperClass, key)) {
                        ChildClass[key] = SuperClass[key];
                    }
                }
                BaseConstructor.prototype = SuperClass.prototype;
                ChildClass.prototype = new BaseConstructor();
                ChildClass.__super__ = SuperClass.prototype;
                return ChildClass;
            };

            function getMethods(theClass) {
                var proto = theClass.prototype;
                var methods = [];
                for (var methodName in proto) {
                    var m = proto[methodName];
                    if (typeof m !== 'function') {
                        continue;
                    }
                    if (methodName === 'constructor') {
                        continue;
                    }
                    methods.push(methodName);
                }
                return methods;
            }
            Utils.Decorate = function(SuperClass, DecoratorClass) {
                var decoratedMethods = getMethods(DecoratorClass);
                var superMethods = getMethods(SuperClass);

                function DecoratedClass() {
                    var unshift = Array.prototype.unshift;
                    var argCount = DecoratorClass.prototype.constructor.length;
                    var calledConstructor = SuperClass.prototype.constructor;
                    if (argCount > 0) {
                        unshift.call(arguments, SuperClass.prototype.constructor);
                        calledConstructor = DecoratorClass.prototype.constructor;
                    }
                    calledConstructor.apply(this, arguments);
                }
                DecoratorClass.displayName = SuperClass.displayName;

                function ctr() {
                    this.constructor = DecoratedClass;
                }
                DecoratedClass.prototype = new ctr();
                for (var m = 0; m < superMethods.length; m++) {
                    var superMethod = superMethods[m];
                    DecoratedClass.prototype[superMethod] = SuperClass.prototype[superMethod];
                }
                var calledMethod = function(methodName) {
                    var originalMethod = function() {};
                    if (methodName in DecoratedClass.prototype) {
                        originalMethod = DecoratedClass.prototype[methodName];
                    }
                    var decoratedMethod = DecoratorClass.prototype[methodName];
                    return function() {
                        var unshift = Array.prototype.unshift;
                        unshift.call(arguments, originalMethod);
                        return decoratedMethod.apply(this, arguments);
                    };
                };
                for (var d = 0; d < decoratedMethods.length; d++) {
                    var decoratedMethod = decoratedMethods[d];
                    DecoratedClass.prototype[decoratedMethod] = calledMethod(decoratedMethod);
                }
                return DecoratedClass;
            };
            var Observable = function() {
                this.listeners = {};
            };
            Observable.prototype.on = function(event, callback) {
                this.listeners = this.listeners || {};
                if (event in this.listeners) {
                    this.listeners[event].push(callback);
                } else {
                    this.listeners[event] = [callback];
                }
            };
            Observable.prototype.trigger = function(event) {
                var slice = Array.prototype.slice;
                var params = slice.call(arguments, 1);
                this.listeners = this.listeners || {};
                if (params == null) {
                    params = [];
                }
                if (params.length === 0) {
                    params.push({});
                }
                params[0]._type = event;
                if (event in this.listeners) {
                    this.invoke(this.listeners[event], slice.call(arguments, 1));
                }
                if ('*' in this.listeners) {
                    this.invoke(this.listeners['*'], arguments);
                }
            };
            Observable.prototype.invoke = function(listeners, params) {
                for (var i = 0, len = listeners.length; i < len; i++) {
                    listeners[i].apply(this, params);
                }
            };
            Utils.Observable = Observable;
            Utils.generateChars = function(length) {
                var chars = '';
                for (var i = 0; i < length; i++) {
                    var randomChar = Math.floor(Math.random() * 36);
                    chars += randomChar.toString(36);
                }
                return chars;
            };
            Utils.bind = function(func, context) {
                return function() {
                    func.apply(context, arguments);
                };
            };
            Utils._convertData = function(data) {
                for (var originalKey in data) {
                    var keys = originalKey.split('-');
                    var dataLevel = data;
                    if (keys.length === 1) {
                        continue;
                    }
                    for (var k = 0; k < keys.length; k++) {
                        var key = keys[k];
                        key = key.substring(0, 1).toLowerCase() + key.substring(1);
                        if (!(key in dataLevel)) {
                            dataLevel[key] = {};
                        }
                        if (k == keys.length - 1) {
                            dataLevel[key] = data[originalKey];
                        }
                        dataLevel = dataLevel[key];
                    }
                    delete data[originalKey];
                }
                return data;
            };
            Utils.hasScroll = function(index, el) {
                var $el = $(el);
                var overflowX = el.style.overflowX;
                var overflowY = el.style.overflowY;
                if (overflowX === overflowY && (overflowY === 'hidden' || overflowY === 'visible')) {
                    return false;
                }
                if (overflowX === 'scroll' || overflowY === 'scroll') {
                    return true;
                }
                return ($el.innerHeight() < el.scrollHeight || $el.innerWidth() < el.scrollWidth);
            };
            Utils.escapeMarkup = function(markup) {
                var replaceMap = {
                    '\\': '&#92;',
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    '\'': '&#39;',
                    '/': '&#47;'
                };
                if (typeof markup !== 'string') {
                    return markup;
                }
                return String(markup).replace(/[&<>"'\/\\]/g, function(match) {
                    return replaceMap[match];
                });
            };
            Utils.appendMany = function($element, $nodes) {
                if ($.fn.jquery.substr(0, 3) === '1.7') {
                    var $jqNodes = $();
                    $.map($nodes, function(node) {
                        $jqNodes = $jqNodes.add(node);
                    });
                    $nodes = $jqNodes;
                }
                $element.append($nodes);
            };
            return Utils;
        });
        S2.define('select2/results', ['jquery', './utils'], function($, Utils) {
            function Results($element, options, dataAdapter) {
                this.$element = $element;
                this.data = dataAdapter;
                this.options = options;
                Results.__super__.constructor.call(this);
            }
            Utils.Extend(Results, Utils.Observable);
            Results.prototype.render = function() {
                var $results = $('<ul class="select2-results__options" role="tree"></ul>');
                if (this.options.get('multiple')) {
                    $results.attr('aria-multiselectable', 'true');
                }
                this.$results = $results;
                return $results;
            };
            Results.prototype.clear = function() {
                this.$results.empty();
            };
            Results.prototype.displayMessage = function(params) {
                var escapeMarkup = this.options.get('escapeMarkup');
                this.clear();
                this.hideLoading();
                var $message = $('<li role="treeitem" aria-live="assertive"' + ' class="select2-results__option"></li>');
                var message = this.options.get('translations').get(params.message);
                $message.append(escapeMarkup(message(params.args)));
                $message[0].className += ' select2-results__message';
                this.$results.append($message);
            };
            Results.prototype.hideMessages = function() {
                this.$results.find('.select2-results__message').remove();
            };
            Results.prototype.append = function(data) {
                this.hideLoading();
                var $options = [];
                if (data.results == null || data.results.length === 0) {
                    if (this.$results.children().length === 0) {
                        this.trigger('results:message', {
                            message: 'noResults'
                        });
                    }
                    return;
                }
                data.results = this.sort(data.results);
                for (var d = 0; d < data.results.length; d++) {
                    var item = data.results[d];
                    var $option = this.option(item);
                    $options.push($option);
                }
                this.$results.append($options);
            };
            Results.prototype.position = function($results, $dropdown) {
                var $resultsContainer = $dropdown.find('.select2-results');
                $resultsContainer.append($results);
            };
            Results.prototype.sort = function(data) {
                var sorter = this.options.get('sorter');
                return sorter(data);
            };
            Results.prototype.highlightFirstItem = function() {
                var $options = this.$results.find('.select2-results__option[aria-selected]');
                var $selected = $options.filter('[aria-selected=true]');
                if ($selected.length > 0) {
                    $selected.first().trigger('mouseenter');
                } else {
                    $options.first().trigger('mouseenter');
                }
                this.ensureHighlightVisible();
            };
            Results.prototype.setClasses = function() {
                var self = this;
                this.data.current(function(selected) {
                    var selectedIds = $.map(selected, function(s) {
                        return s.id.toString();
                    });
                    var $options = self.$results.find('.select2-results__option[aria-selected]');
                    $options.each(function() {
                        var $option = $(this);
                        var item = $.data(this, 'data');
                        var id = '' + item.id;
                        if ((item.element != null && item.element.selected) || (item.element == null && $.inArray(id, selectedIds) > -1)) {
                            $option.attr('aria-selected', 'true');
                        } else {
                            $option.attr('aria-selected', 'false');
                        }
                    });
                });
            };
            Results.prototype.showLoading = function(params) {
                this.hideLoading();
                var loadingMore = this.options.get('translations').get('searching');
                var loading = {
                    disabled: true,
                    loading: true,
                    text: loadingMore(params)
                };
                var $loading = this.option(loading);
                $loading.className += ' loading-results';
                this.$results.prepend($loading);
            };
            Results.prototype.hideLoading = function() {
                this.$results.find('.loading-results').remove();
            };
            Results.prototype.option = function(data) {
                var option = document.createElement('li');
                option.className = 'select2-results__option';
                var attrs = {
                    'role': 'treeitem',
                    'aria-selected': 'false'
                };
                if (data.disabled) {
                    delete attrs['aria-selected'];
                    attrs['aria-disabled'] = 'true';
                }
                if (data.id == null) {
                    delete attrs['aria-selected'];
                }
                if (data._resultId != null) {
                    option.id = data._resultId;
                }
                if (data.title) {
                    option.title = data.title;
                }
                if (data.children) {
                    attrs.role = 'group';
                    attrs['aria-label'] = data.text;
                    delete attrs['aria-selected'];
                }
                for (var attr in attrs) {
                    var val = attrs[attr];
                    option.setAttribute(attr, val);
                }
                if (data.children) {
                    var $option = $(option);
                    var label = document.createElement('strong');
                    label.className = 'select2-results__group';
                    var $label = $(label);
                    this.template(data, label);
                    var $children = [];
                    for (var c = 0; c < data.children.length; c++) {
                        var child = data.children[c];
                        var $child = this.option(child);
                        $children.push($child);
                    }
                    var $childrenContainer = $('<ul></ul>', {
                        'class': 'select2-results__options select2-results__options--nested'
                    });
                    $childrenContainer.append($children);
                    $option.append(label);
                    $option.append($childrenContainer);
                } else {
                    this.template(data, option);
                }
                $.data(option, 'data', data);
                return option;
            };
            Results.prototype.bind = function(container, $container) {
                var self = this;
                var id = container.id + '-results';
                this.$results.attr('id', id);
                container.on('results:all', function(params) {
                    self.clear();
                    self.append(params.data);
                    if (container.isOpen()) {
                        self.setClasses();
                        self.highlightFirstItem();
                    }
                });
                container.on('results:append', function(params) {
                    self.append(params.data);
                    if (container.isOpen()) {
                        self.setClasses();
                    }
                });
                container.on('query', function(params) {
                    self.hideMessages();
                    self.showLoading(params);
                });
                container.on('select', function() {
                    if (!container.isOpen()) {
                        return;
                    }
                    self.setClasses();
                    self.highlightFirstItem();
                });
                container.on('unselect', function() {
                    if (!container.isOpen()) {
                        return;
                    }
                    self.setClasses();
                    self.highlightFirstItem();
                });
                container.on('open', function() {
                    self.$results.attr('aria-expanded', 'true');
                    self.$results.attr('aria-hidden', 'false');
                    self.setClasses();
                    self.ensureHighlightVisible();
                });
                container.on('close', function() {
                    self.$results.attr('aria-expanded', 'false');
                    self.$results.attr('aria-hidden', 'true');
                    self.$results.removeAttr('aria-activedescendant');
                });
                container.on('results:toggle', function() {
                    var $highlighted = self.getHighlightedResults();
                    if ($highlighted.length === 0) {
                        return;
                    }
                    $highlighted.trigger('mouseup');
                });
                container.on('results:select', function() {
                    var $highlighted = self.getHighlightedResults();
                    if ($highlighted.length === 0) {
                        return;
                    }
                    var data = $highlighted.data('data');
                    if ($highlighted.attr('aria-selected') == 'true') {
                        self.trigger('close', {});
                    } else {
                        self.trigger('select', {
                            data: data
                        });
                    }
                });
                container.on('results:previous', function() {
                    var $highlighted = self.getHighlightedResults();
                    var $options = self.$results.find('[aria-selected]');
                    var currentIndex = $options.index($highlighted);
                    if (currentIndex === 0) {
                        return;
                    }
                    var nextIndex = currentIndex - 1;
                    if ($highlighted.length === 0) {
                        nextIndex = 0;
                    }
                    var $next = $options.eq(nextIndex);
                    $next.trigger('mouseenter');
                    var currentOffset = self.$results.offset().top;
                    var nextTop = $next.offset().top;
                    var nextOffset = self.$results.scrollTop() + (nextTop - currentOffset);
                    if (nextIndex === 0) {
                        self.$results.scrollTop(0);
                    } else if (nextTop - currentOffset < 0) {
                        self.$results.scrollTop(nextOffset);
                    }
                });
                container.on('results:next', function() {
                    var $highlighted = self.getHighlightedResults();
                    var $options = self.$results.find('[aria-selected]');
                    var currentIndex = $options.index($highlighted);
                    var nextIndex = currentIndex + 1;
                    if (nextIndex >= $options.length) {
                        return;
                    }
                    var $next = $options.eq(nextIndex);
                    $next.trigger('mouseenter');
                    var currentOffset = self.$results.offset().top + self.$results.outerHeight(false);
                    var nextBottom = $next.offset().top + $next.outerHeight(false);
                    var nextOffset = self.$results.scrollTop() + nextBottom - currentOffset;
                    if (nextIndex === 0) {
                        self.$results.scrollTop(0);
                    } else if (nextBottom > currentOffset) {
                        self.$results.scrollTop(nextOffset);
                    }
                });
                container.on('results:focus', function(params) {
                    params.element.addClass('select2-results__option--highlighted');
                });
                container.on('results:message', function(params) {
                    self.displayMessage(params);
                });
                if ($.fn.mousewheel) {
                    this.$results.on('mousewheel', function(e) {
                        var top = self.$results.scrollTop();
                        var bottom = self.$results.get(0).scrollHeight - top + e.deltaY;
                        var isAtTop = e.deltaY > 0 && top - e.deltaY <= 0;
                        var isAtBottom = e.deltaY < 0 && bottom <= self.$results.height();
                        if (isAtTop) {
                            self.$results.scrollTop(0);
                            e.preventDefault();
                            e.stopPropagation();
                        } else if (isAtBottom) {
                            self.$results.scrollTop(self.$results.get(0).scrollHeight - self.$results.height());
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    });
                }
                this.$results.on('mouseup', '.select2-results__option[aria-selected]', function(evt) {
                    var $this = $(this);
                    var data = $this.data('data');
                    if ($this.attr('aria-selected') === 'true') {
                        if (self.options.get('multiple')) {
                            self.trigger('unselect', {
                                originalEvent: evt,
                                data: data
                            });
                        } else {
                            self.trigger('close', {});
                        }
                        return;
                    }
                    self.trigger('select', {
                        originalEvent: evt,
                        data: data
                    });
                });
                this.$results.on('mouseenter', '.select2-results__option[aria-selected]', function(evt) {
                    var data = $(this).data('data');
                    self.getHighlightedResults().removeClass('select2-results__option--highlighted');
                    self.trigger('results:focus', {
                        data: data,
                        element: $(this)
                    });
                });
            };
            Results.prototype.getHighlightedResults = function() {
                var $highlighted = this.$results.find('.select2-results__option--highlighted');
                return $highlighted;
            };
            Results.prototype.destroy = function() {
                this.$results.remove();
            };
            Results.prototype.ensureHighlightVisible = function() {
                var $highlighted = this.getHighlightedResults();
                if ($highlighted.length === 0) {
                    return;
                }
                var $options = this.$results.find('[aria-selected]');
                var currentIndex = $options.index($highlighted);
                var currentOffset = this.$results.offset().top;
                var nextTop = $highlighted.offset().top;
                var nextOffset = this.$results.scrollTop() + (nextTop - currentOffset);
                var offsetDelta = nextTop - currentOffset;
                nextOffset -= $highlighted.outerHeight(false) * 2;
                if (currentIndex <= 2) {
                    this.$results.scrollTop(0);
                } else if (offsetDelta > this.$results.outerHeight() || offsetDelta < 0) {
                    this.$results.scrollTop(nextOffset);
                }
            };
            Results.prototype.template = function(result, container) {
                var template = this.options.get('templateResult');
                var escapeMarkup = this.options.get('escapeMarkup');
                var content = template(result, container);
                if (content == null) {
                    container.style.display = 'none';
                } else if (typeof content === 'string') {
                    container.innerHTML = escapeMarkup(content);
                } else {
                    $(container).append(content);
                }
            };
            return Results;
        });
        S2.define('select2/keys', [], function() {
            var KEYS = {
                BACKSPACE: 8,
                TAB: 9,
                ENTER: 13,
                SHIFT: 16,
                CTRL: 17,
                ALT: 18,
                ESC: 27,
                SPACE: 32,
                PAGE_UP: 33,
                PAGE_DOWN: 34,
                END: 35,
                HOME: 36,
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                DOWN: 40,
                DELETE: 46
            };
            return KEYS;
        });
        S2.define('select2/selection/base', ['jquery', '../utils', '../keys'], function($, Utils, KEYS) {
            function BaseSelection($element, options) {
                this.$element = $element;
                this.options = options;
                BaseSelection.__super__.constructor.call(this);
            }
            Utils.Extend(BaseSelection, Utils.Observable);
            BaseSelection.prototype.render = function() {
                var $selection = $('<span class="select2-selection" role="combobox" ' + ' aria-haspopup="true" aria-expanded="false">' + '</span>');
                this._tabindex = 0;
                if (this.$element.data('old-tabindex') != null) {
                    this._tabindex = this.$element.data('old-tabindex');
                } else if (this.$element.attr('tabindex') != null) {
                    this._tabindex = this.$element.attr('tabindex');
                }
                $selection.attr('title', this.$element.attr('title'));
                $selection.attr('tabindex', this._tabindex);
                this.$selection = $selection;
                return $selection;
            };
            BaseSelection.prototype.bind = function(container, $container) {
                var self = this;
                var id = container.id + '-container';
                var resultsId = container.id + '-results';
                this.container = container;
                this.$selection.on('focus', function(evt) {
                    self.trigger('focus', evt);
                });
                this.$selection.on('blur', function(evt) {
                    self._handleBlur(evt);
                });
                this.$selection.on('keydown', function(evt) {
                    self.trigger('keypress', evt);
                    if (evt.which === KEYS.SPACE) {
                        evt.preventDefault();
                    }
                });
                container.on('results:focus', function(params) {
                    self.$selection.attr('aria-activedescendant', params.data._resultId);
                });
                container.on('selection:update', function(params) {
                    self.update(params.data);
                });
                container.on('open', function() {
                    self.$selection.attr('aria-expanded', 'true');
                    self.$selection.attr('aria-owns', resultsId);
                    self._attachCloseHandler(container);
                });
                container.on('close', function() {
                    self.$selection.attr('aria-expanded', 'false');
                    self.$selection.removeAttr('aria-activedescendant');
                    self.$selection.removeAttr('aria-owns');
                    self.$selection.focus();
                    self._detachCloseHandler(container);
                });
                container.on('enable', function() {
                    self.$selection.attr('tabindex', self._tabindex);
                });
                container.on('disable', function() {
                    self.$selection.attr('tabindex', '-1');
                });
            };
            BaseSelection.prototype._handleBlur = function(evt) {
                var self = this;
                window.setTimeout(function() {
                    if ((document.activeElement == self.$selection[0]) || ($.contains(self.$selection[0], document.activeElement))) {
                        return;
                    }
                    self.trigger('blur', evt);
                }, 1);
            };
            BaseSelection.prototype._attachCloseHandler = function(container) {
                var self = this;
                $(document.body).on('mousedown.select2.' + container.id, function(e) {
                    var $target = $(e.target);
                    var $select = $target.closest('.select2');
                    var $all = $('.select2.select2-container--open');
                    $all.each(function() {
                        var $this = $(this);
                        if (this == $select[0]) {
                            return;
                        }
                        var $element = $this.data('element');
                        $element.select2('close');
                    });
                });
            };
            BaseSelection.prototype._detachCloseHandler = function(container) {
                $(document.body).off('mousedown.select2.' + container.id);
            };
            BaseSelection.prototype.position = function($selection, $container) {
                var $selectionContainer = $container.find('.selection');
                $selectionContainer.append($selection);
            };
            BaseSelection.prototype.destroy = function() {
                this._detachCloseHandler(this.container);
            };
            BaseSelection.prototype.update = function(data) {
                throw new Error('The `update` method must be defined in child classes.');
            };
            return BaseSelection;
        });
        S2.define('select2/selection/single', ['jquery', './base', '../utils', '../keys'], function($, BaseSelection, Utils, KEYS) {
            function SingleSelection() {
                SingleSelection.__super__.constructor.apply(this, arguments);
            }
            Utils.Extend(SingleSelection, BaseSelection);
            SingleSelection.prototype.render = function() {
                var $selection = SingleSelection.__super__.render.call(this);
                $selection.addClass('select2-selection--single');
                $selection.html('<span class="select2-selection__rendered"></span>' + '<span class="select2-selection__arrow" role="presentation">' + '<b role="presentation"></b>' + '</span>');
                return $selection;
            };
            SingleSelection.prototype.bind = function(container, $container) {
                var self = this;
                SingleSelection.__super__.bind.apply(this, arguments);
                var id = container.id + '-container';
                this.$selection.find('.select2-selection__rendered').attr('id', id);
                this.$selection.attr('aria-labelledby', id);
                this.$selection.on('mousedown', function(evt) {
                    if (evt.which !== 1) {
                        return;
                    }
                    self.trigger('toggle', {
                        originalEvent: evt
                    });
                });
                this.$selection.on('focus', function(evt) {});
                this.$selection.on('blur', function(evt) {});
                container.on('focus', function(evt) {
                    if (!container.isOpen()) {
                        self.$selection.focus();
                    }
                });
                container.on('selection:update', function(params) {
                    self.update(params.data);
                });
            };
            SingleSelection.prototype.clear = function() {
                this.$selection.find('.select2-selection__rendered').empty();
            };
            SingleSelection.prototype.display = function(data, container) {
                var template = this.options.get('templateSelection');
                var escapeMarkup = this.options.get('escapeMarkup');
                return escapeMarkup(template(data, container));
            };
            SingleSelection.prototype.selectionContainer = function() {
                return $('<span></span>');
            };
            SingleSelection.prototype.update = function(data) {
                if (data.length === 0) {
                    this.clear();
                    return;
                }
                var selection = data[0];
                var $rendered = this.$selection.find('.select2-selection__rendered');
                var formatted = this.display(selection, $rendered);
                $rendered.empty().append(formatted);
                $rendered.prop('title', selection.title || selection.text);
            };
            return SingleSelection;
        });
        S2.define('select2/selection/multiple', ['jquery', './base', '../utils'], function($, BaseSelection, Utils) {
            function MultipleSelection($element, options) {
                MultipleSelection.__super__.constructor.apply(this, arguments);
            }
            Utils.Extend(MultipleSelection, BaseSelection);
            MultipleSelection.prototype.render = function() {
                var $selection = MultipleSelection.__super__.render.call(this);
                $selection.addClass('select2-selection--multiple');
                $selection.html('<ul class="select2-selection__rendered"></ul>');
                return $selection;
            };
            MultipleSelection.prototype.bind = function(container, $container) {
                var self = this;
                MultipleSelection.__super__.bind.apply(this, arguments);
                this.$selection.on('click', function(evt) {
                    self.trigger('toggle', {
                        originalEvent: evt
                    });
                });
                this.$selection.on('click', '.select2-selection__choice__remove', function(evt) {
                    if (self.options.get('disabled')) {
                        return;
                    }
                    var $remove = $(this);
                    var $selection = $remove.parent();
                    var data = $selection.data('data');
                    self.trigger('unselect', {
                        originalEvent: evt,
                        data: data
                    });
                });
            };
            MultipleSelection.prototype.clear = function() {
                this.$selection.find('.select2-selection__rendered').empty();
            };
            MultipleSelection.prototype.display = function(data, container) {
                var template = this.options.get('templateSelection');
                var escapeMarkup = this.options.get('escapeMarkup');
                return escapeMarkup(template(data, container));
            };
            MultipleSelection.prototype.selectionContainer = function() {
                var $container = $('<li class="select2-selection__choice">' + '<span class="select2-selection__choice__remove" role="presentation">' + '&times;' + '</span>' + '</li>');
                return $container;
            };
            MultipleSelection.prototype.update = function(data) {
                this.clear();
                if (data.length === 0) {
                    return;
                }
                var $selections = [];
                for (var d = 0; d < data.length; d++) {
                    var selection = data[d];
                    var $selection = this.selectionContainer();
                    var formatted = this.display(selection, $selection);
                    $selection.append(formatted);
                    $selection.prop('title', selection.title || selection.text);
                    $selection.data('data', selection);
                    $selections.push($selection);
                }
                var $rendered = this.$selection.find('.select2-selection__rendered');
                Utils.appendMany($rendered, $selections);
            };
            return MultipleSelection;
        });
        S2.define('select2/selection/placeholder', ['../utils'], function(Utils) {
            function Placeholder(decorated, $element, options) {
                this.placeholder = this.normalizePlaceholder(options.get('placeholder'));
                decorated.call(this, $element, options);
            }
            Placeholder.prototype.normalizePlaceholder = function(_, placeholder) {
                if (typeof placeholder === 'string') {
                    placeholder = {
                        id: '',
                        text: placeholder
                    };
                }
                return placeholder;
            };
            Placeholder.prototype.createPlaceholder = function(decorated, placeholder) {
                var $placeholder = this.selectionContainer();
                $placeholder.html(this.display(placeholder));
                $placeholder.addClass('select2-selection__placeholder').removeClass('select2-selection__choice');
                return $placeholder;
            };
            Placeholder.prototype.update = function(decorated, data) {
                var singlePlaceholder = (data.length == 1 && data[0].id != this.placeholder.id);
                var multipleSelections = data.length > 1;
                if (multipleSelections || singlePlaceholder) {
                    return decorated.call(this, data);
                }
                this.clear();
                var $placeholder = this.createPlaceholder(this.placeholder);
                this.$selection.find('.select2-selection__rendered').append($placeholder);
            };
            return Placeholder;
        });
        S2.define('select2/selection/allowClear', ['jquery', '../keys'], function($, KEYS) {
            function AllowClear() {}
            AllowClear.prototype.bind = function(decorated, container, $container) {
                var self = this;
                decorated.call(this, container, $container);
                if (this.placeholder == null) {
                    if (this.options.get('debug') && window.console && console.error) {
                        console.error('Select2: The `allowClear` option should be used in combination ' + 'with the `placeholder` option.');
                    }
                }
                this.$selection.on('mousedown', '.select2-selection__clear', function(evt) {
                    self._handleClear(evt);
                });
                container.on('keypress', function(evt) {
                    self._handleKeyboardClear(evt, container);
                });
            };
            AllowClear.prototype._handleClear = function(_, evt) {
                if (this.options.get('disabled')) {
                    return;
                }
                var $clear = this.$selection.find('.select2-selection__clear');
                if ($clear.length === 0) {
                    return;
                }
                evt.stopPropagation();
                var data = $clear.data('data');
                for (var d = 0; d < data.length; d++) {
                    var unselectData = {
                        data: data[d]
                    };
                    this.trigger('unselect', unselectData);
                    if (unselectData.prevented) {
                        return;
                    }
                }
                this.$element.val(this.placeholder.id).trigger('change');
                this.trigger('toggle', {});
            };
            AllowClear.prototype._handleKeyboardClear = function(_, evt, container) {
                if (container.isOpen()) {
                    return;
                }
                if (evt.which == KEYS.DELETE || evt.which == KEYS.BACKSPACE) {
                    this._handleClear(evt);
                }
            };
            AllowClear.prototype.update = function(decorated, data) {
                decorated.call(this, data);
                if (this.$selection.find('.select2-selection__placeholder').length > 0 || data.length === 0) {
                    return;
                }
                var $remove = $('<span class="select2-selection__clear">' + '&times;' + '</span>');
                $remove.data('data', data);
                this.$selection.find('.select2-selection__rendered').prepend($remove);
            };
            return AllowClear;
        });
        S2.define('select2/selection/search', ['jquery', '../utils', '../keys'], function($, Utils, KEYS) {
            function Search(decorated, $element, options) {
                decorated.call(this, $element, options);
            }
            Search.prototype.render = function(decorated) {
                var $search = $('<li class="select2-search select2-search--inline">' + '<input class="select2-search__field" type="search" tabindex="-1"' + ' autocomplete="off" autocorrect="off" autocapitalize="off"' + ' spellcheck="false" role="textbox" aria-autocomplete="list" />' + '</li>');
                this.$searchContainer = $search;
                this.$search = $search.find('input');
                var $rendered = decorated.call(this);
                this._transferTabIndex();
                return $rendered;
            };
            Search.prototype.bind = function(decorated, container, $container) {
                var self = this;
                decorated.call(this, container, $container);
                container.on('open', function() {
                    self.$search.trigger('focus');
                });
                container.on('close', function() {
                    self.$search.val('');
                    self.$search.removeAttr('aria-activedescendant');
                    self.$search.trigger('focus');
                });
                container.on('enable', function() {
                    self.$search.prop('disabled', false);
                    self._transferTabIndex();
                });
                container.on('disable', function() {
                    self.$search.prop('disabled', true);
                });
                container.on('focus', function(evt) {
                    self.$search.trigger('focus');
                });
                container.on('results:focus', function(params) {
                    self.$search.attr('aria-activedescendant', params.id);
                });
                this.$selection.on('focusin', '.select2-search--inline', function(evt) {
                    self.trigger('focus', evt);
                });
                this.$selection.on('focusout', '.select2-search--inline', function(evt) {
                    self._handleBlur(evt);
                });
                this.$selection.on('keydown', '.select2-search--inline', function(evt) {
                    evt.stopPropagation();
                    self.trigger('keypress', evt);
                    self._keyUpPrevented = evt.isDefaultPrevented();
                    var key = evt.which;
                    if (key === KEYS.BACKSPACE && self.$search.val() === '') {
                        var $previousChoice = self.$searchContainer.prev('.select2-selection__choice');
                        if ($previousChoice.length > 0) {
                            var item = $previousChoice.data('data');
                            self.searchRemoveChoice(item);
                            evt.preventDefault();
                        }
                    }
                });
                var msie = document.documentMode;
                var disableInputEvents = msie && msie <= 11;
                this.$selection.on('input.searchcheck', '.select2-search--inline', function(evt) {
                    if (disableInputEvents) {
                        self.$selection.off('input.search input.searchcheck');
                        return;
                    }
                    self.$selection.off('keyup.search');
                });
                this.$selection.on('keyup.search input.search', '.select2-search--inline', function(evt) {
                    if (disableInputEvents && evt.type === 'input') {
                        self.$selection.off('input.search input.searchcheck');
                        return;
                    }
                    var key = evt.which;
                    if (key == KEYS.SHIFT || key == KEYS.CTRL || key == KEYS.ALT) {
                        return;
                    }
                    if (key == KEYS.TAB) {
                        return;
                    }
                    self.handleSearch(evt);
                });
            };
            Search.prototype._transferTabIndex = function(decorated) {
                this.$search.attr('tabindex', this.$selection.attr('tabindex'));
                this.$selection.attr('tabindex', '-1');
            };
            Search.prototype.createPlaceholder = function(decorated, placeholder) {
                this.$search.attr('placeholder', placeholder.text);
            };
            Search.prototype.update = function(decorated, data) {
                var searchHadFocus = this.$search[0] == document.activeElement;
                this.$search.attr('placeholder', '');
                decorated.call(this, data);
                this.$selection.find('.select2-selection__rendered').append(this.$searchContainer);
                this.resizeSearch();
                if (searchHadFocus) {
                    this.$search.focus();
                }
            };
            Search.prototype.handleSearch = function() {
                this.resizeSearch();
                if (!this._keyUpPrevented) {
                    var input = this.$search.val();
                    this.trigger('query', {
                        term: input
                    });
                }
                this._keyUpPrevented = false;
            };
            Search.prototype.searchRemoveChoice = function(decorated, item) {
                this.trigger('unselect', {
                    data: item
                });
                this.$search.val(item.text);
                this.handleSearch();
            };
            Search.prototype.resizeSearch = function() {
                this.$search.css('width', '25px');
                var width = '';
                if (this.$search.attr('placeholder') !== '') {
                    width = this.$selection.find('.select2-selection__rendered').innerWidth();
                } else {
                    var minimumWidth = this.$search.val().length + 1;
                    width = (minimumWidth * 0.75) + 'em';
                }
                this.$search.css('width', width);
            };
            return Search;
        });
        S2.define('select2/selection/eventRelay', ['jquery'], function($) {
            function EventRelay() {}
            EventRelay.prototype.bind = function(decorated, container, $container) {
                var self = this;
                var relayEvents = ['open', 'opening', 'close', 'closing', 'select', 'selecting', 'unselect', 'unselecting'];
                var preventableEvents = ['opening', 'closing', 'selecting', 'unselecting'];
                decorated.call(this, container, $container);
                container.on('*', function(name, params) {
                    if ($.inArray(name, relayEvents) === -1) {
                        return;
                    }
                    params = params || {};
                    var evt = $.Event('select2:' + name, {
                        params: params
                    });
                    self.$element.trigger(evt);
                    if ($.inArray(name, preventableEvents) === -1) {
                        return;
                    }
                    params.prevented = evt.isDefaultPrevented();
                });
            };
            return EventRelay;
        });
        S2.define('select2/translation', ['jquery', 'require'], function($, require) {
            function Translation(dict) {
                this.dict = dict || {};
            }
            Translation.prototype.all = function() {
                return this.dict;
            };
            Translation.prototype.get = function(key) {
                return this.dict[key];
            };
            Translation.prototype.extend = function(translation) {
                this.dict = $.extend({}, translation.all(), this.dict);
            };
            Translation._cache = {};
            Translation.loadPath = function(path) {
                if (!(path in Translation._cache)) {
                    var translations = require(path);
                    Translation._cache[path] = translations;
                }
                return new Translation(Translation._cache[path]);
            };
            return Translation;
        });
        S2.define('select2/diacritics', [], function() {
            var diacritics = {
                '\u24B6': 'A',
                '\uFF21': 'A',
                '\u00C0': 'A',
                '\u00C1': 'A',
                '\u00C2': 'A',
                '\u1EA6': 'A',
                '\u1EA4': 'A',
                '\u1EAA': 'A',
                '\u1EA8': 'A',
                '\u00C3': 'A',
                '\u0100': 'A',
                '\u0102': 'A',
                '\u1EB0': 'A',
                '\u1EAE': 'A',
                '\u1EB4': 'A',
                '\u1EB2': 'A',
                '\u0226': 'A',
                '\u01E0': 'A',
                '\u00C4': 'A',
                '\u01DE': 'A',
                '\u1EA2': 'A',
                '\u00C5': 'A',
                '\u01FA': 'A',
                '\u01CD': 'A',
                '\u0200': 'A',
                '\u0202': 'A',
                '\u1EA0': 'A',
                '\u1EAC': 'A',
                '\u1EB6': 'A',
                '\u1E00': 'A',
                '\u0104': 'A',
                '\u023A': 'A',
                '\u2C6F': 'A',
                '\uA732': 'AA',
                '\u00C6': 'AE',
                '\u01FC': 'AE',
                '\u01E2': 'AE',
                '\uA734': 'AO',
                '\uA736': 'AU',
                '\uA738': 'AV',
                '\uA73A': 'AV',
                '\uA73C': 'AY',
                '\u24B7': 'B',
                '\uFF22': 'B',
                '\u1E02': 'B',
                '\u1E04': 'B',
                '\u1E06': 'B',
                '\u0243': 'B',
                '\u0182': 'B',
                '\u0181': 'B',
                '\u24B8': 'C',
                '\uFF23': 'C',
                '\u0106': 'C',
                '\u0108': 'C',
                '\u010A': 'C',
                '\u010C': 'C',
                '\u00C7': 'C',
                '\u1E08': 'C',
                '\u0187': 'C',
                '\u023B': 'C',
                '\uA73E': 'C',
                '\u24B9': 'D',
                '\uFF24': 'D',
                '\u1E0A': 'D',
                '\u010E': 'D',
                '\u1E0C': 'D',
                '\u1E10': 'D',
                '\u1E12': 'D',
                '\u1E0E': 'D',
                '\u0110': 'D',
                '\u018B': 'D',
                '\u018A': 'D',
                '\u0189': 'D',
                '\uA779': 'D',
                '\u01F1': 'DZ',
                '\u01C4': 'DZ',
                '\u01F2': 'Dz',
                '\u01C5': 'Dz',
                '\u24BA': 'E',
                '\uFF25': 'E',
                '\u00C8': 'E',
                '\u00C9': 'E',
                '\u00CA': 'E',
                '\u1EC0': 'E',
                '\u1EBE': 'E',
                '\u1EC4': 'E',
                '\u1EC2': 'E',
                '\u1EBC': 'E',
                '\u0112': 'E',
                '\u1E14': 'E',
                '\u1E16': 'E',
                '\u0114': 'E',
                '\u0116': 'E',
                '\u00CB': 'E',
                '\u1EBA': 'E',
                '\u011A': 'E',
                '\u0204': 'E',
                '\u0206': 'E',
                '\u1EB8': 'E',
                '\u1EC6': 'E',
                '\u0228': 'E',
                '\u1E1C': 'E',
                '\u0118': 'E',
                '\u1E18': 'E',
                '\u1E1A': 'E',
                '\u0190': 'E',
                '\u018E': 'E',
                '\u24BB': 'F',
                '\uFF26': 'F',
                '\u1E1E': 'F',
                '\u0191': 'F',
                '\uA77B': 'F',
                '\u24BC': 'G',
                '\uFF27': 'G',
                '\u01F4': 'G',
                '\u011C': 'G',
                '\u1E20': 'G',
                '\u011E': 'G',
                '\u0120': 'G',
                '\u01E6': 'G',
                '\u0122': 'G',
                '\u01E4': 'G',
                '\u0193': 'G',
                '\uA7A0': 'G',
                '\uA77D': 'G',
                '\uA77E': 'G',
                '\u24BD': 'H',
                '\uFF28': 'H',
                '\u0124': 'H',
                '\u1E22': 'H',
                '\u1E26': 'H',
                '\u021E': 'H',
                '\u1E24': 'H',
                '\u1E28': 'H',
                '\u1E2A': 'H',
                '\u0126': 'H',
                '\u2C67': 'H',
                '\u2C75': 'H',
                '\uA78D': 'H',
                '\u24BE': 'I',
                '\uFF29': 'I',
                '\u00CC': 'I',
                '\u00CD': 'I',
                '\u00CE': 'I',
                '\u0128': 'I',
                '\u012A': 'I',
                '\u012C': 'I',
                '\u0130': 'I',
                '\u00CF': 'I',
                '\u1E2E': 'I',
                '\u1EC8': 'I',
                '\u01CF': 'I',
                '\u0208': 'I',
                '\u020A': 'I',
                '\u1ECA': 'I',
                '\u012E': 'I',
                '\u1E2C': 'I',
                '\u0197': 'I',
                '\u24BF': 'J',
                '\uFF2A': 'J',
                '\u0134': 'J',
                '\u0248': 'J',
                '\u24C0': 'K',
                '\uFF2B': 'K',
                '\u1E30': 'K',
                '\u01E8': 'K',
                '\u1E32': 'K',
                '\u0136': 'K',
                '\u1E34': 'K',
                '\u0198': 'K',
                '\u2C69': 'K',
                '\uA740': 'K',
                '\uA742': 'K',
                '\uA744': 'K',
                '\uA7A2': 'K',
                '\u24C1': 'L',
                '\uFF2C': 'L',
                '\u013F': 'L',
                '\u0139': 'L',
                '\u013D': 'L',
                '\u1E36': 'L',
                '\u1E38': 'L',
                '\u013B': 'L',
                '\u1E3C': 'L',
                '\u1E3A': 'L',
                '\u0141': 'L',
                '\u023D': 'L',
                '\u2C62': 'L',
                '\u2C60': 'L',
                '\uA748': 'L',
                '\uA746': 'L',
                '\uA780': 'L',
                '\u01C7': 'LJ',
                '\u01C8': 'Lj',
                '\u24C2': 'M',
                '\uFF2D': 'M',
                '\u1E3E': 'M',
                '\u1E40': 'M',
                '\u1E42': 'M',
                '\u2C6E': 'M',
                '\u019C': 'M',
                '\u24C3': 'N',
                '\uFF2E': 'N',
                '\u01F8': 'N',
                '\u0143': 'N',
                '\u00D1': 'N',
                '\u1E44': 'N',
                '\u0147': 'N',
                '\u1E46': 'N',
                '\u0145': 'N',
                '\u1E4A': 'N',
                '\u1E48': 'N',
                '\u0220': 'N',
                '\u019D': 'N',
                '\uA790': 'N',
                '\uA7A4': 'N',
                '\u01CA': 'NJ',
                '\u01CB': 'Nj',
                '\u24C4': 'O',
                '\uFF2F': 'O',
                '\u00D2': 'O',
                '\u00D3': 'O',
                '\u00D4': 'O',
                '\u1ED2': 'O',
                '\u1ED0': 'O',
                '\u1ED6': 'O',
                '\u1ED4': 'O',
                '\u00D5': 'O',
                '\u1E4C': 'O',
                '\u022C': 'O',
                '\u1E4E': 'O',
                '\u014C': 'O',
                '\u1E50': 'O',
                '\u1E52': 'O',
                '\u014E': 'O',
                '\u022E': 'O',
                '\u0230': 'O',
                '\u00D6': 'O',
                '\u022A': 'O',
                '\u1ECE': 'O',
                '\u0150': 'O',
                '\u01D1': 'O',
                '\u020C': 'O',
                '\u020E': 'O',
                '\u01A0': 'O',
                '\u1EDC': 'O',
                '\u1EDA': 'O',
                '\u1EE0': 'O',
                '\u1EDE': 'O',
                '\u1EE2': 'O',
                '\u1ECC': 'O',
                '\u1ED8': 'O',
                '\u01EA': 'O',
                '\u01EC': 'O',
                '\u00D8': 'O',
                '\u01FE': 'O',
                '\u0186': 'O',
                '\u019F': 'O',
                '\uA74A': 'O',
                '\uA74C': 'O',
                '\u01A2': 'OI',
                '\uA74E': 'OO',
                '\u0222': 'OU',
                '\u24C5': 'P',
                '\uFF30': 'P',
                '\u1E54': 'P',
                '\u1E56': 'P',
                '\u01A4': 'P',
                '\u2C63': 'P',
                '\uA750': 'P',
                '\uA752': 'P',
                '\uA754': 'P',
                '\u24C6': 'Q',
                '\uFF31': 'Q',
                '\uA756': 'Q',
                '\uA758': 'Q',
                '\u024A': 'Q',
                '\u24C7': 'R',
                '\uFF32': 'R',
                '\u0154': 'R',
                '\u1E58': 'R',
                '\u0158': 'R',
                '\u0210': 'R',
                '\u0212': 'R',
                '\u1E5A': 'R',
                '\u1E5C': 'R',
                '\u0156': 'R',
                '\u1E5E': 'R',
                '\u024C': 'R',
                '\u2C64': 'R',
                '\uA75A': 'R',
                '\uA7A6': 'R',
                '\uA782': 'R',
                '\u24C8': 'S',
                '\uFF33': 'S',
                '\u1E9E': 'S',
                '\u015A': 'S',
                '\u1E64': 'S',
                '\u015C': 'S',
                '\u1E60': 'S',
                '\u0160': 'S',
                '\u1E66': 'S',
                '\u1E62': 'S',
                '\u1E68': 'S',
                '\u0218': 'S',
                '\u015E': 'S',
                '\u2C7E': 'S',
                '\uA7A8': 'S',
                '\uA784': 'S',
                '\u24C9': 'T',
                '\uFF34': 'T',
                '\u1E6A': 'T',
                '\u0164': 'T',
                '\u1E6C': 'T',
                '\u021A': 'T',
                '\u0162': 'T',
                '\u1E70': 'T',
                '\u1E6E': 'T',
                '\u0166': 'T',
                '\u01AC': 'T',
                '\u01AE': 'T',
                '\u023E': 'T',
                '\uA786': 'T',
                '\uA728': 'TZ',
                '\u24CA': 'U',
                '\uFF35': 'U',
                '\u00D9': 'U',
                '\u00DA': 'U',
                '\u00DB': 'U',
                '\u0168': 'U',
                '\u1E78': 'U',
                '\u016A': 'U',
                '\u1E7A': 'U',
                '\u016C': 'U',
                '\u00DC': 'U',
                '\u01DB': 'U',
                '\u01D7': 'U',
                '\u01D5': 'U',
                '\u01D9': 'U',
                '\u1EE6': 'U',
                '\u016E': 'U',
                '\u0170': 'U',
                '\u01D3': 'U',
                '\u0214': 'U',
                '\u0216': 'U',
                '\u01AF': 'U',
                '\u1EEA': 'U',
                '\u1EE8': 'U',
                '\u1EEE': 'U',
                '\u1EEC': 'U',
                '\u1EF0': 'U',
                '\u1EE4': 'U',
                '\u1E72': 'U',
                '\u0172': 'U',
                '\u1E76': 'U',
                '\u1E74': 'U',
                '\u0244': 'U',
                '\u24CB': 'V',
                '\uFF36': 'V',
                '\u1E7C': 'V',
                '\u1E7E': 'V',
                '\u01B2': 'V',
                '\uA75E': 'V',
                '\u0245': 'V',
                '\uA760': 'VY',
                '\u24CC': 'W',
                '\uFF37': 'W',
                '\u1E80': 'W',
                '\u1E82': 'W',
                '\u0174': 'W',
                '\u1E86': 'W',
                '\u1E84': 'W',
                '\u1E88': 'W',
                '\u2C72': 'W',
                '\u24CD': 'X',
                '\uFF38': 'X',
                '\u1E8A': 'X',
                '\u1E8C': 'X',
                '\u24CE': 'Y',
                '\uFF39': 'Y',
                '\u1EF2': 'Y',
                '\u00DD': 'Y',
                '\u0176': 'Y',
                '\u1EF8': 'Y',
                '\u0232': 'Y',
                '\u1E8E': 'Y',
                '\u0178': 'Y',
                '\u1EF6': 'Y',
                '\u1EF4': 'Y',
                '\u01B3': 'Y',
                '\u024E': 'Y',
                '\u1EFE': 'Y',
                '\u24CF': 'Z',
                '\uFF3A': 'Z',
                '\u0179': 'Z',
                '\u1E90': 'Z',
                '\u017B': 'Z',
                '\u017D': 'Z',
                '\u1E92': 'Z',
                '\u1E94': 'Z',
                '\u01B5': 'Z',
                '\u0224': 'Z',
                '\u2C7F': 'Z',
                '\u2C6B': 'Z',
                '\uA762': 'Z',
                '\u24D0': 'a',
                '\uFF41': 'a',
                '\u1E9A': 'a',
                '\u00E0': 'a',
                '\u00E1': 'a',
                '\u00E2': 'a',
                '\u1EA7': 'a',
                '\u1EA5': 'a',
                '\u1EAB': 'a',
                '\u1EA9': 'a',
                '\u00E3': 'a',
                '\u0101': 'a',
                '\u0103': 'a',
                '\u1EB1': 'a',
                '\u1EAF': 'a',
                '\u1EB5': 'a',
                '\u1EB3': 'a',
                '\u0227': 'a',
                '\u01E1': 'a',
                '\u00E4': 'a',
                '\u01DF': 'a',
                '\u1EA3': 'a',
                '\u00E5': 'a',
                '\u01FB': 'a',
                '\u01CE': 'a',
                '\u0201': 'a',
                '\u0203': 'a',
                '\u1EA1': 'a',
                '\u1EAD': 'a',
                '\u1EB7': 'a',
                '\u1E01': 'a',
                '\u0105': 'a',
                '\u2C65': 'a',
                '\u0250': 'a',
                '\uA733': 'aa',
                '\u00E6': 'ae',
                '\u01FD': 'ae',
                '\u01E3': 'ae',
                '\uA735': 'ao',
                '\uA737': 'au',
                '\uA739': 'av',
                '\uA73B': 'av',
                '\uA73D': 'ay',
                '\u24D1': 'b',
                '\uFF42': 'b',
                '\u1E03': 'b',
                '\u1E05': 'b',
                '\u1E07': 'b',
                '\u0180': 'b',
                '\u0183': 'b',
                '\u0253': 'b',
                '\u24D2': 'c',
                '\uFF43': 'c',
                '\u0107': 'c',
                '\u0109': 'c',
                '\u010B': 'c',
                '\u010D': 'c',
                '\u00E7': 'c',
                '\u1E09': 'c',
                '\u0188': 'c',
                '\u023C': 'c',
                '\uA73F': 'c',
                '\u2184': 'c',
                '\u24D3': 'd',
                '\uFF44': 'd',
                '\u1E0B': 'd',
                '\u010F': 'd',
                '\u1E0D': 'd',
                '\u1E11': 'd',
                '\u1E13': 'd',
                '\u1E0F': 'd',
                '\u0111': 'd',
                '\u018C': 'd',
                '\u0256': 'd',
                '\u0257': 'd',
                '\uA77A': 'd',
                '\u01F3': 'dz',
                '\u01C6': 'dz',
                '\u24D4': 'e',
                '\uFF45': 'e',
                '\u00E8': 'e',
                '\u00E9': 'e',
                '\u00EA': 'e',
                '\u1EC1': 'e',
                '\u1EBF': 'e',
                '\u1EC5': 'e',
                '\u1EC3': 'e',
                '\u1EBD': 'e',
                '\u0113': 'e',
                '\u1E15': 'e',
                '\u1E17': 'e',
                '\u0115': 'e',
                '\u0117': 'e',
                '\u00EB': 'e',
                '\u1EBB': 'e',
                '\u011B': 'e',
                '\u0205': 'e',
                '\u0207': 'e',
                '\u1EB9': 'e',
                '\u1EC7': 'e',
                '\u0229': 'e',
                '\u1E1D': 'e',
                '\u0119': 'e',
                '\u1E19': 'e',
                '\u1E1B': 'e',
                '\u0247': 'e',
                '\u025B': 'e',
                '\u01DD': 'e',
                '\u24D5': 'f',
                '\uFF46': 'f',
                '\u1E1F': 'f',
                '\u0192': 'f',
                '\uA77C': 'f',
                '\u24D6': 'g',
                '\uFF47': 'g',
                '\u01F5': 'g',
                '\u011D': 'g',
                '\u1E21': 'g',
                '\u011F': 'g',
                '\u0121': 'g',
                '\u01E7': 'g',
                '\u0123': 'g',
                '\u01E5': 'g',
                '\u0260': 'g',
                '\uA7A1': 'g',
                '\u1D79': 'g',
                '\uA77F': 'g',
                '\u24D7': 'h',
                '\uFF48': 'h',
                '\u0125': 'h',
                '\u1E23': 'h',
                '\u1E27': 'h',
                '\u021F': 'h',
                '\u1E25': 'h',
                '\u1E29': 'h',
                '\u1E2B': 'h',
                '\u1E96': 'h',
                '\u0127': 'h',
                '\u2C68': 'h',
                '\u2C76': 'h',
                '\u0265': 'h',
                '\u0195': 'hv',
                '\u24D8': 'i',
                '\uFF49': 'i',
                '\u00EC': 'i',
                '\u00ED': 'i',
                '\u00EE': 'i',
                '\u0129': 'i',
                '\u012B': 'i',
                '\u012D': 'i',
                '\u00EF': 'i',
                '\u1E2F': 'i',
                '\u1EC9': 'i',
                '\u01D0': 'i',
                '\u0209': 'i',
                '\u020B': 'i',
                '\u1ECB': 'i',
                '\u012F': 'i',
                '\u1E2D': 'i',
                '\u0268': 'i',
                '\u0131': 'i',
                '\u24D9': 'j',
                '\uFF4A': 'j',
                '\u0135': 'j',
                '\u01F0': 'j',
                '\u0249': 'j',
                '\u24DA': 'k',
                '\uFF4B': 'k',
                '\u1E31': 'k',
                '\u01E9': 'k',
                '\u1E33': 'k',
                '\u0137': 'k',
                '\u1E35': 'k',
                '\u0199': 'k',
                '\u2C6A': 'k',
                '\uA741': 'k',
                '\uA743': 'k',
                '\uA745': 'k',
                '\uA7A3': 'k',
                '\u24DB': 'l',
                '\uFF4C': 'l',
                '\u0140': 'l',
                '\u013A': 'l',
                '\u013E': 'l',
                '\u1E37': 'l',
                '\u1E39': 'l',
                '\u013C': 'l',
                '\u1E3D': 'l',
                '\u1E3B': 'l',
                '\u017F': 'l',
                '\u0142': 'l',
                '\u019A': 'l',
                '\u026B': 'l',
                '\u2C61': 'l',
                '\uA749': 'l',
                '\uA781': 'l',
                '\uA747': 'l',
                '\u01C9': 'lj',
                '\u24DC': 'm',
                '\uFF4D': 'm',
                '\u1E3F': 'm',
                '\u1E41': 'm',
                '\u1E43': 'm',
                '\u0271': 'm',
                '\u026F': 'm',
                '\u24DD': 'n',
                '\uFF4E': 'n',
                '\u01F9': 'n',
                '\u0144': 'n',
                '\u00F1': 'n',
                '\u1E45': 'n',
                '\u0148': 'n',
                '\u1E47': 'n',
                '\u0146': 'n',
                '\u1E4B': 'n',
                '\u1E49': 'n',
                '\u019E': 'n',
                '\u0272': 'n',
                '\u0149': 'n',
                '\uA791': 'n',
                '\uA7A5': 'n',
                '\u01CC': 'nj',
                '\u24DE': 'o',
                '\uFF4F': 'o',
                '\u00F2': 'o',
                '\u00F3': 'o',
                '\u00F4': 'o',
                '\u1ED3': 'o',
                '\u1ED1': 'o',
                '\u1ED7': 'o',
                '\u1ED5': 'o',
                '\u00F5': 'o',
                '\u1E4D': 'o',
                '\u022D': 'o',
                '\u1E4F': 'o',
                '\u014D': 'o',
                '\u1E51': 'o',
                '\u1E53': 'o',
                '\u014F': 'o',
                '\u022F': 'o',
                '\u0231': 'o',
                '\u00F6': 'o',
                '\u022B': 'o',
                '\u1ECF': 'o',
                '\u0151': 'o',
                '\u01D2': 'o',
                '\u020D': 'o',
                '\u020F': 'o',
                '\u01A1': 'o',
                '\u1EDD': 'o',
                '\u1EDB': 'o',
                '\u1EE1': 'o',
                '\u1EDF': 'o',
                '\u1EE3': 'o',
                '\u1ECD': 'o',
                '\u1ED9': 'o',
                '\u01EB': 'o',
                '\u01ED': 'o',
                '\u00F8': 'o',
                '\u01FF': 'o',
                '\u0254': 'o',
                '\uA74B': 'o',
                '\uA74D': 'o',
                '\u0275': 'o',
                '\u01A3': 'oi',
                '\u0223': 'ou',
                '\uA74F': 'oo',
                '\u24DF': 'p',
                '\uFF50': 'p',
                '\u1E55': 'p',
                '\u1E57': 'p',
                '\u01A5': 'p',
                '\u1D7D': 'p',
                '\uA751': 'p',
                '\uA753': 'p',
                '\uA755': 'p',
                '\u24E0': 'q',
                '\uFF51': 'q',
                '\u024B': 'q',
                '\uA757': 'q',
                '\uA759': 'q',
                '\u24E1': 'r',
                '\uFF52': 'r',
                '\u0155': 'r',
                '\u1E59': 'r',
                '\u0159': 'r',
                '\u0211': 'r',
                '\u0213': 'r',
                '\u1E5B': 'r',
                '\u1E5D': 'r',
                '\u0157': 'r',
                '\u1E5F': 'r',
                '\u024D': 'r',
                '\u027D': 'r',
                '\uA75B': 'r',
                '\uA7A7': 'r',
                '\uA783': 'r',
                '\u24E2': 's',
                '\uFF53': 's',
                '\u00DF': 's',
                '\u015B': 's',
                '\u1E65': 's',
                '\u015D': 's',
                '\u1E61': 's',
                '\u0161': 's',
                '\u1E67': 's',
                '\u1E63': 's',
                '\u1E69': 's',
                '\u0219': 's',
                '\u015F': 's',
                '\u023F': 's',
                '\uA7A9': 's',
                '\uA785': 's',
                '\u1E9B': 's',
                '\u24E3': 't',
                '\uFF54': 't',
                '\u1E6B': 't',
                '\u1E97': 't',
                '\u0165': 't',
                '\u1E6D': 't',
                '\u021B': 't',
                '\u0163': 't',
                '\u1E71': 't',
                '\u1E6F': 't',
                '\u0167': 't',
                '\u01AD': 't',
                '\u0288': 't',
                '\u2C66': 't',
                '\uA787': 't',
                '\uA729': 'tz',
                '\u24E4': 'u',
                '\uFF55': 'u',
                '\u00F9': 'u',
                '\u00FA': 'u',
                '\u00FB': 'u',
                '\u0169': 'u',
                '\u1E79': 'u',
                '\u016B': 'u',
                '\u1E7B': 'u',
                '\u016D': 'u',
                '\u00FC': 'u',
                '\u01DC': 'u',
                '\u01D8': 'u',
                '\u01D6': 'u',
                '\u01DA': 'u',
                '\u1EE7': 'u',
                '\u016F': 'u',
                '\u0171': 'u',
                '\u01D4': 'u',
                '\u0215': 'u',
                '\u0217': 'u',
                '\u01B0': 'u',
                '\u1EEB': 'u',
                '\u1EE9': 'u',
                '\u1EEF': 'u',
                '\u1EED': 'u',
                '\u1EF1': 'u',
                '\u1EE5': 'u',
                '\u1E73': 'u',
                '\u0173': 'u',
                '\u1E77': 'u',
                '\u1E75': 'u',
                '\u0289': 'u',
                '\u24E5': 'v',
                '\uFF56': 'v',
                '\u1E7D': 'v',
                '\u1E7F': 'v',
                '\u028B': 'v',
                '\uA75F': 'v',
                '\u028C': 'v',
                '\uA761': 'vy',
                '\u24E6': 'w',
                '\uFF57': 'w',
                '\u1E81': 'w',
                '\u1E83': 'w',
                '\u0175': 'w',
                '\u1E87': 'w',
                '\u1E85': 'w',
                '\u1E98': 'w',
                '\u1E89': 'w',
                '\u2C73': 'w',
                '\u24E7': 'x',
                '\uFF58': 'x',
                '\u1E8B': 'x',
                '\u1E8D': 'x',
                '\u24E8': 'y',
                '\uFF59': 'y',
                '\u1EF3': 'y',
                '\u00FD': 'y',
                '\u0177': 'y',
                '\u1EF9': 'y',
                '\u0233': 'y',
                '\u1E8F': 'y',
                '\u00FF': 'y',
                '\u1EF7': 'y',
                '\u1E99': 'y',
                '\u1EF5': 'y',
                '\u01B4': 'y',
                '\u024F': 'y',
                '\u1EFF': 'y',
                '\u24E9': 'z',
                '\uFF5A': 'z',
                '\u017A': 'z',
                '\u1E91': 'z',
                '\u017C': 'z',
                '\u017E': 'z',
                '\u1E93': 'z',
                '\u1E95': 'z',
                '\u01B6': 'z',
                '\u0225': 'z',
                '\u0240': 'z',
                '\u2C6C': 'z',
                '\uA763': 'z',
                '\u0386': '\u0391',
                '\u0388': '\u0395',
                '\u0389': '\u0397',
                '\u038A': '\u0399',
                '\u03AA': '\u0399',
                '\u038C': '\u039F',
                '\u038E': '\u03A5',
                '\u03AB': '\u03A5',
                '\u038F': '\u03A9',
                '\u03AC': '\u03B1',
                '\u03AD': '\u03B5',
                '\u03AE': '\u03B7',
                '\u03AF': '\u03B9',
                '\u03CA': '\u03B9',
                '\u0390': '\u03B9',
                '\u03CC': '\u03BF',
                '\u03CD': '\u03C5',
                '\u03CB': '\u03C5',
                '\u03B0': '\u03C5',
                '\u03C9': '\u03C9',
                '\u03C2': '\u03C3'
            };
            return diacritics;
        });
        S2.define('select2/data/base', ['../utils'], function(Utils) {
            function BaseAdapter($element, options) {
                BaseAdapter.__super__.constructor.call(this);
            }
            Utils.Extend(BaseAdapter, Utils.Observable);
            BaseAdapter.prototype.current = function(callback) {
                throw new Error('The `current` method must be defined in child classes.');
            };
            BaseAdapter.prototype.query = function(params, callback) {
                throw new Error('The `query` method must be defined in child classes.');
            };
            BaseAdapter.prototype.bind = function(container, $container) {};
            BaseAdapter.prototype.destroy = function() {};
            BaseAdapter.prototype.generateResultId = function(container, data) {
                var id = container.id + '-result-';
                id += Utils.generateChars(4);
                if (data.id != null) {
                    id += '-' + data.id.toString();
                } else {
                    id += '-' + Utils.generateChars(4);
                }
                return id;
            };
            return BaseAdapter;
        });
        S2.define('select2/data/select', ['./base', '../utils', 'jquery'], function(BaseAdapter, Utils, $) {
            function SelectAdapter($element, options) {
                this.$element = $element;
                this.options = options;
                SelectAdapter.__super__.constructor.call(this);
            }
            Utils.Extend(SelectAdapter, BaseAdapter);
            SelectAdapter.prototype.current = function(callback) {
                var data = [];
                var self = this;
                this.$element.find(':selected').each(function() {
                    var $option = $(this);
                    var option = self.item($option);
                    data.push(option);
                });
                callback(data);
            };
            SelectAdapter.prototype.select = function(data) {
                var self = this;
                data.selected = true;
                if ($(data.element).is('option')) {
                    data.element.selected = true;
                    this.$element.trigger('change');
                    return;
                }
                if (this.$element.prop('multiple')) {
                    this.current(function(currentData) {
                        var val = [];
                        data = [data];
                        data.push.apply(data, currentData);
                        for (var d = 0; d < data.length; d++) {
                            var id = data[d].id;
                            if ($.inArray(id, val) === -1) {
                                val.push(id);
                            }
                        }
                        self.$element.val(val);
                        self.$element.trigger('change');
                    });
                } else {
                    var val = data.id;
                    this.$element.val(val);
                    this.$element.trigger('change');
                }
            };
            SelectAdapter.prototype.unselect = function(data) {
                var self = this;
                if (!this.$element.prop('multiple')) {
                    return;
                }
                data.selected = false;
                if ($(data.element).is('option')) {
                    data.element.selected = false;
                    this.$element.trigger('change');
                    return;
                }
                this.current(function(currentData) {
                    var val = [];
                    for (var d = 0; d < currentData.length; d++) {
                        var id = currentData[d].id;
                        if (id !== data.id && $.inArray(id, val) === -1) {
                            val.push(id);
                        }
                    }
                    self.$element.val(val);
                    self.$element.trigger('change');
                });
            };
            SelectAdapter.prototype.bind = function(container, $container) {
                var self = this;
                this.container = container;
                container.on('select', function(params) {
                    self.select(params.data);
                });
                container.on('unselect', function(params) {
                    self.unselect(params.data);
                });
            };
            SelectAdapter.prototype.destroy = function() {
                this.$element.find('*').each(function() {
                    $.removeData(this, 'data');
                });
            };
            SelectAdapter.prototype.query = function(params, callback) {
                var data = [];
                var self = this;
                var $options = this.$element.children();
                $options.each(function() {
                    var $option = $(this);
                    if (!$option.is('option') && !$option.is('optgroup')) {
                        return;
                    }
                    var option = self.item($option);
                    var matches = self.matches(params, option);
                    if (matches !== null) {
                        data.push(matches);
                    }
                });
                callback({
                    results: data
                });
            };
            SelectAdapter.prototype.addOptions = function($options) {
                Utils.appendMany(this.$element, $options);
            };
            SelectAdapter.prototype.option = function(data) {
                var option;
                if (data.children) {
                    option = document.createElement('optgroup');
                    option.label = data.text;
                } else {
                    option = document.createElement('option');
                    if (option.textContent !== undefined) {
                        option.textContent = data.text;
                    } else {
                        option.innerText = data.text;
                    }
                }
                if (data.id !== undefined) {
                    option.value = data.id;
                }
                if (data.disabled) {
                    option.disabled = true;
                }
                if (data.selected) {
                    option.selected = true;
                }
                if (data.title) {
                    option.title = data.title;
                }
                var $option = $(option);
                var normalizedData = this._normalizeItem(data);
                normalizedData.element = option;
                $.data(option, 'data', normalizedData);
                return $option;
            };
            SelectAdapter.prototype.item = function($option) {
                var data = {};
                data = $.data($option[0], 'data');
                if (data != null) {
                    return data;
                }
                if ($option.is('option')) {
                    data = {
                        id: $option.val(),
                        text: $option.text(),
                        disabled: $option.prop('disabled'),
                        selected: $option.prop('selected'),
                        title: $option.prop('title')
                    };
                } else if ($option.is('optgroup')) {
                    data = {
                        text: $option.prop('label'),
                        children: [],
                        title: $option.prop('title')
                    };
                    var $children = $option.children('option');
                    var children = [];
                    for (var c = 0; c < $children.length; c++) {
                        var $child = $($children[c]);
                        var child = this.item($child);
                        children.push(child);
                    }
                    data.children = children;
                }
                data = this._normalizeItem(data);
                data.element = $option[0];
                $.data($option[0], 'data', data);
                return data;
            };
            SelectAdapter.prototype._normalizeItem = function(item) {
                if (!$.isPlainObject(item)) {
                    item = {
                        id: item,
                        text: item
                    };
                }
                item = $.extend({}, {
                    text: ''
                }, item);
                var defaults = {
                    selected: false,
                    disabled: false
                };
                if (item.id != null) {
                    item.id = item.id.toString();
                }
                if (item.text != null) {
                    item.text = item.text.toString();
                }
                if (item._resultId == null && item.id && this.container != null) {
                    item._resultId = this.generateResultId(this.container, item);
                }
                return $.extend({}, defaults, item);
            };
            SelectAdapter.prototype.matches = function(params, data) {
                var matcher = this.options.get('matcher');
                return matcher(params, data);
            };
            return SelectAdapter;
        });
        S2.define('select2/data/array', ['./select', '../utils', 'jquery'], function(SelectAdapter, Utils, $) {
            function ArrayAdapter($element, options) {
                var data = options.get('data') || [];
                ArrayAdapter.__super__.constructor.call(this, $element, options);
                this.addOptions(this.convertToOptions(data));
            }
            Utils.Extend(ArrayAdapter, SelectAdapter);
            ArrayAdapter.prototype.select = function(data) {
                var $option = this.$element.find('option').filter(function(i, elm) {
                    return elm.value == data.id.toString();
                });
                if ($option.length === 0) {
                    $option = this.option(data);
                    this.addOptions($option);
                }
                ArrayAdapter.__super__.select.call(this, data);
            };
            ArrayAdapter.prototype.convertToOptions = function(data) {
                var self = this;
                var $existing = this.$element.find('option');
                var existingIds = $existing.map(function() {
                    return self.item($(this)).id;
                }).get();
                var $options = [];

                function onlyItem(item) {
                    return function() {
                        return $(this).val() == item.id;
                    };
                }
                for (var d = 0; d < data.length; d++) {
                    var item = this._normalizeItem(data[d]);
                    if ($.inArray(item.id, existingIds) >= 0) {
                        var $existingOption = $existing.filter(onlyItem(item));
                        var existingData = this.item($existingOption);
                        var newData = $.extend(true, {}, item, existingData);
                        var $newOption = this.option(newData);
                        $existingOption.replaceWith($newOption);
                        continue;
                    }
                    var $option = this.option(item);
                    if (item.children) {
                        var $children = this.convertToOptions(item.children);
                        Utils.appendMany($option, $children);
                    }
                    $options.push($option);
                }
                return $options;
            };
            return ArrayAdapter;
        });
        S2.define('select2/data/ajax', ['./array', '../utils', 'jquery'], function(ArrayAdapter, Utils, $) {
            function AjaxAdapter($element, options) {
                this.ajaxOptions = this._applyDefaults(options.get('ajax'));
                if (this.ajaxOptions.processResults != null) {
                    this.processResults = this.ajaxOptions.processResults;
                }
                AjaxAdapter.__super__.constructor.call(this, $element, options);
            }
            Utils.Extend(AjaxAdapter, ArrayAdapter);
            AjaxAdapter.prototype._applyDefaults = function(options) {
                var defaults = {
                    data: function(params) {
                        return $.extend({}, params, {
                            q: params.term
                        });
                    },
                    transport: function(params, success, failure) {
                        var $request = $.ajax(params);
                        $request.then(success);
                        $request.fail(failure);
                        return $request;
                    }
                };
                return $.extend({}, defaults, options, true);
            };
            AjaxAdapter.prototype.processResults = function(results) {
                return results;
            };
            AjaxAdapter.prototype.query = function(params, callback) {
                var matches = [];
                var self = this;
                if (this._request != null) {
                    if ($.isFunction(this._request.abort)) {
                        this._request.abort();
                    }
                    this._request = null;
                }
                var options = $.extend({
                    type: 'GET'
                }, this.ajaxOptions);
                if (typeof options.url === 'function') {
                    options.url = options.url.call(this.$element, params);
                }
                if (typeof options.data === 'function') {
                    options.data = options.data.call(this.$element, params);
                }

                function request() {
                    var $request = options.transport(options, function(data) {
                        var results = self.processResults(data, params);
                        if (self.options.get('debug') && window.console && console.error) {
                            if (!results || !results.results || !$.isArray(results.results)) {
                                console.error('Select2: The AJAX results did not return an array in the ' + '`results` key of the response.');
                            }
                        }
                        callback(results);
                    }, function() {
                        if ($request.status && $request.status === '0') {
                            return;
                        }
                        self.trigger('results:message', {
                            message: 'errorLoading'
                        });
                    });
                    self._request = $request;
                }
                if (this.ajaxOptions.delay && params.term != null) {
                    if (this._queryTimeout) {
                        window.clearTimeout(this._queryTimeout);
                    }
                    this._queryTimeout = window.setTimeout(request, this.ajaxOptions.delay);
                } else {
                    request();
                }
            };
            return AjaxAdapter;
        });
        S2.define('select2/data/tags', ['jquery'], function($) {
            function Tags(decorated, $element, options) {
                var tags = options.get('tags');
                var createTag = options.get('createTag');
                if (createTag !== undefined) {
                    this.createTag = createTag;
                }
                var insertTag = options.get('insertTag');
                if (insertTag !== undefined) {
                    this.insertTag = insertTag;
                }
                decorated.call(this, $element, options);
                if ($.isArray(tags)) {
                    for (var t = 0; t < tags.length; t++) {
                        var tag = tags[t];
                        var item = this._normalizeItem(tag);
                        var $option = this.option(item);
                        this.$element.append($option);
                    }
                }
            }
            Tags.prototype.query = function(decorated, params, callback) {
                var self = this;
                this._removeOldTags();
                if (params.term == null || params.page != null) {
                    decorated.call(this, params, callback);
                    return;
                }

                function wrapper(obj, child) {
                    var data = obj.results;
                    for (var i = 0; i < data.length; i++) {
                        var option = data[i];
                        var checkChildren = (option.children != null && !wrapper({
                            results: option.children
                        }, true));
                        var optionText = (option.text || '').toUpperCase();
                        var paramsTerm = (params.term || '').toUpperCase();
                        var checkText = optionText === paramsTerm;
                        if (checkText || checkChildren) {
                            if (child) {
                                return false;
                            }
                            obj.data = data;
                            callback(obj);
                            return;
                        }
                    }
                    if (child) {
                        return true;
                    }
                    var tag = self.createTag(params);
                    if (tag != null) {
                        var $option = self.option(tag);
                        $option.attr('data-select2-tag', true);
                        self.addOptions([$option]);
                        self.insertTag(data, tag);
                    }
                    obj.results = data;
                    callback(obj);
                }
                decorated.call(this, params, wrapper);
            };
            Tags.prototype.createTag = function(decorated, params) {
                var term = $.trim(params.term);
                if (term === '') {
                    return null;
                }
                return {
                    id: term,
                    text: term
                };
            };
            Tags.prototype.insertTag = function(_, data, tag) {
                data.unshift(tag);
            };
            Tags.prototype._removeOldTags = function(_) {
                var tag = this._lastTag;
                var $options = this.$element.find('option[data-select2-tag]');
                $options.each(function() {
                    if (this.selected) {
                        return;
                    }
                    $(this).remove();
                });
            };
            return Tags;
        });
        S2.define('select2/data/tokenizer', ['jquery'], function($) {
            function Tokenizer(decorated, $element, options) {
                var tokenizer = options.get('tokenizer');
                if (tokenizer !== undefined) {
                    this.tokenizer = tokenizer;
                }
                decorated.call(this, $element, options);
            }
            Tokenizer.prototype.bind = function(decorated, container, $container) {
                decorated.call(this, container, $container);
                this.$search = container.dropdown.$search || container.selection.$search || $container.find('.select2-search__field');
            };
            Tokenizer.prototype.query = function(decorated, params, callback) {
                var self = this;

                function createAndSelect(data) {
                    var item = self._normalizeItem(data);
                    var $existingOptions = self.$element.find('option').filter(function() {
                        return $(this).val() === item.id;
                    });
                    if (!$existingOptions.length) {
                        var $option = self.option(item);
                        $option.attr('data-select2-tag', true);
                        self._removeOldTags();
                        self.addOptions([$option]);
                    }
                    select(item);
                }

                function select(data) {
                    self.trigger('select', {
                        data: data
                    });
                }
                params.term = params.term || '';
                var tokenData = this.tokenizer(params, this.options, createAndSelect);
                if (tokenData.term !== params.term) {
                    if (this.$search.length) {
                        this.$search.val(tokenData.term);
                        this.$search.focus();
                    }
                    params.term = tokenData.term;
                }
                decorated.call(this, params, callback);
            };
            Tokenizer.prototype.tokenizer = function(_, params, options, callback) {
                var separators = options.get('tokenSeparators') || [];
                var term = params.term;
                var i = 0;
                var createTag = this.createTag || function(params) {
                    return {
                        id: params.term,
                        text: params.term
                    };
                };
                while (i < term.length) {
                    var termChar = term[i];
                    if ($.inArray(termChar, separators) === -1) {
                        i++;
                        continue;
                    }
                    var part = term.substr(0, i);
                    var partParams = $.extend({}, params, {
                        term: part
                    });
                    var data = createTag(partParams);
                    if (data == null) {
                        i++;
                        continue;
                    }
                    callback(data);
                    term = term.substr(i + 1) || '';
                    i = 0;
                }
                return {
                    term: term
                };
            };
            return Tokenizer;
        });
        S2.define('select2/data/minimumInputLength', [], function() {
            function MinimumInputLength(decorated, $e, options) {
                this.minimumInputLength = options.get('minimumInputLength');
                decorated.call(this, $e, options);
            }
            MinimumInputLength.prototype.query = function(decorated, params, callback) {
                params.term = params.term || '';
                if (params.term.length < this.minimumInputLength) {
                    this.trigger('results:message', {
                        message: 'inputTooShort',
                        args: {
                            minimum: this.minimumInputLength,
                            input: params.term,
                            params: params
                        }
                    });
                    return;
                }
                decorated.call(this, params, callback);
            };
            return MinimumInputLength;
        });
        S2.define('select2/data/maximumInputLength', [], function() {
            function MaximumInputLength(decorated, $e, options) {
                this.maximumInputLength = options.get('maximumInputLength');
                decorated.call(this, $e, options);
            }
            MaximumInputLength.prototype.query = function(decorated, params, callback) {
                params.term = params.term || '';
                if (this.maximumInputLength > 0 && params.term.length > this.maximumInputLength) {
                    this.trigger('results:message', {
                        message: 'inputTooLong',
                        args: {
                            maximum: this.maximumInputLength,
                            input: params.term,
                            params: params
                        }
                    });
                    return;
                }
                decorated.call(this, params, callback);
            };
            return MaximumInputLength;
        });
        S2.define('select2/data/maximumSelectionLength', [], function() {
            function MaximumSelectionLength(decorated, $e, options) {
                this.maximumSelectionLength = options.get('maximumSelectionLength');
                decorated.call(this, $e, options);
            }
            MaximumSelectionLength.prototype.query = function(decorated, params, callback) {
                var self = this;
                this.current(function(currentData) {
                    var count = currentData != null ? currentData.length : 0;
                    if (self.maximumSelectionLength > 0 && count >= self.maximumSelectionLength) {
                        self.trigger('results:message', {
                            message: 'maximumSelected',
                            args: {
                                maximum: self.maximumSelectionLength
                            }
                        });
                        return;
                    }
                    decorated.call(self, params, callback);
                });
            };
            return MaximumSelectionLength;
        });
        S2.define('select2/dropdown', ['jquery', './utils'], function($, Utils) {
            function Dropdown($element, options) {
                this.$element = $element;
                this.options = options;
                Dropdown.__super__.constructor.call(this);
            }
            Utils.Extend(Dropdown, Utils.Observable);
            Dropdown.prototype.render = function() {
                var $dropdown = $('<span class="select2-dropdown">' + '<span class="select2-results"></span>' + '</span>');
                $dropdown.attr('dir', this.options.get('dir'));
                this.$dropdown = $dropdown;
                return $dropdown;
            };
            Dropdown.prototype.bind = function() {};
            Dropdown.prototype.position = function($dropdown, $container) {};
            Dropdown.prototype.destroy = function() {
                this.$dropdown.remove();
            };
            return Dropdown;
        });
        S2.define('select2/dropdown/search', ['jquery', '../utils'], function($, Utils) {
            function Search() {}
            Search.prototype.render = function(decorated) {
                var $rendered = decorated.call(this);
                var $search = $('<span class="select2-search select2-search--dropdown">' + '<input class="select2-search__field" type="search" tabindex="-1"' + ' autocomplete="off" autocorrect="off" autocapitalize="off"' + ' spellcheck="false" role="textbox" />' + '</span>');
                this.$searchContainer = $search;
                this.$search = $search.find('input');
                $rendered.prepend($search);
                return $rendered;
            };
            Search.prototype.bind = function(decorated, container, $container) {
                var self = this;
                decorated.call(this, container, $container);
                this.$search.on('keydown', function(evt) {
                    self.trigger('keypress', evt);
                    self._keyUpPrevented = evt.isDefaultPrevented();
                });
                this.$search.on('input', function(evt) {
                    $(this).off('keyup');
                });
                this.$search.on('keyup input', function(evt) {
                    self.handleSearch(evt);
                });
                container.on('open', function() {
                    self.$search.attr('tabindex', 0);
                    self.$search.focus();
                    window.setTimeout(function() {
                        self.$search.focus();
                    }, 0);
                });
                container.on('close', function() {
                    self.$search.attr('tabindex', -1);
                    self.$search.val('');
                });
                container.on('focus', function() {
                    if (container.isOpen()) {
                        self.$search.focus();
                    }
                });
                container.on('results:all', function(params) {
                    if (params.query.term == null || params.query.term === '') {
                        var showSearch = self.showSearch(params);
                        if (showSearch) {
                            self.$searchContainer.removeClass('select2-search--hide');
                        } else {
                            self.$searchContainer.addClass('select2-search--hide');
                        }
                    }
                });
            };
            Search.prototype.handleSearch = function(evt) {
                if (!this._keyUpPrevented) {
                    var input = this.$search.val();
                    this.trigger('query', {
                        term: input
                    });
                }
                this._keyUpPrevented = false;
            };
            Search.prototype.showSearch = function(_, params) {
                return true;
            };
            return Search;
        });
        S2.define('select2/dropdown/hidePlaceholder', [], function() {
            function HidePlaceholder(decorated, $element, options, dataAdapter) {
                this.placeholder = this.normalizePlaceholder(options.get('placeholder'));
                decorated.call(this, $element, options, dataAdapter);
            }
            HidePlaceholder.prototype.append = function(decorated, data) {
                data.results = this.removePlaceholder(data.results);
                decorated.call(this, data);
            };
            HidePlaceholder.prototype.normalizePlaceholder = function(_, placeholder) {
                if (typeof placeholder === 'string') {
                    placeholder = {
                        id: '',
                        text: placeholder
                    };
                }
                return placeholder;
            };
            HidePlaceholder.prototype.removePlaceholder = function(_, data) {
                var modifiedData = data.slice(0);
                for (var d = data.length - 1; d >= 0; d--) {
                    var item = data[d];
                    if (this.placeholder.id === item.id) {
                        modifiedData.splice(d, 1);
                    }
                }
                return modifiedData;
            };
            return HidePlaceholder;
        });
        S2.define('select2/dropdown/infiniteScroll', ['jquery'], function($) {
            function InfiniteScroll(decorated, $element, options, dataAdapter) {
                this.lastParams = {};
                decorated.call(this, $element, options, dataAdapter);
                this.$loadingMore = this.createLoadingMore();
                this.loading = false;
            }
            InfiniteScroll.prototype.append = function(decorated, data) {
                this.$loadingMore.remove();
                this.loading = false;
                decorated.call(this, data);
                if (this.showLoadingMore(data)) {
                    this.$results.append(this.$loadingMore);
                }
            };
            InfiniteScroll.prototype.bind = function(decorated, container, $container) {
                var self = this;
                decorated.call(this, container, $container);
                container.on('query', function(params) {
                    self.lastParams = params;
                    self.loading = true;
                });
                container.on('query:append', function(params) {
                    self.lastParams = params;
                    self.loading = true;
                });
                this.$results.on('scroll', function() {
                    var isLoadMoreVisible = $.contains(document.documentElement, self.$loadingMore[0]);
                    if (self.loading || !isLoadMoreVisible) {
                        return;
                    }
                    var currentOffset = self.$results.offset().top + self.$results.outerHeight(false);
                    var loadingMoreOffset = self.$loadingMore.offset().top + self.$loadingMore.outerHeight(false);
                    if (currentOffset + 50 >= loadingMoreOffset) {
                        self.loadMore();
                    }
                });
            };
            InfiniteScroll.prototype.loadMore = function() {
                this.loading = true;
                var params = $.extend({}, {
                    page: 1
                }, this.lastParams);
                params.page++;
                this.trigger('query:append', params);
            };
            InfiniteScroll.prototype.showLoadingMore = function(_, data) {
                return data.pagination && data.pagination.more;
            };
            InfiniteScroll.prototype.createLoadingMore = function() {
                var $option = $('<li ' + 'class="select2-results__option select2-results__option--load-more"' + 'role="treeitem" aria-disabled="true"></li>');
                var message = this.options.get('translations').get('loadingMore');
                $option.html(message(this.lastParams));
                return $option;
            };
            return InfiniteScroll;
        });
        S2.define('select2/dropdown/attachBody', ['jquery', '../utils'], function($, Utils) {
            function AttachBody(decorated, $element, options) {
                this.$dropdownParent = options.get('dropdownParent') || $(document.body);
                decorated.call(this, $element, options);
            }
            AttachBody.prototype.bind = function(decorated, container, $container) {
                var self = this;
                var setupResultsEvents = false;
                decorated.call(this, container, $container);
                container.on('open', function() {
                    self._showDropdown();
                    self._attachPositioningHandler(container);
                    if (!setupResultsEvents) {
                        setupResultsEvents = true;
                        container.on('results:all', function() {
                            self._positionDropdown();
                            self._resizeDropdown();
                        });
                        container.on('results:append', function() {
                            self._positionDropdown();
                            self._resizeDropdown();
                        });
                    }
                });
                container.on('close', function() {
                    self._hideDropdown();
                    self._detachPositioningHandler(container);
                });
                this.$dropdownContainer.on('mousedown', function(evt) {
                    evt.stopPropagation();
                });
            };
            AttachBody.prototype.destroy = function(decorated) {
                decorated.call(this);
                this.$dropdownContainer.remove();
            };
            AttachBody.prototype.position = function(decorated, $dropdown, $container) {
                $dropdown.attr('class', $container.attr('class'));
                $dropdown.removeClass('select2');
                $dropdown.addClass('select2-container--open');
                $dropdown.css({
                    position: 'absolute',
                    top: -999999
                });
                this.$container = $container;
            };
            AttachBody.prototype.render = function(decorated) {
                var $container = $('<span></span>');
                var $dropdown = decorated.call(this);
                $container.append($dropdown);
                this.$dropdownContainer = $container;
                return $container;
            };
            AttachBody.prototype._hideDropdown = function(decorated) {
                this.$dropdownContainer.detach();
            };
            AttachBody.prototype._attachPositioningHandler = function(decorated, container) {
                var self = this;
                var scrollEvent = 'scroll.select2.' + container.id;
                var resizeEvent = 'resize.select2.' + container.id;
                var orientationEvent = 'orientationchange.select2.' + container.id;
                var $watchers = this.$container.parents().filter(Utils.hasScroll);
                $watchers.each(function() {
                    $(this).data('select2-scroll-position', {
                        x: $(this).scrollLeft(),
                        y: $(this).scrollTop()
                    });
                });
                $watchers.on(scrollEvent, function(ev) {
                    var position = $(this).data('select2-scroll-position');
                    $(this).scrollTop(position.y);
                });
                $(window).on(scrollEvent + ' ' + resizeEvent + ' ' + orientationEvent, function(e) {
                    self._positionDropdown();
                    self._resizeDropdown();
                });
            };
            AttachBody.prototype._detachPositioningHandler = function(decorated, container) {
                var scrollEvent = 'scroll.select2.' + container.id;
                var resizeEvent = 'resize.select2.' + container.id;
                var orientationEvent = 'orientationchange.select2.' + container.id;
                var $watchers = this.$container.parents().filter(Utils.hasScroll);
                $watchers.off(scrollEvent);
                $(window).off(scrollEvent + ' ' + resizeEvent + ' ' + orientationEvent);
            };
            AttachBody.prototype._positionDropdown = function() {
                var $window = $(window);
                var isCurrentlyAbove = this.$dropdown.hasClass('select2-dropdown--above');
                var isCurrentlyBelow = this.$dropdown.hasClass('select2-dropdown--below');
                var newDirection = null;
                var offset = this.$container.offset();
                offset.bottom = offset.top + this.$container.outerHeight(false);
                var container = {
                    height: this.$container.outerHeight(false)
                };
                container.top = offset.top;
                container.bottom = offset.top + container.height;
                var dropdown = {
                    height: this.$dropdown.outerHeight(false)
                };
                var viewport = {
                    top: $window.scrollTop(),
                    bottom: $window.scrollTop() + $window.height()
                };
                var enoughRoomAbove = viewport.top < (offset.top - dropdown.height);
                var enoughRoomBelow = viewport.bottom > (offset.bottom + dropdown.height);
                var css = {
                    left: offset.left,
                    top: container.bottom
                };
                var $offsetParent = this.$dropdownParent;
                if ($offsetParent.css('position') === 'static') {
                    $offsetParent = $offsetParent.offsetParent();
                }
                var parentOffset = $offsetParent.offset();
                css.top -= parentOffset.top;
                css.left -= parentOffset.left;
                if (!isCurrentlyAbove && !isCurrentlyBelow) {
                    newDirection = 'below';
                }
                if (!enoughRoomBelow && enoughRoomAbove && !isCurrentlyAbove) {
                    newDirection = 'above';
                } else if (!enoughRoomAbove && enoughRoomBelow && isCurrentlyAbove) {
                    newDirection = 'below';
                }
                if (newDirection == 'above' || (isCurrentlyAbove && newDirection !== 'below')) {
                    css.top = container.top - parentOffset.top - dropdown.height;
                }
                if (newDirection != null) {
                    this.$dropdown.removeClass('select2-dropdown--below select2-dropdown--above').addClass('select2-dropdown--' + newDirection);
                    this.$container.removeClass('select2-container--below select2-container--above').addClass('select2-container--' + newDirection);
                }
                this.$dropdownContainer.css(css);
            };
            AttachBody.prototype._resizeDropdown = function() {
                var css = {
                    width: this.$container.outerWidth(false) + 'px'
                };
                if (this.options.get('dropdownAutoWidth')) {
                    css.minWidth = css.width;
                    css.position = 'relative';
                    css.width = 'auto';
                }
                this.$dropdown.css(css);
            };
            AttachBody.prototype._showDropdown = function(decorated) {
                this.$dropdownContainer.appendTo(this.$dropdownParent);
                this._positionDropdown();
                this._resizeDropdown();
            };
            return AttachBody;
        });
        S2.define('select2/dropdown/minimumResultsForSearch', [], function() {
            function countResults(data) {
                var count = 0;
                for (var d = 0; d < data.length; d++) {
                    var item = data[d];
                    if (item.children) {
                        count += countResults(item.children);
                    } else {
                        count++;
                    }
                }
                return count;
            }

            function MinimumResultsForSearch(decorated, $element, options, dataAdapter) {
                this.minimumResultsForSearch = options.get('minimumResultsForSearch');
                if (this.minimumResultsForSearch < 0) {
                    this.minimumResultsForSearch = Infinity;
                }
                decorated.call(this, $element, options, dataAdapter);
            }
            MinimumResultsForSearch.prototype.showSearch = function(decorated, params) {
                if (countResults(params.data.results) < this.minimumResultsForSearch) {
                    return false;
                }
                return decorated.call(this, params);
            };
            return MinimumResultsForSearch;
        });
        S2.define('select2/dropdown/selectOnClose', [], function() {
            function SelectOnClose() {}
            SelectOnClose.prototype.bind = function(decorated, container, $container) {
                var self = this;
                decorated.call(this, container, $container);
                container.on('close', function(params) {
                    self._handleSelectOnClose(params);
                });
            };
            SelectOnClose.prototype._handleSelectOnClose = function(_, params) {
                if (params && params.originalSelect2Event != null) {
                    var event = params.originalSelect2Event;
                    if (event._type === 'select' || event._type === 'unselect') {
                        return;
                    }
                }
                var $highlightedResults = this.getHighlightedResults();
                if ($highlightedResults.length < 1) {
                    return;
                }
                var data = $highlightedResults.data('data');
                if ((data.element != null && data.element.selected) || (data.element == null && data.selected)) {
                    return;
                }
                this.trigger('select', {
                    data: data
                });
            };
            return SelectOnClose;
        });
        S2.define('select2/dropdown/closeOnSelect', [], function() {
            function CloseOnSelect() {}
            CloseOnSelect.prototype.bind = function(decorated, container, $container) {
                var self = this;
                decorated.call(this, container, $container);
                container.on('select', function(evt) {
                    self._selectTriggered(evt);
                });
                container.on('unselect', function(evt) {
                    self._selectTriggered(evt);
                });
            };
            CloseOnSelect.prototype._selectTriggered = function(_, evt) {
                var originalEvent = evt.originalEvent;
                if (originalEvent && originalEvent.ctrlKey) {
                    return;
                }
                this.trigger('close', {
                    originalEvent: originalEvent,
                    originalSelect2Event: evt
                });
            };
            return CloseOnSelect;
        });
        S2.define('select2/i18n/en', [], function() {
            return {
                errorLoading: function() {
                    return 'The results could not be loaded.';
                },
                inputTooLong: function(args) {
                    var overChars = args.input.length - args.maximum;
                    var message = 'Please delete ' + overChars + ' character';
                    if (overChars != 1) {
                        message += 's';
                    }
                    return message;
                },
                inputTooShort: function(args) {
                    var remainingChars = args.minimum - args.input.length;
                    var message = 'Please enter ' + remainingChars + ' or more characters';
                    return message;
                },
                loadingMore: function() {
                    return 'Loading more results…';
                },
                maximumSelected: function(args) {
                    var message = 'You can only select ' + args.maximum + ' item';
                    if (args.maximum != 1) {
                        message += 's';
                    }
                    return message;
                },
                noResults: function() {
                    return 'No results found';
                },
                searching: function() {
                    return 'Searching…';
                }
            };
        });
        S2.define('select2/defaults', ['jquery', 'require', './results', './selection/single', './selection/multiple', './selection/placeholder', './selection/allowClear', './selection/search', './selection/eventRelay', './utils', './translation', './diacritics', './data/select', './data/array', './data/ajax', './data/tags', './data/tokenizer', './data/minimumInputLength', './data/maximumInputLength', './data/maximumSelectionLength', './dropdown', './dropdown/search', './dropdown/hidePlaceholder', './dropdown/infiniteScroll', './dropdown/attachBody', './dropdown/minimumResultsForSearch', './dropdown/selectOnClose', './dropdown/closeOnSelect', './i18n/en'], function($, require, ResultsList, SingleSelection, MultipleSelection, Placeholder, AllowClear, SelectionSearch, EventRelay, Utils, Translation, DIACRITICS, SelectData, ArrayData, AjaxData, Tags, Tokenizer, MinimumInputLength, MaximumInputLength, MaximumSelectionLength, Dropdown, DropdownSearch, HidePlaceholder, InfiniteScroll, AttachBody, MinimumResultsForSearch, SelectOnClose, CloseOnSelect, EnglishTranslation) {
            function Defaults() {
                this.reset();
            }
            Defaults.prototype.apply = function(options) {
                options = $.extend(true, {}, this.defaults, options);
                if (options.dataAdapter == null) {
                    if (options.ajax != null) {
                        options.dataAdapter = AjaxData;
                    } else if (options.data != null) {
                        options.dataAdapter = ArrayData;
                    } else {
                        options.dataAdapter = SelectData;
                    }
                    if (options.minimumInputLength > 0) {
                        options.dataAdapter = Utils.Decorate(options.dataAdapter, MinimumInputLength);
                    }
                    if (options.maximumInputLength > 0) {
                        options.dataAdapter = Utils.Decorate(options.dataAdapter, MaximumInputLength);
                    }
                    if (options.maximumSelectionLength > 0) {
                        options.dataAdapter = Utils.Decorate(options.dataAdapter, MaximumSelectionLength);
                    }
                    if (options.tags) {
                        options.dataAdapter = Utils.Decorate(options.dataAdapter, Tags);
                    }
                    if (options.tokenSeparators != null || options.tokenizer != null) {
                        options.dataAdapter = Utils.Decorate(options.dataAdapter, Tokenizer);
                    }
                    if (options.query != null) {
                        var Query = require(options.amdBase + 'compat/query');
                        options.dataAdapter = Utils.Decorate(options.dataAdapter, Query);
                    }
                    if (options.initSelection != null) {
                        var InitSelection = require(options.amdBase + 'compat/initSelection');
                        options.dataAdapter = Utils.Decorate(options.dataAdapter, InitSelection);
                    }
                }
                if (options.resultsAdapter == null) {
                    options.resultsAdapter = ResultsList;
                    if (options.ajax != null) {
                        options.resultsAdapter = Utils.Decorate(options.resultsAdapter, InfiniteScroll);
                    }
                    if (options.placeholder != null) {
                        options.resultsAdapter = Utils.Decorate(options.resultsAdapter, HidePlaceholder);
                    }
                    if (options.selectOnClose) {
                        options.resultsAdapter = Utils.Decorate(options.resultsAdapter, SelectOnClose);
                    }
                }
                if (options.dropdownAdapter == null) {
                    if (options.multiple) {
                        options.dropdownAdapter = Dropdown;
                    } else {
                        var SearchableDropdown = Utils.Decorate(Dropdown, DropdownSearch);
                        options.dropdownAdapter = SearchableDropdown;
                    }
                    if (options.minimumResultsForSearch !== 0) {
                        options.dropdownAdapter = Utils.Decorate(options.dropdownAdapter, MinimumResultsForSearch);
                    }
                    if (options.closeOnSelect) {
                        options.dropdownAdapter = Utils.Decorate(options.dropdownAdapter, CloseOnSelect);
                    }
                    if (options.dropdownCssClass != null || options.dropdownCss != null || options.adaptDropdownCssClass != null) {
                        var DropdownCSS = require(options.amdBase + 'compat/dropdownCss');
                        options.dropdownAdapter = Utils.Decorate(options.dropdownAdapter, DropdownCSS);
                    }
                    options.dropdownAdapter = Utils.Decorate(options.dropdownAdapter, AttachBody);
                }
                if (options.selectionAdapter == null) {
                    if (options.multiple) {
                        options.selectionAdapter = MultipleSelection;
                    } else {
                        options.selectionAdapter = SingleSelection;
                    }
                    if (options.placeholder != null) {
                        options.selectionAdapter = Utils.Decorate(options.selectionAdapter, Placeholder);
                    }
                    if (options.allowClear) {
                        options.selectionAdapter = Utils.Decorate(options.selectionAdapter, AllowClear);
                    }
                    if (options.multiple) {
                        options.selectionAdapter = Utils.Decorate(options.selectionAdapter, SelectionSearch);
                    }
                    if (options.containerCssClass != null || options.containerCss != null || options.adaptContainerCssClass != null) {
                        var ContainerCSS = require(options.amdBase + 'compat/containerCss');
                        options.selectionAdapter = Utils.Decorate(options.selectionAdapter, ContainerCSS);
                    }
                    options.selectionAdapter = Utils.Decorate(options.selectionAdapter, EventRelay);
                }
                if (typeof options.language === 'string') {
                    if (options.language.indexOf('-') > 0) {
                        var languageParts = options.language.split('-');
                        var baseLanguage = languageParts[0];
                        options.language = [options.language, baseLanguage];
                    } else {
                        options.language = [options.language];
                    }
                }
                if ($.isArray(options.language)) {
                    var languages = new Translation();
                    options.language.push('en');
                    var languageNames = options.language;
                    for (var l = 0; l < languageNames.length; l++) {
                        var name = languageNames[l];
                        var language = {};
                        try {
                            language = Translation.loadPath(name);
                        } catch (e) {
                            try {
                                name = this.defaults.amdLanguageBase + name;
                                language = Translation.loadPath(name);
                            } catch (ex) {
                                if (options.debug && window.console && console.warn) {
                                    console.warn('Select2: The language file for "' + name + '" could not be ' + 'automatically loaded. A fallback will be used instead.');
                                }
                                continue;
                            }
                        }
                        languages.extend(language);
                    }
                    options.translations = languages;
                } else {
                    var baseTranslation = Translation.loadPath(this.defaults.amdLanguageBase + 'en');
                    var customTranslation = new Translation(options.language);
                    customTranslation.extend(baseTranslation);
                    options.translations = customTranslation;
                }
                return options;
            };
            Defaults.prototype.reset = function() {
                function stripDiacritics(text) {
                    function match(a) {
                        return DIACRITICS[a] || a;
                    }
                    return text.replace(/[^\u0000-\u007E]/g, match);
                }

                function matcher(params, data) {
                    if ($.trim(params.term) === '') {
                        return data;
                    }
                    if (data.children && data.children.length > 0) {
                        var match = $.extend(true, {}, data);
                        for (var c = data.children.length - 1; c >= 0; c--) {
                            var child = data.children[c];
                            var matches = matcher(params, child);
                            if (matches == null) {
                                match.children.splice(c, 1);
                            }
                        }
                        if (match.children.length > 0) {
                            return match;
                        }
                        return matcher(params, match);
                    }
                    var original = stripDiacritics(data.text).toUpperCase();
                    var term = stripDiacritics(params.term).toUpperCase();
                    if (original.indexOf(term) > -1) {
                        return data;
                    }
                    return null;
                }
                this.defaults = {
                    amdBase: './',
                    amdLanguageBase: './i18n/',
                    closeOnSelect: true,
                    debug: false,
                    dropdownAutoWidth: false,
                    escapeMarkup: Utils.escapeMarkup,
                    language: EnglishTranslation,
                    matcher: matcher,
                    minimumInputLength: 0,
                    maximumInputLength: 0,
                    maximumSelectionLength: 0,
                    minimumResultsForSearch: 0,
                    selectOnClose: false,
                    sorter: function(data) {
                        return data;
                    },
                    templateResult: function(result) {
                        return result.text;
                    },
                    templateSelection: function(selection) {
                        return selection.text;
                    },
                    theme: 'default',
                    width: 'resolve'
                };
            };
            Defaults.prototype.set = function(key, value) {
                var camelKey = $.camelCase(key);
                var data = {};
                data[camelKey] = value;
                var convertedData = Utils._convertData(data);
                $.extend(this.defaults, convertedData);
            };
            var defaults = new Defaults();
            return defaults;
        });
        S2.define('select2/options', ['require', 'jquery', './defaults', './utils'], function(require, $, Defaults, Utils) {
            function Options(options, $element) {
                this.options = options;
                if ($element != null) {
                    this.fromElement($element);
                }
                this.options = Defaults.apply(this.options);
                if ($element && $element.is('input')) {
                    var InputCompat = require(this.get('amdBase') + 'compat/inputData');
                    this.options.dataAdapter = Utils.Decorate(this.options.dataAdapter, InputCompat);
                }
            }
            Options.prototype.fromElement = function($e) {
                var excludedData = ['select2'];
                if (this.options.multiple == null) {
                    this.options.multiple = $e.prop('multiple');
                }
                if (this.options.disabled == null) {
                    this.options.disabled = $e.prop('disabled');
                }
                if (this.options.language == null) {
                    if ($e.prop('lang')) {
                        this.options.language = $e.prop('lang').toLowerCase();
                    } else if ($e.closest('[lang]').prop('lang')) {
                        this.options.language = $e.closest('[lang]').prop('lang');
                    }
                }
                if (this.options.dir == null) {
                    if ($e.prop('dir')) {
                        this.options.dir = $e.prop('dir');
                    } else if ($e.closest('[dir]').prop('dir')) {
                        this.options.dir = $e.closest('[dir]').prop('dir');
                    } else {
                        this.options.dir = 'ltr';
                    }
                }
                $e.prop('disabled', this.options.disabled);
                $e.prop('multiple', this.options.multiple);
                if ($e.data('select2Tags')) {
                    if (this.options.debug && window.console && console.warn) {
                        console.warn('Select2: The `data-select2-tags` attribute has been changed to ' + 'use the `data-data` and `data-tags="true"` attributes and will be ' + 'removed in future versions of Select2.');
                    }
                    $e.data('data', $e.data('select2Tags'));
                    $e.data('tags', true);
                }
                if ($e.data('ajaxUrl')) {
                    if (this.options.debug && window.console && console.warn) {
                        console.warn('Select2: The `data-ajax-url` attribute has been changed to ' + '`data-ajax--url` and support for the old attribute will be removed' + ' in future versions of Select2.');
                    }
                    $e.attr('ajax--url', $e.data('ajaxUrl'));
                    $e.data('ajax--url', $e.data('ajaxUrl'));
                }
                var dataset = {};
                if ($.fn.jquery && $.fn.jquery.substr(0, 2) == '1.' && $e[0].dataset) {
                    dataset = $.extend(true, {}, $e[0].dataset, $e.data());
                } else {
                    dataset = $e.data();
                }
                var data = $.extend(true, {}, dataset);
                data = Utils._convertData(data);
                for (var key in data) {
                    if ($.inArray(key, excludedData) > -1) {
                        continue;
                    }
                    if ($.isPlainObject(this.options[key])) {
                        $.extend(this.options[key], data[key]);
                    } else {
                        this.options[key] = data[key];
                    }
                }
                return this;
            };
            Options.prototype.get = function(key) {
                return this.options[key];
            };
            Options.prototype.set = function(key, val) {
                this.options[key] = val;
            };
            return Options;
        });
        S2.define('select2/core', ['jquery', './options', './utils', './keys'], function($, Options, Utils, KEYS) {
            var Select2 = function($element, options) {
                if ($element.data('select2') != null) {
                    $element.data('select2').destroy();
                }
                this.$element = $element;
                this.id = this._generateId($element);
                options = options || {};
                this.options = new Options(options, $element);
                Select2.__super__.constructor.call(this);
                var tabindex = $element.attr('tabindex') || 0;
                $element.data('old-tabindex', tabindex);
                $element.attr('tabindex', '-1');
                var DataAdapter = this.options.get('dataAdapter');
                this.dataAdapter = new DataAdapter($element, this.options);
                var $container = this.render();
                this._placeContainer($container);
                var SelectionAdapter = this.options.get('selectionAdapter');
                this.selection = new SelectionAdapter($element, this.options);
                this.$selection = this.selection.render();
                this.selection.position(this.$selection, $container);
                var DropdownAdapter = this.options.get('dropdownAdapter');
                this.dropdown = new DropdownAdapter($element, this.options);
                this.$dropdown = this.dropdown.render();
                this.dropdown.position(this.$dropdown, $container);
                var ResultsAdapter = this.options.get('resultsAdapter');
                this.results = new ResultsAdapter($element, this.options, this.dataAdapter);
                this.$results = this.results.render();
                this.results.position(this.$results, this.$dropdown);
                var self = this;
                this._bindAdapters();
                this._registerDomEvents();
                this._registerDataEvents();
                this._registerSelectionEvents();
                this._registerDropdownEvents();
                this._registerResultsEvents();
                this._registerEvents();
                this.dataAdapter.current(function(initialData) {
                    self.trigger('selection:update', {
                        data: initialData
                    });
                });
                $element.addClass('select2-hidden-accessible');
                $element.attr('aria-hidden', 'true');
                this._syncAttributes();
                $element.data('select2', this);
            };
            Utils.Extend(Select2, Utils.Observable);
            Select2.prototype._generateId = function($element) {
                var id = '';
                if ($element.attr('id') != null) {
                    id = $element.attr('id');
                } else if ($element.attr('name') != null) {
                    id = $element.attr('name') + '-' + Utils.generateChars(2);
                } else {
                    id = Utils.generateChars(4);
                }
                id = id.replace(/(:|\.|\[|\]|,)/g, '');
                id = 'select2-' + id;
                return id;
            };
            Select2.prototype._placeContainer = function($container) {
                $container.insertAfter(this.$element);
                var width = this._resolveWidth(this.$element, this.options.get('width'));
                if (width != null) {
                    $container.css('width', width);
                }
            };
            Select2.prototype._resolveWidth = function($element, method) {
                var WIDTH = /^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;
                if (method == 'resolve') {
                    var styleWidth = this._resolveWidth($element, 'style');
                    if (styleWidth != null) {
                        return styleWidth;
                    }
                    return this._resolveWidth($element, 'element');
                }
                if (method == 'element') {
                    var elementWidth = $element.outerWidth(false);
                    if (elementWidth <= 0) {
                        return 'auto';
                    }
                    return elementWidth + 'px';
                }
                if (method == 'style') {
                    var style = $element.attr('style');
                    if (typeof(style) !== 'string') {
                        return null;
                    }
                    var attrs = style.split(';');
                    for (var i = 0, l = attrs.length; i < l; i = i + 1) {
                        var attr = attrs[i].replace(/\s/g, '');
                        var matches = attr.match(WIDTH);
                        if (matches !== null && matches.length >= 1) {
                            return matches[1];
                        }
                    }
                    return null;
                }
                return method;
            };
            Select2.prototype._bindAdapters = function() {
                this.dataAdapter.bind(this, this.$container);
                this.selection.bind(this, this.$container);
                this.dropdown.bind(this, this.$container);
                this.results.bind(this, this.$container);
            };
            Select2.prototype._registerDomEvents = function() {
                var self = this;
                this.$element.on('change.select2', function() {
                    self.dataAdapter.current(function(data) {
                        self.trigger('selection:update', {
                            data: data
                        });
                    });
                });
                this.$element.on('focus.select2', function(evt) {
                    self.trigger('focus', evt);
                });
                this._syncA = Utils.bind(this._syncAttributes, this);
                this._syncS = Utils.bind(this._syncSubtree, this);
                if (this.$element[0].attachEvent) {
                    this.$element[0].attachEvent('onpropertychange', this._syncA);
                }
                var observer = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
                if (observer != null) {
                    this._observer = new observer(function(mutations) {
                        $.each(mutations, self._syncA);
                        $.each(mutations, self._syncS);
                    });
                    this._observer.observe(this.$element[0], {
                        attributes: true,
                        childList: true,
                        subtree: false
                    });
                } else if (this.$element[0].addEventListener) {
                    this.$element[0].addEventListener('DOMAttrModified', self._syncA, false);
                    this.$element[0].addEventListener('DOMNodeInserted', self._syncS, false);
                    this.$element[0].addEventListener('DOMNodeRemoved', self._syncS, false);
                }
            };
            Select2.prototype._registerDataEvents = function() {
                var self = this;
                this.dataAdapter.on('*', function(name, params) {
                    self.trigger(name, params);
                });
            };
            Select2.prototype._registerSelectionEvents = function() {
                var self = this;
                var nonRelayEvents = ['toggle', 'focus'];
                this.selection.on('toggle', function() {
                    self.toggleDropdown();
                });
                this.selection.on('focus', function(params) {
                    self.focus(params);
                });
                this.selection.on('*', function(name, params) {
                    if ($.inArray(name, nonRelayEvents) !== -1) {
                        return;
                    }
                    self.trigger(name, params);
                });
            };
            Select2.prototype._registerDropdownEvents = function() {
                var self = this;
                this.dropdown.on('*', function(name, params) {
                    self.trigger(name, params);
                });
            };
            Select2.prototype._registerResultsEvents = function() {
                var self = this;
                this.results.on('*', function(name, params) {
                    self.trigger(name, params);
                });
            };
            Select2.prototype._registerEvents = function() {
                var self = this;
                this.on('open', function() {
                    self.$container.addClass('select2-container--open');
                });
                this.on('close', function() {
                    self.$container.removeClass('select2-container--open');
                });
                this.on('enable', function() {
                    self.$container.removeClass('select2-container--disabled');
                });
                this.on('disable', function() {
                    self.$container.addClass('select2-container--disabled');
                });
                this.on('blur', function() {
                    self.$container.removeClass('select2-container--focus');
                });
                this.on('query', function(params) {
                    if (!self.isOpen()) {
                        self.trigger('open', {});
                    }
                    this.dataAdapter.query(params, function(data) {
                        self.trigger('results:all', {
                            data: data,
                            query: params
                        });
                    });
                });
                this.on('query:append', function(params) {
                    this.dataAdapter.query(params, function(data) {
                        self.trigger('results:append', {
                            data: data,
                            query: params
                        });
                    });
                });
                this.on('keypress', function(evt) {
                    var key = evt.which;
                    if (self.isOpen()) {
                        if (key === KEYS.ESC || key === KEYS.TAB || (key === KEYS.UP && evt.altKey)) {
                            self.close();
                            evt.preventDefault();
                        } else if (key === KEYS.ENTER) {
                            self.trigger('results:select', {});
                            evt.preventDefault();
                        } else if ((key === KEYS.SPACE && evt.ctrlKey)) {
                            self.trigger('results:toggle', {});
                            evt.preventDefault();
                        } else if (key === KEYS.UP) {
                            self.trigger('results:previous', {});
                            evt.preventDefault();
                        } else if (key === KEYS.DOWN) {
                            self.trigger('results:next', {});
                            evt.preventDefault();
                        }
                    } else {
                        if (key === KEYS.ENTER || key === KEYS.SPACE || (key === KEYS.DOWN && evt.altKey)) {
                            self.open();
                            evt.preventDefault();
                        }
                    }
                });
            };
            Select2.prototype._syncAttributes = function() {
                this.options.set('disabled', this.$element.prop('disabled'));
                if (this.options.get('disabled')) {
                    if (this.isOpen()) {
                        this.close();
                    }
                    this.trigger('disable', {});
                } else {
                    this.trigger('enable', {});
                }
            };
            Select2.prototype._syncSubtree = function(evt, mutations) {
                var changed = false;
                var self = this;
                if (evt && evt.target && (evt.target.nodeName !== 'OPTION' && evt.target.nodeName !== 'OPTGROUP')) {
                    return;
                }
                if (!mutations) {
                    changed = true;
                } else if (mutations.addedNodes && mutations.addedNodes.length > 0) {
                    for (var n = 0; n < mutations.addedNodes.length; n++) {
                        var node = mutations.addedNodes[n];
                        if (node.selected) {
                            changed = true;
                        }
                    }
                } else if (mutations.removedNodes && mutations.removedNodes.length > 0) {
                    changed = true;
                }
                if (changed) {
                    this.dataAdapter.current(function(currentData) {
                        self.trigger('selection:update', {
                            data: currentData
                        });
                    });
                }
            };
            Select2.prototype.trigger = function(name, args) {
                var actualTrigger = Select2.__super__.trigger;
                var preTriggerMap = {
                    'open': 'opening',
                    'close': 'closing',
                    'select': 'selecting',
                    'unselect': 'unselecting'
                };
                if (args === undefined) {
                    args = {};
                }
                if (name in preTriggerMap) {
                    var preTriggerName = preTriggerMap[name];
                    var preTriggerArgs = {
                        prevented: false,
                        name: name,
                        args: args
                    };
                    actualTrigger.call(this, preTriggerName, preTriggerArgs);
                    if (preTriggerArgs.prevented) {
                        args.prevented = true;
                        return;
                    }
                }
                actualTrigger.call(this, name, args);
            };
            Select2.prototype.toggleDropdown = function() {
                if (this.options.get('disabled')) {
                    return;
                }
                if (this.isOpen()) {
                    this.close();
                } else {
                    this.open();
                }
            };
            Select2.prototype.open = function() {
                if (this.isOpen()) {
                    return;
                }
                this.trigger('query', {});
            };
            Select2.prototype.close = function() {
                if (!this.isOpen()) {
                    return;
                }
                this.trigger('close', {});
            };
            Select2.prototype.isOpen = function() {
                return this.$container.hasClass('select2-container--open');
            };
            Select2.prototype.hasFocus = function() {
                return this.$container.hasClass('select2-container--focus');
            };
            Select2.prototype.focus = function(data) {
                if (this.hasFocus()) {
                    return;
                }
                this.$container.addClass('select2-container--focus');
                this.trigger('focus', {});
            };
            Select2.prototype.enable = function(args) {
                if (this.options.get('debug') && window.console && console.warn) {
                    console.warn('Select2: The `select2("enable")` method has been deprecated and will' + ' be removed in later Select2 versions. Use $element.prop("disabled")' + ' instead.');
                }
                if (args == null || args.length === 0) {
                    args = [true];
                }
                var disabled = !args[0];
                this.$element.prop('disabled', disabled);
            };
            Select2.prototype.data = function() {
                if (this.options.get('debug') && arguments.length > 0 && window.console && console.warn) {
                    console.warn('Select2: Data can no longer be set using `select2("data")`. You ' + 'should consider setting the value instead using `$element.val()`.');
                }
                var data = [];
                this.dataAdapter.current(function(currentData) {
                    data = currentData;
                });
                return data;
            };
            Select2.prototype.val = function(args) {
                if (this.options.get('debug') && window.console && console.warn) {
                    console.warn('Select2: The `select2("val")` method has been deprecated and will be' + ' removed in later Select2 versions. Use $element.val() instead.');
                }
                if (args == null || args.length === 0) {
                    return this.$element.val();
                }
                var newVal = args[0];
                if ($.isArray(newVal)) {
                    newVal = $.map(newVal, function(obj) {
                        return obj.toString();
                    });
                }
                this.$element.val(newVal).trigger('change');
            };
            Select2.prototype.destroy = function() {
                this.$container.remove();
                if (this.$element[0].detachEvent) {
                    this.$element[0].detachEvent('onpropertychange', this._syncA);
                }
                if (this._observer != null) {
                    this._observer.disconnect();
                    this._observer = null;
                } else if (this.$element[0].removeEventListener) {
                    this.$element[0].removeEventListener('DOMAttrModified', this._syncA, false);
                    this.$element[0].removeEventListener('DOMNodeInserted', this._syncS, false);
                    this.$element[0].removeEventListener('DOMNodeRemoved', this._syncS, false);
                }
                this._syncA = null;
                this._syncS = null;
                this.$element.off('.select2');
                this.$element.attr('tabindex', this.$element.data('old-tabindex'));
                this.$element.removeClass('select2-hidden-accessible');
                this.$element.attr('aria-hidden', 'false');
                this.$element.removeData('select2');
                this.dataAdapter.destroy();
                this.selection.destroy();
                this.dropdown.destroy();
                this.results.destroy();
                this.dataAdapter = null;
                this.selection = null;
                this.dropdown = null;
                this.results = null;
            };
            Select2.prototype.render = function() {
                var $container = $('<span class="select2 select2-container">' + '<span class="selection"></span>' + '<span class="dropdown-wrapper" aria-hidden="true"></span>' + '</span>');
                $container.attr('dir', this.options.get('dir'));
                this.$container = $container;
                this.$container.addClass('select2-container--' + this.options.get('theme'));
                $container.data('element', this.$element);
                return $container;
            };
            return Select2;
        });
        S2.define('jquery-mousewheel', ['jquery'], function($) {
            return $;
        });
        S2.define('jquery.select2', ['jquery', 'jquery-mousewheel', './select2/core', './select2/defaults'], function($, _, Select2, Defaults) {
            if ($.fn.select2 == null) {
                var thisMethods = ['open', 'close', 'destroy'];
                $.fn.select2 = function(options) {
                    options = options || {};
                    if (typeof options === 'object') {
                        this.each(function() {
                            var instanceOptions = $.extend(true, {}, options);
                            var instance = new Select2($(this), instanceOptions);
                        });
                        return this;
                    } else if (typeof options === 'string') {
                        var ret;
                        var args = Array.prototype.slice.call(arguments, 1);
                        this.each(function() {
                            var instance = $(this).data('select2');
                            if (instance == null && window.console && console.error) {
                                console.error('The select2(\'' + options + '\') method was called on an ' + 'element that is not using Select2.');
                            }
                            ret = instance[options].apply(instance, args);
                        });
                        if ($.inArray(options, thisMethods) > -1) {
                            return this;
                        }
                        return ret;
                    } else {
                        throw new Error('Invalid arguments for Select2: ' + options);
                    }
                };
            }
            if ($.fn.select2.defaults == null) {
                $.fn.select2.defaults = Defaults;
            }
            return Select2;
        });
        return {
            define: S2.define,
            require: S2.require
        };
    }());
    var select2 = S2.require('jquery.select2');
    jQuery.fn.select2.amd = S2;
    return select2;
}));
var token = $('input[name="__RequestVerificationToken"]').val();
$.ajaxPrefilter(function(options, originalOptions) {
    if (options.type.toUpperCase() == "POST") {
        options.data = $.param($.extend(originalOptions.data, {
            __RequestVerificationToken: token
        }));
    }
});
$.ajaxSetup({
    cache: false
});
$(document).ajaxError(function(e, xhr) {
    if (xhr.status == 403) {
        var response = JSON.parse(xhr.responseText);
        window.location = response.LogOnUrl;
    }
});

function openModal(url, loading, data, callback) {
    $.ajax({
        type: "post",
        url: url,
        data: data,
        cache: false,
        success: function(data, textStatus, jqXHR) {
            if (data == "") {
                handleError(jqXHR, "ClientNetworkError", "");
            } else {
                $.modal(data, {
                    autoResize: true,
                    autoPosition: true,
                    onClose: function(dialog, result) {
                        dialog.container.fadeOut(200, function() {
                            dialog.overlay.fadeOut(150, function() {
                                $.modal.close();
                                if ($.isFunction(callback)) {
                                    callback(result);
                                }
                            });
                        });
                    },
                    onOpen: function(dialog) {
                        dialog.overlay.fadeIn(150, function() {
                            dialog.container.fadeIn(200);
                            dialog.data.fadeIn(200);
                        });
                    }
                });
            }
        },
        error: handleError
    });
}

function openModalGet(url, data, callback) {
    $.ajax({
        type: "GET",
        url: url,
        data: data,
        cache: false,
        success: function(data, textStatus, jqXHR) {
            if (data == "") {
                handleError(jqXHR, "ClientNetworkError", "");
            } else {
                $.modal(data, {
                    autoResize: true,
                    autoPosition: true,
                    onClose: function(dialog, result) {
                        dialog.container.fadeOut("slow");
                        dialog.data.slideUp("slow", function() {
                            dialog.overlay.fadeOut("slow", function() {
                                $.modal.close();
                                if ($.isFunction(callback)) {
                                    callback(result);
                                }
                            });
                        });
                    },
                    onOpen: function(dialog) {
                        dialog.overlay.fadeIn("slow", function() {
                            dialog.container.fadeIn("slow");
                            dialog.data.slideDown("slow", function() {});
                        });
                    }
                });
            }
        },
        error: handleError
    });
}

function confirm(header, message, callbackYes, callbackNo) {
    $('<div class="modalform modal-dialog">    <div class="modal-content">        <div class="modal-header">            <button class="close simplemodal-close" aria-hidden="true" type="button">×</button>            <h4 class="modal-title header"></h4>        </div>        <div class="modal-body">                <span class="message" >  </span>        </div>        <div class="modal-footer">            <button style="width:70px" class="btn btn-info yes " type="button">' + Resources.General.Yes + '</button>            <button style="width:70px" class="btn btn-info no" type="button">' + Resources.General.No + '</button>        </div>    </div></div>').modal({
        onShow: function(dialog) {
            var modal = this;
            $('.header', dialog.data[0]).append(header);
            $('.message', dialog.data[0]).append(message);
            $('.yes', dialog.data[0]).click(function() {
                if ($.isFunction(callbackYes)) {
                    callbackYes.apply();
                }
                modal.close();
            });
            $('.no', dialog.data[0]).click(function() {
                if ($.isFunction(callbackNo)) {
                    callbackNo.apply();
                }
                modal.close();
            });
        },
        onClose: function(dialog, result) {
            dialog.container.fadeOut("slow");
            dialog.data.slideUp("slow", function() {
                dialog.overlay.fadeOut("slow", function() {
                    $.modal.close();
                });
            });
        },
        onOpen: function(dialog) {
            dialog.overlay.fadeIn("slow", function() {
                dialog.container.fadeIn("slow");
                dialog.data.slideDown("slow", function() {});
            });
        }
    });
}

function notify(header, message, callback) {
    $('<div class="modalform modal-dialog">    <div class="modal-content">        <div class="modal-header">            <button class="close simplemodal-close" aria-hidden="true" type="button">×</button>            <h4 class="modal-title header"></h4>        </div>        <div class="modal-body">                <span class="message" >  </span>        </div>        <div class="modal-footer">            <button style="width:70px" class="btn btn-info ok" type="button">' + Resources.General.OK + '</button>                </div>    </div></div>').modal({
        onShow: function(dialog) {
            var modal = this;
            $('.header', dialog.data[0]).append(header);
            $('.message', dialog.data[0]).append(message);
            $('.ok', dialog.data[0]).click(function() {
                if ($.isFunction(callback)) {
                    callback.apply();
                }
                modal.close();
            });
        },
        onClose: function(dialog, result) {
            dialog.container.fadeOut("slow");
            dialog.data.slideUp("slow", function() {
                dialog.overlay.fadeOut("slow", function() {
                    $.modal.close();
                });
            });
        },
        onOpen: function(dialog) {
            dialog.overlay.fadeIn("slow", function() {
                dialog.container.fadeIn("slow");
                dialog.data.slideDown("slow", function() {});
            });
        }
    });
}

function getJson(url, vars, callback) {
    return $.ajax({
        url: url,
        cache: false,
        async: true,
        type: "post",
        dataType: 'json',
        data: vars,
        success: function(response, textStatus, jqXHR) {
            if (callback) {
                callback(response);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {}
    });
}

function postJson(url, vars, callback, errorcallback) {
    return $.ajax({
        url: url,
        cache: false,
        async: true,
        type: "POST",
        dataType: 'json',
        data: vars,
        success: function(response, textStatus, jqXHR) {
            if (callback) {
                callback(response);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            if (errorcallback) {
                errorcallback(jqXHR, textStatus, errorThrown);
            }
        }
    });
}

function postHtml(url, vars, callback) {
    return $.ajax({
        url: url,
        cache: false,
        async: true,
        type: "post",
        dataType: 'html',
        data: vars,
        success: function(response, textStatus, jqXHR) {
            if (callback) {
                callback(response);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {}
    });
}

function getJsonSync(url, vars, callback) {
    return $.ajax({
        url: url,
        cache: false,
        async: false,
        type: "post",
        dataType: 'json',
        data: vars,
        success: function(response, textStatus, jqXHR) {
            if (callback) {
                callback(response);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {}
    });
}

function postData(url, vars) {
    return $.ajax({
        url: url,
        cache: false,
        async: false,
        type: "post",
        dataType: 'html',
        data: vars
    });
}

function getData(url, vars, callback) {
    return $.ajax({
        url: url,
        cache: false,
        async: true,
        type: "get",
        dataType: 'json',
        data: vars,
        success: function(response, textStatus, jqXHR) {
            if (callback) {
                callback(response);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {}
    });
}

function getPartial(div, url, showLoading, callback) {
    if (showLoading) {
        $(div).block({
            message: Resources.Layout.ModalLoadingMessage
        });
    }
    $.ajax({
        url: url,
        cache: false,
        async: true,
        type: "GET",
        success: function(response, textStatus, jqXHR) {
            $(div).html(response);
            if (showLoading) {
                $(div).unblock();
            }
            if (callback) {
                callback(response);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            if (showLoading) {
                $(div).unblock();
            }
        }
    });
}

function handleError(jqXHR, textStatus, errorThrown) {
    if (jqXHR.status != 403) {
        $.unblockUI();
        $.modal('<div class="modalform modal-dialog">    <div class="modal-content">        <div class="modal-header">            <button class="close simplemodal-close" aria-hidden="true" type="button">×</button>            <h4 class="modal-title">' + Resources.Layout.ModalInvalidRequestTitle + '</h4>        </div>        <div class="modal-body">            <p>' + Resources.Layout.modalInvalidRequestMessage1 + '</p>            <p>' + Resources.Layout.modalInvalidRequestMessage2 + '</p>        </div>         <div class="modal-footer">            <button style="width:70px" class="btn btn-info simplemodal-close" type="button">' + Resources.General.OK + '</button>        </div>    </div></div>');
    }
};
(function(factory) {
        if (typeof define === 'function' && define.amd) {
            define(['jquery'], factory);
        } else {
            factory(jQuery);
        }
    }
    (function($) {
        var d = [],
            doc = $(document),
            ua = navigator.userAgent.toLowerCase(),
            wndw = $(window),
            w = [];
        var browser = {
            ieQuirks: null,
            msie: /msie/.test(ua) && !/opera/.test(ua),
            opera: /opera/.test(ua)
        };
        browser.ie6 = browser.msie && /msie 6./.test(ua) && typeof window['XMLHttpRequest'] !== 'object';
        browser.ie7 = browser.msie && /msie 7.0/.test(ua);
        $.modal = function(data, options) {
            return $.modal.impl.init(data, options);
        };
        $.modal.close = function(data) {
            $.modal.impl.close(data);
        };
        $.modal.focus = function(pos) {
            $.modal.impl.focus(pos);
        };
        $.modal.setContainerDimensions = function() {
            $.modal.impl.setContainerDimensions();
        };
        $.modal.setPosition = function() {
            $.modal.impl.setPosition();
        };
        $.modal.update = function(height, width) {
            $.modal.impl.update(height, width);
        };
        $.fn.modal = function(options) {
            return $.modal.impl.init(this, options);
        };
        $.modal.defaults = {
            appendTo: 'body',
            focus: true,
            opacity: 50,
            overlayId: 'simplemodal-overlay',
            overlayCss: {},
            containerId: 'simplemodal-container',
            containerCss: {},
            dataId: 'simplemodal-data',
            dataCss: {},
            minHeight: null,
            minWidth: null,
            maxHeight: null,
            maxWidth: null,
            autoResize: true,
            autoPosition: true,
            zIndex: 1000,
            close: true,
            closeHTML: '<a class="modalCloseImg" title="Close"></a>',
            closeClass: 'simplemodal-close',
            escClose: true,
            overlayClose: false,
            fixed: false,
            position: null,
            persist: false,
            modal: true,
            onOpen: null,
            onShow: null,
            onClose: null
        };
        $.modal.impl = {
            d: {},
            init: function(data, options) {
                var s = this;
                if (s.d.data) {
                    return false;
                }
                browser.ieQuirks = browser.msie && !$.support.boxModel;
                s.o = $.extend({}, $.modal.defaults, options);
                s.zIndex = s.o.zIndex;
                s.occb = false;
                if (typeof data === 'object') {
                    data = data instanceof $ ? data : $(data);
                    s.d.placeholder = false;
                    if (data.parent().parent().size() > 0) {
                        data.before($('<span></span>').attr('id', 'simplemodal-placeholder').css({
                            display: 'none'
                        }));
                        s.d.placeholder = true;
                        s.display = data.css('display');
                        if (!s.o.persist) {
                            s.d.orig = data.clone(true);
                        }
                    }
                } else if (typeof data === 'string' || typeof data === 'number') {
                    data = $('<div></div>').html(data);
                } else {
                    alert('SimpleModal Error: Unsupported data type: ' + typeof data);
                    return s;
                }
                s.create(data);
                data = null;
                s.open();
                if ($.isFunction(s.o.onShow)) {
                    s.o.onShow.apply(s, [s.d]);
                }
                return s;
            },
            create: function(data) {
                var s = this;
                s.getDimensions();
                if (s.o.modal && browser.ie6) {
                    s.d.iframe = $('<iframe src="javascript:false;"></iframe>').css($.extend(s.o.iframeCss, {
                        display: 'none',
                        opacity: 0,
                        position: 'fixed',
                        height: w[0],
                        width: w[1],
                        zIndex: s.o.zIndex,
                        top: 0,
                        left: 0
                    })).appendTo(s.o.appendTo);
                }
                s.d.overlay = $('<div></div>').attr('id', s.o.overlayId).addClass('simplemodal-overlay').css($.extend(s.o.overlayCss, {
                    display: 'none',
                    opacity: s.o.opacity / 100,
                    height: s.o.modal ? d[0] : 0,
                    width: s.o.modal ? d[1] : 0,
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    zIndex: s.o.zIndex + 1
                })).appendTo(s.o.appendTo);
                s.d.container = $('<div></div>').attr('id', s.o.containerId).addClass('simplemodal-container').css($.extend({
                    position: s.o.fixed ? 'fixed' : 'absolute'
                }, s.o.containerCss, {
                    display: 'none',
                    zIndex: s.o.zIndex + 2
                })).append(s.o.close && s.o.closeHTML ? $(s.o.closeHTML).addClass(s.o.closeClass) : '').appendTo(s.o.appendTo);
                s.d.wrap = $('<div></div>').attr('tabIndex', -1).addClass('simplemodal-wrap').css({
                    height: '100%',
                    outline: 0,
                    width: '100%'
                }).appendTo(s.d.container);
                s.d.data = data.attr('id', data.attr('id') || s.o.dataId).addClass('simplemodal-data').css($.extend(s.o.dataCss, {
                    display: 'none'
                })).appendTo('body');
                data = null;
                s.setContainerDimensions();
                s.d.data.appendTo(s.d.wrap);
                if (browser.ie6 || browser.ieQuirks) {
                    s.fixIE();
                }
            },
            bindEvents: function() {
                var s = this;
                $('.' + s.o.closeClass).bind('click.simplemodal', function(e) {
                    e.preventDefault();
                    s.close();
                });
                if (s.o.modal && s.o.close && s.o.overlayClose) {
                    s.d.overlay.bind('click.simplemodal', function(e) {
                        e.preventDefault();
                        s.close();
                    });
                }
                doc.bind('keydown.simplemodal', function(e) {
                    if (s.o.modal && e.keyCode === 9) {
                        s.watchTab(e);
                    } else if ((s.o.close && s.o.escClose) && e.keyCode === 27) {
                        e.preventDefault();
                        s.close();
                    }
                });
                wndw.bind('resize.simplemodal orientationchange.simplemodal', function() {
                    s.getDimensions();
                    s.o.autoResize ? s.setContainerDimensions() : s.o.autoPosition && s.setPosition();
                    if (browser.ie6 || browser.ieQuirks) {
                        s.fixIE();
                    } else if (s.o.modal) {
                        s.d.iframe && s.d.iframe.css({
                            height: w[0],
                            width: w[1]
                        });
                        s.d.overlay.css({
                            height: d[0],
                            width: d[1]
                        });
                    }
                });
            },
            unbindEvents: function() {
                $('.' + this.o.closeClass).unbind('click.simplemodal');
                doc.unbind('keydown.simplemodal');
                wndw.unbind('.simplemodal');
                this.d.overlay.unbind('click.simplemodal');
            },
            fixIE: function() {
                var s = this,
                    p = s.o.position;
                $.each([s.d.iframe || null, !s.o.modal ? null : s.d.overlay, s.d.container.css('position') === 'fixed' ? s.d.container : null], function(i, el) {
                    if (el) {
                        var bch = 'document.body.clientHeight',
                            bcw = 'document.body.clientWidth',
                            bsh = 'document.body.scrollHeight',
                            bsl = 'document.body.scrollLeft',
                            bst = 'document.body.scrollTop',
                            bsw = 'document.body.scrollWidth',
                            ch = 'document.documentElement.clientHeight',
                            cw = 'document.documentElement.clientWidth',
                            sl = 'document.documentElement.scrollLeft',
                            st = 'document.documentElement.scrollTop',
                            s = el[0].style;
                        s.position = 'absolute';
                        if (i < 2) {
                            s.removeExpression('height');
                            s.removeExpression('width');
                            s.setExpression('height', '' + bsh + ' > ' + bch + ' ? ' + bsh + ' : ' + bch + ' + "px"');
                            s.setExpression('width', '' + bsw + ' > ' + bcw + ' ? ' + bsw + ' : ' + bcw + ' + "px"');
                        } else {
                            var te, le;
                            if (p && p.constructor === Array) {
                                var top = p[0] ? typeof p[0] === 'number' ? p[0].toString() : p[0].replace(/px/, '') : el.css('top').replace(/px/, '');
                                te = top.indexOf('%') === -1 ? top + ' + (t = ' + st + ' ? ' + st + ' : ' + bst + ') + "px"' : parseInt(top.replace(/%/, '')) + ' * ((' + ch + ' || ' + bch + ') / 100) + (t = ' + st + ' ? ' + st + ' : ' + bst + ') + "px"';
                                if (p[1]) {
                                    var left = typeof p[1] === 'number' ? p[1].toString() : p[1].replace(/px/, '');
                                    le = left.indexOf('%') === -1 ? left + ' + (t = ' + sl + ' ? ' + sl + ' : ' + bsl + ') + "px"' : parseInt(left.replace(/%/, '')) + ' * ((' + cw + ' || ' + bcw + ') / 100) + (t = ' + sl + ' ? ' + sl + ' : ' + bsl + ') + "px"';
                                }
                            } else {
                                te = '(' + ch + ' || ' + bch + ') / 2 - (this.offsetHeight / 2) + (t = ' + st + ' ? ' + st + ' : ' + bst + ') + "px"';
                                le = '(' + cw + ' || ' + bcw + ') / 2 - (this.offsetWidth / 2) + (t = ' + sl + ' ? ' + sl + ' : ' + bsl + ') + "px"';
                            }
                            s.removeExpression('top');
                            s.removeExpression('left');
                            s.setExpression('top', te);
                            s.setExpression('left', le);
                        }
                    }
                });
            },
            focus: function(pos) {
                var s = this,
                    p = pos && $.inArray(pos, ['first', 'last']) !== -1 ? pos : 'first';
                var input = $(':input:enabled:visible:' + p, s.d.wrap);
                setTimeout(function() {
                    input.length > 0 ? input.focus() : s.d.wrap.focus();
                }, 10);
            },
            getDimensions: function() {
                var s = this,
                    h = typeof window.innerHeight === 'undefined' ? wndw.height() : window.innerHeight;
                d = [doc.height(), doc.width()];
                w = [h, wndw.width()];
            },
            getVal: function(v, d) {
                return v ? (typeof v === 'number' ? v : v === 'auto' ? 0 : v.indexOf('%') > 0 ? ((parseInt(v.replace(/%/, '')) / 100) * (d === 'h' ? w[0] : w[1])) : parseInt(v.replace(/px/, ''))) : null;
            },
            update: function(height, width) {
                var s = this;
                if (!s.d.data) {
                    return false;
                }
                s.d.origHeight = s.getVal(height, 'h');
                s.d.origWidth = s.getVal(width, 'w');
                s.d.data.hide();
                height && s.d.container.css('height', height);
                width && s.d.container.css('width', width);
                s.setContainerDimensions();
                s.d.data.show();
                s.o.focus && s.focus();
                s.unbindEvents();
                s.bindEvents();
            },
            setContainerDimensions: function() {
                var s = this,
                    badIE = browser.ie6 || browser.ie7;
                var ch = s.d.origHeight ? s.d.origHeight : browser.opera ? s.d.container.height() : s.getVal(badIE ? s.d.container[0].currentStyle['height'] : s.d.container.css('height'), 'h'),
                    cw = s.d.origWidth ? s.d.origWidth : browser.opera ? s.d.container.width() : s.getVal(badIE ? s.d.container[0].currentStyle['width'] : s.d.container.css('width'), 'w'),
                    dh = s.d.data.outerHeight(true),
                    dw = s.d.data.outerWidth(true);
                s.d.origHeight = s.d.origHeight || ch;
                s.d.origWidth = s.d.origWidth || cw;
                var mxoh = s.o.maxHeight ? s.getVal(s.o.maxHeight, 'h') : null,
                    mxow = s.o.maxWidth ? s.getVal(s.o.maxWidth, 'w') : null,
                    mh = mxoh && mxoh < w[0] ? mxoh : w[0],
                    mw = mxow && mxow < w[1] ? mxow : w[1];
                var moh = s.o.minHeight ? s.getVal(s.o.minHeight, 'h') : 'auto';
                if (!ch) {
                    if (!dh) {
                        ch = moh;
                    } else {
                        if (dh > mh) {
                            ch = mh;
                        } else if (s.o.minHeight && moh !== 'auto' && dh < moh) {
                            ch = moh;
                        } else {
                            ch = dh;
                        }
                    }
                } else {
                    ch = s.o.autoResize && ch > mh ? mh : ch < moh ? moh : ch;
                }
                var mow = s.o.minWidth ? s.getVal(s.o.minWidth, 'w') : 'auto';
                if (!cw) {
                    if (!dw) {
                        cw = mow;
                    } else {
                        if (dw > mw) {
                            cw = mw;
                        } else if (s.o.minWidth && mow !== 'auto' && dw < mow) {
                            cw = mow;
                        } else {
                            cw = dw;
                        }
                    }
                } else {
                    cw = s.o.autoResize && cw > mw ? mw : cw < mow ? mow : cw;
                }
                s.d.container.css({
                    height: ch,
                    width: cw
                });
                s.d.wrap.css({
                    overflow: (dh > ch || dw > cw) ? 'auto' : 'visible'
                });
                s.o.autoPosition && s.setPosition();
            },
            setPosition: function() {
                var s = this,
                    top, left, hc = (w[0] / 2) - (s.d.container.outerHeight(true) / 2),
                    vc = (w[1] / 2) - (s.d.container.outerWidth(true) / 2),
                    st = s.d.container.css('position') !== 'fixed' ? wndw.scrollTop() : 0;
                if (s.o.position && Object.prototype.toString.call(s.o.position) === '[object Array]') {
                    top = st + (s.o.position[0] || hc);
                    left = s.o.position[1] || vc;
                } else {
                    top = st + hc;
                    left = vc;
                }
                s.d.container.css({
                    left: left,
                    top: top
                });
            },
            watchTab: function(e) {
                var s = this;
                if ($(e.target).parents('.simplemodal-container').length > 0) {
                    s.inputs = $(':input:enabled:visible:first, :input:enabled:visible:last', s.d.data[0]);
                    if ((!e.shiftKey && e.target === s.inputs[s.inputs.length - 1]) || (e.shiftKey && e.target === s.inputs[0]) || s.inputs.length === 0) {
                        e.preventDefault();
                        var pos = e.shiftKey ? 'last' : 'first';
                        s.focus(pos);
                    }
                } else {
                    e.preventDefault();
                    s.focus();
                }
            },
            open: function() {
                var s = this;
                s.d.iframe && s.d.iframe.show();
                if ($.isFunction(s.o.onOpen)) {
                    s.o.onOpen.apply(s, [s.d]);
                } else {
                    s.d.overlay.show();
                    s.d.container.show();
                    s.d.data.show();
                }
                s.o.focus && s.focus();
                s.bindEvents();
            },
            close: function(data) {
                var s = this;
                if (!s.d.data) {
                    return false;
                }
                s.unbindEvents();
                if ($.isFunction(s.o.onClose) && !s.occb) {
                    s.occb = true;
                    s.o.onClose.apply(s, [s.d, data]);
                } else {
                    if (s.d.placeholder) {
                        var ph = $('#simplemodal-placeholder');
                        if (s.o.persist) {
                            ph.replaceWith(s.d.data.removeClass('simplemodal-data').css('display', s.display));
                        } else {
                            s.d.data.hide().remove();
                            ph.replaceWith(s.d.orig);
                        }
                    } else {
                        s.d.data.hide().remove();
                    }
                    s.d.container.hide().remove();
                    s.d.overlay.hide();
                    s.d.iframe && s.d.iframe.hide().remove();
                    s.d.overlay.remove();
                    s.d = {};
                    return data;
                }
            }
        };
    }));
jQuery.extend(jQuery.fn.dataTableExt.oSort, {
    "title-numeric-pre": function(a) {
        var x = a.match(/title="*(-?[0-9\.]+)/)[1];
        return parseFloat(x);
    },
    "title-numeric-asc": function(a, b) {
        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
    },
    "title-numeric-desc": function(a, b) {
        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
    }
});
! function(factory) {
    "function" == typeof define && define.amd ? define(["jquery"], factory) : factory("object" == typeof exports ? require("jquery") : jQuery);
}(function($) {
    var caretTimeoutId, ua = navigator.userAgent,
        iPhone = /iphone/i.test(ua),
        chrome = /chrome/i.test(ua),
        android = /android/i.test(ua);
    $.mask = {
        definitions: {
            "9": "[0-9]",
            a: "[A-Za-z]",
            "*": "[A-Za-z0-9]"
        },
        autoclear: !0,
        dataName: "rawMaskFn",
        placeholder: "_"
    }, $.fn.extend({
        caret: function(begin, end) {
            var range;
            if (0 !== this.length && !this.is(":hidden")) return "number" == typeof begin ? (end = "number" == typeof end ? end : begin, this.each(function() {
                this.setSelectionRange ? this.setSelectionRange(begin, end) : this.createTextRange && (range = this.createTextRange(), range.collapse(!0), range.moveEnd("character", end), range.moveStart("character", begin), range.select());
            })) : (this[0].setSelectionRange ? (begin = this[0].selectionStart, end = this[0].selectionEnd) : document.selection && document.selection.createRange && (range = document.selection.createRange(), begin = 0 - range.duplicate().moveStart("character", -1e5), end = begin + range.text.length), {
                begin: begin,
                end: end
            });
        },
        unmask: function() {
            return this.trigger("unmask");
        },
        mask: function(mask, settings) {
            var input, defs, tests, partialPosition, firstNonMaskPos, lastRequiredNonMaskPos, len, oldVal;
            if (!mask && this.length > 0) {
                input = $(this[0]);
                var fn = input.data($.mask.dataName);
                return fn ? fn() : void 0;
            }
            return settings = $.extend({
                autoclear: $.mask.autoclear,
                placeholder: $.mask.placeholder,
                completed: null
            }, settings), defs = $.mask.definitions, tests = [], partialPosition = len = mask.length, firstNonMaskPos = null, $.each(mask.split(""), function(i, c) {
                "?" == c ? (len--, partialPosition = i) : defs[c] ? (tests.push(new RegExp(defs[c])), null === firstNonMaskPos && (firstNonMaskPos = tests.length - 1), partialPosition > i && (lastRequiredNonMaskPos = tests.length - 1)) : tests.push(null);
            }), this.trigger("unmask").each(function() {
                function tryFireCompleted() {
                    if (settings.completed) {
                        for (var i = firstNonMaskPos; lastRequiredNonMaskPos >= i; i++)
                            if (tests[i] && buffer[i] === getPlaceholder(i)) return;
                        settings.completed.call(input);
                    }
                }

                function getPlaceholder(i) {
                    return settings.placeholder.charAt(i < settings.placeholder.length ? i : 0);
                }

                function seekNext(pos) {
                    for (; ++pos < len && !tests[pos];);
                    return pos;
                }

                function seekPrev(pos) {
                    for (; --pos >= 0 && !tests[pos];);
                    return pos;
                }

                function shiftL(begin, end) {
                    var i, j;
                    if (!(0 > begin)) {
                        for (i = begin, j = seekNext(end); len > i; i++)
                            if (tests[i]) {
                                if (!(len > j && tests[i].test(buffer[j]))) break;
                                buffer[i] = buffer[j], buffer[j] = getPlaceholder(j), j = seekNext(j);
                            }
                        writeBuffer(), input.caret(Math.max(firstNonMaskPos, begin));
                    }
                }

                function shiftR(pos) {
                    var i, c, j, t;
                    for (i = pos, c = getPlaceholder(pos); len > i; i++)
                        if (tests[i]) {
                            if (j = seekNext(i), t = buffer[i], buffer[i] = c, !(len > j && tests[j].test(t))) break;
                            c = t;
                        }
                }

                function androidInputEvent() {
                    var curVal = input.val(),
                        pos = input.caret();
                    if (oldVal && oldVal.length && oldVal.length > curVal.length) {
                        for (checkVal(!0); pos.begin > 0 && !tests[pos.begin - 1];) pos.begin--;
                        if (0 === pos.begin)
                            for (; pos.begin < firstNonMaskPos && !tests[pos.begin];) pos.begin++;
                        input.caret(pos.begin, pos.begin);
                    } else {
                        for (checkVal(!0); pos.begin < len && !tests[pos.begin];) pos.begin++;
                        input.caret(pos.begin, pos.begin);
                    }
                    tryFireCompleted();
                }

                function blurEvent() {
                    checkVal(), input.val() != focusText && input.change();
                }

                function keydownEvent(e) {
                    if (!input.prop("readonly")) {
                        var pos, begin, end, k = e.which || e.keyCode;
                        oldVal = input.val(), 8 === k || 46 === k || iPhone && 127 === k ? (pos = input.caret(), begin = pos.begin, end = pos.end, end - begin === 0 && (begin = 46 !== k ? seekPrev(begin) : end = seekNext(begin - 1), end = 46 === k ? seekNext(end) : end), clearBuffer(begin, end), shiftL(begin, end - 1), e.preventDefault()) : 13 === k ? blurEvent.call(this, e) : 27 === k && (input.val(focusText), input.caret(0, checkVal()), e.preventDefault());
                    }
                }

                function keypressEvent(e) {
                    if (!input.prop("readonly")) {
                        var p, c, next, k = e.which || e.keyCode,
                            pos = input.caret();
                        if (!(e.ctrlKey || e.altKey || e.metaKey || 32 > k) && k && 13 !== k) {
                            if (pos.end - pos.begin !== 0 && (clearBuffer(pos.begin, pos.end), shiftL(pos.begin, pos.end - 1)), p = seekNext(pos.begin - 1), len > p && (c = String.fromCharCode(k), tests[p].test(c))) {
                                if (shiftR(p), buffer[p] = c, writeBuffer(), next = seekNext(p), android) {
                                    var proxy = function() {
                                        $.proxy($.fn.caret, input, next)();
                                    };
                                    setTimeout(proxy, 0);
                                } else input.caret(next);
                                pos.begin <= lastRequiredNonMaskPos && tryFireCompleted();
                            }
                            e.preventDefault();
                        }
                    }
                }

                function clearBuffer(start, end) {
                    var i;
                    for (i = start; end > i && len > i; i++) tests[i] && (buffer[i] = getPlaceholder(i));
                }

                function writeBuffer() {
                    input.val(buffer.join(""));
                }

                function checkVal(allow) {
                    var i, c, pos, test = input.val(),
                        lastMatch = -1;
                    for (i = 0, pos = 0; len > i; i++)
                        if (tests[i]) {
                            for (buffer[i] = getPlaceholder(i); pos++ < test.length;)
                                if (c = test.charAt(pos - 1), tests[i].test(c)) {
                                    buffer[i] = c, lastMatch = i;
                                    break;
                                }
                            if (pos > test.length) {
                                clearBuffer(i + 1, len);
                                break;
                            }
                        } else buffer[i] === test.charAt(pos) && pos++, partialPosition > i && (lastMatch = i);
                    return allow ? writeBuffer() : partialPosition > lastMatch + 1 ? settings.autoclear || buffer.join("") === defaultBuffer ? (input.val() && input.val(""), clearBuffer(0, len)) : writeBuffer() : (writeBuffer(), input.val(input.val().substring(0, lastMatch + 1))), partialPosition ? i : firstNonMaskPos;
                }
                var input = $(this),
                    buffer = $.map(mask.split(""), function(c, i) {
                        return "?" != c ? defs[c] ? getPlaceholder(i) : c : void 0;
                    }),
                    defaultBuffer = buffer.join(""),
                    focusText = input.val();
                input.data($.mask.dataName, function() {
                    return $.map(buffer, function(c, i) {
                        return tests[i] && c != getPlaceholder(i) ? c : null;
                    }).join("");
                }), input.one("unmask", function() {
                    input.off(".mask").removeData($.mask.dataName);
                }).on("focus.mask", function() {
                    if (!input.prop("readonly")) {
                        clearTimeout(caretTimeoutId);
                        var pos;
                        focusText = input.val(), pos = checkVal(), caretTimeoutId = setTimeout(function() {
                            input.get(0) === document.activeElement && (writeBuffer(), pos == mask.replace("?", "").length ? input.caret(0, pos) : input.caret(pos));
                        }, 10);
                    }
                }).on("blur.mask", blurEvent).on("keydown.mask", keydownEvent).on("keypress.mask", keypressEvent).on("input.mask paste.mask", function() {
                    input.prop("readonly") || setTimeout(function() {
                        var pos = checkVal(!0);
                        input.caret(pos), tryFireCompleted();
                    }, 0);
                }), chrome && android && input.off("input.mask").on("input.mask", androidInputEvent), checkVal();
            });
        }
    });
});
var notificationTemplate = $("#notificationTemplate").html();

function initializeWebsocket() {
    notificationHub.client.SendNotification = function(notification) {
        sendNotification(notification.Header, notification.Notification, notification.Type);
    };
    notificationHub.client.SendDataNotification = function(notification) {
        $(document).trigger(notification.Event, notification);
        $(document).trigger(notification.Event + "Global", notification);
    };
    $.connection.hub.start({
        transport: ['webSockets']
    });
}

function sendNotification(header, message, type) {
    console.log(header, message, type);
    var html = Mustache.render(notificationTemplate, {
        header: header,
        message: message,
        type: notificationTypeToText(type),
        icon: notificationTypeToIcon(type)
    });
    $.jGrowl(html, {
        position: "bottom-right"
    });
}

function notificationTypeToIcon(type) {
    if (type === 1) {
        return "fa-exclamation-triangle";
    } else if (type === 2) {
        return "fa-times";
    } else if (type === 3) {
        return "fa-check-circle-o";
    }
    return "fa-info-circle";
}

function notificationTypeToText(type) {
    if (type === 1) {
        return "warning";
    } else if (type === 2) {
        return "error";
    } else if (type === 3) {
        return "success";
    }
    return "info";
}

function cancelOrder(tradeId, tradePairId) {
    var data = {
        tradeId: tradeId,
        tradePairId: tradePairId
    };
    $.blockUI({
        message: Resources.Layout.BlockCancelOrderMessage
    });
    getJson('/Exchange/CancelTrade', data, orderCanceled);
}

function cancelAllOrders() {
    confirm(Resources.Layout.ConfirmCancelAllOrdersTitle, Resources.Layout.confirmCancelAllOrdersMessage, function() {
        $.blockUI({
            message: Resources.Layout.BlockCancelAllOrdersMessage
        });
        var data = {};
        getJson('/Exchange/CancelAllTrades', data, allordersCanceled);
    });
}

function cancelTradePairOrders(tradePairId) {
    confirm(Resources.Layout.ConfirmCancelTradePairTitle, Resources.Layout.ConfirmCancelTradePairTitleMessage, function() {
        $.blockUI({
            message: Resources.Layout.BlockCancelTradePairMessage
        });
        var data = {
            tradePairId: tradePairId
        };
        getJson('/Exchange/CancelTradePairTrades', data, allordersCanceled);
    });
}

function orderCanceled(response) {
    $.unblockUI();
}

function allordersCanceled(response) {
    $.unblockUI();
}

function htmlEncode(val) {
    return $('<div/>').text(val).html();
}

function scrollToAnchor(aid) {
    var aTag = $("a[name='" + aid + "']");
    if (aTag && aTag.offset()) {
        $('html, body').animate({
            scrollTop: aTag.offset().top
        }, 'fast');
    }
}
$("#theme-switch").on("click", function() {
    var url = $(this).data("action");
    postJson(url, {}, function(data) {
        if (data.Success) {
            changeTheme(data.Message);
        }
    });
});

function changeTheme(theme) {
    if (theme == 'Dark') {
        $("#theme-switch").attr('title', Resources.Layout.ThemeLight);
        $("#theme-switch i").removeClass('icon-moon-night').addClass('icon-lightbulb-idea');
        $('link[title="siteTheme"]').attr({
            href: "/Content/theme.Dark.css"
        });
    } else if (theme == 'Light') {
        $("#theme-switch").attr('title', Resources.Layout.ThemeDark);
        $("#theme-switch i").removeClass('icon-lightbulb-idea').addClass('icon-moon-night');
        $('link[title="siteTheme"]').attr({
            href: "/Content/theme.Light.css"
        });
    }
}
(function($) {
    $.caretTo = function(el, index) {
        if (el.createTextRange) {
            var range = el.createTextRange();
            range.move("character", index);
            range.select();
        } else if (el.selectionStart != null) {
            el.focus();
            el.setSelectionRange(index, index);
        }
    };
    $.fn.caretTo = function(index, offset) {
        return this.queue(function(next) {
            if (isNaN(index)) {
                var i = $(this).val().indexOf(index);
                if (offset === true) {
                    i += index.length;
                } else if (offset) {
                    i += offset;
                }
                $.caretTo(this, i);
            } else {
                $.caretTo(this, index);
            }
            next();
        });
    };
    $.fn.caretToStart = function() {
        return this.caretTo(0);
    };
    $.fn.caretToEnd = function() {
        return this.queue(function(next) {
            $.caretTo(this, $(this).val().length);
            next();
        });
    };
}(jQuery));
(function($) {
    $.fn.equalHeight = function() {
        var heights = [];
        $.each(this, function(i, element) {
            $element = $(element);
            var element_height;
            var includePadding = ($element.css('box-sizing') == 'border-box') || ($element.css('-moz-box-sizing') == 'border-box');
            if (includePadding) {
                element_height = $element.innerHeight();
            } else {
                element_height = $element.height();
            }
            heights.push(element_height);
        });
        this.css('height', Math.max.apply(window, heights) + 'px');
        return this;
    };
    $.fn.equalHeightGrid = function(columns) {
        var $tiles = this;
        $tiles.css('height', 'auto');
        for (var i = 0; i < $tiles.length; i++) {
            if (i % columns === 0) {
                var row = $($tiles[i]);
                for (var n = 1; n < columns; n++) {
                    row = row.add($tiles[i + n]);
                }
                row.equalHeight();
            }
        }
        return this;
    };
    $.fn.detectGridColumns = function() {
        var offset = 0,
            cols = 0;
        this.each(function(i, elem) {
            var elem_offset = $(elem).offset().top;
            if (offset === 0 || elem_offset === offset) {
                cols++;
                offset = elem_offset;
            } else {
                return false;
            }
        });
        return cols;
    };
    $.fn.responsiveEqualHeightGrid = function() {
        var _this = this;

        function syncHeights() {
            var cols = _this.detectGridColumns();
            _this.equalHeightGrid(cols);
        }
        $(window).bind('resize load', syncHeights);
        syncHeights();
        return this;
    };
})(jQuery);
if (!String.linkify) {
    String.prototype.linkify = function() {
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;
        if (this.match(/bitcointalk.org/g)) {
            return '<a rel="noopener noreferrer" target="_blank" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">' + Resources.Layout.LinkifyForbiddenLink + '</a>';
        }
        return this.replace(urlPattern, '<a rel="noopener noreferrer" target="_blank" href="$&">$&</a>').replace(pseudoUrlPattern, '$1<a rel="noopener noreferrer" target="_blank" href="http://$2">$2</a>').replace(emailAddressPattern, '<a rel="noopener noreferrer" target="_blank" href="mailto:$&">$&</a>');
    };
}
String.format = function() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
};

function getStarRating(ratingValue) {
    var rating = "";
    if (ratingValue === "" || ratingValue == -1) {
        for (i = 0; i < 5; i++) {
            rating += '<i title="' + Resources.Layout.RatingUnrated + '" class="fa fa-star-o"></i>';
        }
        return rating;
    }
    if (ratingValue == 0) {
        for (i = 0; i < 5; i++) {
            rating += '<i title="0/5" class="fa fa-star-o text-danger"></i>';
        }
        return rating;
    }
    for (i = 0; i < 5; i++) {
        var title = Resources.Layout.RatingRated + ' ' + ratingValue + '/5';
        if (i < ratingValue) {
            if (ratingValue % 1 != 0 && ratingValue - 0.5 == i) {
                if (ratingValue >= 5) {
                    rating += '<i title="' + title + '" class="fa fa-star-half-o text-warning"></i>';
                } else if (ratingValue > 2) {
                    rating += '<i title="' + title + '" class="fa fa-star-half-o text-success"></i>';
                } else {
                    rating += '<i title="' + title + '" class="fa fa-star-half-o text-danger"></i>';
                }
            } else {
                if (ratingValue >= 5) {
                    rating += '<i title="' + title + '" class="fa fa-star text-warning"></i>';
                } else if (ratingValue > 2) {
                    rating += '<i title="' + title + '" class="fa fa-star text-success"></i>';
                } else {
                    rating += '<i title="' + title + '" class="fa fa-star text-danger"></i>';
                }
            }
        } else {
            rating += '<i title="' + title + '" class="fa fa-star-o"></i>';
        }
    }
    return rating;
}

function showMessage(data) {
    if (data && !data.Cancel) {
        var message = data.Message || (Resources.Layout.ErrorContactSupportText + ' <a href="/UserSupport">' + Resources.Layout.ErrorContactSupportLink + '.</a>');
        var alert = $("#message-alert");
        alert.show();
        alert.addClass(data.Success ? "alert-success" : "alert-danger");
        alert.find("p").html(message);
        alert.fadeTo(5000, 500).slideUp(500, function() {
            alert.find("p").html("");
            alert.removeClass("alert-danger alert-success").hide();
        });
    }
}
setInterval(function() {
    $(".servertime-label").text(moment.utc().format("D/MM/YYYY h:mm:ss A"))
}, 1000);

function toLocalTime(time) {
    return moment.utc(time).local().format("D/MM/YYYY h:mm:ss A")
}

function toLocalDate(date) {
    return moment.utc(date).local().format("D/MM/YYYY")
}
$(function() {
    $("body").tooltip({
        selector: '[data-toggle=tooltip]'
    });
    $("body").popover({
        selector: '[data-toggle=popover]'
    });
    $('#notification-menu').on('mouseenter', function() {
        getData('/UserNotification/GetNotificationMenu', {}, function(data) {
            var notifications = $("#notification-menu-notifications");
            notifications.empty();
            if (data && data.length === 0) {
                notifications.append("<div style='text-align:center;font-size:11px'><i>" + Resources.Layout.MenuNoNotification + "</i></div>");
                return;
            }
            for (var i in data) {
                notifications.append("<div style='font-size:11px'>" + moment.utc(data[i].Timestamp).local().fromNow() + ": " + data[i].Title + " - " + data[i].Notification + "</div>")
            }
        });
    });
    $('#notification-menu-clear').on('click', function() {
        getJson('/UserNotification/Clear', {}, function(data) {
            $('.notification-menu-count').html('');
            $("#notification-menu-notifications").empty();
        });
    });
    if (authenticated == 'True') {
        updateMessageCount();
    }
});

function updateMessageCount() {
    getData('/UserNotification/GetNotificationCount', {}, function(data) {
        $('.notification-menu-message-count').html(data.MessageCount == 0 ? "" : data.MessageCount > 1000 ? "999+" : data.MessageCount);
        $('.notification-menu-count').html(data.NotificationCount == 0 ? "" : data.NotificationCount > 1000 ? "999+" : data.NotificationCount);
    });
}

function setSelectedNavOption(title) {
    if (title) {
        $('#nav-header').removeClass('active');
        $('.nav-' + title.toLowerCase()).addClass('active');
    }
}

function printObj(object) {
    var simpleObject = {};
    for (var prop in object) {
        if (!object.hasOwnProperty(prop)) {
            continue;
        }
        if (typeof(object[prop]) == 'object') {
            continue;
        }
        if (typeof(object[prop]) == 'function') {
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject);
};
var datatableExportLayout = "<'row'<'col-sm-6'><'col-sm-6'f>><'row'<'col-sm-12'tr>><'datatable-length-row'l> <'datatable-export-row'B><'datatable-page-row'p><'clearfix'><'datatable-info-row'i>";

function datatableExportButtons(filename) {
    return [{
        extend: 'csvHtml5',
        text: '<span data-toggle="tooltip" data-container="body" title="' + Resources.Layout.ExportCsvButton + '" class="fa fa-file-text-o"></span>',
        filename: filename.replace(" ", "_")
    }, {
        extend: 'excelHtml5',
        text: '<span data-toggle="tooltip" data-container="body" title="' + Resources.Layout.ExportExcelButton + '" class="fa fa-file-excel-o"></span>',
        filename: filename.replace(" ", "_")
    }, {
        extend: 'pdfHtml5',
        text: '<span data-toggle="tooltip" data-container="body" title="' + Resources.Layout.ExportPdfButton + '" class="fa fa-file-pdf-o"></span>',
        filename: filename.replace(" ", "_"),
        title: 'Cryptopia ' + filename
    }, {
        extend: 'copy',
        text: '<span data-toggle="tooltip" data-container="body" title="' + Resources.Layout.ExportClipboardButton + '" class="fa fa-files-o"></span>',
    }, {
        extend: 'print',
        text: '<span data-toggle="tooltip" data-container="body" title="' + Resources.Layout.ExportPrintButton + '" class="fa fa-print"></span>',
        title: 'Cryptopia ' + filename
    }]
};

function triggerWindowResize() {
    if (typeof(Event) === 'function') {
        window.dispatchEvent(new Event('resize'));
    } else {
        var evt = window.document.createEvent('UIEvents');
        evt.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(evt);
    }
}
var store = new Storage();

function Storage(authenticated) {
    this.get = function(name) {
        return JSON.parse(window.localStorage.getItem(name));
    };
    this.set = function(name, value) {
        window.localStorage.setItem(name, JSON.stringify(value));
    };
    this.clear = function() {
        window.localStorage.clear();
    };
}

function changeHighlight(change) {
    return change > 0 ? "text-success" : change < 0 ? "text-danger" : "";
}

function highlightRow(element, highlight) {
    if (element.hasClass("greenhighlight") || element.hasClass("redhighlight") || element.hasClass("bluehighlight")) {
        element.removeClass("greenhighlight redhighlight bluehighlight").addClass(highlight + "highlight2");
    } else {
        element.removeClass("greenhighlight2 redhighlight2 bluehighlight2").addClass(highlight + "highlight")
    }
}

function highlightRowText(element, highlight) {
    if (element.hasClass("greenhighlighttext") || element.hasClass("redhighlighttext") || element.hasClass("bluehighlighttext")) {
        element.removeClass("greenhighlighttext redhighlighttext bluehighlighttext").addClass(highlight + "highlighttext2");
    } else {
        element.removeClass("greenhighlighttext2 redhighlighttext2 bluehighlighttext2").addClass(highlight + "highlighttext")
    }
}

function highlightItem(element, highlight) {
    if (element.hasClass("info")) {
        highlightRowText(element, highlight);
    } else {
        highlightRow(element, highlight);
    }
}

function highlightRemove(selector) {
    $(selector).removeClass("greenhighlighttext2 redhighlighttext2 bluehighlighttext2 greenhighlighttext redhighlighttext bluehighlighttext greenhighlight redhighlight bluehighlight greenhighlight2 redhighlight2 bluehighlight2");
}