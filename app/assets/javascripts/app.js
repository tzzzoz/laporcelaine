/**
 * Modify only if you know what you're doing.
 *
 * Dependencies:
 *  - jQuery
 *  - Modernizr
 *  - Page.js
 *
 *  Author: Vagebond
 */

(function ($) {

    $('document').ready(function () {

        /* use strict */
        'use strict';

        /* init the app */
        App.init();

        /* Throttle resizehandler (better performance) */
        var throttle;

        $(window).on('resize', function () {
            clearTimeout(throttle);

            throttle = setTimeout(function () {
                App.resizeHandler();
            }, 100);
        });
    });

    var App = {

        transition: null,
        touch: false,
        video: null,
        slideShow: null,
        slideShowImages: [],
        slideShowIndex: 0,
        modal: null,
        videoInstance: null,
        cart: null,

        init: function () {
            /* Strict mode */
            'use strict';

            /* History fallback for < ie10 */
            if (! App.isTransitionSupported()) {
                var location = window.history.location || window.location;
            }

            /* Get video url */
            var video = $('body').data('video');

            if (typeof video != 'undefined') {
                App.video = video.toString();
            }

            /* Check for touch support */
            App.touch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

            /* Initialize the background player */
            this.background();

            /* Initialize Cart */
            this.cart = Cart.init();

            if (this.isAjaxOn()) {
                $('body').addClass('is-ajax');
                $('main').removeClass('hide');
                this.hideSplash();
                this.setupRouter();
            } else {
                $('body').addClass('is-static');
                this.activatePage();
            }
        },

        hideSplash: function() {
            var _this = this;
            $('.line', '#splash').on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {
                $('#splash').addClass('slide-to-top-out');
            });
        },

        setupRouter: function () {
            page('*', this.displayPage);
            page();
        },

        displayPage: function (ctx, next) {
            $.ajax({
                type: 'GET',
                url: ctx.path,
                cache: true,

                success: function (result) {
                    var body               = $(result);
                    var previous           = $('main', '#wrapper');
                    var main               = body.find('main');
                    var previousTransition = previous.data('transition');
                    var wrapper            = $('#wrapper');

                    if (ctx.init) {
                        App.activatePage();
                        next();

                    } else {
                        if (App.isTransitionSupported()) {
                            if (typeof previousTransition != 'undefined') {
                                previous.removeClass(previousTransition + ' ' + previousTransition + '-in ' + previousTransition + '-out');
                            }

                            main.addClass(App.transition + ' ' + App.transition + '-in');

                            if (!App.touch) {
                                // hide scrollbar on desktop
                                main.css({
                                    'overflow': 'hidden'
                                });

                                // Hide nav scrollbars on desktop
                                var strokes = main.find('.strokes');
                                if (strokes.length > 0) {
                                    strokes.css({
                                        'overflow': 'hidden'
                                    });
                                }
                            }

                            wrapper.prepend(main);

                            setTimeout(function () {
                                previous.addClass(App.transition + ' ' + App.transition + '-out');

                                if (!App.touch) {
                                    previous.css({
                                        'overflow': 'hidden'
                                    });
                                }
                                
                                main.removeClass('hide ' + App.transition + '-in');
                            }, 100);

                            main.data('transition', App.transition);
                            var transitionCompleted = false;

                            main.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function () {
                                transitionCompleted = true;
                                transitionComplete();
                            });

                            setTimeout(function () {

                                // fallback if transitionEnd
                                if (transitionCompleted == false) {
                                    transitionComplete();
                                }
                            }, 2000);

                        } else {
                            wrapper.prepend(main);
                            previous.remove();
                            main.unbind();
                            App.activatePage();
                        }

                        function transitionComplete() {
                            previous.remove();
                            App.activatePage();
                            main
                                .css({'overflow-y': 'scroll'})
                                .unbind()
                                .removeClass(App.transition);
                            next();
                        }
                    }
                },
                error: function (data) {
                    if (data.status == 404) {
                        // Handle 404
                        App.activatePage();
                    }
                }
            });
        },

        animatePage: function () {
            var main        = $('main', '#wrapper');
            var fade        = $('#page-switch-fade');
            var loader      = $('#page-switch-loader');

            // Extend the load period the first time the page loads
            var isFrontpage = main
                .find('header')
                .hasClass('frontpage');

            var timeout     = 300;
            var firstTime   = $.isEmptyObject($.query.get());

            if (isFrontpage && firstTime) {
                timeout = 1500;
            }

            if (App.isTransitionSupported()) {
                App.transition = $.query.get('transition');
                App.transition = typeof App.transition == "undefined" ? 'transition' : App.transition;
                main.addClass('notransition ' + App.transition + ' ' + App.transition + '-in');

                setTimeout(function () {
                    main
                        .removeClass('hide notransition ' + App.transition + '-in');

                    fade
                        .removeClass('fade-in')
                        .addClass('fade-out');

                    loader
                        .removeClass('fade-in')
                        .addClass('fade-out');

                    setTimeout(function(){
                        main.removeClass(App.transition);
                    }, 2500);

                }, timeout);
            } else {
                main.removeClass('hide');
                fade.hide();
                loader.hide()
            }
        },

        activatePage: function () {
            /* Trigger event to tell the page has been activated */
            setTimeout(function() {
                $('body').trigger('pageActivated');
            }, 300);

            /* Check if device is a desktop device */
            if (App.isDesktop()) {
                if ($('#navigation').length > 0) {
                    new Slidenavigation($('#navigation'));
                    if (App.touch) {
                        // Show scroll on touch laptops
                        $('.strokes', '#wrapper').css('overflow-x', 'scroll');
                    }
                }
            }

            /* Back to top button */
            if ($('#back-to-top').length > 0) {
                setTimeout(function () {
                    $('main').on('scroll', function () {
                        var scroll = $('main').scrollTop();
                        if (scroll > 50) {
                            $('#back-to-top').addClass('visible');
                        } else {
                            $('#back-to-top').removeClass('visible');
                        }
                    });
                }, 100);
            }

            $('#back-to-top').on('click', function (e) {
                e.preventDefault();
                e.preventDefault();
                $('main').animate({scrollTop: 0}, 250);
                return false;
            });

            if ($('form', '#wrapper').length > 0) {
                // Only initialize forms when present
                App.initForms();
            }

            if ($('.grid', '#wrapper').length > 0) {
                var grid = $('.grid').masonry({
                    itemSelector : '.item',
                    columnWidth: '.sizer',
                    percentPosition: true,
                });

                grid.imagesLoaded()
                    .progress( function( instance, image) {
                        grid.masonry('layout');
                    })
                    .always( function() {
                        $('.grid', '#wrapper')
                            .removeClass('hidden');
                    });
            }

            if ($("#price-list").length > 0) {
              App.initPriceList();
              this.cart.handleAddToCart();
            }

            /* Transition action */
            $('a', '#wrapper').on('click', function (e) {
                var $el = $(this);

                /* Check if gallery-item */
                if ($el.hasClass('gallery-item') || $el.hasClass('masonry-item')) {
                    e.preventDefault();
                    App.initPhotoswipe($el);
                    return;
                }

                /* Check if back to top */
                if ($el.is('#back-to-top')) {
                    return;
                }

                /* Check if modal */
                if ($el.hasClass('activate-modal')) {
                    e.preventDefault();
                    App.initModal($el);
                    return;
                }

                if (App.isAjaxOn()) {
                    if (App.isTransitionSupported()) {
                        var t = $el.data('transition');

                        if (typeof t != 'undefined') {
                            App.transition = t;
                        } else {
                            App.transition = 'transition';
                        }
                    } else {
                        e.preventDefault();
                        var link = $el.attr('href');
                        page.show(link);
                    }
                } else if (App.isTransitionSupported()) {
                    e.preventDefault();

                    var link                = $el.attr('href');
                    var fade                = $('#page-switch-fade');
                    var loader              = $('#page-switch-loader');
                    var transition          = typeof $el.data('transition') != "undefined" ? $el.data('transition') : 'transition';
                    var main                = $('main', '#wrapper');
                    var animationFinsihed   = false;

                    main.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function (e) {
                        if (animationFinsihed) {
                            return ;
                        }

                        animationFinsihed   = true;
                        link                += link.indexOf('?') != -1 ? '&' : '?';
                        link                += 'transition=' + transition;

                        if (App.video && App.isDesktop()) {
                            var progress = App.videoInstance.getProgress();
                            link += '&background=' + progress;
                        } else {
                            link += '&background=' + App.slideShow.getProgress();
                        }
                        fired = true;

                        setTimeout(function() {
                            window.location = link;
                        }, 300);
                    });

                    main.removeClass('notransition hide ' + App.transition);
                    main.addClass(transition + ' ' + transition + '-out');
                    fade.removeClass('fade-out');

                    setTimeout(function () {
                        loader.removeClass('fade-out');
                    }, 200);
                }
            });
        },

        initForms: function () {
            $('.ambiance-html-form', '#wrapper').submit(function (e) {
                e.preventDefault();

                var $form  = $(this);
                var data   = $form.serialize();
                var method = $form.attr('method');
                var action = $form.attr('action');

                $.ajax({
                    'url': action,
                    'method': method,
                    'data': data,
                    'cache': false,
                    'dataType': 'json',
                    'success': function (e) {
                        $form.find('.message').html(e.message);
                        if (e.success == true) {
                            $form.find('input[type=text], input[type=email], textarea').val('');
                            App.initModal();
                        }
                    }
                });
            });
        },

        initModal: function () {
            /* Disable hashtracking for the modals */
            App.modal = $('[data-remodal-id=modal]').remodal({
                'hashTracking': false
            });

            App.modal.open();
        },

        initPhotoswipe: function ($el) {
            var galleryItems = [];
            var itemIndex    = 0;

            $('.gallery-item, .masonry-item').each(function (index) {
                var $item = $(this);
                var url   = $item.attr('href');

                if (url.length) {
                    var w = parseInt($(this).find('img').get(0).naturalWidth, 10);
                    var h = parseInt($(this).find('img').get(0).naturalHeight, 10);

                    if (1 > 0) {
                        galleryItems.push({
                            'src': url,
                            'w': w,
                            'h': h,
                        });

                        if ($item.is($el)) {
                            itemIndex = index;
                        }
                    }
                }
            });

            if (galleryItems.length > 0) {
                var options = {
                    index: itemIndex,
                    bgOpacity: 1,
                    history: false
                };

                var pswpElement = $('.pswp').get(0);
                var gallery     = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, galleryItems, options);

                gallery.init();
            }
        },
        initPriceList: function () {
            var $priceList = $("#price-list");
            $priceList.find("li").each(function(index) {
              var $item = $(this);
              if (index == 0) {
                $item.find(".collapse").addClass("in");
              }
              $item.find(".top .title").on("click", function() {
                $item.find(".collapse").collapse("toggle");
              })
            });
        },

        background: function () {
            var backgroundPosition = $.query.get('background');
            backgroundPosition     = typeof backgroundPosition == 'undefined' ? 0 : backgroundPosition;

            if (App.video && device.desktop()) {
                App.videoInstance = $('main', '#wrapper').backgroundvideo(
                    {
                        'videoId': App.video,
                        'start': backgroundPosition,
                        'callback': App.animatePage
                    }
                );
            } else {
                this.slideShow = VagebondSlideshow.init(App.animatePage, backgroundPosition);
            }
        },
        resizeHandler: function () {
            var $window    = $(window),
                navigation = $('#navigation');

            /* On resizing reset or set the navigation */
            if (navigation.length > 0 && $window.width() < 950) {
                navigation.css({'left': '0'});
                navigation.unbind('mousemove');

            } else {
                new Slidenavigation(navigation);
                if (App.touch) {
                    // Show scroll on touch laptops
                    $('.strokes', '#wrapper').css('overflow-x', 'scroll');
                }
            }

            /* Fix resize issue browserbar with position fixed for touch devices (ios) */
            if (App.touch) {
                var timeout,
                    activeBackground = $('#slideShow > .visible');

                $window.on('resize', function () {
                    /* Ios background scroll fix */
                    if (timeout) {
                        clearTimeout(timeout);
                    }

                    timeout = setTimeout(function () {
                        activeBackground.height($window.height() + 60);
                    }, 100);
                });
            }
        },
        isAjaxOn: function () {
            return typeof railsVars != 'undefined' && railsVars.ajaxOn == true;
        },
        isTransitionSupported: function () {
            return VagebondUtils.detectCssFeature('transition');
        },
        isDesktop: function() {
            return device.desktop();
        },
    }
}(jQuery));
