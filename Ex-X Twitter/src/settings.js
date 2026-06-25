// Shared settings model for Ex-X Twitter.
// Loaded before content.js (and reused by the popup) so both share the same
// defaults and storage key. Exposes a global `ExX` namespace.

(() => {
    const STORAGE_KEY = "exx-settings";

    const DEFAULTS = Object.freeze({
        enabled: true,   // master switch
        logo: true,      // swap the X masthead logo for the Twitter bird
        favicon: true,   // restore the bird favicon
        title: true,     // rewrite the tab title ("... / X" -> "... / Twitter")
        wording: true    // Post -> Tweet, Repost -> Retweet, etc.
    });

    async function get() {
        try {
            const stored = await chrome.storage.sync.get(STORAGE_KEY);
            return { ...DEFAULTS, ...(stored[STORAGE_KEY] || {}) };
        } catch (e) {
            return { ...DEFAULTS };
        }
    }

    async function set(partial) {
        const current = await get();
        const next = { ...current, ...partial };
        await chrome.storage.sync.set({ [STORAGE_KEY]: next });
        return next;
    }

    function onChange(callback) {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === "sync" && changes[STORAGE_KEY]) {
                callback({ ...DEFAULTS, ...(changes[STORAGE_KEY].newValue || {}) });
            }
        });
    }

    self.ExX = { STORAGE_KEY, DEFAULTS, get, set, onChange };
})();
