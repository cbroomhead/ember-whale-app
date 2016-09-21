import Ember from 'ember';

App.ApplicationController = Ember.Controller.extend({
  
  // Used for horizontal bar chart, vertical bar chart, and pie chart
  content: [
	{
		"label": "Equity",
		"value": 12935781.176999997
	},
	{
		"label": "Real Assets",
		"value": 10475849.276172025
	},
	{
		"label": "Fixed Income",
		"value": 8231078.16438347
	},
	{
		"label": "Cash & Cash Equivalent",
		"value": 5403418.115000006
	},
	{
		"label": "Hedge Fund",
		"value": 1621341.246006786
	},
	{
		"label": "Private Equity",
		"value": 1574677.59
	}
  ]
});