function incrementGroupNumber() {
   var ss = SpreadsheetApp.getActiveSpreadsheet(),
       sheet = ss.getSheetByName("Office Reporting 2"),
       cell = sheet.getRange(1,1),
       currentVal = cell.getValue();
  
  if (currentVal < 3) {
    cell.setValue(currentVal + 1);
  } else {
    cell.setValue(1);
  }
}

/**********************************************/
/**********************************************/
/**********************************************/

function weeklyIceboxCheck() {
  //  Attached to weekly trigger
  var ACTIVE_ROW = 20;
  var ss = SpreadsheetApp.openById('1QG9Nlxu_wOgHXdSsJxmhosXm3b2vuxcfSSnOu1jeC9Y');
  var dataSheet = ss.getSheetByName('Display Data');
  var icebox = ss.getSheetByName('Icebox');
  var today = new Date();
  var numInIcebox = getNumInIcebox(icebox);

  setAndFormatCells (dataSheet, ACTIVE_ROW, today, numInIcebox);
}

/**********************************************/
/**********************************************/
/**********************************************/
function DailyDeliveredCheck() {
  //  Attached to daily trigger
  var ACTIVE_ROW = 24;
  var months = new Array(12);
  months[0] = "January";
  months[1] = "February";
  months[2] = "March";
  months[3] = "April";
  months[4] = "May";
  months[5] = "June";
  months[6] = "July";
  months[7] = "August";
  months[8] = "September";
  months[9] = "October";
  months[10] = "November";
  months[11] = "December";
  
  var date = new Date();      // Get todays date
  var day = date.getDate();   // Extract day number
  var month = date.getMonth();       // Extract the month index number
  var monthName = months[month]; // Get the month's name
  var ss = SpreadsheetApp.openById('1QG9Nlxu_wOgHXdSsJxmhosXm3b2vuxcfSSnOu1jeC9Y');
  var dataSheet = ss.getSheetByName('Display Data');
  var deliveredSheet = ss.getSheetByName('Delivered');
  var numDeliveredThisMonth = getDelivered(deliveredSheet, month);
  
  if (day === 1)
    setAndFormatCells (dataSheet, ACTIVE_ROW, monthName, numDeliveredThisMonth);
  else
    setCells (dataSheet, ACTIVE_ROW, numDeliveredThisMonth);
}

/**********************************************/
/**********************************************/
/**********************************************/

function updateInvoiceControl() {
  var pic = SpreadsheetApp.openById("19ufLDxVoZkAaFMRH8m2uzH9AfnYhdzFWRhx5oFtcq4Y");
  var wfDoc = SpreadsheetApp.openById("1QG9Nlxu_wOgHXdSsJxmhosXm3b2vuxcfSSnOu1jeC9Y");
  
  var picSheet = pic.getSheetByName("Invoice Control");
  var picNum = getFirstEmptyRow(picSheet);
  
  var iceboxSheet = wfDoc.getSheetByName("Icebox");
  var iceboxNum = getFirstEmptyRow(iceboxSheet);
  
  var data = {
    icebox : {
      deviceName : iceboxSheet.getRange("B4:B" + iceboxNum).getValues(),
      type : iceboxSheet.getRange("C4:C" + iceboxNum).getValues(),
      os : iceboxSheet.getRange("D4:D" + iceboxNum).getValues(),
      client : iceboxSheet.getRange("F4:F" + iceboxNum).getValues(),
      carrier : iceboxSheet.getRange("G4:G" + iceboxNum).getValues()
    },
    pic : {
      deviceName : picSheet.getRange("B4:B" + picNum).getValues(),
      type : picSheet.getRange("C4:C" + picNum).getValues(),
      os : picSheet.getRange("D4:D" + picNum).getValues(),
      client : picSheet.getRange("F4:F" + picNum).getValues(),
      carrier : picSheet.getRange("G4:G" + picNum).getValues()
    }
  };
  
  for (var obj in data) {
    for (var item in data[obj]) {
      for (var key in data[obj][item]) {
        data[obj][item][key] = data[obj][item][key].toString();
      }
    }
  }

  var picList = data.pic.deviceName;
  var list    = data.icebox.deviceName;
  var target, row, values, insert;
  
  for (var key in list) {
    insert = false;
    key = parseInt(key);
    var loc = picList.indexOf(list[key]);
    
    while (loc > -1) {
      if (data.pic.type[loc] === data.icebox.type[key]       &&
          data.pic.os[loc] === data.icebox.os[key]           &&
          data.pic.carrier[loc] === data.icebox.carrier[key] &&
          data.pic.client[loc] === data.icebox.client[key]) {
        break;
      } else {
        loc = picList.indexOf(list[key], loc + 1);
      }
    }
    
    if (loc === -1) {
      insert = true;
    }
    
    if (insert) {
      picSheet.insertRowBefore(4);
      row = key + 4;
      
      target = picSheet.getRange(4,2,1,6);
      
      values = iceboxSheet.getRange(row, 2, 1, 6).getValues();
      
      target.setValues(values);
    }
  }
}
