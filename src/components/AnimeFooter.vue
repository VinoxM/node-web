<template>
  <div class="footer-box">
    <div class="link-box">
      本站大部分数据来源于: <a href="https://yuc.wiki/" target="_blank">yuc.wiki</a>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.footer-box {
  height: var(--footer-height);
  width: 100%;
  text-align: center;
  color: gray;
  line-height: 20px;
  font-size: var(--font-size-mini);
  padding: var(--main-gap) 0;
}

.footer-box a {
  text-decoration: none;
  color: var(--color-black-0);
}

.footer-box a:hover {
  text-decoration: underline;
  color: var(--color-gray-0);
}
</style>