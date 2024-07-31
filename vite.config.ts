import { resolve } from 'path'
import { loadEnv } from 'vite'
import type { UserConfig, ConfigEnv } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import progress from 'vite-plugin-progress'
import EslintPlugin from 'vite-plugin-eslint'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import { viteMockServe } from 'vite-plugin-mock'
import PurgeIcons from 'vite-plugin-purge-icons'
import ServerUrlCopy from 'vite-plugin-url-copy'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { createStyleImportPlugin, ElementPlusResolve } from 'vite-plugin-style-import'
import UnoCSS from 'unocss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
// https://vitejs.dev/config/
const root = process.cwd()


import * as fs from 'fs';
import * as https from 'https';
const { readFileSync } = fs;

const options = {
  key: readFileSync('./server.key'), // 私钥路径
  cert: readFileSync('./server.crt'), // 证书路径
  // 这里可以添加其他SSL/TLS相关的配置，例如ciphers等
  ciphers: 'TLS_AES_128_GCM_SHA256:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_256_GCM_SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA:kEDH+AESGCM:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK:!SRP:!CAMELLIA',
  secureProtocol: 'TLSv1_2_method', // 或者 'TLS_method' 以支持TLS 1.2及更高版本
};


function pathResolve(dir: string) {
  return resolve(root, '.', dir)
}

export default ({ command, mode }: ConfigEnv): UserConfig => {
  let env = {} as any
  const isBuild = command === 'build'
  if (!isBuild) {
    env = loadEnv(process.argv[3] === '--mode' ? process.argv[4] : process.argv[3], root)
  } else {
    env = loadEnv(mode, root)
  }
  return {
    base: env.VITE_BASE_PATH,
    plugins: [
      Vue({
        script: {
          // 开启defineModel
          defineModel: true
        }
      }),
      VueJsx(),
      ServerUrlCopy(),
      progress(),
      env.VITE_USE_ALL_ELEMENT_PLUS_STYLE === 'false'
        ? createStyleImportPlugin({
            resolves: [ElementPlusResolve()],
            libs: [
              {
                libraryName: 'element-plus',
                esModule: true,
                resolveStyle: (name) => {
                  if (name === 'click-outside') {
                    return ''
                  }
                  return `element-plus/es/components/${name.replace(/^el-/, '')}/style/css`
                }
              }
            ]
          })
        : undefined,
      EslintPlugin({
        cache: false,
        include: ['src/**/*.vue', 'src/**/*.ts', 'src/**/*.tsx'] // 检查的文件
      }),
      VueI18nPlugin({
        runtimeOnly: true,
        compositionOnly: true,
        include: [resolve(__dirname, 'src/locales/**')]
      }),
      createSvgIconsPlugin({
        iconDirs: [pathResolve('src/assets/svgs')],
        symbolId: 'icon-[dir]-[name]',
        svgoOptions: true
      }),
      PurgeIcons(),
      env.VITE_USE_MOCK === 'true'
        ? viteMockServe({
            ignore: /^\_/,
            mockPath: 'mock',
            localEnabled: !isBuild,
            prodEnabled: isBuild,
            injectCode: `
          import { setupProdMockServer } from '../mock/_createProductionServer'

          setupProdMockServer()
          `
          })
        : undefined,
      ViteEjsPlugin({
        title: env.VITE_APP_TITLE
      }),
      UnoCSS()
    ],

    css: {
      preprocessorOptions: {
        less: {
          additionalData: '@import "./src/styles/variables.module.less";',
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.less', '.css'],
      alias: [
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.cjs.js'
        },
        {
          find: /\@\//,
          replacement: `${pathResolve('src')}/`
        }
      ]
    },
    esbuild: {
      pure: env.VITE_DROP_CONSOLE === 'true' ? ['console.log'] : undefined,
      drop: env.VITE_DROP_DEBUGGER === 'true' ? ['debugger'] : undefined
    },
    build: {
      target: 'es2015',
      outDir: env.VITE_OUT_DIR || 'dist',
      sourcemap: env.VITE_SOURCEMAP === 'true',
      // brotliSize: false,
      rollupOptions: {
        plugins: env.VITE_USE_BUNDLE_ANALYZER === 'true' ? [visualizer()] : undefined,
        // 拆包
        output: {
          manualChunks: {
            'vue-chunks': ['vue', 'vue-router', 'pinia', 'vue-i18n'],
            'element-plus': ['element-plus'],
            'wang-editor': ['@wangeditor/editor', '@wangeditor/editor-for-vue'],
            echarts: ['echarts', 'echarts-wordcloud']
          }
        }
      },
      cssCodeSplit: !(env.VITE_USE_CSS_SPLIT === 'false'),
      cssTarget: ['chrome31']
    },
    server: {
      port: 8080,
      //https: options,
      proxy: {
        // 选项写法
        '/yushandevops': {
          target: 'http://192.168.31.105:8088',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/yushandevops/, '')
        }
      },
      hmr: {
        overlay: false
      },
      host: '0.0.0.0'
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'vue-types',
        'element-plus/es/locale/lang/zh-cn',
        'element-plus/es/locale/lang/en',
        '@iconify/iconify',
        '@vueuse/core',
        'axios',
        'qs',
        'echarts',
        'echarts-wordcloud',
        'qrcode',
        '@wangeditor/editor',
        '@wangeditor/editor-for-vue',
        'vue-json-pretty',
        '@zxcvbn-ts/core',
        'dayjs',
        'cropperjs'
      ]
    }
  }
}
