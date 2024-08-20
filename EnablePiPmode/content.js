const videos = document.querySelectorAll('video');

videos.forEach((video) => {
    console.log("Video found:", video);
    video.removeAttribute('disablepictureinpicture');
    video.setAttribute('allowPictureInPicture', '');
    console.log("disablepictureinpicture removed and allowPictureInPicture set.");
});
