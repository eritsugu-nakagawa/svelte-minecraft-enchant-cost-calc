<script>
  import "chota";
  import CardList from "./CardListComponent.svelte";

  let items = [...Array(8).keys()].map((i) => {
    let j = i + 1;
    return {
      id: [i],
      name: ["item" + j],
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
  <CardList {items} />
</main>

<style>
  main {
    margin: 2em 0;
  }
</style>
