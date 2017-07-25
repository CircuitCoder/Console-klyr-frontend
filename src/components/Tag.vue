<template>
  <router-link class="tag" tag="div" :to="{ name: 'List', params: { author: 'all', tag: tag }}">{{ tag }}</router-link>
</template>

<script>
export default {
  name: 'tag',
  props: {
    tag: String,
  },
}
</script>

<style lang="scss">
.tag {
  cursor: pointer;
  margin-right: 10px;
  color: rgba(0,0,0,0.3);

  transition: color .2s;

  &:hover {
    color: rgba(0,0,0,.54);
  }
}
</style>
