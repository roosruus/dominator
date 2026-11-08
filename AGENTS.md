# AGENTS.md

Development standards for this repository. See `README.md` for what the app does and how it is structured.

## Workflow

- Single maintainer: no pull requests. Work on a local feature branch, commit there, and merge into `master` when
  the work is in a good state.
- Commit or push only when asked.

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

- Types: `feat`, `fix`, `refactor`, `perf`, `style`, `test`, `docs`, `build`, `ci`, `chore`, `revert`.
- Description in the imperative mood, lower case, no trailing period, about 72 characters at most.
- Optional scopes follow the source layout: `engine`, `store`, `ui`, `data`, `scripts`.
- Mark breaking changes with `!` after the type/scope and a `BREAKING CHANGE:` footer. For this app that means
  changes that discard users' saved `localStorage` settings.
- Use the body to explain why, and list notable changes as bullets when a commit touches several areas.

Examples: `feat(engine): add Young Witch bane card`, `fix(ui): keep dialog limits when cancelling`,
`build: upgrade vite to 8.4`.

## Environment

- Node.js 24.15+ (see `.nvmrc`). jsdom requires it.
- `.npmrc` pins the public npm registry. Keep it; don't commit lockfile entries resolved from other registries.
- Dependencies are pinned to exact versions (`npm install --save-exact`). Commit `package-lock.json` with them.

## Verification

Before committing:

1. `npm run lint` passes with no errors.
2. `npm test` passes.
3. `npm run build` succeeds (the chunk size warning is expected).
4. For UI changes, run `npm start` and exercise the affected flow in a browser: shuffle, the expansion
   list, the expansion settings dialog, the recommended rules toggle, and that settings survive a reload. Use
   `npm run build && npm run preview` to check the production build.

CI runs lint, tests and build on every push to `master`.

## Testing

- Vitest with jsdom and Testing Library. Tests sit next to the code as `*.test.js` or `*.test.jsx`.
- Import `describe`, `it` and `expect` from `vitest` explicitly; globals are off.
- Engine tests pass `seededRandom(seed)` from `src/test/random.js` to `createGameSetup` so results are repeatable.
  Prefer property checks over many seeds for rule limits, rather than asserting one specific kingdom.
- Component tests render with a real store from `createStore()` and query by role and accessible name, the way a
  user finds things. `src/test/setup.js` cleans up the DOM and `localStorage` after each test.
- A bug fix comes with a test that fails without it.

## Code style

- Formatting is enforced by ESLint (`eslint.config.js`): 2-space indent, single quotes, semicolons, 120-character
  lines. Run `npx eslint --fix` for mechanical fixes.
- Plain JavaScript, ES modules everywhere (`"type": "module"`). Files containing JSX use the `.jsx` extension;
  the card data scraper is CommonJS (`.cjs`).
- Match the surrounding code; keep comments sparse and about why, not what.

## React and UI

- Function components with hooks only; one default-exported component per file in `src/webapp/components/`.
- No `React` import is needed for JSX (automatic runtime). No `propTypes`; document optional props with default
  parameter values.
- Material UI v9: import from `@mui/material` and `@mui/icons-material`, style with the `sx` prop or the theme.
  Don't add CSS files or `styled`/`makeStyles` wrappers unless `sx` can't express it.
- Give icon-only buttons and unlabeled checkboxes an accessible label (`aria-label`, or `slotProps.input`).
- Dialog form state belongs in a child component rendered inside the `Dialog`, so it resets on each open.

## State

- Redux Toolkit: one slice per state key in `src/webapp/store/`, with Immer-style mutating reducers.
- Read state through selectors in `store/selectors.js`. Selectors that derive new arrays or objects must be
  memoized with `createSelector` so `useSelector` doesn't re-render on every store update.
- Side effects and engine calls go in thunks (see `shuffleKingdom`), not components.
- Keep only user choices in state (selections, limits, excluded card names), never card data. Card details come
  from the engine and `cards.json`, so data updates reach every user.
- Saved settings live in the versioned `settings` key in `localStorage`. To change their shape, bump
  `SETTINGS_VERSION` in `store/persistence.js` and migrate the previous version, as done for the version 1
  `selections`/`rules` keys; dropping users' settings instead is a breaking change. Treat loaded values as untrusted
  and fall back to defaults.

## Engine and card data

- `src/webapp/engine/` is framework-independent: no React or Redux imports.
- Recommended rules live in `engine/rules/recommended.js`; non-kingdom card exclusions in `engine/rules/index.js`.
- `src/webapp/data/cards.json` is generated. Don't edit it by hand: fix `scripts/updatecarddata.cjs` and rerun
  `npm run updatecarddata`, then review the diff.

## Tooling notes

- `eslint-plugin-react` doesn't officially support ESLint 10 yet. `package.json` overrides its peer dependency, and
  `eslint.config.js` sets the React version explicitly because version detection crashes on ESLint 10. Update that
  version when upgrading React.
