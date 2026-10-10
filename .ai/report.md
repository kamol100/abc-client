## Summary

Resolved the merge conflict at the end of the English and Bengali translation files. Both sides added a top-level object, so both are kept.

## Files changed

- `public/lang/en.json`
- `public/lang/bn.json`

## Behavior

`olt`, `monitoring`, and `noc` from the current branch stay in place. `subscription` from the subscription branch follows them. Both files parse as JSON and contain all four keys.

## Tests

`python3` `json.loads` succeeded for both files. No app tests were run; this change only removes conflict markers and restores the closing braces.

## Left untouched

Other uncommitted subscription and dashboard work was not modified.
