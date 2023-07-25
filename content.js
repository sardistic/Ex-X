// Function to replace Twitter logo
const replaceLogo = () => {
    const observer = new MutationObserver((mutationsList, observer) => {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                let logoLink = Array.from(document.querySelectorAll('a')).find(el => el.href.includes('twitter.com/home'));
                if (logoLink) {
                    let logoSVG = logoLink.querySelector('svg');
                    if (logoSVG) {
                        logoSVG.outerHTML = `<img src="${chrome.runtime.getURL('logo.svg')}" style="height: 25px; width: 30px;">`;
                        observer.disconnect();
                    }
                }
            }
        }
    });
  
    observer.observe(document, {childList: true, subtree: true});
};

// Function to replace favicon
const replaceFavicon = () => {
  let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/svg+xml';
  link.rel = 'shortcut icon';
  link.href = chrome.runtime.getURL('icon.svg');
  document.getElementsByTagName('head')[0].appendChild(link);
};

// Event listener for page load
window.addEventListener('load', function() {
  replaceLogo();
  replaceFavicon();
});
