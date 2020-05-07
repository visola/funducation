const StateMachine = require('javascript-state-machine');

module.exports = new StateMachine({
  init: 'welcome',
  transitions: [
    {name: 'welcome', from: '*', to: '*'},
  ],
  methods: {
    onWelcome: require('./states/welcome'),
  },
});
