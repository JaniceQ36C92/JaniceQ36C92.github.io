import test from "node:test";
import assert from "node:assert/strict";
import {
  grossMargin,
  markupPercent,
  breakEvenUnits,
  roiPercent,
  cashRunwayMonths
} from "../src/calculations.js";

test("gross margin returns gross profit and percentage", () => {
  assert.deepEqual(grossMargin({ revenue: 10000, costOfGoodsSold: 6500 }), {
    grossProfit: 3500,
    grossMarginPercent: 35
  });
});

test("gross margin permits a loss but rejects zero revenue", () => {
  assert.equal(grossMargin({ revenue: 100, costOfGoodsSold: 120 }).grossMarginPercent, -20);
  assert.throws(() => grossMargin({ revenue: 0, costOfGoodsSold: 10 }), /greater than zero/);
});

test("markup is based on cost rather than selling price", () => {
  assert.equal(markupPercent({ cost: 80, sellingPrice: 120 }), 50);
});

test("break-even units round up to a whole unit", () => {
  assert.deepEqual(breakEvenUnits({
    fixedCosts: 1000,
    pricePerUnit: 30,
    variableCostPerUnit: 11
  }), { contributionMargin: 19, units: 53 });
});

test("break-even rejects non-positive contribution margin", () => {
  assert.throws(() => breakEvenUnits({
    fixedCosts: 1000,
    pricePerUnit: 10,
    variableCostPerUnit: 10
  }), /greater than variable cost/);
});

test("ROI supports negative net benefit", () => {
  assert.equal(roiPercent({ investmentCost: 1000, netBenefit: -100 }), -10);
});

test("cash runway returns null when monthly net burn is not positive", () => {
  assert.equal(cashRunwayMonths({ cashBalance: 60000, monthlyNetBurn: 8000 }), 7.5);
  assert.equal(cashRunwayMonths({ cashBalance: 60000, monthlyNetBurn: 0 }), null);
  assert.equal(cashRunwayMonths({ cashBalance: 60000, monthlyNetBurn: -100 }), null);
});
