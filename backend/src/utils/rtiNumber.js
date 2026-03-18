function getYearFromDate(value) {
  if (!value) {
    return String(new Date().getFullYear());
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(new Date().getFullYear());
  }

  return String(date.getFullYear());
}

function parseSerial(value) {
  const text = String(value || '').trim();
  if (!text) {
    return null;
  }

  let match = /^RTI\/(\d{4})\/(\d+)$/i.exec(text);
  if (match) {
    return {
      year: match[1],
      serial: Number(match[2])
    };
  }

  match = /^RTI(\d+)$/i.exec(text);
  if (match) {
    return {
      year: null,
      serial: Number(match[1])
    };
  }

  match = /^(\d+)$/i.exec(text);
  if (match) {
    return {
      year: null,
      serial: Number(match[1])
    };
  }

  return null;
}

function buildRtiNumber(year, serial) {
  if (!Number.isInteger(serial) || serial < 0) {
    return '';
  }

  return `RTI/${String(year)}/${String(serial).padStart(2, '0')}`;
}

function normalizeRtiNumber(value, applicationDate) {
  const parsed = parseSerial(value);
  if (!parsed) {
    return String(value || '').trim();
  }

  const year = parsed.year || getYearFromDate(applicationDate);
  return buildRtiNumber(year, parsed.serial);
}

module.exports = {
  normalizeRtiNumber
};
