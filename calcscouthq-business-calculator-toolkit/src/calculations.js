function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new TypeError(label + " must be a finite number.");
  }
  return number;
}

function nonNegative(value, label) {
  const number = finiteNumber(value, label);
  if (number < 0) {
    throw new RangeError(label + " cannot be negative.");
  }
  return number;
}

export function grossMargin({ revenue, costOfGoodsSold }) {
  const totalRevenue = nonNegative(revenue, "Revenue");
  const cogs = nonNegative(costOfGoodsSold, "Cost of goods sold");
  if (totalRevenue <= 0) {
    throw new RangeError("Revenue must be greater than zero.");
  }
  const grossProfit = totalRevenue - cogs;
  return {
    grossProfit,
    grossMarginPercent: (grossProfit / totalRevenue) * 100
  };
}

export function markupPercent({ cost, sellingPrice }) {
  const totalCost = nonNegative(cost, "Cost");
  const price = nonNegative(sellingPrice, "Selling price");
  if (totalCost <= 0) {
    throw new RangeError("Cost must be greater than zero.");
  }
  return ((price - totalCost) / totalCost) * 100;
}

export function breakEvenUnits({ fixedCosts, pricePerUnit, variableCostPerUnit }) {
  const fixed = nonNegative(fixedCosts, "Fixed costs");
  const price = nonNegative(pricePerUnit, "Price per unit");
  const variable = nonNegative(variableCostPerUnit, "Variable cost per unit");
  const contributionMargin = price - variable;
  if (contributionMargin <= 0) {
    throw new RangeError("Price per unit must be greater than variable cost per unit.");
  }
  return {
    contributionMargin,
    units: Math.ceil(fixed / contributionMargin)
  };
}

export function roiPercent({ investmentCost, netBenefit }) {
  const investment = nonNegative(investmentCost, "Investment cost");
  const benefit = finiteNumber(netBenefit, "Net benefit");
  if (investment <= 0) {
    throw new RangeError("Investment cost must be greater than zero.");
  }
  return (benefit / investment) * 100;
}

export function cashRunwayMonths({ cashBalance, monthlyNetBurn }) {
  const cash = nonNegative(cashBalance, "Available cash");
  const burn = finiteNumber(monthlyNetBurn, "Monthly net burn");
  if (burn <= 0) {
    return null;
  }
  return cash / burn;
}
