function InfinityPrime(command, payload) {
  switch (command) {

    case "create_doc":
      return DocumentApp.create(payload.name).getId();

    case "write_doc":
      var d = DocumentApp.openById(payload.id);
      d.getBody().appendParagraph(payload.text);
      d.saveAndClose();
      return true;

    case "create_sheet":
      return SpreadsheetApp.create(payload.name).getId();

    case "write_sheet":
      var s = SpreadsheetApp.openById(payload.id);
      s.getSheets()[0].getRange(1,1,payload.data.length,payload.data[0].length)
        .setValues(payload.data);
      return true;

    case "send_email":
      GmailApp.sendEmail(payload.to, payload.subject, payload.body);
      return true;

    case "calendar_event":
      CalendarApp.createEvent(
        payload.title,
        new Date(payload.start),
        new Date(payload.end),
        {description: payload.description}
      );
      return true;

    default:
      throw "Unknown InfinityPrime command";
  }
}
