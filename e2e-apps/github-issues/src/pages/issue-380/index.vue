<script setup lang="ts">
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function hasRuntimeProbe(value: unknown): value is {
  _runE2E: () => unknown
} {
  return isRecord(value) && typeof value._runE2E === 'function'
}

async function _runE2E() {
  const currentPages = getCurrentPages()
  const currentPage = currentPages[currentPages.length - 1]
  const tabBar = currentPage?.getTabBar?.()
  const tabBarData = isRecord(tabBar) && isRecord(tabBar.data) ? tabBar.data : {}
  const tabBarRuntime = hasRuntimeProbe(tabBar)
    ? await tabBar._runE2E()
    : {
        ready: tabBarData.ready ?? null,
        rendered: tabBarData.rendered ?? null,
        layoutWrapperDetected: tabBarData.layoutWrapperDetected ?? null,
      }

  return {
    hasTabBar: Boolean(tabBar),
    tabBarRuntime,
  }
}

defineExpose({
  _runE2E,
})
</script>

<template>
  <view class="issue-380-page">
    <text>issue-380 page</text>
  </view>
</template>
