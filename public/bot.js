const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

let isSpeaking = false;

recognition.onstart = () => {
    console.log('Speech recognition started');
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
};

recognition.onend = () => {
    console.log('Speech recognition ended');
    if (!isSpeaking) {
        setTimeout(() => {
            startRecognition();
        }, 1000); // Adjust the delay as needed
    }
};

recognition.onresult = async (event) => {
    console.log('Speech recognition result received');
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
    }
    document.getElementById('transcript').innerText = `You said: ${transcript}`;
    const aiResponse = await getAIResponse(transcript);
    document.getElementById('response').innerText = `Bot says: ${aiResponse}`;
    speak(aiResponse);
};

function startRecognition() {
    console.log('Starting recognition');
    recognition.start();
}

async function getAIResponse(userInput) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: userInput }]
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching AI response:', error);
    }
}

function speak(text) {
    isSpeaking = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
        console.log('Speech synthesis ended');
        isSpeaking = false;
        recognition.start();
    };
    speechSynthesis.speak(utterance);
    recognition.stop();
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('button').addEventListener('click', startRecognition);
});