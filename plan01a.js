function sheetVariables(index, hscale, vscale, req_year, top_left_x, top_left_y, day_width, month_height, event_increment_y, month_first_day, maxslots, events, req_calendar) {
    return sheetVariables[index] = {
    index: index,
    hscale: hscale, 
    vscale: vscale, 
    req_year: req_year, 
    top_left_x: top_left_x, 
    top_left_y: top_left_y, 
    day_width: day_width, 
    month_height: month_height, 
    event_increment_y: event_increment_y, 
    month_first_day: month_first_day,
    maxslots: maxslots,
    events: events, 
    req_calendar: req_calendar,
  }
}

function eventInfo(id, text, sd, ed, seq, calendar_id) {
    return eventInfo[id] = {
    id: id,
    text: text, 
    sd: sd,
    ed: ed,
    seq: seq,
    calendar_id: calendar_id,
  }
}

function calendarInfo(id, summary, accessRole) {
    return calendarInfo[id] = {
      id: id, 
      summary: summary, 
      accessRole: accessRole,
    }

}

function yearpicker(req_year) {
// set up yearpicker defaulting to req_year 

    for (i = 2050; i > 1589; i--)
    {
        $('#yearpicker').append($('<option />').val(i).html(i));
        var thisyear = req_year;
        $('#yearpicker').val(thisyear)
    }
}



function blankPlanner(req_year) {

// Set up key grid parameters and fonts
    var hscale = sheetVariables.one.hscale; 
    var vscale = sheetVariables.one.vscale; 

    var grid_x = 43*hscale;
    var grid_y = 45*vscale;

    var day_width = sheetVariables.one.day_width;
    var month_height = sheetVariables.one.month_height;

    var day_font = (16*hscale).toString() + "px Roboto"; 
    var year_font = (26*hscale).toString() + "px Roboto"; 
    var date_font = (10*hscale).toString() + "px Roboto";
    var day_top = 25*vscale;
    var month_top = day_top*3;
    var day_left = (grid_x);    
    var week_width = 7*day_width*hscale; 


// get days in month and handle leap and non-leap years
    var days_in_month = [];
    var day29 = new Date(req_year,1,29)
    if (day29.getDate()==29)
    {
      days_in_month = [31,29,31,30,31,30,31,31,30,31,30,31];
    }
    else
    {
      days_in_month = [31,28,31,30,31,30,31,31,30,31,30,31];
    }

// get first day of week for each month to calc position on planner
  var month_first_day = [];
  var month_last_day = [];
  var months = [];
  for (i=0; i < 12; ++i){
    var day_one = new Date(req_year, i, 1);
    month_first_day[i] = day_one.getDay()+1;   //  Sun is 0, Sat is 6, the +1 makes Sun 1 but Sat 7 and want Sat 0 
    month_first_day[i] = month_first_day[i]%7; // mod 7 it to get Sat back to 0 and leave others as is
    month_last_day[i] = month_first_day[i]+days_in_month[i];  // needed to find out whether to blank last col
  }
  
  sheetVariables.one.month_first_day = month_first_day;

// Set up the canvas         
  var c=document.getElementById("myCanvas");
  var ctx=c.getContext("2d");

// background frame
  ctx.fillStyle="#33cccc";
  ctx.fillRect(0,0,c.width,c.height);

// white background
  ctx.fillStyle="#ffffff";
  ctx.fillRect(grid_x,grid_y,37*day_width,12*month_height);

// over-write all real days with light blue
  ctx.fillStyle="#d6f5f5"
  for (i=0; i<12;++i){
    ctx.fillRect(grid_x+month_first_day[i]*day_width,grid_y+i*month_height,day_width*days_in_month[i],month_height)
  }


// over-write all weekend days with light grey as long as real days, else white
// there are 6 weekend columns (WC)
// only WC 1, 5 and 6 could ever be white, and only 5 white for Feb
// so make the 1st 2nd 3rd 4th and 5th WC grey anyway then white out 1st and 5th WC if required and grey 6th WC if required 
// also put grey boxes in at top and bottom for "Sat Sun" labels
  ctx.fillStyle="#d8d8d8"
  for (i=0; i<5;++i)
  {
    ctx.fillRect(grid_x+i*7*day_width,grid_y-20*(1+(vscale-1)*0.5),day_width*2,month_height*12+40)
  }
  ctx.fillRect(grid_x+5*7*day_width,grid_y-20*(1+(vscale-1)*0.5),day_width*2,20*(1+(vscale-1)*0.5));
  ctx.fillRect(grid_x+i*7*day_width,grid_y+12*month_height,day_width*2,20*(1+(vscale-1)*0.5));

// first of all sort out Sat Sun first days
  for (k=0; k < 12; ++k){                  
    if (month_first_day[k] == 0){ // first day is Sat so leave WC 1 grey and leave WC 6 white
// handle end of month - can only need changes if Feb
// check if Feb and WC 5 needs whiting 
      if (k==1){
// check for leap year
        if(days_in_month[k] == 29){
    // its a leap year so only make Sunday WC 5 White
          ctx.fillStyle = "ffffff"
            ctx.fillRect(grid_x+(4*7+1)*day_width,grid_y+k*month_height,day_width*1,month_height*1)
        }
        else
        {
    // its not a leap year so make Sat and Sun WC 5 White
          ctx.fillStyle="ffffff"
          ctx.fillRect(grid_x+(4*7)*day_width,grid_y+k*month_height,day_width*2,month_height*1)
        }
      } // end of Feb checking
    }



    if (month_first_day[k]==1){ // first day is Sun so white WC 1 Sat and leave WC1 Sun grey and leave WC 6 white
      // code to paint WC1 Sat white
        ctx.fillStyle="#ffffff"
      ctx.fillRect(grid_x,grid_y+k*month_height,day_width*1,month_height*1)
  // then again need to handle WC5 for Feb
      if (k==1){
  // check for leap year
        if(days_in_month[k]==29){
  // its a leap year so don't need to do anything
        }
        else
        {
        // its not a leap year so make Sun WC 5 White
        // painting code needed here 
            ctx.fillStyle="#ffffff"
            ctx.fillRect(grid_x+(4*7+1)*day_width,grid_y+k*month_height,day_width*1,month_height*1)
        }
      } 
    } // end of Feb checking

    if (month_first_day[k]>1){ // All other cases - make first sat and sun white
        ctx.fillStyle="#ffffff"
      ctx.fillRect(grid_x,grid_y+k*month_height,day_width*2,month_height*1)
    }

  // find when last day of month is and if it will hit col 36 or 37
  // code to make last Sat grey 
    if (month_last_day[k]==36){
        ctx.fillStyle="#d8d8d8"
      ctx.fillRect(grid_x+35*day_width,grid_y+k*month_height,day_width*1,month_height*1)
    }   

  // need code to make last Sat and Sun grey
    if (month_last_day[k]==37){
        ctx.fillStyle="#d8d8d8"
      ctx.fillRect(grid_x+35*day_width,grid_y+k*month_height,day_width*2,month_height*1)
    }   
  }

  // draw 12 boxes for months
  for (i=0; i<12; ++i)
  {
      ctx.strokeStyle="black";
      ctx.lineWidth=2;
      ctx.strokeRect(0,grid_y+i*month_height,c.width,month_height);
  }

  // 37 black outline rectangles for days going across - slightly thinner lines   1px
  for (i=0; i<37; ++i)
  {
      ctx.strokeStyle="black";
      ctx.lineWidth=0.25;
      ctx.strokeRect(grid_x+i*day_width,grid_y,day_width,12*month_height);
  }

  // put 12 thin light blue lines across the top of each month
  for (i=0; i<12; ++i)
  {
  ctx.strokeStyle="#3399ff";
  ctx.lineWidth=1;
  ctx.moveTo(grid_x,grid_y+13*(1+(vscale-1)*0.5)+i*month_height);
  ctx.lineTo(grid_x+37*day_width,grid_y+13*(1+(vscale-1)*0.5)+i*month_height);
  ctx.stroke();
  }

  // month names down left
  $("#months_left").css({"visibility": "visible", "font": day_font, "height": 12*month_height}); 
  $("#months_left").css({top: month_top, left: 10*hscale}); 

  // month names down right
  $("#months_right").remove();
  $("#months_left").clone().prop('id', "months_right").insertAfter("#months_left");
  $("#months_right").css({top: month_top, left: 38*day_width+15*hscale}); 

  // put year title at top
  $("#year_title").text((req_year).toString());
  $("#year_title").css({"visibility": "visible", "font": year_font, "color": "white"});
  $("#year_title").css({"top": 0*vscale, left: 725*hscale}); 

  // day names at top of chart
  $("#weektab").css({"visibility": "visible", "font": day_font, "width": day_width*37+5*hscale});
  $("#weektab").css({top: day_top, left: day_left}); 

  // day names at bottom of chart
  var day_top_bot = 48*vscale+month_height*12;

  $("#weektabbot").remove();  // get rid of any previous elements to avoid overlay on re-write of blankPlanner
  $("#weektab").clone().prop('id', "weektabbot").insertAfter("#weektab");
  $("#weektabbot").css({top: day_top_bot, left: day_left}); 

  // put date numbers above the thin blue lines
  ctx.font=date_font;
  ctx.fillStyle="black";
  for (i=0; i<12; ++i){
    for (j=0; j<days_in_month[i]; ++j){
      var adjust=0;
      if (j>8) adjust=-3;    // left adjust slightly to align 2 digit numbers properly
      ctx.fillText(j+1, grid_x+15+day_width*j+month_first_day[i]*day_width+adjust, grid_y+10+month_height*i); 
    }
  }

// need code at the end to check is signed-in, and if so is there more than one calendar, and if so is a calendar selected
// if signed in there is a calendar selected need to get the events out

};  // end of painting the blank planner =========================================================


function getCalendars() {
  // Client ID and API key from the Developer Console
  var CLIENT_ID = '568011739664-tlpkqpeb8r3dlda0msj4o6druf7qa4ts.apps.googleusercontent.com';

  // Array of API discovery doc URLs for APIs used by the quickstart
  var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  var SCOPES = "https://www.googleapis.com/auth/calendar";

  var signoutButton = $("#signout-button");

  /**
   *  On load, called to load the auth2 library and API client library.
   */
  
  gapi.load('client:auth2', initClient);


  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  function initClient() {

    gapi.client.init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      /**
       *  Sign in the user upon button click.
       */
      gapi.signin2.render('google-signin-button', {
        "longtitle": false,
      });
      /**
       *  Sign out the user upon button click.
       */
      signoutButton.click(function() {
        gapi.auth2.getAuthInstance().signOut();
      });
    })
  };



  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      $("#google-signin-button").hide();  
      $("#signed-in").css("display","block");
      var GoogleUser = gapi.auth2.getAuthInstance().currentUser.get()
      var Email = GoogleUser.getBasicProfile().getEmail();
      $("#name").html("Signed in:  " + "<font color='#337ab7'>" + Email +"</font");
      listCalendars();
    } else {
      $("#signed-in").css("display","none");
      $("#google-signin-button").show();  
      $(".calname1").remove();
    }
  }



  /**
   * List the calendars, for some reason Contacts is included in list so remove
   */
  function listCalendars() {
      gapi.client.calendar.calendarList.list().then(function(response) {
          var calendars = response.result.items;
          var rows = [];
          if (calendars.length > 0) {
              for (i = calendars.length - 1; i >= 0 ; i--) {   // reverse through array as displays cals in more logical order
                  var summary = calendars[i].summary;
                  var calid = calendars[i].id;
                  var access = calendars[i].accessRole; 
                  if (summary === "Contacts") {}
                  else {
                      rows[i] = $("#calid").clone(true).prop('id', calid).addClass("calname1");
                      rows[i].insertAfter("#calid");
                      rows[i].html(summary).css({"display": "block"});
                      calendarInfo(calid, summary, access);  // keep in calendarInfo object so can check access level later
                    }
              }
          } 
      });
  }
}    // end of getCalendars  ==========================================

function getEvents(calendar_id) {
  var req_year = sheetVariables.one.req_year;
  var events = [];
  gapi.client.calendar.events.list({
    'calendarId': calendar_id,
    'timeMin': (new Date(req_year,0,1,0,0,0,0)).toISOString(),
    'timeMax': (new Date(req_year,11,31,0,0,0,0)).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'orderBy': 'startTime'
  }).then(function(response) {
    for (var j = 0; j < response.result.items.length; j++) {
      var event_header = response.result.items[j].summary;   
      var start_date = new Date(response.result.items[j].start.date);
      if (isNaN(start_date)) {start_date = new Date(response.result.items[j].start.dateTime)}; 
      // Google calendar can store start and end dates as date (whole day events) or as dateTime 
      var end_date = new Date(response.result.items[j].end.date); 
      if (isNaN(end_date)) {end_date = new Date(response.result.items[j].end.dateTime)};
  
      var start_year = start_date.getFullYear();
      var start_month = start_date.getMonth();
      var start_day = start_date.getDate();   
      start_date = new Date(start_year, start_month,start_day,12,0,0);

      // need to handle all day events which end 00:00:00 UTC day after real end date, by resetting date to real end date 
      // leave all others. 
      var end_year = end_date.getFullYear();
      var end_month = end_date.getMonth();
      var end_day = end_date.getDate();   
      var end_hours_UTC = end_date.getUTCHours();     
      if (end_hours_UTC == 0) {end_day = end_day-1};     
      end_date = new Date(end_year, end_month, end_day,12,0,0);     

      var event_id = response.result.items[j].id;  
      var sequence = response.result.items[j].sequence;
      eventInfo(event_id,event_header,start_date, end_date, sequence, calendar_id);  // keep in eventInfo object for later use
      events[j] = event_id;   // need an array to track the index so can use id displayEvents
    }
    sheetVariables.one.events = events;
    displayEvents(); 
  })   
}    // end of getEvents  ==========================================


function displayEvents() {
  var hscale = sheetVariables.one.hscale; 
  var vscale = sheetVariables.one.vscale; 
  var maxslots = sheetVariables.one.maxslots;
  var req_year = sheetVariables.one.req_year;
  var events = sheetVariables.one.events;
  var events_per_day = []; 

  for (r=0; r < 366; ++r) events_per_day[r] = [];  
  // initialise events_per_day array to 0s
  for (s=0; s<=maxslots; ++s){    // <= allows up to maxslots + 1 slots  this captures overflow
    for (r=0; r < 366; ++r){
      events_per_day[r][s]=0;
    }
  }  

// need to loop through events held in eventInfo object and display them

  for (var j = 0; j < events.length; j++) {
    var event_id = events[j];
    var event_header = eventInfo[event_id]["text"];
    var sequence = eventInfo[event_id["sequence"]]  
    var start_date_noon = eventInfo[event_id]["sd"]; // because already set in listUpcomingEvents
    var end_date_noon = eventInfo[event_id]["ed"];  // because already set in listUpcomingEvents

    var a=moment(start_date_noon).format("DDD")-1;   // -1 as want Jan 1 as 0
    var b=moment(end_date_noon).format("DDD")-1;        

    // handle events that started the year before the one being displayed when c=1
    // (events that start after or end before the year being displayed are not retrieved due to api parameters)

    var m=0;     // flag =0 if entirely in year, 1 if ends year after, 2 if starts year before,  3 if whole year

    if (start_date_noon.getFullYear() < req_year) {
      start_date_noon.setFullYear(req_year,0,1);       
      a=0;
      if (end_date_noon.getFullYear() > req_year) {
        m=3; // full year event
        //leap year code       
        var day29 = new Date(req_year,1,29)
        if (day29.getDate()==29) {
          b=365;   //leap year and 366 days in year
        }
        else {
          b=364;       
        }
        end_date_noon.setFullYear(req_year,11,31);
      }
      else m=2; // started before year ended in year
    }
    if (end_date_noon.getFullYear() > req_year) { // handle event that ends the year after the one being displayed
      m=1;
      //leap year code       
      var day29 = new Date(req_year,1,29)
        if (day29.getDate()==29) {
          b=365;   //leap year and 366 days in year
        }
        else {
          b=364;       
        }
      end_date_noon.setFullYear(req_year,11,31);
    }


    // check which slot is available and book it, k is the slot counter

    for (k = 0; k <= maxslots; ++k) {
      var clear=0;        // stays as 0 if the slot if available for the required number of days
      for (r=a; r<=b; ++r) {
        clear = clear + events_per_day[r][k];
      }
      if (clear==0) {
        for (r=a; r<=b; ++r) {
          events_per_day[r][k]=1  // change all the elements to 1 to book slot number found 
        }
        break;
      }
    }        // <= allows up to maxslots + 1 slots  this captures overflow

    if (k <= maxslots) {     // <= allows up to maxslots + 1 slots  this captures overflow 
    // need to check if event goes across months and then handle
    // by splitting into multiple events for write_event function
      var edm = end_date_noon.getMonth();
      var sdm = start_date_noon.getMonth();
      var month_span = edm - sdm;
      if (month_span == 0) {  // in 1 month but may have started year before or after m and cont handle this
        write_event(start_date_noon, end_date_noon, event_header,m,k, event_id);
      }            
      else {    // multiple months
        if (m==3) {   // started before and ended after, all months are mid months cont = 3
          for (var i = 0; i < 12; i++) {
            var first_day = new Date(req_year, i, 1, 12, 0, 0);  // start of middle month
            var last_day = new Date(req_year, i + 1, 0, 12, 0, 0);  // end of middle month
            write_event(first_day, last_day, event_header ,3,k, event_id);  
          }
        }              
        else {     //multi-month but not whole year could still b m=1 or m=2 and handle that below
          // write first month 
          if (m==2) {   // started year before so need to mod Jan
            var last_day = new Date(req_year, 1, 0, 12, 0, 0);  // end of Jan
            write_event(start_date_noon, last_day, event_header,3,k, event_id);   // Jan as a mid month
          }
          else {    // started in year so normal start
            var last_day = new Date(req_year, start_date_noon.getMonth() + 1, 0, 12, 0, 0);  // end of first month                
            write_event(start_date_noon, last_day, event_header,1,k, event_id)
          }

          // write middle months
          if (month_span>1){   // ie more than two months spanned
          //handle middle months
            for (var i = 1+1; i <= month_span; i++) {
              var mid_month = start_date_noon.getMonth()+i-1;
              var first_day = new Date(req_year, mid_month, 1, 12, 0, 0);  // start of middle month
              var last_day = new Date(req_year, mid_month + 1, 0, 12, 0, 0);  // end of middle month
              write_event(first_day, last_day, event_header,3,k, event_id);  
            }
          }

          // write end of event to last month from start of month to event end date
          var first_day = new Date(req_year, end_date_noon.getMonth(), 1, 12, 0, 0);  // start of end month
          if (m==1) {   // ends year after so Dec a middle month
            write_event(first_day, end_date_noon, event_header,3,k, event_id);  //using cont 0 should be 3 
          }
          else {write_event(first_day, end_date_noon, event_header,2,k, event_id)}
        }  // end of multi-month not whole year write 
      }  // end of multiple months write
    }       // end of if (k <= maxslots)
  }     // end of running through events



      // set up listeners and event handlers once display is complete
  function updateEvent(id, newText, startDate, endDate, sequence){
      // do the google APIU stuff first and if fails just redisplay (event may have been updated elsewhere)
      // if works then just update event and redisplay
    var start = startDate.format("YYYY-MM-DD");
    // need to increment endDate by 1 day to make whole day events work properly
    endDate.add(1, "day");
    var end = endDate.format("YYYY-MM-DD");
    sequence = sequence + 1;
    var request = gapi.client.calendar.events.update({
      'calendarId': 'lpsc36fa5jstuqfb5lu63u18jk@group.calendar.google.com',
      'eventId': id,
      'summary': newText,
      'start': {
        'date': start
      },
      'end': {
        'date': end
      },
      'sequence': sequence      
    });

    request.then(function(response) {
      $(".event1").remove();    //remove old events before redisplay 
      var req_calendar = sheetVariables.one.req_calendar;
      getEvents(req_calendar); // redisplay with revised date  }
    }, function(reason) {
      console.log(reason)   
    })
  }

  $(".event").click(function() {
    var elemId = $(this).attr('id');
    var elemOffsetTop = $(this).offset().top - $('#planner').offset().top + 15;
    var elemOffsetLeft = $(this).offset().left - $('#planner').offset().left; 
    var elemOffset = {top: elemOffsetTop, left: elemOffsetLeft};
    var eventText = (eventInfo[elemId]["text"]);
    var start=moment(eventInfo[elemId]["sd"]).format("DD/MM/YYYY"); 
    var end=moment(eventInfo[elemId]["ed"]).format("DD/MM/YYYY");
    var sequence = eventInfo[elemId]["seq"];
    var calendar_id = eventInfo[elemId]["calendar_id"];

    $(".form1").remove()  // get rid of any from previous clicks
    form1 = $("#form0").clone().prop('id', "form1").addClass('form1').insertAfter("#form0");
    form1.offset(elemOffset);
    $("#changeFlag", form1).val("0");
    $("#errorFlag", form1).val("0");
    $("#elemId", form1).val(elemId);
    $("#sequence", form1).val(sequence.toString());
    $("textarea#text0", form1).val(eventText);
    $("#startDate", form1).val(start);
    $("#endDate", form1).val(end);
    var access = calendarInfo[calendar_id]["accessRole"];
    if (access == "reader") {
      $("#save0", form1).css({"visibility": "hidden"});
      $("#sderror p", form1).css({"visibility": "visible"}).text("You only have read access to this calendar, so Update is not allowed");
    }
    form1.show(); // css({"visibility": "visible"});



    form1.mousedown(function(event) {
      var down = true;
      var position = $(this).position();
      var ptop = position.top;
      var pleft = position.left;
      var starttop = event.clientY;
      var startleft = event.clientX;
      var lowerlimit = 900 - form1.height();
      var rightlimit = 1350 - form1.width();
      $(this).css({cursor: 'move',});
      $(this).mousemove(function(event) {
          if (down == true) {
              $(this).css({cursor: 'move',});
              var newtop = ptop + event.clientY - starttop; 
              var newleft = pleft + event.clientX - startleft; 
              newtop = (newtop > 0 ? newtop : 0);
              newtop = (newtop < lowerlimit ? newtop : lowerlimit);
              newleft = (newleft > 0 ? newleft : 0);
              newleft = (newleft < rightlimit ? newleft :  rightlimit);
              $(this).css({
                  cursor: 'move',
                  top: newtop, 
                  left: newleft,
              });
              if (event.clientY == 0 || event.clientY == lowerlimit) {
                down = false; 
                $(this).css({cursor: 'default',});                
              }
              if (event.clientX == 0 || event.clientX == rightlimit) {
                down = false; 
                $(this).css({cursor: 'default',});  
              }
          }
      }).mouseup(function() {
          down = false; 
          $(this).css({cursor: 'default',});
      });
    });



    $("textarea#text0", form1).change(function() {
      $("#changeFlag", form1).val("1");
    })

    $("#daterange", form1)
      .each(function() {
        $(this)
          .datepicker({
            format: "dd/mm/yyyy",
            startDate: '01/01/1590',
            endDate: '31/12/2050',
          })

          .change(function() {
            $("#changeFlag", form1).val("1");
            $("#errorFlag", form1).val("0");
            $("#sderror p", form1).css({"visibility": "hidden"});
            $(this).removeClass("error");
            var startDate = moment($("#startDate", form1).val(), "DD/MM/YYYY");
            var endDate = moment($("#endDate", form1).val(), "DD/MM/YYYY");
            if ((startDate.isValid()) && (endDate.isValid())) {
            } else {
              $("#errorFlag", form1).val("1");
              $("#sderror p", form1).css({"visibility": "visible"}).text("Start and end dates cannot be blank, enter a valid date, dd-mm-yyyy");
              $(this).addClass("error");
            }
          })
    })

    $("#save0", form1).click(function() { 
      if ($("#changeFlag", form1).val() === "1")  {
        if ($("#errorFlag", form1).val() === "0") {
          var id = $("#elemId", form1).val();
          var newText = $("textarea#text0", form1).val();
          var startDate = moment($("#startDate", form1).val(), "DD/MM/YYYY");
          var endDate = moment($("#endDate", form1).val(), "DD/MM/YYYY");
          sequence = parseInt($("#sequence", form1).val());
          $("#changeFlag", form1).val("0");
          $("#sderror p", form1).css({"visibility": "hidden"});
          form1.remove(); 
          updateEvent(id, newText, startDate, endDate, sequence);
        }
      } else {
        if ($("#errorFlag", form1).val() === "0") {
          $("#sderror p", form1).css({"visibility": "hidden"});
          form1.remove(); 
        }
      }
    });

    $("#discard0", form1).click(function() {
      $("#sderror p", form1).css({"visibility": "hidden"})
      form1.remove();
    });
  })
} // end of displayEvents   ==============================



function write_event(sd,ed,text,cont,rank,event_id) {
  // sd, ed are Date objects
  //*********************************************************
  // rank determines where the event is positioned, can be rank 0, 1, 2, etc up to maxslots -1
  // cont=0: no continue whole event fits in one month
  // cont=1 : start month of multiple months event : starts and continues to next 
  // cont=2 : end month of multiple months event : ends continuing from previous
  // cont=3 : middle month of >2 months event : continues to next and continuing from previous
  // note that this function handles whole day events 
  // these are deemed to start at 00:00:00 on the first day
  // and end at midnight (00:00:00) on the day after the last day
  // to make the date arithmetic and displays work we reset this
  // to midday on both dates.
  var top_left_x = sheetVariables.one.top_left_x; 
  var top_left_y = sheetVariables.one.top_left_y;
  var day_width = sheetVariables.one.day_width;
  var month_height = sheetVariables.one.month_height;
  var event_increment_y = sheetVariables.one.event_increment_y;
  var month_first_day = sheetVariables.one.month_first_day; 
  var maxslots = sheetVariables.one.maxslots;

  var c=document.getElementById("myCanvas");
  var ctx=c.getContext("2d");   
  var start_year=sd.getFullYear();
  var start_month=sd.getMonth();
  var start_day=sd.getDate();     
  var end_year=ed.getFullYear();
  var end_month=ed.getMonth();
  var end_day=ed.getDate();       
  var text;
  var cont; 
  var top_left_event_y;
  var top_left_event_x;
  var el;
  var eventOutput;

  top_left_event_y = top_left_y + month_height * start_month + (rank+1) * event_increment_y;

  if (k<maxslots) {     // normal event

    // set size and position of events

    var points_str;
    switch (cont) {
      case 0:
        top_left_event_x = top_left_x + day_width * ((start_day) + month_first_day[start_month] - 0.80);
        el = (end_day-start_day+0.9) * day_width;
        points_str = "0,0 " + (el).toString() + ",0 " + (el).toString() + ",14 0,14";                 
        break; 
      case 1:
        top_left_event_x = top_left_x + day_width * ((start_day) + month_first_day[start_month] - 0.80);
        el = (end_day-start_day+1.1) * day_width;
        points_str = "0,0 " + (el-3.5).toString() + ",0 " + (el).toString() + ",7.5 " + (el-3.5).toString() + ",14 0,14";    
        break;
      case 2:
        top_left_event_x = top_left_x + day_width * ((start_day) + month_first_day[start_month] - 1);
        el = (end_day-start_day+1.1) * day_width;        
        points_str = "3.5,0 " + (el).toString() + ",0 " + (el).toString() + ",14 3.5,14 0,7";    
        break;
      case 3:
        top_left_event_x = top_left_x + day_width * ((start_day) + month_first_day[start_month] - 1);
        el = (end_day-start_day+1.3) * day_width;
        points_str = "3.5,0 " + (el-3.5).toString() + ",0 " + (el).toString() + ",7 " + (el-3.5).toString() + ",14 3.5,14 0,7";    
        break;
    } 

    // clone, size and position events
    eventOutput = $("#event0").clone().prop('id', event_id).addClass('event1').insertAfter("#event0");
    eventOutput.css({top: top_left_event_y-14, left: top_left_event_x}); 
    $("#svg0", eventOutput).attr('width', (el).toString());
    $("#poly0", eventOutput).attr('points', points_str); 
    $("#text0", eventOutput).text(text); 
    eventOutput.show() // css({"visibility": "visible"});
    // end of clone and position
  } // end of write normal event
  
  else {  // write over flow k!< maxslots
    top_left_event_x = top_left_x + day_width * ((start_day) + month_first_day[start_month] - 0.95);
    top_left_event_y = top_left_y + month_height * start_month + (maxslots+0.75) * event_increment_y;
    text = "+ more"
    eventOutput = $("#overflow0").clone().prop('id', "overflow1").insertAfter("#overflow0");
    eventOutput.css({top: top_left_event_y-14, left: top_left_event_x}); 
    $("#text1", eventOutput).text(text); 
    eventOutput.show();
  }
}   // end of write_event function  =========================



function makeRequest() {
    var hscale=0.9;
    var vscale=0.9;
    var maxslots=3;
    var top_left_x = 38*hscale;
    var top_left_y = 59*vscale;
    var day_width = 38*hscale;
    var month_height = 76*vscale;
    var event_increment_y = 17*hscale;
    var months = [];
    var events = [];
    var req_calendar;
    var req_year = moment().year();  // default req_year on load is this year, maybe change this later to make selected year pervasive using cookies?
    var month_first_day = [];   
    sheetVariables('one', hscale, vscale, req_year, top_left_x, top_left_y, day_width, month_height, event_increment_y, month_first_day, maxslots, events, req_calendar); 
    yearpicker(req_year)  // sets up year picker with default year selected
    blankPlanner(req_year);  // called with default year initially
    getCalendars();  // sorts out sign in to Google and displays list of calendars

    $("#yearpicker").change(function() {
        req_year =  $('#yearpicker').val();   //Val and html the same and val easier to use as already number    
        $('.event1').remove();
        $('#overflow1').remove();
        blankPlanner(req_year);  // reload planner with selected year
        sheetVariables.one.req_year = req_year;
        calendar_id = sheetVariables.one.req_calendar;
        getEvents(calendar_id);
    })

    $('#left').click(function() {
        var req_year = Number($('#yearpicker').val()) - 1;
        $('.event1').remove();
        $('#yearpicker').val(req_year);
        $('#overflow1').remove();
        blankPlanner(req_year);  // reload planner with selected year
        sheetVariables.one.req_year = req_year;
        calendar_id = sheetVariables.one.req_calendar;
        getEvents(calendar_id);
    })

    $('#right').click(function() {
        var req_year = Number($('#yearpicker').val()) + 1;
        $('.event1').remove();
        $('#overflow1').remove();
        $('#yearpicker').val(req_year);
        sheetVariables.one.req_year = req_year;
        calendar_id = sheetVariables.one.req_calendar;
        blankPlanner(req_year);  // reload planner with selected year
        getEvents(calendar_id);
    })   

    $('.calname').click(function() {
        $('.event1').remove();
        $('#overflow1').remove();
        var calendar_id = $(this).attr('id');  // because id of button set to calendar_id
        sheetVariables.one.req_calendar = calendar_id // store this as current calendar
        blankPlanner(req_year);  // reload planner with selected year
        getEvents(calendar_id);
    })

}  // end of makeRequest()    ===================================

