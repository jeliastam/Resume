app.controller('nav', function () {

    var $nav     = $('#nav');
    var $overlay = $nav.find('.overlay');
    var $show    = $('button.show-nav');
    var $hide    = $('button.hide-nav');

    $(document).ready(function () {
        $show.click(   function () { toggleNav(); });
        $hide.click(   function () { toggleNav(); });
        $overlay.click(function () { toggleNav(); });
    });

    function toggleNav() {
        if ($nav.hasClass('show')) {
            $nav.removeClass('show');
        } else {
            $nav.addClass('show');
        }
    }
});

app.controller('details', function ($scope, $routeParams) {

    $scope.pid = $routeParams.id;
    $scope.videoPlayer = null;
    $scope.product = {
        images:      {},
        details:     {},
        swatches:    {},
        topFeatures: {}
    };

    $(document).ready(function () {
        getProductData();
        $(window).resize(function () {
            resizeStage();
        });
        $('#email_me').on('click', function() {
            $('#errormessage').html('');
            $.ajax({
                url: '/api.php',
                dataType: 'jsonp',
                data: {
                    type: 'email',
                    email: $('#email').val(),
                    pid: $scope.product.details.product_id,
                    subscribe: $('#reg_newsletter').is(':checked') ? 1 : 0
                }})
                .done(function (response) {
                    response = JSON.parse(response);
                    if (response.status < 0) {
                        $('#errormessage').html('An email could not be sent. Please correct the error and try again. The error is "' + response.desc + '"');
                    } else {
                        $('#emailbackground').removeClass('active');
                        $('#emailpopup').removeClass('active');
                        $('#email').val('').focus();
                    }
                    // if error, display it; otherwise close popup
                });

        });
    });

    $scope.showImage = function (image) {
        if ($scope.videoPlayer) {
            $scope.videoPlayer.pause();
            $scope.videoPlayer.hide();
        }
        if (!image) {
            image = $scope.product.images[0].img;
        }
        $('.stage').find('img').attr('src', image).show();
    };

    $scope.showVideo = function () {
        $('.stage').find('img').hide();
        $scope.videoPlayer.show();
    };

    $scope.sendEmail = function () {
        $('#emailbackground').addClass('active');
        var $pop = $('#emailpopup');
        $('#reg_newsletter').attr('checked', false);
        $('#errormessage').html('');
        $pop.addClass('active').center();
        $('#email').val('').focus();
    };

    function getProductData () {
        var pid = $scope.pid;
        if (pid) {
            showSpinner();
            $.ajax({
                url: '/api.php?type=details&pid=' + pid,
                dataType: 'jsonp'
            })
                .done(function (response) {
                    response = JSON.parse(response);
                    if (response.details.carrier_name) {
                        loadProductData(response);
                    } else {
                        window.location = '/';
                    }
                });
        }
    }

    function loadProductData (data) {
        $scope.product.details     = data.details     || null;
        $scope.product.swatches    = data.swatches    || null;
        $scope.product.topFeatures = data.topFeatures || null;
        $scope.product.images      = data.images      || null;
        $scope.product.video       = data.video       || null;
        reverseImageOrder();
        setCarrierAndOSImage();
        setProductBudgetLevel();
        $scope.$apply();
        setupVideo();
        resizeStage();
        hideSpinner();
    }

    function reverseImageOrder () {
        if ($scope.product.images && $scope.product.images.length > 1) {
            $scope.product.images = $scope.product.images.slice().reverse();
        }
    }

    function setCarrierAndOSImage () {
        $scope.product.details.carrierImg = getLogoImg($scope.product.details.carrier_name);
        $scope.product.details.osImg = getLogoImg($scope.product.details.base_operating_system);
    }

    function setProductBudgetLevel () {
        price = $scope.product.details.price
    }

    function setupVideo () {
        var $video      = $('video.videojs');
        var $videoThumb = $('img.videojs');
        if (!$scope.product.video) {
            $video.hide();
            $videoThumb.parent().hide();
            $scope.showImage();
        } else {
            var source = document.createElement('source');
            $videoThumb.attr('src', $scope.product.video.poster);
            $video.attr({
                id: 'product-video',
                class: 'video-js vjs-default-skin vjs-big-play-centered',
                width: 'auto',
                height: 'auto',
                controls: '',
                poster: $scope.product.video.poster,
                preload: 'auto'
            });
            $(source).attr({
                type: 'video/mp4',
                src: $scope.product.video.name
            });
            $video.append(source);
            $scope.videoPlayer = videojs('product-video');
            $scope.videoPlayer.ready(function () {
                this.load();
            });
        }
    }

    function getLogoImg (str) {
        if (str == "AT&T")                  return "logo-att.png";
        if (str == "Sprint")                return "logo-sprint.png";
        if (str == "Straight Talk")         return "logo-straighttalk.png";
        if (str == "Verizon")               return "logo-verizon.png";
        if (str == "Walmart Family Mobile") return "logo-walmart-family-mobile.png";
        if (str == "Android")               return "logo-android.png";
        if (str == "Basic Phone")           return "logo-basic-phone.png";
        if (str == "BlackBerry")            return "logo-blackberry.png";
        if (str == "iOS")                   return "logo-apple.png";
        if (str == "Windows Phone")         return "logo-windows.png";
        return false;
    }

    function resizeStage () {
        var width  = $('#details .stage').width();
        var height = width * (1080/1920);
        $('#details .stage').css('height', height);
        $('#details .stage img').css('height', height);
    }
});

app.controller('selector', function ($scope) {

    $scope.model = {
        familyFriends: '1',
        sportingEvents: '1',
        travelingSightseeing: '1',
        entertainment: null,
        communication: null,
        style: {
            slimSleek: false,
            curvyComfortable: false,
            toughRugged: false,
            smallCompact: false
        },
        keyboard: {
            touchscreen: false,
            sliding: false,
            static: false,
            number: false
        },
        carrier: {
            att: false,
            sprint: false,
            straightTalk: false,
            verizon: false,
            familyMobile: false
        },
        os: {
            apple: false,
            android: false,
            windows: false,
            blackberry: false,
            basic: false
        },
        budget: {
            low: false,
            med: false,
            high: false
        }
    };

    var animating = false;
    var $steps    = $('.step');
    var $stepNav  = $('.step-nav');

    $(document).ready(function () {
        loadScreen();
        createSliders();
        $('#selector input[type=checkbox]').click(function () { updateSelectedItems($(this)); });
        $('#selector .continue')           .click(function () { navForward();                 });
        $('#selector .back')               .click(function () { navBack();                    });
    });

    function loadScreen () {
        $steps.each(function () {
            $(this).hide();
        });  // TODO: why not $steps.hide() ?
        if (getQueryStringParam('update') && getQueryStringParam('selector-criteria')) {
            $scope.model = JSON.parse(decodeURIComponent(getQueryStringParam('selector-criteria')));
            $scope.$apply();
            $stepNav.show();
            $steps.last().show();
            highlightStep(3);
        } else {
            $stepNav.hide();
            $steps.first().show();
        }
    }

    function createSliders () {
        $('.slider input').each(function () {
            $(this).parent().slider({
                //value: $(this).controller('ngModel').$modelValue,
                value: 3,
                min: 1,
                max: 4,
                step: 1,
                slide: function (event, ui) {
                    var $input = $(this).children('input');
                    $input.val(ui.value);
                    $input.trigger('input');
                }
            });
        });
    }

    function updateSelectedItems ($elem) {
        var model;

        if ($elem.hasClass('style')) {
            model = $scope.model.style;
            $('input.style.nopref').prop('checked', false);
        } else if ($elem.hasClass('keyboard')) {
            model = $scope.model.keyboard;
            $('input.keyboard.nopref').prop('checked', false);
        } else if ($elem.hasClass('carrier')) {
            model = $scope.model.carrier;
            $('input.carrier.nopref').prop('checked', false);
        } else if ($elem.hasClass('os')) {
            model = $scope.model.os;
            $('input.os.nopref').prop('checked', false);
        } else if ($elem.hasClass('budget')) {
            model = $scope.model.budget;
            $('input.budget.nopref').prop('checked', false);
        }

        if ($elem.hasClass('nopref')) {
            $elem.prop('checked', true);
            $.each(model, function (index) {
                model[index] = false;
            });
        }
        $scope.$apply();
    }

    function navForward () {
        if (animating) return false;
        var $current = $steps.not(':hidden');
        var $next    = $current.next();
        var $parent  = $current.parent();
        var $index   = $current.index();
        if (!validateSelection($index)) return false;
        if ($index == $steps.length - 1) {
            window.location = '/results/?type=selector&selector-criteria=' + encodeURIComponent(JSON.stringify($scope.model));
        } else {
            animating = true;
            $parent.height($parent.height());
            $current.toggle('slide', {direction:'left'}, 500, function () {
                $next.toggle('slide', {direction:'right'}, 500, function () {
                    highlightStep($index);
                    animating = false;
                });
                $parent.height('auto');
                if ($index == 0) {
                    $stepNav.toggle('slide', {direction:'right'}, 500);
                }
                if ($(window).scrollTop() > 0) {
                    $('body').animate({scrollTop:0}, 500)
                }
            });
        }
    }

    function navBack () {
        if (animating) return false;
        animating = true;
        var $current = $steps.not(':hidden');
        var $prev    = $current.prev();
        var $parent  = $current.parent();
        var $index   = $current.index();
        $parent.height($parent.height());
        if ($index == 1) {
            $stepNav.toggle('slide', {direction:'right'}, 500);
        }
        $current.toggle('slide', {direction:'right'}, 500, function () {
            $prev.toggle('slide', {direction:'left'}, 500, function () {
                highlightStep($index - 2);
                animating = false;
            });
            $parent.height('auto');
            if ($(window).scrollTop() > 0) {
                $('body').animate({scrollTop:0}, 500)
            }
        });
    }

    function validateSelection (step) {
        if (step == 2) {
            if (!$('#step2 input[name=entertainment]').is(':checked')) {
                alert('Please select a form of entertainment');
                return false;
            }
            if (!$('#step2 input[name=communication]').is(':checked')) {
                alert('Please select a form of communication');
                return false;
            }
        }
        if (step == 3) {
            if (!$('#step3 input.style').is(':checked')) {
                alert('Please select a phone style');
                return false;
            }
            if (!$('#step3 input.keyboard').is(':checked')) {
                alert('Please select a keyboard style');
                return false;
            }
        }
        if (step == 4) {
            if (!$('#step4 input.carrier').is(':checked')) {
                alert('Please select a carrier');
                return false;
            }
            if (!$('#step4 input.os').is(':checked')) {
                alert('Please select an operating system');
                return false;
            }
        }
        return true;
    }

    function highlightStep (index) {
        if (index >= 0) {
            var $elems = $stepNav.find('li');
            $elems.each(function () {
                $(this).removeClass('active');
            });
            $elems.eq(index).addClass('active');
        }
    }

});