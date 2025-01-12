const content = document.getElementById("content");
let recognition;

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

    recognition.onresult =  function(event) {
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