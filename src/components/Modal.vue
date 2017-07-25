<template>
  <transition name="modal">
    <div class="modal-backdrop" v-if="show" @click="close">
      <div class="modal" @click.stop>
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'modal',
  data() {
    return {
      show: false,
    }
  },
  
  methods: {
    open() {
      this.show = true;
    },
    close() {
      this.show = false;
    },
  },
}
</script>

<style lang="scss">
@import '../styles/const';

.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  z-index: 1000;

  overflow-y: auto;
  overflow-x: hidden;

  background: rgba(0,0,0,.3);
  backdrop-filter: grayscale(0.8);

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 100px 0;
}

.modal {
  width: 300px;
  padding: 20px 30px;

  background: white;
  border-radius: 4px;
  box-shadow: rgba(0,0,0,.12) 0 2px 3px;
}

.modal-enter, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity .2s;
}

/* Additional styles */
.modal-title {
  font-size: 24px;
}

.modal-hint {
  font-size: 14px;
  opacity: 0.3;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .material-icons {
    font-size: 18px;
  }

  margin-top: 20px;
}

.modal input:not([type="checkbox"]) {
  display: block;
  margin-top: 20px;
  font-size: 16px;

  width: 100%;
  box-sizing: border-box;

  padding: 10px;

  color: rgba(0,0,0,.87);

  &::placeholder {
    color: rgba(0,0,0,.3);
  }

  border-bottom: rgba(0,0,0,.12) 1px solid;
}

.modal .checkbox-group {
  display: flex;
  align-items: center;

  margin-top: 20px;
  font-size: 16px;

  width: 100%;
  box-sizing: border-box;

  padding: 10px 0;

  .checkbox-hint {
    color: rgba(0,0,0,.3);
    transition: color .2s;
  }

  > input[type="checkbox"] {
    margin-right: 15px;

    &:checked ~ div {
      color: rgba(0,0,0,.87);
    }
  }
}
</style>
