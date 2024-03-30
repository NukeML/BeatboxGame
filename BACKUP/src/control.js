const introductionPage = document.querySelector('.introduction-page');
const audioRecordingPage = document.querySelector('.audio-recording-page');
const postSubmitPage = document.querySelector('.post-submit-page');
const pageHeader = document.getElementById('header');
const navButton = document.querySelector('.navButton');
const navbackButton = document.querySelector('.navbackButton');

navButton.addEventListener('click', () => {
    introductionPage.style.left = "-200%";
    introductionPage.style.opacity = "0";
    
    setTimeout(() => {
        introductionPage.style.display = "none";
        audioRecordingPage.style.display = "block";
    }, 350);

    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    setTimeout(() => {
        audioRecordingPage.style.opacity = "1";
    }, 550);
});

// Nav back to reload audio
navbackButton.addEventListener('click', () => {

    postSubmitPage.style.right = "-200%";
    postSubmitPage.style.opacity = "0";
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    setTimeout(() => {
        window.location.reload();
    }, 850);
    
});