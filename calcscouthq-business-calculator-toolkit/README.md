# Business Calculator Toolkit

A dependency-free set of transparent business calculations, with both reusable JavaScript functions and a browser interface.

## Included calculations

- Gross profit and gross margin
- Markup percentage
- Break-even unit volume
- Return on investment (ROI)
- Cash runway under a constant positive monthly net burn

## Browser demo

After GitHub Pages is enabled for the parent repository:

https://janiceq36c92.github.io/calcscouthq-business-calculator-toolkit/

The page imports the same functions from **src/calculations.js**. No third-party JavaScript is loaded and calculator inputs are not uploaded or persisted.

## Use the JavaScript functions

~~~js
import { grossMargin, breakEvenUnits } from "./src/calculations.js";

const margin = grossMargin({
  revenue: 10000,
  costOfGoodsSold: 6500
});

const breakEven = breakEvenUnits({
  fixedCosts: 12000,
  pricePerUnit: 120,
  variableCostPerUnit: 72
});

console.log(margin.grossMarginPercent); // 35
console.log(breakEven.units); // 250
~~~

## Run tests

Requires Node.js 18 or later. No package installation is needed.

~~~sh
npm test
~~~

## Formula definitions and limitations

- Gross margin = (revenue − cost of goods sold) ÷ revenue × 100.
- Markup = (selling price − cost) ÷ cost × 100.
- Break-even units = fixed costs ÷ (price per unit − variable cost per unit), rounded up to a whole unit.
- ROI = net benefit ÷ investment cost × 100. Net benefit is supplied by the user and should be defined consistently for the decision being evaluated.
- Cash runway = available cash ÷ monthly net burn, only when monthly net burn is positive.

These formulas are simplified. They do not automatically account for taxes, financing, timing differences, inventory changes, or costs that the user has not entered. Use consistent currencies, units, and periods.

## Related resource

For interactive business calculators, formula explanations, and connected planning workspaces, visit [CalcScoutHQ](https://calcscouthq.com/).

## License

MIT. See the repository-level LICENSE.
