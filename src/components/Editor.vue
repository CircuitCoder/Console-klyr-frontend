<template>
  <div class="editor">
    <input v-model="title" placeholder="标题..." class="title-input">
    <div class="editor-tags">
      <i class="material-icons">label_outline</i>
      <div class="editor-tag-list">
        <div class="editor-tag" v-for="tag of tags" :class="{ selected: selected[tag] }" @click="toggle(tag)">{{ tag }}</div>
      </div>
    </div>
    <textarea ref="editor" placeholder="内容..."></textarea>
  </div>
</template>

<script>
const mirrorMark = window.mirrorMark;

export default {
  name: 'editor',
  props: {
    tags: Array,
  },

  data() {
    return {
      title: '',
      tagset: [],

      editor: null,
    }
  },

  mounted() {
    this.editor = mirrorMark(this.$refs.editor, { showToolbar: true });
    this.editor.render();
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.title = '';
      vm.tagset = [];
      if(vm.editor)
        vm.editor.cm.setValue('');
    });
  },

  methods: {
    setContent(cont) {
      this.title = cont.title;
      this.editor.cm.setValue(cont.value);
      this.tagset = cont.tags;
    },

    getContent() {
      const content = this.editor.cm.getValue();
      return { title: this.title, content, tags: this.tagset };
    },

    toggle(tag) {
      const pid = this.tagset.findIndex(t => t === tag);
      if(pid === -1) this.tagset.push(tag);
      else this.tagset.splice(pid, 1);
    }
  },

  computed: {
    selected() {
      const result = {};
      for(let i of this.tagset) result[i] = true;
      return result;
    }
  }
}
</script>

<style lang="scss">
.CodeMirror {
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 60px;
}
.CodeMirror pre.CodeMirror-placeholder { color: rgba(0,0,0,.3); }
.CodeMirror {
  padding: 0 40px;
}
.mirrormark-toolbar {
  position: fixed;
  bottom: 0;
  border-bottom: 0;
  z-index: 500;

  padding: 10px 20px;

  transition: transform 0.2s;

  box-sizing: border-box;

  box-shadow: rgba(0,0,0,.12) 0 2px 3px inset;
}

.title-input {
  padding: 20px 44px 10px 44px;

  width: 100%;
  box-sizing: border-box;

  font-size: 32px;
  line-height: 40px;
  font-weight: bold;
}

.editor-tags {
  padding: 10px 44px;
  display: flex;

  > .material-icons {
    color: rgba(0,0,0,.3);
  }

  .editor-tag-list {
    flex: 1;
    margin-left: 10px;
  }

  .editor-tag {
    display: inline-block;
    margin-right: 10px;
    color: rgba(0,0,0,.3);
    font-weight: bold;
    cursor: pointer;

    transition: color .2s;

    &.selected {
      color: rgba(0,0,0,.7);
    }
  }
}
</style>
