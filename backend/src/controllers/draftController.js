const PDFDocument = require('pdfkit');
const { RTIApplication } = require('../models/RTIApplication');
const asyncHandler = require('../utils/asyncHandler');

const templates = {
  application: (rti) => `To,\nPublic Information Officer\n${rti.department}\n\nSubject: Application under RTI Act, 2005\n\nI, ${rti.applicantName}, request the following information regarding: ${rti.subject}.\n\nRTI Number: ${rti.rtiNumber}\nDate of Application: ${new Date(rti.applicationDate).toLocaleDateString('en-IN')}\n\nApplicant Address:\n${rti.applicantAddress || '-'}\n\nSincerely,\n${rti.applicantName}`,
  first_appeal: (rti) => `To,\nFirst Appellate Authority\n${rti.department}\n\nSubject: First Appeal under Section 19(1) of RTI Act\n\nReference RTI No: ${rti.rtiNumber}\nSubject: ${rti.subject}\n\nGrounds: No complete response received from PIO within statutory period.\n\nAppellant:\n${rti.applicantName}`,
  second_appeal: (rti) => `To,\nCentral/State Information Commission\n\nSubject: Second Appeal under Section 19(3) of RTI Act\n\nReference RTI No: ${rti.rtiNumber}\nDepartment: ${rti.department}\n\nGrounds: Unsatisfactory disposal at first appeal stage.\n\nAppellant:\n${rti.applicantName}`
};

const generateDraft = asyncHandler(async (req, res) => {
  const { type, rtiId } = req.params;
  const format = req.query.format || 'text';

  const rti = await RTIApplication.findById(rtiId).lean();
  if (!rti) {
    res.status(404);
    throw new Error('RTI not found');
  }

  const builder = templates[type];
  if (!builder) {
    res.status(400);
    throw new Error('Invalid draft type');
  }

  const content = builder(rti);

  if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-draft-${rti.rtiNumber}.pdf"`);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);
    doc.fontSize(12).text(content);
    doc.end();
    return;
  }

  res.json({ type, content });
});

module.exports = {
  generateDraft
};