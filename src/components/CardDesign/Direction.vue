

<template>
  <div></div>
</template>

<script>
export default {
  data() {
    return {};
  },
  created() {
    const activityId = this.$route.query.activityId;
    const cardId = this.$route.query.cardId;
    this.$router.push({
      name: 'addCard',
      query: {
        activityId: activityId,
        cardId: cardId
      }
    });
  }
};
</script>

<style>
</style>