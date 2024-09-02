const observer = new MutationObserver(() => {
    const video = document.querySelector('video');
    if (video && video.hasAttribute('disablepictureinpicture')) {
        console.log("Video element found and modified by MutationObserver:", video);
        video.removeAttribute('disablepictureinpicture');
        video.setAttribute('enablepictureinpicture', 'true');
        console.log("disablepictureinpicture removed and enablePictureInPicture set to true.");
    }
});

observer.observe(document.body, { attributes: true, childList: true, subtree: true });
