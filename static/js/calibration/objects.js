const objectListEl = document.querySelector('ul');

fetch('/objects')
  .then((r) => r.json())
  .then((allObjects) => {
    allObjects.forEach((obj) => {
      const objEl = document.createElement('li');
      objEl.innerHTML = `
        <label>Type:</label> ${obj.type}<br />
        <label>Value:</label> ${obj.value}<br />
        <img src="data:image/bmp;base64, ${obj.image}" />`;
      
      const imgEl = objEl.querySelector('img');
      imgEl.addEventListener('mouseover', () => imgEl.setAttribute('src', `/objects/${obj.type}/${obj.value}`));
      imgEl.addEventListener('mouseleave', () => imgEl.setAttribute('src', `data:image/bmp;base64, ${obj.image}`));

      objectListEl.appendChild(objEl);
    });
  });
