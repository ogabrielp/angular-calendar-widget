angular.module('angularFlatCalendar', []).directive('calendarWidgetDirective', function () {
    return {
        restrict: 'E',
        template: '<div id=\'angular-flat-calendar\'>'+
          '<div id=\'calendar-header\' style=\'display: flex\'>'+
            '<div id=\'calendar-header-month-year-container\' ng-if="!acw.header_year_first">'+
              '<span id="calendar-header-month-year-container-month">{{acw.currentMonthName}}</span>'+
              '<span id="calendar-header-month-year-container-separator">{{acw.header_separator}}</span>'+
              '<span id="calendar-header-month-year-container-year">{{acw.currentYear}}</span>'+
            '</div>'+
            '<div id=\'calendar-header-month-year-container\' ng-if="acw.header_year_first">'+
              '<span id="calendar-header-month-year-container-year">{{acw.currentYear}}</span>'+
              '<span id="calendar-header-month-year-container-separator">{{acw.header_separator}}</span>'+
              '<span id="calendar-header-month-year-container-month">{{acw.currentMonthName}}</span>'+
            '</div>'+
            '<div id=\'calendar-header-previous-month\' ng-click="acw.shiftMonth(-1)">'+
              '<span>{{acw.header_previous}}</span>'+
            '</div>'+
            '<div id=\'calendar-header-today\' ng-click="acw.setSelectedDate(acw.today.getDate(), acw.today.getMonth()+1, acw.today.getFullYear())">'+
              '<span>{{acw.header_today}}</span>'+
            '</div>'+
            '<div id=\'calendar-header-next-month\' ng-click="acw.shiftMonth(1)">'+
              '<span>{{acw.header_next}}</span>'+
            '</div>'+
          '</div>'+
          '<div id=\'calendar-days\'>'+
            '<table>'+
              '<tr id=\'calendar-days-weekdays-name\'>'+
                '<td ng-repeat="weekday in acw.weekdays_short track by $index">'+
                  '{{weekday}}'+
                '</td>'+
              '</tr>'+
              '<tr class="calendar-days-week" ng-repeat="week in acw.weeks track by $index" ng-attr-id="calendar-days-week-{{$index+1}}">'+
                '<td ng-repeat="day in week"'+
                    'ng-attr-id="calendar-day-date-{{day.day}}-{{day.month}}-{{day.year}}"'+
                    'class="calendar-day"'+
                    'ng-class="{\'calendar-day-today\': acw.isToday(day.day, day.month, day.year), \'disabled\': day.month != acw.currentMonth+1, \'selected\': acw.formatDate(day) == acw.formatDate(acw.selectedDate), \'has-events\': acw.dateHasEvents(acw.createNewDate(day.day, day.month, day.year))}"'+
                    'ng-click="acw.setSelectedDate(day.day, day.month, day.year)">'+
                  '<span>{{day.day}}</span>'+
                '</td>'+
              '</tr>'+
            '</table>'+
          '</div>'+
        '</div>'+
        '{{acw.today}}',
        controller: function($rootScope, $scope) {
          $scope['acw'] = {};
          $scope['acw'].weekdays_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          $scope['acw'].weekdays_short = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          $scope['acw'].month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          console.log($scope['acw']);

          var today = new Date();
          var currentMonth = today.getMonth();
          var currentMonthName = $scope['acw'].month_names[currentMonth];
          var currentYear = today.getFullYear();

          $scope['acw'].selectedDate = today;
          $scope['acw'].currentMonth = currentMonth;
          $scope['acw'].currentMonthName = currentMonthName;
          $scope['acw'].currentYear = currentYear;
          $scope['acw'].currentMonthName = currentMonthName;
          $scope['acw'].today = today;
          $scope['acw'].events = {};

          $scope['acw'].header_separator = ' | ';
          $scope['acw'].header_previous = '<';
          $scope['acw'].header_today = '●';
          $scope['acw'].header_next = '>';
          $scope['acw'].header_year_first = true;

          $scope['acw'].previousMonthCallback = function(){};
          $scope['acw'].nextMonthCallback = function(){};
          $scope['acw'].selectDateCallback = function(){};

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

          $scope['acw'].populateVisibleDays = function() {
            var visibleDays = [];
            var day = 1;
            var firstWeekday = getFirstWeekday($scope['acw'].currentMonth, $scope['acw'].currentYear);
            var monthLength = daysInMonth($scope['acw'].currentMonth, $scope['acw'].currentYear);

            for (var i = firstWeekday; day <= monthLength; i++) {
              visibleDays[i] = {
                'day': day,
                'month': parseInt($scope['acw'].currentMonth)+1,
                'year': $scope['acw'].currentYear
              };
              day++;
            }

            var previousMonthYear = changeMonth($scope['acw'].currentMonth, $scope['acw'].currentYear, -1);
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

            var nextMonthYear = changeMonth($scope['acw'].currentMonth, $scope['acw'].currentYear, 1);
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

            return breakIntoWeeks(visibleDays, 6);
          }

          $scope['acw'].shiftMonth = function(value) {
            var monthYear = changeMonth($scope['acw'].currentMonth, $scope['acw'].currentYear, value);
            if (value == 1)
              $scope['acw'].nextMonthCallback();
            else if (value == -1)
              $scope['acw'].previousMonthCallback();

            $scope['acw'].currentMonth = monthYear['month'];
            $scope['acw'].currentYear = monthYear['year'];
            $scope['acw'].currentMonthName = $scope['acw'].month_names[$scope['acw'].currentMonth];
            $scope['acw'].weeks = $scope['acw'].populateVisibleDays();
          }

          $scope['acw'].isToday = function(day, month, year) {
            var today = new Date();
            return day == today.getDate() && month == today.getMonth()+1 && year == today.getFullYear();
          }

          $scope['acw'].setSelectedDate = function(day, month, year) {
            $scope['acw'].selectedDate = new Date(year, month-1, day);
            console.log('setting selected date to '+$scope['acw'].selectedDate);
            if (month-1 != $scope['acw'].currentMonth) {
              $scope['acw'].currentMonth = month-1;
              $scope['acw'].currentMonthName = $scope['acw'].month_names[$scope['acw'].currentMonth];
              $scope['acw'].weeks = $scope['acw'].populateVisibleDays();
            }
            if (year != $scope['acw'].currentYear) {
              $scope['acw'].currentYear = year;
              $scope['acw'].weeks = $scope['acw'].populateVisibleDays();
            }
            $scope['acw'].selectDateCallback();
          }

          $scope['acw'].formatDate = function(date) {
            if (typeof(date.getDate) != 'undefined') {
              return date.getDate() + '/' + (parseInt(date.getMonth())+1) + '/' + date.getFullYear();
            } else if (date['day'] && date['month'] && date['year']) {
              return date['day'] + '/' + date['month'] + '/' + date['year'];
            }
          }

          $scope['acw'].addEvent = function(title, date) {
            if (!$scope['acw'].events[date.getFullYear()]) {
              $scope['acw'].events[date.getFullYear()] = {};
            }

            if (!$scope['acw'].events[date.getFullYear()][date.getMonth()+1]) {
              $scope['acw'].events[date.getFullYear()][date.getMonth()+1] = {};
            }

            if (!$scope['acw'].events[date.getFullYear()][date.getMonth()+1][date.getDate()]) {
              $scope['acw'].events[date.getFullYear()][date.getMonth()+1][date.getDate()] = [];
            }

            $scope['acw'].events[date.getFullYear()][date.getMonth()+1][date.getDate()].push({
              'title': title,
            });

            $scope['acw'].eventTitle = '';
          }

          $scope['acw'].dateHasEvents = function(date) {
            if(typeof(date.getDate) != 'undefined') {
              return $scope['acw'].events[date.getFullYear()] != undefined &&
              $scope['acw'].events[date.getFullYear()][date.getMonth()+1] != undefined &&
              $scope['acw'].events[date.getFullYear()][date.getMonth()+1][date.getDate()] != undefined &&
              $scope['acw'].events[date.getFullYear()][date.getMonth()+1][date.getDate()].length > 0;
            } else if (date['day'] && date['month'] && date['year']) {
              $scope['acw'].events[date['year']] != undefined &&
              $scope['acw'].events[date['year']][date['month']] != undefined &&
              $scope['acw'].events[date['year']][date['month']][date['day']] != undefined &&
              $scope['acw'].events[date['year']][date['month']][date['day']].length > 0;
            } else {
              console.error('Malformed object.');
              return false;
            }
          }

          $scope['acw'].getEvents = function(date) {
            if ($scope['acw'].dateHasEvents(date)) {
              if(typeof(date.getDate) != undefined)
                return $scope['acw'].events[date.getFullYear()][date.getMonth()+1][date.getDate()];
              else if (date['day'] && date['month'] && date['year'])
                return $scope['acw'].events[date['year']][date['month']][date['day']];
              else
                return [];
            }
          }

          $scope['acw'].createNewDate = function(day, month, year) {
            return new Date(year, month-1, day);
          }

          $scope['acw'].weeks = $scope['acw'].populateVisibleDays();
          $scope.$emit('angular-calendar-widget-loaded');
        }
    };
});
