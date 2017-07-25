<template>
  <div class="list">
    <div class="content">
      <div class="list-header">
        <transition name="opacity" mode="out-in">
          <div class="list-title" :key="title">
            {{ title }}
          </div>
        </transition>
        <div class="list-stat">
          共 {{ count }} 篇文章
        </div>
      </div>
      <div class="posts">
        <router-link v-for="post of posts" tag="div" class="post-entry" :to="{ name: 'Post', params: { id: post._id }}" :key="post._id">
          <div class="post-title">{{ post.title }}</div>
          <div class="post-preview">{{ post.no_format }}</div>
          <div class="post-status">
            <div class="spanner"></div>
            <i class="material-icons">edit</i>
            <div class="post-author">{{ post.author }}</div>
            <div class="blocker"></div>
            <i class="material-icons">access_time</i>
            <div class="post-date">{{ ts(post.timestamp) }}</div>
          </div>
        </router-link>
        <div class="load-more" @click="loadNext" v-if="posts.length < count">继续加载</div>
        <div class="no-more" v-if="posts.length >= count">无更多内容</div>
      </div>
    </div>
  </div>
</template>

<script>
import superagent from 'superagent'

import config from '../config'

export default {
  props: {
    author: String,
    tag: String,
    search: String,
  },

  data() {
    return {
      posts: [],

      urlbase: String,
      page: 1,
      count: 0,
      title: '',
    }
  },

  created() {
    this.reload();
  },

  methods: {
    ts(sec) {
      return new Date(sec * 1000).toLocaleString();
    },

    reload() {
      if(this.$route.name !== 'List') return;

      const originalBase = this.urlbase;

      this.urlbase = `${config.backend}/list/${this.$route.params.author}/${this.$route.params.tag}`;
      if(this.$route.query.search) this.urlbase += `/${this.$route.query.search}`;

      if(this.urlbase === originalBase) return;

      this.page = 1;

      if(this.$route.query.search)
        this.title = "搜索结果";
      else if(this.$route.params.tag !== 'all' && this.$route.params.author !== 'all')
        this.title = "过滤结果";
      else if(this.$route.params.author !== 'all')
        this.title = `来自 ${this.$route.params.author}`;
      else if(this.$route.params.tag !== 'all')
        this.title = `标签 ${this.$route.params.tag}`;
      else
        this.title = "全部";

      this.loadNext();
    },

    loadNext() {
      superagent
        .get(`${this.urlbase}/${this.page}`)
        .withCredentials()
        .then(resp => {
          if(this.page === 1)
            this.posts = resp.body.list;
          else
            this.posts.splice(this.posts.length, 0, ...resp.body.list);
          this.count = resp.body.count;
          ++this.page;
        });
    },
  },

  watch: {
    $route() {
      this.reload();
    }
  },
}
</script>

<style lang="scss">
@import '../styles/const';

.posts {
  .post-entry {
    margin: 20px 0;
    cursor: pointer;
    border-left: $theme-border 5px solid;
    padding: 10px 20px;

    transition: border .2s;

    &:hover {
      border-left: $theme-border 8px solid;
    }

    .post-title {
      font-weight: bold;
      font-size: 24px;
      margin-bottom: 10px;
      color: rgba(0,0,0,.7);
      transition: color .2s;
    }

    .post-preview {
      line-height: 20px;
      font-size: 16px;
      color: rgba(0,0,0,.54);
      text-overflow: ellipsis;
      margin-bottom: 10px;

      transition: color .2s;
    }

    .post-status {
      display: flex;
      align-items: center;

      color: rgba(0,0,0,.54);
      transition: color .2s;

      .material-icons {
        margin-right: 5px;
      }
    }

    &:hover {
      .post-title {
        color: $theme-text;
      }

      .post-status, .post-preview {
        color: rgba(0,0,0,.87);
      }
    }
  }
}

.load-more, .no-more {
  color: rgba(0,0,0,.3);
  padding: 20px 0;
  text-align: center;
}

.load-more {
  transition: color .2s;
  cursor: pointer;

  &:hover {
    color: rgba(0,0,0,.54);
  }
}

.list-header {
  margin: 20px 0;
  .list-title {
    font-weight: bold;
    font-size: 32px;
  }

  .list-stat {
    color: rgba(0,0,0,.54);
  }
}
</style>
