//this is the controller
import Ember from 'ember';
var ajax = require('ic-ajax');
import defaultTheme from '../themes/default-theme';

export default Ember.Controller.extend({

  headerMessage: 'Hello There!',
  responseMessage: '',
  authorityMessage: '',
  piecharts: false,
  model: [],
  
  isValid: Ember.computed.match('city', /^.+@.+\..+$/),
  actions: {
    getData() {
      const city = this.get('city');
      var apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + city;
      //console.log(apiUrl);
      ajax.raw({
        url: apiUrl,
        type: 'get'
      }).then((res) => {
        //console.log(res.response.results[0].geometry.location)
        var lon = res.response.results[0].geometry.location.lng;
        var lat = res.response.results[0].geometry.location.lat;

        var coorUrl = `https://api.watttime.org/api/v1/balancing_authorities/?loc={"type":"Point","coordinates":[${lon},${lat}]}`;
        //var coorUrl = 'https://api.watttime.org/api/v1/balancing_authorities/?loc={"type":"Point","coordinates":[-121.478851,38.575764]}' ;
        //console.log(coorUrl);
        ajax.raw({
          url: coorUrl,
          type: 'get',
          headers: {
            'Authorization': 'Token 5ab6d6cf862c59b8143f7db22cac3dbf9e8fd2c8'
          }
        }).then((data) => {
          //console.log("THIS IS THE RESULTS ", data.response[0].name);
          var authority = data.response[0].name;

          this.set('responseMessage', `Thank you! This is the city you entered: ${city}`);
          this.set('authorityMessage', `The name of your Balancing Autority is: ${authority}`);
          var ba = data.response[0].abbrev;
          ajax.raw({
            url: `https://api.watttime.org/api/v1/datapoints/?ba=${ba}&page=3&page_size=12`,
            type: 'get'
          }).then((more) => {
            var that = this;
            var resArray = more.response.results;
            that.send('displayCharts', resArray);
          });
        });
      });
    },
    displayCharts: function(args) {
      var model = [
      {
        name: 'Other',
        data: []
      },
      {
        name: 'Solar',
        data: []
      },
      {
        name: 'Wind',
        data: []
      },
      {
        name: 'Renewable',
        data: []
      }
    ]
      this.set('piecharts', true); var genmixArr = args.genmix;
      var that = this;
      console.log("THIS IS THE ARGS", args);
      var fuelTypeArr =  args.map(function(ele){
         ele.genmix.map(function(item){
          if (item.fuel === 'other'){
            model[0].data.push(item.gen_MW);
          }
          if (item.fuel === 'solar'){
            model[1].data.push(item.gen_MW);
          }
          if (item.fuel === 'wind'){
            model[2].data.push(item.gen_MW);
          }
          if (item.fuel === 'renewable'){
            model[3].data.push(item.gen_MW);
          }
        });
      });
      this.set('model', model);
    }
  },
  chartOptions: {
      chart: {
        type: 'line'
      },
      title: {
        text: 'Average Generation Mix'
      },
      subtitle: {
        text: 'Source: WattTime API'
      },
      xAxis: {
        tile : {
          text: 'Time'
        }
      },
      yAxis: {
        title: {
          text: 'Megawatts (MW)'
        }
      },
      tooltip: {
        valueSuffix: 'MW'
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
      }
    },
  model : this.model,
  // model: [
  //     {
  //       name: 'Other',
  //       data: [14139.84,16244,18740.13,21266.34,22508.87,22186.69,20890.84,19569.3,18881.47,18444.52,27091.53,27041.87]
  //     },
  //     {
  //       name: 'Solar',
  //       data: [0,0,0,0,0.48,413.25,2479.44,4315.52,5259.71,5098.91,6033,5988]
  //     },
  //     {
  //       name: 'Wind',
  //       data: [2808.22,2842.81,2789.98,2702.09,2636.84,2472.83,2357.49,2191.19,1753.81,1462.36,1711,1646]
  //     },
  //     {
  //       name: 'Renewable',
  //       data: [2808.22,2842.81,2789.98,2702.09,2636.84,2472.83,2357.49,2191.19,1753.81,1462.36,1711,1646]
  //     },
  //     {
  //       name: 'Nuclear',
  //       data: [2808.22,2842.81,2789.98,2702.09,2636.84,2472.83,2357.49,2191.19,1753.81,1462.36,1711,1646]
  //     }
  //   ], 
  theme : defaultTheme
});