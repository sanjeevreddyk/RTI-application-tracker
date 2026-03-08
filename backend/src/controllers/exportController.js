const PDFDocument = require('pdfkit');
const { stringify } = require('csv-stringify/sync');
const { RTIApplication } = require('../models/RTIApplication');
const asyncHandler = require('../utils/asyncHandler');

const exportCsv = asyncHandler(async (_req, res) => {
  const records = await RTIApplication.find({}).sort({ applicationDate: -1 }).lean();

  const csv = stringify(
    records.map((r) => ({
      rtiNumber: r.rtiNumber,
      applicantName: r.applicantName,
      department: r.department,
      subject: r.subject,
      applicationDate: r.applicationDate,
      status: r.status,
      modeOfFiling: r.modeOfFiling,
      postalTrackingNumber: r.postalTrackingNumber,
      applicationFee: r.applicationFee
    })),
    { header: true }
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="rti-cases.csv"');
  res.send(csv);
});

const exportPdf = asyncHandler(async (_req, res) => {
  const records = await RTIApplication.find({}).sort({ applicationDate: -1 }).lean();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="rti-cases.pdf"');

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);

  doc.fontSize(18).text('RTI Case Management Report');
  doc.moveDown();

  records.forEach((item, index) => {
    doc
      .fontSize(11)
      .text(`${index + 1}. ${item.rtiNumber} | ${item.department} | ${item.status}`)
      .text(`Subject: ${item.subject}`)
      .text(`Applicant: ${item.applicantName}`)
      .text(`Filed On: ${new Date(item.applicationDate).toLocaleDateString('en-IN')}`)
      .moveDown(0.5);
  });

  doc.end();
});

module.exports = {
  exportCsv,
  exportPdf
};