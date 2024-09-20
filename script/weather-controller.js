import { createSvgLine, createSvgPolygon, createSvgCircle, createSvgText } from "./svg.js";
import Controller from "./controller.js";

// constants
const OPEN_WEATHER_APP_KEY = "65d8e433543028fb83bd8709bebfad8f";
const OPEN_WEATHER_APP_ORIGIN = "https://api.openweathermap.org";


/**
 * The Weather application controller type.
 */
class WeatherController extends Controller {
	constructor () {
		super();

		// register event listeners
		this.queryButton.addEventListener("click", event => this.processWeatherForecast());
	}


	// get/set accessors
	//TODO
	get locationSection () { return this.center.querySelector("section.location"); 

	}
	get overviewSection () { return this.center.querySelector("section.weather-overview"); 

	}
	get detailsSection () { return this.center.querySelector("section.weather-details"); 

	}
	get locationCityInput () { return this.locationSection.querySelector("input.city"); 

	}
	get locationCountryInput () { return this.locationSection.querySelector("input.country"); 

	}
	get overviewDayTableBody () { return this.overviewSection.querySelector("table>tbody"); 

	}
	get queryButton() { return this.locationSection.querySelector("button.query"); 

	}
	get messageOutput() { return document.querySelector("footer>input.message");
	}

	// Getters for computed properties used in the forecast
	get minTemperature() {
		return dayThreeHourForecasts => dayThreeHourForecasts.reduce((accu, element) => Math.min(accu, element.main.temp_min), Infinity) - 273.15;
	}
	get maxTemperature() {
		return dayThreeHourForecasts => dayThreeHourForecasts.reduce((accu, element) => Math.max(accu, element.main.temp_max), 0) - 273.15;
	}
	get totalRain() {
		return dayThreeHourForecasts => dayThreeHourForecasts.reduce((accu, element) => accu + (element.rain ? element.rain["3h"] : 0), 0);
	}
	get averageHumidity() {
		return dayThreeHourForecasts => dayThreeHourForecasts.reduce((accu, element) => accu + element.main.humidity, 0) / dayThreeHourForecasts.length;
	}
	get averagePressure() {
		return dayThreeHourForecasts => dayThreeHourForecasts.reduce((accu, element) => accu + element.main.pressure, 0) / dayThreeHourForecasts.length;
	}
	get minVisibility() {
		return dayThreeHourForecasts => dayThreeHourForecasts.reduce((accu, element) => Math.min(accu, element.visibility), Infinity);
	}
	get maxVisibility() {
		return dayThreeHourForecasts => dayThreeHourForecasts.reduce((accu, element) => Math.max(accu, element.visibility), 0);
	}
	getDateText(threeHourForecast) {
		return threeHourForecast
			? threeHourForecast.dt_txt.substring(0, threeHourForecast.dt_txt.indexOf(' '))
			: null;
	}
	getTemperature(minTemperature, maxTemperature) {
		return `${Math.round(minTemperature)}°C - ${Math.round(maxTemperature)}°C`;
	}
	getRain(rain) {
		return `${Math.round(rain)} l/m²`;
	}
	getHumidity(humidity) {
		return `${Math.round(humidity)}%`;
	}
	getPressure(pressure) {
		return `${Math.round(pressure)} hPa`;
	}
	getVisibility(minVisibility, maxVisibility) {
		return `${Math.round(minVisibility)} - ${Math.round(maxVisibility)}`;
	}
	get lowerBoundTemperature() {
        return (dayThreeHourForecasts) => 
            Math.floor(dayThreeHourForecasts.reduce((accu, element) => Math.min(accu, element.main.temp_min), Infinity) - 273.15);
    }
    get upperBoundTemperature() {
        return (dayThreeHourForecasts) => 
            Math.ceil(dayThreeHourForecasts.reduce((accu, element) => Math.max(accu, element.main.temp_max), 0) - 273.15);
    }
    get degreePixels() {
        return (dayThreeHourForecasts) => {
            const lowerBoundTemperature = this.lowerBoundTemperature(dayThreeHourForecasts);
            const upperBoundTemperature = this.upperBoundTemperature(dayThreeHourForecasts);
            return 100 / (upperBoundTemperature - lowerBoundTemperature);
        };
    }
    get timePixels() {
        return (dayThreeHourForecasts) => 300 / Math.max(1, dayThreeHourForecasts.length - 1);
    }


	/**
	 * Handles querying a location and the associated weather forecast.
	 */
	async processWeatherForecast () {
		this.messageOutput.classList.remove("success", "failure");

		try {
			const city = this.locationCityInput.value.trim() || null;
			const countryCode = this.locationCountryInput.value.trim() || null;

			const location = await this.#invokeQueryLocation(city, null, countryCode);
			// console.log(location);

			const weatherForecast = await this.#invokeQueryWeatherForecast(location.lat, location.lon);
			console.log(weatherForecast);

			if (!this.overviewSection) {
				const overviewSectionTemplate = document.querySelector("head>template.weather-overview");
				this.center.append(overviewSectionTemplate.content.firstElementChild.cloneNode(true));
			}

			const tableRowTemplate = document.querySelector("head>template.weather-overview-row");
			this.overviewDayTableBody.innerHTML = "";

			// collects daily forecast data, and adds a new table row whenever the
			// day changes; aggregates the row data from the available 3-hour forecasts;
			// adds a null element as signal element
			const dayForecast = { dateText: null, list: [] };
			weatherForecast.list.push(null);		

			for (const threeHourForecast of weatherForecast.list) {
				const dateText = this.getDateText(threeHourForecast);
				// console.log(dateText);

				if (dayForecast.dateText !== dateText) {
					if (dayForecast.dateText !== null) {
						const tableRow = tableRowTemplate.content.firstElementChild.cloneNode(true);
						this.overviewDayTableBody.append(tableRow);

						const dayThreeHourForecasts = dayForecast.list;
						const date = new Date(dayThreeHourForecasts[0].dt * 1000);

						const dateButton = tableRow.querySelector("td.date>button");
						dateButton.innerText = date.toLocaleDateString();
						dateButton.addEventListener("click", event => this.processDayWeatherForecast(weatherForecast.city, date, dayThreeHourForecasts));
						tableRow.querySelector("td.temperature").innerText = this.getTemperature;
						tableRow.querySelector("td.rain").innerText = this.getRain;
						tableRow.querySelector("td.humidity").innerText = this.getHumidity;
						tableRow.querySelector("td.pressure").innerText =this.getPressure;
						tableRow.querySelector("td.visibility").innerText = this.getVisibility;
					}

					dayForecast.dateText = dateText;
					dayForecast.list = [];
				}

				dayForecast.list.push(threeHourForecast);
			}

			this.messageOutput.value = "ok";
			this.messageOutput.classList.add("success");
		} catch (error) {
			this.messageOutput.value = error.message;
			this.messageOutput.classList.add("failure");
		}
	}


	/**
	 * Displays a detailed daily weather forecast.
	 * @param city the city
	 * @param date the start timestamp of the day
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async processDayWeatherForecast (city, date, threeHourForecasts) {
		this.messageOutput.classList.remove("success", "failure");

		try {
			console.log(threeHourForecasts);
			
			this.overviewSection.classList.add("hidden");
			this.locationSection.classList.add("hidden");

			const detailsSectionTemplate = document.querySelector("head>template.weather-details");
			this.center.append( detailsSectionTemplate.content.firstElementChild.cloneNode(true));

			this.detailsSection.querySelector("div.main output.date").value = date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
			this.detailsSection.querySelector("div.main input.city").value = city.name;
			this.detailsSection.querySelector("div.main input.country").value = city.country;
			this.detailsSection.querySelector("div.control>button.back").addEventListener("click", event => this.processBack());
			this.detailsSection.querySelector("div.control>button.toggle.water").addEventListener("click", event => this.detailsSection.querySelector("div.water>table").classList.toggle("hidden"));
			this.detailsSection.querySelector("div.control>button.toggle.pressure").addEventListener("click", event => this.detailsSection.querySelector("div.pressure>table").classList.toggle("hidden"));

			this.displayDayTemperatureForecast(threeHourForecasts);
			this.displayDayWindSpeedForecast(threeHourForecasts);
			this.displayDayWaterForecast(threeHourForecasts);
			this.displayDayPressureForecast(threeHourForecasts);

			this.messageOutput.value = "ok";
			this.messageOutput.classList.add("success");
		} catch (error) {
			this.messageOutput.value = error.message;
			this.messageOutput.classList.add("failure");
		}
	}


	/**
	 * Removes the details section, and re-displays the location and overview sections.
	 */
	async processBack () {
		this.messageOutput.classList.remove("success", "failure");

		try {
			this.detailsSection.remove();
			this.overviewSection.classList.remove("hidden");
			this.locationSection.classList.remove("hidden");

			this.messageOutput.value = "ok";
			this.messageOutput.classList.add("success");
		} catch (error) {
			this.messageOutput.value = error.message;
			this.messageOutput.classList.add("failure");
		}
	}


	/**
	 * Displays a detailed daily temperature forecast.
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async displayDayTemperatureForecast (threeHourForecasts) {
		const graph = this.detailsSection.querySelector("span.temp>svg");

		const lowerBoundTemperature = this.lowerBoundTemperature;
		const upperBoundTemperature = this.upperBoundTemperature;
		const degreePixels = 100 / (upperBoundTemperature - lowerBoundTemperature);
		const timePixels = 300 / Math.max(1, threeHourForecasts.length - 1);

		const coordinatesGroup = graph.querySelector("g.coordinates");
		for (let temperature = lowerBoundTemperature; temperature <= upperBoundTemperature; ++temperature) {
			const y = Math.round(120 - (temperature - lowerBoundTemperature) * degreePixels);
			if (temperature != upperBoundTemperature) coordinatesGroup.append(createSvgLine(15, y, 20, y));
			if (temperature % 2 === 0) coordinatesGroup.append(createSvgText(5, y + 3, 0, temperature));
		}

		const delimiterPosition = threeHourForecasts[0].dt_txt.indexOf(" ");
		for (let timeSlot = 0; timeSlot < threeHourForecasts.length; ++timeSlot) {
			const x = Math.round(20 + timeSlot * timePixels);
			const timeText = threeHourForecasts[timeSlot].dt_txt.substring(delimiterPosition + 1, delimiterPosition + 6);
			if (timeSlot === 0 || timeSlot !== threeHourForecasts.length - 1) coordinatesGroup.append(createSvgLine(x, 125, x, 120));
			coordinatesGroup.append(createSvgText(x - 10, 135, 0, timeText));
		}

		const temperatureCoordinates = [];
		for (let timeSlot = 0; timeSlot < threeHourForecasts.length; ++timeSlot) {
			temperatureCoordinates.push(Math.round(20 + timeSlot * timePixels));
			temperatureCoordinates.push(Math.round(120 - (threeHourForecasts[timeSlot].main.temp - 273.15 - lowerBoundTemperature) * degreePixels));
		}

		const temperatureRangeCoordinates = [];
		for (let timeSlot = 0; timeSlot < threeHourForecasts.length; ++timeSlot) {
			temperatureRangeCoordinates.push(Math.round(20 + timeSlot * timePixels));
			temperatureRangeCoordinates.push(Math.round(120 - (threeHourForecasts[timeSlot].main.temp_max - 273.15 - lowerBoundTemperature) * degreePixels));
		}
		for (let timeSlot = threeHourForecasts.length - 1; timeSlot >= 0; --timeSlot) {
			temperatureRangeCoordinates.push(Math.round(20 + timeSlot * timePixels));
			temperatureRangeCoordinates.push(Math.round(120 - (threeHourForecasts[timeSlot].main.temp_min - 273.15 - lowerBoundTemperature) * degreePixels));
		}

		const temperatureRangeGroup = graph.querySelector("g.temp-range");
		temperatureRangeGroup.append(createSvgPolygon(...temperatureRangeCoordinates));

		const temperatureGroup = graph.querySelector("g.temp");
		for (let index = 2; index < temperatureCoordinates.length; index += 2)
			temperatureGroup.append(createSvgLine(temperatureCoordinates[index - 2], temperatureCoordinates[index - 1], temperatureCoordinates[index], temperatureCoordinates[index + 1]));
		for (let index = 0; index < temperatureCoordinates.length; index += 2)
			temperatureGroup.append(createSvgCircle(temperatureCoordinates[index], temperatureCoordinates[index + 1], 2));
	}


	/**
	 * Displays a detailed daily wind speed forecast.
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async displayDayWindSpeedForecast (threeHourForecasts) {
		const graph = this.detailsSection.querySelector("span.wind>svg");

		const upperBoundWindSpeed = Math.ceil(threeHourForecasts.reduce((accu, element) => Math.max(accu, element.wind.gust), 0) * 3.6);
		const degreePixels = 100 / upperBoundWindSpeed;
		const timePixels = 300 / Math.max(1, threeHourForecasts.length - 1);

		const coordinatesGroup = graph.querySelector("g.coordinates");
		for (let windSpeed = 0; windSpeed <= upperBoundWindSpeed; windSpeed += 10) {
			const y = Math.round(120 - windSpeed * degreePixels);
			if (windSpeed != upperBoundWindSpeed) coordinatesGroup.append(createSvgLine(15, y, 20, y));
			coordinatesGroup.append(createSvgText(5, y + 3, 0, windSpeed));
		}

		const delimiterPosition = threeHourForecasts[0].dt_txt.indexOf(" ");
		for (let timeSlot = 0; timeSlot < threeHourForecasts.length; ++timeSlot) {
			const x = Math.round(20 + timeSlot * timePixels);
			const timeText = threeHourForecasts[timeSlot].dt_txt.substring(delimiterPosition + 1, delimiterPosition + 6);
			if (timeSlot === 0 || timeSlot !== threeHourForecasts.length - 1) coordinatesGroup.append(createSvgLine(x, 125, x, 120));
			coordinatesGroup.append(createSvgText(x - 10, 135, 0, timeText));
		}

		const windSpeedCoordinates = [];
		for (let timeSlot = 0; timeSlot < threeHourForecasts.length; ++timeSlot) {
			windSpeedCoordinates.push(Math.round(20 + timeSlot * timePixels));
			windSpeedCoordinates.push(Math.round(120 - threeHourForecasts[timeSlot].wind.speed * 3.6 * degreePixels));
		}

		const gustSpeedRangeCoordinates = [];
		for (let timeSlot = 0; timeSlot < threeHourForecasts.length; ++timeSlot) {
			gustSpeedRangeCoordinates.push(Math.round(20 + timeSlot * timePixels));
			gustSpeedRangeCoordinates.push(Math.round(120 - Math.max(threeHourForecasts[timeSlot].wind.speed, threeHourForecasts[timeSlot].wind.gust) * 3.6 * degreePixels));
		}
		for (let timeSlot = threeHourForecasts.length - 1; timeSlot >= 0; --timeSlot) {
			gustSpeedRangeCoordinates.push(Math.round(20 + timeSlot * timePixels));
			gustSpeedRangeCoordinates.push(Math.round(120 - Math.min(threeHourForecasts[timeSlot].wind.speed, threeHourForecasts[timeSlot].wind.gust) * 3.6 * degreePixels));
		}

		const gustRangeGroup = graph.querySelector("g.gust-range");
		gustRangeGroup.append(createSvgPolygon(...gustSpeedRangeCoordinates));

		const windGroup = graph.querySelector("g.wind");
		for (let index = 2; index < windSpeedCoordinates.length; index += 2)
			windGroup.append(createSvgLine(windSpeedCoordinates[index - 2], windSpeedCoordinates[index - 1], windSpeedCoordinates[index], windSpeedCoordinates[index + 1]));
		for (let index = 0; index < windSpeedCoordinates.length; index += 2)
			windGroup.append(createSvgCircle(windSpeedCoordinates[index], windSpeedCoordinates[index + 1], 2));
	}


	/**
	 * Displays a detailed daily water related forecast.
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async displayDayWaterForecast (threeHourForecasts) {
		const tableRowTemplate = document.querySelector("head>template.weather-details-water-row");
		const tableBody = this.detailsSection.querySelector("div.water>table>tbody");
		tableBody.innerHTML = "";

		const delimiterPosition = threeHourForecasts[0].dt_txt.indexOf(" ");
		for (const threeHourForecast of threeHourForecasts) {
			const timeText = threeHourForecast.dt_txt.substring(delimiterPosition + 1, delimiterPosition + 6);

			const tableRow = tableRowTemplate.content.firstElementChild.cloneNode(true);
			tableBody.append(tableRow);

			tableRow.querySelector("td.time").innerText = threeHourForecast.dt_txt.substring(delimiterPosition + 1, delimiterPosition + 6);
			tableRow.querySelector("td.rain").innerText = (threeHourForecast.rain ? threeHourForecast.rain["3h"] : 0).toString();
			tableRow.querySelector("td.humidity").innerText = threeHourForecast.main.humidity + "%";
			tableRow.querySelector("td.cloudiness").innerText = threeHourForecast.clouds.all + "%";
			tableRow.querySelector("td.visibility").innerText = threeHourForecast.visibility.toString();
		}
	}


	/**
	 * Displays a detailed daily pressure related forecast.
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async displayDayPressureForecast (threeHourForecasts) {
		const tableRowTemplate = document.querySelector("head>template.weather-details-pressure-row");
		const tableBody = this.detailsSection.querySelector("div.pressure>table>tbody");
		tableBody.innerHTML = "";

		const delimiterPosition = threeHourForecasts[0].dt_txt.indexOf(" ");
		for (const threeHourForecast of threeHourForecasts) {
			const timeText = threeHourForecast.dt_txt.substring(delimiterPosition + 1, delimiterPosition + 6);

			const tableRow = tableRowTemplate.content.firstElementChild.cloneNode(true);
			tableBody.append(tableRow);

			tableRow.querySelector("td.time").innerText = threeHourForecast.dt_txt.substring(delimiterPosition + 1, delimiterPosition + 6);
			tableRow.querySelector("td.pressure.main").innerText = threeHourForecast.main.pressure + " hPa";
			tableRow.querySelector("td.pressure.sea").innerText = threeHourForecast.main.sea_level + " hPa";
			tableRow.querySelector("td.pressure.ground").innerText = threeHourForecast.main.grnd_level + " hPa";
		}
	}


	/**
	 * Invokes the location query web-service operation.
	 * @param city the city
	 * @param stateCode the state code
	 * @param countryCode the country code
	 * @return the (optional) location, or null for none
	 */
	async #invokeQueryLocation (city, stateCode, countryCode) {
		const queryFactory = new URLSearchParams();
		queryFactory.set("appid", OPEN_WEATHER_APP_KEY);
		queryFactory.set("limit", 1);
		queryFactory.set("q", (city || "") + "," + (stateCode || "") + "," + (countryCode || ""));

		const resource = OPEN_WEATHER_APP_ORIGIN + "/geo/1.0/direct?" + queryFactory.toString();
		const headers = { "Accept": "application/json" };
		const response = await fetch(resource, { method: "GET", headers: headers, credentials: "omit" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		const locations = await response.json();

		return locations.length === 0 ? null : locations[0];
	}


	/**
	 * Invokes the 5-day weather forecast query web-service operation.
	 * @param latitude the latitude within range [-90°, +90°]
	 * @param longitude the longitude within range ]-180°, +180°]
	 * @return the 5-day weather forecast
	 */
	async #invokeQueryWeatherForecast (latitude, longitude) {
		const queryFactory = new URLSearchParams();
		queryFactory.set("appid", OPEN_WEATHER_APP_KEY);
		queryFactory.set("lat", latitude);
		queryFactory.set("lon", longitude);

		const resource = OPEN_WEATHER_APP_ORIGIN + "/data/2.5/forecast?" + queryFactory.toString();
		const headers = { "Accept": "application/json" };
		const response = await fetch(resource, { method: "GET", headers: headers, credentials: "omit" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return response.json();
	}
}


/**
 * Register a listener for the window's "load" event.
 */
window.addEventListener("load", event => {
	const controller = new WeatherController();
	console.log(controller);
});
