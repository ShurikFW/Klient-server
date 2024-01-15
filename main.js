let regOpt = document.querySelector("#regions_list");
let stopOpt = document.querySelector("#stops_list");
let sendRegion = document.querySelector("#sendRegions");
let showStopsBtn = document.querySelector("#showStops");
let region_input = document.querySelector("#regions_input")
let stops_input = document.querySelector("#stops_input")

function createDataList(inp, opt) {
    inp.onfocus = function () {
        opt.style.display = 'block';
        inp.style.borderRadius = "5px 5px 0 0";
    };

    inp.oninput = function () {
        let text = inp.value.toUpperCase();
        for (let option of opt.options) {
            if (option.value.toUpperCase().indexOf(text) > -1) {
                option.style.display = "block";
            } else {
                option.style.display = "none";
            }
        };
    }

    let currentFocus = -1;
    inp.onkeydown = function (e) {
        if (e.keyCode == 40) {
            currentFocus++
            addActive(opt.options);
        }
        else if (e.keyCode == 38) {
            currentFocus--
            addActive(opt.options);
        }
        else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (opt.options)
                    opt.options[currentFocus].click();
            }
        }
    }
}

function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0)
        currentFocus = (x.length - 1);
    x[currentFocus].classList.add("active");
}
function removeActive(x) {
    for (let i = 0; i < x.length; i++) {
        x[i].classList.remove("active");
    }
}


function removeFocusFromSelect(opt, div) {
    document.addEventListener('click', (e) => {
        const withinBoundaries = e.composedPath().includes(div);
        if (!withinBoundaries) {
            opt.style.display = 'none';
        }
    })

}

sendRegion.addEventListener("click", () => {
    if(stops_input.value != ""){cleaner(flag = false)}
    let stopAreaValue = region_input.value;
    fetch('/getAllStops/' + stopAreaValue)
        .then(response => response.json())
        .then(data => showStops(data));

})


function main() {
    if (window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(function (position) {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            setInterval(function () { setLoc(userLat, userLon) }, 10000);

        }, function (error) {
            console.log('Geolocation not defined')
        });
    } else {
        console.log("Can't find geolocation");
    }


    const regionFocus = document.querySelector('#regionsFocus');
    const stopsFocus = document.querySelector('#stopsFocus');
    createDataList(region_input, regOpt);
    createDataList(stops_input, stopOpt);
    removeFocusFromSelect(regOpt, regionFocus);
    removeFocusFromSelect(stopOpt, stopsFocus)
    document.querySelector(".clear").addEventListener('click', function () { cleaner() });
    getText('/getAllRegions', showRegions);

}

function showRegions(data) {
    if (document.querySelector("#regions_input")) {
        let parseResult = JSON.parse(data)
        for (k in parseResult) {
            let option = document.createElement("option");
            region = parseResult[k]["stop_area"]
            option.value = region
            option.innerHTML = region
            regOpt.appendChild(option)
        }
    }
    for (let option of regOpt.options) {
        option.onclick = () => {
            region_input.value = option.value;
            regOpt.style.display = 'none';
            region_input.style.borderRadius = "5px";
        }
    };
}


function showStops(data) {
    if (document.querySelector("#stops_input")) {
        let parseResult = data
        for (k in parseResult) {
            let option = document.createElement("option");
            stops = parseResult[k]["stop_name"]
            option.value = stops
            option.innerHTML = stops
            stopOpt.appendChild(option)
        }
    }
    for (let option of stopOpt.options) {
        option.onclick = () => {
            stops_input.value = option.value;
            stopOpt.style.display = 'none';
            stops_input.style.borderRadius = "5px";
        }
    };
};


function showBtns(data) {
    console.log(data)
    const busesCont = document.querySelector('.buses');
    const stop_area = region_input.value;
    const stop_name = stops_input.value;
    let datetime = new Date();
    let datetimSplitted = datetime.toLocaleString().split(",");
    const dep_time = tConvert(datetimSplitted[1].trim());
    

    if(data.length == 0){
        document.querySelector(".buses").innerHTML = 'no busses, but stop exist';
    }else{
        document.querySelector(".buses").innerHTML = '';

        let btns = "<div class='del'>";
    
        data.forEach(function ({ route_short_name }) {
            const btnClass = '.r' + route_short_name;
            btns += `<button class="bus r-${route_short_name}  badge badge-info">${route_short_name}</buttons>`;
        });
    
        btns += "</div>";
        busesCont.innerHTML += btns;
    
        data.forEach(function ({ route_short_name }) {
            const btnClass = '.r-' + route_short_name;
    
            document.querySelector(btnClass).addEventListener('click', function () {
    
                fetch('/getStopTimes/' + stop_area + '/' + stop_name + '/' + route_short_name + '/' + dep_time)
                    .then(response => response.json())
                    .then(data => showTimes(data));
            });
    
        });


    }

};



function tConvert (time12h) {
    const [time, modifier] = time12h.split(' ');

    let [hours, minutes] = time.split(':');
  
    if (hours === '12') {
      hours = '00';
    }
  
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
  
    return `${hours}:${minutes}`;
  }

getText = async function (url, callback) {
    let request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.responseText);
        }
    };
    request.open("GET", url);
    request.send();
}

document.querySelector('#showStops').addEventListener('click', function () {
    const stop_area = region_input.value;
    const stop_name = stops_input.value;
    fetch('/getBuses/' + stop_area + '/' + stop_name)
        .then(response => response.json())
        .then(data => showBtns(data));
});


function setLoc(lat, lon) {
    let datetime = new Date();
    document.querySelector(".loc").innerHTML = '<span>User location: </span><br> Lat: ' + lat + '<br> Lon: ' + lon;
    document.querySelector(".time").innerHTML = '<span>Time: </span>' + datetime.toLocaleTimeString('it-IT');

    fetch('/getReg/' + lat + '/' + lon)
        .then(response => response.json())
        .then(data => setReg(data));

    fetch('/getNearestStops/' + lat + '/' + lon)
        .then(response => response.json())
        .then(data => setStops(data));
};

function setReg(data) {
    data.forEach(function ({ stop_area }) {
        document.querySelector(".user-reg").innerHTML = `<span> Region: ${stop_area} </span>`;
    });
}

function setStops(data) {
    let pText = '<span>Nearest stops: </span>'
    data.forEach(function ({ stop_name }) {
        pText += `${stop_name}, `;
    });

    document.querySelector(".closes-stops").innerHTML = pText;
}

function showTimes(data) {
    const table = document.querySelector('table tbody');

    let tableHtml = "";

    if (data.length === 0) {
        table.innerHTML = '<tr><td colspan="5" class="no-data" style="text-align: center;">No data</td></tr>';
    }
    else {
        var BreakException = {};
        try {
            let id = 1;
            data.forEach(function ({ route_short_name, departure_time, stop_name, trip_long_name }) {
                tableHtml += '<tr>';
                tableHtml += '<td>' + id + '</td>';
                tableHtml += `<td>${route_short_name}</td>`;
                tableHtml += `<td>${departure_time}</td>`;
                tableHtml += `<td>${stop_name}</td>`;
                tableHtml += `<td>${trip_long_name}</td>`;
                tableHtml += '<tr>';
                id += 1;
                if (id > 5) throw BreakException;
            });
          } catch (e) {
            if (e !== BreakException) throw e;
          }


        table.innerHTML = tableHtml;
    }
};


function cleaner(flag= true) {
    if (flag){
        region_input.value = '';
        stops_input.value = '';
        document.querySelector('#stops_list').innerHTML = '';
        document.querySelector(".buses").innerHTML = '';
    }else{
        stops_input.value = '';
        document.querySelector('#stops_list').innerHTML = '';
        document.querySelector(".buses").innerHTML = '';
    }

    document.querySelector('table tbody').innerHTML = '';
}




window.addEventListener('DOMContentLoaded', (event) => {
    main()
});