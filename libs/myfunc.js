module.exports.timer = async function timer(times, cb) {
  await new Promise((res) => {
    setTimeout(() => {
      const h = (`0${new Date().getHours()}`).slice(-2);
      const m = (`0${new Date().getMinutes()}`).slice(-2);
      const s = (`0${new Date().getSeconds()}`).slice(-2);

      if (times.indexOf(`${h}:${m}:${s}`) !== -1) {
        cb();
      }

      res();
    }, 1000);
  });

  timer(times, cb);
};

module.exports.delay = function delay(time) {
  return new Promise((res) => {
    setTimeout(() => res(), time);
  });
};
