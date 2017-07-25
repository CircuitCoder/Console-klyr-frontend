<template>
  <div class="content">
    <div class="title">
      {{ title }}
    </div>
    <div class="status">
      <i class="material-icons">edit</i>
      <author :author="author"></author>
    </div>
    <div class="status">
      <i class="material-icons">access_time</i>
      <div class="date">{{ ts(timestamp) }}</div>
    </div>
    <div class="tags" v-if="tags.length > 0">
      <i class="material-icons">label_outline</i>
      <tag v-for="tag of tags" :tag="tag" :key="tag"></tag>
    </div>
    <div class="content" v-html="formatted"></div>
  </div>
</template>

<script>
import superagent from 'superagent';
import markdownIt from 'markdown-it';

import Tag from './Tag';
import Author from './Author';

const md = markdownIt('commonmark');

import config from '../config';

export default {
  components: { Tag, Author },
  data() {
    return {
      title: '',
      tags: [],
      author: null,
      timestamp: 0,
      content: '',
    };
  },

  created() {
    this.reload();
  },

  methods: {
    ts(sec) {
      return new Date(sec * 1000).toLocaleString();
    },

    reload() {
      if(this.$route.name !== 'Post') return;

      superagent.get(`${config.backend}/post/${this.$route.params.id}`)
        .withCredentials()
        .then(resp => {
          this.title = resp.body.title;
          this.timestamp = resp.body.timestamp;
          this.tags = resp.body.tags;
          this.content = resp.body.content;
          this.author = resp.body.author;
        });
    },
  },

  computed: {
    formatted() {
      return md.render(this.content);
    },
  },

  watch: {
    $route() {
      this.reload();
    }
  }
}
</script>

<style lang="scss">
.title {
  margin: 20px 0 10px 0;
  font-size: 32px;
  font-weight: bold;
}

.content {
  color: rgba(0,0,0,.87);
}

.status {
  display: flex;
  align-items: center;
  color: rgba(0,0,0,0.3);

  margin-top: 5px;

  .material-icons {
    margin-right: 5px;
  }
}

.tags {
  margin-top: 5px;
  display: flex;
  .material-icons {
    margin-right: 5px;
    color: rgba(0,0,0,.3);
  }
}
</style>
