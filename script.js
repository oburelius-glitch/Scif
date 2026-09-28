/* ============================================================
   OBUR
   7. Sınıf Fen Bilimleri
   Güneş Sistemi ve Ötesi

   Vanilla JavaScript / ES6+
============================================================ */

"use strict";


/* ============================================================
   DOM ELEMENTS
============================================================ */

const body = document.body;

const intro = document.getElementById("intro");
const introVideo = document.getElementById("introVideo");
const introLogo = document.getElementById("introLogo");
const skipIntro = document.getElementById("skipIntro");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const mobileMenu =
    document.getElementById("mobileMenu");


/* ============================================================
   INTRO
============================================================ */

let introFinished = false;

const INTRO_END_TIME = 6800;


/**
 * Intro animasyonunu başlatır.
 *
 * Timeline:
 *
 * 0.0s  → Video
 * 3.0s  → Ekran kararmaya başlar
 * 4.2s  → Obur logosu çizilir
 * 6.8s  → Intro kapanır
 */
function startIntro() {

    /*
     * Videoyu baştan başlat.
     */
    try {
        introVideo.currentTime = 0;
    } catch (error) {
        console.warn("Video başlangıç konumu ayarlanamadı.", error);
    }


    /*
     * Tarayıcı izin veriyorsa videoyu oynat.
     */
    const playPromise = introVideo.play();

    if (playPromise instanceof Promise) {

        playPromise.catch(() => {
            /*
             * Autoplay engellenirse kullanıcı deneyimini
             * bozmadan diğer intro animasyonları devam eder.
             */
        });

    }


    /*
     * 3 saniye:
     * Ekranı karart.
     */
    setTimeout(() => {

        if (introFinished) {
            return;
        }

        intro.classList.add("darkened");

    }, 3000);


    /*
     * 4.2 saniye:
     * SVG Obur logosunu göster.
     */
    setTimeout(() => {

        if (introFinished) {
            return;
        }

        introLogo.classList.add("visible");

    }, 4200);


    /*
     * 6.8 saniye:
     * Ana siteye geç.
     */
    setTimeout(() => {

        finishIntro();

    }, INTRO_END_TIME);

}


/**
 * Intro'yu kapatır.
 */
function finishIntro() {

    if (introFinished) {
        return;
    }

    introFinished = true;

    intro.classList.add("is-hidden");

    body.classList.remove("intro-active");

    intro.setAttribute("aria-hidden", "true");

    /*
     * Fade-out tamamlandıktan sonra videoyu durdur.
     */
    setTimeout(() => {

        introVideo.pause();

    }, 1100);

}


/*
 * ESC tuşu ile intro geçilebilir.
 */
document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        !introFinished
    ) {

        finishIntro();

    }

});


/*
 * Ekrandaki geç butonu.
 */
skipIntro.addEventListener("click", finishIntro);


/*
 * Video erken biterse karartılmış ekranı koru.
 */
introVideo.addEventListener("ended", () => {

    intro.classList.add("darkened");

});


/* ============================================================
   MOBILE MENU
============================================================ */

function toggleMobileMenu() {

    const isOpen =
        mobileMenu.classList.toggle("open");

    body.classList.toggle("menu-open", isOpen);

    mobileMenuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

}


mobileMenuButton.addEventListener(
    "click",
    toggleMobileMenu
);


/*
 * Mobil menü linkine tıklandığında kapat.
 */
mobileMenu.querySelectorAll("a").forEach((link) => {

    link.addEventListener("click", () => {

        mobileMenu.classList.remove("open");

        body.classList.remove("menu-open");

        mobileMenuButton.setAttribute(
            "aria-expanded",
            "false"
        );

    });

});


/* ============================================================
   SMOOTH SCROLL
============================================================ */

document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


/* ============================================================
   INTERSECTION OBSERVER
============================================================ */

const revealElements =
    document.querySelectorAll(".reveal-ready");


const revealObserver =
    new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add(
                    "revealed"
                );

                observer.unobserve(
                    entry.target
                );

            });

        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -30px 0px"
        }
    );


revealElements.forEach((element) => {

    revealObserver.observe(element);

});


/* ============================================================
   STICKY CARD DEPTH
============================================================ */

const cosmicCards =
    document.querySelectorAll(".cosmic-card");

let scrollFrame = null;


/**
 * Sticky kartların viewport içindeki konumuna göre
 * çok hafif scale uygular.
 */
function updateCosmicDepth() {

    const viewportCenter =
        window.innerHeight * 0.5;

    cosmicCards.forEach((card) => {

        const rect =
            card.getBoundingClientRect();

        const cardCenter =
            rect.top + rect.height * 0.5;

        const distance =
            Math.abs(cardCenter - viewportCenter);

        const normalized =
            Math.min(
                distance / window.innerHeight,
                1
            );

        /*
         * Scale 1.0 → 0.975 arasında değişir.
         */
        const scale =
            1 - normalized * 0.025;

        if (
            rect.top <= 120 &&
            rect.bottom > 120
        ) {

            card.style.setProperty(
                "--card-scale",
                scale.toFixed(4)
            );

        } else {

            card.style.setProperty(
                "--card-scale",
                "1"
            );

        }

    });

}


/*
 * Scroll olayını requestAnimationFrame ile
 * optimize ediyoruz.
 */
window.addEventListener(
    "scroll",
    () => {

        if (scrollFrame !== null) {
            return;
        }

        scrollFrame =
            requestAnimationFrame(() => {

                updateCosmicDepth();

                scrollFrame = null;

            });

    },
    {
        passive: true
    }
);


/* ============================================================
   DESKTOP BENTO PARALLAX
============================================================ */

const tiltCards =
    document.querySelectorAll(".tilt-card");

const desktopMotion =
    window.matchMedia(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)"
    );


if (desktopMotion.matches) {

    tiltCards.forEach((card) => {

        card.addEventListener(
            "mousemove",
            (event) => {

                const rect =
                    card.getBoundingClientRect();

                const mouseX =
                    (event.clientX - rect.left) /
                    rect.width;

                const mouseY =
                    (event.clientY - rect.top) /
                    rect.height;

                const rotateY =
                    (mouseX - 0.5) * 5;

                const rotateX =
                    (mouseY - 0.5) * -5;

                card.style.transform =
                    `
                    perspective(900px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    translateY(-4px)
                    `;
            }
        );


        card.addEventListener(
            "mouseleave",
            () => {

                card.style.transform = "";

            }
        );

    });

}


/* ============================================================
   QUIZ DATA
============================================================ */

const quizQuestions = [

    {
        question:
            "Güneş Sistemi'nin merkezinde hangi gök cismi bulunur?",

        options: [
            "Dünya",
            "Güneş",
            "Ay",
            "Jüpiter"
        ],

        correct: 1,

        explanation:
            "Güneş, Güneş Sistemi'nin merkezindeki yıldızdır."
    },


    {
        question:
            "Yıldızların oluşabildiği gaz ve toz bulutlarına ne denir?",

        options: [
            "Galaksi",
            "Asteroit",
            "Bulutsu",
            "Uydu"
        ],

        correct: 2,

        explanation:
            "Bulutsular gaz ve toz bakımından zengin devasa uzay bölgeleridir."
    },


    {
        question:
            "Aşağıdakilerden hangisi bir uzay teleskobudur?",

        options: [
            "Hubble",
            "Göktürk-1",
            "ISS",
            "Voyager"
        ],

        correct: 0,

        explanation:
            "Hubble, Dünya yörüngesinde gözlem yapan bir uzay teleskobudur."
    },


    {
        question:
            "Çekim gücü nedeniyle ışığın bile kaçamadığı gök cismi hangisidir?",

        options: [
            "Bulutsu",
            "Kara delik",
            "Uydu",
            "Asteroit"
        ],

        correct: 1,

        explanation:
            "Kara deliklerin çekim alanı çok güçlüdür."
    }

];


/* ============================================================
   QUIZ ELEMENTS
============================================================ */

const quizCard =
    document.getElementById("quizCard");

const quizResult =
    document.getElementById("quizResult");

const questionText =
    document.getElementById("questionText");

const questionNumber =
    document.getElementById("questionNumber");

const answersContainer =
    document.getElementById("answers");

const quizFeedback =
    document.getElementById("quizFeedback");

const timerElement =
    document.getElementById("timer");

const progressBar =
    document.getElementById("progressBar");

const scoreMini =
    document.getElementById("scoreMini");

const finalScore =
    document.getElementById("finalScore");

const resultTitle =
    document.getElementById("resultTitle");

const resultDescription =
    document.getElementById("resultDescription");

const retryQuiz =
    document.getElementById("retryQuiz");


/* ============================================================
   QUIZ STATE
============================================================ */

let currentQuestion = 0;
let score = 0;
let answerLocked = false;

let timer = null;

const QUESTION_TIME = 20;


/* ============================================================
   START QUIZ
============================================================ */

function initializeQuiz() {

    currentQuestion = 0;

    score = 0;

    answerLocked = false;

    clearInterval(timer);

    quizCard.hidden = false;
    quizResult.hidden = true;

    scoreMini.textContent = "0 / 4";

    renderQuestion();

}


/* ============================================================
   RENDER QUESTION
============================================================ */

function renderQuestion() {

    clearInterval(timer);

    answerLocked = false;

    const question =
        quizQuestions[currentQuestion];


    /*
     * Soru bilgileri.
     */
    questionText.textContent =
        question.question;

    questionNumber.textContent =
        `Soru ${currentQuestion + 1} / ${quizQuestions.length}`;


    /*
     * Progress bar.
     */
    const progress =
        ((currentQuestion + 1) /
            quizQuestions.length) *
        100;

    progressBar.style.width =
        `${progress}%`;


    /*
     * Feedback temizle.
     */
    quizFeedback.textContent = "";

    quizFeedback.className =
        "quiz-feedback";


    /*
     * Eski cevapları temizle.
     */
    answersContainer.innerHTML = "";


    /*
     * Yeni cevap butonları.
     */
    question.options.forEach(
        (option, index) => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "answer-button";

            button.textContent =
                option;

            button.dataset.index =
                String(index);

            button.addEventListener(
                "click",
                () => {

                    handleAnswer(index);

                }
            );

            answersContainer.appendChild(
                button
            );

        }
    );


    /*
     * Süreyi başlat.
     */
    startQuestionTimer();

}


/* ============================================================
   QUESTION TIMER
============================================================ */

function startQuestionTimer() {

    let remaining =
        QUESTION_TIME;

    timerElement.textContent =
        `${remaining}s`;


    timer = setInterval(
        () => {

            remaining--;

            timerElement.textContent =
                `${remaining}s`;


            /*
             * Son 5 saniyede görsel vurgu.
             */
            if (remaining <= 5) {

                timerElement.style.color =
                    "var(--danger)";

            } else {

                timerElement.style.color =
                    "var(--blue-light)";

            }


            if (remaining <= 0) {

                clearInterval(timer);

                handleTimeout();

            }

        },
        1000
    );

}


/* ============================================================
   HANDLE ANSWER
============================================================ */

function handleAnswer(selectedIndex) {

    if (answerLocked) {
        return;
    }

    answerLocked = true;

    clearInterval(timer);

    const question =
        quizQuestions[currentQuestion];

    const buttons =
        answersContainer.querySelectorAll(
            ".answer-button"
        );


    /*
     * Tüm butonları kilitle.
     */
    buttons.forEach((button) => {

        button.disabled = true;

    });


    const selectedButton =
        buttons[selectedIndex];

    const correctButton =
        buttons[question.correct];


    /*
     * Doğru cevap.
     */
    if (
        selectedIndex ===
        question.correct
    ) {

        score++;

        selectedButton.classList.add(
            "correct"
        );

        quizFeedback.textContent =
            `✓ Doğru! ${question.explanation}`;

        quizFeedback.classList.add(
            "correct-feedback"
        );

    }

    /*
     * Yanlış cevap.
     */
    else {

        selectedButton.classList.add(
            "wrong"
        );

        correctButton.classList.add(
            "correct"
        );

        quizFeedback.textContent =
            `✕ Yanlış. ${question.explanation}`;

        quizFeedback.classList.add(
            "wrong-feedback"
        );

    }


    scoreMini.textContent =
        `${score} / ${quizQuestions.length}`;


    /*
     * Bir sonraki soruya geç.
     */
    setTimeout(() => {

        goToNextQuestion();

    }, 1600);

}


/* ============================================================
   TIMEOUT
============================================================ */

function handleTimeout() {

    if (answerLocked) {
        return;
    }

    answerLocked = true;

    const question =
        quizQuestions[currentQuestion];

    const buttons =
        answersContainer.querySelectorAll(
            ".answer-button"
        );


    buttons.forEach((button) => {

        button.disabled = true;

    });


    /*
     * Süre dolduğu için doğru cevabı göster.
     */
    buttons[question.correct]
        .classList.add("correct");


    quizFeedback.textContent =
        `⌛ Süre doldu. Doğru cevap: ${
            question.options[question.correct]
        }`;

    quizFeedback.classList.add(
        "wrong-feedback"
    );


    setTimeout(() => {

        goToNextQuestion();

    }, 1600);

}


/* ============================================================
   NEXT QUESTION
============================================================ */

function goToNextQuestion() {

    currentQuestion++;

    if (
        currentQuestion >=
        quizQuestions.length
    ) {

        finishQuiz();

        return;
    }

    renderQuestion();

}


/* ============================================================
   FINISH QUIZ
============================================================ */

function finishQuiz() {

    clearInterval(timer);

    quizCard.hidden = true;

    quizResult.hidden = false;

    finalScore.textContent =
        String(score);


    /*
     * Unvan hesaplama.
     */
    if (score === 4) {

        resultTitle.textContent =
            "Baş Astrofizikçi";

        resultDescription.textContent =
            "Mükemmel! Güneş Sistemi ve Ötesi konusundaki bilgilerin oldukça güçlü.";

    }

    else if (score >= 2) {

        resultTitle.textContent =
            "Uzay Kaşifi";

        resultDescription.textContent =
            "Güzel bir keşif yaptın! Birkaç konuyu daha tekrar ederek daha da ilerleyebilirsin.";

    }

    else {

        resultTitle.textContent =
            "Kozmik Çırak";

        resultDescription.textContent =
            "Evren seni bekliyor. Konuları tekrar incele ve yeniden dene!";

    }


    /*
     * Sonuç ekranına yumuşak kaydırma.
     */
    setTimeout(() => {

        quizResult.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, 100);

}


/* ============================================================
   RETRY
============================================================ */

retryQuiz.addEventListener(
    "click",
    () => {

        initializeQuiz();

        quizCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }
);


/* ============================================================
   INITIALIZE
============================================================ */

initializeQuiz();

updateCosmicDepth();

startIntro();