var VagebondSlideshow = {
    slideShow: null,
    slideShowImages: [],
    slideShowIndex: 0,
    container: null,
    readyEventDispatched: false,
    callBackFunction: null,

    getProgress: function() {
        return this.slideShowIndex;
    },

    init: function (callBackFunction, slideShowIndex) {
        this.container = $('#slideshow');
        this.callBackFunction = callBackFunction;
        this.slideShowIndex = slideShowIndex;

        if (this.container.length > 0) {
            var items = this.container.find('li');

            if (items.length == 0) {
                callBackFunction();
            }

            for (var i = 0; i < items.length; i++) {
                var item  = $(items[i]);
                var image = item.find('img').attr('src');
                this.slideShowImages.push(image);
                /* Add image to item */
                item.css({
                    'background-image': 'url(' + image + ')',
                    'display': 'none'
                });
            }
        }

        if (this.slideShowImages.length > 1) {
            this.showSlide();
        } else {
            var next = this.container.find('li:eq(0)');

            if (next != null) {
                next.css({
                    'display': 'block',
                    'opacity': 1
                });
            }
        }

        return VagebondSlideshow;
    },
    showSlide: function () {
        var _this             = VagebondSlideshow;
        var next              = _this.container.find('li:eq(' + _this.slideShowIndex + ')');
        var supportsAnimation = VagebondUtils.detectCssFeature('animation');

        if (_this.readyEventDispatched == false) {
            _this.readyEventDispatched = true;
            _this.callBackFunction();
        }

        _this.container
            .children()
            .css('z-index', 0);

        next.css({'z-index': 1, 'display': 'block'});

        if (supportsAnimation) {
            next.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (e) {
                next.unbind();
                next.removeClass('visible');
            });

            next.addClass('visible');
            setTimeout(_this.showSlide, 7000);

        } else {

            next.fadeTo(1000, 1);
            setTimeout(_this.showSlide, 6000);
            setTimeout(function () {
                next.css('opacity', 0)
            }, 7000);
        }

        if (_this.slideShowIndex == _this.slideShowImages.length - 1) {
            _this.slideShowIndex = 0;
        } else {
            _this.slideShowIndex ++;
        }
    },
}