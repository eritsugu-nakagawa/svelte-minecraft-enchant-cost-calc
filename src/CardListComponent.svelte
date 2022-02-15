<script>
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

  minObj.pop();
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

          tmpList[idx + 1].resultCost = createCost;

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

<div class="block result">
  <div class="notification is-success cost-display">
    総コスト：{totalCreateCost}
  </div>
  {#each tmpList as row, rowIdx}
    <div class="notification">
      <div>{rowIdx + 1}回目</div>
      <div class="flex">
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
      </div>
    </div>
  {/each}
</div>

<style>
  .result {
    width: max(30%, 32rem);
  }

  .flex {
    display: flex;
    flex-wrap: wrap;
    row-gap: 1.5rem;
    padding: 0.5em;
  }

  .cost-display {
    font-size: 1.2rem;
  }

  .notification {
    padding: 1.25rem 1rem 1.25rem 1rem;
  }
</style>
