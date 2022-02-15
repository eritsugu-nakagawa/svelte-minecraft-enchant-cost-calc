<script>
  import "bulma/css/bulma.css";
  import CardList from "./CardListComponent.svelte";
  import SelectList from "./SelectListComponent.svelte";

  let itemCount = 5;
  $: items = [...Array(itemCount).keys()].map((i) => {
    let j = i + 1;
    return {
      id: [i],
      name: ["射撃ダメージ増加V" + j],
      cost: j,
      createCount: 0,
      createCost: 0,
      mergeGrid: 1,
      columnStart: 0,
      columnEnd: 0,
    };
  });
</script>

<main>
  <CardList bind:items />
  <SelectList bind:itemCount />
</main>

<style>
  main {
    display: flex;
    width: 98%;
    margin: 1em auto;
  }
</style>
