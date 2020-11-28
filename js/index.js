const clock = {
  data: () => ({
    title: "Время в",
//     cities: [
//       {
//         name: "Лондон",
//         offset: 0,
//         img: "./img/London.svg",
//       },
      {
        name: "Москва",
        offset: +3,
        img: "./img/Moscow.svg",
      },
      {
        name: "Нью-Йорк",
        offset: -5,
        img: "./img/New_York.svg",
      },
    ],
    time: 0,
    country: {
      name: "Москва",
      offset: +3,
      img: "./img/Moscow.svg",
    },
    hours: 0,
    minutes: 0,
    seconds: 0,
    message: "",
    error: "",
    localTime: 0,
    serverTime: 0,
  }),
  template: `
      <div class="content">
        <h1> {{ title}} {{ country.name | ending }}</h1>
        <div v-if="info" class="message-box" :class="error ? 'error' : 'info'"> {{ info }} </div>
        <img :src="country.img" alt=""/>
        <p>{{ hours }} : {{ minutes }} : {{ seconds }} </p>
        <div class="actions">
          <button
            v-for="city of cities"
            :key="city.name"
            :disabled="country.offset === city.offset"
            @click="country = city">
            {{city.name}}
          </button>
        </div>

      </div>
      `,
  mounted() {
    this.getTime();
    this._timer = setTimeout(this.updateDateTime, 1000);
  },

  beforeDestroy() {
    if (this._timer) window.clearTimeout(this._timer);
    if (this._msg_timer) window.clearTimeout(this._msgtimer);
    if (this._update_timer) window.clearTimeout(this._update_timer);
  },

  filters: {
    ending: function (value) {
      if (!value) return "";
      return value.endsWith("а")
        ? value.substring(0, value.length - 1) + "е"
        : value + "е";
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },

  computed: {
    info() {
      return this.error || this.message;
    },
    updateOfset() {
      return this.country.offset * 3600000; // Смещение от UTC выбранного города * на кол. миллисекунд. в часе
    },
  },

  methods: {
    getTime() {
      const url = "https://worldtimeapi.org/api/timezone/etc/UTC";
      this.time = new Date().getTime();
      this.message = "Получение точного времени с сервера!";
      fetch(url, { mode: "cors" })
        .then((response) =>
          response.ok
            ? response.json()
            : Promise.reject(`Статус: ${response.status}`)
        )
        .then((data) => {
          this.serverTime = new Date(data.utc_datetime).getTime();
          this.localTime = new Date().getTime();
          this.error = "";
          this.message = "Время успешно установленно с сервера!";
          this._msg_timer = setTimeout(() => (this.message = ""), 3000);
        })
        .catch((error) => {
          this.message = "";
          this.error = `Ошибка сервера, время не синхронизированно! ${error}`;
          this.serverTime = this.serverTime = new Date().getTime();
          this._update_timer = setTimeout(this.getTime, 2000);
        });
    },

    updateDateTime() {
      this.time =
        new Date().getTime() +
        this.updateOfset -
        (this.localTime - this.serverTime);
      this.hours = ("0" + new Date(this.time).getUTCHours()).slice(-2);
      this.minutes = ("0" + new Date(this.time).getUTCMinutes()).slice(-2);
      this.seconds = ("0" + new Date(this.time).getUTCSeconds()).slice(-2);
      this._timer = setTimeout(this.updateDateTime, 1000);
    },
  },
};

new Vue({
  components: { clock },
}).$mount("#app");
