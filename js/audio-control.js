(function () {
  const audio = document.getElementById("audio-embed");
  const audioController = document.getElementById("audio-controller");

  if (audio.paused) {
    audioController.classList.toggle("icon-audio-off");
  }

  if (audioController) {
    audioController.addEventListener("click", () => {
      audio.paused ? audio.play() : audio.pause();
      audioController.classList.toggle("icon-audio-off");
    });
  }
})();
