import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './styles/main.css'
import { loadIconManifest } from './lib/store'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('./pages/HomePage.vue') },
    { path: '/production', component: () => import('./pages/SectionPage.vue'), props: { section: 'production' } },
    { path: '/power', component: () => import('./pages/SectionPage.vue'), props: { section: 'kinetic' } },
    { path: '/electricity', component: () => import('./pages/SectionPage.vue'), props: { section: 'electric' } },
    { path: '/build/:id', component: () => import('./pages/BuildPage.vue'), props: true },
    { path: '/shopping', component: () => import('./pages/ShoppingPage.vue') },
    { path: '/items', component: () => import('./pages/ItemsPage.vue') },
    { path: '/rules', component: () => import('./pages/RulesPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

loadIconManifest()
createApp(App).use(router).mount('#app')
