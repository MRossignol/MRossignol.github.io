
document.addEventListener('DOMContentLoaded', () => {

  let button = document.createElement('input');
  button.type = 'button';
  button.value = 'Play';
  button.addEventListener('click', startAudio);

  document.body.appendChild(button);
  
});
