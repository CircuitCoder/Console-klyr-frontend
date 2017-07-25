<template>
  <div class="selector">
    <div class="selector-handle" @click="toggle">
      <transition name="opacity"><img v-if="item" :src="item.img" :key="item.id"></img></transition><div
        class="material-icons" :class="{ reverse: active }">arrow_drop_down</div>
    </div>
    <transition name="selector">
      <div class="selector-body" v-show="active" ref="body">
        <input class="selector-filter" v-model="filter" :placeholder="name" ref="search" @keyup.enter="selectFirst">
        <div class="selector-entries">
          <div class="selector-entry" v-for="entry of filtered" id="entry.id" :class="{ selected: entry.id === selected }" @click="select(entry.id)">
            <img class="selector-entry-img" :src="entry.img" alt="icon"></img><div class="selector-entry-text">{{ entry.text }}</div>
          </div>
          <div class="selector-empty" v-if="filtered.length === 0">
            无匹配选项
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { matchPinyin } from '../util';

const DEFAULT_ALL = {
  id: 'all',
  text: '全部',
  pinyin: ['quan', 'bu'],
  img: require('../assets/logo.png'),
};

export default {
  name: 'selector',
  props: {
    source: String,
    name: String,
    entries: {
      type: Array,
      default: [ DEFAULT_ALL ]
    },

    selected: {
      type: String,
      default: 'all',
    },
  },

  model: {
    prop: 'selected',
    event: 'input'
  },

  data() {
    return {
      active: false,
      filter: '',
    };
  },

  created() {
    window.addEventListener('click', this.reset);
  },

  beforeDestory() {
    window.removeEventListener('click', this.reset);
  },

  methods: {
    reset(e) {
      for(let el of e.path) {
        if(el === this.$el) return;
      }

      this.active = false;
    },

    toggle() {
      if(this.active) this.active = false;
      else this.open();
    },

    open() {
      this.active = true;
      this.filter = '';

      this.$nextTick(() => this.$refs.search.focus());
    },

    select(id) {
      if(this.selected !== id) {
        this.active = false;
        this.$emit('input', id);
      }
    },

    selectFirst() {
      if(this.filtered.length === 0) return;
      this.select(this.filtered[0].id);
    },
  },

  computed: {
    filtered() {
      if(this.filter === '') return this.entries;
      else return this.entries.filter(e => matchPinyin(this.filter, e.pinyin, e.text));
    },

    item() {
      return this.entries.find(e => e.id === this.selected);
    },
  }
}
</script>

<style lang="scss">
@import '../styles/const';

.selector {
  display: inline-block;
  display: relative;
}

.selector-handle {
  height: 60px;
  background: transparent;

  font-weight: bold;

  display: flex;
  align-items: center;

  color: rgba(0,0,0,.7);
  transition: color 0.2s;

  &:hover {
    color: rgba(0,0,0,.87);
  }

  > img {
    height: 30px;
  }

  > .material-icons {
    transition: transform 0.2s;

    &.reverse {
      transform: rotate(180deg);
    }
  }

  cursor: pointer;
}

.selector-body {
  position: absolute;
  width: 200px;
  border-radius: 0 0 4px 4px;
  box-shadow: rgba(0,0,0,.12) 0 2px 3px;
  background: rgba(255,255,255,0.9);

  border-top: $theme-border 3px solid;
}

.selector-entries {
  height: 200px;
  border-top: rgba(0,0,0,.06) 1px solid;
  overflow-y: scroll;

  backdrop-filter: blur(2px);
}

.selector-filter {
  padding: 10px;
  line-height: 20px;
  font-size: 14px;
}

.selector-entry {
  height: 60px;
  box-sizing: border-box;

  transition: color 0.2s, background 0.2s;

  background: rgba(0,0,0,0);
  color: rgba(0,0,0,.7);

  cursor: pointer;

  &:hover {
    background: rgba(0,0,0,.02);
    color: rgba(0,0,0,.87);
  }

  &.selected {
    color: $theme-text;
    font-weight: bold;
  }

  .selector-entry-img {
    height: 30px;
    margin: 15px;
    margin-right: 10px;
  }

  .selector-entry-text {
    height: 60px;
    line-height: 60px;
    font-size: 16px;

    display: inline-block;
    vertical-align: top;
  }
}

.selector-empty {
  font-size: 12px;
  height: 100%;

  display: flex;

  align-items: center;
  justify-content: center;

  color: rgba(0,0,0,.3);
}

.selector-enter-active, .selector-leave-active {
  transition: transform 0.2s, opacity 0.2s;
}

.selector-enter, .selector-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
