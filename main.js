const content = document.getElementById("content");
let recognition;

let isRecognitionActive = false;
let isCtrlShiftPressed = false;


document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.altKey && !isRecognitionActive) {
		isCtrlShiftPressed = true;
		startRecognition();
		isRecognitionActive = true;
  }
});

document.addEventListener('keyup', async (e) => {
  if (!e.ctrlKey || !e.shiftKey && !e.altKey && isRecognitionActive) {
		if (recognition)
    recognition.stop();
  }
});


async function callGeminiAPI(transcript) {
  // `Convert the user's speech: ${transcript} to the corresponding command based on the defined phrases: ${commands.map(c => c.phrase).join(', ')}`
	// const prompt = `Based on the user's speech: "${transcript}", return the closest matching speech from the following defined phrases: ${appConfig.commands.map(c => c.phrase).join(', ')}. For example, for the command { phrase: "^(?:start |open )?(?:a )?new tab$" }, the sample speech is: "Open a new tab". Do not provide any additional information or ask any questions. Only return the correct speech like athe sample speech above from matching phrase.`;
	// Only return the matching phrase.`

	const prompt = {
		// instruction: `Convert the user's speech: ${transcript} to the corresponding command based on the defined phrases: ${commands.map(c => c.phrase).join(', ')}`
		instruction: `Based on the user's speech: "${transcript}", return the closest matching speech from the following defined phrases: ${appConfig.commands.map(c => c.phrase).join(', ')}. For example, for the command { phrase: "^(?:start |open )?(?:a )?new tab$" }, the sample speech is: "Open a new tab". Do not provide any additional information or ask any questions. Only return the correct speech like athe sample speech above from matching phrase.`
		// Only return the matching phrase.`
	};

	console.log('Prompt:', prompt);
	// return;

	  try {
    const response = await fetch('http://localhost:3000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    console.log('Gemini API response:', data);
    return data.response.trim();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
  }
}

function startRecognition() {
  var select_language = document.querySelector('#select-language');
  var select_dialect = document.querySelector('#select_dialect');

  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = select_dialect.value || select_language.value || 'en-US';
    // alert('recognition.lang: ' + recognition.lang);
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    var final_transcript = "";

    recognition.onresult = async function(event) {
      var interim_transcript = '';
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      if (interim_transcript.length > 0) {
        // if (content) {
        //   content.innerHTML = interim_transcript;
        // }
				chrome.tabs.query({active: true}, function(tabs) {
					if (tabs[0]) {
						chrome.tabs.sendMessage(tabs[0].id, { interim_transcript: interim_transcript });
						console.log(tabs[0].url);
					}
				});
      }


      if (final_transcript.length > 0) {
        if (isCtrlShiftPressed) {
          isCtrlShiftPressed = false;
          final_transcript = await callGeminiAPI(final_transcript);
        }
        if (findCommandInSpeech(final_transcript)){
          final_transcript = "";
        }

        var selection = window.getSelection();
				var range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

				if (!range || !content.contains(range.commonAncestorContainer)) {
					range = document.createRange();
					range.selectNodeContents(content);
					range.collapse(false);
					selection.removeAllRanges();
					selection.addRange(range);
				}

				var textNode = document.createTextNode(final_transcript);
				range.insertNode(textNode);

				range.setStartAfter(textNode);
				range.setEndAfter(textNode);
				selection.removeAllRanges();
				selection.addRange(range);

				chrome.runtime.sendMessage({ type: 'insertText', text: final_transcript });
        console.log('final:', final_transcript);
        final_transcript = '';
      }
    };

    recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = function() {
      isRecognitionActive = false;
      console.log('Speech recognition ended');
    };

    recognition.start();
  } else {
    alert('Trình duyệt của bạn không hỗ trợ Web Speech API');
  }
}

document.getElementById('start-btn').addEventListener('click', () => {
    isRecognitionActive = false;
		startRecognition();
});

document.getElementById('stop-btn').addEventListener('click', () => {
	if (recognition) {
		recognition.stop();
	}
});



document.addEventListener('DOMContentLoaded', function() {
  const copyBtn = document.getElementById('copy-btn');
  copyBtn.addEventListener('click', function() {
    const contentDiv = document.getElementById('content');
    const textToCopy = contentDiv.innerText || contentDiv.textContent;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => console.log('Copied to clipboard successfully!'))
        .catch(err => console.error('Error in copying text: ', err));
    } else {
      // Fallback method
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        console.log('Copied to clipboard using execCommand!');
      } catch (err) {
        console.error('execCommand error', err);
      }
      document.body.removeChild(textarea);
    }
  });
	const clearBtn = document.getElementById('clear-btn');
  clearBtn.addEventListener('click', function() {
    document.getElementById('content').innerHTML = '';
  });
});