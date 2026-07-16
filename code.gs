/**
 * Menyajikan halaman HTML utama saat web app diakses.
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Enterprise Dashboard - PurworejoIT')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Membaca data dari sheet "Monitoring LC" secara realtime dan optimal.
 * Mengonversi tanggal ke format string terstandardisasi agar mudah diolah di frontend.
 */
function getLCData() {
  try {
    var sheetName = "Monitoring LC";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    // Fallback jika nama sheet tidak persis sama
    if (!sheet) {
      var sheets = ss.getSheets();
      for (var i = 0; i < sheets.length; i++) {
        if (sheets[i].getName().toLowerCase().indexOf("Monitoring") > -1 || 
            sheets[i].getName().toLowerCase().indexOf("LC") > -1) {
          sheet = sheets[i];
          break;
        }
      }
      if (!sheet && sheets.length > 0) {
        sheet = sheets[0]; // Ambil sheet pertama jika semua pencarian gagal
      }
    }
    
    if (!sheet) {
      throw new Error("Sheet 'Monitoring LC' tidak ditemukan.");
    }

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { headers: [], rows: [], success: true, count: 0 };
    }

    var headers = data[0].map(function(h) { return h.toString().trim(); });
    var rows = [];
    var timeZone = Session.getScriptTimeZone();

    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      // Lewati baris kosong
      if (!row[0] && !row[1] && !row[2]) continue;

      var rowObj = {};
      for (var c = 0; c < headers.length; c++) {
        var val = row[c];
        var colName = headers[c];
        
        if (val instanceof Date) {
          rowObj[colName] = Utilities.formatDate(val, timeZone, "yyyy-MM-dd");
        } else {
          rowObj[colName] = val;
        }
      }
      rows.push(rowObj);
    }

    return {
      success: true,
      headers: headers,
      rows: rows,
      count: rows.length,
      sheetName: sheet.getName(),
      timestamp: Utilities.formatDate(new Date(), timeZone, "dd-MM-yyyy HH:mm:ss")
    };
  } catch (e) {
    return {
      success: false,
      error: e.toString()
    };
  }
}
