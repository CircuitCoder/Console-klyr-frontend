<template>
  <div class="content">
    <div class="seg-header">用户 <i class="material-icons btn" @click="usrOpt()">add</i></div>
    <div class="user-list">
      <div class="user" v-for="user of users">
        <i class="material-icons admin-indicator" v-if="user.isAdmin">build</i>
        <author :author="user.id"></author>
        <i class="material-icons btn" @click="usrOpt(user)">settings_backup_restore</i>
        <i class="material-icons btn" @click="usrDel(user)">delete</i>
      </div>
    </div>

    <div class="seg-header">标签</div>
    <div class="tag-list">
      <div class="tag-row" v-for="tag of tags">
        <i class="material-icons btn" @click="tagDel(tag.id)">delete</i>
        <tag :tag="tag.id"></tag>
      </div>
      <div class="tag-row">
        <i class="material-icons">add</i>
        <input v-model="tag" placeholder="新建..." @keyup.enter="tagNew">
      </div>
    </div>

    <modal ref="usr">
      <div class="modal-title">新建 / 修改用户</div>
      <input v-model="name" placeholder="账户名" ref="name" @keyup.enter="$refs.pass.focus" @keyup.esc="$refs.usr.close">
      <input v-model="pass" placeholder="密码" ref="pass" @keyup.enter="usrCommit" @keyup.esc="$refs.usr.close">
      <div class="checkbox-group">
        <input type="checkbox" v-model="isAdmin" @keyup.enter="usrCommit">
        <div class="checkbox-hint">管理员</div>
      </div>
      <div class="modal-hint">
        按<i class="material-icons">keyboard_return</i>确定
      </div>
    </modal>

    <modal ref="delete">
      <div class="modal-title">确认删除</div>
      <input v-model="input" placeholder="验证" @keyup="recheck" @keyup.esc="$refs.delete.close()" ref="validator">
      <div class="modal-hint">
        输入 {{ target }} 以确认删除
      </div>
    </modal>
  </div>
</template>

<script>
import superagent from 'superagent';

import config from '../config';

import Author from './Author';
import Modal from './Modal';
import Tag from './Tag';

export default {
  components: { Author, Tag, Modal },

  data() {
    return {
      tags: [],
      users: [],

      name: '',
      pass: '',
      isAdmin: false,

      target: '',
      input: '',

      tag: '',
    }
  },

  created() {
    this.refresh();
  },

  methods: {
    refresh() {
      const metaReq = superagent
        .get(`${config.backend}/meta`)
        .withCredentials()
        .then(resp => {
          this.users = resp.body.users;
          this.tags = resp.body.tags;
        });
    },
    usrOpt(usr = '') {
      if(usr) {
        this.name = usr.id;
        this.isAdmin = usr.isAdmin;
      } else {
        this.name = '';
        this.isAdmin = false;
      }

      this.pass = '';
      this.$refs.usr.open();

      if(usr === '')
        this.$nextTick(() => this.$refs.name.focus());
      else
        this.$nextTick(() => this.$refs.pass.focus());
    },

    usrCommit() {
      if(this.name === '' || this.pass === '')
        return this.$emit('info', '请填入账户名和密码');
      superagent
        .post(`${config.backend}/op/usr/${this.name}`)
        .send({ pass: this.pass, isAdmin: this.isAdmin })
        .withCredentials()
        .then(resp => {
          if(!resp.body.success) return this.$emit('info', '未知错误');

          this.$emit('info', '更新成功');
          this.$refs.usr.close();
          this.refresh();
        });
    },

    usrDel(user) {
      this.target = user.id;
      this.input = '';

      this.$refs.delete.open();

      this.$nextTick(() => {
        this.$refs.validator.focus();
      });
    },

    recheck() {
      console.log(this.input);
      if(this.target === this.input) {
        this.$refs.delete.close();
        
        superagent
          .delete(`${config.backend}/op/usr/${this.target}`)
          .withCredentials()
          .then(resp => {
            if(!resp.body.success) return this.$emit('info', '未知错误');

            this.$emit('info', '删除成功');
            this.refresh();
          });
      }
    },

    tagNew() {
      superagent
        .put(`${config.backend}/op/tag/${this.tag}`)
        .withCredentials()
        .then(resp => {
          if(resp.body.success) {
            this.$emit('info', '添加成功');
            this.refresh();
          } else
            this.$emit('info', '添加失败');
        });
    },

    tagDel(id) {
      superagent
        .delete(`${config.backend}/op/tag/${id}`)
        .withCredentials()
        .then(resp => {
          if(resp.body.success) {
            this.$emit('info', '删除成功');
            this.refresh();
          } else
            this.$emit('info', '删除失败');
        });
    }
  },
}
</script>

<style lang="scss">
.seg-header {
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;

  margin-top: 20px;

  .material-icons.btn {
    margin-left: 10px;
  }
}

.user-list {
  margin-top: 10px;
}

.user {
  font-size: 20px;
  line-height: 36px;
  display: flex;
  align-items: center;
}

.user .author {
  color: rgba(0,0,0,.7);
  flex: 1;

  &:hover {
    color: rgba(0,0,0,1);
  }
}

.admin-indicator {
  font-size: 16px;
  margin-right: 5px;
}

.tag-row {
  font-size: 20px;
  line-height: 36px;
  display: flex;
  align-items: center;

  height: 36px;

  .material-icons {
    margin-right: 10px;

    &:not(.btn) {
      color: rgba(0,0,0,.54);
    }
  }

  input {
    font-size: 16px;
  }

  .tag {
    color: rgba(0,0,0,.7);

    &:hover {
      color: rgba(0,0,0,1);
    }
  }
}
</style>
