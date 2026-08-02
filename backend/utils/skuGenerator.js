const generateSKU = (category = 'GEN', brand = 'LUX') => {
  const catCode = category.substring(0, 3).toUpperCase();
  const brandCode = brand.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${brandCode}-${catCode}-${randomNum}`;
};

const generateInvoiceNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(10000 + Math.random() * 90000);
  return `INV-${dateStr}-${randomStr}`;
};

module.exports = { generateSKU, generateInvoiceNumber };
