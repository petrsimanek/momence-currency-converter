# CNB exchange rates converter

A small React app that loads the latest exchange rates from the Czech National Bank (ČNB), lists
them in a table and converts an amount in CZK into any listed currency.

**Live demo:** https://momence-currency-converter-xi.vercel.app

## Features

- Fetches the current rates (`daily.txt`) when the app starts and parses them.
- Lists all currencies in a table: country, currency, code, amount and rate in CZK.
- Converter form: enter an amount in CZK, pick a currency, and the result updates as you type.
- Click a table row (or its currency code) to select that currency in the converter; the page
  scrolls to the converter.
- Loading, error (with a retry button) and empty states.

## Stack

React 19, TypeScript, Styled Components, React Query (`@tanstack/react-query`), React Hook Form,
Zod, Vite. Tests: Vitest, React Testing Library, MSW. Lint and format: oxlint and Prettier.

## Running it

Node is pinned in `.tool-versions` (use asdf or install the same version).

```bash
npm ci
npm run dev
```

| Script                 | What it does                                        |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Dev server with the CNB proxy                       |
| `npm test`             | Runs the tests once (`npm run test:watch` to watch) |
| `npm run lint`         | oxlint                                              |
| `npm run typecheck`    | `tsc -b`                                            |
| `npm run format:check` | Prettier check (`npm run format` writes)            |
| `npm run build`        | Typecheck and production build                      |
| `npm run preview`      | Serves the production build with the same proxy     |

CI (GitHub Actions) runs install, format check, lint, typecheck, tests and build on every push.
Vercel deploys `main` automatically.

## Project structure

```
src/
  api/cnb/        fetching, parsing and validating the CNB file (zod schemas, tests)
  components/     ConverterForm, RatesTable, StatusMessage, ErrorIcon
  hooks/          useExchangeRates (React Query)
  lib/            amount parsing, conversion, money formatting (pure functions)
  styles/         theme tokens, global styles, shared helpers
  test/           MSW server and handlers, fixtures, render helper
```

## Decisions

**CORS: a proxy instead of calling the CNB directly.** The CNB server only allows requests from
its own origin (`apl.cnb.cz`), so a browser cannot fetch `daily.txt` from another domain. The app
requests `/api/cnb/daily.txt` on its own origin. In production Vercel rewrites that path to the
CNB (`vercel.json`), in development and preview Vite's proxy does (`vite.config.ts`). It stays a
plain static site with no backend code. The proxy only forwards that one exact path.

**Fresh data: `cache: 'no-cache'` and a one-hour `staleTime`.** The CNB sends
`Cache-Control: max-age=86400`, so the browser could show yesterday's rates after the new ones are
published. `no-cache` makes the browser revalidate on every fetch. React Query keeps the data
fresh for an hour, so switching tabs does not refetch. The CNB publishes new rates on working
days after 14:30, so rates shown earlier are the previous day's.

**Strict parsing.** The file is parsed line by line and validated with zod. Any malformed row
fails the whole load with an error that names the real line number, instead of silently showing
partial or wrong rates. A wrong rate is worse than an error message. Blank lines are ignored.
The "Amount" column (1, 100 or 1000 units) is kept as is and used in the conversion:
`czk * amount / rate`.

**Conversion in real time, no submit button.** The result is computed during render from the
form value, with no network call, so there is nothing to debounce. The form still has
`onSubmit` so pressing Enter does not reload the page.

**Validation in one place.** `parseAmount` holds the rules (dot as the decimal separator, a
non-negative number, an upper limit). The same rules feed the zod schema used by React Hook
Form, so the field error and the displayed result can never disagree. A comma is rejected with
a clear message instead of being guessed, because `1,500` is ambiguous (one and a half or one
thousand five hundred). `.5` is accepted; a lone `.` is reported as soon as it is typed.

**Default currency EUR.** The converter starts on EUR (or the first currency if EUR is missing).
The amount field starts empty with a `0` placeholder, so the result area shows a hint instead of
`0.00 = 0.00`.

**The selected currency lives in `App`.** Both the table and the form read and change it. React
Hook Form only owns the amount. If the selected currency disappears from a new set of rates, the
converter falls back to the default, and the typed amount is kept.

**Retries.** React Query retries a failed request once, but never a parse error: the same bad
file will not get better on a second try. The error state offers a manual "Try again".

**Why no Dayjs.** The date comes from the CNB file as text (`29 Oct 2026`) and is only displayed,
never calculated with, so a date library would add weight for no gain.

**Formatting.** Money is formatted with `Intl.NumberFormat` using the currency code (`EUR 41.09`)
and the right number of decimals (zero for HUF, JPY, IDR).

## Accessibility

- Every field has a label, and a permanent hint about the decimal separator is linked with
  `aria-describedby`.
- The validation message appears in an `aria-live="polite"` region and is not an `alert`, so it
  does not interrupt typing. The result is an `<output>` element.
- The table keeps real table semantics: explicit ARIA roles keep them even where the mobile
  layout uses `display: block/grid`. On mobile it becomes a two-row card layout.
- Each currency code in the table is a real `<button>` (keyboard and screen readers) with a
  descriptive name, and the selected one has `aria-current`. Selecting from the table is
  announced through a visually hidden status region.
- Focus is visible on both light and dark surfaces. Smooth scrolling is turned off with
  `prefers-reduced-motion`. Loading and error messages use `status` and `alert` roles.

I tested the layout in a browser at desktop and phone widths, but not with VoiceOver or TalkBack.

## Testing

The tests use Vitest, React Testing Library and MSW, which mocks the network at the request level
so the real `fetch` and parsing code run. They cover:

- the parser and validation, including malformed rows and the real file line number,
- amount parsing, conversion and formatting,
- the full app: loading, success, a 500 response, a malformed body, a network error, an empty
  list, retry and recovery,
- typing an amount and converting, selecting a currency from the table with mouse and keyboard,
  and the accessible names and states.

## Trade-offs

- **Bundle size.** About 130 kB gzipped. React Hook Form and zod account for part of it, which I
  accepted for consistent validation. For a bigger app I would look at code splitting.
- **Oxlint instead of ESLint.** It is much faster and enough for this size, but it has no rule
  for blank lines between statements, so that style is kept by review instead of tooling.
- **No end-to-end tests.** Component and integration tests with MSW cover the behaviour. A
  browser test (Playwright) would be the next step.
