import Vue from 'vue'
import Router from 'vue-router'
import AuthGuard from './auth-guard'

import Home from '@/components/Home'
import Login from '@/components/Auth/Login'
import Registration from '@/components/Auth/Registration'
import User from '@/components/User/User'
import Single from '@/components/Cards/Single'
import NewCard from '@/components/Cards/NewCard'
import Edit from '@/components/Cards/Edit'
import Settings from '@/components/User/Settings'
import Visit from '@/components/User/Visit'
import Auth from '@/components/Auth/Auth'


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
		},
		{
			path: '/card/:id',
			props: true,
			name: 'card',
			component: Single
		},
		{
			path: '/new',
			props: true,
			name: 'new',
			component: NewCard,
			beforeEnter: AuthGuard 
		},
		{
			path: '/edit/:id',
			props: true,
			name: 'edit',
			component: Edit,
			beforeEnter: AuthGuard 
		},
		{
			path: '/login',
			name: 'login',
			component: Login
		},
		{
			path: '/auth',
			name: 'auth',
			component: Auth
		},
		{
			path: '/registration',
			name: 'registration',
			component: Registration
		},
		{
			path: '/user/:id',
			props: true,
			name: 'user',
			component: User,
		},
		{
			path: '/settings',
			name: 'settings',
			component: Settings,
			beforeEnter: AuthGuard 
		},
		{
			path: '/visit',
			name: 'visit',
			component: Visit
		},
		{
			path: '*',
			redirect: '/'
		}
	],
	mode: 'history',
	saveScrollPosition: true,
	// scrollBehavior (to, from, savedPosition) {
	scrollBehavior(to, from, savedPosition) {
		// console.log('scrollBehavior() [to.path]', to, from, savedPosition)

		if (savedPosition) {
			return savedPosition
		} else if (to.hash) {
			return { selector: to.hash }
		}

		return {
			x: 0,
			y: 0
		}
		
		// if(to.path != '/') {
		// 	return {
		// 		x: 0,
		// 		y: 0
		// 	}
		// }
	}
})
