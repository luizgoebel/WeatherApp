$(function () {
    //apikey
    //8lGB6AJMfbwrEDocKWWcS4VZ2bpGFl6g
    // {
    //     "Version": 1,
    //     "Key": "28143",
    //     "Type": "City",
    //     "Rank": 10,
    //     "LocalizedName": "Dhaka",
    //     "EnglishName": "Dhaka",
    //     "PrimaryPostalCode": "",
    //     "Region": {
    //       "ID": "ASI",
    //       "LocalizedName": "Asia",
    //       "EnglishName": "Asia"
    //     },
    //url
    // curl -X GET "http://dataservice.accuweather.com/currentconditions/v1/28143?apikey=8lGB6AJMfbwrEDocKWWcS4VZ2bpGFl6g&language=pt-br"
    // *** APIs ***
    // clima, previsão 12 horas e previsão 5 dias: https://developer.accuweather.com/apis
    // pegar coordenadas geográficas pelo nome da cidade: https://docs.mapbox.com/api/
    // pegar coordenadas do IP: http://www.geoplugin.net
    // gerar gráficos em JS: https://www.highcharts.com/demo
    //-22.740385, -43.024463
    //"https://developer.accuweather.com/sites/default/files/37-s.png"
    //"http://dataservice.accuweather.com/forecasts/v1/daily/5day/2734239?apikey=8lGB6AJMfbwrEDocKWWcS4VZ2bpGFl6g&language=pt-br"
//
//

    var accuweatherAPIKey = "8lGB6AJMfbwrEDocKWWcS4VZ2bpGFl6g";
    var weatherObject = {
        cidade: "",
        estado: "",
        pais: "",
        temperatura: "",
        texto_clima: "",
        icone_clima: "",
    };

    function gerarGrafico(horas, temperaturas) {
        // Data retrieved https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature
        Highcharts.chart('hourly_chart', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Temperatura hora a hora'
            },
            xAxis: {
                categories: horas
            },
            yAxis: {
                title: {
                    text: 'Temperatura (°C)'
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: false
                    },
                    enableMouseTracking: false
                }
            },
            series: [{
                showInLegend: false,
                data: temperaturas
            }]
        });

    }

    function pegarPrevisaoHoraAHora(localCode, ) {
        //"http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/2734239?apikey=8lGB6AJMfbwrEDocKWWcS4VZ2bpGFl6g&language=pt-br&metric=true"
        $.ajax({
            type: "GET",
            url: "http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/" + localCode + "?apikey=" + accuweatherAPIKey + "&language=pt-br&metric=true",
            dataType: "json",
            success: function (data) {
                console.log(data);
                var horarios = [];
                var temperaturas = [];

                for (var a = 0; a < data.length; a++) {
                    var hora = new Date(data[a].DateTime).getHours();
                    horarios.push(String(hora) + "h");
                    temperaturas.push(data[a].Temperature.Value);
                    
                    gerarGrafico(horarios, temperaturas);
                }
            },
            error: function () {
                console.log('erro na requisição.')
            }
        });
    }

    function preencherClimaAgora(cidade, estado, pais, temperatura, texto_clima, icone_clima) {
        var texto_local = cidade + ", " + estado + ". " + pais;
        $("#texto_local").text(texto_local);
        $("#texto_clima").text(texto_clima);
        $("#texto_temperatura").html(String(temperatura + '&deg;'));
        $("#icone_clima").css("background-image", "url('" + weatherObject.icone_clima + "')");
    }

    function preencherPrevisao5Dias(previsoes) {
        $("#info_5dias").html("");
        var diasSemana = ["Domingo", "Segunda", "Terça-feita", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

        for (var index = 0; index < previsoes.length; index++) {
            data_hoje = new Date(previsoes[index].Date)
            var dia_semana = diasSemana[data_hoje.getDay()];

            var iconNumber = previsoes[index].Day.Icon <= 9 ? "0" + String(previsoes[index].Day.Icon) : String(previsoes[index].Day.Icon);
            icone_clima = "https://developer.accuweather.com/sites/default/files/" + iconNumber + "-s.png";
            maxima = previsoes[index].Temperature.Maximum.Value;
            minima = previsoes[index].Temperature.Minimum.Value;

            elementoHTMLDia = '<div class="day col">';
            elementoHTMLDia += '<div class="day_inner">';
            elementoHTMLDia += '<div class="dayname">';
            elementoHTMLDia += dia_semana;
            elementoHTMLDia += '</div>';
            elementoHTMLDia += '<div style="background-image: url(' + icone_clima + ')" class="daily_weather_icon"></div>';
            elementoHTMLDia += '<div class="max_min_temp">';
            elementoHTMLDia += String(minima) + '&deg; / ' + String(maxima) + '&deg;';
            elementoHTMLDia += '</div>';
            elementoHTMLDia += '</div>';
            elementoHTMLDia += '</div>';

            $("#info_5dias").append(elementoHTMLDia);
        }
    }

    function pegarPrevisao5Dias(localCode) {
        $.ajax({
            type: "GET",
            url: "http://dataservice.accuweather.com/forecasts/v1/daily/5day/" + localCode + "?apikey=" + accuweatherAPIKey + "&language=pt-br&metric=true",
            dataType: "json",
            success: function (data) {
                $("#texto_max_min").html(String(data.DailyForecasts[0].Temperature.Minimum.Value) + "&deg; /" + String(data.DailyForecasts[0].Temperature.Maximum.Value) + "&deg;");

                preencherPrevisao5Dias(data.DailyForecasts);
            },
            error: function () {
                console.log('erro na requisição.')
            }
        });
    }

    function pegarTempoAtual(localCode) {
        $.ajax({
            type: "GET",
            url: "http://dataservice.accuweather.com/currentconditions/v1/" + localCode + "?apikey=" + accuweatherAPIKey + "&language=pt-br",
            dataType: "json",
            success: function (data) {
                weatherObject.temperatura = data[0].Temperature.Metric.Value;
                weatherObject.texto_clima = data[0].WeatherText;
                var iconNumber = data[0].WeatherIcon <= 9 ? "0" + String(data[0].WeatherIcon) : String(data[0].WeatherIcon);
                weatherObject.icone_clima = "https://developer.accuweather.com/sites/default/files/" + iconNumber + "-s.png";

                preencherClimaAgora(weatherObject.cidade, weatherObject.estado, weatherObject.pais, weatherObject.temperatura, weatherObject.texto_clima, weatherObject.icone_clima);
            },
            error: function () {
                console.log('erro na requisição.')
            }
        });
    }

    function pegarLocalUsuario(lat, long) {
        $.ajax({
            type: "GET",
            url: "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + accuweatherAPIKey + "&q=" + lat + "%2C" + long + "&language=pt-br",
            dataType: "json",
            success: function (data) {
                try {
                    weatherObject.cidade = data.ParentCity.LocalizedName;
                } catch {
                    weatherObject.cidade = data.LocalizedName;
                }

                weatherObject.estado = data.AdministrativeArea.LocalizedName;
                weatherObject.pais = data.Country.LocalizedName;

                var localCode = data.Key;
                pegarTempoAtual(localCode);
                pegarPrevisao5Dias(localCode);
                pegarPrevisaoHoraAHora(localCode);
            },
            error: function () {
                console.log('erro na requisição.')
            }
        });
    }

    function pegarCoordenadasDoIP() {
        var lat_padrao = -22.740385;
        var long_padrao = -43.024463;

        $.ajax({
            type: "GET",
            url: "http://www.geoplugin.net/json.gp",
            dataType: "json",
            success: function (data) {
                if (data.geoplugin_latitude && data.geoplugin_longitude) {
                    pegarLocalUsuario(data.geoplugin_latitude, data.geoplugin_longitude);
                } else {
                    pegarLocalUsuario(lat_padrao, long_padrao);
                }
            },
            error: function () {
                console.log('erro na requisição.')
                pegarLocalUsuario(lat_padrao, long_padrao);
            }
        });
    }

    pegarCoordenadasDoIP();



















});