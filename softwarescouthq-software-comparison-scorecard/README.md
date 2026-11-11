# Software Comparison Scorecard

A free, open-source, local-first toolkit for comparing business software against the same criteria and cost assumptions.

**Purpose:** make your software-selection process repeatable and transparent—not to imply that any vendor has been independently reviewed, tested or approved.

## What the tool does

- Capture a product, vendor, software category, the official source URL, and when information was last checked.
- Rate five dimensions from **1 (weak)** to **5 (strong)**: feature fit (30%), security and privacy (25%), usability (15%), integrations (15%), and support (15%).
- Show **Unrated** when any dimension is unknown. A missing score is not automatically zero.
- Estimate costs in **USD** using the same 1–60 month horizon for every alternative: (per-seat monthly price × seats + other monthly costs) × months + one-time costs.
- Mark estimates as **Cost not verified** until the user explicitly checks the costs-known box.
- Compare saved options, search, filter, sort by score or estimated total cost, and export/import CSV/JSON backups.

## Try the tool

Once GitHub Pages deploys, open:

https://janiceq36c92.github.io/softwarescouthq-software-comparison-scorecard/

The tool works entirely in the browser. The repository contains the client-side application and a dependency-free scoring module; no API credentials or third-party libraries are required.

## Development and tests

Requires Node.js 20 or newer.

    cd softwarescouthq-software-comparison-scorecard
    npm test

No dependency installation is needed. The same scoring functions are used by the static page and the test suite.

## Rating methodology

| Dimension | Weight | What the user should check |
|---|---:|---|
| Feature fit | 30% | Required workflows, missing critical functions, realistic use cases |
| Security & privacy | 25% | Data access, retention, security documents, identity controls, contractual assurances |
| Usability | 15% | Onboarding time, accessibility, training demands |
| Integrations | 15% | Native integration coverage, API access, reliability and migration feasibility |
| Support | 15% | Support channels, service commitments and incident processes |

Each dimension is scored 1–5 by the user. Weighted score = 100 × Σ(rating × weight)/5, to one decimal. The minimum completed score is 20/100, not zero; an incomplete rating remains **Unrated**. A high score is not proof of vendor compliance, safety or suitability.

## Costs and limitations

Cost entries are manually supplied and must all be in **USD**, with the same assumptions and billing horizon. USD is used only as a consistent unit; no currency conversion is performed. Quotes, discounts, taxes, data migration, seats, usage overages, annual commitments and additional services can change actual costs. Enter an amount of 0 only when verified to be zero. If cost inputs cannot be verified, leave **I have checked the cost inputs** unchecked; the tool does not rank that option by cost.

Do not use the scorecard as a security audit, procurement recommendation or legally binding estimate. Confirm current pricing, product specifications, compatibility, contract terms and security statements directly with vendors.

## Privacy

Records are stored in this browser's local storage, not in a cloud database. Other users of the same browser profile may read them; backups must be secured manually. Do not enter passwords, private contracts, personal identifiers, or confidential procurement terms. See the repository [privacy policy](../privacy.html).

## Related website

For business software discovery and research, visit [SoftwareScoutHQ](https://softwarescouthq.com/). Independently verify vendor details and terms on official vendor sites before making a purchasing decision.

## License

MIT. See repository root [LICENSE](../LICENSE).
