//this is the controller
import Ember from 'ember';
var ajax = require('ic-ajax');
import defaultTheme from '../themes/default-theme';

export default Ember.Controller.extend({

  headerMessage: 'Hello There!',
  responseMessage: '',
  authorityMessage: '',
  errorMessage: '',
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
        var lon = res.response.results[0].geometry.location.lng;
        var lat = res.response.results[0].geometry.location.lat;

        var coorUrl = `https://api.watttime.org/api/v1/balancing_authorities/?loc={"type":"Point","coordinates":[${lon},${lat}]}`;
        ajax.raw({
          url: coorUrl,
          type: 'get',
          headers: {
            'Authorization': 'Token 902faab6d04cd6f4dd7cbca4acce9e28de92ea20'
          }
        }).then((data) => {
          var authority = data.response[0].name;

          this.set('responseMessage', `Thank you! This is the city you entered: ${city}`);
          this.set('authorityMessage', `The name of your Balancing Autority is: ${authority}`);
          var ba = data.response[0].abbrev;
          ajax.raw({
            url: `https://api.watttime.org/api/v1/datapoints/?ba=${ba}&page=3&page_size=12`,
            type: 'get'
          }).then((more) => {
            console.log("THIS IS THE RESULT AFTER API CALL", more.response);
            /*if(more.response.results.length === 0){
              this.set('authorityMessage', `${authority} does not have any data to provide. try another authority (for exmaple: san francisco`);
            }
            */
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
  theme : defaultTheme
});