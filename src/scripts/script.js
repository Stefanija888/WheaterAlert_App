let navService = {
    navItems: document.getElementsByClassName("nav-item"),
    navSearch: document.getElementById("citySearchInput"),
    searchBtn: document.getElementById("citySearchBtn"),
    pages: document.getElementById("pages").children,
    pageLimit: false,
    month: "",
    minutes: "",
    counterPerMin: 0,
    counterPerMounth: 0,
    clickCounter: function(){
        if(this.counterPerMin < 59 && this.minutes === new Date().getMinutes() && this.counterPerMounth < 1000000 && this.month === new Date().getMonth()){
            navService.counterPerMin++
            navService.counterPerMounth++
            console.log(navService.counterPerMin)
            console.log(navService.counterPerMounth)
            return navService.pageLimit = true
        }
        else if(this.minutes !== new Date().getMinutes() && this.month !== new Date().getMonth()){
            navService.month = new Date().getMonth()
            navService.minutes = new Date().getMinutes()
            navService.counterPerMin = 0;
            navService.counterPerMounth = 0;
            return navService.pageLimit = true
        }
        else {
            return navService.pageLimit = false
        }
    },
    activateItem: (item) => {
        for (let navItem of navService.navItems) {
            navItem.classList.remove("active")
        }
        item.classList.add("active")
    },
    showPage: (page) => {
        for (let pageElement of navService.pages) {
            pageElement.style.display = "none"
        }
        page.style.display = "block"
    },
    registerNavListeners: function() {
        for (let i = 0; i < this.navItems.length; i++) {
            this.navItems[i].addEventListener("click", function() {
                navService.activateItem(this)
                navService.showPage(navService.pages[i])
            })
        }
        this.searchBtn.addEventListener("click", (event) => {
            event.preventDefault()
            weatherService.city = navService.navSearch.value
            this.clickCounter()
            uiService.toggleLoader(true)
            if(navService.pageLimit === true){
                weatherService.getData()
            }
            else {
                errorService.limitMessage();
                uiService.toggleLoader(false)
            }
        }),
        document.getElementById("ascTime").addEventListener("click", () => {
            let ascTime = weatherService.weatherData.list.sort((a,b) => {if(a.dt < b.dt) return -1})
            uiService.sortHourlyTable(ascTime)
        }),
        document.getElementById("descTime").addEventListener("click", () => {
            let descTime = weatherService.weatherData.list.sort((a,b) => {if(a.dt > b.dt) return -1})
            uiService.sortHourlyTable(descTime)
        }),
        document.getElementById("ascTemp").addEventListener("click", () => {
            let ascTemp = weatherService.weatherData.list.sort((a,b) => {if(a.main.temp < b.main.temp) return -1})
            uiService.sortHourlyTable(ascTemp)
        }),
        document.getElementById("descTemp").addEventListener("click", () => {
            let descTemp = weatherService.weatherData.list.sort((a,b) => {if(a.main.temp > b.main.temp) return -1})
            uiService.sortHourlyTable(descTemp)
        })
        document.getElementById("ascHumidity").addEventListener("click", () => {
            let ascHumidity = weatherService.weatherData.list.sort((a,b) => {if(a.main.humidity < b.main.humidity) return -1})
            uiService.sortHourlyTable(ascHumidity)
        }),
        document.getElementById("descHumidity").addEventListener("click", () => {
            let descTime = weatherService.weatherData.list.sort((a,b) => {if(a.main.humidity > b.main.humidity) return -1})
            uiService.sortHourlyTable(descTime)
        }),
        document.getElementById("ascWind").addEventListener("click", () => {
            let ascWind = weatherService.weatherData.list.sort((a,b) => {if(a.wind.speed < b.wind.speed) return -1})
            uiService.sortHourlyTable(ascWind)
        }),
        document.getElementById("descWind").addEventListener("click", () => {
            let descWind = weatherService.weatherData.list.sort((a,b) => {if(a.wind.speed > b.wind.speed) return -1})
            uiService.sortHourlyTable(descWind)
        })
    }
}

let weatherService = {
    apiKey: "6e6c8db0474b782f9e3f25b7ca738205",
    city: "skopje",
    apiUrl: "https://api.openweathermap.org/data/2.5/forecast",
    weatherData: [],
    getData: async () => {
        try{
            let result = await fetch(`${weatherService.apiUrl}?q=${weatherService.city}&units=metric&appid=${weatherService.apiKey}`)
            weatherService.weatherData = await result.json();
            console.log(weatherService.weatherData)
                uiService.toggleLoader(false)
                uiService.loadStatistics(weatherService.weatherData)
                uiService.loadHourlyTable(weatherService.weatherData)
                uiService.statisticsCity.innerHTML = weatherService.weatherData.city.name
                uiService.hdCity.innerHTML = weatherService.weatherData.city.name
        }
        catch (error) {
            console.log(error)
        }
    },
    aggregateStatistics: (data) => {
        let temperatureSum = 0;
        let highestTemperature = data.list[0]
        let lowestTemperature = data.list[0]
        let humiditySum = 0
        let highestHumidity = data.list[0]
        let lowestHumidity = data.list[0]

        for (let reading of data.list) {
            temperatureSum += reading.main.temp
            humiditySum += reading.main.humidity

            if (highestTemperature.main.temp < reading.main.temp) {
                highestTemperature = reading
            }

            if (highestTemperature.main.temp > reading.main.temp) {
                lowestTemperature = reading
            }

            if (highestHumidity.main.humidity < reading.main.humidity) {
                highestHumidity = reading
            }

            if (lowestHumidity.main.humidity > reading.main.humidity) {
                lowestHumidity = reading
            }
        }

        return {
            temperature: {
                highest: highestTemperature.main.temp,
                average: temperatureSum/data.list.length,
                lowest: lowestTemperature.main.temp
            },
            humidity: {
                highest: highestHumidity.main.humidity,
                average: humiditySum/data.list.length,
                lowest: lowestHumidity.main.humidity
            },
            warmentsTime: helperService.unixTimeStampToDate(highestTemperature.dt),
            coldestTime: helperService.unixTimeStampToDate(lowestTemperature.dt)
        }
    }
}

let uiService = {
    statisticResult: document.getElementById("statisticsResult"),
    tableResult: document.getElementById("tableResult"),
    hdCity: document.getElementById("hdCity"),
    statisticsCity: document.getElementById("statisticsCity"),
    loader: document.getElementById("loader"),
    loadStatistics: async (data) => {
        if(data.message === 0){
            let statisticsData =  await weatherService.aggregateStatistics(data)
            uiService.statisticResult.innerHTML = `
                <div class="mb-5">
                    <div class="row">
                        <div class="col-md-6">MAX TEMP: ${Math.round(statisticsData.temperature.highest)} 'C</div>
                        <div class="col-md-6">MAX HUMD: ${statisticsData.humidity.highest} %</div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">AVG TEMP: ${statisticsData.temperature.average.toFixed(1)} 'C</div>
                        <div class="col-md-6">AVG HUMD: ${statisticsData.humidity.average} %</div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">LOW TEMP: ${Math.round(statisticsData.temperature.lowest)} 'C</div>
                        <div class="col-md-6">LOW HUMD: ${statisticsData.humidity.lowest} %</div>
                    </div>
                </div>
                <h4>Warmest time of the following period: ${statisticsData.warmentsTime.toDateString()} </h4>
                <h4>Coldest time of the following period: ${statisticsData.coldestTime.toDateString()} </h4>
            `;
        }else {
            errorService.errorMessage(data)
        }
    },
    weatherList: 0,
    showItemsPerPage: 9,
    page: 1,
    pages: 0,
    loadHourlyTable: (data) => {
        this.pages = data.list.length / 10;
        if(data.message === 0 || data.message === ""){
            uiService.tableResult.innerHTML = ""
            for (let i = uiService.weatherList; i < uiService.showItemsPerPage; i++) {
                this.tableResult.innerHTML += `
                    <div class="row">
                        <div class="col-md-2">
                            <img src="http://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png" alt="weahter-icon">
                        </div>
                        <div class="col-md-2">${data.list[i].weather[0].description}</div>
                        <div class="col-md-2">${helperService.unixTimeStampToDate(data.list[i].dt).toDateString()}
                                            ${helperService.formatedTime(data.list[i].dt)}</div>
                        <div class="col-md-2">${Math.round(data.list[i].main.temp)} 'C (Feels Like ${Math.round(data.list[i].main.feels_like)} 'C)</div>
                        <div class="col-md-2">${data.list[i].main.humidity}%</div>
                        <div class="col-md-2">${data.list[i].wind.speed}m/s</div>
                    </div>
                `
            }
            this.tableResult.innerHTML += `
                    <nav aria-label="Page navigation example">
                        <ul class="pagination justify-content-center">
                            <li class="page-item">
                                <a id="previous" class="page-link" href="#">Previous</a>
                            </li>
                            <li class="page-item">
                                <a id="next" class="page-link" href="#">Next</a>
                            </li>
                        </ul>
                    </nav>
            `;
            document.getElementById("previous").style.display = "none";
            document.getElementById("previous").addEventListener("click", function(){
                uiService.weatherList = uiService.weatherList - 10;
                uiService.showItemsPerPage = uiService.showItemsPerPage -10;
                uiService.page--
                uiService.loadHourlyTable(data)
                if(uiService.page <= 1){
                    document.getElementById("previous").style.display = "none";
                }
                else{
                    document.getElementById("previous").style.display = "block"
                }
                if(uiService.page === Math.ceil(pages)){
                    document.getElementById("next").style.display = "none";
                }
                else{
                    document.getElementById("next").style.display = "block"
                }
            })
            document.getElementById("next").addEventListener("click", function(){
                uiService.weatherList = uiService.weatherList + 10;
                uiService.showItemsPerPage = uiService.showItemsPerPage + 10;
                uiService.page++
                uiService.loadHourlyTable(data)
                if(uiService.page <= 1){
                    document.getElementById("previous").style.display = "none";
                }
                else{
                    document.getElementById("previous").style.display = "block"
                }
                if(uiService.page === Math.ceil(pages)){
                    document.getElementById("next").style.display = "none";
                }
                else{
                    document.getElementById("next").style.display = "block"
                }
            })
        }else {
            errorService.errorMessage(data)
        }
    },
    sortHourlyTable: (data) => {
        this.pages = data.length / 10;
            uiService.tableResult.innerHTML = ""
            for (let i = uiService.weatherList; i < uiService.showItemsPerPage; i++) {
                this.tableResult.innerHTML += `
                    <div class="row">
                        <div class="col-md-2">
                            <img src="http://openweathermap.org/img/w/${data[i].weather[0].icon}.png" alt="weahter-icon">
                        </div>
                        <div class="col-md-2">${data[i].weather[0].description}</div>
                        <div class="col-md-2">${helperService.unixTimeStampToDate(data[i].dt).toDateString()}
                                            ${helperService.formatedTime(data[i].dt)}</div>
                        <div class="col-md-2">${Math.round(data[i].main.temp)} 'C (Feels Like ${Math.round(data[i].main.feels_like)} 'C)</div>
                        <div class="col-md-2">${data[i].main.humidity}%</div>
                        <div class="col-md-2">${data[i].wind.speed}m/s</div>
                    </div>
                `
            }
            this.tableResult.innerHTML += `
                    <nav aria-label="Page navigation example">
                        <ul class="pagination justify-content-center">
                            <li class="page-item">
                                <a id="previous" class="page-link" href="#">Previous</a>
                            </li>
                            <li class="page-item">
                                <a id="next" class="page-link" href="#">Next</a>
                            </li>
                        </ul>
                    </nav>
            `;
            document.getElementById("previous").style.display = "none";
            document.getElementById("previous").addEventListener("click", function(){
                uiService.weatherList = uiService.weatherList - 10;
                uiService.showItemsPerPage = uiService.showItemsPerPage -10;
                uiService.page--
                uiService.sortHourlyTable(data)
                if(uiService.page <= 1){
                    document.getElementById("previous").style.display = "none";
                }
                else{
                    document.getElementById("previous").style.display = "block"
                }
                if(uiService.page === Math.ceil(pages)){
                    document.getElementById("next").style.display = "none";
                }
                else{
                    document.getElementById("next").style.display = "block"
                }
            })
            document.getElementById("next").addEventListener("click", function(){
                uiService.weatherList = uiService.weatherList + 10;
                uiService.showItemsPerPage = uiService.showItemsPerPage + 10;
                uiService.page++
                uiService.sortHourlyTable(data)
                if(uiService.page <= 1){
                    document.getElementById("previous").style.display = "none";
                }
                else{
                    document.getElementById("previous").style.display = "block"
                }
                if(uiService.page === Math.ceil(pages)){
                    document.getElementById("next").style.display = "none";
                }
                else{
                    document.getElementById("next").style.display = "block"
                }
            })
    },

    toggleLoader: (toggle) => {
        if(toggle) uiService.loader.style.display = "block";
        else uiService.loader.style.display = "none";
    }
}

let helperService = {
    unixTimeStampToDate: (unixTimeStamp) => {
        return new Date(unixTimeStamp * 1000)
    },
    formatedTime: (time) => {
        newTime = new Date(time * 1000);
        let hours = newTime.getHours();
        let minutes = "0" + newTime.getMinutes();
        let formated = `${hours}:${minutes.substr(-2)}`;
        return formated;
    }
}

let errorService = {
    errorMessage: (error) => {
        uiService.statisticsCity.innerHTML = ""
        uiService.hdCity.innerHTML = ""
        uiService.statisticResult.innerHTML = `<h1>${error.cod} <span class"errorText">${error.message}</span> </h1>`
        uiService.tableResult.classList.remove("table")
        uiService.tableResult.innerHTML = `<h1>${error.cod} <span class"errorText">${error.message}</span> </h1>`
    },
    limitMessage: () => {
        uiService.statisticsCity.innerHTML = "";
        uiService.hdCity.innerHTML = "";
        uiService.statisticResult.innerHTML = `<h1>You reached limit API calls</h1>`;
        uiService.tableResult.classList.remove("table");
        uiService.tableResult.innerHTML = `<h1>You reached limit API calls</h1>`;
    }
}


navService.registerNavListeners()
//weatherService.getData()