<template>
  <div id="app">
    <transition name="opacity">
      <div class="loading-overlap" v-if="loading">
        <img src="./assets/logo.png" alt="Logo" class="loading-logo"></img>
      </div>
    </transition>
    <header :class="{ floating: !onTop }">
      <div class="header-content">
        <div class="header-inner">
          <transition name="opacity" mode="out-in">
            <div class="header-spanner" v-if="listing" key="listing-group">
              <selector name="发布者" :entries="users" v-model="fauthor" ref="author"></selector>
              <selector name="标签" :entries="tags" v-model="ftag" ref="tag"></selector>
              <i class="material-icons search-icon">search</i>
              <input class="search-input" v-model="search" placeholder="搜索" @keyup.esc="search = ''">
            </div>
            <div class="header-spanner" v-if="editing" key="editing-group">
              <router-link :to="{ name: 'Home' }" tag="i" class="material-icons btn">arrow_back</router-link>
              <i class="material-icons btn" @click="submit">done</i>
            </div>
            <div class="header-spanner" v-if="admin" key="admin-group">
              <router-link :to="{ name: 'Home' }" tag="i" class="material-icons btn">arrow_back</router-link>
            </div>
            <div class="header-spanner" v-if="viewing" key="viewing-group">
              <router-link :to="{ name: 'Home' }" tag="i" class="material-icons btn">arrow_back</router-link>
            </div>
          </transition>
          <transition name="opacity" mode="out-in">
            <i class="material-icons btn" @click="showLogin" v-if="!logged" key="login-btn">person</i>
            <div class="user-area" v-if="logged" key="user-area">
              <div class="user-name">{{ logged }}</div>
              <router-link tag="i" class="material-icons btn" :to="{ name: 'New' }">add</router-link>
              <router-link tag="i" class="material-icons btn" :to="{ name: 'Admin' }">settings</router-link>
              <i class="material-icons btn" @click="doLogout">close</i>
            </div>
          </transition>
        </div>
      </div>
    </header>
    <main>
      <transition name="opacity" mode="out-in">
        <keep-alive>
          <router-view :tags="rawTags" ref="view" @info="info"></router-view>
        </keep-alive>
      </transition>
    </main>
    <transition-group tag="div" class="infos" name="info">
      <div class="info" v-for="info of infos" :key="info.id" @click="offInfo(info.id)">{{ info.text }}</div>
    </transition-group>
    <modal ref="login">
      <div class="modal-title">
        登陆
      </div>
      <input v-model="user" placeholder="账户名" ref="userField" @keyup.enter.stop="focusPass" @keyup.esc="closeLogin">
      <input type="password" v-model="pass" placeholder="密码" ref="passField" @keyup.enter="doLogin" @keyup.esc="closeLogin">
      <div class="modal-hint">
        按<i class="material-icons">keyboard_return</i>确定
      </div>
    </modal>
  </div>
</template>

<script>
import Selector from './components/Selector';
import Modal from './components/Modal';
import Tag from './components/Tag';
import Author from './components/Author';

import superagent from 'superagent';

import config from './config';

let INFOID = 1;

const DEFAULT_ALL = {
  id: 'all',
  text: '全部',
  pinyin: ['quan', 'bu'],
  img: require('./assets/logo.png'),
};

export default {
  user: 'app',
  components: {
    Selector,
    Modal,
    Tag,
    Author,
  },
  data() {
    return {
      loading: true,
      onTop: true,
      search: '',

      listing: true,
      editing: false,
      admin: false,
      viewing: false,

      logged: null,
      isAdmin: false,

      infos: [],

      user: '',
      pass: '',

      users: [],
      tags: [],
      rawTags: [],

      ftag: 'all',
      fauthor: 'all',

      updateTimeout: null,
    };
  },
  created() {
    window.addEventListener('scroll', () => {
      this.onTop = window.scrollY === 0;
    });

    const metaReq = superagent
      .get(`${config.backend}/meta`)
      .withCredentials()
      .then(resp => {
        this.users = resp.body.users;
        this.users.splice(0, 0, DEFAULT_ALL);
        this.tags = resp.body.tags;
        this.rawTags = this.tags.map(i => i.text);
        this.tags.splice(0, 0, DEFAULT_ALL);

        this.parseRoute();
      });

    const restoreReq = superagent
      .get(`${config.backend}/auth`)
      .withCredentials()
      .then(resp => {
        if(resp.body.user) {
          this.logged = resp.body.user;
          this.isAdmin = resp.body.isAdmin;
        }
      })

    Promise.all([metaReq, restoreReq]).then(() => {
      this.loading = false
    }).catch(e => {
      console.error(e);
    });
  },

  watch: {
    $route() {
      this.parseRoute();
    },

    fauthor() {
      this.scheduleUpdate();
    },

    ftag() {
      this.scheduleUpdate();
    },

    search() {
      this.scheduleUpdate();
    },
  },

  methods: {
    showLogin() {
      this.user= '';
      this.pass = '';
      this.$refs.login.open();
      this.$nextTick(() => this.$refs.userField.focus());
    },

    closeLogin() {
      this.$refs.login.close();
    },

    focusPass() {
      this.$refs.passField.focus();
    },

    doLogin() {
      const user = this.user;

      superagent.post(`${config.backend}/auth`)
      .send({
        user: this.user,
        pass: this.pass,
      })
      .withCredentials()
      .then((resp) => {
        if(resp.body.success) {
          this.logged = this.user
          this.isAdmin = resp.body.isAdmin;
          this.info('登陆成功');
          this.$refs.login.close();
        } else {
          this.info('账户名或密码错误');
        }
      });
    },

    doLogout() {
      superagent.delete(`${config.backend}/auth`)
      .withCredentials()
      .then((resp) => {
        if(resp.body.success) {
          this.logged = null;
          this.isAdmin = false;
          this.info('登出成功');

          if(this.editing || this.admin)
            this.$router.push({ name: 'Home' });
        } else {
          this.info('未知错误');
        }
      });
    },

    submit() {
      const content = this.$refs.view.getContent();
      if(content.title === '') return this.info('你的标题呢？');
      if(content.content === '') return this.info('你不会想发一个空帖子吧？');

      superagent.post(`${config.backend}/post`)
        .withCredentials()
        .send(content)
        .then(resp => {
          if(!resp.body.success)
            return this.info('未知错误');

          this.info('已发表');
          this.$router.push({ name: 'Post', params: { id: resp.body.id.$oid }});
        })
    },

    info(str, delay=2000) {
      const nid = ++INFOID;
      this.infos.push({ text: str, id: nid });
      setTimeout(() => {
        this.offInfo(nid);
      }, delay);
    },

    offInfo(id) {
      const index = this.infos.findIndex(e => e.id === id);
      this.infos.splice(index, 1);
    },

    scheduleUpdate() {
      if(this.updateTimeout !== null)
        clearTimeout(this.updateTimeout);

      this.updateTimeout = setTimeout(() => {
        this.updateTimeout = null;

        if(this.$route.name !== 'List') return;

        let changed = false;
        if(this.$route.params.author !== this.fauthor) changed = true;
        if(this.$route.params.tag !== this.ftag) changed = true;
        if(this.$route.query.search !== this.search) changed = true;

        if(!changed) return;

        const query = {};
        if(this.search !== '') query.search = this.search;

        this.$router.push({ name: 'List', params: { author: this.fauthor, tag: this.ftag }, query });
      }, 200);
    },

    parseRoute() {
      this.listing = this.$route.name === 'List';
      this.editing = this.$route.name === 'Edit'
        || this.$route.name === 'New';
      this.admin = this.$route.name === 'Admin';
      this.viewing = this.$route.name === 'Post';

      if(this.listing)
        this.$nextTick(() => {
          if(this.$route.params.author)
            this.fauthor = this.$route.params.author;

          if(this.$route.params.tag)
            this.ftag = this.$route.params.tag;

          if(this.$route.query.search)
            this.search = this.$route.query.search;
        });
    },
  },
}
</script>

<style lang="scss">
@import './styles/shared';
@import './styles/const';

body {
  margin: 0;
  padding-top: 80px;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans CN', 'Microsoft YaHei', 'Wenquanyi Micro Hei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: rgba(0,0,0,.87);
}

.content {
  max-width: 800px;
  margin: 0 auto;
}

header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;

  height: 80px;

  display: flex;
  align-items: center;

  transition: box-shadow 0.2s, height 0.2s;
  background: rgba(255,255,255, 0.9);


  &.floating {
    height: 60px;
    box-shadow: rgba(0,0,0,.12) 0 4px 6px;
    z-index: 500;
  }

  .header-content {
    flex: 1;
    padding: 0 40px;

    .header-inner {
      display: flex;
      align-items: center;

      .header-spanner {
        flex: 1;
        display: flex;
        align-items: center;
      }
    }

    .selector {
      margin-right: 15px;
    }
  }
}

.search-icon {
  margin-right: 5px;
  display: inline-flex;
  align-items: center;
  opacity: 0.7;
}

.search-input {
  height: 60px;
  font-size: 16px;

  flex: 1;

  color: rgba(0,0,0,.87);
}

.loading-overlap {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3000;
  background: white;

  display: flex;
  align-items: center;
  justify-content: center;

  .loading-logo {
    width: 200px;
  }
}

.user-area {
  display: flex;

  .material-icons {
    margin-left: 5px;
  }

  .user-name {
    margin-right: 10px;
  }

  justify-content: center;
  align-items: center;

  font-weight: bold;
  color: rgba(0,0,0,.7);
}

.infos {
  position: fixed;

  z-index: 2000;

  bottom: 0;
  left: 0;
  right: 0;

  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  pointer-events: none;

  .info {
    width: 300px;
    background: rgba(255,255,255,0.9);
    padding: 20px;
    margin: 0 auto;
    color: rgba(0,0,0,.54);
    font-size: 14px;
    line-height: 24px;

    pointer-events: all;

    margin-top: 10px;

    cursor: pointer;

    border-radius: 2px;
    box-shadow: rgba(0,0,0,.12) 0 2px 3px;

    transition: opacity 0.2s, transform 0.2s;

    border-bottom: $theme-border 5px solid;
  }
}

.info-leave-active {
  position: absolute;
}

.info-enter, .info-leave-to {
  opacity: 0;
}
</style>
