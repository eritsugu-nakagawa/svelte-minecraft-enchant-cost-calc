<script>
  import "chota";
  import CardList from "./CardListComponent.svelte";

  let items = [...Array(7).keys()].map((i) => {
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
    width: 98%;
    margin: 2em auto;
  }
</style>
