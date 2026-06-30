// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { useWaline, useLive2d } from '@davidingplus/vitepress-waline-live2d'
import { useRoute } from 'vitepress'
import './styles/index.css'

import BackToTopButton from '@davidingplus/vitepress-back-to-top-button'
import '@davidingplus/vitepress-back-to-top-button/style.css'

import ImageViewerP from '@davidingplus/vitepress-image-viewer'
import '@davidingplus/vitepress-image-viewer/style.css'

import VPSwiper from '@davidingplus/vitepress-swiper'
import '@davidingplus/vitepress-swiper/style.css'

import Bili from './components/Bili.vue'
import ContentWrapper from './components/ContentWrapper.vue'
import Layout from './components/Layout.vue'


export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp(ctx) {
    BackToTopButton(ctx.app)
    ImageViewerP(ctx.app)
    ctx.app.component('VPSwiper', VPSwiper)
    ctx.app.component('Bili', Bili)
    ctx.app.component('ContentWrapper', ContentWrapper)
  },
  setup() {
    // useWaline({
    //   serverURL: 'https://waline.davidingplus.cn',
    //   vitepressUseRoute: useRoute
    // })
    useLive2d({
      vitepressUseRoute: useRoute,
      enable: true,
      model: {
        url: 'https://cdn.davidingplus.cn/files/vscode-live2d-model-library/wanko/wanko.model.json'
      },
      display: {
        position: 'right',
        width: '135px',
        height: '300px',
        xOffset: '35px',
        yOffset: '5px'
      },
      mobile: {
        show: true
      },
      react: {
        opacity: 0.8
      }
    })
  }
} satisfies Theme
