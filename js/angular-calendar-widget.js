angular.module('angularCalendarWidget', []).directive('calendarWidget', function () {
    return {
        restrict: 'E',
        template: '<div id=\'angular-calendar-widget\'>'+
          '<div id=\'calendar-header\' style=\'display: flex\'>'+
            '<div id=\'calendar-header-month-year-container\' ng-click="acw.switchView()" ng-if="!acw.header_year_first">'+
              '<span id="calendar-header-month-year-container-month" ng-show="acw.currentView == acw.CALENDAR_VIEWS.DAY">{{acw.currentlyViewingMonthName}}</span>'+
              '<span id="calendar-header-month-year-container-separator"  ng-show="acw.currentView == acw.CALENDAR_VIEWS.DAY">{{acw.header_separator}}</span>'+
              '<span id="calendar-header-month-year-container-year">{{acw.currentlyViewingYear}}</span>'+
              '<span id="calendar-header-month-year-container-decades" ng-show="acw.currentView == acw.CALENDAR_VIEWS.YEAR">{{acw.currentlyViewingDecades.start}} - {{acw.currentlyViewingDecades.end}}'+
            '</div>'+
            '<div id=\'calendar-header-month-year-container\' ng-click="acw.switchView()" ng-if="acw.header_year_first">'+
              '<span id="calendar-header-month-year-container-year" ng-show="acw.currentView != acw.CALENDAR_VIEWS.YEAR">{{acw.currentlyViewingYear}}</span>'+
              '<span id="calendar-header-month-year-container-separator" ng-show="acw.currentView == acw.CALENDAR_VIEWS.DAY">{{acw.header_separator}}</span>'+
              '<span id="calendar-header-month-year-container-month" ng-show="acw.currentView == acw.CALENDAR_VIEWS.DAY">{{acw.currentlyViewingMonthName}}</span>'+
              '<span id="calendar-header-month-year-container-decades" ng-show="acw.currentView == acw.CALENDAR_VIEWS.YEAR">{{acw.currentlyViewingDecades.start}} - {{acw.currentlyViewingDecades.end}}'+
            '</div>'+
            '<div id=\'calendar-header-previous-month\' ng-click="acw.viewPrevious()">'+
              '<span>{{acw.header_previous}}</span>'+
            '</div>'+
            '<div id=\'calendar-header-today\' ng-click="acw.setSelectedDate(acw.today)">'+
              '<span>{{acw.header_today}}</span>'+
            '</div>'+
            '<div id=\'calendar-header-next-month\' ng-click="acw.viewNext()">'+
              '<span>{{acw.header_next}}</span>'+
            '</div>'+
          '</div>'+
          '<div id="calendar-view">'+
            '<div id=\'calendar-days\' ng-if="acw.currentView == acw.CALENDAR_VIEWS.DAY">'+
              '<table>'+
                '<tr id=\'calendar-days-weekdays-name\'>'+
                  '<td ng-repeat="weekday in acw.weekdays_short track by $index">'+
                    '{{weekday}}'+
                  '</td>'+
                '</tr>'+
                '<tr class="calendar-days-week" ng-repeat="week in acw.weeks track by $index" ng-attr-id="calendar-days-week-{{$index+1}}">'+
                  '<td ng-repeat="day in week"'+
                      'ng-attr-id="calendar-day-date-{{day.day}}-{{day.month}}-{{day.year}}"'+
                      'class="calendar-day calendar-day-date-{{day.day}} calendar-day-month-{{day.month}} calendar-day-year-{{day.year}}"'+
                      'ng-class="{\'calendar-day-today\': acw.isToday(day.date), \'disabled\': day.month != acw.currentlyViewingMonth+1, \'selected\': acw.formatDate(day.date) == acw.formatDate(acw.selectedDate), \'has-events\': acw.dateHasEvents(day.date)}"'+
                      'ng-click="acw.setSelectedDate(day.date)">'+
                    '<span>{{day.day}}</span>'+
                  '</td>'+
                '</tr>'+
              '</table>'+
            '</div>'+
            '<div id="calendar-months" ng-if="acw.currentView == acw.CALENDAR_VIEWS.MONTH">'+
              '<table>'+
                '<tr ng-repeat="row in acw.monthsViewData">'+
                  '<td ng-repeat="month in row" ng-click="acw.selectMonth(4*$parent.$index+$index)" ng-class="{\'selected\': acw.selectedDate.getMonth() == ($parent.$index*4+$index)}">'+
                    '{{month}}'+
                  '</td>'+
                '</tr>'+
              '</table>'+
            '</div>'+
            '<div id="calendar-years" ng-if="acw.currentView == acw.CALENDAR_VIEWS.YEAR">'+
              '<table>'+
                '<tr ng-repeat="row in acw.yearsViewData">'+
                  '<td ng-repeat="year in row" ng-click="acw.selectYear(year)">'+
                    '{{year}}'+
                  '</td>'+
                '</tr>'+
              '</table>'+
            '</div>'+
          '</div>'+
        '</div>',
        controller: function($rootScope, $scope) {
          $scope['acw'] = {};
          var acw = $scope['acw'];

          // External declarations (can be altered via their respective setters)
          acw.weekdays_short = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          acw.month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          acw.month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

          acw.header_separator = ' | ';
          acw.header_previous = '<';
          acw.header_today = '●';
          acw.header_next = '>';
          acw.header_year_first = false;

          acw.previousMonthCallback = function(){};
          acw.nextMonthCallback = function(){};
          acw.selectDateCallback = function(){};

          acw.CALENDAR_VIEWS = {
            DAY: 0,
            MONTH: 1,
            YEAR: 2
          }
          acw.currentView = acw.CALENDAR_VIEWS.DAY;

          // Internal declarations (overriding them may lead to inconsistent behaviour)
          acw.today = new Date();
          acw.selectedDate = acw.today
          acw.currentlyViewingMonth = acw.today.getMonth();
          acw.currentlyViewingMonthName = acw.month_names[acw.currentlyViewingMonth];
          acw.currentlyViewingYear = acw.today.getFullYear();
          acw.events = {};

          // Internal functions (not accessible to the library user)
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
            for(var i = 0; i < weeks; i++) {
              daysPerWeek[i] = array.slice(7*i, 7*(i+1));
            }

            return daysPerWeek;
          }

          function calculateDecades() {
            var startingDecade = parseInt(acw.currentlyViewingYear/10);
            startingDecade = startingDecade % 2 == 0 ? startingDecade : startingDecade-1;

            var obj = {};
            obj.start = startingDecade*10+1;
            obj.end = obj.start+19;
            return obj;
          }

          function populateVisibleDays() {
            var visibleDays = [];
            var day = 1;
            var firstWeekday = getFirstWeekday(acw.currentlyViewingMonth, acw.currentlyViewingYear);
            var monthLength = daysInMonth(acw.currentlyViewingMonth, acw.currentlyViewingYear);

            for (var i = firstWeekday; day <= monthLength; i++) {
              visibleDays[i] = {
                'day': day,
                'month': parseInt(acw.currentlyViewingMonth)+1,
                'year': acw.currentlyViewingYear,
              };
              var k = visibleDays[i];
              visibleDays[i].date = new Date(k.year, k.month-1, k.day);
              day++;
            }

            var previousMonthYear = changeMonth(acw.currentlyViewingMonth, acw.currentlyViewingYear, -1);
            var previousMonth = previousMonthYear['month'];
            var previousYear = previousMonthYear['year'];
            var previousMonthLength = daysInMonth(previousMonth, previousYear);

            for (i = firstWeekday-1; i >= 0; i--) {
              visibleDays[i] = {
                'day': previousMonthLength,
                'month': parseInt(previousMonth+1),
                'year': previousYear
              };
              var k = visibleDays[i];
              visibleDays[i].date = new Date(k.year, k.month-1, k.day);
              previousMonthLength -= 1;
            }

            var nextMonthYear = changeMonth(acw.currentlyViewingMonth, acw.currentlyViewingYear, 1);
            var nextMonth = nextMonthYear['month'];
            var nextYear = nextMonthYear['year'];
            day = 1;

            for (i = firstWeekday+monthLength; i < 42; i++) {
              visibleDays[i] = {
                'day': day,
                'month': parseInt(nextMonth+1),
                'year': nextYear
              };
              var k = visibleDays[i];
              visibleDays[i].date = new Date(k.year, k.month-1, k.day);
              day++;
            }

            return breakIntoWeeks(visibleDays, 6);
          }

          function populateVisibleMonths() {
            var months = [];
            var rows = 3;
            var columns = 12/rows;

            for (var i = 0; i < rows; i++) {
              months.push(acw.month_names_short.slice(columns*i, columns*i+columns));
            }
            return months;
          }

          function populateVisibleYears() {
            var years = [];
            var list = [];

            var rows = 4;
            var columns = 20/rows;

            var decades = calculateDecades();

            for(var i = decades.start; i <= decades.end; i++) {
                list.push(i);
            }

            for (i = 0; i < rows; i++) {
              years.push(list.slice(columns*i, columns*i+columns));
            }

            return years;
          }

          // Internal scope functions (should only be used by the directive)
          acw.shiftMonth = function(value) {
            var monthYear = changeMonth(acw.currentlyViewingMonth, acw.currentlyViewingYear, value);

            acw.currentlyViewingMonth = monthYear['month'];
            acw.currentlyViewingYear = monthYear['year'];
            acw.currentlyViewingMonthName = acw.month_names[acw.currentlyViewingMonth];
            acw.weeks = populateVisibleDays();

            if (value == 1)
              acw.nextMonthCallback();
            else if (value == -1)
              acw.previousMonthCallback();
          }

          acw.isToday = function(date) {
            var today = new Date();
            return date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getYear() == today.getYear();
          }

          acw.setSelectedDate = function(date) {
            var month = date.getMonth();
            var year = date.getFullYear();

            acw.selectedDate = date;
            if (month != acw.currentlyViewingMonth) {
              acw.currentlyViewingMonth = month;
              acw.currentlyViewingMonthName = acw.month_names[acw.currentlyViewingMonth];
              acw.weeks = populateVisibleDays();
            }
            if (year != acw.currentlyViewingYear) {
              acw.currentlyViewingYear = year;
              acw.weeks = populateVisibleDays();
              acw.currentlyViewingDecades = calculateDecades();
              acw.yearsViewData = populateVisibleYears();
            }
            acw.currentView = acw.CALENDAR_VIEWS.DAY;
            acw.selectDateCallback();
          }

          acw.formatDate = function(date) {
            return date.getDate() + '/' + (parseInt(date.getMonth())+1) + '/' + date.getFullYear();
          }

          acw.selectMonth = function(value) {
            acw.currentlyViewingMonth = value;
            acw.currentlyViewingMonthName = acw.month_names[value];
            acw.weeks = populateVisibleDays();
            acw.currentView = acw.CALENDAR_VIEWS.DAY;
          }

          acw.selectYear = function(value) {
            acw.currentlyViewingYear = value;
            acw.currentView = acw.CALENDAR_VIEWS.MONTH;
          }

          acw.switchView = function() {
            for (var key in acw.CALENDAR_VIEWS) {
              if (acw.CALENDAR_VIEWS[key] > acw.currentView) {
                acw.currentView++;
                break;
              }
            }
          }

          acw.viewPrevious = function() {
            switch (acw.currentView) {
              case acw.CALENDAR_VIEWS.DAY: {
                acw.shiftMonth(-1);
              } break;
              case acw.CALENDAR_VIEWS.MONTH: {
                acw.currentlyViewingYear--;
                acw.currentlyViewingDecades = calculateDecades();
                acw.yearsViewData = populateVisibleYears();
              } break;
              case acw.CALENDAR_VIEWS.YEAR: {
                acw.currentlyViewingYear -= 20;
                acw.currentlyViewingDecades = calculateDecades();
                acw.yearsViewData = populateVisibleYears();
              } break;
            }
          }

          acw.viewNext = function() {
            switch (acw.currentView) {
              case acw.CALENDAR_VIEWS.DAY: {
                acw.shiftMonth(1);
              } break;
              case acw.CALENDAR_VIEWS.MONTH: {
                acw.currentlyViewingYear++;
                acw.yearsViewData = populateVisibleYears();
                acw.currentlyViewingDecades = calculateDecades();
              } break;
              case acw.CALENDAR_VIEWS.YEAR: {
                acw.currentlyViewingYear += 20;
                acw.yearsViewData = populateVisibleYears();
                acw.currentlyViewingDecades = calculateDecades();
              }
            }
          }

          // External scope functions (can be used by the library user)
          acw.addEvent = function(title, date) {
            if (typeof(date.getDate) == typeof(date.getMonth) &&
                typeof(date.getMonth) == typeof(date.getFullYear) &&
                typeof(date.getFullYear) != 'undefined') {

              if (!acw.events[date.getFullYear()]) {
                acw.events[date.getFullYear()] = {};
              }

              if (!acw.events[date.getFullYear()][date.getMonth()+1]) {
                acw.events[date.getFullYear()][date.getMonth()+1] = {};
              }

              if (!acw.events[date.getFullYear()][date.getMonth()+1][date.getDate()]) {
                acw.events[date.getFullYear()][date.getMonth()+1][date.getDate()] = [];
              }

              acw.events[date.getFullYear()][date.getMonth()+1][date.getDate()].push({
                'title': title,
              });
              return true;
            } else {
              console.error('[addEvent] Mismatched types. You should provide a '+
              'Date object.');
              return false;
            }
          }

          acw.dateHasEvents = function(date) {
            if(typeof(date.getDate) != 'undefined' && typeof(date.getMonth) != 'undefined' &&
               typeof(date.getFullYear) != 'undefined') {
              return acw.events[date.getFullYear()] != undefined &&
              acw.events[date.getFullYear()][date.getMonth()+1] != undefined &&
              acw.events[date.getFullYear()][date.getMonth()+1][date.getDate()] != undefined &&
              acw.events[date.getFullYear()][date.getMonth()+1][date.getDate()].length > 0;
            } else {
              console.error('[dateHasEvents] Mismatched types. You should provide '+
              'a Date object.');
              return false;
            }
          }

          acw.getEvents = function(date) {
            if (acw.dateHasEvents(date)) {
              if(typeof(date.getDate) != undefined)
                return acw.events[date.getFullYear()][date.getMonth()+1][date.getDate()];
              else
                return [];
            }
          }

          // Setters
          acw.setWeekdaysShort = function(array) {
            var validEntries = 0;

            if (array.length == 'undefined') {
              console.error('[setWeekdaysShort] Invalid value. '+
              'Please make sure it is an ARRAY of strings with length == 7.');
            } else if (array.length != 7) {
              console.error('[setWeekdaysShort] Mismatched lengths. '+
              'The array should have length == 7.\n\nActual length: '+array.length);
            } else {
              for (var i = 0; i < array.length; i++) {
                if (typeof(array[i]) != 'string')
                  break;
                else
                  validEntries++;
              }

              if (validEntries == array.length)
                acw.weekdays_short = array;
              else
                console.error('[setWeekdaysShort] Mismatched types. '+
                'One of the items in your array isn\'t a string.\n\n'+
                'Position: '+i+'\nValue: '+array[i]+' (type: '+typeof(array[i])+')');
            }
          }

          acw.setMonthNames = function(array) {
            var validEntries = 0;

            if (array.length == 'undefined') {
              console.error('[setMonthNames] Invalid value. '+
              'Please make sure it is an ARRAY of strings with length == 12.');
            } else if (array.length != 12) {
              console.error('[setMonthNames] Mismatched lengths. '+
              'The array should have length == 12.\n\nActual length: '+array.length);
            } else {
              for (var i = 0; i < array.length; i++) {
                if (typeof(array[i]) != 'string')
                  break;
                else
                  validEntries++;
              }

              if (validEntries == array.length) {
                acw.month_names = array;
                acw.currentlyViewingMonthName = array[acw.currentlyViewingMonth];
              }
              else
                console.error('[setMonthNames] Mismatched types. '+
                'One of the items in your array isn\'t a string.\n\n'+
                'Position: '+i+'\nValue: '+array[i]+' (type: '+typeof(array[i])+')');
            }
          }

          //Initialize calendar and broadcast when it's ready
          acw.weeks = populateVisibleDays();
          acw.monthsViewData = populateVisibleMonths();
          acw.yearsViewData = populateVisibleYears();
          acw.currentlyViewingDecades = calculateDecades();
          $rootScope.$broadcast('angular-calendar-widget-loaded');
        }
    };
});
