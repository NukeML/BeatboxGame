const introductionPage = document.querySelector('.introduction-page');
const audioRecordingPage = document.querySelector('.audio-recording-page');
const postSubmitPage = document.querySelector('.post-submit-page');
const pageHeader = document.getElementById('header');
const navbackButton = document.querySelector('.navbackButton');
const infoButton = document.querySelector('.infoButton');
const infoButtonIcon = document.querySelector('.infoButton i');
const moreInfoContent = document.querySelector('.more-info-content');


infoButton.addEventListener("click", () => {
    if (moreInfoContent.classList.contains('show')) {
        infoButtonIcon.className = "bx bx-info-circle";
        moreInfoContent.style.opacity = "0";
        setTimeout(() => {
            moreInfoContent.classList.toggle('show');
        }, 250)
    } else {
        infoButtonIcon.className = "bx bxs-info-circle";
        moreInfoContent.classList.toggle('show');
        setTimeout(() => {
            moreInfoContent.style.opacity = "1";
        }, 100)
    }
    
});


navbackButton.addEventListener('click', () => {

    postSubmitPage.style.right = "-200%";
    postSubmitPage.style.opacity = "0";
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    setTimeout(() => {
        window.location.reload();
    }, 850);
    
});