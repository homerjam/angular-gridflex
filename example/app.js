angular.module('ExampleCtrl', []).controller('ExampleCtrl', ['$scope',
    function($scope) {

        $scope.items = [];

        $scope.generateItems = function() {
            for (var i = 0; i < 50; i++) {

                $scope.items[i] = {
                    ratio: Math.random() * 2,
                    color: '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
                };

            }
        };

        $scope.generateItems();

    }
]);

angular.module('ExampleApp', ['angular-gridflex', 'ExampleCtrl']).config(function() {});
