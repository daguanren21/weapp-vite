Component({
  data: {
    label: 'custom tab bar mounted',
    ready: false,
  },
  lifetimes: {
    ready() {
      this.setData({ ready: true })
    },
  },
})
