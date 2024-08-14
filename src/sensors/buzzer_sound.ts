export const buzzerSound = {
  context: null,
  default_freq: 200,
  channels: {},
  muted: {},

  getContext: function() {
    if(!this.context) {
      // @ts-ignore
      this.context = ('AudioContext' in window) || ('webkitAudioContext' in window) ? new(window.AudioContext || window.webkitAudioContext)() : null;
    }
    return this.context;
  },

  startOscillator: function(freq) {
    var o = this.context.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    o.connect(this.context.destination);
    o.start();
    return o;
  },


  start: function(channel, freq=this.default_freq) {
    if(!this.channels[channel]) {
      this.channels[channel] = {
        muted: false
      }
    }
    if(this.channels[channel].freq === freq) {
      return;
    }
    var context = this.getContext();
    if(!context) {
      return;
    }
    this.stop(channel);

    if (freq == 0 || this.channels[channel].muted) {
      return;
    }

    this.channels[channel].oscillator = this.startOscillator(freq);
    this.channels[channel].freq = freq;
  },

  stop: function(channel) {
    if(this.channels[channel]) {
      this.channels[channel].oscillator && this.channels[channel].oscillator.stop();
      delete this.channels[channel].oscillator;
      delete this.channels[channel].freq;
    }
  },

  mute: function(channel) {
    if(!this.channels[channel]) {
      this.channels[channel] = {
        muted: true
      }
      return;
    }
    this.channels[channel].muted = true;
    this.channels[channel].oscillator && this.channels[channel].oscillator.stop();
    delete this.channels[channel].oscillator;
  },

  unmute: function(channel) {
    if(!this.channels[channel]) {
      this.channels[channel] = {
        muted: false
      }
      return;
    }
    this.channels[channel].muted = false;
    if(this.channels[channel].freq) {
      this.channels[channel].oscillator = this.startOscillator(this.channels[channel].freq);
    }
  },

  isMuted: function(channel) {
    if(this.channels[channel]) {
      return this.channels[channel].muted;
    }
    return false;
  },

  stopAll: function() {
    for(var channel in this.channels) {
      if(this.channels.hasOwnProperty(channel)) {
        this.stop(channel);
      }
    }
  }
}
