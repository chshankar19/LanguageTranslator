const fromText = document.querySelector(".from-text"),
toText = document.querySelector(".to-text"),
exchangeIcon = document.querySelector(".exchange"),
selectTag = document.querySelectorAll("select"),
icons = document.querySelectorAll(".row i");
translateBtn = document.querySelector("button.translate-btn");

// Populate language dropdowns from countries.js
selectTag.forEach((tag, id) => {
    for (let country_code in countries) {
        let selected = id == 0 ? country_code == "en-GB" ? "selected" : "" : country_code == "te-IN" ? "selected" : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
    }
});

// Exchange text and languages
exchangeIcon.addEventListener("click", () => {
    let tempText = fromText.value,
    tempLang = selectTag[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
});

// Clear translation if input is empty
fromText.addEventListener("keyup", () => {
    if (!fromText.value) {
        toText.value = "";
    }
});

// Function to check if the language pair is valid
function isValidLangPair(translateFrom, translateTo) {
    return translateFrom && translateTo && translateFrom !== translateTo;
}

// Handle translation process
translateBtn.addEventListener("click", () => {
    let text = fromText.value.trim(),
    translateFrom = selectTag[0].value,
    translateTo = selectTag[1].value;

    // Validate the language pair
    if (!text || !isValidLangPair(translateFrom, translateTo)) {
        toText.value = "Invalid language pair or no text provided.";
        return;
    }

    toText.setAttribute("placeholder", "Translating...");
    
    // Properly encode the text and language pair for the API call
    let encodedText = encodeURIComponent(text);
    let encodedLangPair = `${encodeURIComponent(translateFrom)}|${encodeURIComponent(translateTo)}`;
    
    let apiUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${encodedLangPair}`;

    // Debugging: Log the request URL
    console.log(`API Request URL: ${apiUrl}`);

    fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
        // Debugging: Log the response
        console.log("API Response:", data);

        if (data.responseData.translatedText) {
            toText.value = data.responseData.translatedText;
        } else {
            toText.value = "Translation unavailable for this language pair.";
        }
        toText.setAttribute("placeholder", "Translation");
    })
    .catch((error) => {
        console.error("Error with translation API:", error);
        toText.value = "Error with translation. Please try again later.";
        toText.setAttribute("placeholder", "Translation");
    });
});

// Handle text-to-speech and copying text
icons.forEach(icon => {
    icon.addEventListener("click", ({target}) => {
        if (!fromText.value || !toText.value) return;

        if (target.classList.contains("fa-copy")) {
            if (target.id == "from") {
                navigator.clipboard.writeText(fromText.value);
            } else {
                navigator.clipboard.writeText(toText.value);
            }
        } else {
            let utterance;
            if (target.id == "from") {
                utterance = new SpeechSynthesisUtterance(fromText.value);
                utterance.lang = selectTag[0].value;
            } else {
                utterance = new SpeechSynthesisUtterance(toText.value);
                utterance.lang = selectTag[1].value;
            }

            // Check if the language is supported for speech synthesis
            const voices = speechSynthesis.getVoices();
            const supportedVoice = voices.find(voice => voice.lang === utterance.lang);

            if (supportedVoice) {
                utterance.voice = supportedVoice;
                speechSynthesis.speak(utterance);
            } else {
                alert("Text-to-Speech is not supported for this language.");
            }
        }
    });
});
