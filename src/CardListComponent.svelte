<script>
  import { Card } from "svelte-chota";
  import CardComponent from "./CardComponent.svelte";
  export let items;

  let minCost = 1000;
  let minObj;
  let patternList = junretsu(items, items.length);
  patternList.forEach((ptn) => {
    let tmpPtn = ptn.map((elm, i) => {
      elm.columnStart = i + 2;
      elm.columnEnd = i + 3;
      return elm;
    });

    let [tmpList, createCost, canCreate] = spreadItems(tmpPtn);
    if (createCost < minCost && canCreate) {
      minCost = createCost;
      minObj = tmpList;
    }
  });

  let tmpList = minObj;
  let totalCreateCost = minCost;

  let gridColumn = tmpList[0].length;

  function spreadItems(items) {
    let tmpList = [];
    let resultList = [
      [
        ...items.map((item) => {
          return { ...item };
        }),
      ],
    ];
    let countCost = [0, 1, 3];
    let createCountIdx = 0;
    let maxCountIdx;
    let createCost = 0;
    let totalCreateCost = 0;
    let idx = 0;
    let sumCost;
    let basicCost;
    let canCreate = true;
    const MAX_CAN_CREATE_COST = 40;

    maxCountIdx = Math.ceil(Math.log(resultList[0].length) / Math.log(2)) + 1;

    for (createCountIdx = 1; createCountIdx < maxCountIdx; createCountIdx++) {
      resultList.push([]);
      tmpList = [...resultList[createCountIdx - 1]];

      if (tmpList.length > 1) {
        for (idx = 0; idx < tmpList.length - 1; idx += 2) {
          sumCost = tmpList[idx].cost + tmpList[idx + 1].cost;
          basicCost = tmpList[idx + 1].cost;
          createCost =
            basicCost +
            countCost[tmpList[idx].createCount] +
            countCost[tmpList[idx + 1].createCount];

          resultList[createCountIdx].push({
            id: [...tmpList[idx].id, tmpList[idx + 1].id],
            name: [...tmpList[idx].name, ...tmpList[idx + 1].name],
            cost: sumCost,
            createCount:
              Math.max(tmpList[idx].createCount, tmpList[idx + 1].createCount) +
              1,
            createCost: createCost,
            mergeGrid: tmpList[idx].mergeGrid + tmpList[idx + 1].mergeGrid,
            columnStart: tmpList[idx].columnStart,
            columnEnd: tmpList[idx + 1].columnEnd,
          });

          totalCreateCost += createCost;
          canCreate = canCreate ? createCost < MAX_CAN_CREATE_COST : false;
        }
      }

      if (idx === tmpList.length - 1) {
        resultList[createCountIdx].push(Object.assign({}, tmpList[idx]));
      }
    }

    return [resultList, totalCreateCost, canCreate];
  }

  function junretsu(balls, nukitorisu) {
    var arrs, i, j, zensu, results, parts;
    arrs = [];
    zensu = balls.length;
    if (zensu < nukitorisu) {
      return;
    } else if (nukitorisu == 1) {
      for (i = 0; i < zensu; i++) {
        arrs[i] = [balls[i]];
      }
    } else {
      for (i = 0; i < zensu; i++) {
        parts = balls.slice(0);
        parts.splice(i, 1)[0];
        results = junretsu(parts, nukitorisu - 1);
        for (j = 0; j < results.length; j++) {
          arrs.push([balls[i]].concat(results[j]));
        }
      }
    }
    return arrs;
  }
</script>

<div class="cost-display">
  <span class="card">総コスト：{totalCreateCost}</span>
</div>
<div class="grid" style="--count:{gridColumn}">
  {#each tmpList as row, rowIdx}
    <span
      class="count {rowIdx % 2 === 0 ? 'even' : ''}"
      style="grid-row-start:{rowIdx + 1}"
    >
      {#if rowIdx < tmpList.length - 1}
        {rowIdx + 1}回目
      {:else}
        完成
      {/if}
    </span>
    {#each row as card, columnIdx}
      <CardComponent
        {card}
        rowFirst={rowIdx === 0}
        rowLast={rowIdx === tmpList.length - 1}
        columnFirst={columnIdx === 0}
        columnLast={columnIdx === row.length - 1}
        {rowIdx}
        {columnIdx}
      />
    {/each}
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: 80px repeat(var(--count), 1fr);
    row-gap: 2em;
    margin: 0 auto;
  }

  .count {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .count.even {
    background-color: #f0f0f0;
  }

  .cost-display {
    margin-bottom: 2em;
    height: fit-content;
  }
</style>
