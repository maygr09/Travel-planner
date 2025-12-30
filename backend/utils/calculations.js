const getExchangeRate = (currencies, code) => {
  const currency = currencies.find(c => c.code === code);
  return currency ? currency.exchangeToMXN : null;
};

const sumItems = (items, currencies) => {
  let total = 0;

  items.forEach(item => {
    if (!item.cost || !item.currencyCode) return;

    const rate = getExchangeRate(currencies, item.currencyCode);
    if (!rate) return;

    total += item.cost * rate;
  });

  return total;
};

const calculateVersionSummary = (version, trip) => {
  const currencies = trip.currencies || [];

  const transport = sumItems(version.transports || [], currencies);
  const activities = sumItems(version.activities || [], currencies);
  const meals = sumItems(version.meals || [], currencies);
  const accommodations = sumItems(version.accommodations || [], currencies);

  const totalMXN = transport + activities + meals + accommodations;
  const perPersonMXN = trip.peopleCount
    ? totalMXN / trip.peopleCount
    : totalMXN;

  return {
    breakdown: { transport, activities, meals, accommodations },
    totalMXN,
    perPersonMXN
  };
};

module.exports = { calculateVersionSummary };