import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('about');
  this.route('whales', function(){
    this.route('charts');
  });
  this.route('admin', function() {
    this.route('invitations');
  });
});

export default Router;
