Page({
  data: {
    customTabBarProbe: null,
  },
  probeCustomTabBar() {
    const tabBar = this.getTabBar()
    this.setData({
      customTabBarProbe: {
        exists: Boolean(tabBar),
        label: tabBar?.data.label ?? null,
        ready: tabBar?.data.ready ?? null,
      },
    })
  },
})
