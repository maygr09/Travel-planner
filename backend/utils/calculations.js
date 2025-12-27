const getExchangeRate = (currencies, code) => {
  const currency = currencies.find(c => c.code === code);
  return currency ? currency.exchangeToMXN : null;
};

const sumItems = (items, currencies) => {
  let totalMXN = 0;

  items.forEach(item => {
    if (!item.cost || !item.currencyCode) return;

    const rate = getExchangeRate(currencies, item.currencyCode);
    if (!rate) return;

    totalMXN += item.cost * rate;
  });

  return totalMXN;
};

const calculateSummary = (trip) => {
  const currencies = trip.currencies || [];

  const transportTotal = sumItems(trip.transports || [], currencies);
  const activitiesTotal = sumItems(trip.activities || [], currencies);
  const mealsTotal = sumItems(trip.meals || [], currencies);

  const totalMXN = transportTotal + activitiesTotal + mealsTotal;
  const perPersonMXN = trip.peopleCount
    ? totalMXN / trip.peopleCount
    : totalMXN;

  return {
    breakdown: {
      transport: transportTotal,
      activities: activitiesTotal,
      meals: mealsTotal
    },
    totalMXN,
    perPersonMXN
  };
};

module.exports = {
  calculateSummary
};