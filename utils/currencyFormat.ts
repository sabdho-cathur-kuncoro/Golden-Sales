export const currencyFormat = (money: number = 0) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    currencyDisplay: "symbol",
  }).format(money);
};
