/*

    Name: angular-gridflex
    Description: Angular directive that creates a justified grid of elements using flexbox
    Author: jameshomer85@gmail.com
    Licence: MIT

    Example usage:

    A `data-ratio` attribute is required to calculate to determine sizes and layout, this should
    be calculated as `width / height`, alternatively `ratio` available on the item scope

        <style type="text/css">
            .gridflex {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
            }
        </style>

        <div class="gridflex" hj-gridflex="{itemSelector: '.item', perRow: 5, averageRatio: 1.5, gutter: 2, repeatCollection: 'items', repeatVariable: 'item'}">
                
            <div ng-repeat="item in items" class="item" data-ratio="{{item.ratio}}"></div>

        </div>

*/
(function() {
    'use strict';

    angular.module('hj.gridflex', []).directive('hjGridflex', ['$log', '$timeout', '$window',
        function($log, $timeout, $window) {
            return {
                restrict: 'A',
                link: function link(scope, element, attrs) {

                    var targets,

                        defaults = {
                            itemSelector: '.item',
                            perRow: 5,
                            gutter: 0,
                            verticalGutter: 'right',
                            horizontalGutter: 'bottom',
                            ratioAttribute: 'ratio'
                            // averageRatio: 1.5 // optionally try to balance rows by working in combination with `perRow`
                            // maxRowHeight: 100 // rows will not exceed this height, use in combination with `alignment`
                            // minRowLength: 5 // optionally make rows longer than this fill the available width
                            // repeatCollection: 'items' // collection to watch for changes,
                            // repeatVariable: 'item' // variable name in repeat scope from which to get sizes
                        },

                        options = angular.extend(defaults, scope.$eval(attrs.hjGridflex));

                    var _prop = function(propName) {
                        if (typeof(options[propName]) === 'string') {
                            if (typeof(scope[options[propName]]) === 'function') {
                                return scope[options[propName]]();
                            } else {
                                $log.error('hjGridflex: ' + propName + ' is not a function');
                                return null;
                            }
                        } else if (typeof(options[propName]) === 'function') {
                            return options[propName]();
                        } else if (typeof(options[propName]) === 'number') {
                            return options[propName];
                        } else if (typeof(options[propName]) === 'object') {
                            $log.error('hjGridflex: ' + propName + ' is not valid');
                        }
                    };

                    var _getOpts = function() {
                        return {
                            perRow: _prop('perRow'),
                            gutter: _prop('gutter'),
                            verticalGutter: options.verticalGutter,
                            horizontalGutter: options.horizontalGutter,
                            averageRatio: options.averageRatio !== undefined ? _prop('averageRatio') : 0,
                            maxRowHeight: options.maxRowHeight !== undefined ? _prop('maxRowHeight') : 0,
                            minRowLength: options.minRowLength !== undefined ? _prop('minRowLength') : -1
                        };
                    };

                    var prevOpts = {};

                    var _resize = function(force) {
                        force = force || false;

                        var opts = _getOpts();

                        if (!force && angular.equals(opts, prevOpts)) {
                            return;
                        }

                        prevOpts = opts;

                        var elementWidth = element[0].clientWidth,
                            rowRatio = 0,
                            totalRatio = 0,
                            rows = [];

                        var row = {
                            items: []
                        };

                        angular.forEach(targets, function(item) {
                            item = angular.element(item);

                            item.ratio = options.repeatVariable ? item.scope()[options.repeatVariable][options.ratioAttribute] : Number(item.attr('data-' + options.ratioAttribute));
                            item.inverseRatio = 1 / item.ratio;

                            if (options.repeatVariable) {
                                item.scope()[options.repeatVariable].inverseRatio = item.inverseRatio;
                            }

                            if (opts.averageRatio) {
                                // check if total averageRatio has been exceeded for the row or if row will exceed maxRowHeight - if true create new row
                                if (rowRatio + item.ratio > opts.averageRatio * opts.perRow && (opts.maxRowHeight === 0 || (opts.maxRowHeight > 0 && elementWidth * (1 / rowRatio) < opts.maxRowHeight))) {
                                    row.ratio = rowRatio;
                                    rows.push(row);

                                    row = {
                                        items: []
                                    };
                                    rowRatio = 0;
                                }
                            } else {
                                if (row.items.length === opts.perRow) {
                                    row.ratio = rowRatio;
                                    rows.push(row);

                                    row = {
                                        items: []
                                    };
                                    rowRatio = 0;
                                }
                            }

                            rowRatio += item.ratio;

                            row.items.push(item);
                        });

                        row.ratio = rowRatio;
                        rows.push(row);

                        angular.forEach(rows, function(row, i) {
                            var lastRowFillWidth = i === rows.length - 1 && rows.length > 1 && row.items.length < opts.minRowLength;

                            // if this is the last row then figure out what ratio to use (may want items to fill width or may want items to use average height)
                            rowRatio = lastRowFillWidth && totalRatio > 0 ? Math.max(totalRatio / (rows.length - 1), row.ratio) : row.ratio;

                            totalRatio += rowRatio;

                            angular.forEach(row.items, function(item, ii) {
                                item.removeClass('gridflex-row-start');
                                item.removeClass('gridflex-row-end');

                                if (ii === 0) {
                                    item.addClass('gridflex-row-start');

                                } else if (ii === row.items.length - 1) {
                                    item.addClass('gridflex-row-end');
                                }

                                var flexWidth = (item.ratio / rowRatio) * (100 - ((lastRowFillWidth ? ((targets.length - row.items.length) / (rows.length - 1)) - 1 : row.items.length - 1) * opts.gutter)) + '%',
                                    flex = '0 1 ' + flexWidth;

                                var css = {
                                    '-webkit-box-flex': flex,
                                    '-moz-box-flex': flex,
                                    'width': flexWidth,
                                    '-webkit-flex': flex,
                                    '-ms-flex': flex,
                                    'flex': flex
                                };

                                css['margin-' + opts.verticalGutter] = (ii === row.items.length - 1 ? 0 : opts.gutter) * (elementWidth / 100) + 'px';
                                css['margin-' + opts.horizontalGutter] = (i === rows.length - 1 ? 0 : opts.gutter) * (elementWidth / 100) + 'px';

                                item.css(css);
                            });
                        });
                    };

                    var throttleOnAnimationFrame = function(func) {
                        var timeout;
                        return function() {
                            var context = this,
                                args = arguments;
                            $window.cancelAnimationFrame(timeout);
                            timeout = $window.requestAnimationFrame(function() {
                                func.apply(context, args);
                                timeout = null;
                            });
                        };
                    };

                    var _throttledResize = throttleOnAnimationFrame(_resize);

                    angular.element($window).on('resize', _throttledResize);

                    var _init = function() {
                        targets = angular.element(element[0].querySelectorAll(options.itemSelector));

                        _resize(true);

                        $timeout(function() {
                            _resize(true); // trigger resize a second time just in case scrollbars kicked in
                        });
                    };

                    $timeout(_init); // wait for ng-repeat elements to be rendered

                    if (options.repeatCollection) {
                        scope.$watchCollection(options.repeatCollection, function() {
                            _init();
                        });
                    }

                    scope.$on('$destroy', function() {
                        angular.element($window).off('resize', _throttledResize);
                    });

                }
            };
        }
    ]);

})();
