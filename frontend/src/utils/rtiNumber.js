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
  if (!value) {
    return null;
  }

  const text = String(value).trim();
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

export function buildRtiNumber(year, serial) {
  const safeYear = String(year || new Date().getFullYear());
  const safeSerial = Number(serial);
  if (!Number.isInteger(safeSerial) || safeSerial < 0) {
    return '';
  }

  return `RTI/${safeYear}/${String(safeSerial).padStart(2, '0')}`;
}

export function formatRtiNumber(value, applicationDate) {
  const parsed = parseSerial(value);
  if (!parsed) {
    return String(value || '').trim();
  }

  const year = parsed.year || getYearFromDate(applicationDate);
  return buildRtiNumber(year, parsed.serial);
}

export function getNextRtiNumberForYear(items, applicationDate) {
  const targetYear = getYearFromDate(applicationDate);

  const maxSerial = (items || []).reduce((max, item) => {
    const parsed = parseSerial(item?.rtiNumber);
    if (!parsed || !Number.isInteger(parsed.serial) || parsed.serial < 0) {
      return max;
    }

    const recordYear = parsed.year || getYearFromDate(item?.applicationDate);
    if (String(recordYear) !== String(targetYear)) {
      return max;
    }

    return Math.max(max, parsed.serial);
  }, 0);

  return buildRtiNumber(targetYear, maxSerial + 1);
}
