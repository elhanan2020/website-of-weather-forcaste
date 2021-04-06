(function () {
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    document.addEventListener('DOMContentLoaded', function () {
        showTheCity();
        document.getElementById('Add_Button').addEventListener("click", add);
        document.getElementById('EraseLocation').addEventListener("click", deleteLoc);
        document.getElementById('EraseAll').addEventListener("click", deleteAll);
        document.getElementById('Get_the_Weather').addEventListener("click", show_weather().getData);
        showTheCity();
    }, false);

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //the main function that showing the weather to the user
    var show_weather = function () {
        function getData() {
            var myImage = document.querySelector('img');
            getThePosition()
                .then(position => {
                    if (!position[0]) {
                        document.querySelector("#choose").style.display = "block";
                        return;
                    }

                    document.querySelector("#choose").style.display = "none";
                    document.querySelector("#spinner").style.display = "block";
                    fetch('http://www.7timer.info/bin/api.pl?lon=' + position[1][0] + '&lat=' + position[1][1] + '&product=civillight&output=json')
                        .then(function (response) {
                            if (response.status !== 200) {
                                console.log('Looks like there was a problem. Status Code: ' + response.status);
                                return;
                            }
                            response.json().then(function (data) { //here we are parsing the json to javasript object so we are printing on the screen the data
                                let html = "";
                                document.getElementById("Name_Of_City").innerHTML = position[0];
                                document.getElementById("loadFailed").style.display = "none";
                                let day = 1;
                                document.getElementById("show_the_weather").style.display = "block";
                                for (var item of data.dataseries) {
                                    var thedate = item.date.toString();
                                    thedate = thedate.slice(6, 9) + "/" + thedate.slice(4, 6) + "/" + thedate.slice(0, 4);
                                    html = '<th scope="row">' + 'Day' + day + '</th>' +
                                        "<td>" + thedate + "</td>" +
                                        "<td>" + item.weather + "</td>" +
                                        "<td>" + item.temp2m.max + "</td>" +
                                        "<td>" + item.temp2m.min + "</td>" +
                                        "<td>" + wind(item.wind10m_max) + "</td>";
                                    document.getElementById("Day" + day++).innerHTML = html;
                                    document.querySelector("#spinner").style.display = "none"
                                }
                            })
                        })
                        .catch(function (err) { //if the called to server is failled , then we printing on the screena message
                            document.getElementById("loadFailed").style.display = "block";
                            console.log('Fetch Error :', err);
                        });
                    //with this fetch we are called to the server to get a curent picture of weather
                    fetch("http://www.7timer.info/bin/astro.php? lon=" + position[1][0] + "&lat=" + position[1][1] + "&ac=0&lang=en&unit=metric&output=internal&tzshift=0")
                        .then(function (response) {
                            if (response.status !== 200) {
                                console.log('Looks like there was a problem. Status Code: ' + response.status);
                                return;
                            }
                            response.blob()
                                .then(function (myBlob) {
                                    var objectURL = URL.createObjectURL(myBlob);
                                    myImage.src = objectURL;
                                    document.getElementById("myImage").style.display = "block";
                                })
                        })
                        //if the call was failed then we are printing on the screen a default picture
                        .catch(function (err) {
                            document.getElementById("myImage").style.display = "block";
                            myImage.src = "/images/default_image.jpg";
                            console.log('Fetch Error :', err);
                        });
                });

        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        //this function checking if the wind is greater that 1 if yes then we does't print it
        function wind(winder) {
            if (winder > 1)
                return winder;
            return "";
        }
        return {
            getData: getData
        };
    } //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    function showTheCity() {
        document.getElementById("errorField").style.display = "none";
        fetch('../api/city')
            .then(
                function (response) {
                    if (response.status === 404) {
                        {
                            if (confirm("you are no longer connected press the button to go back to")) document.location = '/register/login';
                        }
                    }
                    response.json()
                        .then(function (data) {
                            if (data.error)
                                document.querySelector("#list").innerHTML = "Some error occured, is the database initialized?";
                            else if (data[0]) {
                                document.getElementById("list1").style.display = "block";
                                let html = '';
                                for (let index in data) {
                                    console.log(data[index].city)
                                    html += '<input type="radio" id=' + data[index].city + ' name="gender" value=' + data[index].city + '>'
                                    html += '<label for=' + 'data[i].city' + '>' + data[index].city + '</label><br>'
                                }
                                document.querySelector("#list").innerHTML = html;
                            } else {
                                document.querySelector("#list").innerHTML = "";
                                document.getElementById("list1").style.display = "none";
                            }
                        });
                }
            )
            .catch(function (err) {
                // need to display error message!
                document.querySelector("#data").innerHTML = 'Fetch Error :'.err;
                console.log('Fetch Error :', err);
            });
    }; //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //this function add any city that i enterred in a list of city if its over the cheking succfully
    function add() {
        document.querySelector("#errorCity").style.display = "none";
        if (!valid().checkTheInput()) {
            document.getElementById("errorField").style.display = "block";
        } else {
            fetch('http://localhost:3000/api/position', content)
                .then(text => {
                    if (text.status === 555) {
                        document.querySelector("#errorCity").style.display = "block";
                        document.querySelector("#errorCity").innerHTML = "The city you have chosen  is already in the database ";
                    } else if (text.status === 404) {
                        {
                            if (confirm("you are no longer connected press the button to go back to")) document.location = '/register/login';
                        }
                    } else {
                        console.log(text);
                        initData();
                        showTheCity();
                    }
                }).catch(function (error) {
                console.log(error);
            });

        }
    }
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //this function delete the city that i select with a radiobutton
    function deleteLoc() {
        document.getElementById("show_the_weather").style.display = "none";
        document.getElementById("myImage").style.display = "none";
        var cityDel = "";
        var city = document.getElementsByTagName("input");
        document.getElementById("show_the_weather").style.display = "none";
        for (let i in city)
            if (city[i].checked)
                cityDel = city[i].value;
        if (cityDel) {
            fetch('http://localhost:3000/api/deleteCity/' + cityDel, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(text => {
                if (text.status === 404) {
                    if (confirm("you are no longer connected press the button to go back to")) document.location = '/register/login';
                } else
                    showTheCity();
            }).catch(function (error) {
                console.log(error);
            });
        } else {
            document.querySelector("#choose").style.display = "block";


        }

    } //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //this function delete the city that i select with a radiobutton
    function deleteAll() {
        document.getElementById("show_the_weather").style.display = "none";
        document.getElementById("myImage").style.display = "none";
        fetch('http://localhost:3000/api/deleteAllCity', {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            },
        }).then(text => {
            if (text.status === 404) {
                {
                    if (confirm("you are no longer connected press the button to go back to")) document.location = '/register/login';
                }
            } else {
                console.log(text);
                showTheCity();
            }
        }).catch(function (error) {
            console.log(error);
        });

    }
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //it's a function that save the value of any city that i get in the array
    var initTheData = function (city, lat, lon) {
        const data = {
            city: city,
            latitude: lat,
            longitude: lon
        };
        content = {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        };
    }
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //its a namespaces of validation
    function valid() {
        //this function get the long &lat of the city and send them to function
        function checkTheInput() {
            let lat = document.getElementById("Latitudenum").value;
            let lon = document.getElementById("Longitudenum").value;
            if (isOk(lat, lon)) {
                initTheData(document.getElementById("LocationName").value, lat, lon);
                return true;
            }
            return false;
        };
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        function isOk(lat, lon) {
            var text_error = "";
            if (!document.getElementById("LocationName").value)
                text_error += "<li>the Location name  need to be entered</li>";
            if (!lat)
                text_error += "<li>the latitude need to be entered</li>";
            else if (lat < -90 || lat > 90)
                text_error += "<li>the latitude needs to be in range of (90)->(-90)</li>";
            else if (check(lat))
                text_error += "<li>the latitude needs to be a decimal number</li>";
            if (!lon)
                text_error += "<li>the longitude need to be entered</li>";
            else if (lon < -180 || lon > 180)
                text_error += "<li>the latitude needs to be in range of (180)->(-180)</li>";
            else if (check(lon))
                text_error += "<li>the longitude needs to be a decimal number</li>";
            if (!text_error)
                return true;
            document.getElementById("errorField").innerHTML = text_error;
            return false;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return {
            checkTheInput: checkTheInput
        };
    }
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //if the city was added succefuly then we are cleanning the input for the next city
    function initData() {
        document.getElementById("form-group").reset();
    }

    function check(num) {
        for (let i = 0; i < num.length; i++)
            if (num[i] === ".")
                return false;
        return true;
    }
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    async function getThePosition() {
        var cityName = "";
        var city = document.getElementsByTagName("input");
        for (let x in city)
            if (city[x].checked)
                cityName = city[x].value;
        if (cityName) {
            let response = await fetch('../api/getPosition/' + cityName, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status === 404) {
                {
                    if (confirm("you are no longer connected press the button to go back to")) document.location = '/register/login';
                }
            } else {
                let data = await response.json()
                return [cityName, data];
            }
        } else {
            return ["", ""];
        }
    }

})();
