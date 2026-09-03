<script setup lang="ts">
import { getCurrentInstance, onReady, ref } from 'wevu'
import { useRoute } from 'wevu/router'

const ready = ref(false)
const rendered = ref(false)
const layoutWrapperDetected = ref(false)
const instance = getCurrentInstance()
const route = useRoute()

function supportsSelectorQuery(value: unknown): value is {
  createSelectorQuery: () => WechatMiniprogram.SelectorQuery
} {
  return value !== null
    && typeof value === 'object'
    && 'createSelectorQuery' in value
    && typeof value.createSelectorQuery === 'function'
}

async function inspectRenderedState() {
  if (!supportsSelectorQuery(instance)) {
    return
  }

  await new Promise<void>((resolve) => {
    instance
      .createSelectorQuery()
      .select('.issue-380-custom-tab-bar')
      .boundingClientRect((rect: WechatMiniprogram.BoundingClientRectCallbackResult | null) => {
        rendered.value = Boolean(rect)
      })
      .select('.issue-380-default-layout')
      .boundingClientRect((rect: WechatMiniprogram.BoundingClientRectCallbackResult | null) => {
        layoutWrapperDetected.value = Boolean(rect)
      })
      .exec(() => resolve())
  })
}

async function _runE2E() {
  if (ready.value) {
    await inspectRenderedState()
  }
  return {
    ready: ready.value,
    rendered: rendered.value,
    layoutWrapperDetected: layoutWrapperDetected.value,
    route: {
      path: route.path,
      fullPath: route.fullPath,
      query: route.query,
      hash: route.hash,
    },
  }
}

onReady(() => {
  ready.value = true
})

defineExpose({
  _runE2E,
  ready,
  rendered,
  layoutWrapperDetected,
})
</script>

<template>
  <view class="issue-380-custom-tab-bar">
    <text>issue-380 custom tab bar</text>
  </view>
</template>
