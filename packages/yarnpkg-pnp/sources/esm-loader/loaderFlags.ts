const [major, minor] = process.versions.node.split(`.`).map(value => parseInt(value, 10));

// The hooks were consolidated in https://github.com/nodejs/node/pull/37468
export const HAS_CONSOLIDATED_HOOKS = major > 16 || (major === 16 && minor >= 12);

// JSON modules were unflagged in https://github.com/nodejs/node/pull/41736
export const HAS_UNFLAGGED_JSON_MODULES = major > 17 || (major === 17 && minor >= 5) || (major === 16 && minor >= 15);

// JSON modules requires import assertions after https://github.com/nodejs/node/pull/40250
export const HAS_JSON_IMPORT_ASSERTION_REQUIREMENT = major > 17 || (major === 17 && minor >= 1) || (major === 16 && minor > 14);

// The message switched to using an array in https://github.com/nodejs/node/pull/45348
export const WATCH_MODE_MESSAGE_USES_ARRAYS = major > 19 || (major === 19 && minor >= 2) || (major === 18 && minor >= 13);

// https://github.com/nodejs/node/pull/45659 changed the internal translators to be lazy loaded so they use our patch.
// https://github.com/nodejs/node/pull/48842 changed it so that our patch is loaded after the internal translators.
// TODO: Update the version range if https://github.com/nodejs/node/pull/46425 lands.
export const HAS_LAZY_LOADED_TRANSLATORS = (major === 20 && minor < 6) || (major === 19 && minor >= 3);

// https://github.com/nodejs/node/pull/43772
// TODO: Update the version range if it gets backported to v18.
export const HAS_LOADERS_AFFECTING_LOADERS = major > 19 || (major === 19 && minor >= 6);

// https://github.com/nodejs/node/pull/42881
export const ALLOWS_NON_FILE_PARENT = major > 18 || (major === 18 && minor >= 1) || (major === 16 && minor >= 17);
