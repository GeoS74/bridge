module.exports.timer = async (times, cb) => {
  await this.delay(1000);

  const h = (`0${new Date().getHours()}`).slice(-2);
  const m = (`0${new Date().getMinutes()}`).slice(-2);
  const s = (`0${new Date().getSeconds()}`).slice(-2);

  if (times.indexOf(`${h}:${m}:${s}`) !== -1) {
    cb();
  }

  this.timer(times, cb);
};

module.exports.delay = (time) => new Promise((res) => {
  setTimeout(() => res(), time);
});
