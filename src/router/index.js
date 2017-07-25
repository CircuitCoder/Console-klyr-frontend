import Vue from 'vue'
import Router from 'vue-router'
import List from '@/components/List'
import Admin from '@/components/Admin'
import Editor from '@/components/Editor'
import Post from '@/components/Post'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
    },
    {
      path: '/new',
      name: 'New',
      component: Editor,
    },
    {
      path: '/:id',
      name: 'Post',
      component: Post,
    },
    {
      path: '/:author/:tag',
      name: 'List',
      component: List 
    },
    {
      path: '/',
      name: 'Home',
      redirect: '/all/all'
      // TODO: home
    },
  ]
})
