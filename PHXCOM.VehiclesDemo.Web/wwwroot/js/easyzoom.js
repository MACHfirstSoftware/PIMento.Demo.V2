
(function (root, factory) { 'use strict'; if (typeof define === 'function' && define.amd) { define(['jquery'], function ($) { factory($); }); } else if (typeof module === 'object' && module.exports) { module.exports = (root.EasyZoom = factory(require('jquery'))); } else { root.EasyZoom = factory(root.jQuery); } }(this, function ($) {
    'use strict'; var dw, dh, rw, rh, lx, ly; var defaults = { loadingNotice: 'Loading image', errorNotice: 'The image could not be loaded', errorDuration: 2500, linkAttribute: 'href', preventClicks: true, beforeShow: $.noop, beforeHide: $.noop, onShow: $.noop, onHide: $.noop, onMove: $.noop }; function EasyZoom(target, options) { this.$target = $(target); this.opts = $.extend({}, defaults, options, this.$target.data()); this.isOpen === undefined && this._init(); }
    EasyZoom.prototype._init = function () { this.$link = this.$target.find('a'); this.$image = this.$target.find('img'); this.$flyout = $('<div class="easyzoom-flyout" />'); this.$notice = $('<div class="easyzoom-notice" />'); this.$target.on({ 'mousemove.easyzoom touchmove.easyzoom': $.proxy(this._onMove, this), 'mouseleave.easyzoom touchend.easyzoom': $.proxy(this._onLeave, this), 'mouseenter.easyzoom touchstart.easyzoom': $.proxy(this._onEnter, this) }); this.opts.preventClicks && this.$target.on('click.easyzoom', function (e) { e.preventDefault(); }); }; EasyZoom.prototype.show = function (e, testMouseOver) {
        var w1, h1, w2, h2; var self = this; if (this.opts.beforeShow.call(this) === false) return; if (!this.isReady) { return this._loadImage(this.$link.attr(this.opts.linkAttribute), function () { if (self.isMouseOver || !testMouseOver) { self.show(e); } }); }
        this.$target.append(this.$flyout); w1 = this.$target.width(); h1 = this.$target.height(); w2 = this.$flyout.width(); h2 = this.$flyout.height(); dw = this.$zoom.width() - w2; dh = this.$zoom.height() - h2; if (dw < 0) dw = 0; if (dh < 0) dh = 0; rw = dw / w1; rh = dh / h1; this.isOpen = true; this.opts.onShow.call(this); e && this._move(e);
    }; EasyZoom.prototype._onEnter = function (e) { var touches = e.originalEvent.touches; this.isMouseOver = true; if (!touches || touches.length == 1) { e.preventDefault(); this.show(e, true); } }; EasyZoom.prototype._onMove = function (e) { if (!this.isOpen) return; e.preventDefault(); this._move(e); }; EasyZoom.prototype._onLeave = function () { this.isMouseOver = false; this.isOpen && this.hide(); }; EasyZoom.prototype._onLoad = function (e) { if (!e.currentTarget.width) return; this.isReady = true; this.$notice.detach(); this.$flyout.html(this.$zoom); this.$target.removeClass('is-loading').addClass('is-ready'); e.data.call && e.data(); }; EasyZoom.prototype._onError = function () { var self = this; this.$notice.text(this.opts.errorNotice); this.$target.removeClass('is-loading').addClass('is-error'); this.detachNotice = setTimeout(function () { self.$notice.detach(); self.detachNotice = null; }, this.opts.errorDuration); }; EasyZoom.prototype._loadImage = function (href, callback) { var zoom = new Image; this.$target.addClass('is-loading').append(this.$notice.text(this.opts.loadingNotice)); this.$zoom = $(zoom).on('error', $.proxy(this._onError, this)).on('load', callback, $.proxy(this._onLoad, this)); zoom.style.position = 'absolute'; zoom.src = href; }; EasyZoom.prototype._move = function (e) {
        if (e.type.indexOf('touch') === 0) { var touchlist = e.touches || e.originalEvent.touches; lx = touchlist[0].pageX; ly = touchlist[0].pageY; } else { lx = e.pageX || lx; ly = e.pageY || ly; }
        var offset = this.$target.offset(); var pt = ly - offset.top; var pl = lx - offset.left; var xt = Math.ceil(pt * rh); var xl = Math.ceil(pl * rw); if (xl < 0 || xt < 0 || xl > dw || xt > dh) { this.hide(); } else { var top = xt * -1; var left = xl * -1; this.$zoom.css({ top: top, left: left }); this.opts.onMove.call(this, top, left); }
    }; EasyZoom.prototype.hide = function () { if (!this.isOpen) return; if (this.opts.beforeHide.call(this) === false) return; this.$flyout.detach(); this.isOpen = false; this.opts.onHide.call(this); }; EasyZoom.prototype.swap = function (standardSrc, zoomHref, srcset) { this.hide(); this.isReady = false; this.detachNotice && clearTimeout(this.detachNotice); this.$notice.parent().length && this.$notice.detach(); this.$target.removeClass('is-loading is-ready is-error'); this.$image.attr({ src: standardSrc, srcset: $.isArray(srcset) ? srcset.join() : srcset }); this.$link.attr(this.opts.linkAttribute, zoomHref); }; EasyZoom.prototype.teardown = function () { this.hide(); this.$target.off('.easyzoom').removeClass('is-loading is-ready is-error'); this.detachNotice && clearTimeout(this.detachNotice); delete this.$link; delete this.$zoom; delete this.$image; delete this.$notice; delete this.$flyout; delete this.isOpen; delete this.isReady; }; $.fn.easyZoom = function (options) { return this.each(function () { var api = $.data(this, 'easyZoom'); if (!api) { $.data(this, 'easyZoom', new EasyZoom(this, options)); } else if (api.isOpen === undefined) { api._init(); } }); };
}));



$(document).ready(function () {
    var $easyzoom = $('.easyzoom').easyZoom(); initializeYoutube();
    $('.preview-thumbnail li').on('click', 'a', function (e) {
        var api1 = $easyzoom.filter('.easyzoom--with-thumbnails').data('easyZoom');
        var $this = $(this); if ($(this).attr("video-src") == "true") initializeYoutube();
        else $(".youtube").html(' <div class="play-button"></div>'); e.preventDefault();
    });
    var api2 = $easyzoom.filter('.easyzoom--with-toggle').data('easyZoom'); $('.toggle').on('click', function () {
        var $this = $(this); if ($this.data("active") === true) {
            $this.text("Switch on").data("active", false); api2.teardown();
        } else {
            $this.text("Switch off").data("active", true); api2._init();
        }
    });
}); function initializeYoutube() {
    var youtube = document.querySelectorAll(".youtube");
    for (var i = 0; i < youtube.length; i++) {
        var source = "https://img.youtube.com/vi/" + youtube[i].dataset.embed + "/sddefault.jpg"; var image = new Image();
        image.src = source; image.addEventListener("load", function () {
            youtube[i].appendChild(image);
        }(i));
        youtube[i].addEventListener("click", function () {
            var iframe = document.createElement("iframe");
            iframe.setAttribute("frameborder", "0"); iframe.setAttribute("allowfullscreen", "");
            iframe.setAttribute("src", "https://www.youtube.com/embed/" + this.dataset.embed + "?rel=0&showinfo=0&autoplay=1");
            this.innerHTML = ""; this.appendChild(iframe);
        });
    };
}