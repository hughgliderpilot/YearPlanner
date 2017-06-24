/* global $ gapi moment */

function sheetVariables (index, hscale, vscale, reqYear, topLeftX, topLeftY, dayWidth, monthHeight, eventIncrementY, monthFirstDay, maxSlots, events, reqCalendar) {
  sheetVariables[index] = {
    index: index,
    hscale: hscale,
    vscale: vscale,
    reqYear: reqYear,
    topLeftX: topLeftX,
    topLeftY: topLeftY,
    dayWidth: dayWidth,
    monthHeight: monthHeight,
    eventIncrementY: eventIncrementY,
    monthFirstDay: monthFirstDay,
    maxSlots: maxSlots,
    events: events,
    reqCalendar: reqCalendar
  }
  return sheetVariables[index]
}

function eventInfo (id, text, sd, ed, seq, calendarId) {
  eventInfo[id] = {
    id: id,
    text: text,
    sd: sd,
    ed: ed,
    seq: seq,
    calendarId: calendarId
  }
  return eventInfo[id]
}

function calendarInfo (id, summary, accessRole) {
  calendarInfo[id] = {
    id: id,
    summary: summary,
    accessRole: accessRole
  }
  return calendarInfo[id]
}

function yearpicker (reqYear) {
// set up yearpicker defaulting to reqYear
  for (var i = 2050; i > 1589; i--) {
    $('#yearpicker').append($('<option />').val(i).html(i))
    var thisyear = reqYear
    $('#yearpicker').val(thisyear)
  }
}

function blankPlanner (reqYear) {
// Set up key grid parameters and fonts
  var hscale = sheetVariables.one.hscale
  var vscale = sheetVariables.one.vscale

  var gridX = 43 * hscale
  var gridY = 45 * vscale

  var dayWidth = sheetVariables.one.dayWidth
  var monthHeight = sheetVariables.one.monthHeight

  var dayFont = (16 * hscale).toString() + 'px Roboto'
  var yearFont = (26 * hscale).toString() + 'px Roboto'
  var dateFont = (10 * hscale).toString() + 'px Roboto'
  var dayTop = 25 * vscale
  var monthTop = dayTop * 3
  var dayLeft = (gridX)

// get days in month and handle leap and non-leap years
  var daysInMonth = []
  var day29 = new Date(reqYear, 1, 29)
  if (day29.getDate() === 29) {
    daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  } else {
    daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  }

// get first day of week for each month to calc position on planner
  var monthFirstDay = []
  var monthLastDay = []
  for (var i = 0; i < 12; ++i) {
    var dayOne = new Date(reqYear, i, 1)
    monthFirstDay[i] = dayOne.getDay() + 1   //  Sun is 0, Sat is 6, the +1 makes Sun 1 but Sat 7 and want Sat 0
    monthFirstDay[i] = monthFirstDay[i] % 7 // mod 7 it to get Sat back to 0 and leave others as is
    monthLastDay[i] = monthFirstDay[i] + daysInMonth[i]  // needed to find out whether to blank last col
  }

  sheetVariables.one.monthFirstDay = monthFirstDay

// Set up the canvas
  var c = document.getElementById('myCanvas')
  var ctx = c.getContext('2d')

// background frame
  ctx.fillStyle = '#33cccc'
  ctx.fillRect(0, 0, c.width, c.height)

// white background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(gridX, gridY, 37 * dayWidth, 12 * monthHeight)

// over-write all real days with light blue
  ctx.fillStyle = '#d6f5f5'
  for (i = 0; i < 12; ++i) {
    ctx.fillRect(gridX + monthFirstDay[i] * dayWidth, gridY + i * monthHeight, dayWidth * daysInMonth[i], monthHeight)
  }

// over-write all weekend days with light grey as long as real days, else white
// there are 6 weekend columns (WC)
// only WC 1, 5 and 6 could ever be white, and only 5 white for Feb
// so make the 1st 2nd 3rd 4th and 5th WC grey anyway then white out 1st and 5th WC if required and grey 6th WC if required
// also put grey boxes in at top and bottom for "Sat Sun" labels
  ctx.fillStyle = '#d8d8d8'
  for (i = 0; i < 5; ++i) {
    ctx.fillRect(gridX + i * 7 * dayWidth, gridY - 20 * (1 + (vscale - 1) * 0.5), dayWidth * 2, monthHeight * 12 + 40)
  }
  ctx.fillRect(gridX + 5 * 7 * dayWidth, gridY - 20 * (1 + (vscale - 1) * 0.5), dayWidth * 2, 20 * (1 + (vscale - 1) * 0.5))
  ctx.fillRect(gridX + i * 7 * dayWidth, gridY + 12 * monthHeight, dayWidth * 2, 20 * (1 + (vscale - 1) * 0.5))

// first of all sort out Sat Sun first days
  var k
  for (k = 0; k < 12; ++k) {
    if (monthFirstDay[k] === 0) { // first day is Sat so leave WC 1 grey and leave WC 6 white
// handle end of month - can only need changes if Feb
// check if Feb and WC 5 needs whiting
      if (k === 1) {
// check for leap year
        if (daysInMonth[k] === 29) {
    // its a leap year so only make Sunday WC 5 White
          ctx.fillStyle = 'ffffff'
          ctx.fillRect(gridX + (4 * 7 + 1) * dayWidth, gridY + k * monthHeight, dayWidth * 1, monthHeight * 1)
        } else {
    // its not a leap year so make Sat and Sun WC 5 White
          ctx.fillStyle = 'ffffff'
          ctx.fillRect(gridX + (4 * 7) * dayWidth, gridY + k * monthHeight, dayWidth * 2, monthHeight * 1)
        }
      } // end of Feb checking
    }

    if (monthFirstDay[k] === 1) { // first day is Sun so white WC 1 Sat and leave WC1 Sun grey and leave WC 6 white
      // code to paint WC1 Sat white
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(gridX, gridY + k * monthHeight, dayWidth * 1, monthHeight * 1)
  // then again need to handle WC5 for Feb
      if (k === 1) {
  // check for leap year
        if (daysInMonth[k] === 29) {
  // its a leap year so don't need to do anything
        } else {
        // its not a leap year so make Sun WC 5 White
        // painting code needed here
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(gridX + (4 * 7 + 1) * dayWidth, gridY + k * monthHeight, dayWidth * 1, monthHeight * 1)
        }
      }
    } // end of Feb checking

    if (monthFirstDay[k] > 1) { // All other cases - make first sat and sun white
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(gridX, gridY + k * monthHeight, dayWidth * 2, monthHeight * 1)
    }

  // find when last day of month is and if it will hit col 36 or 37
  // code to make last Sat grey
    if (monthLastDay[k] === 36) {
      ctx.fillStyle = '#d8d8d8'
      ctx.fillRect(gridX + 35 * dayWidth, gridY + k * monthHeight, dayWidth * 1, monthHeight * 1)
    }

  // need code to make last Sat and Sun grey
    if (monthLastDay[k] === 37) {
      ctx.fillStyle = '#d8d8d8'
      ctx.fillRect(gridX + 35 * dayWidth, gridY + k * monthHeight, dayWidth * 2, monthHeight * 1)
    }
  }

  // draw 12 boxes for months
  for (i = 0; i < 12; ++i) {
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.strokeRect(0, gridY + i * monthHeight, c.width, monthHeight)
  }

  // 37 black outline rectangles for days going across - slightly thinner lines   1px
  for (i = 0; i < 37; ++i) {
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 0.25
    ctx.strokeRect(gridX + i * dayWidth, gridY, dayWidth, 12 * monthHeight)
  }

  // put 12 thin light blue lines across the top of each month
  for (i = 0; i < 12; ++i) {
    ctx.strokeStyle = '#3399ff'
    ctx.lineWidth = 1
    ctx.moveTo(gridX, gridY + 13 * (1 + (vscale - 1) * 0.5) + i * monthHeight)
    ctx.lineTo(gridX + 37 * dayWidth, gridY + 13 * (1 + (vscale - 1) * 0.5) + i * monthHeight)
    ctx.stroke()
  }

  // month names down left
  $('#months_left').css({'visibility': 'visible', 'font': dayFont, 'height': 12 * monthHeight})
  $('#months_left').css({top: monthTop, left: 10 * hscale})

  // month names down right
  $('#months_right').remove()
  $('#months_left').clone().prop('id', 'months_right').insertAfter('#months_left')
  $('#months_right').css({top: monthTop, left: 38 * dayWidth + 15 * hscale})

  // put year title at top
  $('#year_title').text((reqYear).toString())
  $('#year_title').css({'visibility': 'visible', 'font': yearFont, 'color': 'white'})
  $('#year_title').css({'top': 0 * vscale, left: 725 * hscale})

  // day names at top of chart
  $('#weektab').css({'visibility': 'visible', 'font': dayFont, 'width': dayWidth * 37 + 5 * hscale})
  $('#weektab').css({top: dayTop, left: dayLeft})

  // day names at bottom of chart
  var dayTopBot = 48 * vscale + monthHeight * 12

  $('#weektabbot').remove()  // get rid of any previous elements to avoid overlay on re-write of blankPlanner
  $('#weektab').clone().prop('id', 'weektabbot').insertAfter('#weektab')
  $('#weektabbot').css({top: dayTopBot, left: dayLeft})

  // put date numbers above the thin blue lines
  ctx.font = dateFont
  ctx.fillStyle = 'black'
  for (i = 0; i < 12; ++i) {
    for (var j = 0; j < daysInMonth[i]; ++j) {
      var adjust = 0
      if (j > 8) adjust = -3    // left adjust slightly to align 2 digit numbers properly
      ctx.fillText(j + 1, gridX + 15 + dayWidth * j + monthFirstDay[i] * dayWidth + adjust, gridY + 10 + monthHeight * i)
    }
  }

// need code at the end to check is signed-in, and if so is there more than one calendar, and if so is a calendar selected
// if signed in there is a calendar selected need to get the events out
};  // end of painting the blank planner =========================================================

function getCalendars () {
  // Client ID and API key from the Developer Console
  var CLIENT_ID = '568011739664-tlpkqpeb8r3dlda0msj4o6druf7qa4ts.apps.googleusercontent.com'

  // Array of API discovery doc URLs for APIs used by the quickstart
  var DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  var SCOPES = 'https://www.googleapis.com/auth/calendar'

  var signoutButton = $('#signout-button')

  /**
   *  On load, called to load the auth2 library and API client library.
   */

  gapi.load('client:auth2', initClient)

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  function initClient () {
    gapi.client.init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus)
      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
      /**
       *  Sign in the user upon button click.
       */
      gapi.signin2.render('google-signin-button', {
        'longtitle': false
      })
      /**
       *  Sign out the user upon button click.
       */
      signoutButton.click(function () {
        gapi.auth2.getAuthInstance().signOut()
      })
    })
  };

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus (isSignedIn) {
    if (isSignedIn) {
      $('#google-signin-button').hide()
      $('#signed-in').css('display', 'block')
      var GoogleUser = gapi.auth2.getAuthInstance().currentUser.get()
      var Email = GoogleUser.getBasicProfile().getEmail()
      $('#name').html('Signed in:  ' + "<font color='#337ab7'>" + Email + '</font')
      listCalendars()
    } else {
      $('#signed-in').css('display', 'none')
      $('#google-signin-button').show()
      $('.calname1').remove()
    }
  }

  /**
   * List the calendars, for some reason Contacts is included in list so remove
   */
  function listCalendars () {
    gapi.client.calendar.calendarList.list().then(function (response) {
      var calendars = response.result.items
      var rows = []
      if (calendars.length > 0) {
        for (var i = calendars.length - 1; i >= 0; i--) {   // reverse through array as displays calendars in more logical order
          var summary = calendars[i].summary
          var calid = calendars[i].id
          var access = calendars[i].accessRole
          if (summary === 'Contacts') {} else {
            rows[i] = $('#calid').clone(true).prop('id', calid).addClass('calname1')
            rows[i].insertAfter('#calid')
            rows[i].html(summary).css({'display': 'block'})
            calendarInfo(calid, summary, access)  // keep in calendarInfo object so can check access level later
          }
        }
      }
    })
  }
}    // end of getCalendars  ==========================================

function getEvents (calendarId) {
  var reqYear = sheetVariables.one.reqYear
  var events = []
  gapi.client.calendar.events.list({
    'calendarId': calendarId,
    'timeMin': (new Date(reqYear, 0, 1, 0, 0, 0, 0)).toISOString(),
    'timeMax': (new Date(reqYear, 11, 31, 0, 0, 0, 0)).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'orderBy': 'startTime'
  }).then(function (response) {
    for (var j = 0; j < response.result.items.length; j++) {
      var eventHeader = response.result.items[j].summary
      var startDate = new Date(response.result.items[j].start.date)
      if (isNaN(startDate)) { startDate = new Date(response.result.items[j].start.dateTime) };
      // Google calendar can store start and end dates as date (whole day events) or as dateTime
      var endDate = new Date(response.result.items[j].end.date)
      if (isNaN(endDate)) { endDate = new Date(response.result.items[j].end.dateTime) };

      var startYear = startDate.getFullYear()
      var startMonth = startDate.getMonth()
      var startDay = startDate.getDate()
      startDate = new Date(startYear, startMonth, startDay, 12, 0, 0)

      // need to handle all day events which end 00:00:00 UTC day after real end date, by resetting date to real end date
      // leave all others.
      var endYear = endDate.getFullYear()
      var endMonth = endDate.getMonth()
      var endDay = endDate.getDate()
      var endHoursUTC = endDate.getUTCHours()
      if (endHoursUTC === 0) { endDay = endDay - 1 };
      endDate = new Date(endYear, endMonth, endDay, 12, 0, 0)

      var eventId = response.result.items[j].id
      var sequence = response.result.items[j].sequence
      eventInfo(eventId, eventHeader, startDate, endDate, sequence, calendarId)  // keep in eventInfo object for later use
      events[j] = eventId   // need an array to track the index so can use id displayEvents
    }
    sheetVariables.one.events = events
    displayEvents()
  })
}    // end of getEvents  ==========================================

function displayEvents () {
  var maxSlots = sheetVariables.one.maxSlots
  var reqYear = sheetVariables.one.reqYear
  var events = sheetVariables.one.events
  var eventsPerDay = []

  var r
  var s
  for (r = 0; r < 366; ++r) eventsPerDay[r] = []
  // initialise eventsPerDay array to 0s
  for (s = 0; s <= maxSlots; ++s) {    // <= allows up to maxSlots + 1 slots  this captures overflow
    for (r = 0; r < 366; ++r) {
      eventsPerDay[r][s] = 0
    }
  }

  // need to loop through events held in eventInfo object and display them

  for (var j = 0; j < events.length; j++) {
    var eventId = events[j]
    var eventHeader = eventInfo[eventId]['text']
    var startDateNoon = eventInfo[eventId]['sd'] // because already set in listUpcomingEvents
    var endDateNoon = eventInfo[eventId]['ed']  // because already set in listUpcomingEvents

    var a = moment(startDateNoon).format('DDD') - 1   // -1 as want Jan 1 as 0
    var b = moment(endDateNoon).format('DDD') - 1

    // handle events that started the year before the one being displayed when c=1
    // (events that start after or end before the year being displayed are not retrieved due to api parameters)

    var m = 0     // flag =0 if entirely in year, 1 if ends year after, 2 if starts year before,  3 if whole year

    var day29 = new Date(reqYear, 1, 29)
    if (startDateNoon.getFullYear() < reqYear) {
      startDateNoon.setFullYear(reqYear, 0, 1)
      a = 0
      if (endDateNoon.getFullYear() > reqYear) {
        m = 3 // full year event
        // leap year code
        if (day29.getDate() === 29) {
          b = 365   // leap year and 366 days in year
        } else {
          b = 364
        }
        endDateNoon.setFullYear(reqYear, 11, 31)
      } else m = 2 // started before year ended in year
    }
    if (endDateNoon.getFullYear() > reqYear) { // handle event that ends the year after the one being displayed
      m = 1
      // leap year code
      if (day29.getDate() === 29) {
        b = 365   // leap year and 366 days in year
      } else {
        b = 364
      }
      endDateNoon.setFullYear(reqYear, 11, 31)
    }

    // check which slot is available and book it, k is the slot counter
    for (var k = 0; k <= maxSlots; ++k) {
      var clear = 0        // stays as 0 if the slot if available for the required number of days
      for (r = a; r <= b; ++r) {
        clear = clear + eventsPerDay[r][k]
      }
      if (clear === 0) {
        for (r = a; r <= b; ++r) {
          eventsPerDay[r][k] = 1  // change all the elements to 1 to book slot number found
        }
        break
      }
    }        // <= allows up to maxSlots + 1 slots  this captures overflow

    if (k <= maxSlots) {     // <= allows up to maxSlots + 1 slots  this captures overflow
    // need to check if event goes across months and then handle
    // by splitting into multiple events for writeEvent function
      var edm = endDateNoon.getMonth()
      var sdm = startDateNoon.getMonth()
      var monthSpan = edm - sdm
      var lastDay
      var firstDay
      var midMonth
      if (monthSpan === 0) {  // in 1 month but may have started year before or after m and cont handle this
        writeEvent(startDateNoon, endDateNoon, eventHeader, m, k, eventId)
      } else {    // multiple months
        if (m === 3) {   // started before and ended after, all months are mid months cont = 3
          for (var i = 0; i < 12; i++) {
            firstDay = new Date(reqYear, i, 1, 12, 0, 0)  // start of middle month
            lastDay = new Date(reqYear, i + 1, 0, 12, 0, 0)  // end of middle month
            writeEvent(firstDay, lastDay, eventHeader, 3, k, eventId)
          }
        } else {     // multi-month but not whole year could still b m=1 or m=2 and handle that below
          // write first month
          if (m === 2) {   // started year before so need to mod Jan
            lastDay = new Date(reqYear, 1, 0, 12, 0, 0)  // end of Jan
            writeEvent(startDateNoon, lastDay, eventHeader, 3, k, eventId)   // Jan as a mid month
          } else {    // started in year so normal start
            lastDay = new Date(reqYear, startDateNoon.getMonth() + 1, 0, 12, 0, 0)  // end of first month
            writeEvent(startDateNoon, lastDay, eventHeader, 1, k, eventId)
          }

          // write middle months
          if (monthSpan > 1) {   // ie more than two months spanned
          // handle middle months
            for (i = 1 + 1; i <= monthSpan; i++) {
              midMonth = startDateNoon.getMonth() + i - 1
              firstDay = new Date(reqYear, midMonth, 1, 12, 0, 0)  // start of middle month
              lastDay = new Date(reqYear, midMonth + 1, 0, 12, 0, 0)  // end of middle month
              writeEvent(firstDay, lastDay, eventHeader, 3, k, eventId)
            }
          }

          // write end of event to last month from start of month to event end date
          firstDay = new Date(reqYear, endDateNoon.getMonth(), 1, 12, 0, 0)  // start of end month
          if (m === 1) {   // ends year after so Dec a middle month
            writeEvent(firstDay, endDateNoon, eventHeader, 3, k, eventId)  // using cont 0 should be 3
          } else { writeEvent(firstDay, endDateNoon, eventHeader, 2, k, eventId) }
        }  // end of multi-month not whole year write
      }  // end of multiple months write
    }       // end of if (k <= maxSlots)
  }     // end of running through events

      // set up listeners and event handlers once display is complete
  function updateEvent (id, newText, startDate, endDate, sequence) {
      // do the google API stuff first and if fails just redisplay (event may have been updated elsewhere)
      // if works then just update event and redisplay
    var end
    var start = startDate.format('YYYY-MM-DD')
    var calendarId
    // need to increment endDate by 1 day to make whole day events work properly
    endDate.add(1, 'day')
    end = endDate.format('YYYY-MM-DD')
    sequence = sequence + 1
    calendarId = sheetVariables.one.reqCalendar
    var request = gapi.client.calendar.events.update({
      'calendarId': calendarId,
      'eventId': id,
      'summary': newText,
      'start': {
        'date': start
      },
      'end': {
        'date': end
      },
      'sequence': sequence
    })

    request.then(function (response) {
      $('.event1').remove()    // remove old events before redisplay
      var reqCalendar = sheetVariables.one.reqCalendar
      getEvents(reqCalendar) // redisplay with revised date  }
    }, function (reason) {
      console.log(reason)
    })
  }

  $('.event').click(function () {
    var elemId = $(this).attr('id')
    var elemOffsetTop = $(this).offset().top - $('#planner').offset().top + 15
    var elemOffsetLeft = $(this).offset().left - $('#planner').offset().left
    var elemOffset = {top: elemOffsetTop, left: elemOffsetLeft}
    var eventText = (eventInfo[elemId]['text'])
    var start = moment(eventInfo[elemId]['sd']).format('DD/MM/YYYY')
    var end = moment(eventInfo[elemId]['ed']).format('DD/MM/YYYY')
    var sequence = eventInfo[elemId]['seq']
    var calendarId = eventInfo[elemId]['calendarId']

    $('.form1').remove()  // get rid of any from previous clicks
    var form1
    form1 = $('#form0').clone().prop('id', 'form1').addClass('form1').insertAfter('#form0')
    form1.offset(elemOffset)
    $('#changeFlag', form1).val('0')
    $('#errorFlag', form1).val('0')
    $('#elemId', form1).val(elemId)
    $('#sequence', form1).val(sequence.toString())
    $('textarea#text0', form1).val(eventText)
    $('#startDate', form1).val(start)
    $('#endDate', form1).val(end)
    var access = calendarInfo[calendarId]['accessRole']
    if (access === 'reader') {
      $('#save0', form1).css({'visibility': 'hidden'})
      $('#sderror p', form1).css({'visibility': 'visible'}).text('You only have read access to this calendar, so Update is not allowed')
    }
    form1.show() // css({"visibility": "visible"});

    form1.mousedown(function (event) {
      var down = true
      var position = $(this).position()
      var ptop = position.top
      var pleft = position.left
      var starttop = event.clientY
      var startleft = event.clientX
      var lowerlimit = 900 - form1.height()
      var rightlimit = 1350 - form1.width()
      $(this).css({cursor: 'move'})
      $(this).mousemove(function (event) {
        if (down === true) {
          $(this).css({cursor: 'move'})
          var newtop = ptop + event.clientY - starttop
          var newleft = pleft + event.clientX - startleft
          newtop = (newtop > 0 ? newtop : 0)
          newtop = (newtop < lowerlimit ? newtop : lowerlimit)
          newleft = (newleft > 0 ? newleft : 0)
          newleft = (newleft < rightlimit ? newleft : rightlimit)
          $(this).css({
            cursor: 'move',
            top: newtop,
            left: newleft
          })
          if (event.clientY === 0 || event.clientY === lowerlimit) {
            down = false
            $(this).css({cursor: 'default'})
          }
          if (event.clientX === 0 || event.clientX === rightlimit) {
            down = false
            $(this).css({cursor: 'default'})
          }
        }
      }).mouseup(function () {
        down = false
        $(this).css({cursor: 'default'})
      })
    })

    $('textarea#text0', form1).change(function () {
      $('#changeFlag', form1).val('1')
    })

    $('#daterange', form1)
      .each(function () {
        $(this)
          .datepicker({
            format: 'dd/mm/yyyy',
            startDate: '01/01/1590',
            endDate: '31/12/2050'
          })

          .change(function () {
            $('#changeFlag', form1).val('1')
            $('#errorFlag', form1).val('0')
            $('#sderror p', form1).css({'visibility': 'hidden'})
            $(this).removeClass('error')
            var startDate = moment($('#startDate', form1).val(), 'DD/MM/YYYY')
            var endDate = moment($('#endDate', form1).val(), 'DD/MM/YYYY')
            if ((startDate.isValid()) && (endDate.isValid())) {
            } else {
              $('#errorFlag', form1).val('1')
              $('#sderror p', form1).css({'visibility': 'visible'}).text('Start and end dates cannot be blank, enter a valid date, dd-mm-yyyy')
              $(this).addClass('error')
            }
          })
      })

    $('#save0', form1).click(function () {
      if ($('#changeFlag', form1).val() === '1') {
        if ($('#errorFlag', form1).val() === '0') {
          var id = $('#elemId', form1).val()
          var newText = $('textarea#text0', form1).val()
          var startDate = moment($('#startDate', form1).val(), 'DD/MM/YYYY')
          var endDate = moment($('#endDate', form1).val(), 'DD/MM/YYYY')
          sequence = parseInt($('#sequence', form1).val())
          $('#changeFlag', form1).val('0')
          $('#sderror p', form1).css({'visibility': 'hidden'})
          form1.remove()
          updateEvent(id, newText, startDate, endDate, sequence)
        }
      } else {
        if ($('#errorFlag', form1).val() === '0') {
          $('#sderror p', form1).css({'visibility': 'hidden'})
          form1.remove()
        }
      }
    })

    $('#discard0', form1).click(function () {
      $('#sderror p', form1).css({'visibility': 'hidden'})
      form1.remove()
    })
  })
} // end of displayEvents   ==============================

function writeEvent (sd, ed, text, cont, rank, eventId) {
  // sd, ed are Date objects
  //* ********************************************************
  // rank determines where the event is positioned, can be rank 0, 1, 2, etc up to maxSlots -1
  // cont=0: no continue whole event fits in one month
  // cont=1 : start month of multiple months event : starts and continues to next
  // cont=2 : end month of multiple months event : ends continuing from previous
  // cont=3 : middle month of >2 months event : continues to next and continuing from previous
  // note that this function handles whole day events
  // these are deemed to start at 00:00:00 on the first day
  // and end at midnight (00:00:00) on the day after the last day
  // to make the date arithmetic and displays work we reset this
  // to midday on both dates.
  var topLeftX = sheetVariables.one.topLeftX
  var topLeftY = sheetVariables.one.topLeftY
  var dayWidth = sheetVariables.one.dayWidth
  var monthHeight = sheetVariables.one.monthHeight
  var eventIncrementY = sheetVariables.one.eventIncrementY
  var monthFirstDay = sheetVariables.one.monthFirstDay
  var maxSlots = sheetVariables.one.maxSlots
  var startMonth = sd.getMonth()
  var startDay = sd.getDate()
  var endDay = ed.getDate()
  var topLeftEventY
  var topLeftEventX
  var el
  var eventOutput

  topLeftEventY = topLeftY + monthHeight * startMonth + (rank + 1) * eventIncrementY

  if (rank < maxSlots) {     // normal event
    // set size and position of events

    var pointString
    switch (cont) {
      case 0:
        topLeftEventX = topLeftX + dayWidth * ((startDay) + monthFirstDay[startMonth] - 0.80)
        el = (endDay - startDay + 0.9) * dayWidth
        pointString = '0,0 ' + (el).toString() + ',0 ' + (el).toString() + ',14 0,14'
        break
      case 1:
        topLeftEventX = topLeftX + dayWidth * ((startDay) + monthFirstDay[startMonth] - 0.80)
        el = (endDay - startDay + 1.1) * dayWidth
        pointString = '0,0 ' + (el - 3.5).toString() + ',0 ' + (el).toString() + ',7.5 ' + (el - 3.5).toString() + ',14 0,14'
        break
      case 2:
        topLeftEventX = topLeftX + dayWidth * ((startDay) + monthFirstDay[startMonth] - 1)
        el = (endDay - startDay + 1.1) * dayWidth
        pointString = '3.5,0 ' + (el).toString() + ',0 ' + (el).toString() + ',14 3.5,14 0,7'
        break
      case 3:
        topLeftEventX = topLeftX + dayWidth * ((startDay) + monthFirstDay[startMonth] - 1)
        el = (endDay - startDay + 1.3) * dayWidth
        pointString = '3.5,0 ' + (el - 3.5).toString() + ',0 ' + (el).toString() + ',7 ' + (el - 3.5).toString() + ',14 3.5,14 0,7'
        break
    }

    // clone, size and position events
    eventOutput = $('#event0').clone().prop('id', eventId).addClass('event1').insertAfter('#event0')
    eventOutput.css({top: topLeftEventY - 14, left: topLeftEventX})
    $('#svg0', eventOutput).attr('width', (el).toString())
    $('#poly0', eventOutput).attr('points', pointString)
    $('#text0', eventOutput).text(text)
    eventOutput.show() // css({"visibility": "visible"});
    // end of clone and position
  } else {  // write over flow rank!< maxSlots
    topLeftEventX = topLeftX + dayWidth * ((startDay) + monthFirstDay[startMonth] - 0.95)
    topLeftEventY = topLeftY + monthHeight * startMonth + (maxSlots + 0.75) * eventIncrementY
    text = '+ more'
    eventOutput = $('#overflow0').clone().prop('id', 'overflow1').insertAfter('#overflow0')
    eventOutput.css({top: topLeftEventY - 14, left: topLeftEventX})
    $('#text1', eventOutput).text(text)
    eventOutput.show()
  }
}   // end of writeEvent function  =========================

function makeRequest () {      // eslint-disable-line no-unused-vars
  var hscale = 0.9
  var vscale = 0.9
  var maxSlots = 3
  var topLeftX = 38 * hscale
  var topLeftY = 59 * vscale
  var dayWidth = 38 * hscale
  var monthHeight = 76 * vscale
  var eventIncrementY = 17 * hscale
  var events = []
  var reqCalendar
  var reqYear = moment().year()  // default reqYear on load is this year, maybe change this later to make selected year pervasive using cookies?
  var monthFirstDay = []
  sheetVariables('one', hscale, vscale, reqYear, topLeftX, topLeftY, dayWidth, monthHeight, eventIncrementY, monthFirstDay, maxSlots, events, reqCalendar)
  yearpicker(reqYear)  // sets up year picker with default year selected
  blankPlanner(reqYear)  // called with default year initially
  getCalendars()  // sorts out sign in to Google and displays list of calendars

  $('#yearpicker').change(function () {
    reqYear = $('#yearpicker').val()   // Val and html the same and val easier to use as already number
    $('.event1').remove()
    $('#overflow1').remove()
    blankPlanner(reqYear)  // reload planner with selected year
    sheetVariables.one.reqYear = reqYear
    var calendarId = sheetVariables.one.reqCalendar
    getEvents(calendarId)
  })

  $('#left').click(function () {
    var reqYear = Number($('#yearpicker').val()) - 1
    $('.event1').remove()
    $('#yearpicker').val(reqYear)
    $('#overflow1').remove()
    blankPlanner(reqYear)  // reload planner with selected year
    sheetVariables.one.reqYear = reqYear
    var calendarId = sheetVariables.one.reqCalendar
    getEvents(calendarId)
  })

  $('#right').click(function () {
    var reqYear = Number($('#yearpicker').val()) + 1
    $('.event1').remove()
    $('#overflow1').remove()
    $('#yearpicker').val(reqYear)
    sheetVariables.one.reqYear = reqYear
    var calendarId = sheetVariables.one.reqCalendar
    blankPlanner(reqYear)  // reload planner with selected year
    getEvents(calendarId)
  })

  $('.calname').click(function () {
    $('.event1').remove()
    $('#overflow1').remove()
    var calendarId = $(this).attr('id')  // because id of button set to calendarId
    sheetVariables.one.reqCalendar = calendarId // store this as current calendar
    blankPlanner(reqYear)  // reload planner with selected year
    getEvents(calendarId)
  })
}  // end of makeRequest()    ===================================
