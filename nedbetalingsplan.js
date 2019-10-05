//Henter verdier fra skjemaet som bruker fyller ut
function hentVerdierFraSkjema() {
  let verdier = document.getElementById("verdier");
  let returVerdier = {
    laanebelop: verdier[0].value,
    nominellRente: verdier[1].value,
    terminGebyr: verdier[2].value,
    utlopsDato: verdier[3].value,
    saldoDato: verdier[4].value,
    datoForsteInnbetaling: verdier[5].value,
    ukjentVerdi: "TERMINBELOP"
  };
  return returVerdier;
}

//Henter API-et til Stacc for å lage plan
function hentNedbetalingsplanFraStacc(payload) {
  $.ajax({
    type: "post",
    url:
      "https://visningsrom.stacc.com/dd_server_laaneberegning/rest/laaneberegning/v1/nedbetalingsplan",
    data: JSON.stringify(payload),
    traditional: true,
    headers: { "Content-Type": "application/json" },
    success: function(data) {
      // console.log("Det funket");
      makeCharts(data);
      skrivUtNedbetalingsplan(data);
    },
    error: function(data) {
      console.log("Error has happened");
    }
  });
}

// Oppretter noder i table som vises på HTML-siden
function skrivUtNedbetalingsplan(data) {
  // console.log(data.nedbetalingsplan.innbetalinger[5]);
  // console.log(data.nedbetalingsplan.innbetalinger[1].restgjeld);

  // Fjerner data om det er noe i tabellen fra før
  $("#niceTable tr").remove();

  // Lager ny tabellheading
  let headingNode = document.createElement("tr");

  let restgjeldH = document.createElement("th");
  let datoH = document.createElement("th");
  let terminbelopH = document.createElement("th");
  let renterH = document.createElement("th");
  let avdragH = document.createElement("th");

  restgjeldH.innerHTML = "Restgjeld";
  datoH.innerHTML = "Dato";
  terminbelopH.innerHTML = "Terminbelop";
  renterH.innerHTML = "Renter";
  avdragH.innerHTML = "Avdrag";

  headingNode.appendChild(restgjeldH);
  headingNode.appendChild(datoH);
  headingNode.appendChild(terminbelopH);
  headingNode.appendChild(renterH);
  headingNode.appendChild(avdragH);

  document.getElementById("niceTable").appendChild(headingNode);

  //legger data fra API inn i tabeller
  size = data.nedbetalingsplan.innbetalinger.length;
  let restgjeld = [];
  let dato = [];
  let terminbelop = [];
  let renter = [];
  let avdrag = [];

  for (i = 0; i < size; i++) {
    restgjeld.push(data.nedbetalingsplan.innbetalinger[i].restgjeld);
    dato.push(data.nedbetalingsplan.innbetalinger[i].dato);
    terminbelop.push(data.nedbetalingsplan.innbetalinger[i].total);
    renter.push(data.nedbetalingsplan.innbetalinger[i].renter);
    avdrag.push(data.nedbetalingsplan.innbetalinger[i].innbetaling);
  }

  //Oppretter noder i tabell for å vise alle betalinger med info
  for (j = 0; j < size; j++) {
    let tableNode = document.createElement("tr");

    let nodeRestgjeld = document.createElement("td");
    let nodeDato = document.createElement("td");
    let nodeTerminbelop = document.createElement("td");
    let nodeRenter = document.createElement("td");
    let nodeAvdrag = document.createElement("td");

    nodeRestgjeld.innerHTML = restgjeld[j].toFixed(0);
    nodeDato.innerHTML = dato[j];
    nodeTerminbelop.innerHTML = terminbelop[j].toFixed(0);
    nodeRenter.innerHTML = renter[j].toFixed(0);
    nodeAvdrag.innerHTML = avdrag[j].toFixed(0);

    tableNode.appendChild(nodeRestgjeld);
    tableNode.appendChild(nodeDato);
    tableNode.appendChild(nodeTerminbelop);
    tableNode.appendChild(nodeRenter);
    tableNode.appendChild(nodeAvdrag);

    document.getElementById("niceTable").append(tableNode);
  }
}

//Metoden som kjører når du trykker på knapp 'Lag plan'
function lagPlan() {
  let payload = hentVerdierFraSkjema();
  hentNedbetalingsplanFraStacc(payload);
}

function makeCharts(data) {
  //fjerner eventuelle charts om de eksisterer allerede
  $("#niceCanvases tr").remove();

  makeBarChart(data);
  makeChart(data);
}

function makeBarChart(data) {
  let laanebelop = data.nedbetalingsplan.innbetalinger[0].restgjeld;
  let sumAvdra = 0;
  let sumRenter = 0;
  size = data.nedbetalingsplan.innbetalinger.length;

  for (i = 0; i < size; i++) {
    sumAvdra += data.nedbetalingsplan.innbetalinger[i].innbetaling;
    sumRenter += data.nedbetalingsplan.innbetalinger[i].renter;
  }

  let avdragRenter = sumAvdra + sumRenter;

  new Chart(document.getElementById("bar-chart"), {
    type: "bar",
    data: {
      labels: ["Lånebeløp", "Sum Avdrag", "Sum Renter", "Avdrag + Renter"],
      datasets: [
        {
          label: "Kr",
          backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9"],
          data: [
            laanebelop.toFixed(0),
            sumAvdra.toFixed(0),
            sumRenter.toFixed(0),
            avdragRenter.toFixed(0)
          ]
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      },
      legend: { display: false },
      title: {
        display: true,
        text: "Oversikt over andel renter og avdrag i tilbakebetalingssum",
        fontSize: 20
      }
    }
  });
}

function makeChart(data) {
  let restgjeld = [];
  let dato = [];
  size = data.nedbetalingsplan.innbetalinger.length;

  for (i = 0; i < size; i++) {
    restgjeld.push(data.nedbetalingsplan.innbetalinger[i].restgjeld.toFixed(0));
    dato.push(data.nedbetalingsplan.innbetalinger[i].dato);
  }

  new Chart(document.getElementById("line-chart"), {
    type: "line",
    data: {
      labels: dato,
      datasets: [
        {
          data: restgjeld,
          text: "Skyldig beløp",
          label: "Skyldig beløp",
          borderColor: "#3e95cd",
          fill: false
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: "Nedbetalingsplan",
        fontSize: 20
      }
    }
  });
}
