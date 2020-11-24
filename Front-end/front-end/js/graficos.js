document.addEventListener('DOMContentLoaded', event => {
  const uid = getUid();
  console.log(`Making query`, uid);
  window.lp.getSeries(`uid="${uid}"`, -1).then(success => {
    processSeries(success.content);
  }, error => {throw error;});
});

const getUid = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('uid');
};

const processSeries = s => {

  // Gráfico
  const pts = Object.entries(Object.entries(s)[0][1].points);
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawChart);
  function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Ano');
    data.addColumn('number', 'Casos');
    data.addRows(pts);

    var options = {'title':'Casos encontrados',
                   'width':1200,
                   'height':600};

    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(data, options);
  }

  // Fields
  const fds = s[0].fields;
  const title = document.getElementById('title');
  title.appendChild(document.createTextNode(fds.description));
  delete fds.description;
  const fieldsPlace = document.getElementById('fields');
  for (let [k, v] of Object.entries(fds)) {
    let el = document.createElement('p');
    el.appendChild(document.createTextNode(`${k}: ${v}`));
    fieldsPlace.appendChild(el);
  }
};