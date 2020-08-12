import Vue from 'vue';
import db from '../../db';
import offlinedb from '../../offlinedb';

const state = {
  info: null,
  activityId: 0, // 活动ID
  siteId: 0, // 签到地点ID

  windowWidth: 1000, // 窗口宽
  windowHeight: 670, // 窗口高
  siteInfo: {}, //签到点信息

  signStatus: -1, // 签到状态（-1,0,1）

  siteNames: [] // 签到点名字数组
};

const getters = {
  UserInfo: (state) => state.info
};

const mutations = {
  SET_USER_INFO(state, info) {
    state.info = info;
  },
  SET_ACTIVITY_ID(state, activityId) {
    state.activityId = activityId;
  },
  SET_SITE_ID(state, siteId) {
    state.siteId = siteId;
  },
  SET_WINDOW_WIDTH(state, windowWidth) {
    state.windowWidth = windowWidth;
  },
  SET_WINDOW_HEIGHT(state, windowHeight) {
    state.windowHeight = windowHeight;
  },
  SET_SITE_INFO(state, siteInfo) {
    state.siteInfo = siteInfo;
  },

  SET_SIGN_STATUS(state, signStatus) {
    state.signStatus = signStatus;
  },

  SET_SITE_NAMES(state, siteNames) {
    state.siteNames = siteNames;
  }
};

const actions = {
  async GetUserInfo({ commit }) {
    try {
      // 离线处理 ----  start ---
      const type = await db.get('useType').value();
      if (type === 2) {
        const userinfo = await offlinedb.getDB('user').get('userInfo').value();
        commit('SET_USER_INFO', userinfo);
        return;
      }
      // 离线处理 --- end ----

      const UserInfo = await Vue.http.get('/users/me');
      commit('SET_USER_INFO', UserInfo);
    } catch (error) {
      console.log('CTL GetUserInfo throw Exception:', error);
    }
  },

  // 获取扩展窗口模板信息
  async getExtraScreenData({ commit }, activityId) {
    try {
      const url = `/activities/${activityId}/cards`;
      return await Vue.http.get(url, {
        params: {
          type: 1
        }
      });
    } catch (error) {
      return [];
    }
  }
};

export default {
  state,
  getters,
  mutations,
  actions
};
