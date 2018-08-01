/**
 * http://www.privacyidea.org
 * (c) cornelius kölbel, cornelius@privacyidea.org
 *
 * 2018-07-31 Friedrich Weber, <friedrich.weber@netknights.it>
 *
 * This code is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This code is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
myApp.controller("periodicTaskController", function($scope, $stateParams, $state,
                                             $location, ConfigFactory) {
    if ($location.path() === "/config/periodictasks") {
        $location.path("/config/periodictasks/list");
    }
    $('html,body').scrollTop(0);

    $scope.getPeriodicTasks = function () {
        ConfigFactory.getPeriodicTasks(function(data) {
            $scope.periodictasks = data.result.value;
        });
    };

    $scope.delPeriodicTask = function (ptaskid) {
        ConfigFactory.delPeriodicTask(ptaskid, function(data) {
            $scope.getPeriodicTasks();
            $state.go("config.periodictasks.list");
        });
    };

    $scope.enablePeriodicTask = function (ptaskid) {
        ConfigFactory.enablePeriodicTask(ptaskid, function () {
            $scope.getPeriodicTasks();
        });
    };

    $scope.disablePeriodicTask = function (ptaskid) {
        ConfigFactory.disablePeriodicTask(ptaskid, function () {
            $scope.getPeriodicTasks();
        });
    };

    // Get all tasks
    $scope.getPeriodicTasks();

    // listen to the reload broadcast
    $scope.$on("piReload", $scope.getPeriodicTasks);
});

myApp.controller("periodicTaskDetailController", function($scope, $stateParams, ConfigFactory, $state) {
    // init
    $scope.form = {};
    $scope.ptaskid = $stateParams.ptaskid;
    $scope.opts = {};
    $('html,body').scrollTop(0);

    $scope.getAvailableNodes = function () {
        ConfigFactory.getNodes(function(response) {
            // prepare the input model for the multi-select box
            $scope.availableNodes = [];
            angular.forEach(response.result.value, function (node) {
                $scope.availableNodes.push({
                    "name": node,
                    "ticked": false,
                });
            });
        });
    }

    $scope.taskmoduleChanged = function () {
        $scope.getTaskmoduleOptions();
    }

    $scope.getTaskmoduleOptions = function () {
        ConfigFactory.getPeriodicTaskmoduleOptions($scope.form.taskmodule, function(response) {
            var taskmoduleOptions = response.result.value;
            $scope.taskmoduleOptions = taskmoduleOptions;
        });
    }

    $scope.getPeriodicTask = function () {
        ConfigFactory.getPeriodicTask($scope.ptaskid, function(response1) {
            var ptask = response1.result.value;
            $scope.form = ptask;
            // tick the appropriate nodes
            angular.forEach($scope.availableNodes, function (row) {
                row["ticked"] = ptask.nodes.indexOf(row.name) >= 0;
            });
            $scope.getTaskmoduleOptions();
        });
    };
    $scope.getTaskModules = function () {
        ConfigFactory.getPeriodicTaskmodules(function(data) {
            $scope.taskmodules = data.result.value;
        });
    };

    $scope.createPeriodicTask = function () {
        // get list of nodes from multi-select box
        var nodes = [];
        angular.forEach($scope.selectedNodes, function(node) {
            if (node.ticked) {
                nodes.push(node.name);
            };
        });
        var params = {
            "interval": $scope.form.interval,
            "name": $scope.form.name,
            "taskmodule": $scope.form.taskmodule,
            "nodes": nodes.join(", "),
            "options": $scope.form.options,
        };
        if($scope.ptaskid) {
            params["id"] = $scope.ptaskid;
        }
        ConfigFactory.setPeriodicTask(params, function() {
            $state.go("config.periodictasks.list");
        });
        $('html,body').scrollTop(0);
    };

    $scope.enablePeriodicTask = function (ptaskid) {
        ConfigFactory.enablePeriodicTask(ptaskid, function () {
            $scope.getPeriodicTask();
        });
    };

    $scope.disablePeriodicTask = function (ptaskid) {
        ConfigFactory.disablePeriodicTask(ptaskid, function () {
            $scope.getPeriodicTask();
        });
    };

    $scope.getTaskModules();
    $scope.getAvailableNodes();
    if ($scope.ptaskid) {
        $scope.getPeriodicTask();
    }

});