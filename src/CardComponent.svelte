<script>
  export let card;
  export let rowFirst;
  export let rowLast;
  export let columnFirst;
  export let columnLast;
  export let rowIdx;
  export let columnIdx;

  let gridColumnStart = card.columnStart;
  let gridColumnEnd = card.columnEnd;
  let gridRow = rowIdx + 1;

  let rowEven = rowIdx % 2 === 0;
  let columnEven = columnIdx % 2 === 0;
</script>

<div
  class="card-wrap"
  class:rowFirst
  class:rowLast
  class:columnFirst
  class:columnLast
  class:columnEven
  class:rowEven
  style="grid-column:{gridColumnStart} / {gridColumnEnd}; grid-row-start:{gridRow};"
>
  <div class="card-div">
    <div class="card">
      <dl>
        <!-- <dt>名前</dt> -->
        {#each card.name as name}
          <dd>{name}</dd>
        {/each}
        <!-- <dt>基礎コスト</dt>
        <dd>{card.cost}</dd> -->
        <!-- <dt>作成コスト</dt> -->
        <!-- <dd>{card.createCost}</dd> -->
      </dl>
    </div>
  </div>
</div>

<style>
  dl {
    margin: 0;
  }

  dd {
    overflow-wrap: break-word;
  }

  .card-wrap {
    position: relative;
    padding: 1em;
  }

  .card-wrap::after {
    position: absolute;
    content: "";
    bottom: -1em;
    height: 2px;
    background-color: black;
  }

  .card-wrap:not(.rowLast):not(.columnLast).columnEven::after {
    left: 50%;
    width: 50%;
  }

  .card-wrap:not(.rowLast):not(.columnEven)::after {
    left: 0;
    width: 50%;
  }

  .card-wrap.rowEven {
    background-color: #f0f0f0;
  }

  .card-div {
    min-width: 160px;
    width: fit-content;
    height: 100%;
    margin: 0 auto;
  }

  .card-wrap:not(.rowFirst) .card-div::before {
    position: absolute;
    content: "";
    top: -1em;
    left: 50%;
    background-color: black;
    width: 2px;
    height: 2em;
  }

  .card-wrap:not(.rowLast) .card-div::after {
    position: absolute;
    content: "";
    left: 50%;
    background-color: black;
    width: 2px;
    height: 2em;
  }

  .card {
    position: relative;
    height: 100%;
    font-size: 14px;
    padding: 1rem 1.5rem;
  }

  .card-wrap.columnEven:not(.columnLast) .card {
    background-color: #ffe8aa;
  }

  .card-wrap.columnEven:not(.columnLast) .card::before {
    position: absolute;
    content: "主";
    top: 0.5em;
    right: 0.5em;
    color: white;
    background-color: rgb(255, 153, 0);
    font-weight: bold;
    width: 1.6em;
    text-align: center;
    border-radius: 5px;
  }

  .card-wrap.columnFirst.columnLast.rowLast .card {
    background-color: #aec8ff;
  }

  dd {
    margin-left: 1em;
  }
</style>
