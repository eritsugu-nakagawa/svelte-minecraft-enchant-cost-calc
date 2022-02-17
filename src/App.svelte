<script>
  import "bulma/css/bulma.css";
  import { ScaleOut } from "svelte-loading-spinners";

  import CardList from "./CardListComponent.svelte";
  import SelectList from "./SelectListComponent.svelte";

  let enchantSelectList = [0];
  let items = [];

  function costCalculation() {
    items = enchantSelectList
      .map((idx) => {
        return {
          id: [enchantList[idx].id],
          name: [enchantList[idx].name],
          cost: enchantList[idx].cost,
          createCount: 0,
          createCost: 0,
          mergeGrid: 1,
          columnStart: 0,
          columnEnd: 0,
        };
      })
      .filter((item) => item.id[0] !== 0);
  }

  function getEnchantApiUrl() {
    return "https://script.google.com/macros/s/AKfycbxJF8EuqLvNvFne0mKI6M5jpmRu7MUcomBni5JVppir_Fa4rGBO53pBthOuCH0s94h0cA/exec";
  }

  let enchantList;
  async function getEnchantList() {
    const res = await fetch(getEnchantApiUrl());
    if (res.status !== 200) {
      alert("エンチャントリストの取得に失敗しました。");
    } else {
      enchantList = await res.json();
      enchantList = [{ id: 0, name: "", cost: 0 }, ...enchantList];
    }
  }

  function clearEnchantSelectList() {
    enchantSelectList = [0];
    items = [];
  }

  let disabled;
  $: disabled = false;
  // enchantSelectList.length -
  //   [...enchantSelectList].reverse().findIndex((elm) => elm > 0) >
  //   enchantSelectList.findIndex((elm) => elm == 0) ||
  // enchantSelectList.filter((elm) => elm > 0).length == 0;
</script>

{#await getEnchantList()}
  <div class="center">
    <ScaleOut color="#00db37" size="120" />
  </div>
{:then value}
  <main>
    <CardList bind:items />
    <div class="block p-4">
      <button
        class="button is-primary"
        {disabled}
        on:click={() => costCalculation()}>コスト計算</button
      >
      <button class="button is-light" on:click={() => clearEnchantSelectList()}
        >クリア</button
      >
      <SelectList bind:enchantSelectList bind:enchantList />
    </div>
  </main>
{/await}

<style>
  main {
    display: flex;
    width: 98%;
    margin: 1em auto;
  }

  .center {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
