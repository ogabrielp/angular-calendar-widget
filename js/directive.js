angular.module('calendarWidget').directive('calendarWidgetDirective', function () {
    return {
        restrict: 'E',
        templateUrl: 'template.htm',
        controller: function($scope) {
          $scope.weekdays_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          $scope.weekdays_short = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          $scope.month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

          var today = new Date();
          var currentMonth = today.getMonth();
          var currentMonthName = $scope.month_names[currentMonth];
          var currentYear = today.getFullYear();

          var amountOfDaysCurrentMonth = daysInMonth(currentMonth, currentYear);
          var amountOfDaysNextMonth = -1;
          var amountOfDaysPreviousMonth = -1;

          if (currentMonth+1 > 11)
            amountOfDaysNextMonth = daysInMonth(0, currentYear+1);
          else
            amountOfDaysNextMonth = daysInMonth(currentMonth+1, currentYear);

          if (currentMonth-1 < 0)
            amountOfDaysPreviousMonth = daysInMonth(11, currentYear-1);
          else
            amountOfDaysPreviousMonth = daysInMonth(currentMonth-1, currentYear);

          $scope.selectedDate = today;
          $scope.currentMonth = currentMonth;
          $scope.currentMonthName = currentMonthName;
          $scope.currentYear = currentYear;
          $scope.currentMonthName = currentMonthName;
          $scope.today = today;
          $scope.events = {};

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

          $scope.populateVisibleDays = function() {
            var visibleDays = [];
            var day = 1;
            var firstWeekday = getFirstWeekday($scope.currentMonth, $scope.currentYear);
            var monthLength = daysInMonth($scope.currentMonth, $scope.currentYear);

            for (var i = firstWeekday; day <= monthLength; i++) {
              visibleDays[i] = {
                'day': day,
                'month': parseInt($scope.currentMonth)+1,
                'year': $scope.currentYear
              };
              day++;
            }

            var previousMonthYear = changeMonth($scope.currentMonth, $scope.currentYear, -1);
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

            var nextMonthYear = changeMonth($scope.currentMonth, $scope.currentYear, 1);
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

          $scope.shiftMonth = function(value) {
            var monthYear = changeMonth($scope.currentMonth, $scope.currentYear, value);
            $scope.currentMonth = monthYear['month'];
            $scope.currentYear = monthYear['year'];
            $scope.currentMonthName = $scope.month_names[$scope.currentMonth];
            $scope.weeks = $scope.populateVisibleDays();
          }

          $scope.isToday = function(day, month, year) {
            var today = new Date();
            return day == today.getDate() && month == today.getMonth()+1 && year == today.getFullYear();
          }

          $scope.setSelectedDate = function(day, month, year) {
            $scope.selectedDate = new Date(year, month-1, day);
            if (month-1 != $scope.currentMonth) {
              $scope.currentMonth = month-1;
              $scope.currentMonthName = $scope.month_names[$scope.currentMonth];
              $scope.weeks = $scope.populateVisibleDays();
            }
          }

          $scope.formatDate = function(date) {
            if (typeof(date.getDate) != 'undefined') {
              return date.getDate() + '/' + (parseInt(date.getMonth())+1) + '/' + date.getFullYear();
            } else if (date['day'] && date['month'] && date['year']) {
              return date['day'] + '/' + date['month'] + '/' + date['year'];
            }
          }

          $scope.addEvent = function(title, date) {
            if (!$scope.events[date.getFullYear()]) {
              $scope.events[date.getFullYear()] = {};
            }

            if (!$scope.events[date.getFullYear()][date.getMonth()+1]) {
              $scope.events[date.getFullYear()][date.getMonth()+1] = {};
            }

            if (!$scope.events[date.getFullYear()][date.getMonth()+1][date.getDate()]) {
              $scope.events[date.getFullYear()][date.getMonth()+1][date.getDate()] = [];
            }

            $scope.events[date.getFullYear()][date.getMonth()+1][date.getDate()].push({
              'title': title,
            });

            console.info('Pushed event \''+title+'\' to $scope.events');
            console.log($scope.events);
            $scope.eventTitle = '';
          }

          $scope.dateHasEvents = function(date) {
            if(typeof(date.getDate) != 'undefined') {
              return $scope.events[date.getFullYear()] != undefined &&
              $scope.events[date.getFullYear()][date.getMonth()+1] != undefined &&
              $scope.events[date.getFullYear()][date.getMonth()+1][date.getDate()] != undefined &&
              $scope.events[date.getFullYear()][date.getMonth()+1][date.getDate()].length > 0;
            } else if (date['day'] && date['month'] && date['year']) {
              $scope.events[date['year']] != undefined &&
              $scope.events[date['year']][date['month']] != undefined &&
              $scope.events[date['year']][date['month']][date['day']] != undefined &&
              $scope.events[date['year']][date['month']][date['day']].length > 0;
            } else {
              console.error('Malformed object.');
              return false;
            }
          }

          $scope.getEvents = function(date) {
            if ($scope.dateHasEvents(date)) {
              if(typeof(date.getDate) != undefined)
                return $scope.events[date.getFullYear()][date.getMonth()+1][date.getDate()];
              else if (date['day'] && date['month'] && date['year'])
                return $scope.events[date['year']][date['month']][date['day']];
              else
                return [];
            }
          }

          $scope.createNewDate = function(day, month, year) {
            return new Date(year, month-1, day);
          }

          $scope.weeks = $scope.populateVisibleDays();
        }
    };
});
