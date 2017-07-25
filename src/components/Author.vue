<template>
  <router-link class="author" tag="div" :to="{ name: 'List', params: { author: author, tag: 'all' }}">{{ author }}</router-link>
</template>

<script>
export default {
  name: 'author',
  props: {
    author: String,
  },
}
</script>

<style lang="scss">
.author {
  cursor: pointer;
  margin-right: 10px;
  color: rgba(0,0,0,0.3);

  transition: color .2s;

  &:hover {
    color: rgba(0,0,0,.54);
  }
}
</style>
