var myApp = angular.module('calendarWidget', ['angularFlatCalendar']);

myApp.controller('MainController', function($scope) {
  $scope.acw_weekdays_short = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  $scope.acw_month_names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio',
  'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
});
