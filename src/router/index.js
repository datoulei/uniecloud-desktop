import Vue from 'vue';
import Router from 'vue-router';
import BasicLayout from '@/layout/BasicLayout';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: '/dashboard',
      component: BasicLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/components/Activity/ActivityList')
        },
        {
          path: 'activity/:id',
          name: 'activityDetail',
          component: () => import('@/components/Activity/ActivityDetail')
        },
        {
          path: 'activity/:activityId/site/:siteId/attendeeList',
          name: 'activityDetail-attendeeList',
          component: () => import('@/components/Activity/AttendeeList')
        },
        {
          path: 'activity/:activityId/addAttendee',
          name: 'activityDetail-addAttendee',
          component: () => import('@/components/Activity/AddAttendee')
        },
        {
          path: 'activity/:activityId/viewAttendee/:id',
          name: 'activityDetail-viewAttendee',
          component: () => import('@/components/Activity/viewAttendee')
        },
        {
          path: 'activity/:activityId/editAttendee',
          name: 'activityDetail-editAttendee',
          component: () => import('@/components/Activity/EditAttendee')
        },
        {
          path: 'setting',
          name: 'setting',
          component: () => import('@/components/Activity/Setting')
        },
        {
          path: 'cardDesign/:activityId',
          name: 'cardDesign',
          component: () => import('@/components/CardDesign')
        },
        {
          path: 'cardList/:activityId',
          name: 'cardDesign-cardList',
          component: () => import('@/components/CardDesign/CardList')
        },
        {
          path: 'screenList/:activityId',
          name: 'cardDesign-screenList',
          component: () => import('@/components/CardDesign/ScreenList')
        },
        {
          path: 'addCard',
          name: 'cardDesign-addCard',
          component: () => import('@/components/CardDesign/AddCard')
        },
        {
          path: 'addScreen',
          name: 'cardDesign-addScreen',
          component: () => import('@/components/CardDesign/AddScreen')
        },
        {
          path: 'direction',
          name: 'cardDesign-direction',
          component: () => import('@/components/CardDesign/Direction')
        },
        {
          path: 'activity/:id/hotelDesign',
          name: 'hotel',
          component: () => import('@/components/Activity/hotelDesign')
        },
        {
          path: 'hotel/:id/room',
          name: 'hotel-room',
          component: () => import('@/components/Activity/Room')
        },
        {
          path: 'hotel/:id/viewroom',
          name: 'hotel-view-room',
          component: () => import('@/components/Activity/ViewRoom')
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/view/LoginPage')
    },
    {
      path: '/extra',
      name: 'extra',
      component: () => import('@/view/ExtraScreen')
    },
    {
      path: '/print',
      name: 'print',
      component: () => import('@/view/Print')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
});

router.beforeEach((to, from, next) => {
  console.log("to", to)
  const token = Vue.db.has('token').value();
  if (token) {
    next()
  } else if (to.name !== 'login') {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router;
