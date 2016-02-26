function myEdits(e) {
  var today = new Date();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pic = SpreadsheetApp.openById("19ufLDxVoZkAaFMRH8m2uzH9AfnYhdzFWRhx5oFtcq4Y");
  var picSheet = pic.getSheetByName("Invoice Control");
  var studio = SpreadsheetApp.openById("1eopd82hjgj4HV5sX15QJrFqnmAUvtGrxxS3XLRM9dLg");
  var studioRequestSheet = studio.getSheetByName("Photo Requests");
  var s = e.source.getActiveSheet();
  var r = e.source.getActiveRange();
  var row = r.getRow();
  var sheetDest, sheetOrig, numColumns, target, target2, data = [];
  
  //
  //  Move row to 'PWF' sheet if event origin sheet is 'Icebox' and the 'Builder' cell is set to a value
  if (s.getName() === "Icebox" && r.getColumn() === 15 && typeof r.getValue() !== "undefined") {
    
    sheetDest = ss.getSheetByName("PWF");
    numColumns = s.getLastColumn();
    sheetDest.insertRowBefore(4);
    target = sheetDest.getRange("A4");   //sheetDest.getLastRow() + 1, 1);
    s.getRange(row, 1, 1, numColumns).moveTo(target);
    s.deleteRow(row);
    sheetDest.getRange(4,16).setValue(today);
    sheetDest.getRange(2,1).setNote(parseInt(sheetDest.getRange(2,1).getNote(), 10) + 1); //  Increment ID value
    sheetDest.getRange(4,1).setValue(parseInt(sheetDest.getRange(2,1).getNote(), 10));    //  Set A4(ID cell of new row) to new ID value
    sheetDest.getRange(4,10).setValue("In Progress");
    
    return;
  }
  
  //
  //  Move row to 'QC' or 'Delivered' sheet if event origin is 'PWF' and the 'Device Status' cell
  //  is changed to 'Delivered' or 'QC'ing'.  Additionally, copy row to PIC if status is 'Delivered'
  if (s.getName() === "PWF" && r.getColumn() === 10) {    
    if (r.getValue() === "Sent to Photo") {
      
      studioRequestSheet.insertRowBefore(2);
      
      target = studioRequestSheet.getRange(2,1,1,8);
      
      data = s.getRange(row,1,1,15).getValues();
      
      target.getCell(1,1).setValue(data[0][0]);
      target.getCell(1,2).setValue(data[0][1]);
      target.getCell(1,3).setValue(data[0][6]);
      target.getCell(1,4).setValue("In Queue");
      target.getCell(1,5).setValue(data[0][14]);
      target.getCell(1,6).setValue("screenshoot");
      target.getCell(1,8).setValue(today);

      return;
    }
    
    if (r.getValue() === "Return to Icebox") {
      
      sheetDest = ss.getSheetByName("Icebox");  //Set Destination sheet
      
      sheetDest.insertRowBefore(4); //add new row to top of destination sheet
      
      target = sheetDest.getRange("A4");  //get the new added row
      
      s.getRange(row, 1, 1, 15).copyTo(target);
      
      s.deleteRow(row);

      sheetDest.getRange("A4").setValue("");
      sheetDest.getRange("J4").setValue("");
      sheetDest.getRange("O4").setValue("");
      
      return; 
    }
    
    if (r.getValue() === "Ready for QC") {
      
      sheetDest = ss.getSheetByName("QC");
      numColumns = s.getLastColumn();
      sheetDest.insertRowBefore(4);
      target = sheetDest.getRange("A4");
      
      s.getRange(row, 1, 1, numColumns).moveTo(target);
      s.deleteRow(row);

      sheetDest.getRange(4,19).setValue(today);  //Set "Delivered to QC" to today
      
      return;
    }
    
    if (r.getValue() === "Completed") {
      s.getRange(row,23).setValue(today);  //Set "Date to PM" to today
      return;
    }
    
    if (r.getValue() === "Delivered") {
      data = s.getRange(row, 1, 1, 7).getValues(); //Get array of data for cross workbook transfer
      
      /*** Transfer from PWF to Delivered sheet ***/
      sheetDest = ss.getSheetByName("Delivered");  //Set Destination sheet
      numColumns = s.getLastColumn();              //find the last column on source sheet
      sheetDest.insertRowBefore(3);                //add new row to top of destination sheets
      target = sheetDest.getRange("A3");           //get the new added rows
      
      s.getRange(row, 1, 1, numColumns - 1).copyTo(target);
      s.deleteRow(row);
      sheetDest.getRange(3,24).setValue(today);
      
      /*** Check PIC for device and update Delivered date OR insert if not found ***/      
      var picNum = getFirstEmptyRow(picSheet);
      var pic = {
          deviceName : picSheet.getRange("B4:B" + picNum).getValues(),
          type : picSheet.getRange("C4:C" + picNum).getValues(),
          os : picSheet.getRange("D4:D" + picNum).getValues(),
          client : picSheet.getRange("F4:F" + picNum).getValues(),
          carrier : picSheet.getRange("G4:G" + picNum).getValues()
      };
      
      for (var obj in pic) {                       //clean data from spreadsheet
        for (var item in pic[obj]) {
            pic[obj][item] = pic[obj][item].toString();
        }
      }
      
      //check for existing device in PIC
      var list = pic.deviceName;
      var loc = list.indexOf(data[0][1]);
      
      while (loc > -1) {
        if (pic.type[loc] === data[0][2]   && 
            pic.os[loc] === data[0][3]     && 
            pic.client[loc] === data[0][5] && 
            pic.carrier[loc] === data[0][6]) {
          picSheet.getRange(loc + 4, 1).setValue(data[0][0]);
          picSheet.getRange(loc + 4,8).setValue(today);
          break;
        } else {
          loc = list.indexOf(data[0][1], loc + 1);
        }
      }
      
      if (loc === -1) {                             //if not found, then insert
        picSheet.insertRowBefore(4);
        target2 = picSheet.getRange(4,1,1,8);
        data[0].push(today);
        target2.setValues(data);
      }
      
      return;
    }
  }
  
  //
  //  Move row to 'PWF' sheet if event origin sheet is 'QC' and the 'Device Status' cell is set to 'EQC Complete'
  //  Also, add the current date and time as a note to the QCer field when QCer claims a device
  //
  if (s.getName() === "QC") {
    
    if (r.getColumn() === 10 && r.getValue() === "EQC Complete") {
      sheetDest = ss.getSheetByName("PWF");
      //row = r.getRow();
      numColumns = s.getLastColumn();
      sheetDest.insertRowBefore(4);
      target = sheetDest.getRange("A4");
      s.getRange(row, 1, 1, numColumns).moveTo(target);
      s.deleteRow(row);
      sheetDest.getRange(4,22).setValue(today);  //Set "Date from QC" to today
      
      return;
    } else if (r.getColumn() === 21) {
      if (r.getValue() !== "") {
        s.getRange(row,21).setNote("Started on " + today);
        s.getRange(row,10).setValue("In Progress");
      } else if (r.getValue() == "") {  // To clear the note if device is claimed mistakenly
        s.getRange(row,21).setNote("");
        s.getRange(row,10).setValue("Ready for QC");
      }
    }
  }

}
