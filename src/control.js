import {fetchAudioFile} from "./record_submit.js";

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

navbackButton.addEventListener('click', () => {
    postSubmitPage.style.right = "200%";
    postSubmitPage.style.opacity = "0";
    
    setTimeout(() => {
        postSubmitPage.style.display = "none";
        audioRecordingPage.style.display = "block";
    }, 350);

    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    pageHeader.innerHTML = "Beatbox Imitation Game";

    setTimeout(() => {
        audioRecordingPage.style.opacity = "1";
    }, 550);
});
