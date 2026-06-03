function parseRequestData(e) {
  if (e && e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }

  if (e && e.postData && e.postData.contents) {
    return e.postData.contents.split("&").reduce(function (acc, pair) {
      var parts = pair.split("=");
      var key = decodeURIComponent((parts[0] || "").replace(/\+/g, " "));
      var value = decodeURIComponent((parts[1] || "").replace(/\+/g, " "));

      if (key) {
        acc[key] = value;
      }

      return acc;
    }, {});
  }

  return {};
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = parseRequestData(e);

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.company || "",
    data.phone || "",
    data.email || "",
    data.topic || "",
    data.message || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function testDoPost() {
  return doPost({
    parameter: {
      name: "테스트 담당자",
      company: "테스트 회사",
      phone: "010-0000-0000",
      email: "test@example.com",
      topic: "테스트 문의",
      message: "Apps Script 테스트 입력입니다.",
    },
  });
}
