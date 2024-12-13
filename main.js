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
        if (content) {
          content.innerHTML = interim_transcript;
        }
      }


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

