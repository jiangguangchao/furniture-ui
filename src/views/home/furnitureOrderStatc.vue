<template>
  <div ref="chart" :style="{ width: '100%', height: '300px' }"></div>
</template>

<script setup>
import * as echarts from 'echarts';
import { listOrderStatistics } from '@/api/statistics/orderStatistics';
import { ref, onMounted } from 'vue';

const queryParams = ref(
  {
    dateType: null,
    dataType: null,
  }
);
const chart = ref(null);
const echartOption = ref({
  legend: {},
  tooltip: {},
  dataset: {
    source: [
      ['date', 'gs', 'zje', 'yzfje'],
      ['2024-10-01', 43.3, 85.8, 93.7],
      ['2024-10-02', 83.1, 73.4, 55.1],
      ['2024-10-03', 86.4, 65.2, 82.5],
      ['2024-10-04', 72.4, 53.9, 39.1]
    ]
  },
  xAxis: { type: 'category' },
  yAxis: {},
  // Declare several bar series, each will be mapped
  // to a column of dataset.source by default.
  series: [{ type: 'bar' }, { type: 'bar' }, { type: 'bar' }]
});

let myChart;

onMounted(() => {
  if (chart.value) {
    myChart = echarts.init(chart.value);
    myChart.setOption(echartOption.value);
  }
});

/** 查询订单统计列表 */
function getList(queryType) {
  console.log("查询订单统计列表， queryType:", queryType)
  setQueryParamsByQueryType(queryType);
  listOrderStatistics(queryParams.value).then(response => {
    // orderStatisticsList.value = response.rows;
  });
}


/**
 * 根据查询类型设置查询参数. 1: 今日，2：最近2天，3：最近一周，4：最近一个月
 */
function setQueryParamsByQueryType(queryType) {
  
  queryParams.value.params["endDate"] = calculateRelativeDate(0);
  queryParams.value.dateType = '1'//查询按天统计数据 1：天，2：月，3：年
  switch (queryType) {
    
    case '1':
      queryParams.value.params["startDate"] = calculateRelativeDate(0);
      break;
    case '2':
      queryParams.value.params["startDate"] = calculateRelativeDate(-1);
      break;
    case '3':
      queryParams.value.params["startDate"] = calculateRelativeDate(-6);
      break;
    case '4':
      queryParams.value.params["startDate"] = calculateRelativeDate(-29);
      break;
    default:
      //默认是查询最近2天的
      queryParams.value.params["startDate"] = calculateRelativeDate(-1);
        break;
  }
}

function calculateRelativeDate(offset) {
  // 获取当前日期
  const today = new Date();

  // 计算偏移后的日期
  const resultDate = new Date(today);
  resultDate.setDate(today.getDate() + offset);

  // 格式化日期为 yyyy-MM-dd
  const year = resultDate.getFullYear();
  const month = String(resultDate.getMonth() + 1).padStart(2, '0');
  const day = String(resultDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
</script>

getList();

<style scoped>
/* #chart {
  width: 100%;
  height: 300px;
} */
</style>