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
      this.set('errorMessage', '');
      this.set('piecharts', false);
      const city = this.get('city');
      var apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + city;
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
            'Authorization': 'Token 91769eaee6281a836ce218415d151634e275b4f1'
          }
        }).then((data) => {
          var authority = data.response[0].name;
          this.set('responseMessage', `Thank you! You are located in ${city}`);
          this.set('authorityMessage', `an the name of the balancing autority is: ${authority}`);
          var ba = data.response[0].abbrev;
          var that = this;
          ajax.raw({
            url: `https://api.watttime.org/api/v1/datapoints/?ba=${ba}&page=3&page_size=12`,
            type: 'get'
          }).then((more) => {
            var resArray = more.response.results;
            that.send('displayCharts', resArray);
          }).catch(function(error){
            that.set('errorMessage', `No data. Try another authority (for example: san francisco) or wait a bit, there maybe too many requests to the API`);
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
      this.set('piecharts', true); 
      var that = this;
      args.map(function(ele){
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