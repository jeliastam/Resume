
/*app.directive('header', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/header.html',
        controller: function ($scope) {

            var $search      = angular.element('#header .search');
            var searchOpened = false;
            $scope.q         = getQueryStringParam('q');

            angular.element(document).ready(function () {
                updateSearchValue();
                angular.element(window).resize(function () {
                    evaluateSearchVisibility();
                });
            });

            $scope.reset = function () {
                $scope.searchString = '';
            };

            $scope.submit = function () {
                if (!$scope.searchString) return;
                var url = '/results/search?q=' + encodeURIComponent($scope.searchString);
                window.location = url;
            };

            $scope.toggleSearch = function () {
                searchOpened = !searchOpened;
                $search.slideToggle({easing: 'easeOutCubic'});
            };

            function evaluateSearchVisibility () {
                if (window.matchMedia('(max-width: 700px)').matches) {
                    if (!searchOpened) { $search.hide(); }
                } else {
                    $search.show();
                }
            }

            function updateSearchValue () {
                if ($scope.q) {
                    $scope.searchString = decodeURIComponent($scope.q);
                }
            }
        }
    };
});*/


app.directive('nav', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/nav.html',
        controller: function () {

            var $nav     = angular.element('#nav');
            var $overlay = $nav.find('.overlay');
            var $show    = angular.element('button.show-nav');
            var $hide    = angular.element('button.hide-nav')

            angular.element(document).ready(function () {
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
        }
    };
});


app.directive('footer', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/footer.html',
        controller: function($scope) {
            $scope.date = new Date();
        }
    }
});


app.directive('home', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/home.html'
    };
});


app.directive('about', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/about.html'
    };
});


app.directive('plans', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/plans.html',
        scope: {}
    };
});


app.directive('carrierPlan',['matchmedia', function(matchmedia) {

    var paginatedTable      = '#carrier-plan .table-container[paginate-it=true]';

    function paginateIt() {

        var $columns    = angular.element(paginatedTable+ ' .column:not(:first-child)');
        var $labels     = angular.element(paginatedTable+ ' .column:first-child');
        var pages       = 0;

        if ($columns) {
            pages = groupAndWrap($columns, "pagination-group");

            //$labels.addClass('pagination');

            angular.element('.pagination-group .column').css('width', '');
            angular.element('.pagination-group').addClass('hidden');
            angular.element('#page-1').removeClass('hidden').addClass('active');

            var navPageCount = '<div class="pageCount">';
            for (var i = 1 ; i <= pages ; i++) {
                navPageCount    += '<span class="page-' + i + '"></span>';
            }
            navPageCount    += '</div>';

            angular.element(paginatedTable + ' .fake-table').after(navPageCount);
            angular.element(paginatedTable + ' .pageCount span:first-child').addClass('active');
        }
    }

    // takes jquery set of matched elements and groups
    // them according to a hardcoded numPerPage and then
    // wraps them in a div of the class className
    // returns the number of 'pages'(groups)
    function groupAndWrap($columns, className) {
        var numColumns = 0;
        var numPerPage = 4;
        var pages      = 0;
        var start, end;

        numColumns = $columns.length;
        if (numColumns < 8) {
            numPerPage = 2;
            if (numColumns < 4) {
                numPerPage = 1;
            }
        }

        // check if a column cell has content that is greater than 20 characters
        // if so, then use 1 column per page.
        $columns.find('.cell span').each(function(index, element) {
            var $this = angular.element(this);
            if ($this.html().trim().length > 20) {
                numPerPage = 1;
                angular.element('.column:not(.labels)').addClass('full-width');
                return false;
            }
        });

        pages = parseInt(numColumns / numPerPage);

        if (numColumns % numPerPage > 0) {
            pages++;
        }

        for (var page = 1; page <= pages; page++) {
            start = (page - 1) * numPerPage;       // 0, 4, 8
            end = (page * numPerPage - 1) + 1;     // 4, 8, 12(9)  end number is not inclusive!!
            $columns.slice(start, end).wrapAll("<div id='page-" + page + "' class='" + className + "'></div>");
        }

        return pages;
    }

    function sanitizeIt() {
        angular.element(paginatedTable + ' .pagination-group .column').unwrap();
        angular.element(paginatedTable + ' .pagination-labels .column').unwrap();
        angular.element(paginatedTable + ' .pageCount').remove();
    }

    function updatePageIndicator(pageNum) {
        var $dots         = angular.element(paginatedTable + ' .pageCount span');
        var activePageId  = angular.element(paginatedTable + ' .fake-table.pagination-group.active').attr('id');
        pageNum           = pageNum || parseInt(activePageId.slice(activePageId.indexOf('-') + 1));

        $dots.removeClass('active');
        $dots.eq(pageNum - 1).addClass('active');
    }

    function buildTables() {
        // this had a purpose at first
        var columns = '.column';

        // set coloring
        angular.element.each(angular.element('.table-container'), function() {
            var $this = angular.element(this);

            // Todo: fix this!  This adds lt-grey to the blue
            angular.element(columns + ':not(:first-child) .cell:first-child', this).addClass('lg blue');
            angular.element(columns + ':not(:first-child) .cell:nth-child(2n + 3)', this).addClass('lt-grey');
            angular.element(columns + ':not(:first-child) .cell:nth-child(2n + 4)', this).addClass('grey');

            if ($this.find('.column').length === 4 &&
                $this.find('.column:nth-child(2) .cell').length == 2) {
                $this.find('.column').removeClass('column').addClass('column-3');
            }

            angular.element(columns + ':not(:first-child) .cell:nth-child(2)', this).removeClass().addClass('cell xl lt-orange');

            // size columns
            var numCols             = angular.element(columns, this).length - 1;
            var firstColWidthOffset = 140;
            var width               = 100.00 / numCols;

            angular.element(columns + ':not(:first-child)', this).width(width + '%');
            angular.element(columns + ':first-child', this).width(0).addClass('labels');
        });
    }

    function getFriendlyCarrierName(prettyName) {
        var prettyNameUpper = prettyName.toUpperCase();
        var friendlyName;

        switch (prettyNameUpper) {
            case 'AT&T':
                friendlyName = 'att';
                break;
            case 'WALMARTFAMILYMOBILE':
                friendlyName = 'wfm';
                break;
            case 'SPRINT':
                friendlyName = 'sprint';
                break;
            case 'VERIZON':
                friendlyName = 'verizon';
                break;
            case 'STRAIGHTTALK':
                friendlyName = 'straighttalk';
                break;
            default:
                break;
        }

        return friendlyName;
    }

    var link = function ($scope) {
        /** TEMP  **/
        $scope.$watch('carrier', function (newValue, oldValue) {
            if (!$scope.carrier) {
                $scope.template = '';
                return;
            } else {
                $scope.template = 'views/plan.html';
            }
            showSpinner();

            //maybe redundant?
            if (!newValue) {
                if (!oldValue) {
                    return;
                } else {
                    newValue = oldValue;
                }
            }

            // get url friendly carrier name
            var friendlyCarrierName = getFriendlyCarrierName(newValue);
            var url = '/api/service-plan/mobile/' + friendlyCarrierName;

            return angular.element.ajax({
                url: url
            }).done(function (response) {
                if (response) {
                    $scope.carrierData = response.data;
                    $scope.carrierDetails = response.details;
                    $scope.$digest();
                    buildTables();
                    if ($scope.paginate) {
                        paginateIt();
                    }
                }
                else {
                    // Do something?
                }
                $scope.$apply();
                hideSpinner();
            });
        });

        var unregister = matchmedia.on('screen and (max-width: 700px)', function (mediaQueryList) {
            $scope.paginate = mediaQueryList.matches;

            if ($scope.paginate && $scope.carrier) {
                paginateIt();
            } else {
                sanitizeIt();
                buildTables();
            }
        });

    };

    function ctrl($scope) {
        $scope.go = function(direction) {
            var activeGroup     = angular.element(paginatedTable + ' .pagination-group.active').attr('id');
            var numberOfPages   = angular.element('.pagination-group').length;
            var pageNum         = parseInt(activeGroup.substr(activeGroup.indexOf('-') + 1));

            pageNum += direction;
            if (pageNum > numberOfPages) {
                pageNum = 1;
            } else if (pageNum < 1) {
                pageNum = numberOfPages;
            }
            updatePageIndicator(pageNum);

            angular.element('.pagination-group').removeClass('active').addClass('hidden');
            angular.element('#page-' + pageNum).removeClass('hidden').addClass('active');
        }
    }

    return {
        restrict: 'E',
        replace: true,
        template: '<div id="carrier-plan" ng-include="template"></div>',
        scope: {
            carrier: '@',
            ngInclude: '@'
        },
        link: link,
        controller: ctrl
    }}]);


app.directive('details', function($filter, $timeout, $sce, $window, Product, Modal) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/details.html',
        scope: {
            pid: '@'
        },
        link: function($scope, element, attrs) {

            $scope.swipe             = {};
            $scope.swipePosition     = 0;
            $scope.selected          = {};
            $scope.vjs               = null;
            $scope.hidePlanSelection = true;

            $scope.init = function () {

                Product.details($scope.pid).then(function(res) {
                    if (res.success) {
                        $scope.details = res.data;
                        console.log($scope.details);
                        $scope.initializeSwipe();
                        $scope.initializeVideo($scope.details.video.video, $scope.details.video.image);
                    }
                });
            };

            $scope.initializeSwipe = function () {
               $timeout(function() {
                   $scope.swipe = Swipe(document.getElementById('stage'), {
                        continuous: false,
                        callback: function(index) {
                            $timeout(function() {
                                $scope.swipePosition = index;
                                $scope.vjs.pause();
                            }, 0);
                        }
                    });
                }, 200);
            };

            $scope.initializeVideo = function (video, poster) {
                var vjs = videojs("product-video", {
                    poster: poster,
                    preload: 'auto',
                    controls: true,
                    width: 'auto',
                    height: 'auto'
                });
                vjs.src({type: "video/mp4", src: video});
                $scope.vjs = vjs;
            };

            $scope.showChooseCarrier = function() {
                Modal({
                    templateUrl: 'views/modals/choose-carrier.html',
                    scope: $scope
                });
            };

            $scope.showChoosePayment = function() {
                Modal({
                    templateUrl: 'views/modals/choose-pricing.html',
                    scope: $scope
                });
            };

            $scope.showChoosePlan = function(carrier) {
                var plan = null;
                if (carrier == "AT&T")                  plan = 'att';
                if (carrier == "Sprint")                plan = 'sprint';
                if (carrier == "Straight Talk")         plan = 'straight-talk';
                if (carrier == "Verizon")               plan = 'verizon';
                if (carrier == "Walmart Family Mobile") plan = 'wfm';
                Modal({
                    templateUrl: 'views/modals/choose-plan.' + plan + '.html',
                    scope: $scope
                });
            };

            $scope.showSummary = function() {
                Modal({
                    templateUrl: 'views/modals/summary.html',
                    scope: $scope
                });
            };

            $scope.optionWidth = function(options, containerSelector) {
                var minWidth       = 110;
                var margin         = 6;
                var length         = options.length;
                var containerWidth = angular.element('.option-container' + containerSelector).width();
                while (containerWidth / length < minWidth) {
                    length--;
                }
                return {width: 'calc(' + 100/length + '% - ' + margin + 'px)'}
            };

            $scope.capacityAvailable = function(capacity) {
                if (!$scope.selected.carrier) {
                    return true;
                } else {
                    var available = false;
                    angular.forEach($scope.details.permutations, function(value, key) {
                        if (value.provider == $scope.selected.carrier && value.built_in_storage == capacity) {
                            available = true;
                        }
                    });
                }
                return available;
            };

            $scope.colorAvailable = function(color) {
                if (!$scope.selected.carrier) {
                    return true;
                } else {
                    var available = false;
                    angular.forEach($scope.details.permutations, function(value, key) {
                        if (!$scope.selected.capacity) {
                            if (value.provider == $scope.selected.carrier && value.color_name == color) {
                                available = true;
                            }
                        } else {
                            if (value.provider == $scope.selected.carrier  &&
                                value.built_in_storage == $scope.selected.capacity &&
                                value.color_name == color) {
                                available = true;
                            }
                        }
                    });
                }
                return available;
            };

            $scope.pricingAvailable = function() {
                if (!$scope.details) return null;
                var available = [];
                angular.forEach($scope.details.permutations, function(value, key) {
                    if (value.provider == $scope.selected.carrier && value.built_in_storage == $scope.selected.capacity && value.color_name == $scope.selected.color) {
                        angular.forEach(value.pricing, function(value, key) {
                            available.push(value);
                        });
                    }
                });
                return available;
            };

            $scope.basicPricingPlanSummary = function() {
                var contractPlans    = [];
                var installmentPlans = [];
                var retailPlans      = [];
                var displayOrder     = [installmentPlans, contractPlans, retailPlans];
                if (!$scope.details) {
                    return null;
                }
                if ($scope.selected.pricing) {
                    var priceSummary = $filter('currency')($scope.selected.pricing.program_price);
                    priceSummary += ($scope.selected.pricing.program_type == 'Installment Plan') ? ' / mo' : '';
                    return {
                        priceSummary: priceSummary,
                        planSummary: $scope.selected.pricing.program_name,
                        zeroDown: $scope.selected.pricing.program_type == 'Installment Plan'
                    }
                }
                angular.forEach($scope.details.permutations, function(value) {
                    if ((!$scope.selected.carrier  || value.provider         == $scope.selected.carrier)  &&
                        (!$scope.selected.capacity || value.built_in_storage == $scope.selected.capacity) &&
                        (!$scope.selected.color    || value.color_name       == $scope.selected.color)) {
                        angular.forEach(value.pricing, function(value) {
                            if (value.program_type == '2 Year Contract')  contractPlans.push(value);
                            if (value.program_type == 'Installment Plan') installmentPlans.push(value);
                            if (value.program_type == 'Full Retail')      retailPlans.push(value);
                        });
                    }
                });
                for (var i = 0; i < displayOrder.length; i++) {
                    if (displayOrder[i].length > 1) {
                        var prices       = [];
                        var planType     = null;
                        var lowestPrice  = null;
                        var highestPrice = null;
                        var priceSummary = null;
                        angular.forEach(displayOrder[i], function(value, key) {
                            prices.push(value.program_price);
                            planType = value.program_type;
                        });
                        prices.sort(function(a,b){return a-b;});
                        lowestPrice  = $filter('currency')(prices.slice(0)[0]);
                        highestPrice = $filter('currency')(prices.slice(-1)[0]);
                        priceSummary = (lowestPrice == highestPrice) ? lowestPrice : lowestPrice + ' - ' + highestPrice;
                        priceSummary += (planType == 'Installment Plan') ? ' / mo' : '';
                        return {
                            priceSummary: priceSummary,
                            planSummary: planType,
                            zeroDown: planType == 'Installment Plan'
                        };
                    }
                    if (displayOrder[i].length == 1) {
                        return {
                            priceSummary: $filter('currency')(displayOrder[i][0].program_price) + ((displayOrder[i][0].program_type == 'Installment Plan') ? ' / mo' : ''),
                            planSummary: displayOrder[i][0].program_type,
                            zeroDown: displayOrder[i][0].program_type == 'Installment Plan'
                        };
                    }
                }
            };

            /**
             * NEEDS TO BE REFACTORED ONCE DATA FORMAT IS FINALIZED
             */
            $scope.costSummary = function() {
                if (!$scope.selected || !$scope.selected.pricing || !$scope.selected.plan) return null;
                var lineAccess      = 0;
                var dataAccess      = 0;
                var dueToday        = 0;
                var monthlyEstimate = 0;
                var paymentDuration = 0;
                var totalOverMonths = 0;
                if ($scope.selected.carrier == 'AT&T') {
                    if ($scope.selected.plan.data.match(/\d+/g)[0] >= 10 && $scope.selected.plan.data.match(/GB/g)) {
                        if ($scope.details.os_name == 'Feature Phone') {
                            lineAccess = 15;
                        }
                        else {
                            if ($scope.selected.pricing.program_type == '2 Year Contract') {
                                lineAccess = 40;
                            }
                            else {
                                lineAccess = 15;
                            }
                        }
                    }
                    else {
                        if ($scope.details.os_name == 'Feature Phone') {
                            lineAccess = 20;
                        }
                        else {
                            if ($scope.selected.pricing.program_type == '2 Year Contract') {
                                lineAccess = 40;
                            }
                            else {
                                lineAccess = 25;
                            }
                        }
                    }
                }
                if ($scope.selected.carrier == 'Verizon') {
                    if ($scope.details.os_name == 'Feature Phone') {
                        lineAccess = 20;
                    }
                    else {
                        if ($scope.selected.pricing.program_type == '2 Year Contract') {
                            lineAccess = 40;
                        }
                        if ($scope.selected.pricing.program_type == 'Installment Plan' || $scope.selected.pricing.program_type == 'Full Retail') {
                            if ($scope.selected.plan.data.match(/\d+/g)[0] >= 6 && $scope.selected.plan.data.match(/GB/g)) {
                                lineAccess = 15;
                            }
                            else {
                                lineAccess = 25;
                            }
                        }
                    }
                }
                if ($scope.selected.carrier == 'Sprint') {
                    if ($scope.selected.pricing.program_type == '2 Year Contract') {
                        lineAccess = 40;
                    }
                    else {
                        if ($scope.selected.plan.data.match(/\d+/g)[0] >= 8 && $scope.selected.plan.data.match(/GB/g)) {
                            lineAccess = 15;
                        }
                        else {
                            lineAccess = 25;
                        }
                    }
                }
                if ($scope.selected.pricing.program_type == '2 Year Contract' || $scope.selected.pricing.program_type == 'Full Retail') {
                    dueToday = parseFloat($scope.selected.pricing.program_price);
                    paymentDuration = 24;
                }
                if ($scope.selected.pricing.program_type == 'Installment Plan') {
                    monthlyEstimate = parseFloat($scope.selected.pricing.program_price);
                    paymentDuration = parseInt($scope.selected.pricing.program_duration);
                }
                dataAccess       = parseFloat($scope.selected.plan.price);
                monthlyEstimate += dataAccess + lineAccess;
                if ($scope.selected.carrier == 'Straight Talk') {
                    dueToday += monthlyEstimate;
                    monthlyEstimate = 0;
                }
                totalOverMonths  = dueToday + (monthlyEstimate * paymentDuration);
                return {
                    lineAccess: lineAccess,
                    dataAccess: dataAccess,
                    dueToday: dueToday,
                    monthlyEstimate: monthlyEstimate,
                    paymentDuration: paymentDuration,
                    totalOverMonths: totalOverMonths
                };
            };

            $scope.closeModal = function(modal) {
                angular.element('.' + modal + ' .close').click();
            };

            $scope.getHexColorFromName = function(name) {
                var hex = null;
                angular.forEach($scope.details.colors, function(color) {
                    if (color.name == name) {
                        hex = color.hex;
                    }
                });
                return hex;
            };

            $scope.permutationCapacityToNumber = function(permutation) {
                var matches = permutation.built_in_storage.match(/(\d+)/);
                return Number(matches[1]);
            };

            $scope.pricingStringToNumber = function(pricing) {
                return Number(pricing.program_price.replace(/[^0-9\.]+/g,""));
            };

            $scope.isWhite = function(string) {
                return string.match(/white/i);
            };

            $scope.resetCarrier = function() {
                $scope.selected.carrier = null;
                $scope.resetPricing();
                $scope.resetPlan();
            };

            $scope.resetPricing = function() {
                $scope.selected.pricing = null;
            };

            $scope.resetPlan = function() {
                $scope.selected.plan = null;
            };

            $scope.carrierLogo = function(carrier) {
                if (carrier == "AT&T")                  return "logo-att.png";
                if (carrier == "Sprint")                return "logo-sprint.png";
                if (carrier == "Straight Talk")         return "logo-straighttalk.png";
                if (carrier == "Verizon")               return "logo-verizon.png";
                if (carrier == "Walmart Family Mobile") return "logo-walmart-family-mobile.png";
            };

            $scope.hello = function(number) {
                console.log(number);
            };

            $scope.plans = {
                att: [
                    {data:'300 MB', price:20},
                    {data:'1 GB', price:25},
                    {data:'3 GB', price:40},
                    {data:'6 GB', price:70},
                    {data:'10 GB', price:100},
                    {data:'15 GB', price:130},
                    {data:'20 GB', price:150},
                    {data:'30 GB', price:225},
                    {data:'40 GB', price:300},
                    {data:'50 GB', price:375}
                ],
                sprint: [
                    {data:'1 GB', price:20},
                    {data:'2 GB', price:25},
                    {data:'4 GB', price:40},
                    {data:'8 GB', price:70},
                    {data:'12 GB', price:90},
                    {data:'20 GB', price:100},
                    {data:'32 GB', price:130},
                    {data:'40 GB', price:150},
                    {data:'60 GB', price:225}
                ],
                verizon: [
                    {data:'500 MB', price:20},
                    {data:'1 GB', price:30},
                    {data:'2 GB', price:40},
                    {data:'3 GB', price:50},
                    {data:'4 GB', price:60},
                    {data:'6 GB', price:70},
                    {data:'10 GB', price:80},
                    {data:'15 GB', price:100},
                    {data:'20 GB', price:140},
                    {data:'30 GB', price:225},
                    {data:'40 GB', price:300},
                    {data:'50 GB', price:375},
                    {data:'60 GB', price:450},
                    {data:'80 GB', price:600},
                    {data:'100 GB', price:750}
                ],
                straightTalk: [
                    {
                        name:'All You Need',
                        price:30,
                        serviceDays:'30',
                        talk:'1,500 Nationwide',
                        text:'Unlimited Nationwide',
                        data:'100 MB'
                    },
                    {
                        name:'Unlimited* 1 Month',
                        price:45,
                        serviceDays:'30',
                        talk:'Unlimited Nationwide',
                        text:'Unlimited Nationwide',
                        data:'3 GB'
                    },
                    {
                        name:'Unlimited* International',
                        price:60,
                        serviceDays:'30',
                        talk:'Unlimited Nationwide & International',
                        text:'Unlimited Nationwide',
                        data:'3 GB'
                    },
                    {
                        name:'Unlimited* 3 Months',
                        price:130,
                        serviceDays:'90',
                        talk:'Unlimited Nationwide',
                        text:'Unlimited Nationwide',
                        data:'3 GB'
                    },
                    {
                        name:'Unlimited* 6 Months',
                        price:225,
                        serviceDays:'180',
                        talk:'Unlimited Nationwide',
                        text:'Unlimited Nationwide',
                        data:'3 GB'
                    },
                    {
                        name:'Unlimited* 12 Months',
                        price:495,
                        serviceDays:'365',
                        talk:'Unlimited Nationwide',
                        text:'Unlimited Nationwide',
                        data:'3 GB'
                    }
                ],
                wfm: [
                    {
                        name:'Unlimited Talk & Text',
                        price:24.88,
                        data:0,
                        starterKit:'25'
                    },
                    {
                        name:'Unlimited Talk, Text & Data',
                        price:29.88,
                        data:'1 GB',
                        starterKit:null
                    },
                    {
                        name:'Unlimited Talk, Text & Data',
                        price:39.88,
                        data:'3 GB',
                        starterKit:null
                    },
                ]
            };

            $scope.$watch('selected.carrier', function(newValue, oldValue) {
                if (newValue != oldValue) {
                    $scope.resetPricing();
                    $scope.resetPlan();
                    if (!$scope.capacityAvailable($scope.selected.capacity)) {
                        $scope.selected.capacity = null;
                    }
                    if (!$scope.colorAvailable($scope.selected.color)) {
                        $scope.selected.color = null;
                    }
                    if (!newValue) {
                        $scope.hidePlanSelection = true;
                    }
                }
            });

            $scope.$watch('selected.capacity', function(newValue, oldValue) {
                if (newValue != oldValue){
                    $scope.resetPricing();
                    if (!$scope.colorAvailable($scope.selected.color)) {
                        $scope.selected.color = null;
                    }
                    if (!newValue) {
                        $scope.hidePlanSelection = true;
                    }
                }
            });

            $scope.$watch('selected.color', function(newValue, oldValue) {
                if (newValue != oldValue) {
                    $scope.resetPricing();
                    if (!$scope.capacityAvailable($scope.selected.capacity)) {
                        $scope.selected.capacity = null;
                    }
                    if (!newValue) {
                        $scope.hidePlanSelection = true;
                    }
                }
            });

            $scope.$watch('selected.pricing', function(newValue, oldValue) {
                if (newValue) {
                    $scope.hidePlanSelection = false;
                }
            });

            $scope.init();
        }
    };
});


app.directive('results', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/results.html',
        scope: {
            type: '@'
        },
        controller: function ($scope) {

            $scope.q           = ($scope.type == 'search')    ?     getQueryStringParam('q')           :   false;
            $scope.criteria    = ($scope.type == 'selector')  ?     getQueryStringParam('criteria')    :   false;
            $scope.header      = ($scope.type == 'browse')    ?     'Browse All'                       :   'Your Mobile Results';

            prepareModel($scope.criteria);

            $scope.products    = [];
            $scope.emptyResult = false;
            $scope.ranOnce     = false;
            $scope.updated     = false;

            angular.element(document).ready(function () {
                run();
                angular.element('.back').click(function () { goBack(); });
            });

            $scope.$watch('model', function () {
                if ($scope.ranOnce) {
                    update();
                }
            }, true);

            function run () {
                getResults();
            }

            function update () {
                $scope.updated = true;
                switch ($scope.type) {
                    case 'search':
                        break;
                    case 'browse':
                    case 'selector':
                        getResults($scope.model);
                        break;
                    default:
                        window.location = '/';
                        break;
                }
            }

            // Set defaults for model so filters work
            function prepareModel (data) {
                if (data) {
                    $scope.model = JSON.parse(decodeURIComponent(data));
                }

                if (!data) {
                    $scope.model = {
                        style: {
                            slimSleek: true,
                            curvyComfortable: true,
                            toughRugged: true,
                            smallCompact: true
                        },
                        keyboard: {
                            touchscreen: true,
                            sliding: true,
                            static: true,
                            number: true
                        },
                        carrier: {
                            att: true,
                            sprint: true,
                            straightTalk: true,
                            verizon: true,
                            familyMobile: true
                        },
                        os: {
                            android: true,
                            apple: true,
                            blackberry: true,
                            windows: true,
                            basic: true
                        }
                    };
                }

                // check for 'noPref's and update model accordingly
                for (var attr in $scope.model) {
                    if ($scope.model.hasOwnProperty(attr)) {
                        if ($scope.model[attr]['noPref']) {
                            for (var prop in $scope.model[attr]) {
                                if ($scope.model[attr].hasOwnProperty(prop)) {
                                    $scope.model[attr][prop] = prop != 'noPref';
                                }
                            }
                        }
                    }
                }

                // set default planType option
                $scope.model.planType = {
                    installment: true,
                    contract: true,
                    fullRetail: true
                };
            }

            function getResults (data) {
                var url ='/api/results/';

                switch ($scope.type) {
                    case 'search':
                        if ($scope.q) {
                            url += 'search?q=' + encodeURIComponent($scope.q);
                        }
                        break;
                    case 'browse':
                        if (data) {
                            url += 'selector';
                            data = {criteria: JSON.stringify(data)};
                        } else {
                            url += 'browse';
                        }
                        break;
                    case 'selector':
                        if (!data) {
                            data = decodeURIComponent($scope.criteria);
                            showBackButton();
                        } else {
                            data = JSON.stringify(data);
                        }
                        url += 'selector';
                        data = {criteria: data};
                        break;
                    default:
                        window.location = '/';
                        break;
                }

                showSpinner();

                return angular.element.ajax({
                    dataType: "json",
                    url: url,
                    data: data
                }).done(function (response) {
                    if (response.length) {
                        $scope.emptyResult = false;
                        loadResults(response);
                    }
                    else {
                        $scope.emptyResult = true;
                    }
                    $scope.$apply();
                    hideSpinner();
                });
            }

            function loadResults (products) {
                $scope.products = products;
                setOSImages();
                setDefaultPlanAndPrice();
                $scope.$apply();
                $scope.ranOnce = true;
            }

            function getPrettyPlanType (str) {
                if (str == "installment")        return "Installment Plan";
                if (str == "contract")           return "2 Year Contract";
                if (str == "fullRetail")         return "Full Retail";
                return false;
            }

            function extractPrices (product, str) {
                var prices = [];

                str = getPrettyPlanType(str);

                angular.element.each(product.pricing, function() {
                        if (this.program_type.toLowerCase() == str.toLowerCase()) {
                            prices.push(this.program_price);
                        }
                });

                return prices;
            }

            function formatPrice (price) {
                return (parseInt(price * 100) / 100).toFixed(2);
            }

            function setFormattedPrice (price, planType) {
                var prettyStr = '';

                prettyStr += "$";
                prettyStr += formatPrice(price[0]);
                if (price.length > 1 && price[0] != price[1]) {
                    prettyStr += " - $";
                    prettyStr += formatPrice(price[1]);
                }
                if (planType == 'Installment Plan') {
                    prettyStr += " / month";
                }

                return prettyStr;
            }

            function setDefaultPlanAndPrice() {
                angular.element.each($scope.products, function() {
                    var prices = [], str;
                    this.defaults = {
                        price: []
                    };

                    // check if installment is checked in filter
                    if ($scope.model.planType.installment) {
                        str = "installment";
                        prices = extractPrices(this, str);
                    }

                    // check if there were results for installment AND
                    // if contract is checked in filter
                    if ((!prices.length || prices[0] === null) &&
                        $scope.model.planType.contract) {
                        //installment doesnt exist
                        str = "contract";
                        prices = extractPrices(this, str);
                    }

                    // check if there were results for contract AND
                    // if full retail is checked in filter
                    if (!prices.length && $scope.model.planType.fullRetail) {
                        //contract doesnt exist
                        str = "fullRetail";
                        prices = extractPrices(this, str);
                    }

                    this.defaults.planType = getPrettyPlanType(str);

                    if (prices.length > 1) {
                        this.defaults.price.push(Math.min.apply(null, prices));
                        this.defaults.price.push(Math.max.apply(null, prices));
                    } else {
                        this.defaults.price = prices;
                    }

                    this.defaults.prettyPrice = setFormattedPrice(this.defaults.price, this.defaults.planType);
                });
            }

            function setOSImages () {
                angular.element.each($scope.products, function () {
                    this.osImg = getLogoImg(this.base_operating_system);
                });
            }

            function getLogoImg (str) {
                /*if (str == "AT&T")                  return "logo-att.png";
                if (str == "Sprint")                return "logo-sprint.png";
                if (str == "Straight Talk")         return "logo-straighttalk.png";
                if (str == "Verizon")               return "logo-verizon.png";
                if (str == "Walmart Family Mobile") return "logo-walmart-family-mobile.png";*/
                if (str == "Android")               return "logo-android.png";
                if (str == "Basic Phone")           return "logo-basic-phone.png";
                if (str == "BlackBerry")            return "logo-blackberry.png";
                if (str == "iOS")                   return "logo-apple.png";
                if (str == "Windows Phone")         return "logo-windows.png";
                return false;
            }

            function goBack () {
                window.location = '/selector?update=true&selector-criteria=' + getQueryStringParam('criteria');
            }

            function showBackButton () {
                angular.element('.back').show();
            }

            $scope.planFilter = function (product) {
                var options = $scope.model.planType;

                for (var option in options) {
                    if (options.hasOwnProperty(option)) {
                        if (options[option]) {
                            // checks if the option is set as the default, should be fine
                            if (getPrettyPlanType(option) == product.defaults.planType) {
                                return true;
                            }
                        }
                    }
                }

                return false;
            }
        }
    }
});


app.directive('selector', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/selector.html',
        controller: function ($scope) {

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
                }/*,
                budget: {
                    low: false,
                    med: false,
                    high: false
                }*/
            };

            var animating = false;
            var $steps    = angular.element('.step');
            var $stepNav  = angular.element('.step-nav');

            angular.element(document).ready(function () {
                loadScreen();
                createSliders();
                angular.element('#selector input[type=checkbox]').click(function () { updateSelectedItems(angular.element(this)); });
                angular.element('#selector .continue')           .click(function () { navForward();                 });
                angular.element('#selector .back')               .click(function () { navBack();                    });
            });

            function loadScreen () {
                $steps.hide();
                if (getQueryStringParam('update') && getQueryStringParam('criteria')) {

                    $scope.model = JSON.parse(decodeURIComponent(getQueryStringParam('criteria')));
                    $stepNav.show();
                    $steps.last().show();
                    highlightStep($steps.length - 2);
                } else {
                    $stepNav.hide();
                    $steps.first().show();
                }
            }

            function createSliders () {

                angular.element('.slider input').each(function () {
                    // hack n slash DEADLINE!!
                    var thisModel = angular.element(this).attr('ng-model');
                    var pieces = thisModel.split('.');
                    var modelValue = $scope.model[pieces[1]];
                    angular.element(this).parent().slider({
                        value: modelValue || 1,
                        min: 1,
                        max: 4,
                        step: 1,
                        slide: function (event, ui) {
                            var $input = angular.element(this).children('input');
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
                    angular.element('input.style.nopref').prop('checked', false);
                } else if ($elem.hasClass('keyboard')) {
                    model = $scope.model.keyboard;
                    angular.element('input.keyboard.nopref').prop('checked', false);
                } else if ($elem.hasClass('carrier')) {
                    model = $scope.model.carrier;
                    angular.element('input.carrier.nopref').prop('checked', false);
                } else if ($elem.hasClass('os')) {
                    model = $scope.model.os;
                    angular.element('input.os.nopref').prop('checked', false);
                }/* else if ($elem.hasClass('budget')) {
                    model = $scope.model.budget;
                    angular.element('input.budget.nopref').prop('checked', false);
                }*/

                if ($elem.hasClass('nopref')) {
                    $elem.prop('checked', true);
                    angular.element.each(model, function (index) {
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
                    window.location = '/results/selector?criteria=' + encodeURIComponent(JSON.stringify($scope.model));
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
                        if (angular.element(window).scrollTop() > 0) {
                            angular.element('body').animate({scrollTop:0}, 500)
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
                    if (angular.element(window).scrollTop() > 0) {
                        angular.element('body').animate({scrollTop:0}, 500)
                    }
                });
            }

            function validateSelection (step) {
                if (step == 2) {
                    if (!angular.element('#step2 input[name=entertainment]').is(':checked')) {
                        alert('Please select a form of entertainment');
                        return false;
                    }
                    if (!angular.element('#step2 input[name=communication]').is(':checked')) {
                        alert('Please select a form of communication');
                        return false;
                    }
                }
                if (step == 3) {
                    if (!angular.element('#step3 input.style').is(':checked')) {
                        alert('Please select a phone style');
                        return false;
                    }
                    if (!angular.element('#step3 input.keyboard').is(':checked')) {
                        alert('Please select a keyboard style');
                        return false;
                    }
                }
                if (step == 4) {
                    if (!angular.element('#step4 input.carrier').is(':checked')) {
                        alert('Please select a carrier');
                        return false;
                    }
                    if (!angular.element('#step4 input.os').is(':checked')) {
                        alert('Please select an operating system');
                        return false;
                    }
                }
                /*if (step == 5) {
                    if (!angular.element('#step5 input.budget').is(':checked')) {
                        alert('Please select a price range');
                        return false;
                    }
                }*/
                return true;
            }

            function highlightStep (index) {
                if (index >= 0) {
                    var $elems = $stepNav.find('li');
                    $elems.removeClass('active');
                    $elems.eq(index).addClass('active');
                }
            }
        }
    };
});


app.directive('logo', function() {
    return {
        restrict: 'A',
        replace: false,
        scope: {
            logo: '@'
        },
        link: function($scope, $element) {
            $scope.$watch('logo', function() {
                $element.attr('src', function() {
                    if ($scope.logo == "AT&T")                  return "img/logo-att.png";
                    if ($scope.logo == "Sprint")                return "img/logo-sprint.png";
                    if ($scope.logo == "Straight Talk")         return "img/logo-straighttalk.png";
                    if ($scope.logo == "Verizon")               return "img/logo-verizon.png";
                    if ($scope.logo == "Walmart Family Mobile") return "img/logo-walmart-family-mobile.png";
                    if ($scope.logo == "Android")               return "img/logo-android.png";
                    if ($scope.logo == "Basic Phone")           return "img/logo-basic-phone.png";
                    if ($scope.logo == "BlackBerry")            return "img/logo-blackberry.png";
                    if ($scope.logo == "iOS")                   return "img/logo-apple.png";
                    if ($scope.logo == "Windows Phone")         return "img/logo-windows.png";
                });
            });
        }
    };
});


app.directive('emailModal', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/email-modal.html'
    };
});


app.directive('spinner', function() {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="spinner-backdrop"><div class="spinner"></div></div>'
    };
});


app.directive('templateNoResults', function() {
    return {
        restrict: 'E',
        template: '<div ng-show="emptyResult" class="no-products-message">Sorry, no matches found<br><a ng-show="!updated" class="btn primary sm" href="selector">Start Over</a> </div>'
    };
});

app.directive('onSingleParse', function() {
    return {
        restrict: 'A',
        link: function($scope) {
            console.log('ran');
        }
    };
});