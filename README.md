# ScoutHQ Open Tools

A small collection of free, browser-first utilities built around practical workflows. The tools are intentionally lightweight, transparent, and usable without an account.

## Projects

| Tool | What it does | Related resource |
|---|---|---|
| Business Calculator Toolkit | Gross margin, markup, break-even, ROI, and cash-runway calculations with visible formulas | [CalcScoutHQ](https://calcscouthq.com/) |
| Remote Job Application Tracker | Organize technology and remote-job applications locally in your browser | [JobsScoutHQ](https://jobsscouthq.com/) |
| Affiliate Program Evaluation Scorecard | Compare manually researched affiliate offers using a transparent weighted score | [PartnerScoutHQ](https://partnerscouthq.com/) |
| Software Comparison Scorecard | Compare business software on requirements with transparent weighted ratings and comparable cost horizons | [SoftwareScoutHQ](https://softwarescouthq.com/) |

## Live site

The expected GitHub Pages address is:

https://janiceq36c92.github.io/

After enabling Pages, the tools will be available at:

- https://janiceq36c92.github.io/calcscouthq-business-calculator-toolkit/
- https://janiceq36c92.github.io/jobsscouthq-remote-application-tracker/
- https://janiceq36c92.github.io/partnerscouthq-affiliate-program-scorecard/
- https://janiceq36c92.github.io/softwarescouthq-software-comparison-scorecard/

### Enable GitHub Pages

1. Open this repository's **Settings**.
2. Select **Pages** under **Code and automation**.
3. Under **Build and deployment**, choose **GitHub Actions** as the source.
4. Confirm the static tools deployment workflow succeeds.
5. Test the site and all four tools on desktop and mobile.

GitHub Pages deployment is automated by `.github/workflows/pages.yml`. A successful workflow shows deployment, not Google indexing. Check public URLs and external destinations after each release.

## Privacy and data handling

- The calculators do not send input values to a server.
- The job tracker, affiliate scorecard, and software comparison scorecard store records in this browser's local storage.
- Export a backup before clearing browser data or changing devices.
- Do not store passwords, identity documents, bank details, confidential employer information, or other sensitive data in these tools.
- There are no analytics, advertising scripts, external JavaScript libraries, or backend services in this repository.

See [Privacy](./privacy.html) and [Security](./SECURITY.md).

## Development

The calculator functions are dependency-free ES modules. Run their tests with Node.js:

~~~sh
cd calcscouthq-business-calculator-toolkit
npm test
cd ../softwarescouthq-software-comparison-scorecard
npm test
~~~

The job tracker and affiliate scorecard are standalone HTML files; the software scorecard is an ES-module web app that must be served over HTTP(S).

## Scope and limitations

These utilities are educational and organizational aids. They do not verify job vacancies, confirm affiliate terms, audit vendor security, provide accounting or investment advice, or guarantee commercial outcomes. Always verify important information with the original employer, advertiser, network, or professional adviser.

## License

MIT. See [LICENSE](./LICENSE).

## Related websites

- [JobsScoutHQ](https://jobsscouthq.com/)
- [CalcScoutHQ](https://calcscouthq.com/)
- [PartnerScoutHQ](https://partnerscouthq.com/)
- [SoftwareScoutHQ](https://softwarescouthq.com/)

The links above point to related resources; they are not endorsements by GitHub and do not imply that GitHub verifies the information on those sites.
