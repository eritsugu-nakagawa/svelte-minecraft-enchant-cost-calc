<script>
  export let itemCount;
</script>

<div class="container">
  <div class="field">
    <label class="label" for="item-count">アイテム数</label>
    <div class="select">
      <select name="item-count" id="item-count" bind:value={itemCount}>
        {#each [...Array(8).keys()] as idx}
          <option value={idx + 1}>{idx + 1}</option>
        {/each}
      </select>
    </div>
  </div>
</div>

<style>
  .select select {
    background-image: none;
  }
</style>
