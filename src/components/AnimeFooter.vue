<template>
  <div class="footer-box">
    <div class="link-box">
      本站大部分数据来源于: <a href="https://yuc.wiki/" target="_blank">yuc.wiki</a>
    </div>
    <div class="record-info">
      备案号: <a href="https://beian.miit.gov.cn/" target="_blank">湘ICP备2024069026号-1</a>
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

.record-info {
  height: 18px;
  line-height: 18px;
}
</style>