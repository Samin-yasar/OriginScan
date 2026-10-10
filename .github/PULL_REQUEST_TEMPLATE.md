---
name: Pull Request
about: Propose a change to OriginScan
---

## Summary

<!-- A short description of what this PR does and why. -->

## Type of Change

<!-- Check all that apply. -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] GS1 data update (adding or correcting prefix entries in `gs1-registry.js`)
- [ ] Documentation update
- [ ] Refactor / code quality improvement
- [ ] Style / UI change

## Related Issue

<!-- Link the issue this PR resolves, e.g. "Closes #42" -->

Closes #

## Changes Made

<!-- List the specific files and changes. Be precise. -->

-
-
-

## GS1 Data Source (if applicable)

<!-- If you changed gs1-registry.js, paste the GS1 source URL here. -->

Source: https://www.gs1.org/standards/id-keys/company-prefix

## Testing

<!-- Describe how you tested this. -->

- [ ] Test suite passes: `node tests/test-suite.js`
- [ ] App loads correctly via `python -m http.server` or `npx serve .`
- [ ] Manually scanned at least one barcode and verified the result
- [ ] Tested in at least one modern browser (Chrome, Firefox, or Safari)

## Screenshots (if UI changed)

<!-- Attach before/after screenshots for any visual changes. -->

## Checklist

- [ ] My changes follow the code style described in [CONTRIBUTING.md](../CONTRIBUTING.md)
- [ ] I have added comments where the intent isn't immediately obvious
- [ ] I have not introduced any external library dependencies without prior discussion
- [ ] Commit messages follow the Conventional Commits format (`fix:`, `feat:`, `docs:`, etc.)
- [ ] I have read the [Code of Conduct](CODE_OF_CONDUCT.md)
