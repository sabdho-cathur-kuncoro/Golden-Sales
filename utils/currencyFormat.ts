export const currencyFormat = (money: number = 0) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    // Pin the max explicitly — some ICU builds keep fractional digits when only
    // the minimum is set, making output non-deterministic across environments.
    maximumFractionDigits: 0,
    currencyDisplay: "symbol",
  }).format(money);
};
