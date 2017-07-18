var myApp = angular.module('calendarWidget', ['angularFlatCalendar']);

myApp.controller('MainController', function($scope) {
  $scope.weekdays_short = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  $scope.month_names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio',
  'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
});
