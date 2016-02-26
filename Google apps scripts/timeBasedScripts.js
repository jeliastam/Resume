/** For Weekly and Daily checks **/
function setAndFormatCells (sheet, ACTIVE_ROW, date, numOfDevices) {
  var emptyCellCol = getEmptyCellColNum(sheet, ACTIVE_ROW);
  var dateCell = sheet.getRange(ACTIVE_ROW - 1, emptyCellCol);
  var numCell = sheet.getRange(ACTIVE_ROW, emptyCellCol);
  
  dateCell.setValue(date).setBackgroundRGB(217,217,217).setBorder(true,true,true,true,false,false);
  numCell.setValue(numOfDevices).setBorder(true,true,true,true,false,false);
}

function setCells (sheet, ACTIVE_ROW,/* date,*/ numOfDevices) {
  var emptyCellCol = getEmptyCellColNum(sheet, ACTIVE_ROW);
  var numCell = sheet.getRange(ACTIVE_ROW, emptyCellCol - 1);
  
  numCell.setValue(numOfDevices);
}

function getDelivered (deliveredSheet, thisMonth) {
  //  Find # of delivered in the past month
  //  updated to make sure the month is in the same YEAR!! DUH
  
//  DEBUG or Get delivered for any month
//  var deliveredSheet = deliveredSheet || SpreadsheetApp.openById('1QG9Nlxu_wOgHXdSsJxmhosXm3b2vuxcfSSnOu1jeC9Y').getSheetByName('Delivered');
//  var thisMonth = thisMonth || 7;
  
  var column = deliveredSheet.getRange("X:X");
  var values = column.getValues(); // get all data in one call
  var deliveredCount = 0;
  var counter = 0;
  var thisYear = new Date().getYear();
  var month, year;
  
  while (values[counter][0] != "") {
    if (values[counter][0] instanceof Date) {
      month = values[counter][0].getMonth();
      year = values[counter][0].getYear();
      if (month === thisMonth && year == thisYear)
        deliveredCount++;
    }
    counter++;
  }
  
  return deliveredCount;
}

function getEmptyCellColNum (dataSheet, row) {
  //  Find and return the first blank cell in a row
  
  var range = dataSheet.getRange(row, 1, 1, 100);  //  limitation of 100(99 maybe) entries
  var values = range.getValues();
  var i = 0;
  
  while (values[0][i] != '') {
    i++;
  }
  
  return i + 1;
}

function getNumInIcebox (sheet) {
  //  Get the number of devices in the icebox
  return getFirstEmptyRow(sheet) - 3;  //  this function finds the last row, which is also a count of how many rows exist
  // - 3 to account for header
}

/** Find the first empty row after finding content, or returns the first empty row if no content is found **/
function findRow(ss) {
  var HEADER_SIZE = 2;
  var column = ss.getRange("B:B");
  var values = column.getValues(); // get all data in one call
  var countdown = values.length;  //Not 0 to account for header rows
  
  while (countdown > HEADER_SIZE && values[countdown - 1][0] == "") {
    countdown--; 
  }
  
  if (countdown > HEADER_SIZE) {
    var countdown_cont = countdown;
    while (countdown_cont > 0 && values[countdown_cont - 1][0] !== "") {
      countdown_cont--;
    }
    
    return countdown_cont;
  } else
    return countdown;  //Incase row isn't found, this sets the first empty row as the row
}

function getFirstEmptyRow(sheet) {
  var column = sheet.getRange("B:B");
  var values = column.getValues(); // get all data in one call
  var countdown = values.length - 1;  //Not 0 to account for header rows
  
  while (values[countdown][0] == '') {
    countdown--;
  }
  
  return (countdown + 1);
}

/** For the Fix BG menu item **/
function fixRowBGs() {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  for (var i = 4; i < getFirstEmptyRow(sheet) + 1 ; i++) {
    sheet.getRange(i, 1, 1, sheet.getLastColumn()).setBackground('#FFF');
    i++;
    sheet.getRange(i, 1, 1, sheet.getLastColumn()).setBackground('#EEE');
  }
}

/** Add new row at top and move over event source row **/
function moveRow(ss, destSheetName, origSheet, row, offset) {
  destSheet = ss.getSheetByName(destSheetName);
  numColumns = origSheet.getLastColumn();
  destSheet.insertRowBefore(offset);
  target = destSheet.getRange("A" + offset);
  
  origSheet.getRange(row, 1, 1, numColumns).copyTo(target);
  origSheet.deleteRow(row);
}