<script>
  export let enchantSelectList;
  export let enchantList;

  function addItem(idx) {
    if (enchantSelectList.length < 8) {
      enchantSelectList.splice(idx + 1, 0, 0);
      enchantSelectList = enchantSelectList;
    }
  }

  function removeItem(idx) {
    if (enchantSelectList.length > 1) {
      enchantSelectList.splice(idx, 1);
      enchantSelectList = enchantSelectList;
    }
  }

  function changeEnchantList(event, idx) {
    if (event.target.value == 0 && enchantSelectList.length > 1) {
      removeItem(idx);
    } else if (
      event.target.value > 0 &&
      enchantSelectList.length < 8 &&
      idx + 1 == enchantSelectList.length
    ) {
      enchantSelectList.push(0);
      enchantSelectList = enchantSelectList;
    }
  }
</script>

<div class="block pt-4">
  {#each enchantSelectList as item, idx}
    <div class="field">
      <div class="item-no">ItemNo.{idx + 1}</div>
      <div class="select">
        <select
          name="enchant-list"
          bind:value={item}
          on:change={(event) => changeEnchantList(event, idx)}
        >
          {#each enchantList as enchant}
            <option value={enchant.id}>{enchant.name}</option>
          {/each}
        </select>
      </div>
      {#if idx < 7}
        <div class="delete plus" on:click={() => addItem(idx)} />
      {:else}
        <div class="delete plus" style="visibility:hidden;" />
      {/if}
      {#if idx > 0 || enchantSelectList.length > 1}
        <div class="delete minus" on:click={() => removeItem(idx)} />
      {/if}
    </div>
  {/each}
</div>

<style>
  .select select {
    background-image: none;
  }

  .field {
    display: flex;
    column-gap: 1em;
    align-items: center;
  }

  .plus {
    background-color: #4df175;
    opacity: 0.7;
    transform: rotate(45deg);
  }

  .plus:hover {
    opacity: 1;
  }

  .minus {
    transform: rotate(45deg);
  }

  .minus::before {
    display: none;
  }
</style>
