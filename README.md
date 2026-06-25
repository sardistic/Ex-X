
![sardistic_a_blue_twitter_logo_phoenix_fighting_the_letter_X_8bi_0e16e9b9-185f-4240-894d-0744b1d8ee26](https://github.com/sardistic/Ex-X/assets/11499173/3b992067-1e46-4aaa-8697-f2428b9aba9c)

# Ex-X Twitter Chrome Extension

**Ex-X Twitter** is a Chrome extension that reverts the "X" rebrand back to classic Twitter. It now works on **x.com** (and still on twitter.com), and reverts more than just the logo — the favicon, the tab title, and the wording ("Tweet", "Retweet") all come back too. Every feature can be toggled individually from the popup.

> **v2.0** is a full rewrite for the post-rebrand x.com. The old version only matched `twitter.com` and no longer did anything once the site moved to `x.com`.

## Features

- **Bird logo:** Swaps the "X" masthead logo for the classic Twitter bird. SPA-aware, so it survives in-app navigation.
- **Classic favicon:** Restores the Twitter bird favicon in the browser tab.
- **Tab title:** Rewrites "… / X" back to "… / Twitter".
- **Original wording:** Reverts "Post" → "Tweet", "Repost" → "Retweet" (and their variants) across the UI, while leaving anything you're typing untouched.
- **Per-feature toggles:** A popup with a master switch plus an on/off toggle for each feature, persisted via `chrome.storage.sync`.

![Screenshot 2023-07-25 132031](https://github.com/sardistic/Ex-X/assets/11499173/2678a494-db86-4fdd-88cb-615485f6dff9)

## Usage

1. **Load the extension:** Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the `Ex-X Twitter` folder from this repository.
2. **Browse x.com:** The extension runs automatically. Open the toolbar popup to enable/disable individual features.

## Project structure

```
Ex-X Twitter/
├── manifest.json        # MV3 manifest
├── assets/              # logo.svg (bird) + icon.svg (favicon)
├── icons/               # 16 / 48 / 128 toolbar icons
├── src/
│   ├── settings.js      # shared settings model (storage + defaults)
│   └── content.js       # SPA-aware logo/favicon/title/wording reversion
└── popup/               # popup UI (html / css / js)
```

## Why Ex-X Twitter?

Social media branding changes can sometimes feel jarring or unnecessary, especially for long-term users who have grown accustomed to the original branding. Ex-X Twitter is perfect for those who aren't quite ready to move on to Twitter's new "X" branding, and who'd like a touch of nostalgia as they scroll through their Twitter feed. 

This extension does not collect or store any personal data, adheres to Chrome's permissions policy, and is fully open source, ensuring a safe and transparent user experience.


[<img src="https://github.com/sardistic/Ex-X/assets/11499173/fe8d93e9-68b8-4e61-a97b-6293c7a8f905">](https://chrome.google.com/webstore/detail/ex-x-twitter/cddoeljbpakllcifiacfackoalheinpn)

get on the chrome store here: 
(https://chrome.google.com/webstore/detail/ex-x-twitter/cddoeljbpakllcifiacfackoalheinpn)
