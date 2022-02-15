<script>
  import "bulma/css/bulma.css";
  import CardList from "./CardListComponent.svelte";

  let items = [...Array(8).keys()].map((i) => {
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
  <CardList {items} />
</main>

<style>
  main {
    width: 98%;
    margin: 2em auto;
  }
</style>
