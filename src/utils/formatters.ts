export const toNaira = (amountInKobo: number): string => {
  const value = amountInKobo / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);
};

export const splitNairaParts = (
  amountInKobo: number,
): { symbol: string; whole: string; frac: string } => {
  const value = Math.abs(amountInKobo / 100);
  const formatted = value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const parts = formatted.split(/\./);
  const wholeRaw = parts[0] ?? "0";
  const frac = parts[1] ?? "00";
  return {
    symbol: "₦",
    whole: wholeRaw,
    frac: `.${frac}`,
  };
};

export const formatActivityTime = (isoOrRelative: string): string => {
  const date = new Date(isoOrRelative);
  if (Number.isNaN(date.getTime())) {
    return isoOrRelative;
  }
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(date);
};
