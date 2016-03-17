// raw µSheet json for a particular customer's fleet
function usr2url(usr) {
  return 'https://docs.adellica.com/usheet/raw/' + usr + '/vessels';
}

function alst2obj(alst) {
  return alst.reduce(function(s, x) {
    s[x[0]] = x[1];
    return s;
  }, {});
};

var getParam = function(param) {
  return getParams()[param];
};

var getParams = function() {
  return window.location.search.substr(1) == "" ? {} : alst2obj(window.location.search.substr(1).split("&").map(function(x) {
    return x.split("=").map(decodeURIComponent);
  }));
};

//Globally accessible statuses
window.statuses = [];
var param = getParam('usr');
jQuery.ajax({
  url: "https://docs.adellica.com/usheet/raw/arp/" + param + "/statuses",
  success: function(result) {
    if (result.isOk == false) alert(result.message);
    statuses = JSON.parse(result)
  },
  async: false
});

function setupPage() {
      console.log(window.statuses);
  response = window.statuses;
  for (i = 0; i < response.data.length; i++) {
    var color = response.data[i][1];
    var description = response.data[i][0];
    buttonCreator(color, description, i);
  }
  displayStatus();
}


function buttonCreator(color, description, number) {
  var mmsi = getParam('mmsi');
  var btn1 = document.createElement("button");
  btn1.id = 'btn' + number;
  var theidvariable = 'btn' + number;
  var t = document.createTextNode(description);
  btn1.appendChild(t);
  btn1.style.backgroundColor = color;
  btn1.className = "ui-btn"; //JQueryMobile
  document.body.appendChild(btn1);
  document.getElementById(theidvariable).onclick = function() {
    changeStatus(description, mmsi);
  };
}

function changeStatus(color, mmsi) { //Changes status 
  $.post("https://docs.adellica.com/usheet/raw/arp/mmsi/" + mmsi + "/status", JSON.stringify({
    data: [
      [color]
    ]
  }, null, 2), function(data) {
    console.log("ajax post success  to mmsi no. " + mmsi);
  });
  displayStatus();
}

function displayStatus() {
  $( "#current-status" ).empty();
  var mmsi = getParam('mmsi');
  var url = "https://docs.adellica.com/usheet/raw/arp/mmsi/" + mmsi + "/status";
  $.getJSON(url, function(response) {
    var description1 = "Nåværende status: ";
    var description2 = response.data[0][0];
    var t1 = document.createTextNode(description1);
    var t2 = document.createTextNode(description2);
    var linebreak = document.createElement('br');
    var actualStatus = document.createElement('p');
    actualStatus.appendChild(t2);
    actualStatus.id = "actualStatus";
    var theDiv = document.getElementById("current-status");
    var hr = document.createElement('hr');
    theDiv.appendChild(t1);
    theDiv.appendChild(linebreak);
    theDiv.appendChild(actualStatus);
    var color = returnColor(description2);
    actualStatus.style.backgroundColor = color;
    actualStatus.style.borderColor = color;
    actualStatus.style.borderWidth = "thick";
    theDiv.appendChild(hr);
    theDiv.style = "text-align:center";
  });
}

function returnColor(status) {
  if (!window.statuses || !window.statuses.data) return;
  for (i = 0; i < window.statuses.data.length; i++) {
    if (status == window.statuses.data[i][0]) {
      return window.statuses.data[i][1];
    }
  }
}