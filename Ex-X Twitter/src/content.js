// Ex-X Twitter — content script.
// Reverts X's rebrand back to classic Twitter across the SPA. Everything is
// re-applied on DOM mutations and SPA navigations, and gated behind the
// user's settings (see settings.js / popup).

(() => {
    "use strict";

    const BIRD_LOGO_URL = chrome.runtime.getURL("assets/logo.svg");
    const BIRD_ICON_URL = chrome.runtime.getURL("assets/icon.svg");

    // Marks elements we've already handled so we don't reprocess them.
    const DONE_ATTR = "data-exx-done";

    let settings = self.ExX.DEFAULTS;

    // ---------------------------------------------------------------------
    // Logo
    // ---------------------------------------------------------------------

    // The X wordmark only appears in a few specific places: the sidebar
    // masthead (wrapped in an <h1> heading) and the full-screen loading splash
    // (an <a aria-label="X">). We target those containers directly instead of
    // sniffing path data, so nav icons (Home, etc.) are never touched.
    const LOGO_CONTAINERS = [
        'h1[role="heading"]',
        'a[aria-label="X"]'
    ].join(", ");

    function replaceLogos(root = document) {
        if (!settings.logo) return;
        const scope = root.querySelectorAll ? root : document;

        const containers = new Set(scope.querySelectorAll(LOGO_CONTAINERS));
        // Include the root itself if it is a container.
        if (root.matches && root.matches(LOGO_CONTAINERS)) containers.add(root);

        for (const container of containers) {
            const svg = container.querySelector(`svg:not([${DONE_ATTR}])`);
            if (!svg) continue;

            const rect = svg.getBoundingClientRect();
            const height = rect.height || svg.clientHeight || 24;

            const img = document.createElement("img");
            img.src = BIRD_LOGO_URL;
            img.alt = "Twitter";
            img.setAttribute(DONE_ATTR, "1");
            // Match the X logo's height; let width follow the bird's natural
            // aspect ratio so it never looks stretched or squished.
            img.style.height = `${Math.round(height)}px`;
            img.style.width = "auto";
            img.style.display = "block";
            // X tints its logo white in dark mode via fill: currentColor;
            // emulate with a CSS filter so the bird follows the theme.
            const color = getComputedStyle(svg).color;
            if (color.includes("255, 255, 255")) {
                img.style.filter = "brightness(0) invert(1)";
            }
            svg.setAttribute(DONE_ATTR, "1");
            svg.replaceWith(img);
        }
    }

    // ---------------------------------------------------------------------
    // Favicon
    // ---------------------------------------------------------------------

    function replaceFavicon() {
        if (!settings.favicon) return;
        const head = document.head || document.documentElement;
        if (!head) return;

        // Drop X's own icons so the browser doesn't prefer them.
        head.querySelectorAll(
            "link[rel~='icon']:not([data-exx]), link[rel='shortcut icon']:not([data-exx])"
        ).forEach((el) => el.remove());

        if (!head.querySelector("link[data-exx]")) {
            const link = document.createElement("link");
            link.setAttribute("data-exx", "1");
            link.rel = "icon";
            link.type = "image/svg+xml";
            link.href = BIRD_ICON_URL;
            head.appendChild(link);
        }
    }

    // ---------------------------------------------------------------------
    // Title
    // ---------------------------------------------------------------------

    function fixTitle() {
        if (!settings.title) return;
        const t = document.title;
        // Titles look like "(3) Home / X" or just "X".
        let next = t.replace(/ \/ X$/, " / Twitter");
        if (next === "X") next = "Twitter";
        if (next !== t) document.title = next;
    }

    // ---------------------------------------------------------------------
    // Wording
    // ---------------------------------------------------------------------

    // Whole-word, case-aware replacements. Order matters: do the longer
    // "Repost" before "Post".
    const WORD_MAP = [
        [/\bReposts\b/g, "Retweets"],
        [/\bReposted\b/g, "Retweeted"],
        [/\bRepost\b/g, "Retweet"],
        [/\breposts\b/g, "retweets"],
        [/\breposted\b/g, "retweeted"],
        [/\brepost\b/g, "retweet"],
        [/\bPosts\b/g, "Tweets"],
        [/\bPosted\b/g, "Tweeted"],
        [/\bPost\b/g, "Tweet"],
        [/\bposts\b/g, "tweets"],
        [/\bposted\b/g, "tweeted"],
        [/\bpost\b/g, "tweet"]
    ];

    function rewriteString(s) {
        let out = s;
        for (const [re, to] of WORD_MAP) out = out.replace(re, to);
        return out;
    }

    // Don't touch user-editable areas or where the user is composing.
    function inEditable(node) {
        const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        return Boolean(
            el &&
            el.closest(
                'input, textarea, [contenteditable="true"], [data-testid="tweetTextarea_0"]'
            )
        );
    }

    const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "TEXTAREA"]);

    function rewriteWording(root) {
        if (!settings.wording) return;
        const start = root.nodeType === Node.ELEMENT_NODE ? root : document.body;
        if (!start) return;

        const walker = document.createTreeWalker(start, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.nodeValue || !node.nodeValue.trim()) {
                    return NodeFilter.FILTER_REJECT;
                }
                const parent = node.parentElement;
                if (!parent || SKIP_TAGS.has(parent.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }
                if (inEditable(node)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        const edits = [];
        let n;
        while ((n = walker.nextNode())) {
            const next = rewriteString(n.nodeValue);
            if (next !== n.nodeValue) edits.push([n, next]);
        }
        for (const [node, value] of edits) node.nodeValue = value;

        // aria-labels that read "Post", "Repost", "X posts", etc.
        if (start.querySelectorAll) {
            start
                .querySelectorAll("[aria-label]")
                .forEach((el) => {
                    const label = el.getAttribute("aria-label");
                    const next = rewriteString(label);
                    if (next !== label) el.setAttribute("aria-label", next);
                });
        }
    }

    // ---------------------------------------------------------------------
    // Orchestration
    // ---------------------------------------------------------------------

    function applyAll(root = document) {
        if (!settings.enabled) return;
        replaceLogos(root);
        replaceFavicon();
        fixTitle();
        rewriteWording(root);
    }

    let scheduled = false;
    function scheduleApply() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            applyAll();
        });
    }

    function start() {
        const observer = new MutationObserver(scheduleApply);
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        // SPA navigations (history API + back/forward).
        const fire = () => scheduleApply();
        for (const m of ["pushState", "replaceState"]) {
            const orig = history[m];
            history[m] = function (...args) {
                const r = orig.apply(this, args);
                fire();
                return r;
            };
        }
        window.addEventListener("popstate", fire);
        window.addEventListener("load", fire);

        applyAll();
    }

    self.ExX.get().then((s) => {
        settings = s;
        if (document.documentElement) start();
        else document.addEventListener("DOMContentLoaded", start, { once: true });
    });

    self.ExX.onChange((s) => {
        settings = s;
        // Re-run from scratch so toggling features on takes effect immediately.
        document
            .querySelectorAll(`[${DONE_ATTR}]`)
            .forEach((el) => el.removeAttribute(DONE_ATTR));
        applyAll();
    });
})();
