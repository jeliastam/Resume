function idFix() {
  var pic = SpreadsheetApp.openById("19ufLDxVoZkAaFMRH8m2uzH9AfnYhdzFWRhx5oFtcq4Y");
  var wfDoc = SpreadsheetApp.openById("1QG9Nlxu_wOgHXdSsJxmhosXm3b2vuxcfSSnOu1jeC9Y");
  var sheets = {
    icebox : wfDoc.getSheetByName("Icebox"),
    pwf : wfDoc.getSheetByName("PWF"),
    qc : wfDoc.getSheetByName("QC"),
    completed : wfDoc.getSheetByName("Completed"),
    pic : pic.getSheetByName("Invoice Control")
  };
  
  var numDevices = {
    icebox : getFirstEmptyRow(sheets.icebox),
    pwf : getFirstEmptyRow(sheets.pwf),
    qc : getFirstEmptyRow(sheets.qc),
    completed : getFirstEmptyRow(sheets.completed),
    pic : getFirstEmptyRow(sheets.pic)
  };
  
  var data = {
    icebox : {
      devices : sheets.icebox.getRange("B4:B" + numDevices.icebox).getValues(),
      ids : sheets.icebox.getRange("A4:A" + numDevices.icebox).getValues(),
      type : sheets.icebox.getRange("C4:C" + numDevices.icebox).getValues(),
      os : sheets.icebox.getRange("D4:D" + numDevices.icebox).getValues(),
      client : sheets.icebox.getRange("F4:F" + numDevices.icebox).getValues(),
      carrier : sheets.icebox.getRange("G4:G" + numDevices.icebox).getValues()
    },
    pwf : {
      devices : sheets.pwf.getRange("B4:B" + numDevices.pwf).getValues(),
      ids : sheets.pwf.getRange("A4:A" + numDevices.pwf).getValues(),
      type : sheets.pwf.getRange("C4:C" + numDevices.pwf).getValues(),
      os : sheets.pwf.getRange("D4:D" + numDevices.pwf).getValues(),
      client : sheets.pwf.getRange("F4:F" + numDevices.pwf).getValues(),
      carrier : sheets.pwf.getRange("G4:G" + numDevices.pwf).getValues()
    },
    qc : {
      devices : sheets.qc.getRange("B4:B" + numDevices.qc).getValues(),
      ids : sheets.qc.getRange("A4:A" + numDevices.qc).getValues(),
      type : sheets.qc.getRange("C4:C" + numDevices.qc).getValues(),
      os : sheets.qc.getRange("D4:D" + numDevices.qc).getValues(),
      client : sheets.qc.getRange("F4:F" + numDevices.qc).getValues(),
      carrier : sheets.qc.getRange("G4:G" + numDevices.qc).getValues()
    },
    completed : {
      devices : sheets.completed.getRange("B3:B" + numDevices.completed).getValues(),
      ids : sheets.completed.getRange("A3:A" + numDevices.completed).getValues(),
      type : sheets.completed.getRange("C3:C" + numDevices.completed).getValues(),
      os : sheets.completed.getRange("D3:D" + numDevices.completed).getValues(),
      client : sheets.completed.getRange("F4:F" + numDevices.completed).getValues(),
      carrier : sheets.completed.getRange("G4:G" + numDevices.completed).getValues()
    },
    pic : {
      devices : sheets.pic.getRange("B4:B" + numDevices.pic).getValues(),
      ids : sheets.pic.getRange("A4:A" + numDevices.pic).getValues(),
      type : sheets.pic.getRange("C4:C" + numDevices.pic).getValues(),
      os : sheets.pic.getRange("D4:D" + numDevices.pic).getValues(),
      client : sheets.pic.getRange("F4:F" + numDevices.pic).getValues(),
      carrier : sheets.pic.getRange("G4:G" + numDevices.pic).getValues()
    }
  };
  
  for (var obj in data) {
    if (data.hasOwnProperty(obj)) {
      for (var item in data[obj]) {
        if (data[obj].hasOwnProperty(item)) {
          for (var key in data[obj][item]) {
            if (data[obj][item].hasOwnProperty(key)) {
              data[obj][item][key] = data[obj][item][key].toString();
            }
          }
        }
      }
    }
  }

  var picList = data.pic.devices;
  var picIds = data.pic.ids;
  var device, id, type, os, client, carrier, loc;
  var curList, curSheet;
  for (key in picList) {
    if (picList.hasOwnProperty(key)) {

      key = parseInt(key);
      device = data.pic.devices[key];
      id = data.pic.ids[key];
      type = data.pic.type[key];
      os = data.pic.os[key];
      client = data.pic.client[key];
      carrier = data.pic.carrier[key];

      for (var sheetName in sheets) {
        if (sheets.hasOwnProperty(sheetName)) {

          if (sheetName === "pic")
            continue;

          curSheet = data[sheetName];
          curList = data[sheetName]["devices"];
          loc = curList.indexOf(device);

          while (loc > -1) {
            if (type === curSheet.type[loc] &&
                os === curSheet.os[loc] &&
                carrier === curSheet.carrier[loc] &&
                client === curSheet.client[loc]) {
              //Set the id in data.pic.ids
              Logger.log(type + " = " + curSheet.type[loc] + " and " + os + " = " + curSheet.os[loc] + " and " + carrier + " = " + curSheet.carrier[loc] + " and " + client + " = " + curSheet.client[loc]);

              picIds[key] = curSheet["ids"][loc];
              break;
            } else {
              loc = curList.indexOf(device, loc + 1);
            }
          }
        }
      }
    }

    for (key in data[pic][ids]) {
      if (data[pic][ids].hasOwnProperty(key)) {
        data.pic.ids[key] = [data.pic.ids[key]];
      }
    }

    sheets.pic.getRange("A4:A" + numDevices.pic).setValues(data.pic.ids);
  }
  
}
