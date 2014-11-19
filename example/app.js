angular.module('ExampleCtrl', []).controller('ExampleCtrl', ['$scope',
    function($scope) {

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        $scope.generateItems = function() {
            $scope.items = [];

            var itemCount = getRandomInt(4, 50);

            for (var i = 0; i < itemCount; i++) {

                $scope.items[i] = {
                    ratio: Math.max(0.5, Math.random() * 2),
                    color: '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
                };

            }
        };

        $scope.generateItems();

    }
]);

angular.module('ExampleApp', ['hj.gridflex', 'ExampleCtrl']).config(function() {});
