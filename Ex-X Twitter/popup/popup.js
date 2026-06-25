// Popup controller: reflects and edits the shared settings.

const FEATURE_KEYS = ["logo", "favicon", "title", "wording"];
const ALL_KEYS = ["enabled", ...FEATURE_KEYS];

function render(settings) {
    for (const key of ALL_KEYS) {
        const input = document.getElementById(key);
        if (input) input.checked = Boolean(settings[key]);
    }
    document
        .getElementById("features")
        .classList.toggle("disabled", !settings.enabled);
}

async function init() {
    render(await self.ExX.get());

    for (const key of ALL_KEYS) {
        const input = document.getElementById(key);
        if (!input) continue;
        input.addEventListener("change", async () => {
            const next = await self.ExX.set({ [key]: input.checked });
            render(next);
        });
    }

    // Keep popup in sync if changed elsewhere.
    self.ExX.onChange(render);
}

document.addEventListener("DOMContentLoaded", init);
