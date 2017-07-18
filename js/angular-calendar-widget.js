angular.module('angularFlatCalendar', []).directive('calendarWidgetDirective', function () {
    return {
        restrict: 'E',
        templateUrl: 'template.htm',
        controller: function($scope) {
          $scope.acw_weekdays_names = $scope.acw_weekdays_names ? $scope.acw_weekdays_names : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          $scope.acw_weekdays_short = $scope.acw_weekdays_short ? $scope.acw_weekdays_short : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          $scope.acw_month_names = $scope.acw_month_names ? $scope.acw_month_names : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

          var today = new Date();
          var currentMonth = today.getMonth();
          var currentMonthName = $scope.acw_month_names[currentMonth];
          var currentYear = today.getFullYear();

          $scope.acw_selectedDate = today;
          $scope.acw_currentMonth = currentMonth;
          $scope.acw_currentMonthName = currentMonthName;
          $scope.acw_currentYear = currentYear;
          $scope.acw_currentMonthName = currentMonthName;
          $scope.acw_today = today;
          $scope.acw_events = {};

          // Functions

          function daysInMonth(month, year) {
            return new Date(year, month+1, 0).getDate();
          }

          function getFirstWeekday(month, year) {
            return new Date(year, month, 1).getDay();
          }

          function changeMonth(month, year, value) {
            if (value == 1) {
              month += 1;

              if (month > 11) {
                month = 0;
                year += 1;
              }
            } else if (value == -1) {
              month -= 1;

              if (month < 0) {
                month = 11;
                year -= 1;
              }
            } else {
              console.error('An invalid value was entered. (Accepted: 1 or -1)');
              month = 0;
              year = 1970;
            }

            return {
              'month': month,
              'year': year
            };
          }

          function breakIntoWeeks(array, weeks) {
            var daysPerWeek = [];
            for(var i = 0; i < 6; i++) {
              daysPerWeek[i] = array.slice(7*i, 7*(i+1));
            }

            return daysPerWeek;
          }

          // Scope functions

          $scope.acw_populateVisibleDays = function() {
            var visibleDays = [];
            var day = 1;
            var firstWeekday = getFirstWeekday($scope.acw_currentMonth, $scope.acw_currentYear);
            var monthLength = daysInMonth($scope.acw_currentMonth, $scope.acw_currentYear);

            for (var i = firstWeekday; day <= monthLength; i++) {
              visibleDays[i] = {
                'day': day,
                'month': parseInt($scope.acw_currentMonth)+1,
                'year': $scope.acw_currentYear
              };
              day++;
            }

            var previousMonthYear = changeMonth($scope.acw_currentMonth, $scope.acw_currentYear, -1);
            var previousMonth = previousMonthYear['month'];
            var previousYear = previousMonthYear['year'];
            var previousMonthLength = daysInMonth(previousMonth, previousYear);

            for (i = firstWeekday-1; i >= 0; i--) {
              visibleDays[i] = {
                'day': previousMonthLength,
                'month': parseInt(previousMonth+1),
                'year': previousYear
              };
              previousMonthLength -= 1;
            }

            var nextMonthYear = changeMonth($scope.acw_currentMonth, $scope.acw_currentYear, 1);
            var nextMonth = nextMonthYear['month'];
            var nextYear = nextMonthYear['year'];
            day = 1;

            for (i = firstWeekday+monthLength; i < 42; i++) {
              visibleDays[i] = {
                'day': day,
                'month': parseInt(nextMonth+1),
                'year': nextYear
              };
              day++;
            }

            console.log(breakIntoWeeks(visibleDays, 6));
            return breakIntoWeeks(visibleDays, 6);
          }

          $scope.acw_shiftMonth = function(value) {
            var monthYear = changeMonth($scope.acw_currentMonth, $scope.acw_currentYear, value);
            $scope.acw_currentMonth = monthYear['month'];
            $scope.acw_currentYear = monthYear['year'];
            $scope.acw_currentMonthName = $scope.acw_month_names[$scope.acw_currentMonth];
            $scope.acw_weeks = $scope.acw_populateVisibleDays();
          }

          $scope.acw_isToday = function(day, month, year) {
            var today = new Date();
            return day == today.getDate() && month == today.getMonth()+1 && year == today.getFullYear();
          }

          $scope.acw_setSelectedDate = function(day, month, year) {
            $scope.acw_selectedDate = new Date(year, month-1, day);
            if (month-1 != $scope.acw_currentMonth) {
              $scope.acw_currentMonth = month-1;
              $scope.acw_currentMonthName = $scope.acw_month_names[$scope.acw_currentMonth];
              $scope.acw_weeks = $scope.acw_populateVisibleDays();
            }
          }

          $scope.acw_formatDate = function(date) {
            if (typeof(date.getDate) != 'undefined') {
              return date.getDate() + '/' + (parseInt(date.getMonth())+1) + '/' + date.getFullYear();
            } else if (date['day'] && date['month'] && date['year']) {
              return date['day'] + '/' + date['month'] + '/' + date['year'];
            }
          }

          $scope.acw_addEvent = function(title, date) {
            if (!$scope.acw_events[date.getFullYear()]) {
              $scope.acw_events[date.getFullYear()] = {};
            }

            if (!$scope.acw_events[date.getFullYear()][date.getMonth()+1]) {
              $scope.acw_events[date.getFullYear()][date.getMonth()+1] = {};
            }

            if (!$scope.acw_events[date.getFullYear()][date.getMonth()+1][date.getDate()]) {
              $scope.acw_events[date.getFullYear()][date.getMonth()+1][date.getDate()] = [];
            }

            $scope.acw_events[date.getFullYear()][date.getMonth()+1][date.getDate()].push({
              'title': title,
            });

            console.info('Pushed event \''+title+'\' to $scope.acw_events');
            console.log($scope.acw_events);
            $scope.acw_eventTitle = '';
          }

          $scope.acw_dateHasEvents = function(date) {
            if(typeof(date.getDate) != 'undefined') {
              return $scope.acw_events[date.getFullYear()] != undefined &&
              $scope.acw_events[date.getFullYear()][date.getMonth()+1] != undefined &&
              $scope.acw_events[date.getFullYear()][date.getMonth()+1][date.getDate()] != undefined &&
              $scope.acw_events[date.getFullYear()][date.getMonth()+1][date.getDate()].length > 0;
            } else if (date['day'] && date['month'] && date['year']) {
              $scope.acw_events[date['year']] != undefined &&
              $scope.acw_events[date['year']][date['month']] != undefined &&
              $scope.acw_events[date['year']][date['month']][date['day']] != undefined &&
              $scope.acw_events[date['year']][date['month']][date['day']].length > 0;
            } else {
              console.error('Malformed object.');
              return false;
            }
          }

          $scope.acw_getEvents = function(date) {
            if ($scope.acw_dateHasEvents(date)) {
              if(typeof(date.getDate) != undefined)
                return $scope.acw_events[date.getFullYear()][date.getMonth()+1][date.getDate()];
              else if (date['day'] && date['month'] && date['year'])
                return $scope.acw_events[date['year']][date['month']][date['day']];
              else
                return [];
            }
          }

          $scope.acw_createNewDate = function(day, month, year) {
            return new Date(year, month-1, day);
          }

          $scope.acw_weeks = $scope.acw_populateVisibleDays();
        }
    };
});
