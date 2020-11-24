document.addEventListener("DOMContentLoaded", event => {
  // MAKE FIELD SELECTORS
	let allInputsR = window.lp.getSeries('', 0, ['fields']);
	let allInputs;
  allInputsR.then(success => {
    allInputs = success.distinct.fields;
    console.log('allInputs are', allInputs);
    let form = document.getElementById('form-form');
    for (let allInput of allInputs) {
      if (allInput === 'description') {
        continue;
      }
      let selectLabel = document.createElement('label');
      let labelText = document.createTextNode(capitalize(allInput.split('_').join(' ') + ' '));
      selectLabel.appendChild(labelText);
      selectLabel.setAttribute('for', allInput);
      let select = document.createElement('select');
      select.setAttribute('id', allInput);
      select.setAttribute('name', allInput);
      form.appendChild(selectLabel);
      form.appendChild(select);
      // Add an empty option to the field
      let emptyOption = document.createElement('option');
      select.appendChild(emptyOption);
      // Get all options for this field
	    let optionsR = window.lp.getSeries('', 0, [allInput]);
	    let options;
	    optionsR.then(success => {
        options = success.distinct[allInput];
        console.log('success is', success);
        console.log('options are', options);
        for (let option of options) {
          if (option === null) {
            continue;
          }
          let optionNode = document.createElement('option');
          optionNode.setAttribute('value', option);
          let text = document.createTextNode(option);
          optionNode.appendChild(text);
          select.appendChild(optionNode);
        }
      }, error => {throw error;});
      form.appendChild(document.createElement('br'));
    }
  }, error => {throw error;});

  // MAKE SEARCH
  let btn = document.getElementById('searchBtn');
  btn.addEventListener('click', event => {
    let q = makeQuery();
    console.log('Making query: ', q);
    window.lp.getSeries(q, 50).then(success => {
      let content = success.content;
      let resultsEl = document.getElementById('results');
      if (!content) {
        resultsEl.appendChild(document.createTextNode('Não foram encontradas séries com esses critérios.'));
        return;
      }
      for (let s of content) {
        let sEl = document.createElement('a');
        let encodedUid = encodeURI(s._id);
        sEl.setAttribute('href', `graficos.html?uid=${encodedUid}`);
        sEl.appendChild(document.createTextNode(s.fields.description));
        resultsEl.appendChild(sEl);
        resultsEl.appendChild(document.createElement('br'));
      }
      let remaining = success.len - success.content.length;
      if (remaining) {
        let remainingMsg = document.createElement('p');
        remainingMsg.appendChild(document.createTextNode(`Refine a busca para ver as ${remaining} séries restantes.`));
        resultsEl.appendChild(remainingMsg);
      }
    }, error => {throw error;});
  });

});

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
};

const makeQuery = () => {
  return Array.from(document.querySelectorAll('select'))
    .filter(el => Boolean(el.value))
    .map(el => [el.name, '"' + el.value + '"'])
    .map(arr => arr.join('='))
    .join(' ');
};